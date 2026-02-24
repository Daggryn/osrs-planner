<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import AchievementSpotlight from '$lib/components/feedback/AchievementSpotlight.svelte';
	import NewGoalModal from '$lib/components/goals/NewGoalModal.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { priceStore } from '$lib/stores/priceStore';
	import { fetchQuestMetadata } from '$lib/services/quests';
	import {
		bankValue,
		itemWithProgress,
		questRequirementTracker,
		sinceLastVisit,
		skillHeaderTracker,
		skillProgress,
		sortByClosest,
		topBankGains,
		topWishlistDrops,
		wishlistTotal
	} from '$lib/stores/selectors';
	import type { CatalogItem, Goal, SkillGoal } from '$lib/domain/types';

	const SPOTLIGHT_SESSION_KEY = 'osrs-planner:spotlight-seen';
	let showSpotlight = false;
	let recentlyCompleted: Goal[] = [];
	let showNewGoal = false;

	$: planner = $plannerStore;
	$: prices = $priceStore.items;
	$: purchasingPower = bankValue(planner.gold, planner.bankItems, prices);
	$: itemGoals = planner.itemGoals.map((g) => itemWithProgress(g, planner.gold, purchasingPower));
	$: skillGoalsWithProgress = planner.skillGoals.map((g) => ({ ...g, progressPct: skillProgress(g) }));
	$: itemRow = sortByClosest(itemGoals.filter((g) => g.status === 'active'));
	$: questRow = sortByClosest(planner.questGoals.filter((g) => g.status === 'active'));
	$: skillRow = sortByClosest(skillGoalsWithProgress.filter((g) => g.status === 'active'));
	$: progressSinceVisit = sinceLastVisit([...planner.questGoals, ...planner.skillGoals], planner.lastOpenedAt);
	$: wishlistDrops = topWishlistDrops(planner.itemGoals, prices);
	$: bankGains = topBankGains(planner.bankItems, prices);
	$: itemTracker = `${Math.floor(purchasingPower).toLocaleString()} / ${Math.floor(wishlistTotal(planner.itemGoals)).toLocaleString()}`;
	$: questTracker = questRequirementTracker(planner.questGoals);
	$: skillTracker = skillHeaderTracker(skillGoalsWithProgress);

	let refreshTimer: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		void plannerStore.autocorrectSeedQuests();
		void refresh();
		refreshTimer = setInterval(refresh, 60000);

		const current = get(plannerStore);
		const sessionSeen = sessionStorage.getItem(SPOTLIGHT_SESSION_KEY) === '1';
		const newlyDone = sinceLastVisit(
			[...current.itemGoals, ...current.questGoals, ...current.skillGoals],
			current.lastOpenedAt
		);
		recentlyCompleted = newlyDone;
		showSpotlight = newlyDone.length > 0 && !sessionSeen;
		if (showSpotlight) {
			sessionStorage.setItem(SPOTLIGHT_SESSION_KEY, '1');
			setTimeout(() => {
				showSpotlight = false;
			}, 5200);
		}
		plannerStore.setLastOpenedAt(new Date().toISOString());
		return () => {
			if (refreshTimer) clearInterval(refreshTimer);
		};
	});

	async function refresh() {
		const ids = [...new Set([...planner.itemGoals.map((g) => g.itemId), ...planner.bankItems.map((b) => b.itemId)])];
		const latest = await priceStore.refresh(ids);
		plannerStore.updateItemPrices(latest);
	}

	function createItemGoal(item: CatalogItem) {
		plannerStore.addItemGoal({
			itemId: item.itemId,
			name: item.name,
			imageUrl: item.imageUrl,
			price: item.currentPrice
		});
		showNewGoal = false;
	}

	async function createQuestGoal(payload: {
		title: string;
		questReqs: string[];
		skillReqs: Array<{ skill: string; level: number }>;
	}) {
		const meta = await fetchQuestMetadata(payload.title, { cascade: true });
		const mergedQuestReqs = [...new Set([...payload.questReqs, ...meta.questIds])];
		const mergedSkillReqsMap = new Map<string, { skill: string; level: number }>();
		for (const req of [...payload.skillReqs, ...meta.skillReqs]) {
			mergedSkillReqsMap.set(`${req.skill}:${req.level}`, req);
		}
		plannerStore.addQuestGoal({
			title: payload.title,
			requirements: {
				questIds: mergedQuestReqs,
				skillReqs: [...mergedSkillReqsMap.values()]
			}
		});
		showNewGoal = false;
	}

	function createSkillGoal(payload: { skill: string; currentLevel: number; targetLevel: number }) {
		plannerStore.addSkillGoal(payload);
		showNewGoal = false;
	}

	function openGoal(goal: Goal | SkillGoal) {
		if (goal.type === 'item') goto('/items/wishlist');
		if (goal.type === 'quest') goto('/quests');
		if (goal.type === 'skill') goto('/skills');
	}
</script>

<section class="page">
	<header>
		<div>
			<h2>Home</h2>
			<p>Plan upgrades, track progress, and keep your next milestones clear.</p>
		</div>
		<button class="new-goal" onclick={() => (showNewGoal = true)}>+ New Goal</button>
	</header>

	{#if showSpotlight}
		<AchievementSpotlight goals={recentlyCompleted} />
	{/if}

	<section class="panel">
		<h3>Progress since last visit</h3>
		{#if progressSinceVisit.length === 0}
			<p class="muted">No quest or skill completions since your last session.</p>
		{:else}
			<ul>
				{#each progressSinceVisit as goal}
					<li>{goal.title}</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="grid two">
		<div class="panel">
			<h3>Wishlist price drops</h3>
			{#if wishlistDrops.length === 0}
				<p class="muted">Add item goals to track market opportunities.</p>
			{:else}
				<ul>
					{#each wishlistDrops as row}
						<li>{row.item.title}</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="panel">
			<h3>Bank price gains</h3>
			{#if bankGains.length === 0}
				<p class="muted">Add bank items to monitor value changes.</p>
			{:else}
				<ul>
					{#each bankGains as row}
						<li>{row.item.name}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>

	<section class="goal-rows">
		<div>
			<div class="heading-line">
				<h3>Items</h3>
				<span class="tracker"><img src="https://oldschool.runescape.wiki/images/Coins_10000.png" alt="" />{itemTracker}</span>
			</div>
			<div class="cards">
				{#each itemRow as goal (goal.id)}
					<GoalCard goal={goal} homeMode onOpen={() => openGoal(goal)} />
				{/each}
			</div>
		</div>
		<div>
			<div class="heading-line">
				<h3>Quests</h3>
				<span class="tracker"><img src="https://oldschool.runescape.wiki/images/Quests.png" alt="" />{questTracker.questsDone}/{questTracker.questsTotal}</span>
				<span class="tracker"><img src="https://oldschool.runescape.wiki/images/Skills_icon.png" alt="" />{questTracker.skillsDone}/{questTracker.skillsTotal}</span>
			</div>
			<div class="cards">
				{#each questRow as goal (goal.id)}
					<GoalCard goal={goal} homeMode onOpen={() => openGoal(goal)} />
				{/each}
			</div>
		</div>
		<div>
			<div class="heading-line">
				<h3>Skills</h3>
				<span class="tracker"><img src="https://oldschool.runescape.wiki/images/Skills_icon.png" alt="" />{skillTracker.gained}/{skillTracker.needed}</span>
			</div>
			<div class="cards">
				{#each skillRow as goal (goal.id)}
					<GoalCard goal={goal} homeMode onOpen={() => openGoal(goal)} />
				{/each}
			</div>
		</div>
	</section>
</section>

{#if showNewGoal}
	<NewGoalModal
		on:close={() => (showNewGoal = false)}
		on:createItem={(e) => createItemGoal(e.detail)}
		on:createQuest={(e) => createQuestGoal(e.detail)}
		on:createSkill={(e) => createSkillGoal(e.detail)}
	/>
{/if}

<style>
	.page {
		display: grid;
		gap: 1rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.7rem;
	}
	header h2 {
		margin: 0;
		font-size: 1.42rem;
	}
	header p {
		margin: 0.22rem 0 0;
		color: var(--text-2);
	}
	.new-goal {
		border: 1px solid color-mix(in oklab, var(--accent-2), #fff 10%);
		background: linear-gradient(170deg, var(--accent-2), var(--accent-1));
		color: #f2f7ff;
		padding: 0.75rem 1.2rem;
		border-radius: var(--radius-button);
		cursor: pointer;
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), var(--shadow-hard);
	}
	.panel {
		border: 1px solid var(--border);
		background: linear-gradient(160deg, var(--surface-2) 0%, var(--surface-1) 100%);
		border-radius: var(--radius-panel);
		padding: 0.75rem;
		box-shadow: var(--shadow-hard);
	}
	h3 {
		margin: 0 0 0.45rem;
		font-size: 0.98rem;
	}
	ul {
		margin: 0;
		padding-left: 1rem;
		color: var(--text-2);
	}
	.grid.two {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.8rem;
	}
	.cards {
		display: grid;
		gap: 0.65rem;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
	}
	.goal-rows {
		display: grid;
		gap: 0.95rem;
	}
	.heading-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.45rem;
	}
	.heading-line h3 {
		margin: 0;
	}
	.tracker {
		display: inline-flex;
		align-items: center;
		gap: 0.22rem;
		font-size: 0.78rem;
		color: var(--text-2);
	}
	.tracker img {
		width: 0.9rem;
		height: 0.9rem;
		object-fit: contain;
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
	@media (min-width: 860px) {
		.grid.two {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

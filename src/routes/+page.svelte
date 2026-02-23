<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import AchievementSpotlight from '$lib/components/feedback/AchievementSpotlight.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { priceStore } from '$lib/stores/priceStore';
	import {
		bankValue,
		itemWithProgress,
		sinceLastVisit,
		sortByClosest,
		topBankGains,
		topWishlistDrops
	} from '$lib/stores/selectors';
	import type { Goal } from '$lib/domain/types';

	const SPOTLIGHT_SESSION_KEY = 'osrs-planner:spotlight-seen';

	let showSpotlight = false;
	let recentlyCompleted: Goal[] = [];

	$: planner = $plannerStore;
	$: prices = $priceStore.items;
	$: purchasingPower = bankValue(planner.gold, planner.bankItems, prices);
	$: itemGoals = planner.itemGoals.map((g) => itemWithProgress(g, planner.gold, purchasingPower));
	$: itemRow = sortByClosest(itemGoals.filter((g) => g.status === 'active'));
	$: questRow = sortByClosest(planner.questGoals.filter((g) => g.status === 'active'));
	$: skillRow = sortByClosest(planner.skillGoals.filter((g) => g.status === 'active'));
	$: progressSinceVisit = sinceLastVisit([...planner.questGoals, ...planner.skillGoals], planner.lastOpenedAt);
	$: wishlistDrops = topWishlistDrops(planner.itemGoals, prices);
	$: bankGains = topBankGains(planner.bankItems, prices);

	onMount(async () => {
		await priceStore.refresh();
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
	});
</script>

<section class="page">
	<header>
		<h2>Dashboard</h2>
		<p>Focus your next upgrades, track momentum, and keep goals visible.</p>
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
			<h3>Items</h3>
			<div class="cards">
				{#each itemRow as goal (goal.id)}
					<GoalCard goal={goal} summaryOnly />
				{/each}
			</div>
		</div>
		<div>
			<h3>Quests</h3>
			<div class="cards">
				{#each questRow as goal (goal.id)}
					<GoalCard goal={goal} summaryOnly />
				{/each}
			</div>
		</div>
		<div>
			<h3>Skills</h3>
			<div class="cards">
				{#each skillRow as goal (goal.id)}
					<GoalCard goal={goal} summaryOnly />
				{/each}
			</div>
		</div>
	</section>
</section>

<style>
	.page {
		display: grid;
		gap: 0.9rem;
	}
	header h2 {
		margin: 0;
		font-size: 1.35rem;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.panel {
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 0.85rem;
		padding: 0.8rem;
	}
	h3 {
		margin: 0 0 0.45rem;
		font-size: 0.95rem;
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
		gap: 0.6rem;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}
	.goal-rows {
		display: grid;
		gap: 0.9rem;
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

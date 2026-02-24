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
	import { categoryIcons } from '$lib/constants/categoryIcons';
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
			<h3 class="row-heading">
				<img src={categoryIcons.item} alt="" />
				<span>Items</span>
			</h3>
			<div class="cards">
				{#each itemRow as goal (goal.id)}
					<GoalCard goal={goal} summaryOnly />
				{/each}
			</div>
		</div>
		<div>
			<h3 class="row-heading">
				<img src={categoryIcons.quest} alt="" />
				<span>Quests</span>
			</h3>
			<div class="cards">
				{#each questRow as goal (goal.id)}
					<GoalCard goal={goal} summaryOnly />
				{/each}
			</div>
		</div>
		<div>
			<h3 class="row-heading">
				<img src={categoryIcons.skill} alt="" />
				<span>Skills</span>
			</h3>
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
		gap: 1rem;
	}
	header h2 {
		margin: 0;
		font-size: 1.42rem;
		letter-spacing: 0.04em;
	}
	header p {
		margin: 0.25rem 0 0;
		color: var(--text-2);
	}
	.panel {
		border: 1px solid var(--border);
		background: linear-gradient(185deg, var(--surface-2), color-mix(in oklab, var(--surface-2), #0d0b09 10%));
		border-radius: 0.42rem;
		padding: 0.85rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
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
		gap: 0.7rem;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}
	.goal-rows {
		display: grid;
		gap: 1rem;
	}
	.row-heading {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}
	.row-heading img {
		width: 1.05rem;
		height: 1.05rem;
		image-rendering: pixelated;
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

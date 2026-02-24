<script lang="ts">
	import { goto } from '$app/navigation';
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import ReconciliationBanner from '$lib/components/feedback/ReconciliationBanner.svelte';
	import TypeaheadItemSearch from '$lib/components/items/TypeaheadItemSearch.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { priceStore } from '$lib/stores/priceStore';
	import { sessionStore } from '$lib/stores/sessionStore';
	import { feedbackStore } from '$lib/stores/feedbackStore';
	import { bankValue, itemWithProgress, sortByCheapest, splitCompleted } from '$lib/stores/selectors';
	import type { CatalogItem } from '$lib/domain/types';

	$: state = $plannerStore;
	$: queue = $sessionStore.reconciliationQueue;
	$: power = bankValue(state.gold, state.bankItems, $priceStore.items);
	$: withProgress = state.itemGoals.map((g) => itemWithProgress(g, state.gold, power));
	$: sorted = sortByCheapest(withProgress);
	$: grouped = splitCompleted(sorted);

	async function refresh() {
		const latest = await priceStore.refresh(state.itemGoals.map((g) => g.itemId));
		plannerStore.updateItemPrices(latest);
	}

	function addFromSearch(e: CustomEvent<CatalogItem>) {
		plannerStore.addItemGoal({
			itemId: e.detail.itemId,
			name: e.detail.name,
			iconUrl: e.detail.icon,
			price: e.detail.basePrice
		});
		feedbackStore.push({ title: 'Goal added', goalName: e.detail.name, goalType: 'item' });
	}

	function markComplete(goalId: string) {
		const found = state.itemGoals.find((g) => g.id === goalId);
		if (!found) return;
		plannerStore.markItemGoalComplete(goalId);
		sessionStore.enqueueReconciliationItem({
			goalId: found.id,
			itemId: found.itemId,
			name: found.title,
			iconUrl: found.iconUrl
		});
		feedbackStore.push({ title: 'Goal achieved', goalName: found.title, goalType: 'item' });
	}

	function undo(goalId: string) {
		const found = state.itemGoals.find((g) => g.id === goalId);
		plannerStore.undoItemGoalComplete(goalId);
		sessionStore.dismissReconciliationItem(goalId);
		if (found) {
			feedbackStore.push({ title: 'Goal restored', goalName: found.title, goalType: 'item' });
		}
	}
</script>

<section class="page">
	<header>
		<h2>Item Goals</h2>
		<p>Track your planned upgrades and complete them when you obtain the item.</p>
	</header>

	<ReconciliationBanner count={queue.length} onOpenBank={() => goto('/items/bank')} />

	<div class="toolbar">
		<TypeaheadItemSearch placeholder="Add item goal..." on:select={addFromSearch} />
	</div>

	<div class="controls-row">
		<button class="toolbar-btn" on:click={refresh} disabled={$priceStore.isRefreshing}>
			{$priceStore.isRefreshing ? 'Refreshing...' : 'Refresh prices'}
		</button>
		<button class="toolbar-btn" on:click={() => plannerStore.setShowCompleted(!state.showCompleted)}>
			{state.showCompleted ? 'Hide completed' : 'Show completed'}
		</button>
	</div>

	<section class="goal-section">
		<div class="section-head">
			<h3>Active goals</h3>
			<small>{grouped.active.length} tracked</small>
		</div>
		<div class="cards">
			{#if grouped.active.length === 0}
				<p class="muted">No active item goals yet.</p>
			{/if}
			{#each grouped.active as goal (goal.id)}
				<GoalCard goal={goal} onComplete={() => markComplete(goal.id)} />
			{/each}
		</div>
	</section>

	{#if state.showCompleted}
		<section class="goal-section">
			<div class="section-head">
				<h3>Completed goals</h3>
				<small>{grouped.completed.length} archived</small>
			</div>
			<div class="cards">
				{#if grouped.completed.length === 0}
					<p class="muted">No completed item goals yet.</p>
				{/if}
				{#each grouped.completed as goal (goal.id)}
					<GoalCard goal={goal} onUndo={() => undo(goal.id)} />
				{/each}
			</div>
		</section>
	{/if}
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
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.toolbar {
		display: grid;
		gap: 0.5rem;
		border: 1px solid var(--border);
		background: linear-gradient(190deg, var(--surface-2), color-mix(in oklab, var(--surface-2), #100e0b 11%));
		padding: 0.82rem;
		border-radius: 0.42rem;
	}
	.controls-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	button {
		border: 1px solid var(--border);
		background: color-mix(in oklab, var(--surface-1), #fff 3%);
		color: var(--text-1);
		padding: 0.55rem 0.8rem;
		border-radius: 0.34rem;
		cursor: pointer;
		font-family: var(--font-heading);
	}
	.toolbar-btn:hover:not(:disabled) {
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 62%);
	}
	button:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	.goal-section {
		display: grid;
		gap: 0.55rem;
		padding-top: 0.25rem;
	}
	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	.section-head small {
		color: var(--text-2);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.66rem;
	}
	h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: 0.72rem;
	}
	.muted {
		margin: 0;
		color: var(--text-2);
		padding: 0.45rem 0.2rem;
	}
	@media (min-width: 900px) {
		.controls-row { justify-content: flex-end; }
	}
</style>

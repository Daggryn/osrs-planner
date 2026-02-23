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
		<button on:click={refresh} disabled={$priceStore.isRefreshing}>
			{$priceStore.isRefreshing ? 'Refreshing...' : 'Refresh prices'}
		</button>
		<label>
			<input
				type="checkbox"
				checked={state.showCompleted}
				on:change={(e) => plannerStore.setShowCompleted((e.target as HTMLInputElement).checked)}
			/>
			Show completed
		</label>
	</div>

	<section>
		<h3>Active goals</h3>
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
		<section>
			<h3>Completed goals</h3>
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
		gap: 0.9rem;
	}
	header h2 {
		margin: 0;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.toolbar {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.6rem;
		border: 1px solid var(--border);
		background: var(--surface-2);
		padding: 0.75rem;
		border-radius: 0.8rem;
	}
	button {
		border: 1px solid var(--border);
		background: #1f2735;
		color: var(--text-1);
		padding: 0.55rem 0.7rem;
		border-radius: 0.55rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	label {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		color: var(--text-2);
	}
	h3 {
		margin: 0 0 0.5rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: 0.65rem;
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
	@media (min-width: 900px) {
		.toolbar {
			grid-template-columns: minmax(12rem, 1fr) auto auto;
			align-items: center;
		}
	}
</style>


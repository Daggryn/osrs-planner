<script lang="ts">
	import type { Goal, ItemGoal } from '$lib/domain/types';
	import ProgressBar from '$lib/components/goals/ProgressBar.svelte';
	import PriceBadge from '$lib/components/items/PriceBadge.svelte';

	let {
		goal,
		summaryOnly = false,
		onComplete,
		onUndo,
		onOpen
	} = $props<{
		goal: Goal | ItemGoal;
		summaryOnly?: boolean;
		onComplete?: () => void;
		onUndo?: () => void;
		onOpen?: () => void;
	}>();

	const color = $derived(
		goal.type === 'item' ? ('item' as const) : goal.type === 'quest' ? ('quest' as const) : ('skill' as const)
	);
</script>

<article class="card {goal.status === 'completed' ? 'done' : ''}" data-type={goal.type}>
	<button class="open" aria-label={`Open ${goal.title}`} onclick={onOpen}>
		<div class="title-row">
			<p class="name">{goal.iconUrl ?? ''} {goal.title}</p>
			{#if goal.status === 'completed'}<span class="status">Completed</span>{/if}
		</div>
		<ProgressBar value={goal.progressPct} color={color} />
	</button>

	{#if !summaryOnly}
		{#if goal.type === 'item'}
			<div class="meta">
				<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
				<ProgressBar value={goal.goldProgressPct} color="item" label="Gold progress" />
				<ProgressBar value={goal.powerProgressPct} color="item" label="Purchasing power" />
			</div>
		{:else if goal.subGoals?.length}
			<ul>
				{#each goal.subGoals as sub}
					<li class:complete={sub.completed}>{sub.completed ? '✓' : '•'} {sub.label}</li>
				{/each}
			</ul>
		{/if}

		<div class="actions">
			{#if goal.type === 'item' && goal.status === 'active'}
				<button onclick={onComplete}>Mark goal complete</button>
			{:else if goal.type === 'item' && goal.status === 'completed'}
				<button onclick={onUndo} class="ghost">Undo</button>
			{/if}
		</div>
	{/if}
</article>

<style>
	.card {
		background: color-mix(in oklab, var(--surface-1), #fff 2%);
		border: 1px solid var(--border);
		border-left: 4px solid var(--goal-item);
		border-radius: 0.9rem;
		padding: 0.8rem;
		display: grid;
		gap: 0.75rem;
	}
	.card[data-type='quest'] {
		border-left-color: var(--goal-quest);
	}
	.card[data-type='skill'] {
		border-left-color: var(--goal-skill);
	}
	.card.done {
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--goal-complete), transparent 70%);
	}
	.open {
		all: unset;
		display: grid;
		gap: 0.55rem;
		cursor: pointer;
	}
	.title-row {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
		align-items: center;
	}
	.name {
		margin: 0;
		font-weight: 650;
		font-size: 0.97rem;
	}
	.status {
		font-size: 0.7rem;
		padding: 0.18rem 0.45rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--goal-complete), transparent 75%);
		color: #b9f0cf;
	}
	.meta {
		display: grid;
		gap: 0.55rem;
	}
	ul {
		margin: 0;
		padding: 0 0 0 0.95rem;
		display: grid;
		gap: 0.28rem;
		color: var(--text-2);
		font-size: 0.82rem;
	}
	li.complete {
		color: #87d3ac;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
	}
	button {
		border: 1px solid var(--border);
		background: #1f2735;
		color: var(--text-1);
		padding: 0.45rem 0.65rem;
		border-radius: 0.55rem;
		cursor: pointer;
	}
	button.ghost {
		background: transparent;
	}
</style>

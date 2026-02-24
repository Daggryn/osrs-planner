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
</script>

<article
	class="card {goal.status === 'completed' ? 'done' : ''} {summaryOnly ? 'summary' : 'full'}"
	data-type={goal.type}
>
	<button class="open" aria-label={`Open ${goal.title}`} onclick={onOpen}>
		<div class="title-row">
			<p class="name">{goal.iconUrl ?? ''} {goal.title}</p>
			{#if goal.status === 'completed'}<span class="status">Completed</span>{/if}
		</div>
	</button>

	{#if !summaryOnly}
		{#if goal.type === 'item'}
			<div class="meta">
				<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
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

	<div class="progress-slot">
		{#if goal.type === 'item'}
			<ProgressBar value={goal.goldProgressPct} secondaryValue={goal.powerProgressPct} />
		{:else}
			<ProgressBar value={goal.progressPct} />
		{/if}
	</div>
</article>

<style>
	.card {
		background: color-mix(in oklab, var(--surface-1), #fff 2%);
		border: 1px solid color-mix(in oklab, var(--goal-item), var(--border) 35%);
		border-radius: 0.42rem;
		padding: 0.85rem 0.85rem 0.35rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.card.full {
		min-height: 228px;
	}
	.card.summary {
		min-height: 176px;
	}
	.card[data-type='quest'] {
		border-color: color-mix(in oklab, var(--goal-quest), var(--border) 35%);
	}
	.card[data-type='skill'] {
		border-color: color-mix(in oklab, var(--goal-skill), var(--border) 35%);
	}
	.card.done {
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--goal-complete), transparent 70%);
	}
	.open {
		all: unset;
		display: block;
		cursor: pointer;
	}
	.title-row {
		display: grid;
		justify-items: center;
		text-align: center;
		position: relative;
	}
	.name {
		margin: 0;
		font-weight: 650;
		font-size: 1.02rem;
		font-family: var(--font-heading);
		letter-spacing: 0.01em;
	}
	.status {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 0.7rem;
		padding: 0.18rem 0.45rem;
		border-radius: 0.3rem;
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
	.progress-slot {
		margin-top: auto;
	}
	button {
		border: 1px solid var(--border);
		background: color-mix(in oklab, var(--surface-2), #fff 3%);
		color: var(--text-1);
		padding: 0.5rem 0.72rem;
		border-radius: 0.34rem;
		cursor: pointer;
	}
	button.ghost {
		background: transparent;
	}
</style>

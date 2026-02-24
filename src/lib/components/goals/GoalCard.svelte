<script lang="ts">
	import type { Goal, ItemGoal, SkillGoal } from '$lib/domain/types';
	import ProgressBar from '$lib/components/goals/ProgressBar.svelte';
	import PriceBadge from '$lib/components/items/PriceBadge.svelte';

	let {
		goal,
		homeMode = false,
		onComplete,
		onUndo,
		onOpen
	} = $props<{
		goal: Goal | ItemGoal | SkillGoal;
		homeMode?: boolean;
		onComplete?: () => void;
		onUndo?: () => void;
		onOpen?: () => void;
	}>();
</script>

<article class="card {goal.status === 'completed' ? 'done' : ''}" data-type={goal.type}>
	<button class="open" aria-label={`Open ${goal.title}`} onclick={onOpen}>
		<div class="title-row">
			{#if goal.type === 'item'}
				<img class="item-image" src={goal.imageUrl ?? '/icons/item-placeholder.svg'} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />
			{/if}
			<p class="name">{goal.title}</p>
		</div>

		{#if homeMode && goal.type === 'skill'}
			<div class="skill-center">
				<img src={goal.iconUrl ?? '/icons/skill.svg'} alt="" />
				<strong>{goal.currentLevel} / {goal.targetLevel}</strong>
			</div>
		{/if}

		{#if homeMode && goal.type === 'item'}
			<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
		{/if}
	</button>

	{#if !homeMode}
		{#if goal.type === 'item'}
			<div class="meta">
				<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
			</div>
		{:else if goal.subGoals?.length}
			<ul>
				{#each goal.subGoals as sub}
					<li class:complete={sub.completed}>
						<span>{sub.completed ? '✓' : '•'} {sub.label}</span>
						{#if sub.parentGoalTitle}
							<small>for {sub.parentGoalTitle}</small>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}

	<div class="footer-slot">
		{#if !homeMode}
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
	</div>
</article>

<style>
	.card {
		background: linear-gradient(160deg, var(--surface-2) 0%, var(--surface-1) 100%);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		padding: 0.7rem 0.75rem 0.45rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		min-height: 150px;
		box-shadow: var(--shadow-hard);
	}
	.card.done {
		outline: 1px solid color-mix(in oklab, var(--ok), var(--border) 45%);
	}
	.open {
		all: unset;
		display: block;
		cursor: pointer;
	}
	.title-row {
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		text-align: center;
	}
	.item-image {
		width: 1.8rem;
		height: 1.8rem;
		object-fit: contain;
	}
	.name {
		margin: 0;
		font-weight: 650;
		font-size: 0.98rem;
		font-family: var(--font-heading);
		letter-spacing: 0.01em;
	}
	.skill-center {
		display: grid;
		justify-items: center;
		gap: 0.15rem;
		margin-top: 0.2rem;
	}
	.skill-center img {
		width: 1.25rem;
		height: 1.25rem;
	}
	.skill-center strong {
		font-family: var(--font-heading);
		font-size: 0.95rem;
	}
	.meta {
		display: grid;
		justify-items: center;
		text-align: center;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.28rem;
		color: var(--text-2);
		font-size: 0.82rem;
		justify-items: center;
		text-align: center;
	}
	li.complete {
		color: #87d3ac;
	}
	li small {
		font-size: 0.67rem;
		color: var(--text-3);
	}
	.footer-slot {
		margin-top: auto;
		display: grid;
		gap: 0.2rem;
	}
	.actions {
		display: flex;
		justify-content: center;
		margin-top: 0;
	}
	.progress-slot {
		margin-top: 0;
	}
	button {
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-1);
		padding: 0.42rem 0.68rem;
		border-radius: var(--radius-button);
		cursor: pointer;
		font-family: var(--font-heading);
	}
	button.ghost {
		background: transparent;
	}
</style>

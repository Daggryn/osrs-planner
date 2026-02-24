<script lang="ts">
	import type { GoalType } from '$lib/domain/types';
	let { title, goalName, goalType } = $props<{ title: string; goalName: string; goalType: GoalType }>();
</script>

<article class="toast" data-type={goalType}>
	<p class="title">{title}</p>
	<p class="goal">{goalName}</p>
</article>

<style>
	.toast {
		padding: 0.75rem 0.85rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-panel);
		background: var(--surface-2);
		min-width: 13rem;
		box-shadow: var(--shadow-hard);
	}
	.title {
		margin: 0;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-2);
	}
	.goal {
		margin: 0.2rem 0 0;
		font-weight: 600;
	}
	.toast[data-type='item'] {
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 55%);
	}
	.toast[data-type='quest'] {
		border-color: color-mix(in oklab, var(--goal-quest), var(--border) 55%);
	}
	.toast[data-type='skill'] {
		border-color: color-mix(in oklab, var(--goal-skill), var(--border) 55%);
	}
</style>

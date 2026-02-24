<script lang="ts">
	import type { Goal } from '$lib/domain/types';
	let { goals } = $props<{ goals: Goal[] }>();
</script>

{#if goals.length > 0}
	<section class="spotlight">
		<p class="eyebrow">Goals achieved since last visit</p>
		<div class="items">
			{#each goals as goal}
				<article>
					<span>{goal.type}</span>
					<h3>{goal.title}</h3>
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	.spotlight {
		padding: 0.85rem;
		border-radius: var(--radius-panel);
		background:
			linear-gradient(130deg, color-mix(in oklab, var(--surface-2), #1b365a 35%), var(--surface-2));
		border: 1px solid color-mix(in oklab, var(--goal-quest), var(--border) 60%);
		animation: pulse 0.7s ease-out;
	}
	@keyframes pulse {
		from {
			transform: translateY(-3px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.eyebrow {
		margin: 0;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
	}
	.items {
		margin-top: 0.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 0.5rem;
	}
	article {
		padding: 0.55rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		background: #131a24;
	}
	span {
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-size: 0.65rem;
		color: var(--text-2);
	}
	h3 {
		margin: 0.15rem 0 0;
		font-size: 0.95rem;
	}
</style>

<script lang="ts">
	let { count, onOpenBank } = $props<{ count: number; onOpenBank?: () => void }>();
</script>

{#if count > 0}
	<section class="banner">
		<div>
			<p class="title">Recent item goals achieved</p>
			<p>Add items you are willing to sell. They increase your total available gp.</p>
		</div>
		<button onclick={onOpenBank}>Reconcile in Bank ({count})</button>
	</section>
{/if}

<style>
	.banner {
		border: 1px solid color-mix(in oklab, var(--goal-item), var(--border) 55%);
		background: color-mix(in oklab, var(--surface-2), #2f2411 20%);
		border-radius: 0.38rem;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
		align-items: center;
	}
	.title {
		margin: 0;
		font-weight: 650;
	}
	p {
		margin: 0.15rem 0 0;
		color: var(--text-2);
		font-size: 0.84rem;
	}
	button {
		border: 1px solid var(--border);
		background: color-mix(in oklab, var(--surface-1), #fff 3%);
		color: var(--text-1);
		padding: 0.5rem 0.7rem;
		border-radius: 0.3rem;
		cursor: pointer;
		white-space: nowrap;
		font-family: var(--font-heading);
	}
	@media (max-width: 640px) {
		.banner {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>

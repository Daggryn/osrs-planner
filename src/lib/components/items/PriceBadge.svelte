<script lang="ts">
	import { formatGp } from '$lib/stores/selectors';
	let { price, stale = false } = $props<{ price?: number; stale?: boolean }>();
</script>

<p class="price">
	{typeof price === 'number' ? formatGp(price) : 'Price unavailable'}
	{#if stale}<span>stale</span>{/if}
</p>

<style>
	.price {
		margin: 0;
		color: var(--text-1);
		font-weight: 600;
		display: inline-flex;
		gap: 0.35rem;
		align-items: center;
		font-family: var(--font-body);
	}
	span {
		font-size: 0.62rem;
		padding: 0.08rem 0.32rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}
</style>

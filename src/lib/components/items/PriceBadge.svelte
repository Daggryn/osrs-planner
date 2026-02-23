<script lang="ts">
	let { price, stale = false } = $props<{ price?: number; stale?: boolean }>();
	const formatGp = (value?: number) =>
		typeof value === 'number' ? `${Math.floor(value).toLocaleString()} gp` : 'Price unavailable';
</script>

<p class="price">
	{formatGp(price)}
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
	}
	span {
		font-size: 0.65rem;
		padding: 0.08rem 0.35rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-2);
	}
</style>


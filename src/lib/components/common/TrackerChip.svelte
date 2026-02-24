<script lang="ts">
	let { label, value, icon } = $props<{ label: string; value: string; icon?: string }>();
</script>

<span class="chip">
	{#if icon}<img src={icon} alt="" />{/if}
	<strong>{label}</strong>
	<em>{value}</em>
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.45rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-button);
		background: var(--surface-2);
		font-size: 0.73rem;
		color: var(--text-2);
	}
	img {
		width: 0.8rem;
		height: 0.8rem;
		object-fit: contain;
	}
	strong {
		font-family: var(--font-heading);
		color: var(--text-1);
		font-weight: 600;
	}
	em {
		font-style: normal;
		color: var(--text-2);
	}
</style>


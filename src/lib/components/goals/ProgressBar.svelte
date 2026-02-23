<script lang="ts">
	let { value, color = 'default', label } = $props<{
		value: number;
		color?: 'item' | 'quest' | 'skill' | 'default';
		label?: string;
	}>();
	const pct = $derived(Math.max(0, Math.min(100, Math.floor(value))));
</script>

<div class="progress-wrap">
	{#if label}<p>{label}</p>{/if}
	<div class="track">
		<div
			class="bar {pct >= 100 ? 'complete' : ''}"
			style={`width:${pct}%; --bar-color: var(--goal-${color});`}
		></div>
	</div>
	<span>{pct}%</span>
</div>

<style>
	.progress-wrap {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.25rem 0.55rem;
		align-items: center;
	}
	p {
		margin: 0;
		grid-column: 1 / -1;
		color: var(--text-2);
		font-size: 0.75rem;
	}
	.track {
		height: 0.45rem;
		border-radius: 999px;
		background: #0d131b;
		border: 1px solid var(--border);
		overflow: hidden;
	}
	.bar {
		height: 100%;
		background: var(--bar-color, #6b7c93);
	}
	.bar.complete {
		background: var(--goal-complete);
	}
	span {
		font-size: 0.72rem;
		color: var(--text-2);
	}
</style>

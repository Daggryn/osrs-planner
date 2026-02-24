<script lang="ts">
	import { progressColor } from '$lib/stores/selectors';
	let { value, secondaryValue, label } = $props<{
		value: number;
		secondaryValue?: number;
		label?: string;
	}>();
	const clampPct = (num: number) => Math.max(0, Math.min(100, Math.floor(num)));
	const pct = $derived(clampPct(value));
	const secondaryPct = $derived(typeof secondaryValue === 'number' ? clampPct(secondaryValue) : undefined);
	const basePct = $derived(secondaryPct === undefined ? pct : Math.min(pct, secondaryPct));
	const fullPct = $derived(secondaryPct === undefined ? pct : Math.max(pct, secondaryPct));
	const boostWidth = $derived(Math.max(0, fullPct - basePct));
</script>

<div class="progress-wrap">
	{#if label}<p>{label}</p>{/if}
	<span>{fullPct}%</span>
	<div class="track">
		{#if secondaryPct === undefined}
			<div class="bar" style={`width:${pct}%; background:${progressColor(pct)};`}></div>
		{:else}
			<div class="bar" style={`width:${basePct}%; background:${progressColor(basePct)}; opacity:0.7;`}></div>
			<div class="bar" style={`left:${basePct}%; width:${boostWidth}%; background:${progressColor(fullPct)};`}></div>
		{/if}
	</div>
</div>

<style>
	.progress-wrap {
		display: grid;
		gap: 0.2rem;
		justify-items: center;
	}
	p {
		margin: 0;
		color: var(--text-2);
		font-size: 0.73rem;
	}
	span {
		font-size: 0.71rem;
		color: var(--text-2);
	}
	.track {
		width: 100%;
		height: 0.45rem;
		border-radius: 3px;
		background: #10161f;
		border: 1px solid var(--border);
		overflow: hidden;
		position: relative;
	}
	.bar {
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>

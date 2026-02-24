<script lang="ts">
	let { value, secondaryValue, label } = $props<{
		value: number;
		secondaryValue?: number;
		label?: string;
	}>();
	const clampPct = (num: number) => Math.max(0, Math.min(100, Math.floor(num)));
	const pct = $derived(clampPct(value));
	const secondaryPct = $derived(typeof secondaryValue === 'number' ? clampPct(secondaryValue) : undefined);
	const goldPct = $derived(secondaryPct === undefined ? pct : Math.min(pct, secondaryPct));
	const powerPct = $derived(secondaryPct === undefined ? pct : Math.max(pct, secondaryPct));
	const boostWidth = $derived(Math.max(0, powerPct - goldPct));
	const displayPct = $derived(secondaryPct === undefined ? pct : powerPct);

	const rampColor = (num: number) => {
		const hue = Math.round((num / 100) * 120);
		return `hsl(${hue} 64% 45%)`;
	};
</script>

<div class="progress-wrap">
	{#if label}<p>{label}</p>{/if}
	<span>{displayPct}%</span>
	<div class="track">
		{#if secondaryPct === undefined}
			<div class="bar" style={`width:${pct}%; background:${rampColor(pct)};`}></div>
		{:else}
			<div class="bar gold" style={`width:${goldPct}%; background:${rampColor(goldPct)};`}></div>
			<div
				class="bar power"
				style={`left:${goldPct}%; width:${boostWidth}%; background:${rampColor(powerPct)};`}
			></div>
		{/if}
	</div>
</div>

<style>
	.progress-wrap {
		display: grid;
		gap: 0.2rem;
	}
	p {
		margin: 0;
		color: var(--text-2);
		font-size: 0.75rem;
	}
	span {
		font-size: 0.72rem;
		color: var(--text-2);
		justify-self: end;
	}
	.track {
		height: 0.42rem;
		border-radius: 0.25rem;
		background: #0d131b;
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
	.bar.gold {
		opacity: 0.82;
	}
	.bar.power {
		opacity: 0.95;
	}
</style>

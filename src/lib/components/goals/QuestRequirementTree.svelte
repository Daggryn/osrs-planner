<script lang="ts">
	import type { QuestDisplayNode } from '$lib/services/questRequirements';
	import QuestRequirementTree from './QuestRequirementTree.svelte';

	let { node, depth = 1 } = $props<{ node: QuestDisplayNode; depth?: number }>();
</script>

<div class="quest-row {node.completed ? 'completed' : node.ready ? 'ready' : ''}" style={`--depth:${depth};`}>
	<span class="label">{node.quest}</span>
	{#if node.completed}
		<span class="status complete">Completed</span>
	{:else if node.ready}
		<span class="status ready">Ready</span>
	{/if}
</div>

{#each node.unmetSkills as req}
	<div class="skill-row" style={`--depth:${depth + 1};`}>
		<span class="label">{req.level} {req.skill}</span>
	</div>
{/each}

{#if !node.completed}
	{#each node.children as child}
		<QuestRequirementTree node={child} depth={depth + 1} />
	{/each}
{/if}

<style>
	.quest-row,
	.skill-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.4rem;
		align-items: center;
		padding: 0.2rem 0 0.2rem calc(var(--depth) * 0.8rem);
		font-size: 0.82rem;
		text-align: left;
	}
	.quest-row.completed {
		color: #87d3ac;
	}
	.status {
		font-size: 0.7rem;
		border: 1px solid var(--border);
		padding: 0.05rem 0.3rem;
		border-radius: var(--radius-button);
	}
	.status.complete {
		color: #87d3ac;
		border-color: color-mix(in oklab, #87d3ac, var(--border) 55%);
	}
	.status.ready {
		color: var(--text-1);
	}
</style>

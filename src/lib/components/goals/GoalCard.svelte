<script lang="ts">
	import type { Goal, ItemGoal, SkillGoal } from '$lib/domain/types';
	import ProgressBar from '$lib/components/goals/ProgressBar.svelte';
	import PriceBadge from '$lib/components/items/PriceBadge.svelte';
	import QuestRequirementTree from '$lib/components/goals/QuestRequirementTree.svelte';
	import { categoryIcons } from '$lib/constants/categoryIcons';
	import { buildQuestDisplayModel } from '$lib/services/questRequirements';

	let {
		goal,
		homeMode = false,
		onComplete,
		onUndo,
		onOpen
	} = $props<{
		goal: Goal | ItemGoal | SkillGoal;
		homeMode?: boolean;
		onComplete?: () => void;
		onUndo?: () => void;
		onOpen?: () => void;
	}>();

	let expandedTopLevelQuests = $state<Record<string, boolean>>({});

	function fallbackTopLevelQuestDeps() {
		if (goal.type !== 'quest') return [];
		const directIds = goal.requirements.directQuestIds ?? [];
		const sourceQuestIds = directIds.length > 0 ? directIds : goal.requirements.questIds;
		return sourceQuestIds.map((quest: string) => ({
			quest,
			directSkillReqs: [],
			directQuestReqs: [],
			children: []
		}));
	}

	const directSkillReqs = $derived(
		goal.type === 'quest'
			? [...(goal.requirements.directSkillReqs ?? [])].sort(
					(a, b) => b.level - a.level || a.skill.localeCompare(b.skill)
				)
			: []
	);
	const topLevelQuestRows = $derived(
		goal.type === 'quest'
			? buildQuestDisplayModel(goal.requirements.topLevelQuestDeps ?? fallbackTopLevelQuestDeps(), {
					completedQuestIds: goal.completedQuestReqIds,
					userSkills: {}
				})
			: []
	);

	function toggleTopLevelQuest(quest: string) {
		expandedTopLevelQuests = { ...expandedTopLevelQuests, [quest]: !expandedTopLevelQuests[quest] };
	}
</script>

<article class="card {goal.status === 'completed' ? 'done' : ''}" data-type={goal.type}>
	<button class="open" aria-label={`Open ${goal.title}`} onclick={onOpen}>
		<div class="title-row">
			{#if goal.type === 'item'}
				<img class="item-image" src={goal.imageUrl ?? '/icons/item-placeholder.svg'} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />
			{/if}
			<p class="name">{goal.title}</p>
		</div>

		{#if homeMode && goal.type === 'skill'}
			<div class="skill-center">
				<img src={goal.iconUrl ?? categoryIcons.skill} alt="" />
				<strong>{goal.currentLevel} / {goal.targetLevel}</strong>
			</div>
		{/if}

		{#if homeMode && goal.type === 'item'}
			<div class="meta home-price">
				<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
			</div>
		{/if}
	</button>

	{#if !homeMode}
		{#if goal.type === 'item'}
			<div class="meta">
				<PriceBadge price={goal.currentPrice ?? goal.lastKnownPrice} stale={Boolean(goal.priceStale)} />
			</div>
		{:else if goal.type === 'quest'}
			<div class="quest-reqs">
				{#each directSkillReqs as req}
					<div class="skill-row {goal.completedSkillReqs.some((x: { skill: string; level: number }) => x.skill === req.skill && x.level >= req.level) ? 'completed' : ''}">
						<span class="label">{req.level} {req.skill}</span>
						{#if goal.completedSkillReqs.some((x: { skill: string; level: number }) => x.skill === req.skill && x.level >= req.level)}
							<span class="status complete">Completed</span>
						{/if}
					</div>
				{/each}

				{#each topLevelQuestRows as node}
					<div class="quest-row {node.completed ? 'completed' : node.ready ? 'ready' : ''}">
						<button
							class="quest-toggle"
							disabled={node.completed}
							onclick={() => toggleTopLevelQuest(node.quest)}
						>
							<span>{node.completed ? '•' : expandedTopLevelQuests[node.quest] ? '▾' : '▸'}</span>
							<span>{node.quest}</span>
						</button>
						{#if node.completed}
							<span class="status complete">Completed</span>
						{:else if node.ready}
							<span class="status ready">Ready</span>
						{/if}
					</div>
					{#if !node.completed && expandedTopLevelQuests[node.quest]}
						{#each node.unmetSkills as req}
							<div class="skill-row" style="--depth:1;">
								<span class="label">{req.level} {req.skill}</span>
							</div>
						{/each}
						{#each node.children as child}
							<QuestRequirementTree node={child} depth={1} />
						{/each}
					{/if}
				{/each}
			</div>
		{:else if goal.subGoals?.length}
			<ul>
				{#each goal.subGoals as sub}
					<li class:complete={sub.completed}>
						<span>{sub.completed ? '✓' : '•'} {sub.label}</span>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}

	<div class="footer-slot">
		{#if !homeMode}
			<div class="actions">
				{#if goal.type === 'item' && goal.status === 'active'}
					<button onclick={onComplete}>Mark goal complete</button>
				{:else if goal.type === 'item' && goal.status === 'completed'}
					<button onclick={onUndo} class="ghost">Undo</button>
				{/if}
			</div>
		{/if}

		<div class="progress-slot">
			{#if goal.type === 'item'}
				<ProgressBar value={goal.goldProgressPct} secondaryValue={goal.powerProgressPct} />
			{:else}
				<ProgressBar value={goal.progressPct} />
			{/if}
		</div>
	</div>
</article>

<style>
	.card {
		background: linear-gradient(160deg, var(--surface-2) 0%, var(--surface-1) 100%);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		padding: 0.7rem 0.75rem 0.45rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		min-height: 150px;
		box-shadow: var(--shadow-hard);
	}
	.card.done {
		outline: 1px solid color-mix(in oklab, var(--ok), var(--border) 45%);
	}
	.open {
		all: unset;
		display: block;
		cursor: pointer;
	}
	.title-row {
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		text-align: center;
	}
	.item-image {
		width: 1.8rem;
		height: 1.8rem;
		object-fit: contain;
	}
	.name {
		margin: 0;
		font-weight: 650;
		font-size: 0.98rem;
		font-family: var(--font-heading);
		letter-spacing: 0.01em;
	}
	.skill-center {
		display: grid;
		justify-items: center;
		gap: 0.15rem;
		margin-top: 0.2rem;
	}
	.skill-center img {
		width: 1.25rem;
		height: 1.25rem;
	}
	.skill-center strong {
		font-family: var(--font-heading);
		font-size: 0.95rem;
	}
	.meta {
		display: grid;
		justify-items: center;
		text-align: center;
	}
	.home-price {
		margin-top: 0.2rem;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.28rem;
		color: var(--text-2);
		font-size: 0.82rem;
		justify-items: stretch;
		text-align: left;
	}
	.quest-reqs {
		display: grid;
		gap: 0.22rem;
		text-align: left;
	}
	.quest-row,
	.skill-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.4rem;
		align-items: center;
		font-size: 0.82rem;
		padding: 0.2rem 0;
	}
	.skill-row {
		padding-left: calc(var(--depth, 0) * 0.8rem);
	}
	.quest-toggle {
		all: unset;
		display: inline-flex;
		gap: 0.35rem;
		align-items: center;
		cursor: pointer;
	}
	.quest-toggle:disabled {
		cursor: default;
	}
	.quest-row.completed,
	.skill-row.completed {
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
	.footer-slot {
		margin-top: auto;
		display: grid;
		gap: 0.2rem;
	}
	.actions {
		display: flex;
		justify-content: center;
		margin-top: 0;
	}
	.progress-slot {
		margin-top: 0;
	}
	.actions button {
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-1);
		padding: 0.42rem 0.68rem;
		border-radius: var(--radius-button);
		cursor: pointer;
		font-family: var(--font-heading);
	}
	.actions button.ghost {
		background: transparent;
	}
</style>

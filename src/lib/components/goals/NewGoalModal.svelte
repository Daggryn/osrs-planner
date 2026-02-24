<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import TypeaheadItemSearch from '$lib/components/items/TypeaheadItemSearch.svelte';
	import type { CatalogItem } from '$lib/domain/types';

	const dispatch = createEventDispatcher<{
		close: void;
		createItem: CatalogItem;
		createQuest: { title: string; questReqs: string[]; skillReqs: Array<{ skill: string; level: number }> };
		createSkill: { skill: string; currentLevel: number; targetLevel: number };
	}>();

	let tab = $state<'item' | 'quest' | 'skill'>('item');

	let questTitle = $state('');
	let questReqInput = $state('');
	let skillReqInput = $state('');
	let skillReqLevel = $state(1);
	let questReqs = $state<string[]>([]);
	let skillReqs = $state<Array<{ skill: string; level: number }>>([]);
	let questOptions = $state<string[]>([]);
	let skillOptions = $state<string[]>([]);
	let loadingQuestMeta = $state(false);

	let skillName = $state('Slayer');
	let currentLevel = $state(1);
	let targetLevel = $state(70);

	let questMetaTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(async () => {
		try {
			const [questsRes, skillsRes] = await Promise.all([fetch('/api/osrs/quests'), fetch('/api/osrs/skills')]);
			const questsData = questsRes.ok ? ((await questsRes.json()) as { quests?: string[] }) : {};
			const skillsData = skillsRes.ok ? ((await skillsRes.json()) as { skills?: string[] }) : {};
			questOptions = questsData.quests ?? [];
			skillOptions = skillsData.skills ?? [];
		} catch {
			questOptions = [];
			skillOptions = [];
		}
	});

	function addQuestReq() {
		const value = questReqInput.trim();
		if (!value) return;
		if (!questReqs.includes(value)) questReqs = [...questReqs, value];
		questReqInput = '';
	}

	function addSkillReq() {
		const skill = skillReqInput.trim();
		if (!skill) return;
		skillReqs = [...skillReqs, { skill, level: Math.max(1, Math.floor(skillReqLevel)) }];
		skillReqInput = '';
		skillReqLevel = 1;
	}

	function onQuestTitleInput(nextTitle: string) {
		questTitle = nextTitle;
		clearTimeout(questMetaTimer);
		if (!nextTitle.trim()) return;
		questMetaTimer = setTimeout(async () => {
			loadingQuestMeta = true;
			try {
				const res = await fetch(`/api/osrs/quest-meta?title=${encodeURIComponent(nextTitle.trim())}`);
				if (res.ok) {
					const data = (await res.json()) as {
						questIds?: string[];
						skillReqs?: Array<{ skill: string; level: number }>;
					};
					questReqs = [...new Set(data.questIds ?? questReqs)];
					const map = new Map<string, { skill: string; level: number }>();
					for (const req of data.skillReqs ?? skillReqs) {
						map.set(`${req.skill}:${req.level}`, req);
					}
					skillReqs = [...map.values()];
				}
			} catch {
				// Keep manual data if metadata load fails.
			}
			loadingQuestMeta = false;
		}, 250);
	}
</script>

<div
	class="backdrop"
	role="button"
	tabindex="0"
	onclick={() => dispatch('close')}
	onkeydown={(e) => e.key === 'Escape' && dispatch('close')}
>
	<div
		class="modal"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<header>
			<h3>New Goal</h3>
			<button onclick={() => dispatch('close')}>Close</button>
		</header>

		<nav>
			<button class:active={tab === 'item'} onclick={() => (tab = 'item')}>Item</button>
			<button class:active={tab === 'quest'} onclick={() => (tab = 'quest')}>Quest</button>
			<button class:active={tab === 'skill'} onclick={() => (tab = 'skill')}>Skill</button>
		</nav>

		{#if tab === 'item'}
			<section class="panel">
				<TypeaheadItemSearch on:select={(e) => dispatch('createItem', e.detail)} />
				<p>Select an item from OSRS search to create an item goal.</p>
			</section>
		{:else if tab === 'quest'}
			<section class="panel">
				<label>
					Quest name
					<input
						type="text"
						list="quest-list"
						bind:value={questTitle}
						placeholder="e.g. Song of the Elves"
						oninput={(e) => onQuestTitleInput((e.currentTarget as HTMLInputElement).value)}
					/>
				</label>
				<datalist id="quest-list">
					{#each questOptions as quest}
						<option value={quest}></option>
					{/each}
				</datalist>
				{#if loadingQuestMeta}<small>Loading requirements...</small>{/if}
				<div class="line">
					<input type="text" bind:value={questReqInput} list="quest-list" placeholder="Quest requirement" />
					<button onclick={addQuestReq}>Add quest req</button>
				</div>
				<div class="line">
					<input type="text" bind:value={skillReqInput} list="skill-list" placeholder="Skill requirement" />
					<input type="number" min="1" bind:value={skillReqLevel} />
					<button onclick={addSkillReq}>Add skill req</button>
				</div>
				<datalist id="skill-list">
					{#each skillOptions as skill}
						<option value={skill}></option>
					{/each}
				</datalist>
				<ul>
					{#each questReqs as req, i}
						<li>{req} <button onclick={() => (questReqs = questReqs.filter((_, x) => x !== i))}>x</button></li>
					{/each}
					{#each skillReqs as req, i}
						<li>{req.skill} {req.level} <button onclick={() => (skillReqs = skillReqs.filter((_, x) => x !== i))}>x</button></li>
					{/each}
				</ul>
				<button
					onclick={() =>
						dispatch('createQuest', {
							title: questTitle.trim() || 'New Quest Goal',
							questReqs,
							skillReqs
						})}
				>
					Create quest goal
				</button>
			</section>
		{:else}
			<section class="panel">
				<label>
					Skill
					<input type="text" list="skill-list" bind:value={skillName} />
				</label>
				<datalist id="skill-list">
					{#each skillOptions as skill}
						<option value={skill}></option>
					{/each}
				</datalist>
				<label>
					Current level
					<input type="number" min="1" bind:value={currentLevel} />
				</label>
				<label>
					Target level
					<input type="number" min="1" bind:value={targetLevel} />
				</label>
				<button
					onclick={() =>
						dispatch('createSkill', {
							skill: skillName.trim() || 'Skill',
							currentLevel: Math.max(1, Math.floor(currentLevel)),
							targetLevel: Math.max(1, Math.floor(targetLevel))
						})}
				>
					Create skill goal
				</button>
			</section>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(9, 12, 17, 0.78);
		display: grid;
		place-items: center;
		z-index: 70;
	}
	.modal {
		width: min(42rem, 92vw);
		background: linear-gradient(160deg, var(--surface-2), var(--surface-1));
		border: 1px solid var(--border);
		border-radius: var(--radius-panel);
		box-shadow: var(--shadow-hard);
		padding: 0.9rem;
		display: grid;
		gap: 0.7rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	header h3 {
		margin: 0;
	}
	nav {
		display: flex;
		gap: 0.45rem;
	}
	.panel {
		display: grid;
		gap: 0.55rem;
	}
	.line {
		display: flex;
		gap: 0.45rem;
	}
	input {
		width: 100%;
		padding: 0.5rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-input);
		background: var(--surface-1);
		color: var(--text-1);
	}
	small {
		color: var(--text-2);
	}
	button {
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		padding: 0.45rem 0.65rem;
		border-radius: var(--radius-button);
		cursor: pointer;
	}
	nav button.active {
		background: color-mix(in oklab, var(--accent-1), var(--surface-1) 70%);
	}
	ul {
		margin: 0;
		padding-left: 1rem;
		color: var(--text-2);
	}
</style>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { searchItems } from '$lib/services/pricing';
	import type { CatalogItem } from '$lib/domain/types';
	let { placeholder = 'Search items...' } = $props<{ placeholder?: string }>();
	const dispatch = createEventDispatcher<{ select: CatalogItem }>();
	let query = $state('');
	let loading = $state(false);
	let results = $state<CatalogItem[]>([]);

	let timeout: ReturnType<typeof setTimeout> | undefined;
	const runSearch = (text: string) => {
		clearTimeout(timeout);
		timeout = setTimeout(async () => {
			loading = true;
			results = await searchItems(text);
			loading = false;
		}, 150);
	};

	const handleAdd = (item: CatalogItem) => {
		dispatch('select', item);
		query = '';
		results = [];
	};
</script>

<div class="search">
	<input
		type="text"
		bind:value={query}
		placeholder={placeholder}
		oninput={(e) => runSearch((e.currentTarget as HTMLInputElement).value)}
	/>
	{#if query.trim().length > 0}
		<div class="results">
			{#if loading}
				<p>Searching...</p>
			{:else if results.length === 0}
				<p>No results</p>
			{:else}
				{#each results as item}
					<button onclick={() => handleAdd(item)}>
						<span>{item.icon}</span>
						<span>{item.name}</span>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.search {
		position: relative;
	}
	input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: 0.65rem;
		border: 1px solid var(--border);
		background: #121a24;
		color: var(--text-1);
	}
	.results {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(100% + 0.35rem);
		background: #101722;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		padding: 0.4rem;
		display: grid;
		gap: 0.22rem;
		z-index: 30;
	}
	p {
		margin: 0;
		padding: 0.35rem;
		color: var(--text-2);
	}
	button {
		display: flex;
		gap: 0.55rem;
		align-items: center;
		text-align: left;
		border: 0;
		background: transparent;
		color: var(--text-1);
		padding: 0.45rem;
		border-radius: 0.5rem;
		cursor: pointer;
	}
	button:hover {
		background: #1d2735;
	}
</style>

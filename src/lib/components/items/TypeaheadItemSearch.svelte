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
						<img src={item.imageUrl ?? '/icons/item-placeholder.svg'} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />
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
		width: 100%;
		box-sizing: border-box;
	}
	input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: var(--radius-input);
		border: 1px solid var(--border);
		background: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-body);
	}
	.results {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(100% + 0.35rem);
		background: var(--surface-1);
		border: 1px solid var(--border);
		border-radius: var(--radius-input);
		padding: 0.35rem;
		display: grid;
		gap: 0.2rem;
		z-index: 30;
		box-shadow: var(--shadow-hard);
	}
	p {
		margin: 0;
		padding: 0.35rem;
		color: var(--text-2);
	}
	button {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		text-align: left;
		border: 0;
		background: transparent;
		color: var(--text-1);
		padding: 0.4rem;
		border-radius: var(--radius-input);
		cursor: pointer;
	}
	button:hover {
		background: var(--surface-3);
	}
	img {
		width: 1.2rem;
		height: 1.2rem;
		object-fit: contain;
	}
</style>

<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const tabs = [
		{ href: '/items/wishlist', label: 'Wishlist' },
		{ href: '/items/bank', label: 'Bank' }
	];

	const isActive = (href: string) => page.url.pathname === href;
</script>

<section class="items-layout">
	<nav class="tabs" aria-label="Item Goals sections">
		{#each tabs as tab}
			<a href={tab.href} class:active={isActive(tab.href)}>{tab.label}</a>
		{/each}
	</nav>
	{@render children()}
</section>

<style>
	.items-layout {
		display: grid;
		gap: 0.8rem;
	}
	.tabs {
		display: inline-flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.25rem;
	}
	.tabs a {
		text-decoration: none;
		color: var(--text-2);
		padding: 0.35rem 0.65rem;
		border: 1px solid transparent;
		border-radius: 0.3rem;
		font-family: var(--font-heading);
		letter-spacing: 0.02em;
	}
	.tabs a.active {
		color: var(--text-1);
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 58%);
		background: color-mix(in oklab, var(--surface-1), #fff 2%);
	}
</style>


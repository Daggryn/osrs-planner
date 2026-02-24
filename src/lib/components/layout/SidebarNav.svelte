<script lang="ts">
	import { categoryIcons } from '$lib/constants/categoryIcons';
	import { plannerStore } from '$lib/stores/plannerStore';

	type NavLink = { href: string; label: string; short: string; icon?: string };
	let { currentPath } = $props<{ currentPath: string }>();

	const desktopLinks: NavLink[] = [
		{ href: '/', label: 'Home', short: 'Home', icon: '/icons/home.svg' },
		{ href: '/items/wishlist', label: 'Item Goals', short: 'Items', icon: categoryIcons.item },
		{ href: '/quests', label: 'Quest Goals', short: 'Quests', icon: categoryIcons.quest },
		{ href: '/skills', label: 'Skill Goals', short: 'Skills', icon: categoryIcons.skill }
	];

	const mobileLinks: NavLink[] = [
		{ href: '/', label: 'Home', short: 'Home', icon: '/icons/home.svg' },
		{ href: '/items/wishlist', label: 'Items', short: 'Items', icon: categoryIcons.item },
		{ href: '/quests', label: 'Quests', short: 'Quests', icon: categoryIcons.quest },
		{ href: '/skills', label: 'Skills', short: 'Skills', icon: categoryIcons.skill }
	];

	const navCollapsed = $derived($plannerStore.ui.navCollapsed);

	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath.startsWith(href);
</script>

<aside class="sidebar" data-collapsed={navCollapsed}>
	<div class="head">
		<h1>{navCollapsed ? 'OP' : 'OSRS Planner'}</h1>
		<button onclick={() => plannerStore.setNavCollapsed(!navCollapsed)} aria-label="Toggle navigation collapse">
			{navCollapsed ? '»' : '«'}
		</button>
	</div>
	<nav class="desktop-nav">
		{#each desktopLinks as link}
			<a href={link.href} class:active={isActive(link.href)} title={link.label}>
				{#if link.icon}<img src={link.icon} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />{/if}
				{#if !navCollapsed}<span>{link.label}</span>{/if}
			</a>
		{/each}
	</nav>
</aside>

<nav class="bottom-tabs" aria-label="Primary">
	{#each mobileLinks as link}
		<a href={link.href} class:active={isActive(link.href)}>
			{#if link.icon}<img src={link.icon} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />{/if}
			<span>{link.short}</span>
		</a>
	{/each}
</nav>

<style>
	.sidebar {
		width: 15rem;
		padding: 1rem 0.85rem;
		background: linear-gradient(165deg, var(--surface-2), var(--surface-1));
		border-right: 1px solid var(--border);
		position: sticky;
		top: 0;
		height: 100vh;
		display: none;
		box-sizing: border-box;
	}
	.sidebar[data-collapsed='true'] {
		width: 4.3rem;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.8rem;
	}
	h1 {
		font-size: 0.95rem;
		margin: 0;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-family: var(--font-heading);
	}
	.head button {
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		border-radius: var(--radius-button);
		width: 1.7rem;
		height: 1.5rem;
		cursor: pointer;
	}
	.desktop-nav {
		display: grid;
		gap: 0.35rem;
	}
	a {
		color: var(--text-2);
		text-decoration: none;
		padding: 0.52rem;
		border-radius: var(--radius-card);
		border: 1px solid transparent;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-weight: 520;
		font-family: var(--font-heading);
		letter-spacing: 0.02em;
	}
	a img {
		width: 1rem;
		height: 1rem;
		object-fit: contain;
		flex-shrink: 0;
	}
	a.active {
		color: var(--text-1);
		background: color-mix(in oklab, var(--accent-1), var(--surface-1) 80%);
		border-color: var(--border);
	}
	.bottom-tabs {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.5rem;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.4rem;
		background: color-mix(in oklab, var(--surface-2), #000 10%);
		border-top: 1px solid var(--border);
		z-index: 40;
	}
	.bottom-tabs a {
		flex-direction: column;
		justify-content: center;
		text-align: center;
		font-size: 0.72rem;
		padding: 0.3rem 0.2rem;
		gap: 0.18rem;
	}
	.bottom-tabs img {
		width: 0.9rem;
		height: 0.9rem;
	}
	@media (min-width: 900px) {
		.sidebar {
			display: block;
		}
		.bottom-tabs {
			display: none;
		}
	}
</style>

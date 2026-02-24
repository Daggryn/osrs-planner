<script lang="ts">
	import { categoryIcons } from '$lib/constants/categoryIcons';

	type NavLink = { href: string; label: string; short: string; icon?: string };
	let { currentPath } = $props<{ currentPath: string }>();

	const desktopLinks: NavLink[] = [
		{ href: '/', label: 'Dashboard', short: 'Home' },
		{ href: '/items/wishlist', label: 'Item Goals', short: 'Items', icon: categoryIcons.item },
		{ href: '/quests', label: 'Quest Goals', short: 'Quests', icon: categoryIcons.quest },
		{ href: '/skills', label: 'Skill Goals', short: 'Skills', icon: categoryIcons.skill }
	];

	const mobileLinks: NavLink[] = [
		{ href: '/', label: 'Dashboard', short: 'Home' },
		{ href: '/items/wishlist', label: 'Items', short: 'Items', icon: categoryIcons.item },
		{ href: '/quests', label: 'Quests', short: 'Quests', icon: categoryIcons.quest },
		{ href: '/skills', label: 'Skills', short: 'Skills', icon: categoryIcons.skill }
	];

	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath.startsWith(href);

</script>

<aside class="sidebar">
	<h1>OSRS Planner</h1>
	<nav class="desktop-nav">
		{#each desktopLinks as link}
			<a href={link.href} class:active={isActive(link.href)}>
				{#if link.icon}<img src={link.icon} alt="" />{/if}
				<span>{link.label}</span>
			</a>
		{/each}
	</nav>
</aside>

<nav class="bottom-tabs" aria-label="Primary">
	{#each mobileLinks as link}
		<a href={link.href} class:active={isActive(link.href)}>
			{#if link.icon}<img src={link.icon} alt="" />{/if}
			<span>{link.short}</span>
		</a>
	{/each}
</nav>

<style>
	.sidebar {
		width: 15rem;
		padding: 1.2rem 1rem;
		background: linear-gradient(185deg, var(--surface-2), color-mix(in oklab, var(--surface-2), #0e0c0a 18%));
		border-right: 1px solid var(--border);
		position: sticky;
		top: 0;
		height: 100vh;
		display: none;
	}
	h1 {
		font-size: 1.04rem;
		margin: 0 0 0.9rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-family: var(--font-heading);
	}
	.desktop-nav {
		display: grid;
		gap: 0.45rem;
	}
	a {
		color: var(--text-2);
		text-decoration: none;
		padding: 0.58rem 0.65rem 0.58rem 0.9rem;
		border-radius: 0.35rem;
		border: 1px solid transparent;
		display: flex;
		gap: 0.45rem;
		align-items: center;
		font-weight: 520;
		font-family: var(--font-heading);
		letter-spacing: 0.02em;
	}
	a img {
		width: 1rem;
		height: 1rem;
		image-rendering: pixelated;
	}
	a.active {
		color: var(--text-1);
		background: color-mix(in oklab, var(--surface-1), #fff 2%);
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 55%);
		box-shadow: inset 2px 0 0 color-mix(in oklab, var(--goal-item), #fff 10%);
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
		background: color-mix(in oklab, var(--surface-2), #100e0c 20%);
		border-top: 1px solid var(--border);
		z-index: 40;
	}
	.bottom-tabs a {
		flex-direction: column;
		justify-content: center;
		text-align: center;
		font-size: 0.74rem;
		padding: 0.35rem 0.2rem;
		gap: 0.18rem;
		font-family: var(--font-heading);
	}
	.bottom-tabs img {
		width: 0.9rem;
		height: 0.9rem;
		image-rendering: pixelated;
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

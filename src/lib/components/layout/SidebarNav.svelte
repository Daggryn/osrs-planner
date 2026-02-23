<script lang="ts">
	type NavLink = { href: string; label: string; short: string };
	let { currentPath } = $props<{ currentPath: string }>();

	const links: NavLink[] = [
		{ href: '/', label: 'Dashboard', short: 'Home' },
		{ href: '/items/wishlist', label: 'Item Goals', short: 'Items' },
		{ href: '/items/bank', label: 'Bank', short: 'Bank' },
		{ href: '/quests', label: 'Quest Goals', short: 'Quests' },
		{ href: '/skills', label: 'Skill Goals', short: 'Skills' }
	];

	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath.startsWith(href);
</script>

<aside class="sidebar">
	<h1>OSRS Planner</h1>
	<nav>
		{#each links as link}
			<a href={link.href} class:active={isActive(link.href)}>{link.label}</a>
		{/each}
	</nav>
</aside>

<nav class="bottom-tabs" aria-label="Primary">
	{#each links as link}
		<a href={link.href} class:active={isActive(link.href)}>{link.short}</a>
	{/each}
</nav>

<style>
	.sidebar {
		width: 15rem;
		padding: 1.2rem 1rem;
		background: linear-gradient(175deg, var(--surface-2), color-mix(in oklab, var(--surface-2), #111 20%));
		border-right: 1px solid var(--border);
		position: sticky;
		top: 0;
		height: 100vh;
		display: none;
	}
	h1 {
		font-size: 1rem;
		margin: 0 0 1rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	nav {
		display: grid;
		gap: 0.35rem;
	}
	a {
		color: var(--text-2);
		text-decoration: none;
		padding: 0.55rem 0.65rem;
		border-radius: 0.55rem;
		border: 1px solid transparent;
	}
	a.active {
		color: var(--text-1);
		background: color-mix(in oklab, var(--surface-1), #fff 2%);
		border-color: var(--border);
	}
	.bottom-tabs {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.5rem;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 0.4rem;
		background: color-mix(in oklab, var(--surface-2), #111 25%);
		border-top: 1px solid var(--border);
		z-index: 40;
	}
	.bottom-tabs a {
		text-align: center;
		font-size: 0.8rem;
		padding: 0.45rem 0.2rem;
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


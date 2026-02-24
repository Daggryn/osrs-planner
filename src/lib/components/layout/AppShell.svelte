<script lang="ts">
	import { page } from '$app/state';
	import SidebarNav from '$lib/components/layout/SidebarNav.svelte';
	import { feedbackStore } from '$lib/stores/feedbackStore';
	import CompletionToast from '$lib/components/feedback/CompletionToast.svelte';
	let { children } = $props();
</script>

<div class="shell">
	<SidebarNav currentPath={page.url.pathname} />
	<main>
		{@render children()}
	</main>
	<div class="toast-stack">
		{#each $feedbackStore as toast (toast.id)}
			<CompletionToast title={toast.title} goalName={toast.goalName} goalType={toast.goalType} />
		{/each}
	</div>
</div>

<style>
	:global(:root) {
		--surface-0: #0f1318;
		--surface-1: #171c23;
		--surface-2: #1c232c;
		--surface-3: #242d37;

		--text-1: #e8edf3;
		--text-2: #a9b3c0;
		--text-3: #7f8a98;

		/* Muted steel-gray blue accents (less vibrant) */
		--accent-1: #4c5a6a;
		--accent-2: #5a697b;
		--accent-3: #6b7c90;

		--ok: #49b06e;
		--warn: #d1a052;
		--danger: #c75b5b;

		--goal-item: #b89a5a;
		--goal-quest: #6f8fb0;
		--goal-skill: #5a9a75;

		--border: #33404f;
		--shadow-hard: 0 8px 0 rgba(0, 0, 0, 0.35), 0 14px 24px rgba(0, 0, 0, 0.28);

		--font-heading: 'Cinzel', Georgia, serif;
		--font-body: 'Source Sans 3', 'Segoe UI', sans-serif;

		--radius-card: 4px;
		--radius-panel: 4px;
		--radius-input: 6px;
		--radius-button: 6px;
	}
	:global(body) {
		font-family: var(--font-body);
		margin: 0;
		background: linear-gradient(180deg, #0f1318, #111721 62%, #0f1318);
		color: var(--text-1);
	}
	:global(h1),
	:global(h2),
	:global(h3),
	:global(h4),
	:global(h5),
	:global(h6) {
		font-family: var(--font-heading);
		font-weight: 600;
		letter-spacing: 0.015em;
	}
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}
	:global(*:focus-visible) {
		outline: 2px solid var(--accent-3);
		outline-offset: 2px;
		border-radius: 2px;
	}
	.shell {
		display: flex;
		min-height: 100vh;
	}
	main {
		flex: 1;
		padding: 1rem 1rem 4.75rem;
		max-width: 1120px;
		width: 100%;
		margin: 0 auto;
	}
	.toast-stack {
		position: fixed;
		top: 0.8rem;
		right: 0.8rem;
		display: grid;
		gap: 0.5rem;
		z-index: 60;
	}
	@media (min-width: 900px) {
		main {
			padding: 1.3rem 1.4rem 1.4rem;
		}
	}
</style>

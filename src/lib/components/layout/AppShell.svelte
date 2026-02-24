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
		--goal-item: #d8b44a;
		--goal-quest: #4f8de3;
		--goal-skill: #41b672;
		--goal-complete: #41b672;
		--surface-0: #12100e;
		--surface-1: #1b1916;
		--surface-2: #25221d;
		--surface-3: #322d26;
		--text-1: #f2eee9;
		--text-2: #b3a89b;
		--border: #4a4034;
		--focus: #e6c16f;
		--font-heading: 'Cinzel', 'Georgia', serif;
		--font-body: 'Source Sans 3', 'Verdana', sans-serif;
		--shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.32);
	}
	:global(body) {
		font-family: var(--font-body);
		margin: 0;
		background: linear-gradient(180deg, color-mix(in oklab, var(--surface-0), #191512 6%), var(--surface-0));
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
		letter-spacing: 0.02em;
	}
	:global(*:focus-visible) {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
		border-radius: 0.18rem;
	}
	.shell {
		display: flex;
		min-height: 100vh;
	}
	main {
		flex: 1;
		padding: 1rem 1rem 4.75rem;
		max-width: 1100px;
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

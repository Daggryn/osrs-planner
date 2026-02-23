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
		--surface-1: #12161d;
		--surface-2: #1a202b;
		--text-1: #f4f6f8;
		--text-2: #a3acb8;
		--border: #293241;
	}
	:global(body) {
		font-family: 'Space Grotesk', 'IBM Plex Sans', 'Segoe UI', sans-serif;
		margin: 0;
		background:
			radial-gradient(circle at 80% 10%, #1f2d3f 0%, transparent 35%),
			radial-gradient(circle at 10% 20%, #1f202d 0%, transparent 30%),
			#0b1017;
		color: var(--text-1);
	}
	.shell {
		display: flex;
		min-height: 100vh;
	}
	main {
		flex: 1;
		padding: 1rem 1rem 4.75rem;
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
			padding: 1.2rem 1.2rem 1.2rem;
		}
	}
</style>


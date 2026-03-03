<script lang="ts">
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';

	$: planner = $plannerStore;
	$: questGoals = planner.questGoals;
</script>

<section class="page">
	<header>
		<h2>Quest Goals</h2>
		<p>Each quest card shows direct requirements, cascaded prerequisite quests, and merged skill levels.</p>
	</header>

	<section>
		<h3>Main goals</h3>
		<div class="cards">
			{#if questGoals.length === 0}
				<p class="muted">No quest goals yet.</p>
			{/if}
			{#each questGoals as goal (goal.id)}
				<GoalCard goal={goal} />
			{/each}
		</div>
	</section>
</section>

<style>
	.page {
		display: grid;
		gap: 0.95rem;
	}
	header h2,
	h3 {
		margin: 0;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.cards {
		display: grid;
		gap: 0.65rem;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
</style>

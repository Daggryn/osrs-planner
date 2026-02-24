<script lang="ts">
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { skillProgress } from '$lib/stores/selectors';

	$: planner = $plannerStore;
	$: goals = planner.skillGoals.map((goal) => ({ ...goal, progressPct: skillProgress(goal) }));
</script>

<section class="page">
	<header>
		<h2>Skill Goals</h2>
		<p>Track each skill milestone from your start level to your target.</p>
	</header>

	<div class="cards">
		{#if goals.length === 0}
			<p class="muted">No skill goals yet.</p>
		{/if}
		{#each goals as goal (goal.id)}
			<GoalCard goal={goal} />
		{/each}
	</div>
</section>

<style>
	.page {
		display: grid;
		gap: 1rem;
	}
	header h2 {
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

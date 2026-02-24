<script lang="ts">
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';

	$: planner = $plannerStore;
	$: questGoals = planner.questGoals;
	$: subGoalRows = questGoals.flatMap((goal) =>
		(goal.subGoals ?? []).map((sub) => ({
			...sub,
			mainGoalTitle: goal.title
		}))
	);
</script>

<section class="page">
	<header>
		<h2>Quest Goals</h2>
		<p>Quest requirements are fetched and shown as sub-goals under each main quest goal.</p>
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

	<section>
		<h3>Requirement sub-goals</h3>
		<div class="subgoals">
			{#if subGoalRows.length === 0}
				<p class="muted">No requirement sub-goals yet.</p>
			{/if}
			{#each subGoalRows as sub (sub.id)}
				<article class="subgoal {sub.completed ? 'done' : ''}">
					<p class="label">{sub.label}</p>
					<div class="meta">
						<span class="kind">{sub.kind === 'skill_requirement' ? 'Skill req' : 'Quest req'}</span>
						<span class="tag">for {sub.mainGoalTitle}</span>
					</div>
				</article>
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
	.subgoals {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
	}
	.subgoal {
		border: 1px dashed color-mix(in oklab, var(--goal-quest), var(--border) 45%);
		background: linear-gradient(160deg, var(--surface-2), var(--surface-1));
		border-radius: var(--radius-card);
		padding: 0.55rem;
		display: grid;
		gap: 0.35rem;
	}
	.subgoal.done {
		opacity: 0.78;
	}
	.label {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 0.9rem;
	}
	.meta {
		display: flex;
		justify-content: space-between;
		gap: 0.45rem;
		align-items: center;
		font-size: 0.72rem;
	}
	.kind {
		color: var(--text-2);
	}
	.tag {
		color: var(--text-1);
		border: 1px solid var(--border);
		padding: 0.06rem 0.3rem;
		border-radius: var(--radius-button);
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
</style>

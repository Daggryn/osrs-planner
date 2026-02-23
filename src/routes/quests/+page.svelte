<section class="page">
	<header>
		<h2>Quest Goals</h2>
		<p>Quest progress will be API-synced and dependency-aware in a later phase.</p>
	</header>
	<article>
		<h3>Planned in next phase</h3>
		<ul>
			<li>Auto-fetch requirements and prerequisite quests</li>
			<li>Sub-goal checklist inside each quest goal card</li>
			<li>Dependency completion rolls up to parent quest progress</li>
		</ul>
	</article>
</section>

<style>
	.page {
		display: grid;
		gap: 0.8rem;
	}
	header h2,
	h3 {
		margin: 0;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	article {
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-left: 4px solid var(--goal-quest);
		border-radius: 0.85rem;
		padding: 0.8rem;
	}
	ul {
		margin: 0.45rem 0 0;
		padding-left: 1rem;
		color: var(--text-2);
	}
</style>


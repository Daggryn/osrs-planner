<section class="page">
	<header>
		<h2>Quest Goals</h2>
		<p>Quest progress will be API-synced and dependency-aware in a later phase.</p>
	</header>
	<div class="hybrid">
		<article class="preview">
			<p class="eyebrow">Preview card</p>
			<h3>Song of the Elves</h3>
			<div class="bar"><span style="width: 62%"></span></div>
			<ul>
				<li>✓ Mourning's End Part II</li>
				<li>• 70 Agility</li>
			</ul>
		</article>
		<article class="roadmap">
			<h3>Planned in next phase</h3>
			<ul>
				<li>Auto-fetch requirements and prerequisite quests</li>
				<li>Sub-goal checklist inside each quest goal card</li>
				<li>Dependency completion rolls up to parent quest progress</li>
			</ul>
		</article>
	</div>
</section>

<style>
	.page {
		display: grid;
		gap: 1rem;
	}
	header h2,
	h3 {
		margin: 0;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
		max-width: 56ch;
	}
	.hybrid {
		display: grid;
		gap: 0.8rem;
	}
	article {
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 0.9rem;
		padding: 0.85rem;
	}
	.preview {
		border-left: 4px solid var(--goal-quest);
	}
	.eyebrow {
		margin: 0;
		color: var(--text-2);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		font-size: 0.67rem;
	}
	.preview h3 {
		margin-top: 0.25rem;
	}
	.bar {
		margin-top: 0.55rem;
		height: 0.45rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		overflow: hidden;
		background: #0f1520;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--goal-quest);
	}
	.preview ul {
		margin-top: 0.65rem;
	}
	.roadmap {
		border-left: 4px solid color-mix(in oklab, var(--goal-quest), var(--border) 38%);
	}
	ul {
		margin: 0.45rem 0 0;
		padding-left: 1rem;
		color: var(--text-2);
	}
	@media (min-width: 900px) {
		.hybrid {
			grid-template-columns: 1fr 1.1fr;
		}
	}
</style>

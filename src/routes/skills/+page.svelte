<section class="page">
	<header>
		<h2>Skill Goals</h2>
		<p>Skill milestones will be tracked via synced levels and progression history.</p>
	</header>
	<div class="hybrid">
		<article class="preview">
			<p class="eyebrow">Preview card</p>
			<h3>Slayer 87</h3>
			<div class="bar"><span style="width: 81%"></span></div>
			<p class="level">Current: 71 | Target: 87</p>
		</article>
		<article class="roadmap">
			<h3>Planned in next phase</h3>
			<ul>
				<li>API-driven level syncing for active milestones</li>
				<li>Progress forecasting to target levels</li>
				<li>Skill milestone links to quest dependencies</li>
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
		border-left: 4px solid var(--goal-skill);
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
		background: var(--goal-skill);
	}
	.level {
		margin: 0.55rem 0 0;
		color: var(--text-2);
	}
	.roadmap {
		border-left: 4px solid color-mix(in oklab, var(--goal-skill), var(--border) 38%);
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

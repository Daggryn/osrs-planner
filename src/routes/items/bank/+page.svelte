<script lang="ts">
	import { onMount } from 'svelte';
	import TypeaheadItemSearch from '$lib/components/items/TypeaheadItemSearch.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { sessionStore } from '$lib/stores/sessionStore';
	import { priceStore } from '$lib/stores/priceStore';
	import { bankValue, formatGp } from '$lib/stores/selectors';
	import type { CatalogItem } from '$lib/domain/types';

	let goldInput: HTMLInputElement | undefined;
	let draftGoldInput = '0';
	let isGoldEditing = false;

	$: planner = $plannerStore;
	$: queue = $sessionStore.reconciliationQueue;
	$: total = bankValue(planner.gold, planner.bankItems, $priceStore.items);
	$: if (!isGoldEditing) draftGoldInput = planner.gold.toString();

	let timer: ReturnType<typeof setInterval> | undefined;
	onMount(() => {
		goldInput?.focus();
		refresh();
		timer = setInterval(refresh, 60000);
		return () => {
			if (timer) clearInterval(timer);
		};
	});

	async function refresh() {
		const ids = planner.bankItems.map((i) => i.itemId);
		const latest = await priceStore.refresh(ids);
		plannerStore.updateItemPrices(latest);
	}

	function parseGoldInput(raw: string) {
		const normalized = raw.trim().toLowerCase().replace(/,/g, '');
		const match = normalized.match(/^(\d+(?:\.\d+)?)([kmb])?$/);
		if (!match) return planner.gold;
		const base = Number(match[1]);
		if (!Number.isFinite(base)) return planner.gold;
		const multiplier = match[2] === 'k' ? 1_000 : match[2] === 'm' ? 1_000_000 : match[2] === 'b' ? 1_000_000_000 : 1;
		return Math.max(0, Math.floor(base * multiplier));
	}

	function saveGold() {
		const parsed = parseGoldInput(draftGoldInput);
		plannerStore.setGold(parsed);
		draftGoldInput = parsed.toString();
	}

	function addBankItem(e: CustomEvent<CatalogItem>) {
		plannerStore.addBankItem({ itemId: e.detail.itemId, name: e.detail.name, imageUrl: e.detail.imageUrl }, 1);
	}

	function addFromQueue(item: (typeof queue)[number]) {
		plannerStore.addBankItem({ itemId: item.itemId, name: item.name, imageUrl: item.iconUrl }, 1);
		sessionStore.dismissReconciliationItem(item.goalId);
	}

	function unitPrice(itemId: number) {
		const live = $priceStore.items[itemId];
		return live?.current ?? live?.lastKnown ?? planner.bankItems.find((x) => x.itemId === itemId)?.currentPrice ?? 0;
	}
</script>

<section class="page">
	<header>
		<h2>Bank</h2>
		<p>Set your gold and list items you would sell to fund goals.</p>
	</header>

	<section class="panel gold">
		<div class="step-head">
			<span>Step 1</span>
			<label for="gold">Update gold</label>
		</div>
		<input
			bind:this={goldInput}
			id="gold"
			type="text"
			inputmode="decimal"
			bind:value={draftGoldInput}
			on:focus={() => (isGoldEditing = true)}
			on:keydown={(e) => e.key === 'Enter' && goldInput?.blur()}
			on:blur={() => {
				isGoldEditing = false;
				saveGold();
			}}
		/>
		<p>Total available gp: {formatGp(total)}</p>
	</section>

	{#if queue.length > 0}
		<section class="panel queue">
			<div class="step-head">
				<span>Step 2</span>
				<h3>Recent item goals achieved</h3>
			</div>
			<p>Add items you are willing to sell. Added items are counted toward available gp.</p>
			<div class="queue-items">
				{#each queue as item (item.goalId)}
					<article>
						<strong>{item.name}</strong>
						<div class="actions">
							<button on:click={() => addFromQueue(item)}>Add to Bank</button>
							<button class="ghost" on:click={() => sessionStore.dismissReconciliationItem(item.goalId)}
								>Dismiss</button
							>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	<section class="panel">
		<h3>Add bank item</h3>
		<TypeaheadItemSearch placeholder="Search and add bank item..." on:select={addBankItem} />
	</section>

	<section class="panel">
		<h3>Sellable items</h3>
		{#if planner.bankItems.length === 0}
			<p class="muted">No sellable items added.</p>
		{:else}
			<div class="bank-items">
				{#each planner.bankItems as item (item.itemId)}
					<article>
						<div class="item-head">
							<img src={item.imageUrl ?? '/icons/item-placeholder.svg'} alt="" on:error={(e) => ((e.currentTarget as HTMLImageElement).src = '/icons/item-placeholder.svg')} />
							<strong>{item.name}</strong>
						</div>
						<p class="price">GE: {formatGp(unitPrice(item.itemId))}</p>
						<p class="price">Total: {formatGp(unitPrice(item.itemId) * item.quantity)}</p>
						<div class="item-controls">
							<label>
								Qty
								<input
									type="number"
									min="1"
									step="1"
									value={item.quantity}
									on:change={(e) =>
										plannerStore.setBankItemQuantity(item.itemId, Number((e.target as HTMLInputElement).value))}
								/>
							</label>
							<button class="ghost danger" on:click={() => plannerStore.removeBankItem(item.itemId)}>
								Remove
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>

<style>
	.page {
		display: grid;
		gap: 1rem;
	}
	header h2 {
		margin: 0;
		font-size: 1.42rem;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.panel {
		border: 1px solid var(--border);
		background: linear-gradient(160deg, var(--surface-2), var(--surface-1));
		border-radius: var(--radius-panel);
		padding: 0.75rem;
		display: grid;
		gap: 0.55rem;
		box-shadow: var(--shadow-hard);
	}
	.step-head {
		display: inline-flex;
		align-items: center;
		gap: 0.52rem;
	}
	.step-head span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.5rem;
		height: 1.25rem;
		padding: 0 0.35rem;
		border-radius: 4px;
		font-size: 0.66rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		border: 1px solid var(--border);
		color: var(--text-2);
	}
	.gold input {
		width: 16rem;
		max-width: 100%;
	}
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	input {
		padding: 0.5rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-input);
		background: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-body);
	}
	button {
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-1);
		padding: 0.45rem 0.65rem;
		border-radius: var(--radius-button);
		cursor: pointer;
		font-family: var(--font-heading);
	}
	button.ghost {
		background: transparent;
	}
	button.danger {
		color: #f1a5a5;
	}
	.queue {
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 55%);
	}
	.queue-items {
		display: grid;
		gap: 0.45rem;
	}
	.actions {
		display: inline-flex;
		gap: 0.4rem;
	}
	.queue-items article,
	.bank-items article {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		padding: 0.6rem;
		background: linear-gradient(160deg, var(--surface-2), var(--surface-1));
	}
	.bank-items {
		display: grid;
		gap: 0.65rem;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}
	.item-head {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-family: var(--font-heading);
	}
	.item-head img {
		width: 1.15rem;
		height: 1.15rem;
		object-fit: contain;
	}
	.item-controls {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.5rem;
	}
	label {
		display: grid;
		gap: 0.22rem;
		font-size: 0.72rem;
		color: var(--text-2);
	}
	.item-controls input {
		width: 5rem;
	}
	.item-controls input[type='number'] {
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.item-controls input[type='number']::-webkit-outer-spin-button,
	.item-controls input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.price {
		margin: 0;
		font-size: 0.78rem;
		color: var(--text-2);
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
	@media (max-width: 640px) {
		.item-controls {
			width: 100%;
		}
	}
</style>

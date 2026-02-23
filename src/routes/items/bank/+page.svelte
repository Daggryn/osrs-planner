<script lang="ts">
	import { onMount } from 'svelte';
	import TypeaheadItemSearch from '$lib/components/items/TypeaheadItemSearch.svelte';
	import { plannerStore } from '$lib/stores/plannerStore';
	import { sessionStore } from '$lib/stores/sessionStore';
	import { feedbackStore } from '$lib/stores/feedbackStore';
	import { priceStore } from '$lib/stores/priceStore';
	import { bankValue } from '$lib/stores/selectors';
	import type { CatalogItem } from '$lib/domain/types';

	let goldInput: HTMLInputElement | undefined;
	let draftGold = 0;

	$: planner = $plannerStore;
	$: queue = $sessionStore.reconciliationQueue;
	$: draftGold = planner.gold;
	$: total = bankValue(planner.gold, planner.bankItems, $priceStore.items);

	function saveGold() {
		plannerStore.setGold(draftGold);
	}

	function addBankItem(e: CustomEvent<CatalogItem>) {
		plannerStore.addBankItem({ itemId: e.detail.itemId, name: e.detail.name, iconUrl: e.detail.icon }, 1);
		feedbackStore.push({ title: 'Goal achieved', goalName: `${e.detail.name} banked`, goalType: 'item' });
	}

	function addFromQueue(item: (typeof queue)[number]) {
		plannerStore.addBankItem({ itemId: item.itemId, name: item.name, iconUrl: item.iconUrl }, 1);
		sessionStore.dismissReconciliationItem(item.goalId);
		feedbackStore.push({ title: 'Goal achieved', goalName: `${item.name} reconciled`, goalType: 'item' });
	}

	onMount(() => {
		goldInput?.focus();
	});
</script>

<section class="page">
	<header>
		<h2>Bank</h2>
		<p>Gold is your source of truth. Bank items count as assets you are willing to sell.</p>
	</header>

	<section class="panel gold">
		<label for="gold">Gold</label>
		<input
			bind:this={goldInput}
			id="gold"
			type="number"
			min="0"
			step="1"
			bind:value={draftGold}
			on:blur={saveGold}
		/>
		<p>Total purchasing power: {total.toLocaleString()} gp</p>
	</section>

	{#if queue.length > 0}
		<section class="panel queue">
			<h3>Recent item goals achieved</h3>
			<p>Add any items you are willing to sell. Added items are counted toward purchasing power.</p>
			<div class="queue-items">
				{#each queue as item (item.goalId)}
					<article>
						<strong>{item.iconUrl ?? ''} {item.name}</strong>
						<div>
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
		<h3>Liquid assets</h3>
		{#if planner.bankItems.length === 0}
			<p class="muted">No liquid assets added.</p>
		{:else}
			<div class="bank-items">
				{#each planner.bankItems as item (item.itemId)}
					<article>
						<div>
							<strong>{item.iconUrl ?? ''} {item.name}</strong>
							<p>Qty</p>
							<input
								type="number"
								min="1"
								step="1"
								value={item.quantity}
								on:change={(e) =>
									plannerStore.setBankItemQuantity(item.itemId, Number((e.target as HTMLInputElement).value))}
							/>
						</div>
						<button class="ghost danger" on:click={() => plannerStore.removeBankItem(item.itemId)}>
							Remove
						</button>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>

<style>
	.page {
		display: grid;
		gap: 0.9rem;
	}
	header h2 {
		margin: 0;
	}
	header p {
		margin: 0.2rem 0 0;
		color: var(--text-2);
	}
	.panel {
		border: 1px solid var(--border);
		background: var(--surface-2);
		border-radius: 0.85rem;
		padding: 0.8rem;
		display: grid;
		gap: 0.55rem;
	}
	.gold input {
		width: 14rem;
		max-width: 100%;
	}
	h3 {
		margin: 0;
	}
	input {
		padding: 0.5rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: 0.55rem;
		background: #101722;
		color: var(--text-1);
	}
	button {
		border: 1px solid var(--border);
		background: #1f2735;
		color: var(--text-1);
		padding: 0.45rem 0.65rem;
		border-radius: 0.55rem;
		cursor: pointer;
	}
	button.ghost {
		background: transparent;
	}
	button.danger {
		color: #f1a5a5;
	}
	.queue {
		border-color: color-mix(in oklab, var(--goal-item), var(--border) 45%);
	}
	.queue-items {
		display: grid;
		gap: 0.45rem;
	}
	.queue-items article,
	.bank-items article {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		padding: 0.55rem;
		background: #121a24;
	}
	.bank-items {
		display: grid;
		gap: 0.55rem;
	}
	.bank-items p {
		margin: 0.3rem 0 0.1rem;
		color: var(--text-2);
		font-size: 0.72rem;
	}
	.bank-items input {
		width: 5rem;
	}
	.muted {
		margin: 0;
		color: var(--text-2);
	}
</style>

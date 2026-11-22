<script lang="ts">
  // Pick a formation, see its slots by importance, and open a slot for its reference and candidates.
  import { formatMoney, move } from '@milk/core/util';
  import { FORMATIONS, defaultOrder, formationById } from '../data/formations';
  import { planFor, slotOrder, slotPlan, tacticsFor, type Career } from '../model';
  import Pitch from '../ui/Pitch.svelte';
  import SlotSheet from '../ui/SlotSheet.svelte';
  import TacticsSheet from '../ui/TacticsSheet.svelte';

  let { career }: { career: Career } = $props();

  const f = $derived(formationById(career.formation) ?? FORMATIONS[0]);
  const plan = $derived(career.plans[f.id]);
  const order = $derived(slotOrder(career, f.id));
  const rank = $derived(Object.fromEntries(order.map((i, k) => [i, k + 1])) as Record<number, number>);
  const playerName = (id: string | undefined) => career.players.find((p) => p.id === id)?.name;
  const names = $derived(Object.fromEntries(f.slots.map((s) => [s.i, playerName(plan?.slots[s.i]?.players[0])])) as Record<number, string | undefined>);
  const budgetTotal = $derived(Object.values(plan?.slots ?? {}).reduce((sum, s) => sum + (s.budget ?? 0), 0));
  const tactics = $derived(tacticsFor(career, f.id));
  const customOrder = $derived(!!plan?.order && order.join() !== defaultOrder(f).join());

  let open = $state<number>();
  let editTactics = $state(false);
  let reorder = $state(false);

  function pick(i: number) {
    slotPlan(career, f.id, i);
    open = i;
  }

  function moveSlot(k: number, dir: -1 | 1) {
    const o = [...order];
    move(o, k, k + dir);
    planFor(career, f.id).order = o;
  }

  function roleOf(i: number) {
    const s = plan?.slots[i];
    const slot = f.slots[i];
    return { role: s?.role ?? slot.role, focus: s?.focus ?? (s?.role && s.role !== slot.role ? undefined : slot.focus) };
  }

  /** A formation counts as planned once it has players, budgets, notes, a changed role or order, or tactics. */
  function inUse(id: string): boolean {
    const p = career.plans[id];
    return !!p && (!!p.tactics || !!p.order || Object.values(p.slots).some((s) => s.players.length || s.budget !== undefined || s.notes || s.role));
  }

  const groups = [3, 4, 5].map((back) => ({ back, list: FORMATIONS.filter((x) => x.back === back) }));
</script>

<div class="row head">
  <h2 class="grow">Formation</h2>
  <select class="pick" bind:value={career.formation} aria-label="Formation">
    {#each groups as g (g.back)}
      <optgroup label="Back {g.back}">
        {#each g.list as x (x.id)}<option value={x.id}>{x.name}{inUse(x.id) ? ' •' : ''}</option>{/each}
      </optgroup>
    {/each}
  </select>
</div>

<div class="panel about small">
  <p>{f.style}</p>
  <p><strong class="good">+</strong> {f.strengths}</p>
  <p><strong class="bad">−</strong> {f.weaknesses}</p>
</div>

<div class="layout">
  <div>
    <Pitch formation={f} {names} {rank} onpick={pick} />
    <p class="muted small center">Tap a position for its reference and your candidates. Green rings = top 3 slots.</p>
  </div>

  <div class="stack">
    <section class="panel">
      <div class="row">
        <h3 class="grow">By importance</h3>
        {#if customOrder}<button class="ghost small" onclick={() => (planFor(career, f.id).order = undefined)}>Reset order</button>{/if}
        <button class="ghost small" onclick={() => (reorder = !reorder)}>{reorder ? 'Done' : 'Reorder'}</button>
      </div>
      {#each order as i, k (i)}
        {@const s = f.slots[i]}
        {@const r = roleOf(i)}
        {@const sp = plan?.slots[i]}
        <div class="srow">
          <span class="n">{k + 1}</span>
          <button class="ghost grow body" onclick={() => pick(i)}>
            <span><strong>{s.label}</strong> <span class="muted">· {r.role}{r.focus ? ` (${r.focus})` : ''}</span></span>
            <span class="muted small">
              {sp?.players.length ? `${playerName(sp.players[0])}${sp.players.length > 1 ? ` +${sp.players.length - 1}` : ''}` : 'No candidates'}{sp?.budget !== undefined ? ` · budget ${formatMoney(sp.budget, career.currency)}` : ''}
            </span>
          </button>
          {#if reorder}
            <button class="ghost icon" aria-label="Move up" disabled={k === 0} onclick={() => moveSlot(k, -1)}>▲</button>
            <button class="ghost icon" aria-label="Move down" disabled={k === order.length - 1} onclick={() => moveSlot(k, 1)}>▼</button>
          {/if}
        </div>
      {/each}
      {#if budgetTotal > 0}
        <p class="small budget">
          Slot budgets: <strong>{formatMoney(budgetTotal, career.currency)}</strong>
          {#if career.transferBudget}
            of {formatMoney(career.transferBudget, career.currency)} transfer budget
            {#if budgetTotal > career.transferBudget}<span class="bad"> · {formatMoney(budgetTotal - career.transferBudget, career.currency)} over</span>{/if}
          {/if}
        </p>
      {/if}
    </section>

    <section class="panel">
      <div class="row">
        <h3 class="grow">Tactics</h3>
        <button class="small" onclick={() => (editTactics = true)}>Edit</button>
      </div>
      <dl class="small">
        <dt>Build-up</dt><dd>{tactics.buildUp}</dd>
        <dt>Defence</dt><dd>{tactics.defence}</dd>
        {#if tactics.lineHeight !== undefined}<dt>Line height</dt><dd>{tactics.lineHeight}</dd>{/if}
      </dl>
      {#if tactics.instructions}<p class="small pre">{tactics.instructions}</p>{/if}
      {#if tactics.notes}<p class="small muted pre">{tactics.notes}</p>{/if}
      {#if !plan?.tactics}<p class="small muted">Suggested starting point. Edit to make it yours.</p>{/if}
    </section>
  </div>
</div>

{#if open !== undefined}
  <SlotSheet {career} formation={f} index={open} rank={rank[open]} onclose={() => (open = undefined)} />
{/if}
{#if editTactics}<TacticsSheet {career} formation={f} onclose={() => (editTactics = false)} />{/if}

<style>
  .pick {
    width: auto;
    font-weight: 700;
  }
  .about {
    margin: 10px 0;
  }
  .about p {
    margin: 2px 0;
  }
  .good {
    color: var(--ok);
  }
  .bad {
    color: var(--warning);
  }
  .layout {
    display: grid;
    gap: 14px;
  }
  @media (min-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
    }
  }
  .center {
    text-align: center;
  }
  section {
    padding: 8px 8px 6px 12px;
  }
  .srow {
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 1px solid var(--line);
  }
  .srow:first-of-type {
    border-top: none;
  }
  .n {
    width: 22px;
    text-align: center;
    color: var(--muted);
    font-weight: 700;
  }
  .body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 7px 4px;
  }
  .budget {
    margin: 8px 0 2px;
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 12px;
    margin: 6px 0;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }
  .pre {
    white-space: pre-wrap;
    margin: 6px 0 0;
  }
</style>

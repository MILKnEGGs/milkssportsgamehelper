<script lang="ts">
  // Everyone you've noted: signing targets (in priority order), the watchlist, and the rest.
  import { formatMoney } from '@milk/core/util';
  import { POSITION_ORDER, type Pos } from '../data/positions';
  import { TARGET_STATUSES, byPriority, newPlayer, nudge, type Career, type Player, type PlayerStatus } from '../model';
  import PlayerRow from '../ui/PlayerRow.svelte';
  import PlayerSheet from '../ui/PlayerSheet.svelte';
  import PriorityPill from '../ui/PriorityPill.svelte';

  let { career }: { career: Career } = $props();

  type View = 'targets' | PlayerStatus | 'all';
  let view = $state<View>('targets');
  let pos = $state<Pos | ''>('');
  let q = $state('');
  let editing = $state<Player>();

  const VIEWS: [View, string][] = [
    ['targets', 'Targets'],
    ['watching', 'Watchlist'],
    ['signed', 'Signed'],
    ['passed', 'Passed on'],
    ['all', 'All'],
  ];

  const list = $derived.by(() => {
    const needle = q.trim().toLowerCase();
    const l = career.players.filter(
      (p) =>
        (view === 'all' || (view === 'targets' ? TARGET_STATUSES.includes(p.status) : p.status === view)) &&
        (!pos || p.pos === pos || p.altPos?.includes(pos)) &&
        (!needle || p.name.toLowerCase().includes(needle) || p.club?.toLowerCase().includes(needle) || p.notes?.toLowerCase().includes(needle)),
    );
    return view === 'targets' ? l.sort(byPriority) : l.sort((a, b) => b.added.localeCompare(a.added));
  });

  const totalValue = $derived(list.reduce((s, p) => s + (p.value ?? 0), 0));

  function add() {
    const status: PlayerStatus = view === 'targets' ? 'target' : view === 'all' ? 'watching' : view;
    editing = newPlayer(career, '', pos || 'ST', { status });
  }
</script>

<div class="row head">
  <h2 class="grow">Players</h2>
  <button class="primary" onclick={add}>+ Player</button>
</div>

<div class="row wrap filters">
  {#each VIEWS as [id, label] (id)}
    <button class="chip {view === id ? 'on' : ''}" onclick={() => (view = id)}>{label}</button>
  {/each}
</div>
<div class="row filters">
  <input class="grow" type="search" placeholder="Search name, club, notes" bind:value={q} />
  <select bind:value={pos} class="pos">
    <option value="">Any pos</option>
    {#each POSITION_ORDER as p (p)}<option value={p}>{p}</option>{/each}
  </select>
</div>

{#if view === 'targets' && totalValue > 0}
  <p class="muted small">Total value of these targets: <strong>{formatMoney(totalValue, career.currency)}</strong>{#if career.transferBudget} of {formatMoney(career.transferBudget, career.currency)} budget{/if}</p>
{/if}

{#if !list.length}
  <div class="empty panel">
    {#if career.players.length}No players match.{:else}No players yet. Add anyone you want to remember: just a name and position is enough.{/if}
  </div>
{:else}
  <div class="panel list">
    {#each list as p, k (p.id)}
      <div class="item">
        <div class="grow"><PlayerRow player={p} currency={career.currency} showStatus={view === 'all' || view === 'targets'} onclick={() => (editing = p)} /></div>
        {#if view === 'targets'}
          <PriorityPill priority={p.priority} />
          <button class="ghost icon" aria-label="Move up" disabled={k === 0} onclick={() => nudge(list, k, -1)}>▲</button>
          <button class="ghost icon" aria-label="Move down" disabled={k === list.length - 1} onclick={() => nudge(list, k, 1)}>▼</button>
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if editing}<PlayerSheet {career} player={editing} onclose={() => (editing = undefined)} />{/if}

<style>
  .filters {
    margin: 8px 0 0;
  }
  .pos {
    width: auto;
  }
  .list {
    margin-top: 12px;
    padding: 2px 8px 2px 12px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 4px;
    border-top: 1px solid var(--line);
  }
  .item:first-child {
    border-top: none;
  }
</style>

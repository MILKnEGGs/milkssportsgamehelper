<script lang="ts">
  // Goals and signing targets together, most important first. ▲▼ reorder inside a priority level;
  // the order is shared with the Goals and Players tabs.
  import { formatMoney } from '@milk/core/util';
  import { GOAL_CATEGORIES, PRIORITIES, PRIORITY_LABEL, newGoal, newPlayer, nudge, priorityList, type Career, type Goal, type Player } from '../model';
  import GoalSheet from '../ui/GoalSheet.svelte';
  import PlayerSheet from '../ui/PlayerSheet.svelte';

  let { career }: { career: Career } = $props();

  let goal = $state<Goal>();
  let player = $state<Player>();

  const list = $derived(priorityList(career));
  const groups = $derived(PRIORITIES.map((p) => ({ p, items: list.filter((x) => (x.item.priority ?? 'medium') === p) })).filter((g) => g.items.length));

  function move(item: Goal | Player, dir: -1 | 1) {
    const flat = list.map((x) => x.item);
    nudge(flat, flat.indexOf(item), dir);
  }

  function sub(x: (typeof list)[number]): string {
    if (x.kind === 'goal') {
      const g = x.item;
      return [g.kind === 'board' ? 'Board' : 'Mine', GOAL_CATEGORIES.find((c) => c.id === g.category)?.label, g.season, g.progress].filter(Boolean).join(' · ');
    }
    const p = x.item;
    return [p.pos, p.age !== undefined ? `${p.age}y` : '', p.ovr !== undefined ? `${p.ovr} OVR` : '', formatMoney(p.value, career.currency), p.status === 'negotiating' ? 'Negotiating' : '']
      .filter(Boolean)
      .join(' · ');
  }
</script>

<div class="row head">
  <h2 class="grow">Priorities</h2>
  <button onclick={() => (goal = newGoal(career, '', { priority: 'high' }))}>+ Goal</button>
  <button onclick={() => (player = newPlayer(career, '', 'ST', { status: 'target', priority: 'high' }))}>+ Target</button>
</div>
<p class="muted small">Open goals and signing targets in one list. ▲▼ moves an item within its priority.</p>

{#if !list.length}
  <div class="empty panel">Nothing here yet. Add your board objectives and signing targets and they'll line up by importance.</div>
{/if}

{#each groups as g (g.p)}
  <section class="panel">
    <h3 class="lvl {g.p}">{PRIORITY_LABEL[g.p]}</h3>
    {#each g.items as x, k (x.item.id)}
      <div class="item">
        <span class="kind" title={x.kind === 'goal' ? 'Goal' : 'Signing target'}>{x.kind === 'goal' ? '🎯' : '✍️'}</span>
        <button class="ghost grow body" onclick={() => (x.kind === 'goal' ? (goal = x.item) : (player = x.item))}>
          <span class="title">{x.kind === 'goal' ? x.item.title : x.item.name}</span>
          <span class="muted small">{sub(x)}</span>
        </button>
        <button class="ghost icon" aria-label="Move up" disabled={k === 0} onclick={() => move(x.item, -1)}>▲</button>
        <button class="ghost icon" aria-label="Move down" disabled={k === g.items.length - 1} onclick={() => move(x.item, 1)}>▼</button>
      </div>
    {/each}
  </section>
{/each}

{#if goal}<GoalSheet {career} {goal} onclose={() => (goal = undefined)} />{/if}
{#if player}<PlayerSheet {career} {player} onclose={() => (player = undefined)} />{/if}

<style>
  .head {
    margin-bottom: 2px;
  }
  section {
    margin-top: 12px;
    padding: 8px 8px 4px 12px;
  }
  .lvl {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 2px 0 4px;
  }
  .lvl.critical {
    color: var(--p-critical);
  }
  .lvl.high {
    color: var(--p-high);
  }
  .lvl.medium {
    color: var(--p-medium);
  }
  .lvl.low {
    color: var(--p-low);
  }
  .item {
    display: flex;
    align-items: center;
    gap: 4px;
    border-top: 1px solid var(--line);
  }
  .item:first-of-type {
    border-top: none;
  }
  .body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 8px 4px;
  }
  .title {
    font-weight: 600;
  }
  .kind {
    width: 22px;
    text-align: center;
  }
</style>

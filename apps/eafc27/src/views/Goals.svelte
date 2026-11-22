<script lang="ts">
  import { GOAL_CATEGORIES, byPriority, newGoal, nudge, type Career, type Goal, type GoalStatus } from '../model';
  import GoalSheet from '../ui/GoalSheet.svelte';
  import PriorityPill from '../ui/PriorityPill.svelte';

  let { career }: { career: Career } = $props();

  let editing = $state<Goal>();
  let show = $state<GoalStatus | 'all'>('open');
  let season = $state<'current' | 'all'>('current');

  const list = $derived(
    career.goals
      .filter((g) => show === 'all' || g.status === show)
      .filter((g) => season === 'all' || !career.season || !g.season || g.season === career.season)
      .sort(byPriority),
  );
  const board = $derived(list.filter((g) => g.kind === 'board'));
  const mine = $derived(list.filter((g) => g.kind === 'personal'));

  function toggleDone(g: Goal) {
    g.status = g.status === 'done' ? 'open' : 'done';
  }
</script>

<div class="row head">
  <h2 class="grow">Goals</h2>
  <button class="primary" onclick={() => (editing = newGoal(career, ''))}>+ Goal</button>
</div>

<div class="row wrap filters">
  {#each [['open', 'Open'], ['done', 'Done'], ['failed', 'Missed'], ['all', 'All']] as [id, label] (id)}
    <button class="chip {show === id ? 'on' : ''}" onclick={() => (show = id as typeof show)}>{label}</button>
  {/each}
  {#if career.season}
    <span class="grow"></span>
    <select bind:value={season} class="season">
      <option value="current">{career.season} + long-term</option>
      <option value="all">All seasons</option>
    </select>
  {/if}
</div>

{#if !list.length}
  <div class="empty panel">No goals to show. Add your board objectives from the game, or goals of your own.</div>
{/if}

{#each [['Board objectives', board], ['My goals', mine]] as [title, goals] (title)}
  {@const gs = goals as Goal[]}
  {#if gs.length}
    <section class="panel">
      <h3>{title}</h3>
      {#each gs as g, k (g.id)}
        <div class="item {g.status}">
          <input type="checkbox" aria-label="Done" checked={g.status === 'done'} onchange={() => toggleDone(g)} />
          <button class="ghost grow body" onclick={() => (editing = g)}>
            <span class="title">{g.title}</span>
            <span class="muted small">
              {[GOAL_CATEGORIES.find((c) => c.id === g.category)?.label, g.season ?? 'Long-term', g.progress, g.status === 'failed' ? 'Missed' : ''].filter(Boolean).join(' · ')}
            </span>
          </button>
          <PriorityPill priority={g.priority} />
          <button class="ghost icon" aria-label="Move up" disabled={k === 0} onclick={() => nudge(gs, k, -1)}>▲</button>
          <button class="ghost icon" aria-label="Move down" disabled={k === gs.length - 1} onclick={() => nudge(gs, k, 1)}>▼</button>
        </div>
      {/each}
    </section>
  {/if}
{/each}

{#if editing}<GoalSheet {career} goal={editing} onclose={() => (editing = undefined)} />{/if}

<style>
  .filters {
    margin: 8px 0 4px;
  }
  .season {
    width: auto;
  }
  section {
    margin-top: 12px;
    padding: 8px 8px 4px 12px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 1px solid var(--line);
  }
  .item input {
    width: 20px;
    height: 20px;
    flex: none;
  }
  .item.done .title {
    text-decoration: line-through;
    color: var(--muted);
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
</style>

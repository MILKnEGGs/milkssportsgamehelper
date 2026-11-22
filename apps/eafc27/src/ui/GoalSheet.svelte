<script lang="ts">
  import { focusIf } from '@milk/core/util';
  import Sheet from '@milk/core/Sheet.svelte';
  import { GOAL_CATEGORIES, type Career, type Goal } from '../model';
  import PrioritySelect from './PrioritySelect.svelte';

  let { career, goal, onclose }: { career: Career; goal: Goal; onclose: () => void } = $props();

  // svelte-ignore state_referenced_locally
  const isNew = !career.goals.some((g) => g.id === goal.id);
  // Built here, not inline in the markup: an import used only inside {@attach} gets dropped by the TS step.
  const focusNew = focusIf(isNew);
  // svelte-ignore state_referenced_locally
  let d = $state<Goal>(JSON.parse(JSON.stringify(goal)));

  function save() {
    if (!d.title.trim()) return;
    d.title = d.title.trim();
    const k = career.goals.findIndex((g) => g.id === d.id);
    if (k >= 0) career.goals[k] = d;
    else career.goals.push(d);
    onclose();
  }

  function del() {
    if (!confirm(`Delete "${d.title}"?`)) return;
    career.goals = career.goals.filter((g) => g.id !== d.id);
    onclose();
  }
</script>

<Sheet title={isNew ? 'Add goal' : 'Edit goal'} {onclose}>
  <form class="stack" onsubmit={(e) => (e.preventDefault(), save())}>
    <label class="field">
      <span>Goal</span>
      <input bind:value={d.title} placeholder="e.g. Finish top 4, sign a homegrown CB" {@attach focusNew} required />
    </label>

    <div class="seg2" role="radiogroup" aria-label="Kind">
      <button type="button" role="radio" aria-checked={d.kind === 'board'} class={d.kind === 'board' ? 'primary' : ''} onclick={() => (d.kind = 'board')}>Board objective</button>
      <button type="button" role="radio" aria-checked={d.kind === 'personal'} class={d.kind === 'personal' ? 'primary' : ''} onclick={() => (d.kind = 'personal')}>My own goal</button>
    </div>

    <PrioritySelect bind:value={d.priority} />

    <div class="grid2">
      <label class="field">
        <span>Category</span>
        <select bind:value={d.category}>
          <option value={undefined}>—</option>
          {#each GOAL_CATEGORIES as c (c.id)}<option value={c.id}>{c.label}</option>{/each}
        </select>
      </label>
      <label class="field">
        <span>Season (blank = long-term)</span>
        <input bind:value={d.season} placeholder={career.season ?? 'e.g. 2026/27'} />
      </label>
    </div>

    <div class="grid2">
      <label class="field">
        <span>Status</span>
        <select bind:value={d.status}>
          <option value="open">Open</option>
          <option value="done">Done</option>
          <option value="failed">Missed</option>
        </select>
      </label>
      <label class="field">
        <span>Progress</span>
        <input bind:value={d.progress} placeholder="e.g. 3rd, 2 pts off" />
      </label>
    </div>

    <label class="field">
      <span>Notes</span>
      <textarea bind:value={d.notes}></textarea>
    </label>

    <div class="row">
      {#if !isNew}<button type="button" class="danger" onclick={del}>Delete</button>{/if}
      <span class="grow"></span>
      <button type="button" onclick={onclose}>Cancel</button>
      <button class="primary" disabled={!d.title.trim()}>Save</button>
    </div>
  </form>
</Sheet>

<style>
  .seg2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
</style>

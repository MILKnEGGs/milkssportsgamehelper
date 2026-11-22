<script lang="ts">
  // Youth academy notes: quick reference while scouting.
  import { newYouth, potential, type Career, type YouthPlayer } from '../model';
  import YouthSheet from '../ui/YouthSheet.svelte';

  let { career }: { career: Career } = $props();

  let editing = $state<YouthPlayer>();
  let sort = $state<'pot' | 'ovr' | 'age' | 'new'>('pot');

  const list = $derived(
    [...career.youth].sort((a, b) => {
      if (sort === 'pot') return (b.potMax ?? b.potMin ?? 0) - (a.potMax ?? a.potMin ?? 0);
      if (sort === 'ovr') return (b.ovr ?? 0) - (a.ovr ?? 0);
      if (sort === 'age') return (a.age ?? 99) - (b.age ?? 99);
      return b.added.localeCompare(a.added);
    }),
  );
</script>

<div class="row head">
  <h2 class="grow">Youth academy</h2>
  <button class="primary" onclick={() => (editing = newYouth(''))}>+ Prospect</button>
</div>

{#if list.length}
  <div class="row filters">
    <span class="muted small grow">{list.length} prospect{list.length === 1 ? '' : 's'}</span>
    <select bind:value={sort} class="sort">
      <option value="pot">Highest potential</option>
      <option value="ovr">Highest OVR</option>
      <option value="age">Youngest</option>
      <option value="new">Newest</option>
    </select>
  </div>
  <div class="panel table">
    <div class="tr th muted small">
      <span>Name</span><span>Pos</span><span>Age</span><span>OVR</span><span>POT</span>
    </div>
    {#each list as y (y.id)}
      <button class="tr" onclick={() => (editing = y)}>
        <span class="name">
          {y.name}
          {#if y.scout || y.notes}<span class="muted small">{[y.scout, y.notes].filter(Boolean).join(' · ')}</span>{/if}
        </span>
        <span>{y.pos ?? ''}</span>
        <span>{y.age ?? ''}</span>
        <span>{y.ovr ?? ''}</span>
        <span class="pot">{potential(y)}</span>
      </button>
    {/each}
  </div>
{:else}
  <div class="empty panel">No prospects yet. Jot down youth players as your scouts find them: name, age, OVR and potential.</div>
{/if}

{#if editing}<YouthSheet {career} youth={editing} onclose={() => (editing = undefined)} />{/if}

<style>
  .filters {
    margin: 8px 0 0;
  }
  .sort {
    width: auto;
  }
  .table {
    margin-top: 10px;
    padding: 4px 10px;
  }
  .tr {
    display: grid;
    grid-template-columns: 1fr 44px 40px 40px 64px;
    gap: 6px;
    align-items: center;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-top: 1px solid var(--line);
    border-radius: 0;
    padding: 9px 0;
  }
  .th {
    border-top: none;
    padding: 4px 0;
  }
  .name {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    min-width: 0;
  }
  .name .small {
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pot {
    color: var(--accent);
    font-weight: 700;
  }
</style>

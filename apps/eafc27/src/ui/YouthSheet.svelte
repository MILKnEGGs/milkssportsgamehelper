<script lang="ts">
  import { focusIf } from '@milk/core/util';
  import Sheet from '@milk/core/Sheet.svelte';
  import type { Career, YouthPlayer } from '../model';
  import NumField from './NumField.svelte';
  import PosSelect from './PosSelect.svelte';

  let { career, youth, onclose }: { career: Career; youth: YouthPlayer; onclose: () => void } = $props();

  // svelte-ignore state_referenced_locally
  const isNew = !career.youth.some((y) => y.id === youth.id);
  // Built here, not inline in the markup: an import used only inside {@attach} gets dropped by the TS step.
  const focusNew = focusIf(isNew);
  // svelte-ignore state_referenced_locally
  let d = $state<YouthPlayer>(JSON.parse(JSON.stringify(youth)));

  function save() {
    if (!d.name.trim()) return;
    d.name = d.name.trim();
    const k = career.youth.findIndex((y) => y.id === d.id);
    if (k >= 0) career.youth[k] = d;
    else career.youth.push(d);
    onclose();
  }

  function del() {
    if (!confirm(`Delete ${d.name}?`)) return;
    career.youth = career.youth.filter((y) => y.id !== d.id);
    onclose();
  }
</script>

<Sheet title={isNew ? 'Add youth prospect' : 'Edit youth prospect'} {onclose}>
  <form class="stack" onsubmit={(e) => (e.preventDefault(), save())}>
    <div class="grid2">
      <label class="field">
        <span>Name</span>
        <input bind:value={d.name} {@attach focusNew} required />
      </label>
      <PosSelect bind:value={d.pos} optional />
    </div>
    <div class="grid2">
      <NumField label="Age" bind:value={d.age} min={12} max={25} />
      <NumField label="Current OVR" bind:value={d.ovr} min={1} max={99} />
    </div>
    <div class="grid2">
      <NumField label="Potential (low)" bind:value={d.potMin} min={1} max={99} />
      <NumField label="Potential (high)" bind:value={d.potMax} min={1} max={99} />
    </div>
    <div class="grid2">
      <label class="field"><span>Nationality</span><input bind:value={d.nation} /></label>
      <label class="field"><span>Scout / region</span><input bind:value={d.scout} placeholder="e.g. Brazil, 3★ scout" /></label>
    </div>
    <label class="field">
      <span>Notes</span>
      <textarea bind:value={d.notes} placeholder="Traits, when to promote, best position…"></textarea>
    </label>
    <div class="row">
      {#if !isNew}<button type="button" class="danger" onclick={del}>Delete</button>{/if}
      <span class="grow"></span>
      <button type="button" onclick={onclose}>Cancel</button>
      <button class="primary" disabled={!d.name.trim()}>Save</button>
    </div>
  </form>
</Sheet>

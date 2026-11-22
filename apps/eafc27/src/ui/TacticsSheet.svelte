<script lang="ts">
  import Sheet from '@milk/core/Sheet.svelte';
  import { BUILD_UP_STYLES, DEFENSIVE_APPROACHES, type Formation } from '../data/formations';
  import { planFor, tacticsFor, type Career } from '../model';
  import NumField from './NumField.svelte';

  let { career, formation, onclose }: { career: Career; formation: Formation; onclose: () => void } = $props();

  // svelte-ignore state_referenced_locally
  let d = $state(JSON.parse(JSON.stringify(tacticsFor(career, formation.id))) as ReturnType<typeof tacticsFor>);

  function save() {
    planFor(career, formation.id).tactics = d;
    onclose();
  }

  function reset() {
    d = { ...formation.tactics, instructions: d.instructions };
  }
</script>

<Sheet title="Tactics · {formation.name}" {onclose}>
  <form class="stack" onsubmit={(e) => (e.preventDefault(), save())}>
    <p class="muted small">A starting point for this shape. Change it to whatever works for your squad.</p>
    <div class="grid2">
      <label class="field">
        <span>Build-up style</span>
        <select bind:value={d.buildUp}>
          {#each BUILD_UP_STYLES as s (s)}<option>{s}</option>{/each}
          {#if !BUILD_UP_STYLES.includes(d.buildUp)}<option>{d.buildUp}</option>{/if}
        </select>
      </label>
      <label class="field">
        <span>Defensive approach</span>
        <select bind:value={d.defence}>
          {#each DEFENSIVE_APPROACHES as s (s)}<option>{s}</option>{/each}
          {#if !DEFENSIVE_APPROACHES.includes(d.defence)}<option>{d.defence}</option>{/if}
        </select>
      </label>
    </div>
    <div class="grid2">
      <NumField label="Line height (1–100)" bind:value={d.lineHeight} min={1} max={100} />
      <div></div>
    </div>
    <label class="field">
      <span>Player instructions</span>
      <textarea bind:value={d.instructions} placeholder="e.g. LB: stay back while attacking. ST: get in behind."></textarea>
    </label>
    <label class="field">
      <span>Notes</span>
      <textarea bind:value={d.notes}></textarea>
    </label>
    <div class="row">
      <button type="button" onclick={reset}>Reset to suggested</button>
      <span class="grow"></span>
      <button type="button" onclick={onclose}>Cancel</button>
      <button class="primary">Save</button>
    </div>
  </form>
</Sheet>

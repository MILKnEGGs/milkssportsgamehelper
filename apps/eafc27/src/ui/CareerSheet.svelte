<script lang="ts">
  // Career settings: name, club, season, budgets, save rules, sharing and delete. Edits apply as you type.
  import Sheet from '@milk/core/Sheet.svelte';
  import { nextSeason, type Career } from '../model';
  import { exportFile, remove, shareCode, toast } from '../store.svelte';
  import MoneyField from './MoneyField.svelte';

  let { career, onclose }: { career: Career; onclose: () => void } = $props();

  async function copyCode() {
    const code = await shareCode(career);
    try {
      await navigator.clipboard.writeText(code);
      toast('Share code copied: paste it to your friend');
    } catch {
      prompt('Copy this share code:', code);
    }
  }

  function bumpSeason() {
    const next = nextSeason(career.season);
    if (next && next !== career.season) {
      career.season = next;
      toast(`Now in ${next}. Last season's goals are under "All seasons".`);
    }
  }

  async function del() {
    if (!confirm(`Delete the career "${career.name}" from this device? Download a backup first if you might want it back.`)) return;
    await remove(career.id);
    onclose();
  }
</script>

<Sheet title="Career settings" {onclose}>
  <div class="stack">
    <label class="field"><span>Save name</span><input bind:value={career.name} /></label>
    <div class="grid2">
      <label class="field"><span>Club</span><input bind:value={career.club} /></label>
      <label class="field">
        <span>Season</span>
        <div class="row">
          <input bind:value={career.season} placeholder="e.g. 2026/27" />
          {#if nextSeason(career.season) !== career.season}<button class="small" title="Move to next season" onclick={bumpSeason}>Next</button>{/if}
        </div>
      </label>
    </div>
    <div class="grid3">
      <label class="field">
        <span>Currency</span>
        <select bind:value={career.currency}>
          <option>$</option>
          <option>€</option>
          <option>£</option>
        </select>
      </label>
      <MoneyField label="Transfer budget" bind:value={career.transferBudget} currency={career.currency} />
      <MoneyField label="Wage budget / wk" bind:value={career.wageBudget} currency={career.currency} placeholder="e.g. 400k" />
    </div>
    <label class="field">
      <span>Save rules / challenge (optional)</span>
      <textarea bind:value={career.rules} placeholder="e.g. Homegrown only, no signings over 25"></textarea>
    </label>

    <div class="panel stack">
      <h3>Share and back up</h3>
      <p class="muted small">Share codes are one line of text your friend can paste into Import. A file is the same thing, saved for safekeeping.</p>
      <div class="row wrap">
        <button onclick={copyCode}>Copy share code</button>
        <button onclick={() => exportFile([career])}>Download file</button>
      </div>
    </div>

    <div class="row">
      <button class="danger" onclick={del}>Delete career</button>
      <span class="grow"></span>
      <button class="primary" onclick={onclose}>Done</button>
    </div>
  </div>
</Sheet>

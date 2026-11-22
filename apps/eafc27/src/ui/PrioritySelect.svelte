<script lang="ts">
  import { PRIORITIES, PRIORITY_LABEL, type Priority } from '../model';

  let { value = $bindable() }: { value: Priority | undefined } = $props();
</script>

<div class="field">
  <span class="muted small">Priority</span>
  <div class="seg" role="radiogroup" aria-label="Priority">
    {#each PRIORITIES as p (p)}
      <button
        type="button"
        role="radio"
        aria-checked={(value ?? 'medium') === p}
        class="{p} {(value ?? 'medium') === p ? 'on' : ''}"
        onclick={() => (value = p)}>{PRIORITY_LABEL[p]}</button
      >
    {/each}
  </div>
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .seg {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }
  .seg button {
    padding: 7px 4px;
    font-size: 0.85rem;
  }
  .seg button.on {
    color: var(--bg);
    font-weight: 700;
  }
  .critical.on {
    background: var(--p-critical);
    border-color: var(--p-critical);
  }
  .high.on {
    background: var(--p-high);
    border-color: var(--p-high);
  }
  .medium.on {
    background: var(--p-medium);
    border-color: var(--p-medium);
  }
  .low.on {
    background: var(--p-low);
    border-color: var(--p-low);
  }
</style>

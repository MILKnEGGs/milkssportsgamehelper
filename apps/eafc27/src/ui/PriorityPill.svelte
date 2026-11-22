<script lang="ts">
  import { PRIORITY_LABEL, type Priority } from '../model';

  let { priority }: { priority: Priority | undefined } = $props();
  const p = $derived(priority ?? 'medium');
</script>

<span class="pill {p}">{PRIORITY_LABEL[p]}</span>

<style>
  .pill {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 7px;
    border-radius: 6px;
    border: 1px solid currentColor;
    white-space: nowrap;
  }
  .critical {
    color: var(--p-critical);
  }
  .high {
    color: var(--p-high);
  }
  .medium {
    color: var(--p-medium);
  }
  .low {
    color: var(--p-low);
  }
</style>

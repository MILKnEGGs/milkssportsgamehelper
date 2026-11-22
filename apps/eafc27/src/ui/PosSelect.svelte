<script lang="ts">
  import { POSITIONS, POSITION_ORDER, type Pos } from '../data/positions';

  let { label = 'Position', value = $bindable(), optional = false }: {
    label?: string;
    value: Pos | undefined;
    optional?: boolean;
  } = $props();
</script>

<label class="field">
  <span>{label}</span>
  <select bind:value>
    {#if optional}<option value={undefined}>—</option>{/if}
    {#each POSITION_ORDER as p (p)}
      <option value={p}>{p} · {POSITIONS[p].name}</option>
    {/each}
  </select>
</label>

<script lang="ts">
  // A whole-number input where blank means "not set" (undefined), never 0.
  import { parseIntOrUndefined } from '@milk/core/util';

  let { label, value = $bindable(), min, max, placeholder = '' }: {
    label: string;
    value: number | undefined;
    min?: number;
    max?: number;
    placeholder?: string;
  } = $props();
</script>

<label class="field">
  <span>{label}</span>
  <input
    type="number"
    inputmode="numeric"
    {min}
    {max}
    {placeholder}
    value={value ?? ''}
    oninput={(e) => (value = parseIntOrUndefined(e.currentTarget.value))}
  />
</label>

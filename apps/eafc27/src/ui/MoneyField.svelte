<script lang="ts">
  // Money typed the quick way ("12.5m", "750k"); stored as a number, shown back short.
  import { formatMoney, parseMoney } from '@milk/core/util';

  let { label, value = $bindable(), currency = '$', placeholder = 'e.g. 12.5m' }: {
    label: string;
    value: number | undefined;
    currency?: string;
    placeholder?: string;
  } = $props();

  let text = $state(value === undefined ? '' : formatMoney(value, ''));
  const parsed = $derived(parseMoney(text));
  const bad = $derived(text.trim() !== '' && parsed === undefined);

  function commit() {
    value = parsed;
    if (parsed !== undefined) text = formatMoney(parsed, '');
  }
</script>

<label class="field">
  <span>{label}{#if bad}<span class="bad"> · try 12.5m or 750k</span>{/if}</span>
  <div class="money">
    <span class="cur">{currency}</span>
    <input inputmode="decimal" {placeholder} bind:value={text} oninput={() => !bad && (value = parsed)} onblur={commit} />
  </div>
</label>

<style>
  .money {
    position: relative;
  }
  .cur {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }
  .money input {
    padding-left: 24px;
  }
  .bad {
    color: var(--warning);
  }
</style>

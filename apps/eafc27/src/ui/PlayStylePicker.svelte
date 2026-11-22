<script lang="ts">
  // Tap once for the PlayStyle, again for PlayStyle+ (gold), again to clear.
  import { PLAYSTYLES, PLAYSTYLE_GROUPS } from '../data/playstyles';

  let { value = $bindable(), suggested = [] }: { value: Record<string, 1 | 2> | undefined; suggested?: string[] } = $props();

  function cycle(name: string) {
    const v = { ...(value ?? {}) };
    if (!v[name]) v[name] = 1;
    else if (v[name] === 1) v[name] = 2;
    else delete v[name];
    value = Object.keys(v).length ? v : undefined;
  }
</script>

<div class="stack">
  <p class="muted small">Tap once for the PlayStyle, twice for PlayStyle+ (gold).{#if suggested.length} Starred ones suit this role.{/if}</p>
  {#each PLAYSTYLE_GROUPS as group (group)}
    <div>
      <div class="muted small">{group}</div>
      <div class="chips">
        {#each PLAYSTYLES.filter((p) => p.group === group) as p (p.name)}
          {@const v = value?.[p.name]}
          <button
            type="button"
            class="chip {v === 1 ? 'on' : v === 2 ? 'plus' : ''}"
            title={p.effect}
            onclick={() => cycle(p.name)}>{suggested.includes(p.name) ? '★ ' : ''}{p.name}{v === 2 ? '+' : ''}</button
          >
        {/each}
      </div>
    </div>
  {/each}
</div>

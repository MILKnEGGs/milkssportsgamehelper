<script lang="ts">
  import { focusIf } from '@milk/core/util';
  // Add or edit a player. Only name and position are needed; everything else sits under "More details".
  import Sheet from '@milk/core/Sheet.svelte';
  import { formationById } from '../data/formations';
  import { POSITIONS, POSITION_ORDER, type Pos } from '../data/positions';
  import { ALL_STATS } from '../data/roles';
  import { PLAYER_STATUS, removePlayer, slotsOf, type Career, type Player } from '../model';
  import MoneyField from './MoneyField.svelte';
  import NumField from './NumField.svelte';
  import PlayStylePicker from './PlayStylePicker.svelte';
  import PosSelect from './PosSelect.svelte';
  import PrioritySelect from './PrioritySelect.svelte';

  let {
    career,
    player,
    keyStats = [],
    suggestedPlayStyles = [],
    onclose,
    onsaved,
  }: {
    career: Career;
    player: Player;
    keyStats?: string[];
    suggestedPlayStyles?: string[];
    onclose: () => void;
    onsaved?: (p: Player) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  const isNew = !career.players.some((p) => p.id === player.id);
  // Built here, not inline in the markup: an import used only inside {@attach} gets dropped by the TS step.
  const focusNew = focusIf(isNew);
  // svelte-ignore state_referenced_locally
  let d = $state<Player>(JSON.parse(JSON.stringify(player)));
  const hasDetails = (p: Player) =>
    [p.club, p.age, p.ovr, p.potMin, p.potMax, p.value, p.wage, p.contract, p.nation, p.skillMoves, p.weakFoot].some((v) => v !== undefined && v !== '') ||
    !!p.playstyles ||
    !!p.stats ||
    !!p.altPos?.length;
  // svelte-ignore state_referenced_locally
  let more = $state(hasDetails(player));
  let showPlayStyles = $state(false);
  let addStat = $state('');
  let extraStats = $state<string[]>([]);

  const statKeys = $derived([...new Set([...keyStats, ...Object.keys(d.stats ?? {}), ...extraStats])]);
  const linked = $derived(
    slotsOf(career, d.id).map(({ formation, slot }) => {
      const f = formationById(formation);
      return `${f?.slots[slot]?.label ?? '?'} in ${f?.name ?? formation}`;
    }),
  );

  function setStat(k: string, raw: string) {
    const n = raw === '' ? undefined : Math.max(1, Math.min(99, Math.round(+raw)));
    const s = { ...(d.stats ?? {}) };
    if (n === undefined || Number.isNaN(n)) delete s[k];
    else s[k] = n;
    d.stats = Object.keys(s).length ? s : undefined;
  }

  function toggleAlt(p: Pos) {
    const set = new Set(d.altPos ?? []);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    d.altPos = set.size ? [...set] : undefined;
  }

  function save() {
    if (!d.name.trim()) return;
    d.name = d.name.trim();
    const k = career.players.findIndex((p) => p.id === d.id);
    if (k >= 0) career.players[k] = d;
    else career.players.push(d);
    onsaved?.(d);
    onclose();
  }

  function del() {
    if (!confirm(`Delete ${d.name || 'this player'}? This also removes them from every formation slot.`)) return;
    removePlayer(career, d.id);
    onclose();
  }
</script>

<Sheet title={isNew ? 'Add player' : 'Edit player'} {onclose}>
  <form class="stack" onsubmit={(e) => (e.preventDefault(), save())}>
    <div class="grid2">
      <label class="field">
        <span>Name</span>
        <input bind:value={d.name} placeholder="Player name" {@attach focusNew} required />
      </label>
      <PosSelect bind:value={d.pos} />
    </div>

    <label class="field">
      <span>Status</span>
      <select bind:value={d.status}>
        {#each PLAYER_STATUS as s (s.id)}<option value={s.id}>{s.label}</option>{/each}
      </select>
    </label>

    <PrioritySelect bind:value={d.priority} />

    <label class="field">
      <span>Notes</span>
      <textarea bind:value={d.notes} placeholder="Anything worth remembering: asking price, scout report, loan option…"></textarea>
    </label>

    {#if linked.length}
      <p class="muted small">Linked to {linked.join(', ')}.</p>
    {/if}

    <button type="button" class="ghost more" onclick={() => (more = !more)}>{more ? '▾' : '▸'} More details (all optional)</button>

    {#if more}
      <div class="grid3">
        <NumField label="Age" bind:value={d.age} min={14} max={45} />
        <NumField label="OVR" bind:value={d.ovr} min={1} max={99} />
        <NumField label="Skill moves ★" bind:value={d.skillMoves} min={1} max={5} />
      </div>
      <div class="grid3">
        <NumField label="Potential (low)" bind:value={d.potMin} min={1} max={99} />
        <NumField label="Potential (high)" bind:value={d.potMax} min={1} max={99} />
        <NumField label="Weak foot ★" bind:value={d.weakFoot} min={1} max={5} />
      </div>
      <div class="grid2">
        <MoneyField label="Value" bind:value={d.value} currency={career.currency} />
        <MoneyField label="Wage (per week)" bind:value={d.wage} currency={career.currency} placeholder="e.g. 45k" />
      </div>
      <div class="grid3">
        <label class="field"><span>Club</span><input bind:value={d.club} /></label>
        <label class="field"><span>Nationality</span><input bind:value={d.nation} /></label>
        <label class="field"><span>Contract until</span><input bind:value={d.contract} placeholder="e.g. 2028" /></label>
      </div>

      <div>
        <div class="muted small">Can also play</div>
        <div class="chips">
          {#each POSITION_ORDER.filter((p) => p !== d.pos) as p (p)}
            <button type="button" class="chip {d.altPos?.includes(p) ? 'on' : ''}" title={POSITIONS[p].name} onclick={() => toggleAlt(p)}>{p}</button>
          {/each}
        </div>
      </div>

      <div class="stack">
        <div class="muted small">{keyStats.length ? 'Key stats for this role' : 'Stats you care about'}</div>
        {#if statKeys.length}
          <div class="stats">
            {#each statKeys as k (k)}
              <label class="field">
                <span>{k}</span>
                <input type="number" inputmode="numeric" min="1" max="99" value={d.stats?.[k] ?? ''} oninput={(e) => setStat(k, e.currentTarget.value)} />
              </label>
            {/each}
          </div>
        {/if}
        <div class="row">
          <select bind:value={addStat} class="grow">
            <option value="">Add a stat…</option>
            {#each ALL_STATS.filter((s) => !statKeys.includes(s)) as s (s)}<option value={s}>{s}</option>{/each}
          </select>
          <button type="button" disabled={!addStat} onclick={() => ((extraStats = [...extraStats, addStat]), (addStat = ''))}>Add</button>
        </div>
      </div>

      <div>
        <button type="button" class="ghost more" onclick={() => (showPlayStyles = !showPlayStyles)}>
          {showPlayStyles ? '▾' : '▸'} PlayStyles {#if d.playstyles}({Object.entries(d.playstyles).map(([k, v]) => k + (v === 2 ? '+' : '')).join(', ')}){/if}
        </button>
        {#if showPlayStyles}<PlayStylePicker bind:value={d.playstyles} suggested={suggestedPlayStyles} />{/if}
      </div>
    {/if}

    <div class="row actions">
      {#if !isNew}<button type="button" class="danger" onclick={del}>Delete</button>{/if}
      <span class="grow"></span>
      <button type="button" onclick={onclose}>Cancel</button>
      <button class="primary" disabled={!d.name.trim()}>Save</button>
    </div>
  </form>
</Sheet>

<style>
  .more {
    align-self: flex-start;
    padding-left: 0;
    color: var(--accent);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  .actions {
    padding-top: 6px;
  }
</style>

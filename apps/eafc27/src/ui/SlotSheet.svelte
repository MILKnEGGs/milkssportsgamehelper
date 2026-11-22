<script lang="ts">
  // One formation slot: what the position is, the role you've set, what it wants (stats, PlayStyles),
  // an optional budget, and the players you're considering for it.
  import Sheet from '@milk/core/Sheet.svelte';
  import { formatMoney, move } from '@milk/core/util';
  import type { Formation } from '../data/formations';
  import { playStyle } from '../data/playstyles';
  import { POSITIONS } from '../data/positions';
  import { FOCUS_NOTES, GROUP_ROLES, ROLE_INFO, type Focus } from '../data/roles';
  import { newPlayer, type Career, type Player } from '../model';
  import MoneyField from './MoneyField.svelte';
  import PlayerSheet from './PlayerSheet.svelte';

  let { career, formation, index, rank, onclose }: {
    career: Career;
    formation: Formation;
    index: number;
    rank: number;
    onclose: () => void;
  } = $props();

  const slot = $derived(formation.slots[index]);
  const pos = $derived(POSITIONS[slot.pos]);
  // The opener creates the slot plan first (state can't be created while rendering).
  const plan = $derived(career.plans[formation.id]!.slots[index]);
  const options = $derived(GROUP_ROLES[pos.group]);
  const role = $derived(plan.role && options.some((o) => o.role === plan.role) ? plan.role : slot.role);
  const focuses = $derived(options.find((o) => o.role === role)?.focuses ?? []);
  const focus = $derived<Focus>(plan.focus && focuses.includes(plan.focus) ? plan.focus : role === slot.role ? slot.focus : focuses[0]);
  const info = $derived(ROLE_INFO[role]);
  const changed = $derived(role !== slot.role || focus !== slot.focus);
  const why = $derived(formation.keys[slot.label]);

  const candidates = $derived(plan.players.map((id) => career.players.find((p) => p.id === id)).filter((p): p is Player => !!p));
  const linkable = $derived(
    career.players
      .filter((p) => !plan.players.includes(p.id) && p.status !== 'passed')
      .sort((a, b) => +(b.pos === slot.pos || !!b.altPos?.includes(slot.pos)) - +(a.pos === slot.pos || !!a.altPos?.includes(slot.pos)) || a.name.localeCompare(b.name)),
  );

  let editing = $state<Player>();
  let linkId = $state('');

  function setRole(r: string) {
    plan.role = r;
    const fs = options.find((o) => o.role === r)?.focuses ?? [];
    plan.focus = r === slot.role ? slot.focus : fs[0];
  }

  function resetRole() {
    plan.role = undefined;
    plan.focus = undefined;
  }

  function link() {
    if (linkId && !plan.players.includes(linkId)) plan.players.push(linkId);
    linkId = '';
  }

  function unlink(id: string) {
    plan.players = plan.players.filter((x) => x !== id);
  }

  function addNew() {
    editing = newPlayer(career, '', slot.pos, { status: 'watching' });
  }

  const overBudget = (p: Player) => plan.budget !== undefined && p.value !== undefined && p.value > plan.budget;
</script>

<Sheet title="{slot.label} · {pos.name}" {onclose}>
  <div class="stack">
    <div class="ref panel">
      <p class="muted small">#{rank} most important slot in {formation.name}</p>
      {#if why}<p class="why">⭐ {why}</p>{/if}
      <p>{pos.about}</p>

      <div class="grid2">
        <label class="field">
          <span>Role</span>
          <select value={role} onchange={(e) => setRole(e.currentTarget.value)}>
            {#each options as o (o.role)}<option value={o.role}>{o.role}{o.role === slot.role ? ' (starting)' : ''}</option>{/each}
          </select>
        </label>
        <label class="field">
          <span>Focus</span>
          <select value={focus} onchange={(e) => (plan.focus = e.currentTarget.value as Focus)} disabled={focuses.length < 2}>
            {#each focuses as f (f)}<option value={f}>{f}</option>{/each}
          </select>
        </label>
      </div>
      {#if changed}
        <p class="small muted">Starting role is {slot.role} ({slot.focus}). <button class="ghost small link" onclick={resetRole}>Reset</button></p>
      {/if}

      {#if info}
        <p><strong>{info.name}:</strong> {info.about} <span class="muted">{focus}: {FOCUS_NOTES[focus]}</span></p>
        <div>
          <div class="muted small">Stats that matter most</div>
          <div class="chips">{#each info.keyStats as s, k (s)}<span class="chip">{k + 1}. {s}</span>{/each}</div>
        </div>
        <div>
          <div class="muted small">PlayStyles to look for</div>
          <ul class="effects small muted">
            {#each info.playstyles as s (s)}<li><strong>{s}</strong>: {playStyle(s)?.effect}</li>{/each}
          </ul>
        </div>
        {#if info.tips}<p class="tip small">💡 {info.tips}</p>{/if}
      {/if}
    </div>

    <div class="grid2">
      <MoneyField label="Budget for this slot (optional)" bind:value={plan.budget} currency={career.currency} />
      <div></div>
    </div>
    <label class="field">
      <span>Notes</span>
      <textarea bind:value={plan.notes} placeholder="What you want from this position"></textarea>
    </label>

    <div>
      <div class="row">
        <h3 class="grow">Candidates</h3>
        <button class="small primary" onclick={addNew}>+ New player</button>
      </div>
      {#if candidates.length}
        <div class="cands">
          {#each candidates as p, k (p.id)}
            <div class="cand panel">
              <div class="row">
                <button class="ghost grow name" onclick={() => (editing = p)}>
                  <strong>{k + 1}. {p.name}</strong>
                  <span class="muted small">
                    {[p.pos, p.age !== undefined ? `${p.age}y` : '', p.ovr !== undefined ? `${p.ovr} OVR` : '', p.potMax ? `POT ${p.potMax}` : '', p.club].filter(Boolean).join(' · ')}
                  </span>
                </button>
                <button class="ghost icon" aria-label="Move up" disabled={k === 0} onclick={() => move(plan.players, k, k - 1)}>▲</button>
                <button class="ghost icon" aria-label="Move down" disabled={k === candidates.length - 1} onclick={() => move(plan.players, k, k + 1)}>▼</button>
                <button class="ghost icon" aria-label="Remove from slot" title="Remove from this slot (keeps the player)" onclick={() => unlink(p.id)}>✕</button>
              </div>
              {#if p.value !== undefined}
                <div class="small" class:over={overBudget(p)}>Value {formatMoney(p.value, career.currency)}{overBudget(p) ? ' · over budget' : ''}</div>
              {/if}
              {#if info && info.keyStats.some((s) => p.stats?.[s] !== undefined)}
                <div class="chips">
                  {#each info.keyStats as s (s)}
                    {#if p.stats?.[s] !== undefined}<span class="chip">{s} <strong>{p.stats[s]}</strong></span>{/if}
                  {/each}
                </div>
              {/if}
              {#if p.notes}<div class="small muted">{p.notes}</div>{/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="muted small">No one linked yet. Add a new player or link one you've already noted.</p>
      {/if}
      {#if linkable.length}
        <div class="row linkrow">
          <select class="grow" bind:value={linkId}>
            <option value="">Link a player you've noted…</option>
            {#each linkable as p (p.id)}<option value={p.id}>{p.name} ({p.pos}{p.ovr ? ` · ${p.ovr}` : ''})</option>{/each}
          </select>
          <button disabled={!linkId} onclick={link}>Link</button>
        </div>
      {/if}
    </div>
  </div>
</Sheet>

{#if editing}
  <PlayerSheet
    {career}
    player={editing}
    keyStats={info?.keyStats ?? []}
    suggestedPlayStyles={info?.playstyles ?? []}
    onclose={() => (editing = undefined)}
    onsaved={(p) => !plan.players.includes(p.id) && plan.players.push(p.id)}
  />
{/if}

<style>
  .ref {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ref p {
    margin: 0;
  }
  .why {
    color: var(--accent);
  }
  .link {
    padding: 0 4px;
    color: var(--accent);
  }
  .effects {
    margin: 6px 0 0;
    padding-left: 18px;
  }
  .tip {
    background: var(--panel-2);
    border-radius: 8px;
    padding: 8px 10px;
  }
  .cands {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .cand {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
  }
  .name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 2px;
  }
  .over {
    color: var(--warning);
  }
  .linkrow {
    margin-top: 10px;
  }
</style>

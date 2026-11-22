<script lang="ts">
  import UpdateBanner from '@milk/core/UpdateBanner.svelte';
  import { formatMoney } from '@milk/core/util';
  import { app, current, load, open, scheduleSave } from './store.svelte';
  import CareerSheet from './ui/CareerSheet.svelte';
  import Careers from './views/Careers.svelte';
  import Formation from './views/Formation.svelte';
  import Goals from './views/Goals.svelte';
  import Players from './views/Players.svelte';
  import Priorities from './views/Priorities.svelte';
  import Youth from './views/Youth.svelte';

  type Tab = 'priorities' | 'goals' | 'players' | 'formation' | 'youth';
  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'priorities', label: 'Priorities', icon: '⭐' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'players', label: 'Players', icon: '👤' },
    { id: 'formation', label: 'Formation', icon: '📋' },
    { id: 'youth', label: 'Youth', icon: '🌱' },
  ];
  const TAB_KEY = 'milks-eafc27-tab';

  let tab = $state<Tab>((localStorage.getItem(TAB_KEY) as Tab) || 'priorities');
  let settings = $state(false);

  load();

  const career = $derived(current());

  // Save whenever anything in the open career changes (snapshot reads it deeply, so every edit counts).
  $effect(() => {
    if (!career) return;
    $state.snapshot(career);
    scheduleSave(career);
  });

  function go(t: Tab) {
    tab = t;
    localStorage.setItem(TAB_KEY, t);
    scrollTo(0, 0);
  }
</script>

<UpdateBanner />

{#if !app.loaded}
  <p class="empty">Loading…</p>
{:else if !career}
  <Careers />
{:else}
  <header class="top">
    <button class="ghost icon" aria-label="All careers" title="All careers" onclick={() => open(undefined)}>☰</button>
    <div class="grow title">
      <strong>{career.club || career.name}</strong>
      <span class="muted small">
        {[career.club && career.name !== career.club ? career.name : '', career.season, career.transferBudget !== undefined ? `Budget ${formatMoney(career.transferBudget, career.currency)}` : '']
          .filter(Boolean)
          .join(' · ')}
      </span>
    </div>
    <button class="ghost icon" aria-label="Career settings" title="Career settings, sharing" onclick={() => (settings = true)}>⚙</button>
  </header>

  {#if career.rules}<p class="rules small">📜 {career.rules}</p>{/if}

  <main>
    {#key career.id}
      {#if tab === 'priorities'}<Priorities {career} />
      {:else if tab === 'goals'}<Goals {career} />
      {:else if tab === 'players'}<Players {career} />
      {:else if tab === 'formation'}<Formation {career} />
      {:else}<Youth {career} />{/if}
    {/key}
  </main>

  <nav class="tabs">
    {#each TABS as t (t.id)}
      <button class:on={tab === t.id} onclick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
        <span aria-hidden="true">{t.icon}</span>
        <span class="lbl">{t.label}</span>
      </button>
    {/each}
  </nav>

  {#if settings}<CareerSheet {career} onclose={() => (settings = false)} />{/if}
{/if}

{#if app.toast}<div class="toast" role="status">{app.toast}</div>{/if}

<style>
  .top {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    padding-top: calc(8px + env(safe-area-inset-top, 0px));
    background: var(--bg);
    border-bottom: 1px solid var(--line);
  }
  .title {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }
  .rules {
    max-width: 1100px;
    margin: 8px auto 0;
    padding: 0 14px;
    color: var(--muted);
  }
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 12px 14px calc(84px + var(--safe-bottom));
  }
  .tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background: var(--panel);
    border-top: 1px solid var(--line);
    padding-bottom: var(--safe-bottom);
  }
  .tabs button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    border: none;
    border-radius: 0;
    background: transparent;
    padding: 8px 2px;
    font-size: 1.1rem;
    color: var(--muted);
  }
  .tabs .lbl {
    font-size: 0.72rem;
  }
  .tabs button.on {
    color: var(--accent);
    box-shadow: inset 0 2px 0 var(--accent);
  }
</style>

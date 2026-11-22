<script lang="ts">
  import { focusIf } from '@milk/core/util';
  import { newCareer } from '../model';
  import { add, app, exportFile, open } from '../store.svelte';
  import ImportSheet from '../ui/ImportSheet.svelte';

  // Built here, not inline in the markup: an import used only inside {@attach} gets dropped by the TS step.
  const focusFirst = focusIf(true);
  let creating = $state(false);
  let importing = $state(false);
  let name = $state('');
  let club = $state('');
  let season = $state('2026/27');

  async function create() {
    const c = newCareer(name, club, season);
    await add(c);
    name = club = '';
    creating = false;
    open(c.id);
  }

  const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<div class="wrap">
  <header class="brand">
    <img src="icon.svg" alt="" width="56" height="56" />
    <div>
      <h1>FC 27 Career Helper</h1>
      <p class="muted">Manager Career notes: goals, targets, formations, youth and tactics.</p>
    </div>
  </header>

  <div class="row head">
    <h2 class="grow">Careers</h2>
    <button onclick={() => (importing = true)}>Import</button>
    <button class="primary" onclick={() => (creating = !creating)}>+ New career</button>
  </div>

  {#if creating}
    <form class="panel stack" onsubmit={(e) => (e.preventDefault(), create())}>
      <div class="grid2">
        <label class="field"><span>Club</span><input bind:value={club} placeholder="e.g. Wrexham" {@attach focusFirst} /></label>
        <label class="field"><span>Season</span><input bind:value={season} /></label>
      </div>
      <label class="field"><span>Save name (optional)</span><input bind:value={name} placeholder={club || 'e.g. Road to Glory'} /></label>
      <div class="row">
        <span class="grow"></span>
        <button type="button" onclick={() => (creating = false)}>Cancel</button>
        <button class="primary" disabled={!club.trim() && !name.trim()}>Start</button>
      </div>
    </form>
  {/if}

  {#if app.careers.length}
    <ul class="list">
      {#each app.careers as c (c.id)}
        <li>
          <button class="panel card" onclick={() => open(c.id)}>
            <span class="name">{c.name}</span>
            <span class="muted small">
              {[c.club !== c.name ? c.club : '', c.season].filter(Boolean).join(' · ')}
              {c.club || c.season ? '·' : ''} {c.players.length} players · {c.goals.filter((g) => g.status === 'open').length} open goals
            </span>
            <span class="muted small">Updated {when(c.updated)}</span>
          </button>
        </li>
      {/each}
    </ul>
    <p class="small muted">
      Everything stays on this device.
      <button class="ghost small link" onclick={() => exportFile(app.careers)}>Back up all careers</button>
    </p>
  {:else if !creating}
    <div class="empty panel">
      No careers yet. Start one for your Manager Career save, or import one a friend shared.
    </div>
  {/if}

  <p class="small muted foot">v{__APP_VERSION__} · Not affiliated with EA. Role and PlayStyle details are a guide; check them in-game.</p>
</div>

{#if importing}<ImportSheet onclose={() => (importing = false)} />{/if}

<style>
  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 20px 14px 40px;
  }
  .brand {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 22px;
  }
  .brand img {
    border-radius: 14px;
  }
  .brand p {
    margin: 2px 0 0;
  }
  .head {
    margin-bottom: 10px;
  }
  form {
    margin-bottom: 12px;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 2px;
  }
  .name {
    font-weight: 700;
    font-size: 1.05rem;
  }
  .link {
    color: var(--accent);
    padding: 0 4px;
  }
  .foot {
    margin-top: 30px;
    text-align: center;
  }
</style>

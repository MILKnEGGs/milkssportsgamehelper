<script lang="ts">
  // Bring in a career from a backup file or a pasted FC27: share code.
  import Sheet from '@milk/core/Sheet.svelte';
  import { pickTextFile } from '@milk/core/share';
  import { acceptIncoming, readIncoming, toast, type Incoming } from '../store.svelte';

  let { onclose }: { onclose: () => void } = $props();

  let text = $state('');
  let error = $state('');
  let incoming = $state<Incoming[]>();
  let onClash = $state<'copy' | 'replace'>('copy');

  async function read(t: string) {
    error = '';
    incoming = undefined;
    try {
      incoming = await readIncoming(t);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function file() {
    const t = await pickTextFile();
    if (t) read(t);
  }

  async function accept() {
    if (!incoming) return;
    await acceptIncoming(incoming, onClash);
    toast(`Imported ${incoming.length} career${incoming.length === 1 ? '' : 's'}`);
    onclose();
  }

  const clashes = $derived(incoming?.filter((x) => x.clash).length ?? 0);
</script>

<Sheet title="Import" {onclose}>
  <div class="stack">
    {#if !incoming}
      <p class="muted small">Paste a share code from a friend (starts with <code>FC27:</code>) or pick a backup file.</p>
      <textarea bind:value={text} placeholder="FC27:…" rows="4"></textarea>
      <div class="row">
        <button onclick={file}>Choose file…</button>
        <span class="grow"></span>
        <button class="primary" disabled={!text.trim()} onclick={() => read(text)}>Read code</button>
      </div>
      {#if error}<p class="err">{error}</p>{/if}
    {:else}
      <ul class="list">
        {#each incoming as x (x.career.id)}
          <li>
            <strong>{x.career.name}</strong>
            <span class="muted small">
              {[x.career.club, x.career.season].filter(Boolean).join(' · ')}
              · {x.career.players.length} players · {x.career.goals.length} goals · {x.career.youth.length} youth
            </span>
            {#if x.clash}<span class="warn small">Already on this device</span>{/if}
          </li>
        {/each}
      </ul>
      {#if clashes}
        <div class="stack">
          <label class="check"><input type="radio" bind:group={onClash} value="copy" /> Keep both (import as a copy)</label>
          <label class="check"><input type="radio" bind:group={onClash} value="replace" /> Replace the one on this device</label>
        </div>
      {/if}
      <div class="row">
        <button onclick={() => (incoming = undefined)}>Back</button>
        <span class="grow"></span>
        <button class="primary" onclick={accept}>Import</button>
      </div>
    {/if}
  </div>
</Sheet>

<style>
  .err {
    color: var(--error);
    margin: 0;
  }
  .warn {
    color: var(--warning);
  }
  .list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .list li {
    display: flex;
    flex-direction: column;
  }
</style>

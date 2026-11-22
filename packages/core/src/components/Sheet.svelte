<script lang="ts">
  // A bottom sheet on phones, a centred dialog on wider screens. Closes on the backdrop, x or Escape.
  import type { Snippet } from 'svelte';

  let {
    title,
    onclose,
    children,
    footer,
  }: { title: string; onclose: () => void; children: Snippet; footer?: Snippet } = $props();

  function key(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={key} />

<div class="backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && onclose()}>
  <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
    <header>
      <h2>{title}</h2>
      <button class="ghost icon" aria-label="Close" onclick={onclose}>✕</button>
    </header>
    <div class="body">{@render children()}</div>
    {#if footer}<footer>{@render footer()}</footer>{/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 40;
  }
  .sheet {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 16px 16px 0 0;
    width: 100%;
    max-width: 620px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow);
  }
  @media (min-width: 700px) {
    .backdrop {
      align-items: center;
    }
    .sheet {
      border-radius: 16px;
      max-height: 86vh;
    }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 12px 8px 16px;
    border-bottom: 1px solid var(--line);
  }
  .body {
    overflow-y: auto;
    padding: 14px 16px;
  }
  footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 10px 16px calc(10px + var(--safe-bottom));
    border-top: 1px solid var(--line);
  }
</style>

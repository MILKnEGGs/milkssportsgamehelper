<script lang="ts">
  // Shows "Update ready" when a new version has downloaded, instead of reloading in the middle of an edit.
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  const { needRefresh, updateServiceWorker } = useRegisterSW();
</script>

{#if $needRefresh}
  <div class="update" role="status">
    <span>Update ready.</span>
    <button class="primary small" onclick={() => updateServiceWorker(true)}>Reload</button>
    <button class="ghost small" onclick={() => needRefresh.set(false)}>Later</button>
  </div>
{/if}

<style>
  .update {
    position: fixed;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--panel-2);
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 6px 8px 6px 14px;
    box-shadow: var(--shadow);
    z-index: 60;
  }
</style>

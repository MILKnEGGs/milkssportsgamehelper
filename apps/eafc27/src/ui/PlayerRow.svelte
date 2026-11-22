<script lang="ts">
  // One line for a player: name, position, the numbers you filled in, and the status.
  import { formatMoney } from '@milk/core/util';
  import { PLAYER_STATUS, potential, type Player } from '../model';

  let { player, currency, onclick, showStatus = true }: {
    player: Player;
    currency: string;
    onclick: () => void;
    showStatus?: boolean;
  } = $props();

  const pot = $derived(potential(player));
  const facts = $derived(
    [
      player.age !== undefined ? `${player.age}y` : '',
      player.ovr !== undefined ? `${player.ovr}${pot ? ` → ${pot}` : ''}` : pot ? `POT ${pot}` : '',
      formatMoney(player.value, currency),
      player.club ?? '',
    ].filter(Boolean),
  );
  const status = $derived(PLAYER_STATUS.find((s) => s.id === player.status)?.label);
</script>

<button class="prow" {onclick}>
  <span class="pos">{player.pos}</span>
  <span class="grow main">
    <span class="name">{player.name}</span>
    {#if facts.length}<span class="muted small">{facts.join(' · ')}</span>{/if}
    {#if !facts.length && player.notes}<span class="muted small note">{player.notes}</span>{/if}
  </span>
  {#if showStatus}<span class="status {player.status}">{status}</span>{/if}
</button>

<style>
  .prow {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 8px 0;
  }
  .main {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-weight: 600;
  }
  .note {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pos {
    flex: none;
    width: 42px;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 3px 0;
    border-radius: 6px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }
  .status {
    font-size: 0.75rem;
    color: var(--muted);
    white-space: nowrap;
  }
  .status.target,
  .status.negotiating {
    color: var(--accent);
  }
  .status.signed {
    color: var(--ok);
  }
</style>

<script lang="ts">
  // The formation on a pitch, attacking upwards. Each slot shows its label and its top candidate.
  import type { Formation } from '../data/formations';

  let { formation, names, rank, onpick }: {
    formation: Formation;
    /** Top candidate's name per slot index. */
    names: Record<number, string | undefined>;
    /** Importance position (1 = most important) per slot index. */
    rank: Record<number, number>;
    onpick: (i: number) => void;
  } = $props();
</script>

<div class="pitch" aria-label="{formation.name} on a pitch">
  <div class="lines" aria-hidden="true">
    <span class="half"></span>
    <span class="circle"></span>
    <span class="box top"></span>
    <span class="box bottom"></span>
  </div>
  {#each formation.slots as s (s.i)}
    <button class="slot" style="left:{s.x}%; bottom:{s.y}%" onclick={() => onpick(s.i)} aria-label="{s.label}: {names[s.i] ?? 'empty'}">
      <span class="dot" class:top3={rank[s.i] <= 3}>{s.label}</span>
      <span class="who">{names[s.i] ?? ''}</span>
    </button>
  {/each}
</div>

<style>
  .pitch {
    position: relative;
    aspect-ratio: 68 / 82;
    max-height: 62vh;
    margin: 0 auto;
    background: var(--pitch);
    border: 2px solid var(--pitch-line);
    border-radius: 10px;
    overflow: hidden;
  }
  .lines span {
    position: absolute;
    border: 2px solid var(--pitch-line);
  }
  .half {
    left: 0;
    right: 0;
    top: 50%;
    border-width: 2px 0 0 !important;
  }
  .circle {
    left: 50%;
    top: 50%;
    width: 24%;
    aspect-ratio: 1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .box {
    left: 25%;
    right: 25%;
    height: 13%;
  }
  .box.top {
    top: -2px;
  }
  .box.bottom {
    bottom: -2px;
  }
  .slot {
    position: absolute;
    transform: translate(-50%, 50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: transparent;
    border: none;
    padding: 0;
    width: 76px;
  }
  .dot {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--panel);
    border: 2px solid var(--line);
    font-size: 0.72rem;
    font-weight: 800;
  }
  .dot.top3 {
    border-color: var(--accent);
  }
  .slot:hover .dot {
    border-color: var(--text);
  }
  /* Hangs below the dot without changing the slot's size, so a name never shifts the dot. */
  .who {
    position: absolute;
    top: calc(100% + 2px);
    font-size: 0.72rem;
    line-height: 1.1;
    max-width: 76px;
    text-align: center;
    text-shadow: 0 1px 2px rgb(0 0 0 / 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

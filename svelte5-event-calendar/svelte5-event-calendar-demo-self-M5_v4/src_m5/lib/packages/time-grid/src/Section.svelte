<script lang="ts">
  import { getContext } from "svelte";
  import { setContent } from "@event-calendar/core";
  import { createAllDayContent } from "./utils.js";
  interface Props {
    lines?: import("svelte").Snippet;
    children?: import("svelte").Snippet;
  }

  let { lines, children }: Props = $props();

  let { allDayContent, theme, _times } = getContext("state");

  let allDayText = $derived(createAllDayContent($allDayContent));
</script>

<div class={$theme.sidebar}>
  <div class={$theme.sidebarTitle} use:setContent={allDayText}></div>
  {#each $_times as time}
    <time
      class={$theme.time}
      datetime={time[0]}
      use:setContent={time[2] ? time[1] : ""}
    ></time>
  {/each}
</div>
<div class={$theme.days} role="row">
  <div class={$theme.lines}>{@render lines?.()}</div>
  {@render children?.()}
</div>

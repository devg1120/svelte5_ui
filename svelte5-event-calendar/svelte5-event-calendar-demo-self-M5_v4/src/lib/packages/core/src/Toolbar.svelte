<script>
  import { run } from "svelte/legacy";
  import { untrack } from "svelte";

  import { getContext } from "svelte";
  import { keys } from "./lib.js";
  import Buttons from "./Buttons.svelte";

  let { headerToolbar, theme } = getContext("state");

  let sections = $state({
    start: [],
    center: [],
    end: [],
  });

  run(() => {
    untrack(() => {
      for (let key of keys(sections)) {
        sections[key] = $headerToolbar[key]
          .split(" ")
          .map((group) => group.split(","));
      }
    });
  });
</script>

<nav class={$theme.toolbar}>
  {#each keys(sections) as key}
    <div class="ec-{key}">
      {#each sections[key] as buttons}
        {#if buttons.length > 1}
          <div class={$theme.buttonGroup}>
            <Buttons {buttons} />
          </div>
        {:else}
          <Buttons {buttons} />
        {/if}
      {/each}
    </div>
  {/each}
</nav>

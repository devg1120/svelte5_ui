<script lang="ts">
  import { createBubbler } from "svelte/legacy";

  const bubble = createBubbler();
  import { getContext } from "svelte";
  import { bgEvent, helperEvent } from "@event-calendar/core";

  interface Props {
    event: any;
    start?: boolean;
  }

  let { event, start = false }: Props = $props();

  let { theme, eventDurationEditable, eventResizableFromStart, editable } =
    getContext("state");

  let resizable = $derived(
    !bgEvent(event.display) &&
      !helperEvent(event.display) &&
      (!start || $eventResizableFromStart) &&
      ((event.durationEditable ?? $eventDurationEditable) ||
        (event.editable ?? $editable)),
  );
</script>

{#if resizable}
  <div
    class="{$theme.resizer}{start ? ' ' + $theme.start : ''}"
    onpointerdown={bubble("pointerdown")}
  ></div>
{/if}

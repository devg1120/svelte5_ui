<script lang="ts">
  import { run } from "svelte/legacy";
  import { untrack } from "svelte";

  //import {afterUpdate, getContext, onMount} from 'svelte';
  import { getContext, onMount } from "svelte";
  import {
    createEventContent,
    createEventClasses,
    toEventWithLocalDates,
    toViewWithLocalDates,
    setContent,
    bgEvent,
    helperEvent,
    keyEnter,
    resourceBackgroundColor,
    resourceTextColor,
    task,
    height,
    toSeconds,
    isFunction,
    subtractDuration,
    cloneDate,
  } from "@event-calendar/core";
  import { repositionEvent } from "./lib.js";

  let {
    chunk,
    dayChunks = [],
    longChunks = {},
    resource = undefined,
  } = $props();

  let {
    displayEventEnd,
    eventAllUpdated,
    eventBackgroundColor,
    eventTextColor,
    eventColor,
    eventContent,
    eventClick,
    eventDidMount,
    eventClassNames,
    eventMouseEnter,
    eventMouseLeave,
    resources,
    slotDuration,
    slotWidth,
    theme,
    _view,
    _intlEventTime,
    _interaction,
    _iClasses,
    _tasks,
  } = getContext("state");

  let el = $state();
  let event = $state();
  let display = $state();
  let classes = $state();
  let style = $state();
  let content = $state();
  let timeText = $state();
  let onclick = $derived(
    !bgEvent(display) && createHandler($eventClick, display),
  );
  let margin = $state(helperEvent(chunk.event.display) ? 1 : 0);
  let width = $state(0);

  run(() => {
    event = chunk.event;
  });

  run(() => {
    untrack(() => {
      display = event.display;

      // Style
      if ("slots" in chunk) {
        let left = chunk.offset * $slotWidth;
        width = chunk.slots * $slotWidth;
        style = `left:${left}px;` + `width:${width}px;`;
      } else {
        // Month view
        width = chunk.days * 100;
        style = `width:${width}%;`;
      }
      let bgColor =
        event.backgroundColor ||
        resourceBackgroundColor(event, $resources) ||
        $eventBackgroundColor ||
        $eventColor;
      let txtColor =
        event.textColor ||
        resourceTextColor(event, $resources) ||
        $eventTextColor;
      let marginTop = margin;
      if (event._margin) {
        // Force margin for helper events
        let [_margin, _resource] = event._margin;
        if (resource === _resource) {
          marginTop = _margin;
        }
      }
      style += `margin-top:${marginTop}px;`;
      if (bgColor) {
        style += `background-color:${bgColor};`;
      }
      if (txtColor) {
        style += `color:${txtColor};`;
      }
      style += event.styles.join(";");

      // Class
      classes = [
        bgEvent(display) ? $theme.bgEvent : $theme.event,
        ...$_iClasses([], event),
        ...createEventClasses($eventClassNames, event, $_view),
      ].join(" ");
    });
  });

  // Content
  run(() => {
    [timeText, content] = createEventContent(
      chunk,
      $displayEventEnd,
      $eventContent,
      $theme,
      $_intlEventTime,
      $_view,
    );
  });

  onMount(() => {
    if (isFunction($eventDidMount)) {
      $eventDidMount({
        event: toEventWithLocalDates(event),
        timeText,
        el,
        view: toViewWithLocalDates($_view),
      });
    }
  });

  //afterUpdate(() => {
  $effect(() => {
    if (isFunction($eventAllUpdated) && !helperEvent(display)) {
      task(
        () => $eventAllUpdated({ view: toViewWithLocalDates($_view) }),
        "eau",
        _tasks,
      );
    }
  });

  function createHandler(fn, display) {
    return !helperEvent(display) && isFunction(fn)
      ? (jsEvent) =>
          fn({
            event: toEventWithLocalDates(event),
            el,
            jsEvent,
            view: toViewWithLocalDates($_view),
          })
      : undefined;
  }

  function createDragHandler(interaction, resize) {
    return interaction.action
      ? (jsEvent) =>
          interaction.action.drag(
            event,
            jsEvent,
            resize,
            resize && chunk.zeroDuration
              ? subtractDuration(cloneDate(event.end), $slotDuration)
              : undefined,
            [margin, resource],
            chunk.zeroDuration,
          )
      : undefined;
  }

  // Onclick handler

  export function reposition() {
    if (!el) {
      return 0;
    }
    let h = height(el);
    margin = repositionEvent(
      chunk,
      dayChunks,
      longChunks,
      h,
      !toSeconds($slotDuration),
    );
    return margin + h;
  }
</script>

{#if width > 0}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  {@const SvelteComponent = $_interaction.resizer}
  {@const SvelteComponent_1 = $_interaction.resizer}
  <article
    bind:this={el}
    class={classes}
    {style}
    role={onclick ? "button" : undefined}
    tabindex={onclick ? 0 : undefined}
    {onclick}
    onkeydown={onclick && keyEnter(onclick)}
    onmouseenter={createHandler($eventMouseEnter, display)}
    onmouseleave={createHandler($eventMouseLeave, display)}
    onpointerdown={!bgEvent(display) &&
      !helperEvent(display) &&
      createDragHandler($_interaction)}
  >
    <SvelteComponent
      start
      {event}
      on:pointerdown={createDragHandler($_interaction, ["x", "start"])}
    />
    <div class={$theme.eventBody} use:setContent={content}></div>
    <SvelteComponent_1
      {event}
      on:pointerdown={createDragHandler($_interaction, ["x", "end"])}
    />
  </article>
{/if}

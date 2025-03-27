<script lang="ts">
  import { run } from "svelte/legacy";
  import { untrack } from "svelte";

  import { getContext, tick } from "svelte";
  import {
    addDay,
    bgEvent,
    cloneDate,
    createEventChunk,
    debounce,
    eventIntersects,
    limitToRange,
    prepareEventChunks,
    runReposition,
  } from "@event-calendar/core";
  import Day from "./Day.svelte";

  let { dates } = $props();

  let {
    _events,
    _iEvents,
    _queue2,
    _hiddenEvents,
    resources,
    filterEventsWithResources,
    hiddenDays,
    theme,
    validRange,
  } = getContext("state");

  let chunks = $state(),
    bgChunks = $state(),
    longChunks = $state(),
    iChunks = $state([]);

  let start = $state();
  let end = $state();
  let refs = $state([]);
  let debounceHandle = {};
  /*
    _iEvents.subscribe(v => {
        iChunks = $_iEvents.map(event => {
            let chunk;
            if (event && eventIntersects(event, start, end)) {
                chunk = createEventChunk(event, start, end);
                prepareEventChunks([chunk], $hiddenDays);
            } else {
                chunk = null;
            }
            return chunk;
        });


    })
*/

  _events.subscribe((v) => {
    chunks = [];
    bgChunks = [];
    for (let event of $_events) {
      if (
        eventIntersects(
          event,
          start,
          end,
          $filterEventsWithResources ? $resources : undefined,
        )
      ) {
        let chunk = createEventChunk(event, start, end);
        if (bgEvent(event.display)) {
          if (event.allDay) {
            bgChunks.push(chunk);
          }
        } else {
          chunks.push(chunk);
        }
      }
    }
    prepareEventChunks(bgChunks, $hiddenDays);
    longChunks = prepareEventChunks(chunks, $hiddenDays);
    reposition();
  });

  run(() => {
    start = limitToRange(dates[0], $validRange);
    end = addDay(cloneDate(limitToRange(dates.at(-1), $validRange)));
  });

  //let debounceHandle = {};
  function reposition() {
    //untrack(() => {
    debounce(() => runReposition(refs, dates), debounceHandle, _queue2);
    //	})
  }

  run(() => {
    //NOTUNTRACK
    //    untrack(() => {
    chunks = [];
    bgChunks = [];
    for (let event of $_events) {
      if (
        eventIntersects(
          event,
          start,
          end,
          $filterEventsWithResources ? $resources : undefined,
        )
      ) {
        let chunk = createEventChunk(event, start, end);
        if (bgEvent(event.display)) {
          if (event.allDay) {
            bgChunks.push(chunk);
          }
        } else {
          chunks.push(chunk);
        }
      }
    }
    prepareEventChunks(bgChunks, $hiddenDays);
    longChunks = prepareEventChunks(chunks, $hiddenDays);
    // Run reposition only when events get changed
    reposition();
    //	})
  });

  run(() => {
    iChunks = $_iEvents.map((event) => {
      let chunk;
      if (event && eventIntersects(event, start, end)) {
        chunk = createEventChunk(event, start, end);
        prepareEventChunks([chunk], $hiddenDays);
      } else {
        chunk = null;
      }
      return chunk;
    });
  });

  run(() => {
    if ($_hiddenEvents) {
      // Schedule reposition during next update
      tick().then(reposition);
    }
  });
</script>

<div class={$theme.days} role="row">
  {#key chunks}
    {#each dates as date, i}
      <Day
        {date}
        {chunks}
        {bgChunks}
        {longChunks}
        {iChunks}
        {dates}
        bind:this={refs[i]}
      />
    {/each}
  {/key}
</div>

<svelte:window onresize={reposition} />

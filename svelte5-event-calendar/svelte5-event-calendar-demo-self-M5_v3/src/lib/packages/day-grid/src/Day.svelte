<script lang="ts">
  import { run, stopPropagation, createBubbler } from "svelte/legacy";
  import { untrack } from "svelte";

  const bubble = createBubbler();
  import { getContext, tick } from "svelte";
  import {
    addDay,
    assign,
    cloneDate,
    createEventChunk,
    datesEqual,
    getWeekNumber,
    isFunction,
    keyEnter,
    outsideRange,
    runReposition,
    setContent,
    setPayload,
    toISOString,
    toLocalDate,
  } from "@event-calendar/core";
  import Event from "./Event.svelte";
  import Popup from "./Popup.svelte";

  let { date, chunks, bgChunks, longChunks, iChunks = [], dates } = $props();

  let {
    date: currentDate,
    dayMaxEvents,
    highlightedDates,
    firstDay,
    moreLinkContent,
    theme,
    validRange,
    weekNumbers,
    weekNumberContent,
    _hiddenEvents,
    _intlDayCell,
    _popupDate,
    _popupChunks,
    _today,
    _interaction,
  } = getContext("state");

  let el = $state();
  let dayChunks = $state(),
    dayBgChunks = $state();
  let isToday = $derived(datesEqual(date, $_today)),
    otherMonth = $derived(date.getUTCMonth() !== $currentDate.getUTCMonth()),
    highlight = $derived($highlightedDates.some((d) => datesEqual(d, date))),
    disabled = $state();
  let hiddenEvents = $state(new Set()); // hidden events of this day
  let moreLink = $state("");
  let showPopup = $state();
  let showWeekNumber = $state();
  let weekNumber = $state();
  let refs = $state([]);
  /*
    _events.subscribe(v => {
        console.log("daryt_grid subsc")
        if (!disabled) {
            dayChunks = [];
            dayBgChunks = bgChunks.filter(bgChunk => datesEqual(bgChunk.date, date));
            hiddenEvents.clear();
            hiddenEvents = hiddenEvents;
            for (let chunk of chunks) {
                if (datesEqual(chunk.date, date)) {
                    dayChunks.push(chunk);
                    // if ($dayMaxEvents !== false && dayChunks.length > $dayMaxEvents) {
                    // 	chunk.hidden = true;
                    // }
                }
            }
        }

    });
*/

  function showMore() {
    $_popupDate = date;
  }

  function setPopupChunks() {
    let nextDay = addDay(cloneDate(date));
    let chunks = dayChunks.concat(longChunks[date.getTime()]?.chunks || []);
    $_popupChunks = chunks
      .map((chunk) =>
        assign({}, chunk, createEventChunk(chunk.event, date, nextDay), {
          days: 1,
          dates: [date],
        }),
      )
      .sort((a, b) => a.top - b.top);
  }

  export function reposition() {
    if (!disabled) {
      runReposition(refs, dayChunks);
    }
  }
  run(() => {
    disabled = outsideRange(date, $validRange);
  });
  run(() => {
    // NOTUNTRACK
    //untrack(() => {
    if (!disabled) {
      dayChunks = [];
      dayBgChunks = bgChunks.filter((bgChunk) =>
        datesEqual(bgChunk.date, date),
      );
      hiddenEvents.clear();
      hiddenEvents = hiddenEvents;
      for (let chunk of chunks) {
        if (datesEqual(chunk.date, date)) {
          dayChunks.push(chunk);
          // if ($dayMaxEvents !== false && dayChunks.length > $dayMaxEvents) {
          // 	chunk.hidden = true;
          // }
        }
      }
    }
    //});
  });
  run(() => {
    $_hiddenEvents[date.getTime()] = hiddenEvents;
  });

  run(() => {
    if (!disabled && $_hiddenEvents && hiddenEvents.size) {
      // make Svelte update this block on $_hiddenEvents update
      let text = "+" + hiddenEvents.size + " more";
      if ($moreLinkContent) {
        moreLink = isFunction($moreLinkContent)
          ? $moreLinkContent({ num: hiddenEvents.size, text })
          : $moreLinkContent;
      } else {
        moreLink = text;
      }
    }
  });
  run(() => {
    showPopup = $_popupDate && datesEqual(date, $_popupDate);
  });
  run(() => {
    if (showPopup && longChunks && dayChunks) {
      // Let chunks to reposition then set popup chunks
      tick().then(setPopupChunks);
    }
  });
  // dateFromPoint
  run(() => {
    if (el) {
      setPayload(el, () => ({
        allDay: true,
        date,
        resource: undefined,
        dayEl: el,
        disabled,
      }));
    }
  });
  run(() => {
    showWeekNumber = $weekNumbers && date.getUTCDay() == ($firstDay ? 1 : 0);
    if (showWeekNumber) {
      let week = getWeekNumber(date, $firstDay);
      if ($weekNumberContent) {
        weekNumber = isFunction($weekNumberContent)
          ? $weekNumberContent({ date: toLocalDate(date), week })
          : $weekNumberContent;
      } else {
        weekNumber = "W" + String(week).padStart(2, "0");
      }
    }
  });
</script>

<div
  bind:this={el}
  class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday
    ? ' ' + $theme.today
    : ''}{otherMonth ? ' ' + $theme.otherMonth : ''}{highlight
    ? ' ' + $theme.highlight
    : ''}{disabled ? ' ' + $theme.disabled : ''}"
  role="cell"
  onpointerdown={$_interaction.action?.select}
>
  <div class={$theme.dayHead}>
    <time
      datetime={toISOString(date, 10)}
      use:setContent={$_intlDayCell.format(date)}
    ></time>
    {#if showWeekNumber}
      <span class={$theme.weekNumber} use:setContent={weekNumber}></span>
    {/if}
  </div>
  <div class={$theme.bgEvents}>
    {#if !disabled}
      {#each dayBgChunks as chunk (chunk.event)}
        <Event {chunk} />
      {/each}
    {/if}
  </div>
  {#if !disabled}
    <!-- Pointer -->
    {#if iChunks[2] && datesEqual(iChunks[2].date, date)}
      <div class={$theme.events}>
        <Event chunk={iChunks[2]} />
      </div>
    {/if}
    <!-- Drag & Resize -->
    {#if iChunks[0] && datesEqual(iChunks[0].date, date)}
      <div class="{$theme.events} {$theme.preview}">
        <Event chunk={iChunks[0]} />
      </div>
    {/if}
  {/if}
  <div class={$theme.events}>
    {#if !disabled}
      {#each dayChunks as chunk, i (chunk.event)}
        <Event {chunk} {longChunks} {dates} bind:this={refs[i]} />
      {/each}
    {/if}
  </div>
  {#if showPopup}
    <Popup />
  {/if}
  <div class={$theme.dayFoot}>
    {#if !disabled && hiddenEvents.size}
      <!-- svelte-ignore a11y_missing_attribute -->
      <!-- svelte-ignore a11y_missing_content -->
      <a
        aria-label="GUSA"
        role="button"
        tabindex="0"
        aria-haspopup="true"
        onclick={stopPropagation(showMore)}
        onkeydown={keyEnter(showMore)}
        onpointerdown={stopPropagation(bubble("pointerdown"))}
        use:setContent={moreLink}
      ></a>
    {/if}
  </div>
</div>

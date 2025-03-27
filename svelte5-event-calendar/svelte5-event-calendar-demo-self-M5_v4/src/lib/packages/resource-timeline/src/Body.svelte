<script>
  import { run } from "svelte/legacy";

  import { getContext } from "svelte";
  import { toSeconds } from "@event-calendar/core";
  import { getSlotTimeLimits } from "./lib.js";
  import Days from "./Days.svelte";

  let {
    _bodyEl,
    _headerEl,
    _sidebarEl,
    _dayTimes,
    _dayTimeLimits,
    _viewResources,
    _viewDates,
    scrollTime,
    slotDuration,
    slotWidth,
    theme,
  } = getContext("state");

  let el = $state();

  function handleScroll() {
    $_headerEl.scrollLeft = $_bodyEl.scrollLeft;
    $_sidebarEl.scrollTop = $_bodyEl.scrollTop;
  }

  function scrollToTime() {
    let slotTimeLimits = getSlotTimeLimits($_dayTimeLimits, $_viewDates[0]);
    el.scrollLeft =
      ((toSeconds($scrollTime) - toSeconds(slotTimeLimits.min)) /
        toSeconds($slotDuration)) *
      $slotWidth;
  }
  run(() => {
    $_bodyEl = el;
  });
  run(() => {
    if (el) {
      $_viewDates;
      $scrollTime;
      scrollToTime();
    }
  });
</script>

<div bind:this={el} class={$theme.body} onscroll={handleScroll}>
  <div class={$theme.content}>
    <div class={$theme.lines}>
      {#each $_viewDates as date}
        {#each $_dayTimes[date.getTime()] as time}
          <div class={$theme.line}></div>
        {/each}
      {/each}
    </div>
    {#each $_viewResources as resource}
      <Days {resource} />
    {/each}
  </div>
</div>

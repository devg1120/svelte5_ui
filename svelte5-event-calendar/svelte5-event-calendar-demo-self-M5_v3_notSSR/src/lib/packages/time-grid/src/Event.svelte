<script lang="ts">
    //import { run } from 'svelte/legacy';
    import { untrack } from "svelte";

    //import {afterUpdate, getContext, onMount} from 'svelte';
    import { getContext, onMount} from 'svelte';
    import {
        bgEvent, createEventClasses, createEventContent, ghostEvent, helperEvent, isFunction, keyEnter, max,
        resourceBackgroundColor, resourceTextColor, setContent, task, toEventWithLocalDates, toViewWithLocalDates
    } from '@event-calendar/core';

    let { date, chunk } = $props();
    //let { date, chunk = $bindable()  } = $props();

    let {displayEventEnd, eventAllUpdated, eventBackgroundColor, eventTextColor, eventColor, eventContent, eventClick,
        eventDidMount, eventClassNames, eventMouseEnter, eventMouseLeave, slotEventOverlap, slotDuration, slotHeight,
        resources, theme,
        _view, _intlEventTime, _interaction, _iClasses, _slotTimeLimits, _tasks , _events} = getContext('state');

    let el = $state();
    let event = $state();
    let display = $state();
    let classes = $state();
    let style = $state();
    let content = $state();
    let timeText = $state();
    let onclick = $derived(!bgEvent(display) && createHandler($eventClick, display));
/*
    _events.subscribe(v => {
      //console.log("dv", event);
      //dv()
     if (event) {
     for (let target of $_events) {
            if (event.id === target.id) {
             chunk,event.start = target.start
             chunk.event.end =  target.end
             console.log("SET",chunk.event)
             break
            }

        }
     }
    });
*/
    $effect.pre(() => {
        event = chunk.event;
      //console.log(event);
        //untrack(() =>  event = chunk.event)
    });

    $effect(() => {
        display = event.display;
        //untrack(() => display = event.display)


        // Style
        let step = $slotDuration.seconds;
        let offset = $_slotTimeLimits.min.seconds;
        let start = (chunk.start - date) / 1000;
        let end = (chunk.end - date) / 1000;
        let top = (start - offset) / step * $slotHeight;
        let height = max((end - start) / step * $slotHeight, $slotHeight);
        let maxHeight = ($_slotTimeLimits.max.seconds - start) / step * $slotHeight;
        let bgColor = event.backgroundColor || resourceBackgroundColor(event, $resources) || $eventBackgroundColor || $eventColor;
        let txtColor = event.textColor || resourceTextColor(event, $resources) || $eventTextColor;

        untrack(() => {
        style =
            `top:${top}px;` +
            `min-height:${height}px;` +
            `height:${height}px;` +
            `max-height:${maxHeight}px;`
        ;
        if (bgColor) {
            style += `background-color:${bgColor};`;
        }
        if (txtColor) {
            style += `color:${txtColor};`;
        }
        if (!bgEvent(display) && !helperEvent(display) || ghostEvent(display)) {
            style +=
                `z-index:${chunk.column + 1};` +
                `left:${100 / chunk.group.columns.length * chunk.column}%;` +
                `width:${100 / chunk.group.columns.length * ($slotEventOverlap ? 0.5 * (1 + chunk.group.columns.length - chunk.column) : 1)}%;`
            ;
        }
        style += event.styles.join(';');

        // Class
        classes = [
            bgEvent(display) ? $theme.bgEvent : $theme.event,
            ...$_iClasses([], event),
            ...createEventClasses($eventClassNames, event, $_view)
        ].join(' ');
       })
    });

    // Content
    $effect(() => {

        [timeText, content] = createEventContent(chunk, $displayEventEnd, $eventContent, $theme, $_intlEventTime, $_view);
    });

    onMount(() => {
    //$effect(() => {
        if (isFunction($eventDidMount)) {
            $eventDidMount({
                event: toEventWithLocalDates(event),
                timeText,
                el,
                view: toViewWithLocalDates($_view)
            });
        }
    });

    //afterUpdate(() => {
    $effect(() => {
        if (isFunction($eventAllUpdated) && !helperEvent(display)) {
            task(() => $eventAllUpdated({view: toViewWithLocalDates($_view)}), 'eau', _tasks);
        }
    });

    function createHandler(fn, display) {
        return !helperEvent(display) && isFunction(fn)
            ? jsEvent => fn({event: toEventWithLocalDates(event), el, jsEvent, view: toViewWithLocalDates($_view)})
            : undefined;
    }

    function createDragHandler(interaction, resize) {
        return interaction.action
            ? jsEvent => interaction.action.drag(
                event,
                jsEvent,
                resize,
                undefined,
                undefined,
                chunk.zeroDuration
            )
            : undefined;
    }

    // Onclick handler
    

    const SvelteComponent = $derived($_interaction.resizer);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<article
    bind:this={el}
    class="{classes}"
    {style}
    role="{onclick ? 'button' : undefined}"
    tabindex="{onclick ? 0 : undefined}"
    {onclick}
    onkeydown={onclick && keyEnter(onclick)}
    onmouseenter={ () => createHandler($eventMouseEnter, display)}
    onmouseleave={ () => createHandler($eventMouseLeave, display)}
    onpointerdown={!bgEvent(display) && !helperEvent(display) && createDragHandler($_interaction)}
>

    <SvelteComponent
        start
        {event}
        on:pointerdown={createDragHandler($_interaction, ['y', 'start'])}
    />
    <div class="{$theme.eventBody}" use:setContent={content}></div>
    <SvelteComponent
        {event}
        on:pointerdown={createDragHandler($_interaction, ['y', 'end'])}
    />

</article>

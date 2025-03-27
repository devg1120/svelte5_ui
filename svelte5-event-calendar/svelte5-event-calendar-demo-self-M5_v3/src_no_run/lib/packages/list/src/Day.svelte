<script lang="ts">
    import { run } from 'svelte/legacy';
    import { untrack } from "svelte";

    import {getContext} from 'svelte';
    import {
        addDay, bgEvent, cloneDate, createEventChunk, datesEqual, eventIntersects, outsideRange, setContent, setPayload,
        sortEventChunks, toISOString
    } from '@event-calendar/core';
    import Event from './Event.svelte';

    let { date } = $props();

    let {_events, _interaction, _intlListDay, _intlListDaySide, _today,
        resources, filterEventsWithResources, highlightedDates, theme, validRange} = getContext('state');

    let el = $state();
    let chunks = $state([]);
    let isToday = $derived(datesEqual(date, $_today)), highlight = $derived($highlightedDates.some(d => datesEqual(d, date))), disabled = $state();
    let datetime = $derived(toISOString(date, 10));

    
    
    $effect(() => {
        disabled = outsideRange(date, $validRange);
    });
    

    $effect(() => {
 untrack(() => {      

        if (!disabled) {
            chunks = [];
            let start = date;
            let end = addDay(cloneDate(date));
            for (let event of $_events) {
                if (!bgEvent(event.display) && eventIntersects(event, start, end, $filterEventsWithResources ? $resources : undefined)) {
                    let chunk = createEventChunk(event, start, end);
                    chunks.push(chunk);
                }
            }
            sortEventChunks(chunks);
        }
    });
    });

    // dateFromPoint
    $effect(() => {
        if (el) {
            setPayload(el, () => ({allDay: true, date, resource: undefined, dayEl: el, disabled}));
        }
    });
</script>

{#if chunks.length}
    <div
        bind:this={el}
        class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday ? ' ' + $theme.today : ''}{highlight ? ' ' + $theme.highlight : ''}"
        role="listitem"
        onpointerdown={$_interaction.action?.select}
    >
        <h4 class="{$theme.dayHead}">
            <time {datetime} use:setContent={$_intlListDay.format(date)}></time>
            <time class="{$theme.daySide}" {datetime} use:setContent={$_intlListDaySide.format(date)}></time>
        GUSA</h4>
        {#each chunks as chunk (chunk.event)}
            <Event {chunk}/>
        {/each}
    </div>
{/if}

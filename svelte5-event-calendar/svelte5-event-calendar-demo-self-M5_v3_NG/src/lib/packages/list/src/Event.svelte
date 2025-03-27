<script lang="ts">
    import { run } from 'svelte/legacy';
    import { untrack } from "svelte";

    //import {afterUpdate, getContext, onMount} from 'svelte';
    import { getContext, onMount} from 'svelte';
    import {
        createEventContent,
        toEventWithLocalDates,
        toViewWithLocalDates,
        setContent,
        createEventClasses,
        keyEnter,
        resourceBackgroundColor,
        resourceTextColor,
        task,
        isFunction
    } from '@event-calendar/core';

    let { chunk } = $props();

    let {displayEventEnd, eventAllUpdated, eventBackgroundColor, eventTextColor, eventColor, eventContent,
        eventClassNames, eventClick, eventDidMount, eventMouseEnter, eventMouseLeave, resources, theme,
        _view, _intlEventTime, _interaction, _tasks} = getContext('state');

    let el = $state();
    let event = $state();
    let classes = $state();
    let style = $state();
    //  Content
    let content ;
    //  Content
    let timeText ;
    [timeText, content] = createEventContent(chunk, $displayEventEnd, $eventContent, $theme, $_intlEventTime, $_view);

    let onclick = $derived(createHandler($eventClick));

    $effect(() => {
        event = chunk.event;
    });

    $effect(() => {
     untrack(() => {      

        // Class & Style
        style = '';
        let bgColor = event.backgroundColor || resourceBackgroundColor(event, $resources) || $eventBackgroundColor || $eventColor;
        if (bgColor) {
            style = `background-color:${bgColor};`;
        }
        let txtColor = event.textColor || resourceTextColor(event, $resources) || $eventTextColor;
        if (txtColor) {
            style += `color:${txtColor};`;
        }
        style += event.styles.join(';');

        classes = [
            $theme.event,
            ...createEventClasses($eventClassNames, event, $_view)
        ].join(' ');
    });
    });

    

    onMount(() => {
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
        if (isFunction($eventAllUpdated)) {
            task(() => $eventAllUpdated({view: toViewWithLocalDates($_view)}), 'eau', _tasks);
        }
    });

    function createHandler(fn) {
        return isFunction(fn)
            ? jsEvent => fn({event: toEventWithLocalDates(event), el, jsEvent, view: toViewWithLocalDates($_view)})
            : undefined;
    }

    // Onclick handler
    
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<article
    bind:this={el}
    class="{classes}"
    role="{onclick ? 'button' : undefined}"
    tabindex="{onclick ? 0 : undefined}"
    {onclick}
    onkeydown={onclick && keyEnter(onclick)}
    onmouseenter={createHandler($eventMouseEnter)}
    onmouseleave={createHandler($eventMouseLeave)}
    onpointerdown={$_interaction.action?.noAction}
>
    <div class="{$theme.eventTag}" {style}></div>
    <div class="{$theme.eventBody}" use:setContent={content}></div>
</article>

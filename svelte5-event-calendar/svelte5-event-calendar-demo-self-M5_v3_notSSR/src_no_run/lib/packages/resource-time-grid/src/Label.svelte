<script lang="ts">
    import { run } from 'svelte/legacy';
    import { untrack } from "svelte";

    //import {getContext, onMount, afterUpdate, createEventDispatcher} from 'svelte';
    import {getContext, onMount, createEventDispatcher} from 'svelte';
    import {setContent, toLocalDate, isFunction} from '@event-calendar/core';

    let { resource, date = undefined } = $props();

    let {resourceLabelContent, resourceLabelDidMount, _intlDayHeaderAL} = getContext('state');

    const dispatch = createEventDispatcher();

    let el = $state();
    let content = $state();
    let ariaLabel;

    // Content
    $effect(() => {
 untrack(() => {
        if ($resourceLabelContent) {
            content = isFunction($resourceLabelContent)
                ? $resourceLabelContent({
                    resource,
                    date: date ? toLocalDate(date) : undefined,
                })
                : $resourceLabelContent;
        } else {
            content = resource.title;
        }
 })
    });

    onMount(() => {
        if (isFunction($resourceLabelDidMount)) {
            $resourceLabelDidMount({
                resource,
                date: date ? toLocalDate(date) : undefined,
                el
            });
        }
    });

   // afterUpdate(() => {
   $effect(() => {
        if (date) {
            ariaLabel = $_intlDayHeaderAL.format(date) + ', ' + el.innerText;
        } else {
            ariaLabel = undefined;
            dispatch('text', el.innerText);
        }
    });
   
</script>

<span
    bind:this={el}
    aria-label="{ariaLabel}"
    use:setContent={content}
></span>

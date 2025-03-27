<script>
    //import {getContext, afterUpdate} from 'svelte';
 import { run } from 'svelte/legacy';
    import {getContext } from 'svelte';
    import {max} from '@event-calendar/core';
    import Label from './Label.svelte';
    import Expander from './Expander.svelte';

    let {_viewResources, _headerEl, _resHs, _sidebarEl, _nestedResources, theme} = getContext('state');

    let titleHeight = 0;

    //afterUpdate(() => {

    titleHeight = 49;
    //console.log(_headerEl.clientHeight)
    //titleHeight = $_headerEl.clientHeight
/*
    $effect(() => {
        //titleHeight = $_headerEl.clientHeight;
        console.log($_headerEl.clientHeight)
    });
  */

/*
    _headerEl.subscribe(v => {
        if ( $_headerEl.clientHeight !== 'undefined') {

           titleHeight = $_headerEl.clientHeight;
        }
    });
*/

</script>

<div class="{$theme.sidebar}">
    <div class="{$theme.sidebarTitle}" style="flex-basis: {titleHeight}px"></div>
    <div class="{$theme.content}" bind:this={$_sidebarEl}>
        {#each $_viewResources as resource}
            <div class="{$theme.resource}" style="flex-basis: {max($_resHs.get(resource) ?? 0, 34)}px" role="rowheader">
                {#if $_nestedResources}
                    <Expander {resource} />
                {/if}
                <Label {resource}/>
            </div>
        {/each}
    </div>
</div>

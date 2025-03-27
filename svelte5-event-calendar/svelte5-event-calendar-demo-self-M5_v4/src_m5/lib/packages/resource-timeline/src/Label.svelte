<script lang="ts">
  import { run } from "svelte/legacy";

  import { getContext, onMount } from "svelte";
  import { setContent, toLocalDate, isFunction } from "@event-calendar/core";

  let { resource, date = undefined } = $props();

  let { resourceLabelContent, resourceLabelDidMount } = getContext("state");

  let el = $state();
  let content = $state();

  // Content
  run(() => {
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
  });

  onMount(() => {
    if (isFunction($resourceLabelDidMount)) {
      $resourceLabelDidMount({
        resource,
        date: date ? toLocalDate(date) : undefined,
        el,
      });
    }
  });
</script>

<span bind:this={el} use:setContent={content}></span>

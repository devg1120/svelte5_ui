<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface $$Props {
    divClass?: string;
    class?: string;
  }

  export let divClass: $$Props['divClass'] = 'p-4 space-y-4 max-w-md rounded-sm border border-gray-200 divide-y divide-gray-200 shadow-sm animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700';
</script>

<div role="status" class={twMerge(divClass, $$props.class)}>
  <div class="flex justify-between items-center">
    <div>
      <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
      <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
  </div>
  <div class="flex justify-between items-center pt-4">
    <div>
      <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
      <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
  </div>
  <div class="flex justify-between items-center pt-4">
    <div>
      <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
      <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
  </div>
  <div class="flex justify-between items-center pt-4">
    <div>
      <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
      <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
  </div>
  <div class="flex justify-between items-center pt-4">
    <div>
      <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
      <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
  </div>
  <span class="sr-only">Loading...</span>
</div>

<!--
@component
[Go to docs](https://flowbite-svelte.com/)
## Props
@prop export let divClass: $$Props['divClass'] = 'p-4 space-y-4 max-w-md rounded-sm border border-gray-200 divide-y divide-gray-200 shadow-sm animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700';
-->

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Input } from "flowbite-svelte";
  import { BarLoader } from "svelte-loading-spinners";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import type { UserSuggestion } from "$lib/interfaces/user";
  import theme_store from "$lib/stores/theme_store";

  export let suggestions: Array<UserSuggestion> = [];
  export let loading: boolean = false;
  export let searchTerm: string = "";
  let filteredSuggestions: Array<UserSuggestion> = [];

  const dispatch = createEventDispatcher();

  const makeMatchBold = (string: string, matched_part: string) => {
    let match = matched_part.toLowerCase();
    let matchIndex = string.toLowerCase().indexOf(match);
    if (matchIndex === -1) return string;
    const ret: string =
      string.substring(0, matchIndex) +
      "<strong>" +
      string.substring(matchIndex, matchIndex + match.length) +
      "</strong>" +
      string.substring(matchIndex + match.length);
    return ret;
  };

  const selectSuggestion = (
    index: number | string,
    suggestion: string,
    full_name: string,
    dp_url: string
  ) => {
    searchTerm = suggestion;
    dispatch("select", { index, suggestion, full_name, dp_url });
    searchTerm = "";
  };

  $: if (suggestions.length && searchTerm) {
    filteredSuggestions = suggestions
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  } else {
    filteredSuggestions = [];
  }
</script>

<div class="relative w-full">
  <Input placeholder="Type to search..." bind:value={searchTerm} />
  {#if loading}
    <div class="absolute w-full mt-2 flex justify-center items-start">
      <div>
        <BarLoader
          color={get_color_hex_code($theme_store.accentCurrentColor)}
        />
        <span class="block text-center mt-2 font-bold text-lg">Loading...</span>
      </div>
    </div>
  {:else if filteredSuggestions.length === 0 && searchTerm !== ""}
    <div
      class="absolute top-full z-10 w-full shadow-lg rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      <div
        class="px-4 py-2 cursor-default select-none text-gray-600 dark:text-gray-300"
      >
        No match found
      </div>
    </div>
  {:else}
    <ul
      class="absolute top-full z-10 w-full shadow-lg rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {#each filteredSuggestions as suggestion (suggestion.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          class="px-4 py-2 cursor-default select-none hover:bg-gray-300 dark:hover:bg-gray-600"
          on:click={() =>
            selectSuggestion(
              suggestion.id,
              suggestion.name,
              suggestion.full_name,
              suggestion.dp_url
            )}
        >
          {@html makeMatchBold(suggestion.name, searchTerm)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

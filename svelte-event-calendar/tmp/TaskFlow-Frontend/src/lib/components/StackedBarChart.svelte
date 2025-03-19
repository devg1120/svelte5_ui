<script lang="ts">
  import Chart from "./Chart.svelte";
  import theme_store from "$lib/stores/theme_store";

  let loading = false;
  export let options: any;

  $: options.theme.mode = $theme_store.darkMode ? "dark" : "light";
</script>

{#if loading}
  <div class="spinner"></div>
{:else}
  {#key $theme_store.darkMode}
    <Chart bind:options />
  {/key}
{/if}

<style>
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-left-color: #09f;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 50px auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

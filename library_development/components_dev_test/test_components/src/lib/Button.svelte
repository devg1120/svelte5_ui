
<script>
  /** @type {'default' | 'pill' | 'outline'} */
  export let style = 'default';

  /** @type {string} */
  export let href = null;
</script>

{#if href}
  <a {href}> 
   <button class={style}>リンクボタン</button>
  </a>
{:else}
  <button class={style}>ボタン</button>
{/if}

<style>
  .default {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }

  .pill {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full;
  }

  .outline {
    @apply bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded;
  }
</style>



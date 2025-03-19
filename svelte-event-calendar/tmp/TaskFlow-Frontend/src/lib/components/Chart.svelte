<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let options: any;
  let chart: ApexCharts | undefined;

  let chartContainer: HTMLElement;
  let rendered: boolean = false;

  onMount(async () => {
    const ApexCharts = (await import("apexcharts")).default;

    if (chartContainer && options) {
      chart = new ApexCharts(chartContainer, options);
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });

  $: {
    if (chart && options) {
      if (!rendered) {
        chart.render();
        rendered = true;
      } else {
        chart.updateOptions(options);
      }
    }
  }
</script>

<div bind:this={chartContainer}></div>

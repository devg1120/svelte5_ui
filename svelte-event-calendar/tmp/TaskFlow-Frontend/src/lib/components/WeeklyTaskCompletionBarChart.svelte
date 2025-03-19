<script lang="ts">
  import Chart from "./Chart.svelte";
  import { onMount } from "svelte";
  import { format, parseISO } from "date-fns";
  import server_url from "$lib/stores/server_store";
  import theme_store from "$lib/stores/theme_store";

  let loading = false;
  let options: any;

  async function fetchDailyTaskCompletion() {
    const token = localStorage.getItem("access_token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };
    const request = {
      method: "GET",
      headers: headers,
    };
    try {
      const url = new URL(`${$server_url}/insight/weekly-task-completion`);
      url.searchParams.set("start_date", "-1");
      url.searchParams.set("end_date", "-1");
      const response = await fetch(url.toString(), request);
      const res = await response.json();

      let data = [] as any;

      res.forEach((item: any) => {
        const date = parseISO(item.start_date);
        // Convert start_date to milliseconds since epoch, which is expected for datetime type xaxis in ApexCharts
        data.push({ x: date.getTime(), y: item.done });
      });
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  let data: any;

  onMount(async () => {
    try {
      loading = true;
      data = (await fetchDailyTaskCompletion()) as any;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      loading = false;
    }
  });

  $: {
    if (data) {
      options = {
        theme: {
          mode: $theme_store.darkMode ? "dark" : "light",
        },
        series: [
          {
            name: "Tasks Completed",
            data: data,
          },
        ],
        chart: {
          type: "bar",
          background: "transparent",
          animations: {
            enabled: true,
          },
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          type: "datetime",
          title: {
            text: "Week Starting Date",
          },
          labels: {
            formatter: function (val: any) {
              return format(new Date(val), "MMM dd, yyyy");
            },
          },
        },
        yaxis: {
          title: {
            text: "Tasks Completed",
          },
        },
        annotations: {
          xaxis: [
            {
              x: data[0].x,
              strokeDashArray: 0,
              borderColor: "#775DD0",
              label: {
                borderColor: "#775DD0",
                style: {
                  color: "#fff",
                  background: "#775DD0",
                },
                text: "Account Created",
              },
            },
          ],
        },
        tooltip: {
          x: {
            format: "MMM dd, yyyy",
          },
          y: {
            formatter: function (val: any) {
              return val.toFixed(0);
            },
          },
        },
        title: {
          text: "Weekly Task Completion Statistics",
          align: "left",
        },
      };
    }
  }
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

<script lang="ts">
  import theme_store from "$lib/stores/theme_store";
  import InsightOverview from "$lib/components/InsightOverview.svelte";
  import DailyTaskCompletionLineChart from "$lib/components/DailyTaskCompletionLineChart.svelte";
  import WeeklyTaskCompletionBarChart from "$lib/components/WeeklyTaskCompletionBarChart.svelte";
  import TaskProgressionPieChart from "$lib/components/TaskProgressionPieChart.svelte";
  import StackedBarChart from "$lib/components/StackedBarChart.svelte";
  import Heatmap from "$lib/components/Heatmap.svelte";

  function getTitle(i: number) {
    if (i == 0) return "Time Contribution";
    else if (i == 1) return "CheckList Contribution";
    else if (i == 2) return "Task Contribution";
    else return "Board Contribution";
  }

  let heatmapOptions = {
    chart: {
      type: "heatmap",
      background: "transparent",
    },
    theme: {
      mode: $theme_store.darkMode ? "dark" : "light",
    },
    series: Array.from({ length: 4 }, (_, i) => ({
      name: getTitle(i),
      data: Array.from({ length: 24 }, (_, j) => ({
        x: `Day ${j + 1}`,
        y: Math.floor(Math.random() * 100),
      })),
    })),
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 25,
              name: "low",
              color: "#00A100",
            },
            {
              from: 26,
              to: 75,
              name: "medium",
              color: "#128FD9",
            },
            {
              from: 76,
              to: 100,
              name: "high",
              color: "#FFB200",
            },
          ],
        },
      },
    },
  };

  let stackedBarChartOptions = {
    chart: {
      type: "bar",
      stacked: true,
      background: "transparent",
    },
    theme: {
      mode: $theme_store.darkMode ? "dark" : "light",
    },
    series: [
      {
        name: "CSE406 Project | Wazuh",
        data: [44, 55, 41, 67, 22, 43],
      },
      {
        name: "ISD Project | ExploreMate",
        data: [13, 23, 20, 8, 13, 27],
      },
      {
        name: "Language Model of Phylogenetic Trees",
        data: [11, 17, 15, 15, 21, 14],
      },
      {
        name: "Renewable Energy Optimization",
        data: [21, 7, 25, 13, 22, 8],
      },
    ],
    xaxis: {
      categories: [
        "2021 Q1",
        "2021 Q2",
        "2021 Q3",
        "2021 Q4",
        "2022 Q1",
        "2022 Q2",
      ],
      title: {
        text: "Time",
      },
    },
    yaxis: {
      title: {
        text: "Number of checklist items completed",
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
  };

  let containerClass: string =
    "flex flex-col shadow-lg rounded-lg overflow-hidden dark:bg-gray-800 bg-white";
  let titleClass: string =
    "text-2xl font-bold text-gray-800 dark:text-white mb-4 p-4 text-center";
  let cardClass: string = "flex-grow shadow-lg rounded-lg overflow-hidden p-4";
</script>

<svelte:head>
  <title>Insights</title>
</svelte:head>

<div
  class="mx-8 mt-8 sm:mx-4 md:mx-8 lg:mx-10 xl:mx-20 2xl:mx-32 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-12 p-5"
>
  <div class={containerClass}>
    <h2 class={titleClass}>Insights Overview</h2>
    <div class={cardClass}>
      <InsightOverview />
    </div>
  </div>

  <div class={containerClass}>
    <h2 class={titleClass}>Daily Task Completion</h2>
    <div class={cardClass}>
      <DailyTaskCompletionLineChart />
    </div>
  </div>

  <div class={containerClass}>
    <h2 class={titleClass}>Weekly Task Completion</h2>
    <div class={cardClass}>
      <WeeklyTaskCompletionBarChart />
    </div>
  </div>

  <div class={containerClass}>
    <h2 class={titleClass}>Task Progression</h2>
    <div class={cardClass}>
      <TaskProgressionPieChart />
    </div>
  </div>

  <div class={containerClass}>
    <h2 class={titleClass}>Performance Analysis</h2>
    <div class={cardClass}>
      <StackedBarChart options={stackedBarChartOptions} />
    </div>
  </div>

  <div class={containerClass}>
    <h2 class={titleClass}>Daily Task Heatmap</h2>
    <div class={cardClass}>
      <Heatmap options={heatmapOptions} />
    </div>
  </div>
</div>

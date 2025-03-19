<script lang="ts">
  import server_url from "$lib/stores/server_store";
  import { onMount } from "svelte";
  async function fetchInsightOverviewStats() {
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
      const response = await fetch(
        $server_url + "/insight/task-completion",
        request
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  let todayTaskDue: number = 0;
  let todayTaskCompleted: number = 0;
  let todayTaskOverdue: number = 0;

  let thisWeekTaskDue: number = 0;
  let thisWeekTaskCompleted: number = 0;
  let thisWeekTaskOverdue: number = 0;

  let thisMonthTaskDue: number = 0;
  let thisMonthTaskCompleted: number = 0;
  let thisMonthTaskOverdue: number = 0;
  let loading: boolean = false;

  onMount(async () => {
    try {
      // console.log("Fetching Insight Overview");
      loading = true;
      const data = await fetchInsightOverviewStats();

      todayTaskDue = data.today_task_due;
      thisWeekTaskDue = data.this_week_task_due;
      thisMonthTaskDue = data.this_month_task_due;

      todayTaskOverdue = data.today_task_overdue;
      thisWeekTaskOverdue = data.this_week_task_overdue;
      thisMonthTaskOverdue = data.this_month_task_overdue;

      todayTaskCompleted = data.today_task_completed;
      thisWeekTaskCompleted = data.this_week_task_completed;
      thisMonthTaskCompleted = data.this_month_task_completed;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      loading = false;
    }
  });

  let title_class: string = "text-sm text-black dark:text-white text-center";
  let value_class: string = "text-2xl font-bold text-center";
  let wrapper_class: string =
    "p-4 rounded-lg shadow-xl bg-accent-500 dark:bg-accent-600 border border-accent-200 dark:border-accent-700";
  let skeleton_class: string =
    "animate-pulse bg-gray-300 dark:bg-gray-700 h-6 rounded";
</script>

{#if loading}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each Array(9) as _, i}
      <div class={wrapper_class}>
        <p class={skeleton_class}>&nbsp;</p>
        <p class={`${skeleton_class} mt-2`}></p>
      </div>
    {/each}
  </div>
{:else}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div class={wrapper_class}>
      <p class={title_class}>Task Due Today</p>
      <p class={value_class}>{todayTaskDue}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Completed Today</p>
      <p class={value_class}>{todayTaskCompleted}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Overdue Today</p>
      <p class={value_class}>{todayTaskOverdue}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Due This Week</p>
      <p class={value_class}>{thisWeekTaskDue}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Completed This Week</p>
      <p class={value_class}>{thisWeekTaskCompleted}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Overdue This Week</p>
      <p class={value_class}>{thisWeekTaskOverdue}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Due This Month</p>
      <p class={value_class}>{thisMonthTaskDue}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Completed This Month</p>
      <p class={value_class}>{thisMonthTaskCompleted}</p>
    </div>

    <div class={wrapper_class}>
      <p class={title_class}>Task Overdue This Month</p>
      <p class={value_class}>{thisMonthTaskOverdue}</p>
    </div>
  </div>
{/if}

<style>
  .animate-pulse {
    background: linear-gradient(90deg, #ececec 25%, #f4f4f4 50%, #ececec 75%);
    background-size: 200% 100%;
    animation: pulse 1.5s infinite ease-in-out;
  }
  @keyframes pulse {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>

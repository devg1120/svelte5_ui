<script lang="ts">
  import { onMount } from "svelte";
  import server_url from "$lib/stores/server_store";
  import { RingLoader } from "svelte-loading-spinners";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import theme_store from "$lib/stores/theme_store";

  let fetching: boolean = false;

  async function fetchDashboardStuffs() {
    const token: string = localStorage.getItem("access_token") || "";
    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    const request = {
      method: "GET",
      headers: headers,
    };

    try {
      const response = await fetch(
        $server_url + "/insight/dashboard-summary",
        request
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  interface DashboardStuffs {
    totalTasks: number;
    totalCompletedTasks: number;
    activeBoardCount: number;
    upcomingDeadlines: number;
  }

  let dashboardStuffs: DashboardStuffs = {
    totalTasks: 0,
    totalCompletedTasks: 0,
    activeBoardCount: 0,
    upcomingDeadlines: 0,
  };

  onMount(async () => {
    try {
      fetching = true;
      const data = await fetchDashboardStuffs();
      // console.log(data);
      dashboardStuffs = {
        totalTasks: data.total_tasks,
        totalCompletedTasks: data.completed_tasks,
        activeBoardCount: data.active_board_count,
        upcomingDeadlines: data.upcoming_tasks,
      };
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      fetching = false;
    }
  });
</script>

<div
  class="grid grid-cols-1 gap-4 p-4 mb-4 rounded-lg overview-section md:grid-cols-3"
>
  {#if fetching}
    <div class="flex items-center justify-center col-span-3">
      <div class="mr-4">
        <RingLoader
          color={get_color_hex_code($theme_store.accentCurrentColor)}
        />
      </div>
      <span
        class="mt-4 font-bold tracking-wider text-accent-900 dark:text-accent-100 text-3xl"
      >
        Fetching Dashboard Stuffs...
      </span>
    </div>
  {:else}
    <div class="p-4 bg-accent-100 dark:bg-accent-800 rounded-lg shadow card">
      <h3 class="text-lg font-semibold">Task Completion Rate</h3>
      <p class="text-2xl font-bold">
        {dashboardStuffs.totalCompletedTasks}/{dashboardStuffs.totalTasks}
        Tasks Across Boards
      </p>
      <p class="text-accent-600">
        {dashboardStuffs.totalTasks == 0
          ? "No tasks available"
          : `${Math.floor(
              (dashboardStuffs.totalCompletedTasks /
                dashboardStuffs.totalTasks) *
                100
            )}% of tasks completed`}
      </p>
    </div>

    <div class="p-4 bg-accent-100 dark:bg-accent-800 rounded-lg shadow card">
      <h3 class="text-lg font-semibold">Active Boards</h3>
      <p class="text-2xl font-bold">{dashboardStuffs.activeBoardCount}</p>
      <p class="text-accent-600">boards currently active</p>
    </div>

    <div class="p-4 bg-accent-100 dark:bg-accent-800 rounded-lg shadow card">
      <h3 class="text-lg font-semibold">Upcoming Deadlines</h3>
      <p class="text-2xl font-bold">
        {dashboardStuffs.upcomingDeadlines}
      </p>
      <p class="text-accent-600">Tasks due this week</p>
    </div>
  {/if}
</div>

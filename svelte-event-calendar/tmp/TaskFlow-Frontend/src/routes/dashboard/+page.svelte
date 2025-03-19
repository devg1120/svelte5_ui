<script lang="ts">
  import type { BoardDashboardInfo } from "$lib/interfaces/board";
  import server_url from "$lib/stores/server_store";
  import BoardListView from "$lib/components/BoardListView.svelte";
  import DashBoardOverview from "$lib/components/DashBoardOverview.svelte";
  import NewBoardDrawer from "$lib/components/NewBoardDrawer.svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  let hidden = true;

  function handleBoardCreated(event: any) {
    // console.log("Board created", event);
    all_boards.push(event.detail);
    all_boards = all_boards;
  }

  async function fetchBoards() {
    const token: string = localStorage.getItem("access_token") || "";
    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch($server_url + "/board/get-all", {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  let boards_loading: boolean = true;
  let all_boards: BoardDashboardInfo[] = [];

  onMount(async () => {
    // todo: take the fetch in page load
    try {
      boards_loading = true;
      all_boards = await fetchBoards();
      all_boards.forEach((board) => {
        board.progress = Math.floor(board.progress);
        if (board.progress < 5) board.status = "Not Started";
        else if (board.progress < 97) board.status = "In Progress";
        else board.status = "Completed";
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      boards_loading = false;
    }
  });
</script>

<svelte:head>
  <title>User Dashboard</title>
</svelte:head>

<div class="min-h-screen p-8 bg-accent-100 dark:bg-accent-900">
  <header class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold">Dashboard</h1>
    <div class="flex items-center space-x-4">
      <div class="profile-menu"></div>
    </div>
  </header>

  <div class="grid grid-cols-12 gap-4 main-content">
    <section class="col-span-12">
      <DashBoardOverview />

      <BoardListView bind:all_boards bind:loading={boards_loading} />
    </section>
  </div>

  <button
    class="fixed z-10 mb-2 ml-10 mr-2 text-sm font-medium text-accent-900 hover:text-accent-50 bg-accent-50 hover:bg-accent-900 dark:hover:bg-accent-100 rounded-full shadow-xl h-14 w-14 bottom-12 right-12 focus:ring-4 dark:hover:text-accent-50 lg:ml-40 focus:outline-none transition-all"
    on:click={() => (hidden = false)}
  >
    <PlusOutline class="w-6 h-6 m-auto" />
  </button>

  <NewBoardDrawer bind:hidden on:boardCreated={handleBoardCreated}
  ></NewBoardDrawer>
</div>

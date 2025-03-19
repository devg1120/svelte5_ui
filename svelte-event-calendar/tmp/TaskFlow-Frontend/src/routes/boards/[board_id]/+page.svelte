<script lang="ts">
  import ListCard from "./ListCard.svelte";
  import NewListModal from "$lib/components/NewListModal.svelte";
  import server_url from "$lib/stores/server_store";
  import type { BoardContent } from "$lib/interfaces/board";
  import type { BoardContentListForm } from "$lib/interfaces/list";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Wave } from "svelte-loading-spinners";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import theme_store from "$lib/stores/theme_store";
  import { fade } from "svelte/transition";
  import { Input } from "flowbite-svelte";
  import { SearchOutline } from "flowbite-svelte-icons";
  import BoardViewDrawer from "$lib/components/BoardViewDrawer.svelte";
  import { format, formatDistanceToNow } from "date-fns";

  let addListModal: boolean = false;
  let hiddenSideBar: boolean = true;
  let search_term: string = "";

  $: formattedDeadline = board_content
    ? format(new Date(board_content.board_deadline), "MMMM dd, yyyy")
    : "";
  $: timeLeft = board_content
    ? formatDistanceToNow(new Date(board_content.board_deadline), {
        addSuffix: true,
      })
    : "";

  function handleListCreated(event: any) {
    board_content.board_lists = [
      ...board_content.board_lists,
      {
        list_id: event.detail.list_id,
        list_name: event.detail.list_name,
        list_deadline: event.detail.list_deadline,
        list_tasks: event.detail.list_tasks,
      },
    ];
  }

  async function fetchBoardContent() {
    const token: string = localStorage.getItem("access_token") || "";
    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    try {
      const url = new URL($server_url + "/board/get-content");
      // console.log("id", $page.params.board_id);
      url.searchParams.set("board_id", $page.params.board_id);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  function stripTimezoneFromTimestamp(timestamp: string): string {
    // This regex matches YYYY-MM-DDTHH:MM:SS and captures this part, ignoring timezone info
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/;
    const match = timestamp.match(regex);
    return match ? match[1] : ""; // Return the captured datetime or an empty string if no match
  }

  let spinner_color: string = "#000000";
  $: spinner_color = get_color_hex_code($theme_store.accentCurrentColor);

  let content_loading: boolean = false;
  let board_content: BoardContent;

  let task_lists: BoardContentListForm[] = Array<BoardContentListForm>();

  onMount(async () => {
    // console.log("Fetching board content");
    try {
      content_loading = true;
      if ($page.params.board_id) {
        board_content = await fetchBoardContent();
      }
      board_content.board_deadline = stripTimezoneFromTimestamp(
        board_content.board_deadline
      );
      board_content.board_lists.forEach((list) => {
        list.list_deadline = stripTimezoneFromTimestamp(list.list_deadline);
        task_lists.push(list);
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      content_loading = false;
    }
  });

  $: {
    if (board_content) {
      task_lists = board_content.board_lists.filter((list) => {
        let keep: boolean = list.list_name
          .toLowerCase()
          .includes(search_term.toLowerCase());
        if (list.list_tasks) {
          list.list_tasks.forEach((task) => {
            keep =
              keep ||
              task.task_name.toLowerCase().includes(search_term.toLowerCase());
          });
        }
        return keep;
      });
    }
  }
</script>

<svelte:head>
  <title>Board Content</title>
</svelte:head>

<div class="flex h-screen bg-accent-100 dark:bg-accent-900">
  <BoardViewDrawer bind:board={board_content} bind:hiddenSideBar />
  <div
    class={`flex-grow p-4 ${
      !hiddenSideBar ? "ml-72" : "ml-0"
    } transition-margin duration-300
    overflow-auto
    `}
  >
    {#if content_loading}
      <div class="flex flex-col items-center justify-center h-full">
        <div>
          <Wave color={spinner_color} size="100" duration="0.75s" />
        </div>
        <span class="mt-4 text-3xl font-bold tracking-wider">
          Loading Board Content...
        </span>
      </div>
    {:else}
      <div class="flex items-center justify-between my-4">
        {#if board_content}
          <div class="my-4">
            <h2 class="text-xl font-semibold mb-2 text-primary">
              {board_content.board_name}
            </h2>
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-4">
              <p class="text-md text-gray-600 dark:text-gray-400 mb-4">
                {board_content.board_description}
              </p>
              <p class="text-md font-semibold text-accent">
                Deadline: {formattedDeadline} ({timeLeft})
              </p>
            </div>
          </div>
        {/if}

        <div class="flex space-x-2">
          <!-- Filter dropdowns or sorting controls can be added here -->
          <Input
            id="search"
            placeholder="Search Lists"
            size="md"
            bind:value={search_term}
            class="dark:bg-accent-800 border-accent-50 dark:border-accent-50 text-accent-50"
          >
            <SearchOutline slot="left" class="w-6 h-6 text-accent-50 " />
          </Input>
        </div>
      </div>

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {#if task_lists != undefined}
          {#each task_lists as list}
            <ListCard bind:list />
          {/each}
        {/if}
        <button
          class="p-3 rounded text-ink-light bg-accent-200 dark:text-ink-dark dark:bg-accent-700 hover:bg-accent-600 dark:hover:bg-accent-600"
          on:click={() => (addListModal = true)}>+ Add another list</button
        >
      </div>
    {/if}
  </div>
</div>

{#if addListModal}
  <div transition:fade={{ duration: 250 }}>
    <NewListModal
      bind:showModal={addListModal}
      on:listCreated={handleListCreated}
    />
  </div>
{/if}

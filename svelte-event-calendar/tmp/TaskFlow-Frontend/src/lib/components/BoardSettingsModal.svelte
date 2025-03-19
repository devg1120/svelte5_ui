<script lang="ts">
  import { Modal, Button, Input, Label, Textarea } from "flowbite-svelte";
  import type { BoardContent } from "$lib/interfaces/board";
  import ListUpdateCard from "./ListUpdateCard.svelte";
  import server_url from "$lib/stores/server_store";
  import { Spinner } from "flowbite-svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { createEventDispatcher } from "svelte";

  export let showModal: boolean = false;
  export let board: BoardContent;

  const dispatch = createEventDispatcher();

  let name: string = "";
  let description: string = "";
  let deadline: string = "";

  name = board?.board_name;
  description = board?.board_description;
  deadline = board?.board_deadline;

  let updatingBoard: boolean = false;

  async function updateBoard() {
    try {
      const response = await fetch($server_url + "/board/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("access_token") || "",
        },
        body: JSON.stringify({
          board_id: board.board_id,
          board_name: name,
          board_description: description,
          board_deadline: deadline,
        }),
      });
      if (!response.ok) throw new Error("Failed to update board");
      const data = await response.json();
      dispatch("boardUpdated", {
        board_id: board.board_id,
        board_name: name,
        due_timestamp: deadline,
        description: description,
      });
      return data;
    } catch (error) {
      console.error("Error updating board:", error);
      throw new Error("Failed to update board");
    }
  }

  function handleListUpdate(event: any) {
    const idx = board.board_lists.findIndex(
      (list) => list.list_id === event.detail.list_id
    );
    if (idx === -1) return;
    board.board_lists[idx] = {
      ...board.board_lists[idx],
      list_name: event.detail.list_name,
      list_deadline: event.detail.list_deadline,
    };
    board = { ...board };
  }

  function handleListDelete(event: any) {
    const idx = board.board_lists.findIndex(
      (list) => list.list_id === event.detail.list_id
    );
    if (idx === -1) return;
    board.board_lists.splice(idx, 1);
    board = { ...board };
  }
</script>

{#if board !== undefined}
  <Modal bind:open={showModal} size="lg" autoclose={false}>
    <form class="flex flex-col space-y-6">
      <h3 class="mb-4 text-xl font-medium text-accent-900 dark:text-accent-100">
        <strong> {board.board_name} </strong>
      </h3>
      <Label>
        <span>Board Title</span>
        <Input type="text" required bind:value={name} />
      </Label>
      <Label>
        <span>Board Description</span>
        <Textarea bind:value={description} rows="3" />
      </Label>
      <Label>
        <span>Board Deadline</span>
        <Input type="datetime-local" bind:value={deadline} />
      </Label>
      <div class="flex justify-center mt-4">
        {#if updatingBoard}
          <Button
            disabled
            type="button"
            class="w-1/3 md:w-1/4 bg-accent-50 hover:bg-accent-600 text-accent-900 dark:bg-accent-50 dark:hover:bg-accent-600 disabled:hover:bg-accent-50 disabled:dark:hover:bg-accent-50 disabled:opacity-100"
          >
            <Spinner class="me-3" size="4" color="white" />
            Saving Changes</Button
          >
        {:else}
          <Button
            disabled={name === board.board_name &&
              description === board.board_description &&
              deadline === board.board_deadline}
            type="button"
            class="w-1/3 md:w-1/4 bg-accent-50 hover:bg-accent-600 text-accent-100 font-bold dark:bg-accent-50 dark:hover:bg-accent-600 disabled:hover:bg-accent-50 disabled:dark:hover:bg-accent-50"
            on:click={() => {
              updatingBoard = true;
              updateBoard()
                .then(() => {
                  updatingBoard = false;
                  showModal = false;
                  toast.push("Board updated successfully", {
                    theme: {
                      "--toastBackground": "var(--accent-50)",
                      "--toastProgressBackground": "var(--accent-100)",
                      "--toastColor": "black",
                    },
                  });
                })
                .catch((error) => {
                  updatingBoard = false;
                  console.error("Error updating board:", error);
                  toast.push("Failed to update board", {
                    theme: {
                      "--toastBackground": "var(--accent-50)",
                      "--toastProgressBackground": "var(--accent-100)",
                      "--toastColor": "black",
                    },
                  });
                });
            }}>Save Changes</Button
          >
        {/if}
      </div>
    </form>
    <div class="mt-4">
      <h4 class="text-lg font-medium text-accent-900 dark:text-accent-100 mb-2">
        Lists
      </h4>
      <div class="flex flex-col gap-4">
        {#each board.board_lists as list (list.list_id)}
          <ListUpdateCard
            bind:list
            on:listUpdated={handleListUpdate}
            on:listDeleted={handleListDelete}
          />
        {/each}
      </div>
    </div>
  </Modal>
{/if}

<script lang="ts">
  import { Button } from "flowbite-svelte";
  import type { BoardContentListForm } from "$lib/interfaces/list";
  import { Spinner } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import server_url from "$lib/stores/server_store";
  import { slide } from "svelte/transition";

  export let list: BoardContentListForm;
  let updating: boolean = false;
  let deleting: boolean = false;

  let name: string = "";
  let deadline: string = "";
  let askForConfirmation: boolean = false;

  name = list?.list_name;
  deadline = list?.list_deadline;

  const dispatch = createEventDispatcher();

  async function updateList(
    listId: number,
    newName: string,
    newDeadline: string
  ) {
    try {
      const response = await fetch($server_url + "/list/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("access_token") || "",
        },
        body: JSON.stringify({
          list_id: listId,
          list_name: newName,
          list_deadline: newDeadline,
        }),
      });
      if (!response.ok) throw new Error("Failed to update list");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating list:", error);
      throw new Error("Failed to update list");
    }
  }

  function handleListUpdate(
    listId: number,
    newName: string,
    newDeadline: string
  ) {
    updating = true;
    updateList(listId, newName, newDeadline)
      .then(() => {
        dispatch("listUpdated", {
          list_id: listId,
          list_name: newName,
          list_deadline: newDeadline,
        });
        toast.push("List updated successfully", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      })
      .catch((error) => {
        console.error("Error updating list:", error);
        toast.push("Failed to update list", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      })
      .finally(() => {
        updating = false;
      });
  }

  async function deleteList(listId: number) {
    try {
      const response = await fetch($server_url + "/list/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("access_token") || "",
        },
        body: JSON.stringify({
          list_id: listId,
        }),
      });
      if (!response.ok) throw new Error("Failed to delete list");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting list:", error);
      throw new Error("Failed to delete list");
    }
  }

  function deleteListConfirmed(listId: number) {
    deleting = true;
    deleteList(listId)
      .then(() => {
        dispatch("listDeleted", { list_id: listId });
        toast.push("List deleted successfully", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      })
      .catch((error) => {
        console.error("Error deleting list:", error);
        toast.push("Failed to delete list", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      })
      .finally(() => {
        deleting = false;
      });
  }
</script>

<div
  class="flex flex-col gap-6 bg-accent-100 dark:bg-gray-800 shadow-xl rounded-lg p-6"
>
  <div class="flex responsive-flex gap-3">
    <div class="flex-1">
      <label class="text-accent-900 dark:text-accent-100 block">
        <span class="font-bold"> List Name </span>
        <input
          type="text"
          bind:value={name}
          class="form-input mt-1 block w-full border-gray-300 shadow-sm rounded-md text-accent-900 dark:text-accent-900"
          placeholder="Enter List Name"
        />
      </label>
    </div>
    <div class="flex-1">
      <label class="text-accent-900 dark:text-accent-100 block">
        <span class="font-bold"> Deadline </span>
        <input
          type="datetime-local"
          bind:value={deadline}
          class="form-input mt-1 block w-full border-gray-300 shadow-sm rounded-md text-accent-900 dark:text-accent-900"
        />
      </label>
    </div>
  </div>

  <div class="flex justify-center gap-4 mt-4">
    {#if updating}
      <Button
        color="green"
        size="sm"
        disabled
        class="bg-green-600 hover:bg-green-800 text-accent-100 font-bold disabled:hover:bg-green-600 disabled:opacity-100"
      >
        <Spinner class="me-2" size="4" color="white" />
        Updating
      </Button>
    {:else}
      <Button
        disabled={name === list.list_name && deadline === list.list_deadline}
        color="green"
        size="sm"
        class="bg-green-600 hover:bg-green-800 text-accent-100 font-bold disabled:hover:bg-green-600"
        on:click={() => handleListUpdate(list.list_id, name, deadline)}
      >
        Update
      </Button>
    {/if}
    {#if deleting}
      <Button
        color="red"
        size="sm"
        disabled
        class="bg-red-600 hover:bg-red-800 text-accent-100 font-bold disabled:hover:bg-red-500 disabled:opacity-100"
      >
        <Spinner class="me-2" size="4" color="white" />
        Deleting
      </Button>
    {:else}
      <Button
        color="red"
        size="sm"
        class="bg-red-600 hover:bg-red-800 text-accent-100 font-bold disabled:hover:bg-red-500"
        on:click={() => (askForConfirmation = true)}>Delete</Button
      >
    {/if}
  </div>

  {#if askForConfirmation}
    <div
      transition:slide
      class="flex justify-between items-center bg-red-100 p-4 rounded-lg mt-4"
    >
      <span class="font-bold text-red-700">
        Are you sure you want to delete this list?
      </span>
      <div class="flex gap-2">
        <Button
          color="red"
          size="sm"
          class="bg-red-600 hover:bg-red-800 text-accent-100 font-bold disabled:hover:bg-red-500"
          on:click={() => {
            deleteListConfirmed(list.list_id);
            askForConfirmation = false;
          }}>Confirm</Button
        >
        <button
          class="px-6 py-2 bg-gray-500 text-white font-bold text-sm rounded-md shadow-sm hover:bg-gray-600"
          on:click={() => {
            askForConfirmation = false;
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Additional styling for responsiveness */
  @media (max-width: 640px) {
    .responsive-flex {
      flex-direction: column;
    }
  }
</style>

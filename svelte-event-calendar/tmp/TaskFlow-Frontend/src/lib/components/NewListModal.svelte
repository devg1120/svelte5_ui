<script lang="ts">
  import { Button, Modal, Label, Input, Textarea } from "flowbite-svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import server_url from "$lib/stores/server_store";
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import { Spinner } from "flowbite-svelte";
  export let showModal = true;

  let name: string = "";
  let description: string = "";
  let timestamp: string = "";
  let loading: boolean = false;

  const dispatch = createEventDispatcher();

  async function create_list() {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("access_token") || "",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        board_id: $page.params.board_id,
        list_name: name,
        list_description: description,
        list_deadline: timestamp,
      }),
    };

    try {
      const response = await fetch($server_url + "/list/create", request);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      dispatch("listCreated", {
        list_id: data.id,
        list_name: name,
        list_tasks: [],
        list_deadline: timestamp,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }
</script>

<Modal bind:open={showModal} size="xs" autoclose={false} class="w-full">
  <form
    class="flex flex-col space-y-6"
    on:submit|preventDefault={() => {
      if (name === "" || timestamp === "") return;
      let success = false;
      loading = true;
      create_list()
        .then((data) => {
          success = true;
          toast.push("List Created Successfully!", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
              "--toastProgressText": "#1A202C",
            },
          });
        })
        .catch((error) => {
          console.error(error);
          toast.push("An error occurred. Please try again.", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
              "--toastProgressText": "#1A202C",
            },
          });
          // success event dispatched already
        })
        .finally(() => {
          loading = false;
          showModal = false;
        });
    }}
  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
      New List
    </h3>
    <Label class="space-y-2">
      <span>List Name</span>
      <Input type="text" name="name" required bind:value={name} />
    </Label>
    <!-- <Label class="space-y-2">
      <span>Description</span>
      <Textarea
        id="message"
        placeholder="Write list description..."
        rows="4"
        name="message"
        bind:value={description}
      />
    </Label> -->
    <Label class="space-y-2">
      <span>Due Time</span>
      <Input
        type="datetime-local"
        name="date"
        required
        bind:value={timestamp}
      />
    </Label>
    <div class="flex justify-center mt-4">
      {#if loading}
        <Button
          class="w-1/4 md:w-1/3 mx-auto bg-accent-50 text-accent-900 hover:bg-accent-50 dark:bg-accent-50 dark:hover:bg-accent-50"
          disabled
        >
          <Spinner class="me-3" size="4" color="white" />
          Creating...</Button
        >
      {:else}
        <Button
          type="submit"
          class="w-1/4 md:w-1/3 mx-auto bg-accent-50 text-accent-900 hover:bg-accent-600 dark:bg-accent-50 dark:hover:bg-accent-600"
          >Create List</Button
        >
      {/if}
    </div>
  </form>
</Modal>

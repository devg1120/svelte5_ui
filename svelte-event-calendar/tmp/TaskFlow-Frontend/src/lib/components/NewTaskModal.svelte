<script lang="ts">
  import { Button, Modal, Label, Input, Textarea } from "flowbite-svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { createEventDispatcher } from "svelte";
  import { Spinner } from "flowbite-svelte";
  import server_url from "$lib/stores/server_store";
  export let showModal = true;

  export let listID: number;

  let taskName: string = "";
  let description: string = "";
  let startTime: string = "";
  let endTime: string = "";
  let loading: boolean = false;

  const dispatch = createEventDispatcher();

  async function createTask() {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("access_token") || "",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        list_id: listID,
        task_name: taskName,
        start_time: startTime,
        end_time: endTime,
        description: description,
      }),
    };

    try {
      const response = await fetch($server_url + "/task/create", request);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      dispatch("taskCreated", {
        task_id: data.id,
        task_name: taskName,
        task_deadline: endTime,
      });
      toast.push("Task Created Successfully!", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
          "--toastProgressText": "#1A202C",
        },
      });
    } catch (error) {
      toast.push("An error occurred. Please try again.", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
          "--toastProgressText": "#1A202C",
        },
      });
      throw error;
    } finally {
      loading = false;
      showModal = false;
    }
  }
</script>

<Modal bind:open={showModal} size="xs" autoclose={false} class="w-full">
  <form
    class="flex flex-col space-y-6"
    on:submit|preventDefault={() => {
      if (taskName === "" || startTime === "" || endTime === "") return;
      loading = true;
      createTask();
    }}
  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
      New Task
    </h3>
    <Label>
      <span>Task Name</span>
      <Input type="text" required bind:value={taskName} />
    </Label>
    <Label>
      <span>Description</span>
      <Textarea placeholder="Task description..." bind:value={description} />
    </Label>
    <Label>
      <span>Start Time</span>
      <Input type="datetime-local" required bind:value={startTime} />
    </Label>
    <Label>
      <span>End Time</span>
      <Input type="datetime-local" required bind:value={endTime} />
    </Label>
    <div class="flex justify-center mt-4">
      {#if loading}
        <Button disabled class="w-1/4 md:w-1/3 mx-auto bg">
          <Spinner size="sm" /> Creating...
        </Button>
      {:else}
        <Button type="submit" class="w-1/4 md:w-1/3 mx-auto">Create Task</Button
        >
      {/if}
    </div>
  </form>
</Modal>

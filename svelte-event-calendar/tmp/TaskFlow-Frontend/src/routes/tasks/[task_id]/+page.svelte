<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import server_url from "$lib/stores/server_store";
  import ChatWindow from "$lib/components/ChatWindow.svelte";
  import { Circle2 } from "svelte-loading-spinners";
  import { page } from "$app/stores";
  import { Input } from "flowbite-svelte";
  import { goto } from "$app/navigation";

  let task_id: number = Number($page.params.task_id);

  let task: Task;
  let taskLoading: boolean = false;

  function stripTimezoneFromTimestamp(timestamp: string): string {
    // This regex matches YYYY-MM-DDTHH:MM:SS and captures this part, ignoring timezone info
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/;
    const match = timestamp.match(regex);
    return match ? match[1] : ""; // Return the captured datetime or an empty string if no match
  }

  let new_checklist_item: CheckListItem = {
    item_id: 0,
    item_name: "",
    is_completed: false,
  };

  async function upload_cover_photo(event: any) {
    const file = event.target.files[0];
    if (!file) {
      toast.push("No file selected", {
        theme: {
          "--toastBackground": "red",
          "--toastProgressBackground": "pink",
          "--toastProgressText": "red",
          "--toastText": "white",
        },
      });
      return;
    }

    const form_data = new FormData();
    form_data.append("taskcover", file);
    form_data.append("task_id", task.id.toString());

    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
    });

    try {
      const response = await fetch($server_url + "/task/taskcover-upload", {
        method: "POST",
        headers,
        body: form_data,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      toast.push("Cover photo uploaded successfully", {
        theme: {
          "--toastBackground": "green",
          "--toastProgressBackground": "lightgreen",
          "--toastProgressText": "green",
          "--toastText": "white",
        },
      });
      task.cover_url = data.url;
      // console.log("Cover photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.push("Error uploading cover photo", {
        theme: {
          "--toastBackground": "red",
          "--toastProgressBackground": "pink",
          "--toastProgressText": "red",
          "--toastText": "white",
        },
      });
    }
  }

  async function delete_cover_photo() {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    try {
      const url = new URL($server_url + "/task/taskcover-delete");
      url.searchParams.set("task_id", task.id.toString());
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      task.cover_url = "";
      toast.push("Cover photo deleted successfully", {
        theme: {
          "--toastBackground": "green",
          "--toastProgressBackground": "lightgreen",
          "--toastProgressText": "green",
          "--toastText": "white",
        },
      });
      // console.log("Cover photo deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.push("Error deleting cover photo", {
        theme: {
          "--toastBackground": "red",
          "--toastProgressBackground": "pink",
          "--toastProgressText": "red",
          "--toastText": "white",
        },
      });
    }
  }

  async function get_task_detail() {
    const token = localStorage.getItem("access_token") || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    const request = {
      method: "GET",
      headers,
    };

    try {
      const url = new URL($server_url + "/task/get-detail");
      url.searchParams.set("task_id", String(task_id));
      const response = await fetch(url.toString(), request);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        // console.log("Error fetching task detail");
      }
    } catch (error) {
      // console.log("Error fetching task detail");
    }
  }

  onMount(async () => {
    try {
      console.log("Fetching task detail");
      taskLoading = true;
      if (task_id) {
        const data = await get_task_detail();
        task = data;
        task.start_time = stripTimezoneFromTimestamp(task.start_time);
        task.due_time = stripTimezoneFromTimestamp(task.due_time);
      }
    } catch (error) {
      console.error(error);
    } finally {
      console.log("Task detail fetched");
      taskLoading = false;
    }
  });

  async function update_task() {
    const token = localStorage.getItem("access_token") || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(task),
    };

    try {
      const response = await fetch($server_url + "/task/update", request);
      if (response.ok) {
        toast.push("Task updated successfully", {
          theme: {
            "--toastBackground": "green",
            "--toastProgressBackground": "lightgreen",
            "--toastProgressText": "green",
            "--toastText": "white",
          },
        });
        task = await get_task_detail();
        task.start_time = stripTimezoneFromTimestamp(task.start_time);
        task.due_time = stripTimezoneFromTimestamp(task.due_time);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.push("Error updating task", {
        theme: { "--toastBackground": "red", "--toastText": "white" },
      });
    }
  }

  async function delete_task() {
    const token = localStorage.getItem("access_token") || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    const request = {
      method: "DELETE",
      headers,
      body: JSON.stringify({ task_id: task_id }),
    };

    try {
      const response = await fetch($server_url + "/task/delete", request);
      if (response.ok) {
        toast.push("Task deleted successfully", {
          theme: {
            "--toastBackground": "green",
            "--toastProgressBackground": "lightgreen",
            "--toastProgressText": "green",
            "--toastText": "white",
          },
        });
        goto("/dashboard");
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.push("Error deleting task", {
        theme: { "--toastBackground": "red", "--toastText": "white" },
      });
    }
  }

  async function add_checklist_item() {
    const token = localStorage.getItem("access_token") || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };

    const request = {
      method: "POST",
      headers,
      body: JSON.stringify({
        task_id: task.id,
        name: new_checklist_item.item_name,
      }),
    };
    try {
      const response = await fetch(
        $server_url + "/task/create-checklist-item",
        request
      );
      if (response.ok) {
        toast.push("Checklist item added successfully", {
          theme: {
            "--toastBackground": "green",
            "--toastProgressBackground": "lightgreen",
            "--toastProgressText": "green",
            "--toastText": "white",
          },
        });
        task = await get_task_detail();
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Add error:", error);
      toast.push("Error adding checklist item", {
        theme: { "--toast Background": "red", "--toastText": "white" },
      });
    }
  }

  // Dragging
  let start_x: number;
  let start_width: number;
  // This will be set using bind:this on the element
  let left_panel: HTMLElement;
  let left_panel_width: number = 600;

  function init_drag(e: MouseEvent) {
    start_x = e.clientX;
    start_width = left_panel.offsetWidth;
    document.documentElement.addEventListener("mousemove", do_drag, false);
    document.documentElement.addEventListener("mouseup", stop_drag, false);
  }

  function do_drag(e: MouseEvent) {
    let min_percentage = 0;
    let width = start_width + e.clientX - start_x;
    let total_width = document.documentElement.clientWidth;
    if (
      width < total_width * min_percentage ||
      width > total_width * (1 - min_percentage)
    )
      return;
    left_panel.style.width = start_width + e.clientX - start_x + "px";
    left_panel_width = start_width + e.clientX - start_x;
  }

  function stop_drag() {
    document.documentElement.removeEventListener("mousemove", do_drag, false);
    document.documentElement.removeEventListener("mouseup", stop_drag, false);
  }
</script>

<svelte:head>
  <title>Task Detail</title>
</svelte:head>

<div class="flex flex-wrap max-h-screen overflow-y-scroll md:flex-nowrap">
  <div
    bind:this={left_panel}
    class="flex flex-col p-4 bg-accent-100 dark:bg-accent-900 overflow-y-auto"
    style="width: 50%"
  >
    {#if taskLoading || !task}
      <div class="flex flex-col justify-center items-center h-full">
        <Circle2 size={100} />
        <span class="mt-4 text-xl font-semibold">Loading Task Detail...</span>
      </div>
    {:else}
      <div class="flex flex-col gap-10 p-6 lg:flex-row">
        <div
          class="w-full max-w-2xl p-6 mx-auto rounded-lg shadow-lg text-accent-900 dark:text-accent-100 bg-accent-100 dark:bg-accent-800"
        >
          <h2 class="mb-4 text-2xl font-semibold">
            {task.name}
          </h2>
          <div class="mb-4">
            {#if task.cover_url}
              <!-- svelte-ignore a11y-img-redundant-alt -->
              <img
                src="{task.cover_url}?t={new Date().getTime()}"
                alt="Cover Photo"
                class="w-full mb-4"
              />
              <button
                class="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                on:click={delete_cover_photo}
              >
                Delete
              </button>
            {/if}
            <input
              type="file"
              id="coverUpload"
              class="hidden"
              accept="image/*"
              on:change={upload_cover_photo}
            />
            <button
              class="px-4 py-2 mt-4 font-bold text-white transition-all rounded hover:bg-accent-500 bg-accent-50"
              on:click={() => document.getElementById("coverUpload")?.click()}
            >
              Upload
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4 items-center">
            <label class="font-bold flex items-center" for="start-date"
              >Start Date</label
            >
            <Input
              type="datetime-local"
              required
              bind:value={task.start_time}
            />
            <!-- <Input
              id="start-date"
              type="datetime-local"
              class="block w-full mt-1 border-2 rounded-md shadow-sm border-accent-50 focus:border-accent-50 focus:ring focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
              bind:value={task.start_time}
            /> -->
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4 items-center">
            <label class="font-bold flex items-center" for="due-date"
              >Due Date</label
            >
            <Input type="datetime-local" required bind:value={task.due_time} />
            <!-- <Input
              id="due-date"
              type="datetime-local"
              class="block w-full mt-1 border-2 rounded-md shadow-sm border-accent-50 focus:border-accent-50 focus:ring focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
              bind:value={task.due_time}
            /> -->
          </div>

          <div class="mb-4">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-bold">Checklist</label>
            <div class="mt-1">
              {#if task.checklist_items != undefined}
                {#each task.checklist_items as item, i}
                  <div class="flex items-center mb-2">
                    <input
                      type="checkbox"
                      class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      bind:checked={item.is_completed}
                    />
                    <span class="ml-2">{item.item_name}</span>
                  </div>
                {/each}
              {/if}
            </div>
            <div class="flex flex-row p-4 mt-4 rounded-lg">
              <input
                type="text"
                class="flex-1 mr-2 border-2 rounded-md shadow-sm border-accent-50 focus:border-accent-50 focus:ring focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                placeholder="Add a new item"
                bind:value={new_checklist_item.item_name}
              />
              <button
                class="w-20 h-10 px-4 py-2 mx-auto my-2 font-bold text-black bg-blue-500 rounded hover:bg-blue-700"
                on:click={() => {
                  if (new_checklist_item.item_name.trim() === "") return;
                  add_checklist_item();
                  task.checklist_items = task.checklist_items;
                  new_checklist_item = {
                    item_name: "",

                    is_completed: false,
                    item_id: 0,
                  };
                }}
              >
                Add
              </button>
            </div>
            <div class="flex items-center justify-center w-full">
              <button
                class="px-4 py-2 mx-auto my-2 font-bold text-black bg-blue-500 rounded hover:bg-blue-700"
                on:click={() => {
                  update_task();
                }}
              >
                Save Task
              </button>
              <button
                class="px-4 py-2 mx-auto my-2 font-bold text-black bg-red-500 rounded hover:bg-red-700"
                on:click={() => {
                  delete_task();
                }}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="p-1 my-3 cursor-col-resize bg-accent-50 dark:bg-accent-600"
    on:mousedown={init_drag}
  ></div>
  <ChatWindow bind:task_id />
</div>

<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import server_url from "$lib/stores/server_store";
  import type { Notification } from "$lib/interfaces/notification";
  import { processNotificationMessage } from "$lib/interfaces/notification";
  import theme_store from "$lib/stores/theme_store";
  import { onMount } from "svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { Circle3 } from "svelte-loading-spinners";

  let loading: boolean = false;

  async function fetchNotifications() {
    const token = localStorage.getItem("access_token") || "";
    const header = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    const request = {
      method: "GET",
      headers: header,
    };

    try {
      const url = new URL($server_url + "/notification/retrieve");
      url.searchParams.set("count", "100");
      url.searchParams.set("offset", "0");
      const response = await fetch(url.toString(), request);

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        return data;
      } else {
        // console.log("Error fetching notifications");
      }
    } catch (error) {
      // console.log("Error fetching notifications");
    }
  }

  async function markNotificationAsReadHTTP(notificationId: any) {
    const token = localStorage.getItem("access_token") || "";
    const header = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: header,
      body: JSON.stringify({ notification_id: notificationId }),
    };

    try {
      const url = new URL($server_url + "/notification/mark-as-read");
      const response = await fetch(url.toString(), request);

      if (response.ok) {
        // console.log("Notification(s) marked as read");
      } else {
        // console.log("Error marking notification as read");
      }
    } catch (error) {
      // console.log("Error marking notification as read");
    }
  }

  async function deleteNotificationHTTP(notificationId: any) {
    const token = localStorage.getItem("access_token") || "";
    const header = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    const request = {
      method: "DELETE",
      headers: header,
      body: JSON.stringify({ notification_id: notificationId }),
    };

    try {
      const url = new URL($server_url + "/notification/delete");
      const response = await fetch(url.toString(), request);

      if (response.ok) {
        // console.log("Notification(s) deleted");
      } else {
        // console.log("Error deleting notification");
      }
    } catch (error) {
      // console.log("Error deleting notification");
    }
  }

  let notifications: Array<Notification> = [];

  onMount(async () => {
    try {
      // console.log("Fetching notifications");
      loading = true;
      const data = await fetchNotifications();
      notifications = data;
    } catch (error) {
      // console.log("Error fetching notifications");
    } finally {
      loading = false;
    }
  });

  let processedNotifications: Array<Notification> = [];
  $: {
    processedNotifications = notifications.map((n) => ({
      ...n,
      body: processNotificationMessage(n.body, $theme_store.accentCurrentColor),
    }));
    processedNotifications = processedNotifications;
  }

  function markAllAsRead() {
    markNotificationAsReadHTTP(-1)
      .then(() => {
        notifications = notifications.map((n) => ({ ...n, read: true }));
      })
      .catch((error) => {
        toast.push("Error! Please try again.", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      });
  }

  function markAsRead(notificationId: any) {
    markNotificationAsReadHTTP(notificationId)
      .then(() => {
        notifications = notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
      })
      .catch((error) => {
        toast.push("Error! Please try again.", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      });
  }

  function deleteNotification(notificationId: any) {
    deleteNotificationHTTP(notificationId)
      .then(() => {
        notifications = notifications.filter((n) => n.id !== notificationId);
      })
      .catch((error) => {
        toast.push("Error! Please try again.", {
          theme: {
            "--toastBackground": "var(--accent-50)",
            "--toastProgressBackground": "var(--accent-100)",
            "--toastColor": "black",
          },
        });
      });
  }

  function deleteAllNotifications() {
    deleteNotificationHTTP(-1).then(() => {
      notifications = [];
    });
  }
</script>

<svelte:head>
  <title>Notifications</title>
</svelte:head>

<div class="container mx-auto p-6">
  {#if loading}
    <div class="flex flex-col justify-center items-center h-screen">
      <Circle3 size={100} />
      <span class="text-3xl font-bold mt-4">Loading Your Notifications...</span>
    </div>
  {:else}
    <span class="text-3xl font-bold">Notifications</span>
    <div class="flex justify-end items-center mb-4 w-3/4 mx-auto">
      <button
        class="flex items-center px-3 py-2 rounded-lg shadow hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-accent-50 font-bold"
        on:click={markAllAsRead}
      >
        Mark all as read
      </button>
      <!-- <button
        class="flex items-center px-3 py-2 rounded-lg shadow hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2 bg-accent-50 font-bold"
        on:click={deleteAllNotifications}
      >
        Delete all
      </button> -->
    </div>

    <div class="space-y-4">
      {#each processedNotifications as notification (notification.id)}
        <div
          class="flex items-center bg-accent-50 p-4 rounded shadow-xl relative transition-all duration-300 w-3/4 mx-auto"
          style="height: auto; max-height: 5rem;"
          transition:slide
        >
          <div class="flex-grow font-semibold">
            <p class="line-clamp-5">
              {@html notification.body}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            {#if !notification.read}
              <button
                class="flex items-center px-3 py-2 rounded-lg shadow-xl hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                on:click={() => markAsRead(notification.id)}
                title="Mark as read"
                in:fade
                out:fade
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-white mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm font-semibold">Mark as read</span>
              </button>
            {/if}

            <button
              class="flex items-center px-3 py-2 rounded-lg shadow-xl hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
              on:click={() => deleteNotification(notification.id)}
              title="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 8.586L3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 001.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-sm font-semibold">Delete</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

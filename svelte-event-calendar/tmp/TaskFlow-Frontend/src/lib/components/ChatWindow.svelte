<script lang="ts">
  import { Avatar } from "flowbite-svelte";
  import { onMount } from "svelte";
  import server_url from "$lib/stores/server_store";
  import { user_info_store } from "$lib/stores/user_store";
  import { Plane } from "svelte-loading-spinners";
  import { format, isToday, isThisWeek, parseISO } from "date-fns";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import theme_store from "$lib/stores/theme_store";

  function formatChatTimestamp(timestampz: string): string {
    const date = parseISO(timestampz);
    if (isToday(date)) {
      return `Today ${format(date, "h:mm a")}`;
    } else if (isThisWeek(date)) {
      return format(date, "iiii h:mm a");
    } else {
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    }
  }

  let chatMessages: any = [];

  export let task_id: number;
  let file_url = "";
  let messageText = ""; // To capture message text from textarea

  let fetchingMessages = false;

  async function fetch_messages(_task_id: number) {
    const token: string = localStorage.getItem("access_token") || "";

    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });
    const url = new URL($server_url + "/taskmessage/retrieve-all");
    url.searchParams.set("task_id", _task_id.toString());

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        // Handle response error
        console.error("Network response was not ok");
        return;
      }
      const data = await response.json();
      // Handle success response
      // For example, you might want to add the sent message to `chatMessages` or clear the textarea
      // console.log("Messages retrieved successfully:", data);
      chatMessages = data;
    } catch (error) {
      console.error("An error occurred while retrieving the messages:", error);
    }
  }

  async function generate_ai_response() {
    const token: string = localStorage.getItem("access_token") || "";

    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });
    const url = new URL($server_url + "/ai/task-chat");
    url.searchParams.set("task_id", task_id.toString());
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        // Handle response error
        console.error("Network response was not ok");
        return;
      }
      // console.log("AI response retrieved successfully:");
      fetch_messages(task_id);
    } catch (error) {
      console.error("An error occurred while retrieving the messages:", error);
    }
  }

  async function send_message() {
    const messageData = {
      task_id: task_id,
      body: messageText, // Message text from the textarea
      file_url: file_url, // Optional, include if there's a file to send
    };

    const token: string = localStorage.getItem("access_token") || "";
    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(messageData),
    };

    // console.log(messageData);

    try {
      const response = await fetch(
        $server_url + "/taskmessage/create",
        request
      );
      if (!response.ok) {
        // Handle response error
        console.error("Network response was not ok");
        return;
      }
      const data = await response.json();
      // Handle success response
      // For example, you might want to add the sent message to `chatMessages` or clear the textarea
      // console.log("Message sent successfully:", data);
      messageText = ""; // Clear the textarea after sending the message
      // fetch_messages(task_id); // Fetch messages again to update the chatMessages array
      generate_ai_response();
      // console.log(chatMessages);
    } catch (error) {
      console.error("An error occurred while sending the message:", error);
    }
  }

  // Function to update messageText on textarea change
  function updateMessageText(event: any) {
    messageText = event.target.value;
  }

  onMount(async () => {
    try {
      // console.log("Fetching task messages");
      fetchingMessages = true;
      if (task_id) {
        await fetch_messages(task_id);
      }
    } catch (error) {
      console.error("Error fetching task messages");
    } finally {
      // console.log("Task messages fetched");
      fetchingMessages = false;
    }
  });

  let message_box_class: string =
    "p-3 bg-accent-50 text-accent-900 rounded-lg max-w-xs lg:max-w-md";

  let timestamp_class: string =
    "text-xs text-black font-bold dark:text-white text-right mt-1";
</script>

<div class="flex flex-col flex-1 h-screen p-4 bg-accent-100 dark:bg-accent-900">
  <h2 class="mb-4 text-xl font-semibold text-black dark:text-white">
    Chat Window
  </h2>
  {#if fetchingMessages}
    <div class="flex flex-col items-center justify-center space-y-4">
      <div>
        <Plane color={get_color_hex_code($theme_store.accentCurrentColor)} />
      </div>
      <div>
        <span class="text-lg font-bold text-black md:text-xl dark:text-white"
          >Fetching messages...</span
        >
      </div>
    </div>
  {:else if chatMessages.length == 0}
    <p class="text-center">No messages yet</p>
  {:else}
    <div class="mb-6 space-y-6 overflow-y-scroll h-3/4">
      {#each chatMessages as message}
        {#if message.sender_username != $user_info_store.username}
          <div class="flex gap-4">
            <Avatar src={message.sender_dp_url} />
            <div class="flex space-x-2">
              <div>
                <div class={message_box_class + " rounded-tl-none"}>
                  <p class="font-bold text-md">
                    {message.sender_username}
                  </p>
                  <p class="text-sm">{message.body}</p>
                  <p class={timestamp_class}>
                    {formatChatTimestamp(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="flex justify-end gap-4">
            <div class="flex space-x-2">
              <div>
                <div class={message_box_class + " rounded-tr-none"}>
                  <p class="font-bold text-md">
                    {message.sender_username}
                  </p>
                  <p class="text-sm">{message.body}</p>
                  <p class={timestamp_class}>
                    {formatChatTimestamp(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <Avatar src={message.sender_dp_url} />
          </div>
        {/if}
      {/each}
    </div>
  {/if}
  <div class="pt-4 text-center">
    <textarea
      class="w-full p-2 text-sm border-2 rounded-md shadow-sm border-accent-50 focus:border-accent-50 focus:ring focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
      rows="2"
      placeholder="Type your message..."
      bind:value={messageText}
      on:input={updateMessageText}
    ></textarea>
    <button
      class="flex items-center justify-center w-20 h-10 px-4 py-2 mx-auto mt-2 font-bold transition-all border-2 rounded text-accent-900 max-w-3px border-accent-50 bg-accent-50 hover:bg-accent-100 dark:text-accent-100 dark:border-accent-100 dark:hover:bg-accent-600"
      on:click={send_message}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        width="16"
        viewBox="0 0 512 512"
        ><path
          d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"
        /></svg
      >

      Send
    </button>
  </div>
</div>

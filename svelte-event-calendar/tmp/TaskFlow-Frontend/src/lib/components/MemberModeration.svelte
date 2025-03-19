<script lang="ts">
  import { Modal, Label, Button } from "flowbite-svelte";
  import Autocomplete from "$lib/components/Autocomplete.svelte";
  import server_url from "$lib/stores/server_store";
  import { toast } from "@zerodevx/svelte-toast";
  import { onMount, onDestroy } from "svelte";
  import type {
    UserMemberInfo,
    UserSuggestion,
    UserMinimalForm,
  } from "$lib/interfaces/user";
  import type { BoardContent } from "$lib/interfaces/board";
  import { user_info_store } from "$lib/stores/user_store";
  import { createEventDispatcher } from "svelte";
  import { add } from "date-fns";

  export let board: BoardContent;
  export let showModal = false;

  async function fetchUsers(search_term: string) {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        term: search_term,
        count: 10,
      }),
    };

    try {
      const response = await fetch(
        $server_url + "/profile/get-usernames",
        request
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  let loading: boolean = false;
  let search_term: string = "";
  let last_fetched_term: string = "";
  let selected_users: UserMemberInfo[] = [];
  let retrieved_users: UserMinimalForm[] = [];
  let fetch_interval: NodeJS.Timeout;
  let interval_time: number = 100;

  onMount(() => {
    fetch_interval = setInterval(() => {
      if (search_term !== last_fetched_term && search_term.length > 0) {
        fetchUsers(search_term)
          .then((users) => {
            retrieved_users = users;
            last_fetched_term = search_term;
          })
          .catch((err) => {
            console.error("Fetch error:", err);
          });
      }
    }, interval_time);
  });

  onDestroy(() => {
    clearInterval(fetch_interval);
  });

  let admins: Array<UserMemberInfo> = [];
  let members: Array<UserMemberInfo> = [];
  let owner: UserMemberInfo;

  $: admins = board?.board_members.filter((member) => member.role === 2);
  $: members = board?.board_members.filter((member) => member.role === 3);
  $: {
    let res = board?.board_members.find((member) => member.role === 1);
    if (res) owner = res;
  }

  const dispatch = createEventDispatcher();

  async function updateMemberAccess(
    userID: string,
    prevRole: number,
    newRole: number
  ) {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        board_id: board.board_id,
        user_id: userID,
        prev_role: prevRole,
        new_role: newRole,
      }),
    };

    try {
      const response = await fetch(
        $server_url + "/board/update-member-access",
        request
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  function addAdmin(
    userID: string,
    username: string,
    full_name: string,
    dp_url: string
  ) {
    // 3 to 2
    updateMemberAccess(userID, 3, 2)
      .then((res) => {
        dispatch("memberUpdated", {
          user_id: userID,
          prev_role: 3,
          new_role: 2,
          username: username,
          full_name: full_name,
          dp_url: dp_url,
        });
        toast.push("Admin added successfully", {
          theme: {
            "--toastBackground": "rgba(16, 185, 129, 0.9)",
            "--toastProgressBackground": "rgba(16, 185, 129, 0.5)",
            "--toastProgressEndBackground": "rgba(16, 185, 129, 0)",
            "--toastColor": "#fff",
          },
        });
      })
      .catch((error) => {
        toast.push("Failed to add admin", {
          theme: {
            "--toastBackground": "rgba(220, 38, 38, 0.9)",
            "--toastProgressBackground": "rgba(220, 38, 38, 0.5)",
            "--toastProgressEndBackground": "rgba(220, 38, 38, 0)",
            "--toastColor": "#fff",
          },
        });
      });
  }

  function removeAdmin(
    userID: string,
    username: string,
    full_name: string,
    dp_url: string
  ) {
    // 2 to 3
    updateMemberAccess(userID, 2, 3)
      .then((res) => {
        dispatch("memberUpdated", {
          user_id: userID,
          prev_role: 2,
          new_role: 3,
          username: username,
          full_name: full_name,
          dp_url: dp_url,
        });
        toast.push("Admin removed successfully", {
          theme: {
            "--toastBackground": "rgba(16, 185, 129, 0.9)",
            "--toastProgressBackground": "rgba(16, 185, 129, 0.5)",
            "--toastProgressEndBackground": "rgba(16, 185, 129, 0)",
            "--toastColor": "#fff",
          },
        });
      })
      .catch((error) => {
        toast.push("Failed to remove admin", {
          theme: {
            "--toastBackground": "rgba(220, 38, 38, 0.9)",
            "--toastProgressBackground": "rgba(220, 38, 38, 0.5)",
            "--toastProgressEndBackground": "rgba(220, 38, 38, 0)",
            "--toastColor": "#fff",
          },
        });
      });
  }

  function removeMember(
    userID: string,
    username: string,
    full_name: string,
    dp_url: string
  ) {
    // 3 to -1
    updateMemberAccess(userID, 3, -1)
      .then((res) => {
        dispatch("memberUpdated", {
          user_id: userID,
          prev_role: 3,
          new_role: -1,
          username: username,
          full_name: full_name,
          dp_url: dp_url,
        });
        toast.push("Member removed successfully", {
          theme: {
            "--toastBackground": "rgba(16, 185, 129, 0.9)",
            "--toastProgressBackground": "rgba(16, 185, 129, 0.5)",
            "--toastProgressEndBackground": "rgba(16, 185, 129, 0)",
            "--toastColor": "#fff",
          },
        });
      })
      .catch((error) => {
        toast.push("Failed to remove member", {
          theme: {
            "--toastBackground": "rgba(220, 38, 38, 0.9)",
            "--toastProgressBackground": "rgba(220, 38, 38, 0.5)",
            "--toastProgressEndBackground": "rgba(220, 38, 38, 0)",
            "--toastColor": "#fff",
          },
        });
      });
  }

  function addMember(
    userID: string,
    username: string,
    full_name: string,
    dp_url: string
  ) {
    // -1 to 3
    updateMemberAccess(userID, -1, 3)
      .then((res) => {
        dispatch("memberUpdated", {
          user_id: userID,
          prev_role: -1,
          new_role: 3,
          username: username,
          full_name: full_name,
          dp_url: dp_url,
        });
        toast.push("Member added successfully", {
          theme: {
            "--toastBackground": "rgba(16, 185, 129, 0.9)",
            "--toastProgressBackground": "rgba(16, 185, 129, 0.5)",
            "--toastProgressEndBackground": "rgba(16, 185, 129, 0)",
            "--toastColor": "#fff",
          },
        });
      })
      .catch((error) => {
        toast.push("Failed to add member", {
          theme: {
            "--toastBackground": "rgba(220, 38, 38, 0.9)",
            "--toastProgressBackground": "rgba(220, 38, 38, 0.5)",
            "--toastProgressEndBackground": "rgba(220, 38, 38, 0)",
            "--toastColor": "#fff",
          },
        });
      });
  }

  function handleUserSelection(event: any) {
    addMember(
      event.detail.index,
      event.detail.suggestion,
      event.detail.full_name,
      event.detail.dp_url
    );
  }

  let suggestions: Array<UserSuggestion> = [];
  $: {
    retrieved_users = retrieved_users.filter((user) => {
      return selected_users.every((selected) => selected.user_id !== user.id);
    });
    suggestions = retrieved_users.map((user) => {
      return {
        id: user.id,
        name: user.username,
        full_name: user.full_name,
        dp_url: user.dp_url,
      };
    });
    suggestions = suggestions.filter((s) => {
      return s.id !== $user_info_store.id;
    });
    suggestions = suggestions.filter((s) => {
      return (
        members.every((member) => member.user_id !== s.id) &&
        admins.every((admin) => admin.user_id !== s.id)
      );
    });
  }

  let textClass: string = "text-slate-800 dark:text-slate-100 text-sm";
</script>

<Modal bind:open={showModal} size="lg" autoclose={false}>
  <Label for="members" class="mb-2 text-lg font-medium">Add Members</Label>
  <Autocomplete
    bind:loading
    bind:suggestions
    bind:searchTerm={search_term}
    on:select={handleUserSelection}
  />

  <div class="mt-4">
    <h2 class="text-xl font-semibold mb-2">Owner</h2>
    {#if owner}
      <div
        class="flex items-center gap-4 py-2 px-4 bg-accent-100 dark:bg-gray-800 rounded-lg shadow"
      >
        <img
          class="w-12 h-12 rounded-full"
          src={owner.dp_url}
          alt={owner.username}
        />
        <div class="flex flex-col">
          <strong class={`${textClass} font-bold`}>{owner.username}</strong>
          <span class={`${textClass}`}>{owner.full_name}</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="mt-6">
    <h2 class="text-xl font-semibold mb-2">Admins</h2>
    {#if admins}
      {#each admins as admin, index (admin.user_id)}
        <div
          class="flex items-center justify-between pt-4 px-4 bg-accent-100 dark:bg-gray-800 shadow py-2 {index ===
          0
            ? 'rounded-t-lg'
            : index === admins.length - 1
              ? 'rounded-b-lg'
              : 'rounded-none'}"
        >
          <div class="flex items-center gap-4">
            <img
              class="w-12 h-12 rounded-full"
              src={admin.dp_url}
              alt={admin.username}
            />
            <div class="flex flex-col">
              <strong class={`${textClass} font-bold`}>{admin.username}</strong>
              <span class={`${textClass}`}>{admin.full_name}</span>
            </div>
          </div>
          <!-- Board Owner gets to remove admins -->
          {#if board.board_access === 1 && $user_info_store.id !== admin.user_id}
            <Button
              color="red"
              size="xs"
              on:click={() =>
                removeAdmin(
                  admin.user_id,
                  admin.username,
                  admin.full_name,
                  admin.dp_url
                )}
            >
              {#if $user_info_store.id !== admin.user_id}
                Remove Admin
              {/if}
            </Button>
          {:else if board.board_access === 2 && $user_info_store.id === admin.user_id}
            <Button
              color="red"
              size="xs"
              on:click={() =>
                removeAdmin(
                  admin.user_id,
                  admin.username,
                  admin.full_name,
                  admin.dp_url
                )}
            >
              Resign as Admin
            </Button>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  <div class="mt-6">
    <h2 class="text-xl font-semibold mb-2">Members</h2>
    {#if members}
      {#each members as member, index (member.user_id)}
        <div
          class="flex items-center justify-between pt-4 px-4 bg-accent-100 dark:bg-gray-800 shadow py-2 {index ===
          0
            ? 'rounded-t-lg'
            : index === members.length - 1
              ? 'rounded-b-lg'
              : 'rounded-none'}"
        >
          <div class="flex items-center gap-4">
            <img
              class="w-12 h-12 rounded-full"
              src={member.dp_url}
              alt={member.username}
            />
            <div class="flex flex-col">
              <strong class={`${textClass} font-bold`}>{member.username}</strong
              >
              <span class={`${textClass}`}>{member.full_name}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            {#if board.board_access === 1}
              <Button
                color="green"
                size="xs"
                on:click={() =>
                  addAdmin(
                    member.user_id,
                    member.username,
                    member.full_name,
                    member.dp_url
                  )}
              >
                Add as Admin
              </Button>
            {/if}
            <Button
              color="red"
              size="xs"
              on:click={() =>
                removeMember(
                  member.user_id,
                  member.username,
                  member.full_name,
                  member.dp_url
                )}
            >
              Remove Member
            </Button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</Modal>

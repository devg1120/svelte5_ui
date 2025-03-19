<script lang="ts">
  import type { UserMemberInfo } from "$lib/interfaces/user";
  import { Button, Toggle } from "flowbite-svelte";
  import { MinusOutline } from "flowbite-svelte-icons";
  import theme_store from "$lib/stores/theme_store";

  let color: string;
  $: color = $theme_store.accentCurrentColor || "red";
  export let users: UserMemberInfo[] = [];
</script>

<div
  class="overflow-auto h-72 relative max-w-sm mx-auto bg-white dark:bg-slate-800 dark:highlight-white/5 shadow-lg ring-1 ring-black/5 rounded-xl flex flex-col divide-y dark:divide-slate-200/5"
>
  {#each users as user}
    <div>
      <div class="flex items-center gap-4 pt-4 px-4">
        <img
          class="w-12 h-12 rounded-full"
          src={user.dp_url}
          alt={user.username}
        />
        <div class="flex flex-col">
          <strong class="text-slate-900 text-sm font-medium dark:text-slate-200"
            >{user.username}</strong
          >
          <span class="text-slate-500 text-sm font-medium dark:text-slate-400"
            >{user.full_name}</span
          >
        </div>
      </div>
      <div class="flex items-center justify-between py-4 px-6">
        <Toggle
          on:change={() => {
            user.role = user.role === 3 ? 2 : 3;
            users = [...users];
          }}
          {color}
          class="ml-2"
          aria-label="Make Admin">Make Admin</Toggle
        >
        <Button
          size="xs"
          class="bg-accent-600 p-2"
          on:click={() => {
            users = users.filter((u) => u.user_id !== user.user_id);
            users = [...users];
          }}><MinusOutline class="w-3.5 h-3.5 me-2" />Remove</Button
        >
      </div>
    </div>
  {/each}
</div>

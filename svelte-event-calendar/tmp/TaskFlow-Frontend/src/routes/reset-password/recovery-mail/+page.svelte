<script lang="ts">
  import server_url from "$lib/stores/server_store";
  import { toast } from "@zerodevx/svelte-toast";
  import { Spinner } from "flowbite-svelte";

  let email: string = "";
  let loading: boolean = false;

  async function requestPasswordReset() {
    const response = await fetch($server_url + "/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      toast.push("Password reset link has been sent to your email", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
    } else {
      toast.push("An error occured, please try again!", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
    }
  }
</script>

<svelte:head>
  <title>Recovery Mail</title>
</svelte:head>

<div
  class="flex justify-center items-center min-h-screen bg-accent-100 dark:bg-gray-700"
>
  <form
    on:submit|preventDefault={() => {
      loading = true;
      requestPasswordReset().finally(() => {
        loading = false;
      });
    }}
    class="w-full max-w-md p-8 space-y-4 bg-accent-200 dark:bg-accent-800 rounded-lg shadow-xl text-accent-900 dark:text-accent-100"
  >
    <h2 class="text-xl font-semibold">Password Reset</h2>
    <div>
      <label for="email" class="block text-sm font-medium">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg:white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
    {#if loading}
      <button
        class="bg-accent-50 w-2/3 xs:w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-auto"
      >
        <Spinner class="me-3" size="4" color="white" /> Sending Reset Link...
      </button>
    {:else}
      <button
        type="submit"
        class="bg-accent-50 w-2/3 xs:w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-auto"
      >
        Send Reset Link
      </button>
    {/if}
  </form>
</div>

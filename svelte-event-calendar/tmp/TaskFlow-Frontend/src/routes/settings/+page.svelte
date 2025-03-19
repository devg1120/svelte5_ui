<script lang="ts">
  import { user_info_store } from "$lib/stores/user_store";
  import type { RegistrationInfo } from "$lib/interfaces/user";
  import {
    Label,
    Input,
    Helper,
    Spinner,
    Button,
    Popover,
  } from "flowbite-svelte";
  import {
    UserOutline,
    CheckOutline,
    CloseOutline,
  } from "flowbite-svelte-icons";
  import { toast } from "@zerodevx/svelte-toast";
  import server_url from "$lib/stores/server_store";

  let user_info: RegistrationInfo = {
    first_name: $user_info_store.first_name,
    middle_name: $user_info_store.middle_name,
    last_name: $user_info_store.last_name,
    username: $user_info_store.username,
    email: $user_info_store.email,
    password: "",
  };

  let current_password: string = "";
  let new_password: string = "";
  let confirm_password: string = "";
  let is_image_loading: boolean = true;

  let updating_profile: boolean = false;
  let changing_password: boolean = false;

  let both_case: boolean = false;
  let have_symbols: boolean = false;
  let score: number = 0;
  let password_match: number = 0; // 0: not retyped, 1: mismatch, 2: match

  async function delete_photo() {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
    });

    try {
      const response = await fetch($server_url + "/profile/dp-delete", {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      toast.push("Photo deleted successfully", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
      $user_info_store.dp_url = data.url;
    } catch (error) {
      console.error("Delete error:", error);
      toast.push("An error occurred while deleting your photo", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
    }
  }

  async function upload_photo(event: Event) {
    // console.log("entered upload_photo");
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) {
      toast.push("No file selected", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
      return;
    }

    // console.log(file);

    const formData = new FormData();
    formData.append("dp", file);

    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
    });

    try {
      const response = await fetch($server_url + "/profile/dp-upload", {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      toast.push("Photo uploaded successfully", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
      $user_info_store.dp_url = data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.push("An error occurred while uploading your photo", {
        theme: {
          "--toastBackground": "var(--accent-50)",
          "--toastProgressBackground": "var(--accent-100)",
          "--toastColor": "black",
        },
      });
    }
  }

  $: {
    if (confirm_password === "" || new_password === "") password_match = 0;
    else if (new_password === confirm_password) password_match = 2;
    else password_match = 1;

    both_case = /[a-z]/.test(new_password) && /[A-Z]/.test(new_password);
    have_symbols = /[!@#$%^&*]/.test(new_password);
    score = 0;
    if (both_case) score++;
    if (have_symbols) score++;
    if (new_password.length >= 12) score += 2;
    else if (new_password.length >= 6) score++;
  }

  async function update_user_info() {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        first_name: user_info.first_name,
        middle_name: user_info.middle_name,
        last_name: user_info.last_name,
        username: user_info.username,
      }),
    };

    try {
      const response = await fetch($server_url + "/profile/update", request);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async function change_password() {
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    const request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        email: $user_info_store.email,
        type: "update",
        current_password: current_password,
        new_password: new_password,
      }),
    };

    try {
      const response = await fetch(
        $server_url + "/auth/change-password",
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

  let unchanged: boolean = false;

  $: does_match = new_password === confirm_password;
  $: {
    unchanged =
      user_info.first_name === $user_info_store.first_name &&
      user_info.middle_name === $user_info_store.middle_name &&
      user_info.last_name === $user_info_store.last_name &&
      user_info.username === $user_info_store.username;
  }

  let update_button_class =
    "px-4 py-2 ml-3 font-bold transition duration-150 ease-in-out rounded-md bg-accent-50 hover:bg-accent-600 disabled:hover:bg-accent-50 dark:disabled:hover:bg-accent-800 dark:bg-accent-700 dark:hover:bg-accent-800 text-ink-light dark:text-ink-dark";
</script>

<svelte:head>
  <title>Profile Settings</title>
</svelte:head>

<div
  class="container w-2/3 h-full p-8 mx-auto my-5 rounded-lg shadow-xl bg-accent-100 dark:bg-gray-700"
>
  <form
    class="space-y-8 divide-gray-200"
    on:submit|preventDefault={() => {
      updating_profile = true;
      update_user_info()
        .then((data) => {
          // console.log(data);
          toast.push("Profile updated successfully", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
            },
          });
          $user_info_store.first_name = data.first_name;
          $user_info_store.middle_name = data.middle_name;
          $user_info_store.last_name = data.last_name;
          $user_info_store.username = data.username;
          localStorage.setItem("user", JSON.stringify($user_info_store));
        })
        .catch((error) => {
          console.error(error);
          toast.push("An error occurred while updating your profile", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
            },
          });
        })
        .finally(() => {
          updating_profile = false;
        });
    }}
  >
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <input
          type="file"
          id="photoUpload"
          class="hidden"
          accept="image/*"
          on:change={upload_photo}
        />

        <div class="flex items-center space-x-6">
          {#if is_image_loading}
            <div class="w-24 h-24 rounded-full skeleton"></div>
          {/if}
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <img
            src="{$user_info_store.dp_url}?t={new Date().getTime()}"
            alt="Profile Picture"
            class="object-cover w-24 h-24 rounded-full"
            hidden={is_image_loading}
            on:load={() => {
              is_image_loading = false;
            }}
            on:error={() => {
              is_image_loading = false;
            }}
          />

          <div>
            <div class="text-xl font-bold">
              {$user_info_store.first_name +
                " " +
                $user_info_store.middle_name +
                " " +
                $user_info_store.last_name}
            </div>
          </div>
        </div>
        <div class="flex">
          <button
            type="button"
            class="px-4 py-2 font-bold text-black transition duration-150 ease-in-out rounded-md bg-accent-50 hover:bg-accent-600"
            on:click={() => document.getElementById("photoUpload")?.click()}
            >Upload New Photo</button
          >

          <button
            type="button"
            class="px-4 py-2 ml-2 font-bold text-black transition duration-150 ease-in-out rounded-md bg-accent-50 hover:bg-accent-600"
            on:click={delete_photo}>Delete Current Photo</button
          >
        </div>
      </div>
    </div>

    <div class="grid gap-6 pt-5 mb-6 md:grid-cols-2">
      <div>
        <Label for="first_name" class="mb-2">First Name</Label>
        <Input type="text" id="first_name" bind:value={user_info.first_name} />
      </div>
      <div>
        <Label for="middle_name" class="mb-2">Middle Name</Label>
        <Input
          type="text"
          id="middle_name"
          bind:value={user_info.middle_name}
        />
      </div>
      <div>
        <Label for="last_name" class="mb-2">Last Name</Label>
        <Input type="text" id="last_name" bind:value={user_info.last_name} />
      </div>
      <div>
        <Label for="last_name" class="mb-2">Username</Label>
        <Input type="text" id="username" bind:value={user_info.username}>
          <UserOutline slot="left" class="w-4 h-4" />
        </Input>
      </div>
    </div>
    <div class="pt-5">
      <div class="flex justify-end">
        {#if updating_profile}
          <Button class={update_button_class}>
            <Spinner class="me-3" size="4" color="white" /> Updating ...
          </Button>
        {:else}
          <Button type="submit" disabled={unchanged} class={update_button_class}
            >Save Changes</Button
          >
        {/if}
      </div>
    </div>
  </form>

  <form
    class="space-y-2 divide-gray-200"
    on:submit|preventDefault={() => {
      changing_password = true;
      change_password()
        .then((data) => {
          // console.log(data);
          toast.push("Password changed successfully", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
            },
          });
        })
        .catch((error) => {
          console.error(error);
          toast.push("An error occurred while changing your password", {
            theme: {
              "--toastBackground": "var(--accent-50)",
              "--toastProgressBackground": "var(--accent-100)",
              "--toastColor": "black",
            },
          });
        })
        .finally(() => {
          changing_password = false;
        });
    }}
  >
    <div class="grid w-1/2 gap-2 pt-5 mb-3 md:grid-cols-1">
      <div class="mb-2">
        <Label for="cur_password" class="mb-2">Current Password</Label>
        <Input
          type="password"
          id="cur_password"
          bind:value={current_password}
        />
      </div>
      <div class="mb-2">
        <Label for="password" class="mb-2">Password</Label>
        <Input
          type="password"
          id="password"
          required
          bind:value={new_password}
        />
        {#if new_password.length > 0 && new_password.length < 6}
          <Helper class="mt-2" color="red">
            Password must be of at least <span class="font-medium"
              >6 characters</span
            >
          </Helper>
        {:else if new_password !== "" && new_password == current_password}
          <Helper class="mt-2" color="red">
            New password must be different from the current password
          </Helper>
        {/if}
      </div>
      <div class="mb-2">
        <Label for="confirm_password" class="block mb-2">Confirm Password</Label
        >
        <Input
          type="password"
          id="confirm_password"
          color={new_password === "" || confirm_password === ""
            ? "base"
            : does_match
              ? "green"
              : "red"}
          bind:value={confirm_password}
        />
        {#if new_password != "" && confirm_password != ""}
          {#if does_match}
            <Helper class="mt-2" color="green">
              <span class="font-medium">Well done!</span>
              Passwords match.
            </Helper>
          {:else}
            <Helper class="mt-2" color="red">
              <span class="font-medium">Sorry!</span>
              Passwords do not match.
            </Helper>
          {/if}
        {/if}
      </div>
    </div>

    <div class="flex justify-end">
      {#if changing_password}
        <Button
          class="px-4 py-2 ml-3 font-bold transition duration-150 ease-in-out rounded-md bg-accent-300 disabled:hover:bg-accent-300 hover:bg-accent-500 dark:bg-accent-700 disabled:dark:hover:bg-accent-700 dark:hover:bg-accent-800 text-ink-light dark:text-ink-dark disabled:opacity-50"
        >
          <Spinner class="me-3" size="4" color="white" /> Updating ...
        </Button>
      {:else}
        <Button
          type="submit"
          disabled={current_password === "" ||
            new_password.length < 6 ||
            new_password != confirm_password}
          class={update_button_class}>Change Password</Button
        >
      {/if}
    </div>
  </form>
</div>

<Popover class="text-sm" triggeredBy="#password" placement="top">
  <h3 class="font-semibold text-gray-900 dark:text-white">
    Must have at least 6 characters
  </h3>
  <div class="grid grid-cols-4 gap-2">
    <!-- score number of oranges -->
    {#each Array(score) as _, i}
      <div class="h-1 bg-orange-300 dark:bg-orange-400" />
    {/each}
    <!-- 4 - score number of grays -->
    {#each Array(4 - score) as _, i}
      <div class="h-1 bg-gray-200 dark:bg-gray-600" />
    {/each}
  </div>
  <p class="py-2">It’s better to have:</p>
  <ul>
    <li class="flex items-center mb-1">
      {#if both_case}
        <CheckOutline class="w-4 h-4 text-green-400 me-2 dark:text-green-500" />
      {:else}
        <CloseOutline class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400" />
      {/if}
      Upper &amp; lower case letters
    </li>
    <li class="flex items-center mb-1">
      {#if have_symbols}
        <CheckOutline class="w-4 h-4 text-green-400 me-2 dark:text-green-500" />
      {:else}
        <CloseOutline class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400" />
      {/if}
      A symbol (#$&amp;)
    </li>
    <li class="flex items-center">
      {#if new_password.length >= 12}
        <CheckOutline class="w-4 h-4 text-green-400 me-2 dark:text-green-500" />
      {:else}
        <CloseOutline class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400" />
      {/if}
      A longer password (min. 12 chars.)
    </li>
  </ul>
</Popover>

<style>
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>

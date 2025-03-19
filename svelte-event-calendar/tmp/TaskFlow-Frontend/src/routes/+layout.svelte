<script lang="ts">
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownHeader,
    DropdownDivider,
  } from "flowbite-svelte";
  import { SunSolid, MoonSolid } from "flowbite-svelte-icons";
  import { user_info_store } from "$lib/stores/user_store";
  import theme_store from "$lib/stores/theme_store";
  import { accentColors } from "$lib/stores/theme_store";
  import { is_logged_in } from "$lib/stores/user_store";
  import { bounceOut } from "svelte/easing";
  import server_url from "$lib/stores/server_store";
  import { goto } from "$app/navigation";
  import { Shadow } from "svelte-loading-spinners";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import PaintBrush from "$lib/images/paint-brush.png";
  import { onMount } from "svelte";
  import { supabase } from "../supabase";

  let logging_out: boolean = false;

  function setThemeClass() {
    if ($theme_store.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    $theme_store.darkMode = !$theme_store.darkMode;
    localStorage.setItem("theme", $theme_store.darkMode ? "dark" : "light");
    setThemeClass();
  }

  function setAccentClass(_accent_color: string) {
    $accentColors.forEach((color) => {
      document.documentElement.classList.remove(`accent-${color}`);
    });
    document.documentElement.classList.add(`accent-${_accent_color}`);
  }

  function changeAccent(_accent_color: string) {
    $theme_store.accentCurrentColor = _accent_color;
    localStorage.setItem("accent", _accent_color);
    setAccentClass(_accent_color);
  }

  async function signOut() {
    logging_out = true;
    const headers = new Headers({
      Authorization: localStorage.getItem("access_token") || "",
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch($server_url + "/auth/signout", {
        method: "POST",
        headers: headers,
      });
      // console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      // logging out anyway
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      $is_logged_in = false;
      logging_out = false;
      goto("/login");
    }
  }

  onMount(() => {
    supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "PASSWORD_RECOVERY") {
        goto("/reset-password/new-password");
      }
    });
  });
</script>

<SvelteToast />

{#if logging_out}
  <div
    class="fixed inset-0 flex flex-col items-center justify-center min-w-full min-h-full bg-gray-900 bg-opacity-50"
  >
    <div>
      <Shadow color={get_color_hex_code($theme_store.accentCurrentColor)} />
    </div>
    <span class="mt-4 text-3xl font-bold tracking-wider text-white">
      Signing you out...
    </span>
  </div>
{/if}

<div
  class="min-h-screen text-ink-light dark:text-ink-dark bg-accent-100 dark:bg-accent-800"
>
  <Navbar class="sticky top-0 py-0 dark:bg-accent-900 bg-accent-50 z-50">
    <NavBrand href="/">
      <span class="self-center text-xl font-bold whitespace-nowrap text-white"
        >TaskFlow</span
      >
    </NavBrand>

    <NavUl slideParams={{ delay: 10, duration: 10, easing: bounceOut }}>
      <NavLi class="text-accent-100 font-bold" href="/">Home</NavLi>
      {#if $is_logged_in}
        <NavLi class="text-accent-100 font-bold" href="/dashboard"
          >Dashboard</NavLi
        >
        <NavLi class="text-accent-100 font-bold" href="/taskview"
          >Task View</NavLi
        >
        <NavLi class="text-accent-100 font-bold" href="/insights"
          >Insights</NavLi
        >
        <NavLi class="text-accent-100 font-bold" href="/notifications"
          >Notifications</NavLi
        >
      {:else}
        <NavLi class="text-accent-100 font-bold" href="/login">Login</NavLi>
        <NavLi class="text-accent-100 font-bold" href="/register"
          >Register</NavLi
        >
      {/if}
      <NavLi class="text-accent-100 font-bold" href="/about">About</NavLi>
    </NavUl>

    <div class="flex items-center md:order-2">
      {#if $is_logged_in}
        <Avatar
          id="avatar-menu"
          src="{$user_info_store.dp_url}?t={new Date().getTime()}"
          class="hover:cursor-pointer"
        />

        <Dropdown placement="bottom" triggeredBy="#avatar-menu">
          <DropdownHeader>
            <span class="block text-sm">{$user_info_store.username}</span>
            <span class="block text-sm font-medium truncate"
              >{$user_info_store.email}</span
            >
          </DropdownHeader>
          <DropdownItem>
            <a href="/settings">Profile Settings</a>
          </DropdownItem>
          <DropdownDivider></DropdownDivider>
          <DropdownItem>
            <button on:click={signOut} class="w-full text-left">
              <span class="mr-2">👋</span>
              Sign out
            </button>
          </DropdownItem>
        </Dropdown>
      {/if}

      <div class="flex items-center justify-between p-4">
        <button
          on:click={toggleTheme}
          class="p-2 mx-3 bg-gray-300 rounded dark:bg-gray-100"
        >
          <span class="text-accent-800">
            {#if $theme_store.darkMode}
              <SunSolid />
            {:else}
              <MoonSolid />
            {/if}
          </span>
        </button>

        <Avatar
          id="theme-menu"
          src={PaintBrush}
          size="sm"
          class="bg-gray-300 rounded-sm hover:cursor-pointer dark:bg-gray-100"
        />
        <Dropdown placement="bottom" triggeredBy="#theme-menu">
          <DropdownHeader>
            <span class="block text-sm">All Themes</span>
          </DropdownHeader>
          {#each $accentColors as color}
            <DropdownItem>
              {#if $theme_store.accentCurrentColor === color}
                <button
                  class="cursor-pointer rounded-full border-8 border-{color}-500 text-{color}-500 w-8 h-8"
                  on:click={() => changeAccent(color)}
                >
                </button>
              {:else}
                <button
                  class="cursor-pointer rounded-full border-8 border-{color}-300 text-{color}-500 w-4 h-4"
                  on:click={() => changeAccent(color)}
                >
                </button>
              {/if}
            </DropdownItem>
          {/each}
          <DropdownDivider />
        </Dropdown>
      </div>
    </div></Navbar
  >
  <slot />
</div>

<style>
  /* for toasts */
  :root {
    --toastBorder: 1px rounded-full #000;
    --toastBorderRadius: 0.5rem;
    --toastContainerBottom: 1rem;
    --toastContainerRight: 1rem;
    --toastContainerTop: auto;
    --toastContainerLeft: auto;
    --toastPadding: 0.25rem;
    --toastWidth: 18rem;
  }
</style>

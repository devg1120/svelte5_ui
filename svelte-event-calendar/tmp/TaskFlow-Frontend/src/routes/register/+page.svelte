<script lang="ts">
    import {
        Popover,
        Label,
        Input,
        Checkbox,
        Button,
        A,
        Helper,
    } from "flowbite-svelte";
    import { CheckOutline, CloseOutline } from "flowbite-svelte-icons";
    import { goto } from "$app/navigation";
    import server_url from "$lib/stores/server_store";
    import type { RegistrationInfo } from "$lib/interfaces/user";
    import { toast } from "@zerodevx/svelte-toast";
    import { Diamonds } from "svelte-loading-spinners";
    import theme_store from "$lib/stores/theme_store";
    import { get_color_hex_code } from "$lib/stores/theme_store";

    let new_user: RegistrationInfo = {
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
    };
    let confirm_password: string = "";

    let password_match: number = 0; // 0: not retyped, 1: mismatch, 2: match

    let both_case: boolean = false;
    let have_symbols: boolean = false;
    let score: number = 0;

    let registering: boolean = false;

    $: {
        if (confirm_password === "" || new_user.password === "")
            password_match = 0;
        else if (new_user.password === confirm_password) password_match = 2;
        else password_match = 1;

        both_case =
            /[a-z]/.test(new_user.password) && /[A-Z]/.test(new_user.password);
        have_symbols = /[!@#$%^&*]/.test(new_user.password);
        score = 0;
        if (both_case) score++;
        if (have_symbols) score++;
        if (new_user.password.length >= 12) score += 2;
        else if (new_user.password.length >= 6) score++;
    }

    async function register() {
        // console.log(new_user);

        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(new_user),
        };

        try {
            registering = true;
            const response = await fetch($server_url + "/auth/signup", request);
            // console.log(response);
            if (!response.ok) {
                console.error("Network response was not ok");
                return;
            }
            return await response.json();
        } catch (error) {
            throw new Error(
                "An error occurred during registration. Please try again.",
            );
        } finally {
            registering = false;
        }
    }
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>

{#if registering}
    <div
        class="fixed inset-0 flex flex-col items-center justify-center min-w-full min-h-full bg-gray-900 bg-opacity-50"
    >
        <div>
            <Diamonds
                color={get_color_hex_code($theme_store.accentCurrentColor)}
            />
        </div>
        <span class="mt-4 text-3xl font-bold tracking-wider text-white">
            Signing you up...
        </span>
    </div>
{/if}

<div class="flex h-screen overflow-hidden bg-accent-100 dark:bg-accent-900">
    <div
        class="flex flex-col items-center justify-center h-full px-3 mx-auto min-w-[30rem] w-1/3"
    >
        <div
            class="flex flex-col items-center justify-center w-full px-6 py-8 mx-auto border shadow-xl border-accent-50 rounded-xl dark:border-accent-50 dark:bg-accent-800 bg-accent-100"
        >
            <h2 class="mb-4 text-4xl font-bold text-accent-50">Register</h2>
            <form
                class="flex flex-col space-y-6"
                on:submit|preventDefault={() => {
                    if (new_user.password !== confirm_password) return;
                    if (new_user.password.length < 6) return;
                    register()
                        .then((data) => {
                            // console.log(data);
                            toast.push("Registration successful", {
                                theme: {
                                    "--toastBackground": "var(--accent-50)",
                                    "--toastProgressBackground":
                                        "var(--accent-100)",
                                    "--toastColor": "black",
                                },
                            });
                            goto("/login");
                        })
                        .catch((error) => {
                            console.error(error);
                            toast.push(
                                "An error occurred during registration. Please try again.",
                                {
                                    theme: {
                                        "--toastBackground": "var(--accent-50)",
                                        "--toastProgressBackground":
                                            "var(--accent-100)",
                                        "--toastColor": "black",
                                        "--toastContainerLeft": "1rem",
                                        "--toastContainerBottom": "1rem",
                                    },
                                },
                            );
                        });
                }}
            >
                <div class="grid gap-6 pt-5 md:grid-cols-2">
                    <div>
                        <Label for="first_name" class="mb-2">First name</Label>
                        <Input
                            type="text"
                            id="first_name"
                            bind:value={new_user.first_name}
                            class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            required
                            Placeholder="e.g. John"
                        />
                    </div>
                    <div>
                        <Label for="middle" class="mb-2">Middle name</Label>
                        <Input
                            type="text"
                            id="middle_name"
                            bind:value={new_user.middle_name}
                            class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            Placeholder="e.g. Doe"
                        />
                    </div>
                    <div>
                        <Label for="last_name" class="mb-2">Last name</Label>
                        <Input
                            type="text"
                            id="last_name"
                            bind:value={new_user.last_name}
                            class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            required
                            Placeholder="e.g. Smith"
                        />
                    </div>
                    <div>
                        <Label for="username" class="mb-2">Username</Label>
                        <Input
                            type="text"
                            id="username"
                            bind:value={new_user.username}
                            class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            required
                            Placeholder="e.g. jsmith"
                        />
                    </div>
                </div>
                <div class="mb-6">
                    <Label for="email" class="mb-2">Email address</Label>
                    <Input
                        type="email"
                        id="email"
                        required
                        bind:value={new_user.email}
                        class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                        Placeholder="Enter your mail"
                    />
                </div>
                <div class="mb-6">
                    <Label for="password" class="mb-2">Password</Label>
                    <Input
                        type="password"
                        id="password"
                        required
                        bind:value={new_user.password}
                        class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                        Placeholder="Type your password"
                    />
                    {#if new_user.password.length > 0 && new_user.password.length < 6}
                        <Helper class="mt-2" color="red">
                            Password must be of at least <span
                                class="font-medium">6 characters</span
                            >
                        </Helper>
                    {/if}
                </div>
                <div class="mb-6">
                    <Label for="confirm_password" class="mb-2"
                        >Confirm password</Label
                    >
                    <Input
                        type="password"
                        id="confirm_password"
                        bind:value={confirm_password}
                        required
                        class="p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                        Placeholder="Retype your password"
                    />
                    {#if password_match === 1}
                        <Helper class="mt-2" color="red">
                            <span class="font-medium">Sorry!</span>
                            Passwords do not match.
                        </Helper>
                    {:else if password_match === 2}
                        <Helper class="mt-2" color="green">
                            <span class="font-medium">Great!</span>
                            Passwords match.
                        </Helper>
                    {/if}
                </div>
                <Checkbox class="mb-6 space-x-1 rtl:space-x-reverse" required>
                    I agree with the <A
                        href="/about"
                        class="text-accent-50 hover:underline dark:text-accent-50"
                        >terms and conditions</A
                    >.
                </Checkbox>

                <button
                    class="w-full p-2 font-bold rounded-lg bg-accent-50 text-accent-100 hover:bg-accent-500"
                    type="submit">Submit</button
                >
                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account? <A
                        href="/login"
                        class="font-semibold text-accent-50 dark:text-accent-50 hover:underline "
                        >Sign in</A
                    >.
                </p>
            </form>
        </div>
    </div>
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
                <CheckOutline
                    class="w-4 h-4 text-green-400 me-2 dark:text-green-500"
                />
            {:else}
                <CloseOutline
                    class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400"
                />
            {/if}
            Upper &amp; lower case letters
        </li>
        <li class="flex items-center mb-1">
            {#if have_symbols}
                <CheckOutline
                    class="w-4 h-4 text-green-400 me-2 dark:text-green-500"
                />
            {:else}
                <CloseOutline
                    class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400"
                />
            {/if}
            A symbol (#$&amp;)
        </li>
        <li class="flex items-center">
            {#if new_user.password.length >= 12}
                <CheckOutline
                    class="w-4 h-4 text-green-400 me-2 dark:text-green-500"
                />
            {:else}
                <CloseOutline
                    class="w-4 h-4 text-gray-300 me-2 dark:text-gray-400"
                />
            {/if}
            A longer password (min. 12 chars.)
        </li>
    </ul>
</Popover>

<style>
    .typewriter-text {
        overflow: hidden;
        white-space: nowrap;
        margin: 0 auto;
        letter-spacing: 0.15em;
        animation:
            typing 4s steps(40, end) forwards,
            blink-caret 0.75s step-end infinite;
    }

    @keyframes typing {
        from {
            width: 0;
        }
        to {
            width: 100%;
        }
    }

    @keyframes blink-caret {
        from,
        to {
            border-color: transparent;
        }
        50% {
            border-color: white;
        }
    }
</style>

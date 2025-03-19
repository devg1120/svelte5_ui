<script lang="ts">
    import { toast } from "@zerodevx/svelte-toast";
    import { Button, Label, Input } from "flowbite-svelte";
    import { goto } from "$app/navigation";
    import server_url from "$lib/stores/server_store";
    import type { SignInInfo } from "$lib/interfaces/user";
    import { user_info_store, is_logged_in } from "$lib/stores/user_store";
    import { Stretch } from "svelte-loading-spinners";
    import { get_color_hex_code } from "$lib/stores/theme_store";
    import theme_store from "$lib/stores/theme_store";

    let user_info: SignInInfo = {
        email: "",
        password: "",
    };

    let show_toast: boolean = false;
    let toast_type: string = "";
    let toast_message: string = "";
    let logging_in: boolean = false;

    function display_toast(error: boolean, message: string) {
        toast_type = error ? "error" : "success";
        toast_message = message;
        show_toast = true;
    }

    $: {
        if (show_toast) {
            toast.push(toast_message, {
                theme: {
                    "--toastBackground": "var(--accent-50)",
                    "--toastProgressBackground": "var(--accent-100)",
                    "--toastColor": "black",
                },
            });
            show_toast = false;
        }
    }

    async function signIn() {
        // console.log(user_info);

        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user_info),
        };

        try {
            const response = await fetch($server_url + "/auth/signin", request);
            // console.log(response);
            if (!response.ok) {
                display_toast(true, "Invalid Credentials");
                console.error("Network response was not ok");
                logging_in = false;
                return;
            }
            const data = await response.json();
            logging_in = false;
            display_toast(
                false,
                `Welcome back, <strong>${data.userProfileData[0].username}</strong>!`,
            );
            localStorage.setItem(
                "access_token",
                "Bearer " + data.signInData.session.access_token,
            );
            $is_logged_in = true;
            $user_info_store = data.userProfileData[0];
            localStorage.setItem(
                "user",
                JSON.stringify(data.userProfileData[0]),
            );
            goto("/dashboard");
        } catch (error) {
            console.error(error);
            logging_in = false;
            display_toast(
                true,
                "An error occurred during sign-in. Please try again.",
            );
            return;
        }
    }
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>
{#if logging_in}
    <div
        class="fixed inset-0 flex flex-col items-center justify-center min-w-full min-h-full bg-gray-900 bg-opacity-50"
    >
        <div>
            <Stretch
                color={get_color_hex_code($theme_store.accentCurrentColor)}
            />
        </div>
        <span class="mt-4 text-3xl font-bold tracking-wider text-white">
            Signing you in...
        </span>
    </div>
{/if}

<div class="flex h-screen overflow-hidden bg-accent-100 dark:bg-accent-900">
    <div class="flex flex-col items-center justify-center w-full h-full">
        <div
            class="flex flex-col items-center border-[1px] justify-center px-2 py-8 my-8 mx-4 border-accent-50 dark:!border-accent-50 shadow-xl rounded-xl min-w-[26rem] lg:py-0 dark:border-gray-800 bg-accent-100 dark:bg-accent-800"
        >
            <h1 class="mt-8 text-2xl font-bold text-center text-accent-50">
                TaskFlow
            </h1>
            <h2
                class="text-base text-center font-base text-accent-900 dark:text-accent-100"
            >
                Manage your tasks with ease
            </h2>

            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <form
                    class="flex flex-col space-y-6"
                    on:submit|preventDefault={() => {
                        if (user_info.email === "" || user_info.password === "")
                            return;
                        logging_in = true;
                        signIn();
                    }}
                >
                    <Label class="space-y-2">
                        <span>Email</span>
                        <Input
                            name="email"
                            class="block w-full p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            bind:value={user_info.email}
                            required
                            placeholder="Enter your mail"
                        />
                    </Label>
                    <Label class="space-y-2">
                        <span>Password</span>
                        <Input
                            name="password"
                            type="password"
                            class="block w-full p-3 mt-1 placeholder-gray-400 border rounded-md shadow-sm dark:placeholder-gray-600 border-accent-50 dark:border-accent-50 focus:border-accent-50 dark:focus:border-accent-50 focus:ring focus:ring-accent-50 dark:focus:ring-accent-50 focus:ring-opacity-50 dark:bg-accent-700 bg-accent-100"
                            bind:value={user_info.password}
                            required
                            placeholder="Enter your password"
                        />
                    </Label>
                    <div class="flex items-start">
                        <a
                            href="/reset-password/recovery-mail"
                            class="ml-auto text-sm text-accent-50 hover:underline"
                            >Forgot password?</a
                        >
                    </div>
                    <button
                        class="w-full p-2 font-bold rounded-lg bg-accent-50 text-accent-100 hover:bg-accent-500"
                        type="submit">Sign in</button
                    >
                    <p
                        class="text-sm font-light text-ink-light dark:text-ink-dark"
                    >
                        Don’t have an account yet? <a
                            href="/register"
                            class="font-semibold text-accent-50 dark: hover:underline"
                            >Sign up</a
                        >
                    </p>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
    .typewriter-text {
        overflow: hidden;
        white-space: nowrap;
        margin: 0 auto;
        letter-spacing: 0.15em;
        animation: typing 4s steps(40, end) forwards;
    }

    @keyframes typing {
        from {
            width: 0;
        }
        to {
            width: 100%;
        }
    }
</style>

<script lang="ts">
    import type { BoardDashboardInfo } from "$lib/interfaces/board";
    import { Input } from "flowbite-svelte";
    import { SearchOutline } from "flowbite-svelte-icons";
    import { Pulse } from "svelte-loading-spinners";
    import theme_store from "$lib/stores/theme_store";
    import { get_color_hex_code } from "$lib/stores/theme_store";
    export let loading: boolean = false;
    export let all_boards: BoardDashboardInfo[] = [];

    let search_term: string = "";
    let showable_boards: BoardDashboardInfo[] = all_boards;

    let spinner_color: string = "#000000";
    $: {
        spinner_color = get_color_hex_code($theme_store.accentCurrentColor);
    }

    $: {
        showable_boards = all_boards.filter((board) =>
            board.board_name.toLowerCase().includes(search_term.toLowerCase()),
        );
    }
</script>

<div
    class="p-4 rounded-lg shadow details-section bg-accent-100 dark:bg-accent-900"
>
    {#if loading}
        <div class="flex flex-col items-center justify-center h-screen my-auto">
            <Pulse size="3" color={spinner_color} unit="cm" duration="1s" />
            <div class="pt-5 ml-4 text-2xl font-bold tracking-wider">
                Loading Your Boards...
            </div>
        </div>
    {:else}
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Your Boards</h2>
            <div class="flex space-x-2">
                <!-- Filter dropdowns or sorting controls can be added here -->
                <Input
                    id="search"
                    placeholder="Search Boards"
                    size="md"
                    bind:value={search_term}
                    class="dark:bg-accent-800 border-accent-50 dark:border-accent-50 text-accent-50"
                >
                    <SearchOutline
                        slot="left"
                        class="w-6 h-6 text-accent-50 "
                    />
                </Input>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th
                            class="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >Board</th
                        >
                        <th
                            class="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >Owner</th
                        >
                        <th
                            class="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >Due Date</th
                        >
                        <th
                            class="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >Status</th
                        >
                        <th
                            class="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >Progress</th
                        >
                    </tr>
                </thead>
                <tbody
                    class="divide-y bg-accent-100 dark:bg-accent-900 divide-accent-50"
                >
                    {#each showable_boards as board}
                        <tr>
                            <a href="/boards/{board.board_id}">
                                <td
                                    class="px-4 py-4 whitespace-nowrap hover:text-accent-50"
                                    >{board.board_name}</td
                                >
                            </a>
                            <td class="px-4 py-4 whitespace-nowrap"
                                >{board.owner_info.username}</td
                            >
                            <td class="px-4 py-4 whitespace-nowrap"
                                >{new Date(
                                    board.due_timestamp,
                                ).toLocaleDateString()}</td
                            >
                            <!-- randomly generated numbers for now -->
                            <td class="px-4 py-4 whitespace-nowrap">
                                {#if board.status === "In Progress"}
                                    <span
                                        class="inline-flex px-2 text-xs font-bold leading-5 text-yellow-800 bg-yellow-300 rounded-full dark:bg-blue-500 dark:text-blue-50"
                                    >
                                        In Progress
                                    </span>
                                {:else if board.status === "Completed"}
                                    <span
                                        class="inline-flex px-2 text-xs font-bold leading-5 text-green-800 bg-green-300 rounded-full dark:bg-green-500 dark:text-green-50"
                                    >
                                        Completed
                                    </span>
                                {:else if board.status === "Not Started"}
                                    <span
                                        class="inline-flex px-2 text-xs font-bold leading-5 text-red-800 bg-red-300 rounded-full dark:bg-red-500 dark:text-red-50"
                                    >
                                        Not Started
                                    </span>
                                {/if}
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap">
                                {#if board.progress === 0}
                                    <span
                                        class="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 rounded-full"
                                        style="width: {board.progress}%"
                                    >
                                        {board.progress}%
                                    </span>
                                {:else if board.progress < 100}
                                    <span
                                        class="inline-flex px-2 text-xs font-semibold leading-5 text-yellow-800 bg-yellow-300 rounded-full dark:bg-blue-500 dark:text-blue-50"
                                        style="width: {board.progress}%"
                                    >
                                        {board.progress}%
                                    </span>
                                {:else}
                                    <span
                                        class="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full dark:bg-green-500 dark:text-green-50"
                                        style="width: {board.progress}%"
                                    >
                                        {board.progress}%
                                    </span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

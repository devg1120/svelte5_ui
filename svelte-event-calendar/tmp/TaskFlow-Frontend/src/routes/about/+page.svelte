<script lang="ts">
    import {
        Accordion,
        AccordionItem,
        Drawer,
        Button,
        CloseButton,
        Label,
        Input,
        Textarea,
    } from "flowbite-svelte";
    import { InfoCircleSolid } from "flowbite-svelte-icons";
    import { sineIn } from "svelte/easing";
    import { toast } from "@zerodevx/svelte-toast";
    import server_url from "$lib/stores/server_store";

    let accordionItemClass: string =
        "bg-accent-200 dark:bg-accent-700 hover:bg-accent-200 dark:hover:bg-accent-600 shadow-lg";
    let hidden: boolean = true;
    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn,
    };

    let email: string = "";
    let subject: string = "";
    let message: string = "";

    async function submitComplaint() {
        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                subject,
                message,
            }),
        };

        try {
            const response = await fetch(
                $server_url + "/misc/feedback",
                request,
            );
            if (response.ok) {
                // console.log("Feedback submitted successfully");
            } else {
                console.error("Failed to submit feedback");
                throw new Error("Failed to submit feedback");
            }
        } catch (error) {
            console.error("Failed to submit feedback", error);
        }
    }
</script>

<svelte:head>
    <title>About TaskFlow</title>
</svelte:head>

<div class="min-h-screen py-6 bg-accent-100 dark:bg-accent-900">
    <div class="flex flex-col w-full max-w-3xl px-4 mx-auto my-8">
        <Accordion multiple>
            <AccordionItem class={accordionItemClass}>
                <span slot="header" class="flex gap-2 text-base">
                    <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7.529 7.988a2.502 2.502 0 0 1 5 .191A2.441 2.441 0 0 1 10 10.582V12m-.01 3.008H10M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    <span>What is TaskFlow?</span>
                </span>
                <p class="mb-2 text-gray-500 dark:text-gray-400">
                    TaskFlow is an innovative task manager assistant with an
                    automated UI agent designed to streamline productivity and
                    reduce procrastination, inspired from <a
                        target="_blank"
                        rel="noreferrer"
                        class="text-blue-600 dark:text-blue-500 hover:underline"
                        href="https://arxiv.org/abs/2302.05678"
                        >CatAlyst: Domain-Extensible Intervention for Preventing
                        Task Procrastination Using Large Generative Models</a
                    >
                    .
                </p>
                <p>
                    Through its intelligent features, TaskFlow helps users
                    organize their life, providing a seamless interface for
                    managing both personal and professional tasks.
                </p>
            </AccordionItem>
            <AccordionItem class={accordionItemClass}>
                <span slot="header" class="flex gap-2 text-base">
                    <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 21 18"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.5 3h9.563M9.5 9h9.563M9.5 15h9.563M1.5 13a2 2 0 1 1 3.321 1.5L1.5 17h5m-5-15 2-1v6m-2 0h4"
                        />
                    </svg>
                    <span>What are the key features?</span>
                </span>
                <ul class="mb-2 list-disc list-inside">
                    <li>
                        <strong>AI-Driven Task Management</strong>: Integrates
                        artificial intelligence to analyze task progress, and
                        then offer further assistance to resume the task. This
                        saves users from being stuck at a point in any task. The
                        AI agent serves as an initiator, guiding users to
                        overcome procrastination tendencies and manage tasks
                        effectively.
                    </li>
                    <li>
                        <strong>Content Generation</strong>: The AI agent
                        mentioned earlier will help the users in carrying on
                        their tasks by generating relevant contents. These
                        contents will be continuation of the progress the user
                        has already made in the respective task. Primarily,
                        these contents are going to be textual contents.
                    </li>
                    <li>
                        <strong>Intelligent Task Scheduling</strong>: Leverages
                        sophisticated algorithms to dynamically schedule tasks
                        based on user preferences, deadlines, and historical
                        productivity data. This assists in optimizing daily
                        routines and reduces the overwhelm of task management.
                    </li>
                    <li>
                        <strong>Effective Task Reminders</strong>: Thanks to the
                        in-house algorithm for task scheduling, TaskFlow gives
                        timely reminders to users to resume or initiate a task
                        before it gets too late. To add to the blessing,
                        TaskFlow not only gives reminders, but also provided
                        some initiating help to get things going on.
                    </li>
                    <li>
                        <strong>Statistical Analysis</strong>: Provides detailed
                        analytics on user performance and task completion
                        trends. These insights enable users to understand their
                        productivity patterns and make data-driven adjustments
                        to their schedules.
                    </li>
                    <li>
                        <strong>Collaborative Task Management</strong>: Allows
                        users to create and manage tasks with other users. This
                        enables teams to coordinate and collaborate on projects,
                        ensuring that everyone is on the same page.
                    </li>
                </ul>
            </AccordionItem>
            <AccordionItem class={accordionItemClass}>
                <span slot="header" class="flex gap-2 text-base">
                    <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 5.757v8.486M5.757 10h8.486M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    <span>What features can we expect in future?</span>
                </span>
                <ul class="mb-2 list-disc list-inside">
                    <li>
                        <strong>Progress Sharing</strong>: Users can share their
                        achievements of obtaining a milestone or completing a
                        task on popular social media platforms before their
                        friends and family.
                    </li>
                    <li>
                        <strong>Non-textual Content Generation</strong>:
                        Although primarily TaskFlow aims to offer textual
                        contents, it can later expand to image or other types of
                        contents as well.
                    </li>
                </ul>
            </AccordionItem>
            <AccordionItem class={accordionItemClass}>
                <span slot="header" class="flex gap-2 text-base">
                    <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m16.344 12.168-1.4-1.4a1.98 1.98 0 0 0-2.8 0l-.7.7a1.98 1.98 0 0 1-2.8 0l-2.1-2.1a1.98 1.98 0 0 1 0-2.8l.7-.7a1.981 1.981 0 0 0 0-2.8l-1.4-1.4a1.828 1.828 0 0 0-2.8 0C-.638 5.323 1.1 9.542 4.78 13.22c3.68 3.678 7.9 5.418 11.564 1.752a1.828 1.828 0 0 0 0-2.804Z"
                        />
                    </svg>
                    <span>Want to contact the developers?</span>
                </span>
                <p class="mb-2 text-gray-500 dark:text-gray-400">
                    You can contact the developers here:
                    <a
                        target="_blank"
                        rel="noreferrer"
                        class="text-blue-600 dark:text-blue-500 hover:underline"
                        href="mailto:sadatho2014@gmail.com"
                    >
                        Sadat</a
                    >
                    and
                    <a
                        target="_blank"
                        rel="noreferrer"
                        class="text-blue-600 dark:text-blue-500 hover:underline"
                        href="mailto:brainiac2677@gmail.com"
                    >
                        Asif</a
                    >.
                </p>
            </AccordionItem>
        </Accordion>

        <Drawer
            transitionType="fly"
            {transitionParams}
            bind:hidden
            id="sidebar3"
        >
            <div class="flex items-center">
                <h5
                    id="drawer-label"
                    class="inline-flex items-center mb-6 text-base font-semibold uppercase text-accent-50"
                >
                    <InfoCircleSolid class="w-4 h-4 me-2.5" />Contact us
                </h5>
                <CloseButton
                    on:click={() => (hidden = true)}
                    class="mb-4 dark:text-white"
                />
            </div>
            <form
                on:submit|preventDefault={() => {
                    submitComplaint()
                        .then(() => {
                            toast.push(
                                "Thanks for your feedback. We will get back to you!",
                                {
                                    theme: {
                                        "--toastBackground": "var(--accent-50)",
                                        "--toastProgressBackground":
                                            "var(--accent-100)",
                                        "--toastColor": "black",
                                    },
                                },
                            );
                            email = "";
                            subject = "";
                            message = "";
                        })
                        .catch((error) => {
                            toast.push("Error! Please try again.", {
                                theme: {
                                    "--toastBackground": "var(--accent-50)",
                                    "--toastProgressBackground":
                                        "var(--accent-100)",
                                    "--toastColor": "black",
                                },
                            });
                        })
                        .finally(() => {
                            hidden = true;
                        });
                }}
                class="mb-6"
            >
                <div class="mb-6">
                    <Label for="email" class="block mb-2">Your email</Label>
                    <Input
                        id="email"
                        name="email"
                        required
                        bind:value={email}
                        placeholder="name@company.com"
                    />
                </div>
                <div class="mb-6">
                    <Label for="subject" class="block mb-2">Subject</Label>
                    <Input
                        id="subject"
                        name="subject"
                        bind:value={subject}
                        placeholder="Let us know how we can help you"
                    />
                </div>
                <div class="mb-6">
                    <Label for="message" class="mb-2">Your message</Label>
                    <Textarea
                        id="message"
                        placeholder="Your message..."
                        rows="4"
                        name="message"
                        bind:value={message}
                        required
                    />
                </div>
                <button
                    class="w-full p-2 font-bold rounded-lg bg-accent-50 text-accent-100 hover:bg-accent-500"
                    type="submit">Send Message</button
                >
            </form>
        </Drawer>

        <div class="mt-6 text-center">
            <button
                class="w-1/3 p-2 font-bold rounded-lg bg-accent-50 text-accent-100 hover:bg-accent-500"
                type="submit"
                on:click={() => (hidden = false)}>Show Contact Form</button
            >
        </div>
    </div>
</div>

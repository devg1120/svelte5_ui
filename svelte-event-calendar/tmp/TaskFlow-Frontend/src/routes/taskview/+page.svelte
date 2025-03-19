<script lang="ts">
  import Calendar from "@event-calendar/core";
  import TimeGrid from "@event-calendar/time-grid";
  import DayGrid from "@event-calendar/day-grid";
  import List from "@event-calendar/list";
  import ResourceTimeGrid from "@event-calendar/resource-time-grid";
  import Interaction from "@event-calendar/interaction";
  import { Toast, Spinner } from "flowbite-svelte";
  import { toast } from "@zerodevx/svelte-toast";

  import theme_store from "$lib/stores/theme_store";
  import { get_color_hex_code } from "$lib/stores/theme_store";
  import server_url from "$lib/stores/server_store";
  import type { CalendarViewTask } from "$lib/interfaces/task";

  let ec: any;
  let task_fetching: boolean = false;
  let title_max_length: number = 40;
  let task_update_queue: TaskUpdateInfo[] = [];

  function clip_string(str: string, len: number): string {
    return str.length > len ? str.substring(0, len) + "..." : str;
  }

  async function update_task_time(
    requestID: string,
    taskID: string,
    start: string,
    end: string
  ) {
    const token: string = localStorage.getItem("access_token") || "";
    const headers = new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch($server_url + "/task/update-time", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          request_id: requestID,
          id: taskID,
          start: start,
          end: end,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      let res = await response.json();
      // console.log("success", res);
      return res;
    } catch (error) {
      console.error(requestID, "Error updating task time:", error);
      // need to restore the task to its original time
      let updateInfo = task_update_queue.find((x) => x.requestID === requestID);
      if (updateInfo) {
        let task: CalendarViewTask = ec.getEventById(updateInfo.id);
        if (task) {
          task.start = updateInfo.oldStart;
          task.end = updateInfo.oldEnd;
        }
        ec.updateEvent(task);
      }
      throw error;
    } finally {
      // remove the request from the queue
      task_update_queue = task_update_queue.filter(
        (x) => x.requestID !== requestID
      );
    }
  }

  let plugins = [TimeGrid, DayGrid, List, ResourceTimeGrid, Interaction];
  let options = {
    allDaySlot: true,
    editable: true,
    dragScroll: true,
    view: "dayGridMonth",
    headerToolbar: {
      start: "prev,next today",
      center: "title",
      end: "dayGridMonth listDay listWeek timeGridDay timeGridWeek",
    },
    buttonText: {
      close: "Close",
      dayGridMonth: "Month View",
      listDay: "Daily List",
      listMonth: "Monthly List",
      listWeek: "Weekly List",
      listYear: "Yearly List",
      resourceTimeGridDay: "day",
      resourceTimeGridWeek: "week",
      timeGridDay: "Day Breakdown",
      timeGridWeek: "Week Breakdown",
      today: "Today",
    },
    theme: function (previous_theme: any) {
      let event_classes = "ec-event !bg-accent-50";
      let event_body_classes =
        "ec-event-body !text-accent-900 !font-bold !text-base";
      let day_head_classes =
        "ec-day-head !bg-accent-100 !text-accent-900 dark:!bg-accent-900 dark:!text-accent-100 ";

      // console.log(previous_theme.view);
      if (previous_theme.view.includes("ec-list")) {
        event_classes = "ec-event !bg-accent-100 dark:!bg-accent-900";
        event_body_classes =
          "ec-event-body !text-accent-900 dark:!text-accent-100 !font-bold !text-base";
        day_head_classes =
          "ec-day-head !bg-accent-100 !text-accent-900 dark:!bg-accent-900 dark:!text-accent-100 !border-2 !border-accent-50";
      }
      return {
        ...previous_theme,
        button:
          "px-6 py-2 border-2 border-accent-50 text-accent-50 font-semibold rounded-md transition duration-150 ease-in-out hover:bg-accent-50 hover:text-accent-100 focus:outline-none focus:ring-2 focus:ring-accent-50 focus:ring-opacity-50",
        active: "!bg-accent-50 !text-accent-100",
        allDay: "ec-all-day !border-2 !border-accent-50",
        body: "ec-body !border-2 !border-accent-50",
        day: "ec-day !border-2 !border-accent-50",
        days: "ec-days !border-2 !border-accent-50",
        dayHead: day_head_classes,
        title: "text-xl font-bold",
        event: event_classes,
        eventBody: event_body_classes,
        eventTag: "ec-event-tag !bg-accent-50",
        header:
          "ec-header !border-2 !border-accent-50 !bg-accent-100 !text-accent-900 dark:!bg-accent-900 dark:!text-accent-100",
      };
    },
    eventDrop: function (info: any) {
      // console.log("drag & drop", info.event);
      let requestID: number =
        task_update_queue.length > 0
          ? Math.max(...task_update_queue.map((x) => parseInt(x.requestID))) + 1
          : 1;
      task_update_queue.push({
        requestID: requestID.toString(),
        id: info.event.id,
        title: info.event.title,
        oldStart: info.oldEvent.start.toISOString(),
        oldEnd: info.oldEvent.end.toISOString(),
        newStart: info.event.start.toISOString(),
        newEnd: info.event.end.toISOString(),
        handled: false,
      });
      update_task_time(
        requestID.toString(),
        info.event.id,
        info.event.start.toISOString(),
        info.event.end.toISOString()
      )
        .then((res) => {
          // console.log(info.event.title);
          toast.push(
            `Timeline shifting successful for \"<strong>${clip_string(
              info.event.title,
              title_max_length
            )}</strong>\"`,
            {
              theme: {
                "--toastBackground": "var(--accent-50)",
                "--toastProgressBackground": "var(--accent-100)",
                "--toastColor": "black",
              },
            }
          );
        })
        .catch((error) => {
          toast.push(
            `Error shifting timeline for \"<strong>${clip_string(
              info.event.title,
              title_max_length
            )}</strong>\"`,
            {
              theme: {
                "--toastBackground": "var(--accent-50)",
                "--toastProgressBackground": "var(--accent-100)",
                "--toastColor": "black",
              },
            }
          );
        });
    },
    eventResize: function (info: any) {
      // console.log("resize", info.event);
      let requestID: number =
        task_update_queue.length > 0
          ? Math.max(...task_update_queue.map((x) => parseInt(x.requestID))) + 1
          : 1;
      task_update_queue.push({
        requestID: requestID.toString(),
        id: info.event.id,
        title: info.event.title,
        oldStart: info.oldEvent.start.toISOString(),
        oldEnd: info.oldEvent.end.toISOString(),
        newStart: info.event.start.toISOString(),
        newEnd: info.event.end.toISOString(),
        handled: false,
      });
      update_task_time(
        requestID.toString(),
        info.event.id,
        info.event.start.toISOString(),
        info.event.end.toISOString()
      )
        .then((res) => {
          // console.log(info.event.title);
          toast.push(
            `Timeline extension successful for \"<strong>${clip_string(
              info.event.title,
              title_max_length
            )}</strong>\"`,
            {
              theme: {
                "--toastBackground": "var(--accent-50)",
                "--toastProgressBackground": "var(--accent-100)",
                "--toastColor": "black",
              },
            }
          );
        })
        .catch((error) => {
          toast.push(
            `Error extending timeline for \"<strong>${clip_string(
              info.event.title,
              title_max_length
            )}</strong>\"`,
            {
              theme: {
                "--toastBackground": "var(--accent-50)",
                "--toastProgressBackground": "var(--accent-100)",
                "--toastColor": "black",
              },
            }
          );
        });
    },
    firstDay: 6, // Saturday
    pointer: true,
    nowIndicator: true,
    selectable: true,
    loading: function (isLoading: boolean) {
      task_fetching = isLoading;
    },
    eventSources: [
      {
        events: function (
          fetchInfo: FetchInfo,
          successCallback: (events: CalendarViewTask[]) => void,
          failureCallback: (error: any) => void
        ) {
          // // console.log(fetchInfo);
          const requestBody = {
            start: fetchInfo.startStr,
            end: fetchInfo.endStr,
          };

          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("access_token") || "",
            },
            body: JSON.stringify(requestBody),
          };

          const url = $server_url + "/task/get-ranged-tasks";

          fetch(url, requestOptions)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((eventsData) => {
              const events = eventsData.map((event: any) => {
                return {
                  id: event.id,
                  start: event.start,
                  end: event.end,
                  title: event.title,
                  editable: event.editable,
                  backgroundColor: get_color_hex_code(
                    $theme_store.accentCurrentColor
                  ),
                };
              });
              // console.log("Fetching done", events);
              successCallback(events);
            })
            .catch((error) => {
              console.error("Error fetching tasks:", error);
              failureCallback(error);
            })
            .finally(() => {});
        },
      },
    ],
  };
</script>

<svelte:head>
  <title>Task View</title>
</svelte:head>

<div
  class="min-h-screen px-20 py-3 rounded-lg shadow-md bg-accent-100 dark:bg-accent-900"
>
  <h1 class="text-3xl font-semibold text-accent-900 dark:text-accent-100">
    Tasks
  </h1>
  <p class="my-4">View and manage your tasks</p>
  <p class="mt-1 text-sm text-accent-900 dark:text-accent-100">
    <Calendar bind:this={ec} {plugins} {options} />
  </p>

  {#if task_fetching}
    <Toast
      divClass="fixed bottom-5 z-10 right-5 w-full max-w-xs p-4 bg-accent-50 text-accent-900 shadow gap-3 font-bold"
    >
      <Spinner />
      <span class="ml-5 text-md font-bold text-white"
        >Loading your tasks...</span
      >
    </Toast>
  {/if}
</div>

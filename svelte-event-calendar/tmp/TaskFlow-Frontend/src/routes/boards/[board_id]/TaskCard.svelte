<script lang="ts">
  import type { BoardContentTaskForm } from "$lib/interfaces/task";
  import theme_store from "$lib/stores/theme_store";
  export let task: BoardContentTaskForm;

  if (task.task_label_color == null) {
    task.task_label_color = "#FFFFFF";
  }

  function showable_date(date: string): string {
    let date_obj = new Date(date);
    return date_obj.toDateString();
  }

  function remaining_time(date: string): string {
    let date_obj = new Date(date);
    let now = new Date();
    let diff = date_obj.getTime() - now.getTime();
    if (diff < 0) {
      return "Overdue";
    }
    let diff_days = Math.floor(diff / (1000 * 3600 * 24));
    let diff_hours = Math.floor((diff / (1000 * 3600)) % 24);
    let diff_minutes = Math.floor((diff / 1000 / 60) % 60);
    let diff_seconds = Math.floor((diff / 1000) % 60);
    return diff_days + " days, " + diff_hours + " hours";
  }
  let rem_time: string = remaining_time(task.task_deadline);

  let imageLoaded = false;

  let alert_color: string;
  $: {
    if (
      $theme_store.accentCurrentColor === "red" ||
      $theme_store.accentCurrentColor === "orange"
    )
      alert_color = "yellow";
    else alert_color = "red";
  }
</script>

<div class="p-2 rounded cursor-pointer bg-accent-50 text-accent-900">
  {#if task.task_cover_url}
    <div class="relative overflow-hidden rounded">
      <!-- Skeleton placeholder -->
      <div class="skeleton" class:hidden={imageLoaded}></div>

      <!-- Actual image -->
      <img
        src="{task.task_cover_url}?t={new Date().getTime()}"
        alt="Task Cover"
        class="w-full h-auto transition-opacity duration-700"
        class:hidden={!imageLoaded}
        on:load={() => (imageLoaded = true)}
      />
    </div>
  {/if}
  <a target="_self" href={"/tasks/" + task.task_id}>
    <div class="font-bold text-md">{task.task_name}</div>
    <div>Due Date: {showable_date(task.task_deadline)}</div>
    {#if rem_time == "Overdue"}
      <div class="font-bold" style="color: {alert_color}">
        {rem_time}
      </div>
    {:else}
      <div>Remaining Time: {rem_time}</div>
    {/if}
  </a>
</div>

<style>
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    height: 200px;
    width: 100%;
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

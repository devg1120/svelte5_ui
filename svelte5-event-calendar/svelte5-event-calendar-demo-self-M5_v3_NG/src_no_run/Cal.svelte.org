<script lang="ts">
    import Calendar from "@event-calendar/core";
    import TimeGrid from "@event-calendar/time-grid";

    let plugins = [TimeGrid];
    let options: Calendar.Options = {
        view: 'timeGridWeek',
        allDaySlot: false,
    };

    function toggleAllDay() {
        options.allDaySlot = !options.allDaySlot;
    }
</script>

<button on:click={toggleAllDay}>{options.allDaySlot ? "Hide" : "Show"} all-day</button>

<Calendar {plugins} {options} />

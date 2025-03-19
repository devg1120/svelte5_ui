declare module '@event-calendar/core'
declare module '@event-calendar/time-grid'
declare module '@event-calendar/day-grid'
declare module '@event-calendar/list'
declare module '@event-calendar/resource-time-grid'
declare module '@event-calendar/interaction'

interface FetchInfo {
    startStr: string;
    endStr: string;
    start: Date;
    end: Date;
}

interface TaskUpdateInfo {
    requestID: string;
    id: string;
    title: string;
    oldStart: string;
    oldEnd: string;
    newStart: string;
    newEnd: string;
    handled: boolean;
}


export interface BoardContentTaskForm {
  task_id: number;
  task_name: string;
  task_deadline: string;
  task_label_color: string;
  task_cover_url: string;
}

export interface CalendarViewTask {
  id: number;
  // allDay: boolean;
  start: string;
  end: string;
  title: string;
  editable: boolean;
  // startEditable: boolean;
  // durationEditable: boolean;
  backgroundColor: string;
  // textColor: string;
}

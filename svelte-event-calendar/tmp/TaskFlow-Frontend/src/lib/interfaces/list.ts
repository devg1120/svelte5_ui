import type { BoardContentTaskForm } from "./task";

export interface BoardContentListForm {
  list_id: number;
  list_name: string;
  list_deadline: string;
  list_tasks: Array<BoardContentTaskForm>;
}

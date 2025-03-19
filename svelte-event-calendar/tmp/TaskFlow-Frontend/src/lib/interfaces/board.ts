import type { BoardContentListForm } from "./list";
import type { UserMemberInfo } from "./user";

interface OwnerInfo {
  user_id: bigint;
  username: string;
}

export interface BoardDashboardInfo {
  board_id: number;
  board_name: string;
  due_timestamp: string;
  description: string;
  role: number;
  owner_info: OwnerInfo;
  progress: number;
  status: string;
}

interface MemberInfo {
  user_id: string;
  role: number;
}

export interface BoardCreationInfo {
  board_name: string;
  board_description: string;
  board_deadline: string;
  board_members: Array<MemberInfo>;
}

export interface BoardContent {
  board_id: number;
  board_description: string;
  board_deadline: string;
  board_lists: Array<BoardContentListForm>;
  board_name: string;
  board_access: number; // 1: owner, 2: admin, 3: member
  board_members: Array<UserMemberInfo>;
}

import { writable } from "svelte/store";
import type { User } from "../interfaces/user";

export const user_info_store = writable<User>();
export const is_logged_in = writable<boolean>(false);

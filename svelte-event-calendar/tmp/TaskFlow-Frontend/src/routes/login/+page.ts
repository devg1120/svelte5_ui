import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { is_logged_in } from "$lib/stores/user_store";

export const ssr = false;

let logged_in: boolean = false;
is_logged_in.subscribe((value) => (logged_in = value));

export const load: PageLoad = async () => {
  if (logged_in) throw redirect(301, "/dashboard");
};

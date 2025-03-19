import type { PageLoad } from "./$types";
import { user_info_store } from "$lib/stores/user_store";
import { is_logged_in } from "$lib/stores/user_store";
import theme_store from "$lib/stores/theme_store";

export const ssr = false;

function fix_stores() {
  if (localStorage.getItem("user")) {
    user_info_store.set(JSON.parse(localStorage.getItem("user") || ""));
    is_logged_in.set(true);
  } else {
    user_info_store.set({
      id: "",
      username: "",
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      dp_url: "",
    });
    is_logged_in.set(false);
  }
  theme_store.set({
    accentCurrentColor: localStorage.getItem("accent") || "red",
    darkMode: localStorage.getItem("theme") === "dark",
  });
}

export const load: PageLoad = async () => {
  fix_stores();
  return {
    status: 200,
    error: null,
    props: {},
  };
};

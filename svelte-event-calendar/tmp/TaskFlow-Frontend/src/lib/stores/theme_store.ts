import { writable } from "svelte/store";
import { readable } from "svelte/store";

// used for spinners mainly
export function get_color_hex_code(color_name: string): string {
  switch (color_name) {
    case "red":
      return "#FF0000";
    case "green":
      return "#00FF00";
    case "blue":
      return "#50C4ED";
    case "yellow":
      return "#FAEF5D";
    case "orange":
      return "#FBA834";
    default:
      return "#000000";
  }
}

export const accentColors = readable([
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
]);

// Create a writable store with a default value
const theme_store = writable({
  darkMode: false, // default value, will be updated after mount
  accentCurrentColor: "blue", // default value, will be updated after mount
});

export default theme_store;

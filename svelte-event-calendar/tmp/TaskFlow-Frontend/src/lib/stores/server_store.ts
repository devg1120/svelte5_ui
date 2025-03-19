import { readable } from "svelte/store";
const server_url = readable("https://taskflow-express-api-yr2w.onrender.com");
// const server_url = readable("http://localhost:3000");

export default server_url;

import daisyui from "daisyui";
import themes from "daisyui/theme/object";
import { plugin } from "postcss";

/* @type {import ('tailwindcss').config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugin: [
        require('daisyui'),
    ],
    daisyui: {
        themes: ["light"],
    },
}
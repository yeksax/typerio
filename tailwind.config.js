/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"zinc-850": "rgb(32 32 35)",
			},
			fontSize: {
				xxs: "0.625rem",
			},
			animation: {
				ring: "ring 1s ease-in-out infinite",
			},
			maxWidth: {
				"1/2": "50%",
				"7/10": "70%",
				"9/10": "90%",
			},
			zIndex: {
				1: "1",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};

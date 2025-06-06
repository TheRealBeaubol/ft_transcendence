module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
   		extend: {
			borderRadius: {
				'custom': '70px',
			},
		},
	},
	plugins: [
    require('@tailwindcss/line-clamp'),
	],
}
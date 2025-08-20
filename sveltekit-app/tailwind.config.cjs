const layerstack = require('@layerstack/tailwind/plugin');

export default {
	ux: {
		light: {
			primary: '#FF6467',
			accent: '#FF6467'
		},
		dark: {
			primary: '#FF6467',
			accent: '#FF6467'
		},
	},
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/svelte-ux/**/*.{svelte,js}',
		'./node_modules/layerchart/**/*.{svelte,js}'
	],
	theme: {
		extend: {
			screens: {
				mobile: '480px',
				tablet: '960px',
				desktop: '1248px',
				wide: '1500px'
			},
			colors: {
				accent: { 500: '#006747' },
				usfGreen: '#33856C',
				usfGold: '#CFC493',
				usfWhite: '#FFFFFF',
				secSand: '#EDEBD1',
				secEvergreen: '#005432',
				accLemongrass: '#DBE442',
				accApple: '#9CCB3B',
				accTeal: '#009374',
				accSeaglass: '#80B0A6',
				accStorm: '#006484',
				accSilver: '#CAD2D8',
				accGray: '#7E96A0',
				accSlate: '#293a40',
				clay: '#C03F1F'
			}
		}
	},
	variants: {
		extend: {}
	},
	plugins: [layerstack]
}

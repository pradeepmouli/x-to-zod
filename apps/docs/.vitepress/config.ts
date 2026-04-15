import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

export default defineConfig({
	title: 'x-to-zod',
	description:
		'Converts JSON Schema into Zod schemas with a fluent builder pattern',
	base: '/x-to-zod/',
	lastUpdated: true,
	cleanUrls: true,
	themeConfig: {
		nav: [
			{ text: 'Guide', link: '/guide/getting-started' },
			{ text: 'API', link: '/api/' },
			{ text: 'GitHub', link: 'https://github.com/pradeepmouli/x-to-zod' },
		],
		sidebar: {
			'/guide/': [
				{
					text: 'Guide',
					items: [
						{ text: 'Introduction', link: '/guide/getting-started' },
						{ text: 'Installation', link: '/guide/installation' },
						{ text: 'Usage', link: '/guide/usage' },
					],
				},
			],
			'/api/': [{ text: 'API Reference', items: typedocSidebar }],
		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/pradeepmouli/x-to-zod' },
		],
		footer: {
			message: 'Released under the ISC License.',
			copyright: 'Copyright © 2026 Pradeep Mouli',
		},
		search: { provider: 'local' },
	},
});

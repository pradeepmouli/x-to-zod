import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

export default defineConfig({
	title: 'x-to-zod',
	description:
		'Converts JSON Schema into Zod schemas with a fluent builder pattern',
	base: '/x-to-zod/',
	lastUpdated: true,
	cleanUrls: true,
	head: [
		['meta', { property: 'og:title', content: 'x-to-zod' }],
		[
			'meta',
			{
				property: 'og:description',
				content:
					'Converts JSON Schema into Zod schemas with a fluent builder pattern',
			},
		],
		['meta', { property: 'og:type', content: 'website' }],
		[
			'meta',
			{
				property: 'og:url',
				content: 'https://pradeepmouli.github.io/x-to-zod/',
			},
		],
		['meta', { name: 'twitter:card', content: 'summary' }],
		['meta', { name: 'twitter:title', content: 'x-to-zod' }],
		[
			'meta',
			{
				name: 'twitter:description',
				content:
					'Converts JSON Schema into Zod schemas with a fluent builder pattern',
			},
		],
	],
	sitemap: {
		hostname: 'https://pradeepmouli.github.io/x-to-zod',
	},
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

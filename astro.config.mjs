// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import yaml from '@rollup/plugin-yaml';
import remarkMath from 'remark-math';
import remarkPreserveMeta from './src/plugins/remark-preserve-meta/remarkPreserveMeta';
import remarkHeadingId from 'remark-custom-heading-id'; // support for custom heading ids in markdown
import rehypeMath from './src/plugins/rehype-math/rehypeMath';
import rehypeMermaid from '@beoe/rehype-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			customCss: [
				'./src/styles/beoeMermaid.css'
			],
			head: [
				{
					tag: 'script',
					attrs: {
						src: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=AM_CHTML',
					}
				}
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Math',
					collapsed: true,
					autogenerate: { directory: 'math' },
				},
				{
					label: 'Unreal Engine',
					collapsed: true,
					autogenerate: { directory: 'unreal-engine' },
				},
				{
					label: 'This documentation',
					collapsed: true,
					autogenerate: { directory: 'doc-reference' },
				},
			],
		}),
	],

	vite: {
		plugins: [yaml()]
	},

	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkPreserveMeta,
			remarkHeadingId
		],
		rehypePlugins: [rehypeMath, [rehypeMermaid, {darkScheme: 'class'}]],
	}
});

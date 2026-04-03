// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// math support
import remarkMath from 'remark-math';
import remarkPreserveMeta from './src/plugins/remark-preserve-meta/remarkPreserveMeta';
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
					autogenerate: { directory: 'math' },
				},
				{
					label: 'Unreal Engine',
					autogenerate: { directory: 'unreal-engine' },
				},
				{
					label: 'This documentation',
					autogenerate: { directory: 'doc-reference' },
				},
			],
		}),
	],

	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkPreserveMeta
		],
		rehypePlugins: [rehypeMath, [rehypeMermaid, {darkScheme: 'class'}]],
	}
});

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

const cppCodeRef = defineCollection({
	loader: glob({
		pattern: '**/*.{md,mdx}',
		base: './src/content/unreal-code-reference',
	}),
	schema: z.object({
		name: z.string(),
		type: z.literal([
			'macro',
			'class'
		]),
		group: z.string()
	})
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	'unreal-code-reference': cppCodeRef
};

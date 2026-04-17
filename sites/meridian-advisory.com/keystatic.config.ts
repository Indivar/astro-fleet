import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Meridian Advisory' },
  },
  collections: {
    insights: collection({
      label: 'Insights',
      slugField: 'title',
      path: 'src/content/insights/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { length: { min: 5, max: 120 } } },
          slug: { label: 'Slug' },
        }),
        publishedAt: fields.date({
          label: 'Published at',
          defaultValue: { kind: 'today' },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { length: { min: 20, max: 200 } },
        }),
        author: fields.text({ label: 'Author' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (t) => t.value,
        }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});

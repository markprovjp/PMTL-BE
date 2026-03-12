// ─────────────────────────────────────────────────────────────
//  src/admin/app.tsx — Strapi Admin panel customization
//  Registers CKEditor plugin with custom presets + Vietnamese UI
// ─────────────────────────────────────────────────────────────

import {
  setPluginConfig,
  defaultHtmlPreset,
  StrapiMediaLib,
  StrapiUploadAdapter,
} from '@_sh/strapi-plugin-ckeditor'

import vi from './extensions/translations/vi.merged.json'

export default {
  config: {
    locales: ['vi'],
    translations: {
      vi: vi as Record<string, string>,
    },
  },

  register(app: unknown) {
    // Configure CKEditor before bootstrap
    setPluginConfig({
      presets: [
        // ── HTML preset (default) — for BlogPost.content ─────
        {
          ...defaultHtmlPreset,
          name: 'pmtl-html',
          description: 'Editor HTML đầy đủ cho bài viết Phật pháp',
          editorConfig: {
            ...defaultHtmlPreset.editorConfig,
            plugins: [
              ...(defaultHtmlPreset.editorConfig.plugins ?? []),
              StrapiMediaLib,
              StrapiUploadAdapter,
            ],
            toolbar: {
              items: [
                'heading', '|',
                'bold', 'italic', 'underline', '|',
                'link', 'blockQuote', 'insertTable', '|',
                'bulletedList', 'numberedList', '|',
                'insertImage', 'mediaEmbed', '|',
                'sourceEditing', '|',
                'undo', 'redo',
              ],
            },
            language: 'vi',
          },
        },
      ],
    })
  },

  bootstrap(_app: unknown) {
    // No additional bootstrap needed
  },
}

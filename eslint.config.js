import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  tailwindcss: true,
  unocss: false,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  rules: {
    'no-console': 'warn',
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
  },
})

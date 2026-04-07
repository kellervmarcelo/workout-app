// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
  ],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-04-01',

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Workout Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'App para gerenciar seus treinos de forma simples e eficiente',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Desabilitado para performance, use `npm run type-check`
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
})

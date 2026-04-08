// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
  ],

  ssr: false,

  components: [
    { path: '~/components/ui', prefix: '' },
    { path: '~/components', pathPrefix: false },
  ],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-04-01',

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Workout Tracker',
      htmlAttrs: {
        lang: 'pt-BR',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        {
          name: 'description',
          content: 'App para gerenciar seus treinos de forma simples e eficiente',
        },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  imports: {
    dirs: ['lib'],
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
})

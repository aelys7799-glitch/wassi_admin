// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/apollo'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'https://wassibe-production-e003.up.railway.app/graphql'
    }
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.API_URL || 'https://wassibe-production-e003.up.railway.app/graphql'
      }
    }
  }
})

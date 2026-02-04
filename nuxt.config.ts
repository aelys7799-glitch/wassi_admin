// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/apollo'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.API_URL || 'http://localhost:8000/graphql'
      }
    }
  }
})

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/apollo'],
    apollo: {
        clients: {
            default: {
                httpEndpoint: 'http://localhost:8000/graphql'
            }
        }
    }
});
//# sourceMappingURL=nuxt.config.js.map
export default defineNuxtRouteMiddleware((to, from) => {
    // Check for the Apollo auth token
    // The cookie name depends on configuration, default is often 'apollo:<client>.token'
    const token = useCookie('apollo:default.token')

    // If no token and not on login page, redirect to login
    if (!token.value && to.path !== '/login') {
        return navigateTo('/login')
    }

    // If token exists and on login page, redirect to dashboard
    if (token.value && to.path === '/login') {
        return navigateTo('/')
    }
})

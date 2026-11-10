export default defineNuxtRouteMiddleware((to) => {
  const isPublicPage = to.path === '/login';
  const token = useCookie('apollo:default.token');

  if (!token.value && !isPublicPage) {
    return navigateTo('/login');
  }

  if (token.value && isPublicPage) {
    return navigateTo('/');
  }
});

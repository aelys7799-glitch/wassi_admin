<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-orange-500">Wassi Admin</h1>
      </div>
      <nav class="mt-6 px-4 space-y-1 flex-1 overflow-y-auto">
        <ULink to="/" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-home" class="mr-3 h-5 w-5" />
          Tableau de bord
        </ULink>
        
        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</div>
        
        <ULink to="/bookings" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-map" class="mr-3 h-5 w-5" />
          Transports (Taxi)
        </ULink>
        
        <ULink to="/deliveries" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-archive-box" class="mr-3 h-5 w-5" />
          Livraisons
        </ULink>

        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Flotte & Clients</div>

        <ULink to="/drivers" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-identification" class="mr-3 h-5 w-5" />
          Chauffeurs
        </ULink>

        <ULink to="/users" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-users" class="mr-3 h-5 w-5" />
          Utilisateurs
        </ULink>

        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Finances</div>
        
        <ULink to="/payments" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-currency-dollar" class="mr-3 h-5 w-5" />
          Transactions
        </ULink>

        <ULink to="/wallets" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-wallet" class="mr-3 h-5 w-5" />
          Portefeuilles
        </ULink>

        <ULink to="/reports" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-chart-bar" class="mr-3 h-5 w-5" />
          Rapports
        </ULink>

        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Système</div>

        <ULink to="/settings" active-class="bg-orange-50 text-orange-600 dark:bg-orange-900/20" class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <UIcon name="i-heroicons-cog-6-tooth" class="mr-3 h-5 w-5" />
          Paramètres
        </ULink>
      </nav>
      
      <div class="w-full p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <UButton 
          block
          variant="ghost" 
          color="red" 
          icon="i-heroicons-arrow-left-on-rectangle"
          class="justify-start"
          @click="handleLogout"
        >
          Déconnexion
        </UButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
      <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
        <div class="flex items-center space-x-4">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400">Admin</h2>
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-gray-300" />
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{{ currentPageName }}</h2>
        </div>
        
        <div class="flex items-center space-x-6">
          <UInput 
            icon="i-heroicons-magnifying-glass" 
            placeholder="Rechercher..." 
            size="sm" 
            class="hidden md:block w-64"
          />
          <UButton 
            variant="ghost" 
            color="gray" 
            icon="i-heroicons-bell" 
            class="rounded-full"
          />
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Admin" size="sm" class="cursor-pointer" />
          </UDropdown>
        </div>
      </header>

      <div class="p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
const { onLogout } = useApollo()
const router = useRouter()
const route = useRoute()

const currentPageName = computed(() => {
  const path = route.path
  if (path === '/') return 'Tableau de bord'
  if (path.startsWith('/bookings')) return 'Réservations'
  if (path.startsWith('/deliveries')) return 'Livraisons'
  if (path.startsWith('/drivers')) return 'Chauffeurs'
  if (path.startsWith('/users')) return 'Utilisateurs'
  if (path.startsWith('/payments')) return 'Transactions'
  if (path.startsWith('/reports')) return 'Rapports'
  if (path.startsWith('/settings')) return 'Paramètres'
  return 'Aperçu'
})

const userMenuItems = [
  [
    { label: 'Mon Profil', icon: 'i-heroicons-user' },
    { label: 'Notifications', icon: 'i-heroicons-bell' }
  ],
  [
    { label: 'Déconnexion', icon: 'i-heroicons-arrow-left-on-rectangle', color: 'red', click: handleLogout }
  ]
]

async function handleLogout() {
  try {
    await onLogout()
    router.push('/login')
  } catch (e) {
    console.error('Logout error:', e)
    router.push('/login')
  }
}
</script>

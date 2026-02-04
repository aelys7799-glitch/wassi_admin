<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard v-for="i in 4" :key="i" class="animate-pulse h-24" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard v-for="stat in statsDisplay" :key="stat.label">
        <div class="flex items-center space-x-4">
          <div :class="`p-3 rounded-full ${stat.bgColor}`">
            <UIcon :name="stat.icon" :class="`h-6 w-6 ${stat.iconColor}`" />
          </div>
          <div>
            <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity Placeholder -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold">Activités récentes</h3>
          <UButton variant="ghost" @click="refresh">Actualiser</UButton>
        </div>
      </template>
      <div class="space-y-4">
        <div v-if="pending" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
        </div>
        <div v-else-if="error" class="text-red-500">
          Erreur lors du chargement des statistiques
        </div>
        <div v-else class="space-y-4">
          <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <div :class="`p-2 rounded-lg ${activity.type === 'BOOKING' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`">
              <UIcon :name="activity.type === 'BOOKING' ? 'i-heroicons-map' : 'i-heroicons-archive-box'" class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <div class="flex justify-between">
                <p class="font-semibold text-gray-900 dark:text-white">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.createdAt) }}</p>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ activity.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const query = gql`
  query GetDashboard {
    dashboardStats {
      totalUsers
      totalBookings
      totalDrivers
      totalRevenue
    }
    recentActivities {
      id
      type
      title
      description
      createdAt
    }
  }
`

const { data, pending, error, refresh } = await useAsyncQuery(query)

const activities = computed(() => data.value?.recentActivities || [])

const statsDisplay = computed(() => {
  const d = data.value?.dashboardStats || {}
  return [
    { label: 'Utilisateurs', value: d.totalUsers || 0, icon: 'i-heroicons-users', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Courses', value: d.totalBookings || 0, icon: 'i-heroicons-calendar', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Chauffeurs', value: d.totalDrivers || 0, icon: 'i-heroicons-truck', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Revenu', value: `${(d.totalRevenue || 0).toLocaleString()} CFA`, icon: 'i-heroicons-banknotes', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
  ]
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

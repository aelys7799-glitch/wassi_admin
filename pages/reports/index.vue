<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Analytiques & Rapports</h3>
      <div class="flex space-x-3">
        <USelect v-model="period" :options="['Aujourd\'hui', '7 derniers jours', '30 derniers jours', 'Cette année']" class="w-48" />
        <UButton icon="i-heroicons-arrow-down-tray" variant="outline">Télécharger PDF</UButton>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <UCard v-for="stat in simpleStats" :key="stat.label" class="overflow-hidden relative">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ stat.label }}</span>
          <span class="text-2xl font-black mt-1">{{ stat.value }}</span>
          <span :class="`text-xs mt-2 flex items-center ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`">
            <UIcon :name="stat.trend > 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="mr-1 h-3 w-3" />
            {{ Math.abs(stat.trend) }}% {{ stat.trend > 0 ? 'Progression' : 'Baisse' }}
          </span>
        </div>
        <div :class="`absolute top-0 right-0 p-4 opacity-10 text-4xl ${stat.color}`">
           <UIcon :name="stat.icon" />
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Performance Chart Simulation -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="font-bold">Activité de la semaine</h4>
            <div class="flex items-center space-x-4 text-xs">
               <span class="flex items-center"><span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span> Transports</span>
               <span class="flex items-center"><span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span> Livraisons</span>
            </div>
          </div>
        </template>
        <div class="h-64 flex items-end justify-between px-4 space-x-2 pb-2">
          <div v-for="day in weekStats" :key="day.name" class="flex-1 flex flex-col items-center group">
            <div class="w-full flex justify-center space-x-1 items-end h-48">
              <div :style="`height: ${day.rides}%`" class="w-4 bg-orange-500 rounded-t-sm transition-all duration-500 group-hover:bg-orange-600"></div>
              <div :style="`height: ${day.deliveries}%`" class="w-4 bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600"></div>
            </div>
            <span class="text-[10px] mt-4 font-bold text-gray-500 uppercase">{{ day.name }}</span>
          </div>
        </div>
      </UCard>

      <!-- Distribution -->
      <UCard>
        <template #header>
          <h4 class="font-bold">Répartition des Courses</h4>
        </template>
        <div class="space-y-6 py-4">
          <div v-for="item in distribution" :key="item.label" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ item.label }}</span>
              <span class="font-bold">{{ item.value }}%</span>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
               <div :style="`width: ${item.value}%`" :class="`h-full rounded-full transition-all duration-1000 ${item.color}`"></div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
const period = ref('7 derniers jours')

const simpleStats = [
  { label: 'Courses Totales', value: '1,280', trend: 12.5, icon: 'i-heroicons-map', color: 'text-orange-500' },
  { label: 'Revenu Net', value: '450,000 CFA', trend: 8.2, icon: 'i-heroicons-banknotes', color: 'text-green-500' },
  { label: 'Livraisons', value: '342', trend: -2.4, icon: 'i-heroicons-archive-box', color: 'text-blue-500' },
  { label: 'Satisfaction', value: '4.8/5', trend: 0.5, icon: 'i-heroicons-star', color: 'text-yellow-500' }
]

const weekStats = [
  { name: 'Lun', rides: 45, deliveries: 30 },
  { name: 'Mar', rides: 60, deliveries: 25 },
  { name: 'Mer', rides: 55, deliveries: 40 },
  { name: 'Jeu', rides: 70, deliveries: 35 },
  { name: 'Ven', rides: 85, deliveries: 20 },
  { name: 'Sam', rides: 95, deliveries: 15 },
  { name: 'Dim', rides: 40, deliveries: 10 }
]

const distribution = [
  { label: 'Transport Urbain', value: 65, color: 'bg-orange-500' },
  { label: 'Livraison Express', value: 25, color: 'bg-blue-500' },
  { label: 'Inter-urbain', value: 10, color: 'bg-green-500' }
]
</script>

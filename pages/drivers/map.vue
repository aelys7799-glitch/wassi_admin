<template>
  <div class="h-[calc(100vh-160px)] flex flex-col space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Géolocalisation Live</h3>
      <div class="flex items-center space-x-4">
         <UBadge color="green" variant="soft">{{ onlineDrivers.length }} Chauffeurs en ligne</UBadge>
         <UButton icon="i-heroicons-arrow-path" variant="ghost" @click="refresh" :loading="pending" />
      </div>
    </div>

    <div class="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden relative bg-gray-100">
       <!-- Leaflet Map Container -->
       <div id="admin-live-map" class="w-full h-full"></div>

       <!-- Overlay Info -->
       <div class="absolute bottom-6 left-6 z-[1000] bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-xl rounded-xl p-4 w-64">
          <h4 class="font-bold text-sm mb-2">Légende</h4>
          <div class="space-y-2">
             <div class="flex items-center text-xs">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Chauffeur Disponible</span>
             </div>
             <div class="flex items-center text-xs">
                <span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span>Chauffeur en Course</span>
             </div>
          </div>
       </div>
    </div>

    <!-- Scripts for Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  </div>
</template>

<script setup>
const query = gql`
  query GetOnlineDrivers {
    onlineDrivers {
      id
      lastKnownLat
      lastKnownLng
      vehicleType
      user {
        firstName
        lastName
      }
    }
  }
`

const { data, pending, refresh } = await useAsyncQuery(query)
const onlineDrivers = computed(() => data.value?.onlineDrivers || [])

let map = null
let markers = {}

onMounted(() => {
  // Load Leaflet dynamically to avoid SSR issues
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  script.onload = initMap
  document.head.appendChild(script)
})

function initMap() {
  if (typeof L === 'undefined') return
  
  map = L.map('admin-live-map').setView([13.5127, 2.1126], 13) // Niamey center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  updateMarkers()
}

function updateMarkers() {
  if (!map || typeof L === 'undefined') return

  // Remove old markers
  Object.values(markers).forEach(m => map.removeLayer(m))
  markers = {}

  onlineDrivers.value.forEach(driver => {
    if (driver.lastKnownLat && driver.lastKnownLng) {
      const marker = L.marker([driver.lastKnownLat, driver.lastKnownLng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-8 h-8 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-white">
                  <i class="i-heroicons-truck w-4 h-4"></i>
                </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map)
      
      marker.bindPopup(`<strong>${driver.user.firstName} ${driver.user.lastName}</strong><br>${driver.vehicleType}`)
      markers[driver.id] = marker
    }
  })
}

// Watch for data changes
watch(onlineDrivers, () => {
  updateMarkers()
}, { deep: true })

// Polling for updates every 10 seconds
let pollInterval = null
onMounted(() => {
  pollInterval = setInterval(refresh, 10000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style>
.custom-div-icon {
  background: transparent;
  border: none;
}
</style>

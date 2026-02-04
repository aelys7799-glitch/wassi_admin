<template>
  <div class="space-y-6">
     <!-- Header with Back button and basic status -->
     <div class="flex items-center space-x-4">
        <UButton icon="i-heroicons-arrow-left" variant="ghost" @click="router.back()" />
        <h2 class="text-xl font-bold dark:text-white">Détails de la Livraison</h2>
        <UBadge :color="statusColor(delivery?.status)" variant="subtle" size="lg">{{ delivery?.status }}</UBadge>
     </div>
     
     <div v-if="pending" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <USkeleton class="h-32 w-full" />
            <USkeleton class="h-32 w-full" />
            <USkeleton class="h-64 w-full lg:col-span-2" />
        </div>
     </div>
     
     <div v-else-if="delivery" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Client Card -->
        <UCard>
           <template #header><h3 class="font-bold text-gray-700 dark:text-gray-200">Client</h3></template>
           <div class="flex items-center space-x-4">
              <UAvatar :alt="delivery.client?.firstName" size="md" />
              <div>
                 <p class="font-bold text-gray-900 dark:text-white">{{ delivery.client?.firstName }} {{ delivery.client?.lastName }}</p>
                 <p class="text-sm text-gray-500">{{ delivery.client?.email }}</p>
              </div>
           </div>
        </UCard>
        
        <!-- Driver Card -->
        <UCard>
           <template #header><h3 class="font-bold text-gray-700 dark:text-gray-200">Chauffeur Detail</h3></template>
           <div v-if="delivery.driver" class="flex items-center space-x-4">
              <UAvatar :alt="delivery.driver.user.firstName" size="md" />
              <div>
                 <p class="font-bold text-gray-900 dark:text-white">{{ delivery.driver.user.firstName }} {{ delivery.driver.user.lastName }}</p>
                 <p class="text-sm text-gray-500">{{ delivery.driver.user.email }}</p>
                 <p class="text-xs text-gray-400 mt-1">{{ delivery.driver.user.phoneNumber }}</p>
              </div>
           </div>
           <div v-else class="flex flex-col items-center py-4 text-center">
             <UIcon name="i-heroicons-user-slash" class="text-gray-400 w-8 h-8 mb-2" />
             <p class="text-gray-400 italic">Aucun chauffeur assigné pour le moment</p>
           </div>
        </UCard>
        
        <!-- Delivery Details -->
        <UCard class="lg:col-span-2">
           <template #header><h3 class="font-bold text-gray-700 dark:text-gray-200">Informations du Colis & Trajet</h3></template>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-6">
                 <div>
                    <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Description</p>
                    <p class="font-medium text-gray-900 dark:text-white text-lg bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{{ delivery.packageDescription }}</p>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Prix</p>
                        <p class="font-bold text-2xl text-green-600">{{ delivery.price.toLocaleString() }} <span class="text-sm text-gray-500 font-normal">CFA</span></p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Date de création</p>
                        <p class="font-medium text-gray-700 dark:text-gray-300">{{ new Date(delivery.createdAt).toLocaleString() }}</p>
                    </div>
                 </div>
              </div>
              
              <div class="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 space-y-8">
                 <!-- Pickup -->
                 <div class="relative">
                    <span class="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-green-500 bg-white dark:bg-gray-900"></span>
                    <p class="text-sm font-bold text-green-600 mb-1 flex items-center">
                        <UIcon name="i-heroicons-map-pin" class="mr-1"/> Point de ramassage
                    </p>
                    <p class="font-mono text-xs text-gray-500 mb-2">{{ delivery.pickupLocation.latitude }}, {{ delivery.pickupLocation.longitude }}</p>
                    <UButton size="xs" color="gray" variant="soft" icon="i-heroicons-arrow-top-right-on-square" :to="googleMapsLink(delivery.pickupLocation)" target="_blank">
                        Voir sur Google Maps
                    </UButton>
                 </div>
                 
                 <!-- Delivery -->
                 <div class="relative">
                    <span class="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-red-500 bg-white dark:bg-gray-900"></span>
                    <p class="text-sm font-bold text-red-600 mb-1 flex items-center">
                        <UIcon name="i-heroicons-flag" class="mr-1"/> Destination
                    </p>
                    <p class="font-mono text-xs text-gray-500 mb-2">{{ delivery.deliveryLocation.latitude }}, {{ delivery.deliveryLocation.longitude }}</p>
                    <UButton size="xs" color="gray" variant="soft" icon="i-heroicons-arrow-top-right-on-square" :to="googleMapsLink(delivery.deliveryLocation)" target="_blank">
                        Voir sur Google Maps
                    </UButton>
                 </div>
              </div>
           </div>
        </UCard>
     </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const id = route.params.id

const query = gql`
  query GetDelivery($id: String!) {
    delivery(id: $id) {
      id
      status
      price
      packageDescription
      createdAt
      pickupLocation { latitude longitude }
      deliveryLocation { latitude longitude }
      client {
        id
        firstName
        lastName
        email
        phoneNumber
      }
      driver {
        id
        user {
          firstName
          lastName
          email
          phoneNumber
        }
      }
    }
  }
`

const { data, pending } = await useAsyncQuery(query, { id })
const delivery = computed(() => data.value?.delivery)

const statusColor = (status) => {
  switch (status) {
    case 'DELIVERED': return 'green'
    case 'PICKED_UP': return 'blue'
    case 'ASSIGNED': return 'indigo'
    case 'PENDING': return 'orange'
    case 'CANCELLED': return 'red'
    default: return 'gray'
  }
}

const googleMapsLink = (coords) => `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
</script>

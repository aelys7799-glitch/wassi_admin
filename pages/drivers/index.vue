<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Chauffeurs</h3>
      <div class="flex space-x-2">
         <UButton icon="i-heroicons-map" color="blue" variant="outline" to="/drivers/map">Carte Live</UButton>
         <UButton icon="i-heroicons-arrow-path" color="orange" variant="ghost" @click="refresh" :loading="pending" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <UCard class="bg-blue-50 dark:bg-blue-900/10">
          <p class="text-xs font-bold text-blue-600 uppercase">Total Chauffeurs</p>
          <p class="text-2xl font-bold">{{ drivers.length }}</p>
       </UCard>
       <UCard class="bg-green-50 dark:bg-green-900/10">
          <p class="text-xs font-bold text-green-600 uppercase">Vérifiés</p>
          <p class="text-2xl font-bold">{{ drivers.filter(d => d.isVerified).length }}</p>
       </UCard>
       <UCard class="bg-orange-50 dark:bg-orange-900/10">
          <p class="text-xs font-bold text-orange-600 uppercase">En Attente</p>
          <p class="text-2xl font-bold">{{ drivers.filter(d => !d.isVerified).length }}</p>
       </UCard>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="drivers" :loading="pending">
        <template #user-data="{ row }">
          <div class="flex items-center space-x-3">
            <UAvatar :alt="row.user.firstName" size="sm" />
            <div>
              <p class="font-bold text-gray-900 dark:text-white">{{ row.user.firstName }} {{ row.user.lastName }}</p>
              <p class="text-xs text-gray-500">{{ row.user.email }}</p>
            </div>
          </div>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="row.isOnline ? 'green' : 'gray'" variant="soft">
            {{ row.isOnline ? 'En ligne' : 'Hors ligne' }}
          </UBadge>
        </template>
        <template #isVerified-data="{ row }">
          <UBadge :color="row.isVerified ? 'green' : 'red'" variant="solid">
            {{ row.isVerified ? 'Vérifié' : 'Non vérifié' }}
          </UBadge>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </UCard>

    <!-- Document Review Modal -->
    <UModal v-model="showReviewModal" size="lg">
      <UCard v-if="selectedDriver">
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="font-bold">Documents de {{ selectedDriver.user.firstName }}</h4>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showReviewModal = false" />
          </div>
        </template>
        
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="space-y-2">
                <p class="text-sm font-bold">Permis de conduire</p>
                <div class="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                   <img v-if="selectedDriver.licenseImageUrl" :src="selectedDriver.licenseImageUrl" class="object-cover w-full h-full" />
                   <UIcon v-else name="i-heroicons-document-text" class="text-4xl text-gray-400" />
                </div>
             </div>
             <div class="space-y-2">
                <p class="text-sm font-bold">Carte d'Identité (CNI)</p>
                <div class="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                   <img v-if="selectedDriver.idCardImageUrl" :src="selectedDriver.idCardImageUrl" class="object-cover w-full h-full" />
                   <UIcon v-else name="i-heroicons-identification" class="text-4xl text-gray-400" />
                </div>
             </div>
          </div>

          <div class="space-y-2">
             <p class="text-sm font-bold">Photo du Véhicule</p>
             <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                <img v-if="selectedDriver.vehicleImageUrl" :src="selectedDriver.vehicleImageUrl" class="object-cover w-full h-full" />
                <UIcon v-else name="i-heroicons-truck" class="text-4xl text-gray-400" />
             </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
             <UButton color="red" variant="soft" label="Rejeter" />
             <UButton v-if="!selectedDriver.isVerified" color="green" label="Valider le Chauffeur" @click="handleValidate(selectedDriver.id)" />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const columns = [
  { key: 'user', label: 'Chauffeur' },
  { key: 'vehicleType', label: 'Véhicule' },
  { key: 'vehiclePlate', label: 'Plaque' },
  { key: 'status', label: 'Activité' },
  { key: 'isVerified', label: 'Vérification' },
  { key: 'actions', label: 'Actions' }
]

const query = gql`
  query GetDrivers {
    drivers {
      id
      licenseNumber
      vehicleType
      vehiclePlate
      isVerified
      isOnline
      licenseImageUrl
      idCardImageUrl
      vehicleImageUrl
      user {
        firstName
        lastName
        email
        status
      }
    }
  }
`

const VALIDATE_MUTATION = gql`
  mutation ValidateDriver($id: String!) {
    validateDriver(id: $id) {
      id
      isVerified
    }
  }
`

const { data, pending, refresh } = await useAsyncQuery(query)
const drivers = computed(() => data.value?.drivers || [])

const { mutate: validateMutate } = useMutation(VALIDATE_MUTATION)

const showReviewModal = ref(false)
const selectedDriver = ref(null)

const actions = (row) => [
  [
    { label: 'Voir Documents', icon: 'i-heroicons-eye', click: () => { selectedDriver.value = row; showReviewModal.value = true; } },
    { label: 'Modifier', icon: 'i-heroicons-pencil' }
  ],
  [
    { label: 'Désactiver', icon: 'i-heroicons-no-symbol', color: 'orange' },
    { label: 'Supprimer', icon: 'i-heroicons-trash', color: 'red' }
  ]
]

async function handleValidate(id) {
  try {
    await validateMutate({ id })
    showReviewModal.value = false
    await refresh()
  } catch (e) {
    console.error('Validation error:', e)
  }
}
</script>

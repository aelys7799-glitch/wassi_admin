<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Livraisons</h3>
      <UButton icon="i-heroicons-arrow-path" color="orange" variant="ghost" @click="refresh" :loading="pending" />
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex items-center space-x-4">
        <UInput 
          v-model="search" 
          icon="i-heroicons-magnifying-glass" 
          placeholder="Rechercher par client ou ID..." 
          class="flex-1"
        />
        <USelectMenu 
          v-model="selectedStatus" 
          placeholder="Statut" 
          :options="['Tous', 'PENDING', 'PICKED_UP', 'DELIVERED', 'CANCELLED']" 
          class="w-48"
        />
      </div>
    </UCard>

    <UCard>
      <UTable :columns="columns" :rows="filteredDeliveries" :loading="pending">
        <template #client-data="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">
            {{ row.client?.firstName }} {{ row.client?.lastName }}
          </div>
          <div class="text-xs text-gray-500 line-clamp-1">{{ row.packageDescription }}</div>
        </template>
        <template #driver-data="{ row }">
          <div v-if="row.driver" class="flex items-center space-x-2">
            <UIcon name="i-heroicons-truck" class="h-4 w-4 text-green-500" />
            <span>{{ row.driver.user.firstName }} {{ row.driver.user.lastName }}</span>
          </div>
          <span v-else class="text-gray-400 italic text-sm">Non assigné</span>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="statusColor(row.status)" variant="soft">
            {{ row.status }}
          </UBadge>
        </template>
        <template #createdAt-data="{ row }">
          {{ new Date(row.createdAt).toLocaleDateString() }}
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup>
const router = useRouter()
const toast = useToast()

const CANCEL_MUTATION = gql`
  mutation CancelDelivery($id: String!) {
    cancelDelivery(id: $id) {
      id
      status
    }
  }
`

const columns = [
  { key: 'createdAt', label: 'Date' },
  { key: 'client', label: 'Client / Colis' },
  { key: 'driver', label: 'Chauffeur' },
  { key: 'price', label: 'Prix (CFA)' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' }
]

const query = gql`
  query GetDeliveries {
    deliveries {
      id
      price
      status
      packageDescription
      createdAt
      client {
        firstName
        lastName
      }
      driver {
        user {
          firstName
          lastName
        }
      }
    }
  }
`

const { data, pending, refresh } = await useAsyncQuery(query)
const { mutate: cancelMutate } = useMutation(CANCEL_MUTATION)

const search = ref('')
const selectedStatus = ref('Tous')

const filteredDeliveries = computed(() => {
  let list = data.value?.deliveries ?? []
  
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(d => 
      d.id.toLowerCase().includes(s) || 
      d.client?.firstName.toLowerCase().includes(s) || 
      d.client?.lastName.toLowerCase().includes(s)
    )
  }

  if (selectedStatus.value !== 'Tous') {
    list = list.filter(d => d.status === selectedStatus.value)
  }

  return list
})

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

const actions = (row) => [
  [{ 
    label: 'Voir détails', 
    icon: 'i-heroicons-eye',
    click: () => router.push(`/deliveries/${row.id}`)
  }],
  [{ 
    label: 'Annuler', 
    icon: 'i-heroicons-trash', 
    color: 'red',
    disabled: row.status === 'CANCELLED' || row.status === 'DELIVERED',
    click: () => handleCancel(row)
  }]
]

async function handleCancel(row) {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette livraison ?')) return
  
  try {
    await cancelMutate({ id: row.id })
    toast.add({ title: 'Livraison annulée avec succès', color: 'green' })
    refresh()
  } catch (e) {
    console.error(e)
    toast.add({ title: 'Erreur lors de l\'annulation', description: e.message, color: 'red' })
  }
}
</script>

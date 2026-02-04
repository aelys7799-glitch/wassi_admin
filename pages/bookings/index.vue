<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Réservations</h3>
      <div class="flex space-x-2">
        <UButton icon="i-heroicons-arrow-down-tray" color="gray" variant="outline" @click="exportToCsv">Exporter CSV</UButton>
        <UButton icon="i-heroicons-arrow-path" color="orange" variant="ghost" @click="refresh" :loading="pending" />
      </div>
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
          :options="['Tous', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']" 
          class="w-48"
        />
      </div>
    </UCard>

    <UCard>
      <UTable :columns="columns" :rows="filteredBookings" :loading="pending">
        <template #client-data="{ row }">
          {{ row.client?.firstName }} {{ row.client?.lastName }}
        </template>
        <template #driver-data="{ row }">
          <div v-if="row.driver" class="flex items-center space-x-2">
            <UIcon name="i-heroicons-user" class="h-4 w-4 text-orange-500" />
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
const columns = [
  { key: 'createdAt', label: 'Date' },
  { key: 'client', label: 'Client' },
  { key: 'driver', label: 'Chauffeur' },
  { key: 'price', label: 'Prix (CFA)' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' }
]

const query = gql`
  query GetBookings {
    bookings {
      id
      price
      status
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

const search = ref('')
const selectedStatus = ref('Tous')

const filteredBookings = computed(() => {
  let list = data.value?.bookings ?? []
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(b => 
      b.id.toLowerCase().includes(s) || 
      b.client?.firstName.toLowerCase().includes(s) || 
      b.client?.lastName.toLowerCase().includes(s)
    )
  }
  if (selectedStatus.value !== 'Tous') {
    list = list.filter(b => b.status === selectedStatus.value)
  }
  return list
})

const statusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return 'green'
    case 'IN_PROGRESS': return 'blue'
    case 'PENDING': return 'orange'
    case 'CANCELLED': return 'red'
    default: return 'gray'
  }
}

const actions = (row) => [
  [{ label: 'Voir détails', icon: 'i-heroicons-eye' }],
  [{ label: 'Annuler', icon: 'i-heroicons-trash', color: 'red' }]
]

function exportToCsv() {
  const list = filteredBookings.value
  if (!list.length) return

  const headers = ['Date', 'Client', 'Chauffeur', 'Prix', 'Statut']
  const rows = list.map(b => [
    new Date(b.createdAt).toLocaleDateString(),
    `${b.client?.firstName} ${b.client?.lastName}`,
    b.driver ? `${b.driver.user.firstName} ${b.driver.user.lastName}` : 'N/A',
    b.price,
    b.status
  ])

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(r => r.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `wassi_reservations_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

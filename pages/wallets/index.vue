<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Portefeuilles</h3>
      <div class="flex space-x-2">
         <UButton icon="i-heroicons-arrow-down-tray" color="gray" variant="outline" @click="exportToCsv">Exporter Transactions</UButton>
         <UButton icon="i-heroicons-plus" color="green" @click="showAdjustModal = true">Nouvel Ajustement</UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Drivers Balances -->
      <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="font-bold">Balances Chauffeurs</h4>
            <UInput v-model="searchDriver" icon="i-heroicons-magnifying-glass" size="xs" placeholder="Filtrer..." />
          </div>
        </template>
        <div class="overflow-y-auto max-h-[600px]">
          <div v-if="pending" class="p-4 space-y-4">
             <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
          </div>
          <div v-else v-for="user in filteredDrivers" :key="user.id" class="flex items-center justify-between p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div class="flex items-center space-x-3">
              <UAvatar :alt="user.firstName" size="sm" />
              <div>
                <p class="text-sm font-bold">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-[10px] text-gray-500">{{ user.phoneNumber }}</p>
              </div>
            </div>
            <div class="text-right">
              <p :class="`font-bold ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`">
                {{ user.balance.toLocaleString() }} CFA
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Transaction History -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="font-bold">Historique des Transactions</h4>
            <div class="flex space-x-2">
               <USelectMenu v-model="selectedType" placeholder="Type" :options="['Tous', 'EARNING', 'WITHDRAWAL', 'PAYMENT']" size="xs" />
            </div>
          </div>
        </template>
        <UTable :columns="columns" :rows="filteredTransactions" :loading="pending">
          <template #user-data="{ row }">
             <span class="font-medium">{{ row.user.firstName }} {{ row.user.lastName }}</span>
          </template>
          <template #amount-data="{ row }">
             <span :class="`font-bold ${row.amount >= 0 ? 'text-green-600' : 'text-red-600'}`">
                {{ row.amount >= 0 ? '+' : '' }}{{ row.amount.toLocaleString() }}
             </span>
          </template>
          <template #type-data="{ row }">
             <UBadge :color="typeColor(row.type)" variant="soft" size="xs">{{ row.type }}</UBadge>
          </template>
          <template #createdAt-data="{ row }">
             {{ new Date(row.createdAt).toLocaleDateString() }}
          </template>
        </UTable>
      </UCard>
    </div>

    <!-- Adjust Balance Modal -->
    <UModal v-model="showAdjustModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="font-bold">Ajustement de Portefeuille</h4>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showAdjustModal = false" />
          </div>
        </template>
        <form @submit.prevent="handleAdjust" class="space-y-4">
          <UFormGroup label="Utilisateur">
            <USelectMenu 
              v-model="selectedUser" 
              :options="data?.users || []" 
              option-attribute="lastName"
              searchable
            >
              <template #label>
                <span v-if="selectedUser">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</span>
                <span v-else>Sélectionner un utilisateur</span>
              </template>
            </USelectMenu>
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Montant (CFA)">
              <UInput v-model.number="adjustAmount" type="number" />
            </UFormGroup>
            <UFormGroup label="Type">
              <USelect v-model="adjustType" :options="['EARNING', 'WITHDRAWAL', 'PAYMENT']" />
            </UFormGroup>
          </div>
          <UFormGroup label="Description">
            <UInput v-model="adjustDesc" placeholder="Ex: Prime hebdomadaire" />
          </UFormGroup>
          <UButton type="submit" block color="green" :loading="adjusting">Confirmer l'ajustement</UButton>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const ADJUST_MUTATION = gql`
  mutation AdjustBalance($userId: String!, $amount: Float!, $type: String!, $description: String!) {
    adjustWalletBalance(userId: $userId, amount: $amount, type: $type, description: $description) {
      id
    }
  }
`

const columns = [
  { key: 'createdAt', label: 'Date' },
  { key: 'user', label: 'Utilisateur' },
  { key: 'amount', label: 'Montant' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' }
]

const query = gql`
  query GetWalletData {
    users {
      id
      firstName
      lastName
      phoneNumber
      role
      balance
    }
    allWalletTransactions {
      id
      amount
      type
      description
      createdAt
      user {
        firstName
        lastName
      }
    }
  }
`

const { data, pending, refresh } = await useAsyncQuery(query)
const { mutate: adjustMutate } = useMutation(ADJUST_MUTATION)

const searchDriver = ref('')
const selectedType = ref('Tous')
const showAdjustModal = ref(false)
const adjusting = ref(false)

const selectedUser = ref(null)
const adjustAmount = ref(0)
const adjustType = ref('EARNING')
const adjustDesc = ref('')

const filteredDrivers = computed(() => {
  const list = data.value?.users?.filter(u => u.role === 'DRIVER') || []
  if (!searchDriver.value) return list
  const s = searchDriver.value.toLowerCase()
  return list.filter(u => 
    u.firstName.toLowerCase().includes(s) || 
    u.lastName.toLowerCase().includes(s)
  )
})

const filteredTransactions = computed(() => {
  let list = data.value?.allWalletTransactions || []
  if (selectedType.value !== 'Tous') {
    list = list.filter(t => t.type === selectedType.value)
  }
  return list
})

async function handleAdjust() {
  if (!selectedUser.value) return
  adjusting.value = true
  try {
    await adjustMutate({
      userId: selectedUser.value.id,
      amount: adjustAmount.value,
      type: adjustType.value,
      description: adjustDesc.value
    })
    await refresh()
    showAdjustModal.value = false
    // Reset form
    selectedUser.value = null
    adjustAmount.value = 0
    adjustDesc.value = ''
  } catch (e) {
    console.error('Adjustment error:', e)
  } finally {
    adjusting.value = false
  }
}

function typeColor(type) {
  switch (type) {
    case 'EARNING': return 'green'
    case 'WITHDRAWAL': return 'red'
    case 'PAYMENT': return 'blue'
    default: return 'gray'
  }
}

function exportToCsv() {
  const transactions = filteredTransactions.value
  if (!transactions.length) return

  const headers = ['Date', 'Utilisateur', 'Montant', 'Type', 'Description']
  const rows = transactions.map(t => [
    new Date(t.createdAt).toLocaleDateString(),
    `${t.user.firstName} ${t.user.lastName}`,
    t.amount,
    t.type,
    t.description || ''
  ])

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(r => r.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `wassi_transactions_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h3>
      <div class="flex space-x-2">
        <UButton icon="i-heroicons-user-plus" color="green">Ajouter un Client</UButton>
        <UButton icon="i-heroicons-arrow-path" color="gray" variant="ghost" @click="refresh" :loading="pending" />
      </div>
    </div>

    <UCard>
      <div class="flex items-center space-x-4">
        <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Rechercher par nom ou email..." class="flex-1" />
        <USelectMenu v-model="selectedRole" placeholder="Rôle" :options="roleOptions" class="w-48" />
      </div>
    </UCard>

    <UCard>
      <UTable :columns="columns" :rows="filteredUsers" :loading="pending">
        <template #name-data="{ row }">
          <div class="flex items-center space-x-3">
            <UAvatar :alt="`${row.firstName || ''} ${row.lastName || ''}`" size="sm" />
            <div>
              <p class="font-bold text-gray-900 dark:text-white">{{ row.firstName }} {{ row.lastName }}</p>
              <p class="text-xs text-gray-500">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #role-data="{ row }">
          <UBadge :color="roleColor(row.role)" variant="subtle">{{ row.role }}</UBadge>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="row.status ? 'green' : 'red'" variant="solid" size="xs">{{ row.status ? 'Actif' : 'Inactif' }}</UBadge>
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
  { key: 'name', label: 'Utilisateur' },
  { key: 'role', label: 'Rôle' },
  { key: 'phoneNumber', label: 'Téléphone' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' },
]

const roleOptions = ['Tous', 'ADMIN', 'CHAUFFEUR', 'CLIENT', 'LIVREUR', 'MODERATOR']
const query = gql`query GetUsers { users { id firstName lastName email role phoneNumber status } }`
const { data, pending, refresh } = await useAsyncQuery(query)
const search = ref('')
const selectedRole = ref('Tous')

const filteredUsers = computed(() => {
  let list = data.value?.users || []
  const searchTerm = search.value.trim().toLowerCase()
  if (searchTerm) {
    list = list.filter((user) => [user.firstName, user.lastName, user.email, user.phoneNumber]
      .filter(Boolean).some((value) => value.toLowerCase().includes(searchTerm)))
  }
  if (selectedRole.value !== 'Tous') list = list.filter((user) => user.role === selectedRole.value)
  return list
})

function roleColor(role) {
  if (role === 'ADMIN') return 'red'
  if (role === 'CHAUFFEUR' || role === 'LIVREUR') return 'green'
  if (role === 'MODERATOR') return 'orange'
  return 'blue'
}

const actions = () => [[
  { label: 'Modifier', icon: 'i-heroicons-pencil-square' },
  { label: 'Réinitialiser Mot de passe', icon: 'i-heroicons-key' },
], [
  { label: 'Désactiver', icon: 'i-heroicons-user-minus', color: 'orange' },
  { label: 'Supprimer', icon: 'i-heroicons-trash', color: 'red' },
]]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h3>
      <div class="flex space-x-2">
        <UButton icon="i-heroicons-user-plus" color="green" @click="openCreateModal">Ajouter un Client</UButton>
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

    <UModal v-model="showUserModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold">{{ modalMode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l’utilisateur' }}</h3>
            <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="showUserModal = false" />
          </div>
        </template>

        <form @submit.prevent="handleSubmitUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Prénom" required>
              <UInput v-model="form.firstName" />
            </UFormGroup>
            <UFormGroup label="Nom" required>
              <UInput v-model="form.lastName" />
            </UFormGroup>
          </div>

          <UFormGroup label="Email" required>
            <UInput v-model="form.email" type="email" />
          </UFormGroup>

          <UFormGroup label="Téléphone">
            <UInput v-model="form.phoneNumber" />
          </UFormGroup>

          <UFormGroup label="Rôle">
            <USelect v-model="form.role" :options="['CLIENT', 'LIVREUR', 'CHAUFFEUR', 'ADMIN', 'MODERATOR']" />
          </UFormGroup>

          <UFormGroup v-if="modalMode === 'create'" label="Mot de passe" required>
            <UInput v-model="form.password" type="password" />
          </UFormGroup>

          <UFormGroup v-if="modalMode === 'edit'" label="Statut">
            <UToggle v-model="form.status" />
          </UFormGroup>

          <UButton type="submit" block :loading="submitting">Enregistrer</UButton>
        </form>
      </UCard>
    </UModal>

    <UModal v-model="showPasswordModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold">Réinitialiser le mot de passe</h3>
            <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="showPasswordModal = false" />
          </div>
        </template>

        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <p class="text-sm text-gray-500">Définir un nouveau mot de passe pour <strong>{{ selectedUser?.firstName }}</strong>.</p>
          <UFormGroup label="Nouveau mot de passe" required>
            <UInput v-model="passwordForm.newPassword" type="password" />
          </UFormGroup>
          <UButton type="submit" block color="orange" :loading="submitting">Réinitialiser</UButton>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const toast = useToast();

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(createUserInput: $input) {
      id
      firstName
      lastName
      email
      role
      status
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    adminUpdateUser(input: $input) {
      id
      firstName
      lastName
      email
      role
      phoneNumber
      status
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    removeUser(id: $id) {
      id
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($id: String!, $password: String!) {
    adminResetPassword(id: $id, password: $password) {
      id
    }
  }
`;

const query = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
      role
      phoneNumber
      status
    }
  }
`;

const { data, pending, refresh } = await useAsyncQuery(query);
const { mutate: createMutate } = useMutation(CREATE_USER);
const { mutate: updateMutate } = useMutation(UPDATE_USER);
const { mutate: deleteMutate } = useMutation(DELETE_USER);
const { mutate: resetPassMutate } = useMutation(RESET_PASSWORD);

const search = ref('');
const selectedRole = ref('Tous');
const showUserModal = ref(false);
const showPasswordModal = ref(false);
const modalMode = ref('create');
const submitting = ref(false);
const selectedUser = ref(null);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: 'CLIENT',
  password: '',
  status: true,
});

const passwordForm = ref({ newPassword: '' });

const columns = [
  { key: 'name', label: 'Utilisateur' },
  { key: 'role', label: 'Rôle' },
  { key: 'phoneNumber', label: 'Téléphone' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' },
];

const roleOptions = ['Tous', 'ADMIN', 'CHAUFFEUR', 'CLIENT', 'LIVREUR', 'MODERATOR'];

const filteredUsers = computed(() => {
  let list = data.value?.users || [];
  const searchTerm = search.value.trim().toLowerCase();

  if (searchTerm) {
    list = list.filter((user) => [user.firstName, user.lastName, user.email, user.phoneNumber]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm)));
  }

  if (selectedRole.value !== 'Tous') {
    list = list.filter((user) => user.role === selectedRole.value);
  }

  return list;
});

function roleColor(role) {
  if (role === 'ADMIN') return 'red';
  if (role === 'CHAUFFEUR' || role === 'LIVREUR') return 'green';
  if (role === 'MODERATOR') return 'orange';
  return 'blue';
}

const actions = (row) => [
  [
    { label: 'Modifier', icon: 'i-heroicons-pencil-square', click: () => openEditModal(row) },
    { label: 'Réinitialiser Mot de passe', icon: 'i-heroicons-key', click: () => openPasswordModal(row) },
  ],
  [
    { label: row.status ? 'Désactiver' : 'Activer', icon: row.status ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle', color: row.status ? 'orange' : 'green', click: () => toggleStatus(row) },
    { label: 'Supprimer', icon: 'i-heroicons-trash', color: 'red', click: () => handleDelete(row) },
  ],
];

function openCreateModal() {
  modalMode.value = 'create';
  form.value = { firstName: '', lastName: '', email: '', phoneNumber: '', role: 'CLIENT', password: '', status: true };
  showUserModal.value = true;
}

function openEditModal(user) {
  modalMode.value = 'edit';
  selectedUser.value = user;
  form.value = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    role: user.role || 'CLIENT',
    password: '',
    status: !!user.status,
  };
  showUserModal.value = true;
}

function openPasswordModal(user) {
  selectedUser.value = user;
  passwordForm.value.newPassword = '';
  showPasswordModal.value = true;
}

async function handleSubmitUser() {
  submitting.value = true;
  try {
    if (modalMode.value === 'create') {
      await createMutate({
        input: {
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          email: form.value.email,
          phoneNumber: form.value.phoneNumber || null,
          role: form.value.role,
          password: form.value.password,
          status: true,
        },
      });
      toast.add({ title: 'Utilisateur créé', color: 'green' });
    } else {
      await updateMutate({
        input: {
          id: selectedUser.value.id,
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          email: form.value.email,
          phoneNumber: form.value.phoneNumber || null,
          role: form.value.role,
          status: form.value.status,
        },
      });
      toast.add({ title: 'Utilisateur mis à jour', color: 'green' });
    }

    showUserModal.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    toast.add({ title: 'Erreur', description: e?.message || 'Une erreur est survenue', color: 'red' });
  } finally {
    submitting.value = false;
  }
}

async function handleResetPassword() {
  if (!passwordForm.value.newPassword) return;
  submitting.value = true;
  try {
    await resetPassMutate({
      id: selectedUser.value.id,
      password: passwordForm.value.newPassword,
    });
    toast.add({ title: 'Mot de passe réinitialisé', color: 'green' });
    showPasswordModal.value = false;
  } catch (e) {
    toast.add({ title: 'Erreur', description: e?.message || 'Une erreur est survenue', color: 'red' });
  } finally {
    submitting.value = false;
  }
}

async function toggleStatus(user) {
  try {
    await updateMutate({
      input: {
        id: user.id,
        status: !user.status,
      },
    });
    toast.add({ title: `Utilisateur ${!user.status ? 'activé' : 'désactivé'}`, color: 'green' });
    await refresh();
  } catch (e) {
    toast.add({ title: 'Erreur', description: e?.message || 'Une erreur est survenue', color: 'red' });
  }
}

async function handleDelete(user) {
  if (!confirm(`Supprimer définitivement ${user.firstName} ${user.lastName} ?`)) return;
  try {
    await deleteMutate({ id: user.id });
    toast.add({ title: 'Utilisateur supprimé', color: 'green' });
    await refresh();
  } catch (e) {
    toast.add({ title: 'Erreur', description: e?.message || 'Une erreur est survenue', color: 'red' });
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Transactions & Paiements</h3>
      <UButton icon="i-heroicons-arrow-down-tray" color="blue" @click="exportToCsv">Exporter CSV (Excel)</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="bg-blue-50 dark:bg-blue-900/10">
        <p class="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase">Volume Total Réussi</p>
        <p class="text-3xl font-bold dark:text-white">{{ totalVolume.toLocaleString() }} CFA</p>
      </UCard>
      <UCard class="bg-green-50 dark:bg-green-900/10">
        <p class="text-sm text-green-600 dark:text-green-400 font-bold uppercase">Commissions Est. (20%)</p>
        <p class="text-3xl font-bold dark:text-white">{{ wassiCommission.toLocaleString() }} CFA</p>
      </UCard>
      <UCard class="bg-purple-50 dark:bg-purple-900/10">
        <p class="text-sm text-purple-600 dark:text-purple-400 font-bold uppercase">Transactions (24h)</p>
        <p class="text-3xl font-bold dark:text-white">{{ recentTransactionsCount }}</p>
      </UCard>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="payments" :loading="pending">
        <template #user-data="{ row }">
          {{ row.user.firstName }} {{ row.user.lastName }}
        </template>
        <template #amount-data="{ row }">
          <span class="font-bold text-gray-900 dark:text-white">{{ row.amount.toLocaleString() }} CFA</span>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="statusColor(row.status)" variant="soft">
            {{ row.status }}
          </UBadge>
        </template>
        <template #createdAt-data="{ row }">
          {{ new Date(row.createdAt).toLocaleDateString() }}
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup>
const columns = [
  { key: 'createdAt', label: 'Date' },
  { key: 'user', label: 'Utilisateur' },
  { key: 'amount', label: 'Montant' },
  { key: 'provider', label: 'Méthode' },
  { key: 'status', label: 'Statut' },
];

const query = gql`
  query GetPayments {
    payments {
      id
      amount
      provider
      status
      createdAt
      user {
        firstName
        lastName
      }
    }
  }
`;

const { data, pending, refresh } = await useAsyncQuery(query);
const payments = computed(() => data.value?.payments || []);

const totalVolume = computed(() =>
  payments.value
    .filter((p) => p.status === 'SUCCESSFUL')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0)
);

const wassiCommission = computed(() => totalVolume.value * 0.2);

const recentTransactionsCount = computed(() => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return payments.value.filter((p) => new Date(p.createdAt) > yesterday).length;
});

function statusColor(status) {
  switch (status) {
    case 'SUCCESSFUL': return 'green';
    case 'PENDING': return 'orange';
    case 'FAILED': return 'red';
    default: return 'gray';
  }
}

function exportToCsv() {
  const rows = payments.value;
  if (!rows.length) return;

  const headers = ['Date', 'Utilisateur', 'Montant', 'Provider', 'Statut'];
  const values = rows.map((p) => [
    new Date(p.createdAt).toLocaleDateString(),
    `${p.user.firstName} ${p.user.lastName}`,
    p.amount,
    p.provider,
    p.status,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,'
    + headers.join(',') + '\n'
    + values.map((r) => r.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `wassi_paiements_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

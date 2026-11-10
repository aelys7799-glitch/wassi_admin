<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Transactions & Paiements</h3>
      <div class="flex gap-2">
        <UButton icon="i-heroicons-arrow-path" color="gray" variant="ghost" @click="refresh" :loading="pending" />
        <UButton icon="i-heroicons-arrow-down-tray" color="blue" @click="exportToCsv">Exporter CSV</UButton>
      </div>
    </div>

    <UAlert v-if="error" color="red" variant="soft" title="Impossible de charger les paiements" :description="error.message" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="bg-blue-50 dark:bg-blue-900/10"><p class="text-sm text-blue-600 font-bold uppercase">Volume réussi</p><p class="text-3xl font-bold">{{ totalVolume.toLocaleString() }} CFA</p></UCard>
      <UCard class="bg-green-50 dark:bg-green-900/10"><p class="text-sm text-green-600 font-bold uppercase">Commission estimée (20 %)</p><p class="text-3xl font-bold">{{ wassiCommission.toLocaleString() }} CFA</p></UCard>
      <UCard class="bg-purple-50 dark:bg-purple-900/10"><p class="text-sm text-purple-600 font-bold uppercase">Transactions (24 h)</p><p class="text-3xl font-bold">{{ recentTransactionsCount }}</p></UCard>
    </div>

    <UCard>
      <div class="flex flex-wrap gap-3 mb-4">
        <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Référence, utilisateur ou provider" class="flex-1 min-w-56" />
        <USelect v-model="selectedStatus" :options="statusOptions" class="w-48" />
        <USelect v-model="selectedProvider" :options="providerOptions" class="w-48" />
      </div>
      <UTable :columns="columns" :rows="filteredPayments" :loading="pending">
        <template #user-data="{ row }">{{ row.user?.firstName }} {{ row.user?.lastName }}</template>
        <template #amount-data="{ row }"><span class="font-bold">{{ Number(row.amount || 0).toLocaleString() }} CFA</span></template>
        <template #status-data="{ row }"><UBadge :color="statusColor(row.status)" variant="soft">{{ statusLabel(row.status) }}</UBadge></template>
        <template #provider-data="{ row }">{{ providerLabel(row.provider) }}</template>
        <template #createdAt-data="{ row }">{{ formatDate(row.createdAt) }}</template>
        <template #transactionReference-data="{ row }"><span class="font-mono text-xs">{{ row.transactionReference || '—' }}</span></template>
      </UTable>
      <p v-if="!pending && filteredPayments.length === 0" class="py-8 text-center text-gray-500">Aucun paiement trouvé.</p>
    </UCard>
  </div>
</template>

<script setup>
const columns = [
  { key: 'createdAt', label: 'Date' },
  { key: 'user', label: 'Utilisateur' },
  { key: 'transactionReference', label: 'Référence' },
  { key: 'amount', label: 'Montant' },
  { key: 'provider', label: 'Méthode' },
  { key: 'status', label: 'Statut' },
];
const query = gql`
  query GetPayments {
    payments {
      id amount provider status transactionReference createdAt
      user { firstName lastName }
    }
  }
`;
const { data, pending, error, refresh } = await useAsyncQuery(query);
const payments = computed(() => data.value?.payments || []);
const search = ref('');
const selectedStatus = ref('Tous');
const selectedProvider = ref('Tous');
const statusOptions = ['Tous', 'PENDING', 'SUCCESSFUL', 'FAILED'];
const providerOptions = ['Tous', 'CASH_ON_DELIVERY', 'PAWAPAY', 'ORANGE_MONEY', 'MOOV_MONEY', 'STRIPE'];

const filteredPayments = computed(() => {
  const term = search.value.trim().toLowerCase();
  return payments.value.filter((payment) => {
    const matchesTerm = !term || [payment.transactionReference, payment.provider, payment.user?.firstName, payment.user?.lastName]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = selectedStatus.value === 'Tous' || payment.status === selectedStatus.value;
    const matchesProvider = selectedProvider.value === 'Tous' || payment.provider === selectedProvider.value;
    return matchesTerm && matchesStatus && matchesProvider;
  });
});

const totalVolume = computed(() => payments.value
  .filter((payment) => payment.status === 'SUCCESSFUL')
  .reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
const wassiCommission = computed(() => totalVolume.value * 0.2);
const recentTransactionsCount = computed(() => {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  return payments.value.filter((payment) => new Date(payment.createdAt).getTime() >= since).length;
});

function statusColor(status) {
  if (status === 'SUCCESSFUL') return 'green';
  if (status === 'PENDING') return 'orange';
  if (status === 'FAILED') return 'red';
  return 'gray';
}
function statusLabel(status) {
  return ({ SUCCESSFUL: 'Réussi', PENDING: 'En attente', FAILED: 'Échoué' })[status] || status;
}
function providerLabel(provider) {
  return ({ CASH_ON_DELIVERY: 'Paiement à la livraison', PAWAPAY: 'PawaPay', ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money', STRIPE: 'Stripe' })[provider] || provider;
}
function formatDate(value) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—';
}
function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}
function exportToCsv() {
  if (!filteredPayments.value.length) return;
  const rows = [
    ['Date', 'Utilisateur', 'Référence', 'Montant', 'Provider', 'Statut'],
    ...filteredPayments.value.map((payment) => [
      formatDate(payment.createdAt),
      `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim(),
      payment.transactionReference,
      payment.amount,
      providerLabel(payment.provider),
      statusLabel(payment.status),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `wassi_paiements_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

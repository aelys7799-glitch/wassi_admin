<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Paramètres du Système</h3>
      <UButton color="orange" @click="saveSettings" :loading="saving">Enregistrer les modifications</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sidebar Settings -->
      <aside class="space-y-2">
        <UButton 
          v-for="tab in tabs" 
          :key="tab.id"
          block
          variant="ghost"
          :color="activeTab === tab.id ? 'orange' : 'gray'"
          class="justify-start px-4 py-3 text-left rounded-xl"
          @click="activeTab = tab.id"
        >
          <UIcon :name="tab.icon" class="mr-3 h-5 w-5" />
          {{ tab.label }}
        </UButton>
      </aside>

      <!-- Content -->
      <div class="md:col-span-2 space-y-6">
        <UCard v-if="activeTab === 'general'">
          <template #header>
            <h4 class="font-bold">Paramètres Généraux</h4>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Nom de la plateforme">
              <UInput v-model="settings.appName" />
            </UFormGroup>
            <UFormGroup label="Email de contact">
              <UInput v-model="settings.contactEmail" />
            </UFormGroup>
            <UFormGroup label="Devise">
              <USelect v-model="settings.currency" :options="['CFA', 'USD', 'EUR']" />
            </UFormGroup>
          </div>
        </UCard>

        <UCard v-if="activeTab === 'pricing'">
          <template #header>
            <h4 class="font-bold">Configuration de la Tarification</h4>
          </template>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Prix de base (Transport)">
                <UInput v-model.number="settings.pricing.rideBase" type="number" trailing-icon="i-heroicons-currency-dollar" />
              </UFormGroup>
              <UFormGroup label="Prix par KM (Transport)">
                <UInput v-model.number="settings.pricing.ridePerKm" type="number" />
              </UFormGroup>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Prix de base (Livraison)">
                <UInput v-model.number="settings.pricing.deliveryBase" type="number" />
              </UFormGroup>
              <UFormGroup label="Prix par KM (Livraison)">
                <UInput v-model.number="settings.pricing.deliveryPerKm" type="number" />
              </UFormGroup>
            </div>
            <UFormGroup label="Commission Wassi (%)">
              <UInput v-model.number="settings.pricing.commission" type="number" />
            </UFormGroup>
          </div>
        </UCard>

        <UCard v-if="activeTab === 'notifications'">
          <template #header>
            <h4 class="font-bold">Notifications & Alertes</h4>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Activer les Notifications Push">
              <UToggle v-model="settings.notifications.pushEnabled" />
            </UFormGroup>
            <UFormGroup label="Notifications Email Administrateur">
              <UToggle v-model="settings.notifications.emailAdminEnabled" />
            </UFormGroup>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { id: 'general', label: 'Général', icon: 'i-heroicons-globe-alt' },
  { id: 'pricing', label: 'Tarification', icon: 'i-heroicons-banknotes' },
  { id: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell' },
  { id: 'security', label: 'Sécurité', icon: 'i-heroicons-shield-check' }
]

const activeTab = ref('general')
const saving = ref(false)

const settings = ref({
  appName: 'Wassi',
  contactEmail: 'admin@wassi.com',
  currency: 'CFA',
  pricing: {
    rideBase: 200,
    ridePerKm: 100,
    deliveryBase: 500,
    deliveryPerKm: 150,
    commission: 20
  },
  notifications: {
    pushEnabled: true,
    emailAdminEnabled: false
  }
})

async function saveSettings() {
  saving.value = true
  // Mock save API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  useToast().add({ title: 'Paramètres enregistrés avec succès !', color: 'green' })
}
</script>

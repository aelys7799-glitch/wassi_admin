<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-orange-600">Wassi Admin</h1>
        <p class="text-gray-500">Connexion à votre espace</p>
      </div>
    </template>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <UFormGroup label="Email" name="email">
        <UInput v-model="email" type="email" icon="i-heroicons-envelope" placeholder="admin@wassi.com" />
      </UFormGroup>

      <UFormGroup label="Mot de passe" name="password">
        <UInput v-model="password" type="password" icon="i-heroicons-lock-closed" placeholder="********" />
      </UFormGroup>

      <UButton type="submit" block :loading="loading" color="orange" size="lg">
        Se connecter
      </UButton>

      <UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="red" variant="soft" :title="error" />
    </form>
  </UCard>
</template>

<script setup>
definePageMeta({ layout: 'auth' });

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const { onLogin } = useApollo();
const router = useRouter();
const authToken = useCookie('apollo:default.token', {
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const { mutate: loginMutate } = useMutation(LOGIN_MUTATION);

async function handleLogin() {
  if (!email.value || !password.value) return;

  loading.value = true;
  error.value = '';

  try {
    const result = await loginMutate({
      email: email.value.trim(),
      password: password.value,
    });

    const token = result?.data?.login;
    if (!token) {
      error.value = 'Identifiants invalides';
      return;
    }

    authToken.value = token;
    await onLogin(token);
    await router.push('/');
  } catch (e) {
    error.value = 'Erreur de connexion : ' + (e?.message || 'inconnue');
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

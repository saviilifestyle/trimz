<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Staff Login</h2>
      <p class="subtitle">Trimz Haircut Admin</p>

      <form @submit.prevent="handleLogin">
        <label>
          Email
          <input v-model="email" type="email" required autocomplete="username" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = 'http://127.0.0.1:8000/api'
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Login failed.'
      loading.value = false
      return
    }

    // Store the token so future admin requests can include it
    localStorage.setItem('adminToken', data.token)
    localStorage.setItem('adminName', data.name)
    localStorage.setItem('adminRole', data.role)

    router.push('/admin')
  } catch (e) {
    console.error(e)
    error.value = 'Network error — please try again.'
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-navy-dark);
  font-family: var(--font-body);
}
.login-card {
  background: white;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 24px rgba(10, 25, 47, 0.2);
}
.login-card h2 {
  font-family: var(--font-heading);
  color: var(--color-navy-dark);
  font-size: 24px;
}
.subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 24px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy-dark);
  gap: 6px;
}
input {
  font-family: var(--font-body);
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
}
input:focus {
  outline: none;
  border-color: var(--color-gold);
}
.error-msg {
  color: #dc2626;
  font-size: 13px;
}
.btn-primary {
  background: var(--color-gold);
  color: var(--color-navy-dark);
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

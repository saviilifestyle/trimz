<template>
  <div class="dashboard-page">
    <header class="dash-header">
      <div>
        <h1>Booking Ledger</h1>
        <p class="subtitle">Signed in as {{ adminName }}</p>
      </div>
      <div class="header-actions">
        <router-link v-if="isAdmin" to="/admin/manage" class="btn-ghost">Manage</router-link>
        <button class="btn-ghost" @click="handleLogout">Log out</button>
      </div>
    </header>

    <div class="toolbar">
      <label>
        Date
        <input type="date" v-model="filters.date" @change="loadBookings" />
      </label>
      <label>
        Barber
        <select v-model="filters.barberId" @change="loadBookings">
          <option value="">All</option>
          <option v-for="b in barbers" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </label>
      <label>
        Status
        <select v-model="filters.status" @change="loadBookings">
          <option value="">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <button class="btn-ghost" @click="clearFilters">Clear</button>
      <button class="btn-primary" @click="loadBookings">Refresh</button>
    </div>

    <p v-if="loadError" class="error-msg">{{ loadError }}</p>
    <div v-if="loading" class="loading-note">Loading bookings…</div>

    <template v-else>
      <div v-if="bookings.length === 0" class="empty-note">No bookings match these filters.</div>

      <template v-else>
        <div class="summary-bar">
          <div><strong>{{ bookings.length }}</strong> shown</div>
          <div><strong>{{ countByStatus.confirmed }}</strong> confirmed</div>
          <div><strong>{{ countByStatus.completed }}</strong> completed</div>
          <div><strong>{{ countByStatus.cancelled }}</strong> cancelled</div>
        </div>

        <table class="ledger">
          <thead>
            <tr>
              <th>Date</th><th>Time</th><th>Customer</th><th>Barber</th>
              <th>Service</th><th>Price</th><th>Status</th><th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in bookings" :key="b.id">
              <td data-label="Date">{{ formatDate(b.booking_date) }}</td>
              <td data-label="Time">{{ to12h(b.start_time) }}–{{ to12h(b.end_time) }}</td>
              <td data-label="Customer">
                <div>{{ b.customer_name }}</div>
                <div class="sub-text">{{ b.customer_phone }}</div>
              </td>
              <td data-label="Barber">{{ b.barber_name }}</td>
              <td data-label="Service">
                {{ b.service_name }}
                <div v-if="b.notes" class="sub-text">{{ b.notes }}</div>
              </td>
              <td data-label="Price">KSh {{ Number(b.total_price).toLocaleString() }}</td>
              <td data-label="Status"><span class="badge" :class="b.status">{{ b.status }}</span></td>
              <td v-if="isAdmin" data-label="Actions">
                <div class="row-actions">
                  <button v-if="b.status !== 'completed'" @click="updateStatus(b.id, 'completed')">Complete</button>
                  <button v-if="b.status !== 'cancelled'" @click="updateStatus(b.id, 'cancelled')">Cancel</button>
                  <button class="danger" @click="deleteBooking(b.id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = 'http://127.0.0.1:8000/api'
const router = useRouter()

const adminName = ref(localStorage.getItem('adminName') || 'Admin')
const bookings = ref([])
const barbers = ref([])
const loading = ref(true)
const loadError = ref('')
const filters = ref({ date: '', barberId: '', status: '' })
const isAdmin = computed(() => localStorage.getItem('adminRole') === 'admin')

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
}

async function loadBarbers() {
  try {
    const res = await fetch(`${API_BASE}/barbers`)
    barbers.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

async function loadBookings() {
  loading.value = true
  loadError.value = ''
  try {
    const params = new URLSearchParams()
    if (filters.value.date) params.set('date', filters.value.date)
    if (filters.value.barberId) params.set('barberId', filters.value.barberId)
    if (filters.value.status) params.set('status', filters.value.status)

    const res = await fetch(`${API_BASE}/bookings?${params}`, { headers: authHeaders() })

    if (res.status === 401) {
      handleLogout() // token expired or invalid - send back to login
      return
    }

    bookings.value = await res.json()
  } catch (e) {
    console.error(e)
    loadError.value = 'Could not load bookings.'
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { date: '', barberId: '', status: '' }
  loadBookings()
}

const countByStatus = computed(() => {
  const counts = { confirmed: 0, completed: 0, cancelled: 0 }
  for (const b of bookings.value) counts[b.status] = (counts[b.status] || 0) + 1
  return counts
})

async function updateStatus(id, status) {
  try {
    await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    })
    loadBookings()
  } catch (e) {
    console.error(e)
  }
}

async function deleteBooking(id) {
  if (!confirm('Permanently delete this booking? This cannot be undone.')) return
  try {
    await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE', headers: authHeaders() })
    loadBookings()
  } catch (e) {
    console.error(e)
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: 'POST', headers: authHeaders() })
  } catch (e) {
    console.error(e)
  }
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminName')
  router.push('/admin/login')
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', weekday: 'short',
  })
}

function to12h(hhmm) {
  let [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

onMounted(() => {
  loadBarbers()
  loadBookings()
})
</script>

<style scoped>
.dashboard-page {
  font-family: var(--font-body);
  background: var(--color-cream-bg);
  min-height: 100vh;
  padding: 32px;
}
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.dash-header h1 {
  font-family: var(--font-heading);
  color: var(--color-navy-dark);
  font-size: 28px;
}
.subtitle { color: #6b7280; font-size: 13px; margin-top: 4px; }
.header-actions { display: flex; gap: 10px; }

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px dashed #d8d3c8;
}
.toolbar label {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  gap: 5px;
}
.toolbar input, .toolbar select {
  padding: 9px 10px;
  border: 1.5px solid #d8d3c8;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13.5px;
  background: white;
}

.btn-primary, .btn-ghost {
  padding: 10px 18px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}
.btn-primary { background: var(--color-gold); color: var(--color-navy-dark); }
.btn-ghost { background: transparent; border: 1.5px solid var(--color-navy-dark); color: var(--color-navy-dark); }

.error-msg { color: #dc2626; margin-bottom: 12px; }
.loading-note, .empty-note { padding: 30px; text-align: center; color: #6b7280; }

.summary-bar { display: flex; gap: 20px; margin-bottom: 16px; font-size: 13px; flex-wrap: wrap; }
.summary-bar strong { font-family: var(--font-heading); font-size: 16px; }

table.ledger { width: 100%; border-collapse: collapse; font-size: 13.5px; background: white; }
table.ledger th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: #6b7280; padding: 10px; border-bottom: 2px solid #d8d3c8;
}
table.ledger td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
.sub-text { font-size: 11.5px; color: #6b7280; }

.badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; text-transform: capitalize; }
.badge.confirmed { background: rgba(10, 25, 47, 0.1); color: var(--color-navy-dark); }
.badge.completed { background: rgba(212, 175, 55, 0.18); color: var(--color-gold-dark); }
.badge.cancelled { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

.row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.row-actions button {
  font-size: 11.5px; padding: 5px 9px; border-radius: 4px;
  border: 1.5px solid #d8d3c8; background: white; cursor: pointer;
}
.row-actions button.danger:hover { border-color: #dc2626; color: #dc2626; }

@media (max-width: 720px) {
  table.ledger thead { display: none; }
  table.ledger, table.ledger tbody, table.ledger tr, table.ledger td { display: block; width: 100%; }
  table.ledger tr { border-bottom: 2px solid #d8d3c8; padding: 10px 0; }
  table.ledger td { border: none; padding: 4px 0; }
  table.ledger td::before {
    content: attr(data-label); display: inline-block; width: 100px;
    font-size: 10.5px; text-transform: uppercase; color: #6b7280;
  }
}
</style>

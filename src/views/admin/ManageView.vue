<template>
  <div class="manage-page">
    <header class="dash-header">
      <div>
        <h1>Manage Barbers & Services</h1>
        <p class="subtitle">Signed in as {{ adminName }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin" class="btn-ghost">Back to Dashboard</router-link>
        <button class="btn-ghost" @click="handleLogout">Log out</button>
      </div>
    </header>

    <div class="tabs">
      <button :class="{ active: tab === 'services' }" @click="tab = 'services'">Services</button>
      <button :class="{ active: tab === 'barbers' }" @click="tab = 'barbers'">Barbers</button>
      <button :class="{ active: tab === 'gallery' }" @click="tab = 'gallery'">Gallery</button>
    </div>

    <!-- ============ SERVICES TAB ============ -->
    <section v-if="tab === 'services'">
      <button class="btn-primary add-btn" @click="openNewService">+ Add Service</button>

      <div v-if="loadingServices" class="loading-note">Loading…</div>
      <table v-else class="ledger">
        <thead>
          <tr><th>Name</th><th>Category</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in services" :key="s.id" :class="{ inactive: !s.active }">
            <td data-label="Name">{{ s.name }}</td>
            <td data-label="Category">{{ s.category }}</td>
            <td data-label="Duration">{{ s.duration_minutes }} min</td>
            <td data-label="Price">KSh {{ Number(s.price).toLocaleString() }}</td>
            <td data-label="Status">
              <span class="badge" :class="s.active ? 'active' : 'inactive'">
                {{ s.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td data-label="Actions">
              <div class="row-actions">
                <button @click="openEditService(s)">Edit</button>
                <button v-if="s.active" class="danger" @click="deactivateService(s.id)">Deactivate</button>
                <button v-else @click="reactivateService(s)">Reactivate</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ============ BARBERS TAB ============ -->
    <section v-if="tab === 'barbers'">
      <button class="btn-primary add-btn" @click="openNewBarber">+ Add Barber</button>

      <div v-if="loadingBarbers" class="loading-note">Loading…</div>
      <table v-else class="ledger">
        <thead>
          <tr><th>Name</th><th>Working Days</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="b in barbers" :key="b.id" :class="{ inactive: !b.active }">
            <td data-label="Name">{{ b.name }}</td>
            <td data-label="Working Days">{{ formatDays(b.schedule) }}</td>
            <td data-label="Status">
              <span class="badge" :class="b.active ? 'active' : 'inactive'">
                {{ b.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td data-label="Actions">
              <div class="row-actions">
                <button @click="openEditBarber(b)">Edit</button>
                <button v-if="b.active" class="danger" @click="deactivateBarber(b.id)">Deactivate</button>
                <button v-else @click="reactivateBarber(b)">Reactivate</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ============ GALLERY TAB ============ -->
    <section v-if="tab === 'gallery'">
      <div class="gallery-upload">
        <label class="file-label">
          Photo
          <input
            ref="galleryFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="onGalleryFile"
          />
        </label>
        <label class="file-label">
          Caption (optional)
          <input v-model="galleryCaption" type="text" maxlength="120" />
        </label>
        <button
          class="btn-primary"
          :disabled="!galleryFileObj || uploadingGallery"
          @click="uploadGalleryPhoto"
        >
          {{ uploadingGallery ? 'Uploading…' : 'Upload' }}
        </button>
      </div>
      <p v-if="galleryError" class="error-msg">{{ galleryError }}</p>

      <div v-if="loadingGallery" class="loading-note">Loading…</div>
      <p v-else-if="!galleryPhotos.length" class="loading-note">
        No photos yet. Upload the first one above.
      </p>
      <ul v-else class="gallery-admin-grid">
        <li v-for="p in galleryPhotos" :key="p.id">
          <img :src="p.photo_url" :alt="p.caption || 'Gallery photo'" />
          <div class="gallery-admin-meta">
            <input
              v-model="p.caption"
              type="text"
              maxlength="120"
              placeholder="Caption"
              @change="saveCaption(p)"
            />
            <button @click="deleteGalleryPhoto(p.id)">Delete</button>
          </div>
        </li>
      </ul>
    </section>

    <!-- ============ SERVICE MODAL ============ -->
    <div v-if="serviceModal.open" class="modal-backdrop" @click.self="serviceModal.open = false">
      <div class="modal">
        <h3>{{ serviceModal.id ? 'Edit Service' : 'New Service' }}</h3>
        <label>Name <input v-model="serviceModal.name" type="text" /></label>
        <label>Category <input v-model="serviceModal.category" type="text" placeholder="Hair, Beard, Skin & Spa, Nails" /></label>
        <label>Duration (minutes) <input v-model.number="serviceModal.duration_minutes" type="number" min="1" /></label>
        <label>Price (KSh) <input v-model.number="serviceModal.price" type="number" min="0" /></label>
        <p v-if="serviceModal.error" class="error-msg">{{ serviceModal.error }}</p>
        <div class="modal-actions">
          <button class="btn-ghost" @click="serviceModal.open = false">Cancel</button>
          <button class="btn-primary" @click="saveService">Save</button>
        </div>
      </div>
    </div>

    <!-- ============ BARBER MODAL ============ -->
    <div v-if="barberModal.open" class="modal-backdrop" @click.self="barberModal.open = false">
      <div class="modal">
        <h3>{{ barberModal.id ? 'Edit Barber' : 'New Barber' }}</h3>
        <label>Name <input v-model="barberModal.name" type="text" /></label>

        <label>
          Photo
          <input type="file" accept="image/*" @change="handlePhotoUpload" />
        </label>
        <img v-if="barberModal.photo_url" :src="barberModal.photo_url" class="photo-preview" alt="Barber photo preview" />
        <p v-if="uploadingPhoto" class="loading-note">Uploading…</p>

        <p class="field-label">Working Days & Hours</p>
        <div v-for="day in dayNames" :key="day.value" class="day-row">
          <label class="day-check">
            <input type="checkbox" v-model="barberModal.activeDays" :value="day.value" />
            {{ day.label }}
          </label>
          <template v-if="barberModal.activeDays.includes(day.value)">
            <input type="time" v-model="barberModal.hours[day.value].start" />
            <span>to</span>
            <input type="time" v-model="barberModal.hours[day.value].end" />
          </template>
        </div>

        <p v-if="barberModal.error" class="error-msg">{{ barberModal.error }}</p>
        <div class="modal-actions">
          <button class="btn-ghost" @click="barberModal.open = false">Cancel</button>
          <button class="btn-primary" :disabled="uploadingPhoto" @click="saveBarber">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = 'http://127.0.0.1:8000/api'
const router = useRouter()
const adminName = ref(localStorage.getItem('adminName') || 'Admin')

const tab = ref('services')

const dayNames = [
  { value: 0, label: 'Sun' }, { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' }, { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
}

/* ---------------- Services ---------------- */

const services = ref([])
const loadingServices = ref(true)

async function loadServices() {
  loadingServices.value = true
  const res = await fetch(`${API_BASE}/manage/services`, { headers: authHeaders() })
  if (res.status === 401) return handleLogout()
  services.value = await res.json()
  loadingServices.value = false
}

const serviceModal = reactive({
  open: false, id: null, name: '', category: '', duration_minutes: 30, price: 0, error: '',
})

function openNewService() {
  Object.assign(serviceModal, { open: true, id: null, name: '', category: '', duration_minutes: 30, price: 0, error: '' })
}
function openEditService(s) {
  Object.assign(serviceModal, { open: true, id: s.id, name: s.name, category: s.category, duration_minutes: s.duration_minutes, price: s.price, error: '' })
}

async function saveService() {
  serviceModal.error = ''
  const body = {
    name: serviceModal.name,
    category: serviceModal.category,
    duration_minutes: serviceModal.duration_minutes,
    price: serviceModal.price,
  }
  const url = serviceModal.id ? `${API_BASE}/services/${serviceModal.id}` : `${API_BASE}/services`
  const method = serviceModal.id ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json()
      serviceModal.error = data.error || Object.values(data.errors || {}).flat().join(' ') || 'Could not save.'
      return
    }
    serviceModal.open = false
    loadServices()
  } catch (e) {
    console.error(e)
    serviceModal.error = 'Network error.'
  }
}

async function deactivateService(id) {
  if (!confirm('Deactivate this service? It will no longer be bookable, but past bookings are unaffected.')) return
  await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers: authHeaders() })
  loadServices()
}

async function reactivateService(s) {
  await fetch(`${API_BASE}/services/${s.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      name: s.name,
      category: s.category,
      duration_minutes: s.duration_minutes,
      price: s.price,
      active: true,
    }),
  })
  loadServices()
}

/* ---------------- Barbers ---------------- */

const barbers = ref([])
const loadingBarbers = ref(true)
const uploadingPhoto = ref(false)

async function loadBarbers() {
  loadingBarbers.value = true
  const res = await fetch(`${API_BASE}/manage/barbers`, { headers: authHeaders() })
  if (res.status === 401) return handleLogout()
  barbers.value = await res.json()
  loadingBarbers.value = false
}

function formatDays(schedule) {
  if (!schedule.length) return '—'
  return schedule.map((s) => dayNames.find((d) => d.value === s.day_of_week)?.label).join(', ')
}

function blankHours() {
  const h = {}
  for (const d of dayNames) h[d.value] = { start: '09:00', end: '18:00' }
  return h
}

const barberModal = reactive({
  open: false, id: null, name: '', photo_url: '', activeDays: [], hours: blankHours(), error: '',
})

function openNewBarber() {
  Object.assign(barberModal, {
    open: true, id: null, name: '', photo_url: '',
    activeDays: [], hours: blankHours(), error: '',
  })
}

function openEditBarber(b) {
  const hours = blankHours()
  const activeDays = []
  for (const s of b.schedule) {
    activeDays.push(s.day_of_week)
    hours[s.day_of_week] = { start: s.start_time, end: s.end_time }
  }
  Object.assign(barberModal, {
    open: true, id: b.id, name: b.name, photo_url: b.photo_url, activeDays, hours, error: '',
  })
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadingPhoto.value = true
  barberModal.error = ''
  const formData = new FormData()
  formData.append('photo', file)

  try {
    const res = await fetch(`${API_BASE}/barbers/upload-photo`, {
      method: 'POST',
      headers: authHeaders(), // no Content-Type here - the browser sets the correct multipart boundary itself
      body: formData,
    })
    const data = await res.json()
    if (res.ok) {
      barberModal.photo_url = data.photo_url
    } else {
      barberModal.error = data.error || 'Upload failed.'
    }
  } catch (err) {
    console.error(err)
    barberModal.error = 'Upload failed.'
  } finally {
    uploadingPhoto.value = false
  }
}

async function saveBarber() {
  barberModal.error = ''
  if (barberModal.activeDays.length === 0) {
    barberModal.error = 'Select at least one working day.'
    return
  }

  const schedule = barberModal.activeDays.map((day) => ({
    day_of_week: day,
    start_time: barberModal.hours[day].start,
    end_time: barberModal.hours[day].end,
  }))

  const body = { name: barberModal.name, photo_url: barberModal.photo_url, schedule }
  const url = barberModal.id ? `${API_BASE}/barbers/${barberModal.id}` : `${API_BASE}/barbers`
  const method = barberModal.id ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json()
      barberModal.error = data.error || Object.values(data.errors || {}).flat().join(' ') || 'Could not save.'
      return
    }
    barberModal.open = false
    loadBarbers()
  } catch (e) {
    console.error(e)
    barberModal.error = 'Network error.'
  }
}

async function deactivateBarber(id) {
  if (!confirm('Deactivate this barber? They will no longer be bookable, but past bookings are unaffected.')) return
  await fetch(`${API_BASE}/barbers/${id}`, { method: 'DELETE', headers: authHeaders() })
  loadBarbers()
}

async function reactivateBarber(b) {
  await fetch(`${API_BASE}/barbers/${b.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      name: b.name,
      photo_url: b.photo_url,
      schedule: b.schedule.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      })),
      active: true,
    }),
  })
  loadBarbers()
}

/* ---------------- Gallery ---------------- */

const galleryPhotos = ref([])
const loadingGallery = ref(true)
const galleryFile = ref(null) // the <input type="file"> element
const galleryFileObj = ref(null) // the chosen File
const galleryCaption = ref('')
const uploadingGallery = ref(false)
const galleryError = ref('')

async function loadGallery() {
  loadingGallery.value = true
  try {
    const res = await fetch(`${API_BASE}/gallery`)
    if (!res.ok) throw new Error('Gallery request failed')
    galleryPhotos.value = await res.json()
  } catch (e) {
    console.error(e)
    galleryError.value = 'Could not load the gallery.'
  } finally {
    loadingGallery.value = false
  }
}

function onGalleryFile(e) {
  galleryFileObj.value = e.target.files[0] || null
}

async function uploadGalleryPhoto() {
  if (!galleryFileObj.value) return
  galleryError.value = ''
  uploadingGallery.value = true

  const formData = new FormData()
  formData.append('photo', galleryFileObj.value)
  if (galleryCaption.value.trim()) formData.append('caption', galleryCaption.value.trim())

  try {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: authHeaders(), // no Content-Type here - the browser sets the multipart boundary itself
      body: formData,
    })
    if (res.status === 401) return handleLogout()
    const data = await res.json()
    if (!res.ok) {
      galleryError.value =
        Object.values(data.errors || {}).flat().join(' ') ||
        data.error ||
        data.message ||
        'Upload failed.'
      return
    }
    galleryCaption.value = ''
    galleryFileObj.value = null
    if (galleryFile.value) galleryFile.value.value = ''
    loadGallery()
  } catch (e) {
    console.error(e)
    galleryError.value = 'Upload failed.'
  } finally {
    uploadingGallery.value = false
  }
}

async function saveCaption(p) {
  try {
    const res = await fetch(`${API_BASE}/gallery/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ caption: p.caption }),
    })
    if (res.status === 401) handleLogout()
  } catch (e) {
    console.error(e)
  }
}

async function deleteGalleryPhoto(id) {
  if (!confirm('Delete this photo? This cannot be undone.')) return
  const res = await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (res.status === 401) return handleLogout()
  loadGallery()
}

/* ---------------- Shared ---------------- */

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: 'POST', headers: authHeaders() })
  } catch (e) {
    console.error(e)
  }
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminName')
  localStorage.removeItem('adminRole')
  router.push('/admin/login')
}

onMounted(() => {
  loadServices()
  loadBarbers()
  loadGallery()
})
</script>

<style scoped>
.manage-page { font-family: var(--font-body); background: var(--color-cream-bg); min-height: 100vh; padding: 32px; }
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.dash-header h1 { font-family: var(--font-heading); color: var(--color-navy-dark); font-size: 26px; }
.subtitle { color: #6b7280; font-size: 13px; margin-top: 4px; }
.header-actions { display: flex; gap: 10px; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #d8d3c8; }
.tabs button {
  padding: 10px 20px; border: none; background: none; cursor: pointer;
  font-weight: 600; font-size: 14px; color: #6b7280; border-bottom: 3px solid transparent; margin-bottom: -2px;
}
.tabs button.active { color: var(--color-navy-dark); border-bottom-color: var(--color-gold); }

.add-btn { margin-bottom: 16px; }
.btn-primary, .btn-ghost {
  padding: 10px 18px; border-radius: 4px; font-weight: 600; font-size: 13px; cursor: pointer; border: none;
  text-decoration: none; display: inline-block;
}
.btn-primary { background: var(--color-gold); color: var(--color-navy-dark); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; border: 1.5px solid var(--color-navy-dark); color: var(--color-navy-dark); }

table.ledger { width: 100%; border-collapse: collapse; font-size: 13.5px; background: white; }
table.ledger th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: #6b7280; padding: 10px; border-bottom: 2px solid #d8d3c8;
}
table.ledger td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
table.ledger tr.inactive { opacity: 0.5; }

.badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
.badge.active { background: rgba(10, 25, 47, 0.1); color: var(--color-navy-dark); }
.badge.inactive { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

.row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.row-actions button {
  font-size: 11.5px; padding: 5px 9px; border-radius: 4px; border: 1.5px solid #d8d3c8; background: white; cursor: pointer;
}
.row-actions button.danger:hover { border-color: #dc2626; color: #dc2626; }

.loading-note { padding: 30px; text-align: center; color: #6b7280; }

/* Gallery tab */
.gallery-upload { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; margin-bottom: 16px; }
.file-label { display: flex; flex-direction: column; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; gap: 5px; }
.file-label input[type="text"] { padding: 9px 10px; border: 1.5px solid #d8d3c8; border-radius: 4px; font-family: inherit; font-size: 13.5px; min-width: 240px; }
.gallery-admin-grid { list-style: none; margin: 16px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.gallery-admin-grid li { background: white; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
.gallery-admin-grid img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
.gallery-admin-meta { display: flex; flex-direction: column; gap: 8px; padding: 10px; }
.gallery-admin-meta input { padding: 7px 8px; border: 1.5px solid #d8d3c8; border-radius: 4px; font-family: inherit; font-size: 12.5px; }
.gallery-admin-meta button { font-size: 11.5px; padding: 6px 9px; border-radius: 4px; border: 1.5px solid #d8d3c8; background: white; cursor: pointer; }
.gallery-admin-meta button:hover { border-color: #dc2626; color: #dc2626; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10, 25, 47, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
}
.modal {
  background: white; border-radius: 8px; padding: 28px; width: 100%; max-width: 420px;
  max-height: 85vh; overflow-y: auto;
}
.modal h3 { font-family: var(--font-heading); color: var(--color-navy-dark); margin-bottom: 16px; }
.modal label { display: block; font-size: 13px; font-weight: 600; color: var(--color-navy-dark); margin-bottom: 12px; }
.modal input[type="text"], .modal input[type="number"] {
  width: 100%; margin-top: 6px; padding: 9px 10px; border: 1.5px solid #d8d3c8; border-radius: 4px; font-family: inherit;
}
.modal input[type="file"] { margin-top: 6px; font-size: 13px; }
.photo-preview { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin: 8px 0 16px; display: block; }
.field-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin: 16px 0 8px; }
.day-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
.day-check { display: flex; align-items: center; gap: 6px; width: 60px; margin: 0; font-weight: 400; }
.day-row input[type="time"] { padding: 6px; border: 1.5px solid #d8d3c8; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.error-msg { color: #dc2626; font-size: 13px; margin-top: 8px; }
</style>

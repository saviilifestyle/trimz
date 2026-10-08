<template>
  <section class="gallery-manager">
    <div class="upload-card">
      <label class="drop" :class="{ filled: previewUrl }">
        <input type="file" accept="image/*" @change="onFile" />
        <img v-if="previewUrl" :src="previewUrl" alt="Selected photo preview" />
        <span v-else>Choose a photo</span>
      </label>

      <div class="upload-fields">
        <label>
          Caption (optional)
          <input v-model="caption" type="text" maxlength="80" placeholder="Low skin fade with beard line-up" />
        </label>
        <p v-if="formError" class="error-msg">{{ formError }}</p>
        <button class="btn-primary" :disabled="uploading" @click="upload">
          {{ uploading ? 'Uploading…' : 'Upload photo' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-note">Loading…</div>
    <p v-else-if="loadError" class="error-msg">{{ loadError }}</p>
    <div v-else-if="!photos.length" class="loading-note">No photos yet. Upload the first cut above.</div>

    <ul v-else class="thumbs">
      <li v-for="p in photos" :key="p.id">
        <img :src="p.photo_url" :alt="p.caption || 'Gallery photo'" />
        <div class="thumb-info">
          <span>{{ p.caption || 'No caption' }}</span>
          <button class="danger" @click="remove(p)">Delete</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['unauthorized'])

const API_BASE = 'http://127.0.0.1:8000/api'
const MAX_MB = 8

const photos = ref([])
const loading = ref(true)
const loadError = ref('')

const file = ref(null)
const previewUrl = ref('')
const caption = ref('')
const formError = ref('')
const uploading = ref(false)

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetch(`${API_BASE}/gallery`)
    if (!res.ok) throw new Error()
    photos.value = await res.json()
  } catch {
    loadError.value = 'Could not load the gallery.'
  } finally {
    loading.value = false
  }
}

function onFile(e) {
  formError.value = ''
  const f = e.target.files[0]
  if (!f) return
  if (!f.type.startsWith('image/')) {
    formError.value = 'Choose an image file.'
    return
  }
  if (f.size > MAX_MB * 1024 * 1024) {
    formError.value = `Choose an image under ${MAX_MB} MB.`
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
}

async function upload() {
  formError.value = ''
  if (!file.value) {
    formError.value = 'Choose a photo first.'
    return
  }
  uploading.value = true
  try {
    const body = new FormData()
    body.append('photo', file.value)
    body.append('caption', caption.value.trim())

    // No Content-Type header: the browser sets the multipart boundary itself
    const res = await fetch(`${API_BASE}/gallery`, { method: 'POST', headers: authHeaders(), body })
    if (res.status === 401) return emit('unauthorized')
    const data = await res.json()
    if (!res.ok) {
      formError.value = data.error || Object.values(data.errors || {}).flat().join(' ') || 'Could not upload that photo.'
      return
    }
    photos.value.unshift(data)
    file.value = null
    caption.value = ''
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  } catch (e) {
    console.error(e)
    formError.value = 'Network error.'
  } finally {
    uploading.value = false
  }
}

async function remove(p) {
  if (!confirm('Delete this photo from the gallery?')) return
  try {
    const res = await fetch(`${API_BASE}/gallery/${p.id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.status === 401) return emit('unauthorized')
    if (!res.ok) throw new Error()
    photos.value = photos.value.filter((x) => x.id !== p.id)
  } catch {
    loadError.value = 'Could not delete that photo.'
  }
}

onMounted(load)
onBeforeUnmount(() => previewUrl.value && URL.revokeObjectURL(previewUrl.value))
</script>

<style scoped>
.gallery-manager { font-family: var(--font-body); }

.upload-card {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
  padding: 20px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: 3px solid var(--color-gold);
}

.drop {
  position: relative;
  display: grid;
  place-items: center;
  height: 160px;
  border: 1.5px dashed #b9b3a5;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  overflow: hidden;
}

.drop:hover, .drop:focus-within { border-color: var(--color-gold); }
.drop.filled { border-style: solid; }
.drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.drop img { width: 100%; height: 100%; object-fit: cover; }

.upload-fields { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.upload-fields label { width: 100%; font-size: 13px; font-weight: 600; color: var(--color-navy-dark); }
.upload-fields input[type='text'] {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 9px 10px;
  border: 1.5px solid #d8d3c8;
  border-radius: 4px;
  font-family: inherit;
}

.btn-primary {
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  background: var(--color-gold);
  color: var(--color-navy-dark);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg { color: #dc2626; font-size: 13px; margin: 0; }
.loading-note { padding: 30px; text-align: center; color: #6b7280; }

.thumbs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.thumbs li { background: white; border: 1px solid #e5e7eb; }
.thumbs img { display: block; width: 100%; height: 180px; object-fit: cover; }

.thumb-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: #475569;
}

.thumb-info span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.thumb-info button {
  flex-shrink: 0;
  font-size: 11.5px;
  padding: 5px 9px;
  border: 1.5px solid #d8d3c8;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.thumb-info button.danger:hover { border-color: #dc2626; color: #dc2626; }

@media (max-width: 600px) {
  .upload-card { grid-template-columns: 1fr; }
}
</style>

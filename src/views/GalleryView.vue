<template>
  <main class="gallery-page">
    <section class="gallery-head">
      <p class="section-label">Our work</p>
      <h1>Cuts that speak for themselves.</h1>
      <p class="gallery-intro">Fades, line-ups, and beard work from the chair at Trimz.</p>
    </section>

    <section class="gallery-body">
      <p v-if="loading" class="msg">Loading the gallery…</p>
      <p v-else-if="error" class="msg">
        {{ error }} <button type="button" class="link-btn" @click="load">Retry</button>
      </p>
      <p v-else-if="!photos.length" class="msg">No photos yet. Check back soon.</p>

      <ul v-else class="grid">
        <li v-for="p in photos" :key="p.id" class="tile">
          <button type="button" class="tile-open" :aria-label="`Open ${p.caption || 'photo'}`" @click="active = p">
            <img :src="p.photo_url" :alt="p.caption || 'Haircut by Trimz'" loading="lazy" />
            <span v-if="p.caption" class="tile-caption">{{ p.caption }}</span>
          </button>
        </li>
      </ul>
    </section>

    <div v-if="active" class="lightbox" role="dialog" aria-modal="true" @click.self="active = null">
      <button type="button" class="lightbox-close" aria-label="Close" @click="active = null">Close</button>
      <figure>
        <img :src="active.photo_url" :alt="active.caption || 'Haircut by Trimz'" />
        <figcaption v-if="active.caption">{{ active.caption }}</figcaption>
      </figure>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const photos = ref([])
const loading = ref(true)
const error = ref('')
const active = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/gallery`)
    if (!res.ok) throw new Error()
    photos.value = await res.json()
  } catch {
    error.value = "Couldn't load the gallery."
  } finally {
    loading.value = false
  }
}

const onKey = (e) => e.key === 'Escape' && (active.value = null)

onMounted(() => {
  load()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.gallery-page {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  background: var(--color-cream-bg, #fcfbfa);
  min-height: 80vh;
  padding-bottom: 4rem;
}

.gallery-head {
  padding: 4rem 2rem 3.5rem;
  text-align: center;
  background:
    radial-gradient(circle at top left, rgba(212, 175, 55, 0.16), transparent 30%),
    linear-gradient(125deg, #07111e 0%, #101f33 55%, #08141f 100%);
}

.section-label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-gold, #d4af37);
}

.gallery-head h1 {
  margin: 0.6rem 0 0.8rem;
  font-family: var(--font-serif, 'Cormorant Garamond', serif);
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 1.05;
  color: #f8f3ea;
}

.gallery-intro { margin: 0; color: #e9daba; letter-spacing: 0.5px; }

.gallery-body { max-width: 1200px; margin: 3rem auto 0; padding: 0 2rem; }

.msg { margin: 0; padding: 3rem 0; text-align: center; color: #475569; }

.link-btn {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--color-gold-dark, #bfa030);
  text-decoration: underline;
  cursor: pointer;
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  columns: 3 260px;
  column-gap: 1.25rem;
}

.tile { break-inside: avoid; margin-bottom: 1.25rem; }

.tile-open {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: #0a192f;
  cursor: zoom-in;
  overflow: hidden;
}

.tile-open img {
  display: block;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(110%) brightness(0.9);
  transition: filter 0.4s ease, transform 0.6s ease;
}

.tile-open:hover img,
.tile-open:focus-visible img { filter: none; transform: scale(1.03); }
.tile-open:focus-visible { outline: 2px solid var(--color-gold, #d4af37); outline-offset: 3px; }

.tile-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.8rem 0.9rem;
  background: rgba(7, 17, 30, 0.82);
  color: #f8f3ea;
  font-size: 0.8rem;
  text-align: left;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: rgba(3, 8, 20, 0.92);
}

.lightbox figure { margin: 0; max-width: min(900px, 100%); }
.lightbox img { max-width: 100%; max-height: 80vh; display: block; margin: 0 auto; }
.lightbox figcaption { margin-top: 0.8rem; text-align: center; color: #e9daba; }

.lightbox-close {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(212, 175, 55, 0.75);
  background: transparent;
  color: #f8f3ea;
  font: inherit;
  cursor: pointer;
}

.lightbox-close:hover { background: var(--color-gold, #d4af37); color: #0a192f; }

@media (max-width: 640px) {
  .gallery-body { padding: 0 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  .tile-open img { transition: none; }
}
</style>

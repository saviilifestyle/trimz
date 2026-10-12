<template>
  <main class="gallery-page">
    <h1 class="sr-only">Gallery</h1>

    <div class="ornament" aria-hidden="true"></div>

    <section class="gallery-body" :aria-busy="loading">
      <!-- Loading: shimmering placeholders instead of text -->
      <ul v-if="loading" class="grid" aria-hidden="true">
        <li
          v-for="n in 6"
          :key="n"
          class="tile skeleton"
          :style="{ '--h': skeletonHeights[n - 1] }"
        ></li>
      </ul>

      <div v-else-if="error" class="state">
        <p>{{ error }}</p>
        <button type="button" class="btn-outline" @click="load">Try again</button>
      </div>

      <p v-else-if="!photos.length" class="state">No photos yet.</p>

      <ul v-else class="grid">
        <li v-for="(p, i) in photos" :key="p.id" class="tile" :style="{ '--i': i % 9 }">
          <button
            type="button"
            class="tile-open"
            :aria-label="`Open ${p.caption || 'photo'}`"
            @click="open(i)"
          >
            <span class="frame">
              <span class="photo">
                <img :src="p.photo_url" :alt="p.caption || 'Haircut by Trimz'" loading="lazy" />
                <span v-if="p.caption" class="tile-caption">{{ p.caption }}</span>
              </span>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Lightbox -->
    <Transition name="fade">
      <div
        v-if="active"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        @click.self="close"
      >
        <button ref="closeBtn" type="button" class="lb-btn lb-close" aria-label="Close" @click="close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <button v-if="photos.length > 1" type="button" class="lb-btn lb-prev" aria-label="Previous photo" @click="prev">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <button v-if="photos.length > 1" type="button" class="lb-btn lb-next" aria-label="Next photo" @click="next">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <figure :key="active.id" class="lb-figure">
          <img :src="active.photo_url" :alt="active.caption || 'Haircut by Trimz'" />
          <figcaption>
            <span v-if="active.caption">{{ active.caption }}</span>
            <span class="lb-count">{{ activeIndex + 1 }} / {{ photos.length }}</span>
          </figcaption>
        </figure>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const photos = ref([])
const loading = ref(true)
const error = ref('')
const activeIndex = ref(null)
const closeBtn = ref(null)
let lastFocus = null

const skeletonHeights = ['280px', '340px', '240px', '320px', '260px', '300px']
const active = computed(() =>
  activeIndex.value === null ? null : photos.value[activeIndex.value],
)

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

function open(i) {
  lastFocus = document.activeElement
  activeIndex.value = i
}
function close() {
  activeIndex.value = null
}
function next() {
  activeIndex.value = (activeIndex.value + 1) % photos.value.length
}
function prev() {
  activeIndex.value = (activeIndex.value - 1 + photos.value.length) % photos.value.length
}

// Runs only when the lightbox opens or closes (not on next/prev)
watch(activeIndex, async (val, old) => {
  if ((val === null) === (old === null)) return
  document.body.style.overflow = val === null ? '' : 'hidden'
  if (val !== null) {
    await nextTick()
    closeBtn.value?.focus()
  } else if (lastFocus) {
    lastFocus.focus?.()
    lastFocus = null
  }
})

function onKey(e) {
  if (activeIndex.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
  load()
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.gallery-page {
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
  min-height: 80vh;
  padding: 3.5rem 0 5rem;
  background:
    radial-gradient(ellipse at 15% 0%, rgba(212, 175, 55, 0.14), transparent 40%),
    radial-gradient(ellipse at 90% 100%, rgba(212, 175, 55, 0.07), transparent 40%),
    linear-gradient(160deg, #07111e 0%, #0d1b2e 55%, #08141f 100%);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Small gold ornament at the top - no words */
.ornament {
  position: relative;
  width: 120px;
  height: 1px;
  margin: 0 auto 3rem;
  background: linear-gradient(90deg, transparent, var(--color-gold, #d4af37), transparent);
}

.ornament::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  background: var(--color-gold, #d4af37);
  transform: translate(-50%, -50%) rotate(45deg);
}

.gallery-body {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Masonry grid */
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  columns: 3 280px;
  column-gap: 1.5rem;
}

.tile {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  animation: rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms);
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

.tile-open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: zoom-in;
}

.tile-open:focus-visible {
  outline: 2px solid var(--color-gold, #d4af37);
  outline-offset: 4px;
}

/* "Framed print" look: thin gold border with a mat around the photo */
.frame {
  display: block;
  padding: 8px;
  border: 1px solid rgba(212, 175, 55, 0.28);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.4s ease, transform 0.5s ease, box-shadow 0.5s ease;
}

.photo {
  position: relative;
  display: block;
  overflow: hidden;
}

.photo img {
  display: block;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(108%) brightness(0.88);
  transition: filter 0.6s ease, transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.tile-open:hover .frame,
.tile-open:focus-visible .frame {
  border-color: rgba(212, 175, 55, 0.75);
  box-shadow: 0 18px 40px rgba(2, 8, 20, 0.5);
  transform: translateY(-4px);
}

.tile-open:hover img,
.tile-open:focus-visible img {
  filter: none;
  transform: scale(1.045);
}

.tile-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2.2rem 1rem 0.9rem;
  background: linear-gradient(to top, rgba(5, 13, 23, 0.92), transparent);
  color: #f8f3ea;
  font-size: 0.82rem;
  letter-spacing: 0.3px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.tile-open:hover .tile-caption,
.tile-open:focus-visible .tile-caption {
  opacity: 1;
  transform: none;
}

/* Touch screens have no hover, so always show captions there */
@media (hover: none) {
  .tile-caption { opacity: 1; transform: none; }
}

/* Loading placeholders */
.skeleton {
  height: var(--h, 280px);
  border: 1px solid rgba(212, 175, 55, 0.15);
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.04) 30%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 70%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* Error / empty */
.state {
  margin: 0;
  padding: 4rem 1rem;
  text-align: center;
  color: #9aa7ba;
}

.state p { margin: 0 0 1.25rem; }

.btn-outline {
  padding: 0.75rem 1.8rem;
  border: 1px solid rgba(212, 175, 55, 0.75);
  background: rgba(212, 175, 55, 0.12);
  color: #f8f3ea;
  font: 600 0.78rem/1 var(--font-body, 'Plus Jakarta Sans', sans-serif);
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: var(--color-gold, #d4af37);
  color: var(--color-navy-dark, #0a192f);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 4.5rem 1rem 3rem;
  background: rgba(3, 8, 20, 0.94);
  backdrop-filter: blur(6px);
}

.lb-figure {
  margin: 0;
  max-width: min(960px, 100%);
  animation: lbIn 0.45s ease both;
}

@keyframes lbIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: none; }
}

.lb-figure img {
  display: block;
  max-width: 100%;
  max-height: 76vh;
  margin: 0 auto;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid rgba(212, 175, 55, 0.45);
  background: rgba(255, 255, 255, 0.03);
}

.lb-figure figcaption {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 1rem;
  margin-top: 0.9rem;
  color: #e9daba;
  font-size: 0.9rem;
}

.lb-count {
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: #7f8ca0;
  font-variant-numeric: tabular-nums;
}

.lb-btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(212, 175, 55, 0.5);
  background: rgba(7, 17, 30, 0.6);
  color: #f8f3ea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lb-btn:hover,
.lb-btn:focus-visible {
  background: var(--color-gold, #d4af37);
  color: var(--color-navy-dark, #0a192f);
  outline: none;
}

.lb-close { top: 1.1rem; right: 1.25rem; }
.lb-prev { left: 1.25rem; top: 50%; transform: translateY(-50%); }
.lb-next { right: 1.25rem; top: 50%; transform: translateY(-50%); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .gallery-body { padding: 0 1rem; }
  .grid { column-gap: 1rem; }
  .tile { margin-bottom: 1rem; }

  /* Arrows move to the bottom corners so they don't cover the photo */
  .lightbox { padding-bottom: 5rem; }
  .lb-prev, .lb-next { top: auto; bottom: 1rem; transform: none; }
  .lb-prev { left: 1rem; }
  .lb-next { right: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .skeleton,
  .lb-figure { animation: none; }

  .frame,
  .photo img,
  .tile-caption,
  .fade-enter-active,
  .fade-leave-active { transition: none; }
}
</style>

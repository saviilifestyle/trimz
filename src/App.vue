<template>
  <div class="app-shell">
    <header v-if="!isAdminRoute" class="navbar" :class="{ 'on-dark': onDark }">
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/gallery">Pallery</router-link>
      </nav>
    </header>

    <router-view />
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from './views/FooterView.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isBooking = computed(() => route.path.startsWith('/booking'))

// Dark navbar only on the pages that sit on the navy hero
const onDark = computed(() => route.path === '/' || route.path.startsWith('/gallery'))
const showFooter = computed(() => !isAdminRoute.value && !isBooking.value)
</script>

<style scoped>
.app-shell {
  width: 100%;
  min-height: 100vh;
}

/* Original navbar, unchanged. It uses your existing --nav-* variables. */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3.5rem;
  background-color: var(--nav-bg);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-links {
  display: flex;
  gap: 3rem;
  flex-grow: 1;
  justify-content: center;
}

.nav-links a {
  text-decoration: none;
  font-family: var(--font-sans);
  color: var(--nav-text);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 2px;
  transition: color 0.35s ease;
  position: relative;
  padding-bottom: 6px;
}

.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 0;
  background: var(--color-accent-strong);
  transition: width 0.35s ease;
}

.nav-links a:hover {
  color: var(--nav-text-strong);
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-links a.router-link-exact-active {
  color: var(--color-accent-strong);
}

.nav-links a.router-link-exact-active::after {
  width: 100%;
}

/* Quiet navy variant, scoped to this navbar only (home and gallery) */
.navbar.on-dark {
  --nav-bg: #07111e;
  --nav-text: #9aa7ba;
  --nav-text-strong: #f8f3ea;
  --color-accent-strong: #e9daba;
  padding: 1.25rem 2rem;
  box-shadow: none;
}

.navbar.on-dark .nav-links a::after {
  background: rgba(212, 175, 55, 0.7);
}

@media (max-width: 700px) {
  .navbar {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem 1.5rem;
  }

  .navbar.on-dark {
    padding: 1rem 1.5rem;
  }

  .nav-links {
    gap: 1.6rem;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>

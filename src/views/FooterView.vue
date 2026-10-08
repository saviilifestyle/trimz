<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-left">
        <span class="footer-name">Trimz Haircut</span>
        <span class="footer-copy">&copy; {{ year }} All rights reserved</span>
      </div>

      <div class="footer-links">
        <a href="https://maps.app.goo.gl/aBNQcXTRJskd3SnL7" target="_blank" rel="noopener noreferrer">
          Legacy Building, Ngong
        </a>
        <a href="tel:+254116848523">+254 116 848 523</a>
        <a href="mailto:hello@trimzbarbers.com">hello@trimzbarbers.com</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  background: #07111e;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem 2rem;
  flex-wrap: wrap;
}

.footer-left {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
}

.footer-name {
  font-family: var(--font-serif, 'Cormorant Garamond', serif);
  font-size: 1.15rem;
  letter-spacing: 1px;
  color: #e9daba;
}

.footer-copy {
  font-size: 0.72rem;
  color: #6f7e94;
}

.footer-links {
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: none;
  font-size: 0.78rem;
  color: #9aa7ba;
  transition: color 0.3s ease;
}

.footer-links a:hover,
.footer-links a:focus-visible {
  color: #f8f3ea;
  outline: none;
}

@media (max-width: 700px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem 1.25rem;
  }

  .footer-left { flex-direction: column; align-items: center; gap: 0.2rem; }
  .footer-links { justify-content: center; gap: 0.5rem 1.25rem; }
}
</style>

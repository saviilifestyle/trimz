<template>
  <div class="page-wrapper">



    <main class="hero-canvas">
      <!-- Asymmetric Floating Visual Slices (Background Art Layer) -->
      <div class="visual-slice slice-top-right"></div>
      <div class="visual-slice slice-mid-left"></div>
      <div class="visual-slice slice-bottom-left"></div>
      <div class="visual-slice slice-bottom-right"></div>

      <!-- Foreground Interactive Text Content Layer -->
      <div class="hero-center-content">
        <!-- Luxury Editorial Interlocking Typography -->
        <h1 class="hero-editorial-title">
          <span class="text-gold">TRIMZ</span> <br />
          <span class="indent-text">HAIRCUT</span>
        </h1>

        <p class="hero-tagline-text">Clean cuts. Sharp Looks. Confidence.</p>

        <!-- Elegant Hero Call-To-Action -->
        <div class="hero-actions">
          <router-link to="/booking" class="btn-editorial-primary">BOOK A HAIRCUT</router-link>
        </div>
      </div>

      <!-- Bottom Right Corner Balanced Info Anchor -->
      <div class="corner-services-info">
        <p class="info-label">WE PROVIDE THE FOLLOWING SERVICES:</p>
        <p class="info-list">HAIRCUTS, BEARD TRIMMING, SHAVING,</p>
      </div>
    </main>

    <!-- Who We Are Section -->
    <section class="who-we-are-section" id="contact">
      <div class="who-we-are-card">
        <div class="who-we-are-copy">
          <p class="section-label">Who We Are</p>
          <h2>Barbershop craft with a polished, modern edge.</h2>
          <p>
            We blend classic grooming traditions with a refined, contemporary atmosphere for every
            visit.
          </p>
        </div>

        <div class="who-we-are-details">
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <a href="mailto:hello@trimzbarbers.com">hello@trimzbarbers.com</a>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone</span>
            <a href="tel:+254116848523">+254 116848523</a>
          </div>
         <div class="detail-item">
  <span class="detail-label">Location</span>

    <a href="https://maps.app.goo.gl/aBNQcXTRJskd3SnL7"
    target="_blank"
    rel="noopener noreferrer"
  >
    Inside Legacy Bulding,next to Muguna Plaza, Ngong
  </a>
</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Ready for component lifecycle hooks or state integration later
</script>

<style scoped>

.page-wrapper {
  --color-navy-dark: #0a192f;
  --color-navy-text: #051122;
  --color-cream-bg: #fcfbfa;
  --color-gold: #d4af37;
  --color-gold-dark: #bfa030;

  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--color-cream-bg);
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Navbar Styling */
.navbar {
  background-color: var(--color-navy-dark);
  color: #ffffff;
  padding: 0.85rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.nav-links {
  display: none;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-links a {
  color: #e2e8f0;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--color-gold);
}

.btn-nav-book {
  background-color: var(--color-gold);
  color: var(--color-navy-dark);
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  border-radius: 2px;
  text-decoration: none;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.2s ease;
}

.btn-nav-book:hover {
  background-color: var(--color-gold-dark);
}

/* Luxury Canvas Layout */
.hero-canvas {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(212, 175, 55, 0.18), transparent 28%),
    linear-gradient(125deg, #07111e 0%, #101f33 55%, #08141f 100%);
  overflow: hidden;
}

.hero-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.08),
    transparent 35%,
    rgba(255, 255, 255, 0.04)
  );
  pointer-events: none;
}

.hero-canvas::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0 35%, rgba(3, 8, 20, 0.4) 100%);
  pointer-events: none;
}

/* Artistic Floating Picture Slices placeholders */
.visual-slice {
  position: absolute;
  background-color: rgba(10, 25, 47, 0.06); /* Tinted layout placeholders for images */
  border: 1px solid rgba(212, 175, 55, 0.3);
  background-size: cover;
  background-position: center;
  filter: grayscale(100%) contrast(110%) brightness(0.88);
  transition: all 0.5s ease;
  box-shadow: 0 16px 35px rgba(2, 8, 20, 0.28);
}

/* Asymmetric Positioning mimicking your dribbble sample */
.slice-top-right {
  top: 10%;
  right: 15%;
  width: 140px;
  height: 180px;
  background-image: url('../assets/images/eugene-chystiakov-taZSJ6xmt48-unsplash.jpg');
}

.slice-mid-left {
  top: 25%;
  left: 12%;
  width: 180px;
  height: 260px;
  background-image: url('../assets/images/20 Cool Bald Fade Haircuts for Men.webp');
}

.slice-bottom-left {
  bottom: 8%;
  left: 5%;
  width: 130px;
  height: 150px;
  background-image: url('../assets/images/kingsley-osei-abrah-SnizbS0ClAs-unsplash.jpg');
}

.slice-bottom-right {
  bottom: 15%;
  right: 25%;
  width: 160px;
  height: 220px;
  background-image: url('../assets/images/Faded haircut.webp');
}

/* Center Editorial Content Block */
.hero-center-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 900px;
  padding: 2.5rem 2rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 50px rgba(2, 7, 20, 0.28);
}

/* Overlapping Wide Editorial Titles */
.hero-editorial-title {
  font-family: 'Cormorant Garamond', serif;
  color: #f8f3ea;
  font-size: 3.5rem;
  line-height: 0.95;
  font-weight: 500;
  letter-spacing: -1px;
  margin: 0 0 2rem 0;
  text-transform: uppercase;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}

@media (min-width: 768px) {
  .hero-editorial-title {
    font-size: 5.5rem;
  }
}

.indent-text {
  font-style: italic;
  font-weight: 400;
  letter-spacing: 2px;
}

.text-gold {
  color: var(--color-gold);
  font-weight: 700;
}

.hero-tagline-text {
  font-size: 1.1rem;
  color: #e9daba;
  letter-spacing: 1px;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 500;
}

/* Minimalistic Clean Button Outline */
.btn-editorial-primary {
  border: 1px solid rgba(212, 175, 55, 0.75);
  color: #f8f3ea;
  padding: 0.85rem 2rem;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 2px;
  border-radius: 0;
  text-decoration: none;
  display: inline-block;
  background: rgba(212, 175, 55, 0.12);
  transition: all 0.3s ease;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.btn-editorial-primary:hover {
  background-color: var(--color-gold);
  color: var(--color-navy-dark);
}

/* Corner Balanced Metadata Text */
.corner-services-info {
  position: absolute;
  bottom: 4rem;
  right: 4rem;
  text-align: right;
  max-width: 250px;
  display: none;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  box-shadow: 0 16px 40px rgba(2, 7, 20, 0.18);
}

@media (min-width: 1024px) {
  .corner-services-info {
    display: block;
  }
}

.info-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #d8c08a;
  letter-spacing: 1px;
  margin: 0 0 0.5rem 0;
}

.info-list {
  font-size: 0.8rem;
  font-weight: 600;
  color: #f8f3ea;
  line-height: 1.4;
  margin: 0;
}

/* Who We Are Section */
.who-we-are-section {
  max-width: 1200px;
  margin: 0 auto 5rem auto;
  padding: 0 2rem;
}

.who-we-are-card {
  display: grid;
  gap: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  box-shadow: 0 12px 35px rgba(2, 7, 20, 0.06);
}

@media (min-width: 768px) {
  .who-we-are-card {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: start;
  }
}

.who-we-are-copy h2 {
  margin: 0.4rem 0 1rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  line-height: 1.2;
  color: var(--color-navy-text);
}

.who-we-are-copy p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.section-label {
  display: inline-block;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-gold-dark);
}

.who-we-are-details {
  display: grid;
  gap: 1rem;
}

.detail-item {
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.detail-item:first-child {
  border-top: none;
  padding-top: 0;
}

.detail-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-navy-dark);
}

.detail-item a,
.detail-item p {
  margin: 0;
  color: #334155;
  text-decoration: none;
}

.detail-item a:hover {
  color: var(--color-gold-dark);
}
</style>

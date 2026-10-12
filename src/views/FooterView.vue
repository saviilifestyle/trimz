<template>
  <footer id="contact" class="footer">
    <div class="footer-main">
      <!-- Centre: logo -->
      <div class="footer-brand">
        <router-link to="/" class="logo" aria-label="Trimz Haircut - home">
          <span class="logo-trimz">Trimz</span>
          <span class="logo-haircut">Haircut</span>
        </router-link>
        <span class="logo-rule" aria-hidden="true"></span>
        <p class="brand-tagline">Quality &middot; Style &middot; Confidence</p>
      </div>

      <!-- Left: hours -->
      <div class="footer-col footer-hours">
        <h4>Opening Hours</h4>
        <ul class="hours">
          <li><span>Monday – Friday</span><span>9:00 AM – 6:00 PM</span></li>
          <li><span>Saturday</span><span>9:00 AM – 5:00 PM</span></li>
          <li class="closed"><span>Sunday</span><span>Closed</span></li>
        </ul>
      </div>

      <!-- Right: contact -->
      <div class="footer-col footer-contact">
        <h4>Visit &amp; Contact</h4>

        <div class="contact-item">
          <span class="contact-label">Location</span>
          <a
            href="https://maps.app.goo.gl/aBNQcXTRJskd3SnL7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inside Legacy Building, next to Muguna Plaza, Ngong
          </a>
        </div>

        <div class="contact-item">
          <span class="contact-label">Phone</span>
          <a href="tel:+254116848523">+254 116 848 523</a>
        </div>

        <div class="contact-item">
          <span class="contact-label">Email</span>
          <a href="mailto:hello@trimzbarbers.com">hello@trimzbarbers.com</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>&copy; {{ year }} Trimz Haircut. All rights reserved.</span>
        <router-link to="/admin/login" class="staff-link">Staff login</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  position: relative;
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
  color: #9aa7ba;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1), transparent 55%),
    linear-gradient(180deg, #07111e 0%, #050d17 100%);
}

/* Gold hairline along the top edge */
.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-gold, #d4af37), transparent);
}

/* Mobile first: everything stacks, logo on top */
.footer-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.footer-brand { text-align: center; }

.footer-hours,
.footer-contact {
  width: 100%;
  max-width: 380px;
  justify-self: center;
}

/* Desktop: Hours | Logo | Contact in one row */
@media (min-width: 960px) {
  .footer-main {
    grid-template-columns: 1fr auto 1fr;
    gap: 3.5rem;
    padding: 2.75rem 2rem 2.25rem;
    align-items: start;
  }

  .footer-brand { grid-column: 2; grid-row: 1; align-self: center; }
  .footer-hours { grid-column: 1; grid-row: 1; justify-self: end; max-width: 300px; }
  .footer-contact { grid-column: 3; grid-row: 1; justify-self: start; max-width: 300px; }
}

/* Logo */
.logo {
  display: inline-block;
  text-decoration: none;
  text-align: center;
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  text-transform: uppercase;
  line-height: 0.95;
}

.logo-trimz {
  display: block;
  padding-left: 3px; /* offsets trailing letter-spacing so it centres optically */
  font-size: clamp(2.2rem, 3.4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--color-gold, #d4af37);
}

.logo-haircut {
  display: block;
  margin-top: 0.2rem;
  padding-left: 6px;
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 6px;
  color: #f8f3ea;
}

/* Gold rule with a small diamond */
.logo-rule {
  display: block;
  position: relative;
  width: 64px;
  height: 1px;
  margin: 0.85rem auto 0.75rem;
  background: linear-gradient(90deg, transparent, var(--color-gold, #d4af37), transparent);
}

.logo-rule::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  background: var(--color-gold, #d4af37);
  transform: translate(-50%, -50%) rotate(45deg);
}

.brand-tagline {
  margin: 0;
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  font-style: italic;
  font-size: 1rem;
  letter-spacing: 0.5px;
  color: #e9daba;
}

/* Column headings */
.footer-col h4 {
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-gold, #d4af37);
  margin: 0 0 0.9rem;
}

/* Hours */
.hours {
  list-style: none;
  margin: 0;
  padding: 0;
}

.hours li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
}

.hours li:last-child { border-bottom: none; }
.hours li span:first-child { color: #c9d3e0; }
.hours li span:last-child { color: #f8f3ea; font-variant-numeric: tabular-nums; }
.hours li.closed span:last-child { color: #7f8ca0; }

/* Contact */
.contact-item { margin-bottom: 0.9rem; }
.contact-item:last-child { margin-bottom: 0; }

.contact-label {
  display: block;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6f7e94;
  margin-bottom: 0.15rem;
}

.contact-item a {
  color: #f8f3ea;
  text-decoration: none;
  font-size: 0.88rem;
  line-height: 1.45;
  transition: color 0.3s ease;
}

.contact-item a:hover { color: var(--color-gold, #d4af37); }

/* Bottom bar */
.footer-bottom { border-top: 1px solid rgba(255, 255, 255, 0.07); }

.footer-bottom-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #6f7e94;
}

@media (min-width: 960px) {
  .footer-bottom-inner {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.9rem 2rem;
  }
}

.staff-link {
  color: #6f7e94;
  text-decoration: none;
  transition: color 0.3s ease;
}

.staff-link:hover { color: var(--color-gold, #d4af37); }

/* Keyboard focus */
.footer a:focus-visible {
  outline: 2px solid var(--color-gold, #d4af37);
  outline-offset: 3px;
}
</style>

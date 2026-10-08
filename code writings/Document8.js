<template>
  <div class="booking-page">
    <!-- Progress Stepper -->
    <div class="stepper">
      <div
        v-for="(step, index) in steps"
        :key="step.label"
        class="step"
        :class="{ active: currentStep === index, done: currentStep > index }"
      >
        <div class="step-circle">
          <span v-if="currentStep > index">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <div class="wizard-card">
      <Transition :name="transitionName" mode="out-in">
        <div :key="currentStep">
          <!-- STEP 1: Service -->
          <div v-if="currentStep === 0" class="step-content">
            <h2>Choose a Service</h2>
            <p class="subtitle">Pick what you're here for today.</p>

            <div class="category-tabs">
              <button
                v-for="cat in categories"
                :key="cat"
                class="cat-tab"
                :class="{ active: activeCategory === cat }"
                @click="activeCategory = cat"
              >
                {{ cat }}
              </button>
            </div>

            <div class="option-grid">
              <div
                v-for="service in filteredServices"
                :key="service.id"
                class="option-card"
                :class="{ selected: booking.service?.id === service.id }"
                @click="selectService(service)"
              >
                <h3>{{ service.name }}</h3>
                <p>{{ service.duration }} min · {{ service.description }}</p>
                <span class="price">${{ service.price }}</span>
              </div>
            </div>

            <div v-if="booking.service" class="addons-block">
              <h4>Add extras (optional)</h4>
              <div class="addons-grid">
                <label
                  v-for="addon in addons"
                  :key="addon.id"
                  class="addon-chip"
                  :class="{ selected: booking.extras.includes(addon.id) }"
                >
                  <input type="checkbox" :value="addon.id" v-model="booking.extras" />
                  {{ addon.name }} <span>+${{ addon.price }}</span>
                </label>
              </div>
            </div>

            <p v-if="errors.service" class="field-error">{{ errors.service }}</p>
          </div>

          <!-- STEP 2: Barber -->
          <div v-if="currentStep === 1" class="step-content">
            <h2>Choose a Barber</h2>
            <p class="subtitle">Filter by when you'd like to come in, then pick your barber.</p>

            <div class="date-quick-filter">
              <button
                v-for="opt in quickDayOptions"
                :key="opt.iso"
                class="quick-day"
                :class="{ active: quickFilterDate === opt.iso }"
                @click="quickFilterDate = quickFilterDate === opt.iso ? null : opt.iso"
              >
                {{ opt.label }}
              </button>
            </div>

            <div class="option-grid">
              <div
                v-for="barber in barbers"
                :key="barber.id"
                class="option-card barber-card"
                :class="{
                  selected: booking.barber?.id === barber.id,
                  disabled: quickFilterDate && !isBarberWorking(barber, quickFilterDate),
                }"
                @click="
                  !(quickFilterDate && !isBarberWorking(barber, quickFilterDate)) &&
                  selectBarber(barber)
                "
              >
                <img :src="barber.photo" :alt="barber.name" />
                <h3>{{ barber.name }}</h3>
                <p class="specialty">{{ barber.specialty }}</p>
                <div class="barber-meta">
                  <span class="rating">★ {{ barber.rating }}</span>
                  <span class="exp">{{ barber.experience }}y exp</span>
                </div>
                <span
                  v-if="quickFilterDate"
                  class="avail-badge"
                  :class="{ off: !isBarberWorking(barber, quickFilterDate) }"
                >
                  {{ isBarberWorking(barber, quickFilterDate) ? 'Available' : 'Off that day' }}
                </span>
              </div>
            </div>

            <p v-if="errors.barber" class="field-error">{{ errors.barber }}</p>
          </div>

          <!-- STEP 3: Date & Time -->
          <div v-if="currentStep === 2" class="step-content">
            <h2>Pick Date & Time</h2>
            <p class="subtitle">Showing real slots for {{ booking.barber?.name }}.</p>

            <div class="date-row">
              <div
                v-for="date in availableDates"
                :key="date.iso"
                class="date-chip"
                :class="{
                  selected: booking.date === date.iso,
                  disabled: !isBarberWorking(booking.barber, date.iso),
                }"
                @click="
                  isBarberWorking(booking.barber, date.iso) &&
                  ((booking.date = date.iso), (booking.time = null))
                "
              >
                <span class="dow">{{ date.dow }}</span>
                <span class="dom">{{ date.dom }}</span>
              </div>
            </div>

            <div v-if="booking.date">
              <div v-if="timesForSelectedDate.length" class="time-grid">
                <div
                  v-for="slot in timesForSelectedDate"
                  :key="slot.time"
                  class="time-chip"
                  :class="{ selected: booking.time === slot.time, disabled: slot.booked }"
                  @click="!slot.booked && (booking.time = slot.time)"
                >
                  {{ slot.time }}
                  <span v-if="slot.booked" class="booked-tag">booked</span>
                </div>
              </div>
              <p v-else class="no-slots">No open slots this day — try another date.</p>
            </div>

            <p v-if="errors.datetime" class="field-error">{{ errors.datetime }}</p>
          </div>

          <!-- STEP 4: Details -->
          <div v-if="currentStep === 3" class="step-content">
            <h2>Your Details</h2>
            <p class="subtitle">We'll use this to confirm your booking.</p>

            <form class="details-form" @submit.prevent>
              <label>
                Full Name
                <input
                  v-model="booking.customer.name"
                  type="text"
                  placeholder="John Doe"
                  :class="{ invalid: errors.name }"
                  @blur="validateField('name')"
                />
                <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
              </label>
              <label>
                Phone Number
                <input
                  v-model="booking.customer.phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  :class="{ invalid: errors.phone }"
                  @blur="validateField('phone')"
                />
                <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
              </label>
              <label>
                Email
                <input
                  v-model="booking.customer.email"
                  type="email"
                  placeholder="john@email.com"
                  :class="{ invalid: errors.email }"
                  @blur="validateField('email')"
                />
                <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
              </label>
              <label>
                Notes (optional)
                <textarea
                  v-model="booking.customer.notes"
                  rows="3"
                  placeholder="Anything the barber should know?"
                ></textarea>
              </label>
            </form>
          </div>

          <!-- STEP 5: Confirmation -->
          <div v-if="currentStep === 4" class="step-content confirmation">
            <div class="check-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p class="subtitle">Here's a summary of your appointment.</p>

            <div class="summary-card">
              <div class="summary-row">
                <span>Service</span><strong>{{ booking.service?.name }}</strong>
              </div>
              <div v-if="selectedExtras.length" class="summary-row">
                <span>Extras</span
                ><strong>{{ selectedExtras.map((e) => e.name).join(', ') }}</strong>
              </div>
              <div class="summary-row">
                <span>Barber</span><strong>{{ booking.barber?.name }}</strong>
              </div>
              <div class="summary-row">
                <span>Date</span><strong>{{ formattedDate }}</strong>
              </div>
              <div class="summary-row">
                <span>Time</span><strong>{{ booking.time }}</strong>
              </div>
              <div class="summary-row">
                <span>Name</span><strong>{{ booking.customer.name }}</strong>
              </div>
              <div class="summary-row">
                <span>Phone</span><strong>{{ booking.customer.phone }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total</span><strong>${{ totalPrice }}</strong>
              </div>
            </div>

            <p class="ref-code">
              Booking Reference: <strong>{{ bookingRef }}</strong>
            </p>
          </div>
        </div>
      </Transition>

      <!-- Navigation -->
      <div class="nav-buttons" v-if="currentStep < 4">
        <button v-if="currentStep > 0" class="btn-secondary" @click="goBack">Back</button>
        <div class="spacer"></div>
        <button class="btn-primary" @click="handleNext">
          {{ currentStep === 3 ? 'Confirm Booking' : 'Continue' }}
        </button>
      </div>

      <div class="nav-buttons" v-else>
        <button class="btn-secondary" @click="resetBooking">Book Another</button>
        <div class="spacer"></div>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentStep = ref(0)
const transitionName = ref('slide-next')

const steps = [
  { label: 'Service' },
  { label: 'Barber' },
  { label: 'Date & Time' },
  { label: 'Details' },
  { label: 'Confirmation' },
]

/* ---------------- Mock Data ---------------- */

const categories = ['All', 'Hair', 'Beard', 'Combo', 'Kids']

const services = ref([
  {
    id: 1,
    category: 'Hair',
    name: 'Classic Haircut',
    duration: 30,
    price: 15,
    description: 'Scissor or clipper cut',
  },
  {
    id: 2,
    category: 'Hair',
    name: 'Skin Fade',
    duration: 40,
    price: 20,
    description: 'Precision fade, blended',
  },
  {
    id: 3,
    category: 'Beard',
    name: 'Beard Trim',
    duration: 20,
    price: 10,
    description: 'Shape and line up',
  },
  {
    id: 4,
    category: 'Beard',
    name: 'Hot Towel Shave',
    duration: 30,
    price: 18,
    description: 'Straight razor finish',
  },
  {
    id: 5,
    category: 'Combo',
    name: 'Haircut + Beard',
    duration: 45,
    price: 22,
    description: 'Full grooming package',
  },
  {
    id: 6,
    category: 'Combo',
    name: 'The Works',
    duration: 60,
    price: 35,
    description: 'Cut, beard, hot towel, wash',
  },
  {
    id: 7,
    category: 'Kids',
    name: 'Kids Haircut',
    duration: 25,
    price: 12,
    description: 'Under 12 years',
  },
  {
    id: 8,
    category: 'Hair',
    name: 'Hair Wash & Style',
    duration: 20,
    price: 8,
    description: 'Wash, dry, style',
  },
])

const addons = ref([
  { id: 'a1', name: 'Hot Towel', price: 5 },
  { id: 'a2', name: 'Head Massage', price: 7 },
  { id: 'a3', name: 'Eyebrow Trim', price: 4 },
  { id: 'a4', name: 'Hair Product Styling', price: 6 },
  { id: 'a5', name: 'Nose Wax', price: 5 },
])

const barbers = ref([
  {
    id: 1,
    name: 'James O.',
    specialty: 'Fades & Tapers',
    rating: 4.9,
    experience: 8,
    photo: 'https://placehold.co/200x200',
    workDays: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    name: 'Kevin M.',
    specialty: 'Beard Styling',
    rating: 4.7,
    experience: 5,
    photo: 'https://placehold.co/200x200',
    workDays: [2, 3, 4, 5, 6],
  },
  {
    id: 3,
    name: 'Tony B.',
    specialty: 'Classic Cuts',
    rating: 4.8,
    experience: 12,
    photo: 'https://placehold.co/200x200',
    workDays: [1, 3, 5, 6, 0],
  },
  {
    id: 4,
    name: 'Marcus D.',
    specialty: 'Hot Towel Shaves',
    rating: 5.0,
    experience: 10,
    photo: 'https://placehold.co/200x200',
    workDays: [1, 2, 4, 5, 6],
  },
])

const fullTimeSlots = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
]

/* deterministic pseudo-random "already booked" slots per barber+date, so it looks real but is stable on reload */
function seededRandom(seed) {
  let x = 0
  for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) % 1000
  return () => {
    x = (x * 9301 + 49297) % 233280
    return x / 233280
  }
}

function isBarberWorking(barber, dateIso) {
  if (!barber || !dateIso) return false
  const day = new Date(dateIso).getDay()
  return barber.workDays.includes(day)
}

/* ---------------- Booking State ---------------- */

const booking = ref({
  service: null,
  barber: null,
  date: null,
  time: null,
  extras: [],
  customer: { name: '', phone: '', email: '', notes: '' },
})

const errors = ref({})
const bookingRef = ref('')
const activeCategory = ref('All')
const quickFilterDate = ref(null)

/* ---------------- Computed ---------------- */

const filteredServices = computed(() =>
  activeCategory.value === 'All'
    ? services.value
    : services.value.filter((s) => s.category === activeCategory.value),
)

const selectedExtras = computed(() =>
  addons.value.filter((a) => booking.value.extras.includes(a.id)),
)

const totalPrice = computed(() => {
  const base = booking.value.service?.price || 0
  const extras = selectedExtras.value.reduce((sum, e) => sum + e.price, 0)
  return base + extras
})

const availableDates = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      iso: d.toISOString().split('T')[0],
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dom: d.getDate(),
    })
  }
  return days
})

const quickDayOptions = computed(() => [
  { iso: availableDates.value[0].iso, label: 'Today' },
  { iso: availableDates.value[1].iso, label: 'Tomorrow' },
  { iso: availableDates.value[3].iso, label: 'Later this week' },
])

const timesForSelectedDate = computed(() => {
  if (!booking.value.barber || !booking.value.date) return []
  const rand = seededRandom(`${booking.value.barber.id}-${booking.value.date}`)
  return fullTimeSlots.map((time) => ({
    time,
    booked: rand() < 0.3, // ~30% of slots look pre-booked
  }))
})

const formattedDate = computed(() => {
  if (!booking.value.date) return ''
  return new Date(booking.value.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

/* ---------------- Actions ---------------- */

function selectService(service) {
  booking.value.service = service
  errors.value.service = null
}

function selectBarber(barber) {
  booking.value.barber = barber
  booking.value.date = null
  booking.value.time = null
  errors.value.barber = null
}

function validateField(field) {
  const c = booking.value.customer
  if (field === 'name') {
    errors.value.name = c.name.trim().length < 2 ? 'Please enter your full name.' : null
  }
  if (field === 'phone') {
    const phoneRegex = /^[+\d][\d\s-]{7,}$/
    errors.value.phone = !phoneRegex.test(c.phone) ? 'Enter a valid phone number.' : null
  }
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    errors.value.email =
      c.email && !emailRegex.test(c.email) ? 'Enter a valid email address.' : null
  }
}

function validateStep() {
  errors.value = {}
  if (currentStep.value === 0 && !booking.value.service) {
    errors.value.service = 'Please select a service to continue.'
    return false
  }
  if (currentStep.value === 1 && !booking.value.barber) {
    errors.value.barber = 'Please select a barber to continue.'
    return false
  }
  if (currentStep.value === 2 && (!booking.value.date || !booking.value.time)) {
    errors.value.datetime = 'Please select both a date and a time.'
    return false
  }
  if (currentStep.value === 3) {
    validateField('name')
    validateField('phone')
    validateField('email')
    return !errors.value.name && !errors.value.phone && !errors.value.email
  }
  return true
}

function handleNext() {
  if (!validateStep()) return

  if (currentStep.value === 3) {
    bookingRef.value = 'TRZ-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    // TODO: replace with real API call to Express backend, e.g.
    // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking.value) })
  }

  transitionName.value = 'slide-next'
  currentStep.value++
}

function goBack() {
  transitionName.value = 'slide-prev'
  currentStep.value--
}

function resetBooking() {
  currentStep.value = 0
  errors.value = {}
  quickFilterDate.value = null
  booking.value = {
    service: null,
    barber: null,
    date: null,
    time: null,
    extras: [],
    customer: { name: '', phone: '', email: '', notes: '' },
  }
}
</script>

<style scoped>
.booking-page {
  --navy: var(--color-navy-dark);
  --gold: var(--color-gold);
  --paper: var(--color-cream-bg);
  font-family: var(--font-body);
  background: var(--navy);
  min-height: 100vh;
  padding: 60px 20px;
}

h2 {
  font-family: var(--font-heading);
  color: var(--navy);
  font-size: 28px;
  margin-bottom: 4px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 700px;
  margin: 0 auto 40px;
}

.step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step.active .step-circle {
  background: var(--gold);
  color: var(--navy);
}

.step.done .step-circle {
  background: var(--navy);
  color: white;
}

.step-label {
  font-size: 12px;
  margin-left: 8px;
  color: #6b7280;
  white-space: nowrap;
  display: none;
}

@media (min-width: 640px) {
  .step-label {
    display: inline;
  }
}

.step.active .step-label,
.step.done .step-label {
  color: var(--navy);
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 8px;
}

.step.done .step-line {
  background: var(--navy);
}

/* Card */
.wizard-card {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(20, 36, 63, 0.08);
  overflow: hidden;
}

/* Transitions */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.28s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* Category tabs */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cat-tab {
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
}

.cat-tab.active {
  background: var(--navy);
  color: white;
  border-color: var(--navy);
}

/* Options */
.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.option-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
}

.option-card:hover {
  border-color: var(--gold);
}

.option-card.selected {
  border-color: var(--gold);
  background: rgba(201, 151, 31, 0.08);
}

.option-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.option-card h3 {
  font-family: var(--font-heading);
  color: var(--navy);
  font-size: 18px;
  margin-bottom: 4px;
}

.option-card p {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 6px;
}

.price {
  color: var(--gold);
  font-weight: 700;
}

.barber-card img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.barber-meta {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  color: var(--navy);
  margin-bottom: 8px;
}

.avail-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(34, 139, 34, 0.12);
  color: #228b22;
}

.avail-badge.off {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

/* Add-ons */
.addons-block {
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.addons-block h4 {
  font-size: 14px;
  color: var(--navy);
  margin-bottom: 12px;
}

.addons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.addon-chip {
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--navy);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.addon-chip input {
  accent-color: var(--gold);
}

.addon-chip.selected {
  border-color: var(--gold);
  background: rgba(201, 151, 31, 0.08);
}

.addon-chip span {
  color: var(--gold);
  font-weight: 600;
}

/* Quick day filter */
.date-quick-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.quick-day {
  border: 2px solid #e5e7eb;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  cursor: pointer;
}

.quick-day.active {
  background: var(--navy);
  color: white;
  border-color: var(--navy);
}

/* Date & Time */
.date-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-bottom: 28px;
  padding-bottom: 6px;
}

.date-chip {
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  text-align: center;
  cursor: pointer;
  min-width: 60px;
}

.date-chip.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.date-chip .dow {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.date-chip .dom {
  display: block;
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--navy);
  font-weight: 600;
}

.date-chip.selected {
  border-color: var(--gold);
  background: rgba(201, 151, 31, 0.08);
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}

.time-chip {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--navy);
  position: relative;
}

.time-chip.selected {
  border-color: var(--gold);
  background: var(--gold);
  color: white;
  font-weight: 600;
}

.time-chip.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}

.booked-tag {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
}

.no-slots {
  color: #dc2626;
  font-size: 14px;
}

/* Form */
.details-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.details-form label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: var(--navy);
  font-weight: 600;
  gap: 6px;
}

.details-form input,
.details-form textarea {
  font-family: var(--font-body);
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 400;
  resize: none;
}

.details-form input:focus,
.details-form textarea:focus {
  outline: none;
  border-color: var(--gold);
}

.details-form input.invalid {
  border-color: #dc2626;
}

.field-error {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}

/* Confirmation */
.confirmation {
  text-align: center;
}

.check-icon {
  width: 60px;
  height: 60px;
  background: var(--gold);
  color: white;
  border-radius: 50%;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.summary-card {
  background: var(--paper);
  border-radius: 10px;
  padding: 20px;
  text-align: left;
  margin: 24px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  color: var(--navy);
  font-size: 14px;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 12px;
  font-size: 16px;
}

.ref-code {
  color: #6b7280;
  font-size: 14px;
}

.ref-code strong {
  color: var(--navy);
}

/* Buttons */
.nav-buttons {
  display: flex;
  align-items: center;
  margin-top: 32px;
}

.spacer {
  flex: 1;
}

.btn-primary,
.btn-secondary {
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: var(--gold);
  color: var(--navy);
}

.btn-secondary {
  background: transparent;
  color: var(--navy);
  border: 2px solid var(--navy);
}
</style>

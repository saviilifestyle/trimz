<template>
  <div class="booking-page">
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
      <div v-if="loadError" class="field-error load-error">{{ loadError }}</div>

      <Transition :name="transitionName" mode="out-in">
        <div :key="currentStep">
          <!-- STEP 1: Service -->
          <div v-if="currentStep === 0" class="step-content">
            <h2>Choose a Service</h2>
            <p class="subtitle">Pick what you're here for today.</p>

            <div v-if="loadingServices" class="loading-note">Loading services…</div>

            <template v-else>
              <div v-for="group in groupedServices" :key="group.category" class="category-group">
                <h4 class="category-heading">{{ group.category }}</h4>
                <div class="option-grid">
                  <div
                    v-for="service in group.items"
                    :key="service.id"
                    class="option-card"
                    :class="{ selected: booking.service?.id === service.id }"
                    tabindex="0"
                    @click="selectService(service)"
                    @keydown.enter="selectService(service)"
                  >
                    <h3>{{ service.name }}</h3>
                    <p>{{ service.duration }} min</p>
                    <span class="price">{{ formatPrice(service.price) }}</span>
                  </div>
                </div>
              </div>
            </template>

            <p v-if="errors.service" class="field-error">{{ errors.service }}</p>
          </div>

          <!-- STEP 2: Barber -->
          <div v-if="currentStep === 1" class="step-content">
            <h2>Choose a Barber</h2>
            <p class="subtitle">Filter by when you'd like to come in, then pick your barber.</p>

            <div v-if="loadingBarbers" class="loading-note">Loading barbers…</div>

            <template v-else>
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
                  tabindex="0"
                  @click="
                    !(quickFilterDate && !isBarberWorking(barber, quickFilterDate)) &&
                    selectBarber(barber)
                  "
                  @keydown.enter="
                    !(quickFilterDate && !isBarberWorking(barber, quickFilterDate)) &&
                    selectBarber(barber)
                  "
                >
                <img :src="barber.photo" :alt="barber.name" />
                 <h3>{{ barber.name }}</h3>
                  <span
                    v-if="quickFilterDate"
                    class="avail-badge"
                    :class="{ off: !isBarberWorking(barber, quickFilterDate) }"
                  >
                    {{ isBarberWorking(barber, quickFilterDate) ? 'Available' : 'Off that day' }}
                  </span>
                </div>
              </div>
            </template>

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
                  ((booking.date = date.iso), (booking.time24 = null))
                "
              >
                <span class="dow">{{ date.dow }}</span>
                <span class="dom">{{ date.dom }}</span>
              </div>
            </div>

            <div v-if="booking.date">
              <div v-if="loadingSlots" class="loading-note">Checking the book…</div>
              <div v-else-if="timesForSelectedDate.length" class="time-grid">
                <div
                  v-for="slot in timesForSelectedDate"
                  :key="slot.time24"
                  class="time-chip"
                  :class="{ selected: booking.time24 === slot.time24, disabled: slot.booked }"
                  @click="!slot.booked && (booking.time24 = slot.time24)"
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
                  placeholder="0700 000 000"
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

            <p v-if="errors.submit" class="field-error">{{ errors.submit }}</p>
          </div>

          <!-- STEP 5: Confirmation -->
          <div v-if="currentStep === 4" class="step-content confirmation">
            <div class="check-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p class="subtitle">Here's a summary of your appointment.</p>

            <div class="summary-card">
              <div class="summary-row"><span>Service</span><strong>{{ confirmed.service_name }}</strong></div>
              <div class="summary-row"><span>Barber</span><strong>{{ confirmed.barber_name }}</strong></div>
              <div class="summary-row"><span>Date</span><strong>{{ formattedConfirmedDate }}</strong></div>
              <div class="summary-row"><span>Time</span><strong>{{ formattedConfirmedTime }}</strong></div>
              <div class="summary-row"><span>Name</span><strong>{{ confirmed.customer_name }}</strong></div>
              <div class="summary-row"><span>Phone</span><strong>{{ confirmed.customer_phone }}</strong></div>
              <div class="summary-row total"><span>Total</span><strong>{{ formatPrice(confirmed.total_price) }}</strong></div>
            </div>

            <p class="ref-code">
              Booking Reference: <strong>{{ confirmed.ref }}</strong>
            </p>
          </div>
        </div>
      </Transition>

      <div class="nav-buttons" v-if="currentStep < 4">
        <button v-if="currentStep > 0" class="btn-secondary" @click="goBack">Back</button>
        <div class="spacer"></div>
        <button class="btn-primary" :disabled="submitting" @click="handleNext">
          {{ submitting ? 'Booking…' : currentStep === 3 ? 'Confirm Booking' : 'Continue' }}
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
import { ref, computed, onMounted, watch } from 'vue'

// Move this to an env variable (import.meta.env.VITE_API_BASE) before deploying.
const API_BASE = 'http://127.0.0.1:8000/api'

const currentStep = ref(0)
const transitionName = ref('slide-next')

const steps = [
  { label: 'Service' },
  { label: 'Barber' },
  { label: 'Date & Time' },
  { label: 'Details' },
  { label: 'Confirmation' },
]

/* ---------------- Real data, loaded from the API ---------------- */

const services = ref([])
const barbers = ref([])
const loadingServices = ref(true)
const loadingBarbers = ref(true)
const loadError = ref('')

async function loadInitialData() {
  try {
    const [svcRes, barberRes] = await Promise.all([
      fetch(`${API_BASE}/services`),
      fetch(`${API_BASE}/barbers`),
    ])
    if (!svcRes.ok || !barberRes.ok) throw new Error('bad response')
    services.value = await svcRes.json()
    barbers.value = await barberRes.json()
  } catch (e) {
    loadError.value = "Couldn't reach the booking service. Is the backend running?"
  } finally {
    loadingServices.value = false
    loadingBarbers.value = false
  }
}

function isBarberWorking(barber, dateIso) {
  if (!barber || !dateIso) return false
  const day = new Date(dateIso + 'T00:00:00').getDay()
  return barber.workDays.includes(day)
}

/* ---------------- Booking state ---------------- */

const booking = ref({
  service: null,
  barber: null,
  date: null,
  time24: null, // 24h "HH:MM" - what actually gets submitted
  customer: { name: '', phone: '', email: '', notes: '' },
})

const errors = ref({})
const quickFilterDate = ref(null)
const submitting = ref(false)
const confirmed = ref(null) // full booking record returned by the API on success

/* ---------------- Computed ---------------- */

const groupedServices = computed(() => {
  const order = ['Hair', 'Beard', 'Skin & Spa', 'Nails']
  const groups = {}
  for (const s of services.value) {
    if (!groups[s.category]) groups[s.category] = []
    groups[s.category].push(s)
  }
  return order
    .filter((cat) => groups[cat])
    .map((cat) => ({ category: cat, items: groups[cat] }))
})

const availableDates = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      iso: isoDate(d),
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

const timesForSelectedDate = ref([])
const loadingSlots = ref(false)

async function loadAvailability() {
  if (!booking.value.barber || !booking.value.date || !booking.value.service) return
  loadingSlots.value = true
  timesForSelectedDate.value = []
  try {
    const params = new URLSearchParams({
      barberId: booking.value.barber.id,
      serviceId: booking.value.service.id,
      date: booking.value.date,
    })
    const res = await fetch(`${API_BASE}/availability?${params}`)
    const data = await res.json()
    timesForSelectedDate.value = data.slots || []
  } catch (e) {
    errors.value.datetime = 'Could not load availability. Try again.'
  } finally {
    loadingSlots.value = false
  }
}

watch(() => booking.value.date, () => {
  if (currentStep.value === 2) loadAvailability()
})

const formattedConfirmedDate = computed(() => {
  if (!confirmed.value) return ''
  return new Date(confirmed.value.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
})

const formattedConfirmedTime = computed(() => {
  if (!confirmed.value) return ''
  return to12h(confirmed.value.start_time)
})

function to12h(hhmm) {
  let [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function isoDate(d) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatPrice(amount) {
  return `KSh ${Number(amount).toLocaleString()}`
}

/* ---------------- Actions ---------------- */

function selectService(service) {
  booking.value.service = service
  errors.value.service = null
}

function selectBarber(barber) {
  booking.value.barber = barber
  booking.value.date = null
  booking.value.time24 = null
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
    errors.value.email = c.email && !emailRegex.test(c.email) ? 'Enter a valid email address.' : null
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
  if (currentStep.value === 2 && (!booking.value.date || !booking.value.time24)) {
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

async function submitBooking() {
  submitting.value = true
  errors.value.submit = null
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: booking.value.barber.id,
        serviceId: booking.value.service.id,
        date: booking.value.date,
        startTime: booking.value.time24,
        customerName: booking.value.customer.name,
        customerPhone: booking.value.customer.phone,
        customerEmail: booking.value.customer.email,
        notes: booking.value.customer.notes,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      errors.value.submit = data.error || 'Something went wrong booking that slot.'
      if (res.status === 409) await loadAvailability() // slot was taken - refresh
      submitting.value = false
      return false
    }
    confirmed.value = data
    submitting.value = false
    return true
  } catch (e) {
    errors.value.submit = 'Network error — please try again.'
    submitting.value = false
    return false
  }
}

async function handleNext() {
  if (!validateStep()) return

  if (currentStep.value === 3) {
    const ok = await submitBooking()
    if (!ok) return
  }

  transitionName.value = 'slide-next'
  currentStep.value++

  if (currentStep.value === 2) loadAvailability()
}

function goBack() {
  transitionName.value = 'slide-prev'
  currentStep.value--
}

function resetBooking() {
  currentStep.value = 0
  errors.value = {}
  quickFilterDate.value = null
  confirmed.value = null
  timesForSelectedDate.value = []
  booking.value = {
    service: null,
    barber: null,
    date: null,
    time24: null,
    customer: { name: '', phone: '', email: '', notes: '' },
  }
}

onMounted(loadInitialData)
</script>

<style scoped>
.booking-page {
  font-family: var(--font-body);
  background: var(--color-navy-dark);
  min-height: 100vh;
  padding: 60px 20px;
}

h2 {
  font-family: var(--font-heading);
  color: var(--color-navy-dark);
  font-size: 28px;
  margin-bottom: 4px;
}

.subtitle { color: #6b7280; margin-bottom: 24px; }
.loading-note, .load-error { color: #6b7280; font-size: 14px; padding: 10px 0; }
.load-error { color: #dc2626; }

/* Stepper */
.stepper {
  display: flex; justify-content: center; align-items: center;
  max-width: 700px; margin: 0 auto 40px;
}
.step { display: flex; align-items: center; flex: 1; position: relative; }
.step-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: #e5e7eb; color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px; flex-shrink: 0; transition: all 0.2s ease;
}
.step.active .step-circle { background: var(--color-gold); color: var(--color-navy-dark); }
.step.done .step-circle { background: var(--color-navy-dark); color: white; }
.step-label { font-size: 12px; margin-left: 8px; color: #6b7280; white-space: nowrap; display: none; }
@media (min-width: 640px) { .step-label { display: inline; } }
.step.active .step-label, .step.done .step-label { color: var(--color-navy-dark); font-weight: 600; }
.step-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 8px; }
.step.done .step-line { background: var(--color-navy-dark); }

/* Card */
.wizard-card {
  max-width: 700px; margin: 0 auto; background: white;
  border-radius: 12px; padding: 40px;
  box-shadow: 0 4px 24px rgba(10, 25, 47, 0.12); overflow: hidden;
}

/* Transitions */
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active { transition: all 0.28s ease; }
.slide-next-enter-from { opacity: 0; transform: translateX(24px); }
.slide-next-leave-to { opacity: 0; transform: translateX(-24px); }
.slide-prev-enter-from { opacity: 0; transform: translateX(-24px); }
.slide-prev-leave-to { opacity: 0; transform: translateX(24px); }

/* Service categories - static headings, not interactive tabs */
.category-group { margin-bottom: 24px; }
.category-heading {
  font-family: var(--font-heading); font-size: 15px; color: var(--color-gold-dark);
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
}

/* Options */
.option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
.option-card {
  border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; cursor: pointer;
  transition: all 0.2s ease; text-align: center; position: relative;
}
.option-card:hover { border-color: var(--color-gold); }
.option-card:focus-visible { outline: 3px solid var(--color-gold); outline-offset: 2px; }
.option-card.selected { border-color: var(--color-gold); background: rgba(212, 175, 55, 0.08); }
.option-card.disabled { opacity: 0.45; cursor: not-allowed; }
.option-card h3 { font-family: var(--font-heading); color: var(--color-navy-dark); font-size: 18px; margin-bottom: 4px; }
.option-card p { color: #6b7280; font-size: 13px; margin-bottom: 6px; }
.price { color: var(--color-gold-dark); font-weight: 700; }

.barber-card img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; }
.barber-meta { display: flex; justify-content: center; gap: 10px; font-size: 12px; color: var(--color-navy-dark); margin-bottom: 8px; }
.avail-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(34, 139, 34, 0.12); color: #228b22; }
.avail-badge.off { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

/* Quick day filter */
.date-quick-filter { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.quick-day {
  border: 2px solid #e5e7eb; background: white; padding: 8px 16px; border-radius: 20px;
  font-size: 13px; font-weight: 600; color: var(--color-navy-dark); cursor: pointer;
}
.quick-day.active { background: var(--color-navy-dark); color: white; border-color: var(--color-navy-dark); }

/* Date & Time */
.date-row { display: flex; gap: 10px; overflow-x: auto; margin-bottom: 28px; padding-bottom: 6px; }
.date-chip {
  flex-shrink: 0; border: 2px solid #e5e7eb; border-radius: 10px; padding: 12px 16px;
  text-align: center; cursor: pointer; min-width: 60px;
}
.date-chip.disabled { opacity: 0.35; cursor: not-allowed; }
.date-chip .dow { display: block; font-size: 12px; color: #6b7280; }
.date-chip .dom { display: block; font-family: var(--font-heading); font-size: 18px; color: var(--color-navy-dark); font-weight: 600; }
.date-chip.selected { border-color: var(--color-gold); background: rgba(212, 175, 55, 0.08); }

.time-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
.time-chip {
  border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center;
  cursor: pointer; font-size: 14px; color: var(--color-navy-dark); position: relative;
}
.time-chip.selected { border-color: var(--color-gold); background: var(--color-gold); color: white; font-weight: 600; }
.time-chip.disabled { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }
.booked-tag { display: block; font-size: 9px; text-transform: uppercase; }
.no-slots { color: #dc2626; font-size: 14px; }

/* Form */
.details-form { display: flex; flex-direction: column; gap: 18px; }
.details-form label { display: flex; flex-direction: column; font-size: 14px; color: var(--color-navy-dark); font-weight: 600; gap: 6px; }
.details-form input, .details-form textarea {
  font-family: var(--font-body); border: 2px solid #e5e7eb; border-radius: 8px;
  padding: 10px 12px; font-size: 14px; font-weight: 400; resize: none;
}
.details-form input:focus, .details-form textarea:focus { outline: none; border-color: var(--color-gold); }
.details-form input.invalid { border-color: #dc2626; }
.field-error { color: #dc2626; font-size: 12px; font-weight: 500; margin-top: 8px; }

/* Confirmation */
.confirmation { text-align: center; }
.check-icon {
  width: 60px; height: 60px; background: var(--color-gold); color: white; border-radius: 50%;
  font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
}
.summary-card { background: var(--color-cream-bg); border-radius: 10px; padding: 20px; text-align: left; margin: 24px 0; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: var(--color-navy-dark); font-size: 14px; }
.summary-row.total { border-bottom: none; padding-top: 12px; font-size: 16px; }
.ref-code { color: #6b7280; font-size: 14px; }
.ref-code strong { color: var(--color-navy-dark); }

/* Buttons */
.nav-buttons { display: flex; align-items: center; margin-top: 32px; }
.spacer { flex: 1; }
.btn-primary, .btn-secondary {
  padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;
  cursor: pointer; border: none; text-decoration: none; display: inline-block;
}
.btn-primary { background: var(--color-gold); color: var(--color-navy-dark); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: transparent; color: var(--color-navy-dark); border: 2px solid var(--color-navy-dark); }
</style>

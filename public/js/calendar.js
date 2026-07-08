const MAX_PER_DAY = 4;
let availabilityCache = {}; // keyed by "YYYY-MM" -> { "YYYY-MM-DD": {booked, available} }
let selectedDate = null;

function pad(n) { return n < 10 ? '0' + n : n; }
function monthKey(year, month) { return `${year}-${pad(month + 1)}`; } // month is 0-indexed from Flatpickr
function dateKey(year, month, day) { return `${year}-${pad(month + 1)}-${pad(day)}`; }

async function fetchAvailability(year, month) {
  const key = monthKey(year, month);
  if (availabilityCache[key]) return availabilityCache[key];

  try {
    const res = await fetch(`/api/bookings/availability?month=${key}`);
    const data = await res.json();
    availabilityCache[key] = data.availability || {};
    return availabilityCache[key];
  } catch (err) {
    return {};
  }
}

function renderDots(dayElem, booked) {
  // Remove any existing dot wrapper first (Flatpickr re-renders on month change)
  const existing = dayElem.querySelector('.day-dots');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.className = 'day-dots';

  let status = 'open';
  if (booked >= MAX_PER_DAY) status = 'full';
  else if (booked >= MAX_PER_DAY / 2) status = 'limited';

  for (let i = 0; i < MAX_PER_DAY; i++) {
    const dot = document.createElement('span');
    dot.className = `mini-dot ${i < booked ? `mini-dot-${status}` : 'mini-dot-empty'}`;
    wrap.appendChild(dot);
  }
  dayElem.appendChild(wrap);

  if (status === 'full') dayElem.classList.add('day-full');
}

const fp = flatpickr('#datePicker', {
  minDate: 'today',
  dateFormat: 'Y-m-d',
  onDayCreate: async function(dObj, dStr, fpInstance, dayElem) {
    const year = dayElem.dateObj.getFullYear();
    const month = dayElem.dateObj.getMonth();
    const day = dayElem.dateObj.getDate();
    const key = monthKey(year, month);

    const availability = availabilityCache[key] || await fetchAvailability(year, month);
    const dk = dateKey(year, month, day);
    const booked = availability[dk] ? availability[dk].booked : 0;
    renderDots(dayElem, booked);
  },
  onMonthChange: async function(selectedDates, dateStr, instance) {
    await fetchAvailability(instance.currentYear, instance.currentMonth);
    instance.redraw();
  },
  onChange: function(selectedDates, dateStr) {
    selectedDate = dateStr;
    document.getElementById('selectedDateDisplay').value = dateStr;
  }
});

// Load current month's availability on page load
fetchAvailability(new Date().getFullYear(), new Date().getMonth());

// ===== BOOKING SUBMIT =====
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('bookingMsg');
  msg.textContent = '';

  if (!selectedDate) {
    msg.style.color = '#FF5D5D';
    msg.textContent = 'Please select a date first.';
    return;
  }

  const eventName = document.getElementById('eventName').value;
  const pkg = document.getElementById('packageSelect').value;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventName, package: pkg, date: selectedDate })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.style.color = '#FF5D5D';
      msg.textContent = data.error || 'Booking failed';
      return;
    }
    msg.style.color = '#2DD4BF';
    msg.textContent = `Booked! ${data.slotsLeftForDate} slot(s) left that day.`;

    // Refresh availability cache for that month so dots update immediately
    const [y, m] = selectedDate.split('-');
    delete availabilityCache[monthKey(parseInt(y), parseInt(m) - 1)];
    await fetchAvailability(parseInt(y), parseInt(m) - 1);
    fp.redraw();
  } catch (err) {
    msg.style.color = '#FF5D5D';
    msg.textContent = 'Network error. Is the server running?';
  }
});
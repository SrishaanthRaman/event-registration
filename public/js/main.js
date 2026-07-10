// Mobile nav toggle (simple show/hide since it's a class project, not a full mobile menu system)
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navAuth = document.querySelector('.nav-auth');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
  navAuth.classList.toggle('mobile-open');
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navAuth.style.display = navAuth.style.display === 'flex' ? 'none' : 'flex';
});

// Modal open/close logic
const authModal = document.getElementById('authModal');
const modalClose = document.getElementById('modalClose');
const loginPane = document.getElementById('loginPane');
const signupPane = document.getElementById('signupPane');

function openModal(pane) {
  authModal.classList.remove('hidden');
  if (pane === 'signup') {
    loginPane.classList.add('hidden');
    signupPane.classList.remove('hidden');
  } else {
    signupPane.classList.add('hidden');
    loginPane.classList.remove('hidden');
  }
}
function closeModal() { authModal.classList.add('hidden'); }

document.getElementById('navLoginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('navSignupBtn').addEventListener('click', () => openModal('signup'));
document.getElementById('bookLoginLink').addEventListener('click', () => openModal('login'));
document.getElementById('bookSignupLink').addEventListener('click', () => openModal('signup'));
document.getElementById('switchToSignup').addEventListener('click', () => openModal('signup'));
document.getElementById('switchToLogin').addEventListener('click', () => openModal('login'));
modalClose.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

// Payment modal close logic
const paymentModal = document.getElementById('paymentModal');
const paymentModalClose = document.getElementById('paymentModalClose');
const paymentDoneBtn = document.getElementById('paymentDoneBtn');

function closePaymentModal() { paymentModal.classList.add('hidden'); }
paymentModalClose.addEventListener('click', closePaymentModal);
paymentDoneBtn.addEventListener('click', closePaymentModal);
paymentModal.addEventListener('click', (e) => { if (e.target === paymentModal) closePaymentModal(); });

// Contact form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  msg.textContent = '';

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.style.color = '#FF5D5D';
      msg.textContent = data.error || 'Something went wrong';
      return;
    }
    msg.style.color = '#2DD4BF';
    msg.textContent = data.message;
    document.getElementById('contactForm').reset();
  } catch (err) {
    msg.style.color = '#FF5D5D';
    msg.textContent = 'Network error. Is the server running?';
  }
});
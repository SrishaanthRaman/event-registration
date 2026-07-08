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
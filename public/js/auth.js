const API_BASE = '/api/auth';

function setLoggedInUI(name) {
  document.getElementById('navLoginBtn').classList.add('hidden');
  document.getElementById('navSignupBtn').classList.add('hidden');
  document.getElementById('navLogoutBtn').classList.remove('hidden');
  const greet = document.getElementById('navUserGreeting');
  greet.textContent = `Hi, ${name}`;
  greet.classList.remove('hidden');
  document.getElementById('bookLoginNotice').classList.add('hidden');
  document.getElementById('bookingForm').classList.remove('hidden');
}

function setLoggedOutUI() {
  document.getElementById('navLoginBtn').classList.remove('hidden');
  document.getElementById('navSignupBtn').classList.remove('hidden');
  document.getElementById('navLogoutBtn').classList.add('hidden');
  document.getElementById('navUserGreeting').classList.add('hidden');
  document.getElementById('bookLoginNotice').classList.remove('hidden');
  document.getElementById('bookingForm').classList.add('hidden');
}

// On page load, verify the REAL session with the server — don't just trust
// localStorage, since the server session may have expired or reset (e.g.
// after a server restart) even if the browser still remembers a name.
(async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('momently_user_name', data.name);
      setLoggedInUI(data.name);
    } else {
      localStorage.removeItem('momently_user_name');
      setLoggedOutUI();
    }
  } catch (err) {
    // If the check itself fails (e.g. server briefly unreachable), fall back
    // to logged-out UI rather than showing a false "logged in" state.
    localStorage.removeItem('momently_user_name');
    setLoggedOutUI();
  }
})();

// ===== SIGNUP =====
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('signupMsg');
  msg.textContent = '';

  const payload = {
    name: document.getElementById('signupName').value,
    age: document.getElementById('signupAge').value,
    phone: document.getElementById('signupPhone').value,
    email: document.getElementById('signupEmail').value,
    password: document.getElementById('signupPassword').value
  };

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      msg.style.color = '#FF5D5D';
      msg.textContent = data.error || 'Signup failed';
      return;
    }
    msg.style.color = '#2DD4BF';
    msg.textContent = 'Signup successful! Please log in.';
    setTimeout(() => {
      document.getElementById('signupPane').classList.add('hidden');
      document.getElementById('loginPane').classList.remove('hidden');
    }, 1000);
  } catch (err) {
    msg.style.color = '#FF5D5D';
    msg.textContent = 'Network error. Is the server running?';
  }
});

// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('loginMsg');
  msg.textContent = '';

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.style.color = '#FF5D5D';
      msg.textContent = data.error || 'Login failed';
      return;
    }
    localStorage.setItem('momently_user_name', data.name);
    setLoggedInUI(data.name);
    document.getElementById('authModal').classList.add('hidden');
  } catch (err) {
    msg.style.color = '#FF5D5D';
    msg.textContent = 'Network error. Is the server running?';
  }
});

// ===== LOGOUT =====
document.getElementById('navLogoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  } catch (err) {
    // even if the network call fails, clear local UI state
  }
  localStorage.removeItem('momently_user_name');
  setLoggedOutUI();
});
import { registerUser, loginUser, setCurrentUser } from './db.js';

const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const tabBtns = document.querySelectorAll('.tab-btn');

// Prefill email from cache (helps after registration)
const cachedEmail = localStorage.getItem('cachedEmail');
if (cachedEmail) {
  const loginEmail = document.getElementById('login-email');
  const registerEmail = document.getElementById('register-email');
  if (loginEmail) loginEmail.value = cachedEmail;
  if (registerEmail) registerEmail.value = cachedEmail;
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });

    document.getElementById(`${tab}-form`).classList.add('active');
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const messageDiv = document.getElementById('login-message');

  try {
    messageDiv.textContent = 'Logging in...';
    messageDiv.className = 'message';

  const user = await loginUser(email, password);
  const remember = document.getElementById('remember-me')?.checked === true;
  setCurrentUser(user, remember);

    messageDiv.textContent = 'Login successful! Redirecting...';
    messageDiv.className = 'message success';

    setTimeout(() => {
      window.location.href = user.is_admin ? 'admin.html' : 'index.html';
    }, 1000);
  } catch (error) {
    messageDiv.textContent = error.message;
    messageDiv.className = 'message error';
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const messageDiv = document.getElementById('register-message');

  if (password !== confirm) {
    messageDiv.textContent = 'Passwords do not match!';
    messageDiv.className = 'message error';
    return;
  }

  try {
    messageDiv.textContent = 'Creating account...';
    messageDiv.className = 'message';

    const user = await registerUser(email, password);
    // Cache the email for convenience (not the password)
    try {
      localStorage.setItem('cachedEmail', email);
    } catch (err) {
      // ignore storage errors
    }

    const rememberReg = document.getElementById('register-remember')?.checked === true;
    // Persist the session if user opted into 'Remember me' at registration
    setCurrentUser(user, rememberReg);

    messageDiv.textContent = 'Registration successful! Redirecting...';
    messageDiv.className = 'message success';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    messageDiv.textContent = error.message;
    messageDiv.className = 'message error';
  }
});

import { showSuccess, showError } from './modals.js';
import { getCookie, setCookie, eraseCookie } from './client-storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const screenSelect = document.getElementById('auth-select');
  const screenPin = document.getElementById('auth-pin');
  const screenPassword = document.getElementById('auth-password');

  const btnSelectPin = document.getElementById('btn-select-pin');
  const btnSelectPass = document.getElementById('btn-select-pass');
  const btnBackPin = document.getElementById('btn-back-to-select-pin');
  const btnBackPass = document.getElementById('btn-back-to-select-pass');

  const passwordForm = document.getElementById('password-form');
  const pinDots = document.querySelectorAll('.pin-dot');
  const keypadButtons = document.querySelectorAll('.keypad-btn');

  // PIN authentication state
  let enteredPin = '';
  const CORRECT_PIN = '1234';

  // --- SCREEN SWITCHING LOGIC ---
  function showScreen(targetScreen) {
    // Hide all screens
    screenSelect.classList.add('hidden');
    screenPin.classList.add('hidden');
    screenPassword.classList.add('hidden');

    // Show target screen
    targetScreen.classList.remove('hidden');

    // Reset inputs
    resetPin();
  }

  // --- COOKIE AND STATE INITIALIZATION ---
  const pinUserHeader = document.getElementById('pin-user-header');
  const pinGenericHeader = document.getElementById('pin-generic-header');
  const usernameField = document.getElementById('username');
  const saveUsernameCheckbox = document.getElementById('save-username');

  // Load saved username if present
  const savedUsername = getCookie('saved_username');
  if (savedUsername && usernameField) {
    usernameField.value = savedUsername;
    if (saveUsernameCheckbox) {
      saveUsernameCheckbox.checked = true;
    }
  }

  // Toggle user-specific vs generic PIN headers based on login history cookie
  const hasLoggedInBefore = getCookie('has_logged_in') === 'true';
  if (hasLoggedInBefore) {
    if (pinUserHeader) {
      pinUserHeader.classList.remove('hidden');
      pinUserHeader.classList.add('flex');
    }
    if (pinGenericHeader) {
      pinGenericHeader.classList.add('hidden');
      pinGenericHeader.classList.remove('flex');
    }
  } else {
    if (pinUserHeader) {
      pinUserHeader.classList.add('hidden');
      pinUserHeader.classList.remove('flex');
    }
    if (pinGenericHeader) {
      pinGenericHeader.classList.remove('hidden');
      pinGenericHeader.classList.add('flex');
    }
  }

  // Auto-route based on stored login method preference
  const preferredLoginMethod = getCookie('login_method');
  if (preferredLoginMethod === 'pin') {
    showScreen(screenPin);
  } else if (preferredLoginMethod === 'password') {
    showScreen(screenPassword);
  }

  // --- PIN CODE LOGIC ---
  function updatePinDots() {
    pinDots.forEach((dot, index) => {
      if (index < enteredPin.length) {
        dot.classList.add('bg-emerald-600', 'border-emerald-500', 'scale-110');
        dot.classList.remove('border-neutral-300', 'dark:border-neutral-600');
      } else {
        dot.classList.remove('bg-emerald-600', 'border-emerald-500', 'scale-110');
        dot.classList.add('border-neutral-300', 'dark:border-neutral-600');
      }
    });
  }

  function resetPin() {
    enteredPin = '';
    updatePinDots();
  }

  async function handlePinSubmit() {
    if (enteredPin === CORRECT_PIN) {
      setCookie('login_method', 'pin', 30);
      setCookie('has_logged_in', 'true', 30);
      await showSuccess('Access Granted', 'Welcome back, Mark Jordan!');
      window.location.href = '/pages/dashboard/';
    } else {
      await showError('Access Denied', 'Invalid PIN passcode. Please try again.');
      resetPin();
    }
  }

  function handleKeypadPress(val) {
    if (val === 'C') {
      resetPin();
    } else if (val === 'back') {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDots();
      }
    } else {
      if (enteredPin.length < 4) {
        enteredPin += val;
        updatePinDots();

        // Trigger verification automatically when 4 digits are entered
        if (enteredPin.length === 4) {
          // Add a very small delay so the dot fill animation completes before the popup
          setTimeout(handlePinSubmit, 150);
        }
      }
    }
  }


  // --- EVENT LISTENERS ---

  // Navigation
  btnSelectPin.addEventListener('click', () => showScreen(screenPin));
  btnSelectPass.addEventListener('click', () => showScreen(screenPassword));
  btnBackPin.addEventListener('click', () => showScreen(screenSelect));
  btnBackPass.addEventListener('click', () => showScreen(screenSelect));

  // Keypad
  keypadButtons.forEach(button => {
    button.addEventListener('click', () => {
      const val = button.getAttribute('data-val');
      handleKeypadPress(val);
    });
  });

  // Password Login Submission
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const saveUsernameCheckbox = document.getElementById('save-username');

    if (usernameInput && passwordInput) {
      // Simulate database match
      if (usernameInput.toLowerCase() === 'mark.jordan' && passwordInput === 'password') {
        setCookie('login_method', 'password', 30);
        setCookie('has_logged_in', 'true', 30);
        if (saveUsernameCheckbox && saveUsernameCheckbox.checked) {
          setCookie('saved_username', usernameInput, 30);
        } else {
          eraseCookie('saved_username');
        }
        await showSuccess('Access Granted', `Welcome back, ${usernameInput}!`);
        window.location.href = '/pages/dashboard/';
      } else {
        await showError('Authentication Failed', 'Invalid username or password.');
      }
    }
  });

  // Password Visibility Toggle
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeOffIcon = document.getElementById('eye-off-icon');

  if (togglePasswordBtn && passwordInput && eyeIcon && eyeOffIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (isPassword) {
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      } else {
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      }
    });
  }
});

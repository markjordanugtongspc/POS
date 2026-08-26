import { showSuccess, showError } from './modals.js';
import { getCookie, setCookie, eraseCookie } from './client-storage.js';
import { loginWithCredentials, loginWithPinCode } from '../../../backend/api/auth.api.js';
import { logUserActivity } from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const screenSelect = document.getElementById('auth-select');
  const screenPin = document.getElementById('auth-pin');
  const screenPassword = document.getElementById('auth-password');

  // Guard: If not on login/auth page, do not initialize
  if (!screenSelect || !screenPin || !screenPassword) {
    return;
  }

  const btnSelectPin = document.getElementById('btn-select-pin');
  const btnSelectPass = document.getElementById('btn-select-pass');
  const btnBackPin = document.getElementById('btn-back-to-select-pin');
  const btnBackPass = document.getElementById('btn-back-to-select-pass');

  const passwordForm = document.getElementById('password-form');
  const pinDots = document.querySelectorAll('.pin-dot');
  const keypadButtons = document.querySelectorAll('.keypad-btn');

  // PIN authentication state
  let enteredPin = '';

  // ==========================================
  // START: showScreen
  // Switches the active authentication view between Selection, PIN keypad, and Password form.
  // ==========================================
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
  // ==========================================
  // END: showScreen
  // ==========================================

  // ==========================================
  // START: setLoginUrlParam
  // Updates browser URL query parameters without reloading the page (?login=pin or ?login=password).
  // ==========================================
  function setLoginUrlParam(mode) {
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set('login', mode);
    } else {
      url.searchParams.delete('login');
    }
    window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
  }
  // ==========================================
  // END: setLoginUrlParam
  // ==========================================

  // ==========================================
  // START: applyLoginScreenFromUrl
  // Reads the current URL search parameters and routes to the appropriate authentication screen.
  // ==========================================
  function applyLoginScreenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const loginMode = params.get('login');

    if (loginMode === 'pin') {
      showScreen(screenPin);
    } else if (loginMode === 'password' || loginMode === 'pass') {
      showScreen(screenPassword);
    } else {
      showScreen(screenSelect);
    }
  }
  // ==========================================
  // END: applyLoginScreenFromUrl
  // ==========================================

  // --- COOKIE AND USER DETAILS INITIALIZATION ---
  const pinUserHeader = document.getElementById('pin-user-header');
  const pinGenericHeader = document.getElementById('pin-generic-header');
  const usernameField = document.getElementById('username');
  const saveUsernameCheckbox = document.getElementById('save-username');

  // ==========================================
  // START: updateUsernameLabel
  // Dynamically updates username label to USERNAME or EMAIL based on input content.
  // ==========================================
  function updateUsernameLabel() {
    const usernameLabel = document.querySelector('label[for="username"]');
    if (!usernameLabel || !usernameField) return;

    const val = usernameField.value.trim();
    if (!val) {
      usernameLabel.textContent = 'Username or Email';
    } else if (val.includes('@')) {
      usernameLabel.textContent = 'Email';
    } else {
      usernameLabel.textContent = 'Username';
    }
  }
  // ==========================================
  // END: updateUsernameLabel
  // ==========================================

  // Load saved username if present
  const savedUsername = getCookie('saved_username');
  if (savedUsername && usernameField) {
    usernameField.value = savedUsername;
    if (saveUsernameCheckbox) {
      saveUsernameCheckbox.checked = true;
    }
    updateUsernameLabel();
  }

  // Toggle user-specific vs generic PIN headers based on login history and localStorage
  const hasLoggedInBefore = getCookie('has_logged_in') === 'true';
  const savedUserName = localStorage.getItem('user_name') || getCookie('saved_username') || 'Mark Jordan';
  const pinUserNameEl = document.getElementById('pin-user-name');
  const pinUserAvatarEl = document.getElementById('pin-user-avatar');

  if (hasLoggedInBefore) {
    if (pinUserHeader) {
      pinUserHeader.classList.remove('hidden');
      pinUserHeader.classList.add('flex');
    }
    if (pinGenericHeader) {
      pinGenericHeader.classList.add('hidden');
      pinGenericHeader.classList.remove('flex');
    }
    if (pinUserNameEl) {
      pinUserNameEl.textContent = savedUserName;
    }
    if (pinUserAvatarEl) {
      const initials = savedUserName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'MJ';
      pinUserAvatarEl.textContent = initials;
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

  // Apply initial route from URL parameters (defaulting to auth-select if no ?login= param)
  applyLoginScreenFromUrl();

  // Listen for browser back / forward navigation
  window.addEventListener('popstate', applyLoginScreenFromUrl);

  // ==========================================
  // START: updatePinDots
  // Updates visual dot states reflecting how many PIN digits have been entered.
  // ==========================================
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
  // ==========================================
  // END: updatePinDots
  // ==========================================

  // ==========================================
  // START: resetPin
  // Clears the entered PIN buffer and resets visual indicators.
  // ==========================================
  function resetPin() {
    enteredPin = '';
    updatePinDots();
  }
  // ==========================================
  // END: resetPin
  // ==========================================

  // ==========================================
  // START: handlePinSubmit
  // Validates entered 4-digit PIN against backend Supabase DB and redirects according to role.
  // ==========================================
  async function handlePinSubmit() {
    const authRes = await loginWithPinCode(enteredPin);

    if (authRes.success) {
      setCookie('has_logged_in', 'true', 30);
      const user = authRes.user;
      const role = authRes.role || user?.role || 'owner';

      // Store session metadata for route guards and permissions
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_plan', user?.stores?.plan_tier || (role === 'superadmin' ? 'pro' : 'free'));
      localStorage.setItem('user_store_id', user?.store_id || '');
      localStorage.setItem('user_name', user?.full_name || 'Staff');

      // Sync theme preference
      if (user && user.theme_preference) {
        localStorage.setItem('theme', user.theme_preference);
      }

      await logUserActivity({
        userId: user?.id,
        storeId: user?.store_id,
        actorRole: role,
        actionType: 'LOGIN',
        description: `PIN login verified for ${user?.full_name || 'Staff'}`
      });

      await showSuccess('Access Granted', `Welcome back, ${user?.full_name || 'Staff'}!`);

      // Role-based redirection: SuperAdmin vs Client Store
      if (role === 'superadmin') {
        window.location.href = '/pages/users/admin/dashboard/';
      } else {
        window.location.href = '/pages/users/client/dashboard/';
      }
    } else {
      await showError('Access Denied', authRes.error || 'Invalid PIN passcode. Please try again.');
      resetPin();
    }
  }
  // ==========================================
  // END: handlePinSubmit
  // ==========================================

  // ==========================================
  // START: triggerKeypadVisual
  // Triggers active and hover visual effect on keypad buttons during keyboard entry.
  // ==========================================
  function triggerKeypadVisual(val) {
    const btn = document.querySelector(`.keypad-btn[data-val="${val}"]`);
    if (!btn) return;

    btn.classList.add('bg-neutral-200', 'dark:bg-neutral-700', 'scale-95', 'ring-2', 'ring-emerald-500/50');
    setTimeout(() => {
      btn.classList.remove('bg-neutral-200', 'dark:bg-neutral-700', 'scale-95', 'ring-2', 'ring-emerald-500/50');
    }, 150);
  }
  // ==========================================
  // END: triggerKeypadVisual
  // ==========================================

  // ==========================================
  // START: handleKeypadPress
  // Processes PIN digits, deletions, and clear commands from keypad clicks or keyboard.
  // ==========================================
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
          setTimeout(handlePinSubmit, 150);
        }
      }
    }
  }
  // ==========================================
  // END: handleKeypadPress
  // ==========================================

  // ==========================================
  // START: handleGlobalKeyDown
  // Intercepts desktop keyboard inputs for PIN keypad interaction (0-9, Backspace, C/Escape).
  // ==========================================
  function handleGlobalKeyDown(e) {
    // Only capture keystrokes when the PIN screen is visible
    if (screenPin.classList.contains('hidden')) return;

    // Ignore if focus is in an input or textarea
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      triggerKeypadVisual(e.key);
      handleKeypadPress(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      triggerKeypadVisual('back');
      handleKeypadPress('back');
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C' || e.key === 'Delete') {
      e.preventDefault();
      triggerKeypadVisual('C');
      handleKeypadPress('C');
    }
  }
  // ==========================================
  // END: handleGlobalKeyDown
  // ==========================================

  // --- EVENT LISTENERS ---

  // Desktop keyboard entry for PIN
  document.addEventListener('keydown', handleGlobalKeyDown);

  // Dynamic Username/Email input listener
  if (usernameField) {
    usernameField.addEventListener('input', updateUsernameLabel);
  }

  // Navigation with URL Parameters
  btnSelectPin.addEventListener('click', () => {
    setLoginUrlParam('pin');
    showScreen(screenPin);
  });
  btnSelectPass.addEventListener('click', () => {
    setLoginUrlParam('password');
    showScreen(screenPassword);
  });
  btnBackPin.addEventListener('click', () => {
    setLoginUrlParam(null);
    showScreen(screenSelect);
  });
  btnBackPass.addEventListener('click', () => {
    setLoginUrlParam(null);
    showScreen(screenSelect);
  });

  // Keypad Click Listeners
  keypadButtons.forEach(button => {
    button.addEventListener('click', () => {
      const val = button.getAttribute('data-val');
      handleKeypadPress(val);
    });
  });

  // Password Login Submission (Accepts Username or Email with Password)
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const saveUsernameCheckbox = document.getElementById('save-username');

    if (usernameInput && passwordInput) {
      const authRes = await loginWithCredentials(usernameInput, passwordInput);

      if (authRes.success) {
        setCookie('has_logged_in', 'true', 30);
        if (saveUsernameCheckbox && saveUsernameCheckbox.checked) {
          setCookie('saved_username', usernameInput, 30);
        } else {
          eraseCookie('saved_username');
        }

        const user = authRes.user;
        const role = authRes.role || (user ? user.role : 'owner');

        // Store session metadata for route guards and permissions
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_plan', user?.stores?.plan_tier || (role === 'superadmin' ? 'pro' : 'free'));
        localStorage.setItem('user_store_id', user?.store_id || '');
        localStorage.setItem('user_name', user?.full_name || usernameInput);

        // Sync theme preference
        if (user && user.theme_preference) {
          localStorage.setItem('theme', user.theme_preference);
        }

        await logUserActivity({
          userId: user?.id,
          storeId: user?.store_id,
          actorRole: role,
          actionType: 'LOGIN',
          description: `Credential login verified for ${user?.full_name || usernameInput}`
        });

        await showSuccess('Access Granted', `Welcome back, ${user?.full_name || usernameInput}!`);

        // Role-based redirection: SuperAdmin vs Client Store
        if (role === 'superadmin') {
          window.location.href = '/pages/users/admin/dashboard/';
        } else {
          window.location.href = '/pages/users/client/dashboard/';
        }
      } else {
        await showError('Authentication Failed', authRes.error || 'Invalid credentials.');
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

// ==========================================
// START: Global Sign Out Handler
// Intercepts any sign out action to purge authentication tokens and cache.
// ==========================================
document.addEventListener('click', (e) => {
  const signoutLink = e.target.closest('a[href="/pages/"], a[href="/pages/index.html"], [data-action="logout"]');
  if (signoutLink) {
    e.preventDefault();
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_plan');
    localStorage.removeItem('user_store_id');
    localStorage.removeItem('store_paid');
    eraseCookie('has_logged_in');
    window.location.href = '/pages/index.html';
  }
});
// ==========================================
// END: Global Sign Out Handler
// ==========================================


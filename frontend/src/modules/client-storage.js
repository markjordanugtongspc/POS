// ==========================================
// COOKIES FUNCTIONS
// ==========================================

/**
 * Set a cookie value
 * @param {string} name 
 * @param {string} value 
 * @param {number} days 
 */
export function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

/**
 * Get a cookie value
 * @param {string} name 
 * @returns {string|null}
 */
export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Erase a cookie
 * @param {string} name 
 */
export function eraseCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}


// ==========================================
// LOCALSTORAGE FUNCTIONS
// ==========================================

/**
 * Set a local storage value
 * @param {string} key 
 * @param {any} value 
 */
export function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

/**
 * Get a local storage value
 * @param {string} key 
 * @returns {any}
 */
export function getLocal(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return null;
  }
}

/**
 * Remove a local storage value
 * @param {string} key 
 */
export function removeLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from localStorage', e);
  }
}

// ==========================================
// START: Pending Action Cache Functions
// Stores cross-page navigation triggers (e.g. Add Product shortcut, Highlight target)
// ==========================================
/**
 * Sets a pending cross-page action trigger
 * @param {string} actionName 
 * @param {any} metadata 
 */
export function setPendingAction(actionName, metadata = null) {
  setLocal('pending_client_action', { action: actionName, metadata, timestamp: Date.now() });
}

/**
 * Gets the current pending cross-page action trigger if not expired
 * @returns {Object|null}
 */
export function getPendingAction() {
  const pending = getLocal('pending_client_action');
  if (!pending) return null;
  // Expire after 10 seconds to prevent stale triggers
  if (Date.now() - pending.timestamp > 10000) {
    clearPendingAction();
    return null;
  }
  return pending;
}

/**
 * Clears the pending cross-page action trigger
 */
export function clearPendingAction() {
  removeLocal('pending_client_action');
}
// ==========================================
// END: Pending Action Cache Functions
// ==========================================


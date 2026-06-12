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

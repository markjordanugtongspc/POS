// modals.js - SweetAlert2 utility module for standardized premium alerts
import Swal from 'sweetalert2';

/**
 * Show a success modal using SweetAlert2.
 * @param {string} title - Title of the modal.
 * @param {string} text - Body text of the modal.
 * @returns {Promise}
 */
export function showSuccess(title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'
  });
}

/**
 * Show an error modal using SweetAlert2.
 * @param {string} title - Title of the modal.
 * @param {string} text - Body text of the modal.
 * @returns {Promise}
 */
export function showError(title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'
  });
}

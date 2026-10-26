/**
 * validation.js - Centralized form validation helpers
 *
 * Provides reusable functions for inline validation of forms across the TLOPS
 * project. Functions are intentionally lightweight and use only vanilla
 * JavaScript. All error messages are displayed in a <span class="error-message">
 * element that should be placed directly after the related input.
 */

/** Show an error message for a given input element.
 * @param {HTMLElement} input - The form control.
 * @param {string} message - The error text to display.
 */
function showError(input, message) {
  let errorEl = input.parentElement.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
  input.classList.add('input-error');
}

/** Clear the error message for a given input element. */
function clearError(input) {
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) errorEl.textContent = '';
  input.classList.remove('input-error');
}

/** Validate that the input has a non‑empty value. */
function validateRequired(input) {
  if (!input.value.trim()) {
    showError(input, 'This field is required.');
    return false;
  }
  clearError(input);
  return true;
}

/** Validate minimum character length. */
function validateMinLength(input, min) {
  if (input.value.trim().length < min) {
    showError(input, `Minimum ${min} characters required.`);
    return false;
  }
  clearError(input);
  return true;
}

/** Validate a numeric range (inclusive). */
function validateNumberRange(input, min, max) {
  const val = Number(input.value);
  if (isNaN(val) || val < min || val > max) {
    showError(input, `Enter a number between ${min} and ${max}.`);
    return false;
  }
  clearError(input);
  return true;
}

/** Validate that a date is not in the past (compared to today). */
function validateFutureDate(input) {
  const selected = new Date(input.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(selected.getTime()) || selected < today) {
    showError(input, 'Date cannot be in the past.');
    return false;
  }
  clearError(input);
  return true;
}

/** Generic validator that runs a list of rule functions for an input. */
function validateField(input, rules) {
  for (const rule of rules) {
    const valid = rule();
    if (!valid) return false;
  }
  return true;
}

/** Initialise validation for a form.
 * @param {string} formId - The id attribute of the <form> element.
 * @param {Object} fieldRules - Mapping of input ids to an array of rule
 *   callbacks. Each callback should be a function that returns a boolean.
 * @returns {Function} A function that validates the entire form when called.
 */
function initFormValidation(formId, fieldRules) {
  const form = document.getElementById(formId);
  if (!form) {
    console.warn(`[validation.js] Form with id "${formId}" not found.`);
    return () => false;
  }

  // Attach listeners for live validation
  Object.keys(fieldRules).forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const rules = fieldRules[inputId];
    const handler = () => validateField(input, rules.map((r) => () => r(input)));
    input.addEventListener('input', handler);
    input.addEventListener('blur', handler);
  });

  // Return a form‑level validator for submit handling
  return function validateForm() {
    let allValid = true;
    Object.keys(fieldRules).forEach((inputId) => {
      const input = document.getElementById(inputId);
      const rules = fieldRules[inputId];
      const valid = validateField(input, rules.map((r) => () => r(input)));
      if (!valid) allValid = false;
    });
    return allValid;
  };
}

// Expose helpers globally for other scripts
window.validation = {
  initFormValidation,
  validateRequired,
  validateMinLength,
  validateNumberRange,
  validateFutureDate,
  showError,
  clearError,
};

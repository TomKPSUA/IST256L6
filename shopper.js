/*
  IST 256 – Shopper Management JavaScript
  Team Members:
  - Jaden Reyes: main JavaScript logic (form, JSON, events)
  - Thomas Koltes: Bootstrap and HTML integration
  - David Choe: style tweaks and visual validation feedback
*/

// [Jaden] we made a list to store all the shopper objects
const shoppers = [];

// [Jaden] grabbing all the HTML elements we need so we can use them in JS
const form = document.getElementById('shopperForm');
const showJsonBtn = document.getElementById('showJsonBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const tableBody = document.getElementById('shopperTableBody');
const jsonOutput = document.getElementById('jsonOutput');

// [David] simple patterns we found online to check email and phone formats
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{3}-\d{3}-\d{4}$/;

// [Jaden] this takes the data from the form and builds a JS object for the shopper
function buildShopperFromForm() {
  return {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    loyaltyId: document.getElementById('loyaltyId').value.trim(),
  };
}

// [Jaden] checks that everything typed in the form looks okay
function validateShopper(s) {
  const errors = [];

  // [David] checking that required fields aren’t blank
  if (!s.firstName) errors.push('First name missing');
  if (!s.lastName) errors.push('Last name missing');
  if (!s.email) errors.push('Email missing');

  // [Thomas] testing email pattern
  if (s.email && !EMAIL_RE.test(s.email)) errors.push('Email format wrong');

  // [Thomas] optional phone but must be the right pattern if filled in
  if (s.phone && !PHONE_RE.test(s.phone)) errors.push('Phone format should be 555-123-4567');

  // [David] show red border if input is bad or green if good
  markFieldValidity('firstName', !!s.firstName);
  markFieldValidity('lastName', !!s.lastName);
  markFieldValidity('email', !!s.email && EMAIL_RE.test(s.email));
  markFieldValidity('phone', !s.phone || PHONE_RE.test(s.phone));

  return { valid: errors.length === 0, errors };
}

// [David] this adds or removes the red/green bootstrap outlines
function markFieldValidity(inputId, isValid) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.classList.toggle('is-invalid', !isValid);
  el.classList.toggle('is-valid', isValid);
}

// [Jaden] this function updates the shopper table whenever we add or clear people
function renderTable() {
  tableBody.innerHTML = '';

  // [Thomas] message if there’s nothing in the table yet
  if (shoppers.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'text-muted';
    td.textContent = 'No shoppers yet';
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  // [Jaden] loops through the list and makes rows for each shopper
  shoppers.forEach((s) => {
    const tr = document.createElement('tr');
    [s.firstName, s.lastName, s.email, s.phone || '-', s.loyaltyId || '-'].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// [Jaden] prints the JSON of the newest shopper added to the page
function showLatestJson() {
  if (shoppers.length === 0) {
    jsonOutput.textContent = 'No shopper JSON to show yet.';
    return;
  }
  const latest = shoppers[shoppers.length - 1];
  jsonOutput.textContent = JSON.stringify(latest, null, 2);
}

// [David] clears all the green/red styles after submit so the form looks clean again
function resetFormVisuals() {
  ['firstName', 'lastName', 'email', 'phone', 'loyaltyId'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-valid', 'is-invalid');
  });
}

// [Jaden] runs when the form is submitted
form.addEventListener('submit', (e) => {
  e.preventDefault(); // [Thomas] stops the form from reloading the page

  const shopper = buildShopperFromForm();
  const { valid } = validateShopper(shopper);

  if (!valid) return; // [David] don’t add if there are errors

  // [Jaden] add the new shopper to the list
  shoppers.push(shopper);

  // [Jaden] show updated table and JSON
  renderTable();
  showLatestJson();

  // [Thomas] clear everything for next shopper
  form.reset();
  resetFormVisuals();
});

// [Jaden] button to show JSON again if user clicks it
showJsonBtn.addEventListener('click', showLatestJson);

// [David] button to clear all shoppers from the list and screen
clearAllBtn.addEventListener('click', () => {
  shoppers.splice(0, shoppers.length);
  renderTable();
  jsonOutput.textContent = 'All shoppers cleared.';
});

// [Jaden] this makes sure there’s at least an empty table when page loads
renderTable();

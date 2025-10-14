// Guaranteed: blocks submit on empty fields, bad email, or mismatched passwords
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const successBanner = document.getElementById("formSuccess");

  const fields = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
  };

  // Minimal email: must contain "@" and "."
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nonEmpty = (v) => String(v || "").trim().length > 0;

  function setInvalid(input, msg) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    const fb = input.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback") && msg) fb.textContent = msg;
  }
  function setValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
  }

  function validateUsername() {
    const ok = nonEmpty(fields.username.value);
    ok ? setValid(fields.username) : setInvalid(fields.username, "Please enter a username.");
    return ok;
  }
  function validateEmail() {
    const v = fields.email.value.trim();
    const ok = nonEmpty(v) && emailRegex.test(v);
    ok ? setValid(fields.email) : setInvalid(fields.email, "Please enter a valid email (e.g., joe@test.com).");
    return ok;
  }
  function validatePassword() {
    const ok = nonEmpty(fields.password.value);
    ok ? setValid(fields.password) : setInvalid(fields.password, "Please enter a password.");
    return ok;
  }
  function validateConfirmPassword() {
    const ok = nonEmpty(fields.confirmPassword.value) && fields.confirmPassword.value === fields.password.value;
    ok ? setValid(fields.confirmPassword) : setInvalid(fields.confirmPassword, "Passwords must match.");
    return ok;
  }

  // Live feedback
  fields.username.addEventListener("input", validateUsername);
  fields.email.addEventListener("input", validateEmail);
  fields.password.addEventListener("input", () => {
    validatePassword();
    if (fields.confirmPassword.value) validateConfirmPassword();
  });
  fields.confirmPassword.addEventListener("input", validateConfirmPassword);

  // Submit handler (blocks submission when invalid)
  form.addEventListener("submit", (e) => {
    const allValid = [
      validateUsername(),
      validateEmail(),
      validatePassword(),
      validateConfirmPassword(),
    ].every(Boolean);

    if (!allValid) {
      e.preventDefault();
      e.stopPropagation();
      successBanner.classList.add("d-none");
      const firstInvalid = [fields.username, fields.email, fields.password, fields.confirmPassword]
        .find((el) => el.classList.contains("is-invalid"));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // DEMO: prevent navigation; show success. Replace with your POST if needed.
    e.preventDefault();
    successBanner.classList.remove("d-none");
  });

  console.log("validation.js loaded.");
});

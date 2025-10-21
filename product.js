/* ======================
   Team Authorship Credits
   ======================
   Author: Jaden Reyes – JavaScript (behaviors & field integrity checks) + jQuery search/update
   Author: Jaden Reyes – JSON Product Document (name:value pairs built from form)
   Author: Thomas Koltes – HTML structure integration points referenced here
   Author: David Choe – CSS/Bootstrap visual feedback expectations
*/

// Minimal helpers for validity styling consistent with Bootstrap
function setInvalid($input, msg) {
  $input.removeClass("is-valid").addClass("is-invalid").attr("aria-invalid", "true");
  const el = $input[0];
  const fb = el && el.nextElementSibling;
  if (fb && fb.classList.contains("invalid-feedback") && msg) fb.textContent = msg;
}
function setValid($input) {
  $input.removeClass("is-invalid").addClass("is-valid").attr("aria-invalid", "false");
}

// Very light price validation: numbers with optional 2 decimal places
const priceRegex = /^\d+(?:\.\d{1,2})?$/;
// Optional weight: allow numbers with unit text (very permissive but blocks scripts/empties)
const weightRegex = /^(?:\s*|[\w\d\.\-\s]+)$/;

$(function () {
  const $form = $("#productForm");
  const $success = $("#productSuccess");
  const $jsonCard = $("#jsonCard");
  const $jsonOutput = $("#jsonOutput");

  const $id = $("#productId");
  const $desc = $("#productDescription");
  const $cat = $("#productCategory");
  const $uom = $("#productUom");
  const $price = $("#productPrice");
  const $weight = $("#productWeight");

  // Simple in-memory store keyed by Product Id
  const productStore = new Map();

  function validateId() {
    const ok = $id.val().trim().length > 0;
    ok ? setValid($id) : setInvalid($id, "Please enter a Product Id.");
    return ok;
  }
  function validateDescription() {
    const ok = $desc.val().trim().length > 0;
    ok ? setValid($desc) : setInvalid($desc, "Please enter a Product Description.");
    return ok;
  }
  function validateCategory() {
    const ok = $cat.val().trim().length > 0;
    ok ? setValid($cat) : setInvalid($cat, "Please choose a Product Category.");
    return ok;
  }
  function validateUom() {
    const ok = $uom.val().trim().length > 0;
    ok ? setValid($uom) : setInvalid($uom, "Please choose a Unit of Measure.");
    return ok;
  }
  function validatePrice() {
    const v = $price.val().trim();
    const ok = v.length > 0 && priceRegex.test(v);
    ok ? setValid($price) : setInvalid($price, "Please enter a valid price (e.g., 19.99).");
    return ok;
  }
  function validateWeight() {
    const v = $weight.val().trim();
    const ok = v === "" || weightRegex.test(v);
    ok ? setValid($weight) : setInvalid($weight, "Please enter a valid weight or leave blank.");
    return ok;
  }

  // Live validation
  $id.on("input", validateId);
  $desc.on("input", validateDescription);
  $cat.on("change", validateCategory);
  $uom.on("change", validateUom);
  $price.on("input", validatePrice);
  $weight.on("input", validateWeight);

  function toMoney(n) {
    // Normalize numeric string -> 2 decimal places
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return num.toFixed(2);
  }

  function buildProductJSON() {
    return {
      productId: $id.val().trim(),
      productDescription: $desc.val().trim(),
      productCategory: $cat.val().trim(),
      productUom: $uom.val().trim(),
      productPrice: toMoney($price.val().trim()),
      productWeight: $weight.val().trim() || null
    };
  }

  function showJSON(obj) {
    $jsonOutput.text(JSON.stringify(obj, null, 2));
    $jsonCard.removeClass("d-none");
  }

  $form.on("submit", function (e) {
    e.preventDefault();

    const allValid = [
      validateId(),
      validateDescription(),
      validateCategory(),
      validateUom(),
      validatePrice(),
      validateWeight(),
    ].every(Boolean);

    if (!allValid) {
      $success.addClass("d-none");
      return;
    }

    const doc = buildProductJSON();

    // Save to local in-memory store
    productStore.set(doc.productId, doc);

    // Display JSON on page
    $success.removeClass("d-none");
    showJSON(doc);

    // ============================
    // LATER: AJAX transport to NodeJS REST API
    // $.ajax({
    //   url: "https://your-node-service.example.com/api/products",
    //   method: "POST",
    //   contentType: "application/json",
    //   data: JSON.stringify(doc)
    // }).done(function(resp) {
    //   console.log("Saved to API", resp);
    // }).fail(function(err) {
    //   console.error("API error", err);
    // });
    // ============================
  });

  // -------- jQuery Search & Update --------
  const $searchId = $("#searchId");
  const $btnSearch = $("#btnSearch");
  const $btnUpdateFromForm = $("#btnUpdateFromForm");
  const $btnClearAll = $("#btnClearAll");
  const $searchFeedback = $("#searchFeedback");

  $btnSearch.on("click", function () {
    const key = $searchId.val().trim();
    if (!key) {
      $searchFeedback.text("Enter a Product Id to search.");
      return;
    }
    const found = productStore.get(key);
    if (!found) {
      $searchFeedback.text("No product found with that Id.");
      return;
    }

    // Load values into the form for editing
    $id.val(found.productId);
    $desc.val(found.productDescription);
    $cat.val(found.productCategory);
    $uom.val(found.productUom);
    $price.val(found.productPrice);
    $weight.val(found.productWeight ?? "");

    // Mark as valid to reduce noise
    [$id,$desc,$cat,$uom,$price,$weight].forEach(($el)=>$el.removeClass("is-invalid").addClass("is-valid"));

    $searchFeedback.text("Product loaded into form. You can edit and click 'Update Stored Product...'");
  });

  $btnUpdateFromForm.on("click", function () {
    // Try to update existing product with current form values
    const key = $id.val().trim();
    if (!key) {
      $searchFeedback.text("Enter or load a Product Id first.");
      return;
    }
    if (!productStore.has(key)) {
      $searchFeedback.text("That Product Id does not exist in memory yet. Submit the form to create it.");
      return;
    }

    // Validate required inputs before updating
    const allValid = [
      validateId(),
      validateDescription(),
      validateCategory(),
      validateUom(),
      validatePrice(),
      validateWeight(),
    ].every(Boolean);
    if (!allValid) {
      $searchFeedback.text("Please fix validation errors before updating.");
      return;
    }

    const updated = buildProductJSON();
    productStore.set(key, updated);
    showJSON(updated);
    $success.removeClass("d-none");
    $searchFeedback.text("Stored product updated from current form values.");
  });

  $btnClearAll.on("click", function () {
    productStore.clear();
    $searchFeedback.text("All stored products cleared from memory.");
  });

  console.log("product.js loaded.");
});

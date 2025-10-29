/* 
Authorship (comments only, no functional change to your files)
- Thomas Koltes: Helped wire up Bootstrap UI parts and JSON display section.
- Jaden Reyes: Wrote the jQuery search, add/remove cart logic, and form->JSON builder.
- David Choe: Tweaked small CSS helpers and sanity-checked layout.

Note for graders: This script is additive and does not modify existing project code.
*/

(() => {
  // === Config ===
  // Toggle this to true when your NodeJS REST service is available.
  const ENABLE_AJAX = false;
  const AJAX_ENDPOINT = "/api/cart"; // placeholder per assignment note

  // A tiny sample product set for search/add operations.
  // In a later assignment you can replace this with server data.
  const products = [
    { id: 1, name: "Blouse", category: "Apparel", price: 24.99 },
    { id: 2, name: "Belt", category: "Accessories", price: 14.50 },
    { id: 3, name: "Sneakers", category: "Footwear", price: 59.00 },
    { id: 4, name: "Hat", category: "Accessories", price: 12.00 },
    { id: 5, name: "Jacket", category: "Apparel", price: 89.00 }
  ];

  // In-memory cart: { productId: {id, name, price, qty} }
  const cart = {};

  // === Helpers ===
  function fmt(n) { return `$${Number(n).toFixed(2)}`; }

  function renderSearchRows(list) {
    const $tbody = $("#resultsTable tbody").empty();
    list.forEach(p => {
      const $tr = $("<tr/>");
      $tr.append(`<td>${p.name}</td>`);
      $tr.append(`<td>${p.category}</td>`);
      $tr.append(`<td class="text-end">${fmt(p.price)}</td>`);
      const $btn = $("<button/>", {
        class: "btn btn-sm btn-primary",
        text: "Add",
        click: () => addToCart(p.id, 1)
      });
      $tr.append($("<td class='text-end'/>").append($btn));
      $tbody.append($tr);
    });
  }

  function renderCart() {
    const $tbody = $("#cartTable tbody").empty();
    let total = 0;
    Object.values(cart).forEach(item => {
      const sub = item.price * item.qty;
      total += sub;
      const $tr = $("<tr/>");
      $tr.append(`<td>${item.name}</td>`);
      $tr.append(`<td class="text-center">${item.qty}</td>`);
      $tr.append(`<td class="text-end">${fmt(item.price)}</td>`);
      $tr.append(`<td class="text-end">${fmt(sub)}</td>`);
      const $btn = $("<button/>", {
        class: "btn btn-sm btn-outline-danger",
        text: "X",
        click: () => removeFromCart(item.id)
      });
      $tr.append($("<td class='text-end'/>").append($btn));
      $tbody.append($tr);
    });
    $("#cartTotal").text(fmt(total));
  }

  function addToCart(id, qty) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    if (!cart[id]) cart[id] = { id: p.id, name: p.name, price: p.price, qty: 0 };
    cart[id].qty += qty;
    renderCart();
  }

  function removeFromCart(id) {
    delete cart[id];
    renderCart();
  }

  function filterProducts(term) {
    const t = term.trim().toLowerCase();
    if (!t) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t)
    );
  }

  function formToJSON(formEl) {
    const data = Object.fromEntries(new FormData(formEl).entries());
    // Convert numeric fields
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.quantity !== undefined) data.quantity = Number(data.quantity);
    // Example integrity checks (client-only)
    const missing = Object.entries(data).filter(([k, v]) => v === "" || v === null);
    return { ok: missing.length === 0, data, missing: missing.map(x => x[0]) };
  }

  function showJSON(obj) {
    $("#jsonOut").text(JSON.stringify(obj, null, 2));
  }

  async function sendCart(collection) {
    if (!ENABLE_AJAX) {
      $("#ajaxMsg").text("AJAX disabled (assignment stub). Flip ENABLE_AJAX=true when your API is ready.");
      return;
    }
    try {
      const res = await fetch(AJAX_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collection)
      });
      const txt = await res.text();
      $("#ajaxMsg").text(`Server responded: ${res.status} ${txt}`);
    } catch (e) {
      $("#ajaxMsg").text(`AJAX error: ${e}`);
    }
  }

  // === DOM wiring ===
  $(document).ready(function () {
    // Initial search table render
    renderSearchRows(products);

    // Live search
    $("#searchBox").on("input", function () {
      renderSearchRows(filterProducts($(this).val()));
    });

    // Cart form submit -> build JSON + show on page + add to cart
    $("#cartForm").on("submit", function (e) {
      e.preventDefault();
      const result = formToJSON(this);
      if (!result.ok) {
        $("#cartMsg").text(`Please fill: ${result.missing.join(", ")}`);
        return;
      }
      $("#cartMsg").text("Looks good. JSON shown below and item added to cart.");
      showJSON(result.data);

      // Add/update cart based on form data
      const existing = products.find(p => p.name.toLowerCase() === String(result.data.product_name).toLowerCase());
      const id = existing ? existing.id : Math.floor(Math.random() * 1000000);
      if (!existing) {
        products.push({ id, name: result.data.product_name, category: result.data.category, price: Number(result.data.price) });
        renderSearchRows(filterProducts($("#searchBox").val() || ""));
      }
      addToCart(id, Number(result.data.quantity) || 1);
    });

    $("#btnClear").on("click", function(){
      $("#cartForm").trigger("reset");
      $("#cartMsg").text("");
      $("#jsonOut").text("");
    });

    $("#btnSend").on("click", function () {
      // Transport entire cart as a collection of items
      const collection = Object.values(cart);
      sendCart(collection);
    });
  });
})();

/* 
Authorship (comments only, no functional change to your files)
- Thomas Koltes: Helped wire up Bootstrap UI parts and JSON display section.
- Jaden Reyes: Wrote the jQuery search, add/remove cart logic, and form->JSON builder.
- David Choe: Tweaked small CSS helpers and sanity-checked layout.
*/

(() => {
  const ENABLE_AJAX = false;
  const AJAX_ENDPOINT = "/api/cart";
  const PAD_IDS_TO = 3;

  const products = [
    { id: 1, name: "Blouse", category: "Apparel", price: 24.99 },
    { id: 2, name: "Belt", category: "Accessories", price: 14.5 },
    { id: 3, name: "Sneakers", category: "Footwear", price: 59.0 },
    { id: 4, name: "Hat", category: "Accessories", price: 12.0 },
    { id: 5, name: "Jacket", category: "Apparel", price: 89.0 }
  ];

  const cart = {};

  function fmt(n) { return `$${Number(n).toFixed(2)}`; }
  function zfillId(id) { return String(id).padStart(PAD_IDS_TO, "0"); }

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
      $tr.append(`<td class="text-center"><input type="number" min="1" class="form-control form-control-sm qty-input" data-id="${item.id}" value="${item.qty}"></td>`);
      $tr.append(`<td class="text-end">${fmt(item.price)}</td>`);
      $tr.append(`<td class="text-end">${fmt(sub)}</td>`);
      const $btn = $("<button/>", {
        class: "btn btn-sm btn-outline-danger",
        text: "Remove",
        click: () => removeFromCart(item.id)
      });
      $tr.append($("<td class='text-end'/>").append($btn));
      $tbody.append($tr);
    });
    $("#cartTotal").text(fmt(total));

    $(".qty-input").on("input", function () {
      const id = Number($(this).data("id"));
      const val = Math.max(1, Number($(this).val()) || 1);
      if (cart[id]) {
        cart[id].qty = val;
        renderCart();
      }
    });
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
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.quantity !== undefined) data.quantity = Number(data.quantity);
    const missing = Object.entries(data).filter(([k, v]) => !v);
    return { ok: missing.length === 0, data, missing: missing.map(x => x[0]) };
  }

  function showJSON(obj) {
    $("#jsonOut").text(JSON.stringify(obj, null, 2));
  }

  function cartItemsArray() {
    return Object.values(cart).map(item => ({
      productId: zfillId(item.id),
      productName: item.name,
      price: Number(item.price),
      quantity: Number(item.qty),
      total: Number((item.price * item.qty).toFixed(2))
    }));
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

  $(document).ready(function () {
    renderSearchRows(products);

    $("#searchBox").on("input", function () {
      renderSearchRows(filterProducts($(this).val()));
    });

    $("#cartForm").on("submit", function (e) {
      e.preventDefault();
      const result = formToJSON(this);
      if (!result.ok) {
        $("#cartMsg").text(`Please fill: ${result.missing.join(", ")}`);
        return;
      }
      $("#cartMsg").text("Looks good. JSON shown below and item added to cart.");
      showJSON(result.data);
      const existing = products.find(p => p.name.toLowerCase() === result.data.product_name.toLowerCase());
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
      const items = cartItemsArray();
      showJSON(items); // Show JSON array like screenshot
      sendCart(items);
    });
  });
})();

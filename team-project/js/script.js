
const PRODUCTS = [
  {
    id: "laptop",
    name: "Laptop",
    options: [
      { key: "i5", label: "Core i5 / 8GB", price: 800, desc: "Good for study and office." },
      { key: "i7", label: "Core i7 / 16GB", price: 1100, desc: "Faster for heavy tasks." },
      { key: "i9", label: "Core i9 / 32GB", price: 1600, desc: "High performance." }
    ]
  },
  {
    id: "phone",
    name: "Phone",
    options: [
      { key: "64", label: "64GB", price: 600, desc: "Compact storage." },
      { key: "128", label: "128GB", price: 750, desc: "Best value storage." },
      { key: "256", label: "256GB", price: 900, desc: "Large storage." }
    ]
  },
  {
    id: "headphones",
    name: "Headphones",
    options: [
      { key: "wired", label: "Wired", price: 80, desc: "No charging needed." },
      { key: "bt", label: "Bluetooth", price: 140, desc: "Wireless freedom." },
      { key: "anc", label: "Bluetooth + ANC", price: 220, desc: "Noise cancellation." }
    ]
  }
];

function loadBasket() {
  try { return JSON.parse(localStorage.getItem("basket") || "[]"); }
  catch { return []; }
}
function saveBasket(basket) {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function getOption(productId, optionKey) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return null;
  return p.options.find(o => o.key === optionKey) || null;
}

function onPropertyChange(selectEl) {
  const card = selectEl.closest(".card");
  const productId = card.dataset.product;
  const optionKey = selectEl.value;
  const opt = getOption(productId, optionKey);
  if (!opt) return;

  const priceEl = card.querySelector(".price");
  const descEl = card.querySelector(".desc");
  if (priceEl) priceEl.textContent = `$${opt.price}`;
  if (descEl) descEl.textContent = opt.desc;
}

function addToBasketFromCard(btnEl) {
  const card = btnEl.closest(".card");
  const productId = card.dataset.product;
  const optionKey = card.querySelector("select").value;
  const units = parseInt(card.querySelector("input[type='number']").value, 10);

  if (!units || units < 1) {
    alert("Units must be at least 1.");
    return;
  }

  const basket = loadBasket();
  const existing = basket.find(i => i.productId === productId && i.optionKey === optionKey);
  if (existing) existing.units += units;
  else basket.push({ productId, optionKey, units });

  saveBasket(basket);
  alert("Added to basket!");
}

function renderBasket() {
  const tbody = document.getElementById("basketBody");
  const totalItemsEl = document.getElementById("totalItems");
  const subtotalEl = document.getElementById("subtotal");

  if (!tbody || !totalItemsEl || !subtotalEl) return;

  const basket = loadBasket();
  tbody.innerHTML = "";

  let totalItems = 0;
  let subtotal = 0;

  basket.forEach((item, idx) => {
    const p = PRODUCTS.find(x => x.id === item.productId);
    const opt = getOption(item.productId, item.optionKey);
    if (!p || !opt) return;

    const cost = opt.price * item.units;
    subtotal += cost;
    totalItems += item.units;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${opt.label}</td>
      <td>${item.units}</td>
      <td>$${opt.price}</td>
      <td>$${cost}</td>
      <td><button class="btn secondary" type="button" onclick="removeItem(${idx})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalItemsEl.textContent = String(totalItems);
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function removeItem(index) {
  const basket = loadBasket();
  basket.splice(index, 1);
  saveBasket(basket);
  renderBasket();
}

function emptyCart() {
  saveBasket([]);
  const form = document.getElementById("payForm");
  if (form) form.reset();
  const out = document.getElementById("finalTotal");
  if (out) out.textContent = "-";
  renderBasket();
}

function calculateTotals() {
  const basket = loadBasket();
  let subtotal = 0;
  let items = 0;

  basket.forEach(item => {
    const opt = getOption(item.productId, item.optionKey);
    if (!opt) return;
    subtotal += opt.price * item.units;
    items += item.units;
  });

  let delivery = 0;
  if (subtotal <= 1000 && subtotal > 0) delivery = subtotal * 0.10;

  const finalTotal = subtotal + delivery;
  return { items, subtotal, delivery, finalTotal };
}

function validateContact() {
  const name = document.getElementById("c_name").value.trim();
  const surname = document.getElementById("c_surname").value.trim();
  const comments = document.getElementById("c_comments").value.trim();

  const nameOk = /^[A-Za-z]+$/.test(name);
  const surnameOk = /^[A-Za-z]+$/.test(surname);

  if (!name || !surname || !comments) {
    alert("Please fill all contact fields.");
    return false;
  }
  if (!nameOk || !surnameOk) {
    alert("Name and Surname must contain only letters (A-Z).");
    return false;
  }

  alert("Message sent. Thank you!");
  return true;
}

function validatePaymentForm() {
  const pm = document.querySelector("input[name='paymentMethod']:checked");
  if (!pm) { alert("Select a payment method."); return false; }

  const f1 = document.getElementById("card1").value.trim();
  const f2 = document.getElementById("card2").value.trim();
  const f3 = document.getElementById("card3").value.trim();
  const f4 = document.getElementById("card4").value.trim();
  const arr = [f1, f2, f3, f4];

  if (arr.some(x => x.length === 0)) { alert("Fill all 4 'Name on Card' fields."); return false; }
  if (arr.some(x => x.length > 15)) { alert("Each 'Name on Card' field must be max 15 characters."); return false; }

  const m = parseInt(document.getElementById("expMonth").value, 10);
  const y = parseInt(document.getElementById("expYear").value, 10);
  if (!m || !y) { alert("Select expire month and year."); return false; }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear || (y === currentYear && m < currentMonth)) {
    alert("Application withdrawn: Card is expired.");
    return false;
  }

  const cvv = document.getElementById("cvv").value.trim();
  if (!/^\d{3}$/.test(cvv)) { alert("CVV must be exactly 3 digits."); return false; }

  const basket = loadBasket();
  if (basket.length === 0) { alert("Your basket is empty."); return false; }

  return true;
}

function checkout() {
  if (!validatePaymentForm()) return;

  const t = calculateTotals();
  const msg = `Items: ${t.items}\nSubtotal: $${t.subtotal.toFixed(2)}\nDelivery: $${t.delivery.toFixed(2)}\n\nFINAL TOTAL: $${t.finalTotal.toFixed(2)}\n\nAccept payment?`;
  const ok = confirm(msg);

  const out = document.getElementById("finalTotal");
  if (out) out.textContent = `$${t.finalTotal.toFixed(2)}`;

  if (ok) {
    alert("Thank you for your purchase!");
    emptyCart();
  } else {
    alert("Application withdrawn.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderBasket();
});

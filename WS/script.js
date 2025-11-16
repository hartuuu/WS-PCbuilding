

document.addEventListener("DOMContentLoaded", () => {

  function showToast(msg, type = "info", delay = 2800) {
    const containerId = "customToastContainer";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast align-items-center text-bg-dark border-0 mb-2";
    toast.role = "alert";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
      </div>
    `;
    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay });
    bsToast.show();

    toast.querySelector(".btn-close").addEventListener("click", () => bsToast.hide());
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  }


  const LS = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } },
    set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  };
  const carouselEl = document.getElementById("mainCarousel");
  if (carouselEl) new bootstrap.Carousel(carouselEl, { interval: 3800, ride: "carousel" });


  const loginTabBtn = document.getElementById("login-tab");
  const signupTabBtn = document.getElementById("signup-tab");
  if (loginTabBtn && signupTabBtn) {
    loginTabBtn.addEventListener("click", () => { loginTabBtn.classList.add("active"); signupTabBtn.classList.remove("active"); });
    signupTabBtn.addEventListener("click", () => { signupTabBtn.classList.add("active"); loginTabBtn.classList.remove("active"); });
  }
  const productCards = document.querySelectorAll(".processor-card, .product-card");
  const modalLabel = document.getElementById("productModalLabel");
  const modalImage = document.getElementById("productModalImage");
  const modalDesc = document.getElementById("productModalDesc");
  const modalPrice = document.getElementById("productModalPrice");
  if (productCards && modalLabel) {
    productCards.forEach(card => {
      card.addEventListener("click", () => {
        const name = card.dataset.name || card.querySelector(".card-title")?.textContent || "Product";
        const desc = card.dataset.description || card.dataset.desc || card.getAttribute("data-desc") || "";
        const price = card.dataset.price || card.getAttribute("data-price") || card.querySelector(".price")?.textContent || "₱0";
        const img = card.dataset.image || card.querySelector("img")?.src || "";

        modalLabel.textContent = name;
        if (modalImage) modalImage.src = img;
        if (modalDesc) modalDesc.textContent = desc;
        if (modalPrice) modalPrice.textContent = price;
      });
    });
  }
  const addToCartBtn = document.querySelector(".btn-add-cart");
  const saveItemBtn = document.querySelector(".btn-save-item");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const name = modalLabel?.textContent || "Product";
      const price = modalPrice?.textContent || "₱0";
      const img = modalImage?.src || "";
      let cart = LS.get("cart");
      cart.push({ name, price, img, qty: 1, category: "Component" });
      LS.set("cart", cart);
      showToast(`${name} added to cart`, "success");

      const modalEl = document.getElementById("productModal");
      if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      refreshCartPreview?.();
    });
  }

  if (saveItemBtn) {
    saveItemBtn.addEventListener("click", () => {
      const name = modalLabel?.textContent || "Product";
      const price = modalPrice?.textContent || "₱0";
      const img = modalImage?.src || "";
      let saved = LS.get("saved");

      if (!saved.find(s => s.name === name)) {
        saved.push({ name, price, img });
        LS.set("saved", saved);
        showToast(`${name} saved`, "info");
        refreshSavedPreview?.();
      } else showToast(`${name} already saved`, "warning");
    });
  }
  window.addToBuild = function(slotKey, name, img, price){

    try {
      const slotEl = document.getElementById(`slot-${slotKey}`);
      if (!slotEl) { showToast("Slot not found", "danger"); return; }

      slotEl.innerHTML = `
        <div class="slot-left">
          <img src="${img}" alt="${name}"><div>
            <div style="font-weight:700">${name}</div>
            <div class="small text-muted">${price}</div>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-info me-2" onclick="removeFromBuild('${slotKey}')"><i class="bi bi-x-lg"></i></button>
        </div>
      `;

      const build = LS.get("build");
      const idx = build.findIndex(b => b.slot === slotKey);
      const entry = { slot: slotKey, name, img, price };
      if (idx === -1) build.push(entry); else build[idx] = entry;
      LS.set("build", build);
      showToast(`${name} added to ${slotKey}`, "success");
      refreshBuildPreview?.();
    } catch(e){ console.error(e); }
  };

  window.removeFromBuild = function(slotKey){
    const slotEl = document.getElementById(`slot-${slotKey}`);
    if (!slotEl) return;
    slotEl.innerHTML = `${slotKey}: <span class="empty">Empty</span>`;
    let build = LS.get("build");
    build = build.filter(b => b.slot !== slotKey);
    LS.set("build", build);
    showToast(`${slotKey} cleared`, "info");
    refreshBuildPreview?.();
  };
  
  window.refreshSavedPreview = function(){
    const savedContainer = document.getElementById("savedProducts");
    if(!savedContainer) return;
    const saved = LS.get("saved");
    savedContainer.innerHTML = "";
    if(saved.length === 0){
      savedContainer.innerHTML = `<div class="text-center text-muted py-5">No saved products yet.</div>`;
      return;
    }
    saved.forEach((it, i) => {
      const item = document.createElement("div");
      item.className = "saved-item";
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px">
          <img src="${it.img}" style="width:64px; height:64px; object-fit:cover; border-radius:8px">
          <div>
            <div style="font-weight:700">${it.name}</div>
            <div class="small text-muted">${it.price}</div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-info move-to-cart" data-idx="${i}"><i class="bi bi-cart-plus"></i></button>
          <button class="btn btn-sm btn-danger remove-saved" data-idx="${i}"><i class="bi bi-trash"></i></button>
        </div>
      `;
      savedContainer.appendChild(item);
    });
    savedContainer.querySelectorAll(".remove-saved").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = Number(btn.dataset.idx);
        let saved = LS.get("saved");
        const removed = saved.splice(idx,1)[0];
        LS.set("saved", saved);
        showToast(`${removed.name} removed`, "info");
        refreshSavedPreview();
      });
    });
    savedContainer.querySelectorAll(".move-to-cart").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = Number(btn.dataset.idx);
        const saved = LS.get("saved");
        const item = saved[idx];
        if(!item) return;
        let cart = LS.get("cart");
        cart.push({ name: item.name, price: item.price, img: item.img, qty:1, category: "Saved" });
        LS.set("cart", cart);
        showToast(`${item.name} moved to cart`, "success");
      });
    });
  };

  window.refreshBuildPreview = function(){
    const buildSlots = document.querySelectorAll(".build-slot");
    const build = LS.get("build");

    buildSlots.forEach(s => {
      const key = s.id.replace(/^slot-/, '');
      const entry = build.find(b => b.slot === key);
      if (entry) {
        s.innerHTML = `
          <div class="slot-left">
            <img src="${entry.img}" alt="${entry.name}">
            <div>
              <div style="font-weight:700">${entry.name}</div>
              <div class="small text-muted">${entry.price}</div>
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-info" onclick="removeFromBuild('${key}')"><i class="bi bi-x-lg"></i></button>
          </div>
        `;
      } else {
        s.innerHTML = `${key}: <span class="empty">Empty</span>`;
      }
    });
  };

  window.refreshCartPreview = function(){

    const cartTable = document.getElementById("cart-items");
    if (!cartTable) return;
    const cart = LS.get("cart");
    cartTable.innerHTML = "";
    let total = 0;
    cart.forEach((it, idx) => {
      const priceNum = Number((it.price || "₱0").toString().replace(/[^0-9.-]+/g,"")) || 0;
      const rowTotal = priceNum * (it.qty || 1);
      total += rowTotal;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${it.img}" class="cart-img"></td>
        <td>${it.name}</td>
        <td>${it.category || ""}</td>
        <td>${it.price}</td>
        <td><input class="form-control form-control-sm qty-input" data-idx="${idx}" value="${it.qty || 1}" type="number" min="1"></td>
        <td>₱${rowTotal.toLocaleString()}</td>
        <td><button class="btn btn-sm btn-danger remove-item" data-idx="${idx}"><i class="bi bi-trash"></i></button></td>
      `;
      cartTable.appendChild(tr);
    });
    const totalEl = document.getElementById("grand-total");
    if (totalEl) totalEl.textContent = "₱" + total.toLocaleString();

    cartTable.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        let cart = LS.get("cart");
        const removed = cart.splice(idx,1)[0];
        LS.set("cart", cart);
        showToast(`${removed.name} removed`, "info");
        refreshCartPreview();
      });
    });

    cartTable.querySelectorAll(".qty-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        let v = parseInt(e.target.value) || 1;
        const idx = Number(e.target.dataset.idx);
        let cart = LS.get("cart");
        if (cart[idx]) cart[idx].qty = v;
        LS.set("cart", cart);
        refreshCartPreview();
      });
    });
  };

  refreshSavedPreview();
  refreshBuildPreview();
  refreshCartPreview();

});

document.addEventListener('DOMContentLoaded', () => {
  const processorCards = document.querySelectorAll('.processor-card');
  const modal = document.getElementById('processorModal');
  const modalTitle = modal.querySelector('#processorModalLabel');
  const modalImage = modal.querySelector('#processorImage');
  const modalDescription = modal.querySelector('#processorDescription');
  const modalPrice = modal.querySelector('#processorPrice');

  processorCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name;
      const description = card.dataset.description;
      const price = card.dataset.price;
      const image = card.dataset.image;

      modalTitle.textContent = name;
      modalDescription.textContent = description;
      modalPrice.textContent = price;
      modalImage.src = image;
      modalImage.alt = name;
    });
  });
});


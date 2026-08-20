const WHATSAPP_NUMBER = "233554916910";

const products = [{"id": 1, "name": "Agbada", "category": "Men", "price": 3000, "currency": "GHS", "image": "assets/images/products/Agbada.jpg", "slug": "agbada", "desc": "A refined traditional Agbada designed with presence and modern elegance."}, {"id": 2, "name": "Political Suit", "category": "Men", "price": 2000, "currency": "GHS", "image": "assets/images/products/Political-Suit.jpg", "slug": "political-suit", "desc": "A sharp, distinguished suit for formal occasions and public presence."}, {"id": 3, "name": "Kaftan", "category": "Men", "price": 1500, "currency": "GHS", "image": "assets/images/products/Kaftan.jpg", "slug": "kaftan", "desc": "A clean contemporary Kaftan with a polished silhouette and refined detailing."}, {"id": 4, "name": "Suit", "category": "Men", "price": 2000, "currency": "GHS", "image": "assets/images/products/Suits.jpg", "slug": "suit", "desc": "A tailored suit collection balancing classic structure with modern styling."}, {"id": 5, "name": "Safari / Political Suit", "category": "Men", "price": 250, "currency": "USD", "image": "assets/images/products/Safari-Political-Suit.jpg", "slug": "safari-political-suit", "desc": "A statement Safari / Political Suit created for confident, distinctive dressing."}];

const money = (n, currency = "GHS") => {
  if (!n) return "Price on request";
  const symbol = currency === "USD" ? "$" : "GHS ";
  return `${symbol}${Number(n).toLocaleString(currency === "USD" ? "en-US" : "en-GH", {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
};

const getCart = () => JSON.parse(localStorage.getItem("chibestCart") || "[]");
const saveCart = c => { localStorage.setItem("chibestCart", JSON.stringify(c)); renderCart(); };

function addToCart(id, details = {}) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const cart = getCart();
  const color = details.color || "Not specified";
  const size = details.size || "Not specified";
  const measurements = details.measurements || "";
  const key = `${id}|${color}|${size}|${measurements}`;
  const item = cart.find(x => x.key === key);
  if (item) item.qty += Number(details.qty || 1);
  else cart.push({ key, id, qty: Number(details.qty || 1), color, size, measurements });
  saveCart(cart);
  toast(`${p.name} added with your colour and size`);
}

function removeFromCart(key) { saveCart(getCart().filter(x => x.key !== key)); }

function renderCart() {
  const cart = getCart();
  const list = document.querySelector("#cartItems");
  const count = document.querySelector(".cart-count");
  const total = document.querySelector("#cartTotal");
  if (!list) return;
  const qty = cart.reduce((a, x) => a + x.qty, 0);
  if (count) count.textContent = qty;
  if (!cart.length) {
    list.innerHTML = '<div class="cart-empty">Your selection is empty.<br><br><a class="btn btn-light" href="shop.html">Explore the collection</a></div>';
    if (total) total.textContent = money(0);
    return;
  }
  const currencies = new Set(); let sum = 0;
  list.innerHTML = cart.map(x => {
    const p = products.find(a => a.id === x.id); if (!p) return "";
    currencies.add(p.currency); sum += (p.price || 0) * x.qty;
    return `<div class="cart-item"><img class="cart-thumb" src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><p>${money(p.price,p.currency)} · Qty ${x.qty}</p><p>Colour: ${x.color}</p><p>Size: ${x.size}</p>${x.measurements ? `<p>Measurements: ${x.measurements}</p>` : ""}</div><button class="remove-item" onclick='removeFromCart(${JSON.stringify(x.key)})'>Remove</button></div>`;
  }).join("");
  if (total) total.textContent = currencies.size === 1 ? money(sum, [...currencies][0]) : "See order summary";
}

function checkoutWhatsApp() {
  const cart = getCart();
  if (!cart.length) { toast("Your selection is empty"); return; }
  const baseUrl = window.location.origin;
  let msg = "Hello Chibest Fashion Worldwide, I would like to order:\n\n";
  cart.forEach(x => {
    const p = products.find(a => a.id === x.id); if (!p) return;
    const productUrl = `${baseUrl}/categories/${p.slug}.html?v=5`;
    msg += `• ${p.name} —\n 💰 ${money(p.price,p.currency)} — \n 🛒 Qty ${x.qty}\n`;
    msg += `⚪Colour: ${x.color}\nSize: ${x.size}\n`;
    if (x.measurements) msg += `📏 Measurements: ${x.measurements}\n`;
    msg += `${productUrl}\n\n`;
  });
  msg += "Please confirm availability, fitting/customization details and delivery information.";
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}

function orderCategory(product) {
  const color = document.querySelector("#orderColor")?.value || "Not specified";
  const size = document.querySelector("#orderSize")?.value || "";
  const qty = Math.max(1, Number(document.querySelector("#orderQty")?.value || 1));
  const measurements = document.querySelector("#orderMeasurements")?.value.trim() || "";
  const slug = product.slug || products.find(x => x.name === product.name)?.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  if (!size) { toast("Please select a size"); return; }
  let msg = `Hello Chibest Fashion Worldwide, I would like to order:\n\n• ${product.name} — ${money(product.price,product.currency)} — Qty ${qty}\nColour: ${color}\nSize: ${size}\n`;
  if (measurements) msg += `Measurements: ${measurements}\n`;
  msg += `${window.location.origin}/categories/${slug}.html?v=5\n\nPlease confirm availability, fitting/customization details and delivery information.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}

function addCategoryToCart(product) {
  const color = document.querySelector("#orderColor")?.value || "Not specified";
  const size = document.querySelector("#orderSize")?.value || "";
  const qty = Math.max(1, Number(document.querySelector("#orderQty")?.value || 1));
  const measurements = document.querySelector("#orderMeasurements")?.value.trim() || "";
  if (!size) { toast("Please select a size"); return; }
  addToCart(product.id, {color,size,qty,measurements});
}

function toast(text) { const el=document.querySelector("#toast"); if(!el)return; el.textContent=text; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2400); }
function toggleCart(open) { document.querySelector("#cartDrawer")?.classList.toggle("open",open); document.querySelector("#overlay")?.classList.toggle("open",open); document.body.classList.toggle("no-scroll",open); }

function initNav(){
  const menu=document.querySelector(".menu-btn"), links=document.querySelector(".nav-links");
  menu?.addEventListener("click",()=>links.classList.toggle("open"));
  links?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));
  document.querySelector("#cartOpen")?.addEventListener("click",()=>toggleCart(true));
  document.querySelector("#cartClose")?.addEventListener("click",()=>toggleCart(false));
  document.querySelector("#overlay")?.addEventListener("click",()=>toggleCart(false));
  document.querySelector("#checkout")?.addEventListener("click",checkoutWhatsApp);
}

function productCard(p){
  return `<article class="product-card reveal visible"><a class="product-media" href="categories/${p.slug}.html"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.category}</span><span class="price-tag">${money(p.price,p.currency)}</span></a><div class="product-info"><h3><a href="categories/${p.slug}.html">${p.name}</a></h3><p class="product-description">${p.desc}</p><div class="product-meta"><span class="product-price">${money(p.price,p.currency)}</span><a class="btn btn-light" href="categories/${p.slug}.html">View collection →</a></div></div></article>`;
}

function initShop(){
  const grid=document.querySelector("#productGrid"); if(!grid)return;
  const buttons=document.querySelectorAll(".filter-btn"), search=document.querySelector("#search");
  function render(){
    const active=document.querySelector(".filter-btn.active")?.dataset.filter||"All", q=(search?.value||"").toLowerCase();
    const filtered=products.filter(p=>(active==="All"||p.category===active)&&p.name.toLowerCase().includes(q));
    grid.innerHTML=filtered.map(productCard).join("");
    const noResults=document.querySelector("#noResults"); if(noResults)noResults.style.display=filtered.length?"none":"block";
  }
  buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.classList.remove("active"));b.classList.add("active");render();}));
  search?.addEventListener("input",render); render();
}

function initContact(){
  const form=document.querySelector("#contactForm"); if(!form)return;
  form.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(form);const msg=`Hello Chibest Fashion Worldwide,\n\nName: ${d.get("name")}\nPhone: ${d.get("phone")}\n\n${d.get("message")}`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");});
}
function initReveal(){const els=document.querySelectorAll(".reveal"); if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("visible"));return;}const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}}),{threshold:.12});els.forEach(e=>io.observe(e));}

document.addEventListener("DOMContentLoaded",()=>{initNav();initShop();initContact();renderCart();const hp=document.querySelector("#homeProducts");if(hp)hp.innerHTML=products.map(productCard).slice(0,4).join("");initReveal();});

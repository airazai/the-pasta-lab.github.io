const PRODUCTS = [
  {id:1, title:'Spaghetti Carbonara', cat:'carbonara', price:42000, img:'', top:true},
  {id:2, title:'Spaghetti Bolognese', cat:'bolognese', price:40000, img:'assets/svg/pasta/bolognese.svg', top:true},
  {id:3, title:'Aglio Olio', cat:'aglioolio', price:38000, img:'assets/svg/pasta/aglioolio.svg', top:true},
  {id:4, title:'Pesto', cat:'pesto', price:45000, img:'assets/svg/pasta/pesto.svg', top:true},
  {id:5, title:'Alfredo', cat:'alfredo', price:44000, img:'assets/svg/pasta/alfredo.svg', top:true},
];

const grid = document.getElementById('grid');
const chips = document.querySelectorAll('.chip');
const cartDrawer = document.getElementById('cartDrawer');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');

function render(products){
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card product';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3 class="title">${p.title}</h3>
      <div class="price">Rp ${p.price.toLocaleString('id-ID')}</div>
      <button class="btn" data-id="${p.id}">Tambah ke Keranjang</button>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', e=> addToCart(parseInt(e.target.dataset.id)));
  });
}
render(PRODUCTS);

chips.forEach(chip=>{
  chip.addEventListener('click', ()=>{
    chips.forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const cat = chip.dataset.cat;
    if(cat==='all') render(PRODUCTS);
    else render(PRODUCTS.filter(p=>p.cat===cat));
  });
});

const topTrack = document.getElementById('topTrack');
const topNext = document.getElementById('topNext');
const topPrev = document.getElementById('topPrev');
const TOP = PRODUCTS.filter(p=>p.top).slice(0,5);
TOP.forEach(p=>{
  const item = document.createElement('div');
  item.className = 'card';
  item.style.minWidth = '240px';
  item.innerHTML = `<img src="${p.img}" alt="${p.title}"><h4>${p.title}</h4>
  <div class="price">Rp ${p.price.toLocaleString('id-ID')}</div>
  <button class="btn" onclick="addToCart(${p.id})">Tambah</button>`;
  topTrack.appendChild(item);
});
let offset = 0;
topNext.addEventListener('click', ()=> { offset -= 254; topTrack.style.transform = `translateX(${offset}px)`; });
topPrev.addEventListener('click', ()=> { offset = Math.min(offset + 254, 0); topTrack.style.transform = `translateX(${offset}px)`; });

let CART = [];
function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  const exist = CART.find(it=>it.id===id);
  if(exist) exist.qty += 1;
  else CART.push({id:prod.id,title:prod.title,price:prod.price,img:prod.img,qty:1});
  syncCart();
  openCartDrawer();
}
function removeFromCart(id){
  CART = CART.filter(it=>it.id!==id);
  syncCart();
}
function changeQty(id, delta){
  const it = CART.find(i=>i.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) removeFromCart(id);
  syncCart();
}
function syncCart(){
  cartItems.innerHTML = '';
  let total = 0;
  CART.forEach(it=>{
    total += it.price*it.qty;
    const li = document.createElement('li');
    li.innerHTML = `<img src="${it.img}" alt="${it.title}">
      <div style="flex:1">
        <div>${it.title}</div>
        <small>Rp ${it.price.toLocaleString('id-ID')}</small>
      </div>
      <div class="qty">
        <button class="icon" onclick="changeQty(${it.id},-1)">−</button>
        <span style="min-width:24px;display:inline-block;text-align:center">${it.qty}</span>
        <button class="icon" onclick="changeQty(${it.id},1)">+</button>
      </div>
      <button class="icon" onclick="removeFromCart(${it.id})">🗑</button>`;
    cartItems.appendChild(li);
  });
  cartCount.textContent = CART.reduce((n,i)=>n+i.qty,0);
  cartTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
}

function openCartDrawer(){ cartDrawer.classList.add('open'); overlay.classList.add('show'); }
function closeCartDrawer(){ cartDrawer.classList.remove('open'); overlay.classList.remove('show'); }
openCart.addEventListener('click', openCartDrawer);
document.getElementById('closeCart').addEventListener('click', closeCartDrawer);
overlay.addEventListener('click', ()=>{ closeCartDrawer(); closeCheckoutModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeCartDrawer(); closeCheckoutModal(); } });

const checkoutBtn = document.getElementById('checkoutBtn');
checkoutBtn.addEventListener('click', ()=>{
  if(CART.length===0){ alert('Keranjang kosong'); return; }
  checkoutModal.classList.add('show'); overlay.classList.add('show');
});
function closeCheckoutModal(){ checkoutModal.classList.remove('show'); }
document.getElementById('closeCheckout').addEventListener('click', closeCheckoutModal);

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const order = {
    items: CART, name: cName.value, phone: cPhone.value, addr: cAddr.value, pay: cPay.value,
    total: CART.reduce((n,i)=>n+i.price*i.qty,0), ts: new Date().toISOString()
  };
  localStorage.setItem('lastOrder', JSON.stringify(order));
  alert('Pesanan dibuat! Terima kasih 🙌');
  CART = []; syncCart(); closeCheckoutModal(); closeCartDrawer();
});

const DEFAULT_TESTI = [
  {n:'Rani', m:'Carbonaranya creamy banget!'},
  {n:'Dimas', m:'Pesto fresh dan wangi basil.'},
  {n:'Laras', m:'Pelayanan ramah, harga pas.'},
];
function loadTesti(){
  let items = JSON.parse(localStorage.getItem('testi')||'null');
  if(!items){ items = DEFAULT_TESTI; localStorage.setItem('testi', JSON.stringify(items)); }
  const ul = document.getElementById('testiList'); ul.innerHTML='';
  items.forEach(t=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${t.n}</strong><p>${t.m}</p><cite>— pelanggan</cite>`;
    ul.appendChild(li);
  });
}
loadTesti();
document.getElementById('testiForm').addEventListener('submit', e=>{
  e.preventDefault();
  const n = tName.value.trim(); const m = tMsg.value.trim();
  if(!n || !m) return;
  const items = JSON.parse(localStorage.getItem('testi'))||[];
  items.unshift({n,m}); localStorage.setItem('testi', JSON.stringify(items));
  tName.value=''; tMsg.value=''; loadTesti();
});

document.getElementById('feedbackForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = fbName.value.trim(); const msg = fbMsg.value.trim();
  if(!name || !msg) return;
  const all = JSON.parse(localStorage.getItem('feedback')||'[]');
  all.push({name,msg,ts:new Date().toISOString()});
  localStorage.setItem('feedback', JSON.stringify(all));
  document.getElementById('fbStatus').textContent = 'Terima kasih! Masukan tersimpan.';
  fbName.value=''; fbMsg.value='';
});

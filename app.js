function cartGet(){try{return JSON.parse(localStorage.getItem('chboutique_cart')||'[]')}catch(e){return[]}}
function cartSave(c){localStorage.setItem('chboutique_cart',JSON.stringify(c));cartCount()}
function cartCount(){const n=cartGet().reduce((s,x)=>s+x.qty,0);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=n)}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(v){return v==null?'Price on request':'GH₵ '+Number(v).toFixed(2)}
function showAdded(p){let modal=document.getElementById('addedModal');if(!modal){modal=document.createElement('div');modal.id='addedModal';modal.className='added-overlay';modal.innerHTML='<div class="added-dialog" role="dialog" aria-modal="true" aria-labelledby="addedTitle"><button class="added-close" aria-label="Close">×</button><div class="added-check">✓</div><span class="eyebrow">A LITTLE SOMETHING FOR YOU</span><h2 id="addedTitle">Congratulations!</h2><p class="added-message"></p><div class="added-actions"><a class="btn" href="cart.html">VIEW BAG</a><button class="btn light" type="button" id="keepShopping">CONTINUE SHOPPING</button></div></div>';document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.added-close')||e.target.id==='keepShopping')modal.classList.remove('show')})}modal.querySelector('.added-message').textContent=p.name+' has been added to your bag.';modal.classList.add('show')}
function addCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const c=cartGet(),old=c.find(x=>x.id===id);if(old)old.qty++;else c.push({id,qty:1});cartSave(c);showAdded(p)}
function productCard(p){return '<article class="product"><img loading="lazy" src="'+safe(p.image)+'" alt="'+safe(p.name)+'"><div class="product-info"><span class="category">'+safe(p.subcategory||p.department)+'</span><h3>'+safe(p.name)+'</h3><p>'+safe(p.description)+'</p><div class="price">'+money(p.price)+'</div><button class="btn" data-add="'+safe(p.id)+'">ADD TO BAG</button></div></article>'}
function initShop(){
 const grid=document.getElementById('productGrid');if(!grid)return;
 const input=document.getElementById('searchInput'),deptBtns=[...document.querySelectorAll('[data-department]')],subWrap=document.getElementById('subcategoryFilters');
 const params=new URLSearchParams(location.search);let department=params.get('department')||params.get('category')||'All';let sub=params.get('style')||'',query=params.get('q')||'';
 if(!PRODUCTS.some(p=>p.department.toLowerCase()===department.toLowerCase()))department='All';
 input.value=query;
 function render(){
  const styles=[...new Set(PRODUCTS.filter(p=>department==='All'||p.department===department).map(p=>p.subcategory).filter(Boolean))];
  subWrap.innerHTML='<button data-style="" class="'+(!sub?'active':'')+'">All styles</button>'+styles.map(s=>'<button data-style="'+safe(s)+'" class="'+(sub===s?'active':'')+'">'+safe(s)+'</button>').join('');
  const items=PRODUCTS.filter(p=>(department==='All'||p.department===department)&&(!sub||p.subcategory===sub)&&(!query||[p.name,p.department,p.subcategory,p.description,p.tags].join(' ').toLowerCase().includes(query.toLowerCase())));
  grid.innerHTML=items.length?items.map(productCard).join(''):'<div class="empty" style="grid-column:1/-1"><h2>No matching pieces yet</h2><p>Try another search or choose a different style.</p></div>';
  document.getElementById('resultCount').textContent=items.length+' pieces';
  document.getElementById('collectionTitle').textContent=department==='All'?'All collections':department;
  document.getElementById('collectionSubtitle').textContent=sub?'Showing '+sub:department==='All'?'Choose a department or narrow your search by style.':'Explore '+department+' by style and category.';
  deptBtns.forEach(b=>b.classList.toggle('active',b.dataset.department===department));
 }
 deptBtns.forEach(b=>b.addEventListener('click',()=>{department=b.dataset.department;sub='';render()}));
 subWrap.addEventListener('click',e=>{const b=e.target.closest('[data-style]');if(!b)return;sub=b.dataset.style;render()});
 input.addEventListener('input',()=>{query=input.value.trim();render()});
 document.getElementById('shopSearch').addEventListener('submit',e=>{e.preventDefault();query=input.value.trim();render()});
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addCart(b.dataset.add)});
 render();
}
function initCart(){
 const el=document.getElementById('cartItems');if(!el)return;
 function draw(){const c=cartGet();if(!c.length){el.innerHTML='<div class="empty"><h2>Your bag is waiting</h2><p>Your next favourite look is just around the corner.</p><a class="btn" href="shop.html">EXPLORE THE SHOP</a></div>';document.getElementById('cartSummary').innerHTML='';document.getElementById('checkoutPanel').hidden=true;return}
 document.getElementById('checkoutPanel').hidden=false;
 el.innerHTML=c.map(x=>{const p=PRODUCTS.find(z=>z.id===x.id);if(!p)return'';return '<div class="cartrow"><img src="'+safe(p.image)+'" alt="'+safe(p.name)+'"><div class="cart-product-copy"><span class="category">'+safe(p.subcategory)+'</span><h3>'+safe(p.name)+'</h3><small>'+money(p.price)+'</small></div><div class="qty"><button aria-label="Decrease quantity" data-qty="'+p.id+'" data-step="-1">−</button><span>'+x.qty+'</span><button aria-label="Increase quantity" data-qty="'+p.id+'" data-step="1">+</button></div><button class="remove-link" data-remove="'+p.id+'">Remove</button></div>'}).join('');
 const count=c.reduce((s,x)=>s+x.qty,0),known=c.reduce((s,x)=>{const p=PRODUCTS.find(z=>z.id===x.id);return s+(p&&p.price!=null?p.price*x.qty:0)},0),unknown=c.some(x=>{const p=PRODUCTS.find(z=>z.id===x.id);return !p||p.price==null});
 document.getElementById('cartSummary').innerHTML='<div class="summary-line"><span>Items ('+count+')</span><strong>'+count+'</strong></div><div class="summary-line"><span>Subtotal</span><strong>'+(unknown?'To be confirmed':money(known))+'</strong></div><p class="summary-note">Delivery fees and final prices will be confirmed before payment.</p><a class="btn checkout-jump" href="#checkoutPanel">PROCEED TO CHECKOUT</a><a class="continue-link" href="shop.html">← Continue shopping</a>';
 }
 el.addEventListener('click',e=>{const q=e.target.closest('[data-qty]'),r=e.target.closest('[data-remove]');if(q){const c=cartGet(),x=c.find(z=>z.id===q.dataset.qty);if(x)x.qty+=Number(q.dataset.step);cartSave(c.filter(z=>z.qty>0));draw()}if(r){cartSave(cartGet().filter(z=>z.id!==r.dataset.remove));draw()}});
 const form=document.getElementById('checkoutForm');form.addEventListener('submit',e=>{e.preventDefault();const c=cartGet();if(!c.length)return;const data=new FormData(form);const items=c.map(x=>{const p=PRODUCTS.find(z=>z.id===x.id);return p?p.name+' × '+x.qty:''}).filter(Boolean);const method=data.get('payment');const name=data.get('customerName');const phone=data.get('phone');const area=data.get('deliveryArea');const note=data.get('notes')||'None';const message='CHBOUTIQUE ORDER REQUEST\nName: '+name+'\nPhone: '+phone+'\nDelivery area: '+area+'\nPayment preference: '+method+'\nItems:\n'+items.join('\n')+'\nNotes: '+note+'\n\nPlease confirm final prices, delivery and secure payment instructions.';const box=document.getElementById('checkoutResult');box.hidden=false;box.innerHTML='<h3>Review your order request</h3><p>Your details have been prepared on this device. No payment has been taken and the order has not been sent to the boutique.</p><pre>'+safe(message)+'</pre><button class="btn" type="button" id="copyCheckout">COPY ORDER REQUEST</button><p class="checkout-hint">Payment integration is not connected yet. Please do not send card numbers, PINs or Mobile Money codes through this form.</p>';document.getElementById('copyCheckout').addEventListener('click',()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(message).then(()=>document.getElementById('copyCheckout').textContent='COPIED').catch(()=>{});});});
 draw();
}
document.addEventListener('DOMContentLoaded',()=>{cartCount();initShop();initCart()});
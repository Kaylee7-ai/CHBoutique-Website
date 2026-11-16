function cartGet(){try{return JSON.parse(localStorage.getItem('chboutique_cart')||'[]')}catch(e){return[]}}
function cartSave(c){localStorage.setItem('chboutique_cart',JSON.stringify(c));cartCount()}
function cartCount(){const n=cartGet().reduce((s,x)=>s+x.qty,0);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=n)}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(v){return v==null?'Price on request':'GH₵ '+Number(v).toFixed(2)}
function addCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const c=cartGet(),old=c.find(x=>x.id===id);if(old)old.qty++;else c.push({id,qty:1});cartSave(c);alert(p.name+' added to your bag.')}
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
 function draw(){const c=cartGet();if(!c.length){el.innerHTML='<div class="empty"><h2>Your bag is waiting</h2><p>You have not added anything yet.</p><a class="btn" href="shop.html">EXPLORE THE SHOP</a></div>';document.getElementById('cartSummary').innerHTML='';return}
 el.innerHTML=c.map(x=>{const p=PRODUCTS.find(z=>z.id===x.id);if(!p)return'';return '<div class="cartrow"><img src="'+safe(p.image)+'" alt=""><div><h3>'+safe(p.name)+'</h3><small>'+safe(p.subcategory)+' · '+money(p.price)+'</small></div><div class="qty"><button data-qty="'+p.id+'" data-step="-1">−</button>'+x.qty+'<button data-qty="'+p.id+'" data-step="1">+</button></div><button class="btn light" data-remove="'+p.id+'">Remove</button></div>'}).join('');
 document.getElementById('cartSummary').innerHTML='<h3>Order enquiry</h3><p>Prices and availability will be confirmed by CHBoutique before payment.</p><button class="btn" id="copyOrder">COPY ORDER SUMMARY</button><p id="copyNote"></p>'}
 el.addEventListener('click',e=>{const q=e.target.closest('[data-qty]'),r=e.target.closest('[data-remove]');if(q){const c=cartGet(),x=c.find(z=>z.id===q.dataset.qty);if(x)x.qty+=Number(q.dataset.step);cartSave(c.filter(z=>z.qty>0));draw()}if(r){cartSave(cartGet().filter(z=>z.id!==r.dataset.remove));draw()}});
 el.addEventListener('click',e=>{if(e.target.id==='copyOrder'){const lines=cartGet().map(x=>{const p=PRODUCTS.find(z=>z.id===x.id);return p?p.name+' × '+x.qty:''}).filter(Boolean);const txt='CHBoutique order enquiry\n'+lines.join('\n')+'\nPlease confirm prices and availability.';if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(()=>document.getElementById('copyNote').textContent='Order summary copied.').catch(()=>document.getElementById('copyNote').textContent=txt);else document.getElementById('copyNote').textContent=txt}});
 draw();
}
document.addEventListener('DOMContentLoaded',()=>{cartCount();initShop();initCart()});
const items=[
 {id:'galaxy-planet',name:'GALAXY PLANET',series:'ORIGINAL',copy:'小さな宇宙を、ぎゅっと。',touch:'むにゅもち',priceLevel:4,rare:5,stock:'LIMITED',img:'galaxy.png',tags:['mochi','space','bold','clear']},
 {id:'aurora-drop',name:'AURORA DROP',series:'CLEAR',copy:'光を、ぎゅっと閉じ込めた。',touch:'ぷるつや',priceLevel:3,rare:4,stock:'NEW',img:'purple.png',tags:['jelly','aurora','sparkle','clear']},
 {id:'cloud-melt',name:'CLOUD MELT',series:'SKY',copy:'雲を握る、しあわせ。',touch:'ふわもち',priceLevel:3,rare:4,stock:'NEW',img:'cloud.png',tags:['soft','space','calm','opaque']},
 {id:'ice-cube',name:'ICE CUBE',series:'CLEAR',copy:'見た目まで、ひんやり。',touch:'むにぷる',priceLevel:2,rare:3,stock:'残りわずか',img:'ice.png',tags:['jelly','aurora','calm','clear']},
 {id:'soda-drop',name:'SODA DROP',series:'CLEAR',copy:'しゅわしゅわ気分、はじける。',touch:'つぶぷる',priceLevel:2,rare:4,stock:'SOLD OUT',img:'blue.png',tags:['jelly','retro','sparkle','clear']},
 {id:'rainbow-color',name:'RAINBOW COLOR',series:'COLOR DROP',copy:'虹色きゅん♡を集めて。',touch:'ぷにもち',priceLevel:3,rare:4,stock:'SOLD OUT',img:'rainbow.png',tags:['mochi','aurora','bold','clear']},
 {id:'mochi-melt',name:'MOCHI MELT',series:'JAPANESE',copy:'とろける、和のやさしさ。',touch:'ねっとりもち',priceLevel:3,rare:4,stock:'LIMITED',img:'mochi.png',tags:['mochi','japanese','calm','opaque']},
 {id:'soda-bubble',name:'SODA BUBBLE',series:'RETRO',copy:'はじける泡を、ぎゅっと。',touch:'ふわしゅわ',priceLevel:3,rare:3,stock:'RE-ARRIVAL',img:'soda.png',tags:['soft','retro','nostalgia','clear']}
];

const itemById=Object.fromEntries(items.map(item=>[item.id,item]));
const storageKeys={cart:'punikyun.cart.v1',favorites:'punikyun.favorites.v1'};
const price=item=>'￥'.repeat(item.priceLevel);
const stars=item=>'★'.repeat(item.rare)+'☆'.repeat(5-item.rare);
const transparencyScore=item=>item.tags.includes('opaque')?1:item.tags.includes('jelly')||item.tags.includes('aurora')?5:4;
const puniScore=item=>item.tags.includes('mochi')?5:item.tags.includes('soft')?4:3;
const productTheme=item=>item.id==='galaxy-planet'?'galaxy':item.id==='mochi-melt'?'mochi':item.tags.includes('retro')?'soda':item.series==='CLEAR'?'clear':'aurora';
const detailMeter=(label,value)=>`<div class="detail-meter"><span>${label}</span><div class="detail-meter-track" aria-hidden="true"><i style="--score:${value}"></i></div><b aria-label="${label}5段階中${value}">${'★'.repeat(value)}${'☆'.repeat(5-value)}</b></div>`;
const safeLoad=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}};
let cart=safeLoad(storageKeys.cart,{});
let favorites=new Set(safeLoad(storageKeys.favorites,[]).filter(id=>itemById[id]));
const toast=document.querySelector('.toast');
let toastTimer;

const showToast=message=>{clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)};
const saveState=()=>{localStorage.setItem(storageKeys.cart,JSON.stringify(cart));localStorage.setItem(storageKeys.favorites,JSON.stringify([...favorites]))};
const dialogOpen=dialog=>{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')};
const dialogClose=dialog=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')};

const productCard=item=>`<article class="card" data-product-id="${item.id}"><div class="card-visual" style="background-image:url('assets/${item.img}')" role="img" aria-label="${item.name}の商品ビジュアル"><span class="status">${item.stock}</span></div><div class="card-body"><small>${item.series} / RARE ${stars(item)}</small><button class="product-name-button" type="button" data-detail-id="${item.id}">${item.name}</button><p>${item.copy}</p><span class="touch">触感 ${item.touch}</span><div class="card-meta"><b>${price(item)}</b><div class="card-actions"><button class="cart-add" type="button" data-cart-add="${item.id}" ${item.stock==='SOLD OUT'?'disabled':''}>${item.stock==='SOLD OUT'?'SOLD':'CART +'}</button><button class="fav-toggle" type="button" data-favorite-id="${item.id}" aria-label="${item.name}をお気に入りに追加" aria-pressed="false">♡</button></div></div></div></article>`;
const miniCard=item=>`<article class="mini-card"><div class="thumb" style="background-image:url('assets/${item.img}')" role="img" aria-label="${item.name}"></div><div><small>${item.stock}</small><h3>${item.name}</h3><p>${item.copy}</p></div></article>`;
const retroCard=item=>`<article class="retro-card ${item.id==='mochi-melt'?'mochi':'soda'}"><button class="product-crop retro-product-link" type="button" data-detail-id="${item.id}" style="background-image:url('assets/${item.img}')" aria-label="${item.name}の商品詳細を開く"></button><div><small>${item.series} / ${item.stock}</small><button class="retro-product-link" type="button" data-detail-id="${item.id}"><h3>${item.name}</h3></button><p>${item.copy}</p><b>${price(item)}　RARE ${stars(item)}</b></div></article>`;

const setupAllItems=()=>{
 const series=document.querySelector('#all-series');
 [...new Set(items.map(item=>item.series))].forEach(value=>series.insertAdjacentHTML('beforeend',`<option value="${value}">${value}</option>`));
};
const renderAllItems=()=>{
 const category=document.querySelector('#all-category').value,series=document.querySelector('#all-series').value,clear=document.querySelector('#all-clear').value,rare=document.querySelector('#all-rare').value,sort=document.querySelector('#all-sort').value;
 let list=items.map((item,index)=>({item,index})).filter(({item})=>(category==='all'||item.tags.includes(category))&&(series==='all'||item.series===series)&&(clear==='all'||transparencyScore(item)===Number(clear))&&(rare==='all'||item.rare===Number(rare)));
 const sorters={recommended:(a,b)=>a.index-b.index,new:(a,b)=>(b.item.stock==='NEW')-(a.item.stock==='NEW')||a.index-b.index,rare:(a,b)=>b.item.rare-a.item.rare||a.index-b.index,clear:(a,b)=>transparencyScore(b.item)-transparencyScore(a.item)||a.index-b.index,puni:(a,b)=>puniScore(b.item)-puniScore(a.item)||a.index-b.index};
 list.sort(sorters[sort]);
 document.querySelector('#all-items-count').textContent=`${list.length} PUNI`;
 document.querySelector('#all-items-grid').innerHTML=list.length?list.map(({item})=>productCard(item)).join(''):'<p class="empty-state all-items-empty">条件に合うぷにはありません。<br>絞り込みを変えてみてね♡</p>';
};

const renderProducts=()=>{
 document.querySelector('#new-cards').innerHTML=items.slice(0,4).map(productCard).join('');
 document.querySelector('#clear-cards').innerHTML=items.filter(item=>item.series==='CLEAR').slice(0,3).map(miniCard).join('');
 document.querySelector('#rare-cards').innerHTML=items.filter(item=>item.stock==='SOLD OUT').map(productCard).join('');
 document.querySelector('#retro-grid').innerHTML=['mochi-melt','soda-bubble'].map(id=>retroCard(itemById[id])).join('');
 renderAllItems();
};

const cartEntries=()=>Object.entries(cart).filter(([id,qty])=>itemById[id]&&Number.isInteger(qty)&&qty>0);
const renderCart=()=>{
 const entries=cartEntries();
 document.querySelector('#cart-count').textContent=String(entries.reduce((sum,[,qty])=>sum+qty,0));
 document.querySelector('#cart-subtotal').textContent=`￥ × ${entries.reduce((sum,[id,qty])=>sum+itemById[id].priceLevel*qty,0)}`;
 document.querySelector('#cart-list').innerHTML=entries.length?entries.map(([id,qty])=>{const item=itemById[id];return `<article class="feature-row"><div class="feature-thumb" style="background-image:url('assets/${item.img}')" role="img" aria-label="${item.name}"></div><div class="feature-info"><h3>${item.name}</h3><p>${price(item)} / ${item.touch}</p></div><div class="feature-controls"><button type="button" data-cart-minus="${id}" aria-label="${item.name}を1点減らす">−</button><output aria-label="${item.name}の数量">${qty}</output><button type="button" data-cart-plus="${id}" aria-label="${item.name}を1点増やす">＋</button><button class="remove-feature" type="button" data-cart-remove="${id}">削除</button></div></article>`}).join(''):'<p class="empty-state">カートはまだ空っぽです。<br>お気に入りのぷにを見つけてね♡</p>';
};
const renderFavorites=()=>{
 const list=[...favorites].map(id=>itemById[id]).filter(Boolean);
 document.querySelector('#favorite-count').textContent=String(list.length);
 document.querySelector('#favorite-list').innerHTML=list.length?list.map(item=>`<article class="feature-row"><div class="feature-thumb" style="background-image:url('assets/${item.img}')" role="img" aria-label="${item.name}"></div><div class="feature-info"><h3>${item.name}</h3><p>${item.copy}</p></div><div class="feature-controls"><button type="button" data-detail-id="${item.id}">詳細</button><button class="remove-feature" type="button" data-favorite-id="${item.id}">解除</button></div></article>`).join(''):'<p class="empty-state">まだ「きゅん♡」はありません。<br>商品カードの♡から追加できます。</p>';
 document.querySelectorAll('[data-favorite-id]').forEach(button=>{const active=favorites.has(button.dataset.favoriteId);button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));if(button.classList.contains('fav-toggle'))button.setAttribute('aria-label',`${itemById[button.dataset.favoriteId].name}を${active?'お気に入りから解除':'お気に入りに追加'}`)});
};
const renderState=()=>{renderCart();renderFavorites()};

const addCart=id=>{if(!itemById[id]||itemById[id].stock==='SOLD OUT')return;cart[id]=(cart[id]||0)+1;saveState();renderState();showToast(`${itemById[id].name}をカートに追加しました♡`)};
const changeCart=(id,delta)=>{if(!cart[id])return;cart[id]+=delta;if(cart[id]<=0)delete cart[id];saveState();renderState()};
const toggleFavorite=id=>{if(!itemById[id])return;if(favorites.has(id)){favorites.delete(id);showToast(`${itemById[id].name}をお気に入りから解除しました`)}else{favorites.add(id);showToast(`${itemById[id].name}をお気に入りに追加しました♡`)}saveState();renderState()};

const openProduct=id=>{const item=itemById[id];if(!item)return;const soldOut=item.stock==='SOLD OUT';document.querySelector('#product-detail').innerHTML=`<article class="product-detail-card theme-${productTheme(item)}"><div class="product-detail-grid"><div class="product-detail-visual"><div class="product-detail-image" style="background-image:url('assets/${item.img}')" role="img" aria-label="${item.name}の商品ビジュアル"></div><span class="product-detail-stock ${soldOut?'is-sold':''}">${item.stock}</span><i class="detail-sparkle s1" aria-hidden="true">✦</i><i class="detail-sparkle s2" aria-hidden="true">♡</i></div><div class="product-detail-copy"><p class="dialog-kicker">${item.series} COLLECTION</p><h2 id="product-dialog-title">${item.name}</h2><p class="product-detail-lead">${item.copy}</p><dl class="product-detail-facts"><div><dt>SERIES</dt><dd>${item.series}</dd></div><div><dt>TOUCH</dt><dd>${item.touch}</dd></div><div><dt>PRICE</dt><dd>${price(item)}</dd></div><div><dt>STOCK</dt><dd>${item.stock}</dd></div></dl><div class="product-detail-meters">${detailMeter('ぷにぷに度',puniScore(item))}${detailMeter('透明度',transparencyScore(item))}${detailMeter('レア度',item.rare)}</div><div class="product-detail-actions"><button class="fav-toggle detail-favorite" type="button" data-favorite-id="${item.id}" aria-label="${item.name}をお気に入りに追加" aria-pressed="${favorites.has(item.id)}"><span aria-hidden="true">♡</span> FAVORITE</button><button class="cart-add detail-cart" type="button" data-cart-add="${item.id}" ${soldOut?'disabled':''}>${soldOut?'SOLD OUT':'CART に追加 ♡'}</button></div></div></div></article>`;renderFavorites();dialogOpen(document.querySelector('#product-dialog'))};

const diagnose=form=>{
 const answers=[...new FormData(form).values()];
 const candidates=items.filter(item=>item.stock!=='SOLD OUT');
 const result=candidates.map((item,index)=>({item,index,score:answers.reduce((score,answer)=>score+(item.tags.includes(answer)?1:0),0)})).sort((a,b)=>b.score-a.score||a.index-b.index)[0].item;
 document.querySelector('#diagnosis-result').innerHTML=`<article class="diagnosis-result-card"><div class="diagnosis-result-image" style="background-image:url('assets/${result.img}')" role="img" aria-label="${result.name}"></div><div class="diagnosis-result-copy"><span>あなたの運命ぷには……♡</span><h3>${result.name}</h3><p>${result.copy}</p><a class="detail-link" href="#product-detail" data-detail-id="${result.id}">商品詳細を見る →</a></div></article>`;
 document.querySelector('#diagnosis-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
};

setupAllItems();
renderProducts();
renderState();

document.addEventListener('click',event=>{
 const openButton=event.target.closest('[data-open-dialog]');if(openButton){dialogOpen(document.querySelector(`#${openButton.dataset.openDialog}`));return}
 const closeButton=event.target.closest('[data-close-dialog]');if(closeButton){dialogClose(closeButton.closest('dialog'));return}
 const favoriteButton=event.target.closest('[data-favorite-id]');if(favoriteButton){toggleFavorite(favoriteButton.dataset.favoriteId);return}
 const cartAdd=event.target.closest('[data-cart-add]');if(cartAdd){addCart(cartAdd.dataset.cartAdd);return}
 const plus=event.target.closest('[data-cart-plus]');if(plus){changeCart(plus.dataset.cartPlus,1);return}
 const minus=event.target.closest('[data-cart-minus]');if(minus){changeCart(minus.dataset.cartMinus,-1);return}
 const remove=event.target.closest('[data-cart-remove]');if(remove){delete cart[remove.dataset.cartRemove];saveState();renderState();return}
 const detail=event.target.closest('[data-detail-id]');if(detail){event.preventDefault();openProduct(detail.dataset.detailId);return}
 if(event.target.closest('.checkout-demo')){showToast('本サイトはWeb制作ポートフォリオ用の架空ショップです。実際の商品販売は行っていません。');return}
 if(event.target.closest('.sold-mascot button'))showToast('再入荷のお知らせを登録しました♡（デモ）');
});

document.querySelector('#diagnosis-form').addEventListener('submit',event=>{event.preventDefault();diagnose(event.currentTarget)});
document.querySelector('.all-items-controls').addEventListener('change',()=>{renderAllItems();renderFavorites()});
document.querySelectorAll('.feature-dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialogClose(dialog)}));
const menu=document.querySelector('.menu');menu?.addEventListener('click',()=>{const nav=document.querySelector('.header nav'),open=getComputedStyle(nav).display==='none';nav.style.display=open?'flex':'';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く')});

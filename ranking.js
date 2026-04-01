// Helper functions for localStorage persistence
function saveSendersToLocalStorage() {
  localStorage.setItem('medinaSenders', JSON.stringify(senders));
}

function loadSendersFromLocalStorage() {
  const storedSenders = localStorage.getItem('medinaSenders');
  return storedSenders ? JSON.parse(storedSenders) : null;
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const ME = {
  offers: ['books','seedlings','bread','sourdough','plants'],
  seeks:  ['tools','music','guitar','cycling','drill']
};

let creditLog = [
  {delta:+2, desc:'Gift given → Omar (sourdough starter)', date:'2 days ago'},
  {delta:+1, desc:'Trade completed → Lucia (books ↔ art prints)', date:'1 week ago'},
  {delta:-1, desc:'Gift received → Fatima (jam, no offer made)', date:'2 weeks ago'},
  {delta:+1, desc:'Trade completed → James (seeds ↔ camera strap)', date:'3 weeks ago'},
];

const defaultSenders = [ // Renamed original senders to defaultSenders
  {id:'aisha', name:'Aisha M.',  init:'AM', col:'#C1522A', credit:12,
   offers:['lamp','rattan','home decor'], seeks:['candles','plants','seedlings'],
   item:'Rattan lamp ↔ Candles',
   preview:"Yes! I'd love to trade the lamp for some candles.",  ago:'2m ago',
   msgs:[
     {me:false, txt:"Hi! I saw your listing for handmade candles — I have a gorgeous rattan floor lamp I'd love to trade!",t:"2:14 PM"},
     {me:true,  txt:"That sounds perfect! I've been looking for a lamp for my reading corner.",t:"2:18 PM"},
     {me:false, txt:"Amazing! The lamp is barely used. I can send photos.",t:"2:20 PM"},
     {me:false, card:{a:'🪔 Rattan lamp',b:'🕯️ Candle set'}}
   ]},
  {id:'omar',  name:'Omar B.',   init:'OB', col:'#3D6B4F', credit:9,
   offers:['bike','tools','pump','drill'], seeks:['sourdough','bread','food','baking'],
   item:'Bike pump ↔ Sourdough starter',
   preview:"The bike pump is still available!",               ago:'1h ago',
   msgs:[
     {me:false, txt:"The bike pump is still available! It's a floor pump with a pressure gauge.",t:"10:30 AM"},
     {me:true,  txt:"Brilliant. My sourdough is 3 years old, very active. Would 200g work?",t:"10:45 AM"},
     {me:false, txt:"That sounds wonderful, I've always wanted to try sourdough!",t:"10:50 AM"},
   ]},
  {id:'lucia', name:'Lucia P.',  init:'LP', col:'#7F77DD', credit:7,
   offers:['watercolour','art','painting'], seeks:['guitar','music','lessons','books'],
   item:'Guitar lessons ↔ Watercolour set',
   preview:"The guitar lessons sound amazing!",               ago:'Yesterday',
   msgs:[
     {me:false, txt:"The guitar lessons sound amazing! How many sessions were you thinking?",t:"Yesterday"},
     {me:true,  txt:"4 × 1hr sessions in exchange for the full watercolour set.",t:"Yesterday"},
   ]},
  {id:'kofi',  name:'Kofi A.',   init:'KA', col:'#185FA5', credit:5,
   offers:['drill','toolset','tools'], seeks:['baking','jam','bread','food'],
   item:'Tool kit ↔ Baked goods',
   preview:"I have a full drill set, interested in bread!",   ago:'3h ago',
   msgs:[
     {me:false, txt:"Hi Sara, I have a full tool kit with a drill — would you trade for some baked goods?",t:"9:00 AM"},
   ]},
  {id:'priya', name:'Priya S.',  init:'PS', col:'#993556', credit:3,
   offers:['guitar','ukulele','music'], seeks:['plants','seedlings','garden'],
   item:'Guitar ↔ Garden seedlings',
   preview:"I have a guitar — interested in seedlings?",      ago:'5h ago',
   msgs:[
     {me:false, txt:"Hello! I have an acoustic guitar. Would you trade for some seedlings?",t:"7:15 AM"},
   ]},
];

let senders = loadSendersFromLocalStorage() || defaultSenders; // Load from local storage or use default

const ITEMS = [
  {emoji:'🪴',bg:'#E8F0EB',title:'Monstera Deliciosa (large)',seek:'Cookbooks or spice sets',user:'Fatima K.',uc:'#C1522A',req:false},
  {emoji:'📷',bg:'#F5E6DC',title:'Vintage Pentax camera',seek:'Cycling gear or tools',user:'James O.',uc:'#3D6B4F',req:false},
  {emoji:'🎸',bg:'#F2EAD8',title:'Acoustic guitar + case',seek:'Language lessons or art supplies',user:'Priya S.',uc:'#7F77DD',req:false},
  {emoji:'🍞',bg:'#FAF0E6',title:'Weekly sourdough loaf',seek:'Fresh vegetables or eggs',user:'Sara R.',uc:'#C1522A',req:false},
  {emoji:'🛠️',bg:'#EAF3DE',title:'Full tool kit (drill, set)',seek:'Baking goods or jams',user:'Kofi A.',uc:'#3D6B4F',req:true},
  {emoji:'📚',bg:'#E6EEF8',title:"Children's books (20+)",seek:'Garden plants or seeds',user:'Mei L.',uc:'#185FA5',req:false},
  {emoji:'🧵',bg:'#FBF0F4',title:'Singer sewing machine',seek:'Bicycle or fitness gear',user:'Nour H.',uc:'#993556',req:false},
  {emoji:'🎨',bg:'#FAEEDA',title:'Watercolour art set',seek:'Guitar or music lessons',user:'Lucia P.',uc:'#7F77DD',req:true},
];

let curSender = senders[0];
let modalType = 'trade';
let modalItem = null;

let currentImages = []; // Global variable to store selected images Base64 strings

document.addEventListener('DOMContentLoaded', () => {
  const upboxTrigger = document.getElementById('upbox-trigger');
  const postItemPhotosInput = document.getElementById('post-item-photos');
  const photoPreviews = document.getElementById('photo-previews');

  if (upboxTrigger && postItemPhotosInput) {
    upboxTrigger.addEventListener('click', () => {
      postItemPhotosInput.click();
    });
  }

  if (postItemPhotosInput && photoPreviews) {
    postItemPhotosInput.addEventListener('change', (event) => {
      photoPreviews.innerHTML = ''; // Clear previous previews
      currentImages = []; // Clear previous images

      const files = event.target.files;
      if (files.length > 0) {
        for (let i = 0; i < Math.min(files.length, 6); i++) { // Limit to 6 files
          const file = files[i];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              currentImages.push(reader.result); // Store Base64 string
              const img = document.createElement('img');
              img.src = reader.result;
              img.style.maxWidth = '100px';
              img.style.maxHeight = '100px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '8px';
              photoPreviews.appendChild(img);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    });
  }
});


// ─── PRIORITY QUEUE ───────────────────────────────────────────────────────────
function isMutual(s) {
  const theyWantMine = s.seeks.some(sk => ME.offers.some(o => o===sk || sk.includes(o) || o.includes(sk)));
  const iWantTheirs  = ME.seeks.some(sk => s.offers.some(o => o===sk || sk.includes(o) || o.includes(sk)));
  return theyWantMine && iWantTheirs;
}
function sortedSenders() {
  const t1 = senders.filter(s =>  isMutual(s)).sort((a,b)=>b.credit-a.credit);
  const t2 = senders.filter(s => !isMutual(s)).sort((a,b)=>b.credit-a.credit);
  return {t1,t2};
}

// ─── INBOX RENDER ─────────────────────────────────────────────────────────────
function renderInbox() {
  const {t1,t2} = sortedSenders();
  const list = document.getElementById('thread-list');
  let html = '';
  if(t1.length){
    html += `<div class="tier-div t1">★ Mutual match — sorted by credit</div>`;
    t1.forEach(s => html += threadHTML(s));
  }
  if(t2.length){
    html += `<div class="tier-div t2">Other messages — sorted by credit</div>`;
    t2.forEach(s => html += threadHTML(s));
  }
  list.innerHTML = html;
  list.querySelectorAll('.thread').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.thread').forEach(t=>t.classList.remove('on'));
      el.classList.add('on');
      curSender = senders.find(s=>s.id===el.dataset.id);
      renderChat();
    });
  });
  // select first thread
  const first = list.querySelector('.thread');
  if(first){ first.classList.add('on'); curSender = senders.find(s=>s.id===first.dataset.id); }
  renderChat();
}

function threadHTML(s) {
  const mutual = isMutual(s);
  const pill = mutual ? `<span class="mpill">⇄</span>` : '';
  return `<div class="thread" data-id="${s.id}">
    <div class="th-top">
      <div class="th-av" style="background:${s.col}">${s.init}</div>
      <span class="th-name">${s.name}${pill}</span>
      <span class="th-credit">↑${s.credit}</span>
      <span class="th-time">${s.ago}</span>
    </div>
    <div class="th-prev">${s.preview}</div>
    <div class="th-item">${s.item}</div>
  </div>`;
}

// ─── CHAT RENDER ──────────────────────────────────────────────────────────────
function renderChat() {
  const s = curSender;
  const mutual = isMutual(s);
  document.getElementById('chat-hdr').innerHTML = `
    <div class="chat-hdr-av" style="background:${s.col}">${s.init}</div>
    <div>
      <div class="chat-hdr-name">${s.name}</div>
      <div class="chat-hdr-sub">${s.item}</div>
    </div>
    <div class="chat-hdr-right">
      <div class="tbadge ${mutual?'t1':'t2'}">${mutual?'★ Mutual match':'No match'}</div>
      <div class="cbadge">Credit: ${s.credit}</div>
    </div>`;

  const body = document.getElementById('chat-body');
  body.innerHTML = s.msgs.map(m => {
    if(m.card) {
      const [ai,an] = m.card.a.split(' ');
      const [bi,bn] = m.card.b.split(' ');
      return `<div class="exc-card">
        <div class="exc-card-title">Proposed Exchange</div>
        <div class="exc-items">
          <div class="exc-item"><span class="exc-icon">${ai}</span>${an}</div>
          <div class="exc-arrow">⇄</div>
          <div class="exc-item"><span class="exc-icon">${bi}</span>${bn}</div>
        </div>
        <button class="exc-accept" onclick="acceptTrade('${s.id}')">Accept trade — +1 credit each</button>
      </div>`;
    }
    return `<div style="display:flex;flex-direction:column;align-items:${m.me?'flex-end':'flex-start'}">
      <div class="bub ${m.me?'me':'them'}">${m.txt}<div class="bub-time">${m.t}</div></div>
    </div>`;
  }).join('');
  body.scrollTop = body.scrollHeight;
}

// ─── CREDIT ACTIONS ───────────────────────────────────────────────────────────
function myCredit() { return creditLog.reduce((s,e)=>s+e.delta,0); }

function acceptTrade(sid) {
  const s = senders.find(x=>x.id===sid);
  s.credit += 1;
  creditLog.unshift({delta:+1, desc:`Trade completed → ${s.name}`, date:'Just now'});
  // remove card from msgs
  s.msgs = s.msgs.filter(m=>!m.card);
  s.msgs.push({me:true, txt:'Trade accepted! Looking forward to the exchange.', t:'Just now'});
  toast(`Trade confirmed! You and ${s.name} each earned +1 credit.`);
  saveSendersToLocalStorage(); // Save changes to local storage
  renderInbox();
  updateProfile();
}

function updateProfile() {
  const sc = document.getElementById('p-score');
  if(sc) sc.textContent = myCredit();
  const el = document.getElementById('clog-entries');
  if(el) el.innerHTML = creditLog.map(e=>`
    <div class="centry">
      <span class="cdelta ${e.delta>0?'pos':'neg'}">${e.delta>0?'+':''}${e.delta}</span>
      <span class="cdesc">${e.desc}</span>
      <span class="cdate">${e.date}</span>
    </div>`).join('');
}

// ─── BROWSE MODAL ─────────────────────────────────────────────────────────────
function openModal(i) {
  modalItem = i;
  modalType = 'trade';
  const it = ITEMS[i];
  document.getElementById('mprev').innerHTML = `
    <span style="font-size:2.4rem">${it.emoji}</span>
    <div><div style="font-weight:500;font-size:.92rem">${it.title}</div>
    <div style="font-size:.76rem;color:var(--ink-light);margin-top:.2rem">Listed by ${it.user}</div></div>`;
  document.getElementById('eo-trade').classList.add('on');
  document.getElementById('eo-gift').classList.remove('on');
  document.getElementById('offer-fg').style.display='block';
  document.getElementById('offer-inp').value='';
  setCprev();
  document.getElementById('overlay').classList.remove('hide');
}
function closeModal(){ document.getElementById('overlay').classList.add('hide'); }
function setEx(t){
  modalType=t;
  document.getElementById('eo-trade').classList.toggle('on',t==='trade');
  document.getElementById('eo-gift').classList.toggle('on',t==='gift');
  document.getElementById('offer-fg').style.display=t==='trade'?'block':'none';
  setCprev();
}
function setCprev(){
  document.getElementById('cprev').innerHTML = modalType==='trade'
    ? 'Both you and the other user earn <strong>+1 credit</strong> each when the trade is confirmed.'
    : 'You earn <strong>+2 credit</strong> for gifting. The recipient earns −1 credit for receiving without offering.';
}
function submitModal(){
  closeModal();
  if(modalType==='trade'){
    creditLog.unshift({delta:+1, desc:`Trade offer sent → ${ITEMS[modalItem].user}`, date:'Just now'});
    toast('Trade offer sent! You\'ll both earn +1 credit on confirmation.');
  } else {
    creditLog.unshift({delta:+2, desc:`Gift sent → ${ITEMS[modalItem].user}`, date:'Just now'});
    toast('Gift sent! +2 credit added to your account.');
  }
  updateProfile();
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function go(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  const nb=document.getElementById('nb-'+page);
  if(nb) nb.classList.add('on');
  if(page==='messages') renderInbox();
  if(page==='profile')  updateProfile();
}


// ─── HELPERS ──────────────────────────────────────────────────────────────────
function renderGrid(itemsToDisplay = ITEMS){
  const items = itemsToDisplay;
  document.getElementById('igrid').innerHTML=items.map((it,i)=>`
    <div class="icard" onclick="openModal(${i})">
      <div class="icard-img" style="background:${it.bg}">
        <span>${it.emoji}</span>
        <div class="ibadge${it.req?' req':''}">${it.req?'Request':'Exchange'}</div>
      </div>
      <div class="icard-body">
        <div class="icard-title">${it.title}</div>
        <div class="icard-seek">Seeking: <strong>${it.seek}</strong></div>
        <div class="icard-foot">
          <div class="icard-user"><div class="av" style="background:${it.uc}">${it.user.split(' ').map(n=>n[0]).join('')}</div>${it.user}</div>
          <button class="hbtn" onclick="event.stopPropagation();this.classList.toggle('on');this.textContent=this.classList.contains('on')?'♥':'♡'">♡</button>
        </div>
      </div>
    </div>`).join('');
}

function sendMsg(){
  const inp=document.getElementById('chat-inp');
  const txt=inp.value.trim();
  if(!txt)return;
  curSender.msgs.push({me:true,txt,t:'Just now'});
  inp.value='';
  renderChat();
  saveSendersToLocalStorage(); // Save messages to local storage
}

function setChip(el){ document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); }
function setCat(el){ el.closest('.cg').querySelectorAll('.co').forEach(c=>c.classList.remove('on')); el.classList.add('on'); }
function postItem(){
  const itemName = document.getElementById('post-item-name').value;
  const itemDescription = document.getElementById('post-item-description').value; // Get description
  const itemSeek = document.getElementById('post-item-seek').value;
  const selectedCategoryElement = document.querySelector('#post-item-category .co.on');
  let emoji = '📦'; // Default emoji
  let bg = '#E6EEF8'; // Default background color

  if (selectedCategoryElement) {
    const categoryText = selectedCategoryElement.textContent.trim();
    if (categoryText.includes('Books')) {
      emoji = '📚';
      bg = '#E6EEF8';
    } else if (categoryText.includes('Tools')) {
      emoji = '🛠️';
      bg = '#EAF3DE';
    } else if (categoryText.includes('Garden')) {
      emoji = '🌿';
      bg = '#E8F0EB';
    } else if (categoryText.includes('Clothing')) {
      emoji = '👗';
      bg = '#FBF0F4';
    } else if (categoryText.includes('Kitchen')) {
      emoji = '🍳';
      bg = '#FAEEDA';
    } else if (categoryText.includes('Skills')) {
      emoji = '✨';
      bg = '#F2EAD8';
    }
  }

  if (itemName && itemSeek) {
    const newItem = {
      emoji: emoji,
      bg: bg,
      title: itemName,
      seek: itemSeek,
      user: 'Sara R.', // Assuming 'Sara R.' is the current user posting
      uc: '#C1522A', // User color for Sara R.
      req: false // Default to not a request
    };
    ITEMS.unshift(newItem); // Add to the beginning of the array
    renderGrid(); // Re-render the grid to show the new item
    toast('Item listed! Your exchange is live ✓');
    setTimeout(()=>go('home'),1200);
    // Clear the form fields after posting
    document.getElementById('post-item-name').value = '';
    document.getElementById('post-item-description').value = '';
    document.getElementById('post-item-seek').value = '';
    // Reset category selection to default (first one)
    document.querySelectorAll('#post-item-category .co').forEach((el, index) => {
        if (index === 0) {
            el.classList.add('on');
        } else {
            el.classList.remove('on');
        }
    });

  } else {
    toast('Please fill in both item name and what you are looking for.');
  }
}

let _tt;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),3200); }

renderGrid();
updateProfile();

function performSearch() {
  const searchTerm = document.getElementById('srch-inp').value.toLowerCase();
  const filteredItems = ITEMS.filter(item => item.title.toLowerCase().includes(searchTerm));
  renderGrid(filteredItems);
}

// Add event listener to the search button
document.querySelector('.srch-go').addEventListener('click', performSearch);

// Add event listener for 'Enter' key press on the search input
document.getElementById('srch-inp').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function renderGrid(itemsToDisplay = ITEMS){
  const items = itemsToDisplay;
  document.getElementById('igrid').innerHTML=items.map((it,i)=>`
    <div class="icard" onclick="openModal(${i})">
      <div class="icard-img" style="background:${it.bg}">
        <span>${it.emoji}</span>
        <div class="ibadge${it.req?' req':''}">${it.req?'Request':'Exchange'}</div>
      </div>
      <div class="icard-body">
        <div class="icard-title">${it.title}</div>
        <div class="icard-seek">Seeking: <strong>${it.seek}</strong></div>
        <div class="icard-foot">
          <div class="icard-user"><div class="av" style="background:${it.uc}">${it.user.split(' ').map(n=>n[0]).join('')}</div>${it.user}</div>
          <button class="hbtn" onclick="event.stopPropagation();this.classList.toggle('on');this.textContent=this.classList.contains('on')?'♥':'♡'">♡</button>
        </div>
      </div>
    </div>`).join('');
}

function performSearch() {
  const searchTerm = document.getElementById('srch-inp').value.toLowerCase();
  const filteredItems = ITEMS.filter(item => item.title.toLowerCase().includes(searchTerm));
  renderGrid(filteredItems);
}

// Add event listener to the search button
document.querySelector('.srch-go').addEventListener('click', performSearch);

// Add event listener for 'Enter' key press on the search input
document.getElementById('srch-inp').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Initial render of the grid when the page loads
renderGrid();
updateProfile();

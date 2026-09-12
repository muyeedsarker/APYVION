import {
  auth, db, storage, configured, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, collection, doc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, getDocs, serverTimestamp, ref, uploadBytes,
  getDownloadURL, deleteObject
} from "./firebase-client.js";

const folders=[
 ['family_photos','📸','পারিবারিক ছবি'],['personal_photos','🖼️','পারসোনাল ছবি'],
 ['personal_videos','🎥','পারসোনাল ভিডিও'],['personal_audio','🎙️','পারসোনাল অডিও'],
 ['personal_documents','📄','পারসোনাল ডকুমেন্ট'],['identity_documents','🪪','পরিচয়পত্র'],
 ['educational_certificates','🎓','শিক্ষাগত সনদ'],['job_office','💼','চাকরি ও অফিস'],
 ['home_property','🏠','বাড়ি ও সম্পত্তি'],['car_driving','🚗','গাড়ি ও ড্রাইভিং'],
 ['travel_passport','✈️','ভ্রমণ ও পাসপোর্ট'],['financial_documents','💰','আর্থিক নথি'],
 ['health_documents','🏥','স্বাস্থ্য সংক্রান্ত নথি'],['family','👨‍👩‍👧','পরিবার'],
 ['wedding_events','💍','বিয়ে ও অনুষ্ঠান'],['notes_others','📝','নোট ও অন্যান্য'],
 ['favorites_important','⭐','প্রিয় / গুরুত্বপূর্ণ'],['recently_deleted','🗑️','Recently Deleted']
].map(([id,emoji,title])=>({id,emoji,title,isTrash:id==='recently_deleted'}));
const folderMap=new Map(folders.map(f=>[f.id,f]));
let user=null, items=[], activeFolder=null;
const $=id=>document.getElementById(id);
const notice=(el,msg,error=false)=>{el.textContent=msg;el.hidden=!msg;el.className='jf-notice'+(error?' error':'')};
const fmtSize=n=>{if(!n)return '0 B';const u=['B','KB','MB','GB'];let i=0,x=n;while(x>=1024&&i<u.length-1){x/=1024;i++}return `${x.toFixed(i?1:0)} ${u[i]}`};
const fmtDate=v=>{const d=v?.toDate?v.toDate():new Date(v);return isNaN(d)?'':d.toLocaleString('bn-BD',{dateStyle:'medium',timeStyle:'short'})};
const icon=m=>m?.startsWith('image/')?'🖼️':m?.startsWith('video/')?'🎥':m?.startsWith('audio/')?'🎙️':m==='application/pdf'?'📕':'📄';
function showAuth(msg=''){ $('authPanel').hidden=false;$('vaultPanel').hidden=true;if(msg)notice($('authNotice'),msg,true); }
function showVault(){ $('authPanel').hidden=true;$('vaultPanel').hidden=false;$('welcomeText').textContent=`🔐 ${user.email||'My Vault'}`;renderFolders(); }
async function loadItems(){
  if(!db||!user)return;
  const q=query(collection(db,'vaultItems'),where('uid','==',user.uid),orderBy('createdAt','desc'));
  try{const snap=await getDocs(q);items=snap.docs.map(d=>({id:d.id,...d.data()}));renderFolders();if(activeFolder)renderItems();}
  catch(e){notice($('authNotice'),'Vault data load হয়নি। Firestore index প্রয়োজন হতে পারে।',true);console.error(e)}
}
function renderFolders(){
 const term=$('searchInput').value.trim().toLowerCase();
 $('folderGrid').innerHTML='';
 for(const f of folders){let list=items.filter(x=>f.isTrash?x.deleted:x.folderId===f.id&&!x.deleted); if(term)list=list.filter(x=>x.name.toLowerCase().includes(term));
  const card=document.createElement('button');card.className='vault-card'+(f.isTrash?' trash-card':'');card.innerHTML=`<div class="vault-icon">${f.emoji}</div><h3>${f.title}</h3><div class="muted">${list.length} টি ফাইল</div>`;card.onclick=()=>openFolder(f.id);$('folderGrid').appendChild(card);}
 $('vaultStats').textContent=` · ${items.filter(x=>!x.deleted).length} active · ${items.filter(x=>x.deleted).length} trash`;
}
function openFolder(id){activeFolder=id;const f=folderMap.get(id);$('folderGrid').hidden=true;$('folderPanel').hidden=false;$('folderTitle').textContent=`${f.emoji} ${f.title}`;$('folderHint').textContent=f.isTrash?'এখান থেকে Restore অথবা Permanently Delete করুন.':'আপনার এই category-এর ফাইলগুলো';$('fileInput').disabled=f.isTrash;renderItems();}
function renderItems(){
 const f=folderMap.get(activeFolder);let list=items.filter(x=>f.isTrash?x.deleted:x.folderId===activeFolder&&!x.deleted);const term=$('searchInput').value.trim().toLowerCase();if(term)list=list.filter(x=>x.name.toLowerCase().includes(term));
 const sort=$('sortSelect').value;list.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='oldest'?a.createdAt-b.createdAt:sort==='size'?b.size-a.size:b.createdAt-a.createdAt);
 $('itemList').innerHTML='';$('emptyState').hidden=!!list.length;
 for(const x of list){const row=document.createElement('article');row.className='vault-item';const thumb=document.createElement('div');thumb.className='vault-thumb';thumb.textContent=icon(x.mimeType);if(x.mimeType?.startsWith('image/')&&x.url)thumb.innerHTML=`<img src="${x.url}" alt="">`;
  const mid=document.createElement('div');mid.innerHTML=`<div class="vault-name" title="${escapeHtml(x.name)}">${escapeHtml(x.name)}</div><div class="vault-meta">${fmtSize(x.size)} · ${fmtDate(x.createdAt)}</div>`;
  const actions=document.createElement('div');actions.className='vault-item-actions';
  if(!f.isTrash){button(actions,'👁️','Preview',()=>preview(x));button(actions,'⬇️','Download',()=>download(x));button(actions,x.favorite?'⭐':'☆','Favorite',()=>toggleFavorite(x));button(actions,'✏️','Rename',()=>rename(x));button(actions,'🗑️','Delete',()=>softDelete(x),'danger');}
  else {button(actions,'↩️','Restore',()=>restore(x));button(actions,'❌','Permanently delete',()=>permanentDelete(x),'danger');}
  row.append(thumb,mid,actions);$('itemList').appendChild(row);}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function button(parent,text,title,fn,cls=''){const b=document.createElement('button');b.className='mini-btn '+cls;b.textContent=text;b.title=title;b.onclick=fn;parent.appendChild(b)}
async function upload(files){if(!files.length||!storage||!db||!user)return;for(const file of files){const id=crypto.randomUUID();const safe=file.name.replace(/[^\w.()\-ঀ-৿ ]/g,'_');const path=`users/${user.uid}/vault/${activeFolder}/${id}_${safe}`;try{const r=ref(storage,path);await uploadBytes(r,file);const url=await getDownloadURL(r);await addDoc(collection(db,'vaultItems'),{uid:user.uid,folderId:activeFolder,name:file.name,storedName:safe,size:file.size,mimeType:file.type||'application/octet-stream',path,url,favorite:false,deleted:false,createdAt:Date.now(),serverCreatedAt:serverTimestamp()});}catch(e){console.error(e);alert(`"${file.name}" upload হয়নি।`)}}await loadItems();renderItems()}
async function preview(x){if(x.mimeType?.startsWith('image/')||x.mimeType?.startsWith('video/')||x.mimeType?.startsWith('audio/')||x.mimeType==='application/pdf'){window.open(x.url,'_blank','noopener,noreferrer');}else{const a=document.createElement('a');a.href=x.url;a.target='_blank';a.rel='noopener';a.click();}}
function download(x){const a=document.createElement('a');a.href=x.url;a.download=x.name;a.target='_blank';a.rel='noopener';a.click()}
async function rename(x){const n=prompt('নতুন নাম দিন',x.name);if(!n?.trim()||n.trim()===x.name)return;await updateDoc(doc(db,'vaultItems',x.id),{name:n.trim()});await loadItems()}
async function toggleFavorite(x){await updateDoc(doc(db,'vaultItems',x.id),{favorite:!x.favorite});await loadItems()}
async function softDelete(x){if(!confirm(`"${x.name}" Recently Deleted-এ পাঠাবেন?`))return;await updateDoc(doc(db,'vaultItems',x.id),{deleted:true,deletedAt:Date.now()});await loadItems()}
async function restore(x){await updateDoc(doc(db,'vaultItems',x.id),{deleted:false,deletedAt:null});await loadItems()}
async function permanentDelete(x){if(!confirm(`"${x.name}" স্থায়ীভাবে মুছে ফেলবেন?`))return;try{await deleteObject(ref(storage,x.path))}catch(e){console.warn('storage delete',e)}await deleteDoc(doc(db,'vaultItems',x.id));await loadItems()}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!configured)return notice($('authNotice'),'Firebase config এখনো সেট করা হয়নি। আগে firebase-config.js-এ আসল Web App config দিন।',true);try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value)}catch(e){notice($('authNotice'),'Sign in ব্যর্থ হয়েছে। Email/Password ঠিক আছে কি না দেখুন।',true)}});
$('signupBtn').onclick=async()=>{if(!configured)return notice($('authNotice'),'Firebase config আগে সেট করুন।',true);try{await createUserWithEmailAndPassword(auth,$('email').value,$('password').value)}catch(e){notice($('authNotice'),'Account তৈরি হয়নি। Email ও অন্তত ৬ অক্ষরের password দিন।',true)}};
$('logoutBtn').onclick=()=>signOut(auth);
$('fileInput').addEventListener('change',e=>upload([...e.target.files]));
$('backFolders').onclick=()=>{activeFolder=null;$('folderPanel').hidden=true;$('folderGrid').hidden=false;renderFolders()};
$('searchInput').addEventListener('input',()=>{renderFolders();if(activeFolder)renderItems()});$('sortSelect').addEventListener('change',()=>activeFolder&&renderItems());
if(!configured){showAuth();notice($('authNotice'),'Firebase config placeholder অবস্থায় আছে। Deploy করা যাবে, কিন্তু Vault চালাতে আসল Firebase Web App config লাগবে।',true)}else{onAuthStateChanged(auth,async u=>{user=u;if(u){showVault();await loadItems()}else showAuth()})}

// APYVION — Shared Project Memory
// One local workspace across Services Center, Social Media Studio and future factory modules.
// Security: never stores passwords, OTPs, access tokens or secret credentials.
window.APYVION_MEMORY = (function(){
  const KEY='apyvion_project_memory_v1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function write(list){localStorage.setItem(KEY,JSON.stringify(list))}
  function uid(){return 'pm_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
  function upsert(data){
    const list=read();
    const id=data.id||uid();
    const now=new Date().toISOString();
    const old=list.find(p=>p.id===id);
    const entry=Object.assign({},old||{},data,{id,updatedAt:now,createdAt:(old&&old.createdAt)||data.createdAt||now});
    if(!old) list.unshift(entry); else list[list.findIndex(p=>p.id===id)]=entry;
    write(list);
    return entry;
  }
  function remove(id){write(read().filter(p=>p.id!==id))}
  function get(id){return read().find(p=>p.id===id)||null}
  function list(){return read().sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0))}
  function touch(id,activity){
    const p=get(id); if(!p)return null;
    p.activity=Array.isArray(p.activity)?p.activity:[];
    p.activity.unshift({at:new Date().toISOString(),text:String(activity||'Updated')});
    p.activity=p.activity.slice(0,50);
    return upsert(p);
  }
  function safeContact(v){return String(v||'').trim().slice(0,200)}

  // Project Memory → Services/Social Resume bridge.
  // The target pages already load this file before their page scripts run.
  function restoreFromQuery(){
    try{
      const id=new URLSearchParams(location.search).get('memoryId');
      if(!id)return;
      const p=get(id); if(!p)return;
      const now=Date.now();
      if(p.module==='Social Media Studio'){
        const record={
          id:now, client:p.client||'', project:p.project||'', work:p.work||'Setup',
          platforms:Array.isArray(p.platforms)?p.platforms:[],
          checks:Array.isArray(p.checks)?p.checks:[], savedAt:new Date().toISOString(), memoryId:p.id
        };
        localStorage.setItem('apyvion_social_project_v1',JSON.stringify(record));
        localStorage.setItem('apyvion_social_resume_memory_id',p.id);
      }
      if(p.module==='Professional Services Center'){
        const record={
          id:now, client:p.client||'', project:p.project||'', contact:p.contact||'',
          status:p.status||'New', price:p.price||'', payment:p.payment||'Not Set',
          notes:p.notes||'', services:Array.isArray(p.services)?p.services:[],
          updatedAt:new Date().toISOString(), memoryId:p.id
        };
        localStorage.setItem('apyvion_service_projects_v1',JSON.stringify([record]));
        localStorage.setItem('apyvion_service_resume_memory_id',p.id);
        window.__APYVION_RESUME_SERVICE=record;
      }
      touch(id,'Project resumed from Project Memory');
    }catch(e){}
  }
  restoreFromQuery();

  // Services Center's inline page script renders first; this fills the form after DOM is ready.
  document.addEventListener('DOMContentLoaded',function(){
    try{
      const d=window.__APYVION_RESUME_SERVICE;
      if(!d || !document.getElementById('client'))return;
      const $=id=>document.getElementById(id);
      if($('client'))$('client').value=d.client||'';
      if($('project'))$('project').value=d.project||'';
      if($('contact'))$('contact').value=d.contact||'';
      if($('status'))$('status').value=d.status||'New';
      if($('price'))$('price').value=d.price||'';
      if($('payment'))$('payment').value=d.payment||'Not Set';
      if($('notes'))$('notes').value=d.notes||'';
      document.querySelectorAll('#serviceList input').forEach(x=>x.checked=(d.services||[]).includes(x.value));
      window.currentId=d.id;
    }catch(e){}
  });

  return {KEY,read,list,get,upsert,remove,touch,safeContact};
})();
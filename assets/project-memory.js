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
  return {KEY,read,list,get,upsert,remove,touch,safeContact};
})();
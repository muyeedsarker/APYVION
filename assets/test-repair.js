// APYVION — Audit & Upgrade engine (v2: deeper checks, direct-closure fixes, URL scan hardening)
(function(){
  const state={files:null,source:'',results:[]};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localRef=r=>r&&!/^(https?:)?\/\//i.test(r)&&!r.startsWith('#')&&!/^(mailto|tel|javascript|data|blob):/i.test(r);
  const dir=p=>p.includes('/')?p.slice(0,p.lastIndexOf('/')):'';
  function norm(base,rel){const a=(base?base.split('/'):[]).concat(rel.split('/'));const o=[];for(const x of a){if(!x||x==='.')continue;if(x==='..')o.pop();else o.push(x)}return o.join('/')}
  function issue(severity,text,detail,fix){return {status:'issue',severity,text,detail,fix:fix||null};}
  function pass(text,detail){return {status:'pass',severity:'',text,detail};}

  // Secret-like patterns worth flagging in any text file. Kept intentionally narrow
  // (well-known key formats) to avoid noisy false positives on ordinary code.
  const SECRET_PATTERNS=[
    {re:/AIza[0-9A-Za-z_\-]{35}/,label:'Google/Firebase API key'},
    {re:/AKIA[0-9A-Z]{16}/,label:'AWS Access Key ID'},
    {re:/sk_(live|test)_[0-9a-zA-Z]{16,}/,label:'Stripe secret key'},
    {re:/ghp_[0-9A-Za-z]{36}/,label:'GitHub personal access token'},
    {re:/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,label:'Private key material'},
  ];

  function auditFiles(files){
    const results=[];
    const paths=new Set(Object.keys(files));
    const htmls=Object.keys(files).filter(p=>/\.html?$/i.test(p));
    const cssFiles=Object.keys(files).filter(p=>/\.css$/i.test(p));
    const jsFiles=Object.keys(files).filter(p=>/\.js$/i.test(p)&&!/(^|\/)node_modules\//.test(p));
    // Detected web root: the directory holding the shallowest index.html — used to
    // resolve root-relative references (href="/", href="/about.html") correctly,
    // instead of naively resolving them against each file's own directory.
    const indexCandidates=Object.keys(files).filter(x=>/(^|\/)index\.html$/i.test(x)).sort((a,b)=>a.split('/').length-b.split('/').length);
    const webRoot=indexCandidates.length?dir(indexCandidates[0]):'';

    if(!htmls.length) results.push(issue('critical','HTML entry point নেই','Project ZIP-এ কোনো HTML file পাওয়া যায়নি।'));

    htmls.forEach(p=>{
      const c=files[p]||'';

      if(!/<!doctype html>/i.test(c))
        results.push(issue('high',`${p} — DOCTYPE missing`,'HTML document-এ <!doctype html> নেই।',()=>{files[p]='<!doctype html>\n'+files[p];}));

      if(!/<meta[^>]+charset=/i.test(c))
        results.push(issue('high',`${p} — charset missing`,'Character-encoding meta tag নেই; garbled text-এর ঝুঁকি।',()=>{files[p]=files[p].replace(/<head[^>]*>/i,m=>m+'\n<meta charset="utf-8">');}));

      if(!/<meta[^>]+viewport/i.test(c))
        results.push(issue('high',`${p} — viewport missing`,'Mobile viewport meta tag নেই।',()=>{files[p]=files[p].replace(/<meta charset=[^>]+>/i,m=>m+'\n<meta name="viewport" content="width=device-width,initial-scale=1">');}));

      if(!/<html[^>]+lang=/i.test(c))
        results.push(issue('medium',`${p} — lang attribute missing`,'Accessibility/SEO-এর জন্য html lang attribute নেই।',()=>{files[p]=files[p].replace(/<html/i,'<html lang="en"');}));

      if(!/<title\b/i.test(c))
        results.push(issue('medium',`${p} — title missing`,'Browser tab/SEO title নেই।',()=>{files[p]=files[p].replace(/<head[^>]*>/i,m=>m+'\n<title>APYVION App</title>');}));

      if(!/<meta[^>]+name=["']description["']/i.test(c))
        results.push(issue('low',`${p} — meta description missing`,'SEO/Preview snippet এর জন্য description নেই।',()=>{files[p]=files[p].replace(/<title[^>]*>[\s\S]*?<\/title>/i,m=>m+'\n<meta name="description" content="APYVION generated application">');}));

      // Open Graph tags — needed for proper previews when shared via the Social Hub
      // (Facebook/WhatsApp/LinkedIn/X etc. all read these when a link is shared).
      if(!/<meta[^>]+property=["']og:title["']/i.test(c)){
        const titleMatch=c.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const t=esc((titleMatch&&titleMatch[1].trim())||'APYVION App');
        results.push(issue('low',`${p} — Open Graph tags missing`,'Facebook/WhatsApp/LinkedIn-এ শেয়ার করলে সঠিক preview title/description/image দেখাতে og: মেটা ট্যাগ দরকার।',()=>{
          files[p]=files[p].replace(/<\/head>/i,`<meta property="og:title" content="${t}">\n<meta property="og:description" content="APYVION generated application">\n<meta property="og:type" content="website">\n</head>`);
        }));
      }

      // Favicon reference — not auto-fixable (no image file to generate), so flagged only.
      if(!/<link[^>]+rel=["'](?:icon|shortcut icon)["']/i.test(c))
        results.push(issue('low',`${p} — favicon link নেই`,'Browser tab/bookmark-এ আইকন দেখানোর জন্য <link rel="icon"> যোগ করুন (icon ফাইল নিজে বানিয়ে যোগ করতে হবে)।'));

      // target="_blank" without rel="noopener"/"noreferrer" — reverse-tabnabbing risk.
      const blankNoOpener=[...c.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].filter(m=>!/rel=["'][^"']*noopener/i.test(m[0]));
      if(blankNoOpener.length) results.push(issue('medium',`${p} — ${blankNoOpener.length}টি target="_blank" এ rel="noopener" নেই`,'নতুন ট্যাবে খোলা লিংক থেকে window.opener এক্সেস করা সম্ভব হতে পারে (reverse-tabnabbing)।',()=>{
        files[p]=files[p].replace(/<a\b([^>]*target=["']_blank["'][^>]*)>/gi,(m,attrs)=>{
          if(/rel=["'][^"']*noopener/i.test(attrs)) return m;
          if(/rel=["']([^"']*)["']/i.test(attrs)) return `<a${attrs.replace(/rel=["']([^"']*)["']/i,'rel="$1 noopener noreferrer"')}>`;
          return `<a${attrs} rel="noopener noreferrer">`;
        });
      }));

      // Broken local href/src references (images, scripts, stylesheets, anchors to files).
      // A leading "/" means "site root", so it's resolved against the detected
      // webRoot rather than this file's own folder; a bare "/" is always valid.
      const refs=[...c.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(m=>m[1]).filter(localRef);
      const broken=refs.map(r=>{
        const clean=r.split('#')[0].split('?')[0];
        if(clean==='/') return null;
        const resolved=clean.startsWith('/')?norm(webRoot,clean):norm(dir(p),clean);
        return [r,resolved];
      }).filter(Boolean).filter(x=>x[1]&&!paths.has(x[1]));
      if(broken.length) results.push(issue('high',`${p} — Broken local reference(s)`,broken.map(x=>`${x[0]} → ${x[1]}`).join(', ')));

      // Insecure http:// resources loaded from an otherwise-static asset.
      if(/<(?:script|link|img)[^>]+(?:src|href)=["']http:\/\//i.test(c))
        results.push(issue('high',`${p} — insecure HTTP resource`,'HTTP resource detected; HTTPS ব্যবহার করা উচিত (mixed-content ঝুঁকি)।'));

      // Inline event handlers (onclick=, onload=, ...) — code-quality/CSP concern, not auto-fixed.
      const inlineHandlers=[...c.matchAll(/\son\w+=["']/gi)];
      if(inlineHandlers.length) results.push(issue('low',`${p} — ${inlineHandlers.length}টি inline event handler`,'onClick জাতীয় inline handler Content-Security-Policy কঠোর করা কঠিন করে তোলে।'));

      // Outdated/vulnerable jQuery loaded from a CDN — old 1.x/2.x builds carry known XSS CVEs.
      const jqMatch=c.match(/jquery[\/-](\d+)\.(\d+)\.(\d+)[^"']*\.js/i);
      if(jqMatch&&(Number(jqMatch[1])<3))
        results.push(issue('high',`${p} — পুরনো jQuery (${jqMatch[1]}.${jqMatch[2]}.${jqMatch[3]}) ব্যবহার হচ্ছে`,'jQuery 3.x-এর নিচের ভার্সনে পরিচিত XSS দুর্বলতা আছে। নতুন ভার্সনে আপগ্রেড করুন।'));

      // <img> missing alt text — accessibility.
      const imgsNoAlt=[...c.matchAll(/<img(?![^>]*\balt=)[^>]*>/gi)];
      if(imgsNoAlt.length) results.push(issue('medium',`${p} — ${imgsNoAlt.length}টি <img> এ alt নেই`,'Screen-reader accessibility ও SEO-এর জন্য alt attribute দরকার।'));

      // Duplicate id attributes within the same document.
      const ids=[...c.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
      const dupeIds=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
      if(dupeIds.length) results.push(issue('medium',`${p} — Duplicate id attribute(s)`,dupeIds.join(', ')));
    });

    // CSS: broken url() references (background images, fonts, etc.)
    cssFiles.forEach(p=>{
      const c=files[p]||'';
      const refs=[...c.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map(m=>m[1]).filter(localRef);
      const broken=refs.map(r=>[r,norm(dir(p),r.split('#')[0].split('?')[0])]).filter(x=>x[1]&&!paths.has(x[1]));
      if(broken.length) results.push(issue('medium',`${p} — Broken CSS url() reference(s)`,broken.map(x=>`${x[0]} → ${x[1]}`).join(', ')));
    });

    // JS hygiene.
    jsFiles.forEach(p=>{
      const c=files[p]||'';
      if(/\bdebugger\b/.test(c)) results.push(issue('medium',`${p} — debugger statement`,'Production-এ পাঠানোর আগে সরিয়ে ফেলুন।',()=>{files[p]=files[p].replace(/\bdebugger\s*;?/g,'');}));
      const consoleCalls=(c.match(/console\.(log|debug)\(/g)||[]).length;
      if(consoleCalls>3) results.push(issue('low',`${p} — ${consoleCalls}টি console.log/debug কল`,'Production build-এ debug logging কমানো ভালো।'));
      const todoCount=(c.match(/\/\/\s*(TODO|FIXME)\b/gi)||[]).length;
      if(todoCount) results.push(issue('low',`${p} — ${todoCount}টি TODO/FIXME comment`,'Deploy-এর আগে অসম্পূর্ণ কাজগুলো review করে নিন।'));
    });

    // Secret-like strings anywhere in the package.
    Object.entries(files).forEach(([p,c])=>{
      if(typeof c!=='string')return;
      SECRET_PATTERNS.forEach(({re,label})=>{
        if(re.test(c)) results.push(issue('critical',`${p} — সম্ভাব্য ${label} উন্মুক্ত`,'এই ধরনের key/secret সরাসরি code-এ রাখা ঝুঁকিপূর্ণ। অবিলম্বে rotate/revoke করে file থেকে সরান।'));
      });
    });

    // .env files shipped inside the package (should only ship .env.example).
    Object.keys(files).filter(p=>/(^|\/)\.env$/.test(p)).forEach(p=>{
      results.push(issue('critical',`${p} — .env file প্যাকেজে আছে`,'Secrets file সরাসরি ZIP/deploy-এ আছে। এটি বাদ দিয়ে শুধু .env.example রাখুন।'));
    });

    // .git history shipped inside the package.
    const gitFiles=Object.keys(files).filter(p=>/(^|\/)\.git\//.test(p));
    if(gitFiles.length) results.push(issue('high','.git history প্যাকেজে অন্তর্ভুক্ত',`${gitFiles.length}টি ফাইল পাওয়া গেছে (repo history/metadata) — এগুলো deploy/ZIP থেকে বাদ দেওয়া উচিত।`,()=>{gitFiles.forEach(f=>{delete files[f];});}));

    // firebase.json / firebase-config.js / .firebaserc / rules (existing project-specific checks).
    const fbJsonPath=Object.keys(files).find(p=>/(^|\/)firebase\.json$/.test(p));
    if(fbJsonPath){
      try{
        const cfg=JSON.parse(files[fbJsonPath]);
        if(!cfg.hosting) results.push(issue('high',`${fbJsonPath} — Hosting config missing`,'Hosting section পাওয়া যায়নি।'));
        else if(cfg.hosting.public&&!paths.has(cfg.hosting.public+'/index.html'))
          results.push(issue('critical','Firebase Hosting entry missing',`hosting.public = ${cfg.hosting.public}, কিন্তু সেখানে index.html পাওয়া যায়নি।`));
      }catch(e){results.push(issue('critical',`${fbJsonPath} — Invalid JSON`,'Firebase configuration parse করা যাচ্ছে না।'));}
    }

    const fbConfigPath=Object.keys(files).find(p=>/(^|\/)firebase-config\.js$/.test(p));
    if(fbConfigPath&&/YOUR_(FIREBASE|PROJECT|MESSAGING)/i.test(files[fbConfigPath]))
      results.push(issue('critical',`${fbConfigPath} — Firebase Web config placeholder`,'Firebase Console থেকে আসল Web App config বসানো হয়নি।'));

    const rcPath=Object.keys(files).find(p=>/(^|\/)\.firebaserc$/.test(p));
    if(rcPath&&/YOUR_FIREBASE_PROJECT_ID/i.test(files[rcPath]))
      results.push(issue('high',`${rcPath} — Project ID placeholder`,'CLI project alias এখনো বসানো হয়নি।',()=>{files[rcPath]=files[rcPath].replace('YOUR_FIREBASE_PROJECT_ID','apyvion');}));

    const rulesPath=Object.keys(files).find(p=>/(^|\/)firestore\.rules$/.test(p));
    if(rulesPath&&/allow read, write:\s*if true/i.test(files[rulesPath]))
      results.push(issue('critical','Firestore rules allow-all','Firestore publicly writable হওয়ার গুরুতর ঝুঁকি আছে।'));

    const storagePath=Object.keys(files).find(p=>/(^|\/)storage\.rules$/.test(p));
    if(storagePath&&/allow read, write:\s*if true/i.test(files[storagePath]))
      results.push(issue('critical','Storage rules allow-all','Storage publicly writable হওয়ার গুরুতর ঝুঁকি আছে।'));

    // package.json validity, wherever it appears.
    Object.keys(files).filter(p=>/(^|\/)package\.json$/.test(p)).forEach(p=>{
      try{JSON.parse(files[p]);}catch(e){results.push(issue('high',`${p} — Invalid JSON`,'package.json parse করা যাচ্ছে না।'));}
    });

    if(jsFiles.length===0) results.push(issue('medium','JavaScript files নেই','Interactive application হলে JS প্রয়োজন হতে পারে।'));
    if(cssFiles.length===0) results.push(issue('low','CSS files নেই','Visual styling পাওয়া যায়নি।'));
    if(!Object.keys(files).some(p=>/(^|\/)README\.md$/i.test(p))) results.push(issue('low','README নেই','Project documentation যোগ করলে maintenance সহজ হবে।'));

    return results;
  }

  async function readZip(file){
    const zip=await JSZip.loadAsync(file);
    const files={};
    const jobs=[];
    zip.forEach((path,e)=>{if(!e.dir) jobs.push(e.async('string').then(c=>{files[path]=c;}).catch(()=>{}));});
    await Promise.all(jobs);
    return files;
  }

  async function scanZip(){
    const f=$('jfZipInput').files[0];
    if(!f) return notice('আগে একটি ZIP নির্বাচন করুন।',true);
    if(typeof JSZip==='undefined') return notice('ZIP engine লোড হয়নি। Internet connection পরীক্ষা করুন।',true);
    try{
      notice('ZIP পড়া হচ্ছে…',false);
      state.files=await readZip(f);
      state.source='ZIP: '+f.name;
      runAudit();
    }catch(e){notice('ZIP পড়তে সমস্যা হয়েছে: '+e.message,true);}
  }

  // Best-effort reachability probe when a normal (CORS-readable) fetch fails.
  // A no-cors request that resolves means *something* answered (even if we can't
  // read it); a rejection means the URL is genuinely unreachable (DNS/connection
  // failure, mixed content block, etc.).
  async function probeNoCors(url){
    try{await fetch(url,{mode:'no-cors',redirect:'follow'});return true;}
    catch(e){return false;}
  }

  async function scanUrl(){
    const url=$('jfUrlInput').value.trim();
    if(!url) return notice('আগে একটি URL দিন।',true);
    try{new URL(url);}catch{return notice('সঠিক, পূর্ণ URL দিন (https:// সহ)।',true);}

    notice('Link scan চলছে…',false);
    const startedAt=performance.now();
    try{
      const r=await fetch(url,{redirect:'follow'});
      const elapsedMs=Math.round(performance.now()-startedAt);
      const text=await r.text();
      state.files={'__remote__/index.html':text};
      state.source='URL: '+url;

      const res=auditFiles(state.files);
      const finalUrl=r.url||url;
      const isHttps=finalUrl.toLowerCase().startsWith('https://');

      if(!r.ok) res.unshift(issue(r.status>=500?'critical':'high',`HTTP ${r.status} — URL response`,r.statusText||'Remote server returned an error.'));
      res.unshift(pass('URL reachable',`HTTP ${r.status}; final URL: ${finalUrl}; ${elapsedMs}ms`));
      if(finalUrl!==url) res.unshift(pass('Redirect detected',`${url} → ${finalUrl}`));
      if(elapsedMs>3000) res.unshift(issue('medium','ধীর response time',`${elapsedMs}ms লাগল — 3s এর বেশি হলে ব্যবহারকারীরা পেজ ছেড়ে যেতে পারে।`));

      const ct=r.headers.get('content-type')||'unknown';
      res.unshift(pass('Content-Type',ct));

      if(!isHttps) res.unshift(issue('high','HTTPS not detected','Live project links should use HTTPS.'));

      const title=(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];
      if(title) res.unshift(pass('Page title',title.replace(/<[^>]+>/g,'').trim()));
      else res.unshift(issue('medium','Page title missing','The scanned page has no <title>.'));

      if(!/<meta[^>]+name=["']description["']/i.test(text))
        res.unshift(issue('low','Meta description missing','SEO/social-preview snippet এর জন্য description নেই।'));

      if(/<meta[^>]+name=["']viewport["'][^>]+content=/i.test(text))
        res.unshift(pass('Mobile viewport','Responsive viewport meta tag found.'));
      else res.unshift(issue('medium','Mobile viewport missing','Add a viewport meta tag for proper mobile rendering.'));

      // Mixed content: an https page pulling http:// resources.
      if(isHttps&&/(?:src|href)=["']http:\/\/[^"']+["']/i.test(text))
        res.unshift(issue('high','Mixed content risk','HTTPS page-এ HTTP resource reference পাওয়া গেছে — browser ব্লক করতে পারে।'));

      [['content-security-policy','Content-Security-Policy'],
       ['x-content-type-options','X-Content-Type-Options'],
       ['referrer-policy','Referrer-Policy'],
       ['strict-transport-security','Strict-Transport-Security']].forEach(([key,label])=>{
        const value=r.headers.get(key);
        if(value) res.unshift(pass(label,value));
        else res.unshift(issue('low',`${label} missing`,'Consider enabling this security response header on the server.'));
      });

      state.results=res;
      render();
      notice('Link scan সম্পন্ন।',false);
    }catch(e){
      const reachable=await probeNoCors(url);
      state.files=null;
      state.source='URL: '+url;
      state.results=reachable
        ? [issue('medium','Content পড়া যায়নি (CORS)','URL-টি সাড়া দিচ্ছে বলে মনে হচ্ছে, কিন্তু browser CORS policy-এর কারণে এর content বিস্তারিত পড়া যায়নি। পূর্ণ scan-এর জন্য ZIP আপলোড করুন অথবা server-side scanner ব্যবহার করুন।')]
        : [issue('critical','URL unreachable',`কোনো response পাওয়া যায়নি: ${e.message||'network error'}। URL সঠিক কিনা এবং সাইটটি চালু আছে কিনা যাচাই করুন।`)];
      render();
      notice('Link scan সম্পন্ন (সীমিত)।',false);
    }
  }

  function runAudit(){state.results=auditFiles(state.files);render();notice(`${state.source} scan সম্পন্ন।`,false);}

  function notice(t,err){
    const n=$('jfAuditNotice');
    n.textContent=t;n.hidden=false;n.className='jf-notice '+(err?'jf-notice-error':'');
    if(!err) setTimeout(()=>{n.hidden=true;},2500);
  }

  function render(){
    const list=$('jfCheckList');
    list.innerHTML=state.results.map((r,i)=>{
      const icon=r.status==='pass'?'✅':r.status==='fixed'?'🔧':({critical:'🔴',high:'🟠',medium:'🟡',low:'🔵'}[r.severity]||'⚠️');
      const cls=r.status==='pass'?'pass':r.status==='fixed'?'pass':r.severity;
      const fixBtn=r.fix?`<button class="jf-btn jf-btn-small" data-fix="${i}">🚀 Upgrade/Fix</button>`:'';
      return `<div class="jf-check-item jf-check-${cls}"><span class="jf-check-icon">${icon}</span><div class="audit-item-body"><div class="jf-check-text">${esc(r.text)}</div><div class="jf-check-detail">${esc(r.detail)}</div>${fixBtn}</div></div>`;
    }).join('');
    const count=s=>state.results.filter(r=>r.status==='issue'&&r.severity===s).length;
    $('jfBadgeCritical').textContent=`🔴 Critical: ${count('critical')}`;
    $('jfBadgeHigh').textContent=`🟠 High: ${count('high')}`;
    $('jfBadgeMedium').textContent=`🟡 Medium: ${count('medium')}`;
    $('jfBadgeLow').textContent=`🔵 Low: ${count('low')}`;
    $('jfBadgePass').textContent=`✅ Passed: ${state.results.filter(r=>r.status==='pass').length}`;
    $('jfBadgeFixed').textContent=`🔧 Fixed: ${state.results.filter(r=>r.status==='fixed').length}`;
    $('jfAuditResult').hidden=false;
    list.querySelectorAll('[data-fix]').forEach(b=>{b.onclick=()=>applyFix(+b.dataset.fix);});
  }

  function applyFix(i){
    const r=state.results[i];
    if(!r||!r.fix||!state.files) return;
    r.fix();
    r.status='fixed';
    r.detail+=' — নিরাপদ automatic upgrade প্রয়োগ হয়েছে।';
    render();
    save();
  }

  function upgradeAll(){
    if(!state.files) return notice('আগে ZIP scan করুন।',true);
    let n=0;
    state.results.forEach(r=>{
      if(r.fix){r.fix();r.status='fixed';r.detail+=' — নিরাপদ automatic upgrade প্রয়োগ হয়েছে।';n++;}
    });
    render();
    save();
    notice(`${n}টি নিরাপদ সমস্যা Upgrade/Fix করা হয়েছে।`,false);
  }

  function save(){
    try{
      localStorage.setItem('jf_repaired_files',JSON.stringify(state.files));
      localStorage.setItem('jf_test_report',JSON.stringify({source:state.source,results:state.results,at:new Date().toISOString()}));
    }catch(e){}
  }

  async function download(){
    if(!state.files) return notice('আগে ZIP scan করুন।',true);
    const z=new JSZip();
    Object.entries(state.files).forEach(([p,c])=>{if(!p.startsWith('__remote__/')) z.file(p,c);});
    const b=await z.generateAsync({type:'blob'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(b);
    a.download='APYVION-UPGRADED-AUDIT.zip';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function upgradeCategory(category){
    if(!state.files) return notice('আগে ZIP scan করুন। Link scan-এর ক্ষেত্রে ZIP দিয়ে পূর্ণ upgrade package তৈরি করুন।',true);
    const matches={
      security:/security|https|mixed content|firestore|storage|secret|\.env|\.git|CSP|X-Content|Referrer|Strict-Transport|noopener|tabnabbing/i,
      seo:/title|meta description|viewport|social|SEO|open graph|og:/i,
      performance:/performance|slow|large|cache|script|image/i,
      firebase:/firebase|hosting|firestore|storage|config|project ID/i,
      quality:/duplicate|debugger|console|invalid|broken|README|JavaScript|CSS|TODO|FIXME/i
    };
    const re=matches[category];
    let n=0;
    state.results.forEach(r=>{
      if(r.fix && r.status==='issue' && re.test((r.text||'')+' '+(r.detail||''))){
        r.fix(); r.status='fixed'; r.detail+=' — category upgrade প্রয়োগ হয়েছে।'; n++;
      }
    });
    // Add a lightweight social/share layer to HTML pages when SEO/Social is requested.
    if(category==='seo'){
      Object.keys(state.files).filter(p=>/\.html?$/i.test(p)).forEach(p=>{
        let c=state.files[p];
        if(!/<meta[^>]+property=["']og:title/i.test(c)){
          const title=((c.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'APYVION').replace(/<[^>]+>/g,'').trim();
          const block=`\n<meta property="og:title" content="${title.replace(/"/g,'&quot;')}">\n<meta property="og:type" content="website">\n<meta property="og:url" content="">\n<meta name="twitter:card" content="summary">\n`;
          c=c.replace(/<\/head>/i,block+'</head>');
          state.files[p]=c; n++;
        }
      });
    }
    render(); save(); notice(`${n}টি ${category} upgrade প্রয়োগ হয়েছে।`,false);
  }

  function openShare(base){
    const input=$('jfShareUrl');
    let url=(input&&input.value.trim())||location.href;
    try{new URL(url)}catch{return notice('Share URL সঠিকভাবে দিন (https:// সহ)।',true);}
    window.open(base+encodeURIComponent(url),'_blank','noopener,noreferrer');
  }

  function getShareUrl(){
    const input=$('jfShareUrl');
    let url=(input&&input.value.trim())||location.href;
    try{new URL(url)}catch{notice('Share URL সঠিকভাবে দিন (https:// সহ)।',true);return null;}
    return url;
  }

  async function shareTikTok(){
    // TikTok-এর কোনো official public "share-by-URL" web intent নেই (WhatsApp/Facebook/LinkedIn-এর মতো),
    // তাই লিংক clipboard-এ কপি করে TikTok খুলে দেওয়া হয় যাতে ব্যবহারকারী নিজে পেস্ট করে শেয়ার করতে পারেন।
    const url=getShareUrl();
    if(!url) return;
    try{
      await navigator.clipboard.writeText(url);
      notice('লিংক কপি হয়েছে। TikTok খুলছে — নিজের পোস্ট/বায়োতে পেস্ট করুন।',false);
    }catch{
      notice('লিংক অটো-কপি করা যায়নি, তাই নিজে কপি করে TikTok-এ পেস্ট করুন: '+url,true);
    }
    window.open('https://www.tiktok.com/upload','_blank','noopener,noreferrer');
  }

  // App Builder থেকে "➡️ Test & Repair-এ পাঠান" বাটনে ক্লিক করলে built ফাইলগুলো
  // localStorage-এ (jf_built_files) সংরক্ষিত হয়ে এই পেজে আসা হয় — সেটা পাওয়া গেলে
  // স্বয়ংক্রিয়ভাবে audit চালানো হয়, যাতে ব্যবহারকারীকে আবার ZIP আপলোড করতে না হয়।
  function loadFromPipeline(){
    try{
      const raw=localStorage.getItem('jf_built_files');
      if(!raw) return false;
      const files=JSON.parse(raw);
      if(!files||typeof files!=='object') return false;
      state.files=files;
      state.source='App Builder থেকে প্রাপ্ত ফাইল';
      runAudit();
      return true;
    }catch(e){return false;}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    loadFromPipeline();
    $('jfZipScanBtn').onclick=scanZip;
    $('jfUrlScanBtn').onclick=scanUrl;
    $('jfUpgradeAllBtn').onclick=upgradeAll;
    $('jfRetestBtn').onclick=()=>{if(state.files) runAudit(); else notice('আগে ZIP scan করুন।',true);};
    $('jfDownloadBtn').onclick=download;
    document.querySelectorAll('[data-upgrade-category]').forEach(b=>{b.onclick=()=>upgradeCategory(b.dataset.upgradeCategory);});
    const shareUrl=$('jfShareUrl');
    if(shareUrl) shareUrl.value=location.href;
    $('jfWhatsAppShare').onclick=()=>openShare('https://wa.me/?text=');
    $('jfFacebookShare').onclick=()=>openShare('https://www.facebook.com/sharer/sharer.php?u=');
    $('jfMessengerShare').onclick=()=>openShare('https://www.facebook.com/dialog/send?link=');
    $('jfTikTokShare').onclick=shareTikTok;
    $('jfLinkedInShare').onclick=()=>openShare('https://www.linkedin.com/sharing/share-offsite/?url=');
    $('jfXShare').onclick=()=>openShare('https://twitter.com/intent/tweet?url=');
    $('jfPinterestShare').onclick=()=>openShare('https://pinterest.com/pin/create/button/?url=');
    $('jfRedditShare').onclick=()=>openShare('https://www.reddit.com/submit?url=');
    $('jfTumblrShare').onclick=()=>openShare('https://www.tumblr.com/share/link?url=');
  });
})();

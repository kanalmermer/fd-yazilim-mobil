(function(root){
    'use strict';
    const size=25,descriptors=[
        {selector:'#avansKayitListesiBody',filters:['avansKayitArama','avansKayitAyFiltre','avansKayitSubeFiltre','avansKayitDurumFiltre']},
        {selector:'#avansKesintiBody',filters:['avansListeAy']},
        {selector:'#avansGelecekBody',filters:['avansGelecekBaslangicAy','avansGelecekBitisAy']},
        {selector:'#aracCezaBody',filters:['aracCezaAra','aracCezaYil']},
        {selector:'#policeTakipBody',filters:['policeArama','policeHedefFiltre','policeTurFiltre','policeDurumFiltre']},
        {selector:'#adminUserTable tbody',search:true,filters:[]}
    ],states=new Map(),selector=descriptors.map(d=>d.selector).join(',');
    const identity=()=>typeof activeUser==='undefined'||!activeUser?'':JSON.stringify([activeUser.supabaseUserId||activeUser.id||activeUser.username,activeUser.sirketId,activeUser.rol]);
    const norm=v=>String(v||'').toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim();
    let scheduled=false;
    function paint(state){
        const {body,descriptor,nav,info,label,prev,next}=state;if(!body.isConnected)return;
        if(state.empty&&!state.empty.isConnected)state.empty=null;
        const key=identity()+'|'+JSON.stringify(descriptor.filters.map(id=>root.document.getElementById(id)?.value||''));
        if(key!==state.key){state.key=key;state.page=1;if(state.actor!==identity()){state.query='';if(state.input)state.input.value='';state.actor=identity();}}
        const rows=[...body.rows].filter(row=>!row.hasAttribute('data-fd-page-empty')&&row.cells.length>1);
        const matches=descriptor.search?rows.filter(row=>!state.query||norm((row.cells[1]?.textContent||'')+' '+(row.cells[3]?.textContent||'')).includes(state.query)):rows;
        const pages=Math.max(1,Math.ceil(matches.length/size));state.page=Math.max(1,Math.min(state.page,pages));
        const visible=new Set(matches.slice((state.page-1)*size,state.page*size)),filtered=new Set(matches);
        for(const row of rows){row.setAttribute('data-fd-page-row','');row.hidden=!visible.has(row);row.dataset.fdSearchHidden=String(!filtered.has(row));}
        if(state.empty)state.empty.hidden=!(descriptor.search&&rows.length&&!matches.length);
        if(descriptor.search&&rows.length&&!matches.length&&!state.empty){const row=body.insertRow();row.setAttribute('data-fd-page-empty','');const cell=row.insertCell();cell.colSpan=body.closest('table').tHead?.rows[0]?.cells.length||6;cell.textContent='Aramaya uygun kullanıcı bulunamadı.';cell.style.cssText='padding:20px;text-align:center;color:#64748b';state.empty=row;}
        info.textContent=matches.length?((state.page-1)*size+1)+'–'+Math.min(state.page*size,matches.length)+' / '+matches.length+' kayıt':'0 kayıt';
        label.textContent=state.page+' / '+pages;prev.disabled=state.page<=1;next.disabled=state.page>=pages;nav.hidden=matches.length<=size&&!descriptor.search;
    }
    function bind(descriptor,body){
        const table=body.closest('table'),wrap=table.closest('.table-wrapper')||table;
        const nav=root.document.createElement('nav');nav.className='fd-list-pages';nav.setAttribute('aria-label','Liste sayfaları');nav.dataset.fdPagesFor=body.id||'adminUserTable';
        const info=root.document.createElement('span');info.setAttribute('role','status');info.setAttribute('aria-live','polite');
        const controls=root.document.createElement('div');controls.className='fd-list-page-controls';
        const prev=root.document.createElement('button'),next=root.document.createElement('button'),label=root.document.createElement('span');prev.type=next.type='button';prev.textContent='Önceki';next.textContent='Sonraki';controls.append(prev,label,next);nav.append(info,controls);wrap.after(nav);
        const state={descriptor,body,nav,info,label,prev,next,page:1,query:'',key:'',actor:identity(),search:null,input:null,empty:null};
        prev.onclick=()=>{state.page--;paint(state);};next.onclick=()=>{state.page++;paint(state);};
        if(descriptor.search){const search=root.document.createElement('div');search.className='fd-user-search';const title=root.document.createElement('label'),input=root.document.createElement('input');title.htmlFor='fdUserListSearch';title.textContent='Kullanıcı ara';input.id='fdUserListSearch';input.type='search';input.placeholder='Kullanıcı adı, ad soyad veya T.C.';input.autocomplete='off';input.setAttribute('data-case-preserve','true');input.addEventListener('input',()=>{state.query=norm(input.value);state.page=1;paint(state);});search.append(title,input);wrap.before(search);state.search=search;state.input=input;}
        states.set(descriptor.selector,state);return state;
    }
    function flush(){scheduled=false;for(const descriptor of descriptors){const body=root.document.querySelector(descriptor.selector);let state=states.get(descriptor.selector);if(state&&state.body!==body){state.nav.remove();state.search?.remove();states.delete(descriptor.selector);state=null;}if(body){if(!state)state=bind(descriptor,body);paint(state);}}}
    function schedule(){if(!scheduled){scheduled=true;root.queueMicrotask(flush);}}
    const observer=new MutationObserver(records=>{if(records.some(r=>r.target.nodeType===1&&r.target.closest?.(selector)||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches(selector)||n.querySelector(selector)))))schedule();});
    observer.observe(root.document.body,{childList:true,subtree:true});
    root.document.addEventListener('fd:module-mounted',schedule);root.fdListPages=Object.freeze({flush,pageSize:size});flush();
})(window);

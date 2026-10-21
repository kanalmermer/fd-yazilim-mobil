(function(root){
    'use strict';
    const keys=['vardiya','personeller','subeler','izinler','puantaj'];
    const filterIds=new Set(['magicpassAy','magicpassPersonel','magicpassSubeFiltre','magicpassPersonelAra','magicpassGunlukTarih','magicpassGunlukSube','magicpassGunlukDurum']);
    const checks=new Map(),jobs=new Map(),locked=new Map();
    let identity='',prepared='',generation=0,followup=null,followupOpening=false;
    const el=id=>root.document.getElementById(id);
    const owned=()=>typeof SUPABASE_MODE!=='undefined'&&SUPABASE_MODE&&root.fdAttendanceFast?.refresh===refresh;
    const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function actor(){
        if(typeof activeUser==='undefined'||!activeUser)return '';
        return JSON.stringify([activeUser.supabaseUserId||activeUser.id||activeUser.username||'',activeUser.sirketId||'',activeUser.rol||'',activeUser.tcNo||'',typeof anaMenuModulYetkisi==='function'?anaMenuModulYetkisi('personel'):'']);
    }
    function allowed(key=actor()){
        return Boolean(key&&key===actor()&&activeUser?.sirketId&&typeof SUPABASE_MODE!=='undefined'&&SUPABASE_MODE&&typeof supabaseClient!=='undefined'&&supabaseClient&&
            typeof kullaniciRolAnahtari==='function'&&['admin','yonetici','kullanici','personel'].includes(kullaniciRolAnahtari())&&
            typeof anaMenuModulErisimiVar==='function'&&anaMenuModulErisimiVar('personel')&&typeof fdPortalVeriOturumuGecerli==='function'&&typeof fdPortalVeriOturumu==='function'&&fdPortalVeriOturumuGecerli(fdPortalVeriOturumu()));
    }
    function visible(node=el('magicpassApp')){
        if(!node?.isConnected)return false;
        for(let current=node;current;current=current.parentElement){const style=root.getComputedStyle(current);if(current.hidden||style.display==='none'||style.visibility==='hidden')return false;}
        return true;
    }
    function blocked(){
        if(!owned()||!root.FDModules||root.document.hidden||!visible()||!allowed())return true;
        if((typeof supabaseKaydetmeBekleyen!=='undefined'&&supabaseKaydetmeBekleyen>0)||(typeof magicpassDuzeltmeKayitIslemi!=='undefined'&&magicpassDuzeltmeKayitIslemi))return true;
        const focus=root.document.activeElement;
        if(focus&&(focus.isContentEditable||(['INPUT','TEXTAREA','SELECT'].includes(focus.tagName)&&!filterIds.has(focus.id))))return true;
        if([...root.document.querySelectorAll('.modal-overlay,[aria-modal="true"],#fdOrtakCiktiOnizleme,#fdUnifiedOutputModal')].some(node=>visible(node)))return true;
        return visible(el('globalOverlay'));
    }
    function initMonth(){
        const month=el('magicpassAy');if(!month)return;
        if(!month.value)month.value=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date());
    }
    function year(){initMonth();const value=String(el('magicpassAy')?.value||'');return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)?Number(value.slice(0,4)):Number(new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',year:'numeric'}).format(new Date()));}
    function loaded(key,selectedYear){
        if(typeof yuklenenVeriler==='undefined'||!yuklenenVeriler.has(key))return false;
        if(key==='vardiya'&&root.fdVardiyaKismiYuklemeAktifMi?.())return false;
        return key!=='puantaj'||(typeof fdUzakAnahtarSonYukleme!=='undefined'&&Number(fdUzakAnahtarSonYukleme.get(fdPortalVeriOturumu()+'|puantaj-yuklu-yil'))===selectedYear);
    }
    function complete(selectedYear){return keys.every(key=>loaded(key,selectedYear));}
    function syncIdentity(){
        const current=actor();if(current===identity)return;
        identity=current;prepared='';generation++;checks.clear();setCold(false);status('');
    }
    function status(message,retry=false){
        const host=el('magicpassApp'),nav=el('magicpassAltSekmeler');if(!host||!nav)return;
        let box=host.querySelector('[data-fd-attendance-load]');
        if(!box){box=root.document.createElement('div');box.className='fd-attendance-load';box.setAttribute('data-fd-attendance-load','');box.setAttribute('role','status');box.setAttribute('aria-live','polite');nav.after(box);}
        box.replaceChildren();box.hidden=!message;box.dataset.state=retry?'error':'loading';
        if(!message)return;
        const label=root.document.createElement('span');label.textContent=message;box.appendChild(label);
        if(retry){const button=root.document.createElement('button');button.type='button';button.textContent='Tekrar dene';button.setAttribute('data-fd-attendance-retry','');button.onclick=()=>refresh({priority:true,force:true});box.appendChild(button);}
    }
    function setCold(cold){
        const host=el('magicpassApp');if(!host)return;host.classList.toggle('fd-attendance-cold',cold);host.setAttribute('aria-busy',String(cold));
        if(cold){for(const node of host.querySelectorAll('.magicpass-rapor-layout,.magicpass-gunluk-kart')){if(!locked.has(node))locked.set(node,{inert:node.inert,busy:node.getAttribute('aria-busy')});node.inert=true;node.setAttribute('aria-busy','true');}}
        else{for(const [node,before]of locked){node.inert=before.inert;if(before.busy===null)node.removeAttribute('aria-busy');else node.setAttribute('aria-busy',before.busy);}locked.clear();}
    }
    function view(){
        const values=Object.fromEntries([...filterIds].map(id=>{const node=el(id);return[id,node?{value:node.value,options:node.options?.length||0}:null];}));
        const scroll=[...root.document.querySelectorAll('#magicpassApp .table-wrapper,#magicpassSolPersonelListesi')].map(node=>({node,top:node.scrollTop,left:node.scrollLeft}));
        return{values,scroll,x:root.scrollX,y:root.scrollY};
    }
    function restore(state,first=false){
        for(const [id,saved]of Object.entries(state.values)){const node=el(id);if(!node||!saved)continue;if(node.tagName==='SELECT'){if(first&&saved.options<=1&&!saved.value)continue;if([...node.options].some(option=>option.value===saved.value))node.value=saved.value;}else node.value=saved.value;}
        for(const {node,top,left}of state.scroll)if(node.isConnected){node.scrollTop=top;node.scrollLeft=left;}
        if(root.scrollX!==state.x||root.scrollY!==state.y)root.scrollTo(state.x,state.y);
    }
    function rebuildSelectors(){
        const select=el('magicpassPersonel'),branch=el('magicpassSubeFiltre');if(!select||!branch)return;
        const selected=select.value,oldBranch=branch.value;
        const people=personeller.filter(person=>aktifSirketeAit(person)&&(!isPersonelUser()||String(person.id)===String(activeUser.tcNo||''))).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
        const active=people.filter(person=>!magicpassPersonelAyrilmisMi(person)),exited=people.filter(magicpassPersonelAyrilmisMi);
        select.innerHTML='<option value="">Personel seçin</option>'+people.map(person=>'<option value="'+escape(person.id)+'">'+escape(person.ad||'-')+' · Cihaz: '+escape(person.cihazPersonelNo||'tanımsız')+(magicpassPersonelAyrilmisMi(person)?' · Ayrıldı: '+escape(tarihFormati(person.cikisTarihi)):'')+'</option>').join('');
        const names=[...new Set(active.map(person=>person.sube||'Merkez'))].sort((a,b)=>String(a).localeCompare(String(b),'tr'));
        branch.innerHTML='<option value="">Tüm şubeler</option>'+names.map(name=>'<option value="'+escape(name)+'">'+escape(name)+'</option>').join('')+(exited.length?'<option value="__ayrilan__">Ayrılan Personeller ('+exited.length+')</option>':'');
        if([...branch.options].some(option=>option.value===oldBranch))branch.value=oldBranch;
        const eligible=magicpassFiltreliPersoneller(false);select.value=eligible.some(person=>String(person.id)===String(selected))?selected:String(eligible[0]?.id||'');
    }
    function redraw(first=false){
        const state=view();
        if(first){magicpassArayuzunuHazirla();restore(state,true);}
        else rebuildSelectors();
        const daily=el('magicpass-tab-gunluk')?.classList.contains('active'),monthly=el('magicpass-tab-liste')?.classList.contains('active');
        if(daily){const selected=el('magicpassGunlukSube')?.value;magicpassGunlukRaporSubeleriniHazirla();const branch=el('magicpassGunlukSube');if(branch&&[...branch.options].some(option=>option.value===selected))branch.value=selected;magicpassGunlukRaporuCiz();}
        else if(monthly)magicpassAylikCizelgeyiCiz();
        for(const {node,top,left}of state.scroll)if(node.isConnected){node.scrollTop=top;node.scrollLeft=left;}
        if(root.scrollX!==state.x||root.scrollY!==state.y)root.scrollTo(state.x,state.y);
        prepared=actor();
    }
    function refresh(options={}){
        try{
        if(!owned())return Promise.resolve(false);
        syncIdentity();if(blocked())return Promise.resolve(false);
        const key=identity,selectedYear=year(),jobKey=key+'|'+selectedYear,cold=!complete(selectedYear);
        if(cold){setCold(true);status('Giriş-çıkış kayıtları yükleniyor…');}
        const sameJob=jobs.get(jobKey);if(sameJob?.fdAttendanceTicket===generation)return sameJob;
        if(jobs.size){
            generation++;followupOpening=followupOpening||Boolean(options.opening);
            if(!followup)followup=Promise.allSettled([...jobs.values()]).then(()=>{const opening=followupOpening;followup=null;followupOpening=false;return refresh({priority:true,force:true,opening});});
            return followup;
        }
        const last=checks.get(jobKey)||0,interval=options.priority?3000:30000;
        if(!options.force&&!cold&&Date.now()-last<interval)return Promise.resolve(false);
        const ticket=++generation,current=()=>ticket===generation&&allowed(key)&&year()===selectedYear&&!blocked();
        let work;work=Promise.resolve().then(async()=>{
            try{
                let companyChanged=false;
                if(options.opening||cold){companyChanged=await supabaseVerileriniYukle('vardiya',selectedYear,{anahtarlar:[],fdIsCurrent:current});if(!current())return false;}
                const own=isPersonelUser(),known=keys.filter(name=>loaded(name,selectedYear)),missing=keys.filter(name=>!known.includes(name));
                const changed=own?keys:known.length?await fdUzakDegisenAnahtarlariGetir(known,selectedYear):[];
                if(!current())return false;
                const requested=[...new Set([...missing,...changed])];
                if(requested.length){
                    await supabaseVerileriniYukle('vardiya',selectedYear,{anahtarlar:requested,sirketYukle:false,onbellekKullan:false,yerelDegisiklikleriKoru:true,vardiyaHizliOkuma:true,vardiyaBirlesimliYenile:true,fdIsCurrent:current});
                    if(!current())return false;
                }
                if(!complete(selectedYear))throw Error('Giriş-çıkış kayıtlarının tamamı henüz yüklenemedi.');
                if(cold||requested.length||companyChanged||prepared!==key)redraw(prepared!==key);
                if(!current())return false;
                setCold(false);status('');checks.set(jobKey,Date.now());return true;
            }catch(error){if(allowed(key)&&visible()&&year()===selectedYear&&!blocked()){if(cold)setCold(true);status('Giriş-çıkış listesi yenilenemedi. Mevcut kayıtlarınız korunuyor.',true);}return false;}
            finally{if(jobs.get(jobKey)===work)jobs.delete(jobKey);}
        });
        work.fdAttendanceTicket=ticket;jobs.set(jobKey,work);return work;
        }catch(error){if(allowed()&&visible())status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);return Promise.resolve(false);}
    }
    function open(){
        try{
        if(!owned())return Promise.resolve(false);
        syncIdentity();initMonth();if(!allowed()||!visible())return Promise.resolve(false);
        const ready=complete(year());
        if(ready&&!blocked()){redraw(prepared!==identity);setCold(false);}
        else if(!ready){setCold(true);status('Giriş-çıkış kayıtları yükleniyor…');}
        const work=refresh({priority:true,opening:true});
        if(ready){work.catch(()=>{});return Promise.resolve(true);}return work.catch(()=>false);
        }catch(error){if(allowed()&&visible())status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);return Promise.resolve(false);}
    }
    async function readArchive(queryPage,size=1000,isCurrent){
        if(typeof queryPage!=='function'||typeof isCurrent!=='function'||!Number.isInteger(size)||size<1||size>1000)throw Error('Giriş-çıkış arşiv okuma kapsamı geçersiz.');
        const check=()=>{if(!isCurrent())throw Error('Giriş-çıkış yükleme oturumu değişti.');};
        const read=async start=>{check();const rows=await queryPage(start,start+size-1);check();if(!Array.isArray(rows)||rows.length>size||rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw Error('Giriş-çıkış arşiv yanıtı doğrulanamadı.');return rows;};
        const result=[],ids=new Set(),append=rows=>{for(const row of rows){if(row.id!==undefined&&row.id!==null){const id=String(row.id).trim();if(id&&ids.has(id))throw Error('Giriş-çıkış arşivinde yinelenen kayıt bulundu.');if(id)ids.add(id);}result.push(row);}};
        const first=await read(0);append(first);if(first.length<size)return result;
        for(let start=size;;start+=size*3){
            const packets=await Promise.all([0,1,2].map(offset=>read(start+offset*size)));check();
            const end=packets.findIndex(packet=>packet.length<size);
            if(end>=0&&packets.slice(end+1).some(packet=>packet.length))throw Error('Giriş-çıkış arşiv sayfaları tutarsız. Listeyi yeniden yükleyin.');
            for(const packet of (end<0?packets:packets.slice(0,end+1)))append(packet);
            if(end>=0)return result;
        }
    }
    function validateMerge(rows,before){
        const company=String(typeof aktifSirketId==='function'?aktifSirketId():'');
        if(!company||!before||typeof before!=='object'||String(before.company||'')!==company||!Array.isArray(rows)||!Array.isArray(before.local)||!Array.isArray(before.baseline)||!Array.isArray(vardiyaKayitlari))throw Error('Giriş-çıkış birleştirme kapsamı doğrulanamadı.');
        let snapshot;try{snapshot=JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]');}catch(_){throw Error('Giriş-çıkış kayıt görüntüsü okunamadı.');}
        if(!Array.isArray(snapshot))throw Error('Giriş-çıkış kayıt görüntüsü geçersiz.');
        const inspect=(list,remote)=>{const ids=new Set();for(const row of list){if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Giriş-çıkış kaydı geçersiz.');const owner=String(row.sirketId||'').trim();if(owner&&owner!==company){if(remote)throw Error('Giriş-çıkış şirket kapsamı doğrulanamadı.');continue;}if(remote&&typeof isPersonelUser==='function'&&isPersonelUser()){const ownPerson=String(activeUser?.tcNo||'').trim();for(const field of ['pId','personelId','employee_legacy_id','tcNo']){const person=String(row[field]??'').trim();if(person&&person!==ownPerson)throw Error('Giriş-çıkış personel kapsamı doğrulanamadı.');}}if(typeof row.id!=='string'&&(typeof row.id!=='number'||!Number.isFinite(row.id)))throw Error('Giriş-çıkış kayıt kimliği geçersiz.');const id=String(row.id??'').trim();if(!id||ids.has(id))throw Error('Giriş-çıkış kayıt kimliği eksik veya yinelenmiş.');ids.add(id);}};
        inspect(rows,true);for(const list of [before.local,before.baseline,vardiyaKayitlari,snapshot])inspect(list,false);return true;
    }
    root.fdAttendanceFast={open,refresh,readArchive,validateMerge};
    root.setInterval(()=>{if(visible()&&!root.document.hidden)refresh({priority:true}).catch(()=>{});},30000);
    root.addEventListener('focus',()=>{if(visible())refresh({priority:true}).catch(()=>{});});
    root.document.addEventListener('visibilitychange',()=>{if(root.document.hidden){generation++;return;}if(visible())refresh({priority:true}).catch(()=>{});});
    root.document.addEventListener('change',event=>{if(!owned()||!filterIds.has(event.target?.id)||!visible())return;if(!complete(year()))setCold(true);refresh({priority:true}).catch(()=>{});},true);
    root.document.addEventListener('click',event=>{if(!owned())return;const button=event.target?.closest?.('#magicpassApp button');if(!button)return;const code=button.getAttribute('onclick')||'';if(/magicpassAyDegistir|magicpassGunlukTarihDegistir|magicpassSekmeAc/.test(code)){if(!complete(year()))setCold(true);else if(/magicpassSekmeAc/.test(code)&&!blocked()){try{redraw(prepared!==actor());}catch(error){status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);}}refresh({priority:true}).catch(()=>{});}});
})(window);

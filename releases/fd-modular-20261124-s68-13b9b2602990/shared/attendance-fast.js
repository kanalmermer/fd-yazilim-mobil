(function(root){
    'use strict';
    const keys=['vardiya','personeller','subeler','izinler','puantaj'];
    const filterIds=new Set(['magicpassAy','magicpassPersonel','magicpassSubeFiltre','magicpassPersonelAra','magicpassGunlukTarih','magicpassGunlukSube','magicpassGunlukDurum']);
    const checks=new Map(),jobs=new Map(),locked=new Map(),coldPending=new Set();
    let identity='',prepared='',generation=0,followup=null,followupOpening=false;
    let loading=null;
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
        if([...root.document.querySelectorAll('.modal-overlay,[aria-modal="true"],#fdOrtakCiktiOnizleme,#fdUnifiedOutputModal')].some(node=>node!==loading?.node&&visible(node)))return true;
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
    function recordsComplete(selectedYear){return keys.every(key=>loaded(key,selectedYear));}
    function complete(selectedYear){return recordsComplete(selectedYear)&&!coldPending.has(actor()+'|'+selectedYear);}
    function syncIdentity(){
        const current=actor();if(current===identity)return;
        closeLoading(loading);
        identity=current;prepared='';generation++;checks.clear();setCold(false);status('');
    }
    // This layer owns no global save/output elements. Percent means completed
    // phases (settings, missing records, freshness checks, drawing), not bytes.
    function closeLoading(state){
        if(!state)return;
        root.clearInterval(state.watch);root.clearTimeout(state.finish);state.observer?.disconnect();
        const focused=root.document.activeElement===state.node;
        state.node.remove();if(loading===state)loading=null;
        if(focused&&state.current()&&state.focus?.isConnected&&visible(state.focus))state.focus.focus({preventScroll:true});
    }
    function beginLoading(current){
        closeLoading(loading);
        const node=root.document.createElement('div');node.id='fdAttendanceLoading';node.className='fd-attendance-loading';
        node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-labelledby','fdAttendanceLoadingTitle');node.tabIndex=-1;
        node.innerHTML='<div class="fd-attendance-loading-card"><div class="big-spinner" aria-hidden="true"></div><h3 id="fdAttendanceLoadingTitle">Yükleniyor</h3><p>Giriş–çıkış kayıtları hazırlanıyor.</p><div class="fd-attendance-loading-progress" role="progressbar" aria-label="Tamamlanan yükleme adımları" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><strong data-attendance-percent>0%</strong></div>';
        const state={node,current,focus:root.document.activeElement,steps:new Set(),completed:false};loading=state;root.document.body.appendChild(node);
        node.addEventListener('keydown',event=>{if(event.key==='Tab'||event.key==='Escape'){event.preventDefault();event.stopPropagation();}});
        node.focus({preventScroll:true});
        const check=()=>{if(!state.current())closeLoading(state);};
        state.watch=root.setInterval(check,200);
        state.observer=new MutationObserver(check);state.observer.observe(root.document.body,{subtree:true,attributes:true,attributeFilter:['style','class','hidden']});
        return state;
    }
    function loadingStep(state,name){
        if(!state||loading!==state)return;
        if(!state.current()){closeLoading(state);return;}
        state.steps.add(name);const percent=state.steps.size*25;
        const bar=state.node.querySelector('[role="progressbar"]');bar.setAttribute('aria-valuenow',String(percent));bar.firstElementChild.style.width=percent+'%';
        state.node.querySelector('[data-attendance-percent]').textContent=percent+'%';
        if(percent===100){state.completed=true;state.finish=root.setTimeout(()=>closeLoading(state),120);}
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
        for(const [id,saved]of Object.entries(state.values)){const node=el(id);if(!node||!saved||first&&['magicpassSubeFiltre','magicpassPersonel'].includes(id))continue;if(node.tagName==='SELECT'){if(first&&saved.options<=1&&!saved.value)continue;if([...node.options].some(option=>option.value===saved.value))node.value=saved.value;}else node.value=saved.value;}
        for(const {node,top,left}of state.scroll)if(node.isConnected){node.scrollTop=top;node.scrollLeft=left;}
        if(root.scrollX!==state.x||root.scrollY!==state.y)root.scrollTo(state.x,state.y);
    }
    function rebuildSelectors(first=false,state=null){
        const select=el('magicpassPersonel'),branch=el('magicpassSubeFiltre');if(!select||!branch)return;
        const selected=select.value,oldBranch=branch.value;
        const people=personeller.filter(person=>aktifSirketeAit(person)&&(!isPersonelUser()||String(person.id)===String(activeUser.tcNo||''))).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
        const active=people.filter(person=>!magicpassPersonelAyrilmisMi(person)),exited=people.filter(magicpassPersonelAyrilmisMi);
        select.innerHTML='<option value="">Personel seçin</option>'+people.map(person=>'<option value="'+escape(person.id)+'">'+escape(person.ad||'-')+' · Cihaz: '+escape(person.cihazPersonelNo||'tanımsız')+(magicpassPersonelAyrilmisMi(person)?' · Ayrıldı: '+escape(tarihFormati(person.cikisTarihi)):'')+'</option>').join('');
        const names=[...new Set(active.map(person=>person.sube||'Merkez'))].sort((a,b)=>String(a).localeCompare(String(b),'tr'));
        branch.innerHTML='<option value="">Tüm şubeler</option>'+names.map(name=>'<option value="'+escape(name)+'">'+escape(name)+'</option>').join('')+(exited.length?'<option value="__ayrilan__">Ayrılan Personeller ('+exited.length+')</option>':'');
        if([...branch.options].some(option=>option.value===oldBranch))branch.value=oldBranch;
        let preferred=selected;
        if(first){
            if(!people.some(person=>String(person.id)===String(preferred)))preferred=String(active.find(person=>person.cihazPersonelNo)?.id||active[0]?.id||'');
            let remembered=null;try{remembered=root.localStorage.getItem(magicpassSubeHafizaAnahtari());}catch(_){}
            delete branch.dataset.fabrikaVarsayilan;
            branch.value=remembered!==null&&[...branch.options].some(option=>option.value===remembered)?remembered:(fdFabrikaSubeDegeri(branch)||'');
            if(!branch.dataset.hafizaBagli){branch.dataset.hafizaBagli='1';branch.addEventListener('change',magicpassSubeFiltresiniHatirla);}
            if(!root.document.body.dataset.magicpassMenuBagli){root.document.body.dataset.magicpassMenuBagli='1';root.document.addEventListener('click',event=>{if(!event.target.closest('#magicpassVardiyaMenu')){const menu=el('magicpassVardiyaMenu');if(menu)menu.style.display='none';}});}
        }
        const eligible=magicpassFiltreliPersoneller(false);select.value=eligible.some(person=>String(person.id)===String(preferred))?preferred:String(eligible[0]?.id||'');
        if(first&&state)restore(state,true);
        magicpassPersonelListesiCiz();
        if(first&&typeof magicpassDosyaDurumunuGuncelle==='function')Promise.resolve().then(()=>magicpassDosyaDurumunuGuncelle()).catch(error=>root.console.warn('Giriş-çıkış dosya durumu alınamadı:',error));
    }
    function redraw(first=false){
        const state=view();
        rebuildSelectors(first,state);
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
        syncIdentity();if(monthlyActive())return options.manual?monthlyRefresh():Promise.resolve(false);if(blocked())return Promise.resolve(false);
        const key=identity,selectedYear=year(),jobKey=key+'|'+selectedYear,cold=!complete(selectedYear);
        if(cold){coldPending.add(jobKey);setCold(true);status('');}
        const sameJob=jobs.get(jobKey);if(sameJob?.fdAttendanceTicket===generation)return sameJob;
        if(jobs.size){
            generation++;followupOpening=followupOpening||Boolean(options.opening);
            if(!followup)followup=Promise.allSettled([...jobs.values()]).then(()=>{const opening=followupOpening;followup=null;followupOpening=false;return refresh({priority:true,force:true,opening});});
            return followup;
        }
        const last=checks.get(jobKey)||0,interval=options.priority?3000:30000;
        if(!options.force&&!cold&&Date.now()-last<interval)return Promise.resolve(false);
        const ticket=++generation,current=()=>ticket===generation&&allowed(key)&&year()===selectedYear&&!blocked();
        const presentation=cold?beginLoading(current):null;
        const phase=(name,promise)=>Promise.resolve(promise).then(value=>{loadingStep(presentation,name);return value;});
        let work;work=Promise.resolve().then(async()=>{
            try{
                const own=isPersonelUser(),known=keys.filter(name=>loaded(name,selectedYear)),missing=keys.filter(name=>!known.includes(name));
                const requested=new Set(own?keys:missing);
                const load=names=>names.length?supabaseVerileriniYukle('vardiya',selectedYear,{anahtarlar:names,sirketYukle:false,onbellekKullan:false,yerelDegisiklikleriKoru:true,vardiyaHizliOkuma:true,vardiyaBirlesimliYenile:true,fdIsCurrent:current}):Promise.resolve(false);
                // Start missing records immediately: neither settings nor checks of
                // already-loaded records belong in front of the cold archive read.
                const companyWork=phase('settings',options.opening||cold?supabaseVerileriniYukle('vardiya',selectedYear,{anahtarlar:[],fdIsCurrent:current}):Promise.resolve(false));
                const missingWork=phase('records',load([...requested]));
                const changedWork=phase('freshness',(async()=>{
                    if(own||!known.length)return false;
                    const changed=await fdUzakDegisenAnahtarlariGetir(known,selectedYear);
                    if(!current())return false;
                    for(const name of changed)requested.add(name);
                    return load(changed);
                })());
                // Do not release this controller job while a sibling read can still
                // update its scoped snapshot after another branch has failed.
                const outcomes=await Promise.allSettled([companyWork,missingWork,changedWork]);
                if(!current())return false;
                const failed=outcomes.find(result=>result.status==='rejected');if(failed)throw failed.reason;
                if(!recordsComplete(selectedYear))throw Error('Giriş-çıkış kayıtlarının tamamı henüz yüklenemedi.');
                if(cold||requested.size||outcomes[0].value||prepared!==key)redraw(prepared!==key);
                if(!current())return false;
                coldPending.delete(jobKey);
                loadingStep(presentation,'drawing');
                setCold(false);status('');checks.set(jobKey,Date.now());return true;
            }catch(error){if(allowed(key)&&visible()&&year()===selectedYear&&!blocked()){if(cold)setCold(true);status('Giriş-çıkış listesi yenilenemedi. Mevcut kayıtlarınız korunuyor.',true);}return false;}
            finally{if(!presentation?.completed)closeLoading(presentation);if(jobs.get(jobKey)===work)jobs.delete(jobKey);}
        });
        work.fdAttendanceTicket=ticket;jobs.set(jobKey,work);return work;
        }catch(error){if(allowed()&&visible())status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);return Promise.resolve(false);}
    }
    function open(){
        try{
        if(!owned())return Promise.resolve(false);
        syncIdentity();initMonth();if(monthlyActive())return monthlyOpen();if(!allowed()||!visible())return Promise.resolve(false);
        const ready=complete(year());
        if(ready&&!blocked()){redraw(prepared!==identity);setCold(false);}
        else if(!ready){setCold(true);status('');}
        const work=refresh({priority:true,opening:true});
        if(ready){work.catch(()=>{});return Promise.resolve(true);}return work.catch(()=>false);
        }catch(error){if(allowed()&&visible())status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);return Promise.resolve(false);}
    }
    let monthlyLoaded='',monthlyGeneration=0,monthlyJob=null,monthlyApplying=false;
    const monthlyLocks=new Map();
    const monthlyActive=()=>el('magicpass-tab-liste')?.classList.contains('active');
    const monthlySelection=()=>JSON.stringify([actor(),el('magicpassAy')?.value||'',el('magicpassPersonel')?.value||'',el('magicpassSubeFiltre')?.value||'']);
    function monthlyControls(ready){
        const section=el('magicpass-tab-liste');if(!section)return;
        for(const b of section.querySelectorAll('button')){const code=b.getAttribute('onclick')||'',label=b.getAttribute('aria-label')||'';if(!/magicpassAylikExcelAl|magicpassAylikPdfAl|magicpassSeciliAyinHam|magicpassTopluSaat/.test(code)&&label!=='Yazdır / dışa aktar')continue;if(!ready){if(!monthlyLocks.has(b))monthlyLocks.set(b,b.disabled);b.disabled=true;}}
        if(ready){for(const[b,disabled]of monthlyLocks)if(b.isConnected)b.disabled=disabled;monthlyLocks.clear();}
    }
    function monthlyClear(message='Personeli ve ayı seçip Yenile’ye basın.'){
        const body=el('magicpassAylikTablo')?.tBodies?.[0];if(body){body.replaceChildren();const row=body.insertRow(),cell=row.insertCell();cell.colSpan=12;cell.textContent=message;cell.style.cssText='padding:24px;text-align:center;color:#64748b';}
        el('magicpassOzet')?.replaceChildren();const photo=el('fdAttendancePersonPhoto');if(photo){photo.replaceChildren();photo.hidden=true;}if(typeof magicpassSeciliGunler!=='undefined')magicpassSeciliGunler.clear();monthlyControls(false);setCold(false);
        const p=typeof personeller!=='undefined'?personeller.find(p=>String(p.id)===String(el('magicpassPersonel')?.value)):null;if(el('magicpassSeciliPersonelBaslik'))el('magicpassSeciliPersonelBaslik').textContent=p?.ad||'Personel seçin';if(el('magicpassSeciliPersonelBilgi'))el('magicpassSeciliPersonelBilgi').textContent=p?(p.sube||'')+' · '+(p.gorev||''):'';
    }
    function monthlyInvalidate(){monthlyLoaded='';monthlyGeneration++;monthlyClear();status('');}
    function monthlyButton(){
        const toolbar=el('magicpassAy')?.closest('.magicpass-toolbar');if(!toolbar)return;let b=el('fdAttendanceReload');if(!b){b=root.document.createElement('button');b.id='fdAttendanceReload';b.type='button';b.className='btn-export';b.textContent='Yenile';b.title='Seçili personelin ve ayın kayıtlarını sunucudan yenile';b.style.cssText='background:#0f766e;color:#fff';b.onclick=()=>monthlyRefresh();toolbar.insertBefore(b,toolbar.querySelector('button'));}
        b.disabled=Boolean(monthlyJob);
    }
    function monthlyOpen(){
        syncIdentity();initMonth();monthlyInvalidate();monthlyButton();if(!allowed()||!visible())return Promise.resolve(false);
        rebuildSelectors(prepared!==actor(),view());prepared=actor();monthlyClear();return Promise.resolve(true);
    }
    function monthlyBounds(){const month=el('magicpassAy')?.value;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month||''))throw Error('Geçerli bir ay seçin.');const first=new Date(month+'-01T12:00:00Z'),next=new Date(first);next.setUTCMonth(next.getUTCMonth()+1);const start=new Date(first),end=new Date(next);start.setUTCDate(start.getUTCDate()-8);end.setUTCDate(end.getUTCDate()+8);return{month,start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};}
    async function monthlyRead(module,person,range,shared,current){
        const out=[],seen=new Set();for(let start=0;start<20000;start+=500){if(!current())throw Error('Liste seçimi değişti.');let q=isPersonelUser()?supabaseClient.rpc('portal_my_module_records',{requested_module:module}):supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',String(activeUser.sirketId)).eq('module',module);
            if(shared){if(!isPersonelUser())q=q.is('employee_legacy_id',null);q=q.or('and(data->>haftaBaslangic.gte.'+range.start+',data->>haftaBaslangic.lt.'+range.end+'),and(data->>tarih.gte.'+range.start+',data->>tarih.lt.'+range.end+')');}
            else{if(!isPersonelUser())q=q.eq('employee_legacy_id',person);if(module==='izinler')q=q.lte('data->>baslangic',range.end).gte('data->>bitis',range.start);else if(module==='puantaj')q=q.gte('data->>tarih',range.start).lt('data->>tarih',range.end);else q=q.or('and(data->>tarih.gte.'+range.start+',data->>tarih.lt.'+range.end+'),and(data->>zamanDamgasi.gte.'+range.start+'T00:00:00,data->>zamanDamgasi.lt.'+range.end+'T00:00:00)');}
            const{data,error}=await q.order('legacy_id').range(start,start+499);if(!current())throw Error('Liste seçimi değişti.');if(error)throw error;if(!Array.isArray(data)||data.length>500)throw Error('Liste yanıtı geçersiz.');for(const row of data){const r={...(row.data||{}),id:row.data?.id??row.legacy_id};if(!r.id||seen.has(String(r.id))||r.sirketId&&String(r.sirketId)!==String(activeUser.sirketId)||!shared&&String(r.pId||r.personelId||'')!==person)throw Error('Liste kayıt kapsamı doğrulanamadı.');seen.add(String(r.id));out.push(r);}if(data.length<500)return out;
        }throw Error('Seçili kapsam kayıt sınırını aşıyor.');
    }
    function monthlyMergeArray(key,remote,before,predicate){
        const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),now=veriDizisiniGetir(key),base=JSON.parse(veriSonKayitGoruntuleri.get(key)||'[]'),map=list=>new Map(list.filter(predicate).map(x=>[String(x.id),x])),initial=map(before.local),initialBase=map(before.baseline),current=map(now),currentBase=map(base),server=map(remote),local=now.filter(r=>!predicate(r)),baseline=base.filter(r=>!predicate(r));
        for(const id of new Set([...current.keys(),...currentBase.keys(),...server.keys()])){const value=current.get(id),expected=currentBase.get(id);if(!same(value,initial.get(id))||!same(expected,initialBase.get(id))||!same(initial.get(id),initialBase.get(id))){if(value)local.push(value);if(expected)baseline.push(expected);}else if(server.has(id)){local.push(structuredClone(server.get(id)));baseline.push(structuredClone(server.get(id)));}}
        return{local,baseline};
    }
    function monthlyRefresh(){
        if(!owned()||!monthlyActive()||!allowed()||!visible()||blocked())return Promise.resolve(false);const selection=monthlySelection();if(monthlyJob?.selection===selection)return monthlyJob.promise;
        const ticket=++monthlyGeneration,identity=actor(),month=el('magicpassAy')?.value;let selected=String(el('magicpassPersonel')?.value||'');const current=()=>ticket===monthlyGeneration&&allowed(identity)&&visible()&&monthlyActive()&&String(el('magicpassAy')?.value||'')===month&&String(el('magicpassPersonel')?.value||'')===selected&&!blocked();
        let promise;promise=(async()=>{try{monthlyButton();monthlyLoaded='';monthlyClear('Kayıtlar yenileniyor…');if(el('fdAttendanceReload'))el('fdAttendanceReload').disabled=true;status('Kayıtlar yenileniyor…');
            const metadata=['personeller','subeler'].filter(k=>!yuklenenVeriler.has(k));if(metadata.length){await supabaseVerileriniYukle('vardiya',year(),{anahtarlar:metadata,sirketYukle:false,onbellekKullan:false,yerelDegisiklikleriKoru:true,fdIsCurrent:current});if(!current())return false;rebuildSelectors(true,view());selected=String(el('magicpassPersonel')?.value||'');}
            if(!selected)throw Error('Personel seçin.');if(isPersonelUser()&&selected!==String(activeUser.tcNo||''))throw Error('Personel kapsamı geçersiz.');const range=monthlyBounds(),company=String(activeUser.sirketId),inDates=d=>String(d||'')>=range.start&&String(d||'')<range.end,belongs=r=>!r.sirketId||String(r.sirketId)===company,own=r=>String(r.pId||r.personelId||'')===selected;
            const vScope=r=>belongs(r)&&((own(r)&&(inDates(r.tarih)||inDates(String(r.zamanDamgasi||'').slice(0,10))))||(!r.pId&&!r.personelId&&(inDates(r.haftaBaslangic)||inDates(r.tarih)))),lScope=r=>belongs(r)&&own(r)&&r.baslangic<=range.end&&r.bitis>=range.start,pScope=r=>belongs(r)&&own(r)&&inDates(r.tarih);
            const beforeV=root.fdVardiyaArsivBirlesimAnligi(true),capture=k=>({local:structuredClone(veriDizisiniGetir(k)),baseline:JSON.parse(veriSonKayitGoruntuleri.get(k)||'[]')}),beforeL=capture('izinler'),beforeP=capture('puantaj');
            const [personal,shared,leaves,payroll]=await Promise.all([monthlyRead('vardiya',selected,range,false,current),monthlyRead('vardiya',selected,range,true,current),monthlyRead('izinler',selected,range,false,current),monthlyRead('puantaj',selected,range,false,current)]);if(!current())return false;const combined=[...new Map([...personal,...shared].map(r=>[String(r.id),r])).values()];if(combined.some(r=>!vScope(r))||leaves.some(r=>!lScope(r))||payroll.some(r=>!pScope(r)))throw Error('Dönen kayıtlar seçili kapsamın dışında.');
            const mergedL=monthlyMergeArray('izinler',leaves,beforeL,lScope),mergedP=monthlyMergeArray('puantaj',payroll,beforeP,pScope);if(!root.fdVardiyaKapsamliArsiviUygula(combined,beforeV,vScope))throw Error('Kayıtlar uygulanamadı.');izinler=mergedL.local;puantajVerileri=mergedP.local;veriSonKayitGoruntuleri.set('izinler',JSON.stringify(mergedL.baseline));veriSonKayitGoruntuleri.set('puantaj',JSON.stringify(mergedP.baseline));
            monthlyLoaded=monthlySelection();monthlyApplying=true;try{magicpassAylikCizelgeyiCiz();}finally{monthlyApplying=false;}monthlyControls(true);status('Kayıtlar güncellendi.');veriOnbelleginiKaydet();return true;
        }catch(error){if(current()){monthlyClear('Liste yenilenemedi. Yenile’ye basarak tekrar deneyin.');status('Kayıtlar yenilenemedi: '+(error.message||error));}return false;}finally{if(monthlyJob?.promise===promise){monthlyJob=null;if(el('fdAttendanceReload'))el('fdAttendanceReload').disabled=false;}}})();monthlyJob={selection,promise};return promise;
    }
    const monthlyOriginalDraw=root.magicpassAylikCizelgeyiCiz;
    root.magicpassAylikCizelgeyiCiz=function(...args){if(owned()&&monthlyActive()&&!monthlyApplying&&monthlyLoaded!==monthlySelection()){monthlyLoaded='';monthlyClear();return;}return monthlyOriginalDraw.apply(this,args);};

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
    root.document.addEventListener('change',event=>{if(!owned()||!filterIds.has(event.target?.id)||!visible())return;if(monthlyActive()){monthlyInvalidate();return;}if(!complete(year()))setCold(true);refresh({priority:true}).catch(()=>{});},true);
    root.document.addEventListener('click',event=>{if(!owned())return;const button=event.target?.closest?.('#magicpassApp button');if(!button)return;const code=button.getAttribute('onclick')||'';if(monthlyActive()){if(/magicpassSekmeAc/.test(code))monthlyOpen();else if(/magicpassAyDegistir/.test(code))monthlyInvalidate();return;}if(/magicpassAyDegistir|magicpassGunlukTarihDegistir|magicpassSekmeAc/.test(code)){if(!complete(year()))setCold(true);else if(/magicpassSekmeAc/.test(code)&&!blocked()){try{redraw(prepared!==actor());}catch(error){status('Giriş-çıkış listesi hazırlanamadı. Mevcut kayıtlarınız korunuyor.',true);}}refresh({priority:true}).catch(()=>{});}});
})(window);

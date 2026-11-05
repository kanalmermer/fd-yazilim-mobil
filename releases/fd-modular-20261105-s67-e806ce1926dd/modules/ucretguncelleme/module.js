window.FDModules.define('ucretguncelleme',function(){
 const host=window,client=supabaseClient,native={confirm:fdYuzerOnaySor,alert:window.alert,toast:showToast,show:showGlobalOverlay,hide:hideGlobalOverlay,init:initUI,cache:veriOnbelleginiKaydet,session:fdPortalVeriOturumuGecerli};
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);
 const initial=identity(),names=["fdTopluZamAc","fdTopluZamCiz","fdTopluZamSatirHesapla","fdTopluZamOranUygula","fdUcretGecmisiAc","fdTopluZamlariKaydet"],functions=Object.create(null);let disposed=false,version=0,overlay=null;
 const alive=()=>!disposed&&identity()===initial&&isManagerUser()&&!isPersonelUser()&&anaMenuModulErisimiVar('personel');
 const root=()=>document.getElementById('fdTopluZamModal');
 const scope=()=>JSON.stringify([identity(),version,document.getElementById('fdZamGecerliAy')?.value||'']);
 const visible=()=>root()?.style.display==='flex';
 const writable=()=>alive()&&anaMenuModulYazmaYetkisiVar('personel');
 function check(write=false){if(!(write?writable():alive()))throw Error('Ücret güncelleme oturumu veya yetkisi değişti.');}
 const guarded=client?new Proxy(client,{get(target,key){if(key==='rpc')return async(...args)=>{check(true);const before=scope(),node=root();if(!visible())throw Error('Ücret güncelleme ekranı kapandı.');const reply=await target.rpc(...args);check(true);if(before!==scope()||node!==root()||!visible())throw Error('Ücret güncelleme seçimi değişti.');return reply;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}}):client;
 const instance=(function(supabaseClient){
  const window=new Proxy(host,{get(target,key){if(names.includes(key)){const fn=functions[key];return typeof fn==='function'?function(...args){if(!alive())return;return fn.apply(this,args);}:fn;}return Reflect.get(target,key,target);},set(target,key,value){if(names.includes(key)){functions[key]=value;return true;}throw Error('Ücret modülü ortak durumu değiştiremez: '+String(key));}});
  const fdTopluZamAc=(...a)=>window.fdTopluZamAc(...a),fdTopluZamCiz=(...a)=>window.fdTopluZamCiz(...a),fdTopluZamSatirHesapla=(...a)=>window.fdTopluZamSatirHesapla(...a),fdTopluZamOranUygula=(...a)=>window.fdTopluZamOranUygula(...a),fdUcretGecmisiAc=(...a)=>window.fdUcretGecmisiAc(...a),fdTopluZamlariKaydet=(...a)=>window.fdTopluZamlariKaydet(...a);
  const fdEsc=v=>typeof escapeDashboardText==='function'?escapeDashboardText(String(v??'')):String(v??'').replace(/[&<>\"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
  const fdPortalVeriOturumuGecerli=(session)=>alive()&&visible()&&native.session(session);
  const fdYuzerOnaySor=async(...args)=>{check(true);const before=scope(),node=root(),accepted=await native.confirm(...args);return accepted&&writable()&&visible()&&before===scope()&&node===root();};
  const alert=(...args)=>{if(alive()&&visible())return native.alert(...args);};
  const showToast=(...args)=>{if(alive()&&visible())return native.toast(...args);};
  const initUI=(...args)=>{check(true);return native.init(...args);};
  const veriOnbelleginiKaydet=(...args)=>{check(true);return native.cache(...args);};
  const showGlobalOverlay=(...args)=>{check(true);native.show(...args);overlay={node:document.getElementById('globalOverlay'),title:document.getElementById('overlayTitle')?.textContent,sub:document.getElementById('overlaySub')?.textContent};};
  const hideGlobalOverlay=()=>{if(overlay&&overlay.node===document.getElementById('globalOverlay')&&overlay.title===document.getElementById('overlayTitle')?.textContent&&overlay.sub===document.getElementById('overlaySub')?.textContent)native.hide();overlay=null;};
  let salaryInstall=()=>{};
  function fdTopluZamModalKur(){if(document.getElementById('fdTopluZamModal'))return;const m=document.createElement('div');m.id='fdTopluZamModal';m.className='modal-overlay';m.innerHTML='<div class="modal-card"><div class="modal-header"><h3>Toplu Maaş / Yevmiye Güncelleme</h3><button class="modal-close" onclick="modalKapat(\'fdTopluZamModal\')">✕</button></div><div class="modal-body" style="overflow:auto"><div class="fd-zam-toolbar"><input id="fdZamArama" placeholder="Personel veya şube ara..." oninput="fdTopluZamCiz()"><button type="button" class="btn-modern btn-detail-modern" onclick="fdTopluZamOranUygula()">Yüzdelik Zam Uygula</button><input id="fdZamOran" inputmode="decimal" placeholder="% oran" style="width:95px"><button type="button" class="btn-modern" onclick="fdUcretGecmisiAc()">Ücret Geçmişi</button><small style="margin-left:auto;color:#64748b">26 saat mesai, ayarlardaki çalışma saati ve mesai katsayısıyla hesaplanır.</small></div><div class="table-wrapper"><table class="fd-zam-table"><thead><tr><th rowspan="2">Şube</th><th rowspan="2">Personel</th><th colspan="4" class="fd-zam-group-old">Mevcut Ücretler</th><th colspan="4" class="fd-zam-group-new">Yeni Ücretler</th><th rowspan="2">Fark TL</th><th rowspan="2">Zam %</th><th rowspan="2">Geçmiş</th></tr><tr><th>Yevmiye</th><th>26 Saat Mesai</th><th>30 Gün</th><th>31 Gün</th><th>Yeni Yevmiye</th><th>26 Saat Mesai</th><th>30 Gün</th><th>31 Gün</th></tr></thead><tbody id="fdTopluZamBody"></tbody></table></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button type="button" class="btn-submit" style="width:auto;margin:0" onclick="fdTopluZamlariKaydet()">Değişiklikleri Kaydet</button></div></div></div>';document.body.appendChild(m);}
function fdZamHesap(y){const gun=ayarSayisi('gunlukCalismaSaati',7.5),kat=ayarSayisi('mesaiKatsayisi',1.5),mesai=y/gun*kat*26;return{mesai,g30:y*30+mesai,g31:y*31+mesai};}
window.fdTopluZamCiz=function(){const body=document.getElementById('fdTopluZamBody');if(!body)return;const q=String(document.getElementById('fdZamArama')?.value||'').toLocaleLowerCase('tr-TR'),liste=personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&(!q||String((p.sube||'')+' '+(p.ad||'')).toLocaleLowerCase('tr-TR').includes(q))).sort((a,b)=>String(a.sube||'').localeCompare(String(b.sube||''),'tr')||String(a.ad||'').localeCompare(String(b.ad||''),'tr'));body.innerHTML=liste.map(p=>{const y=personelGunlukUcretiniGetir(p),h=fdZamHesap(y);return '<tr data-pid="'+fdEsc(p.id)+'" data-eski="'+y+'"><td>'+fdEsc(p.sube||'Merkez')+'</td><td><strong>'+fdEsc(p.ad||'-')+'</strong></td><td>'+paraFormatla(y)+'</td><td>'+paraFormatla(h.mesai)+'</td><td>'+paraFormatla(h.g30)+'</td><td>'+paraFormatla(h.g31)+'</td><td><input data-yeni inputmode="decimal" placeholder="Yeni yevmiye" oninput="paraGirisiVirgulluFormatla(this);fdTopluZamSatirHesapla(this)"></td><td data-yeni-mesai>-</td><td data-yeni-30>-</td><td data-yeni-31>-</td><td data-fark class="fd-zam-diff">-</td><td data-oran class="fd-zam-diff">-</td><td><button class="fd-icon-btn fd-icon-invoice" title="Ücret geçmişi" onclick="fdUcretGecmisiAc(\''+fdEsc(p.id)+'\')">↺</button></td></tr>';}).join('')||'<tr><td colspan="13" style="text-align:center;padding:22px">Aktif personel bulunmuyor.</td></tr>';};
window.fdTopluZamSatirHesapla=function(input){const tr=input.closest('tr'),eski=Number(tr.dataset.eski||0),yeni=paraMetniniSayiyaCevir(input.value),h=fdZamHesap(yeni);tr.querySelector('[data-yeni-mesai]').textContent=yeni?paraFormatla(h.mesai):'-';tr.querySelector('[data-yeni-30]').textContent=yeni?paraFormatla(h.g30):'-';tr.querySelector('[data-yeni-31]').textContent=yeni?paraFormatla(h.g31):'-';tr.querySelector('[data-fark]').textContent=yeni?paraFormatla(yeni-eski):'-';tr.querySelector('[data-oran]').textContent=yeni&&eski?('%'+((yeni-eski)/eski*100).toLocaleString('tr-TR',{maximumFractionDigits:2})):'-';};
window.fdTopluZamOranUygula=function(){const oran=paraMetniniSayiyaCevir(document.getElementById('fdZamOran').value);if(!Number.isFinite(oran))return;document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{const eski=Number(tr.dataset.eski||0),i=tr.querySelector('[data-yeni]');i.value=(eski*(1+oran/100)).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});fdTopluZamSatirHesapla(i);});};
window.fdTopluZamAc=function(){if(isPersonelUser())return;fdTopluZamModalKur();fdTopluZamCiz();document.getElementById('fdTopluZamModal').style.display='flex';};
window.fdUcretGecmisiAc=function(pId=''){let m=document.getElementById('fdUcretGecmisiModal');if(!m){m=document.createElement('div');m.id='fdUcretGecmisiModal';m.className='modal-overlay';m.innerHTML='<div class="modal-card" style="width:min(980px,96vw);max-height:90vh"><div class="modal-header"><h3>Ücret Geçmişi</h3><button class="modal-close" onclick="modalKapat(\'fdUcretGecmisiModal\')">✕</button></div><div class="modal-body" id="fdUcretGecmisiBody"></div></div>';document.body.appendChild(m);}const ps=pId?personeller.filter(p=>String(p.id)===String(pId)):personeller.filter(p=>aktifSirketeAit(p));const rows=ps.flatMap(p=>(Array.isArray(p.ucretGecmisi)?p.ucretGecmisi:[]).map(g=>({...g,personel:p.ad,sube:p.sube}))).sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||'')));document.getElementById('fdUcretGecmisiBody').innerHTML=rows.length?'<table class="fd-session-history-table"><thead><tr><th>Tarih</th><th>Şube</th><th>Personel</th><th>Eski Yevmiye</th><th>Yeni Yevmiye</th><th>Fark</th><th>Zam</th></tr></thead><tbody>'+rows.map(g=>'<tr><td>'+new Date(g.tarih).toLocaleString('tr-TR')+'</td><td>'+fdEsc(g.sube||'-')+'</td><td>'+fdEsc(g.personel||'-')+'</td><td>'+paraFormatla(g.eskiYevmiye)+'</td><td>'+paraFormatla(g.yeniYevmiye)+'</td><td>'+paraFormatla(g.fark)+'</td><td>%'+Number(g.oran||0).toLocaleString('tr-TR',{maximumFractionDigits:2})+'</td></tr>').join('')+'</tbody></table>':'<div class="dashboard-empty">Henüz ücret değişikliği kaydı yok.</div>';m.style.display='flex';};
window.fdTopluZamlariKaydet=async function(){const degisen=[];document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{const yeni=paraMetniniSayiyaCevir(tr.querySelector('[data-yeni]')?.value||''),eski=Number(tr.dataset.eski||0);if(yeni>0&&Math.abs(yeni-eski)>.001)degisen.push({tr,p:personeller.find(x=>String(x.id)===String(tr.dataset.pid)),eski,yeni});});if(!degisen.length)return alert('Kaydedilecek yeni yevmiye girişi bulunmuyor.');if(!await fdYuzerOnaySor(degisen.length+' personelin yevmiyesi güncellensin mi?','Toplu Ücret Güncelleme','Kaydet'))return;showGlobalOverlay('Ücretler güncelleniyor',degisen.length+' personelin yeni ücreti kaydediliyor...');const an=new Date().toISOString(),yapan=activeUser?.ad||activeUser?.username||'';try{degisen.forEach(x=>{x.p.ucret=Number(x.yeni).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});x.p.ucretGecmisi=Array.isArray(x.p.ucretGecmisi)?x.p.ucretGecmisi:[];x.p.ucretGecmisi.push({tarih:an,eskiYevmiye:x.eski,yeniYevmiye:x.yeni,fark:x.yeni-x.eski,oran:x.eski?((x.yeni-x.eski)/x.eski*100):0,yapan});});yuklenenVeriler.add('personel');await verileriKaydet();initUI();fdTopluZamCiz();showToast(degisen.length+' personelin ücreti güncellendi.');}catch(e){alert('Ücretler kaydedilemedi: '+(e.message||e));}finally{hideGlobalOverlay();}};
  
(function(){
    let busy=false,drafts=new Map(),draftMonth='',draftSession='';
    const currentMonth=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date());
    const monthLabel=month=>new Date(month+'-01T12:00:00+03:00').toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
    const state=p=>({values:Object.fromEntries(FD_DONEM_UCRET_ALANLARI.filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]])),history:p.fdUcretDonemleri||[]});
    function install(){
        const modal=document.getElementById('fdTopluZamModal');if(!modal||document.getElementById('fdZamGecerliAy'))return;
        modal.querySelector('.modal-body').insertAdjacentHTML('afterbegin','<div class="fd-zam-donem"><label for="fdZamGecerliAy">Geçerli olacağı ay</label><input id="fdZamGecerliAy" type="month" required max="9998-12"><small id="fdZamDonemNotu">Zam seçilen ayın başından itibaren geçerlidir. Önceki aylar değişmez.</small></div>');
        const input=document.getElementById('fdZamGecerliAy');input.min=currentMonth();input.value=currentMonth();
        input.addEventListener('change',()=>{drafts.clear();draftMonth='';window.fdTopluZamCiz();});
    }
    function selectedMonth(){return document.getElementById('fdZamGecerliAy')?.value||currentMonth();}
    const draw=window.fdTopluZamCiz;
    window.fdTopluZamCiz=function(){
        install();const month=selectedMonth(),session=fdPortalVeriOturumu();
        if(month!==draftMonth||session!==draftSession){drafts.clear();draftMonth=month;draftSession=session;}
        else document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>drafts.set(tr.dataset.pid,tr.querySelector('[data-yeni]').value));
        fdHesapDonemindeCalistir(month,()=>draw.apply(this,arguments));
        document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{
            const p=personeller.find(x=>String(x.id)===tr.dataset.pid&&aktifSirketeAit(x));tr.dataset.salaryState=JSON.stringify(state(p));
            const input=tr.querySelector('[data-yeni]');if(drafts.has(tr.dataset.pid)){input.value=drafts.get(tr.dataset.pid);window.fdTopluZamSatirHesapla(input);}
        });
        const note=document.getElementById('fdZamDonemNotu');if(note)note.textContent=/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)?monthLabel(month)+' ayından itibaren geçerlidir. Önceki aylar değişmez. Ayı değiştirmek yeni ücret girişlerini temizler.':'Geçerli olacağı ayı seçin.';
    };
    const rowCalculate=window.fdTopluZamSatirHesapla;
    window.fdTopluZamSatirHesapla=function(){return fdHesapDonemindeCalistir(selectedMonth(),()=>rowCalculate.apply(this,arguments));};
    const open=window.fdTopluZamAc;
    window.fdTopluZamAc=function(){if(isPersonelUser()||!isManagerUser())return;install();drafts.clear();draftMonth='';document.getElementById('fdZamGecerliAy').value=currentMonth();document.getElementById('fdZamGecerliAy').min=currentMonth();return open.apply(this,arguments);};
    function mergeSaved(rows,changes){
        const keys=[...FD_DONEM_UCRET_ALANLARI,'fdUcretDonemleri','ucretGecmisi'];
        const oldSnapshot=JSON.parse(veriSonKayitGoruntuleri.get('personeller')||'[]');
        for(const row of rows){
            const id=String(row.legacy_id),p=personeller.find(x=>String(x.id)===id&&aktifSirketeAit(x)),change=changes.find(x=>x.id===id);
            if(p&&JSON.stringify(state(p))===JSON.stringify(change.expected)){for(const key of keys){delete p[key];if(Object.hasOwn(row.data,key))p[key]=row.data[key];}}
            const position=oldSnapshot.findIndex(x=>String(x.id)===id);if(position>=0)oldSnapshot[position]=row.data;else oldSnapshot.push(row.data);
        }
        veriSonKayitGoruntuleri.set('personeller',JSON.stringify(oldSnapshot));veriOnbelleginiKaydet();
    }
    window.fdTopluZamlariKaydet=async function(){
        if(busy||isPersonelUser()||!isManagerUser())return;
        const month=selectedMonth(),session=fdPortalVeriOturumu(),company=aktifSirketId(),changes=[];
        if(!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)||month<currentMonth()||month>'9998-12')return alert('Bu ayı veya ileri bir ayı seçin. Önceki ayların ücretleri değiştirilemez.');
        document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{
            const input=tr.querySelector('[data-yeni]'),wage=paraMetniniSayiyaCevir(input.value);
            if(input.value.trim()&&Math.abs(wage-Number(tr.dataset.eski))>.001)changes.push({id:tr.dataset.pid,dailyWage:wage,expected:JSON.parse(tr.dataset.salaryState)});
        });
        if(changes.some(x=>!Number.isFinite(x.dailyWage)||x.dailyWage<=0||x.dailyWage>100000000))return alert('Yeni yevmiyeler pozitif ve geçerli tutarlar olmalıdır.');
        if(!changes.length)return alert('Kaydedilecek yeni yevmiye girişi bulunmuyor.');
        if(!SUPABASE_MODE||!supabaseClient)return alert('Toplu ücret güncellemesi için sunucu bağlantısı gerekiyor.');
        busy=true;
        const controls=[...document.querySelectorAll('#fdTopluZamModal input,#fdTopluZamModal button')],disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);
        try{
            if(!await fdYuzerOnaySor(changes.length+' personelin yeni ücreti '+monthLabel(month)+' ayından itibaren uygulansın mı? Önceki aylar değişmeyecek.','Toplu Ücret Güncelleme','Kaydet'))return;
            if(!fdPortalVeriOturumuGecerli(session)||company!==aktifSirketId())throw Error('Oturum değişti. İşlem iptal edildi.');
            if(changes.some(x=>{const p=personeller.find(p=>String(p.id)===x.id&&aktifSirketeAit(p));return !p||JSON.stringify(state(p))!==JSON.stringify(x.expected);}))throw Error('Ücret bilgileri değişmiş. Listeyi yeniden açın.');
            showGlobalOverlay('Ücretler güncelleniyor',changes.length+' personel · '+monthLabel(month));
            const {data,error}=await supabaseClient.rpc('fd_bulk_salary_update',{p_company_id:company,p_month:month,p_changes:changes});
            if(error)throw error;
            if(!fdPortalVeriOturumuGecerli(session)||company!==aktifSirketId())return;
            if(!Array.isArray(data)||data.length!==changes.length)throw Error('Sunucu yanıtı doğrulanamadı. Listeyi yenileyin.');
            mergeSaved(data,changes);drafts.clear();draftMonth='';document.querySelectorAll('#fdTopluZamBody [data-yeni]').forEach(x=>x.value='');initUI();window.fdTopluZamCiz();
            showToast(changes.length+' personelin ücreti '+monthLabel(month)+' ayından itibaren güncellendi.');
        }catch(error){if(fdPortalVeriOturumuGecerli(session))alert('Ücret güncellemesi tamamlanamadı: '+(error.message||error));}
        finally{busy=false;controls.forEach((c,i)=>c.disabled=disabled[i]);hideGlobalOverlay();}
    };
    const historyOpen=window.fdUcretGecmisiAc;
    window.fdUcretGecmisiAc=function(id=''){
        if(isPersonelUser()||!isManagerUser())return;
        if(id&&!personeller.some(p=>String(p.id)===String(id)&&aktifSirketeAit(p)))return;
        historyOpen.apply(this,arguments);
        const rows=personeller.filter(p=>aktifSirketeAit(p)&&(!id||String(p.id)===String(id))).flatMap(p=>(p.ucretGecmisi||[]).map(g=>({...g}))).sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||'')));
        const table=document.querySelector('#fdUcretGecmisiBody table');if(!table)return;
        table.querySelector('thead th').insertAdjacentHTML('afterend','<th>Geçerli Ay</th>');
        table.querySelectorAll('tbody tr').forEach((tr,i)=>tr.firstElementChild.insertAdjacentHTML('afterend','<td>'+escapeDashboardText(rows[i]?.gecerliAy?monthLabel(rows[i].gecerliAy):'—')+'</td>'));
    };
    salaryInstall=install;
})();


  function cancel(){version++;for(const id of ['fdTopluZamModal','fdUcretGecmisiModal']){const node=document.getElementById(id);if(node?.dataset.fdModuleRoot==='ucretguncelleme')node.style.display='none';}hideGlobalOverlay();}
  function execute(options){if(!options?.current?.()||!alive())return;if(options.name==='fdTopluZamlariKaydet')check(true);return functions[options.name]?.apply(options.receiver,options.args);}
  return{init(){salaryInstall();},open:execute,api:{fdUcretGuncellemeIslem:execute,fdUcretGuncellemeIptalEt:cancel},dispose(){disposed=true;cancel();}};
 })(guarded);
 return instance;
});

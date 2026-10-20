'use strict';
// Ordinal-based overrides move only one instalment; original principal/terms stay intact.
function avansKesintiTaksitlari(avans) {
    const n=Number(avans?.taksitSayisi||1),total=Number(avans?.tutar||0),start=String(avans?.baslangicAy||'');
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(start)||!Number.isInteger(n)||n<1||n>1200||!Number.isFinite(total)||total<=0)return [];
    const standard=Math.floor(total/n*100)/100,overrides=avans.kesintiErtelemeleri;
    return Array.from({length:n},(_,i)=>{
        const original=avansAyEkle(start,i),candidate=overrides&&typeof overrides==='object'&&!Array.isArray(overrides)?String(overrides[i+1]||''):'';
        const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(candidate)&&candidate>=original?candidate:original;
        return {sira:i+1,asilAy:original,ay:month,kurus:Math.round((i===n-1?Number((total-standard*(n-1)).toFixed(2)):standard)*100)};
    });
}
function avansErtelenmisAylikKesinti(avans,ay) {
    const all=avansKesintiTaksitlari(avans),selected=all.filter(x=>x.ay===ay);if(!selected.length)return null;
    return {kesinti:selected.reduce((s,x)=>s+x.kurus,0)/100,kalan:Math.max(0,Math.round(Number(avans.tutar)*100)-all.filter(x=>x.ay<=ay).reduce((s,x)=>s+x.kurus,0))/100,sira:selected.length===1?selected[0].sira:selected.map(x=>x.sira).join(', '),taksitSayisi:Number(avans.taksitSayisi||1)};
}
function avansKesintiSonAyi(avans) {return avansKesintiTaksitlari(avans).map(x=>x.ay).sort().pop()||'';}
function avansPlanHucreOzellikleri(personelId,ay) {
    if(!avansIslemYetkisiVar()||!anaMenuModulYazmaYetkisiVar('personel'))return '';
    return ' data-avans-personel="'+escapeHtml(personelId)+'" data-avans-ay="'+escapeHtml(ay)+'" tabindex="0" role="button" aria-label="'+escapeHtml(avansAyBasligi(ay,true)+' kesintisini başka aya ertele')+'" title="Sağ tık: başka aya ertele · Telefonda dokunun"';
}
(function(root){
    let ui=null,menu=null,watch=null,busyOwner=null;
    const clone=x=>JSON.parse(JSON.stringify(x));
    const identity=()=>fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+String(anaMenuModulYetkisi('personel'));
    const allowed=()=>avansIslemYetkisiVar()&&anaMenuModulYazmaYetkisiVar('personel');
    const valid=ctx=>!!ctx&&ctx.identity===identity()&&allowed()&&document.getElementById('avansApp')?.style.display!=='none';
    const closed=a=>['kapandi','tamamlandi'].includes(kullaniciRolAnahtari(a.durum));
    function candidates(pId,month){return avanslar.filter(a=>avansAktifSirketinMi(a)&&String(a.pId)===String(pId)&&!closed(a)).flatMap(a=>avansKesintiTaksitlari(a).filter(x=>x.ay===month&&x.kurus>0).map(x=>({...x,id:String(a.id),record:clone(a)})));}
    function hideMenu(){menu?.remove();menu=null;}
    function stopWatch(){if(watch)clearInterval(watch);watch=null;}
    function close(){const prior=ui;ui=null;hideMenu();stopWatch();prior?.node.remove();if(prior?.returnFocus?.isConnected)prior.returnFocus.focus();}
    function observe(ctx){stopWatch();watch=setInterval(()=>{if(!valid(ctx))close();},200);}
    function error(ctx,message){if(ui===ctx&&valid(ctx)){ctx.error.textContent=message;ctx.error.hidden=false;}}
    function selected(ctx){return ctx.items[Number(ctx.select.value)];}
    function summary(ctx){const entry=selected(ctx);if(!entry)return;ctx.info.textContent=entry.record.personelAd+' · '+(entry.record.avansNo||'Avans')+' · '+entry.sira+'. taksit · '+paraFormatla(entry.kurus/100)+' · '+avansAyBasligi(ctx.month,true);ctx.target.min=avansAyEkle(ctx.month,1);const target=ctx.target.value;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)||target<=ctx.month){ctx.preview.textContent='Daha sonraki bir ay seçin.';return;}const total=avansGelecekPlanVerisi(target,target).kisiler.find(x=>String(x.id)===ctx.personelId)?.toplam||0;ctx.preview.textContent='Hedef aydaki mevcut kesinti: '+paraFormatla(total)+' · Erteleme sonrası: '+paraFormatla(total+entry.kurus/100);}
    function openDialog(pId,month,returnFocus){
        close();if(!allowed()||avansIslemSuruyor)return;const items=candidates(pId,month);if(!items.length)return showToast('Bu hücrede ertelenebilecek aktif taksit yok.','warning');
        const node=document.createElement('div');node.id='fdAvansErteleModal';node.className='fd-avans-ertele-overlay';node.innerHTML='<section class="fd-avans-ertele-card" role="dialog" aria-modal="true" aria-labelledby="fdAvansErteleBaslik"><header><h2 id="fdAvansErteleBaslik">Kesintiyi başka aya ertele</h2><button type="button" data-close aria-label="Kapat">×</button></header><form><p data-info></p><label>Erteleyeceğiniz taksit<select id="fdAvansErteleTaksit"></select></label><small data-multiple></small><label>Kesintinin yapılacağı ay<input id="fdAvansErteleAy" type="month" required max="9999-12"></label><p data-preview class="fd-avans-ertele-preview" aria-live="polite"></p><p class="fd-avans-ertele-note">Yalnız seçilen taksit taşınır; diğer taksitler ve toplam avans tutarı değişmez. Kaydedilmiş puantaj ve ücret pusulaları değiştirilmez. Kapalı dönemlere işlem yapılamaz.</p><p data-error role="alert" hidden></p><footer><button type="button" data-close>Vazgeç</button><button type="submit" class="fd-avans-ertele-save">Ertelemeyi Kaydet</button></footer></form></section>';
        const ctx={node,items,personelId:String(pId),month,returnFocus,identity:identity(),select:node.querySelector('select'),target:node.querySelector('input'),info:node.querySelector('[data-info]'),preview:node.querySelector('[data-preview]'),error:node.querySelector('[data-error]')};ui=ctx;
        items.forEach((entry,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=(entry.record.avansNo||'Avans')+' · '+entry.sira+'. taksit · '+paraFormatla(entry.kurus/100);ctx.select.append(option);});
        node.querySelector('[data-multiple]').textContent=items.length>1?'Bu hücre birden fazla taksit içeriyor. Yalnız seçtiğiniz taksit ertelenecek.':'';
        ctx.target.value=avansAyEkle(month,1);node.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!busyOwner)close();}));
        node.addEventListener('click',e=>{if(e.target===node&&!busyOwner)close();});ctx.select.addEventListener('change',()=>summary(ctx));ctx.target.addEventListener('input',()=>summary(ctx));
        node.querySelector('form').addEventListener('submit',e=>{e.preventDefault();save(ctx);});document.body.append(node);summary(ctx);observe(ctx);ctx.target.focus();
    }
    async function save(ctx){
        if(ui!==ctx||!valid(ctx)||busyOwner||avansIslemSuruyor)return;
        const item=selected(ctx),target=ctx.target.value;if(!item||!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)||target<=ctx.month)return error(ctx,'Kesintinin bulunduğu aydan sonraki bir ay seçin.');
        if(!SUPABASE_MODE||!supabaseClient||!activeUser?.sirketId)return error(ctx,'Güvenli kayıt için sunucu bağlantısı gerekiyor.');
        const current=avanslar.find(a=>String(a.id)===item.id&&avansAktifSirketinMi(a));
        if(!current||closed(current)||!avansJsonAyniMi(current,item.record))return error(ctx,'Avans bu sırada değişmiş. Pencereyi kapatıp listeyi yenileyin; eski bilgilerle üzerine yazılmadı.');
        const expected=clone(item.record),payload={...expected,kesintiErtelemeleri:{...(expected.kesintiErtelemeleri||{}),[item.sira]:target}},company=String(aktifSirketId()),owner={};
        busyOwner=owner;avansIslemSuruyor=true;ctx.error.hidden=true;const fields=[...ctx.node.querySelectorAll('button,input,select')];fields.forEach(x=>x.disabled=true);ctx.node.setAttribute('aria-busy','true');
        try{
            if(typeof root.fdxPlanliBildirimApi!=='function')throw Error('Dönem kontrol bağlantısı hazır değil; işlem kaydedilmedi.');
            const closures=await root.fdxPlanliBildirimApi({action:'closure-list'},()=>valid(ctx));
            if(!valid(ctx)||ui!==ctx)return;
            if(!Array.isArray(closures?.closures))throw Error('Dönem kapanış durumu doğrulanamadı; işlem kaydedilmedi.');
            if(closures.closures.some(x=>[ctx.month,target,String(expected.baslangicAy)].includes(String(x.month_key))&&x.status==='locked'))throw Error('Avansın başlangıç, kaynak veya hedef dönemi kapalı. Önce Denetim Merkezi üzerinden dönemi yeniden açın.');
            const latest=avanslar.find(a=>String(a.id)===item.id&&avansAktifSirketinMi(a));if(!latest||!avansJsonAyniMi(latest,expected))throw Error('Avans bu sırada değişmiş. Listeyi yenileyin; eski bilgilerle üzerine yazılmadı.');
            const result=await avansGuvenliSunucuKaydi(company,payload,expected);
            if(!valid(ctx)||ui!==ctx)return;
            if(!Object.keys(payload).every(k=>avansJsonAyniMi(result.data?.[k],payload[k])))throw Error('Sunucu yanıtında erteleme doğrulanamadı. Tekrar kaydetmeden önce listeyi yenileyin.');
            const local=avanslar.find(a=>String(a.id)===item.id);if(!local||!avansJsonAyniMi(local,expected))throw Error('Sunucuda kayıt tamamlandı fakat yerel liste değişti. Tekrar kaydetmeden önce listeyi yenileyin.');
            avansSunucuKaydiniUygula(result,expected);close();renderAvansKesintiListesi();renderAvansGelecekKesintileri();showToast('Taksit '+avansAyBasligi(target,true)+' ayına ertelendi.','success');
        }catch(e){error(ctx,'Erteleme tamamlanamadı: '+String(e?.message||e));}
        finally{if(busyOwner===owner){busyOwner=null;avansIslemSuruyor=false;}if(ui===ctx){fields.forEach(x=>x.disabled=false);ctx.node.removeAttribute('aria-busy');}}
    }
    function showMenu(cell,x,y){
        close();const ctx={identity:identity()};if(!valid(ctx)||avansIslemSuruyor)return;
        const items=candidates(cell.dataset.avansPersonel,cell.dataset.avansAy);if(!items.length)return showToast('Kapalı veya tamamlanmış avans ertelenemez.','warning');
        menu=document.createElement('div');menu.id='fdAvansErteleMenu';menu.className='fd-avans-ertele-menu';menu.setAttribute('role','menu');const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.textContent='Başka aya ertele…';b.addEventListener('click',()=>{if(valid(ctx))openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);else close();});menu.append(b);document.body.append(menu);const box=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(x,innerWidth-box.width-8))+'px';menu.style.top=Math.max(8,Math.min(y,innerHeight-box.height-8))+'px';observe(ctx);b.focus();
    }
    const cellFrom=e=>e.target.closest?.('#avansGelecekBody td[data-avans-personel]');
    document.addEventListener('contextmenu',e=>{const cell=cellFrom(e);if(!cell)return;e.preventDefault();showMenu(cell,e.clientX,e.clientY);});
    document.addEventListener('click',e=>{const cell=cellFrom(e);if(cell&&!menu){openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);return;}if(menu&&!menu.contains(e.target)){hideMenu();stopWatch();}});
    document.addEventListener('keydown',e=>{
        if(e.key==='Escape'&&(ui||menu)){if(!busyOwner)close();e.preventDefault();return;}
        const cell=cellFrom(e);if(cell&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);return;}
        if(ui&&e.key==='Tab'){const controls=[...ui.node.querySelectorAll('button,input,select')].filter(x=>!x.disabled),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}
    });
    root.addEventListener('pagehide',close);root.addEventListener('resize',()=>{if(menu){hideMenu();if(!ui)stopWatch();}});
})(window);

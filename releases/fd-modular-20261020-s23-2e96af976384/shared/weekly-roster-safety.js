'use strict';
function fdHaftalikVardiyaKaydiMi(record){return !!record&&typeof record==='object'&&!record.kayitTipi&&Object.hasOwn(record,'haftaBaslangic')&&Object.hasOwn(record,'satirlar');}
function fdVardiyaJsonAyniMi(a,b){const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;return JSON.stringify(sort(a))===JSON.stringify(sort(b));}
function fdVardiyaYazmaYetkisi(){return ['admin','yonetici'].includes(kullaniciRolAnahtari())&&anaMenuModulYazmaYetkisiVar('personel');}
function fdVardiyaOturumAnahtari(){return fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+anaMenuModulYetkisi('personel');}
function fdVardiyaKayitOturumuGecerli(key){return key===fdVardiyaOturumAnahtari()&&fdVardiyaYazmaYetkisi();}
async function fdVardiyaGuvenliSunucuKaydi(company,record,expected,isCurrent=()=>true){
    if(!isCurrent()||!fdVardiyaYazmaYetkisi()||String(company)!==String(aktifSirketId()))throw Error('Vardiya kayıt oturumu veya yetkisi değişti.');
    const {data,error}=await supabaseClient.rpc('fd_weekly_roster_save',{p_company_id:String(company),p_id:String(record.id),p_expected:expected,p_data:record});
    if(!isCurrent())throw Error('Vardiya kayıt oturumu değişti.');if(error)throw error;
    if(!data?.data||String(data.legacy_id)!==String(record.id)||!Object.keys(record).every(k=>fdVardiyaJsonAyniMi(data.data[k],record[k])))throw Error('Vardiya sunucuda doğrulanamadı. Tekrar kaydetmeden önce güncel listeyi yükleyin.');
    return data;
}
async function fdVardiyaGuvenliSunucuSil(company,id,expected,isCurrent=()=>true){
    if(!isCurrent()||!fdVardiyaYazmaYetkisi()||String(company)!==String(aktifSirketId()))throw Error('Vardiya silme oturumu veya yetkisi değişti.');
    const {data,error}=await supabaseClient.rpc('fd_weekly_roster_delete',{p_company_id:String(company),p_id:String(id),p_expected:expected});
    if(!isCurrent())throw Error('Vardiya silme oturumu değişti.');if(error)throw error;if(!data?.deleted||String(data.legacy_id)!==String(id))throw Error('Vardiya silme işlemi doğrulanamadı.');return data;
}
function fdVardiyaYerelKaydiniDogrula(result,sent,updateSnapshot=true){
    const id=String(result.legacy_id),index=vardiyaKayitlari.findIndex(r=>String(r.id)===id&&aktifSirketeAit(r));
    if(index>=0&&fdVardiyaJsonAyniMi(vardiyaKayitlari[index],sent))vardiyaKayitlari[index]=JSON.parse(JSON.stringify(result.data));
    if(updateSnapshot){const rows=JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]'),i=rows.findIndex(r=>String(r.id)===id);if(i<0)rows.push(result.data);else rows[i]=result.data;veriSonKayitGoruntuleri.set('vardiya',JSON.stringify(rows));}
}
(function(root){
    let identity='',latest=new Map(),errorContext=null;
    const copy=x=>JSON.parse(JSON.stringify(x));
    const valid=key=>fdVardiyaKayitOturumuGecerli(key);
    function selected(id){const week=vardiyaPazartesi(document.getElementById('vardiyaHafta')?.value),branch=document.getElementById('vardiyaSube')?.value;return vardiyaKayitlari.find(x=>String(x.id)===String(id)&&x.haftaBaslangic===week&&String(x.sube)===String(branch)&&aktifSirketeAit(x));}
    function status(ctx,state,text){if(!valid(ctx.identity)||!selected(ctx.id))return;const box=document.getElementById('fdVardiyaKayitDurumu');if(!box)return;box.hidden=false;box.dataset.state=state;box.querySelector('span').textContent=text;box.querySelector('button').hidden=state!=='error';if(state==='error')errorContext=ctx;}
    function expectedFor(id){return JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]').find(x=>String(x.id)===id)||null;}
    async function verifyPartialBaseline(ctx,expected){
        if(yuklenenVeriler.has('vardiya'))return;
        const {data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',ctx.company).eq('module','vardiya').eq('legacy_id',ctx.id).maybeSingle();
        if(!valid(ctx.identity))throw Error('Vardiya kayıt oturumu değişti.');if(error)throw error;
        if(data&&(String(data.legacy_id)!==ctx.id||!fdHaftalikVardiyaKaydiMi(data.data)))throw Error('Vardiya sunucu kaydı doğrulanamadı.');
        if(!fdVardiyaJsonAyniMi(data?.data||null,expected))throw Error('Vardiya başka bir oturumda değişmiş veya cihazdaki kopyası doğrulanamıyor. Güncel listeyi yükleyip tekrar düzenleyin.');
        // Only this weekly row was read. Never mark the entire attendance dataset loaded.
    }
    async function saveOne(ctx,payload,ticket){
        supabaseKaydetmeBekleyen++;
        const work=supabaseKaydetmeKuyrugu.catch(()=>{}).then(async()=>{
            if(!valid(ctx.identity))throw Error('Oturum değişti; önceki vardiya işlemi iptal edildi.');
            if(latest.get(ctx.id)!==ticket)return null;
            const expected=expectedFor(ctx.id);await verifyPartialBaseline(ctx,expected);
            const result=await fdVardiyaGuvenliSunucuKaydi(ctx.company,payload,expected,()=>valid(ctx.identity));
            if(!valid(ctx.identity))return null;
            fdVardiyaYerelKaydiniDogrula(result,payload);veriOnbelleginiKaydet();return result;
        }).finally(()=>{supabaseKaydetmeBekleyen=Math.max(0,supabaseKaydetmeBekleyen-1);});
        supabaseKaydetmeKuyrugu=work;return work;
    }
    root.fdVardiyaHaftalikKaydet=async function(redraw=true){
        if(!fdVardiyaYazmaYetkisi()){vardiyaDuzenlemeDevamEdiyor=false;return false;}
        const key=fdVardiyaOturumAnahtari();if(key!==identity){identity=key;latest.clear();errorContext=null;}
        clearTimeout(vardiyaKayitZamanlayici);const record=vardiyaAktifKayit(false);if(!record)return false;
        const ctx={id:String(record.id),company:String(aktifSirketId()),identity:key},ticket=++vardiyaKayitSurumu;latest.set(ctx.id,ticket);vardiyaDuzenlemeDevamEdiyor=true;
        if(!SUPABASE_MODE||!supabaseClient){status(ctx,'error','Sunucu bağlantısı yok; vardiya kaydedilmedi.');vardiyaDuzenlemeDevamEdiyor=false;return false;}
        record.guncellemeZamani=Date.now();if(redraw)vardiyaCiz();const payload=copy(record),notificationKey=vardiyaHaftalikBildirimAnahtari(payload),previous=vardiyaBildirimGorunumleri.get(notificationKey)||vardiyaHaftalikBildirimGorunumu(payload),notice=vardiyaHaftalikBildirimleriHazirla(payload,previous);
        status(ctx,'saving','Vardiya sunucuda doğrulanarak kaydediliyor…');
        const queued=vardiyaKayitKuyrugu.catch(()=>{}).then(()=>saveOne(ctx,payload,ticket));vardiyaKayitKuyrugu=queued;
        try{
            const result=await queued;if(!result||!valid(key)||latest.get(ctx.id)!==ticket)return false;
            errorContext=null;status(ctx,'saved','Kaydedildi · Sunucudaki vardiya doğrulandı.');
            if(selected(ctx.id))magicpassAylikCizelgeyiCiz();showToast('Vardiya listesi sunucuda doğrulanarak kaydedildi.','success');
            vardiyaBildirimGorunumleri.set(notificationKey,notice.guncel);
            const notifications=await personelVardiyaBildirimleriniPlanla(notice.bildirimler,()=>valid(key)&&latest.get(ctx.id)===ticket);
            if(!valid(key))return true;if(notifications.basarisiz)showToast(notifications.basarisiz+' vardiya WhatsApp bildirimi planlanamadı.','warning');return true;
        }catch(e){if(!valid(key)||latest.get(ctx.id)!==ticket)return false;status(ctx,'error','Kaydedilemedi: '+String(e?.message||e));showToast('Vardiya kaydedilemedi. Taslağınız ekranda korundu; güncel listeyi yükleyerek karşılaştırın.','error');return false;}
        finally{if(ticket===vardiyaKayitSurumu){vardiyaDuzenlemeDevamEdiyor=false;fdOtomatikEsitlemeSon=Date.now();}}
    };
    root.fdVardiyaGuncelListeyiYukle=async function(){
        const ctx=errorContext;if(!ctx||!valid(ctx.identity)||!selected(ctx.id))return;
        if(!await fdYuzerOnaySor('Kaydedilemeyen ekrandaki taslak yerine sunucudaki son vardiya listesi yüklensin mi?','Güncel Vardiyayı Yükle','Güncel Listeyi Yükle'))return;
        if(!valid(ctx.identity)||errorContext!==ctx)return;
        try{
            const {data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',ctx.company).eq('module','vardiya').eq('legacy_id',ctx.id).maybeSingle();
            if(!valid(ctx.identity)||errorContext!==ctx||!selected(ctx.id))return;if(error)throw error;
            if(!data?.data||!fdHaftalikVardiyaKaydiMi(data.data))throw Error('Sunucuda bu haftanın listesi bulunamadı. Sayfayı yenileyin.');
            const local=selected(ctx.id);fdVardiyaYerelKaydiniDogrula(data,local);latest.delete(ctx.id);errorContext=null;vardiyaCiz();status(ctx,'saved','Sunucudaki güncel vardiya yüklendi.');veriOnbelleginiKaydet();
        }catch(e){status(ctx,'error','Güncel liste yüklenemedi: '+String(e?.message||e));}
    };
})(window);

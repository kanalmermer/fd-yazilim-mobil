function tcmbKurAlaniniYaz(kurlar) {
        const alan = document.getElementById('portalRates');
        if (!alan) return;
        const tarih = new Date(`${kurlar.tarih}T12:00:00`).toLocaleDateString('tr-TR');
        alan.innerHTML = `<span class="portal-rates-title">${tarih} TCMB alış:</span>` +
            [['USD', 'ABD Doları'], ['EUR', 'Euro'], ['GBP', 'Sterlin']].map(([kod, ad]) =>
                `<span class="portal-rate" title="${ad} döviz alış kuru">${kod} <strong>${Number(kurlar[kod]).toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ₺</strong></span>`
            ).join('');
    }

async function tcmbDunkuKurlariYukle() {
        const alan = document.getElementById('portalRates');
        if (!alan || alan.dataset.loading === '1') return;
        alan.dataset.loading = '1';
        const dun = new Date();
        dun.setHours(12, 0, 0, 0);
        dun.setDate(dun.getDate() - 1);
        // Önceki sürüm farklı bir kur sağlayıcısının değerlerini aynı anahtarla
        // saklıyordu. Resmî TCMB ForexBuying önbelleğini ayrı tut.
        const onbellekAnahtari = `tcmb-resmi-forex-buying-v2-${dun.toISOString().slice(0, 10)}`;
        try {
            const onbellek = JSON.parse(localStorage.getItem(onbellekAnahtari) || 'null');
            if (onbellek?.USD && onbellek?.EUR && onbellek?.GBP) {
                tcmbKurAlaniniYaz(onbellek);
                return;
            }
            const yanit = await fetch(`${GOOGLE_SCRIPT_URL}?islem=tcmbKur&_=${Date.now()}`, { cache: 'no-store' });
            if (!yanit.ok) throw new Error('Kur servisine ulaşılamadı.');
            const veri = await yanit.json();
            const kurlar = veri && veri.kurlar;
            if (!veri.basarili || !kurlar?.USD || !kurlar?.EUR || !kurlar?.GBP) {
                throw new Error(veri.hata || 'Yayımlanmış kur bulunamadı.');
            }
            localStorage.setItem(onbellekAnahtari, JSON.stringify(kurlar));
            tcmbKurAlaniniYaz(kurlar);
        } catch (_) {
            const sonResmiKur = Object.keys(localStorage).filter(k=>k.startsWith('tcmb-resmi-forex-buying-v2-')).sort().reverse().map(k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}).find(k=>k?.USD&&k?.EUR&&k?.GBP);
            if (sonResmiKur) {
                tcmbKurAlaniniYaz(sonResmiKur);
                alan.insertAdjacentHTML('beforeend','<span class="portal-rates-title" title="Kur servisine şu an ulaşılamadı">Son alınan resmî kur</span>');
            } else {
                alan.innerHTML = '<span class="portal-rates-title">TCMB kurları şu an alınamadı</span>';
            }
        } finally {
            alan.dataset.loading = '0';
        }
    }

function aySirasi(ay) {
        const eslesme = String(ay || '').match(/(\d{4})-(\d{1,2})/);
        if (!eslesme) return NaN;
        const yil = Number(eslesme[1]);
        const ayNo = Number(eslesme[2]);
        return yil * 12 + ayNo - 1;
    }

function paraFormatla(tutar) {
        return Number(tutar || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });
    }

function escapeHtml(deger) {
        return String(deger ?? '').replace(/[&<>"']/g, karakter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[karakter]);
    }

function metniEsitle(deger) {
        return String(deger || '').replace(/ı/g, 'i').replace(/İ/g, 'I').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    }

function initUI() {
        if (['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)) return;
        puantajYilSecenekleriniGuncelle();
        filtreDropdownlariDoldur();
        syncSubeDatalist();
        renderPersonelTables();
        renderIzinDashAndTables();
        renderBakiyeTable();
        personelSelectDoldur();
        renderSirketYonetimi();
    }

async function ayrilanPersonelKullaniciHesabiniSil(personelId) {
        const tcNo = String(personelId || '').trim();
        if (!tcNo) return false;
        if (SUPABASE_MODE) {
            const { data, error } = await supabaseClient.functions.invoke('manage-user', {
                body: { action:'delete', username:tcNo, companyId:aktifSirketId() }
            });
            if (error) throw error;
            if (!data?.success) throw new Error(data?.message || 'Personel giriş hesabı silinemedi.');
        }
        kullanicilar = kullanicilar.filter(user => String(user.username) !== tcNo && String(user.tcNo) !== tcNo);
        yuklenenVeriler.add('kullanicilar');
        return true;
    }

function mezuniyetYiliniDuzelt(deger) {
        if (deger instanceof Date && !Number.isNaN(deger.getTime())) return String(deger.getFullYear());
        const metin = String(deger ?? '').trim();
        const eslesme = metin.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/);
        const yil = Number(eslesme?.[1] || (/^\d{4}$/.test(metin) ? metin : 0));
        return Number.isInteger(yil) && yil >= 1900 && yil <= new Date().getFullYear() ? String(yil) : '';
    }

function tarihInputDegeri(value) {
        if (!value || String(value) === 'null') return '';
        const raw = String(value).trim();
        const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        const trMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (trMatch) return `${trMatch[3]}-${trMatch[2]}-${trMatch[1]}`;
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

function ihracatToplanabilirTabloHucreMi(td){
        return Boolean(td?.closest?.('table') && (td.closest('.ihracat-ceki-karti,#ihracatFormProforma,#ihracatYuklemeDetayIcerik') || td.closest('#kiraDetayIcerik .kira-yillik-ozet')));
    }

function ihracatHucreSayisalDegeri(td){
        const input=td?.querySelector?.('input:not([type="file"])');
        if(input){
            if(input.dataset.alan){
                const sutun=input.closest('.ihracat-ceki-karti')?._sutunlar?.find(s=>s.alan===input.dataset.alan);
                if(input.dataset.alan==='aciklama'||(sutun&&sutun.tip!=='number'))return null;
            }else if(input.type!=='number')return null;
            if(!String(input.value||'').trim())return null;
            return ihracatSayiyaCevir(input.value);
        }
        let metin=String(td?.innerText||'').trim();if(!metin||!/[0-9]/.test(metin))return null;
        metin=metin.replace(/\b(USD|EUR|GBP|TRY|TL|KG|ADET|M2)\b/gi,'').replace(/[₺$€£]/g,'').replace(/M²/gi,'').replace(/\s/g,'');
        if(!/^-?[\d.,]+$/.test(metin))return null;
        const deger=ihracatSayiyaCevir(metin);return Number.isFinite(deger)?deger:null;
    }

function ihracatHucreToplamiGuncelle(){
        ihracatHucreSecimi.hucreler=new Set([...ihracatHucreSecimi.hucreler].filter(td=>document.contains(td)));
        const hucreler=[...ihracatHucreSecimi.hucreler],degerler=hucreler.map(ihracatHucreSayisalDegeri).filter(v=>v!==null&&Number.isFinite(v)),bar=document.getElementById('ihracatHucreToplamCubugu');
        if(!bar)return;bar.style.display=hucreler.length?'flex':'none';if(!hucreler.length)return;
        const toplam=degerler.reduce((t,v)=>t+v,0),ortalama=degerler.length?toplam/degerler.length:0,bicim=v=>Number(v||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:3});
        bar.querySelector('.ihr-hucre-secim-ozeti').innerHTML=`<span>Seçili: <strong>${hucreler.length}</strong></span><span>Sayısal: <strong>${degerler.length}</strong></span><span>Ortalama: <strong>${bicim(ortalama)}</strong></span><span>Toplam: <strong>${bicim(toplam)}</strong></span>`;
    }

function ihracatHucreToplamSeciminiTemizle(){
        ihracatHucreSecimi.hucreler.forEach(td=>td.classList.remove('ihr-hucre-secili'));ihracatHucreSecimi.hucreler.clear();ihracatHucreSecimi.sonHucre=null;ihracatHucreToplamiGuncelle();
    }

function ihracatHucreToplamIpucluGoster(){
        ihracatHucreToplamSeciminiTemizle();const bar=document.getElementById('ihracatHucreToplamCubugu');if(!bar)return;bar.style.display='flex';bar.querySelector('.ihr-hucre-secim-ozeti').innerHTML='<span>Toplam için <strong>Ctrl</strong> tuşuyla hücrelere tıklayın veya sürükleyin.</span>';
    }

function ihracatHucreyiSec(td,secili=true){
        if(!ihracatToplanabilirTabloHucreMi(td))return;td.classList.toggle('ihr-hucre-secili',secili);if(secili)ihracatHucreSecimi.hucreler.add(td);else ihracatHucreSecimi.hucreler.delete(td);
    }

function ihracatHucreAraliginiSec(baslangic,bitis,mevcutlariKoru=false){
        const tablo=baslangic?.closest('table');if(!tablo||tablo!==bitis?.closest('table'))return false;
        if(!mevcutlariKoru)ihracatHucreToplamSeciminiTemizle();
        const satirlar=[...tablo.rows],r1=satirlar.indexOf(baslangic.parentElement),r2=satirlar.indexOf(bitis.parentElement),c1=baslangic.cellIndex,c2=bitis.cellIndex;
        for(let r=Math.min(r1,r2);r<=Math.max(r1,r2);r++)for(let c=Math.min(c1,c2);c<=Math.max(c1,c2);c++)ihracatHucreyiSec(satirlar[r]?.cells[c],true);
        return true;
    }

function ihracatHucreToplaminiBaslat(){
        if(document.getElementById('ihracatHucreToplamCubugu'))return;
        const stil=document.createElement('style');stil.textContent='.ihr-hucre-secili{outline:2px solid #2563eb!important;outline-offset:-2px;background:#dbeafe!important}.ihr-hucre-secili input{background:#dbeafe!important}#ihracatHucreToplamCubugu{position:fixed;right:18px;bottom:16px;z-index:3100;display:none;align-items:center;gap:12px;max-width:calc(100vw - 36px);padding:9px 12px;border:1px solid #93c5fd;border-radius:10px;background:#eff6ff;box-shadow:0 8px 24px rgba(15,23,42,.18);color:#1e3a8a;font-size:12px}#ihracatHucreToplamCubugu .ihr-hucre-secim-ozeti{display:flex;gap:14px;flex-wrap:wrap}';document.head.appendChild(stil);
        const bar=document.createElement('div');bar.id='ihracatHucreToplamCubugu';bar.innerHTML='<div class="ihr-hucre-secim-ozeti"></div><button type="button" title="Seçimi temizle" onclick="ihracatHucreToplamSeciminiTemizle()" style="border:0;background:#dbeafe;color:#1d4ed8;border-radius:6px;padding:4px 7px;cursor:pointer;font-weight:800;">×</button>';document.body.appendChild(bar);
        document.addEventListener('mousedown',event=>{const td=event.target.closest?.('td');if(!ihracatToplanabilirTabloHucreMi(td)||(!event.ctrlKey&&!event.metaKey&&!event.shiftKey))return;event.preventDefault();if(event.shiftKey&&ihracatHucreSecimi.sonHucre&&ihracatHucreAraliginiSec(ihracatHucreSecimi.sonHucre,td,event.ctrlKey||event.metaKey)){ihracatHucreSecimi.sonHucre=td;ihracatHucreToplamiGuncelle();return;}ihracatHucreSecimi.surukleniyor=true;ihracatHucreSecimi.ekle=!ihracatHucreSecimi.hucreler.has(td);ihracatHucreyiSec(td,ihracatHucreSecimi.ekle);ihracatHucreSecimi.sonHucre=td;ihracatHucreToplamiGuncelle();},true);
        document.addEventListener('mouseover',event=>{if(!ihracatHucreSecimi.surukleniyor)return;const td=event.target.closest?.('td');if(!ihracatToplanabilirTabloHucreMi(td))return;ihracatHucreyiSec(td,ihracatHucreSecimi.ekle);ihracatHucreToplamiGuncelle();},true);
        document.addEventListener('mouseup',()=>{ihracatHucreSecimi.surukleniyor=false;},true);
        document.addEventListener('input',event=>{if(ihracatHucreSecimi.hucreler.has(event.target.closest?.('td')))ihracatHucreToplamiGuncelle();},true);
        document.addEventListener('keydown',event=>{if(event.key==='Escape')ihracatHucreToplamSeciminiTemizle();});
        document.addEventListener('click',event=>{if(!ihracatHucreSecimi.hucreler.size)return;if(event.target.closest?.('#ihracatHucreToplamCubugu'))return;const td=event.target.closest?.('td');if(ihracatToplanabilirTabloHucreMi(td)&&(event.ctrlKey||event.metaKey||event.shiftKey))return;ihracatHucreToplamSeciminiTemizle();},true);
    }

function fdVardiyaVarsayilanGunduzId(){
        const liste=magicpassVardiyaTanimlariniDuzelt();
        return liste.find(x=>x.id==='gunduz')?.id||liste.find(x=>!x.tatil&&!x.resmiTatil&&String(x.bitis)>String(x.baslangic))?.id||liste[0]?.id||'gunduz';
    }

/* Application setup: invoked at the original source positions. */
window.FDApplicationRuntimeStep = (function(__fdApplicationSteps67){
 return function(__fdApplicationStep67){ return __fdApplicationSteps67[__fdApplicationStep67].call(window); };
})([
function(){
document.querySelectorAll('[data-fd-logo]').forEach(logo => { logo.src = FD_YAZILIM_LOGO_DATA; });
},
function(){
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kiraFormEkAlanlariniHazirla);else kiraFormEkAlanlariniHazirla();
},
function(){
kullaniciModulunuBaslat();
},
function(){
ihracatHucreToplaminiBaslat();
},
function(){
(function(){const stil=document.createElement('style');stil.textContent='.magicpass-tatil-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:8px 0 10px;padding:9px;border:1px solid #dbeafe;border-radius:9px;background:#f8fbff}#magicpassAylikTablo tr.magicpass-pazar:not([class*="magicpass-izin-"]) td{background:#fed7aa;color:#7c2d12}#magicpassAylikTablo tr.magicpass-pazar:not([class*="magicpass-izin-"]) td:first-child{box-shadow:inset 5px 0 #ea580c}#magicpassAylikTablo tr.magicpass-pazar:not([class*="magicpass-izin-"]) .magicpass-tarih-gun{color:#9a3412}#magicpassAylikTablo tr.magicpass-pazar.magicpass-pazar-calisti:not([class*="magicpass-izin-"]) td:first-child{box-shadow:inset 5px 0 #059669}#magicpassAylikTablo tr.magicpass-resmi-tatil:not([class*="magicpass-izin-"]) td{background:#fecaca;color:#7f1d1d}#magicpassAylikTablo tr.magicpass-resmi-tatil:not([class*="magicpass-izin-"]) td:first-child{box-shadow:inset 5px 0 #dc2626}#magicpassAylikTablo tr.magicpass-resmi-tatil:not([class*="magicpass-izin-"]) .magicpass-tarih-gun{color:#991b1b}';document.head.appendChild(stil);})();
},
function(){
window.fdManuelDuzeltmeAcmaIstegi=()=>fdManuelDuzeltmeIstek;
},
function(){
window.fdManuelDuzeltmeGecisiniIptalEt=function(onlyInvalid=false){if(onlyInvalid&&(!fdManuelDuzeltmeIstek||fdManuelDuzeltmeIstek.current()))return;fdManuelDuzeltmeIstek?.cancel();if(window.FDModules?.status('manuelduzeltme').loaded)return FDModules.callIfLoaded('manuelduzeltme','fdManuelDuzeltmePenceresiniKapat',[],window)};
},
function(){
window.fdAylikRaporYetkisi=()=>Boolean(activeUser?.sirketId)&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol);
},
function(){
(function(){const holder=document.createElement('div');holder.id='fdVardiyaOrtakAyarTutucu';holder.hidden=true;const detail=document.createElement('details');detail.id='vardiyaTanimDetay';detail.innerHTML='<summary>🕒 Vardiya Tanımları ve Saat Ayarları</summary>';const card=document.querySelector('#magicpass-tab-vardiya .vardiya-tanim-karti');if(card)detail.appendChild(card);holder.appendChild(detail);document.body.appendChild(holder);const mpButon=[...document.querySelectorAll('#magicpassAltSekmeler button')].find(b=>String(b.getAttribute('onclick')||'').includes('magicpass-tab-vardiya'));if(mpButon)mpButon.textContent='⚙️ Dosya Ayarı';document.getElementById('magicpassTatilToolbar')?.remove();})();
},
function(){
anaMenuModulYetkisi=function(anahtar,rol=String(activeUser?.rol||'Personel')){const rolKey=policeMetinAnahtari(rol),duzeltilmis=rolKey==='ADMIN'?'Admin':rolKey==='YONETICI'||rolKey==='YÖNETİCİ'||rolKey==='KULLANICI'?'Yonetici':rolKey==='PERSONEL'?'Personel':rol;return fdPoliceYetkiOncesi(anahtar,duzeltilmis);};
}
]);

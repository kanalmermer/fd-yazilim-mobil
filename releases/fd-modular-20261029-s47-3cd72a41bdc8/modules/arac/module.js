window.FDModules.define('arac',function(){

let fdAracDisposed=false,fdAracOverlay=false;
let fdVehiclePages=null;
const fdAracInitial=fdAracContext(),fdAracTimers=new Set(),fdAracReaders=new Set();
function fdAracContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('arac')])}
function fdAracGecerli(){return !fdAracDisposed&&fdAracInitial===fdAracContext()&&anaMenuModulErisimiVar('arac')}
function fdAracDogrula(write=false){if(!fdAracGecerli())throw Error('Oturum değişti; Araç Takip ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('arac'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdAracBekle(promise){fdAracDogrula();const result=await promise;fdAracDogrula();return result}
function showGlobalOverlay(...args){fdAracOverlay=true;return window.showGlobalOverlay(...args)}
function hideGlobalOverlay(){fdAracOverlay=false;return window.hideGlobalOverlay()}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdAracTimers.delete(id);if(fdAracGecerli())fn(...args)},delay);fdAracTimers.add(id);return id}
class FileReader extends window.FileReader {constructor(){super();fdAracReaders.add(this);this.addEventListener('loadend',()=>fdAracReaders.delete(this),{once:true})}set onload(fn){super.onload=(...args)=>{if(fdAracGecerli())fn?.apply(this,args)}}get onload(){return super.onload}}
let aracListeModu = 'aktif';
let aracAcmaIstegi = 0;
const ARAC_EXPORT_FIELDS = [
        {key:'aracSahibi',label:'Araç Sahibi'},
        {key:'plaka',label:'Plaka'}, {key:'tur',label:'Araç Türü'}, {key:'marka',label:'Marka'}, {key:'model',label:'Model'}, {key:'modelYili',label:'Model Yılı'}, {key:'renk',label:'Renk'}, {key:'yakit',label:'Yakıt'}, {key:'vites',label:'Vites'}, {key:'sasiNo',label:'Şasi No'}, {key:'motorNo',label:'Motor No'}, {key:'ruhsatSeriNo',label:'Ruhsat Seri No'}, {key:'durum',label:'Durum'}, {key:'sube',label:'Şube'}, {key:'km',label:'KM'}, {key:'alisTarihi',label:'Alış Tarihi',date:true}, {key:'alisBedeli',label:'Alış Bedeli',money:true}, {key:'satici',label:'Satıcı'}, {key:'satisTarihi',label:'Satış Tarihi',date:true}, {key:'satisBedeli',label:'Satış Bedeli',money:true}, {key:'alici',label:'Alıcı'}, {key:'muayeneBitis',label:'Vize Bitişi',date:true}, {key:'sigortaBitis',label:'Sigorta Bitişi',date:true}, {key:'kaskoBitis',label:'Kasko Bitişi',date:true}
    ];
let aracExportTuru = 'excel';
let trafikCezaGecmisiniAc;
let trafikCezaFiltrele;
let aracTrafikCezasiFormuAc;
let aracTrafikCezasiKaydet;
let aracTrafikCezasiSil;
let aracTrafikCezalariniCiz;
function aracEnKritikDurum(arac) {
fdAracDogrula(false);

        const sonBakim = [...(Array.isArray(arac.bakimlar) ? arac.bakimlar : [])].sort((a,b) => String(b.tarih || '').localeCompare(String(a.tarih || '')))[0];
        const yil = Number(document.getElementById('aracMtvYil')?.value || new Date().getFullYear());
        const durumlar = [];
        if (aracVizeTakipliMi(arac)) durumlar.push(aracTarihDurumu(arac.muayeneBitis));
        if (aracSigortaTakipliMi(arac)) durumlar.push(aracTarihDurumu(arac.sigortaBitis), aracTarihDurumu(arac.kaskoBitis));
        if (sonBakim?.sonrakiTarih) durumlar.push(aracTarihDurumu(sonBakim.sonrakiTarih));
        if (aracMtvTakipliMi(arac)) [1, 2].forEach(taksit => {
if(!fdAracGecerli())return;

            if (!aracMtvKaydi(arac, yil, taksit)) durumlar.push(aracTarihDurumu(`${yil}-${taksit === 1 ? '01-31' : '07-31'}`));
        });
        if (durumlar.some(d => d.tur === 'gecen')) return 'gecen';
        if (durumlar.some(d => d.tur === 'yaklasan')) return 'yaklasan';
        return 'normal';
    }

function aracMtvOzetHtml(arac, yil) {
fdAracDogrula(false);

        const bir = aracMtvKaydi(arac, yil, 1);
        const iki = aracMtvKaydi(arac, yil, 2);
        const rozet = (kayit, taksit) => kayit
            ? `<span class="badge" title="${tarihFormati(kayit.odemeTarihi)} · ${paraFormatla(kayit.tutar)}" style="background:#dcfce7;color:#166534;">${taksit}. Taksit ✓</span>`
            : (() => {
if(!fdAracGecerli())return;

                const sonTarih = `${yil}-${taksit === 1 ? '01-31' : '07-31'}`;
                const durum = aracTarihDurumu(sonTarih);
                return `<span class="badge" title="Son ödeme: ${tarihFormati(sonTarih)}" style="${durum.stil}">${taksit}. Taksit ${durum.tur === 'gecen' ? 'Gecikti' : 'Bekliyor'}</span>`;
            })();
        return `<div style="display:grid;gap:4px;">${rozet(bir, 1)}${rozet(iki, 2)}</div>`;
    }

function aracBelgeButonu(belge, etiket) {
fdAracDogrula(false);

        if (!belge?.url) return '';
        return `<button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(belge.url))}, ${JSON.stringify(etiket)}, "Araç Belgesi")'>📄 ${etiket}</button>`;
    }

function aracRuhsatAc(id) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id));
        if (!arac?.belgeler?.ruhsat?.url) { alert('Bu araca ait ruhsat görseli veya PDF kaydı bulunmuyor.'); return; }
        icraPdfAc(String(arac.belgeler.ruhsat.url), `${arac.plaka} Ruhsatı`, 'Araç Ruhsatı');
    }

// Vehicle-only renderer: retain the existing floating vehicle document viewer.
// The shared policy renderer and policy-module permissions stay unchanged.
function policeBelgeHtml(p) {
    fdAracDogrula(false);
    if (!p?.belge?.url) return '-';
    const action = 'icraPdfAc('+JSON.stringify(String(p.belge.url))+','+JSON.stringify([p.hedefAdi,p.tur].filter(Boolean).join(' · '))+',"Araç Poliçesi")';
    return `<button type="button" class="btn-modern btn-detail-modern police-belge-ac" onclick="${escapeDashboardText(action)}" title="Belgeyi aç" aria-label="Belgeyi aç">📄 <span>Aç</span></button>`;
}

function aracBelgeMerkeziniAc(id) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        const belgeler = [{ key:'ruhsat', ad:'Ruhsat' }, { key:'noter', ad:'Alış Noter Satış Sözleşmesi' }];
        document.getElementById('aracBelgelerBaslik').textContent = `📁 ${arac.plaka} · Araç Belgeleri`;
        document.getElementById('aracBelgelerBody').innerHTML = belgeler.map(b => {
if(!fdAracGecerli())return;

            const belge = arac.belgeler?.[b.key];
            return `<div class="card" style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;"><div><strong>${b.ad}</strong><div style="font-size:.75rem;color:#64748b;margin-top:4px;">${escapeDashboardText(belge?.ad || 'Belge yüklenmemiş')}</div></div><div class="action-btns">${belge?.url ? `<button class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(belge.url))}, ${JSON.stringify(arac.plaka)}, ${JSON.stringify(b.ad)})'>👁️ Görüntüle</button><a class="btn-modern btn-edit-modern" href="${escapeDashboardText(String(belge.url))}" target="_blank" rel="noopener">📥 PDF / Dosya Kaydet</a>` : '<span class="badge" style="background:#f1f5f9;color:#64748b;">Kayıt yok</span>'}</div></div>`;
        }).join('');
        document.getElementById('modalAracBelgeler').style.display = 'flex';
    }

function aracDetayBilgiAlani(alanlar) {
fdAracDogrula(false);

        return `<div class="personel-summary-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">${alanlar.map(([etiket,deger]) => `<article class="personel-summary-card"><span>${escapeDashboardText(etiket)}</span><strong style="font-size:.92rem;overflow-wrap:anywhere;">${escapeDashboardText(deger ?? '-')}</strong></article>`).join('')}</div>`;
    }

function aracAlisSatisDetayAlani(arac) {
fdAracDogrula(false);

        const bilgiKartlari = alanlar => `<div class="arac-devir-bilgiler">${alanlar.map(([etiket,deger]) => `<div class="arac-devir-bilgi"><span>${escapeDashboardText(etiket)}</span><strong>${escapeDashboardText(deger || '-')}</strong></div>`).join('')}</div>`;
        const alis = bilgiKartlari([
            ['Alış Tarihi',tarihFormati(arac.alisTarihi)],
            ['Satıcı',arac.satici || '-'],
            ['Alış Bedeli',paraFormatla(arac.alisBedeli)],
            ['Alış Kilometresi',Number(arac.alisKm || 0).toLocaleString('tr-TR')],
            ['Fatura / Belge No',arac.faturaNo || '-']
        ]);
        const satis = bilgiKartlari([
            ['Satış Tarihi',tarihFormati(arac.satisTarihi)],
            ['Alıcı',arac.alici || '-'],
            ['Satış Bedeli',Number(arac.satisBedeli || 0) > 0 ? paraFormatla(arac.satisBedeli) : '-']
        ]);
        return `<div class="arac-alis-satis-layout"><section class="arac-devir-panel alis"><header class="arac-devir-baslik"><div><h3>📥 Alış Bilgileri</h3><small>Aracın şirkete giriş ve edinim bilgileri</small></div><span class="arac-devir-rozet">Alış</span></header>${alis}</section><section class="arac-devir-panel satis"><header class="arac-devir-baslik"><div><h3>📤 Satış Bilgileri</h3><small>Aracın devir ve satış bilgileri</small></div><span class="arac-devir-rozet">Satış</span></header>${satis}</section></div>`;
    }

function aracDetayTablosu(basliklar, satirlar, bosMesaj) {
fdAracDogrula(false);

        return `<div class="table-wrapper"><table><thead><tr>${basliklar.map(b => `<th>${escapeDashboardText(b)}</th>`).join('')}</tr></thead><tbody>${satirlar.length ? satirlar.join('') : `<tr><td colspan="${basliklar.length}" style="text-align:center;padding:22px;color:#64748b;">${escapeDashboardText(bosMesaj)}</td></tr>`}</tbody></table></div>`;
    }

function aracDetayModaliniAc(id) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        const personel = personeller.find(p => aktifSirketeAit(p) && String(p.id) === String(arac.personelId));
        document.getElementById('aracDetayBaslik').textContent = `🚘 ${arac.plaka} · ${`${arac.marka || ''} ${arac.model || ''}`.trim()}`;
        document.getElementById('arac-detay-genel').innerHTML = `${arac.foto?.url ? `<div style="text-align:center;margin-bottom:16px;"><img src="${escapeDashboardText(aracFotoGosterimUrl(arac.foto))}" alt="${escapeDashboardText(arac.plaka)}" style="max-width:420px;width:100%;max-height:230px;object-fit:contain;border-radius:12px;border:1px solid #cbd5e1;background:#f8fafc;"></div>` : ''}${aracDetayBilgiAlani([
            ['Plaka',arac.plaka],['Araç Türü',arac.tur],['Marka',arac.marka],['Model',arac.model],['Model Yılı',arac.modelYili],['Renk',arac.renk],['Yakıt',arac.yakit],['Vites',arac.vites],['Şasi No',arac.sasiNo],['Motor No',arac.motorNo],['Ruhsat Seri No',arac.ruhsatSeriNo],['Kilometre',Number(arac.km || 0).toLocaleString('tr-TR')],['Durum',arac.durum],['Şube / Kullanım Yeri',arac.sube],['Araç Sahibi',arac.aracSahibi||'-'],['Zimmetli Personel',personel?.ad || 'Atanmamış'],['Açıklama',arac.aciklama]
        ])}`;
        document.getElementById('arac-detay-satis').innerHTML = aracAlisSatisDetayAlani(arac);
        const belgeSatirlari = [
            ['Ruhsat',arac.belgeler?.ruhsat],['Alış Noter Satış Sözleşmesi',arac.belgeler?.noter],['Trafik Sigortası',arac.belgeler?.sigorta],['Kasko',arac.belgeler?.kasko]
        ].map(([ad,belge]) => `<tr><td>${ad}</td><td>${escapeDashboardText(belge?.ad || '-')}</td><td>${belge?.url ? aracBelgeButonu(belge,ad) : '-'}</td></tr>`);
        document.getElementById('arac-detay-belgeler').innerHTML = aracDetayTablosu(['Belge Türü','Dosya Adı','Görüntüle'],belgeSatirlari,'Belge bulunmuyor.');
        const mtvSatirlari = [...(arac.mtvOdemeleri || [])].sort((a,b)=>Number(b.yil)-Number(a.yil)||Number(a.taksit)-Number(b.taksit)).map(o => `<tr><td>${o.yil}</td><td>${o.taksit}. Taksit</td><td>${tarihFormati(o.odemeTarihi)}</td><td>${paraFormatla(o.tutar)}</td><td>${escapeDashboardText(o.referans || '-')}</td></tr>`);
        document.getElementById('arac-detay-mtv').innerHTML = aracDetayTablosu(['Yıl','Taksit','Ödeme Tarihi','Tutar','Referans'],mtvSatirlari,'MTV ödeme kaydı bulunmuyor.');
        const guncelPoliceler = [];
        if (arac.sigortaSirketi || arac.sigortaPoliceNo) guncelPoliceler.push({tur:'Trafik Sigortası',sirket:arac.sigortaSirketi,policeNo:arac.sigortaPoliceNo,bedel:arac.sigortaBedeli,baslangic:arac.sigortaBaslangic,bitis:arac.sigortaBitis,belge:arac.belgeler?.sigorta,guncel:true});
        if (arac.kaskoSirketi || arac.kaskoPoliceNo) guncelPoliceler.push({tur:'Kasko',sirket:arac.kaskoSirketi,policeNo:arac.kaskoPoliceNo,bedel:arac.kaskoBedeli,baslangic:arac.kaskoBaslangic,bitis:arac.kaskoBitis,belge:arac.belgeler?.kasko,guncel:true});
        const policeSatirlari = [...guncelPoliceler,...(arac.sigortaGecmisi || [])].sort((a,b)=>String(b.bitis||'').localeCompare(String(a.bitis||''))).map(p => `<tr><td>${escapeDashboardText(p.tur || '-')}</td><td>${escapeDashboardText(p.sirket || '-')}</td><td>${escapeDashboardText(p.policeNo || '-')}</td><td>${p.bedel ? paraFormatla(p.bedel) : '-'}</td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td>${p.guncel ? 'Güncel' : 'Geçmiş'}</td><td>${p.belge?.url ? aracBelgeButonu(p.belge,p.tur) : '-'}</td></tr>`);
        document.getElementById('arac-detay-sigorta').innerHTML = aracDetayTablosu(['Tür','Şirket','Poliçe No','Poliçe Bedeli','Başlangıç','Bitiş','Kayıt','Belge'],policeSatirlari,'Sigorta veya kasko kaydı bulunmuyor.');
        const guncelVize = arac.muayeneTarihi || arac.muayeneBitis || arac.egzozMuayeneTarihi || arac.egzozMuayeneBitis ? [{tarih:arac.muayeneTarihi,bitis:arac.muayeneBitis,egzozTarihi:arac.egzozMuayeneTarihi,egzozBitis:arac.egzozMuayeneBitis,durum:arac.muayeneDurumu,kusurlar:arac.muayeneKusurlari,guncel:true}] : [];
        const vizeSatirlari = [...guncelVize,...(arac.vizeGecmisi || [])].sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||''))).map(v => `<tr><td>${tarihFormati(v.tarih)}</td><td>${tarihFormati(v.bitis)}</td><td>${tarihFormati(v.egzozTarihi)}</td><td>${tarihFormati(v.egzozBitis)}</td><td>${escapeDashboardText(v.durum === 'Geçti' ? 'Kusursuz Geçti' : (v.durum || '-'))}</td><td>${escapeDashboardText(v.kusurlar || '-')}</td><td>${v.guncel ? 'Güncel' : 'Geçmiş'}</td></tr>`);
        document.getElementById('arac-detay-vize').innerHTML = aracDetayTablosu(['Araç Muayene','Araç Muayene Bitişi','Egzoz Muayene','Egzoz Bitişi','Sonuç','Kusurlar','Kayıt'],vizeSatirlari,'Vize kaydı bulunmuyor.');
        const bakimSatirlari = [...(arac.bakimlar || [])].sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||''))).map(b => `<tr><td>${tarihFormati(b.tarih)}</td><td>${Number(b.km||0).toLocaleString('tr-TR')}</td><td>${escapeDashboardText(b.tur||'-')}</td><td>${fdBakimIslemHtml(b)}</td><td>${escapeDashboardText(b.servis||'-')}${b.faturaNo?'<br>Fatura: '+escapeDashboardText(b.faturaNo):''}</td><td>${paraFormatla(b.tutar)}</td><td>${b.belge?.url ? aracBelgeButonu(b.belge,'Bakım Belgesi') : '-'}</td></tr>`);
        document.getElementById('arac-detay-bakim').innerHTML = aracDetayTablosu(['Tarih','KM','Bakım Türü','İşlemler','Servis','Tutar','Belge'],bakimSatirlari,'Bakım kaydı bulunmuyor.');
        const bugun=new Date(),yil=String(bugun.getFullYear()),ay=`${yil}-${String(bugun.getMonth()+1).padStart(2,'0')}`,yakitKayitlari=akaryakitHareketleri().filter(h=>h.tur==='cikis'&&String(h.aracId)===String(arac.id)).sort((a,b)=>String(b.tarih).localeCompare(String(a.tarih))),araliklar=akaryakitTuketimAraliklari(arac.id),yilAraliklari=araliklar.filter(a=>String(a.sonTarih).startsWith(yil)),yilKm=yilAraliklari.reduce((s,a)=>s+a.kmFarki,0),yilLitre=yilAraliklari.reduce((s,a)=>s+a.litre,0),sonAralik=[...araliklar].sort((a,b)=>String(b.sonTarih).localeCompare(String(a.sonTarih)))[0],sonKayit=yakitKayitlari[0],buAyYakit=yakitKayitlari.filter(h=>String(h.tarih).startsWith(ay)).reduce((s,h)=>s+Number(h.litre||0),0),buYilYakit=yakitKayitlari.filter(h=>String(h.tarih).startsWith(yil)).reduce((s,h)=>s+Number(h.litre||0),0);
        const yakitSatirlari=yakitKayitlari.slice(0,10).map(h=>{
if(!fdAracGecerli())return;
const depo=akaryakitDepolari().find(d=>String(d.id)===String(h.depoId)),oran=araliklar.find(a=>String(a.kayitId)===String(h.id))?.oran;return`<tr><td>${tarihFormati(h.tarih)}</td><td>${escapeDashboardText(depo?.ad||'-')}</td><td>${Number(h.litre||0).toLocaleString('tr-TR')} L</td><td>${Number(h.km||0).toLocaleString('tr-TR')}</td><td>${escapeDashboardText(h.alan||'-')}</td><td>${oran?`${oran.toFixed(2).replace('.',',')} L / 100 KM`:'-'}</td></tr>`;});
        document.getElementById('arac-detay-yakit').innerHTML=`${aracDetayBilgiAlani([['Son Yakıt Tarihi',tarihFormati(sonKayit?.tarih)],['Son Alınan Yakıt',sonKayit?`${Number(sonKayit.litre||0).toLocaleString('tr-TR')} L`:'-'],['Son Yakıt KM',sonKayit?`${Number(sonKayit.km||0).toLocaleString('tr-TR')} KM`:'-'],['Bu Ay Alınan Yakıt',`${buAyYakit.toLocaleString('tr-TR')} L`],['Bu Yıl Alınan Yakıt',`${buYilYakit.toLocaleString('tr-TR')} L`],['Son İki Alım Arası',sonAralik?`${sonAralik.kmFarki.toLocaleString('tr-TR')} KM`:'-'],['Son Tüketim',sonAralik?`${sonAralik.oran.toFixed(2).replace('.',',')} L / 100 KM`:'-'],['Yıllık Ortalama',yilKm?`${(yilLitre/yilKm*100).toFixed(2).replace('.',',')} L / 100 KM`:'-']])}<div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 10px;"><h3 style="margin:0;">Son Yakıt Kayıtları</h3><button class="btn-modern btn-detail-modern" onclick="document.getElementById('modalAracDetay').style.display='none';akaryakitAracDetayiniAc('${arac.id}')">⛽ Tüm Yakıt Raporunu Aç</button></div>${aracDetayTablosu(['Tarih','Depo','Litre','KM','Alan','100 KM Tüketim'],yakitSatirlari,'Yakıt kaydı bulunmuyor.')}`;
        const takipSekmeleri = {
            'arac-detay-mtv': aracMtvTakipliMi(arac),
            'arac-detay-sigorta': aracSigortaTakipliMi(arac),
            'arac-detay-vize': aracVizeTakipliMi(arac)
        };
        document.querySelectorAll('#aracDetaySekmeler button').forEach((b,i)=>{
if(!fdAracGecerli())return;

            const hedef = Object.keys(takipSekmeleri).find(id=>String(b.getAttribute('onclick')||'').includes(id));
            b.style.display = hedef && !takipSekmeleri[hedef] ? 'none' : '';
            b.classList.toggle('active',i===0);
        });
        document.querySelectorAll('#modalAracDetay .tab-content').forEach(tab=>tab.classList.toggle('active',tab.id==='arac-detay-genel'));
        document.getElementById('modalAracDetay').style.display = 'flex';
    }

function aracDetaySekmeDegistir(id, button) {
fdAracDogrula(false);

        document.querySelectorAll('#modalAracDetay .tab-content').forEach(tab=>tab.classList.remove('active'));
        document.querySelectorAll('#aracDetaySekmeler button').forEach(b=>b.classList.remove('active'));
        document.getElementById(id)?.classList.add('active'); button?.classList.add('active');
    }

function aracDetayModaliniKapat() {
fdAracDogrula(false);
 document.getElementById('modalAracDetay').style.display = 'none'; }

function aracExportButonlariniKur() {
fdAracDogrula(false);

        const hedefler = [
            ['aracMtvArama','aracMtvBody','MTV ÖDEME LİSTESİ','MTV_ODEME_LISTESI'],
            ['aracSigortaArama','aracSigortaBody','SİGORTA VE KASKO LİSTESİ','SIGORTA_KASKO_LISTESI'],
            ['aracBakimGecmisArama','aracBakimBody','BAKIM GEÇMİŞİ','BAKIM_GECMISI']
        ];
        hedefler.forEach(([aramaId,bodyId,baslik,dosya]) => {
if(!fdAracGecerli())return;

            const filtre = document.getElementById(aramaId)?.closest('.filter-bar'); if (!filtre || filtre.querySelector(`[data-export="${bodyId}"]`)) return;
            const alan=document.createElement('span'); alan.dataset.export=bodyId; alan.style.cssText='display:flex;gap:7px;margin-left:auto;';
            alan.innerHTML=`<button type="button" class="btn-export btn-excel">📊 Excel</button><button type="button" class="btn-export btn-pdf">📄 PDF</button>`;
            const butonlar=alan.querySelectorAll('button'); butonlar[0].onclick=()=>aracTabloDisariAktar(bodyId,'excel',baslik,dosya); butonlar[1].onclick=()=>aracTabloDisariAktar(bodyId,'pdf',baslik,dosya);
            filtre.appendChild(alan);
        });
    }

function aracFotoGosterimUrl(foto) {
fdAracDogrula(false);

        if (!foto) return '';
        const id = String(foto.id || foto.url || '').match(/\/d\/([^/]+)/)?.[1] || String(foto.id || '');
        return id ? `https:\x2f\x2fdrive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w500` : String(foto.url || '');
    }

function aracFotoOnizlemesiniGoster(foto = null, geciciUrl = '') {
fdAracDogrula(false);

        const alan = document.getElementById('aracFotoOnizleme');
        const url = geciciUrl || aracFotoGosterimUrl(foto);
        alan.innerHTML = url ? `<img src="${escapeDashboardText(url)}" alt="Araç görseli" style="width:100%;max-width:260px;height:150px;object-fit:cover;border:1px solid #cbd5e1;border-radius:10px;">` : '<small style="color:#94a3b8;">Kayıtlı araç görseli yok</small>';
    }

function aracFotoSecildi(input) {
fdAracDogrula(true);

        const dosya = input.files?.[0];
        if (!dosya) return;
        const okuyucu = new FileReader();
        okuyucu.onload = () => aracFotoOnizlemesiniGoster(null, okuyucu.result);
        okuyucu.readAsDataURL(dosya);
    }

function aracRuhsatDurumMesaji(metin, tur = 'bilgi') {
fdAracDogrula(false);

        const alan = document.getElementById('aracRuhsatOkumaDurumu');
        if (!alan) return;
        const stiller = {
            bilgi:'background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;',
            basari:'background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;',
            uyari:'background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;',
            hata:'background:#fff1f2;border:1px solid #fecdd3;color:#be123c;'
        };
        alan.style.display = 'block'; alan.style.cssText += stiller[tur] || stiller.bilgi; alan.textContent = metin;
    }

function aracRuhsatAlanlariniBul(metin) {
fdAracDogrula(false);

        const satirlar = String(metin || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const normSatirlar = satirlar.map(aracRuhsatMetniniEsitle);
        const etiketDegeri = etiketler => {
if(!fdAracGecerli())return;

            for (let i = 0; i < normSatirlar.length; i++) {
                for (const etiket of etiketler) {
                    const index = normSatirlar[i].indexOf(etiket);
                    if (index < 0) continue;
                    let deger = satirlar[i].slice(index + etiket.length).replace(/^[\s:;.\-–—]+/, '').trim();
                    if (!deger || aracRuhsatMetniniEsitle(deger) === etiket) deger = satirlar[i + 1] || '';
                    if (deger && deger.length <= 80) return deger.trim();
                }
            }
            return '';
        };
        const tumNorm = aracRuhsatMetniniEsitle(metin);
        const plaka = (tumNorm.match(/\b\d{2}\s*[A-Z]{1,3}\s*\d{2,4}\b/) || [])[0] || etiketDegeri(['PLAKASI','PLAKA NO','PLAKA']);
        const sasiAdaylari = tumNorm.match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) || [];
        const sasiEtiket = etiketDegeri(['SASI NO','SASI NUMARASI','SASI']);
        const motorEtiket = etiketDegeri(['MOTOR NO','MOTOR NUMARASI']);
        const belgeSeri = etiketDegeri(['BELGE SERI NO','RUHSAT SERI NO','SERI NO']);
        return {
            plaka:String(plaka || '').replace(/\s+/g,' ').trim(),
            marka:etiketDegeri(['MARKASI','MARKA']),
            model:etiketDegeri(['TICARI ADI','TIPI','TIP / MODELI','TIPI / MODELI','MODELI']),
            tur:etiketDegeri(['CINSI','ARAC CINSI']),
            modelYili:(etiketDegeri(['MODEL YILI','MODELYILI']).match(/\b(19|20)\d{2}\b/) || [])[0] || '',
            renk:etiketDegeri(['RENGI','RENK']),
            yakit:etiketDegeri(['YAKIT CINSI','YAKITI','YAKIT']),
            sasiNo:(aracRuhsatMetniniEsitle(sasiEtiket).match(/[A-HJ-NPR-Z0-9]{17}/) || [])[0] || sasiAdaylari[0] || '',
            motorNo:(() => {
if(!fdAracGecerli())return;
 const aday=(aracRuhsatMetniniEsitle(motorEtiket).match(/[A-Z0-9\-]{6,25}/) || [])[0] || ''; return /SASI|SASE|MOTORNO|MOTORSUZ|YOK/.test(aday) ? '' : aday; })(),
            ruhsatSeriNo:String(belgeSeri || '').replace(/\s+/g,' ').trim()
        };
    }

function aracRuhsatOcrKelimeleriniAl(veri) {
fdAracDogrula(false);

        const bulunan = [];
        const tara = nesne => {
if(!fdAracGecerli())return;

            if (!nesne || typeof nesne !== 'object') return;
            if (Array.isArray(nesne)) { nesne.forEach(tara); return; }
            if (typeof nesne.text === 'string' && nesne.bbox && Number.isFinite(Number(nesne.bbox.x0))) {
                bulunan.push({ text:nesne.text.trim(), norm:aracRuhsatMetniniEsitle(nesne.text), x0:Number(nesne.bbox.x0), y0:Number(nesne.bbox.y0), x1:Number(nesne.bbox.x1), y1:Number(nesne.bbox.y1) });
            }
            ['blocks','paragraphs','lines','words','symbols'].forEach(anahtar => {
if(!fdAracGecerli())return;
 if (nesne[anahtar]) tara(nesne[anahtar]); });
        };
        if (typeof veri?.tsv === 'string') {
            veri.tsv.split(/\r?\n/).slice(1).forEach(satir => {
if(!fdAracGecerli())return;

                const p = satir.split('\t');
                if (p.length < 12 || Number(p[0]) !== 5 || !String(p.slice(11).join('\t')).trim()) return;
                const x0=Number(p[6]), y0=Number(p[7]), genislik=Number(p[8]), yukseklik=Number(p[9]), text=p.slice(11).join('\t').trim();
                bulunan.push({text,norm:aracRuhsatMetniniEsitle(text),x0,y0,x1:x0+genislik,y1:y0+yukseklik});
            });
        }
        tara(veri?.words?.length ? veri.words : veri?.blocks);
        const tekil = new Map();
        bulunan.filter(k => k.text).forEach(k => tekil.set(`${k.x0}|${k.y0}|${k.x1}|${k.y1}|${k.text}`, k));
        return [...tekil.values()];
    }

function aracRuhsatAlanlariniKonumdanBul(veri) {
fdAracDogrula(false);

        const kelimeler = aracRuhsatOcrKelimeleriniAl(veri);
        if (!kelimeler.length) return {};
        const belgeGenisligi = Math.max(...kelimeler.map(k => k.x1), Number(veri?.imageSize?.width || 0), 1);
        const baslikParcasi = /^(A|B|D|E|F|G|I|J|P|R|S|Y|Z)(\.|\)|\d|$)|PLAKA|MARKA|MODEL|RENG|MOTOR|SASI|TESCIL|CINSI|TICARI|ARAC|YAKIT|BELGE|SERI/;
        const oku = ({etiketler, genislik, dogrula}) => {
if(!fdAracGecerli())return;

            const baslik = kelimeler.filter(k => etiketler.some(e => k.norm === e || k.norm.includes(e))).sort((a,b) => a.y0 - b.y0 || a.x0 - b.x0)[0];
            if (!baslik) return '';
            const yukseklik = Math.max(10, baslik.y1 - baslik.y0);
            const adaylar = kelimeler.filter(k => {
if(!fdAracGecerli())return;

                const merkezX = (k.x0 + k.x1) / 2;
                const asagi = k.y0 >= baslik.y1 - Math.max(2, yukseklik * .12) && k.y0 <= baslik.y1 + yukseklik * 2.8;
                return asagi && merkezX >= baslik.x0 - belgeGenisligi * .012 && merkezX <= baslik.x0 + belgeGenisligi * genislik && !baslikParcasi.test(k.norm);
            }).sort((a,b) => a.y0 - b.y0 || a.x0 - b.x0);
            if (!adaylar.length) return '';
            const ilkY = adaylar[0].y0;
            const ham = adaylar.filter(k => Math.abs(k.y0 - ilkY) <= yukseklik * .8).map(k => k.text).join(' ').replace(/\s+/g,' ').trim();
            return !dogrula || dogrula(ham) ? ham : '';
        };
        const plakaHam = oku({etiketler:['PLAKA'],genislik:.21,dogrula:v=>/\d{2}\s*[A-Z]{1,3}\s*\d{2,4}/.test(aracRuhsatMetniniEsitle(v))});
        const modelYiliHam = oku({etiketler:['MODEL'],genislik:.13,dogrula:v=>/\b(19|20)\d{2}\b/.test(v)});
        const sasiHam = oku({etiketler:['SASI'],genislik:.40,dogrula:v=>/[A-HJ-NPR-Z0-9]{17}/.test(aracRuhsatMetniniEsitle(v))});
        const motorHam = oku({etiketler:['MOTOR'],genislik:.40,dogrula:v=>{
if(!fdAracGecerli())return;
 const n=aracRuhsatMetniniEsitle(v).replace(/[^A-Z0-9]/g,''); return n.length>=6 && !/SASI|SASENO|MOTORNO|MOTORSUZ/.test(n); }});
        return {
            plaka:(aracRuhsatMetniniEsitle(plakaHam).match(/\b\d{2}\s*[A-Z]{1,3}\s*\d{2,4}\b/) || [])[0] || '',
            marka:oku({etiketler:['MARKASI','MARKA'],genislik:.19,dogrula:v=>v.length>=2 && v.length<=35}),
            modelYili:(modelYiliHam.match(/\b(19|20)\d{2}\b/) || [])[0] || '',
            renk:oku({etiketler:['RENGI','RENK'],genislik:.22,dogrula:v=>v.length>=3 && v.length<=35}),
            sasiNo:(aracRuhsatMetniniEsitle(sasiHam).match(/[A-HJ-NPR-Z0-9]{17}/) || [])[0] || '',
            motorNo:(aracRuhsatMetniniEsitle(motorHam).match(/[A-Z0-9\-]{6,25}/) || [])[0] || ''
        };
    }

function aracRuhsatAlanlariniFormaYaz(alanlar) {
fdAracDogrula(false);

        const bulunan = [], korunan = [];
        const yaz = (id, deger, etiket) => {
if(!fdAracGecerli())return;

            if (!deger) return;
            const alan = document.getElementById(id); if (!alan) return;
            if (String(alan.value || '').trim()) { korunan.push(etiket); return; }
            alan.value = String(deger).trim().toLocaleUpperCase('tr-TR'); bulunan.push(etiket);
        };
        yaz('aracPlaka', alanlar.plaka, 'plaka'); yaz('aracMarka', alanlar.marka, 'marka'); yaz('aracModel', alanlar.model, 'model/tip');
        yaz('aracModelYili', alanlar.modelYili, 'model yılı'); yaz('aracRenk', alanlar.renk, 'renk'); yaz('aracSasiNo', alanlar.sasiNo, 'şasi no'); yaz('aracMotorNo', alanlar.motorNo, 'motor no'); yaz('aracRuhsatSeriNo', alanlar.ruhsatSeriNo, 'ruhsat seri no');
        if (alanlar.tur) {
            if (document.getElementById('aracTuru').value) korunan.push('araç türü');
            else {
            const turNorm = aracRuhsatMetniniEsitle(alanlar.tur);
            const secenek = [...document.getElementById('aracTuru').options].find(o => turNorm.includes(aracRuhsatMetniniEsitle(o.value)) || aracRuhsatMetniniEsitle(o.value).includes(turNorm));
            if (secenek?.value) { document.getElementById('aracTuru').value = secenek.value; bulunan.push('araç türü'); }
            }
        }
        if (alanlar.yakit) {
            if (document.getElementById('aracYakit').value) korunan.push('yakıt');
            else {
            const yakitNorm = aracRuhsatMetniniEsitle(alanlar.yakit);
            const secenek = [...document.getElementById('aracYakit').options].find(o => yakitNorm.includes(aracRuhsatMetniniEsitle(o.value)));
            if (secenek?.value) { document.getElementById('aracYakit').value = secenek.value; bulunan.push('yakıt'); }
            }
        }
        return { bulunan, korunan };
    }

async function aracRuhsatDosyasiSecildi(input) {
try{
fdAracDogrula(true);

        const dosya = input.files?.[0];
        if (!dosya) return;
        if (dosya.type === 'application/pdf') {
            aracRuhsatDurumMesaji('Ruhsat PDF olarak seçildi. Otomatik alan okuma görsel dosyalarda çalışır; PDF kaydedilecektir.', 'uyari');
            return;
        }
        if (!String(dosya.type).startsWith('image/')) return;
        if (!window.Tesseract) { aracRuhsatDurumMesaji('Ruhsat okuma aracı yüklenemedi. İnternet bağlantısını kontrol edip sayfayı yenileyin.', 'hata'); return; }
        try {
            aracRuhsatDurumMesaji('Ruhsat görseli okunuyor: %0', 'bilgi');
            const sonuc = await fdAracBekle(Tesseract.recognize(dosya, 'tur+eng', {
                logger: bilgi => {
if(!fdAracGecerli())return;

                    if (bilgi.status === 'recognizing text') aracRuhsatDurumMesaji(`Ruhsat görseli okunuyor: %${Math.round(Number(bilgi.progress || 0) * 100)}`, 'bilgi');
                }
            }));
            const metin = sonuc?.data?.text || '';
            if (!metin.trim()) { aracRuhsatDurumMesaji('Görselde okunabilir yazı bulunamadı. Daha net ve düz çekilmiş bir görsel deneyin.', 'uyari'); return; }
            const metinden = aracRuhsatAlanlariniBul(metin);
            const konumdan = aracRuhsatAlanlariniKonumdanBul(sonuc?.data);
            const alanlar = { ...metinden };
            ['plaka','marka','modelYili','renk','sasiNo','motorNo'].forEach(anahtar => {
if(!fdAracGecerli())return;
 if (konumdan[anahtar]) alanlar[anahtar] = konumdan[anahtar]; });
            const aktarim = aracRuhsatAlanlariniFormaYaz(alanlar);
            const mesajlar = [];
            if (aktarim.bulunan.length) mesajlar.push(`Ruhsattan ${aktarim.bulunan.join(', ')} aktarıldı.`);
            if (aktarim.korunan.length) mesajlar.push(`Elle girilmiş ${aktarim.korunan.join(', ')} değiştirilmedi.`);
            aracRuhsatDurumMesaji(mesajlar.length ? `${mesajlar.join(' ')} Kaydetmeden önce bilgileri kontrol edin.` : 'Ruhsat okundu ancak alanlar eşleştirilemedi. Bilgileri elle girebilirsiniz.', aktarim.bulunan.length ? 'basari' : 'uyari');
        } catch (error) {
if(!fdAracGecerli())return;

            console.warn('Ruhsat OCR hatası:', error);
            aracRuhsatDurumMesaji('Ruhsat görseli okunamadı. Görseli kırpıp daha net şekilde tekrar deneyin.', 'hata');
        }
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracListesiniCiz() {
fdAracDogrula(false);

        const body = document.getElementById('aracTakipBody');
        if (!body) return;
        const arama = String(document.getElementById('aracArama')?.value || '').toLocaleLowerCase('tr-TR');
        const durumFiltre = document.getElementById('aracDurumFiltre')?.value || '';
        const uyariFiltre = document.getElementById('aracUyariFiltre')?.value || '';
        const sirketAraclari = araclar.filter(aktifSirketeAit);
        const liste = sirketAraclari.filter(arac => {
if(!fdAracGecerli())return;

            const satildi = String(arac.durum) === 'Satıldı' || Boolean(arac.satisTarihi);
            if (aracListeModu === 'aktif' && satildi) return false;
            if (aracListeModu === 'satilan' && !satildi) return false;
            const personel = personeller.find(p => String(p.id) === String(arac.personelId));
            const aramaMetni = [arac.plaka, arac.marka, arac.model, arac.aracSahibi, arac.sasiNo, arac.motorNo, arac.sube, personel?.ad].join(' ').toLocaleLowerCase('tr-TR');
            if (arama && !aramaMetni.includes(arama)) return false;
            if (durumFiltre && String(arac.durum) !== durumFiltre) return false;
            if (uyariFiltre && aracEnKritikDurum(arac) !== uyariFiltre) return false;
            return true;
        }).sort((a, b) => String(a.plaka || '').localeCompare(String(b.plaka || ''), 'tr'));
        body.innerHTML = liste.map((arac, index) => {
if(!fdAracGecerli())return;

            const personel = personeller.find(p => String(p.id) === String(arac.personelId));
            return `<tr>
                <td>${index + 1}</td>
                <td><button type="button" class="fd-table-cell-link" onclick="aracBelgeMerkeziniAc('${arac.id}')">${escapeDashboardText(arac.plaka || '-')}</button></td>
                <td><button type="button" class="fd-table-cell-link" onclick="aracDetayModaliniAc('${arac.id}')">${escapeDashboardText(`${arac.marka || ''} ${arac.model || ''}`.trim() || '-')}</button></td>
                <td>${escapeDashboardText(arac.aracSahibi || '-')}</td><td>${escapeDashboardText(arac.modelYili || '-')}</td><td>${escapeDashboardText(arac.tur || '-')}</td>
                <td>${escapeDashboardText(arac.sasiNo || '-')}</td><td>${escapeDashboardText(arac.motorNo || '-')}</td>
                <td><span class="badge" style="background:${arac.durum === 'Aktif' ? '#dcfce7' : arac.durum === 'Satıldı' ? '#e2e8f0' : '#fef3c7'};color:${arac.durum === 'Aktif' ? '#166534' : '#334155'};">${escapeDashboardText(arac.durum || 'Aktif')}</span></td>
                <td><div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="aracFormunuAc('${arac.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="aracSil('${arac.id}')">🗑️ Sil</button></div></td>
            </tr>`;
        }).join('') || '<tr><td colspan="10" style="text-align:center;padding:24px;color:#64748b;">Filtreye uygun araç kaydı bulunmuyor.</td></tr>';
        const mobilKartlar=document.getElementById('aracMobilKartlar');
        if(mobilKartlar)mobilKartlar.innerHTML=liste.map(arac=>{
if(!fdAracGecerli())return;
const personel=personeller.find(p=>String(p.id)===String(arac.personelId)),id=escapeDashboardText(String(arac.id||'')),durum=escapeDashboardText(arac.durum||'Aktif');return `<article class="arac-mobil-kart"><div class="arac-mobil-kart-ust"><button type="button" class="arac-mobil-plaka" onclick="aracBelgeMerkeziniAc('${id}')">${escapeDashboardText(arac.plaka||'-')}</button><span class="badge">${durum}</span></div><strong>${escapeDashboardText(`${arac.marka||''} ${arac.model||''}`.trim()||'Araç bilgisi girilmemiş')}</strong><dl><div><dt>Araç sahibi</dt><dd>${escapeDashboardText(arac.aracSahibi||'Belirtilmemiş')}</dd></div><div><dt>Tür / Model yılı</dt><dd>${escapeDashboardText([arac.tur,arac.modelYili].filter(Boolean).join(' · ')||'-')}</dd></div><div><dt>Kullanan personel</dt><dd>${escapeDashboardText(personel?.ad||'Atanmamış')}</dd></div><div><dt>Şube</dt><dd>${escapeDashboardText(arac.sube||'-')}</dd></div></dl><div class="arac-mobil-islemler"><button class="btn-modern btn-detail-modern" type="button" onclick="aracDetayModaliniAc('${id}')">Detay</button><button class="btn-modern btn-edit-modern" type="button" onclick="aracFormunuAc('${id}')">Düzenle</button></div></article>`;}).join('')||'<div class="dashboard-empty">Filtreye uygun araç kaydı bulunmuyor.</div>';
        aracTurOzetleriniCiz(sirketAraclari);
    }

function aracTurOzetleriniCiz(liste = araclar.filter(aktifSirketeAit)) {
fdAracDogrula(false);

        const alan = document.getElementById('aracTurOzetleri');
        if (!alan) return;
        const turler = liste.reduce((harita, arac) => {
if(!fdAracGecerli())return;

            const tur = String(arac.tur || 'Diğer').trim() || 'Diğer';
            harita[tur] = (harita[tur] || 0) + 1;
            return harita;
        }, {});
        alan.innerHTML = `<article class="personel-summary-card"><span>Toplam Araç</span><strong>${liste.length}</strong></article>` +
            Object.entries(turler).sort((a,b) => a[0].localeCompare(b[0], 'tr')).map(([tur, adet]) => `<article class="personel-summary-card"><span>${escapeDashboardText(tur)}</span><strong>${adet}</strong></article>`).join('');
    }

function aracAnaSekmeDegistir(tabId, button) {
fdAracDogrula(false);

        document.querySelectorAll('#aracTakipApp > .app-layout .tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('#aracAnaSekmeler button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (button) button.classList.add('active');
        const ozetAlani=document.getElementById('aracTurOzetAlani'); if(ozetAlani)ozetAlani.style.display=tabId==='arac-tab-araclar'?'block':'none';
        aracTumTakipListeleriniCiz();
    }

function aracTakipTarihRozeti(tarih) {
fdAracDogrula(false);

        const durum = aracTarihDurumu(tarih);
        return `<span class="badge" style="${durum.stil}" title="${tarihFormati(tarih)}">${durum.metin}</span>`;
    }

function akaryakitSecimleriniDoldur() {
fdAracDogrula(false);

        const depolar=akaryakitDepolari(); const secenek=depolar.map(d=>`<option value="${d.id}">${escapeDashboardText(d.ad)}</option>`).join('');
        const depoSelect=document.getElementById('akaryakitDepoId'); if(depoSelect)depoSelect.innerHTML=`<option value="">Se\u00e7iniz</option>${secenek}`;
        const filtre=document.getElementById('akaryakitDepoFiltre'); if(filtre){const v=filtre.value;filtre.innerHTML=`<option value="">T\u00fcm Depolar</option>${secenek}`;filtre.value=v;}
        const aracSelect=document.getElementById('akaryakitAracId'); if(aracSelect)aracSelect.innerHTML=`<option value="">Se\u00e7iniz</option>${araclar.filter(a=>aktifSirketeAit(a)&&a.durum!=='Sat\u0131ld\u0131'&&!aracYariRomorkMu(a.tur)).sort((a,b)=>String(a.plaka).localeCompare(String(b.plaka),'tr')).map(a=>`<option value="${a.id}">${escapeDashboardText(`${a.plaka} \u00b7 ${a.marka||''} ${a.model||''}`)}</option>`).join('')}`;
        const adHaritasi=new Map(),adEkle=ad=>{
if(!fdAracGecerli())return;
ad=String(ad||'').trim();if(!ad)return;const anahtar=ad.toLocaleLowerCase('tr-TR');if(!adHaritasi.has(anahtar))adHaritasi.set(anahtar,ad);};
        personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi).forEach(p=>adEkle(p.ad));
        akaryakitHareketleri().forEach(h=>{
if(!fdAracGecerli())return;
adEkle(h.alan);adEkle(h.veren);});
        const adlar=[...adHaritasi.values()].sort((a,b)=>a.localeCompare(b,'tr'));
        const adListesi=document.getElementById('akaryakitPersonelAdlari'); if(adListesi)adListesi.innerHTML=adlar.map(ad=>`<option value="${escapeDashboardText(ad)}"></option>`).join('');
        ['akaryakitAlan','akaryakitVeren'].forEach(id=>{
if(!fdAracGecerli())return;
const alan=document.getElementById(id);if(alan){alan.setAttribute('list','akaryakitPersonelAdlari');alan.setAttribute('autocomplete','off');}});
        const plakaListesi=document.getElementById('akaryakitAracPlakalari'); if(plakaListesi)plakaListesi.innerHTML=araclar.filter(a=>aktifSirketeAit(a)&&a.durum!=='Sat\u0131ld\u0131'&&!aracYariRomorkMu(a.tur)).sort((a,b)=>String(a.plaka).localeCompare(String(b.plaka),'tr')).map(a=>`<option value="${escapeDashboardText(a.plaka)}">${escapeDashboardText(`${a.marka||''} ${a.model||''}`.trim())}</option>`).join('');
        document.querySelectorAll('#akaryakitTopluBody .akaryakit-toplu-depo').forEach(select=>{
if(!fdAracGecerli())return;
const v=select.value;select.innerHTML=`<option value="">Se\u00e7iniz</option>${secenek}`;select.value=v;});
    }

function akaryakitAracSecenekleri() {
fdAracDogrula(false);
 return `<option value="">Seçiniz</option>${araclar.filter(a=>aktifSirketeAit(a)&&a.durum!=='Satıldı'&&!aracYariRomorkMu(a.tur)).sort((a,b)=>String(a.plaka).localeCompare(String(b.plaka),'tr')).map(a=>`<option value="${a.id}">${escapeDashboardText(`${a.plaka} · ${a.marka||''} ${a.model||''}`)}</option>`).join('')}`; }

function akaryakitDepoSecenekleri() {
fdAracDogrula(false);
 return `<option value="">Seçiniz</option>${akaryakitDepolari().map(d=>`<option value="${d.id}">${escapeDashboardText(d.ad)}</option>`).join('')}`; }

function akaryakitTopluTaslakAnahtari(){
fdAracDogrula(false);
return `fd_akaryakit_taslak_${aktifSirketId()||'genel'}`;}

function akaryakitYeniKayitId(){
fdAracDogrula(false);
return `yakit_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;}

function akaryakitTopluTaslakSatirlari(){
fdAracDogrula(false);

        return [...document.querySelectorAll('#akaryakitTopluBody tr')].map(tr=>({id:tr.dataset.kayitId||'',tarih:tr.querySelector('.akaryakit-toplu-tarih')?.value||'',depoId:tr.querySelector('.akaryakit-toplu-depo')?.value||'',plaka:tr.querySelector('.akaryakit-toplu-plaka')?.value.trim()||'',km:tr.querySelector('.akaryakit-toplu-km')?.value||'',litre:tr.querySelector('.akaryakit-toplu-litre')?.value||'',alan:tr.querySelector('.akaryakit-toplu-alan')?.value.trim()||'',veren:tr.querySelector('.akaryakit-toplu-veren')?.value.trim()||''})).filter(r=>r.depoId||r.plaka||r.km||r.litre||r.alan||r.veren);
    }

function akaryakitTopluTaslagiKaydet(){
fdAracDogrula(true);

        if(document.getElementById('akaryakitFormTuru')?.value!=='cikis'||document.getElementById('akaryakitEditId')?.value)return;
        try{const satirlar=akaryakitTopluTaslakSatirlari();if(satirlar.length)localStorage.setItem(akaryakitTopluTaslakAnahtari(),JSON.stringify(satirlar));else localStorage.removeItem(akaryakitTopluTaslakAnahtari());}catch(_){
if(!fdAracGecerli())return;
}
    }

function akaryakitTopluTaslagiSil(){
fdAracDogrula(true);
try{localStorage.removeItem(akaryakitTopluTaslakAnahtari());}catch(_){
if(!fdAracGecerli())return;
}}

function akaryakitTopluTaslagiYukle(){
fdAracDogrula(true);
const body=document.getElementById('akaryakitTopluBody');if(!body)return false;let satirlar=[];try{satirlar=JSON.parse(localStorage.getItem(akaryakitTopluTaslakAnahtari())||'[]');}catch(_){
if(!fdAracGecerli())return;
}if(!Array.isArray(satirlar)||!satirlar.length)return false;body.innerHTML='';satirlar.forEach(r=>akaryakitTopluSatirEkle(r));return true;}

function akaryakitTopluSatirEkle(degerler={}) {
fdAracDogrula(false);

        const body=document.getElementById('akaryakitTopluBody'); if(!body)return;
        const bugun=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
        const arac=degerler.aracId?araclar.find(a=>String(a.id)===String(degerler.aracId)):null;
        const oncekiSatir=body.querySelector('tr:last-child');
        const oncekiDepo=oncekiSatir?.querySelector('.akaryakit-toplu-depo')?.value||'';
        const oncekiVeren=oncekiSatir?.querySelector('.akaryakit-toplu-veren')?.value.trim()||'';
        const depoDegeri=Object.prototype.hasOwnProperty.call(degerler,'depoId')?degerler.depoId:oncekiDepo;
        const verenDegeri=Object.prototype.hasOwnProperty.call(degerler,'veren')?degerler.veren:oncekiVeren;
        const satir=document.createElement('tr');
        satir.dataset.kayitId=degerler.id||akaryakitYeniKayitId();
        satir.innerHTML=`<td class="akaryakit-satir-no"></td><td><input class="akaryakit-toplu-tarih" type="date" value="${String(degerler.tarih||bugun).slice(0,10)}"></td><td><select class="akaryakit-toplu-depo">${akaryakitDepoSecenekleri()}</select></td><td><input class="akaryakit-toplu-plaka" autocomplete="off" placeholder="Plakayı yazın" oninput="akaryakitHucreIciTamamla(this,'plaka')" value="${escapeDashboardText(arac?.plaka||degerler.plaka||'')}"></td><td><input class="akaryakit-toplu-km" type="text" inputmode="numeric" placeholder="İsteğe bağlı" oninput="paraGirisiFormatla(this)" value="${degerler.km||''}"></td><td><input class="akaryakit-toplu-litre" type="text" inputmode="decimal" oninput="paraGirisiFormatla(this)" value="${degerler.litre||''}"></td><td><input class="akaryakit-toplu-alan" autocomplete="off" placeholder="İsteğe bağlı" oninput="akaryakitHucreIciTamamla(this,'personel')" value="${escapeDashboardText(degerler.alan||'')}"></td><td><input class="akaryakit-toplu-veren" autocomplete="off" placeholder="İsteğe bağlı" oninput="akaryakitHucreIciTamamla(this,'personel')" onkeydown="akaryakitSonAlandaTab(event,this)" value="${escapeDashboardText(verenDegeri||'')}"></td><td><button type="button" class="btn-modern btn-del-modern" onclick="this.closest('tr').remove();akaryakitTopluSatirNumarala();akaryakitTopluTaslagiKaydet()">🗑️</button></td>`;
        body.appendChild(satir);
        if(depoDegeri)satir.querySelector('.akaryakit-toplu-depo').value=depoDegeri;
        akaryakitTopluSatirNumarala();
        return satir;
    }

function akaryakitTopluSatirNumarala(){
fdAracDogrula(false);
document.querySelectorAll('#akaryakitTopluBody tr').forEach((tr,i)=>tr.querySelector('.akaryakit-satir-no').textContent=i+1);}

function akaryakitHucreIciTamamlamaKaynagi(tur){
fdAracDogrula(false);

        if(tur==='plaka')return araclar.filter(a=>aktifSirketeAit(a)&&a.durum!=='Satıldı'&&!aracYariRomorkMu(a.tur)&&a.plaka).map(a=>String(a.plaka).trim()).sort((a,b)=>a.localeCompare(b,'tr',{numeric:true}));
        const adlar=new Map();personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&p.ad).forEach(p=>{
if(!fdAracGecerli())return;
const ad=String(p.ad).trim(),anahtar=ad.toLocaleLowerCase('tr-TR');if(!adlar.has(anahtar))adlar.set(anahtar,ad);});return [...adlar.values()].sort((a,b)=>a.localeCompare(b,'tr'));
    }

function akaryakitHucreIciTamamla(alan,tur){
fdAracDogrula(false);

        const yazilan=String(alan?.value||''),imlec=Number(alan?.selectionStart??yazilan.length);if(!alan||!yazilan||imlec!==yazilan.length)return;
        const anahtar=tur==='plaka'?aracPlakaAnahtari(yazilan):yazilan.toLocaleLowerCase('tr-TR');
        const eslesen=akaryakitHucreIciTamamlamaKaynagi(tur).find(deger=>{
if(!fdAracGecerli())return;
const aday=tur==='plaka'?aracPlakaAnahtari(deger):deger.toLocaleLowerCase('tr-TR');return aday.startsWith(anahtar)&&aday!==anahtar;});
        if(!eslesen)return;alan.value=eslesen;alan.setSelectionRange(yazilan.length,eslesen.length);
    }

function akaryakitSonAlandaTab(event,alan){
fdAracDogrula(false);
if(event.key!=='Tab'||event.shiftKey)return;const satir=alan.closest('tr'),sonSatir=satir===document.querySelector('#akaryakitTopluBody tr:last-child');if(!sonSatir)return;event.preventDefault();const yeni=akaryakitTopluSatirEkle({depoId:satir.querySelector('.akaryakit-toplu-depo').value,veren:alan.value});yeni.querySelector('.akaryakit-toplu-tarih').focus();}

function akaryakitPlakadanAracBul(plaka){
fdAracDogrula(false);
const anahtar=aracPlakaAnahtari(plaka);return araclar.find(a=>aktifSirketeAit(a)&&a.durum!=='Satıldı'&&!aracYariRomorkMu(a.tur)&&aracPlakaAnahtari(a.plaka)===anahtar);}

function akaryakitAyniCikisKaydiMi(a,b){
fdAracDogrula(false);
return a?.tur==='cikis'&&b?.tur==='cikis'&&String(a.depoId||'')===String(b.depoId||'')&&String(a.aracId||'')===String(b.aracId||'')&&String(a.tarih||'').slice(0,10)===String(b.tarih||'').slice(0,10)&&Number(a.litre||0)===Number(b.litre||0)&&Number(a.km||0)===Number(b.km||0)&&String(a.alan||'').trim()===String(b.alan||'').trim()&&String(a.veren||'').trim()===String(b.veren||'').trim();}

async function akaryakitKayitlariniDogrula(kayitlar){
try{
fdAracDogrula(false);

        if(!SUPABASE_MODE)return true;
        const kimlikler=kayitlar.map((kayit,index)=>supabaseKayitAnahtari('akaryakit',kayit,index));
        const {data,error}=await fdAracBekle(zamanAsimliBekle(supabaseClient.from('portal_records').select('legacy_id').eq('company_id',activeUser.sirketId).eq('module','akaryakit').in('legacy_id',kimlikler),10000,'Yakıt kaydı sunucudan doğrulanırken zaman aşımına uğradı.'));
        if(error)throw error;
        const bulunan=new Set((data||[]).map(satir=>String(satir.legacy_id)));
        return kimlikler.every(kimlik=>bulunan.has(String(kimlik)));
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function akaryakitKayitlariniKaydet(kayitlar){
try{
fdAracDogrula(true);

        if(!SUPABASE_MODE)return zamanAsimliBekle(verileriKaydet(),25000,'Yakıt kaydı zamanında tamamlanamadı. İnternet bağlantısını kontrol edin.');
        if(!activeUser?.sirketId)throw new Error('Şirket oturumu bulunamadı.');
        const satirlar=kayitlar.map((kayit,index)=>({company_id:activeUser.sirketId,module:'akaryakit',legacy_id:supabaseKayitAnahtari('akaryakit',kayit,index),record_year:supabaseKayitYili('akaryakit',kayit),employee_legacy_id:null,data:kayit}));
        try{
            const {error}=await fdAracBekle(zamanAsimliBekle(supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'}),25000,'Yakıt kaydı sunucuya gönderilirken zaman aşımına uğradı.'));
            if(error)throw error;
        }catch(error){
if(!fdAracGecerli())return;

            try{if(await fdAracBekle(akaryakitKayitlariniDogrula(kayitlar))){veriKayitGoruntusunuYenile('akaryakit');veriOnbelleginiKaydet();return;}}catch(_){
if(!fdAracGecerli())return;
}
            throw error;
        }
        if(!await fdAracBekle(akaryakitKayitlariniDogrula(kayitlar)))throw new Error('Yakıt kaydı sunucuda doğrulanamadı.');
        veriKayitGoruntusunuYenile('akaryakit');veriOnbelleginiKaydet();
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function akaryakitFormunuAc(tur) {
fdAracDogrula(true);

        document.getElementById('akaryakitForm').reset(); document.getElementById('akaryakitFormTuru').value=tur;document.getElementById('akaryakitEditId').value='';
        document.getElementById('akaryakitDepoAlanlari').style.display=tur==='depo'?'grid':'none'; document.getElementById('akaryakitHareketAlanlari').style.display=tur==='giris'?'grid':'none'; document.getElementById('akaryakitTopluAlan').style.display=tur==='cikis'?'block':'none';
        document.querySelectorAll('.akaryakit-cikis').forEach(e=>e.style.display=tur==='cikis'?'block':'none'); document.querySelectorAll('.akaryakit-giris').forEach(e=>e.style.display=tur==='giris'?'block':'none');
        const stokEtiketi=document.getElementById('akaryakitDepoBaslangic')?.closest('.form-group')?.querySelector('label');if(stokEtiketi)stokEtiketi.textContent='Ba\u015flang\u0131\u00e7 Stoku (Litre)';
        akaryakitSecimleriniDoldur(); document.getElementById('akaryakitTarih').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
        document.getElementById('akaryakitModalBaslik').textContent=tur==='depo'?'\u26fd Yeni Akaryak\u0131t Deposu':tur==='giris'?'\ud83d\udce5 Depoya Yeni Yak\u0131t Giri\u015fi':'\u26fd Araca Yak\u0131t Ver';
        const kaydetBtn=document.getElementById('akaryakitKaydetBtn');kaydetBtn.disabled=akaryakitKaydetmeDevamEdiyor;kaydetBtn.textContent=akaryakitKaydetmeDevamEdiyor?'\u23f3 Kaydediliyor...':tur==='cikis'?'\ud83d\udcbe T\u00fcm Sat\u0131rlar\u0131 Kaydet':'\ud83d\udcbe Kaydet';
        if(tur==='cikis'){const body=document.getElementById('akaryakitTopluBody');body.innerHTML='';if(!akaryakitTopluTaslagiYukle())akaryakitTopluSatirEkle();body.oninput=akaryakitTopluTaslagiKaydet;body.onchange=akaryakitTopluTaslagiKaydet;}
        document.getElementById('modalAkaryakit').style.display='flex';
    }

function akaryakitDuzenle(id){
fdAracDogrula(true);

        const kayit=akaryakitKayitlari.find(h=>String(h.id)===String(id));if(!kayit||!['depo','giris','cikis'].includes(kayit.tur))return;
        akaryakitFormunuAc(kayit.tur);document.getElementById('akaryakitEditId').value=kayit.id;document.getElementById('akaryakitKaydetBtn').textContent='\ud83d\udcbe De\u011fi\u015fiklikleri Kaydet';
        if(kayit.tur==='depo'){
            document.getElementById('akaryakitModalBaslik').textContent='\u270f\ufe0f Akaryak\u0131t Deposunu D\u00fczenle';
            document.getElementById('akaryakitDepoAdi').value=kayit.ad||'';
            document.getElementById('akaryakitDepoKapasite').value=Number(kayit.kapasite||0).toLocaleString('tr-TR',{maximumFractionDigits:2});
            document.getElementById('akaryakitDepoBaslangic').value=Number(akaryakitDepoBakiyesi(kayit.id)||0).toLocaleString('tr-TR',{maximumFractionDigits:2});
            const stokEtiketi=document.getElementById('akaryakitDepoBaslangic')?.closest('.form-group')?.querySelector('label');if(stokEtiketi)stokEtiketi.textContent='Mevcut Stok (Litre)';
        } else if(kayit.tur==='giris'){
            document.getElementById('akaryakitModalBaslik').textContent='\u270f\ufe0f Depoya Yak\u0131t Giri\u015fini D\u00fczenle';const tarih=String(kayit.tarih||'');document.getElementById('akaryakitTarih').value=tarih.length===10?`${tarih}T12:00`:tarih.slice(0,16);document.getElementById('akaryakitDepoId').value=kayit.depoId||'';document.getElementById('akaryakitLitre').value=Number(kayit.litre||0).toLocaleString('tr-TR',{maximumFractionDigits:2});document.getElementById('akaryakitTedarikci').value=kayit.tedarikci||'';
        } else {
            document.getElementById('akaryakitModalBaslik').textContent='\u270f\ufe0f Verilen Yak\u0131t Kayd\u0131n\u0131 D\u00fczenle';const body=document.getElementById('akaryakitTopluBody');body.innerHTML='';akaryakitTopluSatirEkle(kayit);
        }
    }

async function akaryakitKaydet(event) {
try{
fdAracDogrula(true);

        event.preventDefault();
        const turAlani = document.getElementById('akaryakitFormTuru');
        const depoFormuAcik = document.getElementById('akaryakitDepoAlanlari').style.display !== 'none';
        const tur = String(turAlani.value || (depoFormuAcik ? 'depo' : '')).toLocaleLowerCase('tr-TR');
        const editId=document.getElementById('akaryakitEditId').value||'',eskiKayit=editId?akaryakitKayitlari.find(k=>String(k.id)===String(editId)):null;
        let kayit, kayitlar=[],yinelenenSayisi=0;
        if(tur==='depo'){
            const ad=document.getElementById('akaryakitDepoAdi').value.trim(); if(!ad){alert('Depo ad\u0131n\u0131 girin.');return;}
            const kapasite=paraMetniniSayiyaCevir(document.getElementById('akaryakitDepoKapasite').value),girilenStok=paraMetniniSayiyaCevir(document.getElementById('akaryakitDepoBaslangic').value);
            if(!Number.isFinite(kapasite)||kapasite<0||!Number.isFinite(girilenStok)||girilenStok<0){alert('Kapasite ve stok s\u0131f\u0131rdan k\u00fc\u00e7\u00fck olamaz.');return;}
            let baslangic=girilenStok;
            if(eskiKayit?.tur==='depo'){
                const hareketNeti=akaryakitHareketleri().filter(h=>String(h.depoId)===String(eskiKayit.id)).reduce((t,h)=>t+(h.tur==='giris'?Number(h.litre||0):-Number(h.litre||0)),0);
                baslangic=girilenStok-hareketNeti;
            }
            const ilkBaslangic=eskiKayit?.tur==='depo'?(akaryakitStokSayisi(eskiKayit.ilkBaslangic)??akaryakitStokSayisi(eskiKayit.baslangic)??girilenStok):girilenStok;
            kayit={...(eskiKayit||{}),id:editId||`depo_${Date.now()}`,tur:'depo',sirketId:aktifSirketId(),ad,kapasite,baslangic,ilkBaslangic};
            kayitlar=[kayit];
        } else if(tur==='giris') {
            const depoId=document.getElementById('akaryakitDepoId').value, litre=paraMetniniSayiyaCevir(document.getElementById('akaryakitLitre').value), tarih=document.getElementById('akaryakitTarih').value;
            if(!depoId||!tarih||!(litre>0)){alert('Depo, tarih ve litre bilgilerini eksiksiz girin.');return;}
            kayit={id:editId||`yakit_${Date.now()}`,tur:'giris',sirketId:aktifSirketId(),depoId,tarih,litre,aracId:'',km:0,alan:'',veren:'',tedarikci:document.getElementById('akaryakitTedarikci').value};if(!eskiKayit)kayit.stokKayitSirasi=Date.now()*1000; kayitlar=[eskiKayit?{...eskiKayit,...kayit}:kayit];
        } else if(tur==='cikis') {
            const satirlar=[...document.querySelectorAll('#akaryakitTopluBody tr')];
            if(!satirlar.length){alert('En az bir yakıt satırı ekleyin.');return;}
            const depoToplamlari={};
            const stokKayitSirasi=Date.now()*1000;
            for(let i=0;i<satirlar.length;i++){
                const tr=satirlar[i], tarih=tr.querySelector('.akaryakit-toplu-tarih').value, depoId=tr.querySelector('.akaryakit-toplu-depo').value, plaka=tr.querySelector('.akaryakit-toplu-plaka').value.trim(), arac=akaryakitPlakadanAracBul(plaka), aracId=arac?.id||'', km=paraMetniniSayiyaCevir(tr.querySelector('.akaryakit-toplu-km').value), litre=paraMetniniSayiyaCevir(tr.querySelector('.akaryakit-toplu-litre').value), alan=tr.querySelector('.akaryakit-toplu-alan').value.trim(), veren=tr.querySelector('.akaryakit-toplu-veren').value.trim();
                const tamamenBos=!depoId&&!plaka&&!km&&!litre&&!alan&&!veren; if(tamamenBos)continue;
                if(!tarih||!depoId||!plaka||!(litre>0)){akaryakitTopluTaslagiKaydet();showToast(`${i+1}. satırda tarih, depo, plaka ve litre zorunludur. KM, alan ve veren isteğe bağlıdır.`,'warning');return;}
                if(!arac){alert(`${i+1}. satırdaki “${plaka}” plakası aktif araç kayıtlarında bulunamadı.`);return;}
                depoToplamlari[depoId]=(depoToplamlari[depoId]||0)+litre;
                const yeniKayit={id:editId||tr.dataset.kayitId||akaryakitYeniKayitId(),tur:'cikis',sirketId:aktifSirketId(),depoId,tarih,litre,aracId,km,alan,veren,tedarikci:''};
                if(!eskiKayit)yeniKayit.stokKayitSirasi=stokKayitSirasi+i;
                if(!editId&&[...akaryakitKayitlari,...kayitlar].some(mevcut=>akaryakitAyniCikisKaydiMi(mevcut,yeniKayit))){yinelenenSayisi++;continue;}
                kayitlar.push(eskiKayit?{...eskiKayit,...yeniKayit}:yeniKayit);
            }
            if(!kayitlar.length&&yinelenenSayisi){akaryakitTopluTaslagiSil();document.getElementById('modalAkaryakit').style.display='none';showToast('Bu yakıt kaydı daha önce kaydedilmiş. Yeniden eklenmedi.','warning');return;}
            if(!kayitlar.length){alert('Dolu bir yakıt satırı bulunamadı.');return;}
        } else {
            alert('Akaryakıt işlem türü belirlenemedi.'); return;
        }
        const editIndex=editId?akaryakitKayitlari.findIndex(k=>String(k.id)===String(editId)):-1;
        if(editId&&editIndex<0){alert('Düzenlenecek yakıt kaydı bulunamadı.');return;}
        if(akaryakitKaydetmeDevamEdiyor){showToast('Yakıt kaydı zaten kaydediliyor. Lütfen bekleyin.','warning');return;}
        akaryakitKaydetmeDevamEdiyor=true;
        const kaydetBtn=document.getElementById('akaryakitKaydetBtn'),oncekiButonMetni=kaydetBtn?.textContent||'💾 Kaydet';
        if(kaydetBtn){kaydetBtn.disabled=true;kaydetBtn.textContent='⏳ Kaydediliyor...';}
        showGlobalOverlay('Yakıt kayıtları kaydediliyor',`${kayitlar.length} kayıt kontrol edilip sisteme aktarılıyor...`);
        const oncekiListe=akaryakitKayitlari.slice();
        if(editId)akaryakitKayitlari[editIndex]=kayitlar[0];else akaryakitKayitlari.push(...kayitlar);
        yuklenenVeriler.add('akaryakit');
        try{await fdAracBekle(akaryakitKayitlariniKaydet(kayitlar));if(tur==='cikis'&&!editId)akaryakitTopluTaslagiSil();document.getElementById('modalAkaryakit').style.display='none';akaryakitListesiniCiz();showToast(editId?'Yakıt kaydı güncellendi.':`${kayitlar.length} akaryakıt kaydı kaydedildi.${yinelenenSayisi?` ${yinelenenSayisi} yinelenen satır eklenmedi.`:''}`);}catch(error){
if(!fdAracGecerli())return;
akaryakitKayitlari=oncekiListe;alert('Akaryakıt kaydı kaydedilemedi: '+(error.message||'Bilinmeyen hata')+'\n\nEkran yeniden açıldı. Aynı kaydı tekrar tekrar göndermenize gerek yoktur.');}finally{
if(fdAracGecerli()){
akaryakitKaydetmeDevamEdiyor=false;hideGlobalOverlay();if(kaydetBtn){kaydetBtn.disabled=false;kaydetBtn.textContent=oncekiButonMetni;}
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function akaryakitAyDegistir(fark=0){
fdAracDogrula(false);

        const alan=document.getElementById('akaryakitAyFiltre');if(!alan)return;
        const simdi=new Date(),mevcut=String(alan.value||simdi.toISOString().slice(0,7)),parca=mevcut.split('-').map(Number),tarih=new Date(parca[0],Math.max(0,(parca[1]||1)-1)+Number(fark||0),1);
        alan.value=tarih.getFullYear()+'-'+String(tarih.getMonth()+1).padStart(2,'0');akaryakitListesiniCiz();
    }

function akaryakitFiltrelenmisListe() {
fdAracDogrula(false);

        const arama=String(document.getElementById('akaryakitArama')?.value||'').toLocaleLowerCase('tr-TR'),depoFiltre=document.getElementById('akaryakitDepoFiltre')?.value||'',turFiltre=document.getElementById('akaryakitTurFiltre')?.value||'',ay=document.getElementById('akaryakitAyFiltre')?.value||'';
        return akaryakitHareketleri().filter(h=>{
if(!fdAracGecerli())return;
const arac=araclar.find(a=>String(a.id)===String(h.aracId)),depo=akaryakitDepolari().find(d=>String(d.id)===String(h.depoId));const metin=[arac?.plaka,depo?.ad,h.alan,h.veren,h.tedarikci].join(' ').toLocaleLowerCase('tr-TR');return(!arama||metin.includes(arama))&&(!depoFiltre||h.depoId===depoFiltre)&&(!turFiltre||h.tur===turFiltre)&&(!ay||String(h.tarih).startsWith(ay));}).sort((a,b)=>akaryakitStokHareketKarsilastir(b,a));
    }

function akaryakitListesiniCiz() {
fdAracDogrula(false);

        const ayAlani=document.getElementById('akaryakitAyFiltre');if(ayAlani&&!ayAlani.value)ayAlani.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,7);
        const body=document.getElementById('akaryakitBody');if(!body)return;akaryakitSecimleriniDoldur();
        const liste=akaryakitFiltrelenmisListe(),tuketimler=akaryakitTuketimleriniHesapla(),stoklar=akaryakitStokHesaplariniHesapla(),depolar=akaryakitDepolari(),depoHaritasi=new Map(depolar.map(d=>[String(d.id),d]));
        const stokMetni=deger=>Number.isFinite(deger)?`${deger.toLocaleString('tr-TR')} L`:'-',stokRengi=deger=>Number.isFinite(deger)&&deger<0?'color:#b91c1c;':'';
        body.innerHTML=liste.map((h,i)=>{
if(!fdAracGecerli())return;
const arac=araclar.find(a=>String(a.id)===String(h.aracId)),depo=depoHaritasi.get(String(h.depoId)),t=tuketimler.get(h.id),kalan=stoklar.hareketler.get(String(h.id))?.kalan,giris=h.tur==='giris',litre=h.tur==='cikis'?`<button type="button" class="fd-table-cell-link" onclick="akaryakitTuketimNotuAc('${h.id}')" title="T\u00fcketim bilgisini a\u00e7">${Number(h.litre).toLocaleString('tr-TR')} L</button>`:`${Number(h.litre).toLocaleString('tr-TR')} L`,plakaIslem=giris?'<span class="badge" style="background:#dcfce7;color:#166534;">DEPOYA G\u0130R\u0130\u015e</span>':(arac?`<button class="fd-table-cell-link" onclick="akaryakitAracDetayiniAc('${arac.id}')">${escapeDashboardText(arac.plaka)}</button>`:'-');return`<tr${giris?' style="background:#f0fdf4;box-shadow:inset 3px 0 #22c55e;"':''}><td>${i+1}</td><td>${tarihFormati(h.tarih)}</td><td>${escapeDashboardText(depo?.ad||'-')}</td><td>${plakaIslem}</td><td>${litre}</td><td style="${stokRengi(kalan)}font-weight:400;white-space:nowrap;">${stokMetni(kalan)}</td><td>${h.km?Number(h.km).toLocaleString('tr-TR'):'-'}</td><td>${escapeDashboardText(h.alan||'-')}</td><td>${escapeDashboardText(h.veren||'-')}</td><td>${t?`${t.toFixed(2).replace('.',',')} L`:'-'}</td><td><div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="akaryakitDuzenle('${h.id}')">\u270f\ufe0f D\u00fczenle</button><button class="btn-modern btn-del-modern" onclick="akaryakitSil('${h.id}')">\ud83d\uddd1\ufe0f Sil</button></div></td></tr>`;}).join('')||'<tr><td colspan="11" style="text-align:center;padding:22px;color:#64748b;">Se\u00e7ili ayda yak\u0131t kayd\u0131 bulunmuyor.</td></tr>';
        const bakiyeler=depolar.map(d=>stoklar.depolar.get(String(d.id))?.mevcut),toplam=bakiyeler.every(Number.isFinite)?bakiyeler.reduce((s,b)=>s+b,0):null,filtreGiris=liste.filter(h=>h.tur==='giris').reduce((s,h)=>s+Number(h.litre||0),0),filtreCikis=liste.filter(h=>h.tur==='cikis').reduce((s,h)=>s+Number(h.litre||0),0);
        document.getElementById('akaryakitDepoOzetleri').innerHTML=`<article class="personel-summary-card"><span>T\u00fcm Depolarda Kalan</span><strong style="${stokRengi(toplam)}">${stokMetni(toplam)}</strong></article>`+depolar.map(d=>{
if(!fdAracGecerli())return;
const stok=stoklar.depolar.get(String(d.id)),duzeltme=Number.isFinite(stok?.acilis)&&Number.isFinite(stok?.hesapBaslangici)&&stok.acilis!==stok.hesapBaslangici;return`<article class="personel-summary-card" style="position:relative;padding-right:48px;"><span>${escapeDashboardText(d.ad)} Deposunda Kalan</span><strong style="${stokRengi(stok?.mevcut)}">${stokMetni(stok?.mevcut)}</strong>${duzeltme?'<small style="display:block;color:#64748b;">Stok hesabına düzeltme uygulanmış.</small>':''}<small style="display:block;">Kapasite: ${Number(d.kapasite||0).toLocaleString('tr-TR')} L</small><button type="button" class="btn-modern btn-edit-modern" title="Depoyu d\u00fczenle" aria-label="Depoyu d\u00fczenle" style="position:absolute;right:10px;top:10px;width:30px;height:30px;min-width:30px;padding:0;display:inline-flex;align-items:center;justify-content:center;" onclick="akaryakitDuzenle('${escapeDashboardText(String(d.id))}')">\u270f\ufe0f</button></article>`;}).join('')+`<article class="personel-summary-card"><span>Se\u00e7ili D\u00f6nemde Depoya Giren</span><strong>${filtreGiris.toLocaleString('tr-TR')} L</strong></article><article class="personel-summary-card"><span>Se\u00e7ili D\u00f6nemde Ara\u00e7lara Verilen</span><strong>${filtreCikis.toLocaleString('tr-TR')} L</strong></article>`;
    }

function akaryakitRaporSatirlari(liste=akaryakitFiltrelenmisListe(),stoklar=akaryakitStokHesaplariniHesapla()) {
fdAracDogrula(false);

        const tuketimler=akaryakitTuketimleriniHesapla();
        return liste.map(h=>{
if(!fdAracGecerli())return;
const arac=araclar.find(a=>String(a.id)===String(h.aracId)),depo=akaryakitDepolari().find(d=>String(d.id)===String(h.depoId)),t=tuketimler.get(h.id),acilis=stoklar.depolar.get(String(h.depoId))?.acilis,kalan=stoklar.hareketler.get(String(h.id))?.kalan;return[tarihFormati(h.tarih),depo?.ad||'-',arac?.plaka||'-',h.tur==='giris'?'DEPOYA GİRİŞ':'ARACA VERİLEN',Number(h.litre||0),Number.isFinite(acilis)?acilis:'',Number.isFinite(kalan)?kalan:'',h.km?Number(h.km):'',h.alan||'-',h.veren||'-',t?Number(t.toFixed(2)):''];});
    }

function akaryakitRaporAl(tur) {
fdAracDogrula(false);

        const liste=akaryakitFiltrelenmisListe(),stoklar=akaryakitStokHesaplariniHesapla(),satirlar=akaryakitRaporSatirlari(liste,stoklar),basliklar=['TARİH','DEPO','PLAKA','İŞLEM','LİTRE','AÇILIŞ STOKU (LİTRE)','İŞLEM SONRASI KALAN (LİTRE)','KM','ALAN','VEREN','100 KM TÜKETİM'],ay=document.getElementById('akaryakitAyFiltre')?.value||'TÜM DÖNEMLER',ad=`AKARYAKIT_RAPORU_${ay}`;
        if(!liste.length){alert('Raporlanacak kayıt bulunmuyor.');return;}
        if(tur==='excel'){const ws=XLSX.utils.aoa_to_sheet([basliklar,...satirlar]);ws['!cols']=[{wch:20},{wch:18},{wch:14},{wch:18},{wch:12},{wch:22},{wch:28},{wch:12},{wch:24},{wch:24},{wch:18}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Akaryakıt');XLSX.writeFile(wb,`${ad}.xlsx`);return;}
        const giris=liste.filter(h=>h.tur==='giris').reduce((s,h)=>s+Number(h.litre||0),0),cikis=liste.filter(h=>h.tur==='cikis').reduce((s,h)=>s+Number(h.litre||0),0),alan=document.createElement('div');alan.innerHTML=`<table><thead><tr>${basliklar.map(b=>`<th>${b}</th>`).join('')}</tr></thead><tbody>${satirlar.map(s=>`<tr>${s.map(v=>`<td>${escapeDashboardText(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;return window.fdTabloPdfOnizle?.(alan.querySelector('table'),'AKARYAKIT HAREKET RAPORU',`${ad}.pdf`,{donem:`${ay} · ${liste.length} kayıt · Giriş ${giris.toLocaleString('tr-TR')} L · Verilen ${cikis.toLocaleString('tr-TR')} L`,yon:'landscape',altBaslik:'Akaryakıt Hareket Raporu'});
    }

async function akaryakitSil(id){
try{
fdAracDogrula(true);
if(!await fdAracBekle(fdYuzerOnaySor('Bu yakıt hareketi silinsin mi?')))return;const onceki=akaryakitKayitlari.slice();akaryakitKayitlari=akaryakitKayitlari.filter(k=>k.id!==id);yuklenenVeriler.add('akaryakit');try{await fdAracBekle(supabaseVerileriKaydet());akaryakitListesiniCiz();}catch(e){
if(!fdAracGecerli())return;
akaryakitKayitlari=onceki;alert('Kayıt silinemedi: '+e.message);}
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function akaryakitTuketimNotuVerileri(id=''){
fdAracDogrula(false);

        const kayit=akaryakitKayitlari.find(h=>String(h.id)===String(id||document.getElementById('akaryakitTuketimKayitId').value)),arac=araclar.find(a=>String(a.id)===String(kayit?.aracId)),aralik=akaryakitTuketimAraliklari(kayit?.aracId).find(a=>String(a.kayitId)===String(kayit?.id));
        return {kayit,arac,aralik};
    }

function akaryakitTuketimNotuAc(id){
fdAracDogrula(false);

        const {kayit,arac}=akaryakitTuketimNotuVerileri(id);if(!kayit||!arac)return;
        document.getElementById('akaryakitTuketimKayitId').value=id;
        document.getElementById('akaryakitTuketimNotuBaslik').textContent=`⛽ ${arac.plaka} · Yakıt Tüketim Bilgisi`;
        const aralik=akaryakitTuketimAraliklari(arac.id).find(a=>String(a.kayitId)===String(kayit.id));
        const eskiBaslik=String(kayit.raporBaslik||'').replace(new RegExp(aracPlakaAnahtari(arac.plaka),'gi'),'').trim();
        document.getElementById('akaryakitTuketimPlaka').value=arac.plaka||'';
        document.getElementById('akaryakitTuketimSurucu').value=kayit.raporSurucu||eskiBaslik||kayit.alan||'';
        document.getElementById('akaryakitTuketimTarihAraligi').value=aralik?`${tarihFormati(aralik.oncekiTarih)} - ${tarihFormati(aralik.sonTarih)}`:tarihFormati(kayit.tarih);
        document.getElementById('akaryakitTuketimGuzergah').value=kayit.guzergah||'';
        document.getElementById('akaryakitTuketimBilgiSilBtn').style.display=(kayit.raporSurucu||kayit.raporBaslik||kayit.guzergah)?'inline-flex':'none';
        akaryakitTuketimNotuOnizle();
        document.getElementById('modalAkaryakitTuketimNotu').style.display='flex';
    }

function akaryakitTuketimNotuOnizle(){
fdAracDogrula(false);

        const {kayit,arac,aralik}=akaryakitTuketimNotuVerileri();if(!kayit||!arac)return;
        const surucu=document.getElementById('akaryakitTuketimSurucu').value.trim(),guzergah=document.getElementById('akaryakitTuketimGuzergah').value.trim(),tarihAraligi=document.getElementById('akaryakitTuketimTarihAraligi').value;
        const hesap=aralik?`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:20px;"><div style="padding:11px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">YAPILAN YOL</small><strong>${aralik.kmFarki.toLocaleString('tr-TR')} KM</strong></div><div style="padding:11px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">ALINAN YAKIT</small><strong>${Number(kayit.litre||0).toLocaleString('tr-TR')} LİTRE</strong></div><div style="padding:11px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">ORTALAMA TÜKETİM</small><strong>${aralik.oran.toFixed(2).replace('.',',')} L / 100 KM</strong></div></div>`:`<div style="margin-top:20px;padding:11px;border:1px solid #dbe5ef;border-radius:8px;color:#64748b;">Önceki yakıt KM kaydı bulunmadığı için tüketim hesaplanamıyor.</div>`;
        document.getElementById('akaryakitTuketimGoruntuAlani').innerHTML=hesap;
    }

async function akaryakitTuketimNotunuKaydet(){
try{
fdAracDogrula(true);

        const {kayit}=akaryakitTuketimNotuVerileri();if(!kayit)return;
        const onceki={raporSurucu:kayit.raporSurucu,guzergah:kayit.guzergah};
        kayit.raporSurucu=document.getElementById('akaryakitTuketimSurucu').value.trim();delete kayit.raporBaslik;kayit.guzergah=document.getElementById('akaryakitTuketimGuzergah').value.trim();kayit.raporGuncellemeTarihi=new Date().toISOString();yuklenenVeriler.add('akaryakit');
        try{await fdAracBekle(supabaseVerileriKaydet());akaryakitTuketimNotuOnizle();showToast('Yakıt tüketim bilgisi kaydedildi.');}catch(error){
if(!fdAracGecerli())return;
kayit.raporSurucu=onceki.raporSurucu;kayit.guzergah=onceki.guzergah;alert('Tüketim bilgisi kaydedilemedi: '+(error.message||'Bilinmeyen hata'));}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function akaryakitTuketimNotunuSil(){
try{
fdAracDogrula(true);

        const {kayit}=akaryakitTuketimNotuVerileri();if(!kayit||!await fdAracBekle(fdYuzerOnaySor('Bu yakıt kaydına eklediğiniz sürücü ve güzergâh bilgileri silinsin mi?')))return;
        const onceki={raporSurucu:kayit.raporSurucu,raporBaslik:kayit.raporBaslik,guzergah:kayit.guzergah,raporGuncellemeTarihi:kayit.raporGuncellemeTarihi};
        delete kayit.raporSurucu;delete kayit.raporBaslik;delete kayit.guzergah;delete kayit.raporGuncellemeTarihi;yuklenenVeriler.add('akaryakit');
        try{await fdAracBekle(supabaseVerileriKaydet());document.getElementById('akaryakitTuketimSurucu').value=kayit.alan||'';document.getElementById('akaryakitTuketimGuzergah').value='';document.getElementById('akaryakitTuketimBilgiSilBtn').style.display='none';akaryakitTuketimNotuOnizle();showToast('Eklenen tüketim bilgileri silindi.');}catch(error){
if(!fdAracGecerli())return;
Object.assign(kayit,onceki);alert('Bilgiler silinemedi: '+(error.message||'Bilinmeyen hata'));}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function akaryakitTuketimMetniniKopyala(){
try{
fdAracDogrula(false);

        const {kayit,arac,aralik}=akaryakitTuketimNotuVerileri();if(!kayit||!arac)return;
        const surucu=document.getElementById('akaryakitTuketimSurucu').value.trim()||'-',tarihAraligi=document.getElementById('akaryakitTuketimTarihAraligi').value||'-',guzergah=document.getElementById('akaryakitTuketimGuzergah').value.trim(),satirlar=[`*PLAKA:* ${arac.plaka||'-'}`,`*SÜRÜCÜ:* ${surucu}`,`*YAKIT TARİH ARALIĞI:* ${tarihAraligi}`];
        if(guzergah)satirlar.push('', '*GÜZERGÂH / SEFER BİLGİLERİ*', guzergah);
        satirlar.push('');
        if(aralik)satirlar.push(`*YAPILAN YOL:* ${aralik.kmFarki.toLocaleString('tr-TR')} KM`,`*ALINAN YAKIT:* ${Number(kayit.litre||0).toLocaleString('tr-TR')} LİTRE`,`*ORTALAMA TÜKETİM:* ${aralik.oran.toFixed(2).replace('.',',')} L / 100 KM`);
        else satirlar.push(`*ALINAN YAKIT:* ${Number(kayit.litre||0).toLocaleString('tr-TR')} LİTRE`,'*ORTALAMA TÜKETİM:* Önceki KM kaydı olmadığı için hesaplanamadı.');
        try{await fdAracBekle(navigator.clipboard.writeText(satirlar.join('\n')));showToast('Yakıt bilgileri yazı olarak panoya kopyalandı. WhatsApp’a yapıştırabilirsiniz.');}catch(error){
if(!fdAracGecerli())return;
alert('Metin panoya kopyalanamadı. Tarayıcının pano iznine izin verip tekrar deneyin.');}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function akaryakitAracDetayiniAc(id){
fdAracDogrula(false);
const arac=araclar.find(a=>String(a.id)===String(id));if(!arac)return;document.getElementById('akaryakitDetayAracId').value=id;document.getElementById('akaryakitAracDetayBaslik').textContent=`⛽ ${arac.plaka} · Yakıt Geçmişi`;const y=new Date().getFullYear(),yilSayisi=Math.round(ayarSayisi('aracYakitRaporYilSayisi',7));document.getElementById('akaryakitDetayYil').innerHTML=Array.from({length:yilSayisi},(_,i)=>y-i).map(x=>`<option>${x}</option>`).join('');document.getElementById('akaryakitDetayAy').value='';document.getElementById('akaryakitDetayBaslangic').value='';document.getElementById('akaryakitDetayBitis').value='';akaryakitAracDetayiniCiz();document.getElementById('modalAkaryakitAracDetay').style.display='flex';}

function akaryakitDetayDonemSecildi(){
fdAracDogrula(false);
document.getElementById('akaryakitDetayBaslangic').value='';document.getElementById('akaryakitDetayBitis').value='';akaryakitAracDetayiniCiz();}

function akaryakitDetayTarihAraligindaMi(tarih){
fdAracDogrula(false);
const baslangic=document.getElementById('akaryakitDetayBaslangic').value,bitis=document.getElementById('akaryakitDetayBitis').value,gun=String(tarih||'').slice(0,10);if(baslangic||bitis)return(!baslangic||gun>=baslangic)&&(!bitis||gun<=bitis);const yil=document.getElementById('akaryakitDetayYil').value,ay=document.getElementById('akaryakitDetayAy').value;return String(tarih||'').startsWith(`${yil}${ay?'-'+ay:''}`);}

function akaryakitAracDetayListesi(){
fdAracDogrula(false);
const id=document.getElementById('akaryakitDetayAracId').value;return akaryakitHareketleri().filter(h=>h.tur==='cikis'&&String(h.aracId)===String(id)&&akaryakitDetayTarihAraligindaMi(h.tarih)).sort((a,b)=>akaryakitStokHareketKarsilastir(b,a));}

function akaryakitAracDetayiniCiz(){
fdAracDogrula(false);

        const id=document.getElementById('akaryakitDetayAracId').value,yil=document.getElementById('akaryakitDetayYil').value,tuketimler=akaryakitTuketimleriniHesapla(),stoklar=akaryakitStokHesaplariniHesapla(),tum=akaryakitHareketleri().filter(h=>h.tur==='cikis'&&String(h.aracId)===String(id)),liste=akaryakitAracDetayListesi(),tumAraliklar=akaryakitTuketimAraliklari(id),seciliAraliklar=tumAraliklar.filter(a=>akaryakitDetayTarihAraligindaMi(a.sonTarih)),toplam=liste.reduce((s,h)=>s+Number(h.litre||0),0),hesaplananKm=seciliAraliklar.reduce((s,a)=>s+a.kmFarki,0),hesaplananLitre=seciliAraliklar.reduce((s,a)=>s+a.litre,0),ortalama=hesaplananKm>0?hesaplananLitre/hesaplananKm*100:0;
        document.getElementById('akaryakitDetayOzet').innerHTML=aracDetayBilgiAlani([['Toplam Yakıt',`${toplam.toLocaleString('tr-TR')} L`],['Yakıt Alım Sayısı',liste.length],['Hesaplanan KM',hesaplananKm?`${hesaplananKm.toLocaleString('tr-TR')} KM`:'-'],['Ortalama Tüketim',ortalama?`${ortalama.toFixed(2).replace('.',',')} L / 100 KM`:'-']]);
        const aylik=Array.from({length:12},(_,i)=>tum.filter(h=>String(h.tarih).startsWith(`${yil}-${String(i+1).padStart(2,'0')}`)).reduce((s,h)=>s+Number(h.litre||0),0)),max=Math.max(...aylik,1),ayAdlari=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
        document.getElementById('akaryakitDetayGrafik').innerHTML=aylik.map((v,i)=>`<div style="flex:1;text-align:center;font-size:.68rem;color:#475569;"><strong style="display:block;margin-bottom:4px;">${v?Number(v).toLocaleString('tr-TR'):''}</strong><div title="${v} L" style="height:${Math.max(2,v/max*125)}px;background:linear-gradient(#38bdf8,#0284c7);border-radius:5px 5px 0 0;"></div><span>${ayAdlari[i]}</span></div>`).join('');
        document.getElementById('akaryakitAralikBody').innerHTML=seciliAraliklar.sort((a,b)=>String(b.sonTarih).localeCompare(String(a.sonTarih))).map(a=>`<tr><td>${tarihFormati(a.oncekiTarih)}</td><td>${tarihFormati(a.sonTarih)}</td><td>${a.oncekiKm.toLocaleString('tr-TR')}</td><td>${a.sonKm.toLocaleString('tr-TR')}</td><td>${a.kmFarki.toLocaleString('tr-TR')} KM</td><td>${a.litre.toLocaleString('tr-TR')} L</td><td><strong>${a.oran.toFixed(2).replace('.',',')} L</strong></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:18px;">Tüketim hesabı için en az iki KM kaydı gerekir.</td></tr>';
        const tarihAraligiAktif=document.getElementById('akaryakitDetayBaslangic').value||document.getElementById('akaryakitDetayBitis').value,aylikOzet=akaryakitTuketimDonemOzeti(tarihAraligiAktif?seciliAraliklar:tumAraliklar.filter(a=>String(a.sonTarih).startsWith(yil)),7),yillikOzet=akaryakitTuketimDonemOzeti(tarihAraligiAktif?seciliAraliklar:tumAraliklar,4);
        document.getElementById('akaryakitAylikOzetBody').innerHTML=aylikOzet.map(o=>`<tr><td>${new Date(`${o.donem}-01T12:00:00`).toLocaleDateString('tr-TR',{month:'long',year:'numeric'})}</td><td>${o.adet}</td><td>${o.litre.toLocaleString('tr-TR')} L</td><td>${o.km.toLocaleString('tr-TR')} KM</td><td><strong>${o.ortalama.toFixed(2).replace('.',',')} L / 100 KM</strong></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:18px;">Aylık tüketim hesabı bulunmuyor.</td></tr>';
        document.getElementById('akaryakitYillikOzetBody').innerHTML=yillikOzet.map(o=>`<tr><td>${o.donem}</td><td>${o.adet}</td><td>${o.litre.toLocaleString('tr-TR')} L</td><td>${o.km.toLocaleString('tr-TR')} KM</td><td><strong>${o.ortalama.toFixed(2).replace('.',',')} L / 100 KM</strong></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:18px;">Yıllık tüketim hesabı bulunmuyor.</td></tr>';
        document.getElementById('akaryakitDetayBody').innerHTML=liste.map(h=>{
if(!fdAracGecerli())return;
const d=akaryakitDepolari().find(x=>String(x.id)===String(h.depoId)),t=tuketimler.get(h.id),kalan=stoklar.hareketler.get(String(h.id))?.kalan;return`<tr><td>${tarihFormati(h.tarih)}</td><td>${escapeDashboardText(d?.ad||'-')}</td><td>${Number(h.litre).toLocaleString('tr-TR')} L</td><td style="${Number.isFinite(kalan)&&kalan<0?'color:#b91c1c;':''}font-weight:400;white-space:nowrap;">${Number.isFinite(kalan)?kalan.toLocaleString('tr-TR')+' L':'-'}</td><td>${Number(h.km||0).toLocaleString('tr-TR')}</td><td>${escapeDashboardText(h.alan||'-')}</td><td>${escapeDashboardText(h.veren||'-')}</td><td>${t?t.toFixed(2).replace('.',',')+' L':'-'}</td></tr>`;}).join('')||'<tr><td colspan="8" style="text-align:center;padding:20px;">Kayıt yok.</td></tr>';
    }

function akaryakitAracRaporAl(tur){
fdAracDogrula(false);

        const id=document.getElementById('akaryakitDetayAracId').value,arac=araclar.find(a=>String(a.id)===String(id)),liste=akaryakitAracDetayListesi(),yil=document.getElementById('akaryakitDetayYil').value,ay=document.getElementById('akaryakitDetayAy').value||'TÜM AYLAR',baslangic=document.getElementById('akaryakitDetayBaslangic').value,bitis=document.getElementById('akaryakitDetayBitis').value,donemEtiketi=baslangic||bitis?`${baslangic?tarihFormati(baslangic):'BAŞLANGIÇ'} - ${bitis?tarihFormati(bitis):'BUGÜN'}`:`${yil} ${ay}`,tuketimler=akaryakitTuketimleriniHesapla(),tumAraliklar=akaryakitTuketimAraliklari(id),araliklar=tumAraliklar.filter(a=>akaryakitDetayTarihAraligindaMi(a.sonTarih));
        if(!arac||!liste.length){alert('Raporlanacak yakıt kaydı bulunmuyor.');return;}
        const stoklar=akaryakitStokHesaplariniHesapla(),teslimBaslik=['TARİH','DEPO','LİTRE','AÇILIŞ STOKU (LİTRE)','İŞLEM SONRASI KALAN (LİTRE)','KM','ALAN','VEREN','100 KM TÜKETİM'],teslimSatir=liste.map(h=>{
if(!fdAracGecerli())return;
const d=akaryakitDepolari().find(x=>String(x.id)===String(h.depoId)),t=tuketimler.get(h.id),acilis=stoklar.depolar.get(String(h.depoId))?.acilis,kalan=stoklar.hareketler.get(String(h.id))?.kalan;return[tarihFormati(h.tarih),d?.ad||'-',Number(h.litre||0),Number.isFinite(acilis)?acilis:'',Number.isFinite(kalan)?kalan:'',Number(h.km||0),h.alan||'-',h.veren||'-',t?Number(t.toFixed(2)):''];});
        const aralikBaslik=['ÖNCEKİ TARİH','SON TARİH','ÖNCEKİ KM','SON KM','YAPILAN KM','ALINAN LİTRE','100 KM TÜKETİM'],aralikSatir=araliklar.map(a=>[tarihFormati(a.oncekiTarih),tarihFormati(a.sonTarih),a.oncekiKm,a.sonKm,a.kmFarki,a.litre,Number(a.oran.toFixed(2))]);
        const ozetKaynagi=baslangic||bitis?araliklar:tumAraliklar,aylik=akaryakitTuketimDonemOzeti(ozetKaynagi.filter(a=>baslangic||bitis?true:String(a.sonTarih).startsWith(yil)),7),yillik=akaryakitTuketimDonemOzeti(ozetKaynagi,4),ozetBaslik=['DÖNEM','ALIM SAYISI','TOPLAM LİTRE','HESAPLANAN KM','ORTALAMA L/100 KM'],aylikSatir=aylik.map(o=>[o.donem,o.adet,o.litre,o.km,Number(o.ortalama.toFixed(2))]),yillikSatir=yillik.map(o=>[o.donem,o.adet,o.litre,o.km,Number(o.ortalama.toFixed(2))]),ad=`${arac.plaka}_YAKIT_RAPORU_${donemEtiketi}`.replaceAll(' ','_').replace(/[/:]/g,'-');
        if(tur==='excel'){const wb=XLSX.utils.book_new(),ekle=(ad,veri,genislik)=>{
if(!fdAracGecerli())return;
const ws=XLSX.utils.aoa_to_sheet(veri);ws['!cols']=genislik.map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,ad);};ekle('Yakıt Teslimleri',[[`${arac.plaka} YAKIT RAPORU`,donemEtiketi],teslimBaslik,...teslimSatir],[18,18,12,22,28,14,24,24,18]);ekle('İki Yakıt Arası',[aralikBaslik,...aralikSatir],[16,16,14,14,14,14,18]);ekle('Aylık Özet',[ozetBaslik,...aylikSatir],[16,14,16,18,20]);ekle('Yıllık Özet',[ozetBaslik,...yillikSatir],[16,14,16,18,20]);XLSX.writeFile(wb,`${ad}.xlsx`);return;}
        const tablo=(basliklar,satirlar)=>`<table style="width:100%;border-collapse:collapse;font-size:8px;margin-bottom:16px;"><thead><tr>${basliklar.map(b=>`<th style="padding:6px;border:1px solid #cbd5e1;background:#e2e8f0;">${b}</th>`).join('')}</tr></thead><tbody>${satirlar.map(s=>`<tr>${s.map(v=>`<td style="padding:5px;border:1px solid #cbd5e1;">${escapeDashboardText(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`,toplam=liste.reduce((s,h)=>s+Number(h.litre||0),0),alan=document.createElement('div');alan.style.cssText='padding:18px;font-family:Arial;color:#0f172a;';alan.innerHTML=`<h2 style="margin:0 0 4px;">${escapeDashboardText(arac.plaka)} ARAÇ YAKIT RAPORU</h2><p style="margin:0 0 14px;color:#64748b;">${escapeDashboardText(donemEtiketi)} · ${liste.length} kayıt · Toplam ${toplam.toLocaleString('tr-TR')} litre</p><h3>İki Yakıt Alımı Arasındaki Tüketim</h3>${tablo(aralikBaslik,aralikSatir)}<h3>Aylık Tüketim Ortalamaları</h3>${tablo(ozetBaslik,aylikSatir)}<h3>Yıllık Tüketim Ortalamaları</h3>${tablo(ozetBaslik,yillikSatir)}<h3>Yakıt Teslim Kayıtları</h3>${tablo(teslimBaslik,teslimSatir)}`;return window.fdPdfOnizlemeUret?.(alan,`${ad}.pdf`,{yon:'landscape',altBaslik:`${arac.plaka} Yakıt Raporu`});
    }

function aracMtvListesiniCiz() {
fdAracDogrula(false);

        const body = document.getElementById('aracMtvBody');
        if (!body) return;
        const yil = Number(document.getElementById('aracMtvYil')?.value || new Date().getFullYear());
        const arama = String(document.getElementById('aracMtvArama')?.value || '').toLocaleLowerCase('tr-TR');
        const durumFiltre = document.getElementById('aracMtvDurumFiltre')?.value || '';
        const liste = araclar.filter(a => aktifSirketeAit(a) && String(a.durum) !== 'Satıldı' && !a.satisTarihi && aracMtvTakipliMi(a)).filter(a => {
if(!fdAracGecerli())return;

            if (arama && ![a.plaka,a.marka,a.model].join(' ').toLocaleLowerCase('tr-TR').includes(arama)) return false;
            const bir = aracMtvKaydi(a,yil,1), iki = aracMtvKaydi(a,yil,2);
            const gecikmis = (!bir && aracTarihDurumu(`${yil}-01-31`).tur === 'gecen') || (!iki && aracTarihDurumu(`${yil}-07-31`).tur === 'gecen');
            if (durumFiltre === 'tam' && !(bir && iki)) return false;
            if (durumFiltre === 'eksik' && bir && iki) return false;
            if (durumFiltre === 'gecikmis' && !gecikmis) return false;
            return true;
        }).sort((a,b) => String(a.plaka).localeCompare(String(b.plaka),'tr'));
        const taksitHucre = (arac, taksit) => {
if(!fdAracGecerli())return;

            const kayit = aracMtvKaydi(arac, yil, taksit);
            const sonTarih = `${yil}-${taksit === 1 ? '01-31' : '07-31'}`;
            if (kayit) return [`<strong>${paraFormatla(kayit.tutar)}</strong><br><small>${tarihFormati(kayit.odemeTarihi)}</small>`, `<span class="badge" style="background:#dcfce7;color:#166534;">Ödendi</span>${kayit.referans ? `<br><small>${escapeDashboardText(kayit.referans)}</small>` : ''}`];
            const durum = aracTarihDurumu(sonTarih);
            const gecti = durum.tur === 'gecen';
            return ['<strong>-</strong>', `<span class="badge" style="${gecti ? 'background:#fee2e2;color:#991b1b;' : 'background:#fef3c7;color:#92400e;'}">${gecti ? 'Ödenmedi · Süresi Geçti' : 'Ödenmedi'}</span><br><small>Son ödeme: ${tarihFormati(sonTarih)}</small>`];
        };
        body.innerHTML = liste.map((arac,index) => {
if(!fdAracGecerli())return;
 const bir=taksitHucre(arac,1), iki=taksitHucre(arac,2); return `<tr><td>${index+1}</td><td><button type="button" class="fd-table-cell-link" onclick="aracMtvGecmisiniAc('${arac.id}')">${escapeDashboardText(arac.plaka)}</button></td><td>${escapeDashboardText(`${arac.marka || ''} ${arac.model || ''}`)}</td><td>${bir[0]}</td><td>${bir[1]}</td><td>${iki[0]}</td><td>${iki[1]}</td><td><button class="btn-modern btn-edit-modern" onclick="aracMtvElleOdemeAc('${arac.id}',${yil},1)">💳 MTV Ödemesi Gir</button></td></tr>`; }).join('') || '<tr><td colspan="8" style="text-align:center;padding:20px;color:#64748b;">Aktif araç bulunmuyor.</td></tr>';
    }

function aracMtvGecmisiniAc(id) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        document.getElementById('aracMtvGecmisBaslik').textContent = `💳 ${arac.plaka} · MTV Ödeme Geçmişi`;
        const odemeler = [...(arac.mtvOdemeleri || [])].sort((a,b) => Number(b.yil)-Number(a.yil) || Number(a.taksit)-Number(b.taksit));
        document.getElementById('aracMtvGecmisBody').innerHTML = odemeler.map(o => {
if(!fdAracGecerli())return;

            const sonTarih = `${o.yil}-${Number(o.taksit) === 1 ? '01-31' : '07-31'}`;
            return `<tr><td>${o.yil}</td><td>${o.taksit}. Taksit</td><td>${tarihFormati(sonTarih)}</td><td>${tarihFormati(o.odemeTarihi)}</td><td><strong>${paraFormatla(o.tutar)}</strong></td><td>${escapeDashboardText(o.referans || '-')}</td><td><span class="badge" style="background:#dcfce7;color:#166534;">Ödendi</span></td></tr>`;
        }).join('') || '<tr><td colspan="7" style="text-align:center;padding:22px;color:#64748b;">Geçmiş MTV ödemesi bulunmuyor.</td></tr>';
        document.getElementById('modalAracMtvGecmis').style.display = 'flex';
    }

function aracMtvElleOdemeAc(id, yil, taksit) {
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        document.getElementById('aracMtvOdemeForm').reset();
        document.getElementById('aracMtvOdemeAracId').value = id;
        document.getElementById('aracMtvOdemeYil').value = yil;
        document.getElementById('aracMtvOdemeTaksit').value = String(taksit);
        aracMtvElleSecimiDegisti();
        document.getElementById('aracMtvOdemeDurumu').style.display = 'none';
        const kaydetBtn = document.getElementById('aracMtvOdemeKaydetBtn');
        kaydetBtn.type = 'button';
        kaydetBtn.onclick = () => aracMtvElleKaydet();
        document.getElementById('modalAracMtvOdeme').style.display = 'flex';
    }

function aracMtvElleSecimiDegisti() {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracMtvOdemeAracId').value)); if (!arac) return;
        const yil = Number(document.getElementById('aracMtvOdemeYil').value);
        const taksit = Number(document.getElementById('aracMtvOdemeTaksit').value);
        const kayit = aracMtvKaydi(arac,yil,taksit);
        document.getElementById('aracMtvOdemeTarihi').value = kayit?.odemeTarihi || new Date().toISOString().slice(0,10);
        document.getElementById('aracMtvOdemeTutari').value = kayit?.tutar ? Number(kayit.tutar).toLocaleString('tr-TR',{maximumFractionDigits:2}) : '';
        document.getElementById('aracMtvOdemeReferans').value = kayit?.referans || '';
        document.getElementById('aracMtvOdemeBaslik').textContent = `💳 ${arac.plaka} · ${yil || '-'} / ${taksit}. Taksit`;
    }

async function aracMtvElleKaydet(event = null) {
try{
fdAracDogrula(true);

        event?.preventDefault?.();
        const form = document.getElementById('aracMtvOdemeForm');
        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracMtvOdemeAracId').value)); if (!arac) return;
        const yil = Number(document.getElementById('aracMtvOdemeYil').value);
        const taksit = Number(document.getElementById('aracMtvOdemeTaksit').value);
        const odemeTarihi = document.getElementById('aracMtvOdemeTarihi').value;
        const tutar = paraMetniniSayiyaCevir(document.getElementById('aracMtvOdemeTutari').value);
        const referans = document.getElementById('aracMtvOdemeReferans').value;
        if (!yil || ![1,2].includes(taksit) || !odemeTarihi) { alert('Yıl, taksit ve ödeme tarihini eksiksiz girin.'); return; }
        if (!(tutar > 0)) { alert('Ödenen tutarı girin.'); return; }
        const kaydetBtn = document.getElementById('aracMtvOdemeKaydetBtn');
        const durumAlani = document.getElementById('aracMtvOdemeDurumu');
        if (kaydetBtn.disabled) return;
        kaydetBtn.disabled = true; kaydetBtn.textContent = '⏳ MTV Ödemesi Kaydediliyor...';
        durumAlani.style.display = 'block'; durumAlani.style.background = '#e0f2fe'; durumAlani.style.color = '#075985'; durumAlani.textContent = 'Ödeme kaydediliyor, lütfen bekleyin...';
        const kayit = { id:`mtv_${yil}_${taksit}`, yil, taksit, odemeTarihi, tutar, referans, kaynak:'Elle giriş' };
        const oncekiOdemeler = JSON.parse(JSON.stringify(arac.mtvOdemeleri || []));
        arac.mtvOdemeleri ||= [];
        const index = arac.mtvOdemeleri.findIndex(o => Number(o.yil) === yil && Number(o.taksit) === taksit);
        if (index >= 0) arac.mtvOdemeleri[index] = kayit; else arac.mtvOdemeleri.push(kayit);
        yuklenenVeriler.add('araclar');
        try {
            await fdAracBekle(aracTekKaydiKaydet(arac));
            const dogrulananArac = araclar.find(a => String(a.id) === String(arac.id));
            const dogrulananOdeme = aracMtvKaydi(dogrulananArac,yil,taksit);
            if (!dogrulananOdeme || Number(dogrulananOdeme.tutar) !== Number(tutar) || String(dogrulananOdeme.odemeTarihi) !== String(odemeTarihi)) throw new Error('Ödeme veritabanına yazıldıktan sonra doğrulanamadı.');
            aracMtvListesiniCiz(); aracTumTakipListeleriniCiz();
            document.getElementById('modalAracMtvOdeme').style.display = 'none'; form?.reset();
            showToast('MTV ödemesi kaydedildi.', 'success');
        } catch (error) {
if(!fdAracGecerli())return;

            arac.mtvOdemeleri = oncekiOdemeler;
            durumAlani.style.background = '#fee2e2'; durumAlani.style.color = '#991b1b'; durumAlani.textContent = 'Kayıt başarısız: ' + (error.message || 'Bilinmeyen hata');
            alert('MTV ödemesi kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
if(fdAracGecerli()){

            kaydetBtn.disabled = false; kaydetBtn.textContent = '💾 MTV Ödemesini Kaydet';
        
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracSigortaListesiniCiz() {
fdAracDogrula(false);

        const body = document.getElementById('aracSigortaBody'); if (!body) return;
        const arama = String(document.getElementById('aracSigortaArama')?.value || '').toLocaleLowerCase('tr-TR');
        const durumFiltre = document.getElementById('aracSigortaDurumFiltre')?.value || '';
        const liste = araclar.filter(a => aktifSirketeAit(a) && String(a.durum) !== 'Satıldı' && !a.satisTarihi && aracSigortaTakipliMi(a)).filter(a => {
if(!fdAracGecerli())return;

            if (arama && ![a.plaka,a.marka,a.model,a.sigortaSirketi,a.sigortaPoliceNo,a.kaskoSirketi,a.kaskoPoliceNo].join(' ').toLocaleLowerCase('tr-TR').includes(arama)) return false;
            if (durumFiltre === 'eksik') return !a.sigortaBitis;
            if (durumFiltre) {
                const durumlar = [a.sigortaBitis,a.kaskoBitis].filter(Boolean).map(t => aracTarihDurumu(t).tur);
                return durumlar.includes(durumFiltre);
            }
            return true;
        }).sort((a,b)=>String(a.plaka).localeCompare(String(b.plaka),'tr'));
        body.innerHTML = liste.map((a,index) => `<tr><td>${index+1}</td><td><button type="button" class="fd-table-cell-link" onclick="aracSigortaModaliniAc('${a.id}',true)">${escapeDashboardText(a.plaka)}</button></td><td>${escapeDashboardText(`${a.marka||''} ${a.model||''}`)}</td><td>${escapeDashboardText(a.sigortaSirketi||'-')}<br><small>${escapeDashboardText(a.sigortaPoliceNo||'-')}</small>${a.sigortaBedeli ? `<br><strong>${paraFormatla(a.sigortaBedeli)}</strong>` : ''}</td><td>${a.sigortaBitis ? aracTakipTarihRozeti(a.sigortaBitis) : '-'}</td><td>${a.belgeler?.sigorta?.url ? aracBelgeButonu(a.belgeler.sigorta,'Sigorta Poliçesi') : '-'}</td><td>${escapeDashboardText(a.kaskoSirketi||'-')}<br><small>${escapeDashboardText(a.kaskoPoliceNo||'-')}</small>${a.kaskoBedeli ? `<br><strong>${paraFormatla(a.kaskoBedeli)}</strong>` : ''}</td><td>${a.kaskoBitis ? aracTakipTarihRozeti(a.kaskoBitis) : '-'}</td><td>${a.belgeler?.kasko?.url ? aracBelgeButonu(a.belgeler.kasko,'Kasko Poliçesi') : '-'}</td><td><button class="btn-modern btn-edit-modern" onclick="aracSigortaModaliniAc('${a.id}')">＋ Yeni Sigorta / Kasko Ekle</button></td></tr>`).join('') || '<tr><td colspan="10" style="text-align:center;padding:20px;color:#64748b;">Aktif araç bulunmuyor.</td></tr>';
    }

function aracVizeListesiniCiz() {
fdAracDogrula(false);

        const body = document.getElementById('aracVizeBody'); if (!body) return;
        const arama = String(document.getElementById('aracVizeArama')?.value || '').toLocaleLowerCase('tr-TR');
        const durumFiltre = document.getElementById('aracVizeDurumFiltre')?.value || '';
        const liste = araclar.filter(a => aktifSirketeAit(a) && String(a.durum) !== 'Satıldı' && !a.satisTarihi && aracVizeTakipliMi(a)).filter(a => {
if(!fdAracGecerli())return;

            if (arama && ![a.plaka,a.marka,a.model].join(' ').toLocaleLowerCase('tr-TR').includes(arama)) return false;
            const sonuc = a.muayeneDurumu === 'Geçti' ? 'Kusursuz Geçti' : a.muayeneDurumu;
            if (['gecen','yaklasan'].includes(durumFiltre)) return [a.muayeneBitis,a.egzozMuayeneBitis].filter(Boolean).some(t => aracTarihDurumu(t).tur === durumFiltre);
            return !durumFiltre || sonuc === durumFiltre;
        }).sort((a,b)=>String(a.muayeneBitis||'9999').localeCompare(String(b.muayeneBitis||'9999')));
        body.innerHTML = liste.map((a,index) => `<tr><td>${index+1}</td><td><button type="button" class="fd-table-cell-link" onclick="aracVizeModaliniAc('${a.id}',true)">${escapeDashboardText(a.plaka)}</button></td><td>${escapeDashboardText(`${a.marka||''} ${a.model||''}`)}</td><td>${tarihFormati(a.muayeneTarihi)}</td><td>${a.muayeneBitis ? aracTakipTarihRozeti(a.muayeneBitis) : '-'}</td><td>${tarihFormati(a.egzozMuayeneTarihi)}</td><td>${a.egzozMuayeneBitis ? aracTakipTarihRozeti(a.egzozMuayeneBitis) : '-'}</td><td>${escapeDashboardText(a.muayeneDurumu === 'Geçti' ? 'Kusursuz Geçti' : (a.muayeneDurumu || '-'))}</td><td><div class="action-btns"><button class="btn-modern btn-detail-modern" onclick="aracVizeModaliniAc('${a.id}',false,true)">✏️ Aktif Vizeyi Düzenle</button><button class="btn-modern btn-edit-modern" onclick="aracVizeModaliniAc('${a.id}')">＋ Yeni Vize Gir</button></div></td></tr>`).join('') || '<tr><td colspan="9" style="text-align:center;padding:20px;color:#64748b;">Aktif araç bulunmuyor.</td></tr>';
    }

function aracBakimOzetListesiniCiz() {
fdAracDogrula(false);

        const body = document.getElementById('aracBakimOzetBody'); if (!body) return;
        const arama = String(document.getElementById('aracBakimArama')?.value || '').toLocaleLowerCase('tr-TR');
        const durumFiltre = document.getElementById('aracBakimDurumFiltre')?.value || '';
        const liste = araclar.filter(a => aktifSirketeAit(a) && String(a.durum) !== 'Satıldı' && !a.satisTarihi).filter(a => {
if(!fdAracGecerli())return;

            if (arama && ![a.plaka,a.marka,a.model].join(' ').toLocaleLowerCase('tr-TR').includes(arama)) return false;
            const son = fdAracSonBakim(a);
            if (durumFiltre === 'kayitli') return Boolean(son);
            if (durumFiltre === 'kayitsiz') return !son;
            if (['gecen','yaklasan'].includes(durumFiltre)) return Boolean((son?.sonrakiTarih && aracTarihDurumu(son.sonrakiTarih).tur === durumFiltre)||(durumFiltre==='gecen'&&Number(son?.sonrakiKm)>0&&Number(a.km)>=Number(son.sonrakiKm)));
            return true;
        }).sort((a,b)=>String(a.plaka).localeCompare(String(b.plaka),'tr'));
        body.innerHTML = liste.map((a,index) => {
if(!fdAracGecerli())return;

            const bakimlar=[...(a.bakimlar||[])].sort((x,y)=>String(y.tarih||'').localeCompare(String(x.tarih||''))); const son=bakimlar[0];
            return `<tr><td>${index+1}</td><td><strong>${escapeDashboardText(a.plaka)}</strong></td><td>${escapeDashboardText(`${a.marka||''} ${a.model||''}`)}</td><td>${son?.km ? Number(son.km).toLocaleString('tr-TR') : '-'}</td><td>${son?tarihFormati(son.tarih):'-'}</td><td>${son?.sonrakiTarih?aracTakipTarihRozeti(son.sonrakiTarih):'-'}</td><td>${son?.sonrakiKm?Number(son.sonrakiKm).toLocaleString('tr-TR'):'-'}</td><td><button class="btn-modern btn-detail-modern" onclick="aracBakimModaliniAc('${a.id}')">🔧 Bakımları Aç</button></td></tr>`;
        }).join('') || '<tr><td colspan="8" style="text-align:center;padding:20px;color:#64748b;">Aktif araç bulunmuyor.</td></tr>';
    }

function aracTumTakipListeleriniCiz() {
fdAracDogrula(false);

        aracListesiniCiz();
        akaryakitListesiniCiz();
        aracMtvListesiniCiz();
        aracSigortaListesiniCiz();
        aracVizeListesiniCiz();
        aracBakimOzetListesiniCiz();
    }

function aracListeModunuDegistir(mod, button) {
fdAracDogrula(false);

        aracListeModu = mod;
        document.querySelectorAll('#arac-tab-araclar .module-subnav button').forEach(b => b.classList.remove('active'));
        if (button) button.classList.add('active');
        document.getElementById('aracDurumFiltre').value = '';
        aracListesiniCiz();
    }

function aracSecimleriniDoldur() {
fdAracDogrula(false);

        aracTurSecenekleriniYenile();
        const personelSelect = document.getElementById('aracPersonelId');
        const onceki = personelSelect.value;
        personelSelect.innerHTML = '<option value="">Atanmamış</option>' + personeller.filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null')).sort((a,b) => String(a.ad).localeCompare(String(b.ad),'tr')).map(p => `<option value="${escapeDashboardText(p.id)}">${escapeDashboardText(p.ad)} · ${escapeDashboardText(p.sube || '-')}</option>`).join('');
        if ([...personelSelect.options].some(o => o.value === onceki)) personelSelect.value = onceki;
        document.getElementById('aracSubeListesi').innerHTML = subeler.filter(s => aktifSirketeAit(s) && String(s.durum || 'Aktif') !== 'Pasif').map(s => `<option value="${escapeDashboardText(s.ad || '')}"></option>`).join('');
    }

function aracBelgeDurumlariniGoster(arac = null) {
fdAracDogrula(false);

        const alanlar = { noter:'aracNoterPdfMevcut', ruhsat:'aracRuhsatPdfMevcut' };
        Object.entries(alanlar).forEach(([tur, id]) => {
if(!fdAracGecerli())return;

            const belge = arac?.belgeler?.[tur];
            document.getElementById(id).innerHTML = belge?.url ? `<div style="margin-top:7px;">${aracBelgeButonu(belge, belge.ad || tur)}</div>` : '<small style="color:#94a3b8;">Kayıtlı belge yok</small>';
        });
    }

function aracTuruneGoreAlanlariGuncelle() {
fdAracDogrula(false);

        const yariRomork = aracYariRomorkMu();
        document.querySelectorAll('#aracForm [data-arac-motorlu-alan]').forEach(alan => alan.style.display = yariRomork ? 'none' : '');
        const motorNo = document.getElementById('aracMotorNo');
        if (motorNo) motorNo.required = !yariRomork;
        const mtvTakip = document.getElementById('aracMtvTakip');
        if (mtvTakip) { mtvTakip.disabled = yariRomork; if (yariRomork) mtvTakip.checked = false; }
        if (yariRomork) ['aracYakit','aracVites','aracMotorNo','aracKm','aracAlisKm'].forEach(id => {
if(!fdAracGecerli())return;
 const alan=document.getElementById(id); if(alan) alan.value=''; });
    }

function aracFormunuAc(id = '', hedefBolum = '') {
fdAracDogrula(true);

        if (typeof fdVarlikKisiListesiniGuncelle === 'function') fdVarlikKisiListesiniGuncelle();
        const form = document.getElementById('aracForm');
        form.dataset.editId = ''; form.dataset.originalPlate = '';
        form.reset();
        aracRuhsatDurumMesaji('', '');
        document.getElementById('aracEditId').value = '';
        aracSecimleriniDoldur();
        const arac = id ? araclar.find(a => aktifSirketeAit(a) && String(a.id) === String(id)) : null;
        if (arac) { form.dataset.editId=String(arac.id||''); form.dataset.originalPlate=aracPlakaAnahtari(arac.plaka); }
        document.getElementById('aracModalBaslik').textContent = arac ? `✏️ ${arac.plaka} Araç Kaydını Düzenle` : '🚘 Yeni Araç Kaydı';
        document.getElementById('btnAracKaydet').textContent = arac ? '💾 Değişiklikleri Kaydet' : '💾 Araç Kaydını Kaydet';
        if (arac) {
            document.getElementById('aracEditId').value = arac.id;
            const alanlar = {
                aracPlaka:'plaka', aracTuru:'tur', aracMarka:'marka', aracModel:'model', aracModelYili:'modelYili', aracRenk:'renk', aracYakit:'yakit', aracVites:'vites', aracSasiNo:'sasiNo', aracMotorNo:'motorNo', aracRuhsatSeriNo:'ruhsatSeriNo', aracKm:'km', aracDurum:'durum', aracSube:'sube', aracSahibi:'aracSahibi', aracPersonelId:'personelId', aracAlisTarihi:'alisTarihi', aracSatici:'satici', aracAlisBedeli:'alisBedeli', aracAlisKm:'alisKm', aracFaturaNo:'faturaNo', aracSatisTarihi:'satisTarihi', aracAlici:'alici', aracSatisBedeli:'satisBedeli', aracMuayeneTarihi:'muayeneTarihi', aracMuayeneBitis:'muayeneBitis', aracSigortaSirketi:'sigortaSirketi', aracSigortaPoliceNo:'sigortaPoliceNo', aracSigortaBaslangic:'sigortaBaslangic', aracSigortaBitis:'sigortaBitis', aracKaskoSirketi:'kaskoSirketi', aracKaskoPoliceNo:'kaskoPoliceNo', aracKaskoBaslangic:'kaskoBaslangic', aracKaskoBitis:'kaskoBitis', aracAciklama:'aciklama'
            };
            Object.entries(alanlar).forEach(([idAlan, key]) => {
if(!fdAracGecerli())return;
 const alan = document.getElementById(idAlan); if (alan) alan.value = arac[key] ?? ''; });
        } else {
            document.getElementById('aracDurum').value = 'Aktif';
        }
        aracTurSecenekleriniYenile(arac?.tur || document.getElementById('aracTuru').value);
        document.getElementById('aracMtvTakip').checked = arac ? arac.mtvTakip !== false && !aracYariRomorkMu(arac.tur) : !aracYariRomorkMu();
        document.getElementById('aracSigortaTakip').checked = arac ? arac.sigortaTakip !== false : true;
        document.getElementById('aracVizeTakip').checked = arac ? arac.vizeTakip !== false : true;
        aracFotoOnizlemesiniGoster(arac?.foto || null);
        aracBelgeDurumlariniGoster(arac);
        aracTuruneGoreAlanlariGuncelle();
        document.getElementById('modalAracKayit').style.display = 'flex';
        if (hedefBolum) {
            const detaylar = [...form.querySelectorAll(':scope > details.profile-section')];
            detaylar.forEach(detay => detay.open = false);
            const hedef = hedefBolum === 'belgeler' ? detaylar[2] : detaylar[0];
            if (hedef) { hedef.open = true; setTimeout(() => hedef.scrollIntoView({ behavior:'smooth', block:'start' }), 50); }
        }
    }

function aracFormunuKapat() {
fdAracDogrula(false);

        const form=document.getElementById('aracForm'); if(form){form.dataset.editId='';form.dataset.originalPlate='';}
        document.getElementById('modalAracKayit').style.display = 'none';
    }

async function aracPdfYukle(inputId, plaka, tur, eskiBelge = null) {
try{
fdAracDogrula(true);

        const dosya = document.getElementById(inputId).files?.[0];
        if (!dosya) return eskiBelge || null;
        if (dosya.size > ayarSayisi('pdfAzamiMb', 10) * 1024 * 1024) throw new Error(`${tur} dosyası azami boyutu aşıyor.`);
        const base64 = await fdAracBekle(dosyayiBase64Oku(dosya));
        let yuklenen;
        if (dosya.type === 'application/pdf') {
            const dosyaAdi = driveBelgeDosyaAdi(plaka, 'ARAÇ TAKİP', tur);
            yuklenen = await fdAracBekle(fdYazilimDrivePdfYukle(base64, dosyaAdi, eskiBelge?.id || '', 'ARAÇ TAKİP'));
        } else {
            const uzanti = ({ 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp' })[dosya.type];
            if (!uzanti) throw new Error(`${tur} için yalnızca PDF, JPG, PNG veya WEBP dosyası yüklenebilir.`);
            const turAnahtari = String(tur || 'BELGE').toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g, '_').replace(/^_+|_+$/g, '');
            const dosyaAdi = `${aracPlakaAnahtari(plaka)}_ARAC_TAKIP_${turAnahtari}.${uzanti}`;
            yuklenen = await fdAracBekle(fdYazilimDriveDosyaYukle(base64, dosyaAdi, dosya.type, eskiBelge?.id || '', 'ARAÇ TAKİP'));
        }
        return { id:yuklenen.id, url:yuklenen.url, ad:yuklenen.ad };
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function aracKaydet(event) {
try{
fdAracDogrula(true);

        event.preventDefault();
        const form=document.getElementById('aracForm'),editId=String(document.getElementById('aracEditId').value||form?.dataset?.editId||''),originalPlate=String(form?.dataset?.originalPlate||'');
        if(form?.dataset.saving==='1')return;
        const mevcut = (editId ? araclar.find(a => aktifSirketeAit(a) && String(a.id) === editId) : null) || (originalPlate ? araclar.find(a => aktifSirketeAit(a) && aracPlakaAnahtari(a.plaka) === originalPlate) : null);
        if(editId&&!mevcut){alert('Düzenlenecek araç bulunamadı. Listeyi yenileyip tekrar açın.');return;}
        const plaka = String(document.getElementById('aracPlaka').value || '').trim().toLocaleUpperCase('tr-TR');
        const plakaDegisti = !mevcut || aracPlakaAnahtari(mevcut.plaka) !== aracPlakaAnahtari(plaka);
        if (plakaDegisti && araclar.some(a => aktifSirketeAit(a) && a !== mevcut && String(a.id) !== String(editId) && aracPlakaAnahtari(a.plaka) === aracPlakaAnahtari(plaka))) { alert('Bu plakaya ait araç kaydı zaten mevcut.'); return; }
        const deger = id => document.getElementById(id)?.value ?? '';
        const yariRomork = aracYariRomorkMu(deger('aracTuru'));
        const kayit = {
            ...(mevcut||{}),
            id:mevcut?.id || `arac_${Date.now()}`, sirketId:aktifSirketId(), plaka, tur:deger('aracTuru'), marka:deger('aracMarka'), model:deger('aracModel'), modelYili:deger('aracModelYili'), renk:deger('aracRenk'), yakit:yariRomork ? '' : deger('aracYakit'), vites:yariRomork ? '' : deger('aracVites'), sasiNo:deger('aracSasiNo'), motorNo:yariRomork ? '' : deger('aracMotorNo'), ruhsatSeriNo:deger('aracRuhsatSeriNo'), km:yariRomork ? 0 : paraMetniniSayiyaCevir(deger('aracKm')), durum:deger('aracDurum'), mtvTakip:!yariRomork && Boolean(document.getElementById('aracMtvTakip')?.checked), sigortaTakip:Boolean(document.getElementById('aracSigortaTakip')?.checked), vizeTakip:Boolean(document.getElementById('aracVizeTakip')?.checked), sube:deger('aracSube'), aracSahibi:deger('aracSahibi').trim().toLocaleUpperCase('tr-TR'), personelId:deger('aracPersonelId'), alisTarihi:deger('aracAlisTarihi'), satici:deger('aracSatici'), alisBedeli:paraMetniniSayiyaCevir(deger('aracAlisBedeli')), alisKm:yariRomork ? 0 : paraMetniniSayiyaCevir(deger('aracAlisKm')), faturaNo:deger('aracFaturaNo'), satisTarihi:deger('aracSatisTarihi'), alici:deger('aracAlici'), satisBedeli:paraMetniniSayiyaCevir(deger('aracSatisBedeli')), muayeneTarihi:deger('aracMuayeneTarihi'), muayeneBitis:deger('aracMuayeneBitis'), sigortaSirketi:deger('aracSigortaSirketi'), sigortaPoliceNo:deger('aracSigortaPoliceNo'), sigortaBaslangic:deger('aracSigortaBaslangic'), sigortaBitis:deger('aracSigortaBitis'), kaskoSirketi:deger('aracKaskoSirketi'), kaskoPoliceNo:deger('aracKaskoPoliceNo'), kaskoBaslangic:deger('aracKaskoBaslangic'), kaskoBitis:deger('aracKaskoBitis'), aciklama:deger('aracAciklama'), foto:mevcut?.foto || null, belgeler:{ ...(mevcut?.belgeler || {}) }, bakimlar:Array.isArray(mevcut?.bakimlar) ? mevcut.bakimlar : [], mtvOdemeleri:yariRomork ? [] : (Array.isArray(mevcut?.mtvOdemeleri) ? mevcut.mtvOdemeleri : []), sigortaGecmisi:Array.isArray(mevcut?.sigortaGecmisi) ? mevcut.sigortaGecmisi : [], vizeGecmisi:Array.isArray(mevcut?.vizeGecmisi) ? mevcut.vizeGecmisi : [], trafikCezalari:Array.isArray(mevcut?.trafikCezalari) ? mevcut.trafikCezalari : []
        };
        if (mevcut) Object.assign(kayit, { sigortaSirketi:mevcut.sigortaSirketi || '', sigortaPoliceNo:mevcut.sigortaPoliceNo || '', sigortaBedeli:Number(mevcut.sigortaBedeli || 0), sigortaBaslangic:mevcut.sigortaBaslangic || '', sigortaBitis:mevcut.sigortaBitis || '', kaskoSirketi:mevcut.kaskoSirketi || '', kaskoPoliceNo:mevcut.kaskoPoliceNo || '', kaskoBedeli:Number(mevcut.kaskoBedeli || 0), kaskoBaslangic:mevcut.kaskoBaslangic || '', kaskoBitis:mevcut.kaskoBitis || '', muayeneTarihi:mevcut.muayeneTarihi || '', muayeneBitis:mevcut.muayeneBitis || '', egzozMuayeneTarihi:mevcut.egzozMuayeneTarihi || '', egzozMuayeneBitis:mevcut.egzozMuayeneBitis || '' });
        kayit.muayeneAciklama = mevcut?.muayeneAciklama || '';
        kayit.muayeneDurumu = mevcut?.muayeneDurumu || '';
        kayit.muayeneKusurlari = mevcut?.muayeneKusurlari || '';
        if (kayit.satisTarihi) kayit.durum = 'Satıldı';
        fdAracFormMesgul(form,true);
        showGlobalOverlay('Araç kaydediliyor', 'Araç bilgileri ve seçilen belgeler hazırlanıyor...');
        const belgeHatalari = [];
        try {
            const fotoDosyasi = document.getElementById('aracFoto').files?.[0];
            if (fotoDosyasi) {
                try {
                    if (fotoDosyasi.size > 10 * 1024 * 1024) throw new Error('Araç görseli en fazla 10 MB olabilir.');
                    const uzanti = fotoDosyasi.name.split('.').pop() || 'jpg';
                    const fotoAdi = aracPlakaAnahtari(plaka) + '_ARAC_GORSELI.' + uzanti;
                    const yuklenenFoto = await fdAracBekle(fdYazilimDriveDosyaYukle(await fdAracBekle(dosyayiBase64Oku(fotoDosyasi)), fotoAdi, fotoDosyasi.type, kayit.foto?.id || '', 'ARAÇ TAKİP'));
                    kayit.foto = { id:yuklenenFoto.id, url:yuklenenFoto.url, ad:yuklenenFoto.ad, mimeType:fotoDosyasi.type };
                } catch (error) {
if(!fdAracGecerli())return;
 belgeHatalari.push('Araç görseli: ' + (error.message || error)); }
            }
            const belgeAlanlari = [['noter','aracNoterPdf','ALIŞ NOTER SATIŞ SÖZLEŞMESİ'],['ruhsat','aracRuhsatPdf','RUHSAT']];
            for (const [key, inputId, tur] of belgeAlanlari) {
                try { kayit.belgeler[key] = await fdAracBekle(aracPdfYukle(inputId, plaka, tur, kayit.belgeler[key])); }
                catch (error) {
if(!fdAracGecerli())return;
 belgeHatalari.push(tur + ': ' + (error.message || error)); }
            }
            const onceki = araclar.slice();
            if (mevcut) araclar[araclar.findIndex(a => String(a.id) === String(mevcut.id))] = kayit; else araclar.push(kayit);
            yuklenenVeriler.add('araclar');
            try { await fdAracBekle(aracTekKaydiKaydet(kayit)); } catch (error) {
if(!fdAracGecerli())return;
 araclar = onceki; throw error; }
            aracFormunuKapat(); aracTumTakipListeleriniCiz();
            showToast(mevcut ? 'Araç kaydı güncellendi.' : 'Araç kaydı oluşturuldu.');
            if (belgeHatalari.length) showToast('Araç bilgileri kaydedildi; ancak şu dosyalar yüklenemedi:\n' + belgeHatalari.join('\n'), 'warning');
        } catch (error) {
if(!fdAracGecerli())return;
 alert('Araç kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata')); }
        finally {
if(fdAracGecerli()){
 hideGlobalOverlay(); fdAracFormMesgul(form,false); 
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function aracSil(id) {
try{
fdAracDogrula(true);

        const arac = araclar.find(a => aktifSirketeAit(a) && String(a.id) === String(id));
        if (!arac || !await fdAracBekle(fdYuzerOnaySor(`${arac.plaka} plakalı araç ve bütün bakım kayıtları silinsin mi?`))) return;
        showGlobalOverlay('Araç siliniyor', 'Kayıt ve bağlı Drive belgeleri kaldırılıyor...');
        const onceki=araclar.slice();let kayitSilindi=false;
        try {
            const belgeler = [arac.foto, ...Object.values(arac.belgeler || {}), ...(arac.bakimlar || []).flatMap(b => [b.belge,...(b.islemGorselleri||[])]), ...(arac.trafikCezalari || []).flatMap(c => [c.tutanakBelgesi,c.cezaFotografi,c.belge])].filter(b => b?.id);
            araclar = araclar.filter(a => a !== arac); yuklenenVeriler.add('araclar'); await fdAracBekle(aracVerileriniKaydet());kayitSilindi=true;
            const sonuc=await fdAracBekle(Promise.allSettled([...new Set(belgeler.map(b=>b.id))].map(id=>fdYazilimDrivePdfSil(id))));
            aracTumTakipListeleriniCiz();showToast(sonuc.some(s=>s.status==='rejected')?'Araç kaydı silindi; bazı Drive belgeleri kaldırılamadı.':'Araç kaydı silindi.',sonuc.some(s=>s.status==='rejected')?'warning':'success');
        } catch(error){
if(!fdAracGecerli())return;
if(!kayitSilindi)araclar=onceki;showToast('Araç silinemedi: '+(error.message||'Bilinmeyen hata'),'error');
        } finally {
if(fdAracGecerli()){
 hideGlobalOverlay(); 
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracSigortaModaliniAc(id, sadeceGecmis = false) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        document.getElementById('aracSigortaForm').reset();
        document.getElementById('aracPoliceKayitModu').value = 'yeni';
        document.getElementById('aracPoliceGecmisId').value = '';
        document.getElementById('aracSigortaKaydetBtn').textContent = '💾 Sigorta / Kasko Bilgilerini Kaydet';
        document.getElementById('aracSigortaForm').style.display = sadeceGecmis ? 'none' : 'block';
        document.getElementById('aracSigortaAracId').value = id;
        document.getElementById('aracSigortaModalBaslik').textContent = `🛡️ ${arac.plaka} · Sigorta ve Kasko`;
        aracSigortaGecmisiniCiz();
        document.getElementById('modalAracSigorta').style.display = 'flex';
    }

function aracSigortaModaliniKapat() {
fdAracDogrula(false);
 document.getElementById('modalAracSigorta').style.display = 'none'; }

function aracSigortaGecmisiniCiz() {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracSigortaAracId').value)); if (!arac) return;
        const mevcutlar = [];
        if (arac.sigortaSirketi || arac.sigortaPoliceNo || arac.sigortaBaslangic || arac.sigortaBitis) mevcutlar.push({ tur:'Trafik Sigortası', sirket:arac.sigortaSirketi, policeNo:arac.sigortaPoliceNo, bedel:arac.sigortaBedeli, baslangic:arac.sigortaBaslangic, bitis:arac.sigortaBitis, belge:arac.belgeler?.sigorta, guncel:true });
        if (arac.kaskoSirketi || arac.kaskoPoliceNo || arac.kaskoBaslangic || arac.kaskoBitis) mevcutlar.push({ tur:'Kasko', sirket:arac.kaskoSirketi, policeNo:arac.kaskoPoliceNo, bedel:arac.kaskoBedeli, baslangic:arac.kaskoBaslangic, bitis:arac.kaskoBitis, belge:arac.belgeler?.kasko, guncel:true });
        const liste = [...mevcutlar, ...(arac.sigortaGecmisi || [])].sort((a,b) => String(b.bitis || b.baslangic || '').localeCompare(String(a.bitis || a.baslangic || '')));
        document.getElementById('aracSigortaGecmisBody').innerHTML = liste.map(k => {
if(!fdAracGecerli())return;

            const turKodu = String(k.tur || '').toLocaleLowerCase('tr-TR').includes('kasko') ? 'kasko' : 'sigorta';
            const id = k.id || '';
            return `<tr><td>${escapeDashboardText(k.tur || '-')} ${k.guncel ? '<span class="badge" style="background:#dcfce7;color:#166534;">Güncel</span>' : ''}</td><td>${escapeDashboardText(k.sirket || '-')}</td><td>${escapeDashboardText(k.policeNo || '-')}</td><td>${k.bedel ? paraFormatla(k.bedel) : '-'}</td><td>${tarihFormati(k.baslangic)}</td><td>${tarihFormati(k.bitis)}</td><td>${k.belge?.url ? aracBelgeButonu(k.belge, k.tur || 'Poliçe') : '-'}</td><td><div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="aracPoliceDuzenle('${turKodu}','${id}',${k.guncel ? 'true' : 'false'})">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="aracPoliceSil('${turKodu}','${id}',${k.guncel ? 'true' : 'false'})">🗑️ Sil</button></div></td></tr>`;
        }).join('') || '<tr><td colspan="8" style="text-align:center;padding:22px;color:#64748b;">Poliçe kaydı bulunmuyor.</td></tr>';
    }

function aracPoliceDuzenle(tur, id = '', guncel = false) {
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracSigortaAracId').value)); if (!arac) return;
        const kayit = guncel ? (tur === 'kasko'
            ? {sirket:arac.kaskoSirketi,policeNo:arac.kaskoPoliceNo,bedel:arac.kaskoBedeli,baslangic:arac.kaskoBaslangic,bitis:arac.kaskoBitis}
            : {sirket:arac.sigortaSirketi,policeNo:arac.sigortaPoliceNo,bedel:arac.sigortaBedeli,baslangic:arac.sigortaBaslangic,bitis:arac.sigortaBitis})
            : (arac.sigortaGecmisi || []).find(p => String(p.id) === String(id));
        if (!kayit) return;
        document.getElementById('aracSigortaForm').reset(); document.getElementById('aracSigortaForm').style.display='block';
        document.getElementById('aracPoliceKayitModu').value = guncel ? `guncel_${tur}` : `gecmis_${tur}`;
        document.getElementById('aracPoliceGecmisId').value = id;
        document.getElementById('aracSigortaKaydetBtn').textContent = guncel ? '💾 Güncel Poliçeyi Güncelle' : '💾 Geçmiş Poliçeyi Güncelle';
        const onEk = tur === 'kasko' ? 'Kasko' : 'Sigorta';
        document.getElementById(`takip${onEk}Sirketi`).value=kayit.sirket||''; document.getElementById(`takip${onEk}PoliceNo`).value=kayit.policeNo||'';
        document.getElementById(`takip${onEk}Bedeli`).value=kayit.bedel?Number(kayit.bedel).toLocaleString('tr-TR',{maximumFractionDigits:2}):'';
        document.getElementById(`takip${onEk}Baslangic`).value=kayit.baslangic||''; document.getElementById(`takip${onEk}Bitis`).value=kayit.bitis||'';
        document.getElementById('aracSigortaForm').scrollIntoView({behavior:'smooth',block:'start'});
    }

async function aracPoliceSil(tur, id = '', guncel = false) {
try{
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracSigortaAracId').value)); if (!arac || !await fdAracBekle(fdYuzerOnaySor('Bu poliçe kaydı ve bağlı dosyası silinsin mi?'))) return;
        const oncekiArac = JSON.parse(JSON.stringify(arac));
        let belge=null;
        if (guncel) {
            belge=arac.belgeler?.[tur];
            if(tur==='kasko')Object.assign(arac,{kaskoSirketi:'',kaskoPoliceNo:'',kaskoBedeli:0,kaskoBaslangic:'',kaskoBitis:''});
            else Object.assign(arac,{sigortaSirketi:'',sigortaPoliceNo:'',sigortaBedeli:0,sigortaBaslangic:'',sigortaBitis:''});
            if(arac.belgeler)arac.belgeler[tur]=null;
        } else {
            const kayit=(arac.sigortaGecmisi||[]).find(p=>String(p.id)===String(id)); belge=kayit?.belge;
            arac.sigortaGecmisi=(arac.sigortaGecmisi||[]).filter(p=>String(p.id)!==String(id));
        }
        try {
            await fdAracBekle(aracTekKaydiKaydet(arac));
            if (belge?.id) fdYazilimDrivePdfSil(belge.id).catch(() => {
if(!fdAracGecerli())return;
});
            aracSigortaGecmisiniCiz(); aracTumTakipListeleriniCiz(); showToast('Poliçe kaydı silindi.');
        } catch(error) {
if(!fdAracGecerli())return;

            Object.keys(arac).forEach(k => delete arac[k]); Object.assign(arac, oncekiArac);
            alert('Poliçe silinemedi: '+(error.message||'Bilinmeyen hata'));
        }
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function aracSigortaKaydet(event) {
try{
fdAracDogrula(true);

        event.preventDefault();
        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracSigortaAracId').value)); if (!arac) return;
        const deger = id => document.getElementById(id).value;
        const kayitModu = document.getElementById('aracPoliceKayitModu').value || 'yeni';
        const gecmisId = document.getElementById('aracPoliceGecmisId').value || '';
        const yeniSigorta = { tur:'Trafik Sigortası', sirket:deger('takipSigortaSirketi'), policeNo:deger('takipSigortaPoliceNo'), bedel:paraMetniniSayiyaCevir(deger('takipSigortaBedeli')), baslangic:deger('takipSigortaBaslangic'), bitis:deger('takipSigortaBitis') };
        const yeniKasko = { tur:'Kasko', sirket:deger('takipKaskoSirketi'), policeNo:deger('takipKaskoPoliceNo'), bedel:paraMetniniSayiyaCevir(deger('takipKaskoBedeli')), baslangic:deger('takipKaskoBaslangic'), bitis:deger('takipKaskoBitis') };
        const eskiSigorta = { tur:'Trafik Sigortası', sirket:arac.sigortaSirketi || '', policeNo:arac.sigortaPoliceNo || '', bedel:Number(arac.sigortaBedeli || 0), baslangic:arac.sigortaBaslangic || '', bitis:arac.sigortaBitis || '', belge:arac.belgeler?.sigorta || null };
        const eskiKasko = { tur:'Kasko', sirket:arac.kaskoSirketi || '', policeNo:arac.kaskoPoliceNo || '', bedel:Number(arac.kaskoBedeli || 0), baslangic:arac.kaskoBaslangic || '', bitis:arac.kaskoBitis || '', belge:arac.belgeler?.kasko || null };
        const doluMu = kayit => ['sirket','policeNo','bedel','baslangic','bitis'].some(k => String(kayit[k] || '').trim());
        const oncekiArac = JSON.parse(JSON.stringify(arac));
        let silinecekEskiBelge = null;
        showGlobalOverlay('Poliçeler kaydediliyor', 'Poliçe bilgileri ve seçilen belgeler hazırlanıyor...');
        try {
            arac.belgeler ||= {};
            if (kayitModu.startsWith('gecmis_')) {
                const tur = kayitModu.endsWith('_kasko') ? 'kasko' : 'sigorta';
                const kayit = (arac.sigortaGecmisi || []).find(p => String(p.id) === String(gecmisId));
                if (!kayit) throw new Error('Düzenlenecek geçmiş poliçe kaydı bulunamadı.');
                const yeniKayit = tur === 'kasko' ? yeniKasko : yeniSigorta;
                if (!doluMu(yeniKayit)) throw new Error('Poliçe bilgilerini girin.');
                const dosyaAlani = tur === 'kasko' ? 'takipKaskoPdf' : 'takipSigortaPdf';
                const dosyaAdi = tur === 'kasko' ? 'KASKO POLİÇESİ' : 'TRAFİK SİGORTASI';
                let belge = kayit.belge || null;
                if (document.getElementById(dosyaAlani).files?.[0]) {
                    const yeniBelge = await fdAracBekle(aracPdfYukle(dosyaAlani, arac.plaka, `${dosyaAdi}_${yeniKayit.bitis || Date.now()}`, null));
                    silinecekEskiBelge = belge;
                    belge = yeniBelge;
                }
                Object.assign(kayit, yeniKayit, { belge });
            } else if (kayitModu.startsWith('guncel_')) {
                const tur = kayitModu.endsWith('_kasko') ? 'kasko' : 'sigorta';
                const yeniKayit = tur === 'kasko' ? yeniKasko : yeniSigorta;
                if (!doluMu(yeniKayit)) throw new Error('Poliçe bilgilerini girin.');
                const dosyaAlani = tur === 'kasko' ? 'takipKaskoPdf' : 'takipSigortaPdf';
                const dosyaAdi = tur === 'kasko' ? 'KASKO POLİÇESİ' : 'TRAFİK SİGORTASI';
                let belge = arac.belgeler?.[tur] || null;
                if (document.getElementById(dosyaAlani).files?.[0]) {
                    const yeniBelge = await fdAracBekle(aracPdfYukle(dosyaAlani, arac.plaka, `${dosyaAdi}_${yeniKayit.bitis || Date.now()}`, null));
                    silinecekEskiBelge = belge;
                    belge = yeniBelge;
                }
                if (tur === 'kasko') Object.assign(arac, { kaskoSirketi:yeniKayit.sirket, kaskoPoliceNo:yeniKayit.policeNo, kaskoBedeli:yeniKayit.bedel, kaskoBaslangic:yeniKayit.baslangic, kaskoBitis:yeniKayit.bitis });
                else Object.assign(arac, { sigortaSirketi:yeniKayit.sirket, sigortaPoliceNo:yeniKayit.policeNo, sigortaBedeli:yeniKayit.bedel, sigortaBaslangic:yeniKayit.baslangic, sigortaBitis:yeniKayit.bitis });
                arac.belgeler[tur] = belge;
            } else {
            const sigortaGirildi = doluMu(yeniSigorta) || Boolean(document.getElementById('takipSigortaPdf').files?.[0]);
            const kaskoGirildi = doluMu(yeniKasko) || Boolean(document.getElementById('takipKaskoPdf').files?.[0]);
            if (!sigortaGirildi && !kaskoGirildi) throw new Error('En az bir sigorta veya kasko bilgisi girin.');
            if (sigortaGirildi) {
                const yeniSigortaBelgesi = document.getElementById('takipSigortaPdf').files?.[0] ? await fdAracBekle(aracPdfYukle('takipSigortaPdf', arac.plaka, `TRAFİK SİGORTASI_${yeniSigorta.bitis || Date.now()}`, null)) : null;
                if (doluMu(eskiSigorta)) (arac.sigortaGecmisi ||= []).push({ ...eskiSigorta, id:`police_${Date.now()}_s` });
                Object.assign(arac, { sigortaSirketi:yeniSigorta.sirket, sigortaPoliceNo:yeniSigorta.policeNo, sigortaBedeli:yeniSigorta.bedel, sigortaBaslangic:yeniSigorta.baslangic, sigortaBitis:yeniSigorta.bitis });
                arac.belgeler.sigorta = yeniSigortaBelgesi;
            }
            if (kaskoGirildi) {
                const yeniKaskoBelgesi = document.getElementById('takipKaskoPdf').files?.[0] ? await fdAracBekle(aracPdfYukle('takipKaskoPdf', arac.plaka, `KASKO POLİÇESİ_${yeniKasko.bitis || Date.now()}`, null)) : null;
                if (doluMu(eskiKasko)) (arac.sigortaGecmisi ||= []).push({ ...eskiKasko, id:`police_${Date.now()}_k` });
                Object.assign(arac, { kaskoSirketi:yeniKasko.sirket, kaskoPoliceNo:yeniKasko.policeNo, kaskoBedeli:yeniKasko.bedel, kaskoBaslangic:yeniKasko.baslangic, kaskoBitis:yeniKasko.bitis });
                arac.belgeler.kasko = yeniKaskoBelgesi;
            }
            }
            yuklenenVeriler.add('araclar'); await fdAracBekle(aracTekKaydiKaydet(arac));
            if (silinecekEskiBelge?.id) fdYazilimDrivePdfSil(silinecekEskiBelge.id).catch(() => {
if(!fdAracGecerli())return;
});
            aracSigortaGecmisiniCiz(); aracTumTakipListeleriniCiz();
            document.getElementById('takipSigortaPdf').value = ''; document.getElementById('takipKaskoPdf').value = '';
            document.getElementById('aracPoliceKayitModu').value = 'yeni';
            document.getElementById('aracPoliceGecmisId').value = '';
            document.getElementById('aracSigortaKaydetBtn').textContent = '💾 Sigorta / Kasko Bilgilerini Kaydet';
            showToast(kayitModu === 'yeni' ? 'Sigorta ve kasko bilgileri kaydedildi.' : 'Poliçe kaydı güncellendi.');
        } catch (error) {
if(!fdAracGecerli())return;

            Object.keys(arac).forEach(k => delete arac[k]); Object.assign(arac, oncekiArac);
            alert('Poliçe kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
if(fdAracGecerli()){
 hideGlobalOverlay(); 
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracVizeModaliniAc(id, sadeceGecmis = false, aktifDuzenle = false) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        document.getElementById('aracVizeForm').reset();
        document.getElementById('aracVizeKayitModu').value = aktifDuzenle ? 'duzenle' : 'yeni';
        document.getElementById('aracVizeForm').dataset.kayitModu = aktifDuzenle ? 'duzenle' : 'yeni';
        document.getElementById('aracVizeKaydetBtn').textContent = aktifDuzenle ? '💾 Aktif Vize Bilgisini Güncelle' : '💾 Vize ve Egzoz Muayenesini Kaydet';
        if (aktifDuzenle) {
            document.getElementById('takipMuayeneTarihi').value = arac.muayeneTarihi || '';
            document.getElementById('takipMuayeneBitis').value = arac.muayeneBitis || '';
            document.getElementById('takipEgzozMuayeneTarihi').value = arac.egzozMuayeneTarihi || '';
            document.getElementById('takipEgzozMuayeneBitis').value = arac.egzozMuayeneBitis || '';
            document.getElementById('takipMuayeneDurumu').value = arac.muayeneDurumu === 'Geçti' ? 'Kusursuz Geçti' : (arac.muayeneDurumu || '');
            document.getElementById('takipMuayeneKusurlari').value = arac.muayeneKusurlari || '';
        }
        aracVizeDurumunaGoreKusurAlani();
        document.getElementById('aracVizeForm').style.display = sadeceGecmis ? 'none' : 'block';
        document.getElementById('aracVizeAracId').value = id;
        document.getElementById('aracVizeModalBaslik').textContent = `📅 ${arac.plaka} · Vize / Muayene Geçmişi`;
        aracVizeGecmisiniCiz();
        document.getElementById('modalAracVize').style.display = 'flex';
    }

function aracVizeDurumunaGoreKusurAlani() {
fdAracDogrula(false);

        const durum = document.getElementById('takipMuayeneDurumu')?.value || '';
        const alan = document.getElementById('takipMuayeneKusurlariAlani');
        const kusurlar = document.getElementById('takipMuayeneKusurlari');
        if (!alan || !kusurlar) return;
        const kusursuz = durum === 'Kusursuz Geçti';
        alan.style.display = kusursuz ? 'none' : 'block';
        if (kusursuz) kusurlar.value = '';
    }

function aracVizeGecmisKayitlari(arac) {
fdAracDogrula(false);

        const mevcut = arac.muayeneTarihi || arac.muayeneBitis || arac.egzozMuayeneTarihi || arac.egzozMuayeneBitis ? [{ tarih:arac.muayeneTarihi, bitis:arac.muayeneBitis, egzozTarihi:arac.egzozMuayeneTarihi, egzozBitis:arac.egzozMuayeneBitis, durum:arac.muayeneDurumu || '', kusurlar:arac.muayeneKusurlari || '', guncel:true }] : [];
        return [...mevcut, ...(arac.vizeGecmisi || [])].sort((a,b) => String(b.tarih || '').localeCompare(String(a.tarih || '')));
    }

function aracVizeKusurDetayAc(index) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracVizeAracId').value)); if (!arac) return;
        const kayit = aracVizeGecmisKayitlari(arac)[Number(index)]; if (!kayit) return;
        document.getElementById('aracVizeKusurDetayMetni').textContent = String(kayit.kusurlar || '-');
        document.getElementById('modalAracVizeKusurDetay').style.display = 'flex';
    }

function aracVizeGecmisiniCiz() {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracVizeAracId').value)); if (!arac) return;
        const liste = aracVizeGecmisKayitlari(arac);
        document.getElementById('aracVizeGecmisBody').innerHTML = liste.map((v,index) => {
if(!fdAracGecerli())return;

            const sonuc = v.durum === 'Geçti' ? 'Kusursuz Geçti' : (v.durum || '-');
            const sonucStil = sonuc === 'Kaldı' ? 'background:#fee2e2;color:#991b1b;' : sonuc === 'Hafif Kusurlu Geçti' ? 'background:#fef3c7;color:#92400e;' : 'background:#dcfce7;color:#166534;';
            const islemler = v.guncel ? `<button class="btn-modern btn-edit-modern" onclick="aracVizeModaliniAc('${arac.id}',false,true)">✏️ Düzenle</button>` : `<div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="aracVizeGecmisDuzenle('${v.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="aracVizeGecmisSil('${v.id}')">🗑️ Sil</button></div>`;
            const kusurVar = Boolean(String(v.kusurlar || '').trim());
            const kusurHucre = `<div class="arac-vize-kusur-hucre"><span class="arac-vize-kusur-ozet">${escapeDashboardText(v.kusurlar || '-')}</span>${kusurVar ? `<button type="button" class="btn-modern btn-detail-modern arac-vize-kusur-detay-btn" onclick="aracVizeKusurDetayAc(${index})">Detay</button>` : ''}</div>`;
            return `<tr><td>${tarihFormati(v.tarih)}</td><td>${tarihFormati(v.bitis)}</td><td>${tarihFormati(v.egzozTarihi)}</td><td>${tarihFormati(v.egzozBitis)}</td><td><span class="badge" style="${sonucStil}">${escapeDashboardText(sonuc)}</span></td><td>${kusurHucre}</td><td>${v.guncel ? '<span class="badge" style="background:#dbeafe;color:#1d4ed8;">Güncel</span>' : '<span class="badge" style="background:#e2e8f0;color:#475569;">Geçmiş</span>'}</td><td>${islemler}</td></tr>`;
        }).join('') || '<tr><td colspan="8" style="text-align:center;padding:22px;color:#64748b;">Vize geçmişi bulunmuyor.</td></tr>';
    }

function aracVizeGecmisDuzenle(id) {
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracVizeAracId').value));
        const kayit = arac?.vizeGecmisi?.find(v => String(v.id) === String(id)); if (!kayit) return;
        document.getElementById('aracVizeForm').style.display = 'block';
        document.getElementById('aracVizeKayitModu').value = 'gecmis_duzenle';
        document.getElementById('aracVizeForm').dataset.kayitModu = 'gecmis_duzenle';
        document.getElementById('aracVizeGecmisId').value = id;
        document.getElementById('takipMuayeneTarihi').value = kayit.tarih || '';
        document.getElementById('takipMuayeneBitis').value = kayit.bitis || '';
        document.getElementById('takipEgzozMuayeneTarihi').value = kayit.egzozTarihi || '';
        document.getElementById('takipEgzozMuayeneBitis').value = kayit.egzozBitis || '';
        document.getElementById('takipMuayeneDurumu').value = kayit.durum === 'Geçti' ? 'Kusursuz Geçti' : (kayit.durum || '');
        document.getElementById('takipMuayeneKusurlari').value = kayit.kusurlar || '';
        document.getElementById('aracVizeKaydetBtn').textContent = '💾 Geçmiş Vize Kaydını Güncelle';
        aracVizeDurumunaGoreKusurAlani();
        document.getElementById('aracVizeForm').scrollIntoView({behavior:'smooth',block:'start'});
    }

async function aracVizeGecmisSil(id) {
try{
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracVizeAracId').value)); if (!arac || !await fdAracBekle(fdYuzerOnaySor('Bu geçmiş vize kaydı silinsin mi?'))) return;
        const onceki = JSON.parse(JSON.stringify(arac.vizeGecmisi || []));
        arac.vizeGecmisi = (arac.vizeGecmisi || []).filter(v => String(v.id) !== String(id));
        try { await fdAracBekle(aracTekKaydiKaydet(arac)); aracVizeGecmisiniCiz(); aracTumTakipListeleriniCiz(); }
        catch (error) {
if(!fdAracGecerli())return;
 arac.vizeGecmisi = onceki; alert('Vize kaydı silinemedi: ' + (error.message || 'Bilinmeyen hata')); }
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function aracVizeKaydet(event) {
try{
fdAracDogrula(true);

        event.preventDefault();
        const form = event.currentTarget || document.getElementById('aracVizeForm');
        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracVizeAracId').value)); if (!arac) return;
        const tarih = document.getElementById('takipMuayeneTarihi').value;
        const bitis = document.getElementById('takipMuayeneBitis').value;
        const egzozTarihi = document.getElementById('takipEgzozMuayeneTarihi').value;
        const egzozBitis = document.getElementById('takipEgzozMuayeneBitis').value;
        if((tarih&&bitis&&bitis<tarih)||(egzozTarihi&&egzozBitis&&egzozBitis<egzozTarihi)){alert('Geçerlilik bitişi muayene tarihinden önce olamaz.');return;}
        const durum = document.getElementById('takipMuayeneDurumu').value;
        const kusurlar = durum === 'Kusursuz Geçti' ? '' : document.getElementById('takipMuayeneKusurlari').value;
        const kayitModu = document.getElementById('aracVizeForm').dataset.kayitModu || document.getElementById('aracVizeKayitModu').value || 'yeni';
        const oncekiArac=JSON.parse(JSON.stringify(arac));
        if (kayitModu === 'gecmis_duzenle') {
            const gecmis = (arac.vizeGecmisi || []).find(v => String(v.id) === String(document.getElementById('aracVizeGecmisId').value));
            if (!gecmis) { alert('Düzenlenecek geçmiş vize kaydı bulunamadı.'); return; }
            Object.assign(gecmis,{tarih,bitis,egzozTarihi,egzozBitis,durum,kusurlar});
        } else {
            if (kayitModu !== 'duzenle' && (arac.muayeneTarihi || arac.muayeneBitis || arac.egzozMuayeneTarihi || arac.egzozMuayeneBitis)) (arac.vizeGecmisi ||= []).push({ id:`vize_${Date.now()}`, tarih:arac.muayeneTarihi || '', bitis:arac.muayeneBitis || '', egzozTarihi:arac.egzozMuayeneTarihi || '', egzozBitis:arac.egzozMuayeneBitis || '', durum:arac.muayeneDurumu || '', kusurlar:arac.muayeneKusurlari || '' });
            arac.muayeneTarihi = tarih; arac.muayeneBitis = bitis; arac.egzozMuayeneTarihi = egzozTarihi; arac.egzozMuayeneBitis = egzozBitis; arac.muayeneDurumu = durum; arac.muayeneKusurlari = kusurlar;
        }
        yuklenenVeriler.add('araclar');
        try { await fdAracBekle(aracTekKaydiKaydet(arac)); aracVizeGecmisiniCiz(); aracTumTakipListeleriniCiz(); form?.reset(); if(form)form.dataset.kayitModu='yeni'; document.getElementById('aracVizeKayitModu').value='yeni'; aracVizeDurumunaGoreKusurAlani(); alert(kayitModu === 'duzenle' ? 'Aktif vize bilgisi güncellendi.' : kayitModu === 'gecmis_duzenle' ? 'Geçmiş vize kaydı güncellendi.' : 'Yeni vize bilgisi kaydedildi.'); }
        catch (error) {
if(!fdAracGecerli())return;
 Object.assign(arac,oncekiArac);alert('Vize bilgisi kaydedilemedi: ' + (error.message || 'Bilinmeyen hata')); }
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracExportModaliniAc(tur) {
fdAracDogrula(false);

        aracExportTuru = tur;
        document.getElementById('aracExportFields').innerHTML = ARAC_EXPORT_FIELDS.map(a => `<label class="remember-login" style="margin:0;padding:9px;border:1px solid #dce8f1;border-radius:8px;background:#fff;"><input type="checkbox" value="${a.key}" ${['plaka','tur','marka','model','modelYili','durum'].includes(a.key) ? 'checked' : ''}> ${a.label}</label>`).join('');
        document.getElementById('btnAracExportOnay').textContent = tur === 'pdf' ? 'PDF Oluştur' : 'Excel Oluştur';
        document.getElementById('modalAracExport').style.display = 'flex';
    }

function aracDisAktarimListesi() {
fdAracDogrula(false);

        return fdAracFiltreliListe();
    }

function aracSeciliAlanlariAktar() {
fdAracDogrula(false);

        const secilenler = [...document.querySelectorAll('#aracExportFields input:checked')].map(i => i.value);
        if (!secilenler.length) { alert('En az bir alan seçin.'); return; }
        const alanlar = ARAC_EXPORT_FIELDS.filter(a => secilenler.includes(a.key));
        const liste = aracDisAktarimListesi();
        const hucre = (arac, alan) => alan.date ? tarihFormati(arac[alan.key]) : alan.money ? paraFormatla(arac[alan.key]) : (arac[alan.key] ?? '');
        const satirlar = liste.map(a => alanlar.map(alan => hucre(a,alan)));
        const listeAdi = aracListeModu === 'aktif' ? 'AKTİF ARAÇLAR' : aracListeModu === 'satilan' ? 'SATILAN ARAÇLAR' : 'TÜM ARAÇLAR';
        document.getElementById('modalAracExport').style.display = 'none';
        if (aracExportTuru === 'excel') {
            const ws = XLSX.utils.aoa_to_sheet([alanlar.map(a=>a.label),...satirlar]); ws['!cols']=alanlar.map(a=>({wch:Math.max(14,a.label.length+3)}));
            const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Araçlar'); XLSX.writeFile(wb,`${listeAdi.replaceAll(' ','_')}.xlsx`); return;
        }
        if(!liste.length){alert('PDF için gösterilecek araç bulunmuyor.');return;}
        const alan=document.createElement('div');alan.innerHTML=`<table><thead><tr>${alanlar.map(a=>`<th>${escapeDashboardText(a.label)}</th>`).join('')}</tr></thead><tbody>${satirlar.map(s=>`<tr>${s.map(v=>`<td>${escapeDashboardText(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        return window.fdTabloPdfOnizle?.(alan.querySelector('table'),listeAdi,`${listeAdi.replaceAll(' ','_')}.pdf`,{yon:'landscape',format:alanlar.length>8?'a3':'a4',altBaslik:listeAdi});
    }

let fdBakimGorseller=[];
function fdBakimTaslagiTemizle(){
    for(const g of fdBakimGorseller) URL.revokeObjectURL(g.url);
    fdBakimGorseller=[];
    const alan=document.getElementById('aracBakimGorseller');if(alan)alan.replaceChildren();
}
function fdBakimGorselleriCiz(){
    const alan=document.getElementById('aracBakimGorseller');alan.replaceChildren();
    fdBakimGorseller.forEach((g,i)=>{const kutu=document.createElement('div');kutu.className='fd-bakim-gorsel';
        const img=document.createElement('img');img.src=g.url;img.alt=`İşlem görseli ${i+1}`;
        const sil=document.createElement('button');sil.type='button';sil.className='btn-modern btn-del-modern';sil.textContent='Kaldır';
        sil.onclick=()=>{fdAracDogrula(true);if(document.getElementById('aracBakimForm').dataset.saving==='1')return;URL.revokeObjectURL(g.url);fdBakimGorseller=fdBakimGorseller.filter(x=>x!==g);fdBakimGorselleriCiz()};
        kutu.append(img,sil);alan.append(kutu);
    });
    document.getElementById('aracBakimIslemler').required=fdBakimGorseller.length===0;
}
function fdBakimGorselEkle(files){
    fdAracDogrula(true);const form=document.getElementById('aracBakimForm');if(form.dataset.saving==='1'||form.style.display==='none')return;
    for(const file of files){
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)){showToast('Yalnızca PNG, JPG veya WEBP görseli ekleyebilirsiniz.','warning');continue}
        if(file.size>ayarSayisi('pdfAzamiMb',10)*1024*1024){showToast('Görsel dosyası azami boyutu aşıyor.','warning');continue}
        if(fdBakimGorseller.length>=10){showToast('Bir bakım kaydına en fazla 10 görsel ekleyebilirsiniz.','warning');break}
        fdBakimGorseller.push({file,url:URL.createObjectURL(file)});
    }
    fdBakimGorselleriCiz();
}
function fdBakimFormunuAc(){
    fdAracDogrula(true);const form=document.getElementById('aracBakimForm');if(form.dataset.saving==='1')return;
    fdBakimTaslagiTemizle();form.reset();form.style.display='block';document.getElementById('aracBakimYeni').style.display='none';
    const arac=araclar.find(a=>String(a.id)===String(document.getElementById('aracBakimAracId').value)&&aktifSirketeAit(a));if(!arac)return;
    document.getElementById('aracBakimTarihi').value=new Date().toISOString().slice(0,10);document.getElementById('aracBakimKm').value=Number(arac.km||0).toLocaleString('tr-TR');aracBakimVarsayilanlariniUygula(true);fdBakimGorselleriCiz();document.getElementById('aracBakimTarihi').focus();
}
function fdBakimGecmiseDon(){
    fdAracDogrula(false);const form=document.getElementById('aracBakimForm');if(form.dataset.saving==='1')return;
    fdBakimTaslagiTemizle();form.reset();document.getElementById('aracBakimIslemler').required=true;form.style.display='none';document.getElementById('aracBakimYeni').style.display=anaMenuModulYazmaYetkisiVar('arac')?'':'none';
}
function fdBakimFormunuBagla(){
    document.getElementById('aracBakimYeni').onclick=fdBakimFormunuAc;
    document.getElementById('aracBakimVazgec').onclick=fdBakimGecmiseDon;
    document.getElementById('aracBakimGorselSec').onchange=e=>{fdBakimGorselEkle([...e.target.files]);e.target.value=''};
    document.getElementById('aracBakimIslemler').onpaste=e=>{
        fdAracDogrula(true);const files=[...(e.clipboardData?.items||[])].filter(x=>x.kind==='file'&&x.type.startsWith('image/')).map(x=>x.getAsFile()).filter(Boolean);
        if(files.length){e.preventDefault();fdBakimGorselEkle(files)}
    };
}
function fdBakimIslemHtml(b){
    return escapeDashboardText(b.islemler||'-')+(b.islemGorselleri||[]).map((g,i)=>'<div>'+aracBelgeButonu(g,`İşlem Görseli ${i+1}`)+'</div>').join('');
}

function aracBakimModaliniAc(id) {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(id)); if (!arac) return;
        if(!aktifSirketeAit(arac)||document.getElementById('aracBakimForm').dataset.saving==='1')return;
        fdBakimFormunuBagla();fdBakimGecmiseDon();
        document.getElementById('aracBakimAracId').value = id;
        document.getElementById('aracBakimBaslik').textContent = `🔧 ${arac.plaka} · Bakım Geçmişi`;
        document.getElementById('aracBakimForm').reset();
        ['aracBakimGecmisArama','aracBakimGecmisTur','aracBakimGecmisBaslangic','aracBakimGecmisBitis'].forEach(alanId => {
if(!fdAracGecerli())return;
 const alan = document.getElementById(alanId); if (alan) alan.value = ''; });
        document.getElementById('aracBakimTarihi').value = new Date().toISOString().slice(0,10);
        document.getElementById('aracBakimKm').value = Number(arac.km || 0).toLocaleString('tr-TR');
        aracBakimVarsayilanlariniUygula(true);
        aracBakimListesiniCiz(); aracExportButonlariniKur(); document.getElementById('modalAracBakim').style.display = 'flex';
    }

function aracBakimModaliniKapat() {
fdAracDogrula(false);
 if(document.getElementById('aracBakimForm').dataset.saving==='1')return;fdBakimGecmiseDon();document.getElementById('modalAracBakim').style.display = 'none'; }

function aracBakimVarsayilanlariniUygula(zorla=false) {
fdAracDogrula(false);

        if(document.getElementById('aracBakimTuru')?.value!=='Periyodik Bakım')return;
        const tarih=document.getElementById('aracBakimTarihi')?.value,km=paraMetniniSayiyaCevir(document.getElementById('aracBakimKm')?.value),sonrakiTarih=document.getElementById('aracBakimSonrakiTarih'),sonrakiKm=document.getElementById('aracBakimSonrakiKm');
        if(tarih&&(zorla||!sonrakiTarih.value)){const d=new Date(`${tarih}T12:00:00`);d.setMonth(d.getMonth()+Math.round(ayarSayisi('aracBakimAyAraligi',12)));sonrakiTarih.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
        if(km>0&&(zorla||!sonrakiKm.value))sonrakiKm.value=(km+ayarSayisi('aracBakimKmAraligi',10000)).toLocaleString('tr-TR');
    }

function aracBakimListesiniCiz() {
fdAracDogrula(false);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracBakimAracId').value)); if (!arac) return;
        const arama = String(document.getElementById('aracBakimGecmisArama')?.value || '').toLocaleLowerCase('tr-TR');
        const tur = document.getElementById('aracBakimGecmisTur')?.value || '';
        const baslangic = document.getElementById('aracBakimGecmisBaslangic')?.value || '';
        const bitis = document.getElementById('aracBakimGecmisBitis')?.value || '';
        const liste = [...(arac.bakimlar || [])].filter(b => {
if(!fdAracGecerli())return;

            if (arama && ![b.tur,b.islemler,b.servis,b.faturaNo].join(' ').toLocaleLowerCase('tr-TR').includes(arama)) return false;
            if (tur && b.tur !== tur) return false;
            if (baslangic && String(b.tarih || '') < baslangic) return false;
            if (bitis && String(b.tarih || '') > bitis) return false;
            return true;
        }).sort((a,b) => String(b.tarih).localeCompare(String(a.tarih)));
        document.getElementById('aracBakimBody').innerHTML = liste.map(b => `<tr><td>${tarihFormati(b.tarih)}</td><td>${Number(b.km || 0).toLocaleString('tr-TR')}</td><td>${escapeDashboardText(b.tur || '-')}</td><td>${fdBakimIslemHtml(b)}</td><td>${escapeDashboardText(b.servis || '-')}</td><td>${escapeDashboardText(b.faturaNo || '-')}</td><td>${paraFormatla(b.tutar)}</td><td>${b.sonrakiTarih ? tarihFormati(b.sonrakiTarih) : '-'}${b.sonrakiKm ? `<br>${Number(b.sonrakiKm).toLocaleString('tr-TR')} KM` : ''}</td><td>${b.belge?.url ? aracBelgeButonu(b.belge, 'Bakım Belgesi') : '-'}</td><td><button class="btn-modern btn-del-modern" onclick="aracBakimSil('${b.id}')">🗑️ Sil</button></td></tr>`).join('') || '<tr><td colspan="10" style="text-align:center;padding:20px;color:#64748b;">Henüz bakım kaydı yok.</td></tr>';
    }

async function aracBakimKaydet(event) {
try{
fdAracDogrula(true);

        event.preventDefault(); const form = event.currentTarget || document.getElementById('aracBakimForm'); const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracBakimAracId').value)); if (!arac) return;
        if(!aktifSirketeAit(arac)||form?.dataset.saving==='1')return;
        fdAracFormMesgul(form,true);
        showGlobalOverlay('Bakım kaydediliyor', 'Bakım bilgileri ve belge aktarılıyor...');
        const yuklenenler=[];let kaydedildi=false;
        try {
            if(!document.getElementById('aracBakimIslemler').value.trim()&&!fdBakimGorseller.length)throw Error('Yapılan işlemleri yazın veya bir görsel ekleyin.');
            let belge = null; const dosya = document.getElementById('aracBakimPdf').files?.[0];
            if (dosya) { const base64 = await fdAracBekle(dosyayiBase64Oku(dosya)); const yuklenen = await fdAracBekle(fdYazilimDrivePdfYukle(base64, driveBelgeDosyaAdi(arac.plaka, 'ARAÇ TAKİP', `BAKIM_${document.getElementById('aracBakimTarihi').value}`), '', 'ARAÇ TAKİP')); belge = { id:yuklenen.id,url:yuklenen.url,ad:yuklenen.ad }; yuklenenler.push(belge); }
            const islemGorselleri=[];for(const [i,g] of fdBakimGorseller.entries()){const base64=await fdAracBekle(dosyayiBase64Oku(g.file)),ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[g.file.type];const uploaded=await fdAracBekle(fdYazilimDriveDosyaYukle(base64,aracPlakaAnahtari(arac.plaka)+'_BAKIM_'+Date.now()+'_'+i+'.'+ext,g.file.type,'','ARAÇ TAKİP'));const belge={id:uploaded.id,url:uploaded.url,ad:uploaded.ad};yuklenenler.push(belge);islemGorselleri.push(belge)}
            const bakim = { id:`bakim_${Date.now()}`, tarih:document.getElementById('aracBakimTarihi').value, km:paraMetniniSayiyaCevir(document.getElementById('aracBakimKm').value), tur:document.getElementById('aracBakimTuru').value, servis:document.getElementById('aracBakimServis').value, faturaNo:document.getElementById('aracBakimFaturaNo').value.trim(), islemGorselleri, tutar:paraMetniniSayiyaCevir(document.getElementById('aracBakimTutar').value), sonrakiTarih:document.getElementById('aracBakimSonrakiTarih').value, sonrakiKm:paraMetniniSayiyaCevir(document.getElementById('aracBakimSonrakiKm').value), islemler:document.getElementById('aracBakimIslemler').value, belge };
            const yeni={...arac,bakimlar:[...(arac.bakimlar||[]),bakim],km:Math.max(Number(arac.km||0),bakim.km)};
            if(!SUPABASE_MODE){const i=araclar.indexOf(arac);araclar[i]=yeni;try{await fdAracBekle(aracTekKaydiKaydet(yeni))}catch(error){
if(!fdAracGecerli())return;
araclar[i]=arac;throw error}}else await fdAracBekle(aracTekKaydiKaydet(yeni));
            kaydedildi=true;fdBakimTaslagiTemizle();form.dataset.saving='0';fdBakimGecmiseDon();document.getElementById('aracBakimTarihi').value = new Date().toISOString().slice(0,10); aracBakimListesiniCiz(); aracTumTakipListeleriniCiz();showToast('Bakım kaydı kaydedildi.','success');
        } catch (error) {
if(!fdAracGecerli())return;
 if(!kaydedildi)for(const b of yuklenenler)try{await fdAracBekle(fdYazilimDrivePdfSil(b.id))}catch(_){if(fdAracGecerli())showToast('Kaydedilemeyen eklerden biri Drive’da kalmış olabilir.','warning')}
 alert('Bakım kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata')); } finally {
if(fdAracGecerli()){
 hideGlobalOverlay();fdAracFormMesgul(form,false); 
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

async function aracBakimSil(id) {
try{
fdAracDogrula(true);

        const arac = araclar.find(a => String(a.id) === String(document.getElementById('aracBakimAracId').value)); const bakim = arac?.bakimlar?.find(b => String(b.id) === String(id)); if (!arac || !bakim || !await fdAracBekle(fdYuzerOnaySor('Bu bakım kaydı silinsin mi?'))) return;
        if(!aktifSirketeAit(arac))return;
        const yeni={...arac,bakimlar:arac.bakimlar.filter(b=>String(b.id)!==String(id))},i=araclar.indexOf(arac);
        try{if(!SUPABASE_MODE){araclar[i]=yeni;try{await fdAracBekle(aracTekKaydiKaydet(yeni))}catch(error){
if(!fdAracGecerli())return;
araclar[i]=arac;throw error}}else await fdAracBekle(aracTekKaydiKaydet(yeni));
            for(const belge of [bakim.belge,...(bakim.islemGorselleri||[])].filter(b=>b?.id))try{await fdAracBekle(fdYazilimDrivePdfSil(belge.id))}catch(error){
if(!fdAracGecerli())return;
showToast('Bakım silindi, Drive belgesi kaldırılamadı.','warning')}
            aracBakimListesiniCiz();aracTumTakipListeleriniCiz();
        }catch(error){
if(!fdAracGecerli())return;
showToast('Bakım silinemedi: '+(error.message||'Bilinmeyen hata'),'error')}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracMtvYillariniDoldur() {
fdAracDogrula(false);

        const select = document.getElementById('aracMtvYil'); if (!select) return; const secili = select.value; const yil = new Date().getFullYear();
        select.innerHTML = Array.from({length:9}, (_,i) => yil - 5 + i).map(y => `<option value="${y}">${y}</option>`).join(''); select.value = secili || String(yil);
    }

function aracMtvSablonuIndir() {
fdAracDogrula(false);

        const yil = Number(document.getElementById('aracMtvYil').value || new Date().getFullYear());
        const satirlar = [['Plaka','Yıl','Taksit','Ödeme Tarihi','Tutar (TL)','Referans No']];
        araclar.filter(a => aktifSirketeAit(a) && a.durum !== 'Satıldı' && aracMtvTakipliMi(a)).forEach(a => {
if(!fdAracGecerli())return;
 satirlar.push([a.plaka,yil,1,'','', '']); satirlar.push([a.plaka,yil,2,'','', '']); });
        const ws = XLSX.utils.aoa_to_sheet(satirlar); ws['!cols']=[{wch:16},{wch:10},{wch:10},{wch:18},{wch:16},{wch:24}]; const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'MTV Ödemeleri'); XLSX.writeFile(wb,`MTV_ODEME_LISTESI_${yil}.xlsx`);
    }

async function aracMtvExcelYukle(input) {
try{
fdAracDogrula(true);

        const dosya=input.files?.[0]; if(!dosya)return;
        if(input.dataset.saving==='1')return;input.dataset.saving='1';const onceki=JSON.parse(JSON.stringify(araclar));
        showGlobalOverlay('MTV ödemeleri aktarılıyor','Plakalar ve ödeme kayıtları kontrol ediliyor...');
        try {
            const wb=XLSX.read(await fdAracBekle(dosya.arrayBuffer()),{type:'array',cellDates:true}); const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
            let eslesen=0, hatali=0; const kullanilan=new Set();
            rows.forEach((row,index) => {
if(!fdAracGecerli())return;

                const al=(...adlar)=>{
if(!fdAracGecerli())return;
 const key=Object.keys(row).find(k=>adlar.includes(personelExcelBasliginiNormallestir(k))); return key ? row[key] : ''; };
                const plaka=String(al('plaka')).trim(); const arac=araclar.find(a=>aktifSirketeAit(a)&&aracMtvTakipliMi(a)&&aracPlakaAnahtari(a.plaka)===aracPlakaAnahtari(plaka));
                const yil=Number(al('yil')||document.getElementById('aracMtvYil').value); let taksit=Number(al('taksit')); const tarih=personelExcelTarihiniCoz(al('odemetarihi','tarih')); const tutar=paraMetniniSayiyaCevir(al('tutartl','tutar')); const referans=String(al('referansno','referans'));
                if(!taksit&&tarih)taksit=Number(tarih.slice(5,7))<=1?1:2;
                const anahtar=`${arac?.id}|${yil}|${taksit}`; if(!arac||![1,2].includes(taksit)||!tarih||!(tutar>0)||kullanilan.has(anahtar)){hatali++;return;} kullanilan.add(anahtar);
                const kayit={id:`mtv_${yil}_${taksit}`,yil,taksit,odemeTarihi:tarih,tutar,referans,kaynakDosya:dosya.name};
                arac.mtvOdemeleri ||= []; const eskiIndex=arac.mtvOdemeleri.findIndex(o=>Number(o.yil)===yil&&Number(o.taksit)===taksit); if(eskiIndex>=0)arac.mtvOdemeleri[eskiIndex]=kayit;else arac.mtvOdemeleri.push(kayit); eslesen++;
            });
            if(!eslesen)throw new Error('Plaka, taksit, ödeme tarihi ve tutarı eşleşen kayıt bulunamadı.'); yuklenenVeriler.add('araclar'); await fdAracBekle(aracVerileriniKaydet()); aracTumTakipListeleriniCiz(); alert(`${eslesen} MTV ödemesi işlendi.${hatali?`\n${hatali} satır eşleşmedi veya eksikti.`:''}`);
        } catch(error){
if(!fdAracGecerli())return;
araclar=onceki;alert('MTV ödeme listesi aktarılamadı: '+(error.message||'Bilinmeyen hata'));} finally{
if(fdAracGecerli()){
input.value='';input.dataset.saving='0';hideGlobalOverlay();
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracTakipGorunumunuGoster() {
fdAracDogrula(false);

        if(typeof fdTumUygulamaAlanlariniGizle==='function')fdTumUygulamaAlanlariniGizle();
        else ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','ayarlarApp','vardiyaApp','magicpassApp','irsaliyeTakipApp','kiraTakipApp','ihracatApp','policeTakipApp','workCenterApp'].forEach(id=>{
if(!fdAracGecerli())return;
const el=document.getElementById(id);if(el)el.style.display='none';});
        ['evrakTakipApp','tapuTakipApp','insaatFiyatApp','varlikKisileriApp'].forEach(id=>{
if(!fdAracGecerli())return;
const el=document.getElementById(id);if(el)el.style.display='none';});
        const app=document.getElementById('aracTakipApp');if(app)app.style.display='block';
    }

async function openAracTakipApp(event = null) {
if(fdVehiclePages)return fdVehiclePages.open(event);
try{
fdAracDogrula(false);

        event?.preventDefault?.(); event?.stopPropagation?.();
        if (!anaMenuModulErisimiVar('arac')) return;
        const istekNo=++aracAcmaIstegi;
        anaMenuDonusButonunuGoster(); icraEkraniniKapat();
        aracTakipGorunumunuGoster(); aracListeModu = 'aktif'; const ozetAlani=document.getElementById('aracTurOzetAlani');if(ozetAlani)ozetAlani.style.display='block'; document.querySelectorAll('#arac-tab-araclar .module-subnav button').forEach(b => b.classList.toggle('active', b.id === 'btnAracAktif')); document.querySelectorAll('#aracAnaSekmeler button').forEach((b,i) => b.classList.toggle('active', i === 0)); document.querySelectorAll('#aracTakipApp .tab-content').forEach(tab => tab.classList.toggle('active', tab.id === 'arac-tab-araclar')); aracMtvYillariniDoldur(); aracSecimleriniDoldur(); aracTumTakipListeleriniCiz(); aracExportButonlariniKur();
        showGlobalOverlay('Araç kayıtları yükleniyor','Araç kartları ve takip tarihleri hazırlanıyor...');
        try { await fdAracBekle(supabaseVerileriniYukle('arac')); if(istekNo===aracAcmaIstegi){aracTakipGorunumunuGoster();aracTumTakipListeleriniCiz();} } catch(error) {
if(!fdAracGecerli())return;
 showToast('Araç kayıtları yenilenemedi; mevcut kayıtlar gösteriliyor.','warning'); } finally {
if(fdAracGecerli()){
 if(istekNo===aracAcmaIstegi){aracTakipGorunumunuGoster();hideGlobalOverlay();} 
}
}
    
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}

function aracSahibiFiltreleriniDoldur(liste){
fdAracDogrula(false);

        const secim=document.getElementById('aracSahibiFiltre');if(!secim)return;
        const onceki=String(secim.value||''),sahipler=[...new Set((liste||[]).map(a=>String(a.aracSahibi||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        secim.innerHTML='<option value="">Tüm Araç Sahipleri</option>'+sahipler.map(ad=>'<option value="'+escapeDashboardText(ad)+'">'+escapeDashboardText(ad)+'</option>').join('');
        if(sahipler.includes(onceki))secim.value=onceki;
    }
function fdAracFormMesgul(form,mesgul){
fdAracDogrula(false);

    if(!form)return;form.dataset.saving=mesgul?'1':'0';form.setAttribute('aria-busy',String(mesgul));
    form.querySelectorAll('button[type="submit"],button:not([type])').forEach(b=>{
if(!fdAracGecerli())return;
if(mesgul){b.dataset.fdEskiMetin=b.textContent;b.dataset.fdEskiDisabled=String(b.disabled);b.disabled=true;b.textContent='Kaydediliyor…'}else if('fdEskiMetin'in b.dataset){b.textContent=b.dataset.fdEskiMetin;b.disabled=b.dataset.fdEskiDisabled==='true';delete b.dataset.fdEskiMetin;delete b.dataset.fdEskiDisabled}});
}

function fdAracNormalize(v){
fdAracDogrula(false);
return String(v||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}

function fdAracSatilmis(a){
fdAracDogrula(false);
return a.durum==='Satıldı'||Boolean(a.satisTarihi)}

function fdAracSonBakim(a){
fdAracDogrula(false);
return (Array.isArray(a.bakimlar)?a.bakimlar:[]).slice().sort((x,y)=>String(y.tarih||'').localeCompare(String(x.tarih||'')))[0]}

function fdAracTakipleri(a){
fdAracDogrula(false);

    if(fdAracSatilmis(a))return[];
    const sonuc=[],ekle=(ad,tarih,zorunlu=false)=>{
if(!fdAracGecerli())return;
if(!tarih&&!zorunlu)return;const d=aracTarihDurumu(tarih);sonuc.push({...d,ad,tarih})};
    if(aracSigortaTakipliMi(a)){
        const policeler=policeGuncelAracPoliceleri(a),sigorta=policeler.find(p=>policeGuncelTurAnahtari(p.tur)==='TRAFIK'),kasko=policeler.find(p=>policeGuncelTurAnahtari(p.tur)==='KASKO');
        const policeEkle=(ad,p,tarih,zorunlu=false)=>{
if(!fdAracGecerli())return;
const d=p?policeDurumu(p):null;if(d?.tur==='planli'){sonuc.push({ad,tur:'yaklasan',metin:d.metin,tarih:p.baslangic,gun:Math.ceil((new Date(p.baslangic+'T12:00:00')-new Date(bugununYerelTarihi()+'T12:00:00'))/86400000)});return;}ekle(ad,p?p.bitis:tarih,zorunlu);};
        policeEkle('Sigorta',sigorta,a.sigortaBitis,true);policeEkle('Kasko',kasko,a.kaskoBitis);
    }
    if(aracVizeTakipliMi(a)){ekle('Muayene',a.muayeneBitis,true);ekle('Egzoz',a.egzozMuayeneBitis)}
    const bakim=fdAracSonBakim(a);ekle('Bakım',bakim?.sonrakiTarih);
    if(Number(bakim?.sonrakiKm)>0&&Number(a.km)>=Number(bakim.sonrakiKm))sonuc.push({ad:'Bakım KM',tur:'gecen',gun:-1,metin:Number(a.km-bakim.sonrakiKm).toLocaleString('tr-TR')+' KM sınır aşıldı'});
    if(aracMtvTakipliMi(a)){const yil=new Date().getFullYear();[1,2].forEach(t=>{
if(!fdAracGecerli())return;
if(!aracMtvKaydi(a,yil,t))ekle('MTV '+t+'. taksit',yil+'-'+(t===1?'01-31':'07-31'))})}
    return sonuc.sort((x,y)=>({gecen:0,yaklasan:1,yok:2,normal:3}[x.tur]-{gecen:0,yaklasan:1,yok:2,normal:3}[y.tur])||(x.gun??99999)-(y.gun??99999));
}

function fdAracKritikDurum(a){
fdAracDogrula(false);
const d=fdAracTakipleri(a);return d.some(x=>x.tur==='gecen')?'gecen':d.some(x=>x.tur==='yaklasan')?'yaklasan':d.some(x=>x.tur==='yok')?'eksik':'normal'}

function fdAracFiltreliListe(){
fdAracDogrula(false);

    const value=id=>document.getElementById(id)?.value||'',arama=fdAracNormalize(value('aracArama')),sahip=value('aracSahibiFiltre'),durum=value('aracDurumFiltre'),uyari=value('aracUyariFiltre'),tur=value('fdAracTurFiltre'),sube=value('fdAracSubeFiltre');
    return araclar.filter(aktifSirketeAit).filter(a=>{
if(!fdAracGecerli())return;

        if(aracListeModu==='aktif'&&fdAracSatilmis(a)||aracListeModu==='satilan'&&!fdAracSatilmis(a))return false;
        const p=personeller.find(p=>aktifSirketeAit(p)&&String(p.id)===String(a.personelId)),text=fdAracNormalize([a.plaka,a.aracSahibi,a.marka,a.model,a.sasiNo,a.motorNo,a.sube,p?.ad,a.tur].join(' '));
        return(!arama||(text.includes(arama)||fdAracNormalize(a.plaka).replace(/\s/g,'').includes(arama.replace(/\s/g,''))))&&(!sahip||String(a.aracSahibi||'').trim()===sahip)&&(!durum||(fdAracSatilmis(a)?'Satıldı':a.durum||'Aktif')===durum)&&(!uyari||fdAracKritikDurum(a)===uyari)&&(!tur||a.tur===tur)&&(!sube||a.sube===sube);
    }).sort((a,b)=>String(a.plaka||'').localeCompare(String(b.plaka||''),'tr'));
}

function fdAracSelectDoldur(id,alan,baslik){
fdAracDogrula(false);
const el=document.getElementById(id);if(!el)return;const v=el.value,values=[...new Set(araclar.filter(aktifSirketeAit).map(a=>String(a[alan]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));el.innerHTML='<option value="">'+baslik+'</option>'+values.map(x=>'<option value="'+escapeDashboardText(x)+'">'+escapeDashboardText(x)+'</option>').join('');el.value=values.includes(v)?v:''}

function fdAracFiltreTemizle(){
fdAracDogrula(false);
['aracArama','aracSahibiFiltre','aracDurumFiltre','aracUyariFiltre','fdAracTurFiltre','fdAracSubeFiltre'].forEach(id=>{
if(!fdAracGecerli())return;
const el=document.getElementById(id);if(el)el.value=''});aracListesiniCiz()}

function fdAracOzetFiltre(tur){
fdAracDogrula(false);
fdAracFiltreTemizle();aracListeModu=tur==='satilan'?'satilan':tur==='tumu'?'tumu':'aktif';if(['gecen','yaklasan','eksik'].includes(tur))document.getElementById('aracUyariFiltre').value=tur;if(tur==='servis')document.getElementById('aracDurumFiltre').value='Serviste';document.querySelectorAll('#arac-tab-araclar .module-subnav button[onclick*="aracListeModunuDegistir"]').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick').includes("'"+aracListeModu+"'")));aracListesiniCiz()}

function fdAracTakipHtml(a){
fdAracDogrula(false);
if(fdAracSatilmis(a))return'<span class="fd-arac-alt">Satış: '+escapeDashboardText(tarihFormati(a.satisTarihi))+'</span>';const d=fdAracTakipleri(a).filter(x=>x.tur!=='normal');if(!d.length)return'<span class="fd-arac-alt">Takip tarihleri uygun</span>';return d.slice(0,2).map(x=>'<span class="fd-arac-uyari '+x.tur+'">'+escapeDashboardText(x.ad+' · '+x.metin)+'</span>').join('')+(d.length>2?'<span class="fd-arac-alt">+'+(d.length-2)+' işlem · detayda</span>':'')}

function fdAracListeCiz(){
fdAracDogrula(false);

    const body=document.getElementById('aracTakipBody');if(!body)return;
    fdAracSelectDoldur('aracSahibiFiltre','aracSahibi','Tüm araç sahipleri');fdAracSelectDoldur('fdAracTurFiltre','tur','Tüm araç türleri');fdAracSelectDoldur('fdAracSubeFiltre','sube','Tüm şubeler');
    const liste=fdAracFiltreliListe(),esc=escapeDashboardText;
    const idAttr=a=>esc(JSON.stringify(String(a.id))),islem=(fn,a)=>esc(fn+'('+JSON.stringify(String(a.id))+')');
    body.innerHTML=liste.map((a,i)=>{
if(!fdAracGecerli())return;
const p=personeller.find(p=>aktifSirketeAit(p)&&String(p.id)===String(a.personelId));return'<tr><td>'+(i+1)+'</td><td><button type="button" class="fd-table-cell-link" onclick="'+islem('aracDetayModaliniAc',a)+'">'+esc(a.plaka||'-')+'</button></td><td>'+esc([a.marka,a.model].filter(Boolean).join(' ')||'-')+'<small class="fd-arac-alt">'+esc([a.tur,a.modelYili].filter(Boolean).join(' · '))+'</small></td><td>'+esc(a.aracSahibi||'-')+'<small class="fd-arac-alt">'+esc(a.sube||'Şube belirtilmemiş')+'</small></td><td>'+esc(p?.ad||'Atanmamış')+'<small class="fd-arac-alt">'+(Number(a.km)?Number(a.km).toLocaleString('tr-TR')+' KM':'')+'</small></td><td>'+fdAracTakipHtml(a)+'</td><td><span class="fd-arac-durum '+(a.durum==='Serviste'?'servis':fdAracSatilmis(a)||a.durum==='Pasif'?'pasif':'')+'">'+esc(fdAracSatilmis(a)?'Satıldı':a.durum||'Aktif')+'</span></td><td><div class="action-btns"><button type="button" class="btn-modern btn-detail-modern" onclick="'+islem('aracDetayModaliniAc',a)+'">Detay</button><button type="button" class="btn-modern btn-edit-modern" onclick="'+islem('aracFormunuAc',a)+'" title="Aracı düzenle" aria-label="'+esc(a.plaka+' düzenle')+'">✎</button><button type="button" class="btn-modern fd-arac-sil" onclick="'+islem('aracSil',a)+'" title="Aracı sil" aria-label="'+esc(a.plaka+' sil')+'">🗑</button></div></td></tr>'}).join('')||'<tr><td colspan="8" style="padding:28px;text-align:center">Filtreye uygun araç bulunmuyor.</td></tr>';
    const mobil=document.getElementById('aracMobilKartlar');if(mobil)mobil.innerHTML=liste.map(a=>{
if(!fdAracGecerli())return;
const p=personeller.find(p=>aktifSirketeAit(p)&&String(p.id)===String(a.personelId));return'<article class="arac-mobil-kart"><div class="arac-mobil-kart-ust"><button type="button" class="arac-mobil-plaka" onclick="'+islem('aracDetayModaliniAc',a)+'">'+esc(a.plaka)+'</button><span class="fd-arac-durum">'+esc(fdAracSatilmis(a)?'Satıldı':a.durum||'Aktif')+'</span></div><strong>'+esc([a.marka,a.model].filter(Boolean).join(' '))+'</strong><small class="fd-arac-alt">'+esc([a.tur,a.modelYili].filter(Boolean).join(' · '))+'</small><dl><div><dt>Araç sahibi</dt><dd>'+esc(a.aracSahibi||'-')+'</dd></div><div><dt>Şube</dt><dd>'+esc(a.sube||'-')+'</dd></div><div><dt>Kullanan</dt><dd>'+esc(p?.ad||'Atanmamış')+'</dd></div></dl><div class="fd-arac-kart-takip">'+fdAracTakipHtml(a)+'</div><div class="arac-mobil-islemler"><button type="button" class="btn-modern btn-detail-modern" onclick="'+islem('aracDetayModaliniAc',a)+'">Detay</button><button type="button" class="btn-modern btn-edit-modern" onclick="'+islem('aracFormunuAc',a)+'">Düzenle</button></div></article>'}).join('')||'<div class="dashboard-empty">Filtreye uygun araç bulunmuyor.</div>';
    const meta=document.getElementById('fdAracListeMeta');if(meta)meta.innerHTML='<span>'+liste.length+' araç gösteriliyor · '+araclar.filter(aktifSirketeAit).length+' kayıt</span><span>Plakaya basarak araç detayını açabilirsiniz.</span>';
    const tum=araclar.filter(aktifSirketeAit),aktif=tum.filter(a=>!fdAracSatilmis(a)),stats=[['tumu','Tüm araçlar',tum.length],['aktif','Filo / satılmamış',aktif.length],['servis','Serviste',aktif.filter(a=>a.durum==='Serviste').length],['gecen','Süresi geçen',aktif.filter(a=>fdAracKritikDurum(a)==='gecen').length],['yaklasan','Yaklaşan işlemler',aktif.filter(a=>fdAracKritikDurum(a)==='yaklasan').length],['satilan','Satılan araçlar',tum.length-aktif.length]];
    document.getElementById('aracTurOzetleri').innerHTML=stats.map(([tur,ad,n])=>'<button type="button" class="fd-arac-stat" data-tur="'+tur+'" onclick="fdAracOzetFiltre(\''+tur+'\')"><span>'+ad+'</span><strong>'+n+'</strong></button>').join('');
}
const fdAracBindings={get aracEnKritikDurum(){return aracEnKritikDurum},set aracEnKritikDurum(v){aracEnKritikDurum=v},get aracMtvOzetHtml(){return aracMtvOzetHtml},set aracMtvOzetHtml(v){aracMtvOzetHtml=v},get aracBelgeButonu(){return aracBelgeButonu},set aracBelgeButonu(v){aracBelgeButonu=v},get aracRuhsatAc(){return aracRuhsatAc},set aracRuhsatAc(v){aracRuhsatAc=v},get aracBelgeMerkeziniAc(){return aracBelgeMerkeziniAc},set aracBelgeMerkeziniAc(v){aracBelgeMerkeziniAc=v},get aracDetayBilgiAlani(){return aracDetayBilgiAlani},set aracDetayBilgiAlani(v){aracDetayBilgiAlani=v},get aracAlisSatisDetayAlani(){return aracAlisSatisDetayAlani},set aracAlisSatisDetayAlani(v){aracAlisSatisDetayAlani=v},get aracDetayTablosu(){return aracDetayTablosu},set aracDetayTablosu(v){aracDetayTablosu=v},get aracDetayModaliniAc(){return aracDetayModaliniAc},set aracDetayModaliniAc(v){aracDetayModaliniAc=v},get aracDetaySekmeDegistir(){return aracDetaySekmeDegistir},set aracDetaySekmeDegistir(v){aracDetaySekmeDegistir=v},get aracDetayModaliniKapat(){return aracDetayModaliniKapat},set aracDetayModaliniKapat(v){aracDetayModaliniKapat=v},get aracExportButonlariniKur(){return aracExportButonlariniKur},set aracExportButonlariniKur(v){aracExportButonlariniKur=v},get aracFotoGosterimUrl(){return aracFotoGosterimUrl},set aracFotoGosterimUrl(v){aracFotoGosterimUrl=v},get aracFotoOnizlemesiniGoster(){return aracFotoOnizlemesiniGoster},set aracFotoOnizlemesiniGoster(v){aracFotoOnizlemesiniGoster=v},get aracFotoSecildi(){return aracFotoSecildi},set aracFotoSecildi(v){aracFotoSecildi=v},get aracRuhsatDurumMesaji(){return aracRuhsatDurumMesaji},set aracRuhsatDurumMesaji(v){aracRuhsatDurumMesaji=v},get aracRuhsatAlanlariniBul(){return aracRuhsatAlanlariniBul},set aracRuhsatAlanlariniBul(v){aracRuhsatAlanlariniBul=v},get aracRuhsatOcrKelimeleriniAl(){return aracRuhsatOcrKelimeleriniAl},set aracRuhsatOcrKelimeleriniAl(v){aracRuhsatOcrKelimeleriniAl=v},get aracRuhsatAlanlariniKonumdanBul(){return aracRuhsatAlanlariniKonumdanBul},set aracRuhsatAlanlariniKonumdanBul(v){aracRuhsatAlanlariniKonumdanBul=v},get aracRuhsatAlanlariniFormaYaz(){return aracRuhsatAlanlariniFormaYaz},set aracRuhsatAlanlariniFormaYaz(v){aracRuhsatAlanlariniFormaYaz=v},get aracRuhsatDosyasiSecildi(){return aracRuhsatDosyasiSecildi},set aracRuhsatDosyasiSecildi(v){aracRuhsatDosyasiSecildi=v},get aracListesiniCiz(){return aracListesiniCiz},set aracListesiniCiz(v){aracListesiniCiz=v},get aracTurOzetleriniCiz(){return aracTurOzetleriniCiz},set aracTurOzetleriniCiz(v){aracTurOzetleriniCiz=v},get aracAnaSekmeDegistir(){return aracAnaSekmeDegistir},set aracAnaSekmeDegistir(v){aracAnaSekmeDegistir=v},get aracTakipTarihRozeti(){return aracTakipTarihRozeti},set aracTakipTarihRozeti(v){aracTakipTarihRozeti=v},get akaryakitSecimleriniDoldur(){return akaryakitSecimleriniDoldur},set akaryakitSecimleriniDoldur(v){akaryakitSecimleriniDoldur=v},get akaryakitAracSecenekleri(){return akaryakitAracSecenekleri},set akaryakitAracSecenekleri(v){akaryakitAracSecenekleri=v},get akaryakitDepoSecenekleri(){return akaryakitDepoSecenekleri},set akaryakitDepoSecenekleri(v){akaryakitDepoSecenekleri=v},get akaryakitTopluTaslakAnahtari(){return akaryakitTopluTaslakAnahtari},set akaryakitTopluTaslakAnahtari(v){akaryakitTopluTaslakAnahtari=v},get akaryakitYeniKayitId(){return akaryakitYeniKayitId},set akaryakitYeniKayitId(v){akaryakitYeniKayitId=v},get akaryakitTopluTaslakSatirlari(){return akaryakitTopluTaslakSatirlari},set akaryakitTopluTaslakSatirlari(v){akaryakitTopluTaslakSatirlari=v},get akaryakitTopluTaslagiKaydet(){return akaryakitTopluTaslagiKaydet},set akaryakitTopluTaslagiKaydet(v){akaryakitTopluTaslagiKaydet=v},get akaryakitTopluTaslagiSil(){return akaryakitTopluTaslagiSil},set akaryakitTopluTaslagiSil(v){akaryakitTopluTaslagiSil=v},get akaryakitTopluTaslagiYukle(){return akaryakitTopluTaslagiYukle},set akaryakitTopluTaslagiYukle(v){akaryakitTopluTaslagiYukle=v},get akaryakitTopluSatirEkle(){return akaryakitTopluSatirEkle},set akaryakitTopluSatirEkle(v){akaryakitTopluSatirEkle=v},get akaryakitTopluSatirNumarala(){return akaryakitTopluSatirNumarala},set akaryakitTopluSatirNumarala(v){akaryakitTopluSatirNumarala=v},get akaryakitHucreIciTamamlamaKaynagi(){return akaryakitHucreIciTamamlamaKaynagi},set akaryakitHucreIciTamamlamaKaynagi(v){akaryakitHucreIciTamamlamaKaynagi=v},get akaryakitHucreIciTamamla(){return akaryakitHucreIciTamamla},set akaryakitHucreIciTamamla(v){akaryakitHucreIciTamamla=v},get akaryakitSonAlandaTab(){return akaryakitSonAlandaTab},set akaryakitSonAlandaTab(v){akaryakitSonAlandaTab=v},get akaryakitPlakadanAracBul(){return akaryakitPlakadanAracBul},set akaryakitPlakadanAracBul(v){akaryakitPlakadanAracBul=v},get akaryakitAyniCikisKaydiMi(){return akaryakitAyniCikisKaydiMi},set akaryakitAyniCikisKaydiMi(v){akaryakitAyniCikisKaydiMi=v},get akaryakitKayitlariniDogrula(){return akaryakitKayitlariniDogrula},set akaryakitKayitlariniDogrula(v){akaryakitKayitlariniDogrula=v},get akaryakitKayitlariniKaydet(){return akaryakitKayitlariniKaydet},set akaryakitKayitlariniKaydet(v){akaryakitKayitlariniKaydet=v},get akaryakitFormunuAc(){return akaryakitFormunuAc},set akaryakitFormunuAc(v){akaryakitFormunuAc=v},get akaryakitDuzenle(){return akaryakitDuzenle},set akaryakitDuzenle(v){akaryakitDuzenle=v},get akaryakitKaydet(){return akaryakitKaydet},set akaryakitKaydet(v){akaryakitKaydet=v},get akaryakitAyDegistir(){return akaryakitAyDegistir},set akaryakitAyDegistir(v){akaryakitAyDegistir=v},get akaryakitFiltrelenmisListe(){return akaryakitFiltrelenmisListe},set akaryakitFiltrelenmisListe(v){akaryakitFiltrelenmisListe=v},get akaryakitListesiniCiz(){return akaryakitListesiniCiz},set akaryakitListesiniCiz(v){akaryakitListesiniCiz=v},get akaryakitRaporSatirlari(){return akaryakitRaporSatirlari},set akaryakitRaporSatirlari(v){akaryakitRaporSatirlari=v},get akaryakitRaporAl(){return akaryakitRaporAl},set akaryakitRaporAl(v){akaryakitRaporAl=v},get akaryakitSil(){return akaryakitSil},set akaryakitSil(v){akaryakitSil=v},get akaryakitTuketimNotuVerileri(){return akaryakitTuketimNotuVerileri},set akaryakitTuketimNotuVerileri(v){akaryakitTuketimNotuVerileri=v},get akaryakitTuketimNotuAc(){return akaryakitTuketimNotuAc},set akaryakitTuketimNotuAc(v){akaryakitTuketimNotuAc=v},get akaryakitTuketimNotuOnizle(){return akaryakitTuketimNotuOnizle},set akaryakitTuketimNotuOnizle(v){akaryakitTuketimNotuOnizle=v},get akaryakitTuketimNotunuKaydet(){return akaryakitTuketimNotunuKaydet},set akaryakitTuketimNotunuKaydet(v){akaryakitTuketimNotunuKaydet=v},get akaryakitTuketimNotunuSil(){return akaryakitTuketimNotunuSil},set akaryakitTuketimNotunuSil(v){akaryakitTuketimNotunuSil=v},get akaryakitTuketimMetniniKopyala(){return akaryakitTuketimMetniniKopyala},set akaryakitTuketimMetniniKopyala(v){akaryakitTuketimMetniniKopyala=v},get akaryakitAracDetayiniAc(){return akaryakitAracDetayiniAc},set akaryakitAracDetayiniAc(v){akaryakitAracDetayiniAc=v},get akaryakitDetayDonemSecildi(){return akaryakitDetayDonemSecildi},set akaryakitDetayDonemSecildi(v){akaryakitDetayDonemSecildi=v},get akaryakitDetayTarihAraligindaMi(){return akaryakitDetayTarihAraligindaMi},set akaryakitDetayTarihAraligindaMi(v){akaryakitDetayTarihAraligindaMi=v},get akaryakitAracDetayListesi(){return akaryakitAracDetayListesi},set akaryakitAracDetayListesi(v){akaryakitAracDetayListesi=v},get akaryakitAracDetayiniCiz(){return akaryakitAracDetayiniCiz},set akaryakitAracDetayiniCiz(v){akaryakitAracDetayiniCiz=v},get akaryakitAracRaporAl(){return akaryakitAracRaporAl},set akaryakitAracRaporAl(v){akaryakitAracRaporAl=v},get aracMtvListesiniCiz(){return aracMtvListesiniCiz},set aracMtvListesiniCiz(v){aracMtvListesiniCiz=v},get aracMtvGecmisiniAc(){return aracMtvGecmisiniAc},set aracMtvGecmisiniAc(v){aracMtvGecmisiniAc=v},get aracMtvElleOdemeAc(){return aracMtvElleOdemeAc},set aracMtvElleOdemeAc(v){aracMtvElleOdemeAc=v},get aracMtvElleSecimiDegisti(){return aracMtvElleSecimiDegisti},set aracMtvElleSecimiDegisti(v){aracMtvElleSecimiDegisti=v},get aracMtvElleKaydet(){return aracMtvElleKaydet},set aracMtvElleKaydet(v){aracMtvElleKaydet=v},get aracSigortaListesiniCiz(){return aracSigortaListesiniCiz},set aracSigortaListesiniCiz(v){aracSigortaListesiniCiz=v},get aracVizeListesiniCiz(){return aracVizeListesiniCiz},set aracVizeListesiniCiz(v){aracVizeListesiniCiz=v},get aracBakimOzetListesiniCiz(){return aracBakimOzetListesiniCiz},set aracBakimOzetListesiniCiz(v){aracBakimOzetListesiniCiz=v},get aracTumTakipListeleriniCiz(){return aracTumTakipListeleriniCiz},set aracTumTakipListeleriniCiz(v){aracTumTakipListeleriniCiz=v},get aracListeModunuDegistir(){return aracListeModunuDegistir},set aracListeModunuDegistir(v){aracListeModunuDegistir=v},get aracSecimleriniDoldur(){return aracSecimleriniDoldur},set aracSecimleriniDoldur(v){aracSecimleriniDoldur=v},get aracBelgeDurumlariniGoster(){return aracBelgeDurumlariniGoster},set aracBelgeDurumlariniGoster(v){aracBelgeDurumlariniGoster=v},get aracTuruneGoreAlanlariGuncelle(){return aracTuruneGoreAlanlariGuncelle},set aracTuruneGoreAlanlariGuncelle(v){aracTuruneGoreAlanlariGuncelle=v},get aracFormunuAc(){return aracFormunuAc},set aracFormunuAc(v){aracFormunuAc=v},get aracFormunuKapat(){return aracFormunuKapat},set aracFormunuKapat(v){aracFormunuKapat=v},get aracPdfYukle(){return aracPdfYukle},set aracPdfYukle(v){aracPdfYukle=v},get aracKaydet(){return aracKaydet},set aracKaydet(v){aracKaydet=v},get aracSil(){return aracSil},set aracSil(v){aracSil=v},get aracSigortaModaliniAc(){return aracSigortaModaliniAc},set aracSigortaModaliniAc(v){aracSigortaModaliniAc=v},get aracSigortaModaliniKapat(){return aracSigortaModaliniKapat},set aracSigortaModaliniKapat(v){aracSigortaModaliniKapat=v},get aracSigortaGecmisiniCiz(){return aracSigortaGecmisiniCiz},set aracSigortaGecmisiniCiz(v){aracSigortaGecmisiniCiz=v},get aracPoliceDuzenle(){return aracPoliceDuzenle},set aracPoliceDuzenle(v){aracPoliceDuzenle=v},get aracPoliceSil(){return aracPoliceSil},set aracPoliceSil(v){aracPoliceSil=v},get aracSigortaKaydet(){return aracSigortaKaydet},set aracSigortaKaydet(v){aracSigortaKaydet=v},get aracVizeModaliniAc(){return aracVizeModaliniAc},set aracVizeModaliniAc(v){aracVizeModaliniAc=v},get aracVizeDurumunaGoreKusurAlani(){return aracVizeDurumunaGoreKusurAlani},set aracVizeDurumunaGoreKusurAlani(v){aracVizeDurumunaGoreKusurAlani=v},get aracVizeGecmisKayitlari(){return aracVizeGecmisKayitlari},set aracVizeGecmisKayitlari(v){aracVizeGecmisKayitlari=v},get aracVizeKusurDetayAc(){return aracVizeKusurDetayAc},set aracVizeKusurDetayAc(v){aracVizeKusurDetayAc=v},get aracVizeGecmisiniCiz(){return aracVizeGecmisiniCiz},set aracVizeGecmisiniCiz(v){aracVizeGecmisiniCiz=v},get aracVizeGecmisDuzenle(){return aracVizeGecmisDuzenle},set aracVizeGecmisDuzenle(v){aracVizeGecmisDuzenle=v},get aracVizeGecmisSil(){return aracVizeGecmisSil},set aracVizeGecmisSil(v){aracVizeGecmisSil=v},get aracVizeKaydet(){return aracVizeKaydet},set aracVizeKaydet(v){aracVizeKaydet=v},get aracExportModaliniAc(){return aracExportModaliniAc},set aracExportModaliniAc(v){aracExportModaliniAc=v},get aracDisAktarimListesi(){return aracDisAktarimListesi},set aracDisAktarimListesi(v){aracDisAktarimListesi=v},get aracSeciliAlanlariAktar(){return aracSeciliAlanlariAktar},set aracSeciliAlanlariAktar(v){aracSeciliAlanlariAktar=v},get aracBakimModaliniAc(){return aracBakimModaliniAc},set aracBakimModaliniAc(v){aracBakimModaliniAc=v},get aracBakimModaliniKapat(){return aracBakimModaliniKapat},set aracBakimModaliniKapat(v){aracBakimModaliniKapat=v},get aracBakimVarsayilanlariniUygula(){return aracBakimVarsayilanlariniUygula},set aracBakimVarsayilanlariniUygula(v){aracBakimVarsayilanlariniUygula=v},get aracBakimListesiniCiz(){return aracBakimListesiniCiz},set aracBakimListesiniCiz(v){aracBakimListesiniCiz=v},get aracBakimKaydet(){return aracBakimKaydet},set aracBakimKaydet(v){aracBakimKaydet=v},get aracBakimSil(){return aracBakimSil},set aracBakimSil(v){aracBakimSil=v},get aracMtvYillariniDoldur(){return aracMtvYillariniDoldur},set aracMtvYillariniDoldur(v){aracMtvYillariniDoldur=v},get aracMtvSablonuIndir(){return aracMtvSablonuIndir},set aracMtvSablonuIndir(v){aracMtvSablonuIndir=v},get aracMtvExcelYukle(){return aracMtvExcelYukle},set aracMtvExcelYukle(v){aracMtvExcelYukle=v},get aracTakipGorunumunuGoster(){return aracTakipGorunumunuGoster},set aracTakipGorunumunuGoster(v){aracTakipGorunumunuGoster=v},get openAracTakipApp(){return openAracTakipApp},set openAracTakipApp(v){openAracTakipApp=v},get aracSahibiFiltreleriniDoldur(){return aracSahibiFiltreleriniDoldur},set aracSahibiFiltreleriniDoldur(v){aracSahibiFiltreleriniDoldur=v},get trafikCezaGecmisiniAc(){return trafikCezaGecmisiniAc},set trafikCezaGecmisiniAc(v){trafikCezaGecmisiniAc=v},get trafikCezaFiltrele(){return trafikCezaFiltrele},set trafikCezaFiltrele(v){trafikCezaFiltrele=v},get aracTrafikCezasiFormuAc(){return aracTrafikCezasiFormuAc},set aracTrafikCezasiFormuAc(v){aracTrafikCezasiFormuAc=v},get aracTrafikCezasiKaydet(){return aracTrafikCezasiKaydet},set aracTrafikCezasiKaydet(v){aracTrafikCezasiKaydet=v},get aracTrafikCezasiSil(){return aracTrafikCezasiSil},set aracTrafikCezasiSil(v){aracTrafikCezasiSil=v},get aracTrafikCezalariniCiz(){return aracTrafikCezalariniCiz},set aracTrafikCezalariniCiz(v){aracTrafikCezalariniCiz=v},get fdAracFormMesgul(){return fdAracFormMesgul},set fdAracFormMesgul(v){fdAracFormMesgul=v},get fdAracNormalize(){return fdAracNormalize},set fdAracNormalize(v){fdAracNormalize=v},get fdAracSatilmis(){return fdAracSatilmis},set fdAracSatilmis(v){fdAracSatilmis=v},get fdAracSonBakim(){return fdAracSonBakim},set fdAracSonBakim(v){fdAracSonBakim=v},get fdAracTakipleri(){return fdAracTakipleri},set fdAracTakipleri(v){fdAracTakipleri=v},get fdAracKritikDurum(){return fdAracKritikDurum},set fdAracKritikDurum(v){fdAracKritikDurum=v},get fdAracFiltreliListe(){return fdAracFiltreliListe},set fdAracFiltreliListe(v){fdAracFiltreliListe=v},get fdAracSelectDoldur(){return fdAracSelectDoldur},set fdAracSelectDoldur(v){fdAracSelectDoldur=v},get fdAracFiltreTemizle(){return fdAracFiltreTemizle},set fdAracFiltreTemizle(v){fdAracFiltreTemizle=v},get fdAracOzetFiltre(){return fdAracOzetFiltre},set fdAracOzetFiltre(v){fdAracOzetFiltre=v},get fdAracTakipHtml(){return fdAracTakipHtml},set fdAracTakipHtml(v){fdAracTakipHtml=v},get fdAracListeCiz(){return fdAracListeCiz},set fdAracListeCiz(v){fdAracListeCiz=v}};
aracSigortaModaliniAc=function(id){
fdAracDogrula(false);
openPoliceTakipApp('arac',id);};
const policeAracDetayOncesi=aracDetayModaliniAc;
aracDetayModaliniAc=function(id){
fdAracDogrula(false);
policeAracDetayOncesi(id);const a=araclar.find(x=>String(x.id)===String(id)),alan=document.getElementById('arac-detay-sigorta');if(!a||!alan)return;const liste=policeAracPoliceleri(a);alan.innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button class="btn-modern btn-detail-modern" onclick="modalKapat('modalAracDetay');openPoliceTakipApp('arac','${escapeDashboardText(String(a.id))}')">🛡️ Poliçe Takibe Git</button></div>`+aracDetayTablosu(['Tür','Şirket','Poliçe No','Poliçe Bedeli','Başlangıç','Bitiş','Durum','Belge'],liste.map(p=>{
if(!fdAracGecerli())return;
const d=policeDurumu(p);return`<tr><td>${escapeDashboardText(p.tur||'-')}</td><td>${escapeDashboardText(p.sirket||'-')}</td><td>${escapeDashboardText(p.policeNo||'-')}</td><td>${Number(p.bedel||0)?paraFormatla(p.bedel):'-'}</td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td><span class="police-durum police-durum-${d.tur}">${escapeDashboardText(d.metin)}</span></td><td>${policeBelgeHtml(p)}</td></tr>`;}),'Bu plakayla eşleşen poliçe bulunmuyor.');};
aracSigortaListesiniCiz=function(){
fdAracDogrula(false);

        const body=document.getElementById('aracSigortaBody');if(!body)return;const arama=String(document.getElementById('aracSigortaArama')?.value||'').toLocaleLowerCase('tr-TR'),durum=document.getElementById('aracSigortaDurumFiltre')?.value||'',liste=araclar.filter(a=>aktifSirketeAit(a)&&policeMetinAnahtari(a.durum)!=='SATILDI').map(a=>({a,policeler:policeGuncelKayitlar(policeAracPoliceleri(a))})).filter(x=>{
if(!fdAracGecerli())return;
const ds=x.policeler.map(policeDurumu);return(!arama||`${x.a.plaka} ${x.a.marka} ${x.a.model} ${x.policeler.map(p=>p.sirket+' '+p.policeNo).join(' ')}`.toLocaleLowerCase('tr-TR').includes(arama))&&(!durum||(durum==='eksik'?!x.policeler.length:ds.some(d=>d.tur===(durum==='normal'?'aktif':durum))));});
        body.innerHTML=liste.map((x,i)=>{
if(!fdAracGecerli())return;
const sig=x.policeler.filter(p=>policeGuncelTurAnahtari(p.tur)==='TRAFIK').sort(policeBitisSiralama)[0],kas=x.policeler.filter(p=>policeGuncelTurAnahtari(p.tur)==='KASKO').sort(policeBitisSiralama)[0];return`<tr><td>${i+1}</td><td><strong>${escapeDashboardText(x.a.plaka)}</strong></td><td>${escapeDashboardText(`${x.a.marka||''} ${x.a.model||''}`)}</td><td>${sig?escapeDashboardText(sig.sirket||'-')+'<br><small>'+escapeDashboardText(sig.policeNo||'-')+'</small>':'-'}</td><td>${sig?tarihFormati(sig.bitis):'-'}</td><td>${sig?policeBelgeHtml(sig):'-'}</td><td>${kas?escapeDashboardText(kas.sirket||'-')+'<br><small>'+escapeDashboardText(kas.policeNo||'-')+'</small>':'-'}</td><td>${kas?tarihFormati(kas.bitis):'-'}</td><td>${kas?policeBelgeHtml(kas):'-'}</td><td><button class="btn-modern btn-detail-modern" onclick="aracDetayModaliniAc('${escapeDashboardText(String(x.a.id))}')">👁️ Detay</button></td></tr>`;}).join('')||'<tr><td colspan="10" style="text-align:center;padding:20px;color:#64748b">Eşleşen araç poliçesi bulunmuyor.</td></tr>';
    };
const policeAracDetayYonsuz=aracDetayModaliniAc;
aracDetayModaliniAc=function(id){
fdAracDogrula(false);
policeAracDetayYonsuz(id);document.querySelectorAll('#arac-detay-sigorta button').forEach(b=>{
if(!fdAracGecerli())return;
if(String(b.textContent||'').includes('Poliçe Takibe Git'))b.remove();});};
aracListesiniCiz=function(){
fdAracDogrula(false);
fdAracListeCiz();};
aracSigortaListesiniCiz=function(){
fdAracDogrula(false);

        const body=document.getElementById('aracSigortaBody');if(!body)return;const arama=String(document.getElementById('aracSigortaArama')?.value||'').toLocaleLowerCase('tr-TR'),durum=document.getElementById('aracSigortaDurumFiltre')?.value||'',liste=araclar.filter(a=>aktifSirketeAit(a)&&policeMetinAnahtari(a.durum)!=='SATILDI'&&(a.sigortaTakip===true||String(a.sigortaTakip).toLowerCase()==='true')).map(a=>({a,policeler:policeGuncelKayitlar(policeAracPoliceleri(a))})).filter(x=>{
if(!fdAracGecerli())return;
const ds=x.policeler.map(policeDurumu);return(!arama||`${x.a.plaka} ${x.a.marka} ${x.a.model} ${x.policeler.map(p=>p.sirket+' '+p.policeNo).join(' ')}`.toLocaleLowerCase('tr-TR').includes(arama))&&(!durum||(durum==='eksik'?!x.policeler.length:ds.some(d=>d.tur===(durum==='normal'?'aktif':durum))));});
        body.innerHTML=liste.map((x,i)=>{
if(!fdAracGecerli())return;
const sig=x.policeler.filter(p=>policeGuncelTurAnahtari(p.tur)==='TRAFIK').sort(policeBitisSiralama)[0],kas=x.policeler.filter(p=>policeGuncelTurAnahtari(p.tur)==='KASKO').sort(policeBitisSiralama)[0];return`<tr><td>${i+1}</td><td><strong>${escapeDashboardText(x.a.plaka)}</strong></td><td>${escapeDashboardText(`${x.a.marka||''} ${x.a.model||''}`)}</td><td>${sig?escapeDashboardText(sig.sirket||'-')+'<br><small>'+escapeDashboardText(sig.policeNo||'-')+'</small>':'-'}</td><td>${sig?tarihFormati(sig.bitis):'-'}</td><td>${sig?policeBelgeHtml(sig):'-'}</td><td>${kas?escapeDashboardText(kas.sirket||'-')+'<br><small>'+escapeDashboardText(kas.policeNo||'-')+'</small>':'-'}</td><td>${kas?tarihFormati(kas.bitis):'-'}</td><td>${kas?policeBelgeHtml(kas):'-'}</td></tr>`;}).join('')||'<tr><td colspan="9" style="text-align:center;padding:20px;color:#64748b">Eşleşen araç poliçesi bulunmuyor.</td></tr>';
    };
const fdAracCezaKur=(function(){const esc=v=>escapeDashboardText(String(v??''));
function trafikCezasiArayuzuKur(){
fdAracDogrula(false);
const nav=document.getElementById('aracAnaSekmeler'),app=document.querySelector('#aracTakipApp > .app-layout');if(!nav||!app)return;if(!document.getElementById('aracCezaSekmeBtn')){const b=document.createElement('button');b.id='aracCezaSekmeBtn';b.type='button';b.textContent='🚨 Trafik Cezaları';b.onclick=function(){
fdAracDogrula(false);
aracAnaSekmeDegistir('arac-tab-ceza',b);aracTrafikCezalariniCiz()};const bakim=[...nav.querySelectorAll('button')].find(x=>String(x.getAttribute('onclick')||'').includes('arac-tab-bakim'));nav.insertBefore(b,bakim||null)}if(!document.getElementById('arac-tab-ceza')){const s=document.createElement('section');s.id='arac-tab-ceza';s.className='tab-content';s.innerHTML='<div class="card"><div class="card-header fd-ceza-header"><div><h2>🚨 Trafik Cezaları</h2><small>Ceza, sürücü, tutanak ve fotoğraf takibi</small></div><div class="action-btns"><button class="btn-submit" style="width:auto;margin:0" onclick="aracTrafikCezasiFormuAc()">＋ Ceza Ekle</button></div></div><div class="fd-ceza-toolbar"><input id="aracCezaAra" class="fd-tool-field" placeholder="Plaka, kişi, yer veya ceza ara" oninput="aracTrafikCezalariniCiz()"><select id="aracCezaYil" class="fd-tool-field" onchange="aracTrafikCezalariniCiz()"><option value="">Tüm Yıllar</option></select><strong id="aracCezaToplam"></strong></div><div class="table-wrapper"><table><thead><tr><th>Tarih</th><th>Plaka</th><th>Personel</th><th>Yer</th><th>Ceza</th><th>Tutar</th><th>Tutanak</th><th>Ceza Fotoğrafı</th><th>İşlem</th></tr></thead><tbody id="aracCezaBody"></tbody></table></div></div>';const bakim=document.getElementById('arac-tab-bakim');bakim?.after(s)||app.appendChild(s)}if(!document.getElementById('modalAracCeza')){const m=document.createElement('div');m.id='modalAracCeza';m.className='modal-overlay';m.innerHTML='<div class="modal-card" style="max-width:820px"><div class="modal-header"><h3>Trafik Cezası</h3><button class="modal-close" onclick="modalKapat(\'modalAracCeza\')">✕</button></div><form class="modal-body" onsubmit="aracTrafikCezasiKaydet(event)"><input id="aracCezaId" type="hidden"><div class="profile-layout"><div class="form-group"><label>Araç</label><select id="aracCezaArac" required></select></div><div class="form-group"><label>Ceza Tarihi</label><input id="aracCezaTarih" type="date" required></div><div class="form-group"><label>Cezayı Alan Personel</label><select id="aracCezaPersonel"><option value="">Belirtilmedi</option></select></div><div class="form-group"><label>Ceza Yeri</label><input id="aracCezaYer"></div><div class="form-group"><label>Ceza Türü / Nedeni</label><input id="aracCezaTur" required></div><div class="form-group"><label>Tutar</label><input id="aracCezaTutar" inputmode="decimal" oninput="paraGirisiFormatla(this)" required></div><div class="form-group"><label>Trafik Tutanağı</label><input id="aracCezaTutanak" type="file" accept="application/pdf,image/*"><small>PDF veya fotoğraf</small></div><div class="form-group"><label>Ceza Fotoğrafı</label><input id="aracCezaFotograf" type="file" accept="image/*,application/pdf"><small>Fotoğraf veya PDF</small></div><div class="form-group"><label>Açıklama</label><input id="aracCezaNot"></div></div><button class="btn-submit">Cezayı Kaydet</button></form></div>';document.body.appendChild(m)}}
function trafikCezaNedenleriniDoldur(){
fdAracDogrula(false);
const input=document.getElementById('aracCezaTur');if(!input)return;let liste=document.getElementById('aracCezaNedenListesi');if(!liste){liste=document.createElement('datalist');liste.id='aracCezaNedenListesi';document.body.appendChild(liste)}input.setAttribute('list',liste.id);const nedenler=new Set();araclar.filter(aktifSirketeAit).forEach(a=>(a.trafikCezalari||[]).forEach(c=>{
if(!fdAracGecerli())return;
if(String(c.tur||'').trim())nedenler.add(String(c.tur).trim())}));liste.innerHTML=[...nedenler].sort((a,b)=>a.localeCompare(b,'tr')).map(x=>'<option value="'+esc(x)+'"></option>').join('')}
function trafikCezaGecmisModaliniKur(){
fdAracDogrula(false);

        if(document.getElementById('modalTrafikCezaGecmisi'))return;
        const modal=document.createElement('div');modal.id='modalTrafikCezaGecmisi';modal.className='modal-overlay';
        modal.innerHTML='<div class="modal-card" style="width:96%;max-width:1180px;max-height:90vh"><div class="modal-header"><h3 id="trafikCezaGecmisBaslik">Trafik Ceza Geçmişi</h3><button class="modal-close" onclick="modalKapat(\'modalTrafikCezaGecmisi\')">✕</button></div><div id="trafikCezaGecmisIcerik" class="modal-body" style="overflow:auto"></div></div>';
        document.body.appendChild(modal);
    }
trafikCezaGecmisiniAc=function(tur,deger){
fdAracDogrula(false);

        trafikCezaGecmisModaliniKur();
        const arac=tur==='arac'?araclar.find(a=>aktifSirketeAit(a)&&String(a.id)===String(deger)):null;
        const personel=tur==='personel'?personeller.find(p=>String(p.id)===String(deger)):null;
        const liste=[];araclar.filter(aktifSirketeAit).forEach(a=>(a.trafikCezalari||[]).forEach(c=>{
if(!fdAracGecerli())return;
if((tur==='arac'&&String(a.id)===String(deger))||(tur==='personel'&&String(c.personelId)===String(deger)))liste.push({a,c,p:personeller.find(p=>String(p.id)===String(c.personelId))})}));
        liste.sort((x,y)=>String(y.c.tarih||'').localeCompare(String(x.c.tarih||'')));
        const baslik=tur==='arac'?(arac?.plaka||'Araç'):(personel?.ad||'Personel'),toplam=liste.reduce((s,x)=>s+Number(x.c.tutar||0),0),sonTarih=liste[0]?.c?.tarih;
        const belge=(b,ad)=>b?.url?'<button type="button" class="btn-modern btn-detail-modern" onclick="fdBelgeYuzerAc(\''+esc(b.url)+'\',\''+esc(ad)+'\')">Aç</button>':'-';
        const satirlar=liste.map(x=>'<tr><td>'+tarihFormati(x.c.tarih)+'</td><td>'+esc(x.a.plaka||'-')+'</td><td>'+esc(x.p?.ad||'-')+'</td><td>'+esc(x.c.yer||'-')+'</td><td><strong>'+esc(x.c.tur||'-')+'</strong>'+(x.c.not?'<small style="display:block;color:#64748b;margin-top:3px">'+esc(x.c.not)+'</small>':'')+'</td><td>'+paraFormatla(x.c.tutar)+'</td><td>'+belge(x.c.tutanakBelgesi||x.c.belge,'Trafik Tutanağı')+'</td><td>'+belge(x.c.cezaFotografi,'Ceza Fotoğrafı')+'</td><td><button class="fd-icon-btn fd-icon-edit" title="Düzenle" onclick="modalKapat(\'modalTrafikCezaGecmisi\');aracTrafikCezasiFormuAc(\''+esc(x.a.id)+'\',\''+esc(x.c.id)+'\')">✎</button><button class="fd-icon-btn fd-icon-delete" title="Sil" onclick="aracTrafikCezasiSil(\''+esc(x.a.id)+'\',\''+esc(x.c.id)+'\')">🗑</button></td></tr>').join('');
        document.getElementById('trafikCezaGecmisBaslik').textContent='🚨 '+baslik+' · Trafik Ceza Geçmişi';
        document.getElementById('trafikCezaGecmisIcerik').innerHTML=aracDetayBilgiAlani([['Ceza Kaydı',liste.length+' adet'],['Toplam Ceza Tutarı',paraFormatla(toplam)],['Son Ceza Tarihi',sonTarih?tarihFormati(sonTarih):'-']])+'<div class="table-wrapper" style="margin-top:16px"><table class="fd-ceza-gecmis-tablo"><thead><tr><th>Tarih</th><th>Plaka</th><th>Personel</th><th>Yer</th><th>Ceza</th><th>Tutar</th><th>Tutanak</th><th>Ceza Fotoğrafı</th><th>İşlem</th></tr></thead><tbody>'+(satirlar||'<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b">Ceza geçmişi bulunmuyor.</td></tr>')+'</tbody></table></div>';
        const modal=document.getElementById('modalTrafikCezaGecmisi');modal.dataset.tur=tur;modal.dataset.deger=String(deger);modal.style.display='flex';
    }
trafikCezaFiltrele=function(tur,deger){
fdAracDogrula(false);
if(tur==='plaka'){const arac=araclar.find(a=>aktifSirketeAit(a)&&(String(a.id)===String(deger)||String(a.plaka)===String(deger)));return arac&&trafikCezaGecmisiniAc('arac',arac.id)}return trafikCezaGecmisiniAc(tur,deger)}
aracTrafikCezasiFormuAc=function(aracId='',cezaId=''){
fdAracDogrula(true);
trafikCezasiArayuzuKur();trafikCezaNedenleriniDoldur();const form=document.querySelector('#modalAracCeza form');form.reset();const a=document.getElementById('aracCezaArac');a.innerHTML=araclar.filter(aktifSirketeAit).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.plaka)+'</option>').join('');a.value=aracId||a.value;document.getElementById('aracCezaPersonel').innerHTML='<option value="">Belirtilmedi</option>'+personeller.filter(p=>aktifSirketeAit(p)&&p.aktif!==false).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.ad)+'</option>').join('');document.getElementById('aracCezaTarih').value=new Date().toISOString().slice(0,10);document.getElementById('aracCezaId').value=cezaId;const arac=araclar.find(x=>String(x.id)===String(aracId)),c=arac?.trafikCezalari?.find(x=>String(x.id)===String(cezaId));if(c){document.getElementById('aracCezaTarih').value=c.tarih||'';document.getElementById('aracCezaPersonel').value=c.personelId||'';document.getElementById('aracCezaYer').value=c.yer||'';document.getElementById('aracCezaTur').value=c.tur||'';document.getElementById('aracCezaTutar').value=Number(c.tutar||0).toLocaleString('tr-TR',{minimumFractionDigits:2});document.getElementById('aracCezaNot').value=c.not||''}document.getElementById('modalAracCeza').style.display='flex'};
aracTrafikCezasiKaydet=async function(e){
try{
fdAracDogrula(true);
e.preventDefault();const arac=araclar.find(x=>String(x.id)===String(document.getElementById('aracCezaArac').value));if(!arac)return;const id=document.getElementById('aracCezaId').value,onceki=JSON.parse(JSON.stringify(arac)),eski=(arac.trafikCezalari||[]).find(x=>String(x.id)===String(id));showGlobalOverlay('Trafik cezası kaydediliyor','Tutanak ve ceza fotoğrafı Drive’a yükleniyor...');const yuklenen=[];try{let tutanak=eski?.tutanakBelgesi||eski?.belge||null,fotograf=eski?.cezaFotografi||null;if(document.getElementById('aracCezaTutanak').files?.[0]){tutanak=await fdAracBekle(aracPdfYukle('aracCezaTutanak',arac.plaka,'TRAFİK TUTANAĞI '+document.getElementById('aracCezaTarih').value,tutanak));yuklenen.push(tutanak)}if(document.getElementById('aracCezaFotograf').files?.[0]){fotograf=await fdAracBekle(aracPdfYukle('aracCezaFotograf',arac.plaka,'CEZA FOTOĞRAFI '+document.getElementById('aracCezaTarih').value,fotograf));yuklenen.push(fotograf)}const c={...(eski||{}),id:eski?.id||'ceza_'+Date.now(),tarih:document.getElementById('aracCezaTarih').value,personelId:document.getElementById('aracCezaPersonel').value,yer:document.getElementById('aracCezaYer').value.trim(),tur:document.getElementById('aracCezaTur').value.trim(),tutar:paraMetniniSayiyaCevir(document.getElementById('aracCezaTutar').value),not:document.getElementById('aracCezaNot').value.trim(),tutanakBelgesi:tutanak,cezaFotografi:fotograf};delete c.belge;arac.trafikCezalari=Array.isArray(arac.trafikCezalari)?arac.trafikCezalari:[];const i=arac.trafikCezalari.findIndex(x=>String(x.id)===String(c.id));if(i>=0)arac.trafikCezalari[i]=c;else arac.trafikCezalari.push(c);await fdAracBekle(aracTekKaydiKaydet(arac));modalKapat('modalAracCeza');aracTrafikCezalariniCiz();showToast(eski?'Trafik cezası güncellendi.':'Trafik cezası kaydedildi.')}catch(error){
if(!fdAracGecerli())return;
Object.keys(arac).forEach(k=>delete arac[k]);Object.assign(arac,onceki);yuklenen.forEach(b=>{
if(!fdAracGecerli())return;
if(b?.id)fdYazilimDrivePdfSil(b.id).catch(()=>{
if(!fdAracGecerli())return;
})});alert('Trafik cezası kaydedilemedi: '+(error.message||error))}finally{
if(fdAracGecerli()){
hideGlobalOverlay()
}
}
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
};
aracTrafikCezasiSil=async function(aracId,id){
try{
fdAracDogrula(true);
const arac=araclar.find(x=>String(x.id)===String(aracId)),c=arac?.trafikCezalari?.find(x=>String(x.id)===String(id));if(!c||!await fdAracBekle(fdYuzerOnaySor('Bu trafik cezası ve bağlı belgeler silinsin mi?')))return;const onceki=JSON.parse(JSON.stringify(arac));try{arac.trafikCezalari=arac.trafikCezalari.filter(x=>String(x.id)!==String(id));await fdAracBekle(aracTekKaydiKaydet(arac));[c.tutanakBelgesi,c.cezaFotografi,c.belge].forEach(b=>{
if(!fdAracGecerli())return;
if(b?.id)fdYazilimDrivePdfSil(b.id).catch(()=>{
if(!fdAracGecerli())return;
})});aracTrafikCezalariniCiz();const gecmis=document.getElementById('modalTrafikCezaGecmisi');if(gecmis?.style.display==='flex')trafikCezaGecmisiniAc(gecmis.dataset.tur,gecmis.dataset.deger)}catch(e){
if(!fdAracGecerli())return;
Object.keys(arac).forEach(k=>delete arac[k]);Object.assign(arac,onceki);alert('Ceza silinemedi: '+(e.message||e))}
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
};
aracTrafikCezalariniCiz=function(){
fdAracDogrula(false);
trafikCezasiArayuzuKur();trafikCezaNedenleriniDoldur();const body=document.getElementById('aracCezaBody');if(!body)return;const q=String(document.getElementById('aracCezaAra')?.value||'').toLocaleLowerCase('tr-TR'),y=document.getElementById('aracCezaYil'),sec=y?.value||'',liste=[];araclar.filter(aktifSirketeAit).forEach(a=>(a.trafikCezalari||[]).forEach(c=>liste.push({a,c,p:personeller.find(p=>String(p.id)===String(c.personelId))})));const yillar=[...new Set(liste.map(x=>String(x.c.tarih||'').slice(0,4)).filter(Boolean))].sort((a,b)=>b-a);if(y){y.innerHTML='<option value="">Tüm Yıllar</option>'+yillar.map(v=>'<option>'+v+'</option>').join('');y.value=yillar.includes(sec)?sec:''}const f=liste.filter(x=>(!sec||String(x.c.tarih).startsWith(sec))&&(!q||[x.a.plaka,x.p?.ad,x.c.yer,x.c.tur,x.c.not].join(' ').toLocaleLowerCase('tr-TR').includes(q))).sort((a,b)=>String(b.c.tarih||'').localeCompare(String(a.c.tarih||'')));const toplam=document.getElementById('aracCezaToplam');toplam.textContent='Toplam: '+paraFormatla(f.reduce((s,x)=>s+Number(x.c.tutar||0),0));const belge=(b,ad)=>b?.url?'<button type="button" class="btn-modern btn-detail-modern" onclick="fdBelgeYuzerAc(\''+esc(b.url)+'\',\''+esc(ad)+'\')">Aç</button>':'-';body.innerHTML=f.map(x=>'<tr><td>'+tarihFormati(x.c.tarih)+'</td><td><button type="button" class="kira-link" onclick="trafikCezaGecmisiniAc(\'arac\',\''+esc(x.a.id)+'\')">'+esc(x.a.plaka)+'</button></td><td>'+(x.p?'<button type="button" class="kira-link" onclick="trafikCezaGecmisiniAc(\'personel\',\''+esc(x.p.id)+'\')">'+esc(x.p.ad)+'</button>':'-')+'</td><td class="fd-ceza-dar">'+esc(x.c.yer||'-')+'</td><td class="fd-ceza-dar">'+esc(x.c.tur||'-')+'</td><td>'+paraFormatla(x.c.tutar)+'</td><td>'+belge(x.c.tutanakBelgesi||x.c.belge,'Trafik Tutanağı')+'</td><td>'+belge(x.c.cezaFotografi,'Ceza Fotoğrafı')+'</td><td><button class="fd-icon-btn fd-icon-edit" onclick="aracTrafikCezasiFormuAc(\''+esc(x.a.id)+'\',\''+esc(x.c.id)+'\')">✎</button><button class="fd-icon-btn fd-icon-delete" onclick="aracTrafikCezasiSil(\''+esc(x.a.id)+'\',\''+esc(x.c.id)+'\')">🗑</button></td></tr>').join('')||'<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b">Trafik cezası bulunmuyor.</td></tr>';const table=body.closest('table');if(table){table.style.tableLayout='fixed';table.style.width='100%';const widths=['9%','10%','16%','13%','16%','10%','9%','9%','8%'];[...table.querySelectorAll('thead th')].forEach((th,i)=>th.style.width=widths[i]||'auto')}};
const aracCizEski=aracTumTakipListeleriniCiz;
if(typeof aracCizEski==='function')aracTumTakipListeleriniCiz=function(){
fdAracDogrula(false);
const r=aracCizEski.apply(this,arguments);aracTrafikCezalariniCiz();return r};
function aracTrafikCezaDetayiniCiz(aracId){
fdAracDogrula(false);

        const arac=araclar.find(x=>String(x.id)===String(aracId)),alan=document.getElementById('arac-detay-cezalar');
        if(!arac||!alan)return;
        const cezalar=[...(Array.isArray(arac.trafikCezalari)?arac.trafikCezalari:[])].sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||''))),toplam=cezalar.reduce((s,c)=>s+Number(c.tutar||0),0);
        const belge=(b,etiket)=>b?.url?'<a class="btn-modern btn-detail-modern" href="'+esc(String(b.url))+'" target="_blank" rel="noopener">📄 '+esc(etiket)+'</a>':'-';
        const satirlar=cezalar.map(c=>{
if(!fdAracGecerli())return;
const p=personeller.find(x=>String(x.id)===String(c.personelId));return '<tr><td>'+tarihFormati(c.tarih)+'</td><td>'+esc(p?.ad||'-')+'</td><td>'+esc(c.yer||'-')+'</td><td><strong>'+esc(c.tur||'-')+'</strong>'+(c.not?'<small style="display:block;color:#64748b;margin-top:4px">'+esc(c.not)+'</small>':'')+'</td><td><strong>'+paraFormatla(c.tutar)+'</strong></td><td>'+belge(c.tutanakBelgesi||c.belge,'Tutanak')+'</td><td>'+belge(c.cezaFotografi,'Fotoğraf')+'</td><td><button class="fd-icon-btn fd-icon-edit" title="Düzenle" onclick="modalKapat(\'modalAracDetay\');aracTrafikCezasiFormuAc(\''+esc(arac.id)+'\',\''+esc(c.id)+'\')">✎</button><button class="fd-icon-btn fd-icon-delete" title="Sil" onclick="aracTrafikCezasiSil(\''+esc(arac.id)+'\',\''+esc(c.id)+'\')">🗑</button></td></tr>'});
        alan.innerHTML=aracDetayBilgiAlani([['Ceza Kaydı',cezalar.length+' adet'],['Toplam Ceza Tutarı',paraFormatla(toplam)],['Son Ceza Tarihi',cezalar.length?tarihFormati(cezalar[0].tarih):'-']])+'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin:18px 0 10px;flex-wrap:wrap"><h3 style="margin:0">Trafik Ceza Geçmişi</h3><button class="btn-submit" style="width:auto;margin:0" onclick="modalKapat(\'modalAracDetay\');aracTrafikCezasiFormuAc(\''+esc(arac.id)+'\')">＋ Bu Araca Ceza Ekle</button></div>'+aracDetayTablosu(['Tarih','Personel','Yer','Ceza','Tutar','Tutanak','Ceza Fotoğrafı','İşlem'],satirlar,'Bu araca ait trafik cezası bulunmuyor.');
    }
const aracDetayCezaEski=aracDetayModaliniAc;
if(typeof aracDetayCezaEski==='function')aracDetayModaliniAc=function(id){
fdAracDogrula(false);
const r=aracDetayCezaEski.apply(this,arguments);aracTrafikCezaDetayiniCiz(id);return r};
return trafikCezasiArayuzuKur;})();
function fdAracOutputContext(){fdAracDogrula();return {fields:ARAC_EXPORT_FIELDS.map(field=>({...field})),mode:aracListeModu}}
function fdAracBaslat(){fdAracDogrula();fdAracCezaKur();window.fdVarlikKisiListesiniGuncelle?.();
(function(){
fdAracDogrula(false);

    const root=document.getElementById('aracTakipApp'),main=root?.querySelector('main');if(!main)return;
    main.insertAdjacentHTML('afterbegin','<header class="fd-arac-baslik"><div><h2>Araç ve Filo Yönetimi</h2><p>Araçlar, belgeler ve yaklaşan işlemler tek yerde.</p></div></header>');
    const filtre=document.getElementById('aracArama')?.closest('.filter-bar');
    if(filtre){filtre.insertAdjacentHTML('beforeend','<select id="fdAracTurFiltre" aria-label="Araç türü" onchange="aracListesiniCiz()"></select><select id="fdAracSubeFiltre" aria-label="Şube" onchange="aracListesiniCiz()"></select><button type="button" class="btn-modern" onclick="fdAracFiltreTemizle()">Temizle</button>');filtre.insertAdjacentHTML('afterend','<div id="fdAracListeMeta" class="fd-arac-liste-meta" aria-live="polite"></div>')}
    const uyari=document.getElementById('aracUyariFiltre');if(uyari)uyari.insertAdjacentHTML('beforeend','<option value="eksik">Tarihi eksik / geçersiz</option>');
    document.querySelector('#aracTakipTablosu thead tr').innerHTML=['#','Plaka','Araç / Tür','Araç Sahibi / Şube','Kullanan / KM','Takip / Yaklaşan İşlemler','Durum','İşlem'].map(t=>'<th>'+t+'</th>').join('');
    const sh=document.getElementById('aracSigortaBody')?.closest('table')?.querySelector('thead tr');if(sh&&sh.children.length===9)sh.insertAdjacentHTML('beforeend','<th>İşlem</th>');
    aracEnKritikDurum=fdAracKritikDurum;
    const detail=aracDetayModaliniAc;aracDetayModaliniAc=function(id){
fdAracDogrula(false);
const a=araclar.find(a=>aktifSirketeAit(a)&&String(a.id)===String(id));if(!a)return;const r=detail.apply(this,arguments);const genel=document.getElementById('arac-detay-genel');if(genel){const islem=fn=>escapeDashboardText("aracDetayModaliniKapat();"+fn+'('+JSON.stringify(String(id))+')');genel.insertAdjacentHTML('afterbegin','<div class="fd-arac-detay-islemler"><button type="button" class="btn-modern btn-edit-modern" onclick="'+islem('aracFormunuAc')+'">Aracı Düzenle</button></div>')}return r};
    for(const name of ['aracFormunuAc','aracSigortaModaliniAc','aracVizeModaliniAc','aracBakimModaliniAc','aracBelgeMerkeziniAc','aracMtvGecmisiniAc','aracMtvElleOdemeAc','aracRuhsatAc','akaryakitAracDetayiniAc']){const fn=fdAracBindings[name];if(typeof fn!=='function')continue;fdAracBindings[name]=function(id){
fdAracDogrula(false);
if(id&&!araclar.some(a=>aktifSirketeAit(a)&&String(a.id)===String(id)))return;return fn.apply(this,arguments)}}
    const busy=new Set();for(const name of ['aracSigortaKaydet','aracVizeKaydet','aracBakimSil','aracSil']){const fn=fdAracBindings[name];if(typeof fn!=='function')continue;fdAracBindings[name]=async function(){
try{
fdAracDogrula(false);
if(busy.has(name))return;busy.add(name);const form=name==='aracSigortaKaydet'?document.getElementById('aracSigortaForm'):name==='aracVizeKaydet'?document.getElementById('aracVizeForm'):null;fdAracFormMesgul(form,true);try{return await fdAracBekle(fn.apply(this,arguments))}finally{
if(fdAracGecerli()){
fdAracFormMesgul(form,false);busy.delete(name)
}
}
}catch(fdScopeError){if(!fdAracGecerli())return;throw fdScopeError;}
}}
})();

if(SUPABASE_MODE&&window.fdVehiclePages){fdVehiclePages=window.fdVehiclePages.create({bindings:fdAracBindings,valid:fdAracGecerli,show:aracTakipGorunumunuGoster,mode:()=>aracListeModu,years:aracMtvYillariniDoldur,exports:aracExportButonlariniKur,reset(){aracListeModu='aktif';document.getElementById('aracTurOzetAlani').style.display='block';document.querySelectorAll('#aracAnaSekmeler button').forEach((b,i)=>b.classList.toggle('active',i===0));document.querySelectorAll('#aracTakipApp .tab-content').forEach(t=>t.classList.toggle('active',t.id==='arac-tab-araclar'));document.querySelectorAll('#arac-tab-araclar .module-subnav button').forEach(b=>b.classList.toggle('active',b.id==='btnAracAktif'));}});}
}
return {open:openAracTakipApp,init:fdAracBaslat,api:{get aracEnKritikDurum(){return aracEnKritikDurum},get aracMtvOzetHtml(){return aracMtvOzetHtml},get aracBelgeButonu(){return aracBelgeButonu},get aracRuhsatAc(){return aracRuhsatAc},get aracBelgeMerkeziniAc(){return aracBelgeMerkeziniAc},get aracDetayBilgiAlani(){return aracDetayBilgiAlani},get aracAlisSatisDetayAlani(){return aracAlisSatisDetayAlani},get aracDetayTablosu(){return aracDetayTablosu},get aracDetayModaliniAc(){return aracDetayModaliniAc},get aracDetaySekmeDegistir(){return aracDetaySekmeDegistir},get aracDetayModaliniKapat(){return aracDetayModaliniKapat},get aracExportButonlariniKur(){return aracExportButonlariniKur},get aracFotoGosterimUrl(){return aracFotoGosterimUrl},get aracFotoOnizlemesiniGoster(){return aracFotoOnizlemesiniGoster},get aracFotoSecildi(){return aracFotoSecildi},get aracRuhsatDurumMesaji(){return aracRuhsatDurumMesaji},get aracRuhsatAlanlariniBul(){return aracRuhsatAlanlariniBul},get aracRuhsatOcrKelimeleriniAl(){return aracRuhsatOcrKelimeleriniAl},get aracRuhsatAlanlariniKonumdanBul(){return aracRuhsatAlanlariniKonumdanBul},get aracRuhsatAlanlariniFormaYaz(){return aracRuhsatAlanlariniFormaYaz},get aracRuhsatDosyasiSecildi(){return aracRuhsatDosyasiSecildi},get aracListesiniCiz(){return aracListesiniCiz},get aracTurOzetleriniCiz(){return aracTurOzetleriniCiz},get aracAnaSekmeDegistir(){return aracAnaSekmeDegistir},get aracTakipTarihRozeti(){return aracTakipTarihRozeti},get akaryakitSecimleriniDoldur(){return akaryakitSecimleriniDoldur},get akaryakitAracSecenekleri(){return akaryakitAracSecenekleri},get akaryakitDepoSecenekleri(){return akaryakitDepoSecenekleri},get akaryakitTopluTaslakAnahtari(){return akaryakitTopluTaslakAnahtari},get akaryakitYeniKayitId(){return akaryakitYeniKayitId},get akaryakitTopluTaslakSatirlari(){return akaryakitTopluTaslakSatirlari},get akaryakitTopluTaslagiKaydet(){return akaryakitTopluTaslagiKaydet},get akaryakitTopluTaslagiSil(){return akaryakitTopluTaslagiSil},get akaryakitTopluTaslagiYukle(){return akaryakitTopluTaslagiYukle},get akaryakitTopluSatirEkle(){return akaryakitTopluSatirEkle},get akaryakitTopluSatirNumarala(){return akaryakitTopluSatirNumarala},get akaryakitHucreIciTamamlamaKaynagi(){return akaryakitHucreIciTamamlamaKaynagi},get akaryakitHucreIciTamamla(){return akaryakitHucreIciTamamla},get akaryakitSonAlandaTab(){return akaryakitSonAlandaTab},get akaryakitPlakadanAracBul(){return akaryakitPlakadanAracBul},get akaryakitAyniCikisKaydiMi(){return akaryakitAyniCikisKaydiMi},get akaryakitKayitlariniDogrula(){return akaryakitKayitlariniDogrula},get akaryakitKayitlariniKaydet(){return akaryakitKayitlariniKaydet},get akaryakitFormunuAc(){return akaryakitFormunuAc},get akaryakitDuzenle(){return akaryakitDuzenle},get akaryakitKaydet(){return akaryakitKaydet},get akaryakitAyDegistir(){return akaryakitAyDegistir},get akaryakitFiltrelenmisListe(){return akaryakitFiltrelenmisListe},get akaryakitListesiniCiz(){return akaryakitListesiniCiz},get akaryakitRaporSatirlari(){return akaryakitRaporSatirlari},get akaryakitRaporAl(){return akaryakitRaporAl},get akaryakitSil(){return akaryakitSil},get akaryakitTuketimNotuVerileri(){return akaryakitTuketimNotuVerileri},get akaryakitTuketimNotuAc(){return akaryakitTuketimNotuAc},get akaryakitTuketimNotuOnizle(){return akaryakitTuketimNotuOnizle},get akaryakitTuketimNotunuKaydet(){return akaryakitTuketimNotunuKaydet},get akaryakitTuketimNotunuSil(){return akaryakitTuketimNotunuSil},get akaryakitTuketimMetniniKopyala(){return akaryakitTuketimMetniniKopyala},get akaryakitAracDetayiniAc(){return akaryakitAracDetayiniAc},get akaryakitDetayDonemSecildi(){return akaryakitDetayDonemSecildi},get akaryakitDetayTarihAraligindaMi(){return akaryakitDetayTarihAraligindaMi},get akaryakitAracDetayListesi(){return akaryakitAracDetayListesi},get akaryakitAracDetayiniCiz(){return akaryakitAracDetayiniCiz},get akaryakitAracRaporAl(){return akaryakitAracRaporAl},get aracMtvListesiniCiz(){return aracMtvListesiniCiz},get aracMtvGecmisiniAc(){return aracMtvGecmisiniAc},get aracMtvElleOdemeAc(){return aracMtvElleOdemeAc},get aracMtvElleSecimiDegisti(){return aracMtvElleSecimiDegisti},get aracMtvElleKaydet(){return aracMtvElleKaydet},get aracSigortaListesiniCiz(){return aracSigortaListesiniCiz},get aracVizeListesiniCiz(){return aracVizeListesiniCiz},get aracBakimOzetListesiniCiz(){return aracBakimOzetListesiniCiz},get aracTumTakipListeleriniCiz(){return aracTumTakipListeleriniCiz},get aracListeModunuDegistir(){return aracListeModunuDegistir},get aracSecimleriniDoldur(){return aracSecimleriniDoldur},get aracBelgeDurumlariniGoster(){return aracBelgeDurumlariniGoster},get aracTuruneGoreAlanlariGuncelle(){return aracTuruneGoreAlanlariGuncelle},get aracFormunuAc(){return aracFormunuAc},get aracFormunuKapat(){return aracFormunuKapat},get aracPdfYukle(){return aracPdfYukle},get aracKaydet(){return aracKaydet},get aracSil(){return aracSil},get aracSigortaModaliniAc(){return aracSigortaModaliniAc},get aracSigortaModaliniKapat(){return aracSigortaModaliniKapat},get aracSigortaGecmisiniCiz(){return aracSigortaGecmisiniCiz},get aracPoliceDuzenle(){return aracPoliceDuzenle},get aracPoliceSil(){return aracPoliceSil},get aracSigortaKaydet(){return aracSigortaKaydet},get aracVizeModaliniAc(){return aracVizeModaliniAc},get aracVizeDurumunaGoreKusurAlani(){return aracVizeDurumunaGoreKusurAlani},get aracVizeGecmisKayitlari(){return aracVizeGecmisKayitlari},get aracVizeKusurDetayAc(){return aracVizeKusurDetayAc},get aracVizeGecmisiniCiz(){return aracVizeGecmisiniCiz},get aracVizeGecmisDuzenle(){return aracVizeGecmisDuzenle},get aracVizeGecmisSil(){return aracVizeGecmisSil},get aracVizeKaydet(){return aracVizeKaydet},get aracExportModaliniAc(){return aracExportModaliniAc},get aracDisAktarimListesi(){return aracDisAktarimListesi},get aracSeciliAlanlariAktar(){return aracSeciliAlanlariAktar},get aracBakimModaliniAc(){return aracBakimModaliniAc},get aracBakimModaliniKapat(){return aracBakimModaliniKapat},get aracBakimVarsayilanlariniUygula(){return aracBakimVarsayilanlariniUygula},get aracBakimListesiniCiz(){return aracBakimListesiniCiz},get aracBakimKaydet(){return aracBakimKaydet},get aracBakimSil(){return aracBakimSil},get aracMtvYillariniDoldur(){return aracMtvYillariniDoldur},get aracMtvSablonuIndir(){return aracMtvSablonuIndir},get aracMtvExcelYukle(){return aracMtvExcelYukle},get aracTakipGorunumunuGoster(){return aracTakipGorunumunuGoster},get aracSahibiFiltreleriniDoldur(){return aracSahibiFiltreleriniDoldur},get trafikCezaGecmisiniAc(){return trafikCezaGecmisiniAc},get trafikCezaFiltrele(){return trafikCezaFiltrele},get aracTrafikCezasiFormuAc(){return aracTrafikCezasiFormuAc},get aracTrafikCezasiKaydet(){return aracTrafikCezasiKaydet},get aracTrafikCezasiSil(){return aracTrafikCezasiSil},get aracTrafikCezalariniCiz(){return aracTrafikCezalariniCiz},get fdAracFormMesgul(){return fdAracFormMesgul},get fdAracNormalize(){return fdAracNormalize},get fdAracSatilmis(){return fdAracSatilmis},get fdAracSonBakim(){return fdAracSonBakim},get fdAracTakipleri(){return fdAracTakipleri},get fdAracKritikDurum(){return fdAracKritikDurum},get fdAracFiltreliListe(){return fdAracFiltreliListe},get fdAracSelectDoldur(){return fdAracSelectDoldur},get fdAracFiltreTemizle(){return fdAracFiltreTemizle},get fdAracOzetFiltre(){return fdAracOzetFiltre},get fdAracTakipHtml(){return fdAracTakipHtml},get fdAracListeCiz(){return fdAracListeCiz},fdAracOutputContext},dispose(){fdBakimTaslagiTemizle();fdVehiclePages?.dispose();fdAracDisposed=true;aracAcmaIstegi++;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="arac"):null;if(tab)tab.alanId="";for(const id of fdAracTimers)window.clearTimeout(id);fdAracTimers.clear();for(const reader of fdAracReaders)try{reader.abort()}catch(_){}fdAracReaders.clear();for(const id of ["aracTakipApp","modalAracKayit","modalAracBakim","modalAkaryakit","modalAkaryakitAracDetay","modalAkaryakitTuketimNotu","modalAracMtvGecmis","modalAracMtvOdeme","modalAracSigorta","modalAracBelgeler","modalAracVize","modalAracVizeKusurDetay","modalAracExport","modalAracDetay","modalAracCeza","modalTrafikCezaGecmisi","aracCezaNedenListesi"]){const el=document.getElementById(id);el?.querySelectorAll("form").forEach(f=>f.reset());el?.querySelectorAll("input[type=file]").forEach(f=>f.value="");}if(fdAracOverlay)hideGlobalOverlay();}};
});

window.FDModules.define('bordro',function(){

let fdBdDisposed=false,fdBdOverlay='';const fdBdInitial=fdBdIdentity(),fdBdTimers=new Map(),fdBdControllers=new Set(),fdBdURLs=new Set(),fdBdWaiters=new Set();
function fdBdIdentity(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function fdBdValid(){return !fdBdDisposed&&fdBdInitial===fdBdIdentity()&&(isManagerUser()||isPersonelUser())&&anaMenuModulErisimiVar('personel')}
function fdBdStale(){return Object.assign(Error('Bordro ekranının oturumu veya dönemi değişti.'),{fdBordroStale:true})}
function fdBdAssert(write=false){if(!fdBdValid())throw fdBdStale();if(write&&(!isManagerUser()||isPersonelUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Bordro belgelerinde değişiklik yetkiniz yok.')}
function fdBdRunKey(){return JSON.stringify([fdBdIdentity(),document.getElementById('puanAySec')?.value,document.getElementById('puanYilSec')?.value])}
function fdBdScheduleAPI(body){fdBdAssert();const key=fdBdRunKey();return window.fdxPlanliBildirimApi(body,()=>fdBdCurrent(key))}
function fdBdCurrent(key){return fdBdValid()&&key===fdBdRunKey()}
async function fdBdAwait(p,key){if(!fdBdCurrent(key))throw fdBdStale();const result=await p;if(!fdBdCurrent(key))throw fdBdStale();return result}
function fdBdDelay(ms){return new Promise(resolve=>{const done=()=>{fdBdWaiters.delete(done);resolve()};fdBdWaiters.add(done);const id=window.setTimeout(()=>{fdBdTimers.delete(id);done()},ms);fdBdTimers.set(id,{fn:done,args:[]})})}
function fdBdTimer(fn,ms,...args){const key=fdBdRunKey(),id=window.setTimeout(()=>{fdBdTimers.delete(id);if(fdBdCurrent(key))fn(...args)},ms);fdBdTimers.set(id,{fn,args});return id}
function fdBdClearTimer(id){fdBdTimers.delete(id);window.clearTimeout(id)}
function fdBdController(){const c=new AbortController();fdBdControllers.add(c);return c}
function fdBdCreateURL(blob){const url=URL.createObjectURL(blob);fdBdURLs.add(url);return url}
function fdBdRevokeURL(url){URL.revokeObjectURL(url);fdBdURLs.delete(url)}
function fdBdShowOverlay(...args){fdBdAssert();showGlobalOverlay?.(...args);fdBdOverlay=document.getElementById('globalOverlay')?.innerHTML||''}
function fdBdHideOverlay(){if(fdBdOverlay&&document.getElementById('globalOverlay')?.innerHTML===fdBdOverlay)hideGlobalOverlay?.();fdBdOverlay=''}
let bordroMaasKarsilastirmayiAc,bordroBelgeleriYuklemeAc,bordroBelgeleriniTopluKaydet,bordroBelgesiGoruntule,bordroPersonelPusulasiGoruntule,bordroBelgeOnizlemeKapat,bordroBelgesiIndir,bordroPersonelPusulasiIndir,bordroOnizlenenBelgeIndir,bordroBelgesiSil,bordroBelgeleriAyiDegisti;
const KLASOR='BORDRO BELGELERİ';
const TURLER=[
        {kod:'ucret_pusulasi',ad:'Ücret Pusulası',dosya:'UCRET_PUSULASI'},
        {kod:'bordro',ad:'Bordro',dosya:'BORDRO'},
        {kod:'puantaj',ad:'Puantaj',dosya:'PUANTAJ'},
        {kod:'banka_maas',ad:'Maaş Listesi',dosya:'MAAS_LISTESI'},
        {kod:'maas_banka',ad:'Maaş Listesi Banka',dosya:'MAAS_LISTESI_BANKA'},
        {kod:'icra_kesinti',ad:'İcra Kesinti Listesi',dosya:'ICRA_KESINTI_LISTESI'},
        {kod:'bes',ad:'BES Listesi',dosya:'BES_LISTESI'}
    ];
const aylar=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const cache=new Map();
const pusulaCache=new Map();
let yuklenenAnahtar='',pusulaYuklenenAnahtar='',onizlenen=null,islemde=false;
function donem(){fdBdAssert();const yil=Number(document.getElementById('puanYilSec')?.value||new Date().getFullYear()),ay=Number(document.getElementById('puanAySec')?.value||new Date().getMonth());return{yil,ay,anahtar:yil+'_'+String(ay+1).padStart(2,'0'),etiket:aylar[ay]+' '+yil,ayar:'bordro_belgeleri_'+yil+'_'+String(ay+1).padStart(2,'0')}}
function bordroOnbellekAnahtari(d=donem()){fdBdAssert();return String(aktifSirketId()||'sirket-yok')+'|'+d.anahtar}
function pusulaOnbellekAnahtari(d=donem()){fdBdAssert();return bordroOnbellekAnahtari(d)+'|'+(isPersonelUser()?('personel:'+String(activeUser?.tcNo||'')):'yonetim')}
function yonetebilir(){fdBdAssert();return typeof isManagerUser==='function'&&isManagerUser()&&!isPersonelUser()}
function esc(v){fdBdAssert();return typeof fdEsc==='function'?fdEsc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function kayit(d){fdBdAssert();return cache.get(bordroOnbellekAnahtari(d))||{ay:d.anahtar,belgeler:{}}}
function belge(kod){fdBdAssert();return kayit(donem()).belgeler?.[kod]||null}
function tarih(v){fdBdAssert();if(!v)return 'Yüklendi';try{return new Date(v).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})}catch(_){return 'Yüklendi'}}
function bordroMetinAnahtari(v){fdBdAssert();return String(v||'').replace(/ı/g,'i').replace(/İ/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function bordroDosyaAnahtari(v){fdBdAssert();return bordroMetinAnahtari(v).replace(/\s+/g,'_').replace(/[^A-Z0-9_]/g,'').slice(0,80)||'PERSONEL'}
function pusulaHaritasi(d=donem()){fdBdAssert();return pusulaCache.get(pusulaOnbellekAnahtari(d))||new Map()}
function bordroIlerlet(btn,yuzde,metin){fdBdAssert();const oran=Math.max(0,Math.min(100,Math.round(yuzde)));btn.style.setProperty('--p',oran+'%');btn.textContent=metin||('Yükleniyor %'+oran)}
function bordroPdfSatirlari(items){fdBdAssert();
        const satirlar=[];
        (items||[]).filter(item=>String(item.str||'').trim()).map(item=>({
            metin:String(item.str||'').trim(),x:Number(item.transform?.[4]||0),y:Number(item.transform?.[5]||0),boy:Number(item.height||Math.abs(item.transform?.[3]||0)||8)
        })).sort((a,b)=>Math.abs(b.y-a.y)>2.5?b.y-a.y:a.x-b.x).forEach(oge=>{
            let satir=satirlar.find(item=>Math.abs(item.y-oge.y)<=2.5);
            if(!satir){satir={y:oge.y,boy:oge.boy,ogeler:[]};satirlar.push(satir)}
            satir.boy=Math.max(satir.boy,oge.boy);satir.ogeler.push(oge);
        });
        return satirlar.sort((a,b)=>b.y-a.y).map(satir=>({...satir,metin:satir.ogeler.sort((a,b)=>a.x-b.x).map(oge=>oge.metin).join(' ')}));
    }
function bordroParaMetniniSayiyaCevir(deger){fdBdAssert();
        let metin=String(deger||'').replace(/\s+/g,'').replace(/[^0-9,.-]/g,'');
        if(!metin)return 0;
        if(metin.includes(','))metin=metin.replace(/\./g,'').replace(',','.');
        else if((metin.match(/\./g)||[]).length>1||/\.\d{3}$/.test(metin))metin=metin.replace(/\./g,'');
        const sayi=Number(metin);return Number.isFinite(sayi)?Math.abs(sayi):0;
    }
function bordroIcraKesintisiniOku(satirlar){fdBdAssert();
        const icraSatirlari=(satirlar||[]).filter(satir=>/(^| )ICRA( |$)/.test(bordroMetinAnahtari(satir.metin)));
        for(const satir of icraSatirlari){
            const adaylar=String(satir.metin||'').match(/-?(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,\.]\d{1,2})?/g)||[];
            const parasal=adaylar.filter(aday=>/[,\.]\d{2}$/.test(aday.trim())),kullanilacak=parasal.length?parasal:adaylar;
            for(let i=kullanilacak.length-1;i>=0;i--){
                const tutar=bordroParaMetniniSayiyaCevir(kullanilacak[i]);
                if(tutar>0&&tutar<100000000)return{bulundu:true,tutar,satir:String(satir.metin||'').slice(0,180)};
            }
            return{bulundu:true,tutar:0,satir:String(satir.metin||'').slice(0,180)};
        }
        return{bulundu:false,tutar:0,satir:''};
    }
function bordroBesKesintisiniOku(satirlar){fdBdAssert();
        const besSatirlari=(satirlar||[]).filter(satir=>{
            const anahtar=bordroMetinAnahtari(satir.metin);
            return /(^| )BES( |$)/.test(anahtar)||anahtar.includes('BIREYSEL EMEKLILIK')||anahtar.includes('OTOMATIK KATILIM');
        });
        for(const satir of besSatirlari){
            const adaylar=String(satir.metin||'').match(/-?(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,\.]\d{1,2})?/g)||[];
            const parasal=adaylar.filter(aday=>/[,\.]\d{2}$/.test(aday.trim())),kullanilacak=parasal.length?parasal:adaylar;
            for(let i=kullanilacak.length-1;i>=0;i--){
                const tutar=bordroParaMetniniSayiyaCevir(kullanilacak[i]);
                if(tutar>0&&tutar<100000000)return{bulundu:true,tutar,satir:String(satir.metin||'').slice(0,180)};
            }
            return{bulundu:true,tutar:0,satir:String(satir.metin||'').slice(0,180)};
        }
        return{bulundu:false,tutar:0,satir:''};
    }
function bordroMaasListesiPersoneliniBul(metin){fdBdAssert();
        const ham=String(metin||''),anahtar=bordroMetinAnahtari(ham);
        const adaylar=personeller.filter(p=>aktifSirketeAit(p));
        let personel=adaylar.find(p=>{const kimlik=String(p.id||'').replace(/\D/g,'');return kimlik.length===11&&new RegExp(kimlik.split('').join('\\s*')).test(ham)});
        if(personel)return personel;
        return adaylar.filter(p=>{const ad=bordroMetinAnahtari(p.ad);return ad.length>=5&&anahtar.includes(ad)}).sort((a,b)=>String(b.ad||'').length-String(a.ad||'').length)[0]||null;
    }
function bordroMaasListesiTutariniOku(degerler){fdBdAssert();
        const metin=(Array.isArray(degerler)?degerler:[degerler]).map(v=>String(v??'')).join(' '),adaylar=metin.match(/-?(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,\.]\d{1,2})?/g)||[];
        const parasal=adaylar.filter(aday=>/[,\.]\d{2}$/.test(aday.trim())),kullanilacak=parasal.length?parasal:adaylar;
        for(let i=kullanilacak.length-1;i>=0;i--){const ham=kullanilacak[i].replace(/\D/g,'');if(ham.length===11)continue;const tutar=bordroParaMetniniSayiyaCevir(kullanilacak[i]);if(tutar>=0&&tutar<100000000)return tutar}
        return NaN;
    }
function bordroMaasListesiSatiriniEkle(harita,personel,tutar,kaynakSatir){fdBdAssert();
        if(!personel||!Number.isFinite(tutar))return false;
        harita.set(String(personel.id),{pId:String(personel.id),personelAd:String(personel.ad||personel.id),listeTutari:Number(tutar.toFixed(2)),kaynakSatir:String(kaynakSatir||'').slice(0,280)});return true;
    }
async function bordroPdfMaasListesiniOku(dosya){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        if(!window.pdfjsLib)throw new Error('PDF okuma bileşeni yüklenemedi.');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf=await fdBdAwait(window.pdfjsLib.getDocument({data:new Uint8Array(await fdBdAwait(dosya.arrayBuffer(),fdBdScope))}).promise,fdBdScope),harita=new Map(),sorunlar=[];
        try{
            for(let sayfaNo=1;sayfaNo<=pdf.numPages;sayfaNo++){
                const sayfa=await fdBdAwait(pdf.getPage(sayfaNo),fdBdScope),icerik=await fdBdAwait(sayfa.getTextContent(),fdBdScope),satirlar=bordroPdfSatirlari(icerik.items);
                satirlar.forEach(satir=>{const metin=String(satir.metin||'').trim(),personel=bordroMaasListesiPersoneliniBul(metin);if(!personel)return;const tutar=bordroMaasListesiTutariniOku(metin);if(!bordroMaasListesiSatiriniEkle(harita,personel,tutar,metin))sorunlar.push('Sayfa '+sayfaNo+': '+metin.slice(0,120))});
            }
        }finally{try{await fdBdAwait(pdf.destroy(),fdBdScope)}catch(_){if(!fdBdCurrent(fdBdScope))throw fdBdStale();}}
        return{satirlar:[...harita.values()],sorunlar};
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroExcelMaasListesiniOku(dosya){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        if(typeof XLSX==='undefined')throw new Error('Excel okuma bileşeni yüklenemedi.');
        const kitap=XLSX.read(await fdBdAwait(dosya.arrayBuffer(),fdBdScope),{type:'array',cellDates:false}),harita=new Map(),sorunlar=[];
        for(const sayfaAdi of kitap.SheetNames){
            const satirlar=XLSX.utils.sheet_to_json(kitap.Sheets[sayfaAdi],{header:1,defval:'',raw:true});if(!satirlar.length)continue;
            let baslikSirasi=-1,adSutunu=-1,tcSutunu=-1,tutarSutunu=-1;
            for(let i=0;i<Math.min(30,satirlar.length);i++){
                const anahtarlar=satirlar[i].map(bordroMetinAnahtari),adayTutar=anahtarlar.findIndex(v=>/(YATACAK|NET ODENECEK|ODENECEK NET|ODENECEK TUTAR|NET ODENEN|NET ODEME|NET TUTAR|NET UCRET|NET MAAS|MAAS TUTARI)/.test(v)),adayAd=anahtarlar.findIndex(v=>/(AD SOYAD|ADI SOYADI|PERSONEL|CALISAN)/.test(v)),adayTc=anahtarlar.findIndex(v=>/(^| )(TC|T C|TCKN|KIMLIK)( |$)/.test(v));
                if(adayTutar>=0&&(adayAd>=0||adayTc>=0)){baslikSirasi=i;adSutunu=adayAd;tcSutunu=adayTc;tutarSutunu=adayTutar;break}
            }
            const baslangic=baslikSirasi>=0?baslikSirasi+1:0;
            for(let i=baslangic;i<satirlar.length;i++){
                const satir=satirlar[i],metin=satir.map(v=>String(v??'')).join(' ').trim();if(!metin)continue;
                const kimlikMetni=[tcSutunu>=0?satir[tcSutunu]:'',adSutunu>=0?satir[adSutunu]:'',metin].join(' '),personel=bordroMaasListesiPersoneliniBul(kimlikMetni),tutar=tutarSutunu>=0?bordroParaMetniniSayiyaCevir(satir[tutarSutunu]):bordroMaasListesiTutariniOku(satir);
                if(personel){if(!bordroMaasListesiSatiriniEkle(harita,personel,tutar,metin))sorunlar.push(sayfaAdi+' / '+(i+1)+'. satır: tutar okunamadı')}
                else if(/\b\d{11}\b/.test(metin)&&Number.isFinite(tutar))sorunlar.push(sayfaAdi+' / '+(i+1)+'. satır: personel eşleşmedi');
            }
        }
        return{satirlar:[...harita.values()],sorunlar};
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroMaasListesiniOku(dosya,ext){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const sonuc=ext==='pdf'?await fdBdAwait(bordroPdfMaasListesiniOku(dosya),fdBdScope):await fdBdAwait(bordroExcelMaasListesiniOku(dosya),fdBdScope);
        if(!sonuc.satirlar.length)throw new Error('Maaş listesindeki personel ve yatacak maaş tutarları okunamadı. Dosyada personel adı veya T.C. ile “Net Ücret / Yatacak” sütunu bulunmalıdır.');
        return{satirlar:sonuc.satirlar,sorunlar:sonuc.sorunlar||[],okumaTarihi:new Date().toISOString(),dosyaAdi:String(dosya.name||'Maaş Listesi')};
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function ucretPusulalariniAyir(dosya,d,ilerleme){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        if(!window.pdfjsLib)throw new Error('PDF okuma bileşeni yüklenemedi.');
        if(!window.PDFLib?.PDFDocument)throw new Error('PDF ayırma bileşeni yüklenemedi.');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const kaynak=new Uint8Array(await fdBdAwait(dosya.arrayBuffer(),fdBdScope));
        const okuma=await fdBdAwait(window.pdfjsLib.getDocument({data:kaynak.slice()}).promise,fdBdScope);
        const kaynakPdf=await fdBdAwait(window.PDFLib.PDFDocument.load(kaynak,{ignoreEncryption:true}),fdBdScope);
        const adayPersoneller=personeller.filter(p=>aktifSirketeAit(p)&&/^\d{11}$/.test(String(p.id||'')));
        const bulunanlar=[],sorunlar=[],kullanilan=new Set(),baslikMetinleri=[];
        try{
            for(let sayfaNo=1;sayfaNo<=okuma.numPages;sayfaNo++){
                if(typeof ilerleme==='function')ilerleme(sayfaNo,okuma.numPages);
                const sayfa=await fdBdAwait(okuma.getPage(sayfaNo),fdBdScope),icerik=await fdBdAwait(sayfa.getTextContent(),fdBdScope),satirlar=bordroPdfSatirlari(icerik.items);
                const basliklar=satirlar.filter(satir=>{const n=bordroMetinAnahtari(satir.metin);return n.endsWith('UCRET PUSULASI')&&!n.includes('HESAP')}).filter((satir,index,dizi)=>index===0||Math.abs(dizi[index-1].y-satir.y)>8);
                baslikMetinleri.push(...basliklar.map(x=>x.metin));
                if(!basliklar.length){sorunlar.push({sayfa:sayfaNo,neden:'Ücret pusulası başlığı bulunamadı'});continue}
                const kaynakSayfa=kaynakPdf.getPage(sayfaNo-1),sayfaEn=kaynakSayfa.getWidth(),sayfaBoy=kaynakSayfa.getHeight();
                for(let i=0;i<basliklar.length;i++){
                    const yUst=i===0?sayfaBoy:Math.min(sayfaBoy,basliklar[i].y+basliklar[i].boy+7);
                    const yAlt=i===basliklar.length-1?0:Math.max(0,basliklar[i+1].y+basliklar[i+1].boy+7);
                    const bolumSatirlari=satirlar.filter(s=>s.y>=yAlt-2&&s.y<=yUst+2),bolumMetni=bolumSatirlari.map(s=>s.metin).join(' ');
                    const eslesenler=adayPersoneller.filter(p=>new RegExp(String(p.id).split('').join('\\s*')).test(bolumMetni));
                    if(eslesenler.length!==1){
                        const tcAdaylari=[...bolumMetni.matchAll(/(?:^|\D)(\d{11})(?!\d)/g)].map(x=>x[1]);
                        sorunlar.push({sayfa:sayfaNo,sira:i+1,neden:eslesenler.length?'Birden fazla personelle eşleşti':'Personel bulunamadı',tc:tcAdaylari[0]||''});
                        continue;
                    }
                    const personel=eslesenler[0],tc=String(personel.id);
                    if(kullanilan.has(tc)){sorunlar.push({sayfa:sayfaNo,sira:i+1,neden:'Aynı T.C. numarası dosyada birden fazla bulundu',tc});continue}
                    const yeniPdf=await fdBdAwait(window.PDFLib.PDFDocument.create(),fdBdScope);
                    const parca=await fdBdAwait(yeniPdf.embedPage(kaynakSayfa,{left:0,bottom:yAlt,right:sayfaEn,top:yUst}),fdBdScope);
                    const hedef=yeniPdf.addPage([sayfaEn,sayfaBoy]);
                    hedef.drawPage(parca,{x:0,y:sayfaBoy-(yUst-yAlt),width:sayfaEn,height:yUst-yAlt});
                    const icraKesintisi=bordroIcraKesintisiniOku(bolumSatirlari),besKesintisi=bordroBesKesintisiniOku(bolumSatirlari);
                    bulunanlar.push({tc,personelAd:String(personel.ad||tc),sayfa:sayfaNo,sira:i+1,baytlar:await fdBdAwait(yeniPdf.save({useObjectStreams:true}),fdBdScope),icraKesintisi:Number(icraKesintisi.tutar||0),icraKesintisiBulundu:Boolean(icraKesintisi.bulundu),besKesintisi:Number(besKesintisi.tutar||0),besKesintisiBulundu:Boolean(besKesintisi.bulundu)});
                    kullanilan.add(tc);
                }
            }
        }finally{try{await fdBdAwait(okuma.destroy(),fdBdScope)}catch(_){if(!fdBdCurrent(fdBdScope))throw fdBdStale();}}
        const yilAdaylari=baslikMetinleri.flatMap(metin=>String(metin).match(/\b20\d{2}\b/g)||[]);
        if(yilAdaylari.length&&!yilAdaylari.includes(String(d.yil)))throw new Error('PDF içindeki dönem '+[...new Set(yilAdaylari)].join(', ')+'; seçili puantaj dönemi ise '+d.yil+'.');
        if(!bulunanlar.length)throw new Error('PDF içindeki ücret pusulaları personel kayıtlarıyla eşleştirilemedi.');
        return{bulunanlar,sorunlar,toplam:bulunanlar.length+sorunlar.filter(x=>x.sira).length};
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function pusulaKayitlariniYukle(d=donem(),force=false){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        if(!SUPABASE_MODE||!supabaseClient||!activeUser?.sirketId)return new Map();
        const onbellekAnahtari=pusulaOnbellekAnahtari(d);
        if(!force&&pusulaCache.has(onbellekAnahtari))return pusulaHaritasi(d);
        if(pusulaYuklenenAnahtar===onbellekAnahtari)return pusulaHaritasi(d);
        pusulaYuklenenAnahtar=onbellekAnahtari;
        try{
            let sorgu=supabaseClient.from('portal_records').select('legacy_id,employee_legacy_id,data,record_year').eq('company_id',aktifSirketId()).eq('module','bordropusulalari').eq('record_year',d.yil);
            if(isPersonelUser())sorgu=sorgu.eq('employee_legacy_id',String(activeUser.tcNo||''));
            const{data,error}=await fdBdAwait(sorgu,fdBdScope);if(error)throw error;
            const harita=new Map();
            (data||[]).forEach(satir=>{const k=satir.data||{},tc=String(satir.employee_legacy_id||k.pId||'');if(k.ay===d.anahtar&&tc)harita.set(tc,{...k,id:String(k.id||satir.legacy_id),pId:tc})});
            pusulaCache.set(onbellekAnahtari,harita);return harita;
        }finally{pusulaYuklenenAnahtar=''}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroGrupServisi(veri,tekrar=true){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const body=JSON.stringify({...veri,modul:KLASOR});let sonHata;
        for(let deneme=0;deneme<(tekrar?3:1);deneme++){
            const controller=new fdBdController(),timer=setTimeout(()=>controller.abort(),90000);
            try{
                const response=await fdBdAwait(fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body,signal:controller.signal}),fdBdScope);
                const metin=await fdBdAwait(response.text(),fdBdScope);let sonuc;
                try{sonuc=JSON.parse(metin)}catch(_){if(!fdBdCurrent(fdBdScope))throw fdBdStale();throw new Error('Google dosya servisi geçici olarak yanıt veremedi.')}
                if(!response.ok||!sonuc?.basarili||!sonuc.sonuc)throw new Error(sonuc?.hata||'Bordro dosya servisi yanıt vermedi.');
                return sonuc.sonuc;
            }catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();sonHata=e;if(deneme<(tekrar?2:0))await fdBdAwait(fdBdDelay((deneme+1)*1500),fdBdScope)}
            finally{fdBdClearTimer(timer)}
        }
        throw new Error(sonHata?.name==='AbortError'?'Google dosya servisi çok uzun süre yanıt vermedi. Tamamlanan kayıtlar korunuyor.':sonHata?.message||'Bordro grubu yüklenemedi.');
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroBekleyenDosyalariTemizle(ids){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const benzersiz=[...new Set((ids||[]).filter(Boolean).map(String))];if(!benzersiz.length)return;
        for(let i=0;i<benzersiz.length;i+=100){
            try{const sonuc=await fdBdAwait(bordroGrupServisi({islem:'bordroTopluDosyaSil',dosyaIds:benzersiz.slice(i,i+100)},false),fdBdScope);
                if(sonuc.hatalar?.length)showToast?.('Belgeler kaydedildi; '+sonuc.hatalar.length+' eski Drive dosyası temizlenemedi.','warning');
            }catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.warn('Bordro eski dosya temizliği:',e);showToast?.('Belgeler kaydedildi; eski Drive dosyaları temizlenemedi.','warning')}
        }
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function pusulaKayitlariniKaydet(ayrilan,d,kaynakDosya,btn){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const eskiler=await fdBdAwait(pusulaKayitlariniYukle(d,true),fdBdScope),yeniler=new Map(),toplam=ayrilan.bulunanlar.length,temizlikler=[];
        ayrilan.temizlikDosyaIds=temizlikler;
        for(let i=0;i<toplam;){
            const grup=[];let boyut=0;
            while(i<toplam&&grup.length<4){const p=ayrilan.bulunanlar[i];if(grup.length&&boyut+p.baytlar.length>20*1024*1024)break;grup.push(p);boyut+=p.baytlar.length;i++}
            bordroIlerlet(btn,35+(yeniler.size/Math.max(1,toplam))*58,'Pusulalar yükleniyor · '+yeniler.size+' / '+toplam);
            const hazir=await fdBdAwait(Promise.all(grup.map(async parca=>({parca,ad:'UCRET_PUSULASI_'+d.anahtar+'_'+parca.tc+'_'+bordroDosyaAnahtari(parca.personelAd)+'.pdf',base64:await fdBdAwait(dosyayiBase64Oku(new Blob([parca.baytlar],{type:'application/pdf'})),fdBdScope)}))),fdBdScope);
            const sonuc=await fdBdAwait(bordroGrupServisi({islem:'bordroTopluDosyaYukle',yuklemeId:String(kaynakDosya.id),dosyalar:hazir.map(x=>({dosyaAdi:x.ad,base64:x.base64}))}),fdBdScope);
            const yuklenenler=new Map((sonuc.dosyalar||[]).map(x=>[x.ad,x])),kayitlar=[],satirlar=[];
            for(const x of hazir){
                const parca=x.parca,yuklenen=yuklenenler.get(x.ad);if(!yuklenen?.id)continue;
                const kayit={id:d.anahtar+'_'+parca.tc,kayitTipi:'ucretPusulasi',ay:d.anahtar,yil:d.yil,ayNo:d.ay+1,pId:parca.tc,personelAd:parca.personelAd,icraKesintisi:Number(parca.icraKesintisi||0),icraKesintisiOkundu:Boolean(parca.icraKesintisiBulundu),besKesintisi:Number(parca.besKesintisi||0),besKesintisiOkundu:Boolean(parca.besKesintisiBulundu),dosya:{id:yuklenen.id,url:yuklenen.url||'',ad:yuklenen.ad||x.ad,mimeType:'application/pdf',boyut:Number(yuklenen.boyut||parca.baytlar.length)},kaynakDosyaId:kaynakDosya.id,guncellemeTarihi:new Date().toISOString()};
                kayitlar.push(kayit);satirlar.push({company_id:aktifSirketId(),module:'bordropusulalari',legacy_id:kayit.id,record_year:d.yil,employee_legacy_id:parca.tc,data:kayit});
            }
            if(satirlar.length){
                const{error}=await fdBdAwait(supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'}),fdBdScope);if(error)throw error;
                for(const kayit of kayitlar){yeniler.set(kayit.pId,kayit);const eski=eskiler.get(kayit.pId);if(eski?.dosya?.id&&eski.dosya.id!==kayit.dosya.id)temizlikler.push(eski.dosya.id)}
                pusulaCache.set(pusulaOnbellekAnahtari(d),new Map([...eskiler,...yeniler]));
                bordroIlerlet(btn,35+(yeniler.size/Math.max(1,toplam))*58,'Pusulalar kaydedildi · '+yeniler.size+' / '+toplam);
            }
            if(sonuc.hatalar?.length||kayitlar.length!==grup.length)throw new Error(yeniler.size+' / '+toplam+' pusula kaydedildi; tamamlanan kayıtlar korunuyor. '+(sonuc.hatalar?.[0]?.hata||'Bazı dosyalar yüklenemedi.'));
        }
        const kaldirilacak=[...eskiler.entries()].filter(([tc])=>!yeniler.has(tc));
        if(kaldirilacak.length){const kimlikler=kaldirilacak.map(([tc,k])=>String(k.id||d.anahtar+'_'+tc));
            const{error}=await fdBdAwait(supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','bordropusulalari').in('legacy_id',kimlikler),fdBdScope);if(error)throw error;
            for(const[,eski]of kaldirilacak)if(eski?.dosya?.id)temizlikler.push(eski.dosya.id);
        }
        pusulaCache.set(pusulaOnbellekAnahtari(d),yeniler);return yeniler;
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroIcraKesintileriniKaydet(parcalar,d){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const sonuc={islenen:0,bulundu:0,acikDosyaYok:[],borcuAsan:[]},dokunuldu=new Set();
        for(const parca of parcalar||[]){
            if(!parca.icraKesintisiBulundu)continue;
            sonuc.bulundu++;
            const pId=String(parca.tc||''),tutar=Math.max(0,Number(parca.icraKesintisi||0));
            const personelIcralari=personelIcraKayitlari(pId),kaynak='puantaj_'+pId+'_'+d.anahtar;
            const oncekiKayitVar=personelIcralari.some(icra=>(Array.isArray(icra.kesintiler)?icra.kesintiler:[]).some(kesinti=>String(kesinti.id)===kaynak));
            if(tutar>0&&!aktifIcraBul(pId))icraSiradakiniAktifEt(pId);
            if(tutar>0&&!aktifIcraBul(pId)){
                sonuc.acikDosyaYok.push(parca.personelAd||pId);
                continue;
            }
            if(tutar>0||oncekiKayitVar){
                const dagitim=await fdBdAwait(puantajIcraKesintisiniGuncelle(pId,d.ay,d.yil,tutar,'bordroPusulasi'),fdBdScope);
                dokunuldu.add(pId);
                if(tutar>0&&dagitim?.islenenTutar>0)sonuc.islenen++;
                if(Number(dagitim?.artanTutar||0)>0)sonuc.borcuAsan.push((parca.personelAd||pId)+' ('+paraFormatla(dagitim.artanTutar)+')');
            }
        }
        if(dokunuldu.size)await fdBdAwait(verileriKaydet(),fdBdScope);
        return sonuc;
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function bordroBesKesintileriniKaydet(parcalar,d){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        let islenen=0;const tarihAnahtari=puantajAyAnahtari(d.ay,d.yil)+'-00';
        for(const parca of parcalar||[]){
            if(!parca.besKesintisiBulundu)continue;
            const pId=String(parca.tc||''),mevcut=maasOzetKaydiBul(pId,d.ay,d.yil),yeni={...(mevcut||{}),pId,tarih:tarihAnahtari,durum:'MAAS_OZET',kayitTipi:'maasOzet',sirketId:aktifSirketId(),besKesintisi:Math.max(0,Number(parca.besKesintisi||0)),besKesintisiManuel:'false',besKesintisiKaynak:'bordroPusulasi'};
            if(mevcut)puantajVerileri[puantajVerileri.indexOf(mevcut)]=yeni;else puantajVerileri.push(yeni);
            islenen++;
        }
        if(islenen)await fdBdAwait(verileriKaydet(),fdBdScope);
        return{islenen};
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
function bordroPuantajToplamMaasiniHesapla(personel,d){fdBdAssert();return fdHesapDonemindeCalistir(puantajAyAnahtari(d.ay,d.yil),()=>bordroPuantajToplamMaasiniHesaplaDonem(fdPersonelDonemVerisi(personel,puantajAyAnahtari(d.ay,d.yil)),d));}
function bordroPuantajToplamMaasiniHesaplaDonem(personel,d){fdBdAssert();
        const ay=d.ay,yil=d.yil,gunSayisi=new Date(yil,ay+1,0).getDate(),bugun=new Date();bugun.setHours(0,0,0,0);
        const iseGiris=tarihInputDegeri(personel.girisTarihi),isCikis=tarihInputDegeri(personel.cikisTarihi),pIzinleri=izinler.filter(i=>aktifSirketeAit(i)&&String(i.pId)===String(personel.id));
        const izinKoduBul=tarih=>{const izin=pIzinleri.find(i=>tarih>=i.baslangic&&tarih<=i.bitis);if(!izin)return'';if(izin.tur==='Yıllık İzin')return'Y';if(izin.tur==='Sağlık / Rapor')return'R';if(['Ücretli İzin','Düğün İzni','Ölüm İzni','Doğum İzni','Evlenme İzni'].includes(izin.tur))return'Ü';if(izin.tur==='Ücretsiz İzin')return'Z';if(izin.tur==='Mazeretsiz İzin')return'M';return''};
        const manuel=new Map(puantajVerileri.filter(k=>aktifSirketeAit(k)&&!k.kayitTipi&&String(k.pId)===String(personel.id)).map(k=>[String(k.tarih||''),k]));
        let toplamX=0,toplamPazar=0,toplamResmiTatil=0,toplamY=0,toplamU=0,pazarCalisma=0,resmiTatilCalisma=0;
        for(let gun=1;gun<=gunSayisi;gun++){
            const tarihNesnesi=new Date(yil,ay,gun),ayMetni=String(ay+1).padStart(2,'0'),gunMetni=String(gun).padStart(2,'0'),tarih=`${yil}-${ayMetni}-${gunMetni}`,calismaDisi=(iseGiris&&tarih<iseGiris)||(isCikis&&tarih>isCikis);let harf=calismaDisi?'-':'';
            if(!calismaDisi){
                if(tarihNesnesi.getDay()===0)harf='HS';if(sabitResmiTatiller.includes(`${ayMetni}-${gunMetni}`))harf='RT';
                const izinKodu=izinKoduBul(tarih),tatil=harf==='HS'||harf==='RT';
                if(izinKodu==='Y'||izinKodu==='Ü'){if(!tatil)harf=izinKodu}else if(['R','Z','M'].includes(izinKodu))harf=izinKodu;else if(tatil){const onceki=new Date(yil,ay,gun-1),oncekiTarih=`${onceki.getFullYear()}-${String(onceki.getMonth()+1).padStart(2,'0')}-${String(onceki.getDate()).padStart(2,'0')}`,oncekiKod=izinKoduBul(oncekiTarih);if(['R','Z','M'].includes(oncekiKod)&&!(oncekiTarih>='2026-10-01'&&['Z','M'].includes(oncekiKod)&&magicpassYarimGunResmiTatilMi(oncekiTarih)))harf=oncekiKod}
                const cihazGunTuru=typeof magicpassGunTuruBul==='function'?magicpassGunTuruBul(personel,tarih):'';if(!izinKodu&&cihazGunTuru==='pazar')harf='HS';else if(!izinKodu&&cihazGunTuru==='resmiTatil')harf='RT';else if(!izinKodu&&cihazGunTuru==='yarimResmiTatil')harf='X';
                if(!izinKodu&&tarihNesnesi<=bugun){const cihazGunu=magicpassGunHesapla(personel,tarih),hareket=Boolean(cihazGunu.giris||cihazGunu.cikis);if(cihazGunTuru==='yarimResmiTatil')harf='X';else if(hareket)harf=harf==='HS'?'PZ':(harf==='RT'?'RC':'X');else if(cihazGunu.pazarHakkiYok)harf='M';else if(cihazGunu.durum==='Gelmedi'&&harf!=='HS'&&harf!=='RT')harf='M';else if(harf!=='HS'&&harf!=='RT')harf=''}
                const elle=manuel.get(tarih);if(elle?.durum)harf=String(elle.durum).toUpperCase();
            }
            const yarimSabahDevamsiz=!calismaDisi&&!izinKoduBul(tarih)&&(!manuel.get(tarih)?.durum||String(manuel.get(tarih)?.durum).toUpperCase()==='M')&&fdYarimTatilSabahDevamsizMi(personel,tarih);
            if(yarimSabahDevamsiz)continue;
            if(harf==='X')toplamX++;else if(harf==='HS'||harf==='PZ'){if(tarihNesnesi<=bugun){toplamPazar++;if(harf==='PZ')pazarCalisma++}}else if(harf==='RT'||harf==='RC'){if(tarihNesnesi<=bugun){toplamResmiTatil++;if(harf==='RC')resmiTatilCalisma++}}else if(harf==='Y')toplamY++;else if(harf==='Ü')toplamU++;
        }
        const ozet=maasOzetKaydiBul(personel.id,ay,yil)||{},gunluk=personelGunlukUcretiniGetir(personel),ucretGunu=toplamX+toplamPazar+toplamResmiTatil+toplamY+toplamU,calismaSaati=ayarSayisi('gunlukCalismaSaati',7.5),mesai=fdPuantajMesaiAlanlari(personel,ay,yil,{ozet,gunlukCalismaSaati:calismaSaati,pazarCalisma,resmiTatilCalisma}),fazla=mesai.fazlaMesaiSaati,pazar=mesai.pazarMesaiSaati,resmi=mesai.resmiTatilMesaiSaati,primDurumu=personelPrimDurumu(personel,ay,yil),prim=String(ozet.primTutariManuel)==='true'?Number(ozet.primTutari||0):(personel.primVar==='Evet'&&primDurumu.hakkiVar?primSabitTutariniGetir():0),avans=personelAylikAvansKesintisi(personel.id,ay,yil),icra=personelIcraKayitlari(personel.id).length?personelAylikIcraKesintisi(personel.id,ay,yil):Number(ozet.icraKesintisi||0),bes=Math.max(0,Number(ozet.besKesintisi||0)),saatlik=gunluk/calismaSaati*ayarSayisi('mesaiKatsayisi',1.5);
        return Number((ucretGunu*gunluk+saatlik*(fazla+pazar+resmi)+prim-avans-icra-bes).toFixed(2));
    }
function bordroMaasKarsilastirmaModaliniKur(){fdBdAssert();}
bordroMaasKarsilastirmayiAc=function(){fdBdAssert(false);
        const d=donem(),veri=belge('banka_maas')?.maasKarsilastirma;if(!veri?.satirlar?.length){showToast?.('Karşılaştırma için Maaş Listesi dosyasını kalem düğmesinden yeniden yükleyin.','warning');return}
        bordroMaasKarsilastirmaModaliniKur();const ayBas=`${d.yil}-${String(d.ay+1).padStart(2,'0')}-01`,aySon=`${d.yil}-${String(d.ay+1).padStart(2,'0')}-${String(new Date(d.yil,d.ay+1,0).getDate()).padStart(2,'0')}`,aktifler=personeller.filter(p=>aktifSirketeAit(p)&&(!tarihInputDegeri(p.girisTarihi)||tarihInputDegeri(p.girisTarihi)<=aySon)&&(!tarihInputDegeri(p.cikisTarihi)||tarihInputDegeri(p.cikisTarihi)>=ayBas)),listeHaritasi=new Map(veri.satirlar.map(x=>[String(x.pId),x]));
        const oncekiOnbellek=fdPuantajHesapOnbelleginiBaslat();let satirlar=[];try{satirlar=aktifler.map(p=>{const liste=listeHaritasi.get(String(p.id)),puantaj=bordroPuantajToplamMaasiniHesapla(p,d),listeTutari=liste?Number(liste.listeTutari||0):null,fark=liste?Number((listeTutari-puantaj).toFixed(2)):null,uyumlu=liste&&Math.abs(fark)<=0.01;listeHaritasi.delete(String(p.id));return{personelAd:p.ad||p.id,listeTutari,puantaj,fark,uyumlu,durum:liste?(uyumlu?'Uyumlu':'Tutar farklı'):'Maaş listesinde yok'}})}finally{fdPuantajHesapOnbelleginiGeriYukle(oncekiOnbellek)}
        listeHaritasi.forEach(x=>satirlar.push({personelAd:x.personelAd||x.pId,listeTutari:Number(x.listeTutari||0),puantaj:null,fark:null,uyumlu:false,durum:'Puantajda personel yok'}));satirlar.sort((a,b)=>Number(a.uyumlu)-Number(b.uyumlu)||String(a.personelAd).localeCompare(String(b.personelAd),'tr'));
        const uyumlu=satirlar.filter(x=>x.uyumlu).length,farkli=satirlar.length-uyumlu;document.getElementById('bordroMaasKarsilastirmaBaslik').textContent='⚖ Maaş Listesi Karşılaştırması · '+d.etiket;document.getElementById('bordroMaasKarsilastirmaAltBaslik').textContent=veri.dosyaAdi+' · '+tarih(veri.okumaTarihi);document.getElementById('bordroMaasKarsilastirmaOzet').innerHTML='<article><span>Kontrol edilen</span><strong>'+satirlar.length+'</strong></article><article><span>Uyumlu</span><strong>'+uyumlu+'</strong></article><article class="'+(farkli?'hata':'')+'"><span>Farklı / eksik</span><strong>'+farkli+'</strong></article><article><span>Dosyada okunan</span><strong>'+veri.satirlar.length+'</strong></article>';
        document.getElementById('bordroMaasKarsilastirmaBody').innerHTML=satirlar.map((x,i)=>'<tr class="'+(x.uyumlu?'uyumlu':'farkli')+'"><td>'+(i+1)+'</td><td>'+esc(x.personelAd)+'</td><td class="para">'+(x.listeTutari===null?'—':paraFormatla(x.listeTutari))+'</td><td class="para">'+(x.puantaj===null?'—':paraFormatla(x.puantaj))+'</td><td class="para">'+(x.fark===null?'—':paraFormatla(x.fark))+'</td><td class="durum">'+(x.uyumlu?'✓ Uyumlu':'⚠ '+esc(x.durum))+'</td></tr>').join('');
        const sorunlar=Array.isArray(veri.sorunlar)?veri.sorunlar:[];document.getElementById('bordroMaasKarsilastirmaSorunlar').innerHTML=sorunlar.length?'<details style="margin-top:12px"><summary>'+sorunlar.length+' satır tam okunamadı</summary><ul>'+sorunlar.slice(0,30).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'';document.getElementById('bordroMaasKarsilastirmaModal').style.display='flex';
    };
async function pusulaKayitlariniSil(d){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const harita=await fdBdAwait(pusulaKayitlariniYukle(d,true),fdBdScope),kimlikler=[...harita.values()].map(k=>String(k.id||'')).filter(Boolean);
        if(kimlikler.length){const{error}=await fdBdAwait(supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','bordropusulalari').in('legacy_id',kimlikler),fdBdScope);if(error)throw error}
        for(const kayit of harita.values())if(kayit?.dosya?.id){try{await fdBdAwait(fdYazilimDriveDosyaSil(kayit.dosya.id,KLASOR),fdBdScope)}catch(hata){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.warn('Personel pusulası silinemedi:',hata)}}
        pusulaCache.set(pusulaOnbellekAnahtari(d),new Map());
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
function panelCiz(){fdBdAssert();
        const panel=document.getElementById('bordroBelgeleriPanel'),alan=document.getElementById('bordroBelgeleriKartlari'),etiket=document.getElementById('bordroBelgeleriAyEtiketi'),baslik=panel?.querySelector('.bordro-belgeleri-head strong'),toolbar=panel?.querySelector('.bordro-belgeleri-toolbar');
        if(!panel||!alan)return;
        const personelMi=isPersonelUser(),goster=(yonetebilir()||personelMi)&&String(window.puantajGorunumu||puantajGorunumu||'puantaj')==='puantaj';
        panel.style.display=goster?'block':'none';if(!goster)return;
        const lejant=document.getElementById('puanAciklamaLejandi');
        if(lejant&&panel.nextElementSibling!==lejant)lejant.parentNode.insertBefore(panel,lejant);
        panel.open=personelMi;
        const d=donem();etiket.textContent=d.etiket+(personelMi?'':' · Tüm şubeler');if(toolbar)toolbar.style.display=personelMi?'none':'flex';
        if(personelMi){
            if(baslik)baslik.textContent='📄 Ücret Pusulam';
            const tc=String(activeUser?.tcNo||''),p=pusulaHaritasi(d).get(tc),alt=p?tarih(p.guncellemeTarihi):'Bu ay için ücret pusulası yüklenmedi.';
            alan.innerHTML='<article class="bordro-belge-kart bordro-personel-karti '+(p?'var':'')+'"><span class="bordro-belge-ikon">PDF</span><div class="bordro-belge-metin"><strong>'+esc(d.etiket+' Ücret Pusulası')+'</strong><small>'+esc(alt)+'</small></div><div class="bordro-belge-islem">'+(p?'<button class="bordro-belge-gor" title="Görüntüle" onclick="bordroPersonelPusulasiGoruntule(\''+esc(tc)+'\')">👁</button><button class="bordro-belge-indir" title="İndir" onclick="bordroPersonelPusulasiIndir(\''+esc(tc)+'\')">⬇</button>':'')+'</div></article>';
            return;
        }
        if(baslik)baslik.textContent='📁 Bordro Belgeleri';
        const k=kayit(d),ayrilan=pusulaHaritasi(d).size;
        alan.innerHTML=TURLER.map(t=>{const b=k.belgeler?.[t.kod],tip=String(b?.ad||'').toLowerCase().endsWith('.pdf')?'PDF':(b?'XLS':'—'),alt=b?(t.kod==='ucret_pusulasi'&&ayrilan?ayrilan+' personele ayrıldı · '+tarih(b.guncellemeTarihi):tarih(b.guncellemeTarihi)):'Belge yüklenmedi',karsilastir=b&&t.kod==='banka_maas'?'<button class="bordro-belge-karsilastir" title="Maaşları puantajla karşılaştır" onclick="bordroMaasKarsilastirmayiAc()">⚖</button>':'';return '<article class="bordro-belge-kart '+(b?'var':'')+'"><span class="bordro-belge-ikon">'+tip+'</span><div class="bordro-belge-metin"><strong>'+esc(t.ad)+'</strong><small>'+esc(alt)+'</small></div><div class="bordro-belge-islem">'+(b?karsilastir+'<button class="bordro-belge-gor" title="Görüntüle" onclick="bordroBelgesiGoruntule(\''+t.kod+'\')">👁</button><button class="bordro-belge-indir" title="İndir" onclick="bordroBelgesiIndir(\''+t.kod+'\')">⬇</button><button class="bordro-belge-degis" title="Değiştir" onclick="bordroBelgeleriYuklemeAc(\''+t.kod+'\')">✎</button><button class="bordro-belge-sil" title="Sil" onclick="bordroBelgesiSil(\''+t.kod+'\')">🗑</button>':'<button class="bordro-belge-degis" title="Yükle" onclick="bordroBelgeleriYuklemeAc(\''+t.kod+'\')">＋</button>')+'</div></article>'}).join('');
    }
async function yukle(force=false){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const panel=document.getElementById('bordroBelgeleriPanel');if(!panel)return;
        const yetkili=yonetebilir()||isPersonelUser(),d=donem(),puantajMi=String(window.puantajGorunumu||puantajGorunumu||'puantaj')==='puantaj';
        panel.style.display=yetkili&&puantajMi?'block':'none';if(!yetkili||!puantajMi)return;
        const bordroAnahtari=bordroOnbellekAnahtari(d),pusulaAnahtari=pusulaOnbellekAnahtari(d);
        if(!force&&pusulaCache.has(pusulaAnahtari)&&(isPersonelUser()||cache.has(bordroAnahtari))){panelCiz();return}
        document.getElementById('bordroBelgeleriKartlari').innerHTML='<div style="padding:12px;color:#64748b">Belgeler yükleniyor...</div>';
        try{
            await fdBdAwait(pusulaKayitlariniYukle(d,force),fdBdScope);
            if(yonetebilir()&&(!cache.has(bordroAnahtari)||force)){
                if(yuklenenAnahtar===bordroAnahtari)return;yuklenenAnahtar=bordroAnahtari;
                const{data,error}=await fdBdAwait(supabaseClient.from('portal_settings').select('value').eq('company_id',aktifSirketId()).eq('setting_key',d.ayar).maybeSingle(),fdBdScope);if(error)throw error;
                const value=data?.value&&typeof data.value==='object'?data.value:{ay:d.anahtar,belgeler:{}};cache.set(bordroAnahtari,{ay:d.anahtar,belgeler:value.belgeler&&typeof value.belgeler==='object'?value.belgeler:{}});
            }
        }catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.error('Bordro belgeleri okunamadı:',e);if(yonetebilir()&&!cache.has(bordroAnahtari))cache.set(bordroAnahtari,{ay:d.anahtar,belgeler:{}});showToast?.('Bordro belgeleri alınamadı.','warning')}finally{yuklenenAnahtar='';panelCiz()}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
async function ayariKaydet(d,k){
const fdBdScope=fdBdRunKey();try{fdBdAssert();
const value={ay:d.anahtar,belgeler:k.belgeler||{},guncellemeTarihi:new Date().toISOString()},{error}=await fdBdAwait(supabaseClient.from('portal_settings').upsert({company_id:aktifSirketId(),setting_key:d.ayar,value},{onConflict:'company_id,setting_key'}),fdBdScope);if(error)throw error;cache.set(bordroOnbellekAnahtari(d),value)
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
function modalKur(){fdBdAssert();}
bordroBelgeleriYuklemeAc=function(odak=''){fdBdAssert(true);if(!yonetebilir())return;modalKur();const d=donem(),k=kayit(d);document.getElementById('bordroModalAy').textContent=d.etiket;document.getElementById('bordroYuklemeListesi').innerHTML=TURLER.map(t=>'<div class="bordro-yukleme-satir"><label><span>'+esc(t.ad)+'</span><small>'+(k.belgeler?.[t.kod]?'Mevcut belge var':'')+'</small></label><input id="bordroDosya_'+t.kod+'" type="file" accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div>').join('');const btn=document.getElementById('bordroTopluKaydet');btn.disabled=false;btn.classList.remove('yukleniyor');btn.style.setProperty('--p','0%');btn.textContent='Seçilen Belgeleri Yükle';document.getElementById('bordroBelgeleriModal').style.display='flex';if(odak)fdBdTimer(()=>document.getElementById('bordroDosya_'+odak)?.click(),120)};
function uzanti(f){fdBdAssert();const u=String(f.name||'').toLowerCase();return u.endsWith('.pdf')?'pdf':u.endsWith('.xlsx')?'xlsx':u.endsWith('.xls')?'xls':''}
async function bordroEskiBelgeleriTemizle(yeniId,dosyaAdi,eskiId=''){
const fdBdScope=fdBdRunKey();try{fdBdAssert();
const ad=String(dosyaAdi||''),sonNokta=ad.lastIndexOf('.'),dosyaKoku=sonNokta>0?ad.slice(0,sonNokta):ad;let sonHata=null;for(let deneme=1;deneme<=3;deneme++){try{const response=await fdBdAwait(fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({islem:'bordroBelgeKopyalariniTemizle',modul:KLASOR,korunacakDosyaId:yeniId,dosyaKoku})}),fdBdScope);const sonuc=await fdBdAwait(response.json(),fdBdScope);if(!response.ok||!sonuc?.basarili)throw new Error(sonuc?.hata||'Eski bordro belgesi temizlenemedi.');sonHata=null;break}catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();sonHata=e;if(deneme<3)await fdBdAwait(fdBdDelay(deneme*700),fdBdScope)}}if(eskiId&&String(eskiId)!==String(yeniId)){try{await fdBdAwait(fdYazilimDriveDosyaSil(eskiId,KLASOR),fdBdScope)}catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();sonHata=sonHata||e}}if(sonHata){console.warn('Eski bordro belgesi kaldırılamadı:',sonHata);showToast?.('Yeni belge kaydedildi ancak eski Drive kopyası temizlenemedi.','warning')}
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
bordroBelgeleriniTopluKaydet=async function(){
const fdBdScope=fdBdRunKey();try{fdBdAssert(true);

        if(islemde)return;
        const secilen=TURLER.map(t=>({t,f:document.getElementById('bordroDosya_'+t.kod)?.files?.[0]})).filter(x=>x.f);
        if(!secilen.length)return alert('Yüklenecek en az bir belge seçin.');
        const max=20*1024*1024;
        for(const x of secilen){if(!uzanti(x.f))return alert(x.t.ad+' için yalnızca PDF veya Excel dosyası seçebilirsiniz.');if(x.f.size>max)return alert(x.t.ad+' dosyası en fazla 20 MB olabilir.')}
        const d=donem(),uploadedAt=new Date().toISOString(),k=JSON.parse(JSON.stringify(kayit(d))),btn=document.getElementById('bordroTopluKaydet'),uyarilar=[],bordroBildirilecekler=[],temizlikler=[],eskiPusulaDosyalari=[];let icraIslenen=0,besIslenen=0,whatsappKuyrukta=0,belgeAyariDegisti=false;
        islemde=true;btn.disabled=true;btn.classList.add('yukleniyor');
        try{
            for(let i=0;i<secilen.length;i++){
                const{t,f}=secilen[i],ext=uzanti(f),mime=f.type||(ext==='pdf'?'application/pdf':ext==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/vnd.ms-excel');
                let ayrilan=null,maasKarsilastirma=null;
                if(t.kod==='ucret_pusulasi'&&ext==='pdf'){
                    bordroIlerlet(btn,5,'Ücret pusulaları inceleniyor...');
                    ayrilan=await fdBdAwait(ucretPusulalariniAyir(f,d,(sayfa,toplam)=>bordroIlerlet(btn,5+20*sayfa/Math.max(1,toplam),'Pusulalar inceleniyor · '+sayfa+' / '+toplam+' sayfa')),fdBdScope);
                    bordroIlerlet(btn,25,ayrilan.bulunanlar.length+' personel pusulası bulundu');
                }else if(t.kod==='banka_maas'){
                    bordroIlerlet(btn,8,'Maaş listesi karşılaştırma için okunuyor...');
                    try{maasKarsilastirma=await fdBdAwait(bordroMaasListesiniOku(f,ext),fdBdScope);bordroIlerlet(btn,22,maasKarsilastirma.satirlar.length+' personelin maaşı okundu')}
                    catch(hata){if(!fdBdCurrent(fdBdScope))throw fdBdStale();uyarilar.push('Maaş karşılaştırması hazırlanamadı: '+(hata.message||hata));}
                }else bordroIlerlet(btn,Math.max(6,Math.round(i/secilen.length*100)));
                const base64=await fdBdAwait(dosyayiBase64Oku(f),fdBdScope),ad='BORDRO_BELGELERI_'+d.anahtar+'_'+t.dosya+'.'+ext,eski=k.belgeler?.[t.kod]||null,yeni=await fdBdAwait(fdYazilimDriveDosyaYukle(base64,ad,mime,'',KLASOR),fdBdScope);
                k.belgeler=k.belgeler||{};
                k.belgeler[t.kod]={id:yeni.id,url:yeni.url||'',ad:yeni.ad||ad,mimeType:mime,boyut:f.size,guncellemeTarihi:new Date().toISOString(),...(maasKarsilastirma?{maasKarsilastirma}:{})};
                belgeAyariDegisti=true;
                if(ayrilan){
                    const kaydedilen=await fdBdAwait(pusulaKayitlariniKaydet(ayrilan,d,yeni,btn),fdBdScope);
                    eskiPusulaDosyalari.push(...(ayrilan.temizlikDosyaIds||[]));
                    bordroIlerlet(btn,94,'İcra kesintileri kaydediliyor...');
                    const icraSonucu=await fdBdAwait(bordroIcraKesintileriniKaydet(ayrilan.bulunanlar,d),fdBdScope);icraIslenen+=icraSonucu.islenen;
                    if(icraSonucu.acikDosyaYok.length)uyarilar.push('Ücret pusulasında icra kesintisi okundu ancak açık icra dosyası bulunamadı:\n'+icraSonucu.acikDosyaYok.join(', '));
                    if(icraSonucu.borcuAsan.length)uyarilar.push('İcra kesintisinin açık dosya bakiyesini aşan kısmı kaydedilmedi:\n'+icraSonucu.borcuAsan.join(', '));
                    bordroIlerlet(btn,95,'BES kesintileri puantaja işleniyor...');
                    const besSonucu=await fdBdAwait(bordroBesKesintileriniKaydet(ayrilan.bulunanlar,d),fdBdScope);besIslenen+=besSonucu.islenen;
                    kaydedilen.forEach((_,tc)=>{const bildirim=personelBordroBildirimiHazirla(tc,d);if(bildirim)bordroBildirilecekler.push(bildirim)});
                    k.belgeler[t.kod].ayristirilan=kaydedilen.size;k.belgeler[t.kod].eslesmeyen=ayrilan.sorunlar.length;k.belgeler[t.kod].toplamPusula=ayrilan.toplam;
                    if(ayrilan.sorunlar.length){
                        const ozet=ayrilan.sorunlar.slice(0,8).map(s=>'Sayfa '+s.sayfa+(s.sira?' / '+s.sira+'. pusula':'')+': '+s.neden+(s.tc?' ('+s.tc+')':'')).join('\n');
                        uyarilar.push(ayrilan.sorunlar.length+' pusula eşleştirilemedi:\n'+ozet+(ayrilan.sorunlar.length>8?'\n...':''));
                    }
                }else if(t.kod==='ucret_pusulasi')uyarilar.push('Personel bazında ayırma yalnızca PDF ücret pusulasında yapılır.');
                temizlikler.push({yeniId:yeni.id,dosyaAdi:ad,eskiId:eski?.id||''});
                bordroIlerlet(btn,Math.round((i+1)/secilen.length*100));
            }
            await fdBdAwait(ayariKaydet(d,k),fdBdScope);
            belgeAyariDegisti=false;
            bordroIlerlet(btn,95,'Eski dosyalar topluca temizleniyor...');
            await fdBdAwait(bordroBekleyenDosyalariTemizle(eskiPusulaDosyalari),fdBdScope);
            await fdBdAwait(Promise.all(temizlikler.map(islem=>bordroEskiBelgeleriTemizle(islem.yeniId,islem.dosyaAdi,islem.eskiId))),fdBdScope);
            temizlikler.length=0;
            if(bordroBildirilecekler.length){bordroIlerlet(btn,96,'WhatsApp bildirimleri saat 20.00 için planlanıyor...');const bildirimSonucu=await fdBdAwait(personelBordroBildirimleriniPlanla(bordroBildirilecekler,d,uploadedAt),fdBdScope);whatsappKuyrukta=Number(bildirimSonucu.kuyrukta||0);if(bildirimSonucu.basarisiz)uyarilar.push(bildirimSonucu.basarisiz+' personele ücret pusulası WhatsApp bildirimi planlanamadı.\n'+bildirimSonucu.hatalar.slice(0,5).map(x=>x.hata).join('\n'))}
            bordroIlerlet(btn,100,'Tamamlandı %100');renderPuantajMatrisi();panelCiz();showToast?.(d.etiket+' bordro belgeleri kaydedildi.'+(icraIslenen?' '+icraIslenen+' personelin icra kesintisi işlendi.':'')+(besIslenen?' '+besIslenen+' personelin BES kesintisi puantaja işlendi.':'')+(whatsappKuyrukta?' '+whatsappKuyrukta+' WhatsApp bildirimi yükleme günü saat 20.00 için planlandı; saat geçtiyse ilk uygun sırada, en az 4 dakika arayla gönderilecek.':''));
            fdBdTimer(()=>modalKapat('bordroBelgeleriModal'),450);
            if(uyarilar.length)fdBdTimer(()=>alert(uyarilar.join('\n\n')),550);
        }catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();
            if(belgeAyariDegisti){try{await fdBdAwait(ayariKaydet(d,k),fdBdScope);belgeAyariDegisti=false;await fdBdAwait(Promise.all(temizlikler.map(islem=>bordroEskiBelgeleriTemizle(islem.yeniId,islem.dosyaAdi,islem.eskiId))),fdBdScope)}catch(kayitHatasi){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.error('Kısmi bordro kaydı korunamadı:',kayitHatasi)}}
            console.error(e);alert('Yükleme tamamlanamadı; kaydedilen belgeler korunuyor. '+(e.message||e));panelCiz()
        }
        finally{islemde=false;btn.disabled=false;btn.classList.remove('yukleniyor')}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
};
function bordroOnizlemeAc(kayit,baslik,tur='toplu'){fdBdAssert();
        const dosya=kayit?.dosya||kayit;if(!dosya?.id)return;
        modalKur();onizlenen={tur,kayit};document.getElementById('bordroOnizlemeBaslik').textContent=baslik;
        document.getElementById('bordroOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(dosya.id)+'/preview';document.getElementById('bordroBelgeOnizleme').style.display='flex';
    }
bordroBelgesiGoruntule=function(kod){fdBdAssert(false);const t=TURLER.find(x=>x.kod===kod),b=belge(kod);if(b?.id)bordroOnizlemeAc(b,(t?.ad||'Belge')+' · '+donem().etiket,'toplu')};
bordroPersonelPusulasiGoruntule=async function(pId){
const fdBdScope=fdBdRunKey();try{fdBdAssert(false);

        const d=donem(),tc=String(pId||activeUser?.tcNo||'');fdBdShowOverlay?.('Ücret pusulası hazırlanıyor',d.etiket+' kaydı kontrol ediliyor...');
        try{const harita=await fdBdAwait(pusulaKayitlariniYukle(d,false),fdBdScope),p=harita.get(tc);if(!p?.dosya?.id)return showToast?.(d.etiket+' için bu personele ait ücret pusulası bulunamadı.','warning');bordroOnizlemeAc(p,(p.personelAd||'Personel')+' · '+d.etiket+' Ücret Pusulası','personel')}
        catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.error(e);showToast?.('Ücret pusulası alınamadı: '+(e.message||e),'error')}finally{fdBdHideOverlay?.()}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
};
bordroBelgeOnizlemeKapat=function(){fdBdAssert(false);document.getElementById('bordroOnizlemeFrame').src='about:blank';document.getElementById('bordroBelgeOnizleme').style.display='none';onizlenen=null};
async function bordroKaydiniIndir(kayit,varsayilanAd='Bordro_Belgesi'){
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const dosya=kayit?.dosya||kayit;if(!dosya?.id)return;
        fdBdShowOverlay?.('Belge hazırlanıyor','Dosya indirilmeye hazırlanıyor...');
        try{const d=await fdBdAwait(fdYazilimDriveDosyaIndir(dosya.id,KLASOR),fdBdScope),blob=new Blob([base64DizisineCevir(d.base64)],{type:d.mimeType||dosya.mimeType||'application/octet-stream'}),url=fdBdCreateURL(blob),a=document.createElement('a');a.href=url;a.download=d.ad||dosya.ad||varsayilanAd;document.body.appendChild(a);a.click();a.remove();fdBdTimer(()=>fdBdRevokeURL(url),1000)}catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();alert('Belge indirilemedi: '+(e.message||e))}finally{fdBdHideOverlay?.()}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
bordroBelgesiIndir=function(kod){fdBdAssert(false);const b=belge(kod);if(b)bordroKaydiniIndir(b)};
bordroPersonelPusulasiIndir=async function(pId){
const fdBdScope=fdBdRunKey();try{fdBdAssert(false);
const d=donem(),harita=await fdBdAwait(pusulaKayitlariniYukle(d,false),fdBdScope),p=harita.get(String(pId||activeUser?.tcNo||''));if(!p)return showToast?.('Bu ay için ücret pusulası bulunamadı.','warning');return bordroKaydiniIndir(p,'Ucret_Pusulasi.pdf')
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
};
bordroOnizlenenBelgeIndir=function(){fdBdAssert(false);if(onizlenen)bordroKaydiniIndir(onizlenen.kayit)};
bordroBelgesiSil=async function(kod){
const fdBdScope=fdBdRunKey();try{fdBdAssert(true);

        if(!yonetebilir())return;const d=donem(),k=JSON.parse(JSON.stringify(kayit(d))),t=TURLER.find(x=>x.kod===kod),b=k.belgeler?.[kod];if(!b)return;
        if(!await fdBdAwait(fdYuzerOnaySor(d.etiket+' '+t.ad+' belgesi'+(kod==='ucret_pusulasi'?' ve personele ayrılan pusulalar':'')+' silinsin mi?','Belgeyi Sil','Sil'),fdBdScope))return;
        fdBdShowOverlay?.('Belge siliniyor',t.ad+' kaldırılıyor...');
        try{delete k.belgeler[kod];await fdBdAwait(ayariKaydet(d,k),fdBdScope);if(kod==='ucret_pusulasi')await fdBdAwait(pusulaKayitlariniSil(d),fdBdScope);panelCiz();try{await fdBdAwait(fdYazilimDriveDosyaSil(b.id,KLASOR),fdBdScope)}catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();console.warn(e)}showToast?.(t.ad+' silindi.')}
        catch(e){if(!fdBdCurrent(fdBdScope))throw fdBdStale();alert('Belge silinemedi: '+(e.message||e))}finally{fdBdHideOverlay?.()}
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
};
bordroBelgeleriAyiDegisti=function(){fdBdAssert(false);yukle(false)};
async function personelBordroBildirimleriniPlanla(bildirimler, donem, uploadedAt) {
const fdBdScope=fdBdRunKey();try{fdBdAssert();

        const benzersiz = new Map((Array.isArray(bildirimler) ? bildirimler : [])
            .filter(item => item?.personelId && item?.mesaj).map(item => [String(item.personelId), item]));
        const sonuc = { toplam:benzersiz.size, kuyrukta:0, gonderilen:0, atlanan:0, basarisiz:0, hatalar:[] };
        const items=[...benzersiz.values()];let cursor=0;
        const worker=async()=>{while(cursor<items.length){
            const item=items[cursor++];
            try {
                if (typeof window.fdxPlanliBildirimApi !== 'function') throw new Error('Planlı WhatsApp bağlantısı hazır değil.');
                const cevap = await fdBdAwait(fdBdScheduleAPI({ action:'schedule-payslip-upsert', employeeId:String(item.personelId),
                    title:item.baslik, message:item.mesaj, messageTemplateKey:item.messageTemplateKey, period:donem.anahtar, uploadedAt }),fdBdScope);
                if (cevap?.success === false) throw new Error(cevap.message || 'Ücret pusulası mesajı planlanamadı.');
                if (cevap?.atlandi) sonuc.atlanan++;
                else if (cevap?.alreadySent) sonuc.gonderilen++;
                else if (Number(cevap?.queued || 0) > 0 || cevap?.alreadyQueued) sonuc.kuyrukta++;
                else throw new Error('Ücret pusulası mesajı planlanamadı.');
            } catch (error) {if(!fdBdCurrent(fdBdScope))throw fdBdStale();
                sonuc.basarisiz++; sonuc.hatalar.push({ personelId:String(item.personelId), hata:String(error?.message || error) });
            }
        }};
        await fdBdAwait(Promise.all(Array.from({length:Math.min(4,items.length)},()=>worker())),fdBdScope);
        if (sonuc.kuyrukta) { const alan=document.getElementById('fdWhatsappKuyrukListesi'); if(alan)delete alan.dataset.loaded; }
        return sonuc;
    
}catch(fdBdError){if(fdBdError?.fdBordroStale||!fdBdValid())return;throw fdBdError}
}
const fdBdActions={bordroMaasKarsilastirmayiAc:bordroMaasKarsilastirmayiAc,bordroBelgeleriYuklemeAc:bordroBelgeleriYuklemeAc,bordroBelgeleriniTopluKaydet:bordroBelgeleriniTopluKaydet,bordroBelgesiGoruntule:bordroBelgesiGoruntule,bordroPersonelPusulasiGoruntule:bordroPersonelPusulasiGoruntule,bordroBelgeOnizlemeKapat:bordroBelgeOnizlemeKapat,bordroBelgesiIndir:bordroBelgesiIndir,bordroPersonelPusulasiIndir:bordroPersonelPusulasiIndir,bordroOnizlenenBelgeIndir:bordroOnizlenenBelgeIndir,bordroBelgesiSil:bordroBelgesiSil,bordroBelgeleriAyiDegisti:bordroBelgeleriAyiDegisti};
return{init(){fdBdAssert();const frame=document.createElement('iframe');frame.id='bordroOnizlemeFrame';frame.title='Bordro belgesi önizleme';document.getElementById('fdBordroPreviewSlot').appendChild(frame);panelCiz();},open(options={}){fdBdAssert();if(options.action){const fn=fdBdActions[options.action];if(!fn)throw Error('Tanımsız bordro işlemi');return fn(...(options.args||[]))}return yukle(false)},api:{get bordroMaasKarsilastirmayiAc(){return bordroMaasKarsilastirmayiAc},get bordroBelgeleriYuklemeAc(){return bordroBelgeleriYuklemeAc},get bordroBelgeleriniTopluKaydet(){return bordroBelgeleriniTopluKaydet},get bordroBelgesiGoruntule(){return bordroBelgesiGoruntule},get bordroPersonelPusulasiGoruntule(){return bordroPersonelPusulasiGoruntule},get bordroBelgeOnizlemeKapat(){return bordroBelgeOnizlemeKapat},get bordroBelgesiIndir(){return bordroBelgesiIndir},get bordroPersonelPusulasiIndir(){return bordroPersonelPusulasiIndir},get bordroOnizlenenBelgeIndir(){return bordroOnizlenenBelgeIndir},get bordroBelgesiSil(){return bordroBelgesiSil},get bordroBelgeleriAyiDegisti(){return bordroBelgeleriAyiDegisti},fdBordroBelgeleriniYenile(){return yukle(false)}},dispose(){fdBdHideOverlay();fdBdDisposed=true;for(const id of fdBdTimers.keys())window.clearTimeout(id);for(const resolve of fdBdWaiters)resolve();fdBdWaiters.clear();fdBdTimers.clear();for(const c of fdBdControllers)c.abort();fdBdControllers.clear();for(const url of fdBdURLs)URL.revokeObjectURL(url);fdBdURLs.clear();document.getElementById('bordroOnizlemeFrame')?.setAttribute('src','about:blank');for(const id of ['bordroBelgeleriModal','bordroBelgeOnizleme','bordroMaasKarsilastirmaModal'])document.getElementById(id)?.querySelectorAll('input[type=file]').forEach(e=>e.value='');cache.clear();pusulaCache.clear();onizlenen=null;islemde=false;}};
});

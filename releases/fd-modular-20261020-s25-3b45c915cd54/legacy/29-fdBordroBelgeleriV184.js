
(function(){
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
    function donem(){const yil=Number(document.getElementById('puanYilSec')?.value||new Date().getFullYear()),ay=Number(document.getElementById('puanAySec')?.value||new Date().getMonth());return{yil,ay,anahtar:yil+'_'+String(ay+1).padStart(2,'0'),etiket:aylar[ay]+' '+yil,ayar:'bordro_belgeleri_'+yil+'_'+String(ay+1).padStart(2,'0')}}
    function bordroOnbellekAnahtari(d=donem()){return String(aktifSirketId()||'sirket-yok')+'|'+d.anahtar}
    function pusulaOnbellekAnahtari(d=donem()){return bordroOnbellekAnahtari(d)+'|'+(isPersonelUser()?('personel:'+String(activeUser?.tcNo||'')):'yonetim')}
    function yonetebilir(){return typeof isManagerUser==='function'&&isManagerUser()&&!isPersonelUser()}
    function esc(v){return typeof fdEsc==='function'?fdEsc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
    function kayit(d){return cache.get(bordroOnbellekAnahtari(d))||{ay:d.anahtar,belgeler:{}}}
    function belge(kod){return kayit(donem()).belgeler?.[kod]||null}
    function tarih(v){if(!v)return 'Yüklendi';try{return new Date(v).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})}catch(_){return 'Yüklendi'}}
    function bordroMetinAnahtari(v){return String(v||'').replace(/ı/g,'i').replace(/İ/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
    function bordroDosyaAnahtari(v){return bordroMetinAnahtari(v).replace(/\s+/g,'_').replace(/[^A-Z0-9_]/g,'').slice(0,80)||'PERSONEL'}
    function pusulaHaritasi(d=donem()){return pusulaCache.get(pusulaOnbellekAnahtari(d))||new Map()}
    function bordroIlerlet(btn,yuzde,metin){const oran=Math.max(0,Math.min(100,Math.round(yuzde)));btn.style.setProperty('--p',oran+'%');btn.textContent=metin||('Yükleniyor %'+oran)}
    function bordroPdfSatirlari(items){
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
    function bordroParaMetniniSayiyaCevir(deger){
        let metin=String(deger||'').replace(/\s+/g,'').replace(/[^0-9,.-]/g,'');
        if(!metin)return 0;
        if(metin.includes(','))metin=metin.replace(/\./g,'').replace(',','.');
        else if((metin.match(/\./g)||[]).length>1||/\.\d{3}$/.test(metin))metin=metin.replace(/\./g,'');
        const sayi=Number(metin);return Number.isFinite(sayi)?Math.abs(sayi):0;
    }
    function bordroIcraKesintisiniOku(satirlar){
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
    function bordroBesKesintisiniOku(satirlar){
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
    function bordroMaasListesiPersoneliniBul(metin){
        const ham=String(metin||''),anahtar=bordroMetinAnahtari(ham);
        const adaylar=personeller.filter(p=>aktifSirketeAit(p));
        let personel=adaylar.find(p=>{const kimlik=String(p.id||'').replace(/\D/g,'');return kimlik.length===11&&new RegExp(kimlik.split('').join('\\s*')).test(ham)});
        if(personel)return personel;
        return adaylar.filter(p=>{const ad=bordroMetinAnahtari(p.ad);return ad.length>=5&&anahtar.includes(ad)}).sort((a,b)=>String(b.ad||'').length-String(a.ad||'').length)[0]||null;
    }
    function bordroMaasListesiTutariniOku(degerler){
        const metin=(Array.isArray(degerler)?degerler:[degerler]).map(v=>String(v??'')).join(' '),adaylar=metin.match(/-?(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,\.]\d{1,2})?/g)||[];
        const parasal=adaylar.filter(aday=>/[,\.]\d{2}$/.test(aday.trim())),kullanilacak=parasal.length?parasal:adaylar;
        for(let i=kullanilacak.length-1;i>=0;i--){const ham=kullanilacak[i].replace(/\D/g,'');if(ham.length===11)continue;const tutar=bordroParaMetniniSayiyaCevir(kullanilacak[i]);if(tutar>=0&&tutar<100000000)return tutar}
        return NaN;
    }
    function bordroMaasListesiSatiriniEkle(harita,personel,tutar,kaynakSatir){
        if(!personel||!Number.isFinite(tutar))return false;
        harita.set(String(personel.id),{pId:String(personel.id),personelAd:String(personel.ad||personel.id),listeTutari:Number(tutar.toFixed(2)),kaynakSatir:String(kaynakSatir||'').slice(0,280)});return true;
    }
    async function bordroPdfMaasListesiniOku(dosya){
        if(!window.pdfjsLib)throw new Error('PDF okuma bileşeni yüklenemedi.');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await dosya.arrayBuffer())}).promise,harita=new Map(),sorunlar=[];
        try{
            for(let sayfaNo=1;sayfaNo<=pdf.numPages;sayfaNo++){
                const sayfa=await pdf.getPage(sayfaNo),icerik=await sayfa.getTextContent(),satirlar=bordroPdfSatirlari(icerik.items);
                satirlar.forEach(satir=>{const metin=String(satir.metin||'').trim(),personel=bordroMaasListesiPersoneliniBul(metin);if(!personel)return;const tutar=bordroMaasListesiTutariniOku(metin);if(!bordroMaasListesiSatiriniEkle(harita,personel,tutar,metin))sorunlar.push('Sayfa '+sayfaNo+': '+metin.slice(0,120))});
            }
        }finally{try{await pdf.destroy()}catch(_){}}
        return{satirlar:[...harita.values()],sorunlar};
    }
    async function bordroExcelMaasListesiniOku(dosya){
        if(typeof XLSX==='undefined')throw new Error('Excel okuma bileşeni yüklenemedi.');
        const kitap=XLSX.read(await dosya.arrayBuffer(),{type:'array',cellDates:false}),harita=new Map(),sorunlar=[];
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
    }
    async function bordroMaasListesiniOku(dosya,ext){
        const sonuc=ext==='pdf'?await bordroPdfMaasListesiniOku(dosya):await bordroExcelMaasListesiniOku(dosya);
        if(!sonuc.satirlar.length)throw new Error('Maaş listesindeki personel ve yatacak maaş tutarları okunamadı. Dosyada personel adı veya T.C. ile “Net Ücret / Yatacak” sütunu bulunmalıdır.');
        return{satirlar:sonuc.satirlar,sorunlar:sonuc.sorunlar||[],okumaTarihi:new Date().toISOString(),dosyaAdi:String(dosya.name||'Maaş Listesi')};
    }
    async function ucretPusulalariniAyir(dosya,d,ilerleme){
        if(!window.pdfjsLib)throw new Error('PDF okuma bileşeni yüklenemedi.');
        if(!window.PDFLib?.PDFDocument)throw new Error('PDF ayırma bileşeni yüklenemedi.');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const kaynak=new Uint8Array(await dosya.arrayBuffer());
        const okuma=await window.pdfjsLib.getDocument({data:kaynak.slice()}).promise;
        const kaynakPdf=await window.PDFLib.PDFDocument.load(kaynak,{ignoreEncryption:true});
        const adayPersoneller=personeller.filter(p=>aktifSirketeAit(p)&&/^\d{11}$/.test(String(p.id||'')));
        const bulunanlar=[],sorunlar=[],kullanilan=new Set(),baslikMetinleri=[];
        try{
            for(let sayfaNo=1;sayfaNo<=okuma.numPages;sayfaNo++){
                if(typeof ilerleme==='function')ilerleme(sayfaNo,okuma.numPages);
                const sayfa=await okuma.getPage(sayfaNo),icerik=await sayfa.getTextContent(),satirlar=bordroPdfSatirlari(icerik.items);
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
                    const yeniPdf=await window.PDFLib.PDFDocument.create();
                    const parca=await yeniPdf.embedPage(kaynakSayfa,{left:0,bottom:yAlt,right:sayfaEn,top:yUst});
                    const hedef=yeniPdf.addPage([sayfaEn,sayfaBoy]);
                    hedef.drawPage(parca,{x:0,y:sayfaBoy-(yUst-yAlt),width:sayfaEn,height:yUst-yAlt});
                    const icraKesintisi=bordroIcraKesintisiniOku(bolumSatirlari),besKesintisi=bordroBesKesintisiniOku(bolumSatirlari);
                    bulunanlar.push({tc,personelAd:String(personel.ad||tc),sayfa:sayfaNo,sira:i+1,baytlar:await yeniPdf.save({useObjectStreams:true}),icraKesintisi:Number(icraKesintisi.tutar||0),icraKesintisiBulundu:Boolean(icraKesintisi.bulundu),besKesintisi:Number(besKesintisi.tutar||0),besKesintisiBulundu:Boolean(besKesintisi.bulundu)});
                    kullanilan.add(tc);
                }
            }
        }finally{try{await okuma.destroy()}catch(_){}}
        const yilAdaylari=baslikMetinleri.flatMap(metin=>String(metin).match(/\b20\d{2}\b/g)||[]);
        if(yilAdaylari.length&&!yilAdaylari.includes(String(d.yil)))throw new Error('PDF içindeki dönem '+[...new Set(yilAdaylari)].join(', ')+'; seçili puantaj dönemi ise '+d.yil+'.');
        if(!bulunanlar.length)throw new Error('PDF içindeki ücret pusulaları personel kayıtlarıyla eşleştirilemedi.');
        return{bulunanlar,sorunlar,toplam:bulunanlar.length+sorunlar.filter(x=>x.sira).length};
    }
    async function pusulaKayitlariniYukle(d=donem(),force=false){
        if(!SUPABASE_MODE||!supabaseClient||!activeUser?.sirketId)return new Map();
        const onbellekAnahtari=pusulaOnbellekAnahtari(d);
        if(!force&&pusulaCache.has(onbellekAnahtari))return pusulaHaritasi(d);
        if(pusulaYuklenenAnahtar===onbellekAnahtari)return pusulaHaritasi(d);
        pusulaYuklenenAnahtar=onbellekAnahtari;
        try{
            let sorgu=supabaseClient.from('portal_records').select('legacy_id,employee_legacy_id,data,record_year').eq('company_id',aktifSirketId()).eq('module','bordropusulalari').eq('record_year',d.yil);
            if(isPersonelUser())sorgu=sorgu.eq('employee_legacy_id',String(activeUser.tcNo||''));
            const{data,error}=await sorgu;if(error)throw error;
            const harita=new Map();
            (data||[]).forEach(satir=>{const k=satir.data||{},tc=String(satir.employee_legacy_id||k.pId||'');if(k.ay===d.anahtar&&tc)harita.set(tc,{...k,id:String(k.id||satir.legacy_id),pId:tc})});
            pusulaCache.set(onbellekAnahtari,harita);return harita;
        }finally{pusulaYuklenenAnahtar=''}
    }
    async function bordroGrupServisi(veri,tekrar=true){
        const body=JSON.stringify({...veri,modul:KLASOR});let sonHata;
        for(let deneme=0;deneme<(tekrar?3:1);deneme++){
            const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
            try{
                const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body,signal:controller.signal});
                const metin=await response.text();let sonuc;
                try{sonuc=JSON.parse(metin)}catch(_){throw new Error('Google dosya servisi geçici olarak yanıt veremedi.')}
                if(!response.ok||!sonuc?.basarili||!sonuc.sonuc)throw new Error(sonuc?.hata||'Bordro dosya servisi yanıt vermedi.');
                return sonuc.sonuc;
            }catch(e){sonHata=e;if(deneme<(tekrar?2:0))await new Promise(resolve=>setTimeout(resolve,(deneme+1)*1500))}
            finally{clearTimeout(timer)}
        }
        throw new Error(sonHata?.name==='AbortError'?'Google dosya servisi çok uzun süre yanıt vermedi. Tamamlanan kayıtlar korunuyor.':sonHata?.message||'Bordro grubu yüklenemedi.');
    }
    async function bordroBekleyenDosyalariTemizle(ids){
        const benzersiz=[...new Set((ids||[]).filter(Boolean).map(String))];if(!benzersiz.length)return;
        for(let i=0;i<benzersiz.length;i+=100){
            try{const sonuc=await bordroGrupServisi({islem:'bordroTopluDosyaSil',dosyaIds:benzersiz.slice(i,i+100)},false);
                if(sonuc.hatalar?.length)showToast?.('Belgeler kaydedildi; '+sonuc.hatalar.length+' eski Drive dosyası temizlenemedi.','warning');
            }catch(e){console.warn('Bordro eski dosya temizliği:',e);showToast?.('Belgeler kaydedildi; eski Drive dosyaları temizlenemedi.','warning')}
        }
    }
    async function pusulaKayitlariniKaydet(ayrilan,d,kaynakDosya,btn){
        const eskiler=await pusulaKayitlariniYukle(d,true),yeniler=new Map(),toplam=ayrilan.bulunanlar.length,temizlikler=[];
        ayrilan.temizlikDosyaIds=temizlikler;
        for(let i=0;i<toplam;){
            const grup=[];let boyut=0;
            while(i<toplam&&grup.length<4){const p=ayrilan.bulunanlar[i];if(grup.length&&boyut+p.baytlar.length>20*1024*1024)break;grup.push(p);boyut+=p.baytlar.length;i++}
            bordroIlerlet(btn,35+(yeniler.size/Math.max(1,toplam))*58,'Pusulalar yükleniyor · '+yeniler.size+' / '+toplam);
            const hazir=await Promise.all(grup.map(async parca=>({parca,ad:'UCRET_PUSULASI_'+d.anahtar+'_'+parca.tc+'_'+bordroDosyaAnahtari(parca.personelAd)+'.pdf',base64:await dosyayiBase64Oku(new Blob([parca.baytlar],{type:'application/pdf'}))})));
            const sonuc=await bordroGrupServisi({islem:'bordroTopluDosyaYukle',yuklemeId:String(kaynakDosya.id),dosyalar:hazir.map(x=>({dosyaAdi:x.ad,base64:x.base64}))});
            const yuklenenler=new Map((sonuc.dosyalar||[]).map(x=>[x.ad,x])),kayitlar=[],satirlar=[];
            for(const x of hazir){
                const parca=x.parca,yuklenen=yuklenenler.get(x.ad);if(!yuklenen?.id)continue;
                const kayit={id:d.anahtar+'_'+parca.tc,kayitTipi:'ucretPusulasi',ay:d.anahtar,yil:d.yil,ayNo:d.ay+1,pId:parca.tc,personelAd:parca.personelAd,icraKesintisi:Number(parca.icraKesintisi||0),icraKesintisiOkundu:Boolean(parca.icraKesintisiBulundu),besKesintisi:Number(parca.besKesintisi||0),besKesintisiOkundu:Boolean(parca.besKesintisiBulundu),dosya:{id:yuklenen.id,url:yuklenen.url||'',ad:yuklenen.ad||x.ad,mimeType:'application/pdf',boyut:Number(yuklenen.boyut||parca.baytlar.length)},kaynakDosyaId:kaynakDosya.id,guncellemeTarihi:new Date().toISOString()};
                kayitlar.push(kayit);satirlar.push({company_id:aktifSirketId(),module:'bordropusulalari',legacy_id:kayit.id,record_year:d.yil,employee_legacy_id:parca.tc,data:kayit});
            }
            if(satirlar.length){
                const{error}=await supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'});if(error)throw error;
                for(const kayit of kayitlar){yeniler.set(kayit.pId,kayit);const eski=eskiler.get(kayit.pId);if(eski?.dosya?.id&&eski.dosya.id!==kayit.dosya.id)temizlikler.push(eski.dosya.id)}
                pusulaCache.set(pusulaOnbellekAnahtari(d),new Map([...eskiler,...yeniler]));
                bordroIlerlet(btn,35+(yeniler.size/Math.max(1,toplam))*58,'Pusulalar kaydedildi · '+yeniler.size+' / '+toplam);
            }
            if(sonuc.hatalar?.length||kayitlar.length!==grup.length)throw new Error(yeniler.size+' / '+toplam+' pusula kaydedildi; tamamlanan kayıtlar korunuyor. '+(sonuc.hatalar?.[0]?.hata||'Bazı dosyalar yüklenemedi.'));
        }
        const kaldirilacak=[...eskiler.entries()].filter(([tc])=>!yeniler.has(tc));
        if(kaldirilacak.length){const kimlikler=kaldirilacak.map(([tc,k])=>String(k.id||d.anahtar+'_'+tc));
            const{error}=await supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','bordropusulalari').in('legacy_id',kimlikler);if(error)throw error;
            for(const[,eski]of kaldirilacak)if(eski?.dosya?.id)temizlikler.push(eski.dosya.id);
        }
        pusulaCache.set(pusulaOnbellekAnahtari(d),yeniler);return yeniler;
    }
    async function bordroIcraKesintileriniKaydet(parcalar,d){
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
                const dagitim=await puantajIcraKesintisiniGuncelle(pId,d.ay,d.yil,tutar,'bordroPusulasi');
                dokunuldu.add(pId);
                if(tutar>0&&dagitim?.islenenTutar>0)sonuc.islenen++;
                if(Number(dagitim?.artanTutar||0)>0)sonuc.borcuAsan.push((parca.personelAd||pId)+' ('+paraFormatla(dagitim.artanTutar)+')');
            }
        }
        if(dokunuldu.size)await verileriKaydet();
        return sonuc;
    }
    async function bordroBesKesintileriniKaydet(parcalar,d){
        let islenen=0;const tarihAnahtari=puantajAyAnahtari(d.ay,d.yil)+'-00';
        for(const parca of parcalar||[]){
            if(!parca.besKesintisiBulundu)continue;
            const pId=String(parca.tc||''),mevcut=maasOzetKaydiBul(pId,d.ay,d.yil),yeni={...(mevcut||{}),pId,tarih:tarihAnahtari,durum:'MAAS_OZET',kayitTipi:'maasOzet',sirketId:aktifSirketId(),besKesintisi:Math.max(0,Number(parca.besKesintisi||0)),besKesintisiManuel:'false',besKesintisiKaynak:'bordroPusulasi'};
            if(mevcut)puantajVerileri[puantajVerileri.indexOf(mevcut)]=yeni;else puantajVerileri.push(yeni);
            islenen++;
        }
        if(islenen)await verileriKaydet();
        return{islenen};
    }
    function bordroPuantajToplamMaasiniHesapla(personel,d){return fdHesapDonemindeCalistir(puantajAyAnahtari(d.ay,d.yil),()=>bordroPuantajToplamMaasiniHesaplaDonem(fdPersonelDonemVerisi(personel,puantajAyAnahtari(d.ay,d.yil)),d));}
    function bordroPuantajToplamMaasiniHesaplaDonem(personel,d){
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
                if(izinKodu==='Y'||izinKodu==='Ü'){if(!tatil)harf=izinKodu}else if(['R','Z','M'].includes(izinKodu))harf=izinKodu;else if(tatil){const onceki=new Date(yil,ay,gun-1),oncekiTarih=`${onceki.getFullYear()}-${String(onceki.getMonth()+1).padStart(2,'0')}-${String(onceki.getDate()).padStart(2,'0')}`,oncekiKod=izinKoduBul(oncekiTarih);if(['R','Z','M'].includes(oncekiKod))harf=oncekiKod}
                const cihazGunTuru=typeof magicpassGunTuruBul==='function'?magicpassGunTuruBul(personel,tarih):'';if(!izinKodu&&cihazGunTuru==='pazar')harf='HS';else if(!izinKodu&&cihazGunTuru==='resmiTatil')harf='RT';else if(!izinKodu&&cihazGunTuru==='yarimResmiTatil')harf='X';
                if(!izinKodu&&tarihNesnesi<=bugun){const cihazGunu=magicpassGunHesapla(personel,tarih),hareket=Boolean(cihazGunu.giris||cihazGunu.cikis);if(cihazGunTuru==='yarimResmiTatil')harf='X';else if(hareket)harf=harf==='HS'?'PZ':(harf==='RT'?'RC':'X');else if(cihazGunu.pazarHakkiYok)harf='M';else if(cihazGunu.durum==='Gelmedi'&&harf!=='HS'&&harf!=='RT')harf='M';else if(harf!=='HS'&&harf!=='RT')harf=''}
                const elle=manuel.get(tarih);if(elle?.durum)harf=String(elle.durum).toUpperCase();
            }
            if(harf==='X')toplamX++;else if(harf==='HS'||harf==='PZ'){if(tarihNesnesi<=bugun){toplamPazar++;if(harf==='PZ')pazarCalisma++}}else if(harf==='RT'||harf==='RC'){if(tarihNesnesi<=bugun){toplamResmiTatil++;if(harf==='RC')resmiTatilCalisma++}}else if(harf==='Y')toplamY++;else if(harf==='Ü')toplamU++;
        }
        const ozet=maasOzetKaydiBul(personel.id,ay,yil)||{},gunluk=personelGunlukUcretiniGetir(personel),ucretGunu=toplamX+toplamPazar+toplamResmiTatil+toplamY+toplamU,calismaSaati=ayarSayisi('gunlukCalismaSaati',7.5),fazla=String(ozet.fazlaMesaiSaatiManuel)==='true'?Number(ozet.fazlaMesaiSaati||0):magicpassAylikMesaiSaati(personel,ay,yil),pazar=String(ozet.pazarMesaiSaatiManuel)==='true'?Number(ozet.pazarMesaiSaati||0):magicpassBirlesikMesaiDonemiMi(personel,ay,yil)?0:pazarCalisma*calismaSaati,resmi=String(ozet.resmiTatilMesaiSaatiManuel)==='true'?Number(ozet.resmiTatilMesaiSaati||0):magicpassBirlesikMesaiDonemiMi(personel,ay,yil)?0:resmiTatilCalisma*calismaSaati+magicpassAylikYarimResmiTatilMesaiSaati(personel,ay,yil),primDurumu=personelPrimDurumu(personel,ay,yil),prim=String(ozet.primTutariManuel)==='true'?Number(ozet.primTutari||0):(personel.primVar==='Evet'&&primDurumu.hakkiVar?primSabitTutariniGetir():0),avans=personelAylikAvansKesintisi(personel.id,ay,yil),icra=personelIcraKayitlari(personel.id).length?personelAylikIcraKesintisi(personel.id,ay,yil):Number(ozet.icraKesintisi||0),bes=Math.max(0,Number(ozet.besKesintisi||0)),saatlik=gunluk/calismaSaati*ayarSayisi('mesaiKatsayisi',1.5);
        return Number((ucretGunu*gunluk+saatlik*(fazla+pazar+resmi)+prim-avans-icra-bes).toFixed(2));
    }
    function bordroMaasKarsilastirmaModaliniKur(){
        if(document.getElementById('bordroMaasKarsilastirmaModal'))return;const modal=document.createElement('div');modal.id='bordroMaasKarsilastirmaModal';modal.className='modal-overlay';modal.style.zIndex='10080';modal.innerHTML='<div class="modal-card bordro-maas-karsilastirma-kart"><div class="modal-header"><div><h3 id="bordroMaasKarsilastirmaBaslik">⚖ Maaş Listesi Karşılaştırması</h3><small id="bordroMaasKarsilastirmaAltBaslik"></small></div><button class="modal-close" onclick="modalKapat(\'bordroMaasKarsilastirmaModal\')">✕</button></div><div class="modal-body"><p class="bordro-maas-karsilastirma-not">Genel muhasebeden gelen listedeki <strong>yatacak maaş</strong>, puantaj tablosundaki <strong>Toplam Maaş</strong> ile karşılaştırılır. Bir kuruştan büyük farklar kırmızı gösterilir.</p><div id="bordroMaasKarsilastirmaOzet" class="bordro-maas-ozet"></div><div class="table-wrapper"><table class="bordro-maas-karsilastirma-tablo"><thead><tr><th>#</th><th>Personel</th><th class="para">Maaş Listesi<br>(Yatacak)</th><th class="para">Puantaj Tablosu<br>(Toplam Maaş)</th><th class="para">Fark</th><th>Durum</th></tr></thead><tbody id="bordroMaasKarsilastirmaBody"></tbody></table></div><div id="bordroMaasKarsilastirmaSorunlar"></div></div></div>';document.body.appendChild(modal);
    }
    window.bordroMaasKarsilastirmayiAc=function(){
        const d=donem(),veri=belge('banka_maas')?.maasKarsilastirma;if(!veri?.satirlar?.length){showToast?.('Karşılaştırma için Maaş Listesi dosyasını kalem düğmesinden yeniden yükleyin.','warning');return}
        bordroMaasKarsilastirmaModaliniKur();const ayBas=`${d.yil}-${String(d.ay+1).padStart(2,'0')}-01`,aySon=`${d.yil}-${String(d.ay+1).padStart(2,'0')}-${String(new Date(d.yil,d.ay+1,0).getDate()).padStart(2,'0')}`,aktifler=personeller.filter(p=>aktifSirketeAit(p)&&(!tarihInputDegeri(p.girisTarihi)||tarihInputDegeri(p.girisTarihi)<=aySon)&&(!tarihInputDegeri(p.cikisTarihi)||tarihInputDegeri(p.cikisTarihi)>=ayBas)),listeHaritasi=new Map(veri.satirlar.map(x=>[String(x.pId),x]));
        const oncekiOnbellek=fdPuantajHesapOnbelleginiBaslat();let satirlar=[];try{satirlar=aktifler.map(p=>{const liste=listeHaritasi.get(String(p.id)),puantaj=bordroPuantajToplamMaasiniHesapla(p,d),listeTutari=liste?Number(liste.listeTutari||0):null,fark=liste?Number((listeTutari-puantaj).toFixed(2)):null,uyumlu=liste&&Math.abs(fark)<=0.01;listeHaritasi.delete(String(p.id));return{personelAd:p.ad||p.id,listeTutari,puantaj,fark,uyumlu,durum:liste?(uyumlu?'Uyumlu':'Tutar farklı'):'Maaş listesinde yok'}})}finally{fdPuantajHesapOnbelleginiGeriYukle(oncekiOnbellek)}
        listeHaritasi.forEach(x=>satirlar.push({personelAd:x.personelAd||x.pId,listeTutari:Number(x.listeTutari||0),puantaj:null,fark:null,uyumlu:false,durum:'Puantajda personel yok'}));satirlar.sort((a,b)=>Number(a.uyumlu)-Number(b.uyumlu)||String(a.personelAd).localeCompare(String(b.personelAd),'tr'));
        const uyumlu=satirlar.filter(x=>x.uyumlu).length,farkli=satirlar.length-uyumlu;document.getElementById('bordroMaasKarsilastirmaBaslik').textContent='⚖ Maaş Listesi Karşılaştırması · '+d.etiket;document.getElementById('bordroMaasKarsilastirmaAltBaslik').textContent=veri.dosyaAdi+' · '+tarih(veri.okumaTarihi);document.getElementById('bordroMaasKarsilastirmaOzet').innerHTML='<article><span>Kontrol edilen</span><strong>'+satirlar.length+'</strong></article><article><span>Uyumlu</span><strong>'+uyumlu+'</strong></article><article class="'+(farkli?'hata':'')+'"><span>Farklı / eksik</span><strong>'+farkli+'</strong></article><article><span>Dosyada okunan</span><strong>'+veri.satirlar.length+'</strong></article>';
        document.getElementById('bordroMaasKarsilastirmaBody').innerHTML=satirlar.map((x,i)=>'<tr class="'+(x.uyumlu?'uyumlu':'farkli')+'"><td>'+(i+1)+'</td><td>'+esc(x.personelAd)+'</td><td class="para">'+(x.listeTutari===null?'—':paraFormatla(x.listeTutari))+'</td><td class="para">'+(x.puantaj===null?'—':paraFormatla(x.puantaj))+'</td><td class="para">'+(x.fark===null?'—':paraFormatla(x.fark))+'</td><td class="durum">'+(x.uyumlu?'✓ Uyumlu':'⚠ '+esc(x.durum))+'</td></tr>').join('');
        const sorunlar=Array.isArray(veri.sorunlar)?veri.sorunlar:[];document.getElementById('bordroMaasKarsilastirmaSorunlar').innerHTML=sorunlar.length?'<details style="margin-top:12px"><summary>'+sorunlar.length+' satır tam okunamadı</summary><ul>'+sorunlar.slice(0,30).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'';document.getElementById('bordroMaasKarsilastirmaModal').style.display='flex';
    };
    async function pusulaKayitlariniSil(d){
        const harita=await pusulaKayitlariniYukle(d,true),kimlikler=[...harita.values()].map(k=>String(k.id||'')).filter(Boolean);
        if(kimlikler.length){const{error}=await supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','bordropusulalari').in('legacy_id',kimlikler);if(error)throw error}
        for(const kayit of harita.values())if(kayit?.dosya?.id){try{await fdYazilimDriveDosyaSil(kayit.dosya.id,KLASOR)}catch(hata){console.warn('Personel pusulası silinemedi:',hata)}}
        pusulaCache.set(pusulaOnbellekAnahtari(d),new Map());
    }
    function panelCiz(){
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
        const panel=document.getElementById('bordroBelgeleriPanel');if(!panel)return;
        const yetkili=yonetebilir()||isPersonelUser(),d=donem(),puantajMi=String(window.puantajGorunumu||puantajGorunumu||'puantaj')==='puantaj';
        panel.style.display=yetkili&&puantajMi?'block':'none';if(!yetkili||!puantajMi)return;
        const bordroAnahtari=bordroOnbellekAnahtari(d),pusulaAnahtari=pusulaOnbellekAnahtari(d);
        if(!force&&pusulaCache.has(pusulaAnahtari)&&(isPersonelUser()||cache.has(bordroAnahtari))){panelCiz();return}
        document.getElementById('bordroBelgeleriKartlari').innerHTML='<div style="padding:12px;color:#64748b">Belgeler yükleniyor...</div>';
        try{
            await pusulaKayitlariniYukle(d,force);
            if(yonetebilir()&&(!cache.has(bordroAnahtari)||force)){
                if(yuklenenAnahtar===bordroAnahtari)return;yuklenenAnahtar=bordroAnahtari;
                const{data,error}=await supabaseClient.from('portal_settings').select('value').eq('company_id',aktifSirketId()).eq('setting_key',d.ayar).maybeSingle();if(error)throw error;
                const value=data?.value&&typeof data.value==='object'?data.value:{ay:d.anahtar,belgeler:{}};cache.set(bordroAnahtari,{ay:d.anahtar,belgeler:value.belgeler&&typeof value.belgeler==='object'?value.belgeler:{}});
            }
        }catch(e){console.error('Bordro belgeleri okunamadı:',e);if(yonetebilir()&&!cache.has(bordroAnahtari))cache.set(bordroAnahtari,{ay:d.anahtar,belgeler:{}});showToast?.('Bordro belgeleri alınamadı.','warning')}finally{yuklenenAnahtar='';panelCiz()}
    }
    async function ayariKaydet(d,k){const value={ay:d.anahtar,belgeler:k.belgeler||{},guncellemeTarihi:new Date().toISOString()},{error}=await supabaseClient.from('portal_settings').upsert({company_id:aktifSirketId(),setting_key:d.ayar,value},{onConflict:'company_id,setting_key'});if(error)throw error;cache.set(bordroOnbellekAnahtari(d),value)}
    function modalKur(){if(document.getElementById('bordroBelgeleriModal'))return;const m=document.createElement('div');m.id='bordroBelgeleriModal';m.className='modal-overlay';m.style.zIndex='10060';m.innerHTML='<div class="modal-card bordro-yukleme-kart"><div class="modal-header"><h3>📁 Bordro Belgeleri</h3><button class="modal-close" onclick="modalKapat(\'bordroBelgeleriModal\')">✕</button></div><div class="modal-body"><p class="bordro-yukleme-aciklama"><strong id="bordroModalAy">—</strong> için yüklemek istediğiniz belgeleri seçin. Seçmediğiniz mevcut belgeler korunur.</p><div id="bordroYuklemeListesi" class="bordro-yukleme-listesi"></div><div class="bordro-yukleme-alt"><button type="button" class="btn-modern" onclick="modalKapat(\'bordroBelgeleriModal\')">Vazgeç</button><button type="button" id="bordroTopluKaydet" class="bordro-yukle-kaydet" onclick="bordroBelgeleriniTopluKaydet()">Seçilen Belgeleri Yükle</button></div></div></div>';document.body.appendChild(m);const p=document.createElement('div');p.id='bordroBelgeOnizleme';p.className='modal-overlay';p.style.zIndex='10070';p.innerHTML='<div class="modal-card bordro-onizleme-kart"><div class="modal-header"><h3 id="bordroOnizlemeBaslik">Belge Önizleme</h3><div style="display:flex;gap:7px"><button type="button" class="btn-modern btn-detail-modern" onclick="bordroOnizlenenBelgeIndir()">⬇ İndir</button><button class="modal-close" onclick="bordroBelgeOnizlemeKapat()">✕</button></div></div><div class="modal-body"><iframe id="bordroOnizlemeFrame" title="Bordro belgesi önizleme"></iframe></div></div>';document.body.appendChild(p)}
    window.bordroBelgeleriYuklemeAc=function(odak=''){if(!yonetebilir())return;modalKur();const d=donem(),k=kayit(d);document.getElementById('bordroModalAy').textContent=d.etiket;document.getElementById('bordroYuklemeListesi').innerHTML=TURLER.map(t=>'<div class="bordro-yukleme-satir"><label><span>'+esc(t.ad)+'</span><small>'+(k.belgeler?.[t.kod]?'Mevcut belge var':'')+'</small></label><input id="bordroDosya_'+t.kod+'" type="file" accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div>').join('');const btn=document.getElementById('bordroTopluKaydet');btn.disabled=false;btn.classList.remove('yukleniyor');btn.style.setProperty('--p','0%');btn.textContent='Seçilen Belgeleri Yükle';document.getElementById('bordroBelgeleriModal').style.display='flex';if(odak)setTimeout(()=>document.getElementById('bordroDosya_'+odak)?.click(),120)};
    function uzanti(f){const u=String(f.name||'').toLowerCase();return u.endsWith('.pdf')?'pdf':u.endsWith('.xlsx')?'xlsx':u.endsWith('.xls')?'xls':''}
    async function bordroEskiBelgeleriTemizle(yeniId,dosyaAdi,eskiId=''){const ad=String(dosyaAdi||''),sonNokta=ad.lastIndexOf('.'),dosyaKoku=sonNokta>0?ad.slice(0,sonNokta):ad;let sonHata=null;for(let deneme=1;deneme<=3;deneme++){try{const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({islem:'bordroBelgeKopyalariniTemizle',modul:KLASOR,korunacakDosyaId:yeniId,dosyaKoku})});const sonuc=await response.json();if(!response.ok||!sonuc?.basarili)throw new Error(sonuc?.hata||'Eski bordro belgesi temizlenemedi.');sonHata=null;break}catch(e){sonHata=e;if(deneme<3)await new Promise(resolve=>setTimeout(resolve,deneme*700))}}if(eskiId&&String(eskiId)!==String(yeniId)){try{await fdYazilimDriveDosyaSil(eskiId,KLASOR)}catch(e){sonHata=sonHata||e}}if(sonHata){console.warn('Eski bordro belgesi kaldırılamadı:',sonHata);showToast?.('Yeni belge kaydedildi ancak eski Drive kopyası temizlenemedi.','warning')}}
    window.bordroBelgeleriniTopluKaydet=async function(){
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
                    ayrilan=await ucretPusulalariniAyir(f,d,(sayfa,toplam)=>bordroIlerlet(btn,5+20*sayfa/Math.max(1,toplam),'Pusulalar inceleniyor · '+sayfa+' / '+toplam+' sayfa'));
                    bordroIlerlet(btn,25,ayrilan.bulunanlar.length+' personel pusulası bulundu');
                }else if(t.kod==='banka_maas'){
                    bordroIlerlet(btn,8,'Maaş listesi karşılaştırma için okunuyor...');
                    try{maasKarsilastirma=await bordroMaasListesiniOku(f,ext);bordroIlerlet(btn,22,maasKarsilastirma.satirlar.length+' personelin maaşı okundu')}
                    catch(hata){uyarilar.push('Maaş karşılaştırması hazırlanamadı: '+(hata.message||hata));}
                }else bordroIlerlet(btn,Math.max(6,Math.round(i/secilen.length*100)));
                const base64=await dosyayiBase64Oku(f),ad='BORDRO_BELGELERI_'+d.anahtar+'_'+t.dosya+'.'+ext,eski=k.belgeler?.[t.kod]||null,yeni=await fdYazilimDriveDosyaYukle(base64,ad,mime,'',KLASOR);
                k.belgeler=k.belgeler||{};
                k.belgeler[t.kod]={id:yeni.id,url:yeni.url||'',ad:yeni.ad||ad,mimeType:mime,boyut:f.size,guncellemeTarihi:new Date().toISOString(),...(maasKarsilastirma?{maasKarsilastirma}:{})};
                belgeAyariDegisti=true;
                if(ayrilan){
                    const kaydedilen=await pusulaKayitlariniKaydet(ayrilan,d,yeni,btn);
                    eskiPusulaDosyalari.push(...(ayrilan.temizlikDosyaIds||[]));
                    bordroIlerlet(btn,94,'İcra kesintileri kaydediliyor...');
                    const icraSonucu=await bordroIcraKesintileriniKaydet(ayrilan.bulunanlar,d);icraIslenen+=icraSonucu.islenen;
                    if(icraSonucu.acikDosyaYok.length)uyarilar.push('Ücret pusulasında icra kesintisi okundu ancak açık icra dosyası bulunamadı:\n'+icraSonucu.acikDosyaYok.join(', '));
                    if(icraSonucu.borcuAsan.length)uyarilar.push('İcra kesintisinin açık dosya bakiyesini aşan kısmı kaydedilmedi:\n'+icraSonucu.borcuAsan.join(', '));
                    bordroIlerlet(btn,95,'BES kesintileri puantaja işleniyor...');
                    const besSonucu=await bordroBesKesintileriniKaydet(ayrilan.bulunanlar,d);besIslenen+=besSonucu.islenen;
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
            await ayariKaydet(d,k);
            belgeAyariDegisti=false;
            bordroIlerlet(btn,95,'Eski dosyalar topluca temizleniyor...');
            await bordroBekleyenDosyalariTemizle(eskiPusulaDosyalari);
            await Promise.all(temizlikler.map(islem=>bordroEskiBelgeleriTemizle(islem.yeniId,islem.dosyaAdi,islem.eskiId)));
            temizlikler.length=0;
            if(bordroBildirilecekler.length){bordroIlerlet(btn,96,'WhatsApp bildirimleri saat 20.00 için planlanıyor...');const bildirimSonucu=await personelBordroBildirimleriniPlanla(bordroBildirilecekler,d,uploadedAt);whatsappKuyrukta=Number(bildirimSonucu.kuyrukta||0);if(bildirimSonucu.basarisiz)uyarilar.push(bildirimSonucu.basarisiz+' personele ücret pusulası WhatsApp bildirimi planlanamadı.\n'+bildirimSonucu.hatalar.slice(0,5).map(x=>x.hata).join('\n'))}
            bordroIlerlet(btn,100,'Tamamlandı %100');renderPuantajMatrisi();panelCiz();showToast?.(d.etiket+' bordro belgeleri kaydedildi.'+(icraIslenen?' '+icraIslenen+' personelin icra kesintisi işlendi.':'')+(besIslenen?' '+besIslenen+' personelin BES kesintisi puantaja işlendi.':'')+(whatsappKuyrukta?' '+whatsappKuyrukta+' WhatsApp bildirimi yükleme günü saat 20.00 için planlandı; saat geçtiyse ilk uygun sırada, en az 4 dakika arayla gönderilecek.':''));
            setTimeout(()=>modalKapat('bordroBelgeleriModal'),450);
            if(uyarilar.length)setTimeout(()=>alert(uyarilar.join('\n\n')),550);
        }catch(e){
            if(belgeAyariDegisti){try{await ayariKaydet(d,k);belgeAyariDegisti=false;await Promise.all(temizlikler.map(islem=>bordroEskiBelgeleriTemizle(islem.yeniId,islem.dosyaAdi,islem.eskiId)))}catch(kayitHatasi){console.error('Kısmi bordro kaydı korunamadı:',kayitHatasi)}}
            console.error(e);alert('Yükleme tamamlanamadı; kaydedilen belgeler korunuyor. '+(e.message||e));panelCiz()
        }
        finally{islemde=false;btn.disabled=false;btn.classList.remove('yukleniyor')}
    };
    function bordroOnizlemeAc(kayit,baslik,tur='toplu'){
        const dosya=kayit?.dosya||kayit;if(!dosya?.id)return;
        modalKur();onizlenen={tur,kayit};document.getElementById('bordroOnizlemeBaslik').textContent=baslik;
        document.getElementById('bordroOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(dosya.id)+'/preview';document.getElementById('bordroBelgeOnizleme').style.display='flex';
    }
    window.bordroBelgesiGoruntule=function(kod){const t=TURLER.find(x=>x.kod===kod),b=belge(kod);if(b?.id)bordroOnizlemeAc(b,(t?.ad||'Belge')+' · '+donem().etiket,'toplu')};
    window.bordroPersonelPusulasiGoruntule=async function(pId){
        const d=donem(),tc=String(pId||activeUser?.tcNo||'');showGlobalOverlay?.('Ücret pusulası hazırlanıyor',d.etiket+' kaydı kontrol ediliyor...');
        try{const harita=await pusulaKayitlariniYukle(d,false),p=harita.get(tc);if(!p?.dosya?.id)return showToast?.(d.etiket+' için bu personele ait ücret pusulası bulunamadı.','warning');bordroOnizlemeAc(p,(p.personelAd||'Personel')+' · '+d.etiket+' Ücret Pusulası','personel')}
        catch(e){console.error(e);showToast?.('Ücret pusulası alınamadı: '+(e.message||e),'error')}finally{hideGlobalOverlay?.()}
    };
    window.bordroBelgeOnizlemeKapat=function(){document.getElementById('bordroOnizlemeFrame').src='about:blank';document.getElementById('bordroBelgeOnizleme').style.display='none';onizlenen=null};
    async function bordroKaydiniIndir(kayit,varsayilanAd='Bordro_Belgesi'){
        const dosya=kayit?.dosya||kayit;if(!dosya?.id)return;
        showGlobalOverlay?.('Belge hazırlanıyor','Dosya indirilmeye hazırlanıyor...');
        try{const d=await fdYazilimDriveDosyaIndir(dosya.id,KLASOR),blob=new Blob([base64DizisineCevir(d.base64)],{type:d.mimeType||dosya.mimeType||'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=d.ad||dosya.ad||varsayilanAd;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){alert('Belge indirilemedi: '+(e.message||e))}finally{hideGlobalOverlay?.()}
    }
    window.bordroBelgesiIndir=function(kod){const b=belge(kod);if(b)bordroKaydiniIndir(b)};
    window.bordroPersonelPusulasiIndir=async function(pId){const d=donem(),harita=await pusulaKayitlariniYukle(d,false),p=harita.get(String(pId||activeUser?.tcNo||''));if(!p)return showToast?.('Bu ay için ücret pusulası bulunamadı.','warning');return bordroKaydiniIndir(p,'Ucret_Pusulasi.pdf')};
    window.bordroOnizlenenBelgeIndir=function(){if(onizlenen)bordroKaydiniIndir(onizlenen.kayit)};
    window.bordroBelgesiSil=async function(kod){
        if(!yonetebilir())return;const d=donem(),k=JSON.parse(JSON.stringify(kayit(d))),t=TURLER.find(x=>x.kod===kod),b=k.belgeler?.[kod];if(!b)return;
        if(!await fdYuzerOnaySor(d.etiket+' '+t.ad+' belgesi'+(kod==='ucret_pusulasi'?' ve personele ayrılan pusulalar':'')+' silinsin mi?','Belgeyi Sil','Sil'))return;
        showGlobalOverlay?.('Belge siliniyor',t.ad+' kaldırılıyor...');
        try{delete k.belgeler[kod];await ayariKaydet(d,k);if(kod==='ucret_pusulasi')await pusulaKayitlariniSil(d);panelCiz();try{await fdYazilimDriveDosyaSil(b.id,KLASOR)}catch(e){console.warn(e)}showToast?.(t.ad+' silindi.')}
        catch(e){alert('Belge silinemedi: '+(e.message||e))}finally{hideGlobalOverlay?.()}
    };
    window.bordroBelgeleriAyiDegisti=function(){yukle(false)};
    const eskiCiz=window.renderPuantajMatrisi;window.renderPuantajMatrisi=function(){const r=eskiCiz.apply(this,arguments);Promise.resolve().then(()=>yukle(false));return r};
    function kur(){modalKur();panelCiz();if(document.getElementById('puantajApp')?.style.display==='block')yukle(false)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kur);else kur();
})();


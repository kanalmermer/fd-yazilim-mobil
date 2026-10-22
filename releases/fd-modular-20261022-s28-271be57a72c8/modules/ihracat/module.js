window.FDModules.define('ihracat', function(){
    let ihracatAktifFirmaId = '';
    let ihracatAktifSekme = 'tum';
    let ihracatAktifYuklemeId = '';
    let ihracatFormTcmbKurlari = null;
    let ihracatFormProformaToplamaModu = 'olcu';
    let ihracatFormProformaHaricAnahtarlar = new Set();
    let ihracatFormKurManuel = false;
    function ihracatFormDovizToplami(){
        const manuel=paraMetniniSayiyaCevir(document.getElementById('ihracatFaturaTutar')?.value||'');if(manuel>0)return manuel;
        const yukleme=ihracatFormProformaVerisi(),sayi=ihracatSayiyaCevir;
        return ihracatProformaUrunleriniBirlestir(yukleme).reduce((toplam,satir)=>toplam+sayi(satir.miktar)*sayi(satir.birimFiyat),0);
    }
    function ihracatSeciliTcmbKuru(){
        const kod=document.getElementById('ihracatParaBirimi')?.value||'USD';
        const manuel=Number(document.getElementById('ihracatManuelKur')?.value||0);if(manuel>0)return manuel;
        return kod==='TRY'?1:Number(ihracatFormTcmbKurlari?.[kod]||0);
    }
    function ihracatManuelKurDegisti(input){ihracatFormKurManuel=Number(input?.value||0)>0;ihracatKurTlKarsiliginiGuncelle();ihracatCekiFormProformaGuncelle();}
    function ihracatKurTlKarsiliginiGuncelle(){
        const alan=document.getElementById('ihracatKurBilgisi');if(!alan)return;
        const kod=document.getElementById('ihracatParaBirimi')?.value||'USD',kur=ihracatSeciliTcmbKuru(),toplam=ihracatFormDovizToplami(),tl=toplam*kur;
        const para=x=>Number(x||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        if(kod==='TRY'){alan.innerHTML=`<strong>Toplam:</strong> ${para(toplam)} TL`;return;}
        if(!kur){alan.textContent='TCMB döviz alış kuru yükleniyor...';return;}
        const tarih=ihracatFormTcmbKurlari?.tarih?tarihFormati(ihracatFormTcmbKurlari.tarih):'-';
        alan.innerHTML=`<strong>${tarih} TCMB ${kod} döviz alış kuru:</strong> ${Number(kur).toLocaleString('tr-TR',{minimumFractionDigits:4,maximumFractionDigits:4})} TL &nbsp;•&nbsp; <strong>Toplam:</strong> ${para(toplam)} ${kod} &nbsp;=&nbsp; <strong>${para(tl)} TL</strong>`;
    }
    async function ihracatOncekiGunKurunuYukle(zorla=false){
        const kod=document.getElementById('ihracatParaBirimi')?.value||'USD',tarih=document.getElementById('ihracatYuklemeTarih')?.value||bugununYerelTarihi();
        if(kod==='TRY'){ihracatFormTcmbKurlari={tarih,TRY:1};ihracatKurTlKarsiliginiGuncelle();return;}
        if(!zorla&&ihracatFormTcmbKurlari?.[kod]){ihracatKurTlKarsiliginiGuncelle();return;}
        const alan=document.getElementById('ihracatKurBilgisi');if(alan)alan.textContent='Bir önceki iş gününün TCMB alış kuru yükleniyor...';
        const anahtar=`ihracat-tcmb-forex-buying-${tarih}`;
        try{
            let kurlar=JSON.parse(localStorage.getItem(anahtar)||'null');
            if(!kurlar?.[kod]){
                if(typeof google!=='undefined'&&google.script?.run){
                    kurlar=await new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).tcmbOncekiIsGunuDovizAlisKurlari(tarih));
                }else{
                    const yanit=await fetch(`${GOOGLE_SCRIPT_URL}?islem=tcmbKur&tarih=${encodeURIComponent(tarih)}&_=${Date.now()}`,{cache:'no-store'});
                    if(!yanit.ok)throw new Error('Kur servisine ulaşılamadı.');
                    const veri=await yanit.json();kurlar=veri?.kurlar;
                    if(!veri?.basarili)throw new Error(veri?.hata||'Kur bulunamadı.');
                }
                if(!kurlar?.[kod])throw new Error('Kur bulunamadı.');
                localStorage.setItem(anahtar,JSON.stringify(kurlar));
            }
            ihracatFormTcmbKurlari=kurlar;const manuel=document.getElementById('ihracatManuelKur');if(manuel&&!ihracatFormKurManuel)manuel.value=Number(kurlar[kod]||'').toFixed(4);ihracatKurTlKarsiliginiGuncelle();ihracatCekiFormProformaGuncelle();
        }catch(error){
            ihracatFormTcmbKurlari=null;
            if(alan)alan.innerHTML=`<strong>TCMB kuru alınamadı.</strong> ${escapeDashboardText(error?.message||error)}`;
        }
    }
    async function openIhracatApp() {
        if (!anaMenuModulErisimiVar('ihracat')) return;
        anaMenuDonusButonunuGoster();
        ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','vardiyaApp','aracTakipApp','ayarlarApp','irsaliyeTakipApp'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
        document.getElementById('ihracatApp').style.display='block';
        await driveVerileriniYukleBaslangicta('ihracat');
        ihracatFirmaListesineDon();
    }
    function ihracatFirmaListesineDon() {
        ihracatAktifFirmaId='';
        document.getElementById('ihracatFirmaListeEkrani').style.display='block';
        document.getElementById('ihracatFirmaDetayEkrani').style.display='none';
        document.getElementById('ihracatYuklemeDetayEkrani').style.display='none';
        ihracatFirmalariniCiz();
    }
    function ihracatFirmaKimlikleriniTamamla(){
        const kullanilan=new Set();
        ihracatFirmalari.forEach((firma,index)=>{
            let id=String(firma?.id||'').trim();
            if(!id||kullanilan.has(id)){
                const kaynak=`${firma?.sirketId||aktifSirketId()}|${firma?.ad||''}|${firma?.ulke||''}|${index}`;
                let hash=0;for(let i=0;i<kaynak.length;i++)hash=((hash*31)+kaynak.charCodeAt(i))>>>0;
                id=`ihr_firma_legacy_${hash.toString(36)}`;let ek=1;while(kullanilan.has(id))id=`ihr_firma_legacy_${hash.toString(36)}_${ek++}`;
                firma.id=id;
            }
            kullanilan.add(id);
            const yuklemeKullanilan=new Set();(firma.yuklemeler||[]).forEach((yukleme,yuklemeIndex)=>{let yuklemeId=String(yukleme?.id||'').trim();if(!yuklemeId||yuklemeKullanilan.has(yuklemeId)){const kaynak=id+'|'+String(yukleme?.tarih||'')+'|'+String(yukleme?.no||'')+'|'+String(yukleme?.proformaNo||'')+'|'+yuklemeIndex;let hash=0;for(let k=0;k<kaynak.length;k++)hash=((hash*31)+kaynak.charCodeAt(k))>>>0;yuklemeId='ihr_yuk_legacy_'+hash.toString(36);let ek=1;while(yuklemeKullanilan.has(yuklemeId))yuklemeId='ihr_yuk_legacy_'+hash.toString(36)+'_'+ek++;yukleme.id=yuklemeId;}yuklemeKullanilan.add(yuklemeId);});
        });
    }
    function ihracatFirmalariniCiz() {
        ihracatFirmaKimlikleriniTamamla();
        const arama=String(document.getElementById('ihracatFirmaArama')?.value||'').toLocaleLowerCase('tr-TR');
        const yuklemeFiltre=document.getElementById('ihracatFirmaYuklemeFiltre')?.value||'',siralama=document.getElementById('ihracatFirmaSiralama')?.value||'ad';
        const sonTarih=f=>[...(f.yuklemeler||[])].map(y=>String(y.tarih||'')).sort().reverse()[0]||'';
        const liste=ihracatFirmalari.filter(f=>aktifSirketeAit(f)&&(!arama||String(f.ad||'').toLocaleLowerCase('tr-TR').includes(arama))&&(!yuklemeFiltre||(yuklemeFiltre==='var'?(f.yuklemeler||[]).length>0:(f.yuklemeler||[]).length===0))).sort((a,b)=>siralama==='son'?sonTarih(b).localeCompare(sonTarih(a)):(siralama==='adet'?(b.yuklemeler||[]).length-(a.yuklemeler||[]).length:String(a.ad).localeCompare(String(b.ad),'tr')));
        document.querySelector('#ihracatFirmaTablosu tbody').innerHTML=liste.map(f=>{
            const son=[...(f.yuklemeler||[])].sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||'')))[0];
            return `<tr style="height:54px;"><td><button type="button" class="fd-table-cell-link" onclick="ihracatFirmaDetayAc('${f.id}')">${escapeDashboardText(f.ad)}</button></td><td>${(f.yuklemeler||[]).length}</td><td>${son?tarihFormati(son.tarih):'-'}</td><td><div class="action-btns"><button class="btn-modern btn-detail-modern" onclick="ihracatFirmaDetayAc('${f.id}')">📂 Aç</button><button class="btn-modern btn-edit-modern" onclick="ihracatFirmaFormuAc('${f.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="ihracatFirmaSil('${f.id}')">🗑️ Sil</button></div></td></tr>`;
        }).join('')||'<tr><td colspan="4" style="text-align:center;padding:28px;color:#64748b;">Henüz ihracat firması eklenmedi.</td></tr>';
    }
    function ihracatFirmaFormuAc(id='') {
        ihracatFirmaKimlikleriniTamamla();
        const f=ihracatFirmalari.find(x=>String(x.id)===String(id));
        document.getElementById('ihracatFirmaForm').reset();
        document.getElementById('ihracatFirmaEditId').value=f?.id||'';
        document.getElementById('ihracatFirmaAdi').value=f?.ad||'';
        document.getElementById('ihracatFirmaUlke').value=f?.ulke||'';
        document.getElementById('ihracatFirmaYetkili').value=f?.yetkili||'';
        document.getElementById('ihracatFirmaTelefon').value=f?.telefon||'';
        document.getElementById('ihracatFirmaEposta').value=f?.eposta||'';
        document.getElementById('ihracatFirmaVergiNo').value=f?.vergiNo||'';
        document.getElementById('ihracatFirmaVergiDairesi').value=f?.vergiDairesi||'';
        document.getElementById('ihracatFirmaSicilNo').value=f?.sicilNo||'';
        document.getElementById('ihracatFirmaSehir').value=f?.sehir||'';
        document.getElementById('ihracatFirmaPostaKodu').value=f?.postaKodu||'';
        document.getElementById('ihracatFirmaYetkiliUnvan').value=f?.yetkiliUnvan||'';
        document.getElementById('ihracatFirmaWeb').value=f?.web||'';
        document.getElementById('ihracatFirmaAdres').value=f?.adres||'';
        document.getElementById('ihracatFirmaTeslimatAdres').value=f?.teslimatAdres||'';
        document.getElementById('modalIhracatFirma').style.display='flex';
    }
    function ihracatFirmaFormuKapat(){document.getElementById('modalIhracatFirma').style.display='none';}
    async function ihracatFirmaKaydet(event) {
        event.preventDefault();
        ihracatFirmaKimlikleriniTamamla();
        const id=document.getElementById('ihracatFirmaEditId').value;
        const mevcut=ihracatFirmalari.find(f=>String(f.id)===String(id));
        const ad=document.getElementById('ihracatFirmaAdi').value.trim().toLocaleUpperCase('tr-TR');
        const ulke=document.getElementById('ihracatFirmaUlke').value.trim().toLocaleUpperCase('tr-TR');
        const cakisanlar=ihracatFirmalari.filter(f=>String(f.id)!==String(id)&&aktifSirketeAit(f)&&String(f.ad||'').trim().toLocaleUpperCase('tr-TR')===ad&&String(f.ulke||'').trim().toLocaleUpperCase('tr-TR')===ulke);
        if(!mevcut&&cakisanlar.length){ihracatFirmaFormuKapat();showToast('Bu firma ve ülke kaydı zaten mevcut. Mevcut firma açıldı.','warning');ihracatFirmaDetayAc(cakisanlar[0].id);return;}
        const yuklemeHaritasi=new Map();[...(mevcut?.yuklemeler||[]),...cakisanlar.flatMap(f=>f.yuklemeler||[])].forEach((y,index)=>yuklemeHaritasi.set(String(y.id||`${y.tarih||''}|${y.no||''}|${index}`),y));
        const kayit={...(mevcut||{}),id:mevcut?.id||`ihr_firma_${Date.now()}`,sirketId:aktifSirketId(),ad,ulke,sehir:document.getElementById('ihracatFirmaSehir').value,postaKodu:document.getElementById('ihracatFirmaPostaKodu').value,vergiDairesi:document.getElementById('ihracatFirmaVergiDairesi').value,vergiNo:document.getElementById('ihracatFirmaVergiNo').value,sicilNo:document.getElementById('ihracatFirmaSicilNo').value,yetkili:document.getElementById('ihracatFirmaYetkili').value,yetkiliUnvan:document.getElementById('ihracatFirmaYetkiliUnvan').value,telefon:document.getElementById('ihracatFirmaTelefon').value,eposta:document.getElementById('ihracatFirmaEposta').value,web:document.getElementById('ihracatFirmaWeb').value,adres:document.getElementById('ihracatFirmaAdres').value,teslimatAdres:document.getElementById('ihracatFirmaTeslimatAdres').value,yuklemeler:[...yuklemeHaritasi.values()]};
        const oncekiListe=[...ihracatFirmalari];
        if(mevcut){
            const cakisanIdleri=new Set(cakisanlar.map(f=>String(f.id)));ihracatFirmalari=ihracatFirmalari.filter(f=>!cakisanIdleri.has(String(f.id)));
            const yeniIndex=ihracatFirmalari.findIndex(f=>String(f.id)===String(mevcut.id));if(yeniIndex>=0)ihracatFirmalari[yeniIndex]=kayit;else ihracatFirmalari.push(kayit);
        }else ihracatFirmalari.push(kayit);
        yuklenenVeriler.add('ihracat');
        try{await supabaseVerileriKaydet();ihracatFirmaFormuKapat();ihracatFirmalariniCiz();showToast(mevcut?(cakisanlar.length?'Firma güncellendi; yinelenen kayıt birleştirildi.':'Firma güncellendi.'):'Firma eklendi.');}
        catch(error){
            ihracatFirmalari=oncekiListe;
            const mesaj=String(error?.message||error||'');
            showToast(mesaj.includes('portal_records_module_check')?'İhracat modülü Supabase’de henüz etkin değil. Önce ihracat modülü SQL kodunu çalıştırın.':'Firma kaydedilemedi: '+mesaj,'warning');
        }
    }
    async function ihracatFirmaSil(id) {
        const f=ihracatFirmalari.find(x=>String(x.id)===String(id));if(!f||!await fdYuzerOnaySor(`${f.ad} firması ve bütün yükleme kayıtları silinsin mi?`))return;
        const belgeler=(f.yuklemeler||[]).flatMap(y=>[...Object.values(y.belgeler||{}),...(y.gorseller||[])]).filter(x=>x?.id);
        await Promise.allSettled(belgeler.map(b=>fdYazilimDrivePdfSil(b.id)));
        ihracatFirmalari=ihracatFirmalari.filter(x=>String(x.id)!==String(id));await supabaseVerileriKaydet();ihracatFirmalariniCiz();showToast('Firma silindi.');
    }
    function ihracatFirmaDetayAc(id) {
        const f=ihracatFirmalari.find(x=>String(x.id)===String(id));if(!f)return;
        ihracatAktifFirmaId=String(id);ihracatAktifSekme='tum';
        document.getElementById('ihracatFirmaListeEkrani').style.display='none';document.getElementById('ihracatFirmaDetayEkrani').style.display='block';
        document.getElementById('ihracatYuklemeDetayEkrani').style.display='none';
        document.getElementById('ihracatFirmaDetayBaslik').textContent=f.ad;
        document.getElementById('ihracatFirmaDetayBilgi').textContent=[f.ulke,f.yetkili,f.telefon,f.eposta].filter(Boolean).join(' · ');
        ihracatYuklemeleriniCiz();
    }
    function ihracatSekmeDegistir(sekme,buton){ihracatAktifSekme=sekme;document.querySelectorAll('#ihracatDetaySekmeler button').forEach(b=>b.classList.remove('active'));buton.classList.add('active');ihracatYuklemeleriniCiz();}
    function ihracatAktifFirma(){return ihracatFirmalari.find(f=>String(f.id)===String(ihracatAktifFirmaId));}
    function ihracatBelgeButonu(belge,etiket){return belge?.url?`<a class="btn-modern btn-detail-modern" href="${escapeDashboardText(belge.url)}" target="_blank" rel="noopener">📄 ${etiket}</a>`:'';}
    function ihracatYuklemeDurumu(yukleme){
        const listeler=ihracatCekiListeleriniDuzelt(yukleme),irsaliyeVar=listeler.some(l=>String(l.irsaliyeNo||'').trim()||l.irsaliyePdf?.id||l.irsaliyePdf?.url),fatura=yukleme?.belgeler?.fatura,faturaPdfVar=Boolean(fatura?.id||fatura?.url);
        if(faturaPdfVar)return {tamamlandi:true,metin:'Y\u00dcKLEME TAMAMLANDI',stil:'background:#dcfce7;color:#166534;'};
        if(irsaliyeVar)return {tamamlandi:false,metin:'Y\u00dcKLEME DEVAM ED\u0130YOR',stil:'background:#fef3c7;color:#92400e;'};
        return {tamamlandi:false,metin:'Y\u00dcKLEME BA\u015eLAMADI',stil:'background:#e2e8f0;color:#475569;'};
    }
    function ihracatYuklemeleriniCiz() {
        const f=ihracatAktifFirma();if(!f)return;
        const arama=String(document.getElementById('ihracatYuklemeArama').value||'').toLocaleLowerCase('tr-TR'),bas=document.getElementById('ihracatYuklemeBaslangic').value,bit=document.getElementById('ihracatYuklemeBitis').value;
        const liste=(f.yuklemeler||[]).filter(y=>{
            return (!bas||y.tarih>=bas)&&(!bit||y.tarih<=bit)&&(!arama||`${y.no} ${y.bookingNo} ${y.varisYeri} ${y.faturaNo} ${y.satisTuru} ${y.not}`.toLocaleLowerCase('tr-TR').includes(arama));
        }).sort((a,b)=>String(b.tarih).localeCompare(String(a.tarih)));
        document.querySelector('#ihracatYuklemeTablosu tbody').innerHTML=liste.map(y=>{
            const b=y.belgeler||{},belgeSayisi=Object.values(b).filter(Boolean).length,gorselSayisi=ihracatCekiListeleriniDuzelt(y).reduce((t,l)=>t+(l.gorseller||[]).length,0),durum=ihracatYuklemeDurumu(y);
            return `<tr style="height:56px;"><td><button type="button" class="fd-table-cell-link" onclick="ihracatYuklemeDetayAc('${y.id}')">${tarihFormati(y.tarih)}</button></td><td><button type="button" class="fd-table-cell-link" onclick="ihracatYuklemeDetayAc('${y.id}')">${escapeDashboardText(y.no)}</button></td><td>${escapeDashboardText(y.bookingNo||'-')}</td><td>${escapeDashboardText(y.varisYeri||'-')}</td><td>${escapeDashboardText(y.satisTuru||'-')}</td><td>${escapeDashboardText(y.proformaNo||'-')}</td><td><span class="badge" style="${durum.stil}">${durum.metin}</span></td><td>${ihracatCekiListeleriniDuzelt(y).length}</td><td>${gorselSayisi}</td><td>${escapeDashboardText(y.not||'-')}</td><td><div class="action-btns"><button class="btn-modern btn-detail-modern" onclick="ihracatYuklemeDetayAc('${y.id}')">📂 Aç</button><button class="btn-modern btn-edit-modern" onclick="ihracatYuklemeFormuAc('${y.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="ihracatYuklemeSil('${y.id}')">🗑️ Sil</button></div></td></tr>`;
        }).join('')||'<tr><td colspan="11" style="text-align:center;padding:28px;color:#64748b;">Bu bölümde kayıt bulunmuyor.</td></tr>';
    }
    function ihracatYuklemeListesineDon(){document.getElementById('ihracatYuklemeDetayEkrani').style.display='none';document.getElementById('ihracatFirmaDetayEkrani').style.display='block';ihracatYuklemeleriniCiz();}
    function ihracatYuklemeDetayAc(id){
        const f=ihracatAktifFirma(),y=(f?.yuklemeler||[]).find(x=>String(x.id)===String(id));if(!f||!y)return;
        ihracatAktifYuklemeId=String(id);
        document.getElementById('ihracatFirmaDetayEkrani').style.display='none';document.getElementById('ihracatYuklemeDetayEkrani').style.display='block';
        document.getElementById('ihracatYuklemeDetayBaslik').textContent=`${tarihFormati(y.tarih)} — ${y.no}`;
        document.getElementById('ihracatYuklemeDetayAltBaslik').textContent=`${f.ad}${y.satisTuru?' · '+y.satisTuru:''}`;
        document.getElementById('ihracatYuklemeDetayDuzenle').onclick=()=>ihracatYuklemeFormuAc(y.id);
        const ozet=(etiket,deger)=>`<div style="padding:14px;border:1px solid #dbe5ef;border-radius:10px;background:#f8fafc;"><small style="color:#64748b;font-weight:700;">${etiket}</small><strong style="display:block;margin-top:6px;color:#0f172a;">${escapeDashboardText(deger||'-')}</strong></div>`;
        const durum=ihracatYuklemeDurumu(y),kur=Number(y.tcmbKur||y.tcmbKurlari?.[y.paraBirimi]||(y.paraBirimi==='TRY'?1:0)),dovizToplami=Number(y.tutar||0)||ihracatProformaUrunleriniBirlestir(y).reduce((t,s)=>t+ihracatSayiyaCevir(s.miktar)*ihracatSayiyaCevir(s.birimFiyat),0),tlToplami=Number(y.tlToplam||0)||dovizToplami*kur,para=x=>Number(x||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        document.getElementById('ihracatYuklemeDetayOzet').innerHTML=ozet('DURUM',durum.metin)+ozet('YÜKLEME TARİHİ',tarihFormati(y.tarih))+ozet('YÜKLEME / REFERANS NO',y.no)+ozet('BOOKING NO',y.bookingNo)+ozet('VARIŞ YERİ',y.varisYeri)+ozet('PROFORMA NO',y.proformaNo)+ozet('SATIŞ TÜRÜ',y.satisTuru)+ozet('ÇEKİ LİSTESİ SAYISI',String(ihracatCekiListeleriniDuzelt(y).length))+ozet('FATURA NO',y.faturaNo)+ozet('TOPLAM DÖVİZ',dovizToplami?`${para(dovizToplami)} ${y.paraBirimi||''}`:'-')+ozet('TCMB DÖVİZ ALIŞ',kur?`${tarihFormati(y.tcmbKurTarihi)} · ${Number(kur).toLocaleString('tr-TR',{minimumFractionDigits:4,maximumFractionDigits:4})} TL`:'-')+ozet('TOPLAM TL',tlToplami?`${para(tlToplami)} TL`:'-');
        const b=y.belgeler||{};document.getElementById('ihracatYuklemeDetayBelgeler').innerHTML=`<button class="btn-modern btn-detail-modern" style="justify-content:flex-start;padding:12px;" onclick="ihracatBelgeOlustur('${y.id}','ceki')">📋 Çeki Listesini Oluştur</button><button class="btn-modern btn-detail-modern" style="justify-content:flex-start;padding:12px;" onclick="ihracatBelgeOlustur('${y.id}','proforma')">📄 Proforma Faturayı Oluştur</button><button class="btn-modern btn-detail-modern" onclick="ihracatTumBelgelerPdfOlustur('${y.id}')">T&#252;m Belgeleri PDF Aktar</button>${b.fatura?.url?`<a href="${escapeDashboardText(b.fatura.url)}" target="_blank" rel="noopener" class="btn-modern btn-detail-modern" style="justify-content:flex-start;padding:12px;">🧾 Fatura PDF</a>`:'<div style="padding:11px;border:1px dashed #cbd5e1;border-radius:8px;color:#94a3b8;">Fatura PDF yüklenmedi</div>'}`;
        document.getElementById('ihracatYuklemeDetayGorseller').innerHTML=(y.gorseller||[]).map((g,i)=>`<a href="${escapeDashboardText(g.url)}" target="_blank" rel="noopener" style="display:block;border:1px solid #dbe5ef;border-radius:10px;overflow:hidden;background:#f8fafc;"><img src="https:\x2f\x2fdrive.google.com/thumbnail?id=${encodeURIComponent(g.id||'')}&sz=w500" alt="Yükleme görseli ${i+1}" style="width:100%;height:130px;object-fit:cover;display:block;"><span style="display:block;padding:7px;text-align:center;color:#334155;font-size:12px;">Görsel ${i+1}</span></a>`).join('')||'<div style="grid-column:1/-1;padding:25px;text-align:center;color:#94a3b8;">Yükleme görüntüsü eklenmedi.</div>';
        document.getElementById('ihracatYuklemeDetayNot').textContent=y.not||'Açıklama girilmedi.';
        document.querySelectorAll('#ihracatYuklemeDetaySekmeler button').forEach((b,i)=>b.classList.toggle('active',i===0));
        ihracatYuklemeDetaySekmeAc('ceki',document.querySelector('#ihracatYuklemeDetaySekmeler button'));
    }
    function ihracatYuklemeDetaySekmeAc(sekme,buton){
        const f=ihracatAktifFirma(),y=(f?.yuklemeler||[]).find(x=>String(x.id)===ihracatAktifYuklemeId),alan=document.getElementById('ihracatYuklemeDetayIcerik');if(!y||!alan)return;
        document.querySelectorAll('#ihracatYuklemeDetaySekmeler button').forEach(b=>b.classList.remove('active'));buton?.classList.add('active');
        const listeler=ihracatCekiListeleriniDuzelt(y),b=y.belgeler||{};
        if(sekme==='ceki'){
            const sayi=ihracatSayiyaCevir,bicim=x=>Number(x||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
            alan.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;"><div><h2 style="margin:0;font-size:18px;">&#199;eki Listeleri</h2><p style="margin:4px 0 0;color:#64748b;font-size:12px;">Her listeyi ayr&#305;nt&#305;l&#305; olarak g&#246;r&#252;nt&#252;leyebilir ve tek tek PDF alabilirsiniz.</p></div></div><div style="display:grid;gap:14px;">${listeler.map((l,i)=>{const sutunlar=ihracatCekiSutunlariniDuzelt(l.sutunlar),satirlar=(l.urunler||[]).filter(s=>String(s.aciklama||'').trim()),toplam=alan=>satirlar.reduce((t,s)=>t+sayi(s[alan]),0),resimler=l.gorseller||[];return `<div class="card ihracat-ceki-akordeon" style="margin:0;overflow:hidden;"><div class="card-header" style="background:#f8fafc;padding:13px 15px;"><div><h2 style="margin:0;font-size:16px;">${escapeDashboardText(l.listeAdi||'\u00c7eki Listesi '+(i+1))}</h2><p style="margin:4px 0 0;color:#64748b;">\u0130rsaliye: <strong>${escapeDashboardText(l.irsaliyeNo||'-')}</strong> · Booking: <strong>${escapeDashboardText(l.bookingNo||'')}</strong> · ${satirlar.length} ür\u00fcn sat\u0131r\u0131</p></div><div class="action-btns">${l.kantarFisi?.url?`<a class="btn-modern btn-edit-modern" href="${escapeDashboardText(l.kantarFisi.url)}" target="_blank" rel="noopener">Kantar Fişi</a>`:''}<button class="btn-modern btn-detail-modern" onclick="ihracatBelgeOlustur('${y.id}','ceki','${l.id}')">PDF</button></div></div><div class="table-wrapper"><table><thead><tr><th>NO</th>${sutunlar.map(k=>`<th>${escapeDashboardText(k.baslik)}</th>`).join('')}</tr></thead><tbody>${satirlar.map((satir,n)=>`<tr><td>${satir.siraNo||n+1}</td>${sutunlar.map(k=>{const v=k.alan.startsWith('ozel_')?satir.ozel?.[k.alan]:satir[k.alan];return `<td>${k.tip==='number'?(String(v??'').trim()===''?'':bicim(sayi(v))):escapeDashboardText(v||'')}</td>`;}).join('')}</tr>`).join('')||`<tr><td colspan="${sutunlar.length+1}" style="padding:20px;text-align:center;color:#64748b;">\u00dcr\u00fcn sat\u0131r\u0131 yok.</td></tr>`}</tbody><tfoot><tr class="ceki-toplam-satiri"><td>${satirlar.length}</td>${sutunlar.map(k=>`<td>${k.alan==='aciklama'?'TOPLAM':(['adet','miktar','net','brut'].includes(k.alan)?bicim(toplam(k.alan)):'')}</td>`).join('')}</tr></tfoot></table></div><div style="padding:12px 15px;border-top:1px solid #e2e8f0;display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:#475569;"><span><strong>\u015eof\u00f6r:</strong> ${escapeDashboardText(l.nakliyeci?.sofor||'-')}</span><span><strong>\u00c7ekici:</strong> ${escapeDashboardText(l.nakliyeci?.cekiciPlaka||'-')}</span><span><strong>Dorse:</strong> ${escapeDashboardText(l.nakliyeci?.dorsePlaka||'-')}</span></div>${resimler.length?`<div style="padding:12px 15px;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px;">${resimler.map((g,n)=>`<a href="${escapeDashboardText(g.url)}" target="_blank" rel="noopener" style="border:1px solid #dbe5ef;border-radius:8px;overflow:hidden;"><img src="https:\x2f\x2fdrive.google.com/thumbnail?id=${encodeURIComponent(g.id||'')}&sz=w360" style="width:100%;height:105px;object-fit:cover;display:block;"><span style="display:block;padding:6px;text-align:center;font-size:11px;">G\u00f6rsel ${n+1}</span></a>`).join('')}</div>`:''}</div>`;}).join('')}</div>`;
            [...alan.querySelectorAll('.ihracat-ceki-akordeon')].forEach((kart,index)=>{const n=listeler[index]?.nakliyeci||{},bilgi=kart.querySelector('.table-wrapper')?.nextElementSibling;bilgi?.insertAdjacentHTML('beforeend',`<span><strong>Araç Sahibi:</strong> ${escapeDashboardText(n.aracSahibi||'-')}</span><span><strong>Araç Sahibi T.C./V.N.:</strong> ${escapeDashboardText(n.aracSahibiTcVn||'-')}</span>`);});
            const kartlar=[...alan.querySelectorAll('.ihracat-ceki-akordeon')];kartlar.forEach((kart,index)=>{const baslik=kart.querySelector('.card-header'),govde=document.createElement('div');govde.className='ihracat-ceki-akordeon-govde';[...kart.children].filter(x=>x!==baslik).forEach(x=>govde.appendChild(x));kart.appendChild(govde);govde.style.display=index===0?'block':'none';baslik.style.cssText+=';cursor:pointer;position:relative;padding-right:92px;';const eylem=baslik.querySelector('.action-btns');if(eylem)eylem.style.cssText+=';margin-left:auto;margin-right:30px;';const ok=document.createElement('span');ok.textContent=index===0?String.fromCharCode(9650):String.fromCharCode(9660);ok.style.cssText='font-size:18px;color:#64748b;position:absolute;right:15px;top:50%;transform:translateY(-50%);';baslik.appendChild(ok);baslik.addEventListener('click',()=>{const zaten=govde.style.display!=='none';kartlar.forEach(diger=>{const ac=diger===kart&&!zaten;diger.querySelector('.ihracat-ceki-akordeon-govde').style.display=ac?'block':'none';diger.querySelector('.card-header span:last-child').textContent=ac?String.fromCharCode(9650):String.fromCharCode(9660);});});});
        }else if(sekme==='gorsel'){
            const gruplar=listeler.map((liste,i)=>({ad:liste.listeAdi||'Ceki Listesi '+(i+1),gorseller:liste.gorseller||[]})).filter(x=>x.gorseller.length);
            alan.innerHTML=`<div style="display:grid;gap:14px;">${gruplar.map(grup=>`<div class="card" style="margin:0;"><div class="card-header"><h2>${escapeDashboardText(grup.ad)}</h2><span>${grup.gorseller.length} gorsel</span></div><div style="padding:15px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">${grup.gorseller.map((g,i)=>`<a href="${escapeDashboardText(g.url)}" target="_blank" rel="noopener" style="border:1px solid #dbe5ef;border-radius:10px;overflow:hidden;"><img src="https:\x2f\x2fdrive.google.com/thumbnail?id=${encodeURIComponent(g.id||'')}&sz=w500" style="width:100%;height:145px;object-fit:cover;"><span style="display:block;padding:8px;text-align:center;">Gorsel ${i+1}</span></a>`).join('')}</div></div>`).join('')||'<div class="card" style="padding:25px;color:#94a3b8;">Ceki listelerine gorsel eklenmedi.</div>'}</div>`;
        }else if(sekme==='proforma'){
            const urunler=ihracatProformaUrunleriniBirlestir(y),mod=ihracatProformaToplamaModu(y),paraBirimi=y.paraBirimi||'USD',toplamTutar=urunler.reduce((t,u)=>t+ihracatSayiyaCevir(u.miktar)*ihracatSayiyaCevir(u.birimFiyat),0),yaziToplam=ihracatTutariYaziIle(toplamTutar,paraBirimi);
            alan.innerHTML=`<div class="card" style="margin:0;"><div class="card-header"><div><h2>${escapeDashboardText(y.proformaNo||'Proforma')}</h2><p style="margin:5px 0 0;color:#64748b;">Toplama biçimini değiştirebilir, ürün adına sağ tıklayabilir ve satır silebilirsiniz.</p></div><div class="action-btns"><select style="min-height:34px;padding:5px 8px;" onchange="ihracatKayitliProformaToplamaDegistir('${y.id}',this)"><option value="urun" ${mod==='urun'?'selected':''}>Ürüne göre topla</option><option value="olcu" ${mod==='olcu'?'selected':''}>Ölçüye göre topla</option><option value="ceki" ${mod==='ceki'?'selected':''}>Çeki listesine göre topla</option></select><button class="btn-modern btn-detail-modern" onclick="ihracatBelgeOlustur('${y.id}','proforma')">📄 PDF</button></div></div><div class="table-wrapper"><table><thead><tr><th>ÜRÜN</th><th>TOPLAM MİKTAR</th><th>BİRİM</th><th>BİRİM FİYAT</th><th>TUTAR</th><th></th></tr></thead><tbody>${urunler.map(u=>`<tr><td style="cursor:context-menu;" title="Değiştirmek için sağ tıklayın" oncontextmenu="ihracatKayitliProformaUrunAdiDuzenle(event,'${y.id}','${encodeURIComponent(u.kaynakAnahtar)}')">${escapeDashboardText(u.aciklama)}</td><td>${Number(u.miktar).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${escapeDashboardText(u.birim)}</td><td><button type="button" style="all:unset;cursor:pointer;color:${ihracatSayiyaCevir(u.birimFiyat)>0?'#0369a1':'#dc2626'};font-weight:800;" title="Fiyatı değiştirmek için tıklayın" onclick="ihracatKayitliProformaFiyatDuzenle(event,'${y.id}','${encodeURIComponent(u.kaynakAnahtar)}')">${Number(u.birimFiyat||0).toLocaleString('tr-TR',{minimumFractionDigits:2})} ${escapeDashboardText(y.paraBirimi||'')}</button></td><td style="font-weight:700;text-align:right;white-space:nowrap;">${(ihracatSayiyaCevir(u.miktar)*ihracatSayiyaCevir(u.birimFiyat)).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} ${escapeDashboardText(paraBirimi)}</td><td><button type="button" class="btn-modern" style="background:#e2e8f0;color:#334155;border:1px solid #cbd5e1;" onclick="ihracatKayitliProformaSatirSil('${y.id}','${encodeURIComponent(u.kaynakAnahtar)}')">🗑️ Sil</button></td></tr>`).join('')||'<tr><td colspan="6" style="text-align:center;padding:22px;">Proforma satırı bulunmuyor.</td></tr>'}</tbody></table></div><div style="padding:14px 16px;border-top:2px solid #cbd5e1;background:#f8fafc;display:grid;gap:8px;"><div style="display:flex;justify-content:flex-end;align-items:center;gap:20px;font-size:16px;"><strong>GENEL TOPLAM / TOTAL</strong><strong style="min-width:190px;text-align:right;color:#0f4c81;">${toplamTutar.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} ${escapeDashboardText(paraBirimi)}</strong></div><div style="padding:10px 12px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#1e3a5f;font-weight:700;">${escapeDashboardText(yaziToplam)}</div></div></div>`;
            const proformaKarti=alan.querySelector('.card'),proformaAciklama=proformaKarti?.querySelector('.card-header p');if(proformaAciklama)proformaAciklama.textContent='Bu ekran yalnızca görüntüleme içindir. Değişiklik yapmak için Yüklemeyi Düzenle düğmesini kullanın.';proformaKarti?.querySelector('.card-header select')?.remove();proformaKarti?.querySelector('thead tr th:last-child')?.remove();
            proformaKarti?.querySelectorAll('tbody tr').forEach(tr=>{if(tr.cells.length<5){tr.cells[0]?.setAttribute('colspan','5');return;}const urunHucre=tr.cells[0];urunHucre.removeAttribute('oncontextmenu');urunHucre.removeAttribute('title');urunHucre.style.cursor='default';const fiyatButonu=tr.cells[3]?.querySelector('button');if(fiyatButonu){const fiyatMetni=document.createElement('span');fiyatMetni.textContent=fiyatButonu.textContent;fiyatMetni.style.cssText=`font-weight:800;color:${fiyatButonu.style.color||'#0f172a'};`;fiyatButonu.replaceWith(fiyatMetni);}tr.lastElementChild?.remove();});
        }else if(sekme==='irsaliye'){
            alan.innerHTML=`<div class="card" style="margin:0;"><div class="card-header"><h2>İrsaliyeler</h2></div><div class="table-wrapper"><table><thead><tr><th>#</th><th>İrsaliye No</th><th>Booking No</th><th>Bağlı Çeki Listesi</th><th>Ürün Sayısı</th><th>İrsaliye</th><th>Kantar Fişi</th></tr></thead><tbody>${listeler.map((l,i)=>`<tr><td>${i+1}</td><td>${escapeDashboardText(l.irsaliyeNo||'-')}</td><td>${escapeDashboardText(l.bookingNo||'')}</td><td>Çeki Listesi ${i+1}</td><td>${(l.urunler||[]).length}</td><td>${l.irsaliyePdf?.url?`<a class="btn-modern btn-detail-modern" href="${escapeDashboardText(l.irsaliyePdf.url)}" target="_blank">PDF'yi Aç</a>`:'-'}</td><td>${l.kantarFisi?.url?`<a class="btn-modern btn-edit-modern" href="${escapeDashboardText(l.kantarFisi.url)}" target="_blank">Fişi Aç</a>`:'-'}</td></tr>`).join('')}</tbody></table></div></div>`;
        }else{
            alan.innerHTML=`<div class="card" style="margin:0;"><div class="card-header"><h2>Fatura</h2></div><div style="padding:18px;">${b.fatura?.url?`<a href="${escapeDashboardText(b.fatura.url)}" target="_blank" class="btn-modern btn-detail-modern">🧾 Fatura PDF'yi Aç</a>`:'<span style="color:#94a3b8;">Fatura PDF yüklenmedi.</span>'}<div style="margin-top:15px;"><strong>Fatura No:</strong> ${escapeDashboardText(y.faturaNo||'-')}</div></div></div>`;
        }
    }
    
    function ihracatYuklemeFormuAc(id='',cekiId='') {
        ihracatFirmaKimlikleriniTamamla();const aktifFirma=ihracatAktifFirma(),yuklemeler=aktifFirma?.yuklemeler||[],arananId=String(id||''),y=arananId?yuklemeler.find(x=>String(x.id)===arananId):undefined,yIndex=yuklemeler.indexOf(y),form=document.getElementById('ihracatYuklemeForm');
        form.reset();document.getElementById('ihracatYuklemeEditId').value=y?.id||'';form.dataset.editId=y?.id||'';form.dataset.editIndex=yIndex>=0?String(yIndex):'';form.dataset.editFirmaId=aktifFirma?.id||'';form.dataset.editTarih=y?.tarih||'';form.dataset.editNo=y?.no||'';form.dataset.editProformaNo=y?.proformaNo||'';window.ihracatDuzenlenenYuklemeId=y?.id||'';
        ihracatFormProformaToplamaModu=['urun','olcu','ceki'].includes(y?.proformaToplamaModu)?y.proformaToplamaModu:(uygulamaAyarlari.ihracatVarsayilanToplamaModu||'olcu');
        ihracatFormProformaHaricAnahtarlar=new Set(Array.isArray(y?.proformaHaricAnahtarlar)?y.proformaHaricAnahtarlar:[]);
        ihracatFormKurManuel=!!y?.tcmbKurManuel;document.getElementById('ihracatManuelKur').value=y?.tcmbKur?Number(y.tcmbKur).toFixed(4):'';
        const tarih=y?.tarih||bugununYerelTarihi();document.getElementById('ihracatYuklemeTarih').value=tarih;document.getElementById('ihracatYuklemeNo').value=y?.no||'';document.getElementById('ihracatBookingNo').value=y?.bookingNo||'';document.getElementById('ihracatVarisYeri').value=y?.varisYeri||'';document.getElementById('ihracatSatisTuru').value=ihracatSatisTurunuDuzelt(y?.satisTuru||uygulamaAyarlari.ihracatVarsayilanSatisTuru);document.getElementById('ihracatProformaNo').value=y?.proformaNo||ihracatYeniProformaNo(tarih);document.getElementById('ihracatFaturaNo').value=y?.faturaNo||'';document.getElementById('ihracatFaturaTutar').value=y?.tutar?Number(y.tutar).toLocaleString('tr-TR',{minimumFractionDigits:2}):'';document.getElementById('ihracatParaBirimi').value=y?.paraBirimi||uygulamaAyarlari.ihracatVarsayilanParaBirimi||'USD';document.getElementById('ihracatYuklemeNot').value=y?.not||'';
        document.getElementById('ihracatYuklemeFormFirma').textContent=ihracatAktifFirma()?.ad||'';document.getElementById('ihracatYuklemeFormBaslik').textContent=y?'Yüklemeyi Düzenle':'Yeni Yükleme Bilgileri';
        document.getElementById('ihracatCekiListeleri').innerHTML='';(y?ihracatCekiListeleriniDuzelt(y):[]).forEach(l=>ihracatCekiListesiEkle(l));if(!y)ihracatCekiListesiEkle();ihracatFormFaturaGuncelle();const hedefListe=cekiId?[...document.querySelectorAll('.ihracat-ceki-karti')].findIndex(k=>String(k.dataset.id)===String(cekiId)):0;ihracatCekiSekmeleriniYenile(hedefListe>=0?hedefListe:0);
        ihracatFormTcmbKurlari=y?.tcmbKurlari||((y?.tcmbKur&&y?.paraBirimi)?{tarih:y.tcmbKurTarihi,[y.paraBirimi]:y.tcmbKur}:null);ihracatOncekiGunKurunuYukle(!ihracatFormTcmbKurlari);
        document.getElementById('ihracatYuklemeFormEkrani').style.display='block';ihracatHucreToplamIpucluGoster();
    }
    function ihracatYuklemeFormuKapat(){document.getElementById('ihracatYuklemeFormEkrani').style.display='none';ihracatHucreToplamSeciminiTemizle();}
    function ihracatKayitliCekiListesiDuzenle(yuklemeId,cekiId){ihracatYuklemeFormuAc(yuklemeId,cekiId);}
    async function ihracatKayitliCekiListesiSil(yuklemeId,cekiId){if(!await fdYuzerOnaySor('Bu \u00e7eki listesi silinsin mi?'))return;const yukleme=(ihracatAktifFirma()?.yuklemeler||[]).find(y=>String(y.id)===String(yuklemeId));if(!yukleme)return;yukleme.cekiListeleri=ihracatCekiListeleriniDuzelt(yukleme).filter(l=>String(l.id)!==String(cekiId));await supabaseVerileriKaydet();ihracatYuklemeDetayAc(yuklemeId);showToast('\u00c7eki listesi silindi.');}
    let ihracatCekiKopyaKaynaklari=[];
    let ihracatSeciliCekiKopyaIndex=-1;
    function ihracatOncekiYuklemedenCekiKopyala(){
        const mevcutFirmaId=String(ihracatAktifFirmaId||''),mevcutId=String(document.getElementById('ihracatYuklemeEditId')?.value||'');
        ihracatCekiKopyaKaynaklari=ihracatFirmalari.flatMap(f=>(f.yuklemeler||[]).flatMap(y=>{
            if(String(f.id)===mevcutFirmaId&&String(y.id)===mevcutId)return [];
            return ihracatCekiListeleriniDuzelt(y).map((liste,listeIndex)=>({firma:f,yukleme:y,liste,listeIndex}));
        })).filter(k=>(k.liste.urunler||[]).some(u=>String(u.aciklama||'').trim())).sort((a,b)=>String(b.yukleme.tarih||'').localeCompare(String(a.yukleme.tarih||''))||String(a.firma.ad||'').localeCompare(String(b.firma.ad||''),'tr'));
        if(!ihracatCekiKopyaKaynaklari.length){showToast('Kopyalanabilecek kayıtlı bir çeki listesi bulunamadı.','warning');return;}
        ihracatSeciliCekiKopyaIndex=-1;document.getElementById('ihracatCekiKopyaArama').value='';document.getElementById('ihracatCekiKopyaOnizleme').innerHTML='Soldaki listeden bir çeki listesi seçin.';document.getElementById('ihracatCekiKopyalaOnayBtn').disabled=true;ihracatCekiKopyaKaynaklariniCiz();document.getElementById('modalIhracatCekiKopyala').style.display='flex';
    }
    function ihracatCekiKopyalamaKapat(){document.getElementById('modalIhracatCekiKopyala').style.display='none';}
    function ihracatCekiKopyaKaynaklariniCiz(){
        const arama=String(document.getElementById('ihracatCekiKopyaArama')?.value||'').trim().toLocaleLowerCase('tr-TR'),body=document.getElementById('ihracatCekiKopyaListeBody');
        const eslesen=ihracatCekiKopyaKaynaklari.map((kaynak,index)=>({kaynak,index})).filter(({kaynak:k})=>!arama||[k.firma.ad,k.yukleme.no,k.yukleme.proformaNo,k.liste.listeAdi,k.liste.irsaliyeNo].some(v=>String(v||'').toLocaleLowerCase('tr-TR').includes(arama)));
        body.innerHTML=eslesen.map(({kaynak:k,index})=>`<tr onclick="ihracatCekiKopyaSec(${index})" style="cursor:pointer;${index===ihracatSeciliCekiKopyaIndex?'background:#dbeafe;':''}"><td style="white-space:nowrap;">${tarihFormati(k.yukleme.tarih)}</td><td><strong>${escapeDashboardText(k.firma.ad||'-')}</strong><br><small>${escapeDashboardText(k.yukleme.no||k.yukleme.proformaNo||'-')}</small></td><td>${escapeDashboardText(k.liste.listeAdi||'Çeki Listesi '+(k.listeIndex+1))}<br><small>İrsaliye: ${escapeDashboardText(k.liste.irsaliyeNo||'-')}</small></td><td>${(k.liste.urunler||[]).filter(u=>String(u.aciklama||'').trim()).length}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;padding:22px;color:#64748b;">Aramanıza uygun çeki listesi bulunamadı.</td></tr>';
    }
    function ihracatCekiKopyaSec(index){
        const k=ihracatCekiKopyaKaynaklari[index];if(!k)return;ihracatSeciliCekiKopyaIndex=index;ihracatCekiKopyaKaynaklariniCiz();document.getElementById('ihracatCekiKopyalaOnayBtn').disabled=false;
        const sutunlar=ihracatCekiSutunlariniDuzelt(k.liste.sutunlar),satirlar=(k.liste.urunler||[]).filter(u=>String(u.aciklama||'').trim()),sayi=ihracatSayiyaCevir;
        document.getElementById('ihracatCekiKopyaOnizleme').innerHTML=`<div style="margin-bottom:10px;"><strong style="color:#0f172a;">${escapeDashboardText(k.liste.listeAdi||'Çeki Listesi')}</strong><br><small>${escapeDashboardText(k.firma.ad||'-')} · ${tarihFormati(k.yukleme.tarih)} · ${escapeDashboardText(k.yukleme.no||k.yukleme.proformaNo||'-')}</small></div><div class="table-wrapper" style="max-height:46vh;overflow:auto;margin:0;"><table style="font-size:12px;"><thead><tr><th>NO</th>${sutunlar.map(s=>`<th>${escapeDashboardText(s.baslik)}</th>`).join('')}</tr></thead><tbody>${satirlar.slice(0,30).map((u,i)=>`<tr><td>${escapeDashboardText(u.siraNo||i+1)}</td>${sutunlar.map(s=>{const v=s.alan.startsWith('ozel_')?u.ozel?.[s.alan]:u[s.alan];return `<td>${s.tip==='number'?(String(v??'').trim()===''?'':sayi(v).toLocaleString('tr-TR',{maximumFractionDigits:3})):escapeDashboardText(v||'')}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>${satirlar.length>30?`<small style="display:block;margin-top:8px;">İlk 30 satır gösteriliyor. Toplam ${satirlar.length} satır.</small>`:''}`;
    }
    function ihracatSeciliCekiListesiniKopyala(){
        const kaynak=ihracatCekiKopyaKaynaklari[ihracatSeciliCekiKopyaIndex];if(!kaynak)return;const l=kaynak.liste,kartlar=[...document.querySelectorAll('.ihracat-ceki-karti')];
        if(kartlar.length===1&&!ihracatCekiListeleriniOku()[0]?.urunler?.some(u=>String(u.aciklama||'').trim()))kartlar[0].remove();
        const kopya={id:`ceki_${Date.now()}_kopya`,listeAdi:l.listeAdi||'ÇEKİ LİSTESİ',irsaliyeNo:'',bookingNo:'',nakliyeci:{},irsaliyePdf:null,kantarFisi:null,gorseller:[],sutunlar:ihracatCekiSutunlariniDuzelt(l.sutunlar).map(s=>({...s})),urunler:(l.urunler||[]).map(u=>({...u,ozel:{...(u.ozel||{})}}))};
        ihracatCekiListesiEkle(kopya);ihracatCekiSekmeleriniYenile(document.querySelectorAll('.ihracat-ceki-karti').length-1);ihracatCekiKopyalamaKapat();showToast(`${kaynak.firma.ad||'Firma'} kaydındaki seçili çeki listesi kopyalandı.`);
    }
    function ihracatYeniProformaNo(tarih){
        const yil=String(tarih||bugununYerelTarihi()).slice(0,4),onEk=`PF${yil}`;
        const numaralar=ihracatFirmalari.flatMap(f=>f.yuklemeler||[]).map(y=>String(y.proformaNo||'')).filter(n=>n.startsWith(onEk)).map(n=>Number(n.slice(onEk.length))||0);
        return `${onEk}${String((Math.max(0,...numaralar)+1)).padStart(4,'0')}`;
    }
    function ihracatProformaTariheGoreGuncelle(){if(!document.getElementById('ihracatYuklemeEditId').value)document.getElementById('ihracatProformaNo').value=ihracatYeniProformaNo(document.getElementById('ihracatYuklemeTarih').value);ihracatCekiFormProformaGuncelle();}
    function ihracatCekiListeleriniDuzelt(yukleme){
        if(Array.isArray(yukleme?.cekiListeleri)&&yukleme.cekiListeleri.length)return yukleme.cekiListeleri;
        const eski=Array.isArray(yukleme?.cekiSatirlari)?yukleme.cekiSatirlari:[],gruplar=new Map();
        eski.forEach((s,i)=>{const no=String(s.irsaliyeNo||`LİSTE ${i+1}`);if(!gruplar.has(no))gruplar.set(no,{id:`ceki_${Date.now()}_${i}`,irsaliyeNo:no,urunler:[]});gruplar.get(no).urunler.push({...s,irsaliyeNo:undefined});});
        return [...gruplar.values()];
    }
    function ihracatCekiVarsayilanSutunlari(formullu=false){
        const netKatsayi=ayarSayisi('ihracatNetKgKatsayisi',28),brutEkleme=ayarSayisi('ihracatBrutKgEkleme',30);
        return [
            {alan:'aciklama',baslik:'Ürün Adı',tip:'text',sabit:true},
            {alan:'kalinlik',baslik:'Kalınlık (cm)',tip:'number',sabit:true},
            {alan:'en',baslik:'Boy (cm)',tip:'number',sabit:true},
            {alan:'boy',baslik:'Yükseklik (cm)',tip:'number',sabit:true},
            {alan:'adet',baslik:'Adet',tip:'number',sabit:true},
            {alan:'miktar',baslik:'M²',tip:'number',formul:'en*boy*adet/10000',sabit:true},
            {alan:'net',baslik:'Net KG',tip:'number',formul:formullu?`(kalinlik*${netKatsayi})*miktar`:'',sabit:true},
            {alan:'brut',baslik:'Brüt KG',tip:'number',formul:formullu?`net+${brutEkleme}`:'',sabit:true}
        ];
    }
    
    function ihracatCekiSutunlariniDuzelt(sutunlar){
        if(!Array.isArray(sutunlar)||!sutunlar.length)return ihracatCekiVarsayilanSutunlari();
        const varsayilan=new Map(ihracatCekiVarsayilanSutunlari().map(s=>[s.alan,s]));
        return sutunlar.map(s=>{
            const duzeltilmis={...varsayilan.get(s.alan),...s};
            const baslik=String(duzeltilmis.baslik||'').trim().toLocaleLowerCase('tr-TR');
            if(duzeltilmis.alan==='en'&&['en','en (cm)'].includes(baslik))duzeltilmis.baslik='Boy (cm)';
            if(duzeltilmis.alan==='boy'&&['boy','boy (cm)'].includes(baslik))duzeltilmis.baslik='Yükseklik (cm)';
            return duzeltilmis;
        }).filter(s=>s?.alan&&s?.baslik&&s.alan!=='birimFiyat');
    }
    function ihracatCekiFormulAlanMetni(kart){
        return kart._sutunlar.map(s=>`${s.baslik} = ${s.alan}`).join(' · ');
    }
    function ihracatCekiBasliklariCiz(kart){
        const tr=kart.querySelector('.ceki-sutun-basliklari');if(!tr)return;
        tr.innerHTML=`<th>NO</th>${kart._sutunlar.map((s,i)=>`<th data-alan="${escapeDashboardText(s.alan)}" data-sutun-index="${i}" title="Başlığı veya formülü değiştirmek için sağ tıklayın" oncontextmenu="ihracatCekiSutunMenuAc(event,this)">${escapeDashboardText(s.baslik)}${s.formul?'<br><small style="font-weight:500;color:#64748b;">ƒ</small>':''}</th>`).join('')}<th></th>`;
    }
    async function ihracatCekiSutunMenuAc(event,th){
        event.preventDefault();const kart=th.closest('.ihracat-ceki-karti'),index=Number(th.dataset.sutunIndex),sutun=kart?._sutunlar?.[index];if(!sutun)return;
        const secim=await fdYuzerDegerSor(`${sutun.baslik}\n\n1 - Başlığı değiştir\n2 - Formülü değiştir\n3 - Sağına yeni sütun ekle${sutun.sabit?'':'\n4 - Bu sütunu sil'}\n\nİşlem numarasını yazın:`,'1');
        if(secim==='1'){
            const baslik=await fdYuzerDegerSor('Yeni sütun başlığı:',sutun.baslik);if(!baslik?.trim())return;sutun.baslik=baslik.trim();
        }else if(secim==='2'){
            const formul=await fdYuzerDegerSor('Bu formül yalnızca bu çeki listesinde değişecek.\n\nKullanılabilen alanlar:\n'+ihracatCekiFormulAlanMetni(kart)+'\n\nÖrnek: en*boy*adet/10000\nManuel giriş için boş bırakın:',sutun.formul||'');
            if(formul===null)return;sutun.formul=formul.trim();if(sutun.formul)sutun.tip='number';kart.querySelectorAll('.ceki-urunler tr').forEach(tr=>{const input=tr.querySelector(`[data-alan="${sutun.alan}"]`);if(input){input.readOnly=!!sutun.formul;input.title=sutun.formul?`Formül: ${sutun.formul}`:'';}ihracatCekiSatirFormulleriniHesapla(tr);});
        }else if(secim==='3'){
            const baslik=await fdYuzerDegerSor('Yeni sütun başlığı:','Yeni Sütun');if(!baslik?.trim())return;
            const alan=`ozel_${Date.now()}`,tip=await fdYuzerDegerSor('Sütun türü:\n1 - Sayı\n2 - Metin','1')==='2'?'text':'number',formul=tip==='number'?await fdYuzerDegerSor('Bu sütunda formül olacaksa yazın; manuel giriş için boş bırakın.\n\nKullanılabilen alanlar:\n'+ihracatCekiFormulAlanMetni(kart)+` · ${baslik.trim()} = ${alan}`,''):'';
            kart._sutunlar.splice(index+1,0,{alan,baslik:baslik.trim(),tip,formul:String(formul||'').trim(),sabit:false});
            kart.querySelectorAll('.ceki-urunler tr').forEach(tr=>ihracatCekiOzelHucreEkle(tr,index+1,kart._sutunlar[index+1]));
        }else if(secim==='4'&&!sutun.sabit){
            if(!await fdYuzerOnaySor(`${sutun.baslik} sütunu silinsin mi?`))return;kart._sutunlar.splice(index,1);kart.querySelectorAll('.ceki-urunler tr').forEach(tr=>tr.querySelector(`[data-alan="${sutun.alan}"]`)?.closest('td')?.remove());
        }else return;
        ihracatCekiBasliklariCiz(kart);ihracatCekiToplamlariniGuncelle(kart);ihracatCekiFormProformaGuncelle();
    }
    function ihracatCekiOzelHucreEkle(tr,index,sutun){
        const td=document.createElement('td'),referans=tr.children[index+1]||tr.lastElementChild;
        td.dataset.alanHucre=sutun.alan;td.innerHTML=ihracatCekiHucreInputu(sutun,'');tr.insertBefore(td,referans);ihracatCekiSatirFormulleriniHesapla(tr);
    }
    function ihracatCekiHucreInputu(sutun,deger){
        const sinif={aciklama:'icki-aciklama',kalinlik:'icki-kalinlik',en:'icki-en',boy:'icki-boy',adet:'icki-adet',miktar:'icki-miktar',birimFiyat:'icki-fiyat',net:'icki-net',brut:'icki-brut'}[sutun.alan]||'icki-ozel';
        const yerTutucu='';
        return `<input class="${sinif}" data-alan="${escapeDashboardText(sutun.alan)}" ${sutun.tip==='number'&&!sutun.formul?'type="number" min="0" step="0.001"':''} value="${escapeDashboardText(deger??'')}" placeholder="${yerTutucu}" ${sutun.alan==='aciklama'?'required':''} ${sutun.formul?'readonly title="Formül: '+escapeDashboardText(sutun.formul)+'"':''} oninput="ihracatCekiSatirFormulleriniHesapla(this.closest('tr'))" onkeydown="ihracatCekiHucreTabIlerle(event,this)">`;
    }
    function ihracatCekiFormulHesapla(formul,degerler){
        if(!formul)return null;
        const temiz=String(formul).trim().replace(/,/g,'.');if(!temiz||!/^[a-zA-Z0-9_+\-*/().\s]+$/.test(temiz))return null;
        const ifade=temiz.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g,ad=>String(Object.prototype.hasOwnProperty.call(degerler,ad)?Number(degerler[ad])||0:0)).replace(/\s/g,''),parcalar=ifade.match(/\d+(?:\.\d+)?|[()+\-*/]/g)||[];
        if(parcalar.join('')!==ifade)return null;let konum=0;
        const faktor=()=>{const p=parcalar[konum++];if(p==='('){const v=toplam();if(parcalar[konum++]!==')')throw new Error('Parantez');return v;}if(p==='-')return -faktor();if(p==='+')return faktor();const v=Number(p);if(!Number.isFinite(v))throw new Error('Sayı');return v;};
        const carpim=()=>{let v=faktor();while(parcalar[konum]==='*'||parcalar[konum]==='/'){const op=parcalar[konum++],s=faktor();v=op==='*'?v*s:v/s;}return v;};
        const toplam=()=>{let v=carpim();while(parcalar[konum]==='+'||parcalar[konum]==='-'){const op=parcalar[konum++],s=carpim();v=op==='+'?v+s:v-s;}return v;};
        try{const sonuc=toplam();return konum===parcalar.length&&Number.isFinite(sonuc)?sonuc:null;}catch(e){return null;}
    }
    function ihracatCekiSatirFormulleriniHesapla(tr){
        if(!tr?.closest)return;
        const kart=tr.closest('.ihracat-ceki-karti');if(!kart)return;
        const degerler={},ham={},formulSutunlari=kart._sutunlar.filter(s=>String(s.formul||'').trim());
        tr.querySelectorAll('[data-alan]').forEach(input=>{
            ham[input.dataset.alan]=input.value;
            degerler[input.dataset.alan]=input.type==='number'?(Number(input.value)||0):ihracatSayiyaCevir(input.value);
        });

        // Eski hesaplanmış değerleri temizle; bağımlı formülleri birkaç geçişte yeniden hesapla.
        formulSutunlari.forEach(s=>{
            const input=tr.querySelector(`[data-alan="${s.alan}"]`);
            if(input)input.value='';
            ham[s.alan]='';degerler[s.alan]=0;
        });
        const hesaplanan=new Set();
        for(let tur=0;tur<=formulSutunlari.length;tur++){
            let ilerleme=false;
            formulSutunlari.forEach(s=>{
                if(hesaplanan.has(s.alan))return;
                const input=tr.querySelector(`[data-alan="${s.alan}"]`);
                const kullanilan=[...String(s.formul).matchAll(/[a-zA-Z_][a-zA-Z0-9_]*/g)]
                    .map(m=>m[0]).filter(a=>a!==s.alan);
                const bilinmeyenAlan=kullanilan.some(a=>!Object.prototype.hasOwnProperty.call(ham,a));
                const eksikDeger=kullanilan.some(a=>String(ham[a]??'').trim()==='');
                if(!input||bilinmeyenAlan||eksikDeger)return;
                const sonuc=ihracatCekiFormulHesapla(s.formul,degerler);
                if(sonuc===null)return;
                input.value=Number(sonuc.toFixed(2)).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
                degerler[s.alan]=sonuc;ham[s.alan]=input.value;hesaplanan.add(s.alan);ilerleme=true;
            });
            if(!ilerleme)break;
        }

        const olculer=['kalinlik','en','boy'].every(alan=>String(tr.querySelector(`[data-alan="${alan}"]`)?.value||'').trim()!==''),aciklama=tr.querySelector('[data-alan="aciklama"]')?.value;
        if(olculer&&String(aciklama||'').trim()&&!ihracatSayiyaCevir(tr.dataset.birimFiyat)){const fiyat=ihracatFirmaSonUrunFiyatiniBul(ihracatCekiSatiriniOku(tr));if(fiyat>0)tr.dataset.birimFiyat=String(fiyat);}
        ihracatCekiToplamlariniGuncelle(kart);ihracatCekiFormProformaGuncelle();
    }
    function ihracatFirmaSonUrunFiyatiniBul(satir){
        const firma=ihracatAktifFirma(),olcuAnahtar=ihracatProformaKaynakAnahtari(satir),urunAdi=String(satir?.aciklama||'').trim().toLocaleUpperCase('tr-TR');if(!firma||!urunAdi)return 0;
        const yuklemeler=[...(firma.yuklemeler||[])].sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||'')));
        for(const yukleme of yuklemeler){
            const urunler=ihracatCekiListeleriniDuzelt(yukleme).flatMap(l=>l.urunler||[]),tamEslesme=urunler.find(u=>ihracatProformaKaynakAnahtari(u)===olcuAnahtar&&ihracatSayiyaCevir(u.birimFiyat)>0),urunEslesme=urunler.find(u=>String(u.aciklama||'').trim().toLocaleUpperCase('tr-TR')===urunAdi&&ihracatSayiyaCevir(u.birimFiyat)>0),eslesen=tamEslesme||urunEslesme;
            if(eslesen)return ihracatSayiyaCevir(eslesen.birimFiyat);
        }
        return 0;
    }
    function ihracatCekiToplamlariniGuncelle(kart){
        if(!kart)return;const satirlar=[...kart.querySelectorAll('.ceki-urunler tr')],sayi=ihracatSayiyaCevir;
        const dolu=satirlar.filter(tr=>[...tr.querySelectorAll('[data-alan]')].some(input=>String(input.value||'').trim()!==''));
        const noToplami=new Set(dolu.map(tr=>String(tr.dataset.siraNo||'').trim()).filter(Boolean)).size;
        const topla=alan=>dolu.reduce((toplam,tr)=>toplam+sayi(tr.querySelector(`[data-alan="${alan}"]`)?.value),0);
        const bicimle=deger=>Number(deger||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        const satir=kart.querySelector('.ceki-toplam-satiri');if(!satir)return;
        const toplamlar={miktar:bicimle(topla('miktar')),adet:bicimle(topla('adet')),net:bicimle(topla('net')),brut:bicimle(topla('brut'))};
        satir.innerHTML=`<td>${noToplami||''}</td>${kart._sutunlar.map(s=>`<td data-alan-hucre="${escapeDashboardText(s.alan)}">${Object.prototype.hasOwnProperty.call(toplamlar,s.alan)?toplamlar[s.alan]:''}</td>`).join('')}<td></td>`;
    }
    function ihracatCekiListesiEkle(veri={}){
        const kapsayici=document.getElementById('ihracatCekiListeleri'),sira=kapsayici.children.length+1,kart=document.createElement('section');
        kart.className='ihracat-ceki-karti';kart.dataset.id=veri.id||`ceki_${Date.now()}_${sira}`;kart.style.cssText='border:1px solid #cbd5e1;border-radius:12px;margin:0 0 16px;overflow:hidden;background:#fff;';
        const n=veri.nakliyeci||{},listeAdi=veri.listeAdi||`ÇEKİ LİSTESİ ${sira}`;
        kart.innerHTML=`<div style="padding:10px 12px;background:#f1f5f9;display:flex;align-items:center;gap:9px;flex-wrap:wrap;"><strong class="ceki-baslik" style="width:100%;font-size:14px;">${escapeDashboardText(listeAdi)} · İrsaliye No: ${escapeDashboardText(veri.irsaliyeNo||'-')}</strong><div class="form-group" style="margin:0;min-width:220px;display:flex;align-items:center;gap:7px;"><label style="margin:0;white-space:nowrap;">Sayfa Adı</label><input class="ceki-liste-adi" value="${escapeDashboardText(listeAdi)}" required style="min-height:34px;" oninput="ihracatCekiListeBasliklariniYenile();ihracatCekiSekmeleriniYenile([...document.querySelectorAll('.ihracat-ceki-karti')].indexOf(this.closest('.ihracat-ceki-karti')))"></div><div class="form-group" style="margin:0;min-width:210px;display:flex;align-items:center;gap:7px;"><label style="margin:0;white-space:nowrap;">İrsaliye No</label><input class="ceki-irsaliye" value="${escapeDashboardText(veri.irsaliyeNo||'')}" style="min-height:34px;" oninput="ihracatCekiListeBasliklariniYenile()"></div><div class="form-group" style="margin:0;min-width:210px;display:flex;align-items:center;gap:7px;"><label style="margin:0;white-space:nowrap;">Booking No</label><input class="ceki-booking-no" value="${escapeDashboardText(veri.bookingNo||'')}" style="min-height:34px;" oninput="ihracatCekiListeBasliklariniYenile()"></div><div style="display:flex;align-items:center;gap:5px;"><span style="font-size:11px;color:#64748b;font-weight:800;">Çoklu</span><input class="ceki-toplu-satir-adet" type="number" min="1" max="100" value="" placeholder="Adet" title="Son doldurulan satırı yazdığınız adet kadar kopyalar" style="width:68px;min-height:34px;" oninput="ihracatCekiCokluSatirPlanla(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();ihracatCekiCokluSatirEkle(this);}"></div><button type="button" class="btn-modern btn-detail-modern" onclick="ihracatFormCekiBelgeOlustur(this,'pdf')">📄 PDF</button><button type="button" class="btn-modern btn-del-modern" onclick="ihracatCekiListesiSil(this)">🗑️ Listeyi Sil</button></div><div class="table-wrapper"><table><thead><tr class="ceki-sutun-basliklari"></tr></thead><tbody class="ceki-urunler"></tbody><tfoot><tr class="ceki-toplam-satiri"></tr></tfoot></table></div><div class="ceki-nakliyeci"><h3>🚚 Nakliyeci Bilgileri</h3><div class="profile-layout"><div class="form-group"><label>Şoför Adı Soyadı</label><input class="ceki-sofor" data-nak-field="sofor" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.sofor||'')}"></div><div class="form-group"><label>T.C. Kimlik No</label><input class="ceki-sofor-tc" data-nak-field="tcNo" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.tcNo||'')}" maxlength="11"></div><div class="form-group"><label>Telefon No</label><input class="ceki-sofor-tel" data-nak-field="telefon" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.telefon||'')}"></div><div class="form-group"><label>Çekici Plaka</label><input class="ceki-cekici" data-nak-field="cekiciPlaka" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.cekiciPlaka||'')}"></div><div class="form-group"><label>Dorse Plaka</label><input class="ceki-dorse" data-nak-field="dorsePlaka" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.dorsePlaka||'')}"></div><div class="form-group"><label>İrsaliye PDF</label><input class="ceki-irsaliye-pdf" type="file" accept="application/pdf">${veri.irsaliyePdf?.url?`<small><a href="${escapeDashboardText(veri.irsaliyePdf.url)}" target="_blank">Kayıtlı PDF'yi aç</a></small>`:''}</div><div class="form-group"><label>Kantar Fişi</label><input class="ceki-kantar-fisi" type="file" accept="application/pdf,image/jpeg,image/png,image/webp">${veri.kantarFisi?.url?`<small><a href="${escapeDashboardText(veri.kantarFisi.url)}" target="_blank">Kayıtlı kantar fişini aç</a></small>`:''}</div><div class="form-group"><label>Yukleme Gorselleri</label><input class="ceki-yukleme-gorselleri" type="file" accept="image/jpeg,image/png,image/webp" multiple>${(veri.gorseller||[]).length?'<small>'+((veri.gorseller||[]).length)+' kayitli gorsel</small>':''}</div></div></div>`;
        const dorseGrubu=kart.querySelector('.ceki-dorse')?.closest('.form-group');dorseGrubu?.insertAdjacentHTML('afterend',`<div class="form-group"><label>Araç Sahibi</label><input class="ceki-arac-sahibi" data-nak-field="aracSahibi" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.aracSahibi||'')}"></div><div class="form-group"><label>Araç Sahibi T.C. / V.N.</label><input class="ceki-arac-sahibi-tc-vn" data-nak-field="aracSahibiTcVn" oninput="ihracatNakliyeciOner(this)" value="${escapeDashboardText(n.aracSahibiTcVn||'')}" maxlength="11" inputmode="numeric"></div>`);
        kart._irsaliyePdf=veri.irsaliyePdf||null;kart._kantarFisi=veri.kantarFisi||null;kart._gorseller=Array.isArray(veri.gorseller)?veri.gorseller:[];kart._sutunlar=Array.isArray(veri.sutunlar)&&veri.sutunlar.length?ihracatCekiSutunlariniDuzelt(veri.sutunlar):(Object.keys(veri).length?ihracatCekiVarsayilanSutunlari(false):ihracatCekiVarsayilanSutunlari(true));kapsayici.appendChild(kart);ihracatCekiBasliklariCiz(kart);(veri.urunler?.length?veri.urunler:[{}]).forEach(u=>ihracatCekiUrunSatiriEkle(kart,u));ihracatCekiListeBasliklariniYenile();ihracatCekiSekmeleriniYenile(sira-1);
    }
    function ihracatCekiUrunSatiriEkle(btn,veri={}){
        const kart=btn.matches?.('.ihracat-ceki-karti')?btn:btn.closest('.ihracat-ceki-karti'),body=kart.querySelector('.ceki-urunler'),tr=document.createElement('tr');
        tr.dataset.proformaAdi=veri.proformaAdi||'';tr.dataset.birimFiyat=veri.birimFiyat??'';tr.dataset.siraNoManuel=veri.siraNoManuel?'1':'0';tr.dataset.siraNo=veri.siraNoManuel?String(veri.siraNo||body.rows.length+1):String(body.rows.length+1);
        tr.innerHTML=`<td class="urun-sira" style="cursor:context-menu;font-weight:750;" title="Numarayı değiştirmek için sağ tıklayın" oncontextmenu="ihracatCekiSatirNoDuzenle(event,this)">${escapeDashboardText(tr.dataset.siraNo)}</td>${kart._sutunlar.map(s=>`<td data-alan-hucre="${escapeDashboardText(s.alan)}">${ihracatCekiHucreInputu(s,s.alan.startsWith('ozel_')?(veri.ozel?.[s.alan]??''):(veri[s.alan]??''))}</td>`).join('')}<td><button type="button" class="btn-modern" style="background:#e2e8f0;color:#334155;border:1px solid #cbd5e1;" onclick="ihracatCekiUrunSatiriSil(this)">🗑️</button></td>`;
        body.appendChild(tr);ihracatCekiSatirNumaralariniYenile(body);ihracatCekiSatirFormulleriniHesapla(tr);
    }
    function ihracatCekiHucreTabIlerle(event,input){
        if(event.key!=='Tab'||event.shiftKey)return;
        const tr=input.closest('tr'),body=tr?.closest('.ceki-urunler');if(!tr||!body)return;
        const girisler=[...tr.querySelectorAll('input[data-alan]:not([readonly]):not([disabled])')];if(input!==girisler[girisler.length-1])return;
        event.preventDefault();
        let sonraki=tr.nextElementSibling;
        if(!sonraki){const kart=tr.closest('.ihracat-ceki-karti');ihracatCekiUrunSatiriEkle(kart);sonraki=tr.nextElementSibling;}
        sonraki?.querySelector('input[data-alan]:not([readonly]):not([disabled])')?.focus();
    }
    function ihracatCekiSatirNumaralariniYenile(body){
        let siradaki=1;[...body.rows].forEach(tr=>{if(tr.dataset.siraNoManuel==='1'){const manuel=Number(tr.dataset.siraNo);if(Number.isFinite(manuel))siradaki=manuel+1;}else{tr.dataset.siraNo=String(siradaki);siradaki++;}tr.querySelector('.urun-sira').textContent=tr.dataset.siraNo||'';});
    }
    async function ihracatCekiSatirNoDuzenle(event,hucre){
        event.preventDefault();const tr=hucre.closest('tr'),yeni=await fdYuzerDegerSor('Bu satırda görünecek NO:\nBoş bırakırsanız otomatik sıraya döner.',tr.dataset.siraNo||'');
        if(yeni===null)return;if(String(yeni).trim()===''){tr.dataset.siraNoManuel='0';}else{const no=Math.trunc(Number(yeni));if(!(no>0)){showToast('NO alanına 1 veya daha büyük bir sayı yazın.','warning');return;}tr.dataset.siraNoManuel='1';tr.dataset.siraNo=String(no);}ihracatCekiSatirNumaralariniYenile(tr.closest('tbody'));ihracatCekiToplamlariniGuncelle(tr.closest('.ihracat-ceki-karti'));
    }
    function ihracatCekiUrunSatiriSil(btn){const body=btn.closest('tbody'),kart=btn.closest('.ihracat-ceki-karti');if(body.rows.length<=1)return;btn.closest('tr').remove();ihracatCekiSatirNumaralariniYenile(body);ihracatCekiToplamlariniGuncelle(kart);ihracatCekiFormProformaGuncelle();}
    function ihracatCekiCokluSatirPlanla(input){clearTimeout(input._cokluSatirTimer);if(!(Number(input.value)>0))return;input._cokluSatirTimer=setTimeout(()=>ihracatCekiCokluSatirEkle(input),600);}
    function ihracatCekiCokluSatirEkle(input){
        clearTimeout(input._cokluSatirTimer);
        const adet=Math.max(0,Math.min(100,Number(input.value)||0));if(!adet)return;
        const kart=input.closest('.ihracat-ceki-karti'),body=kart.querySelector('.ceki-urunler'),ekle=kart;
        const doluSatir=[...body.rows].reverse().find(tr=>String(tr.querySelector('[data-alan="aciklama"]')?.value||'').trim()),kaynak=doluSatir?ihracatCekiSatiriniOku(doluSatir):{};delete kaynak.siraNo;delete kaynak.siraNoManuel;
        if(!doluSatir&&body.rows.length===1&&!body.querySelector('.icki-aciklama').value.trim())body.innerHTML='';
        for(let i=0;i<adet;i++)ihracatCekiUrunSatiriEkle(ekle,{...kaynak,ozel:{...(kaynak.ozel||{})}});
        input.value='';showToast(doluSatir?`${adet} satır, son ürün satırından kopyalandı.`:`${adet} boş satır eklendi.`);
    }
    async function ihracatCekiListesiSil(btn){
        if(!await fdYuzerOnaySor('Bu çeki listesi silinsin mi?'))return;
        const alan=document.getElementById('ihracatCekiListeleri'),kart=btn.closest('.ihracat-ceki-karti'),index=[...alan.children].indexOf(kart);kart.remove();
        ihracatCekiListeBasliklariniYenile();const kalan=alan.children.length;ihracatCekiSekmeleriniYenile(kalan?Math.min(index,kalan-1):'proforma');ihracatCekiFormProformaGuncelle();showToast('Çeki listesi silindi.');
    }
    function ihracatCekiListeBasliklariniYenile(){[...document.querySelectorAll('.ihracat-ceki-karti')].forEach((k,i)=>{const ad=k.querySelector('.ceki-liste-adi')?.value.trim()||`ÇEKİ LİSTESİ ${i+1}`,irsaliye=k.querySelector('.ceki-irsaliye')?.value.trim()||'-',booking=k.querySelector('.ceki-booking-no')?.value.trim()||'';k.querySelector('.ceki-baslik').textContent=`${ad} · İrsaliye No: ${irsaliye}${booking?' · Booking No: '+booking:''}`;});ihracatCekiFormProformaGuncelle();}
    function ihracatCekiSekmeleriniYenile(aktif=0){
        const kartlar=[...document.querySelectorAll('.ihracat-ceki-karti')],alan=document.getElementById('ihracatCekiSekmeleri'),proformaAktif=aktif==='proforma',faturaAktif=aktif==='fatura';
        const listeButonlari=kartlar.map((k,i)=>`<button type="button" class="${!proformaAktif&&!faturaAktif&&i===aktif?'active':''}" onclick="ihracatCekiSekmesiAc(${i},this)">${escapeDashboardText(k.querySelector('.ceki-liste-adi')?.value.trim()||'Ceki Listesi '+(i+1))}</button>`),proformaButonu=`<button type="button" class="${proformaAktif?'active':''}" onclick="ihracatCekiProformaSekmesiAc(this)">Proforma</button>`,faturaButonu=`<button type="button" class="${faturaAktif?'active':''}" onclick="ihracatCekiFaturaSekmesiAc(this)">Fatura PDF</button>`;
        alan.innerHTML=[...listeButonlari,proformaButonu,faturaButonu].join('');kartlar.forEach((k,i)=>k.style.display=!proformaAktif&&!faturaAktif&&i===aktif?'block':'none');document.getElementById('ihracatFormProforma').style.display=proformaAktif?'block':'none';document.getElementById('ihracatFormFatura').style.display=faturaAktif?'block':'none';ihracatCekiFormProformaGuncelle();
    }
    function ihracatCekiSekmesiAc(index,buton){document.querySelectorAll('#ihracatCekiSekmeleri button').forEach(b=>b.classList.remove('active'));buton.classList.add('active');document.getElementById('ihracatFormProforma').style.display='none';document.getElementById('ihracatFormFatura').style.display='none';[...document.querySelectorAll('.ihracat-ceki-karti')].forEach((k,i)=>k.style.display=i===index?'block':'none');}
    function ihracatCekiProformaSekmesiAc(buton){document.querySelectorAll('#ihracatCekiSekmeleri button').forEach(b=>b.classList.remove('active'));buton.classList.add('active');document.querySelectorAll('.ihracat-ceki-karti').forEach(k=>k.style.display='none');document.getElementById('ihracatFormFatura').style.display='none';document.getElementById('ihracatFormProforma').style.display='block';ihracatCekiFormProformaGuncelle();}
    function ihracatFormFaturaGuncelle(){const alan=document.getElementById('ihracatFormFatura');if(!alan)return;const id=document.getElementById('ihracatYuklemeEditId')?.value,y=(ihracatAktifFirma()?.yuklemeler||[]).find(k=>String(k.id)===String(id)),kayitli=y?.belgeler?.fatura;alan.innerHTML=`<div class="card" style="margin:0;"><div class="card-header"><div><h2>Fatura PDF</h2></div></div><div style="padding:15px;"><input id="ihracatFaturaPdf" type="file" accept="application/pdf">${kayitli?.url?`<p><a href="${escapeDashboardText(kayitli.url)}" target="_blank">Kayitli faturayi ac</a></p>`:''}</div></div>`;}
    function ihracatCekiFaturaSekmesiAc(buton){document.querySelectorAll('#ihracatCekiSekmeleri button').forEach(b=>b.classList.remove('active'));buton.classList.add('active');document.querySelectorAll('.ihracat-ceki-karti').forEach(k=>k.style.display='none');document.getElementById('ihracatFormProforma').style.display='none';document.getElementById('ihracatFormFatura').style.display='block';}
    function ihracatCekiSatiriniOku(tr){
        const sonuc={birim:'M2',birimFiyat:ihracatSayiyaCevir(tr.dataset.birimFiyat),proformaAdi:tr.dataset.proformaAdi||'',siraNo:tr.dataset.siraNo||'',siraNoManuel:tr.dataset.siraNoManuel==='1',ozel:{}};
        tr.querySelectorAll('[data-alan]').forEach(input=>{const deger=input.type==='number'?(input.value===''?'':Number(input.value)):input.value;if(input.dataset.alan.startsWith('ozel_'))sonuc.ozel[input.dataset.alan]=deger;else sonuc[input.dataset.alan]=deger;});
        return sonuc;
    }
    function ihracatCekiListeleriniOku(){return [...document.querySelectorAll('.ihracat-ceki-karti')].map(k=>({id:k.dataset.id,listeAdi:k.querySelector('.ceki-liste-adi').value,irsaliyeNo:k.querySelector('.ceki-irsaliye').value,bookingNo:k.querySelector('.ceki-booking-no')?.value||'',nakliyeci:{sofor:k.querySelector('.ceki-sofor').value,tcNo:k.querySelector('.ceki-sofor-tc').value,telefon:k.querySelector('.ceki-sofor-tel').value,cekiciPlaka:k.querySelector('.ceki-cekici').value,dorsePlaka:k.querySelector('.ceki-dorse').value,aracSahibi:k.querySelector('.ceki-arac-sahibi').value,aracSahibiTcVn:k.querySelector('.ceki-arac-sahibi-tc-vn').value},irsaliyePdf:k._irsaliyePdf||null,kantarFisi:k._kantarFisi||null,gorseller:k._gorseller||[],sutunlar:k._sutunlar.map(s=>({...s})),urunler:[...k.querySelectorAll('.ceki-urunler tr')].map(ihracatCekiSatiriniOku)}));}
    function ihracatNakliyeciKayitlari(haricKart=null){
        const kayitlar=ihracatFirmalari.flatMap(f=>(f.yuklemeler||[]).flatMap(y=>ihracatCekiListeleriniDuzelt(y).map(l=>l.nakliyeci))).filter(n=>n&&Object.values(n).some(Boolean));
        document.querySelectorAll('.ihracat-ceki-karti').forEach(k=>{if(k===haricKart)return;const n={sofor:k.querySelector('.ceki-sofor')?.value||'',tcNo:k.querySelector('.ceki-sofor-tc')?.value||'',telefon:k.querySelector('.ceki-sofor-tel')?.value||'',cekiciPlaka:k.querySelector('.ceki-cekici')?.value||'',dorsePlaka:k.querySelector('.ceki-dorse')?.value||'',aracSahibi:k.querySelector('.ceki-arac-sahibi')?.value||'',aracSahibiTcVn:k.querySelector('.ceki-arac-sahibi-tc-vn')?.value||''};if(Object.values(n).some(Boolean))kayitlar.push(n);});
        const benzersiz=new Map();kayitlar.forEach(n=>{const anahtar=String(n.tcNo||n.telefon||n.cekiciPlaka||`${n.sofor}|${n.dorsePlaka}`).toLocaleUpperCase('tr-TR');if(anahtar&&!benzersiz.has(anahtar))benzersiz.set(anahtar,n);});return [...benzersiz.values()];
    }
    function ihracatNakliyeciOner(input){
        const alan=input.dataset.nakField,deger=String(input.value||'').trim().toLocaleUpperCase('tr-TR');if(deger.length<2)return;
        const kart=input.closest('.ihracat-ceki-karti'),eslesenler=ihracatNakliyeciKayitlari(kart).filter(n=>String(n[alan]||'').trim().toLocaleUpperCase('tr-TR').startsWith(deger));
        if(eslesenler.length!==1)return;const n=eslesenler[0];
        kart.querySelector('.ceki-sofor').value=n.sofor||'';kart.querySelector('.ceki-sofor-tc').value=n.tcNo||'';kart.querySelector('.ceki-sofor-tel').value=n.telefon||'';kart.querySelector('.ceki-cekici').value=n.cekiciPlaka||'';kart.querySelector('.ceki-dorse').value=n.dorsePlaka||'';kart.querySelector('.ceki-arac-sahibi').value=n.aracSahibi||'';kart.querySelector('.ceki-arac-sahibi-tc-vn').value=n.aracSahibiTcVn||'';
    }
    function ihracatOlcuSayisi(deger){
        if(String(deger??'').trim()==='')return '';const sayi=ihracatSayiyaCevir(deger);return Number.isFinite(sayi)?String(Number(sayi.toFixed(2))):'';
    }
    function ihracatOlculuUrunAdi(u){
        const ad=String(u?.aciklama||'').trim().replace(/\s+/g,' '),olculer=[u?.kalinlik,u?.en,u?.boy].map(ihracatOlcuSayisi);
        return `${olculer.every(Boolean)?`${olculer.join('x')} cm `:''}${ad}`.trim();
    }
    function ihracatProformaToplamaModu(yukleme){
        return ['urun','olcu','ceki'].includes(yukleme?.proformaToplamaModu)?yukleme.proformaToplamaModu:'olcu';
    }
    function ihracatProformaKaynakAnahtari(u){return ihracatProformaGrupAnahtari(u,'olcu',null,0);}
    function ihracatProformaGrupAnahtari(u,mod,liste,listeIndex){
        const urunAdi=String(u?.aciklama||'').trim().replace(/\s+/g,' ').toLocaleUpperCase('tr-TR'),olculuAd=ihracatOlculuUrunAdi(u).toLocaleUpperCase('tr-TR');
        if(mod==='urun')return 'URUN|'+urunAdi+'|M2';
        if(mod==='ceki')return 'CEKI|'+String(liste?.id||listeIndex)+'|'+olculuAd+'|M2';
        return 'OLCU|'+olculuAd+'|M2';
    }
    function ihracatProformaKaynakSatirlariniGez(yukleme,anahtar,islem){
        const mod=ihracatProformaToplamaModu(yukleme);
        ihracatCekiListeleriniDuzelt(yukleme).forEach((liste,listeIndex)=>(liste.urunler||[]).forEach(satir=>{if(ihracatProformaGrupAnahtari(satir,mod,liste,listeIndex)===anahtar)islem(satir,liste,listeIndex);}));
    }
    function ihracatProformaUrunleriniBirlestir(yukleme){
        const gruplar=new Map(),mod=ihracatProformaToplamaModu(yukleme),haric=new Set(Array.isArray(yukleme?.proformaHaricAnahtarlar)?yukleme.proformaHaricAnahtarlar:[]);
        ihracatCekiListeleriniDuzelt(yukleme).forEach((liste,listeIndex)=>(liste.urunler||[]).forEach(u=>{
            const kaynakAnahtar=ihracatProformaGrupAnahtari(u,mod,liste,listeIndex);if(haric.has(kaynakAnahtar))return;
            const urunAdi=String(u.proformaAdi||'').trim()||(mod==='urun'?String(u.aciklama||'').trim():ihracatOlculuUrunAdi(u));
            const listeAdi=String(liste.listeAdi||'\u00c7eki Listesi '+(listeIndex+1)).trim(),gorunenAd=urunAdi;
            const birim='M2',fiyat=ihracatSayiyaCevir(u.birimFiyat);if(!urunAdi)return;
            if(!gruplar.has(kaynakAnahtar))gruplar.set(kaynakAnahtar,{...u,aciklama:gorunenAd,urunAdi,listeAdi,birim,birimFiyat:fiyat,miktar:0,kaynakAnahtar});
            const grup=gruplar.get(kaynakAnahtar);grup.miktar+=ihracatSayiyaCevir(u.miktar);if(!grup.birimFiyat&&fiyat)grup.birimFiyat=fiyat;
        }));
        return [...gruplar.values()];
    }
    async function ihracatFormProformaUrunAdiDuzenle(event,kodluAnahtar){
        event.preventDefault();const anahtar=decodeURIComponent(kodluAnahtar),yukleme=ihracatFormProformaVerisi(),urun=ihracatProformaUrunleriniBirlestir(yukleme).find(u=>u.kaynakAnahtar===anahtar);if(!urun)return;
        const yeni=await fdYuzerDegerSor('Proformada g\u00f6r\u00fcnecek \u00fcr\u00fcn ad\u0131:',urun.urunAdi||urun.aciklama);if(!yeni?.trim())return;
        const mod=ihracatProformaToplamaModu(yukleme);document.querySelectorAll('.ihracat-ceki-karti').forEach((kart,listeIndex)=>kart.querySelectorAll('.ceki-urunler tr').forEach(tr=>{const satir=ihracatCekiSatiriniOku(tr),liste={id:kart.dataset.id};if(ihracatProformaGrupAnahtari(satir,mod,liste,listeIndex)===anahtar)tr.dataset.proformaAdi=yeni.trim();}));
        ihracatCekiFormProformaGuncelle();
    }
    function ihracatFormProformaFiyatGuncelle(input,kodluAnahtar){
        const anahtar=decodeURIComponent(kodluAnahtar),fiyat=ihracatSayiyaCevir(input.value),yukleme=ihracatFormProformaVerisi(),mod=ihracatProformaToplamaModu(yukleme);
        document.querySelectorAll('.ihracat-ceki-karti').forEach((kart,listeIndex)=>kart.querySelectorAll('.ceki-urunler tr').forEach(tr=>{const satir=ihracatCekiSatiriniOku(tr),liste={id:kart.dataset.id};if(ihracatProformaGrupAnahtari(satir,mod,liste,listeIndex)===anahtar)tr.dataset.birimFiyat=String(fiyat);}));
        ihracatCekiFormProformaGuncelle();
    }
    function ihracatFormProformaToplamaDegistir(select){ihracatFormProformaToplamaModu=select.value;ihracatCekiFormProformaGuncelle();}
    async function ihracatFormProformaSatirSil(kodluAnahtar){const anahtar=decodeURIComponent(kodluAnahtar);if(!await fdYuzerOnaySor('Bu sat\u0131r yaln\u0131zca proformadan silinsin mi?'))return;ihracatFormProformaHaricAnahtarlar.add(anahtar);ihracatCekiFormProformaGuncelle();}
    async function ihracatKayitliProformaUrunAdiDuzenle(event,yuklemeId,kodluAnahtar){
        event.preventDefault();const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(yuklemeId)),anahtar=decodeURIComponent(kodluAnahtar);if(!yukleme)return;
        const urun=ihracatProformaUrunleriniBirlestir(yukleme).find(u=>u.kaynakAnahtar===anahtar);if(!urun)return;
        const yeni=await fdYuzerDegerSor('Proformada g\u00f6r\u00fcnecek \u00fcr\u00fcn ad\u0131:',urun.urunAdi||urun.aciklama);if(!yeni?.trim())return;
        ihracatProformaKaynakSatirlariniGez(yukleme,anahtar,s=>{s.proformaAdi=yeni.trim();});
        await supabaseVerileriKaydet();ihracatYuklemeDetaySekmeAc('proforma',document.querySelector('#ihracatYuklemeDetaySekmeler button.active'));showToast('Proforma \u00fcr\u00fcn ad\u0131 g\u00fcncellendi.');
    }
    async function ihracatKayitliProformaFiyatDuzenle(event,yuklemeId,kodluAnahtar){
        event.preventDefault();const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(yuklemeId)),anahtar=decodeURIComponent(kodluAnahtar);if(!yukleme)return;
        const urun=ihracatProformaUrunleriniBirlestir(yukleme).find(u=>u.kaynakAnahtar===anahtar),yeni=await fdYuzerDegerSor('Proforma birim fiyat\u0131:',urun?.birimFiyat||'');if(yeni===null)return;
        const fiyat=ihracatSayiyaCevir(yeni);ihracatProformaKaynakSatirlariniGez(yukleme,anahtar,s=>{s.birimFiyat=fiyat;});
        await supabaseVerileriKaydet();ihracatYuklemeDetaySekmeAc('proforma',document.querySelector('#ihracatYuklemeDetaySekmeler button.active'));showToast('Proforma fiyat\u0131 g\u00fcncellendi.');
    }
    async function ihracatKayitliProformaToplamaDegistir(yuklemeId,select){
        const yukleme=(ihracatAktifFirma()?.yuklemeler||[]).find(y=>String(y.id)===String(yuklemeId));if(!yukleme)return;yukleme.proformaToplamaModu=select.value;await supabaseVerileriKaydet();ihracatYuklemeDetaySekmeAc('proforma',document.querySelector('#ihracatYuklemeDetaySekmeler button.active'));
    }
    async function ihracatKayitliProformaSatirSil(yuklemeId,kodluAnahtar){
        if(!await fdYuzerOnaySor('Bu sat\u0131r yaln\u0131zca proformadan silinsin mi?'))return;const yukleme=(ihracatAktifFirma()?.yuklemeler||[]).find(y=>String(y.id)===String(yuklemeId));if(!yukleme)return;
        const anahtar=decodeURIComponent(kodluAnahtar),haric=new Set(Array.isArray(yukleme.proformaHaricAnahtarlar)?yukleme.proformaHaricAnahtarlar:[]);haric.add(anahtar);yukleme.proformaHaricAnahtarlar=[...haric];await supabaseVerileriKaydet();ihracatYuklemeDetaySekmeAc('proforma',document.querySelector('#ihracatYuklemeDetaySekmeler button.active'));showToast('Sat\u0131r proformadan silindi.');
    }
    function ihracatFormProformaVerisi(){
        return {
            id:`ihr_form_proforma_${Date.now()}`,
            tarih:document.getElementById('ihracatYuklemeTarih').value||bugununYerelTarihi(),
            no:document.getElementById('ihracatYuklemeNo').value,
            bookingNo:document.getElementById('ihracatBookingNo').value,
            varisYeri:document.getElementById('ihracatVarisYeri').value,
            satisTuru:document.getElementById('ihracatSatisTuru').value,
            proformaNo:document.getElementById('ihracatProformaNo').value,
            tutar:paraMetniniSayiyaCevir(document.getElementById('ihracatFaturaTutar').value),
            paraBirimi:document.getElementById('ihracatParaBirimi').value||'USD',
            tcmbKurlari:ihracatFormTcmbKurlari,
            tcmbKur:ihracatSeciliTcmbKuru(),
            tcmbKurTarihi:ihracatFormTcmbKurlari?.tarih||'',tcmbKurManuel:ihracatFormKurManuel,
            not:document.getElementById('ihracatYuklemeNot').value,
            proformaToplamaModu:ihracatFormProformaToplamaModu,
            proformaHaricAnahtarlar:[...ihracatFormProformaHaricAnahtarlar],
            cekiListeleri:ihracatCekiListeleriniOku()
        };
    }
    function ihracatCekiFormProformaGuncelle(){
        const alan=document.getElementById('ihracatFormProforma');if(!alan)return;
        const yukleme=ihracatFormProformaVerisi(),urunler=ihracatProformaUrunleriniBirlestir(yukleme).filter(u=>String(u.aciklama||'').trim()),mod=ihracatProformaToplamaModu(yukleme);
        const paraBirimi=escapeDashboardText(yukleme.paraBirimi||'USD'),sayi=ihracatSayiyaCevir,fiyat=x=>Number(x||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        const toplam=urunler.reduce((t,u)=>t+(sayi(u.miktar)*sayi(u.birimFiyat)),0),dovizToplami=yukleme.tutar||toplam,kur=ihracatSeciliTcmbKuru(),tlToplami=dovizToplami*kur;
        alan.innerHTML=`<div class="card" style="margin:0;">
            <div class="card-header" style="gap:12px;flex-wrap:wrap;">
                <div><h2>🧾 ${escapeDashboardText(yukleme.proformaNo||'Proforma Fatura')}</h2><p style="margin:5px 0 0;color:#64748b;">Toplama biçimini seçebilir, istemediğiniz satırı yalnızca proformadan silebilirsiniz.</p></div>
                <div class="action-btns"><label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;">Toplama <select style="min-height:34px;padding:5px 8px;" onchange="ihracatFormProformaToplamaDegistir(this)"><option value="urun" ${mod==='urun'?'selected':''}>Ürüne göre topla</option><option value="olcu" ${mod==='olcu'?'selected':''}>Ölçüye göre topla</option><option value="ceki" ${mod==='ceki'?'selected':''}>Çeki listesine göre topla</option></select></label><button type="button" class="btn-modern btn-detail-modern" onclick="ihracatFormProformaPdfOlustur()">📄 PDF İndir</button><button type="button" class="btn-modern btn-edit-modern" onclick="ihracatFormTumBelgelerExcelOlustur()">T&#252;m Belgeleri Excel'e Aktar</button></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:12px;">
                <div style="padding:10px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">ÇEKİ LİSTESİ</small><strong>${yukleme.cekiListeleri.length}</strong></div>
                <div style="padding:10px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">ÜRÜN KALEMİ</small><strong>${urunler.length}</strong></div>
                <div style="padding:10px;border:1px solid #dbe5ef;border-radius:8px;"><small style="display:block;color:#64748b;">GENEL TOPLAM</small><strong>${fiyat(dovizToplami)} ${paraBirimi}</strong></div>
                <div style="padding:10px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;"><small style="display:block;color:#1d4ed8;">TCMB KURUYLA TL</small><strong>${kur?fiyat(tlToplami)+' TL':'Kur yükleniyor...'}</strong></div>
            </div>
                <div class="table-wrapper"><table><thead><tr><th>NO</th><th>Ürün / Açıklama</th><th>Toplam Miktar</th><th>Birim</th><th>Birim Fiyat</th><th>Tutar</th><th></th></tr></thead><tbody>${urunler.length?urunler.map((u,i)=>`<tr><td>${i+1}</td><td style="cursor:context-menu;" title="Proforma ürün adını değiştirmek için sağ tıklayın" oncontextmenu="ihracatFormProformaUrunAdiDuzenle(event,'${encodeURIComponent(u.kaynakAnahtar)}')"><strong>${escapeDashboardText(u.aciklama)}</strong></td><td>${sayi(u.miktar).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${escapeDashboardText(u.birim)}</td><td><input type="number" min="0" step="0.01" value="${sayi(u.birimFiyat)||''}" placeholder="0,00" style="width:120px;text-align:right;color:${sayi(u.birimFiyat)>0?'#0f172a':'#dc2626'};font-weight:${sayi(u.birimFiyat)>0?'600':'800'};border-color:${sayi(u.birimFiyat)>0?'#cbd5e1':'#ef4444'};" onchange="ihracatFormProformaFiyatGuncelle(this,'${encodeURIComponent(u.kaynakAnahtar)}')"> <strong style="color:${sayi(u.birimFiyat)>0?'inherit':'#dc2626'};">${sayi(u.birimFiyat)>0?'':'0,00 '}${paraBirimi}</strong></td><td><strong>${fiyat(sayi(u.miktar)*sayi(u.birimFiyat))} ${paraBirimi}</strong></td><td><button type="button" class="btn-modern" style="background:#e2e8f0;color:#334155;border:1px solid #cbd5e1;" title="Proformadan sil" onclick="ihracatFormProformaSatirSil('${encodeURIComponent(u.kaynakAnahtar)}')">🗑️</button></td></tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:22px;color:#64748b;">Çeki listelerine ürün yazdığınızda proforma burada otomatik oluşacaktır.</td></tr>'}</tbody></table></div>
        </div>`;ihracatKurTlKarsiliginiGuncelle();
    }    async function ihracatFormCekiBelgeOlustur(btn,tur){
        const firma=ihracatAktifFirma(),kart=btn.closest('.ihracat-ceki-karti'),yukleme=ihracatFormProformaVerisi(),liste=yukleme.cekiListeleri.find(l=>String(l.id)===String(kart?.dataset.id));
        if(!firma||!liste)return;if(!(liste.urunler||[]).some(u=>String(u.aciklama||'').trim())){showToast('Çıktı için önce en az bir ürün satırı doldurun.','warning');return;}
        if(!Array.isArray(firma.yuklemeler))firma.yuklemeler=[];firma.yuklemeler.push(yukleme);
        try{if(tur==='excel')ihracatBelgeExcelOlustur(yukleme.id,'ceki',liste.id);else await ihracatBelgeOlustur(yukleme.id,'ceki',liste.id);}
        finally{firma.yuklemeler=firma.yuklemeler.filter(y=>String(y.id)!==String(yukleme.id));}
    }
    async function ihracatFormProformaPdfOlustur(){
        const firma=ihracatAktifFirma(),yukleme=ihracatFormProformaVerisi();
        const urunler=ihracatProformaUrunleriniBirlestir(yukleme).filter(u=>String(u.aciklama||'').trim());
        if(!firma){showToast('Önce ihracat firmasını seçin.','warning');return;}
        if(!urunler.length){showToast('Proforma için önce en az bir ürün satırı doldurun.','warning');return;}
        if(!Array.isArray(firma.yuklemeler))firma.yuklemeler=[];
        firma.yuklemeler.push(yukleme);
        try{await ihracatBelgeOlustur(yukleme.id,'proforma');}
        finally{firma.yuklemeler=firma.yuklemeler.filter(y=>String(y.id)!==String(yukleme.id));}
    }
    function ihracatFormProformaExcelOlustur(){
        const firma=ihracatAktifFirma(),yukleme=ihracatFormProformaVerisi(),urunler=ihracatProformaUrunleriniBirlestir(yukleme).filter(u=>String(u.aciklama||'').trim());
        if(!firma){showToast('Önce ihracat firmasını seçin.','warning');return;}
        if(!urunler.length){showToast('Proforma için önce en az bir ürün satırı doldurun.','warning');return;}
        if(!Array.isArray(firma.yuklemeler))firma.yuklemeler=[];
        firma.yuklemeler.push(yukleme);
        try{ihracatBelgeExcelOlustur(yukleme.id,'proforma');}
        finally{firma.yuklemeler=firma.yuklemeler.filter(y=>String(y.id)!==String(yukleme.id));}
    }
    function ihracatPdfOnizlemeHazirla(dosyaAdi){return fdCiktiOnizlemeAc('pdf',dosyaAdi);}
    async function ihracatPdfOnizlemeDoldur(onizleme,blob){return fdCiktiPdfOnizle(blob,onizleme.dosyaAdi,onizleme);}
    async function ihracatPdfKanvasIndir(alan,dosyaAdi,yon='landscape'){
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)throw new Error('PDF kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        const onizleme=ihracatPdfOnizlemeHazirla(dosyaAdi),sahne=document.createElement('div'),kopya=alan.cloneNode(true);sahne.style.cssText='position:fixed;left:0;top:0;z-index:2147483645;background:#fff;overflow:visible;width:max-content;';kopya.style.position='static';kopya.style.left='auto';kopya.style.top='auto';kopya.style.zIndex='auto';kopya.style.transform='none';kopya.style.visibility='visible';sahne.appendChild(kopya);document.body.appendChild(sahne);
        try{
            const sayfalar=[...kopya.children].filter(el=>el.classList?.contains('ihracat-pdf-sayfa'));if(!sayfalar.length)sayfalar.push(kopya);
            sayfalar.forEach(sayfa=>{sayfa.style.height='auto';sayfa.style.minHeight='0';sayfa.style.maxHeight='none';sayfa.style.overflow='visible';sayfa.style.transform='none';sayfa.querySelectorAll('.ihr-pdf').forEach(icerik=>{icerik.style.transform='none';icerik.style.width='100%';});});
            if(document.fonts?.ready)await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(resolve=>setTimeout(resolve,100));
            const pdf=new window.jspdf.jsPDF({orientation:yon,unit:'mm',format:'a4',compress:true});
            for(let i=0;i<sayfalar.length;i++){
                const sayfa=sayfalar[i],canvas=await html2canvas(sayfa,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,scrollX:0,scrollY:0,windowWidth:Math.max(sayfa.scrollWidth,sayfa.offsetWidth),windowHeight:Math.max(sayfa.scrollHeight,sayfa.offsetHeight)});
                if(i>0)pdf.addPage('a4',yon);const sayfaGenisligi=pdf.internal.pageSize.getWidth(),sayfaYuksekligi=pdf.internal.pageSize.getHeight(),kenar=5,oran=Math.min((sayfaGenisligi-kenar*2)/canvas.width,(sayfaYuksekligi-kenar*2)/canvas.height),genislik=canvas.width*oran,yukseklik=canvas.height*oran,x=(sayfaGenisligi-genislik)/2,y=(sayfaYuksekligi-yukseklik)/2;
                pdf.addImage(canvas.toDataURL('image/jpeg',.98),'JPEG',x,y,genislik,yukseklik,undefined,'FAST');
            }
            const blob=pdf.output('blob');if(!blob||!blob.size)throw new Error('PDF dosyası oluşturulamadı.');await ihracatPdfOnizlemeDoldur(onizleme,blob);return blob;
        }catch(error){onizleme.sayfalar.innerHTML='<div style="margin-top:24px;padding:20px;background:#fff;border-radius:10px;color:#b91c1c;">PDF oluşturulamadı: '+escapeDashboardText(error?.message||error)+'</div>';throw error;}finally{sahne.remove();}
    }
    async function ihracatTumBelgelerPdfOlustur(id){
        const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(id));if(!yukleme)return;
        const listeler=ihracatCekiListeleriniDuzelt(yukleme).filter(l=>(l.urunler||[]).some(s=>String(s.aciklama||'').trim()));if(!listeler.length){showToast('Once en az bir urun satiri girin.','warning');return;}
        const paket=document.createElement('div');paket.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;width:296mm;background:#fff;color:#111827;visibility:hidden;';document.body.appendChild(paket);
        try{for(const liste of listeler){const sayfa=document.createElement('div');sayfa.className='ihracat-pdf-sayfa ihracat-pdf-tek-sayfa';sayfa.style.cssText='width:296mm;background:#fff;';paket.appendChild(sayfa);await ihracatBelgeOlustur(id,'ceki',liste.id,sayfa);}const proforma=document.createElement('div');proforma.className='ihracat-pdf-sayfa';proforma.style.cssText='width:296mm;background:#fff;display:flex;justify-content:center;';paket.appendChild(proforma);await ihracatBelgeOlustur(id,'proforma','',proforma);paket.style.visibility='visible';await ihracatPdfKanvasIndir(paket,ihracatDosyaAnahtari(yukleme.proformaNo||yukleme.no||'IHRACAT')+'_TUM_BELGELER.pdf','landscape');showToast('Tüm belgeler PDF önizlemesine hazırlandı.');}catch(error){alert('PDF olusturulamadi: '+(error?.message||error));}finally{paket.remove();}
    }
    async function ihracatBelgeOlustur(id,tur,cekiId='',hedefAlan=null){
        if(typeof html2pdf!=='function'){alert('PDF kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.');return;}
        const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(id));
        if(!firma||!yukleme)return;
        const listeler=ihracatCekiListeleriniDuzelt(yukleme),seciliListe=listeler.find(l=>String(l.id)===String(cekiId))||listeler[0];
        const satirlar=tur==='proforma'?ihracatProformaUrunleriniBirlestir(yukleme):(seciliListe?.urunler||[]),sirket=sirketler.find(s=>String(s.id)===String(aktifSirketId()))||{},cekiSutunlar=ihracatCekiSutunlariniDuzelt(seciliListe?.sutunlar);
        if(!satirlar.length||!satirlar.some(s=>String(s.aciklama||'').trim())){showToast('Önce en az bir çeki listesi satırı girin.','warning');return;}
        const paraBirimi=escapeDashboardText(yukleme.paraBirimi||'USD');
        const sayi=ihracatSayiyaCevir;
        const fiyat=x=>Number(x||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        const satirToplami=s=>sayi(s.miktar)*sayi(s.birimFiyat);
        const hesaplananToplam=satirlar.reduce((t,s)=>t+satirToplami(s),0);
        const genelToplam=sayi(yukleme.tutar)||hesaplananToplam;
        const tcmbKur=sayi(yukleme.tcmbKur||yukleme.tcmbKurlari?.[yukleme.paraBirimi]||(yukleme.paraBirimi==='TRY'?1:0)),genelToplamTl=genelToplam*tcmbKur;
        const proforma=tur==='proforma';
        const baslik=proforma?'PROFORMA FATURA / PROFORMA INVOICE':`${seciliListe?.listeAdi||'ÇEKİ LİSTESİ'} / PACKING LIST`;
        const kolonlar=proforma
            ?'<th>ÜRÜN / DESCRIPTION</th><th>MİKTAR / QTY</th><th>BİRİM / UNIT</th><th>BİRİM FİYAT / UNIT PRICE</th><th>TUTAR / AMOUNT</th>'
            :`<th>NO</th>${cekiSutunlar.map(s=>`<th>${escapeDashboardText(s.baslik)}</th>`).join('')}`;
        const govde=satirlar.filter(s=>String(s.aciklama||'').trim()).map((s,i)=>proforma
            ?`<tr><td>${escapeDashboardText(s.aciklama||'-')}</td><td class="sayi">${fiyat(sayi(s.miktar))}</td><td class="orta">${escapeDashboardText(s.birim||'M2')}</td><td class="sayi ${sayi(s.birimFiyat)>0?'':'fiyat-sifir'}">${fiyat(sayi(s.birimFiyat))} ${paraBirimi}</td><td class="sayi">${fiyat(satirToplami(s))} ${paraBirimi}</td></tr>`
            :`<tr><td class="orta">${escapeDashboardText(s.siraNo||i+1)}</td>${cekiSutunlar.map(k=>{const deger=k.alan.startsWith('ozel_')?s.ozel?.[k.alan]:s[k.alan],bos=String(deger??'').trim()==='';return `<td class="${k.tip==='number'?'sayi':''}">${k.tip==='number'?(bos?'-':fiyat(sayi(deger))):escapeDashboardText(deger||'-')}</td>`;}).join('')}</tr>`
        ).join('');
        const toplamNo=new Set(satirlar.filter(s=>String(s.aciklama||'').trim()).map((s,i)=>String(s.siraNo||i+1))).size,toplamAdet=satirlar.reduce((t,s)=>t+sayi(s.adet),0),toplamM2=satirlar.reduce((t,s)=>t+sayi(s.miktar),0),toplamNet=satirlar.reduce((t,s)=>t+sayi(s.net),0),toplamBrut=satirlar.reduce((t,s)=>t+sayi(s.brut),0);
        const toplamDegerleri={adet:toplamAdet,miktar:toplamM2,net:toplamNet,brut:toplamBrut};
        const toplamSatiri=proforma?'':`<tr class="toplam-satiri"><td class="sayi">${toplamNo}</td>${cekiSutunlar.map(s=>s.alan==='aciklama'?'<td>TOPLAM / TOTAL</td>':Object.prototype.hasOwnProperty.call(toplamDegerleri,s.alan)?`<td class="sayi">${fiyat(toplamDegerleri[s.alan])}</td>`:'<td></td>').join('')}</tr>`;
        const sirketAdi=sirket.unvan||sirket.kisaAd||sirket.ad||'';
        const sirketIletisim=[sirket.telefon,sirket.eposta,sirket.web].filter(Boolean).join(' · ');
        const aliciAdres=[firma.adres,[firma.postaKodu,firma.sehir,firma.ulke].filter(Boolean).join(' ')].filter(Boolean).map(escapeDashboardText).join('<br>');
        const aliciVergi=[firma.vergiDairesi,firma.vergiNo].filter(Boolean).join(' / '),aliciIletisim=[firma.telefon,firma.eposta,firma.web].filter(Boolean).join(' · ');
        const taraflar=proforma
            ?`<div class="fatura-ust"><div><div class="fatura-marka">${escapeDashboardText(sirketAdi)}</div><div class="fatura-marka-alt">${escapeDashboardText(sirket.adres||'')}<br>${escapeDashboardText([sirket.vergiDairesi,sirket.vergiNo,sirketIletisim].filter(Boolean).join(' · '))}</div></div><div class="fatura-kimlik"><strong>PROFORMA INVOICE</strong><span>NO: ${escapeDashboardText(yukleme.proformaNo||'-')}</span><span>DATE: ${tarihFormati(yukleme.tarih)}</span></div></div><div class="taraflar"><div class="kutu"><div class="etiket">FROM / SELLER</div><div class="deger"><strong>${escapeDashboardText(sirketAdi)}</strong><br>${escapeDashboardText(sirket.adres||'')}<br>${escapeDashboardText([sirket.vergiDairesi,sirket.vergiNo].filter(Boolean).join(' / '))}<br>${escapeDashboardText(sirketIletisim)}</div></div><div class="kutu"><div class="etiket">BILL TO / BUYER</div><div class="deger"><strong>${escapeDashboardText(firma.ad||'')}</strong><br>${aliciAdres}<br>${escapeDashboardText(aliciVergi)}${firma.sicilNo?`<br>REG. NO: ${escapeDashboardText(firma.sicilNo)}`:''}${firma.yetkili?`<br>CONTACT: ${escapeDashboardText([firma.yetkili,firma.yetkiliUnvan].filter(Boolean).join(' · '))}`:''}<br>${escapeDashboardText(aliciIletisim)}${firma.teslimatAdres?`<br><br><strong>SHIP TO:</strong> ${escapeDashboardText(firma.teslimatAdres)}`:''}</div></div></div>`
            :`<div class="firma-baslik"><strong>${escapeDashboardText(sirketAdi)}</strong><span>${escapeDashboardText(sirket.adres||'')}</span><span>${escapeDashboardText([sirket.vergiDairesi,sirket.vergiNo,sirketIletisim].filter(Boolean).join(' · '))}</span></div>`;
        const bilgiBlogu=proforma
            ?`<div class="bilgi"><div><div class="etiket">REFERANS / REFERENCE</div><strong>${escapeDashboardText(yukleme.no||'-')}</strong></div><div><div class="etiket">BOOKING NO</div><strong>${escapeDashboardText(proforma?(yukleme.bookingNo||'-'):(seciliListe?.bookingNo||''))}</strong></div><div><div class="etiket">VARIŞ YERİ / DESTINATION</div><strong>${escapeDashboardText(yukleme.varisYeri||'-')}</strong></div><div><div class="etiket">SATIŞ / DELIVERY</div><strong>${escapeDashboardText(yukleme.satisTuru||'-')}</strong></div><div><div class="etiket">PARA BİRİMİ / CURRENCY</div><strong>${paraBirimi}</strong></div><div><div class="etiket">TOPLAM / TOTAL</div><strong>${fiyat(genelToplam)} ${paraBirimi}</strong></div></div>`
            :`<div class="bilgi"><div><div class="etiket">İRSALİYE NO</div><strong>${escapeDashboardText(seciliListe?.irsaliyeNo||'-')}</strong></div><div><div class="etiket">BOOKING NO</div><strong>${escapeDashboardText(proforma?(yukleme.bookingNo||'-'):(seciliListe?.bookingNo||''))}</strong></div><div><div class="etiket">VARIŞ YERİ / DESTINATION</div><strong>${escapeDashboardText(yukleme.varisYeri||'-')}</strong></div><div><div class="etiket">TARİH / DATE</div><strong>${tarihFormati(yukleme.tarih)}</strong></div><div><div class="etiket">REFERANS NO</div><strong>${escapeDashboardText(yukleme.no||'-')}</strong></div><div><div class="etiket">SATIŞ TÜRÜ</div><strong>${escapeDashboardText(yukleme.satisTuru||'-')}</strong></div></div>`;
        const proformaAlt=`<div class="fatura-alt"><div class="fatura-not">${(sirket.digerBilgiler||sirket.notlar)?`<strong>BANK DETAILS</strong><br>${escapeDashboardText(sirket.digerBilgiler||sirket.notlar)}`:''}${yukleme.not?`<br><br><strong>NOTE</strong><br>${escapeDashboardText(yukleme.not)}`:''}</div><div class="fatura-toplam"><div><span>SUBTOTAL</span><strong>${fiyat(hesaplananToplam)} ${paraBirimi}</strong></div><div><span>TCMB DÖVİZ ALIŞ</span><strong>${tcmbKur?`${fiyat(tcmbKur)} TL · ${tarihFormati(yukleme.tcmbKurTarihi)}`:'-'}</strong></div><div><span>TL KARŞILIĞI</span><strong>${tcmbKur?`${fiyat(genelToplamTl)} TL`:'-'}</strong></div><div class="genel"><span>TOTAL</span><strong>${fiyat(genelToplam)} ${paraBirimi}</strong></div></div></div>`;
        const alan=hedefAlan||document.createElement('div');
        alan.style.cssText=hedefAlan?`width:${proforma?'190':'296'}mm;background:#fff;color:#111827;font-family:Arial,sans-serif;padding:${proforma?'10':'6'}mm;box-sizing:border-box;overflow:visible;`:`position:fixed;left:0;top:0;z-index:2147483647;width:${proforma?'190':'296'}mm;background:#fff;color:#111827;font-family:Arial,sans-serif;padding:${proforma?'10':'6'}mm;box-sizing:border-box;overflow:visible;`;
        alan.innerHTML=`<style>
            .ihr-pdf *{box-sizing:border-box}.ihr-pdf h1{text-align:center;font-size:19px;margin:9px 0 12px}.ihr-pdf .firma-baslik{text-align:center;border-bottom:2px solid #0f172a;padding:2px 8px 10px;margin-bottom:8px}.ihr-pdf .firma-baslik strong{display:block;font-size:18px}.ihr-pdf .firma-baslik span{display:block;font-size:9px;line-height:1.4}.ihr-pdf .fatura-ust{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:10px;margin-bottom:12px}.ihr-pdf .fatura-marka{font-size:18px;font-weight:800}.ihr-pdf .fatura-marka-alt{font-size:8.5px;line-height:1.45;margin-top:4px;max-width:105mm}.ihr-pdf .fatura-kimlik{text-align:right}.ihr-pdf .fatura-kimlik strong{display:block;font-size:22px;letter-spacing:.04em}.ihr-pdf .fatura-kimlik span{display:block;font-size:9px;margin-top:4px}.ihr-pdf .taraflar{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.ihr-pdf .kutu{border:1px solid #475569;padding:9px;min-height:92px}.ihr-pdf .etiket{font-size:8.5px;color:#475569;font-weight:800;margin-bottom:5px}.ihr-pdf .deger{font-size:9.5px;line-height:1.4}.ihr-pdf .bilgi{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #475569;margin-bottom:10px;background:#f8fafc}.ihr-pdf .bilgi>div{padding:7px;border-right:1px solid #94a3b8;border-bottom:1px solid #94a3b8}.ihr-pdf table{width:100%;border-collapse:collapse;font-size:${proforma?'9.5px':'8px'}}.ihr-pdf th,.ihr-pdf td{border:1px solid #475569;padding:${proforma?'8px':'4px'};text-align:left}.ihr-pdf th{background:${proforma?'#0f172a':'#e2e8f0'};color:${proforma?'#fff':'#111827'};font-size:${proforma?'8.5px':'7.5px'};text-align:center}.ihr-pdf .orta{text-align:center}.ihr-pdf .sayi{text-align:right;white-space:nowrap}.ihr-pdf .fiyat-sifir{color:#dc2626!important;font-weight:800}.ihr-pdf .toplam-satiri td{font-weight:700;background:#f1f5f9}.ihr-pdf .toplam-satiri td:first-child{text-align:right}.ihr-pdf .not{white-space:pre-wrap;margin-top:12px;font-size:10px;border:1px solid #94a3b8;padding:7px}.ihr-pdf .fatura-alt{display:grid;grid-template-columns:1fr 85mm;gap:14px;margin-top:14px}.ihr-pdf .fatura-not{font-size:9px;line-height:1.45;white-space:pre-wrap}.ihr-pdf .fatura-toplam{border:1px solid #0f172a}.ihr-pdf .fatura-toplam>div{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-bottom:1px solid #cbd5e1}.ihr-pdf .fatura-toplam>div:last-child{border:0}.ihr-pdf .fatura-toplam .genel{background:#0f172a;color:#fff;font-size:12px}
        </style><div class="ihr-pdf">${taraflar}${proforma?'':`<h1>${baslik}</h1>`}${bilgiBlogu}<table><thead><tr>${kolonlar}</tr></thead><tbody>${govde}${toplamSatiri}</tbody></table>${proforma?proformaAlt:`<div class="not"><strong>NAKLİYECİ BİLGİLERİ / DRIVER INFORMATION</strong><br>Şoför: ${escapeDashboardText(seciliListe?.nakliyeci?.sofor||'-')} · T.C.: ${escapeDashboardText(seciliListe?.nakliyeci?.tcNo||'-')} · Telefon: ${escapeDashboardText(seciliListe?.nakliyeci?.telefon||'-')}<br>Çekici: ${escapeDashboardText(seciliListe?.nakliyeci?.cekiciPlaka||'-')} · Dorse: ${escapeDashboardText(seciliListe?.nakliyeci?.dorsePlaka||'-')}<br>Araç Sahibi: ${escapeDashboardText(seciliListe?.nakliyeci?.aracSahibi||'-')} · Araç Sahibi T.C./V.N.: ${escapeDashboardText(seciliListe?.nakliyeci?.aracSahibiTcVn||'-')}</div>${yukleme.not?`<div class="not"><strong>NOT:</strong><br>${escapeDashboardText(yukleme.not)}</div>`:''}`}</div>`;
        if(!hedefAlan)document.body.appendChild(alan);if(!proforma)alan.classList.add('ihracat-pdf-tek-sayfa');if(hedefAlan)return {proforma};
        try{
            const cekiSira=Math.max(0,listeler.indexOf(seciliListe))+1;
            await ihracatPdfKanvasIndir(alan,`${yukleme.proformaNo||'IHRACAT'}_${proforma?'PROFORMA':`CEKI_LISTESI_${cekiSira}`}.pdf`,proforma?'portrait':'landscape');
            showToast(`${proforma?'Proforma':'Çeki listesi'} PDF önizlemesine hazırlandı.`);
        }catch(error){alert('PDF oluşturulamadı: '+(error?.message||error));}finally{alan.remove();}
    }
    function ihracatBelgeExcelOlustur(id,tur,cekiId=''){
        if(typeof XLSX==='undefined'){alert('Excel kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.');return;}
        const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(id));
        if(!firma||!yukleme)return;
        const listeler=ihracatCekiListeleriniDuzelt(yukleme),seciliListe=listeler.find(l=>String(l.id)===String(cekiId))||listeler[0],proforma=tur==='proforma';
        const satirlar=(proforma?ihracatProformaUrunleriniBirlestir(yukleme):(seciliListe?.urunler||[])).filter(s=>String(s.aciklama||'').trim());
        if(!satirlar.length){showToast('Önce en az bir ürün satırı girin.','warning');return;}
        const sirket=sirketler.find(s=>String(s.id)===String(aktifSirketId()))||{},sayi=ihracatSayiyaCevir,para=yukleme.paraBirimi||'USD',cekiSutunlar=ihracatCekiSutunlariniDuzelt(seciliListe?.sutunlar),tcmbKur=sayi(yukleme.tcmbKur||yukleme.tcmbKurlari?.[para]||(para==='TRY'?1:0)),genelDoviz=sayi(yukleme.tutar)||satirlar.reduce((t,s)=>t+sayi(s.miktar)*sayi(s.birimFiyat),0);
        const sirketAdi=sirket.unvan||sirket.kisaAd||sirket.ad||'',sirketIletisim=[sirket.telefon,sirket.eposta,sirket.web].filter(Boolean).join(' · ');
        let aoa=[],birlesimler=[],baslikSatiri=0,ilkVeriSatiri=0,sonVeriSatiri=0;
        if(proforma){
            const saticiDetay=[sirketAdi,sirket.adres,[sirket.vergiDairesi,sirket.vergiNo].filter(Boolean).join(' / '),sirketIletisim].filter(Boolean).join('\n');
            const aliciDetay=[firma.ad,firma.adres,[firma.postaKodu,firma.sehir,firma.ulke].filter(Boolean).join(' '),[firma.vergiDairesi,firma.vergiNo].filter(Boolean).join(' / '),firma.sicilNo?`REG. NO: ${firma.sicilNo}`:'',[firma.yetkili,firma.yetkiliUnvan].filter(Boolean).join(' · '),[firma.telefon,firma.eposta,firma.web].filter(Boolean).join(' · '),firma.teslimatAdres?`SHIP TO: ${firma.teslimatAdres}`:''].filter(Boolean).join('\n');
            aoa=[
                [sirketAdi,'','','',''],
                [sirket.adres||'','','','',''],
                [[sirket.vergiDairesi,sirket.vergiNo,sirketIletisim].filter(Boolean).join(' · '),'','','',''],
                [],
                ['PROFORMA FATURA / PROFORMA INVOICE','','','',''],
                ['PROFORMA NO',yukleme.proformaNo||'','','TARİH / DATE',tarihFormati(yukleme.tarih)],
                ['REFERANS / REFERENCE',yukleme.no||'','','PARA BİRİMİ / CURRENCY',para],
                ['BOOKING NO',yukleme.bookingNo||'','','VARIŞ YERİ / DESTINATION',yukleme.varisYeri||''],
                ['TCMB DÖVİZ ALIŞ',tcmbKur||'','','TL KARŞILIĞI',tcmbKur?genelDoviz*tcmbKur:''],
                [],
                ['SATICI / SELLER',saticiDetay,'','ALICI / BUYER',aliciDetay],
                [],
                ['ÜRÜN / DESCRIPTION','MİKTAR / QTY','BİRİM / UNIT','BİRİM FİYAT / UNIT PRICE','TUTAR / AMOUNT'],
                ...satirlar.map(s=>[s.aciklama,sayi(s.miktar),s.birim||'M2',sayi(s.birimFiyat),sayi(s.miktar)*sayi(s.birimFiyat)]),
                ['','','','ARA TOPLAM / SUBTOTAL',satirlar.reduce((t,s)=>t+sayi(s.miktar)*sayi(s.birimFiyat),0)],
                ['','','','GENEL TOPLAM / TOTAL',sayi(yukleme.tutar)||satirlar.reduce((t,s)=>t+sayi(s.miktar)*sayi(s.birimFiyat),0)],
                [],
                ['SATIŞ TÜRÜ / DELIVERY',yukleme.satisTuru||'','','',''],
                ['BANKA VE DİĞER BİLGİLER / BANK DETAILS',sirket.digerBilgiler||sirket.notlar||'','','',''],
                ['NOT / NOTE',yukleme.not||'','','','']
            ];
            birlesimler=[{s:{r:0,c:0},e:{r:0,c:4}},{s:{r:1,c:0},e:{r:1,c:4}},{s:{r:2,c:0},e:{r:2,c:4}},{s:{r:4,c:0},e:{r:4,c:4}},{s:{r:5,c:1},e:{r:5,c:2}},{s:{r:6,c:1},e:{r:6,c:2}},{s:{r:7,c:1},e:{r:7,c:2}},{s:{r:8,c:1},e:{r:8,c:2}},{s:{r:10,c:1},e:{r:10,c:2}},{s:{r:16+satirlar.length,c:1},e:{r:16+satirlar.length,c:4}},{s:{r:17+satirlar.length,c:1},e:{r:17+satirlar.length,c:4}},{s:{r:18+satirlar.length,c:1},e:{r:18+satirlar.length,c:4}}];
            baslikSatiri=12;ilkVeriSatiri=13;sonVeriSatiri=12+satirlar.length;
        }else{
            const toplanabilir=new Set(['adet','miktar','net','brut']),toplamlar={},toplamNo=new Set(satirlar.map((s,i)=>String(s.siraNo||i+1))).size;cekiSutunlar.forEach(k=>{if(toplanabilir.has(k.alan))toplamlar[k.alan]=satirlar.reduce((t,s)=>t+sayi(k.alan.startsWith('ozel_')?s.ozel?.[k.alan]:s[k.alan]),0);});
            const sonKolon=cekiSutunlar.length;
            aoa=[
                [sirketAdi],
                [sirket.adres||''],
                [[sirket.vergiDairesi,sirket.vergiNo,sirketIletisim].filter(Boolean).join(' · ')],
                [],
                ['ÇEKİ LİSTESİ / PACKING LIST'],
                ['İRSALİYE NO',seciliListe?.irsaliyeNo||'','BOOKING NO',seciliListe?.bookingNo||'','REFERANS / TARİH',[yukleme.no,tarihFormati(yukleme.tarih)].filter(Boolean).join(' · ')],
                ['NO',...cekiSutunlar.map(s=>s.baslik)],
                ...satirlar.map((s,i)=>[s.siraNo||i+1,...cekiSutunlar.map(k=>{const deger=k.alan.startsWith('ozel_')?s.ozel?.[k.alan]:s[k.alan];return k.tip==='number'?(String(deger??'').trim()===''?'':sayi(deger)):(deger||'');})]),
                [toplamNo,...cekiSutunlar.map(k=>k.alan==='aciklama'?'TOPLAM / TOTAL':Object.prototype.hasOwnProperty.call(toplamlar,k.alan)?toplamlar[k.alan]:'')],
                [],
                ['NAKLİYECİ BİLGİLERİ / DRIVER INFORMATION'],
                ['ŞOFÖR / DRIVER',seciliListe?.nakliyeci?.sofor||'','T.C.',seciliListe?.nakliyeci?.tcNo||'','TELEFON',seciliListe?.nakliyeci?.telefon||''],
                ['ÇEKİCİ / TRUCK',seciliListe?.nakliyeci?.cekiciPlaka||'','DORSE / TRAILER',seciliListe?.nakliyeci?.dorsePlaka||''],
                ['ARAÇ SAHİBİ / VEHICLE OWNER',seciliListe?.nakliyeci?.aracSahibi||'','T.C. / V.N.',seciliListe?.nakliyeci?.aracSahibiTcVn||''],
                ['NOT / NOTE',yukleme.not||'']
            ];
            birlesimler=[{s:{r:0,c:0},e:{r:0,c:sonKolon}},{s:{r:1,c:0},e:{r:1,c:sonKolon}},{s:{r:2,c:0},e:{r:2,c:sonKolon}},{s:{r:4,c:0},e:{r:4,c:sonKolon}},{s:{r:9+satirlar.length,c:0},e:{r:9+satirlar.length,c:sonKolon}},{s:{r:13+satirlar.length,c:1},e:{r:13+satirlar.length,c:sonKolon}}];
            baslikSatiri=6;ilkVeriSatiri=7;sonVeriSatiri=6+satirlar.length;
        }
        const ws=XLSX.utils.aoa_to_sheet(aoa),wb=XLSX.utils.book_new();
        ws['!merges']=birlesimler;
        ws['!cols']=proforma?[{wch:54},{wch:15},{wch:13},{wch:20},{wch:20}]:[{wch:8},...cekiSutunlar.map(k=>({wch:k.alan==='aciklama'?38:Math.max(12,Math.min(24,String(k.baslik).length+3))}))];
        ws['!rows']=aoa.map((_,i)=>({hpt:i===0?24:(i===4?25:(proforma&&i===8?72:18))}));
        const aralik=XLSX.utils.decode_range(ws['!ref']);
        for(let r=aralik.s.r;r<=aralik.e.r;r++)for(let c=aralik.s.c;c<=aralik.e.c;c++){
            const hucre=ws[XLSX.utils.encode_cell({r,c})];if(!hucre)continue;
            hucre.s={font:{name:'Arial',sz:r===0?14:10,bold:r===0||r===4||r===baslikSatiri,color:proforma&&r===baslikSatiri?{rgb:'FFFFFF'}:undefined},alignment:{vertical:'center',horizontal:c===0?'left':'center',wrapText:true},border:r>=baslikSatiri&&r<=sonVeriSatiri?{top:{style:'thin',color:{rgb:'808080'}},bottom:{style:'thin',color:{rgb:'808080'}},left:{style:'thin',color:{rgb:'808080'}},right:{style:'thin',color:{rgb:'808080'}}}:undefined,fill:r===baslikSatiri?{fgColor:{rgb:proforma?'0F172A':'D9E2F3'}}:undefined};
        }
        for(let r=ilkVeriSatiri;r<=sonVeriSatiri;r++){
            const m2Kolonu=proforma?1:1+cekiSutunlar.findIndex(k=>k.alan==='miktar'),fiyatKolonu=proforma?3:-1,tutarKolonu=proforma?4:-1;
            const m2=m2Kolonu>0?ws[XLSX.utils.encode_cell({r,c:m2Kolonu})]:null;if(m2)m2.z='#,##0.00';
            if(proforma){
                const f=ws[XLSX.utils.encode_cell({r,c:fiyatKolonu})],t=ws[XLSX.utils.encode_cell({r,c:tutarKolonu})];if(f)f.z='#,##0.00';if(t)t.z='#,##0.00';
            }
        }
        ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:baslikSatiri,c:0},e:{r:sonVeriSatiri,c:proforma?4:cekiSutunlar.length}})};
        ws['!sheetViews']=[{showGridLines:false}];
        ws['!margins']={left:0.3,right:0.3,top:0.5,bottom:0.5,header:0.2,footer:0.2};
        ws['!pageSetup']={orientation:proforma?'portrait':'landscape',paperSize:9,fitToWidth:1,fitToHeight:0};
        const excelSayfaAdi=(proforma?'Proforma Fatura':(seciliListe?.listeAdi||`Çeki Listesi ${Math.max(0,listeler.indexOf(seciliListe))+1}`)).replace(/[\\\/?*\[\]:]/g,' ').slice(0,31)||'Çeki Listesi';
        XLSX.utils.book_append_sheet(wb,ws,excelSayfaAdi);
        const dosyaNo=ihracatDosyaAnahtari(proforma?(yukleme.proformaNo||'PROFORMA'):(seciliListe?.irsaliyeNo||yukleme.no||'CEKI_LISTESI'));
        try{XLSX.writeFile(wb,`${dosyaNo}_${proforma?'PROFORMA':'CEKI_LISTESI'}.xlsx`);showToast(`${proforma?'Proforma':'Çeki listesi'} Excel önizlemesine hazırlandı.`);}
        catch(error){alert('Excel oluşturulamadı: '+(error?.message||error));}
    }
    function ihracatSayiyiYaziyaCevir(deger){
        const birler=['','B\u0130R','\u0130K\u0130','\u00dc\u00c7','D\u00d6RT','BE\u015e','ALTI','YED\u0130','SEK\u0130Z','DOKUZ'],onlar=['','ON','Y\u0130RM\u0130','OTUZ','KIRK','ELL\u0130','ALTMI\u015e','YETM\u0130\u015e','SEKSEN','DOKSAN'],gruplar=['','B\u0130N','M\u0130LYON','M\u0130LYAR','TR\u0130LYON'];
        const ucHane=n=>{const y=Math.floor(n/100),o=Math.floor((n%100)/10),b=n%10;return (y?(y>1?birler[y]+' ':'')+'Y\u00dcZ ':'')+(o?onlar[o]+' ':'')+(b?birler[b]+' ':'');};
        let n=Math.floor(Math.abs(Number(deger)||0));if(n===0)return 'SIFIR';let sonuc='',grup=0;while(n>0){const parca=n%1000;if(parca){let metin=ucHane(parca);if(grup===1&&parca===1)metin='';sonuc=metin+(gruplar[grup]?gruplar[grup]+' ':'')+sonuc;}n=Math.floor(n/1000);grup++;}return sonuc.trim();
    }
    function ihracatTutariYaziIle(tutar,paraBirimi){
        const kod=String(paraBirimi||'USD').toUpperCase(),birimler={USD:['ABD DOLARI','CENT'],EUR:['EURO','CENT'],GBP:['\u0130NG\u0130L\u0130Z STERL\u0130N\u0130','PEN\u0130'],TRY:['T\u00dcRK L\u0130RASI','KURU\u015e']},secim=birimler[kod]||[kod,'CENT'];let deger=Math.abs(Number(tutar)||0),tam=Math.floor(deger),kusurat=Math.round((deger-tam)*100);if(kusurat===100){tam++;kusurat=0;}return 'YALNIZ / AMOUNT IN WORDS: '+ihracatSayiyiYaziyaCevir(tam)+' '+secim[0]+(kusurat?' '+ihracatSayiyiYaziyaCevir(kusurat)+' '+secim[1]:'');
    }
    async function ihracatTumBelgelerExcelOlustur(id){
        if(typeof ExcelJS==='undefined'){alert('Excel tasar\u0131m k\u00fct\u00fcphanesi y\u00fcklenemedi. Sayfay\u0131 yenileyip tekrar deneyin.');return;}
        const firma=ihracatAktifFirma(),yukleme=(firma?.yuklemeler||[]).find(y=>String(y.id)===String(id));if(!firma||!yukleme)return;
        const listeler=ihracatCekiListeleriniDuzelt(yukleme),sirket=sirketler.find(s=>String(s.id)===String(aktifSirketId()))||{},sayi=ihracatSayiyaCevir,para=yukleme.paraBirimi||'USD';
        if(!listeler.length){showToast('\u00d6nce en az bir \u00c7eki listesi girin.','warning');return;}
        const wb=new ExcelJS.Workbook();wb.creator=sirket.unvan||sirket.kisaAd||sirket.ad||'Firma';wb.created=new Date();wb.modified=new Date();wb.subject='\u0130hracat \u00e7eki listeleri ve proforma';
        const renk={lacivert:'FF17365D',mavi:'FF1F4E78',acik:'FFD9EAF7',cokAcik:'FFF3F7FB',beyaz:'FFFFFFFF',metin:'FF172033',gri:'FF6B7280',yesil:'FF0F766E'};
        const ince={style:'thin',color:{argb:'FF9CA3AF'}},orta={style:'medium',color:{argb:'FF64748B'}};
        const tumKenar={top:ince,left:ince,bottom:ince,right:ince};
        const kolonHarf=n=>{let x='',v=n;while(v>0){v--;x=String.fromCharCode(65+v%26)+x;v=Math.floor(v/26);}return x;};
        const hucreleriGez=(ws,r1,r2,c1,c2,fn)=>{for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)fn(ws.getCell(r,c),r,c);};
        const baslikBandi=(ws,kolonSayisi,belgeBasligi)=>{
            ws.mergeCells(1,1,1,kolonSayisi);ws.mergeCells(2,1,2,kolonSayisi);ws.mergeCells(3,1,3,kolonSayisi);ws.mergeCells(5,1,5,kolonSayisi);
            ws.getCell(1,1).value=sirket.unvan||sirket.kisaAd||sirket.ad||'';ws.getCell(2,1).value=sirket.adres||'';ws.getCell(3,1).value=[sirket.vergiDairesi,sirket.vergiNo,sirket.telefon,sirket.eposta,sirket.web].filter(Boolean).join(' \u00b7 ');ws.getCell(5,1).value=belgeBasligi;
            ws.getRow(1).height=28;ws.getRow(2).height=20;ws.getRow(3).height=20;ws.getRow(4).height=8;ws.getRow(5).height=28;
            ws.getCell(1,1).font={name:'Arial',size:16,bold:true,color:{argb:renk.beyaz}};ws.getCell(1,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.lacivert}};
            ws.getCell(2,1).font={name:'Arial',size:9,color:{argb:renk.metin}};ws.getCell(3,1).font={name:'Arial',size:9,color:{argb:renk.gri}};
            ws.getCell(5,1).font={name:'Arial',size:14,bold:true,color:{argb:renk.beyaz}};ws.getCell(5,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.mavi}};
            [1,2,3,5].forEach(r=>{ws.getCell(r,1).alignment={horizontal:'center',vertical:'middle',wrapText:true};});
        };
        const sayfaAyari=(ws,sonKolon,sonSatir,yon,baslikSatiri)=>{
            ws.views=[{showGridLines:false,state:'frozen',ySplit:baslikSatiri}];ws.pageSetup={paperSize:9,orientation:yon,fitToPage:true,fitToWidth:1,fitToHeight:0,horizontalCentered:true,verticalCentered:false,printArea:'A1:'+kolonHarf(sonKolon)+sonSatir,printTitlesRow:baslikSatiri+':'+baslikSatiri};
            ws.pageMargins={left:.25,right:.25,top:.35,bottom:.35,header:.15,footer:.15};ws.headerFooter={oddFooter:'&L '+(sirket.unvan||sirket.kisaAd||sirket.ad||'')+'&C Sayfa &P / &N&R '+(yukleme.no||'')};
            ws.properties.defaultRowHeight=18;
        };
        const tabloBasligi=(ws,satir,kolonSayisi)=>{hucreleriGez(ws,satir,satir,1,kolonSayisi,h=>{h.font={name:'Arial',size:9,bold:true,color:{argb:renk.beyaz}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.lacivert}};h.alignment={horizontal:'center',vertical:'middle',wrapText:true};h.border={top:orta,left:ince,bottom:orta,right:ince};});ws.getRow(satir).height=30;};
        const veriStili=(ws,ilk,son,kolonSayisi)=>{hucreleriGez(ws,ilk,son,1,kolonSayisi,(h,r,c)=>{h.font={name:'Arial',size:9,color:{argb:renk.metin}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:r%2?renk.beyaz:renk.cokAcik}};h.border=tumKenar;h.alignment={horizontal:c===1?'left':'center',vertical:'middle',wrapText:true};});};
        listeler.forEach((liste,i)=>{
            const sutunlar=ihracatCekiSutunlariniDuzelt(liste.sutunlar),satirlar=(liste.urunler||[]).filter(x=>String(x.aciklama||'').trim()),kolonSayisi=Math.max(6,1+sutunlar.length),ws=wb.addWorksheet((liste.listeAdi||'\u00c7eki Listesi '+(i+1)).replace(/[\\/?*\[\]:]/g,' ').slice(0,31));
            ws.columns=Array.from({length:kolonSayisi},(_,c)=>({width:c===0?7:(sutunlar[c-1]?.alan==='aciklama'?38:14)}));baslikBandi(ws,kolonSayisi,(liste.listeAdi||'\u00c7EK\u0130 L\u0130STES\u0130 '+(i+1))+' / PACKING LIST');
            const bilgi=ws.getRow(6);bilgi.values=['\u0130RSAL\u0130YE NO',liste.irsaliyeNo||'','BOOKING NO',liste.bookingNo||'','REFERANS / TAR\u0130H',[yukleme.no,tarihFormati(yukleme.tarih)].filter(Boolean).join(' · ')];bilgi.height=22;hucreleriGez(ws,6,6,1,kolonSayisi,(h,r,c)=>{h.font={name:'Arial',size:9,bold:c%2===1,color:{argb:renk.metin}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.acik}};h.border=tumKenar;h.alignment={horizontal:c%2===1?'left':'center',vertical:'middle',wrapText:true};});
            const baslikSatiri=7,basliklar=['NO',...sutunlar.map(x=>x.baslik)];while(basliklar.length<kolonSayisi)basliklar.push('');ws.getRow(baslikSatiri).values=basliklar;tabloBasligi(ws,baslikSatiri,kolonSayisi);
            satirlar.forEach((x,n)=>{const degerler=[x.siraNo||n+1,...sutunlar.map(k=>{const v=k.alan.startsWith('ozel_')?x.ozel?.[k.alan]:x[k.alan];return k.tip==='number'?(String(v??'').trim()===''?null:sayi(v)):(v||'');})];while(degerler.length<kolonSayisi)degerler.push('');ws.addRow(degerler);});
            const ilkVeri=8,sonVeri=Math.max(ilkVeri-1,ilkVeri+satirlar.length-1);if(satirlar.length)veriStili(ws,ilkVeri,sonVeri,kolonSayisi);
            sutunlar.forEach((k,idx)=>{if(k.tip!=='number')return;const c=idx+2;for(let r=ilkVeri;r<=sonVeri;r++)ws.getCell(r,c).numFmt='#,##0.00';});
            const toplamSatiri=ilkVeri+satirlar.length,toplam=ws.getRow(toplamSatiri);toplam.getCell(1).value=satirlar.length;const toplanabilir=new Set(['adet','miktar','net','brut']);sutunlar.forEach((k,idx)=>{const c=idx+2;if(k.alan==='aciklama')toplam.getCell(c).value='TOPLAM / TOTAL';else if(toplanabilir.has(k.alan)&&satirlar.length)toplam.getCell(c).value={formula:'SUM('+kolonHarf(c)+ilkVeri+':'+kolonHarf(c)+sonVeri+')'};});
            hucreleriGez(ws,toplamSatiri,toplamSatiri,1,kolonSayisi,h=>{h.font={name:'Arial',size:9,bold:true,color:{argb:renk.metin}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.acik}};h.border={top:orta,left:ince,bottom:orta,right:ince};h.alignment={horizontal:'center',vertical:'middle',wrapText:true};if(typeof h.value==='number'||h.value?.formula)h.numFmt='#,##0.00';});
            const nakBas=toplamSatiri+2;ws.mergeCells(nakBas,1,nakBas,kolonSayisi);ws.getCell(nakBas,1).value='NAKL\u0130YEC\u0130 B\u0130LG\u0130LER\u0130 / DRIVER INFORMATION';ws.getCell(nakBas,1).font={name:'Arial',size:10,bold:true,color:{argb:renk.beyaz}};ws.getCell(nakBas,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.yesil}};ws.getCell(nakBas,1).alignment={horizontal:'left',vertical:'middle'};
            ws.getRow(nakBas+1).values=['\u015eOF\u00d6R / DRIVER',liste.nakliyeci?.sofor||'-','T.C.',liste.nakliyeci?.tcNo||'-','TELEFON',liste.nakliyeci?.telefon||'-'];ws.getRow(nakBas+2).values=['\u00c7EK\u0130C\u0130 / TRUCK',liste.nakliyeci?.cekiciPlaka||'-','DORSE / TRAILER',liste.nakliyeci?.dorsePlaka||'-'];ws.getRow(nakBas+3).values=['ARA\u00c7 SAH\u0130B\u0130 / VEHICLE OWNER',liste.nakliyeci?.aracSahibi||'-','T.C. / V.N.',liste.nakliyeci?.aracSahibiTcVn||'-'];
            hucreleriGez(ws,nakBas+1,nakBas+3,1,kolonSayisi,(h,r,c)=>{h.font={name:'Arial',size:9,bold:c%2===1};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.cokAcik}};h.border=tumKenar;h.alignment={vertical:'middle',wrapText:true};});
            const notSatir=nakBas+4;ws.mergeCells(notSatir,1,notSatir,kolonSayisi);ws.getCell(notSatir,1).value='NOT / NOTE: '+(yukleme.not||'-');ws.getCell(notSatir,1).alignment={wrapText:true,vertical:'top'};ws.getCell(notSatir,1).font={name:'Arial',size:9};ws.getCell(notSatir,1).border=tumKenar;ws.getRow(notSatir).height=35;
            sayfaAyari(ws,kolonSayisi,notSatir,'portrait',baslikSatiri);
        });
        const urunler=ihracatProformaUrunleriniBirlestir(yukleme),ws=wb.addWorksheet('Proforma'),kolonSayisi=5;ws.columns=[{width:48},{width:15},{width:13},{width:18},{width:20}];baslikBandi(ws,kolonSayisi,'PROFORMA FATURA / PROFORMA INVOICE');
        const bilgiSatirlari=[['PROFORMA NO',yukleme.proformaNo||'-','','TAR\u0130H / DATE',tarihFormati(yukleme.tarih)],['REFERANS / REFERENCE',yukleme.no||'-','','PARA B\u0130R\u0130M\u0130 / CURRENCY',para],['BOOKING NO',yukleme.bookingNo||'-','','VARI\u015e YER\u0130 / DESTINATION',yukleme.varisYeri||'-']];bilgiSatirlari.forEach((v,n)=>{const r=6+n;ws.getRow(r).values=v;ws.mergeCells(r,2,r,3);hucreleriGez(ws,r,r,1,kolonSayisi,(h,rr,c)=>{h.font={name:'Arial',size:9,bold:c===1||c===4};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.acik}};h.border=tumKenar;h.alignment={vertical:'middle',wrapText:true};});});
        ws.mergeCells('A10:C10');ws.mergeCells('D10:E10');ws.getCell('A10').value='SATICI / SELLER';ws.getCell('D10').value='ALICI / BUYER';['A10','D10'].forEach(a=>{ws.getCell(a).font={name:'Arial',size:10,bold:true,color:{argb:renk.beyaz}};ws.getCell(a).fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.yesil}};ws.getCell(a).alignment={horizontal:'center'};});
        ws.mergeCells('A11:C11');ws.mergeCells('D11:E11');ws.getCell('A11').value=[sirket.unvan||sirket.ad,sirket.adres,[sirket.vergiDairesi,sirket.vergiNo].filter(Boolean).join(' / '),sirket.telefon,sirket.eposta].filter(Boolean).join('\n');ws.getCell('D11').value=[firma.ad,firma.adres,[firma.postaKodu,firma.sehir,firma.ulke].filter(Boolean).join(' '),[firma.vergiDairesi,firma.vergiNo].filter(Boolean).join(' / '),firma.telefon,firma.eposta,firma.teslimatAdres?'SHIP TO: '+firma.teslimatAdres:''].filter(Boolean).join('\n');['A11','D11'].forEach(a=>{ws.getCell(a).font={name:'Arial',size:9};ws.getCell(a).alignment={vertical:'top',wrapText:true};ws.getCell(a).border=tumKenar;});ws.getRow(11).height=78;
        const proBaslik=13;ws.getRow(proBaslik).values=['\u00dcR\u00dcN / DESCRIPTION','M\u0130KTAR / QTY','B\u0130R\u0130M / UNIT','B\u0130R\u0130M F\u0130YAT / UNIT PRICE ('+para+')','TUTAR / AMOUNT ('+para+')'];tabloBasligi(ws,proBaslik,kolonSayisi);
        urunler.forEach(x=>ws.addRow([x.aciklama,sayi(x.miktar),x.birim||'M2',sayi(x.birimFiyat),sayi(x.miktar)*sayi(x.birimFiyat)]));const ilk=14,sonVeri=Math.max(13,13+urunler.length);if(urunler.length)veriStili(ws,ilk,sonVeri,kolonSayisi);for(let r=ilk;r<=sonVeri;r++){ws.getCell(r,2).numFmt='#,##0.00';ws.getCell(r,4).numFmt='#,##0.00 \"'+para+'\"';ws.getCell(r,5).numFmt='#,##0.00 \"'+para+'\"';ws.getCell(r,2).alignment={horizontal:'right'};ws.getCell(r,4).alignment={horizontal:'right'};ws.getCell(r,5).alignment={horizontal:'right'};}
        const ara=14+urunler.length,genel=ara+1;ws.getCell(ara,4).value='ARA TOPLAM / SUBTOTAL';ws.getCell(ara,5).value=urunler.length?{formula:'SUM(E14:E'+sonVeri+')'}:0;ws.getCell(genel,4).value='GENEL TOPLAM / TOTAL';ws.getCell(genel,5).value=sayi(yukleme.tutar)||{formula:'E'+ara};hucreleriGez(ws,ara,genel,4,5,(h,r)=>{h.font={name:'Arial',size:r===genel?11:9,bold:true,color:{argb:r===genel?renk.beyaz:renk.metin}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:r===genel?renk.lacivert:renk.acik}};h.border=tumKenar;h.alignment={horizontal:'right',vertical:'middle'};if(h.col===5)h.numFmt='#,##0.00 \"'+para+'\"';});
        const yaziSatiri=genel+2,genelToplam=sayi(yukleme.tutar)||urunler.reduce((t,x)=>t+sayi(x.miktar)*sayi(x.birimFiyat),0);ws.mergeCells(yaziSatiri,1,yaziSatiri,5);ws.getCell(yaziSatiri,1).value=ihracatTutariYaziIle(genelToplam,para);ws.getCell(yaziSatiri,1).font={name:'Arial',size:10,bold:true,color:{argb:renk.lacivert}};ws.getCell(yaziSatiri,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:renk.acik}};ws.getCell(yaziSatiri,1).alignment={vertical:'middle',wrapText:true};ws.getCell(yaziSatiri,1).border=tumKenar;ws.getRow(yaziSatiri).height=30;const alt=genel+4;ws.mergeCells(alt,1,alt,5);ws.getCell(alt,1).value='BANKA VE D\u0130\u011eER B\u0130LG\u0130LER / BANK DETAILS\n'+(sirket.digerBilgiler||sirket.notlar||'-');ws.getCell(alt,1).alignment={vertical:'top',wrapText:true};ws.getCell(alt,1).font={name:'Arial',size:9};ws.getCell(alt,1).border=tumKenar;ws.getRow(alt).height=48;ws.mergeCells(alt+1,1,alt+1,5);ws.getCell(alt+1,1).value='NOT / NOTE: '+(yukleme.not||'-');ws.getCell(alt+1,1).alignment={vertical:'top',wrapText:true};ws.getCell(alt+1,1).font={name:'Arial',size:9};ws.getCell(alt+1,1).border=tumKenar;ws.getRow(alt+1).height=36;sayfaAyari(ws,5,alt+1,'portrait',proBaslik);
        try{const buffer=await wb.xlsx.writeBuffer(),blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),ad=ihracatDosyaAnahtari(yukleme.proformaNo||yukleme.no||'IHRACAT')+'_TUM_BELGELER.xlsx';fdCiktiExcelJsOnizle(wb,blob,ad);showToast('T\u00fcm belgeler Excel \u00f6nizlemesine haz\u0131rland\u0131.');}catch(error){alert('Excel olu\u015fturulamad\u0131: '+(error?.message||error));}
    }
    function ihracatFormTumBelgelerExcelOlustur(){const firma=ihracatAktifFirma(),yukleme=ihracatFormProformaVerisi();if(!firma)return;if(!Array.isArray(firma.yuklemeler))firma.yuklemeler=[];firma.yuklemeler.push(yukleme);try{ihracatTumBelgelerExcelOlustur(yukleme.id);}finally{firma.yuklemeler=firma.yuklemeler.filter(y=>String(y.id)!==String(yukleme.id));}}
    function ihracatDosyaAnahtari(deger){return String(deger||'BELGE').trim().toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g,'_').replace(/^_+|_+$/g,'');}
    async function ihracatDosyalariYukle(dosyalar,firma,yukleme,tur,eski=null,coklu=false) {
        if(!dosyalar.length)return coklu?[]:eski;
        const sonuclar=[];
        for(const dosya of dosyalar){
            const pdfMi=dosya.type==='application/pdf',gorselMi=['image/jpeg','image/png','image/webp'].includes(dosya.type);if(!pdfMi&&!gorselMi)throw new Error('Yaln\u0131zca PDF, JPG, PNG veya WEBP dosyas\u0131 y\u00fcklenebilir.');const azamiMb=pdfMi?ayarSayisi('pdfAzamiMb',10):ayarSayisi('ihracatGorselAzamiMb',10);if(dosya.size>azamiMb*1024*1024)throw new Error(tur+' dosyas\u0131 en fazla '+azamiMb+' MB olabilir.');
            const base64=await dosyayiBase64Oku(dosya),uzanti=(dosya.name.split('.').pop()||(pdfMi?'pdf':'jpg')).toLocaleLowerCase('tr-TR');
            const ad=`${ihracatDosyaAnahtari(firma.ad)}_IHRACAT_${ihracatDosyaAnahtari(yukleme.no)}_${ihracatDosyaAnahtari(tur)}_${coklu?sonuclar.length+1:''}.${uzanti}`;
            const sonuc=dosya.type==='application/pdf'?await fdYazilimDrivePdfYukle(base64,ad,coklu?'':(eski?.id||''),'IHRACAT VE YUKLEMELER'):await fdYazilimDriveDosyaYukle(base64,ad,dosya.type,'','IHRACAT VE YUKLEMELER');
            sonuclar.push({id:sonuc.id,url:sonuc.url,ad:sonuc.ad});
        }
        return coklu?sonuclar:sonuclar[0];
    }
    async function ihracatDosyaYukle(inputId,firma,yukleme,tur,eski=null,coklu=false) {return ihracatDosyalariYukle([...(document.getElementById(inputId)?.files||[])],firma,yukleme,tur,eski,coklu);}
    async function ihracatYuklemeKaydet(event) {
        event.preventDefault();ihracatFirmaKimlikleriniTamamla();const form=document.getElementById('ihracatYuklemeForm'),firmaId=String(form.dataset.editFirmaId||ihracatAktifFirmaId||''),editIndex=form.dataset.editIndex===''?-1:Number(form.dataset.editIndex);let f=ihracatFirmalari.find(k=>String(k.id)===firmaId)||ihracatAktifFirma();if(!f)return;
        const id=String(document.getElementById('ihracatYuklemeEditId').value||form.dataset.editId||window.ihracatDuzenlenenYuklemeId||'').trim(),duzenlemeModu=Boolean(id)||editIndex>=0,imza=String(form.dataset.editTarih||'')+'|'+String(form.dataset.editNo||'')+'|'+String(form.dataset.editProformaNo||'');let mevcut=(f.yuklemeler||[]).find(y=>id&&String(y.id)===id);
        if(!mevcut&&editIndex>=0)mevcut=(f.yuklemeler||[])[editIndex];if(!mevcut&&duzenlemeModu)mevcut=(f.yuklemeler||[]).find(y=>String(y.tarih||'')+'|'+String(y.no||'')+'|'+String(y.proformaNo||'')===imza);if(duzenlemeModu&&!mevcut){alert('D\u00fczenlenen y\u00fckleme kayd\u0131 bulunamad\u0131. Yeni kay\u0131t olu\u015fturulmad\u0131.');return;}
        const tutar=paraMetniniSayiyaCevir(document.getElementById('ihracatFaturaTutar').value),kur=ihracatSeciliTcmbKuru(),dovizToplami=ihracatFormDovizToplami();
        const y={...(mevcut||{}),id:mevcut?.id||id||`ihr_yuk_${Date.now()}`,tarih:document.getElementById('ihracatYuklemeTarih').value,no:document.getElementById('ihracatYuklemeNo').value,bookingNo:document.getElementById('ihracatBookingNo').value,varisYeri:document.getElementById('ihracatVarisYeri').value,satisTuru:document.getElementById('ihracatSatisTuru').value,proformaNo:document.getElementById('ihracatProformaNo').value,faturaNo:document.getElementById('ihracatFaturaNo').value,tutar,paraBirimi:document.getElementById('ihracatParaBirimi').value,tcmbKurlari:ihracatFormTcmbKurlari,tcmbKur:kur,tcmbKurTarihi:ihracatFormTcmbKurlari?.tarih||'',tcmbKurManuel:ihracatFormKurManuel,tlToplam:dovizToplami*kur,not:document.getElementById('ihracatYuklemeNot').value,proformaToplamaModu:ihracatFormProformaToplamaModu,proformaHaricAnahtarlar:[...ihracatFormProformaHaricAnahtarlar],cekiListeleri:ihracatCekiListeleriniOku(),belgeler:{...(mevcut?.belgeler||{})},gorseller:[...(mevcut?.gorseller||[])]};
        delete y.cekiSatirlari;
        delete y.varis;
        showGlobalOverlay('Yükleme kaydediliyor','Belgeler Drive’a, kayıt bilgileri veritabanına aktarılıyor...');
        try{
            const kartlar=[...document.querySelectorAll('.ihracat-ceki-karti')];
            for(let i=0;i<kartlar.length;i++){
                const dosya=kartlar[i].querySelector('.ceki-irsaliye-pdf')?.files?.[0];
                if(dosya){
                    if(dosya.size>ayarSayisi('pdfAzamiMb',10)*1024*1024)throw new Error('Ceki Listesi '+(i+1)+' irsaliye PDF dosyasi azami boyutu asiyor.');
                    const base64=await dosyayiBase64Oku(dosya),ad=`${ihracatDosyaAnahtari(f.ad)}_IHRACAT_${ihracatDosyaAnahtari(y.no)}_IRSALIYE_${i+1}.pdf`,sonuc=await fdYazilimDrivePdfYukle(base64,ad,y.cekiListeleri[i].irsaliyePdf?.id||'','IHRACAT VE YUKLEMELER');
                    y.cekiListeleri[i].irsaliyePdf={id:sonuc.id,url:sonuc.url,ad:sonuc.ad};
                }
                const kantarDosya=kartlar[i].querySelector('.ceki-kantar-fisi')?.files?.[0];
                if(kantarDosya){
                    const eskiKantar=y.cekiListeleri[i].kantarFisi||null;
                    const yeniKantar=await ihracatDosyalariYukle([kantarDosya],f,y,'KANTAR_FISI_'+(i+1),eskiKantar,false);
                    y.cekiListeleri[i].kantarFisi=yeniKantar;
                    if(eskiKantar?.id&&eskiKantar.id!==yeniKantar?.id){try{await fdYazilimDrivePdfSil(eskiKantar.id);}catch(_){}}
                }
                const gorselDosyalari=[...(kartlar[i].querySelector('.ceki-yukleme-gorselleri')?.files||[])],azamiGorsel=Math.round(ayarSayisi('ihracatCekiBasinaAzamiGorsel',20));if((y.cekiListeleri[i].gorseller||[]).length+gorselDosyalari.length>azamiGorsel)throw new Error('\u00c7eki Listesi '+(i+1)+' i\u00e7in en fazla '+azamiGorsel+' g\u00f6rsel y\u00fcklenebilir.');if(gorselDosyalari.length)y.cekiListeleri[i].gorseller.push(...await ihracatDosyalariYukle(gorselDosyalari,f,y,'CEKI_LISTESI_GORSEL_'+(i+1),null,true));
            }
            y.belgeler.fatura=await ihracatDosyaYukle('ihracatFaturaPdf',f,y,'FATURA',y.belgeler.fatura);
            if((y.gorseller||[]).length&&y.cekiListeleri.length)y.cekiListeleri[0].gorseller.push(...y.gorseller);y.gorseller=[];
            const yeniListeIdleri=new Set(y.cekiListeleri.map(l=>String(l.id))),silinecekPdfs=ihracatCekiListeleriniDuzelt(mevcut).filter(l=>!yeniListeIdleri.has(String(l.id))).flatMap(l=>[l.irsaliyePdf,l.kantarFisi]).filter(p=>p?.id);
            f.yuklemeler=f.yuklemeler||[];if(duzenlemeModu){const kayitIndex=f.yuklemeler.indexOf(mevcut);if(kayitIndex<0)throw new Error('D\u00fczenlenen y\u00fckleme kayd\u0131 bulunamad\u0131. Yeni kay\u0131t olu\u015fturulmad\u0131.');f.yuklemeler[kayitIndex]=y;}else f.yuklemeler.push(y);
            await supabaseVerileriKaydet();window.ihracatDuzenlenenYuklemeId='';form.dataset.editId='';form.dataset.editIndex='';form.dataset.editFirmaId='';form.dataset.editTarih='';form.dataset.editNo='';form.dataset.editProformaNo='';await Promise.allSettled(silinecekPdfs.map(p=>fdYazilimDrivePdfSil(p.id)));ihracatYuklemeFormuKapat();if(document.getElementById('ihracatYuklemeDetayEkrani').style.display!=='none')ihracatYuklemeDetayAc(y.id);else ihracatYuklemeleriniCiz();showToast(mevcut?'Yükleme güncellendi.':'Yükleme kaydedildi.');
        }catch(error){alert('Yükleme kaydedilemedi: '+(error.message||error));}finally{hideGlobalOverlay();}
    }
    async function ihracatYuklemeSil(id) {
        const f=ihracatAktifFirma(),y=(f?.yuklemeler||[]).find(x=>String(x.id)===String(id));if(!f||!y||!await fdYuzerOnaySor('Yükleme kaydı ve bağlı dosyalar silinsin mi?'))return;
        const dosyalar=[...Object.values(y.belgeler||{}),...(y.gorseller||[]),...ihracatCekiListeleriniDuzelt(y).flatMap(l=>[l.irsaliyePdf,l.kantarFisi,...(l.gorseller||[])])].filter(x=>x?.id);await Promise.allSettled(dosyalar.map(d=>fdYazilimDrivePdfSil(d.id)));f.yuklemeler=f.yuklemeler.filter(x=>String(x.id)!==String(id));await supabaseVerileriKaydet();ihracatYuklemeleriniCiz();showToast('Yükleme silindi.');
    }


return {
 open:openIhracatApp,
 api:{ihracatFormDovizToplami,ihracatSeciliTcmbKuru,ihracatManuelKurDegisti,ihracatKurTlKarsiliginiGuncelle,ihracatOncekiGunKurunuYukle,ihracatFirmaListesineDon,ihracatFirmaKimlikleriniTamamla,ihracatFirmalariniCiz,ihracatFirmaFormuAc,ihracatFirmaFormuKapat,ihracatFirmaKaydet,ihracatFirmaSil,ihracatFirmaDetayAc,ihracatSekmeDegistir,ihracatAktifFirma,ihracatBelgeButonu,ihracatYuklemeDurumu,ihracatYuklemeleriniCiz,ihracatYuklemeListesineDon,ihracatYuklemeDetayAc,ihracatYuklemeDetaySekmeAc,ihracatYuklemeFormuAc,ihracatYuklemeFormuKapat,ihracatKayitliCekiListesiDuzenle,ihracatKayitliCekiListesiSil,ihracatOncekiYuklemedenCekiKopyala,ihracatCekiKopyalamaKapat,ihracatCekiKopyaKaynaklariniCiz,ihracatCekiKopyaSec,ihracatSeciliCekiListesiniKopyala,ihracatYeniProformaNo,ihracatProformaTariheGoreGuncelle,ihracatCekiListeleriniDuzelt,ihracatCekiVarsayilanSutunlari,ihracatCekiSutunlariniDuzelt,ihracatCekiFormulAlanMetni,ihracatCekiBasliklariCiz,ihracatCekiSutunMenuAc,ihracatCekiOzelHucreEkle,ihracatCekiHucreInputu,ihracatCekiFormulHesapla,ihracatCekiSatirFormulleriniHesapla,ihracatFirmaSonUrunFiyatiniBul,ihracatCekiToplamlariniGuncelle,ihracatCekiListesiEkle,ihracatCekiUrunSatiriEkle,ihracatCekiHucreTabIlerle,ihracatCekiSatirNumaralariniYenile,ihracatCekiSatirNoDuzenle,ihracatCekiUrunSatiriSil,ihracatCekiCokluSatirPlanla,ihracatCekiCokluSatirEkle,ihracatCekiListesiSil,ihracatCekiListeBasliklariniYenile,ihracatCekiSekmeleriniYenile,ihracatCekiSekmesiAc,ihracatCekiProformaSekmesiAc,ihracatFormFaturaGuncelle,ihracatCekiFaturaSekmesiAc,ihracatCekiSatiriniOku,ihracatCekiListeleriniOku,ihracatNakliyeciKayitlari,ihracatNakliyeciOner,ihracatOlcuSayisi,ihracatOlculuUrunAdi,ihracatProformaToplamaModu,ihracatProformaKaynakAnahtari,ihracatProformaGrupAnahtari,ihracatProformaKaynakSatirlariniGez,ihracatProformaUrunleriniBirlestir,ihracatFormProformaUrunAdiDuzenle,ihracatFormProformaFiyatGuncelle,ihracatFormProformaToplamaDegistir,ihracatFormProformaSatirSil,ihracatKayitliProformaUrunAdiDuzenle,ihracatKayitliProformaFiyatDuzenle,ihracatKayitliProformaToplamaDegistir,ihracatKayitliProformaSatirSil,ihracatFormProformaVerisi,ihracatCekiFormProformaGuncelle,ihracatFormCekiBelgeOlustur,ihracatFormProformaPdfOlustur,ihracatFormProformaExcelOlustur,ihracatPdfOnizlemeHazirla,ihracatPdfOnizlemeDoldur,ihracatPdfKanvasIndir,ihracatTumBelgelerPdfOlustur,ihracatBelgeOlustur,ihracatBelgeExcelOlustur,ihracatSayiyiYaziyaCevir,ihracatTutariYaziIle,ihracatTumBelgelerExcelOlustur,ihracatFormTumBelgelerExcelOlustur,ihracatDosyaAnahtari,ihracatDosyalariYukle,ihracatDosyaYukle,ihracatYuklemeKaydet,ihracatYuklemeSil},
 state:{"ihracatAktifFirmaId":{get:()=>ihracatAktifFirmaId,set:value=>{ihracatAktifFirmaId=value}},"ihracatAktifSekme":{get:()=>ihracatAktifSekme,set:value=>{ihracatAktifSekme=value}},"ihracatAktifYuklemeId":{get:()=>ihracatAktifYuklemeId,set:value=>{ihracatAktifYuklemeId=value}},"ihracatFormTcmbKurlari":{get:()=>ihracatFormTcmbKurlari,set:value=>{ihracatFormTcmbKurlari=value}},"ihracatFormProformaToplamaModu":{get:()=>ihracatFormProformaToplamaModu,set:value=>{ihracatFormProformaToplamaModu=value}},"ihracatFormProformaHaricAnahtarlar":{get:()=>ihracatFormProformaHaricAnahtarlar,set:value=>{ihracatFormProformaHaricAnahtarlar=value}},"ihracatFormKurManuel":{get:()=>ihracatFormKurManuel,set:value=>{ihracatFormKurManuel=value}},"ihracatCekiKopyaKaynaklari":{get:()=>ihracatCekiKopyaKaynaklari,set:value=>{ihracatCekiKopyaKaynaklari=value}},"ihracatSeciliCekiKopyaIndex":{get:()=>ihracatSeciliCekiKopyaIndex,set:value=>{ihracatSeciliCekiKopyaIndex=value}}},
 dispose(){ ihracatAktifFirmaId="";ihracatAktifYuklemeId="";ihracatFormTcmbKurlari=null;ihracatCekiKopyaKaynaklari=[];window.ihracatDuzenlenenYuklemeId=""; }
};
});

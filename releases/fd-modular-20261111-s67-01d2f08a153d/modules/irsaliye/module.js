window.FDModules.define('irsaliye',function(){

let fdWayDisposed=false;const fdWayInitial=fdWayContext(),fdWayNodes=new Set();
function fdWayContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('irsaliye')])}
function fdWayValid(){return !fdWayDisposed&&fdWayInitial===fdWayContext()&&anaMenuModulErisimiVar('irsaliye')}
function fdWayAssert(write=false){if(!fdWayValid())throw Error('Oturum değişti; İrsaliye Takip ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('irsaliye'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdWayAwait(promise){fdWayAssert();const r=await promise;fdWayAssert();return r}
// Own only this operation's overlay; never hide a later module's differently titled work.
function showGlobalOverlay(...args){window.showGlobalOverlay(...args);const title=document.getElementById('overlayTitle').textContent,sub=document.getElementById('overlaySub').textContent;fdWayNodes.add({remove(){if(document.getElementById('overlayTitle')?.textContent===title&&document.getElementById('overlaySub')?.textContent===sub)window.hideGlobalOverlay()}})}
function fdWayClean(node){if(!node)return;if(node._url){window.URL.revokeObjectURL(node._url);node._url=null}node.querySelectorAll?.('iframe').forEach(f=>f.src='about:blank');node._blob=null;node.remove()}
function fdWayPdf(...args){fdWayAssert();args[3]={...args[3],fdIsCurrent:fdWayValid};const prev=document.getElementById('fdOrtakCiktiOnizleme'),p=window.fdTabloPdfOnizle(...args),current=document.getElementById('fdOrtakCiktiOnizleme'),owned=current!==prev?current:null;if(owned)fdWayNodes.add(owned);return Promise.resolve(p).then(v=>{if(fdWayValid())return v},e=>{if(fdWayValid())throw e}).finally(()=>{if(!fdWayValid())fdWayClean(owned)})}

let irsaliyeFaturaSecimleri=[];
let irsaliyeDuzenlenenId='';
let irsaliyeGecmisPlaka='';
function irsaliyeBirimSecenekleriniYenile(ekBirim = '') {
fdWayAssert(false);

        const select = document.getElementById('irsBirim');
        if (!select) return;
        const onceki = String(select.value || ekBirim || uygulamaAyarlari.irsaliyeVarsayilanBirim || 'TON').trim().toLocaleUpperCase('tr-TR');
        const birimler = irsaliyeBirimleriniDuzelt();
        if (ekBirim && !birimler.includes(String(ekBirim).trim().toLocaleUpperCase('tr-TR'))) birimler.push(String(ekBirim).trim().toLocaleUpperCase('tr-TR'));
        select.innerHTML = birimler.map(birim => `<option value="${escapeDashboardText(birim)}">${escapeDashboardText(birim)}</option>`).join('');
        const varsayilan = String(uygulamaAyarlari.irsaliyeVarsayilanBirim || '').toLocaleUpperCase('tr-TR');
        select.value = birimler.includes(onceki) ? onceki : (birimler.includes(varsayilan) ? varsayilan : birimler[0]);
    }
async function openIrsaliyeTakipApp(){
try{
fdWayAssert(false);

        if(!anaMenuModulErisimiVar('irsaliye'))return;
        anaMenuDonusButonunuGoster();
        ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','vardiyaApp','aracTakipApp','ayarlarApp'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
        document.getElementById('irsaliyeTakipApp').style.display='block';
        await fdWayAwait(driveVerileriniYukleBaslangicta('irsaliye'));
        irsaliyeBirimSecenekleriniYenile();
        if(!document.getElementById('irsHafta').value)document.getElementById('irsHafta').value=new Date().toISOString().slice(0,10);
        document.getElementById('irsFirmaListesi').innerHTML=[...new Set(tasimaIrsaliyeleri.map(k=>k.firma).filter(Boolean))].map(x=>`<option value="${escapeDashboardText(x)}">`).join('');
        document.getElementById('irsPlakaListesi').innerHTML=araclar.map(a=>`<option value="${escapeDashboardText(a.plaka||'')}">`).join('');
        irsaliyeFormTemizle();irsaliyeListele();
    
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
}
function irsaliyeFormTemizle(){
fdWayAssert(false);
const f=document.getElementById('irsaliyeForm');if(!f)return;irsaliyeDuzenlenenId='';f.reset();irsaliyeBirimSecenekleriniYenile();document.getElementById('irsTarih').value=new Date().toISOString().slice(0,10);document.getElementById('irsBirim').value=uygulamaAyarlari.irsaliyeVarsayilanBirim||irsaliyeBirimleriniDuzelt()[0];document.getElementById('irsKaydetBtn').textContent='💾 İrsaliyeyi Kaydet';document.getElementById('irsDuzenlemeIptalBtn').style.display='none';}
function irsaliyeDuzenle(id){
fdWayAssert(true);

        const k=tasimaIrsaliyeleri.find(x=>String(x.id)===String(id));if(!k)return;
        irsaliyeDuzenlenenId=String(k.id);
        irsaliyeBirimSecenekleriniYenile(k.birim||'TON');document.getElementById('irsFirma').value=k.firma||'';document.getElementById('irsTarih').value=String(k.tarih||'').slice(0,10);document.getElementById('irsNo').value=k.irsaliyeNo||'';document.getElementById('irsPlaka').value=k.plaka||'';document.getElementById('irsAciklama').value=k.aciklama||'';document.getElementById('irsMiktar').value=k.miktar||'';document.getElementById('irsBirim').value=k.birim||'TON';document.getElementById('irsFiyat').value=Number(k.fiyat||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
        document.getElementById('irsKaydetBtn').textContent='💾 Değişiklikleri Kaydet';document.getElementById('irsDuzenlemeIptalBtn').style.display='block';document.getElementById('irsFirma').scrollIntoView({behavior:'smooth',block:'center'});
    }
async function irsaliyeKaydet(event){
try{
fdWayAssert(true);

        event.preventDefault();
        const mevcut=tasimaIrsaliyeleri.find(k=>String(k.id)===irsaliyeDuzenlenenId);
        const kayit={...(mevcut||{}),id:mevcut?.id||`irs_${Date.now()}`,sirketId:aktifSirketId(),firma:document.getElementById('irsFirma').value.trim().toLocaleUpperCase('tr-TR'),tarih:document.getElementById('irsTarih').value,irsaliyeNo:document.getElementById('irsNo').value.trim(),plaka:document.getElementById('irsPlaka').value.trim().toLocaleUpperCase('tr-TR'),aciklama:document.getElementById('irsAciklama').value.trim().toLocaleUpperCase('tr-TR'),miktar:document.getElementById('irsMiktar').value.trim(),birim:document.getElementById('irsBirim').value.trim().toLocaleUpperCase('tr-TR'),fiyat:paraMetniniSayiyaCevir(document.getElementById('irsFiyat').value)||0,faturaNo:mevcut?.faturaNo||'',faturaTarih:mevcut?.faturaTarih||''};
        const tekrar=tasimaIrsaliyeleri.some(k=>String(k.id)!==String(kayit.id)&&aktifSirketeAit(k)&&String(k.firma)===kayit.firma&&String(k.irsaliyeNo)===kayit.irsaliyeNo&&String(k.tarih)===kayit.tarih);
        if(tekrar&&!await fdWayAwait(fdYuzerOnaySor('Aynı firma, tarih ve irsaliye numarasıyla kayıt var. Yine de kaydedilsin mi?')))return;
        if(mevcut)tasimaIrsaliyeleri[tasimaIrsaliyeleri.indexOf(mevcut)]=kayit;else tasimaIrsaliyeleri.push(kayit);yuklenenVeriler.add('irsaliyeler');await fdWayAwait(supabaseVerileriKaydet());irsaliyeFormTemizle();irsaliyeListele();showToast(mevcut?'İrsaliye güncellendi.':'Taşıma irsaliyesi kaydedildi.');
    
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
}
function irsaliyeFiltreliListe(){
fdWayAssert(false);

        const tarihAlani=document.getElementById('irsHafta'),bas=tarihAlani.value||new Date().toISOString().slice(0,10),durum=document.getElementById('irsDurumFiltre').value,arama=document.getElementById('irsArama').value.toLocaleLowerCase('tr-TR');
        if(!tarihAlani.value)tarihAlani.value=bas;
        return tasimaIrsaliyeleri.filter(k=>aktifSirketeAit(k)&&String(k.tarih)>=bas&&(!arama||`${k.firma} ${k.plaka} ${k.irsaliyeNo}`.toLocaleLowerCase('tr-TR').includes(arama))&&(!durum||(durum==='kesildi'?k.faturaNo:(durum==='bekliyor'?!k.faturaNo:(durum==='gecikti'&&irsaliyeGeciktiMi(k)))))).sort((a,b)=>String(a.tarih).localeCompare(String(b.tarih))||String(a.firma).localeCompare(String(b.firma),'tr'));
    }
function irsaliyeListele(){
fdWayAssert(false);

        const liste=irsaliyeFiltreliListe(),bas=document.getElementById('irsHafta').value;
        document.getElementById('irsListeBaslik').textContent=`Taşıma İrsaliyeleri — ${tarihFormati(bas)} ve sonrası`;
        document.getElementById('irsOzetToplam').textContent=liste.length;document.getElementById('irsOzetBekleyen').textContent=liste.filter(k=>!k.faturaNo).length;document.getElementById('irsOzetGeciken').textContent=liste.filter(irsaliyeGeciktiMi).length;document.getElementById('irsOzetKesilen').textContent=liste.filter(k=>k.faturaNo).length;
        document.querySelector('#irsaliyeTablosu tbody').innerHTML=liste.map(k=>`<tr class="${k.faturaNo?'irsaliye-faturali':(irsaliyeGeciktiMi(k)?'irsaliye-gecikmis':'')}"><td><input class="irs-sec" type="checkbox" data-id="${escapeDashboardText(String(k.id))}" ${k.faturaNo?'disabled':''}></td><td>${escapeDashboardText(k.firma)}</td><td>${tarihFormati(k.tarih)}</td><td>${escapeDashboardText(k.irsaliyeNo)}</td><td><button type="button" class="fd-table-cell-link" onclick="irsaliyePlakaGecmisiAc('${escapeDashboardText(String(k.plaka))}')">${escapeDashboardText(k.plaka)}</button></td><td>${escapeDashboardText(k.aciklama)}</td><td>${escapeDashboardText(k.miktar)}</td><td>${escapeDashboardText(k.birim)}</td><td>${paraFormatla(k.fiyat)}</td><td>${k.faturaNo?`<span class="badge" style="background:#dcfce7;color:#166534;">KESİLDİ · ${escapeDashboardText(k.faturaNo)}</span>`:(irsaliyeGeciktiMi(k)?`<span class="badge" style="background:#ffedd5;color:#9a3412;">${ayarSayisi('irsaliyeFaturaSuresi',7)} GÜNLÜK SÜRE DOLDU</span>`:'<span class="badge" style="background:#fef3c7;color:#92400e;">BEKLİYOR</span>')}</td><td><div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="irsaliyeDuzenle('${k.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="irsaliyeSil('${k.id}')">🗑️ Sil</button></div></td></tr>`).join('')||'<tr><td colspan="11" style="text-align:center;padding:25px;color:#64748b;">Seçilen tarihten sonra kayıt bulunmuyor.</td></tr>';
    }
function irsaliyeTumunuSec(sec){
fdWayAssert(false);
document.querySelectorAll('.irs-sec:not(:disabled)').forEach(x=>x.checked=sec);}
async function irsaliyeSil(id) {
try{
fdWayAssert(true);

        const kayit = tasimaIrsaliyeleri.find(k => String(k.id) === String(id));
        if (!kayit) return alert('Silinecek irsaliye kaydı bulunamadı.');
        if (!await fdWayAwait(fdYuzerOnaySor(`${kayit.irsaliyeNo || 'İrsaliye'} numaralı taşıma irsaliyesi kalıcı olarak silinsin mi?`))) return;
        showGlobalOverlay('İrsaliye siliniyor', 'Supabase kaydı siliniyor ve sonuç doğrulanıyor...');
        const oncekiListe = tasimaIrsaliyeleri;
        try {
            if (SUPABASE_MODE) {
                if (!activeUser?.sirketId) throw new Error('Şirket oturumu bulunamadı.');
                const { error:silmeHatasi } = await fdWayAwait(supabaseClient.from('portal_records').delete()
                    .eq('company_id', activeUser.sirketId).eq('module', 'irsaliyeler').eq('legacy_id', String(kayit.id)));
                if (silmeHatasi) throw silmeHatasi;
                const { data:kontrol, error:kontrolHatasi } = await fdWayAwait(supabaseClient.from('portal_records').select('legacy_id')
                    .eq('company_id', activeUser.sirketId).eq('module', 'irsaliyeler').eq('legacy_id', String(kayit.id)).maybeSingle());
                if (kontrolHatasi) throw kontrolHatasi;
                if (kontrol) throw new Error('İrsaliye Supabase üzerinden silinemedi.');
            } else {
                tasimaIrsaliyeleri = tasimaIrsaliyeleri.filter(k => String(k.id) !== String(kayit.id));
                yuklenenVeriler.add('irsaliyeler');
                try { await fdWayAwait(verileriKaydet()); } catch (error) {
if(!fdWayValid())return;
 tasimaIrsaliyeleri = oncekiListe; throw error; }
            }
            tasimaIrsaliyeleri = tasimaIrsaliyeleri.filter(k => String(k.id) !== String(kayit.id));
            yuklenenVeriler.add('irsaliyeler');
            veriKayitGoruntusunuYenile('irsaliyeler');
            veriOnbelleginiKaydet();
            if (String(irsaliyeDuzenlenenId) === String(kayit.id)) irsaliyeFormTemizle();
            irsaliyeListele();
            gunlukHatirlatmalariKapat();
            showToast('Taşıma irsaliyesi Supabase’den silindi.');
        } catch (error) {
if(!fdWayValid())return;

            tasimaIrsaliyeleri = oncekiListe;
            console.error('İrsaliye silme:', error);
            alert('İrsaliye silinemedi: ' + (error.message || error));
        } finally {
if(fdWayValid()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
}
function irsaliyeAciklamaMetni(k){
fdWayAssert(false);
const miktar=String(k.birim||'').toLocaleUpperCase('tr-TR')==='KOMPLE'?'KOMPLE':`${k.miktar} ${k.birim}`;return String(uygulamaAyarlari.irsaliyeAciklamaSablonu||VARSAYILAN_UYGULAMA_AYARLARI.irsaliyeAciklamaSablonu).replaceAll('{IRSALIYE_NO}',k.irsaliyeNo||'').replaceAll('{PLAKA}',k.plaka||'').replaceAll('{MIKTAR}',miktar).replaceAll('{ACIKLAMA}',k.aciklama||'').replaceAll('{TARIH}',tarihFormati(k.tarih));}
function irsaliyeMiktarSayiyaCevir(deger){
fdWayAssert(false);
let metin=String(deger??'').trim().replace(/\s/g,'').replace(/[^\d,.-]/g,'');if(metin.includes(',')&&metin.includes('.'))metin=metin.replace(/\./g,'').replace(',','.');else if(metin.includes(','))metin=metin.replace(',','.');const sayi=Number(metin);return Number.isFinite(sayi)?sayi:0;}
function irsaliyeMiktarFormatla(deger){
fdWayAssert(false);
return Number(deger||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:3});}
function irsaliyeFaturaGruplariniHesapla(liste){
fdWayAssert(false);

        const harita=new Map();
        liste.forEach(k=>{const plaka=String(k.plaka||'PLAKA YOK').trim().toLocaleUpperCase('tr-TR'),birim=String(k.birim||'BİRİM YOK').trim().toLocaleUpperCase('tr-TR'),fiyat=Number(k.fiyat||0),anahtar=`${plaka}|${birim}|${fiyat.toFixed(6)}`,miktar=irsaliyeMiktarSayiyaCevir(k.miktar);if(!harita.has(anahtar))harita.set(anahtar,{plaka,birim,fiyat,miktar:0,irsaliyeAdedi:0,tutar:0});const grup=harita.get(anahtar);grup.miktar+=miktar;grup.irsaliyeAdedi++;grup.tutar+=miktar*fiyat;});
        return [...harita.values()].sort((a,b)=>a.plaka.localeCompare(b.plaka,'tr')||a.birim.localeCompare(b.birim,'tr')||a.fiyat-b.fiyat);
    }
function irsaliyeFaturaGrupOzetiniCiz(gruplar){
fdWayAssert(false);

        const genelTutar=gruplar.reduce((toplam,g)=>toplam+g.tutar,0),genelIrsaliye=gruplar.reduce((toplam,g)=>toplam+g.irsaliyeAdedi,0);
        document.getElementById('irsFaturaGrupOzeti').innerHTML=`<div class="irsaliye-fatura-ozet-baslik">PLAKA, BİRİM VE FİYATA GÖRE FATURA KALEMLERİ</div><div class="table-wrapper"><table><thead><tr><th>Plaka</th><th>Birim</th><th>Birim Fiyat</th><th>İrsaliye</th><th>Toplam Miktar</th><th>Kesilecek Tutar</th></tr></thead><tbody>${gruplar.map(g=>`<tr><td><strong>${escapeDashboardText(g.plaka)}</strong></td><td>${escapeDashboardText(g.birim)}</td><td>${paraFormatla(g.fiyat)}</td><td>${g.irsaliyeAdedi}</td><td>${irsaliyeMiktarFormatla(g.miktar)} ${escapeDashboardText(g.birim)}</td><td><strong>${paraFormatla(g.tutar)}</strong></td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">GENEL TOPLAM</td><td>${genelIrsaliye}</td><td>${gruplar.length} FATURA KALEMİ</td><td>${paraFormatla(genelTutar)}</td></tr></tfoot></table></div>`;
        return genelTutar;
    }
function irsaliyeFaturalandirAc(){
fdWayAssert(true);

        const ids=[...document.querySelectorAll('#irsaliyeTablosu .irs-sec:checked')].map(x=>String(x.dataset.id||''));if(!ids.length)return alert('Faturaya dönüştürülecek irsaliyeleri seçin.');
        const liste=ids.map(id=>tasimaIrsaliyeleri.find(k=>String(k.id)===id)).filter(Boolean);
        if(!liste.length)return alert('Seçilen irsaliye kaydı bulunamadı. Listeyi yenileyip tekrar deneyin.');
        const firmalar=[...new Set(liste.map(k=>String(k.firma||'').trim().toLocaleUpperCase('tr-TR')))];
        if(liste.length>1&&firmalar.length!==1)return alert('Tek faturada yalnızca aynı firmaya ait irsaliyeleri seçebilirsiniz.');
        const gruplar=irsaliyeFaturaGruplariniHesapla(liste),genelTutar=irsaliyeFaturaGrupOzetiniCiz(gruplar);
        irsaliyeFaturaSecimleri=ids;document.getElementById('irsFaturaFirma').textContent=`FİRMA: ${firmalar[0]} · ${liste.length} İRSALİYE · ${gruplar.length} FATURA KALEMİ · TOPLAM ${paraFormatla(genelTutar)}`;document.getElementById('irsFaturaTarih').value=new Date().toISOString().slice(0,10);document.getElementById('irsFaturaNo').value='';document.getElementById('irsBirlestirmeMetni').value=liste.map(irsaliyeAciklamaMetni).join('\n');document.getElementById('modalIrsaliyeFatura').style.display='flex';
    }
function irsaliyeFaturaKapat(){
fdWayAssert(false);
document.getElementById('modalIrsaliyeFatura').style.display='none';irsaliyeFaturaSecimleri=[];}
async function irsaliyeMetniniKopyala(){
try{
fdWayAssert(false);
await fdWayAwait(navigator.clipboard.writeText(document.getElementById('irsBirlestirmeMetni').value));showToast('Fatura açıklaması panoya kopyalandı.');
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
}
async function irsaliyeFaturayiKaydet(){
try{
fdWayAssert(true);

        const tarih=document.getElementById('irsFaturaTarih').value,no=document.getElementById('irsFaturaNo').value.trim().toLocaleUpperCase('tr-TR');if(!tarih||!no)return alert('Fatura tarihi ve fatura numarası zorunludur.');
        const batch=`fatura_${Date.now()}`;tasimaIrsaliyeleri.filter(k=>irsaliyeFaturaSecimleri.includes(String(k.id))).forEach(k=>{k.faturaTarih=tarih;k.faturaNo=no;k.faturaGrupId=batch;k.faturaAciklamasi=document.getElementById('irsBirlestirmeMetni').value;});await fdWayAwait(supabaseVerileriKaydet());irsaliyeFaturaKapat();irsaliyeListele();showToast(`Fatura kaydedildi: ${no}`);
    
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
}
function irsaliyeExcelAl(){
fdWayAssert(false);
const l=irsaliyeFiltreliListe(),ws=XLSX.utils.aoa_to_sheet([['Firma','Tarih','İrsaliye No','Plaka','Açıklama','Miktar','Birim','Fiyat','Fatura No','Fatura Tarihi'],...l.map(k=>[k.firma,tarihFormati(k.tarih),k.irsaliyeNo,k.plaka,k.aciklama,k.miktar,k.birim,k.fiyat,k.faturaNo||'',k.faturaTarih? tarihFormati(k.faturaTarih):''])]),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'İrsaliyeler');XLSX.writeFile(wb,`Tasima_Irsaliyeleri_${document.getElementById('irsHafta').value}.xlsx`);}
function irsaliyePdfAl(){
fdWayAssert(false);
const tablo=document.querySelector('#irsaliyeRaporAlani table');return fdWayPdf(tablo,'TAŞIMA İRSALİYELERİ · '+document.getElementById('irsHafta').value,'Tasima_Irsaliyeleri_'+document.getElementById('irsHafta').value+'.pdf',{yon:'landscape'});}
function irsaliyePlakaGecmisKayitlari(){
fdWayAssert(false);
const bas=document.getElementById('irsPlakaBaslangic')?.value||'',bit=document.getElementById('irsPlakaBitis')?.value||'';return tasimaIrsaliyeleri.filter(k=>aktifSirketeAit(k)&&String(k.plaka||'').toLocaleUpperCase('tr-TR')===irsaliyeGecmisPlaka&&(!bas||String(k.tarih)>=bas)&&(!bit||String(k.tarih)<=bit)).sort((a,b)=>String(b.tarih).localeCompare(String(a.tarih)));}
function irsaliyePlakaGecmisiAc(plaka){
fdWayAssert(false);

        irsaliyeGecmisPlaka=String(plaka||'').toLocaleUpperCase('tr-TR');
        const baslik=`${irsaliyeGecmisPlaka} — TAŞIMA İRSALİYESİ GEÇMİŞİ`;
        document.getElementById('irsPlakaGecmisBaslik').textContent=`🚚 ${baslik}`;
        document.getElementById('irsPlakaGecmisRaporBaslik').textContent=baslik;
        document.getElementById('irsPlakaBaslangic').value='';document.getElementById('irsPlakaBitis').value='';
        irsaliyePlakaGecmisiCiz();
        document.getElementById('modalIrsaliyePlakaGecmisi').style.display='flex';
    }
function irsaliyePlakaGecmisiCiz(){
fdWayAssert(false);

        const liste=irsaliyePlakaGecmisKayitlari(),bas=document.getElementById('irsPlakaBaslangic').value,bit=document.getElementById('irsPlakaBitis').value;
        document.getElementById('irsPlakaGecmisRaporBaslik').textContent=`${irsaliyeGecmisPlaka} — TAŞIMA İRSALİYESİ GEÇMİŞİ${bas||bit?` · ${bas?tarihFormati(bas):'İLK KAYIT'} / ${bit?tarihFormati(bit):'BUGÜN'}`:''}`;
        document.querySelector('#irsPlakaGecmisTablosu tbody').innerHTML=liste.map(k=>`<tr><td>${tarihFormati(k.tarih)}</td><td>${escapeDashboardText(k.firma)}</td><td>${escapeDashboardText(k.irsaliyeNo)}</td><td>${escapeDashboardText(k.aciklama)}</td><td>${String(k.birim||'').toLocaleUpperCase('tr-TR')==='KOMPLE'?'KOMPLE':`${escapeDashboardText(k.miktar)} ${escapeDashboardText(k.birim)}`}</td><td>${paraFormatla(k.fiyat)}</td><td>${k.faturaNo?`${escapeDashboardText(k.faturaNo)} · ${tarihFormati(k.faturaTarih)}`:'KESİLMEDİ'}</td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:20px;">Kayıt bulunmuyor.</td></tr>';
    }
function irsaliyePlakaTarihleriniTemizle(){
fdWayAssert(false);
document.getElementById('irsPlakaBaslangic').value='';document.getElementById('irsPlakaBitis').value='';irsaliyePlakaGecmisiCiz();}
function irsaliyePlakaGecmisiKapat(){
fdWayAssert(false);
document.getElementById('modalIrsaliyePlakaGecmisi').style.display='none';}
function irsaliyePlakaGecmisiExcel(){
fdWayAssert(false);
const l=irsaliyePlakaGecmisKayitlari(),ws=XLSX.utils.aoa_to_sheet([['Tarih','Firma','İrsaliye No','Açıklama','Miktar','Birim','Fiyat','Fatura No','Fatura Tarihi'],...l.map(k=>[tarihFormati(k.tarih),k.firma,k.irsaliyeNo,k.aciklama,k.miktar,k.birim,k.fiyat,k.faturaNo||'',k.faturaTarih?tarihFormati(k.faturaTarih):''])]),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Plaka Geçmişi');XLSX.writeFile(wb,`${irsaliyeGecmisPlaka}_Irsaliye_Gecmisi.xlsx`);}
function irsaliyePlakaGecmisiPdf(){
fdWayAssert(false);
const tablo=document.querySelector('#irsPlakaGecmisRaporu table');return fdWayPdf(tablo,irsaliyeGecmisPlaka+' · TAŞIMA İRSALİYESİ GEÇMİŞİ',irsaliyeGecmisPlaka+'_Irsaliye_Gecmisi.pdf',{yon:'landscape'});}
let fdIrsFaturaDuzenlemeGrup='';
    let irsaliyeFaturaDuzenle=function(id){
fdWayAssert(true);
const k=tasimaIrsaliyeleri.find(x=>String(x.id)===String(id));if(!k?.faturaNo)return alert('Düzenlenecek fatura kaydı bulunamadı.');const grup=String(k.faturaGrupId||''),liste=tasimaIrsaliyeleri.filter(x=>aktifSirketeAit(x)&&(grup?String(x.faturaGrupId||'')===grup:(String(x.faturaNo||'')===String(k.faturaNo)&&String(x.faturaTarih||'')===String(k.faturaTarih||''))));irsaliyeFaturaSecimleri=liste.map(x=>String(x.id));fdIrsFaturaDuzenlemeGrup=grup||('fatura_'+Date.now());irsaliyeFaturaGrupOzetiniCiz(irsaliyeFaturaGruplariniHesapla(liste));document.getElementById('irsFaturaFirma').textContent='FATURA KAYDI DÜZENLENİYOR · '+liste.length+' İRSALİYE';document.getElementById('irsFaturaTarih').value=String(k.faturaTarih||'').slice(0,10);document.getElementById('irsFaturaNo').value=k.faturaNo||'';document.getElementById('irsBirlestirmeMetni').value=k.faturaAciklamasi||liste.map(irsaliyeAciklamaMetni).join('\n');document.getElementById('modalIrsaliyeFatura').style.display='flex';};
    irsaliyeFaturayiKaydet=async function(){
try{
fdWayAssert(true);
const tarih=document.getElementById('irsFaturaTarih').value,no=document.getElementById('irsFaturaNo').value.trim().toLocaleUpperCase('tr-TR');if(!tarih||!no)return alert('Fatura tarihi ve fatura numarası zorunludur.');const batch=fdIrsFaturaDuzenlemeGrup||('fatura_'+Date.now()),aciklama=document.getElementById('irsBirlestirmeMetni').value;tasimaIrsaliyeleri.filter(k=>irsaliyeFaturaSecimleri.includes(String(k.id))).forEach(k=>{k.faturaTarih=tarih;k.faturaNo=no;k.faturaGrupId=batch;k.faturaAciklamasi=aciklama;});await fdWayAwait(supabaseVerileriKaydet());fdIrsFaturaDuzenlemeGrup='';irsaliyeFaturaKapat();irsaliyeListele();showToast('Fatura kaydı güncellendi: '+no);
}catch(fdWayError){if(!fdWayValid())return;throw fdWayError;}
};
    const fdIrsListeV132=irsaliyeListele;
    irsaliyeListele=function(){
fdWayAssert(false);
fdIrsListeV132();document.querySelectorAll('#irsaliyeTablosu tbody tr').forEach(tr=>{const sec=tr.querySelector('.irs-sec'),k=tasimaIrsaliyeleri.find(x=>String(x.id)===String(sec?.dataset.id||'')),aks=tr.querySelector('.action-btns');if(!k?.faturaNo||!aks||aks.querySelector('.fd-icon-invoice'))return;const b=document.createElement('button');b.type='button';b.className='fd-icon-btn fd-icon-invoice';b.title='Fatura bilgisini düzenle';b.textContent='₺';b.onclick=()=>irsaliyeFaturaDuzenle(k.id);aks.prepend(b);});};
return{init(){window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdWayAssert();return openIrsaliyeTakipApp(...args)},api:{get irsaliyeBirimSecenekleriniYenile(){return irsaliyeBirimSecenekleriniYenile},get irsaliyeFormTemizle(){return irsaliyeFormTemizle},get irsaliyeDuzenle(){return irsaliyeDuzenle},get irsaliyeKaydet(){return irsaliyeKaydet},get irsaliyeFiltreliListe(){return irsaliyeFiltreliListe},get irsaliyeListele(){return irsaliyeListele},get irsaliyeTumunuSec(){return irsaliyeTumunuSec},get irsaliyeSil(){return irsaliyeSil},get irsaliyeAciklamaMetni(){return irsaliyeAciklamaMetni},get irsaliyeMiktarSayiyaCevir(){return irsaliyeMiktarSayiyaCevir},get irsaliyeMiktarFormatla(){return irsaliyeMiktarFormatla},get irsaliyeFaturaGruplariniHesapla(){return irsaliyeFaturaGruplariniHesapla},get irsaliyeFaturaGrupOzetiniCiz(){return irsaliyeFaturaGrupOzetiniCiz},get irsaliyeFaturalandirAc(){return irsaliyeFaturalandirAc},get irsaliyeFaturaKapat(){return irsaliyeFaturaKapat},get irsaliyeMetniniKopyala(){return irsaliyeMetniniKopyala},get irsaliyeFaturayiKaydet(){return irsaliyeFaturayiKaydet},get irsaliyeExcelAl(){return irsaliyeExcelAl},get irsaliyePdfAl(){return irsaliyePdfAl},get irsaliyePlakaGecmisKayitlari(){return irsaliyePlakaGecmisKayitlari},get irsaliyePlakaGecmisiAc(){return irsaliyePlakaGecmisiAc},get irsaliyePlakaGecmisiCiz(){return irsaliyePlakaGecmisiCiz},get irsaliyePlakaTarihleriniTemizle(){return irsaliyePlakaTarihleriniTemizle},get irsaliyePlakaGecmisiKapat(){return irsaliyePlakaGecmisiKapat},get irsaliyePlakaGecmisiExcel(){return irsaliyePlakaGecmisiExcel},get irsaliyePlakaGecmisiPdf(){return irsaliyePlakaGecmisiPdf},get irsaliyeFaturaDuzenle(){return irsaliyeFaturaDuzenle}},dispose(){fdWayDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="irsaliye"):null;if(tab)tab.alanId="";for(const node of fdWayNodes)fdWayClean(node);document.querySelectorAll("[data-fd-module-root=irsaliye] form").forEach(f=>f.reset());irsaliyeFaturaSecimleri=[];irsaliyeDuzenlenenId="";irsaliyeGecmisPlaka="";fdIrsFaturaDuzenlemeGrup="";}};
});

window.FDModules.define('varlikkisileri',function(){

let fdVkDisposed=false,fdVkOverlay=false;
const fdVkIlkOturum=fdVkAnahtari(),fdVkData=window.FDVarlikKisileriData.current();
const {adAnahtari,kanonikAd,birlesikKisiler,fdVarlikKisiListesiniGuncelle150,ayniSirket,html}=fdVkData;
const fdVkTimers=new Set();
function fdVkAnahtari(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('varlikkisileri')])}
function fdVkGecerli(){return !fdVkDisposed&&fdVkIlkOturum===fdVkAnahtari()&&anaMenuModulErisimiVar('varlikkisileri')}
function fdVkDogrula(write=false){if(!fdVkGecerli())throw Error('Oturum değişti; Kişiler ve Varlıklar ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('varlikkisileri'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdVkBekle(promise){fdVkDogrula();const value=await promise;fdVkDogrula();return value}
function showGlobalOverlay(...args){fdVkOverlay=true;return window.showGlobalOverlay(...args)}
function hideGlobalOverlay(){fdVkOverlay=false;return window.hideGlobalOverlay()}
function setTimeout(callback,delay,...args){const timer=window.setTimeout(()=>{fdVkTimers.delete(timer);if(fdVkGecerli())callback(...args)},delay);fdVkTimers.add(timer);return timer}
function appKur(){for(const id of ['varlikKisileriApp','fdVarlikKisiDetay','fdVarlikKisiModal'])if(!document.getElementById(id)||document.getElementById(id).hasAttribute('data-fd-module-placeholder'))throw Error('Kişi ekranı yüklenemedi.')}
function fdVkBaslat(){appKur();const panel=document.getElementById('fdVarlikKisiDetay');panel.addEventListener('click',e=>{if(e.target===panel)fdVarlikKisiDetayKapat()});
panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();fdVarlikKisiDetayKapat();return}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button,input,select,a[href]')].filter(x=>!x.disabled&&x.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});}
const KANAL_KISI='KANAL MERMER LTD. ŞTİ.',KANAL_ID='varlik_kisi_kanal_mermer_ltd_sti';
let fdVarlikKisiGorunumu=[],fdVarlikKisiSecili=null,fdVarlikKisiFiltre='tumu',fdVarlikKisiDonusDugmesi=null,fdVarlikKisiDonusIsleyicisi=null;
let fdVkMod='kisiler',fdVkSayfa=1,fdVkSayfaBoyutu=25,fdVkVarlikGorunumu=[],fdVkDetaySatirlari=[],fdVkDetayArama='',fdVkDetayOdak=null,fdVkDuzenleme=null,fdVkKaydediliyor=false,fdVkYukleme=null;
const yazabilir=()=>typeof anaMenuModulYazmaYetkisiVar==='function'&&anaMenuModulYazmaYetkisiVar('varlikkisileri');

const formatSayi=v=>Number(v||0).toLocaleString('tr-TR',{maximumFractionDigits:2});
const vkToplam=k=>k.tapular.length+k.daireler.length+k.araclar.length+k.cksler.length;

function vkEslesir(metin,q){
fdVkDogrula(false);
const anahtar=adAnahtari(metin);return !q||q.split(' ').every(sozcuk=>anahtar.includes(sozcuk))||(/^[0-9 ]+$/.test(q)&&anahtar.replace(/\D/g,'').includes(q.replace(/\D/g,'')))}

function vkKimlik(k){
fdVkDogrula(false);
return k.id||adAnahtari(k.ad)}

function kisiId(){
fdVkDogrula(false);
return 'varlik_kisi_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)}

async function profilleriYukle(zorla=false){
try{
fdVkDogrula(false);

        const sirket=String(aktifSirketId());if(!sirket)throw new Error('Şirket oturumu bulunamadı.');
        if(fdVkData.fdVkSirket!==sirket){fdVarlikKisiDetayKapat();modalKapat('fdVarlikKisiModal');fdVkData.fdVarlikKisiKayitlari=[];fdVkData.fdVarlikKisiYuklendi=false;fdVkData.fdVkModelCache=null;fdVarlikKisiSecili=null;fdVkData.fdVkSirket=sirket;}
        if(fdVkData.fdVarlikKisiYuklendi&&!zorla)return fdVkData.fdVarlikKisiKayitlari;
        const tum=[];for(let bas=0;;bas+=500){const{data,error}=await fdVkBekle(supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',sirket).eq('module','kiratakip').like('legacy_id','varlik_kisi_%').order('legacy_id').range(bas,bas+499));if(error)throw error;const rows=data||[];tum.push(...rows);if(rows.length<500)break;}
        if(String(aktifSirketId())!==sirket)throw new Error('Şirket değişti; liste yeniden açılmalı.');
        fdVkData.fdVarlikKisiKayitlari=tum.map(x=>({...x.data,sirketId:sirket,id:String(x.data?.id||x.legacy_id)})).filter(x=>x.kayitTipi==='varlikKisisi');fdVkData.fdVarlikKisiYuklendi=true;fdVkData.fdVkModelCache=null;return fdVkData.fdVarlikKisiKayitlari;
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function kaydiYaz(kayit){
try{
fdVkDogrula(true);
const satir={...kayit,sirketId:String(aktifSirketId()),id:String(kayit.id||kisiId()),kayitTipi:'varlikKisisi',ad:kanonikAd(kayit.ad),guncellemeTarihi:new Date().toISOString()},{error}=await fdVkBekle(supabaseClient.from('portal_records').upsert({company_id:aktifSirketId(),module:'kiratakip',legacy_id:satir.id,employee_legacy_id:null,data:satir},{onConflict:'company_id,module,legacy_id'}));if(error)throw error;const i=fdVkData.fdVarlikKisiKayitlari.findIndex(x=>String(x.id)===satir.id);if(i>=0)fdVkData.fdVarlikKisiKayitlari[i]=satir;else fdVkData.fdVarlikKisiKayitlari.push(satir);return satir
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function kanalKayitlariniBirleştir(){
try{
fdVkDogrula(true);
const eslesen=fdVkData.fdVarlikKisiKayitlari.filter(x=>kanonikAd(x.ad)===KANAL_KISI),ana=eslesen.find(x=>String(x.id)===KANAL_ID)||eslesen[0]||{},birlesik={...ana,id:KANAL_ID,ad:KANAL_KISI,tcVkn:ana.tcVkn||'',telefon:ana.telefon||'',adres:ana.adres||'',not:ana.not||'',aliases:[...new Set(eslesen.flatMap(x=>[x.ad,...(x.aliases||[])]).concat(['KANAL MERMER',KANAL_KISI]))]};await fdVkBekle(kaydiYaz(birlesik));const silinecek=eslesen.map(x=>String(x.id)).filter(id=>id&&id!==KANAL_ID);if(silinecek.length){const{error}=await fdVkBekle(supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','kiratakip').in('legacy_id',silinecek));if(error)throw error;fdVkData.fdVarlikKisiKayitlari=fdVkData.fdVarlikKisiKayitlari.filter(x=>!silinecek.includes(String(x.id)))}
        const degisen=(typeof araclar!=='undefined'?araclar:[]).filter(aktifSirketeAit).filter(a=>kanonikAd(a.aracSahibi)!==KANAL_KISI||String(a.aracSahibi||'')!==KANAL_KISI);if(degisen.length){degisen.forEach(a=>a.aracSahibi=KANAL_KISI);for(let i=0;i<degisen.length;i+=100){const rows=degisen.slice(i,i+100).map((a,j)=>({company_id:aktifSirketId(),module:'araclar',legacy_id:typeof supabaseKayitAnahtari==='function'?supabaseKayitAnahtari('araclar',a,i+j):String(a.id),record_year:Number(typeof aktifKayitYili!=='undefined'&&aktifKayitYili||new Date().getFullYear()),employee_legacy_id:a.personelId?String(a.personelId):null,data:a})),{error}=await fdVkBekle(supabaseClient.from('portal_records').upsert(rows,{onConflict:'company_id,module,legacy_id'}));if(error)throw error}if(typeof veriKayitGoruntusunuYenile==='function')veriKayitGoruntusunuYenile('araclar')}
        fdVarlikKisiListesiniGuncelle150();return degisen.length
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function kiraSahibiniEsitle(kart,eski){
try{
fdVkDogrula(true);
if(typeof kiraKayitlari==='undefined')return kart.kiraSahipId||'';const adaylar=typeof kiraSahipler==='function'?kiraSahipler():kiraKayitlari.filter(x=>x?.tip==='sahip'),eskiAdlar=[eski?.ad,...(eski?.aliases||[]),kart.ad].filter(Boolean).map(adAnahtari),mevcut=adaylar.find(x=>String(x.id)===String(kart.kiraSahipId||eski?.kiraSahipId||''))||adaylar.find(x=>eskiAdlar.includes(adAnahtari(x.ad)));const sahip={...(mevcut||{}),id:String(mevcut?.id||(typeof kiraYeniId==='function'?kiraYeniId('sahip'):'sahip_'+Date.now())),tip:'sahip',sirketId:aktifSirketId(),ad:kart.ad,tur:kart.ad.includes('ŞTİ')||kart.ad.includes('LTD')?'sirket':(mevcut?.tur||'sahis'),no:kart.tcVkn||mevcut?.no||'',telefon:kart.telefon||mevcut?.telefon||'',adres:kart.adres||mevcut?.adres||'',not:kart.not||mevcut?.not||''};let kaydedilen=sahip;if(typeof kiraTekKaydiVeritabaninaKaydet==='function')kaydedilen=await fdVkBekle(kiraTekKaydiVeritabaninaKaydet(sahip));else{const{error}=await fdVkBekle(supabaseClient.from('portal_records').upsert({company_id:aktifSirketId(),module:'kiratakip',legacy_id:sahip.id,record_year:new Date().getFullYear(),employee_legacy_id:null,data:sahip},{onConflict:'company_id,module,legacy_id'}));if(error)throw error}const i=kiraKayitlari.findIndex(x=>String(x.id)===String(sahip.id));if(i>=0)kiraKayitlari[i]=kaydedilen;else kiraKayitlari.push(kaydedilen);veriKayitGoruntusunuYenile?.('kiratakip');veriOnbelleginiKaydet?.();return sahip.id
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

function tapuTurAdi(t){
fdVkDogrula(false);
const ham=String(t?.nitelik||t?.tasinmazTuru||t?.tur||'').trim(),n=adAnahtari(ham);if(/ZEYTINLIK/.test(n))return'Zeytinlik';if(/BAHCE/.test(n))return'Bahçe';if(/(^| )BAG( |$)/.test(n))return'Bağ';if(/TARLA|ARAZI|CIFTLIK/.test(n))return'Tarla';if(/ARSA/.test(n))return'Arsa';if(/DAIRE|MESKEN|KONUT|APARTMAN/.test(n))return'Daire';if(/DUKKAN|MAGAZA/.test(n))return'Dükkan';if(/ISYERI|OFIS|BURO/.test(n))return'İşyeri';if(/DEPO|ANTREPO/.test(n))return'Depo';if(/FABRIKA|IMALATHANE/.test(n))return'Fabrika';if(/MUSTAKIL|EV/.test(n))return'Müstakil Ev';if(ham)return ham.toLocaleLowerCase('tr-TR').replace(/(^|\s)\p{L}/gu,m=>m.toLocaleUpperCase('tr-TR'));return'Tapu (nitelik belirtilmemiş)'}

function tapuTurOzetleri(k){
fdVkDogrula(false);
const sayac=new Map();k.tapular.forEach(t=>{const ad=tapuTurAdi(t);sayac.set(ad,(sayac.get(ad)||0)+1)});return[...sayac.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr'))}

function kisiVarlikOzetleri(k){
fdVkDogrula(false);
return[[k.araclar.length,'Araç'],[k.daireler.length,'Daire / İşyeri'],...tapuTurOzetleri(k).map(([ad,sayi])=>[sayi,ad]),[k.cksler.length,'ÇKS']].filter(x=>x[0])}

function tarlaMi(t){
fdVkDogrula(false);
return['Tarla','Bahçe','Bağ','Zeytinlik'].includes(tapuTurAdi(t))}

function tapuFiltreId(ad){
fdVkDogrula(false);
return'tapu_'+adAnahtari(ad).replace(/\s+/g,'_')}

function kisiDetayGruplari(k){
fdVkDogrula(false);
return[['tumu','Tümü',k.araclar.length+k.daireler.length+k.tapular.length+k.cksler.length],['arac','Araç',k.araclar.length],['daire','Daire / İşyeri',k.daireler.length],...tapuTurOzetleri(k).map(([ad,sayi])=>[tapuFiltreId(ad),ad,sayi]),['cks','ÇKS',k.cksler.length]].filter((g,i)=>i===0||g[2])}

function kisiVarlikSatirlari(k,filtre='tumu'){
fdVkDogrula(false);

        const satirlar=[];
        k.araclar.forEach(a=>satirlar.push({grup:'arac',tur:'Araç',baslik:a.plaka||'Plaka belirtilmemiş',alt:[a.marka,a.model].filter(Boolean).join(' '),konum:a.sube||'',durum:a.durum||'',detaylar:[a.aracTuru||a.tur,a.personelId&&'Kullanan: '+(typeof personelAdi==='function'?personelAdi(a.personelId):a.personelId),a.yilModel&&'Model yılı: '+a.yilModel],kayitTuru:'arac',id:a.id,bagliId:''}));
        k.daireler.forEach(d=>{const soz=typeof kiraAktifSozlesme==='function'?kiraAktifSozlesme(d.id):null,tur=d.mulkTuru==='isyeri'?'İşyeri':'Daire';satirlar.push({grup:'daire',tur,baslik:d.kisaAd||d.ad||tur,alt:soz?.kiraciAd?'Kiracı: '+soz.kiraciAd:'',konum:d.adres||'',durum:d.durum||'',detaylar:[soz?.aylikKira&&'Aylık kira: '+(typeof paraFormatla==='function'?paraFormatla(soz.aylikKira):formatSayi(soz.aylikKira)+' TL'),d.elektrik&&'Elektrik: '+d.elektrik,d.su&&'Su: '+d.su,d.gaz&&'Doğalgaz: '+d.gaz],kayitTuru:'daire',id:d.id,bagliId:''})});
        k.tapular.forEach(t=>{const tur=tapuTurAdi(t),alan=t.sahipOlunanAlan?((typeof tapuAlan==='function'?tapuAlan(t.sahipOlunanAlan):formatSayi(t.sahipOlunanAlan))+' m²'):'';satirlar.push({grup:tapuFiltreId(tur),tur,baslik:[t.ada&&'Ada '+t.ada,t.parsel&&'Parsel '+t.parsel].filter(Boolean).join(' / ')||t.tasinmazNo||tur,alt:t.tasinmazNo?'Taşınmaz no: '+t.tasinmazNo:'',konum:[t.il,t.ilce,t.mahalle].filter(Boolean).join(' / '),durum:'',detaylar:[t.nitelik,alan&&'Sahip olunan alan: '+alan,t.hisseDurumu&&'Hisse: '+t.hisseDurumu,t.bagimsizBolum&&'Bağımsız bölüm: '+t.bagimsizBolum,t.alisTarihi&&'Alış: '+t.alisTarihi],kayitTuru:'tapu',id:t.id,bagliId:''})});
        k.cksler.forEach(c=>satirlar.push({grup:'cks',tur:'ÇKS',baslik:(c.yil||'-')+' · '+(c.urun||'Ürün belirtilmemiş'),alt:[c.ada&&'Ada '+c.ada,c.parsel&&'Parsel '+c.parsel].filter(Boolean).join(' / '),konum:[c.il,c.ilce,c.mahalle].filter(Boolean).join(' / '),durum:'',detaylar:[c.cksSahibi&&'ÇKS sahibi: '+c.cksSahibi,c.ekenNotu&&'Eken: '+c.ekenNotu,c.suluKuru],kayitTuru:'cks',id:c.id,bagliId:c.tapuId||''}));
        return filtre==='tumu'?satirlar:satirlar.filter(x=>x.grup===filtre||x.kayitTuru===filtre);
    }

function vkModel(){
fdVkDogrula(false);

        if(fdVkData.fdVkModelCache&&fdVkData.fdVkModelCache.sirket===String(aktifSirketId()))return fdVkData.fdVkModelCache;
        const kisiler=birlesikKisiler(),kayitlar=new Map();
        const ekle=(x,k)=>{const key=x.kayitTuru+'|'+String(x.id),eski=kayitlar.get(key);if(eski){if(k&&!eski.kisiler.some(p=>vkKimlik(p)===vkKimlik(k)))eski.kisiler.push(k)}else kayitlar.set(key,{...x,key,kisiler:k?[k]:[]})};
        kisiler.forEach(k=>{k.satirlar=kisiVarlikSatirlari(k);k.satirlar.forEach(x=>ekle(x,k));k.arama=[k.ad,k.tcVkn,k.telefon,k.adres,k.not,...k.aliases,...k.satirlar.flatMap(x=>[x.tur,x.baslik,x.alt,x.konum,x.durum,...x.detaylar])].join(' ');});
        // Include unassigned records too, without creating a fictitious person.
        const bos={araclar:(typeof araclar!=='undefined'?araclar:[]).filter(aktifSirketeAit),daireler:(typeof kiraDaireler==='function'?kiraDaireler():[]).filter(ayniSirket),tapular:(typeof tapuKayitlari!=='undefined'?tapuKayitlari:[]).filter(t=>ayniSirket(t)&&(t.kayitTipi==='tapu'||!t.kayitTipi)),cksler:(typeof tapuCksKayitlari!=='undefined'?tapuCksKayitlari:[]).filter(ayniSirket)};
        kisiVarlikSatirlari(bos).forEach(x=>{if(!kayitlar.has(x.kayitTuru+'|'+String(x.id)))ekle(x,null)});
        const varliklar=[...kayitlar.values()];varliklar.forEach(x=>x.arama=[x.tur,x.baslik,x.alt,x.konum,x.durum,...x.detaylar,...x.kisiler.map(k=>[k.ad,k.tcVkn,k.telefon,k.adres,...k.aliases].join(' '))].join(' '));
        fdVkData.fdVkModelCache={sirket:String(aktifSirketId()),kisiler,varliklar};return fdVkData.fdVkModelCache;
    }

function vkTurUygun(x,tur){
fdVkDogrula(false);
return tur==='tumu'||x.kayitTuru===tur||x.grup===tur}

function vkFiltreliVeri(){
fdVkDogrula(false);

        const model=vkModel(),q=adAnahtari(document.getElementById('fdVarlikKisiAra')?.value||''),tur=document.getElementById('fdVkTur')?.value||'tumu',bilgi=document.getElementById('fdVkBilgi')?.value||'tumu',sira=document.getElementById('fdVkSira')?.value||'ad';
        let kisiler=model.kisiler.filter(k=>vkEslesir(k.arama,q)&&(tur==='tumu'||k.satirlar.some(x=>vkTurUygun(x,tur)))&&(bilgi==='tumu'||bilgi==='varlikli'&&vkToplam(k)>0||bilgi==='varliksiz'&&!vkToplam(k)||bilgi==='eksik'&&(!k.telefon||!k.tcVkn)));
        let varliklar=model.varliklar.filter(x=>vkEslesir(x.arama,q)&&vkTurUygun(x,tur)&&(!document.getElementById('fdVkDurum')?.value||x.durum===document.getElementById('fdVkDurum').value));
        kisiler.sort((a,b)=>sira==='varlik'?vkToplam(b)-vkToplam(a)||a.ad.localeCompare(b.ad,'tr'):(sira==='az'?-1:1)*a.ad.localeCompare(b.ad,'tr'));
        varliklar.sort((a,b)=>(sira==='az'?-1:1)*String(a.baslik).localeCompare(String(b.baslik),'tr',{numeric:true}));
        return{model,kisiler,varliklar};
    }

function vkSahipSatiri(k,i){
fdVkDogrula(false);
const sayilar=[k.tapular.length,k.daireler.length,k.araclar.length,k.cksler.length],toplam=vkToplam(k);
        return '<tr><td><button class="fd-vk-name" onclick="fdVarlikKisiDetayAc150('+i+')">'+html(k.ad)+'</button><small>'+html(k.tcVkn?'TC / VKN: '+k.tcVkn:'TC / VKN girilmemiş')+'</small><span class="fd-vk-mobile-count">'+html(kisiVarlikOzetleri(k).map(x=>x[0]+' '+x[1]).join(' · ')||'Bağlı varlık yok')+'</span></td><td class="fd-vk-iletisim">'+html(k.telefon||'Telefon girilmemiş')+'<small>'+html(k.adres||'Adres girilmemiş')+'</small></td>'+sayilar.map((n,j)=>'<td class="fd-vk-count-cell"><button aria-label="'+html(k.ad)+' · '+['Tapu','Daire / İşyeri','Araç','ÇKS'][j]+'" onclick="fdVarlikKisiDetayAc150('+i+',\''+['tapu','daire','arac','cks'][j]+'\')">'+(n||'—')+'</button></td>').join('')+'<td class="fd-vk-total">'+toplam+'</td><td class="fd-vk-row-actions"><button class="fd-vk-btn fd-vk-btn-soft" onclick="fdVarlikKisiDetayAc150('+i+')">Detay</button>'+(yazabilir()?'<button class="fd-vk-icon-btn" aria-label="'+html(k.ad)+' kişi kartını düzenle" title="Kişiyi düzenle" onclick="fdVarlikKisiFormuAc('+i+')">✎</button>':'')+'</td></tr>';
    }

function vkVarlikSatiri(x,i,detay=false){
fdVkDogrula(false);

        const sahip=x.kisiler?.map(k=>k.ad).join(' / ')||'Sahibi belirtilmemiş';
        return '<tr><td><span class="fd-vk-kind '+x.kayitTuru+'">'+html(x.tur)+'</span></td><td><strong>'+html(x.baslik)+'</strong>'+(x.alt?'<small>'+html(x.alt)+'</small>':'')+'</td>'+(!detay?'<td>'+html(sahip)+'</td>':'')+'<td><span class="fd-vk-location" title="'+html(x.konum||'')+'">'+html(x.konum||'—')+'</span>'+'<small>'+html(x.detaylar.filter(Boolean).join(' · '))+'</small></td><td>'+html(x.durum||'—')+'</td><td class="fd-vk-row-actions"><button class="fd-vk-btn fd-vk-btn-soft" onclick="fdVkKayitAc('+i+','+detay+')">Kaydı Aç</button></td></tr>';
    }

function vkTablo(satirlar,detay=false){
fdVkDogrula(false);
return '<table class="fd-vk-table fd-vk-assets"><thead><tr><th>Tür</th><th>Varlık / Kayıt</th>'+(!detay?'<th>Kişi / Sahip</th>':'')+'<th>Konum / Ayrıntılar</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>'+satirlar+'</tbody></table>'}

function varlikSatiri(x){
fdVkDogrula(false);
return '<div class="fd-vk-varlik-row"><span class="fd-vk-tur">'+html(x.tur)+'</span><div class="fd-vk-varlik-main"><strong>'+html(x.baslik||'-')+'</strong>'+(x.alt?'<small>'+html(x.alt)+'</small>':'')+'</div><div class="fd-vk-varlik-detail">'+html(x.detaylar.filter(Boolean).join(' · ')||'Detay bilgisi bulunmuyor')+'</div><div class="fd-vk-varlik-action"><button class="fd-vk-btn fd-vk-btn-open" type="button" onclick="fdVarlikKaydiAc150(\''+html(x.kayitTuru)+'\',\''+html(String(x.id||''))+'\',\''+html(String(x.bagliId||''))+'\')">Kaydı Aç →</button></div></div>'}

function fdVarlikKisiDonusunuTemizle(){
fdVkDogrula(false);
if(fdVarlikKisiDonusDugmesi&&fdVarlikKisiDonusIsleyicisi)fdVarlikKisiDonusDugmesi.removeEventListener('click',fdVarlikKisiDonusIsleyicisi);fdVarlikKisiDonusDugmesi=null;fdVarlikKisiDonusIsleyicisi=null}

function fdVarlikKisiGorunumunuSakla(){
fdVkDogrula(false);
return{arama:String(document.getElementById('fdVarlikKisiAra')?.value||''),tur:document.getElementById('fdVkTur')?.value,bilgi:document.getElementById('fdVkBilgi')?.value,durum:document.getElementById('fdVkDurum')?.value,sira:document.getElementById('fdVkSira')?.value,mod:fdVkMod,sayfa:fdVkSayfa,boyut:fdVkSayfaBoyutu,kisiAnahtari:fdVarlikKisiSecili?vkKimlik(fdVarlikKisiSecili):'',filtre:fdVarlikKisiFiltre,detayArama:fdVkDetayArama,detayAcik:Boolean(fdVarlikKisiSecili&&document.getElementById('fdVarlikKisiDetay')?.classList.contains('open')),detayScroll:document.querySelector('#fdVarlikKisiDetay .fd-vk-detail-scroll')?.scrollTop||0,scrollX:window.scrollX,scrollY:window.scrollY}}

async function fdVarlikKisiKaynakModulunuGeciciAc(acilis){
try{
fdVkDogrula(false);
const sekmeGecisiVar=typeof fdSekmeSistemGecisi!=='undefined',onceki=sekmeGecisiVar?fdSekmeSistemGecisi:false;if(sekmeGecisiVar)fdSekmeSistemGecisi=true;try{return await fdVkBekle(acilis())}finally{if(sekmeGecisiVar)fdSekmeSistemGecisi=onceki}
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function fdVarlikKisiGorunumuneDon(durum){
try{
fdVkDogrula(false);

        if(typeof fdUygulamaSekmesineGec==='function')await fdVkBekle(fdUygulamaSekmesineGec('varlikkisileri'));else{fdTumUygulamaAlanlariniGizle();document.getElementById('varlikKisileriApp').style.display='block';anaMenuDonusButonunuGoster?.()}
        fdVkData.fdVkModelCache=null;fdVkMod=durum.mod||'kisiler';fdVkSayfa=durum.sayfa||1;fdVkSayfaBoyutu=durum.boyut||25;
        for(const[id,v]of [['fdVarlikKisiAra',durum.arama||''],['fdVkTur',durum.tur||'tumu'],['fdVkBilgi',durum.bilgi||'tumu'],['fdVkDurum',durum.durum||''],['fdVkSira',durum.sira||'ad'],['fdVkBoyut',String(fdVkSayfaBoyutu)]])document.getElementById(id).value=v;
        fdVarlikKisiFiltre=durum.filtre||'tumu';fdVkDetayArama=durum.detayArama||'';document.getElementById('fdVkDetayAra').value=fdVkDetayArama;fdVarlikKisiSecili=durum.detayAcik?vkModel().kisiler.find(k=>vkKimlik(k)===durum.kisiAnahtari)||null:null;
        fdVarlikKisileriniCiz();if(fdVarlikKisiSecili){fdVarlikKisiDetayCiz150();document.querySelector('#fdVarlikKisiDetay .fd-vk-detail-scroll').scrollTop=durum.detayScroll||0;document.getElementById('fdVkDetayKapat').focus({preventScroll:true})}else fdVarlikKisiDetayKapat();
        setTimeout(()=>window.scrollTo(durum.scrollX||0,durum.scrollY||0),40);
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

function fdVarlikKisiDonusunuKur(modalId,durum){
fdVkDogrula(false);
fdVarlikKisiDonusunuTemizle();const modal=document.getElementById(modalId),dugme=modal?.querySelector('.modal-close');if(!dugme)return;fdVarlikKisiDonusDugmesi=dugme;fdVarlikKisiDonusIsleyicisi=()=>{fdVarlikKisiDonusunuTemizle();setTimeout(()=>fdVarlikKisiGorunumuneDon(durum),0)};dugme.addEventListener('click',fdVarlikKisiDonusIsleyicisi,{once:true})}

function fdVarlikKisiRaporu(){
fdVkDogrula(false);

        const detay=Boolean(fdVarlikKisiSecili&&document.getElementById('fdVarlikKisiDetay').classList.contains('open'));
        if(!detay&&fdVkMod==='kisiler')return{ad:'Kisiler',basliklar:['Kişi / Kurum','TC / VKN','Telefon','Adres','Tapu','Daire / İşyeri','Araç','ÇKS','Toplam'],satirlar:fdVarlikKisiGorunumu.map(k=>[k.ad,k.tcVkn,k.telefon,k.adres,k.tapular.length,k.daireler.length,k.araclar.length,k.cksler.length,vkToplam(k)])};
        const liste=detay?fdVkDetaySatirlari:fdVkVarlikGorunumu,ad=detay?fdVarlikKisiSecili.ad:'Tum_Varliklar';
        return{ad:String(ad).replace(/[^\p{L}\p{N}]+/gu,'_'),basliklar:['Kişi / Sahip','Kategori','Varlık / Kayıt','Alt Bilgi','Konum','Durum','Ayrıntılar'],satirlar:liste.map(x=>[detay?fdVarlikKisiSecili.ad:x.kisiler.map(k=>k.ad).join(' / ')||'Sahibi belirtilmemiş',x.tur,x.baslik,x.alt,x.konum,x.durum,x.detaylar.filter(Boolean).join(' · ')])};
    }

function fdVarlikKisileriniCiz(){
fdVkDogrula(false);

        const{model,kisiler,varliklar}=vkFiltreliVeri();fdVarlikKisiGorunumu=kisiler;fdVkVarlikGorunumu=varliklar;
        const varlikModu=fdVkMod==='varliklar',liste=varlikModu?varliklar:kisiler,sayfaAdet=Math.max(1,Math.ceil(liste.length/fdVkSayfaBoyutu));fdVkSayfa=Math.min(Math.max(1,fdVkSayfa),sayfaAdet);const bas=(fdVkSayfa-1)*fdVkSayfaBoyutu,parca=liste.slice(bas,bas+fdVkSayfaBoyutu);
        document.getElementById('fdVkKisiAdet').textContent=model.kisiler.length;document.getElementById('fdVkVarlikAdet').textContent=model.varliklar.length;
        for(const [id,mod] of [['fdVkTabKisiler','kisiler'],['fdVkTabVarliklar','varliklar']]){document.getElementById(id).classList.toggle('active',mod===fdVkMod);document.getElementById(id).setAttribute('aria-selected',String(mod===fdVkMod))}
        document.getElementById('fdVkBilgiAlan').hidden=varlikModu;document.getElementById('fdVkDurumAlan').hidden=!varlikModu;
        const durum=document.getElementById('fdVkDurum'),secili=durum.value,durumlar=[...new Set(model.varliklar.map(x=>x.durum).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));durum.innerHTML='<option value="">Tüm durumlar</option>'+durumlar.map(x=>'<option>'+html(x)+'</option>').join('');if(durumlar.includes(secili))durum.value=secili;
        document.getElementById('fdVarlikKisiOzet').textContent=liste.length+' '+(varlikModu?'kayıt':'kişi')+' gösteriliyor';
        document.getElementById('fdVkKisiEkle').hidden=!yazabilir();
        document.getElementById('fdVarlikKisiIstatistikler').innerHTML=[['tumu','Kişi / Kurum',model.kisiler.length,'Rehberde kayıtlı'],['tumu','Varlık / Kayıt',model.varliklar.length,'Tekil kayıt toplamı'],['tapu','Tapu / Taşınmaz',model.varliklar.filter(x=>x.kayitTuru==='tapu').length,'Tapulu varlıklar'],['daire','Daire / İşyeri',model.varliklar.filter(x=>x.kayitTuru==='daire').length,'Kira takip kayıtları'],['arac','Araç',model.varliklar.filter(x=>x.kayitTuru==='arac').length,'Araç takip kayıtları'],['cks','ÇKS',model.varliklar.filter(x=>x.kayitTuru==='cks').length,'Yıllık kayıtlar']].map(([tur,ad,sayi,alt],i)=>'<button class="fd-vk-stat" onclick="fdVkOzetSec(\''+tur+'\',\''+(i===0?'kisiler':'varliklar')+'\')"><span>'+ad+'</span><strong>'+sayi+'</strong><small>'+alt+'</small></button>').join('');
        const alan=document.getElementById('fdVarlikKisiKartlari');
        alan.innerHTML=!parca.length?'<div class="fd-vk-empty"><strong>Kayıt bulunamadı</strong><p>Aramanızı veya filtrelerinizi değiştirin.</p><button class="fd-vk-btn fd-vk-btn-soft" onclick="fdVkFiltreTemizle()">Filtreleri temizle</button></div>':varlikModu?vkTablo(parca.map((x,i)=>vkVarlikSatiri(x,bas+i)).join('')):'<table class="fd-vk-table fd-vk-people"><thead><tr><th>Kişi / Kurum</th><th>İletişim</th><th>Tapu</th><th>Mülk</th><th>Araç</th><th>ÇKS</th><th>Toplam</th><th>İşlem</th></tr></thead><tbody>'+parca.map((k,i)=>vkSahipSatiri(k,bas+i)).join('')+'</tbody></table>';
        document.getElementById('fdVkSayfaBilgi').textContent=liste.length?(bas+1)+'–'+Math.min(bas+fdVkSayfaBoyutu,liste.length)+' / '+liste.length+' kayıt':'0 kayıt';document.getElementById('fdVkSayfa').textContent=fdVkSayfa+' / '+sayfaAdet;document.getElementById('fdVkOnceki').disabled=fdVkSayfa<=1;document.getElementById('fdVkSonraki').disabled=fdVkSayfa>=sayfaAdet;
        if(fdVarlikKisiSecili){const yeni=model.kisiler.find(k=>vkKimlik(k)===vkKimlik(fdVarlikKisiSecili));if(yeni){fdVarlikKisiSecili=yeni;fdVarlikKisiDetayCiz150()}else fdVarlikKisiDetayKapat()}
    }

function fdVkKayitAc(index,detay=false){
fdVkDogrula(false);
const x=(detay?fdVkDetaySatirlari:fdVkVarlikGorunumu)[Number(index)];if(x)fdVarlikKaydiAc150(x.kayitTuru,x.id,x.bagliId)}

function fdVkGorunumSec(mod){
fdVkDogrula(false);
fdVkMod=mod==='varliklar'?'varliklar':'kisiler';fdVkSayfa=1;fdVarlikKisileriniCiz()}

function fdVkFiltreDegisti(){
fdVkDogrula(false);
fdVkSayfa=1;fdVarlikKisileriniCiz()}

function fdVkFiltreTemizle(){
fdVkDogrula(false);
for(const id of ['fdVarlikKisiAra','fdVkDurum'])document.getElementById(id).value='';for(const id of ['fdVkTur','fdVkBilgi'])document.getElementById(id).value='tumu';document.getElementById('fdVkSira').value='ad';fdVkFiltreDegisti()}

function fdVkSayfaDegistir(yon){
fdVkDogrula(false);
fdVkSayfa+=Number(yon);fdVarlikKisileriniCiz()}

function fdVkSayfaBoyutuDegistir(boyut){
fdVkDogrula(false);
fdVkSayfaBoyutu=[25,50,100].includes(Number(boyut))?Number(boyut):25;fdVkSayfa=1;fdVarlikKisileriniCiz()}

function fdVkOzetSec(tur,mod){
fdVkDogrula(false);
if(mod)fdVkMod=mod;document.getElementById('fdVkTur').value=tur;fdVkFiltreDegisti()}

async function fdVarlikKaydiAc150(tur,id,bagliId=''){
try{
fdVkDogrula(false);

        const modul={arac:'arac',daire:'kira',tapu:'tapu',cks:'cks'}[tur];
        if(!modul||!anaMenuModulErisimiVar(modul))return showToast?.('Bu kaydın modülüne erişim yetkiniz yok.','warning');
        const durum=fdVarlikKisiGorunumunuSakla();
        document.getElementById('fdVarlikKisiDetay').classList.remove('open');document.body.classList.remove('fd-vk-detail-open');
        try{
            if(tur==='arac'){await fdVkBekle(fdVarlikKisiKaynakModulunuGeciciAc(()=>openAracTakipApp()));aracDetayModaliniAc(id);fdVarlikKisiDonusunuKur('modalAracDetay',durum)}
            if(tur==='daire'){await fdVkBekle(fdVarlikKisiKaynakModulunuGeciciAc(()=>openKiraTakipApp()));kiraDaireDetayAc(id);fdVarlikKisiDonusunuKur('modalKiraDaireDetay',durum)}
            if(tur==='tapu'){await fdVkBekle(fdVarlikKisiKaynakModulunuGeciciAc(()=>openTapuTakipApp()));tapuDetayAc(id);fdVarlikKisiDonusunuKur('modalTapuDetay',durum)}
            if(tur==='cks'){await fdVkBekle(fdVarlikKisiKaynakModulunuGeciciAc(()=>openCksTakipApp()));tapuCksFormuAc(bagliId,id);fdVarlikKisiDonusunuKur('modalTapuCksKayit',durum)}
        }catch(e){
if(!fdVkGecerli())return;
console.error(e);await fdVkBekle(fdVarlikKisiGorunumuneDon(durum));showToast?.('Kayıt açılamadı: '+(e.message||e),'error')}
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

function fdVarlikKisiDetayAc150(index,filtre='tumu'){
fdVkDogrula(false);

        const k=fdVarlikKisiGorunumu[Number(index)];if(!k)return;
        fdVkDetayOdak=document.activeElement;fdVarlikKisiSecili=k;fdVarlikKisiFiltre=filtre;fdVkDetayArama='';document.getElementById('fdVkDetayAra').value='';
        fdVarlikKisiDetayCiz150();document.getElementById('fdVkDetayKapat').focus();
    }

function fdVarlikKisiDetayKapat(){
fdVkDogrula(false);
fdVarlikKisiSecili=null;fdVkDetayArama='';document.getElementById('fdVarlikKisiDetay')?.classList.remove('open');document.body.classList.remove('fd-vk-detail-open');if(fdVkDetayOdak?.isConnected)fdVkDetayOdak.focus({preventScroll:true});fdVkDetayOdak=null}

function fdVarlikKisiFiltrele150(tur){
fdVkDogrula(false);
fdVarlikKisiFiltre=tur;fdVarlikKisiDetayCiz150()}

function fdVarlikKisiDetayCiz150(){
fdVkDogrula(false);

        const k=fdVarlikKisiSecili,panel=document.getElementById('fdVarlikKisiDetay');if(!k||!panel)return;
        panel.classList.add('open');document.body.classList.add('fd-vk-detail-open');
        document.getElementById('fdVarlikKisiDetayBaslik').textContent=k.ad;
        document.getElementById('fdVarlikKisiDetayBilgi').textContent=vkToplam(k)+' bağlı kayıt · '+(k.id?'Kişi kartı kayıtlı':'Kaynak kayıtlardan derlendi');
        document.getElementById('fdVkIletisim').innerHTML=[['TC / Vergi No',k.tcVkn],['Telefon',k.telefon],['Adres',k.adres],['Not',k.not]].map(([ad,deger])=>'<div'+(['Adres','Not'].includes(ad)?' class="fd-vk-wide"':'')+'><span>'+ad+'</span>'+((String(deger||'').length>180)?'<details><summary>'+html(String(deger).slice(0,140))+'…</summary><p>'+html(deger)+'</p></details>':'<p>'+html(deger||'Girilmemiş')+'</p>')+'</div>').join('');
        document.getElementById('fdVkDetayDuzenle').hidden=!yazabilir();
        const gruplar=[['tumu','Tümü',vkToplam(k)],['tapu','Tapu',k.tapular.length],['daire','Daire / İşyeri',k.daireler.length],['arac','Araç',k.araclar.length],['cks','ÇKS',k.cksler.length]];
        const altGruplar=tapuTurOzetleri(k).map(([ad,sayi])=>[tapuFiltreId(ad),ad,sayi]);
        if(![...gruplar,...altGruplar].some(g=>g[0]===fdVarlikKisiFiltre))fdVarlikKisiFiltre='tumu';
        document.getElementById('fdVarlikKisiFiltreler').innerHTML=gruplar.filter((g,i)=>i===0||g[2]).concat(fdVarlikKisiFiltre==='tapu'||fdVarlikKisiFiltre.startsWith('tapu_')?altGruplar:[]).map(([id,ad,sayi])=>'<button class="fd-vk-filter '+(fdVarlikKisiFiltre===id?'active':'')+'" onclick="fdVarlikKisiFiltrele150(\''+html(id)+'\')">'+html(ad)+' <span>'+sayi+'</span></button>').join('');
        const q=adAnahtari(fdVkDetayArama);fdVkDetaySatirlari=kisiVarlikSatirlari(k,fdVarlikKisiFiltre).filter(x=>vkEslesir([x.tur,x.baslik,x.alt,x.konum,x.durum,...x.detaylar].join(' '),q));
        document.getElementById('fdVkDetayOzet').textContent=fdVkDetaySatirlari.length+' kayıt';
        document.getElementById('fdVarlikKisiVarliklar').innerHTML=fdVkDetaySatirlari.length?vkTablo(fdVkDetaySatirlari.map((x,i)=>vkVarlikSatiri(x,i,true)).join(''),true):'<div class="fd-vk-empty">Bu filtreye uygun varlık kaydı bulunmuyor.</div>';
    }

function fdVkDetayAraDegisti(q){
fdVkDogrula(false);
fdVkDetayArama=q;fdVarlikKisiDetayCiz150()}

function fdVarlikKisiExcelAl(){
fdVkDogrula(false);
if(typeof XLSX==='undefined')return alert('Excel bileşeni yüklenemedi.');const r=fdVarlikKisiRaporu();if(!r.satirlar.length)return showToast?.('Çıktı alınacak kayıt bulunmuyor.','warning');const ws=XLSX.utils.aoa_to_sheet([r.basliklar,...r.satirlar]),wb=XLSX.utils.book_new();ws['!cols']=r.basliklar.map((h,i)=>({wch:Math.min(55,Math.max(h.length+2,...r.satirlar.slice(0,100).map(s=>Math.min(55,String(s[i]??'').length+2))))}));ws['!autofilter']={ref:ws['!ref']};XLSX.utils.book_append_sheet(wb,ws,'Kişiler ve Varlıklar');XLSX.writeFile(wb,r.ad+'_Listesi.xlsx')}

function fdVarlikKisiPdfAl(){
fdVkDogrula(false);
const r=fdVarlikKisiRaporu();if(!r.satirlar.length)return showToast?.('Çıktı alınacak kayıt bulunmuyor.','warning');const alan=document.createElement('div');alan.innerHTML='<table><thead><tr>'+r.basliklar.map(h=>'<th>'+html(h)+'</th>').join('')+'</tr></thead><tbody>'+r.satirlar.map(s=>'<tr>'+s.map(v=>'<td>'+html(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';return window.fdTabloPdfOnizle?.(alan.querySelector('table'),'KİŞİLER VE VARLIKLAR',r.ad+'_Listesi.pdf',{yon:'landscape',format:'a3',altBaslik:r.ad.replace(/_/g,' ')+' · '+r.satirlar.length+' kayıt'})}

function fdVarlikKisiFormuAc(index=''){
fdVkDogrula(true);

        if(!yazabilir())return showToast?.('Kişi kartı düzenleme yetkiniz yok.','warning');
        const k=index==='secili'?fdVarlikKisiSecili:index===''?null:fdVarlikKisiGorunumu[Number(index)];
        fdVkDuzenleme=k?{...k,sirketId:String(aktifSirketId())}:{sirketId:String(aktifSirketId())};
        document.querySelector('#fdVarlikKisiModal form').reset();document.getElementById('fdVarlikKisiId').value=k?.id||'';
        for(const[id,alan]of [['fdVarlikKisiAd','ad'],['fdVarlikKisiNo','tcVkn'],['fdVarlikKisiTelefon','telefon'],['fdVarlikKisiAdres','adres'],['fdVarlikKisiNot','not']])document.getElementById(id).value=k?.[alan]||'';
        document.getElementById('fdVarlikKisiModalBaslik').textContent=k?'Kişi Kartını Düzenle':'Yeni Kişi';document.getElementById('fdVarlikKisiModal').style.display='flex';
    }

async function fdVarlikKisiKaydet(event){
try{
fdVkDogrula(true);

        event.preventDefault();if(fdVkKaydediliyor)return;if(!yazabilir())return showToast?.('Kayıt yetkiniz yok.','warning');
        const sirket=String(aktifSirketId());if(!sirket||fdVkDuzenleme?.sirketId!==sirket)return alert('Şirket oturumu değişti. Kişi kartını yeniden açın.');
        const id=document.getElementById('fdVarlikKisiId').value||kisiId(),eski=fdVkData.fdVarlikKisiKayitlari.find(x=>String(x.id)===String(id)),baglam=eski||fdVkDuzenleme,ad=kanonikAd(document.getElementById('fdVarlikKisiAd').value),no=document.getElementById('fdVarlikKisiNo').value.trim(),telefon=document.getElementById('fdVarlikKisiTelefon').value.trim();
        if(!ad)return alert('Ad / unvan yazın.');
        if(fdVkData.fdVarlikKisiKayitlari.some(x=>String(x.id)!==String(id)&&adAnahtari(x.ad)===adAnahtari(ad)))return alert('Bu adla bir kişi kartı zaten var. Mevcut kartı düzenleyin.');
        if(no&&!/^\d{10,11}$/.test(no))return alert('TC / Vergi No 10 veya 11 rakam olmalı.');
        if(telefon&&!/^\+?[\d\s().-]{10,25}$/.test(telefon))return alert('Telefon numarasını kontrol edin.');
        document.getElementById('fdVarlikKisiId').value=id;
        const btn=event.submitter||event.target.querySelector('button[type="submit"]');fdVkKaydediliyor=true;if(btn){btn.disabled=true;btn.textContent='Kaydediliyor…'}
        try{
            const kart={...(eski||{}),id,ad,tcVkn:no,telefon,adres:document.getElementById('fdVarlikKisiAdres').value.trim(),not:document.getElementById('fdVarlikKisiNot').value.trim(),kiraSahipId:baglam?.kiraSahipId||'',aliases:[...new Set([...(baglam?.aliases||[]),baglam?.ad].filter(Boolean))]};
            kart.kiraSahipId=await fdVkBekle(kiraSahibiniEsitle(kart,baglam));
            if(String(aktifSirketId())!==sirket)throw new Error('Şirket değişti; işlem tamamlanamadı.');
            await fdVkBekle(kaydiYaz(kart));fdVkData.fdVkModelCache=null;
            if(fdVarlikKisiSecili&&vkKimlik(fdVarlikKisiSecili)===vkKimlik(baglam))fdVarlikKisiSecili=vkModel().kisiler.find(k=>k.id===id)||null;
            modalKapat('fdVarlikKisiModal');fdVarlikKisiListesiniGuncelle150();fdVarlikKisileriniCiz();showToast?.('Kişi kartı kaydedildi.');
        }catch(e){
if(!fdVkGecerli())return;
alert('Kişi kartı kaydedilemedi: '+(e.message||e))}
        finally{
if(fdVkGecerli()){
fdVkKaydediliyor=false;if(btn){btn.disabled=false;btn.textContent='Kaydet'}
}
}
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function fdVarlikKisiYenile(){
try{
fdVkDogrula(false);
await fdVkBekle(openVarlikKisileriApp(true))
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}

async function openVarlikKisileriApp(zorla=false){
try{
fdVkDogrula(false);

        if(!anaMenuModulErisimiVar('varlikkisileri'))return;
        if(fdVkYukleme)return fdVkYukleme;
        const sirket=String(aktifSirketId());appKur();fdTumUygulamaAlanlariniGizle();document.getElementById('varlikKisileriApp').style.display='block';anaMenuDonusButonunuGoster?.();
        fdVkYukleme=(async()=>{
            showGlobalOverlay?.('Kişiler ve Varlıklar','Kayıtlar hazırlanıyor…');
            const isler=[['kişi kartı',()=>profilleriYukle(zorla)],['mülk',()=>typeof supabaseVerileriniYukle==='function'?supabaseVerileriniYukle('kira','',{onbellekKullan:!zorla}):null],['araç',()=>typeof supabaseVerileriniYukle==='function'?supabaseVerileriniYukle('arac','',{onbellekKullan:!zorla}):null],['tapu / ÇKS',()=>typeof tapuVerileriniYukle==='function'?tapuVerileriniYukle(zorla):null]];
            try{
                const sonuclar=await fdVkBekle(Promise.allSettled(isler.map(([,fn])=>fn())));
                if(String(aktifSirketId())!==sirket)return;
                fdVarlikKisiListesiniGuncelle150();fdVarlikKisileriniCiz();
                const hatalar=sonuclar.map((x,i)=>x.status==='rejected'?isler[i][0]:null).filter(Boolean);
                if(hatalar.length)showToast?.('Yenilenemeyen kaynaklar: '+hatalar.join(', ')+'. Mevcut kayıtlar gösteriliyor.','warning');else if(zorla)showToast?.('Kişi ve varlık kayıtları yenilendi.');
            }finally{
if(fdVkGecerli()){
hideGlobalOverlay?.()
}
}
        })();try{return await fdVkBekle(fdVkYukleme)}finally{
if(fdVkGecerli()){
fdVkYukleme=null
}
}
    
}catch(fdScopeError){if(!fdVkGecerli())return;throw fdScopeError;}
}
return {open:openVarlikKisileriApp,init:fdVkBaslat,api:{fdVarlikKisileriniCiz,fdVkKayitAc,fdVkGorunumSec,fdVkFiltreDegisti,fdVkFiltreTemizle,fdVkSayfaDegistir,fdVkSayfaBoyutuDegistir,fdVkOzetSec,fdVarlikKaydiAc150,fdVarlikKisiDetayAc150,fdVarlikKisiDetayKapat,fdVarlikKisiFiltrele150,fdVarlikKisiDetayCiz150,fdVkDetayAraDegisti,fdVarlikKisiExcelAl,fdVarlikKisiPdfAl,fdVarlikKisiFormuAc,fdVarlikKisiKaydet,fdVarlikKisiYenile},dispose(){fdVkDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="varlikkisileri"):null;if(tab)tab.alanId="";if(fdVarlikKisiDonusDugmesi&&fdVarlikKisiDonusIsleyicisi)fdVarlikKisiDonusDugmesi.removeEventListener("click",fdVarlikKisiDonusIsleyicisi);fdVarlikKisiDonusDugmesi=null;fdVarlikKisiDonusIsleyicisi=null;for(const timer of fdVkTimers)window.clearTimeout(timer);fdVkTimers.clear();document.body.classList.remove("fd-vk-detail-open");document.querySelector("#fdVarlikKisiModal form")?.reset();fdVarlikKisiSecili=null;fdVkDuzenleme=null;fdVarlikKisiGorunumu=[];fdVkVarlikGorunumu=[];fdVkDetaySatirlari=[];fdVkDetayOdak=null;fdVkData.dispose();if(fdVkOverlay)hideGlobalOverlay();}};
});

window.FDModules.define('hareketaktar',function(){
 const host=window,jobs=new Set();let disposed=false;
 async function execute(request){
  if(disposed||!request?.current()){if(request?.throwError)throw Error('Giriş–çıkış aktarımı bağlamı değişti.');return null;}
  jobs.add(request);let overlay=null,vardiyaKayitlari=request.records;
  const alive=()=>!disposed&&request.current(),check=()=>{if(!alive())throw Error('Giriş–çıkış aktarımı ekranı veya oturumu değişti.');};
  const native={show:host.showGlobalOverlay,hide:host.hideGlobalOverlay,save:host.supabaseVerileriKaydet,render:host.magicpassArayuzunuHazirla,status:host.magicpassDosyaDurumuYaz,toast:host.showToast};
  const hide=()=>{if(overlay&&overlay.node===host.document.getElementById('globalOverlay')&&overlay.title===host.document.getElementById('overlayTitle')?.textContent&&overlay.sub===host.document.getElementById('overlaySub')?.textContent)native.hide();overlay=null;};request.onCancel=hide;
  const personeller=request.people,magicpassKayitlari=tip=>{check();return host.magicpassKayitlari(tip);};
  const showGlobalOverlay=(...a)=>{check();native.show(...a);overlay={node:host.document.getElementById('globalOverlay'),title:host.document.getElementById('overlayTitle')?.textContent,sub:host.document.getElementById('overlaySub')?.textContent};},hideGlobalOverlay=hide;
  const magicpassDosyaDurumuYaz=(...a)=>{if(alive())return native.status(...a);},showToast=(...a)=>{if(alive())return native.toast(...a);},magicpassArayuzunuHazirla=(...a)=>{check();return native.render(...a);};
  const yuklenenVeriler={add(...a){check();return host.fdHareketAktarYuklendi(...a);}};
  const supabaseVerileriKaydet=async()=>{check();const before=host.fdHareketAktarKayitlari(),submitted=vardiyaKayitlari;host.fdHareketAktarKayitlari(submitted);request.adopt(submitted);try{const result=await native.save();check();return result;}catch(error){if(alive()&&host.fdHareketAktarKayitlari()===submitted){host.fdHareketAktarKayitlari(before);request.adopt(before);}throw error;}};
function magicpassMetinTarihiniCoz(metin) {
        const satir=String(metin||''),tarihEs=satir.match(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})/);if(!tarihEs)return null;
        const kalan=satir.slice((tarihEs.index||0)+tarihEs[0].length),saatEs=kalan.match(/(?:^|[\s;,T|])(\d{1,2}:\d{2}(?::\d{2})?)/);if(!saatEs)return null;
        const parca=tarihEs[1].split(/[-\/.]/).map(Number),yilIlk=parca[0]>1900,yil=yilIlk?parca[0]:parca[2],ay=parca[1],gun=yilIlk?parca[2]:parca[0],saat=saatEs[1].split(':').map(Number);
        const tarih=new Date(yil,ay-1,gun,saat[0],saat[1],saat[2]||0);if(tarih.getFullYear()!==yil||tarih.getMonth()!==ay-1||tarih.getDate()!==gun)return null;return tarih;
    }
function magicpassSatirdanCihazNoBul(satir, cihazHaritasi) {
        const ham=String(satir||'');
        const magicpassEs=ham.match(/^\s*\d+\s*,\s*(\d{1,15})\s*,\s*\d+\s+(?:\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})\s+\d{1,2}:\d{2}(?::\d{2})?/);
        if(magicpassEs){const personelKodu=magicpassCihazNoAnahtari(magicpassEs[1]);return cihazHaritasi.has(personelKodu)?{cihazNo:personelKodu,durum:'tam'}:{cihazNo:'',durum:'eslesmeyen'};}
        const tarihEs=ham.match(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})/),kodlariBul=metin=>[...new Set((String(metin||'').match(/\b\d{1,15}\b/g)||[]).map(magicpassCihazNoAnahtari).filter(k=>cihazHaritasi.has(k)))];
        if(tarihEs&&Number(tarihEs.index)>0){const once=kodlariBul(ham.slice(0,tarihEs.index));if(once.length===1)return{cihazNo:once[0],durum:'tam'};if(once.length>1)return{cihazNo:'',durum:'belirsiz'};}
        const temiz=ham.replace(/(?:\d{1,3}\.){3}\d{1,3}/g,' ').replace(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})/g,' ').replace(/(?:^|[\s;,T|])\d{1,2}:\d{2}(?::\d{2})?/g,' '),adaylar=kodlariBul(temiz);
        return adaylar.length===1?{cihazNo:adaylar[0],durum:'tam'}:{cihazNo:'',durum:adaylar.length?'belirsiz':'eslesmeyen'};
    }
async function magicpassDosyasiniIsle(dosya, sessiz, hataFirlat=false, bildirimGoster=true) {
        if(!dosya)return;if(!sessiz)showGlobalOverlay('MagicPass TXT okunuyor','Hareketler personel koduna gore dogrulaniyor...');const oncekiVardiyaKayitlari=vardiyaKayitlari;
        try{
            const tampon=await dosya.arrayBuffer();let metin=new TextDecoder('utf-8').decode(tampon);if((metin.match(/\uFFFD/g)||[]).length>2){try{metin=new TextDecoder('windows-1254').decode(tampon)}catch(e){}}
            const cihazHaritasi=new Map(),cakisanKodlar=new Map();personeller.filter(p=>aktifSirketeAit(p)&&String(p.cihazPersonelNo||'').trim()).forEach(p=>{const kod=magicpassCihazNoAnahtari(p.cihazPersonelNo),onceki=cihazHaritasi.get(kod);if(onceki&&String(onceki.id)!==String(p.id)){cakisanKodlar.set(kod,[onceki,p]);return}cihazHaritasi.set(kod,p)});
            if(cakisanKodlar.size){const ozet=[...cakisanKodlar.entries()].slice(0,5).map(([kod,ps])=>kod+': '+ps.map(p=>p.ad).join(' / ')).join(', ');throw new Error('Ayni cihaz personel numarasi birden fazla personele tanimli: '+ozet)}
            const hazirlanan=[],dosyaIdleri=new Set();let eslesmeyen=0,belirsiz=0,hatali=0,tekrar=0;metin.split(/\r?\n/).forEach((satir,index)=>{const tarih=magicpassMetinTarihiniCoz(satir);if(!tarih){if(satir.trim())hatali++;return}const eslesme=magicpassSatirdanCihazNoBul(satir,cihazHaritasi);if(!eslesme.cihazNo){if(eslesme.durum==='belirsiz')belirsiz++;else eslesmeyen++;return}const personel=cihazHaritasi.get(eslesme.cihazNo),damga=magicpassTarihAnahtari(tarih)+'T'+String(tarih.getHours()).padStart(2,'0')+':'+String(tarih.getMinutes()).padStart(2,'0')+':'+String(tarih.getSeconds()).padStart(2,'0'),id=('magic_'+aktifSirketId()+'_'+eslesme.cihazNo+'_'+damga).replace(/[^a-zA-Z0-9_-]/g,'');if(dosyaIdleri.has(id)){tekrar++;return}dosyaIdleri.add(id);hazirlanan.push({id,kayitTipi:'magicpassHareket',sirketId:aktifSirketId(),pId:String(personel.id),cihazNo:String(eslesme.cihazNo),zamanDamgasi:damga,kaynakDosya:dosya.name,kaynakSatir:index+1,eslemeYontemi:'dogrulanmis-cihaz-kodu'})});
            if(!hazirlanan.length)throw new Error('Dogrulanmis personel kodu ve tarih-saat iceren hareket bulunamadi. Belirsiz: '+belirsiz+', eslesmeyen: '+eslesmeyen);
            const damgalar=hazirlanan.map(k=>k.zamanDamgasi).sort(),ilk=damgalar[0],son=damgalar.at(-1),dosyaAdi=String(dosya.name||''),yenilenecek=magicpassKayitlari('magicpassHareket').filter(k=>String(k.kaynakDosya||'')===dosyaAdi&&String(k.zamanDamgasi||'')>=ilk&&String(k.zamanDamgasi||'')<=son),yenilenecekIdler=new Set(yenilenecek.map(k=>String(k.id))),korunan=vardiyaKayitlari.filter(k=>!yenilenecekIdler.has(String(k.id))),mevcutIdler=new Set(korunan.filter(k=>k.kayitTipi==='magicpassHareket'&&aktifSirketeAit(k)).map(k=>String(k.id))),eklenecek=[];hazirlanan.forEach(k=>{if(mevcutIdler.has(k.id)){tekrar++;return}mevcutIdler.add(k.id);eklenecek.push(k)});
            vardiyaKayitlari=[...korunan,...eklenecek];yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassArayuzunuHazirla();const sonuc=eklenecek.length+' hareket islendi ? '+yenilenecek.length+' eski kayit yenilendi ? '+tekrar+' tekrar ? '+eslesmeyen+' eslesmeyen ? '+belirsiz+' belirsiz';magicpassDosyaDurumuYaz(dosya.name+' ? '+sonuc+' ? '+new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}),eklenecek.length?'#047857':'#64748b');if(bildirimGoster&&(!sessiz||eklenecek.length||yenilenecek.length))showToast(eklenecek.length+' hareket dogru personel koduyla kaydedildi.\n'+yenilenecek.length+' eski dosya kaydi yenilendi.\n'+tekrar+' tekrar atlandi.\n'+eslesmeyen+' satir eslesmedi.\n'+belirsiz+' satir belirsiz oldugu icin kaydedilmedi.\n'+hatali+' satirda tarih-saat okunamadi.',belirsiz||eslesmeyen?'warning':'success');return{kaydedilen:eklenecek.length,yenilenen:yenilenecek.length,tekrar,eslesmeyen,belirsiz,hatali,ilk,son,dosyaAdi};
        }catch(error){vardiyaKayitlari=oncekiVardiyaKayitlari;magicpassDosyaDurumuYaz('Dosya okunamadi: '+(error.message||error),'#b91c1c');if(bildirimGoster&&!sessiz)showToast('MagicPass TXT aktarilamadi: '+(error.message||error),'error');if(hataFirlat)throw error;return null}finally{if(!sessiz)hideGlobalOverlay()}
    }
  const file={name:request.file.name,arrayBuffer:async()=>{check();const bytes=await request.file.arrayBuffer();check();return bytes;}};
  try{return await magicpassDosyasiniIsle(file,request.silent,request.throwError,request.notify);}finally{hide();jobs.delete(request);}
 }
 return{open:execute,dispose(){disposed=true;for(const r of jobs)r.cancel();jobs.clear();}};
});

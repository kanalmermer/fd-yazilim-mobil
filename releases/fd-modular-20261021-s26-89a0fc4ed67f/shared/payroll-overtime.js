// Shared overtime projection. Only the explicit transfer saves selected payroll rows.
function fdMesaiMahsupYontemi(donem,ayarlar=uygulamaAyarlari){
 const kurallar=Array.isArray(ayarlar?.mesaiMahsupDonemleri)?ayarlar.mesaiMahsupDonemleri:[];
 return kurallar.filter(k=>/^\d{4}-(0[1-9]|1[0-2])$/.test(String(k?.from||''))&&String(k.from)<=String(donem)&&['hafta-ici-once','orantili','yalniz-hafta-ici'].includes(k.yontem)).sort((a,b)=>String(b.from).localeCompare(String(a.from)))[0]?.yontem||'hafta-ici-once';
}
function fdMesaiDakikaMahsupDagilimi(brut,eksik,yontem='hafta-ici-once'){
 const sayi=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0,net={normal:sayi(brut.normal),pazar:sayi(brut.pazar),resmi:sayi(brut.resmi)},toplam=net.normal+net.pazar+net.resmi;let kalan=sayi(eksik);
 if(yontem==='orantili'&&toplam>0){const oran=Math.max(0,toplam-kalan)/toplam;for(const k of ['normal','pazar','resmi'])net[k]*=oran;kalan=Math.max(0,kalan-toplam);}
 else for(const k of yontem==='yalniz-hafta-ici'?['normal']:['normal','pazar','resmi']){const dusulen=Math.min(net[k],kalan);net[k]-=dusulen;kalan-=dusulen;}
 const netToplam=Math.round((net.normal+net.pazar+net.resmi)*1e8)/1e8;
 return{...net,toplam:netToplam,mahsup:Math.min(sayi(eksik),Math.max(0,toplam-netToplam)),kalanEksik:kalan};
}
function fdMesaiKurallariAyniMi(a,b){const duzelt=v=>Array.isArray(v)?v.map(duzelt):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,duzelt(v[k])])):v;return JSON.stringify(duzelt(a))===JSON.stringify(duzelt(b));}
function fdMesaiYuvarlanmisSaatDagilimi(net,hedefDakika){
 const keys=['normal','pazar','resmi'],dakika=keys.map(k=>Math.max(0,Number(net[k])||0)),toplam=dakika.reduce((a,b)=>a+b,0),hedef=Math.max(0,Number(hedefDakika)||0),ilk=dakika.findIndex(n=>n>0);
 if(ilk<0)return{fazlaMesaiSaati:0,pazarMesaiSaati:0,resmiTatilMesaiSaati:0};
 // Round only the monthly sum. Keep Sunday-only work out of the weekday bucket.
 dakika[ilk]+=Math.max(0,hedef-toplam);
 const yuzdelik=dakika.map(n=>n*100/60),birimler=yuzdelik.map(n=>Math.floor(n+1e-9)),sirali=keys.map((_,i)=>i).sort((a,b)=>(yuzdelik[b]-birimler[b])-(yuzdelik[a]-birimler[a])||a-b);
 let fark=Math.round(hedef*100/60)-birimler.reduce((a,b)=>a+b,0);for(let i=0;fark>0;i++,fark--)birimler[sirali[i%3]]++;
 return{fazlaMesaiSaati:birimler[0]/100,pazarMesaiSaati:birimler[1]/100,resmiTatilMesaiSaati:birimler[2]/100};
}
function fdPuantajMesaiAlanlari(personel,ay,yil,secenek={}){
 const donem=puantajAyAnahtari(ay,yil),hesapla=()=>{
  const ozet=secenek.ozet||maasOzetKaydiBul(personel.id,ay,yil)||{},birlesik=magicpassBirlesikMesaiDonemiMi(personel,ay,yil);let otomatik;
  if(birlesik){const liste=secenek.liste||magicpassAylikCizelgeVerisi(personel,donem),hesap=secenek.hesap||magicpassAylikPuantajMesaiHesabi(liste,donem),net=fdMesaiDakikaMahsupDagilimi(hesap,hesap.eksik,fdMesaiMahsupYontemi(donem));otomatik=fdMesaiYuvarlanmisSaatDagilimi(net,hesap.puantaj);}
  else{const gunluk=secenek.gunlukCalismaSaati??ayarSayisi('gunlukCalismaSaati',7.5);otomatik={fazlaMesaiSaati:magicpassAylikMesaiSaati(personel,ay,yil),pazarMesaiSaati:Number(secenek.pazarCalisma||0)*gunluk,resmiTatilMesaiSaati:Number(secenek.resmiTatilCalisma||0)*gunluk+magicpassAylikYarimResmiTatilMesaiSaati(personel,ay,yil)};}
  const sonuc={...otomatik};for(const alan of Object.keys(otomatik))if(String(ozet[alan+'Manuel'])==='true')sonuc[alan]=Number(ozet[alan]||0);
  return{...sonuc,otomatik,birlesik,yontem:fdMesaiMahsupYontemi(donem)};
 };
 return typeof fdHesapDonemindeCalistir==='function'?fdHesapDonemindeCalistir(donem,hesapla):hesapla();
}
const fdMesaiAktarimKilitleri=new Set();
async function fdMesaiAktariminiKaydet(planlar,isCurrent){
 const kimlik=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]),sirket=String(activeUser?.sirketId||''),kopya=x=>JSON.parse(JSON.stringify(x));
 const kontrol=()=>{if(!isCurrent()||kimlik!==JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])||!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))throw Error('Oturum veya dönem değişti; aktarım durduruldu.');};
 kontrol();if(!SUPABASE_MODE||!supabaseClient)throw Error('Puantaj aktarımı için doğrulanabilir sunucu bağlantısı gerekli.');
 const kilit=kimlik+'|'+String(planlar[0]?.sonra?.tarih||'');if(fdMesaiAktarimKilitleri.has(kilit))throw Error('Bu dönemin mesai aktarımı sürüyor. Tamamlanmasını bekleyin.');fdMesaiAktarimKilitleri.add(kilit);
 const plan=planlar.map(p=>({...kopya(p),id:supabaseKayitAnahtari('puantaj',p.sonra,0)}));let onaylanan=0;
 supabaseKaydetmeBekleyen++;
 const islem=supabaseKaydetmeKuyrugu.catch(()=>{}).then(async()=>{
  const oku=async ids=>{kontrol();const {data,error}=await zamanAsimliBekle(supabaseClient.from('portal_records').select('company_id,module,legacy_id,data').eq('company_id',sirket).eq('module','puantaj').in('legacy_id',ids),15000,'Puantaj aktarım sonucu doğrulanamadı. Aynı kaydı yeniden oluşturmadan listeyi yenileyin.');kontrol();if(error)throw error;if(!Array.isArray(data))throw Error('Puantaj yanıtı doğrulanamadı.');const m=new Map();for(const r of data){if(String(r.company_id)!==sirket||r.module!=='puantaj'||!ids.includes(String(r.legacy_id))||m.has(String(r.legacy_id))||String(r.data?.sirketId)!==sirket)throw Error('Puantaj kayıt kapsamı doğrulanamadı.');m.set(String(r.legacy_id),r)}return m;};
  // Pre-read is a stale-baseline check, NOT a new server-atomic CAS guarantee.
  for(let bas=0;bas<plan.length;bas+=100){
   kontrol();const grup=plan.slice(bas,bas+100),ids=grup.map(p=>p.id),mevcut=await oku(ids),gonder=[];
   for(const p of grup){const kayit=mevcut.get(p.id)?.data||null;if(!fdMesaiKurallariAyniMi(kayit,p.sonra)&&!fdMesaiKurallariAyniMi(kayit,p.once))throw Error('Puantaj başka bir oturumda değişmiş. Güncel puantajı yükleyip yeniden aktarın.');const yerel=puantajVerileri.find((k,i)=>supabaseKayitAnahtari('puantaj',k,i)===p.id)||null;if(!fdMesaiKurallariAyniMi(yerel,p.once))throw Error('Aktarım hazırlanırken puantaj değişti. Güncel listeyi kontrol edin.');if(!fdMesaiKurallariAyniMi(kayit,p.sonra))gonder.push({company_id:sirket,module:'puantaj',legacy_id:p.id,record_year:supabaseKayitYili('puantaj',p.sonra),employee_legacy_id:supabasePersonelKimligi(p.sonra,'puantaj')||null,data:p.sonra});}
   if(gonder.length){kontrol();const {error}=await zamanAsimliBekle(supabaseClient.from('portal_records').upsert(gonder,{onConflict:'company_id,module,legacy_id'}).select('company_id,module,legacy_id,data'),15000,'Puantaj aktarım yanıtı alınamadı. Listeyi yenileyip sonucu kontrol edin.');kontrol();if(error)throw error;}
   const dogrulanan=await oku(ids);for(const p of grup)if(!fdMesaiKurallariAyniMi(dogrulanan.get(p.id)?.data,p.sonra))throw Error('Aktarılan mesai türleri sunucuda doğrulanamadı; listeyi yenileyin.');
   const snapshot=JSON.parse(veriSonKayitGoruntuleri.get('puantaj')||'[]'),onay=new Map(snapshot.map((k,i)=>[supabaseKayitAnahtari('puantaj',k,i),k]));
   for(const p of grup){const i=puantajVerileri.findIndex((k,index)=>supabaseKayitAnahtari('puantaj',k,index)===p.id),yerel=i<0?null:puantajVerileri[i];if(fdMesaiKurallariAyniMi(yerel,p.once)){if(i<0)puantajVerileri.push(kopya(p.sonra));else puantajVerileri[i]=kopya(p.sonra);}onay.set(p.id,kopya(p.sonra));onaylanan++;}
   veriSonKayitGoruntuleri.set('puantaj',JSON.stringify([...onay.values()]));veriOnbelleginiKaydet();
  }
  return onaylanan;
 }).catch(error=>{error.fdMesaiOnaylanan=onaylanan;throw error}).finally(()=>{supabaseKaydetmeBekleyen=Math.max(0,supabaseKaydetmeBekleyen-1);fdMesaiAktarimKilitleri.delete(kilit)});
 supabaseKaydetmeKuyrugu=islem;return islem;
}

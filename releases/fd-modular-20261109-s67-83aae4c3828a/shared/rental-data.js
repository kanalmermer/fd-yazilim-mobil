// Eager rental projections plus existing shared single-record transport. No UI state.
function fdRentalDataContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||''])}
const kiraTipi=tip=>kiraKayitlari.filter(k=>k.tip===tip&&aktifSirketeAit(k));

const kiraYeniId=tip=>`${tip}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

const kiraSahipler=()=>kiraTipi('sahip');

const kiraDaireler=()=>kiraTipi('daire');

const kiraSozlesmeler=()=>kiraTipi('sozlesme');

const kiraOdemeler=()=>{const tekil=new Map();kiraTipi('odeme').forEach(o=>{const anahtar=(o?.daireId?'d:'+String(o.daireId):'s:'+String(o?.sozlesmeId||''))+'|'+String(o?.ay||''),onceki=tekil.get(anahtar);if(!onceki||String(o?.id||'').localeCompare(String(onceki?.id||''),undefined,{numeric:true})<0)tekil.set(anahtar,o);});return [...tekil.values()];};

const kiraMasraflar=()=>kiraTipi('masraf');

const kiraPoliceler=()=>kiraTipi('police');

function kiraKaydiBul(id){return kiraKayitlari.find(k=>String(k.id)===String(id));}

function kiraSahipAdi(id){return kiraKaydiBul(id)?.ad||'Sahip bulunamadı';}

function kiraDaireAdi(id){return kiraKaydiBul(id)?.kisaAd||'Daire bulunamadı';}

function kiraDaireSahipleri(d){return (d?.sahipIds||[]).map(kiraSahipAdi).join(', ')||'-';}

function kiraAktifSozlesme(daireId){const bugun=new Date().toISOString().slice(0,10);return kiraSozlesmeler().find(s=>{if(String(s.daireId)!==String(daireId)||s.aktif===false)return false;const bas=String(s.baslangic||'').slice(0,10),bitis=[s.bitis,s.gercekBitis].map(x=>String(x||'').slice(0,10)).filter(Boolean).sort()[0]||'';return(!bas||bas<=bugun)&&(!bitis||bitis>=bugun);});}

function kiraAyEkle(ay,adet){const [y,m]=String(ay).split('-').map(Number),d=new Date(y,m-1+adet,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}

function kiraAylarArasi(bas,bit){let ay=String(bas||'').slice(0,7),son=String(bit||'').slice(0,7),liste=[];for(let i=0;ay&&son&&ay<=son&&i<240;i++,ay=kiraAyEkle(ay,1))liste.push(ay);return liste;}

function kiraAyAdi(ay){const [y,m]=String(ay).split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR');}

function kiraMasrafAyTutari(m,ay){const aylar=Array.from({length:Number(m.aySayisi||1)},(_,i)=>kiraAyEkle(m.baslangicAy,i));return aylar.includes(ay)?Number(m.tutar||0)/Math.max(1,aylar.length):0;}

function kiraTarihGunNumarasi(tarih){const [y,m,d]=String(tarih||'').slice(0,10).split('-').map(Number);return y&&m&&d?Math.floor(Date.UTC(y,m-1,d)/86400000):NaN;}

function kiraPoliceAylikDagilimOlustur(baslangic,bitis,tutar){
        const basGun=kiraTarihGunNumarasi(baslangic),bitGun=kiraTarihGunNumarasi(bitis),toplam=Number(tutar||0);if(!Number.isFinite(basGun)||!Number.isFinite(bitGun)||bitGun<=basGun||!(toplam>0))return [];
        const toplamGun=bitGun-basGun,aylar=kiraAylarArasi(baslangic,bitis).map(ay=>{const ayBas=kiraTarihGunNumarasi(ay+'-01'),ayBit=kiraTarihGunNumarasi(kiraAyEkle(ay,1)+'-01'),gun=Math.max(0,Math.min(bitGun,ayBit)-Math.max(basGun,ayBas));return {ay,gun};}).filter(x=>x.gun>0);let dagitilan=0;
        return aylar.map((x,index)=>{const pay=index===aylar.length-1?Number((toplam-dagitilan).toFixed(2)):Number((toplam*x.gun/toplamGun).toFixed(2));dagitilan=Number((dagitilan+pay).toFixed(2));return {ay:x.ay,tutar:pay,gun:x.gun};});
    }

function kiraPoliceAyTutari(p,ay){return Number(kiraPoliceAylikDagilimOlustur(p?.baslangic,p?.bitis,p?.tutar).find(x=>String(x.ay)===String(ay))?.tutar||0);}

function kiraPoliceYilaAitMi(p,yil){const yilBas=String(yil)+'-01-01',sonrakiYil=String(Number(yil)+1)+'-01-01';return String(p?.baslangic||'9999-12-31')<sonrakiYil&&String(p?.bitis||'0000-01-01')>yilBas;}

function kiraDocxKirmiziGruplari(paragraf){
        const W='http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main',runs=[...paragraf.getElementsByTagNameNS(W,'r')],gruplar=[];let aktif=null;
        runs.forEach(r=>{const renk=r.getElementsByTagNameNS(W,'color')[0],val=renk?.getAttributeNS(W,'val')||renk?.getAttribute('w:val')||renk?.getAttribute('val'),kirmizi=String(val||'').toUpperCase()==='FF0000';if(kirmizi){if(!aktif){aktif=[];gruplar.push(aktif);}aktif.push(...r.getElementsByTagNameNS(W,'t'));}else aktif=null;});return gruplar;
    }

const kiraAbonelikler=()=>kiraTipi('abonelik');

async function kiraTekKaydiVeritabaninaKaydet(kayit){
const fdRentalIdentity=fdRentalDataContext();

        if(!SUPABASE_MODE||!supabaseClient)throw new Error('Supabase bağlantısı aktif değil.');if(!activeUser?.sirketId)throw new Error('Şirket oturumu bulunamadı.');
        const veri={...kayit,sirketId:String(activeUser.sirketId)},satir={company_id:activeUser.sirketId,module:'kiratakip',legacy_id:String(veri.id),record_year:supabaseKayitYili('kiratakip',veri),employee_legacy_id:null,data:veri};
        const {data,error}=await supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}).select('legacy_id,data').single();
if(fdRentalIdentity!==fdRentalDataContext())throw Error("Oturum değişti; kayıt yanıtı kullanılamaz.");

        if(error)throw error;
        if(!data?.data)throw new Error('Kayıt veritabanına yazıldı ancak geri okunarak doğrulanamadı.');
        return {...data.data,id:String(data.data.id||data.legacy_id||veri.id)};
    }

function kiraAySonu(ay){const [y,m]=String(ay).split('-').map(Number);return new Date(y,m,0,12).toISOString().slice(0,10);}

function kiraBirGunOnce(tarih){const d=new Date(String(tarih)+'T12:00:00');d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);}

function kiraBelgeDosyaAdi(d,tur,dosya){const uzanti=String(dosya.name||'belge').split('.').pop().replace(/[^a-zA-Z0-9]/g,'').toLowerCase()||'pdf';if(d?.policeDosyaAdi)return String(d.policeDosyaAdi).replace(/[^\p{L}\p{N}_.-]+/gu,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');return ('KIRA_'+(d.kisaAd||'DAIRE')+'_'+tur+'_'+new Date().toISOString().slice(0,10)+'_'+Date.now()).replace(/[^\p{L}\p{N}_-]+/gu,'_')+'.'+uzanti;}

function kiraSozlesmeAyTutari(s,ay){const degisiklikler=(Array.isArray(s?.kiraDegisiklikleri)?s.kiraDegisiklikleri:[]).filter(x=>x?.ay&&String(x.ay)<=String(ay)).sort((a,b)=>String(b.ay).localeCompare(String(a.ay)));return Number(degisiklikler[0]?.tutar??s?.aylikKira??0);}

const kiraDaireYilSatirlariZamOncesi=kiraDaireYilSatirlari;

kiraDaireYilSatirlari=function(daireId,yil){return kiraDaireYilSatirlariZamOncesi(daireId,yil).map(r=>{const s=r.sozlesmeId?kiraKaydiBul(r.sozlesmeId):null;return s?{...r,kira:kiraSozlesmeAyTutari(s,r.ay)}:r;});};

function kiraDaireYilSatirlari(daireId,yil){
        const sozlesmeler=kiraSozlesmeler().filter(s=>String(s.daireId)===String(daireId)),odemeler=kiraOdemeler(),policeler=kiraPoliceler().filter(p=>String(p.daireId)===String(daireId)),masraflar=kiraMasraflar().filter(m=>String(m.daireId)===String(daireId)),bugunAy=new Date().toISOString().slice(0,7);
        return Array.from({length:12},(_,i)=>{const ay=String(yil)+'-'+String(i+1).padStart(2,'0'),ayBas=ay+'-01',aySon=kiraAySonu(ay),uygun=sozlesmeler.filter(s=>String(s.baslangic||'9999-12-31')<=aySon&&String(s.gercekBitis||s.bitis||'9999-12-31')>=ayBas).sort((a,b)=>String(b.baslangic).localeCompare(String(a.baslangic))),sozlesme=uygun[0]||null,sozlesmeIds=new Set(uygun.map(s=>String(s.id))),ayOdemeleri=odemeler.filter(o=>o.ay===ay&&(String(o.daireId)===String(daireId)||sozlesmeIds.has(String(o.sozlesmeId)))),odenen=ayOdemeleri.reduce((t,o)=>t+Number(o.tutar||0),0),kiracilar=[...new Set((ayOdemeleri.length?ayOdemeleri.map(o=>sozlesmeler.find(s=>String(s.id)===String(o.sozlesmeId))?.kiraciAd):uygun.map(s=>s.kiraciAd)).filter(Boolean))],kira=Number(sozlesme?.aylikKira||0),dask=policeler.filter(p=>aracRuhsatMetniniEsitle(p.tur).includes('DASK')).reduce((t,p)=>t+Number(kiraPoliceAyTutari(p,ay)||0),0),konut=policeler.filter(p=>aracRuhsatMetniniEsitle(p.tur).includes('KONUT')).reduce((t,p)=>t+Number(kiraPoliceAyTutari(p,ay)||0),0),police=dask+konut,masraf=masraflar.reduce((t,m)=>t+Number(kiraMasrafAyTutari(m,ay)||0),0);let durum='SÖZLEŞME YOK';if(sozlesme)durum=odenen>0?'ÖDENDİ':(ay<=bugunAy?'ÖDENMEDİ':'BEKLİYOR');return{ay,ayAdi:kiraAyAdi(ay),kiraci:kiracilar.join(' / ')||'-',kira,odenen,durum,dask,konut,police,masraf,net:odenen-police-masraf,sozlesmeId:sozlesme?.id||''};});
    }

function kiraDaireRaporToplamlari(satirlar){return satirlar.reduce((t,r)=>({kira:t.kira+Number(r.kira||0),odenen:t.odenen+Number(r.odenen||0),dask:t.dask+Number(r.dask||0),konut:t.konut+Number(r.konut||0),police:t.police+Number(r.police||0),masraf:t.masraf+Number(r.masraf||0),net:t.net+Number(r.net||0)}),{kira:0,odenen:0,dask:0,konut:0,police:0,masraf:0,net:0});}

function kiraHamOdemeleri(){return kiraKayitlari.filter(o=>o?.tip==='odeme');}

function kiraOdemeAyniAyaAit(o,sozlesmeId,daireId,ay){return o?.tip==='odeme'&&String(o.ay||'')===String(ay||'')&&((daireId&&String(o.daireId||'')===String(daireId))||(sozlesmeId&&String(o.sozlesmeId||'')===String(sozlesmeId)));}

function kiraAyaAitOdemeler(sozlesme,ay){const sid=String(sozlesme?.id||''),did=String(sozlesme?.daireId||'');return kiraHamOdemeleri().filter(o=>kiraOdemeAyniAyaAit(o,sid,did,ay)).sort((a,b)=>String(a.id||'').localeCompare(String(b.id||''),undefined,{numeric:true}));}

function kiraAyaAitOdemeBul(sozlesme,ay){return kiraAyaAitOdemeler(sozlesme,ay)[0]||null;}

const fdKiraYilSatirlariKiraciOncesi=kiraDaireYilSatirlari;

kiraDaireYilSatirlari=function(daireId,yil){return fdKiraYilSatirlariKiraciOncesi(daireId,yil).map(r=>{const s=r.sozlesmeId?kiraSozlesmeler().find(x=>String(x.id)===String(r.sozlesmeId)):null;if(!s)return r;const kira=kiraSozlesmeAyTutari(s,r.ay);return {...r,kiraci:s.kiraciAd||r.kiraci||'-',kira,durum:Number(kira)===0?'BEDELSİZ':r.durum};});};

function kiraAyIcinSozlesmeBul(daireId,ay){
        const ayBas=String(ay)+'-01',aySon=kiraAySonu(ay);
        return kiraSozlesmeler().filter(s=>String(s.daireId)===String(daireId)&&String(s.baslangic||'9999-12-31')<=aySon&&String(s.gercekBitis||s.bitis||'9999-12-31')>=ayBas).sort((a,b)=>String(b.baslangic||'').localeCompare(String(a.baslangic||'')))[0]||null;
    }

function kiraEtkinSozlesmeBitisi(s){const tarihler=[s?.bitis,s?.gercekBitis].map(x=>String(x||'').slice(0,10)).filter(Boolean).sort();return tarihler[0]||'9999-12-31';}

kiraDaireYilSatirlari=function(daireId,yil){const sozlesmeler=kiraSozlesmeler().filter(s=>String(s.daireId)===String(daireId)),odemeler=kiraOdemeler(),policeler=kiraPoliceler().filter(p=>String(p.daireId)===String(daireId)),masraflar=kiraMasraflar().filter(m=>String(m.daireId)===String(daireId)),bugunAy=new Date().toISOString().slice(0,7);return Array.from({length:12},(_,i)=>{const ay=String(yil)+'-'+String(i+1).padStart(2,'0'),ayBas=ay+'-01',aySon=kiraAySonu(ay),uygun=sozlesmeler.filter(s=>String(s.baslangic||'9999-12-31')<=aySon&&kiraEtkinSozlesmeBitisi(s)>=ayBas).sort((a,b)=>String(b.baslangic||'').localeCompare(String(a.baslangic||''))),sozlesme=uygun[0]||null,ids=new Set(uygun.map(s=>String(s.id))),ayOdemeleri=odemeler.filter(o=>o.ay===ay&&(String(o.daireId)===String(daireId)||ids.has(String(o.sozlesmeId)))),odenen=ayOdemeleri.reduce((t,o)=>t+Number(o.tutar||0),0),kira=sozlesme?Number(kiraSozlesmeAyTutari(sozlesme,ay)||0):0,dask=policeler.filter(p=>aracRuhsatMetniniEsitle(p.tur).includes('DASK')).reduce((t,p)=>t+Number(kiraPoliceAyTutari(p,ay)||0),0),konut=policeler.filter(p=>aracRuhsatMetniniEsitle(p.tur).includes('KONUT')).reduce((t,p)=>t+Number(kiraPoliceAyTutari(p,ay)||0),0),masraf=masraflar.reduce((t,m)=>t+Number(kiraMasrafAyTutari(m,ay)||0),0);let durum='SÖZLEŞME YOK';if(sozlesme)durum=kira===0?'BEDELSİZ':odenen>0?'ÖDENDİ':(ay<=bugunAy?'ÖDENMEDİ':'BEKLİYOR');return{ay,ayAdi:kiraAyAdi(ay),kiraci:sozlesme?.kiraciAd||'-',kira,odenen,durum,dask,konut,police:dask+konut,masraf,net:odenen-dask-konut-masraf,sozlesmeId:sozlesme?.id||''};});};

(function(){const num=v=>Number.isFinite(Number(v))?Number(v):0;
const eskiYil=kiraDaireYilSatirlari;
window.kiraDaireYilSatirlari=function(){return eskiYil.apply(this,arguments).map(r=>{if(!r.sozlesmeId||num(r.kira)<=0)return r;const kalan=Math.max(0,num(r.kira)-num(r.odenen));return{...r,kalan,durum:num(r.odenen)>0&&kalan>.009?'KISMİ ÖDEME':num(r.odenen)>=num(r.kira)-.009?'ÖDENDİ':r.durum};});};
})();

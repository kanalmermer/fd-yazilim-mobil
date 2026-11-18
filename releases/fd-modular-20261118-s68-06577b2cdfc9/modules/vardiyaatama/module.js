window.FDModules.define('vardiyaatama',function(){
 'use strict';let disposed=false;
 function cancelled(){const e=new Error('Vardiya atama oturumu değişti.');e.name='AbortError';return e;}
 return{async open(r){if(disposed||!r?.current())return null;
  const check=()=>{if(disposed||!r.current())throw cancelled();};
  const aktifSirketId=()=>r.company,aktifSirketeAit=k=>!k.sirketId||String(k.sirketId)===r.company;
  let vardiyaKayitlari=r.records.filter(aktifSirketeAit);const izinler=r.leaves,magicpassSeciliGunler=new Set(r.selected),yuklenenVeriler=new Set();
  const magicpassKayitlari=type=>vardiyaKayitlari.filter(k=>k.kayitTipi===type&&aktifSirketeAit(k));
  const document={getElementById(id){check();if(r.values[id])return r.values[id];if(id==='magicpassVardiyaMenu')return{style:new Proxy({},{set(_t,key,value){check();window.document.getElementById(id).style[key]=value;return true;}})};return window.document.getElementById(id);},querySelectorAll(selector){check();if(selector==='#magicTopluPersoneller input:checked')return r.checks.map(value=>({value}));throw Error('Beklenmeyen vardiya seçicisi');}};
  const showToast=(...a)=>{if(r.current())r.native.toast(...a);},alert=(...a)=>{if(r.current())r.native.alert(...a);},magicpassAylikCizelgeyiCiz=()=>r.render(),magicpassTopluPlanlamaKapat=()=>r.close();
  const fdYuzerOnaySor=async(...a)=>{check();const result=await r.native.confirm(...a);check();return result;},fdYuzerDegerSor=async(...a)=>{check();const result=await r.native.prompt(...a);check();return result;};
  const supabaseVerileriKaydet=async(...a)=>{check();r.commit(vardiyaKayitlari);await r.native.save(...a);check();};
  const personelVardiyaBildirimiHazirla=(...a)=>{check();return r.native.prepareNotice(...a);},personelVardiyaBildirimleriniPlanla=async(...a)=>{check();const result=await r.native.notices(...a);check();return result;};
async function magicpassAtamalariKaydet(degisiklikler, aciklama) {
        if (!degisiklikler.length) return;
        const islem = { id:'vislem_' + Date.now(), kayitTipi:'vardiyaIslem', sirketId:aktifSirketId(), zaman:Date.now(), aciklama, degisiklikler };
        vardiyaKayitlari.push(islem);
        yuklenenVeriler.add('vardiya');
        await supabaseVerileriKaydet();
    }
async function magicpassSeciliGunlereVardiyaAta(vardiya) {
        const pId = document.getElementById('magicpassPersonel').value;
        if (!pId || !magicpassSeciliGunler.size) return;
        const bildirilecekTarihler = [...magicpassSeciliGunler];
        const degisiklikler = [];
        [...magicpassSeciliGunler].forEach(tarih => {
            const oncekiler = magicpassKayitlari('vardiyaAtama').filter(k => String(k.pId) === String(pId) && k.tarih === tarih);
            vardiyaKayitlari = vardiyaKayitlari.filter(k => !(k.kayitTipi === 'vardiyaAtama' && aktifSirketeAit(k) && String(k.pId) === String(pId) && k.tarih === tarih));
            const yeni = vardiya ? magicpassAtamaKaydi(pId,tarih,vardiya,'aylik') : null;
            if (yeni) vardiyaKayitlari.push(yeni);
            degisiklikler.push({ pId:String(pId), tarih, oncekiler, yeniId:yeni?.id || '' });
        });
        document.getElementById('magicpassVardiyaMenu').style.display = 'none';
        await magicpassAtamalariKaydet(degisiklikler, magicpassSeciliGunler.size + ' güne vardiya atandı');
        magicpassAylikCizelgeyiCiz();
        showToast('Seçili günlerin vardiyası güncellendi.');
        if (vardiya) {
            const bildirim = personelVardiyaBildirimiHazirla(pId, bildirilecekTarihler, vardiya);
            const sonuc = await personelVardiyaBildirimleriniPlanla([bildirim]);
            if (sonuc.basarisiz) showToast('Vardiya kaydedildi; WhatsApp bildirimi planlanamadı.', 'warning');
        }
    }
async function magicpassTopluVardiyaUygula() {
        const pIdler=[...document.querySelectorAll('#magicTopluPersoneller input:checked')].map(x=>x.value);
        const bas=document.getElementById('magicTopluBaslangic').value, bit=document.getElementById('magicTopluBitis').value, vardiya=document.getElementById('magicTopluVardiya').value, sadeceBos=document.getElementById('magicTopluSadeceBos').checked;
        if(!pIdler.length||!bas||!bit||bit<bas)return alert('Personel ve geçerli tarih aralığı seçin.');
        let gunSayisi=0, atlananIzin=0, atlananDolu=0; const degisiklikler=[];
        for(const tarih=new Date(bas+'T12:00:00'),son=new Date(bit+'T12:00:00');tarih<=son;tarih.setDate(tarih.getDate()+1)){
            const key=magicpassTarihAnahtari(tarih);
            pIdler.forEach(pId=>{
                if(izinler.some(i=>aktifSirketeAit(i)&&String(i.pId)===String(pId)&&key>=i.baslangic&&key<=i.bitis)){atlananIzin++;return;}
                const oncekiler=magicpassKayitlari('vardiyaAtama').filter(k=>String(k.pId)===String(pId)&&k.tarih===key);
                if(sadeceBos&&oncekiler.length){atlananDolu++;return;}
                vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='vardiyaAtama'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&k.tarih===key));
                const yeni=magicpassAtamaKaydi(pId,key,vardiya,'toplu');vardiyaKayitlari.push(yeni);
                degisiklikler.push({pId:String(pId),tarih:key,oncekiler,yeniId:yeni.id});gunSayisi++;
            });
        }
        const mesaj=pIdler.length+' personel için '+gunSayisi+' günlük vardiya atanacak.'+(atlananIzin?'\n'+atlananIzin+' izinli gün atlanacak.':'')+(atlananDolu?'\n'+atlananDolu+' dolu gün atlanacak.':'')+'\nDevam edilsin mi?';
        if(!await fdYuzerOnaySor(mesaj)){degisiklikler.forEach(d=>{vardiyaKayitlari=vardiyaKayitlari.filter(k=>k.id!==d.yeniId);vardiyaKayitlari.push(...d.oncekiler);});return;}
        await magicpassAtamalariKaydet(degisiklikler,pIdler.length+' personele toplu vardiya atandı');
        magicpassTopluPlanlamaKapat();magicpassAylikCizelgeyiCiz();showToast('Toplu vardiya ataması tamamlandı.');
        const bildirimler=pIdler.map(pId=>{const tarihler=degisiklikler.filter(d=>String(d.pId)===String(pId)).map(d=>d.tarih);return tarihler.length?personelVardiyaBildirimiHazirla(pId,tarihler,vardiya):null}).filter(Boolean);
        const bildirimSonucu=await personelVardiyaBildirimleriniPlanla(bildirimler);
        if(bildirimSonucu.basarisiz)showToast(bildirimSonucu.basarisiz+' vardiya WhatsApp bildirimi planlanamadı.','warning');
    }
async function magicpassSonTopluIslemiGeriAl() {
        const islem=magicpassKayitlari('vardiyaIslem').sort((a,b)=>Number(b.zaman)-Number(a.zaman))[0];
        if(!islem)return alert('Geri alınabilecek vardiya işlemi yok.');
        if(!await fdYuzerOnaySor((islem.aciklama||'Son vardiya işlemi')+' geri alınsın mı?'))return;
        (islem.degisiklikler||[]).forEach(d=>{
            vardiyaKayitlari=vardiyaKayitlari.filter(k=>k.id!==d.yeniId);
            (d.oncekiler||[]).forEach(k=>{if(!vardiyaKayitlari.some(x=>x.id===k.id))vardiyaKayitlari.push(k);});
        });
        vardiyaKayitlari=vardiyaKayitlari.filter(k=>k.id!==islem.id);
        yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassAylikCizelgeyiCiz();showToast('Son vardiya işlemi geri alındı.');
    }
const magicpassSeciliGunlereGunTuruAta=async function(gunTuru){
        const tarihler=[...magicpassSeciliGunler].sort();if(!tarihler.length)return alert('Aylık listeden en az bir gün seçin.');
        let tatilAdi='';if(gunTuru==='resmiTatil'){const otomatik=tarihler.length===1?magicpassResmiTatilAdi(tarihler[0]):'';tatilAdi=await fdYuzerDegerSor('Resmî tatilin adını yazın:',otomatik==='Resmî Tatil'?'':otomatik,'Tatil Adı','Devam');if(tatilAdi===null)return;tatilAdi=String(tatilAdi).trim()||'Resmî Tatil';}
        const aciklama=gunTuru==='pazar'?'Pazar / hafta tatili':gunTuru==='resmiTatil'?tatilAdi:'normal çalışma günü',mesaj=tarihler.length+' tarih bütün personeller için '+aciklama+' olarak kaydedilecek.\n\nBu değişiklik şirketin tüm personellerine uygulanacak. Devam edilsin mi?';
        if(!(await fdYuzerOnaySor(mesaj,'Tüm Personeller İçin Gün Türü','Tümüne Uygula')))return;
        tarihler.forEach(tarih=>{vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassGunTuruGenel'&&String(k.tarih)===String(tarih)));vardiyaKayitlari.push({id:'mguntur_genel_'+tarih+'_'+Date.now(),kayitTipi:'magicpassGunTuruGenel',sirketId:aktifSirketId(),tarih,gunTuru:gunTuru||'normal',tatilAdi:gunTuru==='resmiTatil'?tatilAdi:'',zaman:Date.now()});});
        try{yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassAylikCizelgeyiCiz();showToast(tarihler.length+' gün bütün personeller için güncellendi.');}catch(error){alert('Tatil günleri kaydedilemedi: '+(error.message||error));}
    };
  try{check();return await ({selected:()=>magicpassSeciliGunlereVardiyaAta(r.arg),bulk:()=>magicpassTopluVardiyaUygula(),undo:()=>magicpassSonTopluIslemiGeriAl(),day:()=>magicpassSeciliGunlereGunTuruAta(r.arg)})[r.action]();}catch(error){if(error.name==='AbortError'||!r.current())return null;throw error;}
 },dispose(){disposed=true;}};
});

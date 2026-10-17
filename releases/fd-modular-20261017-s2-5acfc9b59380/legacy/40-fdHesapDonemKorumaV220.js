
// Only synchronous calculation boundaries are scoped. Never retain a global
// historical settings object across an await, write, or company change.
const FD_DONEM_AYAR_ALANLARI=['primTutari','primDevamsizlikSiniri','primYarimGunEksikMesaiDakika','gunlukCalismaSaati','mesaiKatsayisi','mesaiYuvarlamaAdimi','vardiyaTanimlari','vardiyaGunduzBaslik','vardiyaGeceBaslik','magicpassGunduzBaslangic','magicpassGunduzBitis','magicpassGunduzMesaiSiniri','magicpassGeceBaslangic','magicpassGeceBitis','magicpassGeceMesaiSiniri','magicpassMukerrerBasimDakika','magicpassGunlukMesaiEsikDakika','magicpassGunlukMesaiEsikAyarlandiV2','magicpassGunlukEksikMesaiEsikDakika','magicpassPazarYemekMolasi'];
const FD_DONEM_UCRET_ALANLARI=['ucret','gunlukUcret','gunlukYevmiye','ucretTutari','maas','maasTutari','primVar'];
let fdHesapAktifDonem='';
function fdDonemSurumuBul(history,month){return (Array.isArray(history)?history:[]).filter(x=>/^\d{4}-\d{2}$/.test(String(x.from||''))&&String(x.from)<=String(month)&&x.values&&typeof x.values==='object').sort((a,b)=>String(b.from).localeCompare(String(a.from)))[0]||null;}
function fdDonemAlanlariniUygula(current,version,keys,defaults={}){if(!version)return current;const result={...current};for(const key of keys){delete result[key];if(Object.hasOwn(defaults,key))result[key]=defaults[key];}Object.assign(result,JSON.parse(JSON.stringify(version.values)));return result;}
function fdPersonelDonemVerisi(personel,month=fdHesapAktifDonem){if(!month)return personel;return fdDonemAlanlariniUygula(personel,fdDonemSurumuBul(personel?.fdUcretDonemleri,month),FD_DONEM_UCRET_ALANLARI);}
function fdHesapDonemindeCalistir(month,calculate){
    if(!/^\d{4}-\d{2}$/.test(String(month)))return calculate();
    const settings=uygulamaAyarlari,previous=fdHesapAktifDonem;fdHesapAktifDonem=String(month);
    uygulamaAyarlari=fdDonemAlanlariniUygula(settings,fdDonemSurumuBul(settings.fdHesapDonemleri,month),FD_DONEM_AYAR_ALANLARI,VARSAYILAN_UYGULAMA_AYARLARI);
    try{return calculate();}finally{uygulamaAyarlari=settings;fdHesapAktifDonem=previous;}
}
function fdUcretDonemleriniYereldeGuncelle(rows){for(const row of rows||[]){if(row.module!=='personeller')continue;const p=personeller.find(x=>String(x.id)===String(row.data?.id||row.legacy_id));if(p){if(Array.isArray(row.data?.fdUcretDonemleri))p.fdUcretDonemleri=row.data.fdUcretDonemleri;else delete p.fdUcretDonemleri;}}}
(function(){
    for(const name of ['magicpassGunHesapla','magicpassGunVardiyasi','magicpassVardiyaSaatleri']){const original=window[name];window[name]=function(p,date){return fdHesapDonemindeCalistir(String(date||'').slice(0,7),()=>original.apply(this,arguments));};}
    for(const name of ['personelPrimHakkiVarMi','personelPrimDurumu','personelPrimCalisilmayanGunSayisi','magicpassAylikMesaiSaati','magicpassAylikYarimResmiTatilMesaiSaati']){const original=window[name];if(typeof original!=='function')continue;window[name]=function(p,ay,yil){const month=puantajAyAnahtari(ay,yil);return fdHesapDonemindeCalistir(month,()=>original.call(this,fdPersonelDonemVerisi(p,month),ay,yil));};}
    const salary=personelGunlukUcretiniGetir;window.personelGunlukUcretiniGetir=function(p,ay,yil){const month=ay!==undefined&&yil!==undefined?puantajAyAnahtari(ay,yil):(fdHesapAktifDonem||new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date()));return salary(fdPersonelDonemVerisi(p,month));};
    const render=renderPuantajMatrisi;window.renderPuantajMatrisi=function(){const ay=Number(document.getElementById('puanAySec')?.value),yil=Number(document.getElementById('puanYilSec')?.value),month=puantajAyAnahtari(ay,yil),originalPeople=personeller;return fdHesapDonemindeCalistir(month,()=>{personeller=originalPeople.map(p=>fdPersonelDonemVerisi(p,month));try{return render.apply(this,arguments);}finally{personeller=originalPeople;}});};
    const preview=maasSatiriniOnizle;window.maasSatiriniOnizle=function(){return fdHesapDonemindeCalistir(puantajAyAnahtari(Number(document.getElementById('puanAySec')?.value),Number(document.getElementById('puanYilSec')?.value)),()=>preview.apply(this,arguments));};
    function note(){const panel=document.getElementById('ayarlarPanelPersonel');if(panel&&!document.getElementById('fdDonemKorumaNotu'))panel.insertAdjacentHTML('afterbegin','<div id="fdDonemKorumaNotu" style="padding:12px 14px;margin-bottom:14px;border:1px solid #b9dce9;border-radius:9px;background:#f0f9fc;color:#315b72;font-size:13px;line-height:1.5">Vardiya, mesai, prim ve ücret değişiklikleri kaydedildiği aydan itibaren geçerlidir. Önceki aylar kendi ayarlarıyla hesaplanır; geçmiş kayıtlar geriye dönük değiştirilmez.</div>');}
    const settingsOpen=window.openAyarlarApp;if(typeof settingsOpen==='function')window.openAyarlarApp=function(){const r=settingsOpen.apply(this,arguments);note();return r;};
})();



(function(){
    window.fdCksAda=function(v){const s=String(v??'').trim();return(!s||s==='-'||Number(s)===0)?'0':tapuCksNorm(s)};
    window.fdCksAdaEsit=function(a,b){return fdCksAda(a)===fdCksAda(b)};
    let temizlikCalisiyor=false,temizlikYapildi=false;

    /* Tapu düzenleme eski kaydı güncellesin; yeni kayıt üretmesin. */
    /* Private title edit adapter moved. */
    /* Private title edit adapter moved. */
    /* Private title edit adapter moved. */
    /* Private title edit adapter moved. */

    function n(v){return tapuCksNorm(v)}
    function noAnahtari(t){const no=n(t.tasinmazNo),malik=n(t.sahibi);if(no)return'no|'+no+'|'+malik;return'parsel|'+[n(t.il),n(t.ilce),n(t.mahalle),fdCksAda(t.ada),n(t.parsel),n(t.bagimsizBolum),malik].join('|')}
    function fizikAnahtari(t){return[n(t.il),n(t.ilce),n(t.mahalle),fdCksAda(t.ada),n(t.parsel),n(t.bagimsizBolum)].join('|')}
    function korumaPuani(t){const ham=String(t.ada??'').trim(),zaman=Date.parse(t.guncellemeTarihi||'')||0;return(ham==='0'?100:0)+(String(t.id||'').startsWith('tapu_')?40:0)+(t.tapuDosya?.id?15:0)+(t.parselSorguUrl?5:0)+zaman/1e13}
    function eksikleriDoldur(hedef,kaynak){['tasinmazNo','nitelik','il','ilce','mahalle','toplamAlan','sahipOlunanAlan','hisseDurumu','ada','parsel','bagimsizBolum','alisTarihi','sahibi','parselSorguUrl','aciklama','tapuDosya'].forEach(a=>{if((hedef[a]===undefined||hedef[a]===null||hedef[a]==='')&&kaynak[a]!==undefined&&kaynak[a]!==null&&kaynak[a]!=='')hedef[a]=kaynak[a]});return hedef}
    function cksAdayTapu(c){
        let aday=tapuKayitlari.filter(t=>fdCksAdaEsit(t.ada,c.ada)&&n(t.parsel)===n(c.parsel)&&n(t.ilce)===n(c.ilce)&&n(t.mahalle)===n(c.mahalle));
        if(aday.length>1&&c.malik){const malik=aday.filter(t=>n(t.sahibi)===n(c.malik));if(malik.length)aday=malik}
        return aday.length===1?aday[0]:null;
    }
    async function satirlariYaz(kayitlar){
const fdTitleIdentity=fdTitleDataContext();

        const rows=kayitlar.map(k=>({company_id:activeUser.sirketId,module:'taputakip',legacy_id:String(k.id),record_year:Number(k.yil)||Number(String(k.alisTarihi||'').slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:k}));
        for(let i=0;i<rows.length;i+=100){const{error}=await fdTitleDataAwait(supabaseClient.from('portal_records').upsert(rows.slice(i,i+100),{onConflict:'company_id,module,legacy_id'}),fdTitleIdentity);if(error)throw error}
    }
    async function tapuCksKayitlariniDuzelt(){
const fdTitleIdentity=fdTitleDataContext();

        if(temizlikCalisiyor||temizlikYapildi||!tapuYazabilir()||!activeUser?.sirketId)return;
        temizlikCalisiyor=true;let silinen=0,baglanan=0;
        try{
            const gruplar=new Map();tapuKayitlari.forEach(t=>{const k=noAnahtari(t);if(!gruplar.has(k))gruplar.set(k,[]);gruplar.get(k).push(t)});
            for(const grup of [...gruplar.values()].filter(g=>g.length>1)){
                grup.sort((a,b)=>korumaPuani(b)-korumaPuani(a));const tut={...grup[0]},fazlalar=grup.slice(1),fazlaId=new Set(fazlalar.map(x=>String(x.id)));
                fazlalar.forEach(x=>eksikleriDoldur(tut,x));if(fdCksAda(tut.ada)==='0')tut.ada='0';tut.guncellemeTarihi=tut.guncellemeTarihi||new Date().toISOString();
                const fizikler=new Set(grup.map(fizikAnahtari));const degisenCks=[];
                tapuCksKayitlari.forEach(c=>{if(fazlaId.has(String(c.tapuId))||fizikler.has([n(c.il),n(c.ilce),n(c.mahalle),fdCksAda(c.ada),n(c.parsel),n(c.bagimsizBolum)].join('|'))){c.tapuId=String(tut.id);c.eslesmeDurumu='eslesti';c.ada=String(tut.ada||'0');c.parsel=String(tut.parsel||c.parsel||'');c.il=String(tut.il||c.il||'');c.ilce=String(tut.ilce||c.ilce||'');c.mahalle=String(tut.mahalle||c.mahalle||'');c.malik=String(tut.sahibi||c.malik||'');c.guncellemeTarihi=c.guncellemeTarihi||new Date().toISOString();degisenCks.push(c)}});
                await fdTitleDataAwait(satirlariYaz([tut,...degisenCks]),fdTitleIdentity);
                const ids=fazlalar.map(x=>String(x.id)),arsivler=fazlalar.map(x=>({...x,kayitTipi:'tapuArsiv',birlestirilenTapuId:String(tut.id),arsivlenmeTarihi:new Date().toISOString()}));await fdTitleDataAwait(satirlariYaz(arsivler),fdTitleIdentity);
                tapuKayitlari=tapuKayitlari.filter(x=>!fazlaId.has(String(x.id))).map(x=>String(x.id)===String(tut.id)?tut:x);silinen+=ids.length;baglanan+=degisenCks.length;
            }
            const yenidenBaglanan=[];
            tapuCksKayitlari.forEach(c=>{const t=cksAdayTapu(c);if(!t)return;const yeniAda=fdCksAda(t.ada)==='0'?'0':String(t.ada||'');if(String(c.tapuId)!==String(t.id)||String(c.ada)!==yeniAda){c.tapuId=String(t.id);c.eslesmeDurumu='eslesti';c.ada=yeniAda;c.parsel=String(t.parsel||c.parsel||'');c.il=String(t.il||c.il||'');c.ilce=String(t.ilce||c.ilce||'');c.mahalle=String(t.mahalle||c.mahalle||'');c.malik=String(t.sahibi||c.malik||'');yenidenBaglanan.push(c)}});
            if(yenidenBaglanan.length){await fdTitleDataAwait(satirlariYaz(yenidenBaglanan),fdTitleIdentity);baglanan+=yenidenBaglanan.length}
            temizlikYapildi=true;
            if(silinen||baglanan){tapuEkraniniCiz?.();tapuCksFiltreleriYenile?.();showToast?.(silinen+' çift tapu birleştirildi · '+baglanan+' ÇKS kaydı eşleştirildi.')}
        }catch(e){
if(fdTitleIdentity!==fdTitleDataContext())return;
console.error('Tapu/ÇKS çift kayıt düzeltme:',e);showToast?.('Çift tapu kayıtları düzenlenirken işlem tamamlanamadı: '+(e.message||e),'error')}finally{temizlikCalisiyor=false}
    }
    window.fdTapuCksKayitlariniDuzelt=tapuCksKayitlariniDuzelt;
    const yukleEski=window.tapuVerileriniYukle;
    window.tapuVerileriniYukle=async function(){
const fdTitleIdentity=fdTitleDataContext();
const r=await fdTitleDataAwait(yukleEski.apply(this,arguments),fdTitleIdentity);await fdTitleDataAwait(tapuCksKayitlariniDuzelt(),fdTitleIdentity);return r};
    window.tapuCksTapuEsle=function(k){let a=tapuKayitlari.filter(t=>fdCksAdaEsit(t.ada,k.ada)&&n(t.parsel)===n(k.parsel)&&n(t.ilce)===n(k.ilce)&&n(t.mahalle)===n(k.mahalle));if(a.length>1){const m=a.filter(t=>n(t.sahibi)===n(k.malik));if(m.length)a=m}if(a.length>1){const r=a.filter(t=>/tarla|arazi|bahce/.test(n(t.nitelik)));if(r.length)a=r}return a.length===1?a[0]:null};
})();


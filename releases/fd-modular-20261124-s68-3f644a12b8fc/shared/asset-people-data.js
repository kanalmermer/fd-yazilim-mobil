// Shared owner picker/model contract; contains no screen or production mutation.
(function(root){
let store=null,key='';
function contextKey(){return JSON.stringify([typeof activeUser==='undefined'?'':activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',typeof activeUser==='undefined'?'':activeUser?.sirketId||'',typeof activeUser==='undefined'?'':activeUser?.rol||'',typeof anaMenuModulYetkisi==='function'?anaMenuModulYetkisi('varlikkisileri'):'yok'])}
function create(initial){let disposed=false;let fdVarlikKisiKayitlari=[],fdVarlikKisiYuklendi=false,fdVkModelCache=null,fdVkSirket='';
const KANAL_KISI='KANAL MERMER LTD. ŞTİ.',KANAL_ID='varlik_kisi_kanal_mermer_ltd_sti';
const ayniSirket=x=>!x?.sirketId||String(x.sirketId)===String(aktifSirketId());
const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function check(){if(disposed||initial!==contextKey())throw Error('Kişi rehberi oturumu değişti.')}
function adAnahtari(v){return String(v||'').trim().toLocaleUpperCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/İ/g,'I').replace(/[^A-Z0-9]+/g,' ').trim()}

function kanonikAd(v){const n=adAnahtari(v);if(n.startsWith('KANAL MERMER'))return KANAL_KISI;return String(v||'').trim().toLocaleUpperCase('tr-TR')}

function birlesikKisiler(){
        const harita=new Map(),takmaAdlar=new Map();
        fdVarlikKisiKayitlari.filter(ayniSirket).forEach(p=>[p.ad,...(p.aliases||[])].forEach(ad=>takmaAdlar.set(adAnahtari(ad),adAnahtari(kanonikAd(p.ad)))));
        const ekle=(ad,bilgi={})=>{
            const gorunen=kanonikAd(ad);if(!gorunen)return null;
            const anahtar=takmaAdlar.get(adAnahtari(gorunen))||adAnahtari(gorunen);let k=harita.get(anahtar);
            if(!k){k={id:'',kiraSahipId:'',ad:gorunen,tcVkn:'',telefon:'',adres:'',not:'',aliases:[],tapular:[],daireler:[],araclar:[],cksler:[]};harita.set(anahtar,k)}
            // A derived rental-owner ID must never overwrite that owner's record.
            if(bilgi.kayitTipi==='varlikKisisi'&&bilgi.id){k.id=String(bilgi.id);k.ad=gorunen;}
            if(bilgi.kiraSahipId||bilgi.tip==='sahip')k.kiraSahipId=String(bilgi.kiraSahipId||bilgi.id||'');
            for(const [alan,alternatif] of [['tcVkn','no'],['telefon','telefon'],['adres','adres'],['not','not']])k[alan]=k[alan]||bilgi[alan]||bilgi[alternatif]||'';
            k.aliases=[...new Set([...k.aliases,...(bilgi.aliases||[]),String(ad||'').trim()].filter(Boolean))];return k;
        };
        fdVarlikKisiKayitlari.filter(ayniSirket).forEach(p=>ekle(p.ad,p));
        const sahipDaireleri=new Map();
        (typeof kiraDaireler==='function'?kiraDaireler():[]).filter(ayniSirket).forEach(d=>(d.sahipIds||[]).forEach(id=>{const key=String(id);if(!sahipDaireleri.has(key))sahipDaireleri.set(key,[]);sahipDaireleri.get(key).push(d)}));
        (typeof kiraSahipler==='function'?kiraSahipler():[]).filter(ayniSirket).forEach(s=>{const k=ekle(s.ad,s);if(k)(sahipDaireleri.get(String(s.id))||[]).forEach(d=>{if(!k.daireler.some(x=>String(x.id)===String(d.id)))k.daireler.push(d)})});
        const tapular=(typeof tapuKayitlari!=='undefined'?tapuKayitlari:[]).filter(ayniSirket),tapuHarita=new Map(tapular.map(t=>[String(t.id),t]));
        tapular.filter(t=>t.kayitTipi==='tapu'||!t.kayitTipi).forEach(t=>{const k=ekle(t.sahibi);if(k&&!k.tapular.some(x=>String(x.id)===String(t.id)))k.tapular.push(t)});
        (typeof tapuCksKayitlari!=='undefined'?tapuCksKayitlari:[]).filter(ayniSirket).forEach(c=>{const t=tapuHarita.get(String(c.tapuId||'')),k=ekle(t?.sahibi||c.malik||c.cksSahibi);if(k&&!k.cksler.some(x=>String(x.id)===String(c.id)))k.cksler.push(c)});
        (typeof araclar!=='undefined'?araclar:[]).filter(aktifSirketeAit).forEach(a=>{const k=ekle(a.aracSahibi);if(k&&!k.araclar.some(x=>String(x.id)===String(a.id)))k.araclar.push(a)});
        return [...harita.values()].filter(k=>adAnahtari(k.ad)!==adAnahtari('HÜSEYİN U. ERYILMAZ')).sort((a,b)=>a.ad.localeCompare(b.ad,'tr'));
    }

function fdVarlikKisiListesiniGuncelle150(){fdVkModelCache=null;let d=document.getElementById('fdVarlikKisileriListesi');if(!d){d=document.createElement('datalist');d.id='fdVarlikKisileriListesi';document.body.appendChild(d)}const kisiler=birlesikKisiler();d.innerHTML=kisiler.map(k=>'<option value="'+html(k.ad)+'"></option>').join('');['tapuSahibi','kiraSahipAd','aracSahibi','tapuCksSahibi'].forEach(id=>document.getElementById(id)?.setAttribute('list',d.id));return kisiler}
return {adAnahtari,kanonikAd,birlesikKisiler,fdVarlikKisiListesiniGuncelle150(){check();const result=fdVarlikKisiListesiniGuncelle150();const d=document.getElementById('fdVarlikKisileriListesi');if(d)d.dataset.fdVkScope=initial;return result},ayniSirket,html,isCurrent:()=>!disposed&&initial===contextKey(),
get fdVarlikKisiKayitlari(){check();return fdVarlikKisiKayitlari},set fdVarlikKisiKayitlari(value){check();fdVarlikKisiKayitlari=value},
get fdVarlikKisiYuklendi(){check();return fdVarlikKisiYuklendi},set fdVarlikKisiYuklendi(value){check();fdVarlikKisiYuklendi=value},
get fdVkModelCache(){check();return fdVkModelCache},set fdVkModelCache(value){check();fdVkModelCache=value},
get fdVkSirket(){check();return fdVkSirket},set fdVkSirket(value){check();fdVkSirket=value},
dispose(){disposed=true;fdVarlikKisiKayitlari=[];fdVarlikKisiYuklendi=false;fdVkModelCache=null;fdVkSirket='';const d=document.getElementById('fdVarlikKisileriListesi');if(d?.dataset.fdVkScope===initial)d.replaceChildren();},scope:initial};}
function current(){const next=contextKey();if(!store||next!==key||!store.isCurrent()){store?.dispose();store=create(next);key=next}return store}
root.FDVarlikKisileriData=Object.freeze({current,update(){const data=current();const result=data.fdVarlikKisiListesiniGuncelle150();const d=document.getElementById('fdVarlikKisileriListesi');if(d)d.dataset.fdVkScope=data.scope;return result}});
})(window);
function fdVarlikKisiListesiniGuncelle(){return window.FDVarlikKisileriData.update()}

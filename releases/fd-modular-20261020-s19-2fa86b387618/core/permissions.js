// Ortak rol ve modül yetki hesapları; mevcut global adlar korunur.
function kullaniciRolAnahtari(rol = activeUser?.rol) {
        return String(rol || '').trim().toLocaleLowerCase('tr-TR')
            .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c')
            .replace(/[^a-z0-9]/g,'');
    }

function isManagerUser() {
        return Boolean(activeUser && ['admin','yonetici','kullanici'].includes(kullaniciRolAnahtari()));
    }

function kullaniciYetkiAnahtari(deger){
        return String(deger||'').trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9._-]/g,'');
    }

function anaMenuYetkiKullanicilari(){
        return (Array.isArray(kullanicilar)?kullanicilar:[]).filter(k=>k&&k.rol!=='Admin'&&kullaniciYetkiAnahtari(k.username)!=='admin');
    }

function aktifKullaniciYetkiAnahtari(){
        return kullaniciYetkiAnahtari(activeUser?.yetkiKullaniciAdi||activeUser?.username||'');
    }

function anaMenuModulAyarlariniDuzelt(kaynak=uygulamaAyarlari?.anaMenuModulleri){
        const roller=['Admin','Yonetici','Personel'],seviyeler=['yok','okuma','yazma'],hamListe=Array.isArray(kaynak)?kaynak:[],gelen=new Map(hamListe.map(m=>[String(m?.anahtar||''),m])),eksikSiraTabani=hamListe.length?1000:0;
        return VARSAYILAN_ANA_MENU_MODULLERI.map((varsayilan,index)=>{
            const kayit=gelen.get(varsayilan.anahtar)||{},aktif=kayit.aktif!==false,kayitRolleri=Array.isArray(kayit.roller)?kayit.roller.map(String).filter(rol=>roller.includes(rol)):null,eskiRoller=kayitRolleri?.length?kayitRolleri:varsayilan.roller,hamYetkiler=kayit.yetkiler&&typeof kayit.yetkiler==='object'?kayit.yetkiler:null,yetkiler={};
            roller.forEach(rol=>{const geriyeDonuk=eskiRoller.includes(rol)?(varsayilan.anahtar==='personel'&&rol==='Personel'?'okuma':'yazma'):'yok',seviye=String(hamYetkiler?.[rol]||geriyeDonuk);yetkiler[rol]=seviyeler.includes(seviye)?seviye:'yok';});
            yetkiler.Admin='yazma';
            const kullaniciYetkileri=Object.create(null);
            if(kayit.kullaniciYetkileri&&typeof kayit.kullaniciYetkileri==='object'){
                Object.entries(kayit.kullaniciYetkileri).forEach(([anahtar,seviye])=>{const temiz=kullaniciYetkiAnahtari(anahtar),duzey=String(seviye);if(temiz&&temiz!=='admin'&&seviyeler.includes(duzey))kullaniciYetkileri[temiz]=duzey;});
            }
            const izinler=roller.filter(rol=>yetkiler[rol]!=='yok');
            const eksikSira=varsayilan.anahtar==='siparistakip'?(Number(gelen.get('irsaliye')?.sira??3)+0.5):eksikSiraTabani+index;
            const kayitliSira=Number.isFinite(Number(kayit.sira))?Number(kayit.sira):eksikSira;
            return {...varsayilan,...kayit,anahtar:varsayilan.anahtar,fonksiyon:varsayilan.fonksiyon,ikon:varsayilan.ikon,renk:varsayilan.renk,ad:varsayilan.anahtar==='bildirim'?varsayilan.ad:(String(kayit.ad||varsayilan.ad).trim()||varsayilan.ad),aciklama:varsayilan.anahtar==='bildirim'?varsayilan.aciklama:(String(kayit.aciklama||varsayilan.aciklama).trim()||varsayilan.aciklama),roller:izinler,yetkiler,kullaniciYetkileri,kullaniciBazliYetki:false,aktif,sira:varsayilan.anahtar==='siparistakip'?eksikSira:kayitliSira};
        }).sort((a,b)=>a.sira-b.sira).map((modul,sira)=>({...modul,sira}));
    }

function anaMenuModulYetkisi(anahtar,rol=String(activeUser?.rol||'Personel')){
        const modul=anaMenuModulAyarlariniDuzelt().find(m=>m.anahtar===anahtar);
        if(!modul||!modul.aktif)return 'yok';
        if(rol==='Admin')return 'yazma';
        const kullaniciAnahtari=aktifKullaniciYetkiAnahtari();
        if(kullaniciAnahtari&&Object.prototype.hasOwnProperty.call(modul.kullaniciYetkileri||{},kullaniciAnahtari))return String(modul.kullaniciYetkileri[kullaniciAnahtari]||'yok');
        return String(modul.yetkiler?.[rol]||'yok');
    }

function anaMenuModulErisimiVar(anahtar){
        return anaMenuModulYetkisi(anahtar)!=='yok';
    }

function anaMenuModulYazmaYetkisiVar(anahtar){return anaMenuModulYetkisi(anahtar)==='yazma';}

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

/* Settings UI moved to modules/ayarlar. */

function yetkiMatrisiniDuzenleyebilir() { return activeUser?.rol === 'Admin' && anaMenuModulYazmaYetkisiVar('ayarlar'); }
function kullaniciYetkiMatrisiniKoru(yeniAyarlar, kayitliAyarlar) {
    if (activeUser?.rol === 'Admin') return yeniAyarlar;
    if (Object.prototype.hasOwnProperty.call(kayitliAyarlar || {}, 'anaMenuModulleri')) yeniAyarlar.anaMenuModulleri = kayitliAyarlar.anaMenuModulleri;
    else delete yeniAyarlar.anaMenuModulleri;
    return yeniAyarlar;
}


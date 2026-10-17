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

function anaMenuAyarTaslaginiFormdanOku(){
        if (!yetkiMatrisiniDuzenleyebilir()) return anaMenuModulAyarlariniDuzelt();
        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return anaMenuAyarTaslagi;
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>{
            const satir=liste.querySelector('[data-modul-anahtar="'+modul.anahtar+'"]');if(!satir)return modul;
            const yetkiler={Admin:'yazma'};satir.querySelectorAll('.ayar-rol-yetki-select').forEach(select=>{yetkiler[select.dataset.rol]=['yok','okuma','yazma'].includes(select.value)?select.value:'yok';});
            const kullaniciYetkileri={};satir.querySelectorAll('.ayar-kullanici-yetki').forEach(select=>{const anahtar=kullaniciYetkiAnahtari(select.dataset.kullanici);if(anahtar&&['yok','okuma','yazma'].includes(select.value))kullaniciYetkileri[anahtar]=select.value;});
            const aktif=Boolean(satir.querySelector('.ayar-modul-aktif')?.checked),roller=Object.entries(yetkiler).filter(([,seviye])=>seviye!=='yok').map(([rol])=>rol);
            return {...modul,ad:String(satir.querySelector('.ayar-modul-ad')?.value||'').trim()||modul.ad,aciklama:String(satir.querySelector('.ayar-modul-aciklama')?.value||'').trim()||modul.aciklama,yetkiler,kullaniciYetkileri,kullaniciBazliYetki:false,roller,aktif};
        });
        return anaMenuAyarTaslagi;
    }

function ayarlarKullaniciIstisnasiEkle(modulAnahtari){
        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();
        const satir=document.getElementById('ayarlarModulListesi')?.querySelector('[data-modul-anahtar="'+modulAnahtari+'"]'),secim=satir?.querySelector('.ayar-istisna-kullanici-sec')?.value,anahtar=kullaniciYetkiAnahtari(secim);
        if(!anahtar)return showToast('Önce kullanıcı seçin.','warning');
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>modul.anahtar===modulAnahtari?{...modul,kullaniciYetkileri:{...(modul.kullaniciYetkileri||{}),[anahtar]:'yazma'}}:modul);
        ayarlarModulListesiniCiz();
        const yeniSatir=document.getElementById('ayarlarModulListesi')?.querySelector('[data-modul-anahtar="'+modulAnahtari+'"]');
        if(yeniSatir){yeniSatir.open=true;const detay=yeniSatir.querySelector('.ayar-istisna-detay');if(detay)detay.open=true;}
        showToast('İstisna eklendi. Kalıcı olması için Ayarları Kaydet düğmesine basın.','success');
    }

function ayarlarKullaniciIstisnaYetkisiniGuncelle(modulAnahtari,kullaniciAnahtari,seviye){
        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        const anahtar=kullaniciYetkiAnahtari(kullaniciAnahtari),duzey=['yok','okuma','yazma'].includes(seviye)?seviye:'yok';
        if(!anahtar)return;
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>modul.anahtar===modulAnahtari?{...modul,kullaniciYetkileri:{...(modul.kullaniciYetkileri||{}),[anahtar]:duzey}}:modul);
    }

function ayarlarKullaniciIstisnasiSil(modulAnahtari,kullaniciAnahtari){
        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>{if(modul.anahtar!==modulAnahtari)return modul;const kullaniciYetkileri={...(modul.kullaniciYetkileri||{})};delete kullaniciYetkileri[kullaniciYetkiAnahtari(kullaniciAnahtari)];return {...modul,kullaniciYetkileri};});
        ayarlarModulListesiniCiz();
    }

function ayarlarModulListesiniCiz(){
        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return;
        if(!Array.isArray(anaMenuAyarTaslagi)||!anaMenuAyarTaslagi.length)anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);
        const seviyeSecenekleri=[['yok','Gizli'],['okuma','Sadece Okuma'],['yazma','Tam Yetki']];
        const seviyeEtiketleri=Object.fromEntries(seviyeSecenekleri);
        let yetkiKullanicilari=[];
        try{yetkiKullanicilari=anaMenuYetkiKullanicilari();}catch(error){console.warn('Yetki kullanıcıları hazırlanamadı:',error);}
        const kullaniciHaritasi=new Map(yetkiKullanicilari.map(k=>[kullaniciYetkiAnahtari(k.username),k]));
        const modulSatiri=(modul,index,kisilerAktif=true)=>{
            const rolAlanlari=[['Yonetici','Kullanıcı'],['Personel','Personel']].map(([rol,etiket])=>{const seviye=String(modul.yetkiler?.[rol]||'yok');return '<label class="ayar-rol-yetki"><span>'+etiket+'</span><select class="ayar-rol-yetki-select" data-rol="'+rol+'" data-seviye="'+seviye+'" onchange="this.dataset.seviye=this.value">'+seviyeSecenekleri.map(([deger,ad])=>'<option value="'+deger+'" '+(deger===seviye?'selected':'')+'>'+ad+'</option>').join('')+'</select></label>';}).join('');
            const istisnalar=kisilerAktif?Object.entries(modul.kullaniciYetkileri||{}).filter(([anahtar])=>kullaniciHaritasi.has(anahtar)):[];
            const istisnaSatirlari=istisnalar.length?istisnalar.map(([anahtar,seviye])=>{const kullanici=kullaniciHaritasi.get(anahtar),ad=String(kullanici?.ad||kullanici?.username||anahtar);return '<div class="ayar-kullanici-istisna"><strong title="'+escapeDashboardText(kullanici?.username||anahtar)+'">'+escapeDashboardText(ad)+'</strong><select class="ayar-kullanici-yetki" data-kullanici="'+escapeDashboardText(anahtar)+'" onchange="ayarlarKullaniciIstisnaYetkisiniGuncelle(\''+escapeDashboardText(modul.anahtar)+'\',\''+escapeDashboardText(anahtar)+'\',this.value)">'+seviyeSecenekleri.map(([deger,etiket])=>'<option value="'+deger+'" '+(deger===seviye?'selected':'')+'>'+etiket+'</option>').join('')+'</select><button type="button" title="Rol ayarına döndür" onclick="ayarlarKullaniciIstisnasiSil(\''+escapeDashboardText(modul.anahtar)+'\',\''+escapeDashboardText(anahtar)+'\')">×</button></div>';}).join(''):'<small style="color:#64748b;">Kişiye özel istisna yok; rol ayarı kullanılır.</small>';
            const kullanilabilir=kisilerAktif?yetkiKullanicilari.filter(k=>!Object.prototype.hasOwnProperty.call(modul.kullaniciYetkileri||{},kullaniciYetkiAnahtari(k.username))):[];
            const ekleme=kullanilabilir.length?'<div class="ayar-istisna-ekle"><select class="ayar-istisna-kullanici-sec"><option value="">Kullanıcı seçin...</option>'+kullanilabilir.map(k=>'<option value="'+escapeDashboardText(kullaniciYetkiAnahtari(k.username))+'">'+escapeDashboardText(String(k.ad||k.username))+'</option>').join('')+'</select><button type="button" onclick="ayarlarKullaniciIstisnasiEkle(\''+escapeDashboardText(modul.anahtar)+'\')">＋ İstisna Ekle</button></div>':'';
            const yetkiAlani='<div class="ayar-yetki-kapsam"><div class="ayar-yetki-grup"><span class="ayar-yetki-grup-baslik">Rol varsayılanları</span><div class="ayarlar-roller">'+rolAlanlari+'</div></div><details class="ayar-istisna-detay"><summary><span>Kişiye özel kullanıcı yetkileri</span><b>'+istisnalar.length+'</b></summary><div class="ayar-istisna-icerik"><div class="ayar-istisna-listesi">'+istisnaSatirlari+'</div>'+ekleme+'</div></details></div>';
            const yetkiOzetleri=[['Kullanıcı',seviyeEtiketleri[String(modul.yetkiler?.Yonetici||'yok')]||'Gizli'],['Personel',seviyeEtiketleri[String(modul.yetkiler?.Personel||'yok')]||'Gizli']].map(([rol,seviye])=>'<span>'+rol+': '+seviye+'</span>').join('')+(istisnalar.length?'<span>'+istisnalar.length+' kullanıcı istisnası</span>':'');
            return '<details class="ayarlar-modul-satiri" data-modul-anahtar="'+escapeDashboardText(modul.anahtar)+'"><summary class="ayarlar-modul-ozet"><span class="ayarlar-modul-no">'+(index+1)+'</span><span class="ayarlar-modul-kimlik"><strong>'+escapeDashboardText(modul.ad)+'</strong><small>'+escapeDashboardText(modul.aciklama)+'</small></span><span class="ayarlar-modul-yetki-ozet">'+yetkiOzetleri+'</span><span class="ayarlar-modul-durum '+(modul.aktif?'':'pasif')+'">'+(modul.aktif?'Aktif':'Kapalı')+'</span></summary><div class="ayarlar-modul-govde"><div class="ayarlar-modul-sira"><span>Sıra</span><button type="button" title="Yukarı taşı" onclick="ayarlarModulSirasiniDegistir('+index+',-1)">↑</button><button type="button" title="Aşağı taşı" onclick="ayarlarModulSirasiniDegistir('+index+',1)">↓</button></div><div class="ayarlar-modul-bilgiler"><label class="ayarlar-modul-alan"><span>Modül adı</span><input class="ayar-modul-ad" type="text" data-case-preserve="true" value="'+escapeDashboardText(modul.ad)+'"></label><label class="ayarlar-modul-alan"><span>Ana menü açıklaması</span><textarea class="ayar-modul-aciklama" data-case-preserve="true">'+escapeDashboardText(modul.aciklama)+'</textarea></label><div class="ayarlar-aktif"><label><input class="ayar-modul-aktif" type="checkbox" '+(modul.aktif?'checked':'')+' onchange="ayarlarModulAktifDurumunuGuncelle(this)"> Ana menüde göster</label></div></div>'+yetkiAlani+'</div></details>';
        };
        try{liste.innerHTML=anaMenuAyarTaslagi.map((modul,index)=>modulSatiri(modul,index,true)).join('');}
        catch(error){console.error('Ana Menü yetki listesi ayrıntılı çizilemedi:',error);anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);liste.innerHTML=anaMenuAyarTaslagi.map((modul,index)=>modulSatiri(modul,index,false)).join('');}
        if(!liste.children.length)liste.innerHTML='<div style="padding:18px;border:1px solid #fecaca;border-radius:12px;background:#fff1f2;color:#991b1b;font-weight:800;">Ana Menü listesi hazırlanamadı. Sayfayı yenileyip tekrar açın.</div>';
        liste.querySelectorAll('.ayarlar-modul-satiri').forEach(detay=>detay.addEventListener('toggle',()=>{if(!detay.open)return;liste.querySelectorAll('.ayarlar-modul-satiri[open]').forEach(diger=>{if(diger!==detay)diger.open=false;});}));
        if (!yetkiMatrisiniDuzenleyebilir()) liste.querySelectorAll('input,select,button,textarea').forEach(field=>field.disabled=true);
        ayarlarModulListesiniFiltrele(document.getElementById('ayarlarModulAra')?.value||'');
    }

function ayarlarAnaMenuPaneliniYenile(){
        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return;
        try{
            const kayitli=Array.isArray(uygulamaAyarlari?.anaMenuModulleri)&&uygulamaAyarlari.anaMenuModulleri.length?uygulamaAyarlari.anaMenuModulleri:VARSAYILAN_ANA_MENU_MODULLERI;
            anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(kayitli);
        }catch(error){console.error('Ana Menü ayarları hazırlanamadı:',error);anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);}
        ayarlarModulListesiniCiz();
    }

function ayarlarModulSirasiniDegistir(index,yons){
        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();const hedef=index+yons;if(hedef<0||hedef>=anaMenuAyarTaslagi.length)return;[anaMenuAyarTaslagi[index],anaMenuAyarTaslagi[hedef]]=[anaMenuAyarTaslagi[hedef],anaMenuAyarTaslagi[index]];anaMenuAyarTaslagi=anaMenuAyarTaslagi.map((m,sira)=>({...m,sira}));ayarlarModulListesiniCiz();
    }

function anaMenuAyarlariniFormdanOku(){if(!yetkiMatrisiniDuzenleyebilir())return anaMenuModulAyarlariniDuzelt();return anaMenuModulAyarlariniDuzelt(anaMenuAyarTaslaginiFormdanOku().map((m,sira)=>({...m,sira})));}

function yetkiMatrisiniDuzenleyebilir() { return activeUser?.rol === 'Admin' && anaMenuModulYazmaYetkisiVar('ayarlar'); }
function kullaniciYetkiMatrisiniKoru(yeniAyarlar, kayitliAyarlar) {
    if (activeUser?.rol === 'Admin') return yeniAyarlar;
    if (Object.prototype.hasOwnProperty.call(kayitliAyarlar || {}, 'anaMenuModulleri')) yeniAyarlar.anaMenuModulleri = kayitliAyarlar.anaMenuModulleri;
    else delete yeniAyarlar.anaMenuModulleri;
    return yeniAyarlar;
}


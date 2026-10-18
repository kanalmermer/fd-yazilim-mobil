
    const EVRAK_HAZIR_KATEGORILER = [
        {id:'vergi-levhasi',ad:'Vergi Levhası',aciklama:'Yıllık vergi levhaları',ikon:'🧾'},
        {id:'ticaret-sicil',ad:'Ticaret Sicil Belgeleri',aciklama:'Sicil gazeteleri ve tescil belgeleri',ikon:'🏛️'},
        {id:'imza-sirkuleri',ad:'İmza Sirküleri',aciklama:'Yetkili imza ve sirküler belgeleri',ikon:'✍️'},
        {id:'faaliyet-belgesi',ad:'Faaliyet Belgesi',aciklama:'Oda ve faaliyet belgeleri',ikon:'📋'},
        {id:'oda-kayit',ad:'Oda Kayıt Belgeleri',aciklama:'Oda kayıt ve üyelik belgeleri',ikon:'🏢'},
        {id:'yetki-belgeleri',ad:'Yetki Belgeleri',aciklama:'Yetki, izin ve ruhsat belgeleri',ikon:'🪪'},
        {id:'sozlesmeler',ad:'Sözleşmeler',aciklama:'Şirket sözleşmeleri ve protokoller',ikon:'🤝'},
        {id:'diger',ad:'Diğer Evraklar',aciklama:'Diğer kurumsal belgeler',ikon:'📁'}
    ];
    let evrakKayitlari = [];
    let evrakAktifKategori = 'tumu';
    let evrakYukleniyor = false;
    let evrakDuzenlemeId = '';
    let evrakKategoriDuzenlemeId = '';
    let evrakOnizlemeId = '';
    let evrakWhatsappDuzenlemeId = '';
    let evrakWhatsappEvrakId = '';
    let evrakWhatsappGonderilecekIds = [];
    const evrakWhatsappSepeti = new Set();

    fdUygulamaSekmeTanimlari.evrak = {ad:'Evrak Takip',ikon:'🗂️',acilis:'openEvrakTakipApp'};
    fdSekmeFonksiyonlari.openEvrakTakipApp = 'evrak';
    if (!fdSekmeAlanlari.includes('evrakTakipApp')) fdSekmeAlanlari.push('evrakTakipApp');
    ANA_MENU_MODUL_KOKLERI.evrak = '#evrakTakipApp';

    function evrakMetin(deger){
        return String(deger || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');
    }
    function evrakKategoriIkonu(ad){
        const a=evrakMetin(ad);
        if(/vergi|maliye/.test(a))return '🧾';
        if(/cevre|atik|surdurulebilir/.test(a))return '🌿';
        if(/analiz|laboratuvar|test/.test(a))return '🔬';
        if(/ticaret|sicil|tescil/.test(a))return '🏛️';
        if(/imza/.test(a))return '✍️';
        if(/faaliyet|rapor/.test(a))return '📋';
        if(/oda|uyelik/.test(a))return '🏢';
        if(/yetki|ruhsat|izin|lisans/.test(a))return '🪪';
        if(/sozlesme|protokol/.test(a))return '🤝';
        if(/personel|calisan/.test(a))return '👥';
        if(/kalite|iso|sertifika/.test(a))return '✅';
        if(/ihracat|gumruk/.test(a))return '🌍';
        if(/sigorta|police/.test(a))return '🛡️';
        if(/banka|finans|kredi/.test(a))return '🏦';
        return '📁';
    }
    function evrakYeniId(onEk){return String(onEk || 'evrak') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);}
    function evrakTarih(deger){if(!deger)return '-';const d=new Date(String(deger).length===10?String(deger)+'T00:00:00':deger);return Number.isNaN(d.getTime())?'-':d.toLocaleDateString('tr-TR');}
    function evrakBoyut(deger){const n=Number(deger||0);if(!n)return '-';if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' KB';return (n/1024/1024).toFixed(1).replace('.',',')+' MB';}
    function evrakBildirim(mesaj,tur){if(typeof showToast==='function')showToast(mesaj,tur||'success');else alert(mesaj);}
    function evrakBelgeleri(){return evrakKayitlari.filter(x=>x&&x.tip==='evrak');}
    function evrakKategorileri(){
        const harita=new Map(EVRAK_HAZIR_KATEGORILER.map(x=>[x.id,{...x,hazir:true}]));
        evrakKayitlari.filter(x=>x&&x.tip==='kategori').forEach(x=>harita.set(String(x.id),{id:String(x.id),ad:String(x.ad||'Adsız Kategori'),aciklama:String(x.aciklama||''),ikon:evrakKategoriIkonu(x.ad),hazir:false}));
        return [...harita.values()].sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr',{sensitivity:'base'}));
    }
    function evrakWhatsappKisileri(){return evrakKayitlari.filter(x=>x&&x.tip==='whatsapp_kisi').sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr-TR',{sensitivity:'base'}));}
    function evrakWhatsappNumarasi(deger){let n=String(deger||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0'))n='90'+n.slice(1);else if(n.length===10)n='90'+n;return n;}
    function evrakWhatsappKisiFormunuTemizle(){evrakWhatsappDuzenlemeId='';document.getElementById('evrakWhatsappKisiForm')?.reset();document.getElementById('evrakWhatsappKisiId').value='';document.getElementById('evrakWhatsappKisiKaydetBtn').textContent='Kişiyi Kaydet';document.getElementById('evrakWhatsappKisiVazgecBtn').style.display='none';}
    function evrakWhatsappKisiListesiniCiz(){const alan=document.getElementById('evrakWhatsappKisiListesi'),kisiler=evrakWhatsappKisileri();if(!alan)return;alan.innerHTML=kisiler.length?kisiler.map(k=>'<div class="evrak-wa-kisi"><div><strong>'+escapeDashboardText(k.ad||'-')+'</strong><small>+'+escapeDashboardText(k.telefon||'')+'</small></div><div class="evrak-wa-kisi-actions"><button class="evrak-icon-btn edit" type="button" title="Düzenle" onclick="evrakWhatsappKisiDuzenle(\''+escapeDashboardText(String(k.id))+'\')">✏</button><button class="evrak-icon-btn delete" type="button" title="Sil" onclick="evrakWhatsappKisiSil(\''+escapeDashboardText(String(k.id))+'\')">🗑</button></div></div>').join(''):'<div class="evrak-wa-empty">Henüz WhatsApp kişisi eklenmedi.</div>';}
    function evrakWhatsappKisileriniAc(){if(!anaMenuModulYazmaYetkisiVar('evrak'))return;evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();document.getElementById('modalEvrakWhatsappKisiler').style.display='flex';setTimeout(()=>document.getElementById('evrakWhatsappKisiAdi')?.focus(),50);}
    function evrakWhatsappKisiDuzenle(id){const k=evrakWhatsappKisileri().find(x=>String(x.id)===String(id));if(!k)return;evrakWhatsappDuzenlemeId=String(k.id);document.getElementById('evrakWhatsappKisiId').value=String(k.id);document.getElementById('evrakWhatsappKisiAdi').value=k.ad||'';document.getElementById('evrakWhatsappKisiTelefon').value=k.telefon||'';document.getElementById('evrakWhatsappKisiKaydetBtn').textContent='Değişiklikleri Kaydet';document.getElementById('evrakWhatsappKisiVazgecBtn').style.display='';}
    async function evrakWhatsappKisiKaydet(event){event.preventDefault();if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const ad=document.getElementById('evrakWhatsappKisiAdi').value.trim(),telefon=evrakWhatsappNumarasi(document.getElementById('evrakWhatsappKisiTelefon').value),id=String(evrakWhatsappDuzenlemeId||'');if(!ad||!/^[1-9]\d{9,14}$/.test(telefon))return alert('Geçerli bir WhatsApp numarası girin. Örnek: 05xx xxx xx xx');if(evrakWhatsappKisileri().some(x=>String(x.id)!==id&&String(x.telefon)===telefon))return alert('Bu WhatsApp numarası zaten kayıtlı.');const eski=id?evrakKayitlari.find(x=>String(x.id)===id):null,kayit=eski?{...eski,ad,telefon,duzenlemeZamani:new Date().toISOString()}:{id:evrakYeniId('whatsapp'),tip:'whatsapp_kisi',sirketId:activeUser.sirketId,ad,telefon,olusturmaZamani:new Date().toISOString()};const btn=event.submitter;btn.disabled=true;try{await evrakKaydiYaz(kayit);await evrakVerileriniYukle();evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();evrakBildirim(id?'WhatsApp kişisi güncellendi.':'WhatsApp kişisi eklendi.');}catch(hata){console.error(hata);alert('WhatsApp kişisi kaydedilemedi. Lütfen tekrar deneyin.');}finally{btn.disabled=false;}}
    async function evrakWhatsappKisiSil(id){if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const k=evrakWhatsappKisileri().find(x=>String(x.id)===String(id));if(!k||!confirm('“'+k.ad+'” WhatsApp kişilerinden silinsin mi?'))return;try{const sonuc=await supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','evraktakip').eq('legacy_id',String(id));if(sonuc.error)throw sonuc.error;await evrakVerileriniYukle();evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();evrakBildirim('WhatsApp kişisi silindi.');}catch(hata){console.error(hata);alert('WhatsApp kişisi silinemedi.');}}
    function evrakWhatsappSepetiniGuncelle(){const mevcut=new Set(evrakBelgeleri().map(x=>String(x.id)));[...evrakWhatsappSepeti].forEach(id=>{if(!mevcut.has(id))evrakWhatsappSepeti.delete(id);});const adet=evrakWhatsappSepeti.size,wa=document.getElementById('evrakSepetWhatsappBtn'),indir=document.getElementById('evrakSepetIndirBtn'),temizle=document.getElementById('evrakSepetTemizleBtn');if(wa){wa.style.display=adet?'inline-flex':'none';wa.textContent='💬 Gönder ('+adet+')';}if(indir){indir.style.display=adet?'inline-flex':'none';indir.textContent='⬇ Toplu İndir ('+adet+')';}if(temizle)temizle.style.display=adet?'inline-flex':'none';}
    function evrakWhatsappSepetDegistir(id,secili){id=String(id);if(secili)evrakWhatsappSepeti.add(id);else evrakWhatsappSepeti.delete(id);evrakWhatsappSepetiniGuncelle();}
    function evrakWhatsappGorunenleriSec(secili){document.querySelectorAll('#evrakListeAlani .evrak-secim-kutu[value]').forEach(kutu=>{kutu.checked=secili;evrakWhatsappSepetDegistir(kutu.value,secili);});}
    function evrakWhatsappSepetiniTemizle(){evrakWhatsappSepeti.clear();document.querySelectorAll('#evrakListeAlani .evrak-secim-kutu').forEach(kutu=>kutu.checked=false);evrakWhatsappSepetiniGuncelle();}
    function evrakWhatsappSepetBelgeleri(){return [...evrakWhatsappSepeti].map(id=>evrakBelgeleri().find(x=>String(x.id)===id)).filter(x=>x&&(x.dosya?.id||x.dosya?.url));}
    function evrakWhatsappKisiSeciminiGoster(baslik){document.getElementById('evrakWhatsappGonderBaslik').textContent=baslik;const alan=document.getElementById('evrakWhatsappGonderListesi'),kisiler=evrakWhatsappKisileri();alan.innerHTML=kisiler.length?kisiler.map(k=>'<button class="evrak-wa-secim" type="button" onclick="evrakWhatsappGonder(\''+escapeDashboardText(String(k.id))+'\')"><span>💬</span><span><strong>'+escapeDashboardText(k.ad||'-')+'</strong><small>+'+escapeDashboardText(k.telefon||'')+'</small></span></button>').join(''):'<div class="evrak-wa-empty">Kayıtlı WhatsApp kişisi yok.'+(anaMenuModulYazmaYetkisiVar('evrak')?'<br><button class="btn-modern" type="button" style="margin-top:10px" onclick="modalKapat(\'modalEvrakWhatsappGonder\');evrakWhatsappKisileriniAc()">Kişi Ekle</button>':'')+'</div>';document.getElementById('modalEvrakWhatsappGonder').style.display='flex';}
    function evrakWhatsappTopluSeciminiAc(){const belgeler=evrakWhatsappSepetBelgeleri();if(!belgeler.length)return alert('Göndermek için en az bir evrak seçin.');evrakWhatsappGonderilecekIds=belgeler.map(x=>String(x.id));evrakWhatsappKisiSeciminiGoster('💬 '+belgeler.length+' Evrakı Gönder');}
    async function evrakWhatsappSepetiTopluIndir(){const belgeler=evrakWhatsappSepetBelgeleri(),btn=document.getElementById('evrakSepetIndirBtn');if(!belgeler.length)return alert('İndirmek için en az bir evrak seçin.');if(typeof JSZip==='undefined')return alert('Toplu indirme hazırlanamadı.');btn.disabled=true;try{const zip=new JSZip();for(let i=0;i<belgeler.length;i++){const evrak=belgeler[i];btn.textContent='Hazırlanıyor '+(i+1)+' / '+belgeler.length;const dosya=await fdYazilimDriveDosyaIndir(evrak.dosya.id,'EVRAK TAKİP'),ad=dosya.ad||evrak.dosya.ad||((evrak.evrakAdi||'evrak')+'.pdf');zip.file(String(i+1).padStart(2,'0')+'_'+ad,dosya.base64,{base64:true});}const arsiv=await zip.generateAsync({type:'blob'},bilgi=>{btn.textContent='Arşivleniyor %'+Math.round(bilgi.percent);}),adres=URL.createObjectURL(arsiv),a=document.createElement('a');a.href=adres;a.download='EVRAKLAR_'+new Date().toISOString().slice(0,10)+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(adres),1500);evrakWhatsappSepetiniTemizle();evrakBildirim(belgeler.length+' evrak indirildi.');}catch(hata){console.error(hata);alert('Seçilen evraklar indirilemedi. Lütfen tekrar deneyin.');}finally{btn.disabled=false;evrakWhatsappSepetiniGuncelle();}}
    function evrakWhatsappSeciminiAc(id){const kayit=evrakBelgeleri().find(x=>String(x.id)===String(id));if(!kayit?.dosya?.id&&!kayit?.dosya?.url)return alert('Bu evrakın gönderilecek dosya bağlantısı bulunamadı.');evrakWhatsappGonderilecekIds=[String(kayit.id)];evrakWhatsappKisiSeciminiGoster('💬 '+(kayit.evrakAdi||'Evrak')+' Gönder');}
    function evrakWhatsappGonder(kisiId){
        if(!activeUser?.sirketId)return alert('Şirket oturumu bulunamadı.');
        if(typeof anaMenuModulErisimiVar==='function'&&!anaMenuModulErisimiVar('evrak'))return alert('Evrak paylaşma yetkiniz yok.');
        const kisi=evrakWhatsappKisileri().find(x=>String(x.id)===String(kisiId)),ids=[...new Set(evrakWhatsappGonderilecekIds.map(String))],belgeler=ids.map(id=>evrakBelgeleri().find(x=>String(x.id)===id));
        if(!kisi||!ids.length)return;
        if(belgeler.some(x=>!x||(!x.dosya?.id&&!x.dosya?.url&&!x.dosya?.webViewLink)))return alert('Seçilen evraklardan birinin dosya bağlantısı bulunamadı. Seçimi kontrol edin.');
        const telefon=evrakWhatsappNumarasi(kisi.telefon);if(!/^[1-9]\d{9,14}$/.test(telefon))return alert('Kişi numarası geçerli değil.');
        const satirlar=belgeler.map((kayit,i)=>(belgeler.length>1?(i+1)+'. ':'')+(kayit.evrakAdi||'Evrak')+(kayit.yil?' ('+kayit.yil+')':'')+'\n'+evrakDosyaBaglantisi(kayit.dosya));
        const mesaj='Merhaba,\n'+(belgeler.length>1?'İstediğiniz evrakları gönderiyorum:':'Evrakı iletiyorum:')+'\n\n'+satirlar.join('\n\n');
        // Open synchronously from the user's click; no file preparation or helper.
        window.open('https:\x2f\x2fwa.me/'+telefon+'?text='+encodeURIComponent(mesaj),'_blank','noopener,noreferrer');
        modalKapat('modalEvrakWhatsappGonder');
    }
    async function evrakVerileriniYukle(){
        if(!activeUser?.sirketId)throw new Error('Şirket oturumu bulunamadı.');
        const tum=[];const boyut=1000;
        for(let bas=0;;bas+=boyut){
            const sonuc=await supabaseClient.from('portal_records').select('legacy_id,data,record_year').eq('company_id',activeUser.sirketId).eq('module','evraktakip').order('id',{ascending:true}).range(bas,bas+boyut-1);
            if(sonuc.error)throw sonuc.error;
            const paket=sonuc.data||[];tum.push(...paket);
            if(paket.length<boyut)break;
        }
        evrakKayitlari=tum.map(x=>({...x.data,id:String(x.data?.id||x.legacy_id)}));
    }
    async function evrakKaydiYaz(kayit){
        const satir={company_id:activeUser.sirketId,module:'evraktakip',legacy_id:String(kayit.id),record_year:Number(kayit.yil||new Date().getFullYear()),employee_legacy_id:null,data:kayit};
        const sonuc=await supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}).select('legacy_id,data').single();
        if(sonuc.error)throw sonuc.error;
        if(!sonuc.data?.data)throw new Error('Evrak kaydı doğrulanamadı.');
        return {...sonuc.data.data,id:String(sonuc.data.data.id||sonuc.data.legacy_id)};
    }
    async function openEvrakTakipApp(){
        if(!anaMenuModulErisimiVar('evrak'))return;
        anaMenuDonusButonunuGoster();
        fdTumUygulamaAlanlariniGizle();
        document.getElementById('evrakTakipApp').style.display='block';
        const yazabilir=anaMenuModulYazmaYetkisiVar('evrak');
        document.getElementById('evrakKategoriEkleBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakBelgeEkleBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakWhatsappKisiBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakListeAlani').innerHTML='<div class="evrak-empty"><span>⏳</span><strong>Evraklar yükleniyor</strong><div>Kayıtlar hazırlanıyor.</div></div>';
        try{await evrakVerileriniYukle();evrakEkraniniCiz();}catch(hata){console.error(hata);document.getElementById('evrakListeAlani').innerHTML='<div class="evrak-empty"><span>⚠️</span><strong>Evraklar yüklenemedi</strong><div>'+'Lütfen sayfayı yenileyip tekrar deneyin.'+'</div></div>';}
    }
    function evrakKategoriSec(id){
        evrakAktifKategori=String(id||'tumu');
        const arama=document.getElementById('evrakArama');if(arama)arama.value='';
        evrakEkraniniCiz();
    }
    function evrakAramayiTemizle(){const a=document.getElementById('evrakArama');if(a){a.value='';a.focus();}evrakEkraniniCiz();}
    function evrakSonKullanmaEtiketi(tarih){
        if(!tarih)return '<span class="evrak-muted">Süresiz / belirtilmedi</span>';
        const bitis=new Date(tarih+'T23:59:59'),bugun=new Date(),gun=Math.ceil((bitis-bugun)/86400000),sinif=gun<0?' expired':(gun<=45?' soon':'');
        const metin=gun<0?'Süresi doldu':(gun<=45?gun+' gün kaldı':'Geçerli');
        return '<span class="evrak-expiry'+sinif+'" title="'+escapeDashboardText(evrakTarih(tarih))+'">'+escapeDashboardText(metin)+'</span>';
    }
    function evrakDosyaIkonu(dosya){
        const tip=String(dosya?.mimeType||'').toLowerCase(),ad=String(dosya?.ad||'').toLowerCase();
        if(tip.includes('pdf')||ad.endsWith('.pdf'))return '📕';
        if(tip.includes('image'))return '🖼️';
        if(tip.includes('word')||ad.endsWith('.doc')||ad.endsWith('.docx'))return '📘';
        if(tip.includes('excel')||tip.includes('spreadsheet')||ad.endsWith('.xls')||ad.endsWith('.xlsx'))return '📗';
        return '📄';
    }
    function evrakEkraniniCiz(){
        const listeAlani=document.getElementById('evrakListeAlani');if(!listeAlani)return;evrakWhatsappSepetiniGuncelle();
        const kategoriler=evrakKategorileri(),belgeler=evrakBelgeleri(),buYil=String(new Date().getFullYear()),aramaHam=String(document.getElementById('evrakArama')?.value||'').trim(),arama=evrakMetin(aramaHam);
        document.getElementById('evrakStatKategori').textContent=kategoriler.length;
        document.getElementById('evrakStatBelge').textContent=belgeler.length;
        document.getElementById('evrakStatBuYil').textContent=belgeler.filter(x=>String(x.yil)===buYil).length;
        document.getElementById('evrakKategoriOzeti').textContent=kategoriler.length+' kategori';
        const kategoriHaritasi=new Map(kategoriler.map(x=>[String(x.id),x])),yazabilir=anaMenuModulYazmaYetkisiVar('evrak');
        const tumButon='<button class="evrak-kategori '+(evrakAktifKategori==='tumu'?'active':'')+'" type="button" onclick="evrakKategoriSec(\'tumu\')"><span class="evrak-kategori-ikon">🗂️</span><span><strong>Tüm Evraklar</strong><small>Bütün kategoriler</small></span><span class="evrak-kategori-count">'+belgeler.length+'</span></button>';
        document.getElementById('evrakKategoriListesi').innerHTML=tumButon+kategoriler.map(k=>{
            const adet=belgeler.filter(x=>String(x.kategoriId)===String(k.id)).length;
            return '<button class="evrak-kategori '+(evrakAktifKategori===String(k.id)?'active':'')+'" type="button" onclick="evrakKategoriSec(&quot;'+escapeDashboardText(String(k.id))+'&quot;)"'+(yazabilir?' oncontextmenu="event.preventDefault();evrakKategoriFormuAc(&quot;'+escapeDashboardText(String(k.id))+'&quot;);return false;" title="Sağ tıklayarak düzenleyin"':'')+'><span class="evrak-kategori-ikon">'+escapeDashboardText(k.ikon||'📁')+'</span><span><strong>'+escapeDashboardText(k.ad)+'</strong><small>'+escapeDashboardText(k.aciklama||'Belge kategorisi')+'</small></span><span class="evrak-kategori-count">'+adet+'</span></button>';
        }).join('');
        let liste=belgeler.filter(x=>{
            const k=kategoriHaritasi.get(String(x.kategoriId));
            const aranan=evrakMetin([x.evrakAdi,x.yil,x.aciklama,x.dosya?.ad,k?.ad,x.belgeTarihi,x.gecerlilikBitis].join(' '));
            if(arama)return aranan.includes(arama);
            return evrakAktifKategori==='tumu'||String(x.kategoriId)===evrakAktifKategori;
        });
        liste.sort((a,b)=>Number(b.yil||0)-Number(a.yil||0)||String(b.belgeTarihi||b.olusturmaZamani||'').localeCompare(String(a.belgeTarihi||a.olusturmaZamani||'')));
        const aktifKat=kategoriHaritasi.get(evrakAktifKategori);
        document.getElementById('evrakListeBaslik').textContent=aramaHam?'“'+aramaHam+'” arama sonuçları':(aktifKat?.ad||'Tüm Evraklar');
        document.getElementById('evrakListeOzeti').textContent=liste.length+' belge / sürüm';
        if(!liste.length){
            listeAlani.innerHTML='<div class="evrak-empty"><span>🔍</span><strong>'+(aramaHam?'Aramanızla eşleşen evrak bulunamadı.':'Bu kategoride henüz evrak yok.')+'</strong><div>'+(aramaHam?'Başka bir evrak adı, yıl veya kategori deneyin.':'Yeni sürüm eklemek için “Evrak Yükle” düğmesini kullanın.')+'</div></div>';return;
        }
        listeAlani.innerHTML='<table class="evrak-table"><thead><tr><th><input class="evrak-secim-kutu" type="checkbox" title="Görünenlerin tümünü seç" onchange="evrakWhatsappGorunenleriSec(this.checked)"></th><th>Evrak</th><th>Kategori</th><th>Yıl</th><th>Belge Tarihi</th><th>Geçerlilik</th><th style="text-align:right">İşlem</th></tr></thead><tbody>'+liste.map(x=>{
            const k=kategoriHaritasi.get(String(x.kategoriId))||{ad:x.kategoriAdi||'Diğer'};
            const surumSayisi=1+(Array.isArray(x.surumGecmisi)?x.surumGecmisi.length:0);
            return '<tr><td class="evrak-secim-hucre"><input class="evrak-secim-kutu" type="checkbox" value="'+escapeDashboardText(String(x.id))+'"'+(evrakWhatsappSepeti.has(String(x.id))?' checked':'')+' onchange="evrakWhatsappSepetDegistir(\''+escapeDashboardText(String(x.id))+'\',this.checked)"></td><td><div class="evrak-doc-name"><span class="evrak-file-icon">'+evrakDosyaIkonu(x.dosya)+'</span><span><strong>'+escapeDashboardText(x.evrakAdi||x.dosya?.ad||'Adsız Evrak')+'</strong><small>'+surumSayisi+' sürüm'+(x.aciklama?' · '+escapeDashboardText(x.aciklama):'')+'</small></span></div></td><td>'+escapeDashboardText(k.ad)+'</td><td><span class="evrak-year">'+escapeDashboardText(x.yil||'-')+'</span></td><td>'+evrakTarih(x.belgeTarihi)+'</td><td>'+evrakSonKullanmaEtiketi(x.gecerlilikBitis)+'</td><td><div class="evrak-row-actions"><button class="evrak-icon-btn view" type="button" title="Güncel belgeyi görüntüle" onclick="evrakGoruntule(\''+escapeDashboardText(String(x.id))+'\')">👁</button><button class="evrak-icon-btn" type="button" title="Tüm sürümleri göster" onclick="evrakSurumGecmisiAc(\''+escapeDashboardText(String(x.id))+'\')">🗂️</button><button class="evrak-icon-btn whatsapp" type="button" title="WhatsApp ile gönder" onclick="evrakWhatsappSeciminiAc(\''+escapeDashboardText(String(x.id))+'\')">💬</button>'+(yazabilir?'<button class="evrak-icon-btn edit" type="button" title="Evrakı düzenle / yeni sürüm yükle" onclick="evrakBelgeFormuAc(\''+escapeDashboardText(String(x.id))+'\')">✏</button><button class="evrak-icon-btn delete" type="button" title="Evrakı sil" onclick="evrakBelgeSil(\''+escapeDashboardText(String(x.id))+'\')">🗑</button>':'')+'</div></td></tr>';
        }).join('')+'</tbody></table>';
    }
    function evrakKategoriFormuAc(id=''){
        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;
        const mevcut=id?evrakKategorileri().find(x=>String(x.id)===String(id)):null;
        evrakKategoriDuzenlemeId=mevcut?String(mevcut.id):'';
        document.getElementById('evrakKategoriDuzenlemeId').value=evrakKategoriDuzenlemeId;
        document.getElementById('evrakKategoriModalBaslik').textContent=mevcut?'Kategoriyi Düzenle':'Yeni Evrak Kategorisi';
        document.getElementById('evrakYeniKategoriAdi').value=mevcut?.ad||'';
        document.getElementById('evrakYeniKategoriAciklama').value=mevcut?.aciklama||'';
        document.getElementById('evrakKategoriKaydetBtn').textContent=mevcut?'Değişiklikleri Kaydet':'Kategoriyi Ekle';
        document.getElementById('modalEvrakKategori').style.display='flex';
        setTimeout(()=>document.getElementById('evrakYeniKategoriAdi').focus(),50);
    }
    async function evrakKategoriKaydet(event){
        event.preventDefault();
        const ad=document.getElementById('evrakYeniKategoriAdi').value.trim(),aciklama=document.getElementById('evrakYeniKategoriAciklama').value.trim(),id=String(evrakKategoriDuzenlemeId||'');
        if(!ad)return;
        if(evrakKategorileri().some(x=>String(x.id)!==id&&evrakMetin(x.ad)===evrakMetin(ad)))return alert('Bu adla bir kategori zaten var.');
        const kayitli=id?evrakKayitlari.find(x=>x&&x.tip==='kategori'&&String(x.id)===id):null;
        const kayit=kayitli?{...kayitli,ad,aciklama,ikon:evrakKategoriIkonu(ad),duzenlemeZamani:new Date().toISOString(),duzenleyen:activeUser.username||activeUser.ad||''}:{id:id||evrakYeniId('kategori'),tip:'kategori',sirketId:activeUser.sirketId,ad,aciklama,ikon:evrakKategoriIkonu(ad),olusturmaZamani:new Date().toISOString(),olusturan:activeUser.username||activeUser.ad||''};
        const buton=event.submitter;buton.disabled=true;buton.textContent=id?'Kaydediliyor...':'Ekleniyor...';
        try{
            await evrakKaydiYaz(kayit);await evrakVerileriniYukle();evrakAktifKategori=String(kayit.id);evrakKategoriDuzenlemeId='';modalKapat('modalEvrakKategori');evrakEkraniniCiz();evrakBildirim(id?'Kategori güncellendi.':'Kategori eklendi.');
        }catch(hata){
            console.error(hata);alert((id?'Kategori güncellenemedi. ':'Kategori eklenemedi. ')+String(hata?.message||'Lütfen tekrar deneyin.'));
        }finally{
            buton.disabled=false;buton.textContent=id?'Değişiklikleri Kaydet':'Kategoriyi Ekle';
        }
    }    function evrakBelgeFormuAc(id=''){
        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;
        const kategoriler=evrakKategorileri(),sec=document.getElementById('evrakKategoriSec'),mevcut=id?evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id)):null;
        evrakDuzenlemeId=mevcut?String(mevcut.id):'';
        document.getElementById('evrakDuzenlemeId').value=evrakDuzenlemeId;
        document.getElementById('evrakBelgeModalBaslik').textContent=mevcut?'✏ Evrakı Düzenle':'🗂️ Yeni Evrak / Sürüm Ekle';
        sec.innerHTML=kategoriler.map(x=>'<option value="'+escapeDashboardText(x.id)+'">'+escapeDashboardText(x.ad)+'</option>').join('');
        document.getElementById('evrakDosya').value='';
        const dosyaGrubu=document.getElementById('evrakDosya').closest('.form-group'),bilgi=document.querySelector('#evrakBelgeForm .evrak-form-note');
        if(mevcut){
            sec.value=String(mevcut.kategoriId||'diger');
            document.getElementById('evrakAdi').value=mevcut.evrakAdi||'';
            document.getElementById('evrakYil').value=mevcut.yil||new Date().getFullYear();
            document.getElementById('evrakBelgeTarihi').value=mevcut.belgeTarihi||'';
            document.getElementById('evrakGecerlilikBitis').value=mevcut.gecerlilikBitis||'';
            document.getElementById('evrakAciklama').value=mevcut.aciklama||'';
            dosyaGrubu.style.display='';
            document.getElementById('evrakDosya').required=false;
            document.getElementById('evrakDosyaLabel').textContent='Yeni Sürüm Dosyası (isteğe bağlı)';
            document.getElementById('evrakDosyaYardim').textContent='Yeni dosya seçerseniz mevcut dosya silinmez; önceki sürüm olarak saklanır. PDF, görsel, Word veya Excel · en fazla 20 MB';
            document.getElementById('evrakKaydetBtn').textContent='Değişiklikleri Kaydet';
            if(bilgi)bilgi.textContent='Yalnızca bilgileri değiştirebilir veya yeni dosya seçerek yeni sürüm oluşturabilirsiniz. Eski dosyalar sürüm geçmişinde korunur.';
        }else{
            sec.value=evrakAktifKategori!=='tumu'&&kategoriler.some(x=>String(x.id)===String(evrakAktifKategori))?String(evrakAktifKategori):'vergi-levhasi';
            document.getElementById('evrakAdi').value=kategoriler.find(x=>String(x.id)===String(sec.value))?.ad||'';
            document.getElementById('evrakYil').value=new Date().getFullYear();
            document.getElementById('evrakBelgeTarihi').value='';
            document.getElementById('evrakGecerlilikBitis').value='';
            document.getElementById('evrakAciklama').value='';
            dosyaGrubu.style.display='';
            document.getElementById('evrakDosya').required=true;
            document.getElementById('evrakDosyaLabel').textContent='Dosya *';
            document.getElementById('evrakDosyaYardim').textContent='PDF, görsel, Word veya Excel · en fazla 20 MB';
            document.getElementById('evrakKaydetBtn').textContent='Kaydet';
            if(bilgi)bilgi.textContent='Aynı evrakın yenisi çıktığında eski kaydı silmeyin; yeni yıl ve dosyayla tekrar ekleyin. Böylece tüm sürümler birlikte görünür.';
        }
        sec.onchange=function(){const k=evrakKategorileri().find(x=>String(x.id)===String(sec.value)),ad=document.getElementById('evrakAdi');if(!mevcut&&k)ad.value=k.ad;};
        document.getElementById('modalEvrakBelge').style.display='flex';
    }
    function evrakDosyaMimeTuru(dosya){
        const uzanti=String(dosya?.name||'').split('.').pop().toLocaleLowerCase('tr-TR');
        const turler={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
        return turler[uzanti]||'';
    }
    function evrakDosyayiOku(dosya){return new Promise((resolve,reject)=>{const okuyucu=new FileReader();okuyucu.onload=()=>{const base64=String(okuyucu.result||'').split(',')[1]||'';base64?resolve(base64):reject(new Error('Seçilen dosya okunamadı.'));};okuyucu.onerror=()=>reject(new Error('Seçilen dosya okunamadı.'));okuyucu.readAsDataURL(dosya);});}
    async function evrakBelgeKaydet(event){
        event.preventDefault();if(evrakYukleniyor)return;
        const mevcut=evrakDuzenlemeId?evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(evrakDuzenlemeId)):null,dosya=document.getElementById('evrakDosya').files[0];
        if(!mevcut&&!dosya)return alert('Yüklenecek dosyayı seçin.');
        const azami=20*1024*1024;if(dosya&&dosya.size>azami)return alert('Dosya en fazla 20 MB olabilir.');
        const mimeType=dosya?evrakDosyaMimeTuru(dosya):'';if(dosya&&!mimeType)return alert('Bu dosya türü desteklenmiyor. PDF, JPG, PNG, WEBP, Word veya Excel dosyası seçin.');
        const kategori=evrakKategorileri().find(x=>String(x.id)===String(document.getElementById('evrakKategoriSec').value));if(!kategori)return alert('Kategori seçin.');
        const buton=document.getElementById('evrakKaydetBtn');evrakYukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';let driveDosyasi=null,kayitAsamasi='evrak bilgileri hazırlanırken';
        try{
            let kayit;
            if(mevcut){
                const simdi=new Date().toISOString(),duzenleyen=activeUser.username||activeUser.ad||'',gecmis=Array.isArray(mevcut.surumGecmisi)?[...mevcut.surumGecmisi]:[];
                let yeniDosya=mevcut.dosya,surumNo=Math.max(1,Number(mevcut.surumNo||gecmis.length+1));
                if(dosya){
                    kayitAsamasi='yeni sürüm dosyası okunurken';const base64=await evrakDosyayiOku(dosya);
                    kayitAsamasi='yeni sürüm dosyası yüklenirken';const evrakAdi=document.getElementById('evrakAdi').value.trim(),dosyaUzantisi=String(dosya.name||'').includes('.')?'.'+String(dosya.name).split('.').pop():'';
                    driveDosyasi=await fdYazilimDriveEvrakYukle(base64,(evrakAdi||'EVRAK').replace(/[\\/:*?"<>|]/g,'-')+'_S'+(surumNo+1)+dosyaUzantisi,mimeType,yuzde=>{buton.classList.add('evrak-yukleniyor');buton.style.setProperty('--evrak-ilerleme',yuzde+'%');buton.textContent='Yükleniyor · %'+yuzde;});
                    if(mevcut.dosya?.id||mevcut.dosya?.url)gecmis.push({surumNo,dosya:mevcut.dosya,evrakAdi:mevcut.evrakAdi||'',kategoriId:mevcut.kategoriId||'',kategoriAdi:mevcut.kategoriAdi||'',yil:mevcut.yil||'',belgeTarihi:mevcut.belgeTarihi||'',gecerlilikBitis:mevcut.gecerlilikBitis||'',aciklama:mevcut.aciklama||'',kaydeden:mevcut.duzenleyen||mevcut.olusturan||'',kayitZamani:mevcut.duzenlemeZamani||mevcut.olusturmaZamani||simdi});
                    yeniDosya={...driveDosyasi,mimeType:mimeType,boyut:dosya.size};surumNo+=1;
                }
                kayit={...mevcut,kategoriId:kategori.id,kategoriAdi:kategori.ad,evrakAdi:document.getElementById('evrakAdi').value.trim(),yil:Number(document.getElementById('evrakYil').value),belgeTarihi:document.getElementById('evrakBelgeTarihi').value,gecerlilikBitis:document.getElementById('evrakGecerlilikBitis').value,aciklama:document.getElementById('evrakAciklama').value.trim(),dosya:yeniDosya,surumNo,surumGecmisi:gecmis,duzenlemeZamani:simdi,duzenleyen};
                await evrakKaydiYaz(kayit);await evrakVerileriniYukle();
                evrakBildirim(dosya?'Evrakın yeni sürümü kaydedildi. Eski dosya korundu.':'Evrak bilgileri güncellendi.');
            }else{
                kayitAsamasi='dosya okunurken';
                const base64=await evrakDosyayiOku(dosya);
                kayitAsamasi='dosya yüklenirken';
                const evrakAdi=document.getElementById('evrakAdi').value.trim();
                const dosyaUzantisi=String(dosya.name||'').includes('.')?'.'+String(dosya.name).split('.').pop():'';
                const driveDosyaAdi=(evrakAdi||'EVRAK').replace(/[\\/:*?"<>|]/g,'-')+dosyaUzantisi;
                driveDosyasi=await fdYazilimDriveEvrakYukle(base64,driveDosyaAdi,mimeType,yuzde=>{buton.classList.add('evrak-yukleniyor');buton.style.setProperty('--evrak-ilerleme',yuzde+'%');buton.textContent='Yükleniyor · %'+yuzde;});
                kayit={id:evrakYeniId('evrak'),tip:'evrak',sirketId:activeUser.sirketId,kategoriId:kategori.id,kategoriAdi:kategori.ad,evrakAdi:document.getElementById('evrakAdi').value.trim(),yil:Number(document.getElementById('evrakYil').value),belgeTarihi:document.getElementById('evrakBelgeTarihi').value,gecerlilikBitis:document.getElementById('evrakGecerlilikBitis').value,aciklama:document.getElementById('evrakAciklama').value.trim(),dosya:{...driveDosyasi,mimeType:mimeType,boyut:dosya.size},surumNo:1,surumGecmisi:[],olusturmaZamani:new Date().toISOString(),olusturan:activeUser.username||activeUser.ad||''};
                kayitAsamasi='evrak kaydı oluşturulurken';
                await evrakKaydiYaz(kayit);await evrakVerileriniYukle();evrakBildirim(kayit.evrakAdi+' kaydedildi.');
            }
            evrakDuzenlemeId='';evrakAktifKategori=kategori.id;modalKapat('modalEvrakBelge');document.getElementById('evrakArama').value='';evrakEkraniniCiz();
        }catch(hata){
            if(driveDosyasi?.id){try{await fdYazilimDriveDosyaSil(driveDosyasi.id,'EVRAK TAKİP');}catch(temizlemeHatasi){console.warn('Yarım kalan evrak dosyası temizlenemedi:',temizlemeHatasi);}}
            console.error(hata);const ayrinti=String(hata?.message||'Bilinmeyen hata.').replace(/^Error:\s*/i,'');alert(mevcut?'Evrak güncellenemedi: '+ayrinti:'Evrak kaydedilemedi ('+kayitAsamasi+'): '+ayrinti);
        }finally{evrakYukleniyor=false;buton.disabled=false;buton.classList.remove('evrak-yukleniyor');buton.style.removeProperty('--evrak-ilerleme');buton.textContent=mevcut?'Değişiklikleri Kaydet':'Kaydet';}
    }
    function evrakGoruntule(id){
        const kayit=evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id));if(!kayit?.dosya?.id)return alert('Belge dosyası bulunamadı.');
        evrakOnizlemeId=String(kayit.id);document.getElementById('evrakOnizlemeBaslik').textContent=kayit.evrakAdi||kayit.dosya.ad||'Belge Görüntüleme';
        document.getElementById('evrakOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(kayit.dosya.id)+'/preview';
        document.getElementById('modalEvrakOnizleme').style.display='flex';
    }
    function evrakDosyaBaglantisi(dosya){return dosya?.url||dosya?.webViewLink||(dosya?.id?'https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(dosya.id):'')}
    function evrakSurumGecmisiAc(id){
        const kayit=evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id));if(!kayit)return;
        const gecmis=Array.isArray(kayit.surumGecmisi)?kayit.surumGecmisi:[],guncelNo=Math.max(1,Number(kayit.surumNo||gecmis.length+1));
        const surumler=[{surumNo:guncelNo,dosya:kayit.dosya,evrakAdi:kayit.evrakAdi,yil:kayit.yil,belgeTarihi:kayit.belgeTarihi,gecerlilikBitis:kayit.gecerlilikBitis,kaydeden:kayit.duzenleyen||kayit.olusturan,kayitZamani:kayit.duzenlemeZamani||kayit.olusturmaZamani,guncel:true},...gecmis].sort((a,b)=>Number(b.surumNo||0)-Number(a.surumNo||0));
        document.getElementById('evrakSurumBaslik').textContent='🗂️ '+(kayit.evrakAdi||'Evrak')+' · Sürüm Geçmişi';
        document.getElementById('evrakSurumAltBaslik').textContent=surumler.length+' sürüm · Eski dosyalar değiştirilmeden korunur';
        document.getElementById('evrakSurumListesi').innerHTML='<div class="table-wrapper"><table><thead><tr><th>Sürüm</th><th>Dosya</th><th>Belge Bilgisi</th><th>Kaydeden</th><th>Kayıt Zamanı</th><th>İşlem</th></tr></thead><tbody>'+surumler.map(s=>{const url=evrakDosyaBaglantisi(s.dosya);return '<tr><td><strong>Sürüm '+escapeDashboardText(s.surumNo||'-')+'</strong>'+(s.guncel?'<br><span class="badge" style="background:#dcfce7;color:#166534">Güncel</span>':'')+'</td><td>'+escapeDashboardText(s.dosya?.ad||s.evrakAdi||'-')+'</td><td>'+escapeDashboardText(String(s.yil||'-'))+' · '+evrakTarih(s.belgeTarihi)+(s.gecerlilikBitis?' · Bitiş: '+evrakTarih(s.gecerlilikBitis):'')+'</td><td>'+escapeDashboardText(s.kaydeden||'Sistem / eski kayıt')+'</td><td>'+escapeDashboardText(s.kayitZamani?new Date(s.kayitZamani).toLocaleString('tr-TR'):'-')+'</td><td>'+(url?'<a class="btn-modern btn-detail-modern" href="'+escapeDashboardText(url)+'" target="_blank" rel="noopener">Aç</a>':'-')+'</td></tr>'}).join('')+'</tbody></table></div>';
        document.getElementById('modalEvrakSurumleri').style.display='flex';
    }
    function evrakOnizlemeyiKapat(){
        document.getElementById('evrakOnizlemeFrame').src='about:blank';evrakOnizlemeId='';modalKapat('modalEvrakOnizleme');
    }
    function evrakOnizlemeyiDrivedaAc(){
        const kayit=evrakKayitlari.find(x=>String(x.id)===String(evrakOnizlemeId));if(!kayit?.dosya)return;
        const url=kayit.dosya.url||('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(kayit.dosya.id||''));window.open(url,'_blank','noopener');
    }
    async function evrakOnizlemeIndir(){
        const kayit=evrakKayitlari.find(x=>String(x.id)===String(evrakOnizlemeId)),buton=document.getElementById('evrakOnizlemeIndirBtn');if(!kayit?.dosya?.id)return;
        buton.disabled=true;buton.textContent='İndiriliyor...';
        try{
            const dosya=await fdYazilimDriveDosyaIndir(kayit.dosya.id,'EVRAK TAKİP'),ikili=atob(dosya.base64),baytlar=new Uint8Array(ikili.length);for(let i=0;i<ikili.length;i++)baytlar[i]=ikili.charCodeAt(i);
            const adres=URL.createObjectURL(new Blob([baytlar],{type:dosya.mimeType||kayit.dosya.mimeType||'application/octet-stream'})),baglanti=document.createElement('a');baglanti.href=adres;baglanti.download=dosya.ad||kayit.dosya.ad||'evrak';document.body.appendChild(baglanti);baglanti.click();baglanti.remove();setTimeout(()=>URL.revokeObjectURL(adres),1000);
        }catch(hata){console.error(hata);alert('Belge indirilemedi. Lütfen tekrar deneyin.');}finally{buton.disabled=false;buton.textContent='⬇ İndir';}
    }    async function evrakBelgeSil(id){
        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const kayit=evrakKayitlari.find(x=>String(x.id)===String(id));if(!kayit)return;
        if(!confirm('“'+(kayit.evrakAdi||'Bu evrak')+'” silinsin mi?'))return;
        try{
            const sonuc=await supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','evraktakip').eq('legacy_id',String(id));if(sonuc.error)throw sonuc.error;
            evrakKayitlari=evrakKayitlari.filter(x=>String(x.id)!==String(id));evrakEkraniniCiz();
            const dosyaIds=[kayit.dosya,...(Array.isArray(kayit.surumGecmisi)?kayit.surumGecmisi.map(s=>s?.dosya):[])].map(d=>d?.id).filter(Boolean).filter((id,index,liste)=>liste.indexOf(id)===index);let dosyaHatasi=false;
            for(const dosyaId of dosyaIds){try{await fdYazilimDriveDosyaSil(dosyaId,'EVRAK TAKİP');}catch(hata){dosyaHatasi=true;console.warn(hata)}}
            if(dosyaHatasi){evrakBildirim('Evrak silindi ancak sürüm dosyalarından biri kaldırılamadı.','warning');return;}
            evrakBildirim('Evrak silindi.');
        }catch(hata){console.error(hata);alert('Evrak silinemedi. Lütfen tekrar deneyin.');}
    }

    // Büyük giriş-çıkış arşivinde her hücre için bütün kayıtları taramak yerine kişi bazlı hareket indeksi kullan.
    let fdMagicpassHareketIndeksiKaynak=null,fdMagicpassHareketIndeksiUzunluk=-1,fdMagicpassHareketIndeksiSirket='',fdMagicpassHareketIndeksiSon='',fdMagicpassHareketIndeksi=new Map();
    function fdMagicpassHareketIndeksiniHazirla(){
        const kaynak=Array.isArray(vardiyaKayitlari)?vardiyaKayitlari:[],sirket=String(aktifSirketId()||''),son=String(kaynak.at(-1)?.id||'');
        if(fdMagicpassHareketIndeksiKaynak===kaynak&&fdMagicpassHareketIndeksiUzunluk===kaynak.length&&fdMagicpassHareketIndeksiSirket===sirket&&fdMagicpassHareketIndeksiSon===son)return fdMagicpassHareketIndeksi;
        const indeks=new Map();kaynak.forEach(k=>{if(k?.kayitTipi!=='magicpassHareket'||!aktifSirketeAit(k))return;const pid=String(k.pId||magicpassPersonelBul(k)?.id||'');if(!pid)return;if(!indeks.has(pid))indeks.set(pid,[]);indeks.get(pid).push(k);});
        indeks.forEach(liste=>liste.sort((a,b)=>String(a.zamanDamgasi||'').localeCompare(String(b.zamanDamgasi||''))));
        fdMagicpassHareketIndeksiKaynak=kaynak;fdMagicpassHareketIndeksiUzunluk=kaynak.length;fdMagicpassHareketIndeksiSirket=sirket;fdMagicpassHareketIndeksiSon=son;fdMagicpassHareketIndeksi=indeks;return indeks;
    }
    magicpassGunHareketleri=function(personel,tarihKey,vardiya){
        const saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),pencereBas=new Date(saatler.bas),pencereBit=new Date(saatler.bit);
        pencereBas.setHours(pencereBas.getHours()-4);pencereBit.setHours(pencereBit.getHours()+8);
        let sirali=(fdMagicpassHareketIndeksiniHazirla().get(String(personel?.id||''))||[]).filter(k=>{const zaman=new Date(k.zamanDamgasi);return zaman>=pencereBas&&zaman<=pencereBit;});
        const esik=Math.min(30,Math.max(0,Number(uygulamaAyarlari.magicpassMukerrerBasimDakika??3)));
        if(esik&&sirali.length>=2){const sonuc=[];let oncekiHamZaman=null;sirali.forEach(hareket=>{const zaman=new Date(hareket.zamanDamgasi);if(!oncekiHamZaman||(zaman-oncekiHamZaman)/60000>esik)sonuc.push(hareket);oncekiHamZaman=zaman;});sirali=sonuc;}
        if(saatler.bitErtesi&&sirali.length){
            const orta=new Date((saatler.bas.getTime()+saatler.bit.getTime())/2),geceGirisiVar=sirali.some(k=>new Date(k.zamanDamgasi)<=orta);
            if(!geceGirisiVar){
                const gunTuru=magicpassGunTuruBul(personel,tarihKey),sonraki=new Date(tarihKey+'T12:00:00');sonraki.setDate(sonraki.getDate()+1);
                const sonrakiTarih=magicpassTarihAnahtari(sonraki),sonrakiVardiya=magicpassGunVardiyasi(personel,sonrakiTarih),sonrakiSaatler=magicpassVardiyaSaatleri(sonrakiVardiya,sonrakiTarih);
                const girisPencereBas=new Date(sonrakiSaatler.bas),girisPencereBit=new Date(sonrakiSaatler.bas);girisPencereBas.setHours(girisPencereBas.getHours()-4);girisPencereBit.setHours(girisPencereBit.getHours()+4);
                sirali=sirali.filter(k=>{const zaman=new Date(k.zamanDamgasi),sonrakiGirisMi=zaman>=girisPencereBas&&zaman<=girisPencereBit;return !(gunTuru||String(sonrakiVardiya)!==String(vardiya))||!sonrakiGirisMi;});
            }
        }
        return sirali;
    };
    magicpassGunHamHareketleriBul=function(personel,tarihKey){
        if(!personel||!tarihKey)return[];const vardiya=magicpassGunVardiyasi(personel,tarihKey),saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),pencereBas=new Date(saatler.bas),pencereBit=new Date(saatler.bit);pencereBas.setHours(pencereBas.getHours()-4);pencereBit.setHours(pencereBit.getHours()+8);return(fdMagicpassHareketIndeksiniHazirla().get(String(personel.id))||[]).filter(k=>{const zaman=new Date(k.zamanDamgasi);return zaman>=pencereBas&&zaman<=pencereBit;});
    };

    // FD toplu sağlamlaştırma: belge yükleme, izin, PDF, puantaj renkleri, kira ve pazar hesabı.
    function izinPersonelSeciminiTemizle(){
        const kutu=document.getElementById('izinPersonelSecimKutusu'),select=document.getElementById('izinPersonelSelect');
        if(kutu)kutu.value='';if(select)select.value='';personelSecildi('');
        setTimeout(()=>{kutu?.focus();kutu?._fdPersonelListesiniAc?.();},200);
    }
    const fdPersonelOzetToplamOncesi=personelOzetKutusunuGuncelle;
    personelOzetKutusunuGuncelle=function(p){
        fdPersonelOzetToplamOncesi(p);const donemler=personelDonemleriniGetir(p),hak=donemler.reduce((t,d)=>t+Number(d.hak||0),0),kullanilan=izinler.filter(i=>String(i.pId)===String(p.id)&&i.tur==='Yıllık İzin').reduce((t,i)=>t+Number(i.gun||0),0),kalan=Math.max(0,hak-kullanilan);
        const hakEl=document.getElementById('genelToplamHakDeger'),kulEl=document.getElementById('genelToplamKullanilanDeger'),kalEl=document.getElementById('genelToplamKalanDeger');if(hakEl)hakEl.textContent=hak+' Gün';if(kulEl)kulEl.textContent=kullanilan+' Gün';if(kalEl)kalEl.textContent=kalan+' Gün';
    };
    exportBakiyeToPDF=function(){return window.fdTabloPdfOnizle(document.getElementById('bakiyeTablo'),'KALAN YILLIK İZİN BAKİYELERİ · '+new Date().toLocaleDateString('tr-TR'),'Kalan_Yillik_Izinler.pdf',{yon:'landscape'});};
    const FD_PUANTAJ_RENK_VARSAYILAN={X:['#ffffff','#0f172a'],Y:['#10b981','#ffffff'],R:['#ef4444','#ffffff'],'Ü':['#8b5cf6','#ffffff'],Z:['#f59e0b','#ffffff'],M:['#b91c1c','#ffffff'],HS:['#94a3b8','#ffffff'],RT:['#0284c7','#ffffff'],YT:['#fef3c7','#92400e'],RC:['#0d9488','#ffffff'],PZ:['#ea580c','#ffffff'],'-':['#f8fafc','#64748b']};
    const FD_PUANTAJ_RENK_SINIF={X:'p-x',Y:'p-y',R:'p-r','Ü':'p-u',Z:'p-z',M:'p-m',HS:'p-hs',RT:'p-rt',YT:'p-yt',RC:'p-rc',PZ:'p-pz','-':'p-eksi'};
    function fdRenkHex(v,d){return /^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):d;}
    function fdPuantajRenkleri(){const gelen=uygulamaAyarlari?.puantajRenkleri||{};return Object.fromEntries(Object.entries(FD_PUANTAJ_RENK_VARSAYILAN).map(([k,d])=>[k,[fdRenkHex(gelen[k]?.[0],d[0]),fdRenkHex(gelen[k]?.[1],d[1])]]));}
    function fdPuantajRenkleriniUygula(){const renkler=fdPuantajRenkleri();let stil=document.getElementById('fdPuantajRenkStili');if(!stil){stil=document.createElement('style');stil.id='fdPuantajRenkStili';document.head.appendChild(stil);}stil.textContent=Object.entries(renkler).map(([k,r])=>'.'+FD_PUANTAJ_RENK_SINIF[k]+'{background:'+r[0]+'!important;color:'+r[1]+'!important;border-color:'+r[0]+'!important}').join('');document.querySelectorAll('#puantajApp span').forEach(s=>{const kod=s.querySelector('strong')?.textContent?.replace(':','').trim();if(!renkler[kod])return;s.dataset.puantajKod=kod;s.style.background=renkler[kod][0];s.style.color=renkler[kod][1];});}
    /* Settings UI moved to modules/ayarlar. */
    /* Settings UI moved to modules/ayarlar. */
    function icraListePdfAl(){return aracTabloDisariAktar('icraListeBody','pdf',document.getElementById('icraListeBaslik')?.textContent||'İcra Listesi','ICRA_LISTESI');}
    /* Settings UI moved to modules/ayarlar. *//* Settings UI moved to modules/ayarlar. */
    /* Rental projection/detail moved. */
    /* Rental projection/detail moved. */
    /* Rental projection/detail moved. *//* Rental projection/detail moved. */
    alanAdiTescilBelgesiniGoster=async function(){document.getElementById('belgecontainer')?.remove();document.getElementById('alanAdiTescilScripti')?.remove();return false;};
    function fdTopluSaglamlastirmaBaslat(){document.getElementById('belgecontainer')?.remove();fdPuantajRenkleriniUygula();const s=document.createElement('style');s.textContent='#genelToplamKalanDiv strong{font-size:1rem}.kira-yillik-ozet th:nth-child(7){min-width:105px;white-space:normal!important;line-height:1.15}.kira-yillik-ozet td:nth-child(7){white-space:nowrap}@media(max-width:650px){#genelToplamKalanDiv{grid-template-columns:1fr!important}}';document.head.appendChild(s);}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdTopluSaglamlastirmaBaslat);else fdTopluSaglamlastirmaBaslat();


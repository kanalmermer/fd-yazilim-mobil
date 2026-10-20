
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */

    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */

    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */
    /* Document module or shared document-data entry moved. */    /* Document module or shared document-data entry moved. */

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


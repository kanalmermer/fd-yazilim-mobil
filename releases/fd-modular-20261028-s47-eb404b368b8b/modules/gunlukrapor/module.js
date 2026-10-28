window.FDModules.define('gunlukrapor',function(){

let fdDailyDisposed=false,fdDailyOverlay=null;const fdDailyInitial=fdDailyContext(),fdDailyOutputs=new Set();
function fdDailyContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdDailyValid(){return !fdDailyDisposed&&Boolean(activeUser)&&!isPersonelUser()&&anaMenuModulErisimiVar('personel')&&fdDailyContext()===fdDailyInitial}
function fdDailyAssert(){if(!fdDailyValid())throw Error('Oturum değişti; günlük raporu yeniden açın.')}
async function fdDailyAwait(p){fdDailyAssert();const value=await p;fdDailyAssert();return value}
function fdDailyAppend(node){fdDailyAssert();fdDailyOutputs.add(node);return document.body.appendChild(node)}
function showGlobalOverlay(...args){fdDailyAssert();window.showGlobalOverlay(...args);fdDailyOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(fdDailyOverlay&&fdDailyOverlay[0]===document.getElementById('overlayTitle')?.textContent&&fdDailyOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();fdDailyOverlay=null}
function fdDailyPdf(table,title,name,options){fdDailyAssert();return window.fdTabloPdfOnizle?.(table,title,name,{...options,fdIsCurrent:fdDailyValid})}
function magicpassGunlukSubeHafizaAnahtari(){return 'fdMagicpassGunlukSube:'+aktifSirketId()+':'+String(activeUser?.username||activeUser?.id||'kullanici');}
function magicpassGunlukSubeHatirla(){try{localStorage.setItem(magicpassGunlukSubeHafizaAnahtari(),document.getElementById('magicpassGunlukSube')?.value||'');}catch(_){if(!fdDailyValid())return;}}
function magicpassGunlukRaporSubeleriniHazirla() {
        const select=document.getElementById('magicpassGunlukSube');if(!select)return;
        let mevcut=select.value;if(!select.dataset.hafizaOkundu){mevcut='';select.dataset.hafizaOkundu='1';}
        const adlar=[...new Set(personeller.filter(p=>aktifSirketeAit(p)).map(p=>String(p.sube||'Merkez')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        select.innerHTML='<option value="">Tüm Şubeler</option>'+adlar.map(ad=>`<option value="${escapeDashboardText(ad)}">${escapeDashboardText(ad)}</option>`).join('');
        if(adlar.includes(mevcut))select.value=mevcut;
        else { const fabrika=fdFabrikaSubeDegeri(select); if(fabrika)select.value=fabrika; }
    }
function magicpassGunlukTarihDegistir(gun){
        const alan=document.getElementById('magicpassGunlukTarih');if(!alan)return;
        const tarih=new Date((alan.value||magicpassTarihAnahtari(new Date()))+'T12:00:00');tarih.setDate(tarih.getDate()+Number(gun||0));alan.value=magicpassTarihAnahtari(tarih);magicpassGunlukRaporuCiz();
    }
function magicpassGunlukOzetFiltresiSec(durum){const alan=document.getElementById('magicpassGunlukDurum');if(!alan)return;alan.value=durum||'';magicpassGunlukRaporuCiz();}
function magicpassGunlukDurumSinifi(kayit) {
        if(kayit.izinli)return'izinli';if(kayit.eksik)return'eksik';if(kayit.gelmedi)return'gelmedi';if(kayit.geldi&&!(kayit.gec||kayit.erken))return'geldi';if(kayit.geldi)return'uyari';return'';
    }
function magicpassGunlukRaporuCiz() {
        const tbody=document.querySelector('#magicpassGunlukTablo tbody');if(!tbody)return;
        if(!document.getElementById('magicpassGunlukTarih').value)document.getElementById('magicpassGunlukTarih').value=magicpassTarihAnahtari(new Date());
        magicpassGunlukRaporSubeleriniHazirla();const tum=magicpassGunlukRaporTumVerisi(),liste=magicpassGunlukRaporVerisi(tum),esik=magicpassGunlukMesaiEsigi(),eksikEsik=magicpassGunlukEksikMesaiEsigi(),secili=String(document.getElementById('magicpassGunlukDurum')?.value||'');
        tbody.innerHTML=liste.length?liste.map((k,index)=>{const eksik=k.eksik,sinif=k.gelmedi?' class="magicpass-gelmedi"':'';
            return'<tr'+sinif+'><td>'+(index+1)+'</td><td><strong>'+escapeDashboardText(k.personel.ad||'-')+'</strong></td><td>'+escapeDashboardText(k.personel.sube||'Merkez')+'</td><td>'+escapeDashboardText(k.personel.gorev||'-')+'</td><td>'+escapeDashboardText(magicpassVardiyaSaatEtiketi(k.hesap.vardiya))+'</td><td>'+magicpassSaatHucresiHtml(k.hesap,'giris')+'</td><td>'+magicpassSaatHucresiHtml(k.hesap,'cikis')+'</td><td>'+magicpassDakikaMetni(k.gec)+'</td><td>'+magicpassDakikaMetni(k.erken)+'</td><td>'+magicpassYapilanMesaiHucresiHtml(k.hesap)+'</td><td>'+magicpassDakikaMetni(magicpassToplamCalismaDakikasi(k.hesap))+'</td><td><span class="magicpass-gunluk-durum '+magicpassGunlukDurumSinifi(k)+'">'+(eksik?'⚠ ':'')+escapeDashboardText(k.gorunenDurum)+'</span></td></tr>';
        }).join(''):'<tr><td colspan="12" style="padding:24px;text-align:center;color:#64748b;">Seçilen filtreye uygun personel bulunmuyor.</td></tr>';
        const ikonlar={'':'👥',gelen:'✓',gelmeyen:'!',izinli:'✦',mesai:'↗',gec:'⌚',erken:'↙',eksik:'⚠',kayitsiz:'—'},say=filtre=>tum.filter(filtre).length,kart=(durum,baslik,adet)=>'<button type="button" data-durum="'+durum+'" class="'+(secili===durum?'active':'')+'" onclick="magicpassGunlukOzetFiltresiSec(\''+durum+'\')"><i>'+ikonlar[durum]+'</i><span>'+baslik+'</span><strong>'+adet+'</strong></button>';
        document.getElementById('magicpassGunlukOzet').innerHTML=kart('','Toplam Personel',tum.length)+kart('gelen','Gelen',say(k=>k.geldi))+kart('gelmeyen','Gelmeyen',say(k=>k.gelmedi))+kart('izinli','İzinli',say(k=>k.izinli))+kart('mesai','Mesai Yapan',say(k=>k.fazlaMesai>=esik))+kart('gec','Geç Kalan',say(k=>k.gec>=eksikEsik))+kart('erken','Erken Çıkan',say(k=>k.erken>=eksikEsik))+kart('eksik','Eksik Basış',say(k=>k.eksik))+kart('kayitsiz','Kayıt Yok',say(k=>k.kayitsiz));
    }
function magicpassGunlukKopyaSaat(tarih){return tarih?new Date(tarih).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'-';}
function magicpassGunlukKopyaBasHarf(deger){
        const metin=String(deger||'').trim();
        return metin?metin.charAt(0).toLocaleUpperCase('tr-TR')+metin.slice(1):'-';
    }
function magicpassCanvasPngBlobHazirla(canvas){
        const enFazlaGenislik=2200,enFazlaYukseklik=7000,oran=Math.min(1,enFazlaGenislik/canvas.width,enFazlaYukseklik/canvas.height),hedef=document.createElement('canvas');hedef.width=Math.max(1,Math.round(canvas.width*oran));hedef.height=Math.max(1,Math.round(canvas.height*oran));const ctx=hedef.getContext('2d',{alpha:false});if(!ctx)throw new Error('PNG çizim alanı açılamadı.');ctx.fillStyle='#fff';ctx.fillRect(0,0,hedef.width,hedef.height);ctx.drawImage(canvas,0,0,hedef.width,hedef.height);
        return fetch(hedef.toDataURL('image/png')).then(yanit=>{if(!yanit.ok)throw new Error('PNG verisi okunamadı.');return yanit.blob();}).then(blob=>{if(!blob||blob.type!=='image/png'||!blob.size)throw new Error('Geçerli PNG dosyası oluşturulamadı.');return blob;});
    }
function magicpassGunlukPrimRaporTablosunuDuzenle(tablo){
        const stil=(el,degerler)=>Object.entries(degerler).forEach(([anahtar,deger])=>el.style.setProperty(anahtar,deger,'important'));
        tablo.setAttribute('data-fd-prim-rapor','');
        stil(tablo,{display:'table',width:'1425px','min-width':'1425px','max-width':'none','table-layout':'fixed','border-collapse':'separate','border-spacing':'0',background:'#fff'});
        tablo.querySelectorAll('thead,tbody,tfoot').forEach(el=>stil(el,{display:el.tagName==='THEAD'?'table-header-group':el.tagName==='TFOOT'?'table-footer-group':'table-row-group',width:'auto',gap:'0',position:'static',transform:'none'}));
        [...tablo.rows].forEach(satir=>{
            stil(satir,{display:'table-row',width:'auto',height:'30px','min-height':'0',overflow:'visible',border:'0','border-radius':'0','box-shadow':'none',position:'static',transform:'none'});
            [...satir.cells].forEach((hucre,index)=>{
                const baslik=hucre.tagName==='TH',genislik=index===0?'38px':index===1?'210px':hucre.classList.contains('p-gun-baslik')||hucre.classList.contains('p-gun-hucresi')?'25px':index===satir.cells.length-1?'106px':index===satir.cells.length-3?'92px':'74px';
                stil(hucre,{display:'table-cell',position:'static',left:'auto',top:'auto',inset:'auto',transform:'none','z-index':'auto',width:genislik,'min-width':genislik,'max-width':genislik,height:'auto','min-height':'0',padding:'2px 3px','font-size':'12px','line-height':'1.2','white-space':index===1?'normal':'nowrap','text-align':index===1?'left':'center','vertical-align':'middle','border-radius':'0','box-shadow':'none',overflow:'hidden'});
                if(baslik)stil(hucre,{background:'#475569',color:'#fff'});
                else if(index===1)stil(hucre,{background:'#f8fbff',color:'#0f172a'});
                hucre.querySelectorAll('input').forEach(input=>stil(input,{width:'calc(100% - 4px)','min-width':'0','max-width':'none',height:'24px','min-height':'0',margin:'0',padding:'0','font-size':'12px','text-align':'center',transform:'none'}));
            });
        });
    }
async function magicpassGunlukPrimCanvasHazirla(tarihKey){
        const tablo=document.getElementById('puantajTablosu'),aySec=document.getElementById('puanAySec'),yilSec=document.getElementById('puanYilSec'),primFiltre=document.getElementById('puanPrimFiltre'),personelAra=document.getElementById('puanPersonelAra');
        if(!tablo||!aySec||!yilSec||typeof renderPuantajMatrisi!=='function'||typeof puantajCanvasOlustur!=='function')throw new Error('Prim tablosu hazırlanamadı.');
        const tarih=new Date(tarihKey+'T12:00:00'),durum={gorunum:puantajGorunumu,ay:aySec.value,yil:yilSec.value,primFiltre:primFiltre?.value||'',personelAra:personelAra?.value||'',puantajYuklu:yuklenenVeriler.has('puantaj')};
        let eklenenYil=null,sahne=null;
        try{
            if(![...yilSec.options].some(option=>String(option.value)===String(tarih.getFullYear()))){eklenenYil=document.createElement('option');eklenenYil.value=String(tarih.getFullYear());eklenenYil.textContent=String(tarih.getFullYear());yilSec.appendChild(eklenenYil);}
            yuklenenVeriler.delete('puantaj');
            puantajGorunumu='prim';aySec.value=String(tarih.getMonth());yilSec.value=String(tarih.getFullYear());if(primFiltre)primFiltre.value='tum';if(personelAra)personelAra.value='';
            renderPuantajMatrisi({tumPersoneller:true});
            const kopya=tablo.cloneNode(true),ayAdi=tarih.toLocaleDateString('tr-TR',{month:'long'}).toLocaleUpperCase('tr-TR');
            puantajGorunumu=durum.gorunum;aySec.value=durum.ay;yilSec.value=durum.yil;if(primFiltre)primFiltre.value=durum.primFiltre;if(personelAra)personelAra.value=durum.personelAra;renderPuantajMatrisi();
            tablo.id='puantajTablosuGizliKaynak';kopya.id='puantajTablosu';
            magicpassGunlukPrimRaporTablosunuDuzenle(kopya);
            sahne=document.createElement('div');sahne.style.cssText='position:fixed;left:0;top:0;z-index:1;width:1425px;padding:0;background:#fff;pointer-events:none;';
            const raporStili=document.createElement('style');raporStili.textContent='#puantajTablosu[data-fd-prim-rapor] td::before{display:none!important;content:none!important}';sahne.appendChild(raporStili);sahne.appendChild(kopya);fdDailyAppend(sahne);
            return await fdDailyAwait(puantajCanvasOlustur(kopya,1.5,`AYLIK PRİM HAKEDİŞ ÇİZELGESİ — ${ayAdi} ${tarih.getFullYear()}`));
        }finally{
            sahne?.remove();fdDailyOutputs.delete(sahne);tablo.id='puantajTablosu';if(fdDailyValid()){
            puantajGorunumu=durum.gorunum;aySec.value=durum.ay;yilSec.value=durum.yil;if(primFiltre)primFiltre.value=durum.primFiltre;if(personelAra)personelAra.value=durum.personelAra;
            if(eklenenYil&&String(durum.yil)!==eklenenYil.value)eklenenYil.remove();
            try{renderPuantajMatrisi();}catch(_){if(!fdDailyValid())return;}
            if(durum.puantajYuklu)yuklenenVeriler.add('puantaj');else yuklenenVeriler.delete('puantaj');
        }}
    }
function magicpassGunlukBirlesikCanvas(primCanvas,satirlar){
        const genislik=primCanvas.width,bosluk=Math.max(28,Math.round(genislik*.012)),satirYuksekligi=Math.max(28,Math.round(genislik/76)),metinBoyutu=Math.max(18,Math.round(satirYuksekligi*.58)),detayYuksekligi=bosluk*2+(satirlar.length*satirYuksekligi),canvas=document.createElement('canvas');
        canvas.width=genislik;canvas.height=primCanvas.height+detayYuksekligi;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(primCanvas,0,0);ctx.fillStyle='#0f766e';ctx.fillRect(0,primCanvas.height,canvas.width,4);
        let y=primCanvas.height+bosluk+satirYuksekligi/2;for(const ham of satirlar){const baslik=/^\*.*\*$/.test(ham),metin=ham.replace(/^\*|\*$/g,'');ctx.font=`${baslik?'800':'500'} ${baslik?Math.round(metinBoyutu*1.08):metinBoyutu}px Arial`;ctx.fillStyle=baslik?'#0f172a':'#334155';ctx.textBaseline='middle';ctx.fillText(metin,bosluk,y,canvas.width-bosluk*2);y+=satirYuksekligi;}
        return canvas;
    }
async function magicpassGunlukDetayKopyala(){
        const tarihKey=String(document.getElementById('magicpassGunlukTarih')?.value||magicpassTarihAnahtari(new Date())),tarih=new Date(tarihKey+'T12:00:00'),gunHam=tarih.toLocaleDateString('tr-TR',{weekday:'long'}),gun=magicpassGunlukKopyaBasHarf(gunHam),tum=magicpassGunlukRaporTumVerisi(),esik=magicpassGunlukMesaiEsigi(),eksikEsik=magicpassGunlukEksikMesaiEsigi(),satirlar=[`*${tarihFormati(tarihKey)} ${gun}*`];
        const ad=k=>magicpassGunlukKopyaBasHarf(k?.personel?.ad||'-'),bolum=(baslik,liste,metin)=>{if(!liste.length)return;satirlar.push('',`*${baslik}*`,...liste.map(metin));};
        const izinNorm=k=>String(k.izinTuru||'').toLocaleLowerCase('tr-TR');
        bolum('Gelmeyenler',tum.filter(k=>k.gelmedi),k=>ad(k));
        bolum('Yıllık İzinliler',tum.filter(k=>k.izinli&&izinNorm(k).includes('yıllık')),k=>ad(k));
        bolum('Ücretsiz İzinliler',tum.filter(k=>k.izinli&&izinNorm(k).includes('ücretsiz')),k=>ad(k));
        bolum('Raporlular',tum.filter(k=>k.izinli&&(izinNorm(k).includes('rapor')||izinNorm(k).includes('sağlık'))),k=>ad(k));
        bolum('Diğer İzinliler',tum.filter(k=>k.izinli&&!izinNorm(k).includes('yıllık')&&!izinNorm(k).includes('ücretsiz')&&!izinNorm(k).includes('rapor')&&!izinNorm(k).includes('sağlık')),k=>`${ad(k)}${k.izinTuru?' - '+magicpassGunlukKopyaBasHarf(k.izinTuru):''}`);
        bolum('Mesai Yapanlar',tum.filter(k=>k.fazlaMesai>=esik),k=>`${ad(k)} - Çıkış saati ${magicpassGunlukKopyaSaat(k.hesap.cikis)}`);
        bolum('Erken Çıkanlar',tum.filter(k=>k.erken>=eksikEsik),k=>`${ad(k)} - Çıkış saati ${magicpassGunlukKopyaSaat(k.hesap.cikis)}`);
        bolum('Geç Gelenler',tum.filter(k=>k.gec>=eksikEsik),k=>`${ad(k)} - Giriş saati ${magicpassGunlukKopyaSaat(k.hesap.giris)}`);
        if(satirlar.length===1)satirlar.push('','Bildirilecek istisna bulunmuyor.');
        const metin=satirlar.join('\n');let kopyalamaAsamasi='Başlatma';showGlobalOverlay('Kopyalama hazırlanıyor','Prim tablosu ve günlük detay hazırlanıyor...');
        try{
            if(!navigator.clipboard?.write||!window.ClipboardItem)throw new Error('Tarayıcı görsel kopyalamayı desteklemiyor.');
            const blobSozu=(async()=>{kopyalamaAsamasi='Prim tablosu';const primCanvas=await fdDailyAwait(magicpassGunlukPrimCanvasHazirla(tarihKey));kopyalamaAsamasi='Günlük detay görseli';const birlesikCanvas=magicpassGunlukBirlesikCanvas(primCanvas,satirlar);kopyalamaAsamasi='PNG oluşturma';return await fdDailyAwait(magicpassCanvasPngBlobHazirla(birlesikCanvas));})();
            kopyalamaAsamasi='Panoya yazma';await fdDailyAwait(navigator.clipboard.write([new ClipboardItem({'image/png':blobSozu})]));
            showToast('Prim tablosu ve günlük detay panoya kopyalandı.');
        }catch(error){if(!fdDailyValid())return;
            console.warn('Prim tablosuyla kopyalama tamamlanamadı, metin kopyalanıyor.',error);
            try{await fdDailyAwait(navigator.clipboard.writeText(metin));}catch(_){if(!fdDailyValid())return;const alan=document.createElement('textarea');alan.value=metin;alan.style.position='fixed';alan.style.opacity='0';document.body.appendChild(alan);alan.select();document.execCommand('copy');alan.remove();}
            showToast(`${kopyalamaAsamasi}: ${error?.name||'Hata'} - ${error?.message||error}. Günlük detay metin olarak kopyalandı.`,'warning');
        }finally{if(fdDailyValid()){hideGlobalOverlay();}}
    }
function magicpassGunlukRaporDosyaAdi(uzanti) {
        const tarih=String(document.getElementById('magicpassGunlukTarih')?.value||'TARIH'),sube=String(document.getElementById('magicpassGunlukSube')?.value||'TUM_SUBELER').toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g,'_');
        return `GUNLUK_GIRIS_CIKIS_${tarih}_${sube}.${uzanti}`;
    }
function magicpassGunlukExcelAl() {
        if(typeof XLSX==='undefined')return showToast('Excel kütüphanesi yüklenemedi.','error');const liste=magicpassGunlukRaporVerisi(),tarih=document.getElementById('magicpassGunlukTarih').value,sube=document.getElementById('magicpassGunlukSube').value||'Tüm Şubeler';
        const satirlar=liste.map((k,index)=>[index+1,k.personel.ad||'',k.personel.sube||'Merkez',k.personel.gorev||'',magicpassVardiyaSaatEtiketi(k.hesap.vardiya),magicpassCalismaSaatleriMetni(k.hesap,'giris'),magicpassCalismaSaatleriMetni(k.hesap,'cikis'),magicpassDakikaMetni(k.gec),magicpassDakikaMetni(k.erken),magicpassDakikaMetni(magicpassYapilanMesaiDakikasi(k.hesap)),magicpassDakikaMetni(magicpassToplamCalismaDakikasi(k.hesap)),k.gorunenDurum||'',k.hesap.duzeltme?'Manuel / toplu kayıt':'']);
        const veri=[['GÜNLÜK PERSONEL GİRİŞ–ÇIKIŞ RAPORU'],['Tarih',tarihFormati(tarih)],['Şube',sube],[],['#','Personel','Şube','Görev','Vardiya','Giriş','Çıkış','Geç','Erken','Fazla Mesai','Toplam Çalışma','Durum','Açıklama'],...satirlar],ws=XLSX.utils.aoa_to_sheet(veri),wb=XLSX.utils.book_new();
        ws['!cols']=[{wch:5},{wch:28},{wch:22},{wch:24},{wch:15},{wch:9},{wch:9},{wch:9},{wch:9},{wch:14},{wch:16},{wch:22},{wch:20}];ws['!pageSetup']={orientation:'landscape',paperSize:9,fitToWidth:1,fitToHeight:0};XLSX.utils.book_append_sheet(wb,ws,'Günlük Rapor');XLSX.writeFile(wb,magicpassGunlukRaporDosyaAdi('xlsx'));showToast('Günlük personel raporu Excel olarak hazırlandı.');
    }
async function magicpassGunlukPdfAl() {
        const kaynak=document.getElementById('magicpassGunlukTablo');if(!kaynak)return;
        const tarih=document.getElementById('magicpassGunlukTarih').value,sube=document.getElementById('magicpassGunlukSube').value||'Tüm Şubeler';
        return fdDailyPdf?.(kaynak,'GÜNLÜK PERSONEL GİRİŞ–ÇIKIŞ RAPORU',magicpassGunlukRaporDosyaAdi('pdf'),{donem:tarihFormati(tarih)+' · '+sube.toLocaleUpperCase('tr-TR'),yon:'landscape',format:'a3',genislik:'400mm',satirSayisi:34,ilkKolonGenislik:'5%',altBaslik:'Günlük Personel Giriş–Çıkış Raporu'});
    }
const fdDailyRenderOriginal=magicpassGunlukRaporuCiz;
magicpassGunlukRaporuCiz=function(...args){fdDailyAssert();if(fdMagicpassKayitTurCache)return fdDailyRenderOriginal.apply(this,args);const previous=fdPuantajHesapOnbelleginiBaslat();try{return fdDailyRenderOriginal.apply(this,args)}finally{fdPuantajHesapOnbelleginiGeriYukle(previous)}};
return{open(){fdDailyAssert();const section=document.getElementById('magicpass-tab-gunluk'),app=document.getElementById('magicpassApp');if(!section?.classList.contains('active')||getComputedStyle(app).display==='none')return false;if(!document.getElementById('magicpassGunlukTarih').value)document.getElementById('magicpassGunlukTarih').value=magicpassTarihAnahtari(new Date());magicpassGunlukRaporSubeleriniHazirla();magicpassGunlukRaporuCiz()},api:{magicpassGunlukSubeHafizaAnahtari:function(...args){fdDailyAssert();return magicpassGunlukSubeHafizaAnahtari(...args)},magicpassGunlukSubeHatirla:function(...args){fdDailyAssert();return magicpassGunlukSubeHatirla(...args)},magicpassGunlukRaporSubeleriniHazirla:function(...args){fdDailyAssert();return magicpassGunlukRaporSubeleriniHazirla(...args)},magicpassGunlukTarihDegistir:function(...args){fdDailyAssert();return magicpassGunlukTarihDegistir(...args)},magicpassGunlukOzetFiltresiSec:function(...args){fdDailyAssert();return magicpassGunlukOzetFiltresiSec(...args)},magicpassGunlukDurumSinifi:function(...args){fdDailyAssert();return magicpassGunlukDurumSinifi(...args)},magicpassGunlukRaporuCiz:function(...args){fdDailyAssert();return magicpassGunlukRaporuCiz(...args)},magicpassGunlukKopyaSaat:function(...args){fdDailyAssert();return magicpassGunlukKopyaSaat(...args)},magicpassGunlukKopyaBasHarf:function(...args){fdDailyAssert();return magicpassGunlukKopyaBasHarf(...args)},magicpassCanvasPngBlobHazirla:function(...args){fdDailyAssert();return magicpassCanvasPngBlobHazirla(...args)},magicpassGunlukPrimRaporTablosunuDuzenle:function(...args){fdDailyAssert();return magicpassGunlukPrimRaporTablosunuDuzenle(...args)},magicpassGunlukPrimCanvasHazirla:function(...args){fdDailyAssert();return magicpassGunlukPrimCanvasHazirla(...args)},magicpassGunlukBirlesikCanvas:function(...args){fdDailyAssert();return magicpassGunlukBirlesikCanvas(...args)},magicpassGunlukDetayKopyala:function(...args){fdDailyAssert();return magicpassGunlukDetayKopyala(...args)},magicpassGunlukRaporDosyaAdi:function(...args){fdDailyAssert();return magicpassGunlukRaporDosyaAdi(...args)},magicpassGunlukExcelAl:function(...args){fdDailyAssert();return magicpassGunlukExcelAl(...args)},magicpassGunlukPdfAl:function(...args){fdDailyAssert();return magicpassGunlukPdfAl(...args)}},dispose(){fdDailyDisposed=true;hideGlobalOverlay();for(const node of fdDailyOutputs)node.remove();fdDailyOutputs.clear();const table=document.getElementById('puantajTablosuGizliKaynak');if(table)table.id='puantajTablosu'}};
});

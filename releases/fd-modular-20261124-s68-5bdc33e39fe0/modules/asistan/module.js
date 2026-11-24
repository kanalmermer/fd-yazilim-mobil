window.FDModules.define('asistan',function(){

let fdAiDisposed=false;const fdAiInitial=fdAiContext(),fdAiTimers=new Set(),fdAiListeners=[];
function fdAiContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulAyarlariniDuzelt().map(x=>[x.anahtar,anaMenuModulYetkisi(x.anahtar)])])}
function fdAiValid(){return !fdAiDisposed&&Boolean(activeUser)&&!isPersonelUser()&&fdAiContext()===fdAiInitial}
function fdAiAssert(){if(!fdAiValid())throw Error('Oturum değişti; asistanı yeniden açın.')}
async function fdAiAwait(p){fdAiAssert();const value=await p;fdAiAssert();return value}
function setTimeout(callback,ms){const timer=window.setTimeout(()=>{fdAiTimers.delete(timer);if(fdAiValid())callback()},ms);fdAiTimers.add(timer);return timer}
function fdAiListen(node,type,listener){node.addEventListener(type,listener);fdAiListeners.push(()=>node.removeEventListener(type,listener))}
let fdAiMesajlar = [];
function fdAiMetinAnahtari(deger){
        return String(deger || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u0131/g,'i').replace(/\u015f/g,'s').replace(/\u011f/g,'g').replace(/\u00fc/g,'u').replace(/\u00f6/g,'o').replace(/\u00e7/g,'c');
    }
function fdAiBugun(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fdAiSoruTarihiBul(soru){
        const q=fdAiMetinAnahtari(soru),bugun=new Date(fdAiBugun()+'T12:00:00');
        if(q.includes('dun'))bugun.setDate(bugun.getDate()-1);
        else if(q.includes('onceki gun'))bugun.setDate(bugun.getDate()-1);
        else {
            const eslesme=String(soru||'').match(/\b(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{4}))?\b/);
            if(eslesme){const yil=Number(eslesme[3]||bugun.getFullYear()),ay=Number(eslesme[2]),gun=Number(eslesme[1]),aday=new Date(yil,ay-1,gun,12);if(aday.getFullYear()===yil&&aday.getMonth()===ay-1&&aday.getDate()===gun)return yil+'-'+String(ay).padStart(2,'0')+'-'+String(gun).padStart(2,'0');}
        }
        return bugun.getFullYear()+'-'+String(bugun.getMonth()+1).padStart(2,'0')+'-'+String(bugun.getDate()).padStart(2,'0');
    }
function fdAiYetkiliPersoneller(){
        const liste=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null'));
        return isPersonelUser()?liste.filter(p=>String(p.id)===String(activeUser.tcNo||'')):liste;
    }
function fdAiBolum(baslik,liste,detay){
        if(!liste.length)return baslik+': 0';
        return baslik+' ('+liste.length+')\n'+liste.slice(0,30).map(detay||((x)=>String(x))).join('\n')+(liste.length>30?'\n... ve '+(liste.length-30)+' kay\u0131t daha.':'');
    }
function fdAiSaat(deger){
        if(!deger)return '-';
        try{return typeof magicpassSaatMetni==='function'?magicpassSaatMetni(deger):new Date(deger).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});}catch(_){
if(!fdAiValid())return;
return '-';}
    }
function fdAiGunlukVeri(){
        const tarih=fdAiBugun();
        return fdAiYetkiliPersoneller().map(personel=>{
            let hesap={};
            try{hesap=typeof magicpassGunHesapla==='function'?magicpassGunHesapla(personel,tarih):{};}catch(_){
if(!fdAiValid())return;
}
            return {ad:personel.ad||'-',durum:hesap.durum||'',izinTur:hesap.izin?.tur||'',giris:fdAiSaat(hesap.giris),cikis:fdAiSaat(hesap.cikis),gec:Number(hesap.gec||0),erken:Number(hesap.erken||0),mesai:Number(hesap.resmiTatilMesaiDakika??hesap.brutMesai??hesap.mesai??0)};
        });
    }
function fdAiGunlukOzet(){
        const veri=fdAiGunlukVeri(),izinli=veri.filter(x=>x.izinTur),gelmeyen=veri.filter(x=>!x.izinTur&&fdAiMetinAnahtari(x.durum).includes('gelmedi')),eksikEsik=magicpassGunlukEksikMesaiEsigi(),gec=veri.filter(x=>x.gec>=eksikEsik),erken=veri.filter(x=>x.erken>=eksikEsik),mesai=veri.filter(x=>x.mesai>=magicpassGunlukMesaiEsigi()),gelen=veri.filter(x=>x.giris!=='-'||x.cikis!=='-');
        return new Date().toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',weekday:'long'})+' personel \u00f6zeti\n\n'
            +fdAiBolum('Gelenler',gelen,x=>'- '+x.ad+' | '+x.giris+' - '+x.cikis)+'\n\n'
            +fdAiBolum('Gelmeyenler',gelmeyen,x=>'- '+x.ad)+'\n\n'
            +fdAiBolum('\u0130zinliler',izinli,x=>'- '+x.ad+' | '+x.izinTur)+'\n\n'
            +fdAiBolum('Ge\u00e7 gelenler',gec,x=>'- '+x.ad+' | '+x.giris+' ('+x.gec+' dk)')+'\n\n'
            +fdAiBolum('Erken \u00e7\u0131kanlar',erken,x=>'- '+x.ad+' | '+x.cikis+' ('+x.erken+' dk)')+'\n\n'
            +fdAiBolum('Fazla mesai e\u015fi\u011fini a\u015fanlar',mesai,x=>'- '+x.ad+' | '+Math.floor(x.mesai/60)+' sa '+(x.mesai%60)+' dk');
    }
function fdAiIzinOzeti(){
        const bugun=fdAiBugun(),yetkili=new Set(fdAiYetkiliPersoneller().map(p=>String(p.id))),kayitlar=(Array.isArray(izinler)?izinler:[]).filter(i=>aktifSirketeAit(i)&&yetkili.has(String(i.pId))).sort((a,b)=>String(b.baslangic||'').localeCompare(String(a.baslangic||'')));
        if(isPersonelUser())return fdAiBolum('\u0130zin ge\u00e7mi\u015finiz',kayitlar,x=>'- '+(x.tur||'\u0130zin')+' | '+tarihFormati(x.baslangic)+' - '+tarihFormati(x.bitis)+' | '+(x.sure||x.gun||'-')+' g\u00fcn');
        const bugunIzinli=kayitlar.filter(i=>String(i.baslangic||'')<=bugun&&bugun<=String(i.bitis||'')),adBul=id=>personeller.find(p=>String(p.id)===String(id))?.ad||'-';
        return fdAiBolum('Bug\u00fcn izinli personeller',bugunIzinli,x=>'- '+adBul(x.pId)+' | '+(x.tur||'\u0130zin')+' | '+tarihFormati(x.baslangic)+' - '+tarihFormati(x.bitis));
    }
function fdAiKkdOzeti(){
        const yetkili=new Set(fdAiYetkiliPersoneller().map(p=>String(p.id))),kayitlar=(Array.isArray(kkdKayitlari)?kkdKayitlari:[]).filter(k=>(!k.sirketId||String(k.sirketId)===String(aktifSirketId()))&&yetkili.has(String(k.pId))).sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||''))),adBul=id=>personeller.find(p=>String(p.id)===String(id))?.ad||'-';
        return fdAiBolum(isPersonelUser()?'KKD teslim ge\u00e7mi\u015finiz':'Son KKD teslimleri',kayitlar,x=>'- '+tarihFormati(x.tarih)+' | '+adBul(x.pId)+' | '+(x.tur||'-')+' | '+Number(x.adet||1)+' adet');
    }
function fdAiYaklasanBelgeler(){
        if(!isManagerUser())return 'Bu rapor yaln\u0131zca yetkili kullan\u0131c\u0131lar taraf\u0131ndan g\u00f6r\u00fclebilir.';
        let kayitlar=[];
        try{kayitlar=typeof policeGuncelKayitlar==='function'?policeGuncelKayitlar().filter(p=>{const d=policeDurumu(p);return d.tur==='gecen'||d.tur==='yaklasan';}):[];}catch(_){
if(!fdAiValid())return;
}
        kayitlar.sort((a,b)=>String(a.bitis||'').localeCompare(String(b.bitis||'')));
        return fdAiBolum('Yakla\u015fan veya s\u00fcresi ge\u00e7en poli\u00e7eler',kayitlar,p=>{const d=policeDurumu(p);return '- '+(p.hedefAdi||p.eslesmeKodu||'-')+' | '+(p.tur||'Poli\u00e7e')+' | '+tarihFormati(p.bitis)+' | '+d.metin;});
    }
function fdAiDonemCoz(soru){
        const q=fdAiMetinAnahtari(soru),bugun=new Date(fdAiBugun()+'T12:00:00'),bas=new Date(bugun),son=new Date(bugun);
        if(q.includes('bu ay'))bas.setDate(1);
        else {const gunEslesme=q.match(/son\s+(\d+)\s+gun/);if(gunEslesme)bas.setDate(bas.getDate()-Math.max(0,Number(gunEslesme[1])-1));else {bas.setMonth(0,1);}}
        const anahtar=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        const etiket=q.includes('bu ay')?bugun.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}):(q.match(/son\s+(\d+)\s+gun/)?'Son '+q.match(/son\s+(\d+)\s+gun/)[1]+' g\u00fcn':bugun.getFullYear()+' y\u0131l\u0131');
        return {bas:anahtar(bas),son:anahtar(son),etiket};
    }
function fdAiTarihAraligiGun(baslangic,bitis,donem){
        const bas=String(baslangic||'')>donem.bas?String(baslangic||''):donem.bas,bit=String(bitis||'')<donem.son?String(bitis||''):donem.son;
        if(!bas||!bit||bit<bas)return 0;
        return Math.floor((new Date(bit+'T12:00:00')-new Date(bas+'T12:00:00'))/86400000)+1;
    }
function fdAiSiraliSonuc(baslik,donem,harita,birim){
        const sirali=[...harita.entries()].map(([id,deger])=>({id,deger,ad:personeller.find(p=>String(p.id)===String(id))?.ad||'-'})).filter(x=>x.deger>0).sort((a,b)=>b.deger-a.deger||xTurkceKarsilastir(a.ad,b.ad));
        if(!sirali.length)return donem.etiket+' i\u00e7in '+baslik.toLocaleLowerCase('tr-TR')+' kayd\u0131 bulunamad\u0131.';
        const enYuksek=sirali[0].deger;
        return donem.etiket+' - '+baslik+'\n\n'+sirali.slice(0,10).map((x,i)=>(i+1)+'. '+x.ad+' - '+x.deger+' '+birim+(x.deger===enYuksek?'  [en y\u00fcksek]':'')).join('\n');
    }
function xTurkceKarsilastir(a,b){return String(a||'').localeCompare(String(b||''),'tr',{sensitivity:'base'});}
function fdAiIzinTurSiralama(soru,turAnahtari,baslik){
        const donem=fdAiDonemCoz(soru),yetkili=new Set(fdAiYetkiliPersoneller().map(p=>String(p.id))),toplam=new Map();
        (Array.isArray(izinler)?izinler:[]).filter(i=>aktifSirketeAit(i)&&yetkili.has(String(i.pId))&&fdAiMetinAnahtari(i.tur).includes(turAnahtari)).forEach(i=>{
            const gun=fdAiTarihAraligiGun(i.baslangic,i.bitis,donem),id=String(i.pId);if(gun)toplam.set(id,(toplam.get(id)||0)+gun);
        });
        return fdAiSiraliSonuc(baslik,donem,toplam,'g\u00fcn');
    }
function fdAiDevamsizlikSiralama(soru){
        const donem=fdAiDonemCoz(soru),yetkili=new Set(fdAiYetkiliPersoneller().map(p=>String(p.id))),gunler=new Map(),ekle=(id,tarih)=>{id=String(id||'');tarih=String(tarih||'').slice(0,10);if(!yetkili.has(id)||tarih<donem.bas||tarih>donem.son)return;if(!gunler.has(id))gunler.set(id,new Set());gunler.get(id).add(tarih);};
        (Array.isArray(puantajVerileri)?puantajVerileri:[]).filter(p=>aktifSirketeAit(p)).forEach(p=>{const durum=fdAiMetinAnahtari(p.durum);if(durum.includes('gelmedi')||durum.includes('devamsiz')||durum.includes('mazeretsiz'))ekle(p.pId,p.tarih);});
        (Array.isArray(izinler)?izinler:[]).filter(i=>aktifSirketeAit(i)&&fdAiMetinAnahtari(i.tur).includes('mazeretsiz')).forEach(i=>{let bas=new Date((String(i.baslangic||'')>donem.bas?i.baslangic:donem.bas)+'T12:00:00'),son=new Date((String(i.bitis||'')<donem.son?i.bitis:donem.son)+'T12:00:00');for(;bas<=son;bas.setDate(bas.getDate()+1))ekle(i.pId,bas.getFullYear()+'-'+String(bas.getMonth()+1).padStart(2,'0')+'-'+String(bas.getDate()).padStart(2,'0'));});
        const toplam=new Map([...gunler].map(([id,set])=>[id,set.size]));
        return fdAiSiraliSonuc('En \u00e7ok devams\u0131zl\u0131k yapan personeller',donem,toplam,'g\u00fcn');
    }
function fdAiYerelYaniti(soru){
        const q=fdAiMetinAnahtari(soru);
        const siralamaSorusu=q.includes('en cok')||q.includes('en fazla')||q.includes('siralama')||q.includes('sirala');
        if(siralamaSorusu&&q.includes('devamsiz'))return fdAiDevamsizlikSiralama(soru);
        if(siralamaSorusu&&q.includes('ucretsiz'))return fdAiIzinTurSiralama(soru,'ucretsiz','En \u00e7ok \u00fccretsiz izin kullanan personeller');
        if(siralamaSorusu&&q.includes('yillik'))return fdAiIzinTurSiralama(soru,'yillik','En \u00e7ok y\u0131ll\u0131k izin kullanan personeller');
        if(siralamaSorusu&&(q.includes('rapor')||q.includes('saglik')))return fdAiIzinTurSiralama(soru,'rapor','En \u00e7ok rapor kullanan personeller');
        if(siralamaSorusu&&q.includes('mazeretsiz'))return fdAiIzinTurSiralama(soru,'mazeretsiz','En \u00e7ok mazeretsiz izin kullanan personeller');

        if(!q)return '';
        if(q.includes('yardim')||q.includes('neler yap'))return '\u015eunlar\u0131 sorabilirsiniz:\n- Bug\u00fcnk\u00fc personel durumunu \u00f6zetle\n- \u0130zinleri g\u00f6ster\n- KKD teslimlerini g\u00f6ster\n- Yakla\u015fan belgeleri g\u00f6ster\n- Aktif personel say\u0131s\u0131';
        if(q.includes('bugun')||q.includes('dun')||q.includes('onceki gun')||q.includes('gunluk')||q.includes('gelmeyen')||q.includes('gec gelen')||q.includes('erken cikan'))return fdAiGunlukOzet(soru);
        if(q.includes('kkd'))return fdAiKkdOzeti();
        if(q.includes('izin'))return fdAiIzinOzeti();
        if(q.includes('police')||q.includes('belge')||q.includes('sigorta')||q.includes('vize'))return fdAiYaklasanBelgeler();
        if(q.includes('personel')&&(q.includes('kac')||q.includes('sayi')||q.includes('aktif')))return 'Aktif personel say\u0131s\u0131: '+fdAiYetkiliPersoneller().length;
        return 'Bu soruyu hen\u00fcz yerel rapor motorunda tan\u0131mlayamad\u0131m. Yard\u0131m yazarak kullanabilece\u011finiz komutlar\u0131 g\u00f6rebilirsiniz.';
    }
function fdAiFormGonder(event){event.preventDefault();const input=document.getElementById('fdAiInput'),soru=input?.value||'';if(input)input.value='';fdAiSor(soru);}
fdAiGunlukVeri=function(tarih=fdAiBugun()){
        return fdAiYetkiliPersoneller().map(personel=>{
            let hesap={};try{hesap=typeof magicpassGunHesapla==='function'?magicpassGunHesapla(personel,tarih):{};}catch(_){
if(!fdAiValid())return;
}
            let ham=[];try{ham=typeof magicpassGunHamHareketleriBul==='function'?magicpassGunHamHareketleriBul(personel,tarih):[];}catch(_){
if(!fdAiValid())return;
}
            const duzeltme=hesap.duzeltme||null,manuel=Boolean(duzeltme&&(duzeltme.giris||duzeltme.cikis||duzeltme.girisZamani||duzeltme.cikisZamani)),gercek=ham.length>0||manuel;
            const puantaj=(Array.isArray(puantajVerileri)?puantajVerileri:[]).find(p=>aktifSirketeAit(p)&&String(p.pId)===String(personel.id)&&String(p.tarih||'').slice(0,10)===tarih),pd=fdAiMetinAnahtari(puantaj?.durum||''),acikGelmedi=pd.includes('gelmedi')||pd.includes('devamsiz')||pd.includes('mazeretsiz');
            return {ad:personel.ad||'-',sube:personel.sube||'-',gorev:personel.gorev||'-',durum:hesap.durum||'',izinTur:hesap.izin?.tur||'',planlananVardiya:hesap.vardiya||'',gercekKayitVar:gercek,cihazHareketAdedi:ham.length,manuelKayitVar:manuel,giris:gercek?fdAiSaat(hesap.giris):'-',cikis:gercek?fdAiSaat(hesap.cikis):'-',gec:gercek?Number(hesap.gec||0):0,erken:gercek?Number(hesap.erken||0):0,mesai:gercek?Number(hesap.resmiTatilMesaiDakika??hesap.brutMesai??hesap.mesai??0):0,acikGelmedi};
        });
    };
fdAiGunlukOzet=function(soru=''){
        const tarih=fdAiSoruTarihiBul(soru),veri=fdAiGunlukVeri(tarih),izinli=veri.filter(x=>x.izinTur),hareketAktarildi=veri.some(x=>x.cihazHareketAdedi>0),manuelVar=veri.some(x=>x.manuelKayitVar),veriVar=hareketAktarildi||manuelVar,gelen=veri.filter(x=>x.gercekKayitVar),gelmeyen=veri.filter(x=>!x.izinTur&&!x.gercekKayitVar&&(x.acikGelmedi||(hareketAktarildi&&fdAiMetinAnahtari(x.durum).includes('gelmedi')))),bekleyen=veri.filter(x=>!x.izinTur&&!x.gercekKayitVar&&!gelmeyen.includes(x)),eksikEsik=magicpassGunlukEksikMesaiEsigi(),gec=gelen.filter(x=>x.gec>=eksikEsik),erken=gelen.filter(x=>x.erken>=eksikEsik),mesai=gelen.filter(x=>x.mesai>=magicpassGunlukMesaiEsigi());
        const not=!veriVar?'\u26a0 Bug\u00fcne ait cihaz veya manuel giri\u015f-\u00e7\u0131k\u0131\u015f kayd\u0131 hen\u00fcz bulunmuyor. Vardiya saatleri ger\u00e7ek hareket say\u0131lmad\u0131.\n\n':'',gelmeyenBolumu=!veriVar?'Gelmeyenler: Hen\u00fcz belirlenemez; hareket kay\u0131tlar\u0131 aktar\u0131lmam\u0131\u015f.':fdAiBolum('Gelmeyenler',gelmeyen,x=>'- '+x.ad);
        return new Date(tarih+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',weekday:'long'})+' personel \u00f6zeti\n\n'+not+fdAiBolum('Gelenler',gelen,x=>'- '+x.ad+' | '+x.giris+' - '+x.cikis)+'\n\n'+gelmeyenBolumu+'\n\n'+fdAiBolum('Kayd\u0131 beklenenler',bekleyen,x=>'- '+x.ad)+'\n\n'+fdAiBolum('\u0130zinliler',izinli,x=>'- '+x.ad+' | '+x.izinTur)+'\n\n'+fdAiBolum('Ge\u00e7 gelenler',gec,x=>'- '+x.ad+' | '+x.giris+' ('+x.gec+' dk)')+'\n\n'+fdAiBolum('Erken \u00e7\u0131kanlar',erken,x=>'- '+x.ad+' | '+x.cikis+' ('+x.erken+' dk)')+'\n\n'+fdAiBolum('Fazla mesai e\u015fi\u011fini a\u015fanlar',mesai,x=>'- '+x.ad+' | '+Math.floor(x.mesai/60)+' sa '+(x.mesai%60)+' dk');
    };
function fdAiIzinOzetleriniOlustur(yetkili,idler){
        const ozet=new Map(yetkili.map(p=>[String(p.id),{personel:p.ad||'-',turler:{},toplamGun:0}]));
        (Array.isArray(izinler)?izinler:[]).filter(i=>aktifSirketeAit(i)&&idler.has(String(i.pId))).forEach(i=>{const kayit=ozet.get(String(i.pId));if(!kayit)return;const gun=fdAiTarihAraligiGun(i.baslangic,i.bitis,{bas:'1900-01-01',son:'2999-12-31'}),tur=i.tur||'Izin';kayit.turler[tur]=(kayit.turler[tur]||0)+gun;kayit.toplamGun+=gun;});
        return [...ozet.values()];
    }
function fdAiPuantajOzetleriniOlustur(yetkili,idler){
        const yil=String(new Date().getFullYear()),ozet=new Map(yetkili.map(p=>[String(p.id),{personel:p.ad||'-',durumlar:{},gecDakika:0,erkenDakika:0,mesaiDakika:0}]));
        (Array.isArray(puantajVerileri)?puantajVerileri:[]).filter(p=>aktifSirketeAit(p)&&idler.has(String(p.pId))&&String(p.tarih||'').startsWith(yil)).forEach(p=>{const kayit=ozet.get(String(p.pId));if(!kayit)return;const durum=String(p.durum||'BELIRSIZ');kayit.durumlar[durum]=(kayit.durumlar[durum]||0)+1;kayit.gecDakika+=Number(p.gec||0);kayit.erkenDakika+=Number(p.erken||0);kayit.mesaiDakika+=Number(p.mesai||p.fazlaMesai||0);});
        return [...ozet.values()];
    }
function fdAiGuvenliDeger(deger,derinlik=0){
        if(derinlik>8||deger===undefined||typeof deger==='function')return undefined;
        if(deger===null||typeof deger==='number'||typeof deger==='boolean')return deger;
        if(typeof deger==='string'){
            if(/^data:[^;]+;base64,/i.test(deger)||deger.length>20000)return '[Dosya i\u00e7eri\u011fi g\u00f6nderilmedi]';
            return deger.length>4000?deger.slice(0,4000)+'...':deger;
        }
        if(Array.isArray(deger))return deger.slice(0,5000).map(x=>fdAiGuvenliDeger(x,derinlik+1)).filter(x=>x!==undefined);
        if(typeof deger==='object'){
            const sonuc={};
            for(const [anahtar,deger2] of Object.entries(deger)){
                const k=fdAiMetinAnahtari(anahtar);
                if(/sifre|parola|password|token|secret|api.?key|authorization|credential|access.?key|refresh.?key|client.?secret|tcno|tckn|kimlik|iban|banka|telefon|gsm|eposta|email|adres|cihazno/.test(k))continue;
                if(/base64|blob|arraybuffer|dosyaicerik|belgeicerik|pdfdata|worddata/.test(k))continue;
                const temiz=fdAiGuvenliDeger(deger2,derinlik+1);
                if(temiz!==undefined)sonuc[anahtar]=temiz;
            }
            return sonuc;
        }
        return String(deger);
    }
function fdAiGuvenliBaglamOlustur(soru){
        const yetkili=fdAiYetkiliPersoneller(),idler=new Set(yetkili.map(p=>String(p.id))),adBul=id=>yetkili.find(p=>String(p.id)===String(id))?.ad||'-',yonetici=isManagerUser(),bugun=fdAiBugun(),sorguTarihi=fdAiSoruTarihiBul(soru),buAy=bugun.slice(0,7),q=fdAiMetinAnahtari(soru);
        const ilgili=(...kelimeler)=>kelimeler.some(k=>q.includes(k));
        const tarihSirala=(a,b)=>String(b?.tarih||b?.baslangic||b?.kayitTarihi||b?.createdAt||'').localeCompare(String(a?.tarih||a?.baslangic||a?.kayitTarihi||a?.createdAt||''));
        const personelBagla=kayit=>{const pId=kayit?.pId??kayit?.personelId??kayit?.pid;return pId?{...kayit,personel:adBul(pId)}:kayit;};
        const listeHazirla=(liste,limit=200)=>(Array.isArray(liste)?liste:[]).filter(k=>aktifSirketeAit(k)&&(yonetici||idler.has(String(k?.pId??k?.personelId??k?.pid??'')))).sort(tarihSirala).slice(0,limit).map(k=>fdAiGuvenliDeger(personelBagla(k)));
        const baglam={veriKurallari:{kapsam:'Yetkili operasyon kayitlari',hesaplarAyarlariVeKimlikBilgileriGonderilmedi:true,sifrelerVeAnahtarlarGonderilmedi:true,dosyaHamIcerigiGonderilmedi:true,belgeBaglantilariCevaptaVerilebilir:true,vardiyaGercekHareketDegildir:true},tarih:bugun,sorguTarihi,rol:activeUser?.rol||'',soru:String(soru||''),personeller:yetkili.slice(0,600).map(p=>({id:p.id,ad:p.ad||'',sube:p.sube||'',gorev:p.gorev||'',girisTarihi:p.girisTarihi||'',cikisTarihi:p.cikisTarihi||'',durum:p.cikisTarihi?'Ayrildi':'Aktif'})),gunlukGirisCikis:fdAiGunlukVeri(sorguTarihi),bugunGirisCikis:fdAiGunlukVeri(),izinOzetleri:fdAiIzinOzetleriniOlustur(yetkili,idler),izinKayitlari:(Array.isArray(izinler)?izinler:[]).filter(i=>aktifSirketeAit(i)&&idler.has(String(i.pId))).sort((a,b)=>String(b.baslangic||'').localeCompare(String(a.baslangic||''))).slice(0,ilgili('izin','rapor','devamsiz')?3000:120).map(i=>fdAiGuvenliDeger({...i,personel:adBul(i.pId),gun:fdAiTarihAraligiGun(i.baslangic,i.bitis,{bas:'1900-01-01',son:'2999-12-31'})})),puantajYilOzetleri:fdAiPuantajOzetleriniOlustur(yetkili,idler),buAyPuantaj:(Array.isArray(puantajVerileri)?puantajVerileri:[]).filter(p=>aktifSirketeAit(p)&&idler.has(String(p.pId))&&String(p.tarih||'').startsWith(buAy)).slice(0,ilgili('personel','giris','cikis','puantaj','mesai','gec','erken','devamsiz','vardiya')?3500:120).map(p=>fdAiGuvenliDeger({...p,personel:adBul(p.pId)})),kkd:listeHazirla(kkdKayitlari,ilgili('kkd')?2500:120)};
        if(yonetici){
            const depoAdlari=new Map((typeof akaryakitDepolari==='function'?akaryakitDepolari():[]).map(d=>[String(d.id),d.ad||'Depo'])),aracAdlari=new Map((Array.isArray(araclar)?araclar:[]).map(a=>[String(a.id),a.plaka||'Ara\u00e7']));
            baglam.akaryakit={depolar:(typeof akaryakitDepolari==='function'?akaryakitDepolari():[]).map(d=>({ad:d.ad||'',kapasite:Number(d.kapasite||0),mevcutStok:typeof akaryakitDepoBakiyesi==='function'?Number(akaryakitDepoBakiyesi(d.id)||0):0})),hareketler:(typeof akaryakitHareketleri==='function'?akaryakitHareketleri():[]).slice().sort(tarihSirala).slice(0,ilgili('yakit','akaryakit','mazot','motorin','benzin','litre','depo')?2500:120).map(h=>({islem:h.tur==='giris'?'Depoya giren yak\u0131t':'Araca verilen yak\u0131t',tarih:h.tarih||'',litre:Number(h.litre||0),depo:depoAdlari.get(String(h.depoId))||'',plaka:aracAdlari.get(String(h.aracId))||'',km:Number(h.km||0),alan:h.alan||'',veren:h.veren||'',tedarikci:h.tedarikci||''}))};
            baglam.moduller={avanslar:listeHazirla(avanslar,ilgili('avans')?2500:80),ekOdemeler:listeHazirla(ekOdemeler,ilgili('ek odeme','prim')?2500:80),vardiyalar:listeHazirla(vardiyaKayitlari,ilgili('vardiya')?2500:100),tasimaIrsaliyeleri:listeHazirla(tasimaIrsaliyeleri,ilgili('irsaliye','sevkiyat')?2500:80),kiralarVeVarliklar:listeHazirla(kiraKayitlari,ilgili('kira','daire','isyeri','sozlesme','odeme','masraf')?3000:120),ihracat:listeHazirla(ihracatFirmalari,ilgili('ihracat','proforma','firma')?2500:80),icralar:listeHazirla(icralar,ilgili('icra')?2500:80),araclar:listeHazirla(araclar,ilgili('arac','plaka','vize','bakim','ruhsat','yakit','akaryakit','belge')?1800:120),subeler:(Array.isArray(subeler)?subeler:[]).filter(aktifSirketeAit).slice(0,300).map(s=>({id:s.id,ad:s.ad||s.subeAdi||''}))};
            try{baglam.policeler=typeof policeGuncelKayitlar==='function'?policeGuncelKayitlar().slice(0,ilgili('police','sigorta','kasko','dask','belge')?2500:120).map(p=>fdAiGuvenliDeger({...p,durum:policeDurumu(p).metin})):[];}catch(_){
if(!fdAiValid())return;
baglam.policeler=[];}
        }else baglam.moduller={avanslar:listeHazirla(avanslar,2000),ekOdemeler:listeHazirla(ekOdemeler,2000),vardiyalar:listeHazirla(vardiyaKayitlari,2000),icralar:listeHazirla(icralar,2000)};
        const insanKaynaklari=ilgili('personel','izin','rapor','puantaj','mesai','avans','icra','prim','kkd','vardiya','giris','cikis','devamsiz','gelmeyen','gec gelen','erken cikan');
        if(!insanKaynaklari){delete baglam.bugunGirisCikis;delete baglam.gunlukGirisCikis;delete baglam.izinOzetleri;delete baglam.izinKayitlari;delete baglam.puantajYilOzetleri;delete baglam.buAyPuantaj;delete baglam.kkd;}
        const modulKonulari={avanslar:['avans'],ekOdemeler:['ek odeme','prim'],vardiyalar:['vardiya','mesai','giris','cikis'],tasimaIrsaliyeleri:['irsaliye','sevkiyat','tasima'],kiralarVeVarliklar:['kira','kiraci','daire','isyeri','sozlesme','odeme','aidat'],ihracat:['ihracat','proforma','yukleme'],icralar:['icra'],araclar:['arac','plaka','ruhsat','bakim','muayene','yakit','akaryakit','mazot','motorin','benzin','litre']};
        if(baglam.moduller)Object.keys(baglam.moduller).forEach(anahtar=>{if(!(modulKonulari[anahtar]||[]).some(k=>q.includes(k)))delete baglam.moduller[anahtar];});
        if(!ilgili('yakit','akaryakit','mazot','motorin','benzin','litre','depo'))delete baglam.akaryakit;
        if(!ilgili('police','sigorta','kasko','dask'))delete baglam.policeler;
        return baglam;
    }
function fdAiAdDeseni(ad){
        return String(ad||'').trim().split(/\s+/).map(parca=>parca.replace(/[.*+?^$()|[\]\\{}]/g,'\\$&')).join('\\s+');
    }
function fdAiTakmaAdliPaketOlustur(soru){
        const kisiler=fdAiYetkiliPersoneller().slice().sort((a,b)=>String(a.id||'').localeCompare(String(b.id||''),undefined,{numeric:true})),kodlar=kisiler.map((p,i)=>({id:String(p.id||''),ad:String(p.ad||'').trim(),kod:'P'+String(i+1).padStart(3,'0')})).filter(x=>x.ad);
        const metniKodla=metin=>{let sonuc=String(metin??'');kodlar.slice().sort((a,b)=>b.ad.length-a.ad.length).forEach(x=>{try{const desen=new RegExp('(^|[^\\p{L}\\p{N}])('+fdAiAdDeseni(x.ad)+')(?=$|[^\\p{L}\\p{N}])','gu');sonuc=sonuc.replace(desen,(_,once)=>once+x.kod);}catch(_){
if(!fdAiValid())return;
}});return sonuc;},degeriKodla=deger=>{if(typeof deger==='string')return metniKodla(deger);if(Array.isArray(deger))return deger.map(degeriKodla);if(deger&&typeof deger==='object')return Object.fromEntries(Object.entries(deger).map(([k,v])=>[k,degeriKodla(v)]));return deger;};
        const baglam=fdAiGuvenliBaglamOlustur(soru);baglam.personelKodlari=kodlar.map(x=>x.kod);baglam.veriDurumu={yuklenenModuller:[...yuklenenVeriler]};const gecmis=fdAiMesajlar.filter(m=>!fdAiMetinAnahtari(m.metin).includes('fatih yaziyor')&&!fdAiMetinAnahtari(m.metin).includes('rapor hazirlaniyor')&&!fdAiMetinAnahtari(m.metin).startsWith('merhaba kayitlarinizla')).slice();if(gecmis.length&&gecmis.at(-1)?.rol==='kullanici'&&fdAiMetinAnahtari(gecmis.at(-1).metin)===fdAiMetinAnahtari(soru))gecmis.pop();
        return{soru:metniKodla(soru),baglam:degeriKodla(baglam),mesajlar:gecmis.slice(-8).map(m=>({role:m.rol==='asistan'?'assistant':'user',text:metniKodla(m.metin)})),cevabiAc:cevap=>String(cevap||'').replace(/\bP[\s_-]?(\d{1,3})\b/gi,(_,no)=>{const kod='P'+String(no).padStart(3,'0');return kodlar.find(x=>x.kod===kod)?.ad||'ilgili personel';})};
    }
function fdAiYanitiTemizle(cevap){
        let metin=String(cevap||'').replace(/\r\n?/g,'\n').trim();
        metin=metin.replace(/^\x60\x60\x60(?:json|javascript|js|typescript|ts|html|markdown|md|text)?\s*\n?/i,'').replace(/\n?\x60\x60\x60\s*$/i,'').trim();
        metin=metin.replace(/^\s*(?:cevap|yanıt|yanit|answer)\s*:\s*/i,'').trim();
        if(!metin)throw new Error('Yapay zekâ anlaşılır bir cevap üretemedi.');
        if(/^\s*(?:\{|\[|<!doctype|<html|function\s|const\s|let\s|var\s|class\s|import\s|export\s)/i.test(metin))throw new Error('Yapay zekâ rapor yerine teknik çıktı üretti. Lütfen sorunuzu yeniden deneyin.');
        return metin.slice(0,12000);
    }
async function fdAiGerekliVerileriYukle(soru){
fdAiAssert();

        if(!SUPABASE_MODE||!supabaseClient)return;
        const q=fdAiMetinAnahtari(soru),moduller=new Set();
        const ekle=(modul,...kelimeler)=>{if(kelimeler.some(k=>q.includes(k)))moduller.add(modul);};
        ekle('personel','personel','izin','rapor','puantaj','mesai','avans','icra','prim','kkd','vardiya','giris','cikis','devamsiz','gec','erken');
        ekle('arac','arac','plaka','ruhsat','bakim','muayene','yakit','akaryakit','mazot','motorin','benzin','litre','depo');
        ekle('kira','kira','kiraci','daire','isyeri','sozlesme','aidat');
        ekle('police','police','sigorta','kasko','dask');
        ekle('irsaliye','irsaliye','sevkiyat','tasima');
        ekle('ihracat','ihracat','proforma','yukleme');
        if(!moduller.size)moduller.add('personel');
        await fdAiAwait(Promise.all([...moduller].map(modul=>supabaseVerileriniYukle(modul))));
    }
async function fdAiGercekYaniti(soru){
fdAiAssert();

        if(!SUPABASE_MODE||!supabaseClient||!activeUser)throw new Error('Uygulama oturumu bulunamad\u0131.');
        await fdAiAwait(fdAiGerekliVerileriYukle(soru));
        const oturumSonucu=await fdAiAwait(supabaseClient.auth.getSession()),erisimAnahtari=oturumSonucu?.data?.session?.access_token;if(oturumSonucu?.error)throw oturumSonucu.error;if(!erisimAnahtari)throw new Error('Kullan\u0131c\u0131 oturumu do\u011frulanamad\u0131. Uygulamadan \u00e7\u0131k\u0131p yeniden girin.');const paket=fdAiTakmaAdliPaketOlustur(soru),sonuc=await fdAiAwait(supabaseClient.functions.invoke('fd-ai-assistant',{headers:{Authorization:'Bearer '+erisimAnahtari},body:{question:paket.soru,context:paket.baglam,messages:paket.mesajlar}}));
        if(sonuc.error){let mesaj=sonuc.error.message||String(sonuc.error);try{const detay=await fdAiAwait(sonuc.error.context?.json());if(detay?.error||detay?.message)mesaj=detay.error||detay.message;}catch(_){
if(!fdAiValid())return;
}throw new Error(mesaj);}
        if(!sonuc.data?.answer)throw new Error('Yapay zek\u00e2 servisi bo\u015f cevap verdi.');
        return fdAiYanitiTemizle(paket.cevabiAc(sonuc.data.answer));
    }
function fdAiMesajHtml(metin){let html=escapeDashboardText(String(metin||''));html=html.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');html=html.replace(/(https?:\/\/[^\s<]+)/g,'<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">Belgeyi a&ccedil;</a>');return html;}
function fdAiMesajEkle(rol,metin,gecici=false){const alan=document.getElementById('fdAiMesajlar');if(!alan)return null;const mesaj=document.createElement('div');mesaj.className='fd-ai-mesaj '+rol;if(rol==='asistan')mesaj.innerHTML=fdAiMesajHtml(metin);else mesaj.textContent=metin;alan.appendChild(mesaj);alan.scrollTop=alan.scrollHeight;if(!gecici){fdAiMesajlar.push({rol,metin});fdAiMesajlar=fdAiMesajlar.slice(-16);}return mesaj;}
let fdAiIstekDevamEdiyor=false;
async function fdAiSor(soru){
fdAiAssert();

        soru=String(soru||'').trim();if(!soru||fdAiIstekDevamEdiyor)return;
        fdAiIstekDevamEdiyor=true;const input=document.getElementById('fdAiInput'),gonder=document.querySelector('.fd-ai-gonder');if(input)input.disabled=true;if(gonder)gonder.disabled=true;
        fdAiMesajEkle('kullanici',soru);const bekleyen=fdAiMesajEkle('asistan','G\u00fcncel kay\u0131tlar kontrol ediliyor...',true);bekleyen?.classList.add('yukleniyor');
        try{const cevap=await fdAiAwait(fdAiGercekYaniti(soru));bekleyen?.remove();fdAiMesajEkle('asistan',cevap);}
        catch(error){
if(!fdAiValid())return;
console.warn('Yapay zek\u00e2 ba\u011flant\u0131s\u0131:',error);bekleyen?.remove();const yerel=fdAiYerelYaniti(soru),tanimli=!fdAiMetinAnahtari(yerel).includes('henuz yerel rapor motorunda'),hata=String(error?.message||'Ba\u011flant\u0131 hatas\u0131');fdAiMesajEkle('asistan',tanimli?yerel+'\n\nNot: Yapay zek\u00e2 servisine ula\u015f\u0131lamad\u0131 ('+hata+'). Bu sonu\u00e7 uygulaman\u0131n yerel raporundan haz\u0131rland\u0131.':'Yapay zek\u00e2 yan\u0131t veremedi: '+hata);}
        finally{
if(fdAiValid()){
fdAiIstekDevamEdiyor=false;if(input){input.disabled=false;input.focus();}if(gonder)gonder.disabled=false;
}
}
    }
function fdAiPanelAc(acik=true){
        if(acik&&isPersonelUser())return;
        const panel=document.getElementById('fdAiPanel'),perde=document.getElementById('fdAiPerde');if(!panel)return;
        panel.classList.toggle('acik',acik);perde?.classList.toggle('acik',acik);document.body.classList.toggle('fd-ai-acik',acik);
        if(acik)setTimeout(()=>document.getElementById('fdAiInput')?.focus(),180);
    }
function fdAiTemizle(){fdAiMesajlar=[];const alan=document.getElementById('fdAiMesajlar');if(alan)alan.replaceChildren();fdAiMesajEkle('asistan','Merhaba. Kay\u0131tlar\u0131n\u0131zla ilgili rapor ve \u00f6zet haz\u0131rlayabilirim. A\u015fa\u011f\u0131daki haz\u0131r sorulardan birini se\u00e7ebilir veya sorunuzu yazabilirsiniz.');}
return{init(){fdAiAssert();const panel=document.getElementById('fdAiPanel'),input=document.getElementById('fdAiInput');fdAiListen(input,'keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();fdAiFormGonder(event)}});fdAiListen(document,'keydown',event=>{if(fdAiValid()&&event.key==='Escape'&&panel.classList.contains('acik')){event.preventDefault();fdAiPanelAc(false)}});fdAiTemizle()},open(acik=true){fdAiAssert();return fdAiPanelAc(acik)},api:{fdAiPanelAc:function(...args){fdAiAssert();return fdAiPanelAc(...args)},fdAiTemizle:function(...args){fdAiAssert();return fdAiTemizle(...args)},fdAiSor:function(...args){fdAiAssert();return fdAiSor(...args)},fdAiFormGonder:function(...args){fdAiAssert();return fdAiFormGonder(...args)}},dispose(){fdAiDisposed=true;for(const timer of fdAiTimers)window.clearTimeout(timer);fdAiTimers.clear();fdAiListeners.splice(0).forEach(remove=>remove());fdAiMesajlar=[];fdAiIstekDevamEdiyor=false;document.getElementById('fdAiMesajlar')?.replaceChildren();document.getElementById('fdAiPanel')?.classList.remove('acik');document.getElementById('fdAiPerde')?.classList.remove('acik');document.body.classList.remove('fd-ai-acik')}};
});

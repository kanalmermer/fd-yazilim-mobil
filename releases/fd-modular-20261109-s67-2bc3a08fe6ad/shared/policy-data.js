// Shared read-only policy projections for vehicle/rental/settings/reminders/output.
function policeMetinAnahtari(deger){return String(deger||'').trim().toLocaleUpperCase('tr-TR').replace(/\s+/g,' ');}

function policePlakaAnahtari(deger){return policeMetinAnahtari(deger).replace(/[^0-9A-ZÇĞİÖŞÜ]/g,'');}

function policeTurleriniDuzelt(kaynak=uygulamaAyarlari?.policeTurleri){
        const varsayilan=VARSAYILAN_UYGULAMA_AYARLARI.policeTurleri||[];
        const liste=(Array.isArray(kaynak)?kaynak:varsayilan).map(x=>policeMetinAnahtari(x)).filter(Boolean);
        return [...new Set(liste)].length?[...new Set(liste)]:[...varsayilan];
    }

function policeHatirlatmaGunu(){return Math.min(365,Math.max(1,Number(uygulamaAyarlari?.policeHatirlatmaGunu||30)));}

function policeMerkeziKayitlar(){return kiraPoliceler().filter(p=>aktifSirketeAit(p));}

function policeDaireKaydi(p){return kiraDaireler().find(d=>String(d.id)===String(p.daireId||p.hedefId))||null;}

function policeKayitHedefTipi(p){if(p.hedefTip)return p.hedefTip;if(p.daireId){const d=policeDaireKaydi(p);return d?.mulkTuru==='isyeri'?'isyeri':'daire';}return 'diger';}

function policeKayitHedefAdi(p){const d=policeDaireKaydi(p);return d?.kisaAd||p.hedefAdi||p.varlikAdi||'Diğer';}

function policeKayitEslesmeKodu(p){if(p.eslesmeKodu)return p.eslesmeKodu;const d=policeDaireKaydi(p);return d?.uavt||'';}

function policeTumKayitlar(){
        const merkez=policeMerkeziKayitlar().map(p=>({...p,hedefTip:policeKayitHedefTipi(p),hedefAdi:policeKayitHedefAdi(p),eslesmeKodu:policeKayitEslesmeKodu(p),bedel:Number((p.bedel??p.tutar)||0)}));
        const eski=[];
        araclar.filter(aktifSirketeAit).forEach(a=>{
            if(a.sigortaSirketi||a.sigortaPoliceNo||a.sigortaBitis)eski.push({id:'eski_sigorta_'+a.id,tip:'police',hedefTip:'arac',hedefId:String(a.id),hedefAdi:a.plaka,eslesmeKodu:a.plaka,tur:'TRAFİK SİGORTASI',sirket:a.sigortaSirketi,policeNo:a.sigortaPoliceNo,bedel:Number(a.sigortaBedeli||0),baslangic:a.sigortaBaslangic,bitis:a.sigortaBitis,belge:a.belgeler?.sigorta,_sentetik:true,_kaynak:'Araç kartındaki eski kayıt'});
            if(a.kaskoSirketi||a.kaskoPoliceNo||a.kaskoBitis)eski.push({id:'eski_kasko_'+a.id,tip:'police',hedefTip:'arac',hedefId:String(a.id),hedefAdi:a.plaka,eslesmeKodu:a.plaka,tur:'KASKO',sirket:a.kaskoSirketi,policeNo:a.kaskoPoliceNo,bedel:Number(a.kaskoBedeli||0),baslangic:a.kaskoBaslangic,bitis:a.kaskoBitis,belge:a.belgeler?.kasko,_sentetik:true,_kaynak:'Araç kartındaki eski kayıt'});
            (a.sigortaGecmisi||[]).forEach((p,i)=>eski.push({...p,id:'eski_gecmis_'+a.id+'_'+(p.id||i),tip:'police',hedefTip:'arac',hedefId:String(a.id),hedefAdi:a.plaka,eslesmeKodu:a.plaka,bedel:Number(p.bedel||0),_sentetik:true,_kaynak:'Araç kartındaki geçmiş kayıt'}));
        });
        return [...merkez,...eski].sort((a,b)=>String(b.bitis||b.baslangic||'').localeCompare(String(a.bitis||a.baslangic||'')));
    }

function policeDurumu(p){
        const bit=policeGuncelTarihAnahtari(p.bitis),bas=policeGuncelTarihAnahtari(p.baslangic),bugun=bugununYerelTarihi();if(!bit)return{tur:'gecen',metin:p.bitis?'Bitiş tarihi geçersiz':'Bitiş tarihi yok'};
        if(p.baslangic&&(!bas||bas>bit))return{tur:'gecen',metin:'Poliçe tarihlerini kontrol edin'};
        if(bas>bugun)return{tur:'planli',metin:'Başlamadı · '+tarihFormati(bas)};
        const kalan=Math.ceil((new Date(bit+'T12:00:00')-new Date(bugun+'T12:00:00'))/86400000);
        if(kalan<0)return{tur:'gecen',metin:Math.abs(kalan)+' gün geçti'};
        if(kalan<=policeHatirlatmaGunu())return{tur:'yaklasan',metin:kalan===0?'Bugün bitiyor':kalan+' gün kaldı'};
        return{tur:'aktif',metin:'Aktif'};
    }

function policeDaireyleEslesir(p,d){const hedef=String(p.daireId||p.hedefId||'').trim();return hedef?hedef===String(d.id):Boolean(d.uavt&&policeMetinAnahtari(policeKayitEslesmeKodu(p)).replace(/[\s-]/g,'')===policeMetinAnahtari(d.uavt).replace(/[\s-]/g,''));}

function policeAraclaEslesir(p,a){const hedef=String(p.hedefId||'').trim();return hedef?hedef===String(a.id):Boolean(a.plaka&&policePlakaAnahtari(policeKayitEslesmeKodu(p))===policePlakaAnahtari(a.plaka));}

function policeDairePoliceleri(d){return policeMerkeziKayitlar().filter(p=>policeDaireyleEslesir(p,d)).sort((a,b)=>String(b.bitis||'').localeCompare(String(a.bitis||'')));}

function policeAracPoliceleri(a){return policeTumKayitlar().filter(p=>p.hedefTip==='arac'&&policeAraclaEslesir(p,a)).sort((x,y)=>String(y.bitis||'').localeCompare(String(x.bitis||'')));}

function policeBelgeHtml(p){return p.belge?.url?`<a class="btn-modern btn-detail-modern" href="${escapeDashboardText(p.belge.url)}" target="_blank" rel="noopener" title="Belgeyi aç">📎</a>`:'-';}

function policeVarlikTurleriniDuzelt(kaynak=uygulamaAyarlari?.policeVarlikTurleri){
        const zorunlu=['ARAÇ','DAİRE','İŞYERİ'],liste=[...zorunlu,...(Array.isArray(kaynak)?kaynak:(VARSAYILAN_UYGULAMA_AYARLARI.policeVarlikTurleri||[]))].map(policeMetinAnahtari).filter(Boolean);
        return [...new Set(liste)];
    }

function policeVarlikKodu(ad){const n=policeMetinAnahtari(ad);if(n==='ARAÇ')return'arac';if(n==='DAİRE')return'daire';if(n==='İŞYERİ')return'isyeri';if(n==='DİĞER')return'diger';return'ozel_'+n.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');}

function policeVarlikTurAdi(kod){return policeVarlikTurleriniDuzelt().find(ad=>policeVarlikKodu(ad)===String(kod))||String(kod||'Diğer').replace(/^ozel_/,'').replaceAll('_',' ').toLocaleUpperCase('tr-TR');}

function policeBagliVarlikTuruMu(kod){return['arac','daire','isyeri'].includes(String(kod));}

function policeTurRozeti(tur){const palet=['#0369a1','#7c3aed','#0f766e','#be123c','#c2410c','#4338ca','#15803d','#a21caf'],metin=String(tur||'-');let h=0;for(const c of metin)h=(h*31+c.charCodeAt(0))>>>0;return`<span class="police-tur-rozet" style="background:${palet[h%palet.length]}">${escapeDashboardText(metin)}</span>`;}

function policeBitisSiralama(a,b){const da=policeDurumu(a),db=policeDurumu(b),rank={gecen:0,yaklasan:1,planli:2,aktif:3};if(rank[da.tur]!==rank[db.tur])return rank[da.tur]-rank[db.tur];return da.tur==='gecen'?String(b.bitis||'').localeCompare(String(a.bitis||'')):String(a.bitis||'9999-12-31').localeCompare(String(b.bitis||'9999-12-31'));}

policeDairePoliceleri=function(d){return policeMerkeziKayitlar().filter(p=>policeDaireyleEslesir(p,d)).sort(policeBitisSiralama);};

policeAracPoliceleri=function(a){return policeTumKayitlar().filter(p=>p.hedefTip==='arac'&&policeAraclaEslesir(p,a)).sort(policeBitisSiralama);};

policeBelgeHtml=function(p){return p.belge?.url?`<a class="btn-modern btn-detail-modern police-belge-ac" href="${escapeDashboardText(p.belge.url)}" target="_blank" rel="noopener" title="Belgeyi aç" aria-label="Belgeyi aç">📄 <span>Aç</span></a>`:'-';};

const fdPoliceTumKayitlarHam=policeTumKayitlar;

function policeGuncelTarihAnahtari(deger){
        const tarih=String(deger||'').trim().slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(tarih))return'';
        const [yil,ay,gun]=tarih.split('-').map(Number),kontrol=new Date(Date.UTC(yil,ay-1,gun));
        return kontrol.getUTCFullYear()===yil&&kontrol.getUTCMonth()===ay-1&&kontrol.getUTCDate()===gun?tarih:'';
    }

function policeGuncelTurAnahtari(tur){return policeTurGrubu(tur).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'I').toUpperCase();}

function policeGuncelVarlikAnahtari(p){
        const sirket=String(p.sirketId||p.company_id||activeUser?.sirketId||''),tip=policeMetinAnahtari(p.hedefTip||policeKayitHedefTipi(p)).normalize('NFD').replace(/[\u0300-\u036f]/g,''),aile=tip==='ARAC'?'arac':p.daireId||['DAIRE','ISYERI'].includes(tip)?'mulk':tip;
        const id=String(p.daireId||p.hedefId||'').trim();if(id)return JSON.stringify([sirket,aile,'id',id]);
        const kod=aile==='arac'?policePlakaAnahtari(policeKayitEslesmeKodu(p)):policeMetinAnahtari(policeKayitEslesmeKodu(p)).replace(/[\s-]/g,'');
        if(kod){
            const varliklar=aile==='arac'?araclar:aile==='mulk'?kiraDaireler():[],eslesen=varliklar.filter(v=>String(v.sirketId||v.company_id||activeUser?.sirketId||'')===sirket&&(aile==='arac'?policePlakaAnahtari(v.plaka):policeMetinAnahtari(v.uavt).replace(/[\s-]/g,''))===kod),ids=[...new Set(eslesen.map(v=>String(v.id||'')).filter(Boolean))];
            if(ids.length>1)return'';return JSON.stringify([sirket,aile,ids.length?'id':'kod',ids[0]||kod]);
        }
        const ad=policeMetinAnahtari(p.hedefAdi||p.varlikAdi||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        return !['arac','mulk'].includes(aile)&&ad&&!['DIGER','VARLIK','-'].includes(ad)?JSON.stringify([sirket,aile,'ad',ad]):'';
    }

function policeGuncelKayitlar(kayitlar=policeTumKayitlar()){
        const guncel=new Map(),bagimsiz=[];
        for(const p of kayitlar){
            const varlik=policeGuncelVarlikAnahtari(p),tur=policeGuncelTurAnahtari(p.tur),bit=policeGuncelTarihAnahtari(p.bitis),bas=policeGuncelTarihAnahtari(p.baslangic);
            if(!varlik||!tur||!bit||(p.baslangic&&(!bas||bas>bit))){bagimsiz.push(p);continue;}
            const key=JSON.stringify([varlik,tur]),onceki=guncel.get(key);
            if(!onceki){guncel.set(key,p);continue;}
            const eskiBit=policeGuncelTarihAnahtari(onceki.bitis),eskiBas=policeGuncelTarihAnahtari(onceki.baslangic),donem=bit.localeCompare(eskiBit)||bas.localeCompare(eskiBas),merkez=Number(!p._sentetik)-Number(!onceki._sentetik),sira=policeKayitSirasi(p)-policeKayitSirasi(onceki);
            if(donem>0||(donem===0&&(merkez>0||(merkez===0&&(sira>0||(sira===0&&String(p.id||'').localeCompare(String(onceki.id||''))>0))))))guncel.set(key,p);
        }
        return [...guncel.values(),...bagimsiz].sort(policeBitisSiralama);
    }

function policeGuncelAracPoliceleri(a){
        const varlik=policeGuncelVarlikAnahtari({hedefTip:'arac',hedefId:a.id,sirketId:a.sirketId||a.company_id});
        return policeGuncelKayitlar(fdPoliceTumKayitlarHam()).filter(p=>policeGuncelVarlikAnahtari(p)===varlik);
    }

function policeVarlikEslesmeAnahtari(p){const varlik=policeGuncelVarlikAnahtari(p),tur=policeGuncelTurAnahtari(p.tur);return varlik&&tur?JSON.stringify([varlik,tur]):p.id?JSON.stringify([String(p.sirketId||p.company_id||activeUser?.sirketId||''),'kayit',String(p.id)]):'';}

function policeKayitlarAyniMi(a,b){const key=policeVarlikEslesmeAnahtari(a);return Boolean(key&&key===policeVarlikEslesmeAnahtari(b)&&String(a.baslangic||'')===String(b.baslangic||'')&&String(a.bitis||'')===String(b.bitis||''));}

function policeTurGrubu(tur){const key=policeMetinAnahtari(tur||'');if(key.includes('KASKO'))return'KASKO';if(key.includes('TRAFİK')||key.includes('TRAFIK'))return'TRAFİK';return key;}

function policeAracBelgesiBul(p){
        if(String(p.hedefTip||policeKayitHedefTipi(p))!=='arac')return null;
        const varlik=policeGuncelVarlikAnahtari(p),arac=varlik?araclar.find(a=>policeGuncelVarlikAnahtari({hedefTip:'arac',hedefId:a.id,sirketId:a.sirketId||a.company_id})===varlik):null;if(!arac)return null;
        const grup=policeTurGrubu(p.tur),adaylar=[];
        if(grup==='KASKO'&&arac.belgeler?.kasko?.url)adaylar.push({belge:arac.belgeler.kasko,tur:'KASKO',policeNo:arac.kaskoPoliceNo,baslangic:arac.kaskoBaslangic,bitis:arac.kaskoBitis});
        if(grup==='TRAFİK'&&arac.belgeler?.sigorta?.url)adaylar.push({belge:arac.belgeler.sigorta,tur:'TRAFİK',policeNo:arac.sigortaPoliceNo,baslangic:arac.sigortaBaslangic,bitis:arac.sigortaBitis});
        (arac.sigortaGecmisi||[]).forEach(k=>{if(k?.belge?.url&&policeTurGrubu(k.tur)===grup)adaylar.push({...k});});
        const no=policeMetinAnahtari(p.policeNo||''),bas=String(p.baslangic||''),bit=String(p.bitis||'');
        adaylar.forEach(k=>k._puan=(no&&policeMetinAnahtari(k.policeNo||'')===no?8:0)+(bas&&String(k.baslangic||'')===bas?4:0)+(bit&&String(k.bitis||'')===bit?4:0));
        return adaylar.sort((a,b)=>Number(b._puan||0)-Number(a._puan||0))[0]?.belge||null;
    }

function policeBelgesiniTamamla(p,tum){
        if(p.belge?.url)return p;const aracBelgesi=policeAracBelgesiBul(p);if(aracBelgesi)return{...p,belge:aracBelgesi};
        const varlik=policeGuncelVarlikAnahtari(p),grup=policeGuncelTurAnahtari(p.tur),no=policeMetinAnahtari(p.policeNo||''),bas=String(p.baslangic||''),bit=String(p.bitis||'');if(!varlik)return p;
        const adaylar=tum.filter(x=>x!==p&&x.belge?.url&&policeGuncelVarlikAnahtari(x)===varlik&&policeGuncelTurAnahtari(x.tur)===grup).map(x=>({x,puan:(no&&policeMetinAnahtari(x.policeNo||'')===no?8:0)+(bas&&String(x.baslangic||'')===bas?4:0)+(bit&&String(x.bitis||'')===bit?4:0)})).sort((a,b)=>b.puan-a.puan);
        return adaylar[0]?{...p,belge:adaylar[0].x.belge}:p;
    }

policeTumKayitlar=function(){const tum=fdPoliceTumKayitlarHam(),merkez=tum.filter(p=>!p._sentetik),tekMerkez=new Map();merkez.forEach(p=>{const key=policeMukerrerAnahtari(p),eski=tekMerkez.get(key);if(!eski){tekMerkez.set(key,p);return;}const yeni=policeKayitSirasi(p)>policeKayitSirasi(eski)?p:eski,diger=yeni===p?eski:p;tekMerkez.set(key,!yeni.belge?.url&&diger.belge?.url?{...yeni,belge:diger.belge}:yeni);});const temiz=[...tekMerkez.values()].map(p=>policeBelgesiniTamamla(p,tum));return [...temiz,...tum.filter(p=>p._sentetik&&!temiz.some(m=>policeKayitlarAyniMi(p,m))).map(p=>policeBelgesiniTamamla(p,tum))].sort(policeBitisSiralama);};

function policeMukerrerAnahtari(p){const key=policeVarlikEslesmeAnahtari(p);return key?JSON.stringify([key,String(p.baslangic||''),String(p.bitis||'')]):p;}

function policeKayitSirasi(p){const id=String(p.id||''),m=id.match(/(\d{11,})/);return Number(p.updatedAt||p.guncellenmeZamani||p.createdAt||p.olusturmaZamani||m?.[1]||0);}

function policeTurRengi(tur){const key=policeMetinAnahtari(tur||'');if(key.includes('TRAFİK'))return'#dc2626';if(key.includes('KASKO'))return'#7c3aed';if(key.includes('KONUT'))return'#0284c7';if(key.includes('DASK'))return'#ea580c';if(key.includes('YANGIN'))return'#b91c1c';if(key.includes('SAĞLIK'))return'#16a34a';if(key.includes('İŞVEREN')||key.includes('SORUMLULUK'))return'#4f46e5';if(key.includes('NAKLİYAT'))return'#0891b2';if(key.includes('MAKİNE')||key.includes('TESİS')||key.includes('GES'))return'#a16207';const turler=policeTurleriniDuzelt(),index=Math.max(0,turler.indexOf(key));return fdPoliceRenkPaleti[(index+5)%fdPoliceRenkPaleti.length];}

policeTurRozeti=function(tur,belge=null,kayitId=''){const metin=policeMetinAnahtari(tur||'-'),icerik=`<span class="police-tur-rozet" style="background:${policeTurRengi(metin)}">${escapeDashboardText(metin)}</span>`;return belge?.url?`<a class="police-tur-belge-link" href="${escapeDashboardText(String(belge.url))}" target="_blank" rel="noopener" title="${escapeDashboardText(metin)} belgesini aç" aria-label="${escapeDashboardText(metin)} belgesini aç">${icerik}</a>`:icerik;};

const fdPoliceRenkPaleti=['#047857','#7c3aed','#c2410c','#0369a1','#be123c','#4338ca','#0f766e','#a21caf','#b45309','#1d4ed8','#4d7c0f','#9f1239'];

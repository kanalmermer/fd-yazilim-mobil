// Shared vehicle/fuel data helpers; no screen is mounted by these consumers.
function aracTurSecenekleriniYenile(secili='') {
        const select=document.getElementById('aracTuru');if(!select)return;const mevcut=String(secili||select.value||''),turler=aracTurleriniDuzelt();
        if(mevcut&&!turler.some(x=>personelExcelBasliginiNormallestir(x)===personelExcelBasliginiNormallestir(mevcut)))turler.push(mevcut);
        select.innerHTML='<option value="">Seçiniz</option>'+turler.map(t=>`<option value="${escapeDashboardText(t)}">${escapeDashboardText(t)}</option>`).join('');select.value=mevcut;
    }

function aracPlakaAnahtari(deger) {
        return String(deger || '').toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]/g, '');
    }

function aracTarihDurumu(tarih) {
        if (!tarih) return { tur:'yok', gun:null, metin:'Tarih yok', stil:'background:#f1f5f9;color:#64748b;' };
        const tarihKey=String(tarih).slice(0,10),kontrol=new Date(tarihKey+'T12:00:00');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(tarihKey)||!Number.isFinite(kontrol.getTime())||kontrol.getFullYear()!==Number(tarihKey.slice(0,4))||kontrol.getMonth()+1!==Number(tarihKey.slice(5,7))||kontrol.getDate()!==Number(tarihKey.slice(8,10)))return {tur:'yok',gun:null,metin:'Tarih geçersiz',stil:'background:#f1f5f9;color:#64748b;'};
        const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
        const hedef = new Date(`${String(tarih).slice(0, 10)}T00:00:00`);
        const gun = Math.ceil((hedef - bugun) / 86400000);
        if (gun < 0) return { tur:'gecen', gun, metin:`${Math.abs(gun)} gün geçti`, stil:'background:#fee2e2;color:#991b1b;' };
        if (gun <= ayarSayisi('aracHatirlatmaGunu', 45)) return { tur:'yaklasan', gun, metin:gun === 0 ? 'Bugün' : `${gun} gün kaldı`, stil:'background:#fef3c7;color:#92400e;' };
        return { tur:'normal', gun, metin:tarihFormati(tarih), stil:'background:#dcfce7;color:#166534;' };
    }

function aracMtvKaydi(arac, yil, taksit) {
        return (Array.isArray(arac.mtvOdemeleri) ? arac.mtvOdemeleri : []).find(o => Number(o.yil) === Number(yil) && Number(o.taksit) === Number(taksit));
    }

function aracRuhsatMetniniEsitle(metin) {
        return String(metin || '').toLocaleUpperCase('tr-TR')
            .replace(/[İI]/g,'I').replace(/Ş/g,'S').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O').replace(/Ç/g,'C')
            .replace(/[|]/g,'I').replace(/\s+/g,' ').trim();
    }

function akaryakitDepolari() { return akaryakitKayitlari.filter(k => k.tur === 'depo' && aktifSirketeAit(k)); }

function akaryakitHareketleri() { return akaryakitKayitlari.filter(k => ['giris','cikis'].includes(k.tur) && aktifSirketeAit(k)); }

function akaryakitStokSayisi(deger) {
        if(deger===null||deger===undefined||typeof deger==='boolean'||String(deger).trim()==='')return null;
        const sayi=Number(deger);return Number.isFinite(sayi)?sayi:null;
    }

function akaryakitStokTarihAnahtari(hareket) {
        const metin=String(hareket?.tarih||'').trim(),eslesme=/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(metin);
        if(!eslesme)return null;
        const [,yil,ay,gun,saat,dakika,saniye='00',milisaniye='',bolge]=eslesme,parcalar=[Number(yil),Number(ay),Number(gun)];
        const kontrol=new Date(Date.UTC(parcalar[0],parcalar[1]-1,parcalar[2]));
        if(kontrol.getUTCFullYear()!==parcalar[0]||kontrol.getUTCMonth()!==parcalar[1]-1||kontrol.getUTCDate()!==parcalar[2]||(saat!==undefined&&(Number(saat)>23||Number(dakika)>59||Number(saniye)>59)))return null;
        if(bolge){
            const tarih=new Date(metin);if(!Number.isFinite(tarih.getTime()))return null;
            const alanlar=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(tarih).map(p=>[p.type,p.value]));
            return `${alanlar.year}-${alanlar.month}-${alanlar.day}T${alanlar.hour}:${alanlar.minute}:${alanlar.second}.${String(tarih.getUTCMilliseconds()).padStart(3,'0')}`;
        }
        // Eski teslim satırlarında saat yoktur: aynı günün depo girişleri önce, teslimler gün sonunda hesaplanır.
        const zaman=saat===undefined?(hareket?.tur==='giris'?'00:00:00.000':'23:59:59.999'):`${saat}:${dakika}:${saniye}.${milisaniye.padEnd(3,'0')}`;
        return `${yil}-${ay}-${gun}T${zaman}`;
    }

function akaryakitStokHareketKarsilastir(a,b) {
        const tarihA=akaryakitStokTarihAnahtari(a),tarihB=akaryakitStokTarihAnahtari(b);
        if(tarihA!==tarihB)return tarihA===null?1:tarihB===null?-1:tarihA.localeCompare(tarihB);
        const sira=h=>{const kayitSirasi=akaryakitStokSayisi(h.stokKayitSirasi);if(kayitSirasi!==null)return kayitSirasi;const eskiZaman=/^yakit_(\d{13})(?:_|$)/.exec(String(h.id||''));return eskiZaman?Number(eskiZaman[1])*1000:0;};
        return sira(a)-sira(b)||String(a.id||'').localeCompare(String(b.id||''),'tr',{numeric:true});
    }

function akaryakitStokHesaplariniHesapla() {
        const depolar=new Map(),hareketler=new Map(),gruplar=new Map(),yuvarla=sayi=>Math.round((sayi+Number.EPSILON)*1e6)/1e6;
        akaryakitDepolari().forEach(depo=>{const hesapBaslangici=akaryakitStokSayisi(depo.baslangic),ilk=akaryakitStokSayisi(depo.ilkBaslangic);depolar.set(String(depo.id),{acilis:ilk===null?hesapBaslangici:ilk,hesapBaslangici,mevcut:hesapBaslangici,giris:0,cikis:0});});
        akaryakitHareketleri().forEach(h=>{const depoId=String(h.depoId??'');if(!gruplar.has(depoId))gruplar.set(depoId,[]);gruplar.get(depoId).push(h);});
        gruplar.forEach((liste,depoId)=>{
            const depo=depolar.get(depoId);if(!depo){liste.forEach(h=>hareketler.set(String(h.id),{onceki:null,kalan:null,depoId}));return;}
            const tarihlerGecerli=liste.every(h=>akaryakitStokTarihAnahtari(h)!==null);
            let bakiye=tarihlerGecerli?depo.hesapBaslangici:null,net=depo.hesapBaslangici;
            liste.slice().sort(akaryakitStokHareketKarsilastir).forEach(h=>{
                const sayi=akaryakitStokSayisi(h.litre),litre=sayi===null||sayi<0?null:sayi,onceki=bakiye,fark=litre===null?null:(h.tur==='giris'?litre:-litre);
                bakiye=bakiye===null||fark===null?null:yuvarla(bakiye+fark);net=net===null||fark===null?null:yuvarla(net+fark);
                if(litre===null)depo[h.tur]=null;else if(depo[h.tur]!==null)depo[h.tur]=yuvarla(depo[h.tur]+litre);
                hareketler.set(String(h.id),{onceki,kalan:bakiye,depoId});
            });
            depo.mevcut=net;
        });
        return {depolar,hareketler};
    }

function akaryakitDepoBakiyesi(depoId) {
        const depo=akaryakitDepolari().find(d=>String(d.id)===String(depoId)); if(!depo)return 0;
        return Number(depo.baslangic||0)+akaryakitHareketleri().filter(h=>String(h.depoId)===String(depoId)).reduce((t,h)=>t+(h.tur==='giris'?Number(h.litre||0):-Number(h.litre||0)),0);
    }

function akaryakitTuketimAraliklari(aracId='') {
        const gruplar={};
        akaryakitHareketleri().filter(h=>h.tur==='cikis'&&h.aracId&&(!aracId||String(h.aracId)===String(aracId))).forEach(h=>(gruplar[h.aracId]||=[]).push(h));
        const araliklar=[];
        Object.values(gruplar).forEach(liste=>{liste.sort((a,b)=>String(a.tarih).localeCompare(String(b.tarih)));liste.forEach((h,i)=>{const onceki=liste[i-1],kmFarki=Number(h.km||0)-Number(onceki?.km||0);if(onceki&&kmFarki>0)araliklar.push({aracId:h.aracId,kayitId:h.id,oncekiTarih:onceki.tarih,sonTarih:h.tarih,oncekiKm:Number(onceki.km||0),sonKm:Number(h.km||0),kmFarki,litre:Number(h.litre||0),oran:Number(h.litre||0)/kmFarki*100});});});
        return araliklar;
    }

function akaryakitTuketimleriniHesapla() { return new Map(akaryakitTuketimAraliklari().map(a=>[a.kayitId,a.oran])); }

function akaryakitTuketimDonemOzeti(araliklar,donemUzunlugu) {
        const gruplar={};
        araliklar.forEach(a=>{const donem=String(a.sonTarih||'').slice(0,donemUzunlugu);if(!donem)return;(gruplar[donem]||=[]).push(a);});
        return Object.entries(gruplar).sort((a,b)=>b[0].localeCompare(a[0])).map(([donem,liste])=>{const litre=liste.reduce((s,a)=>s+a.litre,0),km=liste.reduce((s,a)=>s+a.kmFarki,0);return{donem,adet:liste.length,litre,km,ortalama:km>0?litre/km*100:0};});
    }

function aracMtvTakipliMi(arac){return Boolean(arac) && arac.mtvTakip !== false && !aracYariRomorkMu(arac.tur);}

function aracSigortaTakipliMi(arac){return Boolean(arac) && arac.sigortaTakip !== false;}

function aracVizeTakipliMi(arac){return Boolean(arac) && arac.vizeTakip !== false;}

function aracYariRomorkMu(deger = document.getElementById('aracTuru')?.value) {
        return personelExcelBasliginiNormallestir(deger) === 'yariromork';
    }
function fdAracOrtakAnahtari(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulAyarlariniDuzelt().map(m=>[m.anahtar,anaMenuModulYetkisi(m.anahtar)])])}
async function fdAracOrtakBekle(promise,session){if(session!==fdAracOrtakAnahtari())throw Error('Araç kayıt oturumu değişti.');const result=await promise;if(session!==fdAracOrtakAnahtari())throw Error('Araç kayıt oturumu değişti.');return result}
async function aracVerileriniKaydet() {
const fdAracSharedSession=fdAracOrtakAnahtari();

        if (SUPABASE_MODE) return supabaseVerileriKaydet();
        return verileriKaydet();
    }

async function aracTekKaydiKaydet(arac) {
const fdAracSharedSession=fdAracOrtakAnahtari();

        if(!arac||!aktifSirketeAit(arac))throw new Error('Bu araç aktif şirkete ait değil.');
        if (!SUPABASE_MODE) return aracVerileriniKaydet();
        const legacyId = supabaseKayitAnahtari('araclar', arac, 0);
        const { data,error } = await fdAracOrtakBekle(zamanAsimliBekle(supabaseClient.from('portal_records').upsert({
            company_id:activeUser.sirketId,
            module:'araclar',
            legacy_id:legacyId,
            record_year:Number(aktifKayitYili || new Date().getFullYear()),
            employee_legacy_id:arac.personelId ? String(arac.personelId) : null,
            data:arac
        }, { onConflict:'company_id,module,legacy_id' }).select('data').single(),15000,'Araç kaydının sonucu zamanında alınamadı. Tekrar kaydetmeden önce listeyi yenileyerek kontrol edin.'),fdAracSharedSession);
        if (error) throw error;
        if (!data?.data || String(data.data.id || '') !== String(arac.id || '')) throw new Error('Araç kaydı veritabanında doğrulanamadı.');
        const yerelIndex = araclar.findIndex(a => String(a.id) === String(arac.id));
        if (yerelIndex >= 0) araclar[yerelIndex] = { ...data.data, bakimlar:Array.isArray(data.data.bakimlar) ? data.data.bakimlar : [], mtvOdemeleri:Array.isArray(data.data.mtvOdemeleri) ? data.data.mtvOdemeleri : [], sigortaGecmisi:Array.isArray(data.data.sigortaGecmisi) ? data.data.sigortaGecmisi : [], vizeGecmisi:Array.isArray(data.data.vizeGecmisi) ? data.data.vizeGecmisi : [] };
        veriKayitGoruntusunuYenile('araclar');
        veriOnbelleginiKaydet();
    }

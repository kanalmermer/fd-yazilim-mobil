// Eager data normalization/service contracts; no Settings screen or form state.
function fdOrtakAyarOturumu(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||''])}
async function fdOrtakAyarBekle(promise,check){check();const value=await promise;check();return value}
function siparisAyarBirimleriniDuzelt(kaynak=uygulamaAyarlari?.siparisBirimleri){
        const ham=Array.isArray(kaynak)?kaynak:String(kaynak||'').split(/[\n,;]+/);
        const liste=[];ham.forEach(deger=>{const birim=String(deger||'').trim().toLocaleUpperCase('tr-TR');if(birim&&!liste.includes(birim))liste.push(birim);});
        return liste.length?liste:[...VARSAYILAN_UYGULAMA_AYARLARI.siparisBirimleri];
    }

function whatsappVardiyaSubeleriniDuzelt(kaynak=uygulamaAyarlari?.whatsappVardiyaSubeleri){
        const ham=Array.isArray(kaynak)?kaynak:[];const liste=[];
        ham.forEach(deger=>{const sube=String(deger||'').trim();if(sube&&!liste.includes(sube))liste.push(sube);});
        return liste;
    }

function irsaliyeBirimleriniDuzelt(kaynak = uygulamaAyarlari.irsaliyeBirimleri) {
        const liste = Array.isArray(kaynak) ? kaynak : VARSAYILAN_UYGULAMA_AYARLARI.irsaliyeBirimleri;
        const temiz = liste.map(x => String(x || '').trim().toLocaleUpperCase('tr-TR')).filter(Boolean);
        return [...new Set(temiz)].length ? [...new Set(temiz)] : [...VARSAYILAN_UYGULAMA_AYARLARI.irsaliyeBirimleri];
    }

function aracTurleriniDuzelt(kaynak = uygulamaAyarlari?.aracTurleri) {
        const varsayilan = VARSAYILAN_UYGULAMA_AYARLARI.aracTurleri || [];
        const liste = (Array.isArray(kaynak) ? kaynak : varsayilan).map(x => String(x || '').trim()).filter(Boolean);
        return [...new Map(liste.map(x => [personelExcelBasliginiNormallestir(x), x])).values()];
    }

const ALAN_ADI_TESCIL_SCRIPT_URL='https:\x2f\x2fwww.turkticaret.net/siberhosting/js/tescilbelge.js';

function alanAdiTescilAyarlariniDuzelt(kaynak=uygulamaAyarlari?.alanAdiTescilBelgesi){
        const varsayilan=VARSAYILAN_UYGULAMA_AYARLARI.alanAdiTescilBelgesi||{},ayar={...varsayilan,...(kaynak||{})},konumlar=['tr','tl','tc','br','bl','bc'],boyutlar=['small','medium','large'];
        return{aktif:Boolean(ayar.aktif),token:String(ayar.token||varsayilan.token||'').trim(),styleType:konumlar.includes(ayar.styleType)?ayar.styleType:'tr',imgsize:boyutlar.includes(ayar.imgsize)?ayar.imgsize:'medium',position:'fixed'};
    }

function alanAdiTescilDurumunuYaz(metin,tur='bilgi'){
        const alan=document.getElementById('ayarAlanAdiTescilDurum');if(!alan)return;const renk=tur==='aktif'?'#047857':(tur==='uyari'?'#b45309':'#475569'),arka=tur==='aktif'?'#ecfdf5':(tur==='uyari'?'#fffbeb':'#f8fafc'),kenar=tur==='aktif'?'#6ee7b7':(tur==='uyari'?'#fcd34d':'#cbd5e1');alan.style.cssText='margin-top:10px;padding:10px 12px;border:1px solid '+kenar+';border-radius:9px;background:'+arka+';color:'+renk+';font-size:.78rem;font-weight:750;line-height:1.45';alan.textContent=metin;
    }

async function alanAdiTescilTokeniniKontrolEt(token){
        const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({islem:'alanAdiTescilKontrol',token:String(token||'')})});
        if(!response.ok)throw new Error('Tescil belgesi kontrol servisi yanıt vermedi.');const sonuc=await response.json();if(!sonuc?.basarili)throw new Error(sonuc?.hata||'Tescil belgesi durumu kontrol edilemedi.');return sonuc.belge||{};
    }

async function alanAdiTescilBelgesiniGoster(kaynak=uygulamaAyarlari?.alanAdiTescilBelgesi){
        document.getElementById('belgecontainer')?.remove();document.getElementById('alanAdiTescilScripti')?.remove();
        const ayar=alanAdiTescilAyarlariniDuzelt(kaynak);if(!ayar.aktif||!ayar.token){alanAdiTescilDurumunuYaz('Tescil belgesi rozeti kapalı.');return false;}
        alanAdiTescilDurumunuYaz('TürkTicaret tokenı kontrol ediliyor...');
        let kontrol;try{kontrol=await alanAdiTescilTokeniniKontrolEt(ayar.token);}catch(error){alanAdiTescilDurumunuYaz('TürkTicaret servisine ulaşılamadı; bozuk rozet gösterilmedi.','uyari');console.warn(error);return false;}
        if(!kontrol?.aktif){alanAdiTescilDurumunuYaz('Token kayıtlı ancak TürkTicaret tarafında online belge henüz aktif içerik döndürmüyor. Panelden aktivasyonu tamamlayın; bozuk gri kutu gizlendi.','uyari');return false;}
        const container=document.createElement('div');container.id='belgecontainer';container.setAttribute('aria-label','Alan adı tescil belgesi');
        const rozet=document.createElement('div');rozet.id='oatb';rozet.setAttribute('token',ayar.token);rozet.setAttribute('styleType',ayar.styleType);rozet.setAttribute('imgsize',ayar.imgsize);rozet.setAttribute('position','fixed');rozet.onmouseover=()=>{if(typeof window.gst==='function')window.gst();};rozet.onmouseout=()=>{if(typeof window.gz==='function')window.gz();};container.appendChild(rozet);document.body.appendChild(container);
        const script=document.createElement('script');script.id='alanAdiTescilScripti';script.async=true;script.src=ALAN_ADI_TESCIL_SCRIPT_URL+'?v='+Date.now();script.onerror=()=>{container.remove();alanAdiTescilDurumunuYaz('TürkTicaret rozet betiği yüklenemedi.','uyari');};document.body.appendChild(script);alanAdiTescilDurumunuYaz('Online tescil belgesi aktif; rozet gösteriliyor.','aktif');return true;
    }

async function sirketUygulamaAyarParcasiKaydet(degisiklik = {}) {
const fdKayitAnahtari=fdOrtakAyarOturumu();const fdKayitKontrol=()=>{if(fdKayitAnahtari!==fdOrtakAyarOturumu())throw Error('Ayar kaydı sırasında oturum değişti.');};

        if (!isManagerUser()) throw new Error('Bu ayarı değiştirme yetkiniz yok.');
        const yeniAyarlar = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...uygulamaAyarlari, ...degisiklik };
        kullaniciYetkiMatrisiniKoru(yeniAyarlar, uygulamaAyarlari);
        if (!SUPABASE_MODE) { uygulamaAyarlari = yeniAyarlar; return uygulamaAyarlari; }
        const sirketId = aktifSirketId();
        if (!sirketId) throw new Error('Şirket oturumu bulunamadı.');
        const { data:sirket, error:okumaHatasi } = await fdOrtakAyarBekle(supabaseClient.from('companies').select('data').eq('id',sirketId).maybeSingle(),fdKayitKontrol);
        if (okumaHatasi) throw okumaHatasi;
        if (!sirket) throw new Error('Şirket kaydı bulunamadı.');
        kullaniciYetkiMatrisiniKoru(yeniAyarlar, sirket.data?.uygulamaAyarlari || {});
        const { data:kaydedilen, error:kayitHatasi } = await fdOrtakAyarBekle(supabaseClient.from('companies')
            .update({ data:{ ...(sirket.data || {}), uygulamaAyarlari:yeniAyarlar } })
            .eq('id',sirketId)
            .select('data')
            .maybeSingle(),fdKayitKontrol);
        if (kayitHatasi) throw kayitHatasi;
        if (!kaydedilen?.data?.uygulamaAyarlari) throw new Error('Ayarlar sunucuda doğrulanamadı.');
        uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...kaydedilen.data.uygulamaAyarlari };
        return uygulamaAyarlari;
    }

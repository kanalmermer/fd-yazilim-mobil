// Common calendar/audit/search categories and records; Tapu file reader remains eager.
function fdDocDataContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||''])}
async function fdDocDataAwait(promise,identity){const r=await promise;if(identity!==fdDocDataContext())throw Error('Oturum değişti; evrak yanıtı kullanılmadı.');return r}
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
function evrakKategorileri(){
        const harita=new Map(EVRAK_HAZIR_KATEGORILER.map(x=>[x.id,{...x,hazir:true}]));
        evrakKayitlari.filter(x=>x&&x.tip==='kategori').forEach(x=>harita.set(String(x.id),{id:String(x.id),ad:String(x.ad||'Adsız Kategori'),aciklama:String(x.aciklama||''),ikon:evrakKategoriIkonu(x.ad),hazir:false}));
        return [...harita.values()].sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr',{sensitivity:'base'}));
    }
async function evrakVerileriniYukle(){
const fdDocIdentity=fdDocDataContext();

        if(!activeUser?.sirketId)throw new Error('Şirket oturumu bulunamadı.');
        const tum=[];const boyut=1000;
        for(let bas=0;;bas+=boyut){
            const sonuc=await fdDocDataAwait(supabaseClient.from('portal_records').select('legacy_id,data,record_year').eq('company_id',activeUser.sirketId).eq('module','evraktakip').order('id',{ascending:true}).range(bas,bas+boyut-1),fdDocIdentity);
            if(sonuc.error)throw sonuc.error;
            const paket=sonuc.data||[];tum.push(...paket);
            if(paket.length<boyut)break;
        }
        evrakKayitlari=tum.map(x=>({...x.data,id:String(x.data?.id||x.legacy_id)}));
    }
function evrakDosyayiOku(dosya){return new Promise((resolve,reject)=>{const okuyucu=new FileReader();okuyucu.onload=()=>{const base64=String(okuyucu.result||'').split(',')[1]||'';base64?resolve(base64):reject(new Error('Seçilen dosya okunamadı.'));};okuyucu.onerror=()=>reject(new Error('Seçilen dosya okunamadı.'));okuyucu.readAsDataURL(dosya);});}

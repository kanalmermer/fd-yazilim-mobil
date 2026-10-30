window.FDModules.define('personelbelge',function(){

let fdAnnualDisposed=false,fdAnnualOperation=0,fdAnnualOverlay=null,fdAnnualViewerTicket=null,fdAnnualPrinting=false,fdAnnualReady=false,fdAnnualWordStyle='';const fdAnnualSections=new Set(),fdAnnualDialogs=new Set(),fdAnnualInitial=fdAnnualContext(),fdAnnualOwner='annual-'+Math.random().toString(36).slice(2);
const fdAnnualOriginalPreview=window.personelBelgeOnizlemeAc;
function fdAnnualContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdAnnualValid(){return !fdAnnualDisposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulErisimiVar('personel')&&fdAnnualContext()===fdAnnualInitial}
function fdAnnualAssert(){if(!fdAnnualValid())throw Error('Oturum değişti; toplu personel belgelerini yeniden açın.')}
function fdAnnualOwnsViewer(){return document.getElementById('personelBelgeOnizleme')?.dataset.fdAnnualOwner===fdAnnualOwner}
function fdAnnualCurrent(ticket){return fdAnnualValid()&&ticket===fdAnnualOperation&&(fdAnnualViewerTicket!==ticket||fdAnnualOwnsViewer())}
async function fdAnnualAwait(p,ticket){fdAnnualAssert();if(!fdAnnualCurrent(ticket))throw Error('Belge işlemi iptal edildi.');const value=await p;if(!fdAnnualCurrent(ticket))throw Error('Belge işlemi iptal edildi.');return value}
function showGlobalOverlay(...args){fdAnnualAssert();window.showGlobalOverlay(...args);fdAnnualOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(fdAnnualOverlay&&fdAnnualOverlay[0]===document.getElementById('overlayTitle')?.textContent&&fdAnnualOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();fdAnnualOverlay=null}
function fdYuzerOnaySor(...args){fdAnnualAssert();const before=document.getElementById('fdYuzerOnayKatmani'),promise=window.fdYuzerOnaySor(...args),after=document.getElementById('fdYuzerOnayKatmani');if(after&&after!==before)fdAnnualDialogs.add(after);return promise}
function fdAnnualClaim(ticket){fdAnnualReady=false;yillikPersonelBelgeTopluModu=false;yillikPersonelBelgeHazirlananCiftler=[];const host=document.getElementById('personelBelgeOnizleme'),button=document.querySelector('#modalPersonelBelge .personel-word-actions button[onclick="personelBelgeWordIndir()"]');if(!fdAnnualOwnsViewer())fdAnnualWordStyle=button?.style.display||'';host.dataset.fdAnnualOwner=fdAnnualOwner;fdAnnualViewerTicket=ticket}
function fdAnnualStopPrint(){if(fdAnnualOwnsViewer())document.body.classList.remove('personel-word-yazdiriliyor');fdAnnualPrinting=false}
function fdAnnualReset(){fdAnnualOperation++;fdAnnualReady=false;fdAnnualStopPrint();for(const n of fdAnnualSections)n.remove();fdAnnualSections.clear();if(fdAnnualOwnsViewer()){const button=document.querySelector('#modalPersonelBelge .personel-word-actions button[onclick="personelBelgeWordIndir()"]');if(button)button.style.display=fdAnnualWordStyle;delete document.getElementById('personelBelgeOnizleme').dataset.fdAnnualOwner;}fdAnnualViewerTicket=null;yillikPersonelBelgeTopluModu=false;yillikPersonelBelgeHazirlananCiftler=[];hideGlobalOverlay();for(const n of fdAnnualDialogs)n.remove();fdAnnualDialogs.clear()}
function fdAnnualOtherPreview(...args){fdAnnualReset();return fdAnnualOriginalPreview.apply(this,args)}
function fdAnnualOpen(...args){fdAnnualAssert();if(!args.length)args=window.fdYillikBelgeAcmaIstegi()||[];const year=Number(args[0])||new Date().getFullYear();if(fdAnnualOwnsViewer()&&yillikPersonelBelgeAktifYili!==year)window.personelBelgeOnizlemeKapat();fdAnnualOperation++;return yillikPersonelBelgePaneliniAc(...args)}
let yillikPersonelBelgeTopluModu = false;
let yillikPersonelBelgeHazirlananCiftler = [];
let yillikPersonelBelgeAktifYili = 0;
async function yillikPersonelBelgeDurumunuKaydet() {
const fdAnnualTicket=fdAnnualOperation;fdAnnualAssert();
        const yerelHarita = { ...(uygulamaAyarlari.yillikPersonelBelgeleri || {}) };
        if (SUPABASE_MODE) {
            const { data:sirket, error:okumaHatasi } = await fdAnnualAwait(supabaseClient.from('companies').select('data').eq('id', aktifSirketId()).maybeSingle(),fdAnnualTicket);
            if (okumaHatasi) throw okumaHatasi;
            const sunucuAyarlar = sirket?.data?.uygulamaAyarlari || {};
            const yeniAyarlar = {
                ...sunucuAyarlar,
                ...uygulamaAyarlari,
                yillikPersonelBelgeleri:{ ...(sunucuAyarlar.yillikPersonelBelgeleri || {}), ...yerelHarita }
            };
            const { error } = await fdAnnualAwait(supabaseClient.from('companies').update({ data:{ ...(sirket?.data || {}), uygulamaAyarlari:yeniAyarlar } }).eq('id', aktifSirketId()),fdAnnualTicket);
            if (error) throw error;
            uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...yeniAyarlar };
        } else {
            localStorage.setItem(`fdYazilimYillikPersonelBelgeleri:${aktifSirketId()}`, JSON.stringify(yerelHarita));
        }
    }
async function yillikPersonelBelgePaneliniAc(yil = new Date().getFullYear()) {
const fdAnnualTicket=fdAnnualOperation;fdAnnualAssert();
        if (!isManagerUser()) return showToast('Bu belgeler için admin veya kullanıcı yetkisi gerekir.','error');
        yillikPersonelBelgeAktifYili = Number(yil) || new Date().getFullYear();
        const sonuc = yillikPersonelBelgeDurumunuAl(yillikPersonelBelgeAktifYili, true);
        if (sonuc.yeni) {
            try { await fdAnnualAwait(yillikPersonelBelgeDurumunuKaydet(),fdAnnualTicket); }
            catch (error) {if(!fdAnnualCurrent(fdAnnualTicket))return; return showToast('Yıllık belge listesi kaydedilemedi: ' + (error.message || error), 'error'); }
        }
        const durum = sonuc.durum;
        const hedefler = yillikPersonelBelgeHedefleri(durum);
        const gruplar = new Map();
        hedefler.forEach(personel => {
            const subeAdi = String(personel.sube || 'Şube belirtilmemiş');
            if (!gruplar.has(subeAdi)) gruplar.set(subeAdi, []);
            gruplar.get(subeAdi).push(personel);
        });
        const toplamBelge = hedefler.length * 2;
        const bekleyen = yillikPersonelBelgeBekleyenSayisi(durum);
        document.getElementById('yillikBelgeTarihAraligi').textContent = `${durum.baslangic} - ${durum.bitis} · Her çalışan için iki belge`;
        document.getElementById('yillikBelgeDurumOzeti').innerHTML = bekleyen
            ? `<strong>${hedefler.length} aktif çalışan</strong> için toplam ${toplamBelge} belge kapsamda. <strong>${bekleyen} belge bekliyor.</strong> Yazdırılan şube ve belge türleri kaydedilir; kalanlar için hatırlatma devam eder.`
            : `<strong>${yillikPersonelBelgeAktifYili} yılı tamamlandı.</strong> Kapsamdaki ${hedefler.length} aktif çalışanın iki onay belgesi de yazdırıldı. İsterseniz aşağıdan yeniden hazırlayabilirsiniz.`;
        document.getElementById('yillikBelgeSubeSecimleri').innerHTML = [...gruplar.entries()].map(([subeAdi,liste]) => `<label><input type="checkbox" name="yillikBelgeSube" value="${escapeDashboardText(subeAdi)}" checked onchange="yillikBelgeSubeSeciminiGuncelle()"> <span><strong>${escapeDashboardText(subeAdi)}</strong><small>${liste.length} aktif çalışan</small></span></label>`).join('') || '<div style="padding:8px;color:#64748b;">Aktif çalışan bulunmuyor.</div>';
        document.getElementById('yillikBelgeTumSubeler').checked = true;
        document.querySelectorAll('input[name="yillikBelgeTuru"]').forEach(input => input.checked = true);
        document.getElementById('yillikBelgeHataOzeti').style.display = 'none';
        document.getElementById('modalYillikPersonelBelge').style.display = 'flex';
    }
function yillikPersonelBelgePaneliniKapat() {
        document.getElementById('modalYillikPersonelBelge').style.display = 'none';
    }
function yillikBelgeTumSubeleriSec(secili) {
        document.querySelectorAll('input[name="yillikBelgeSube"]').forEach(input => input.checked = Boolean(secili));
    }
function yillikBelgeSubeSeciminiGuncelle() {
        const liste = [...document.querySelectorAll('input[name="yillikBelgeSube"]')];
        document.getElementById('yillikBelgeTumSubeler').checked = Boolean(liste.length && liste.every(input => input.checked));
    }
async function yillikPersonelBelgeleriniTopluHazirla() {
const fdAnnualTicket=fdAnnualOperation;fdAnnualAssert();
        const yil = yillikPersonelBelgeAktifYili || new Date().getFullYear();
        const durum = yillikPersonelBelgeDurumunuAl(yil, true).durum;
        const seciliSubeler = new Set([...document.querySelectorAll('input[name="yillikBelgeSube"]:checked')].map(input => input.value));
        const seciliBelgeler = [...document.querySelectorAll('input[name="yillikBelgeTuru"]:checked')].map(input => input.value);
        if (!seciliSubeler.size) return showToast('En az bir şube seçin.', 'error');
        if (!seciliBelgeler.length) return showToast('En az bir belge seçin.', 'error');
        const hedefler = yillikPersonelBelgeHedefleri(durum).filter(personel => seciliSubeler.has(String(personel.sube || 'Şube belirtilmemiş')));
        if (!hedefler.length) return showToast('Seçilen şubelerde hazırlanacak aktif çalışan bulunmuyor.', 'error');
        if (!window.docx?.renderAsync) return showToast('Toplu Word önizleme bileşeni yüklenemedi.', 'error');

        fdAnnualClaim(fdAnnualTicket);
        const alan = document.getElementById('personelBelgeOnizleme');
        const hatalar = [];
        const sablonOnbellegi = new Map();
        const hazirlananlar = [];
        yillikPersonelBelgePaneliniKapat();
        document.getElementById('personelBelgeBaslik').textContent = `📄 ${yil} Yıllık Personel Belgeleri`;
        document.getElementById('personelBelgeDosyaAdi').textContent = `${hedefler.length} çalışan · ${seciliBelgeler.length} belge türü · ${durum.baslangic} - ${durum.bitis}`;
        const indirButonu = document.querySelector('#modalPersonelBelge .personel-word-actions button[onclick="personelBelgeWordIndir()"]');
        if (indirButonu) indirButonu.style.display = 'none';
        alan.innerHTML = '<div style="margin:24px auto;width:max-content;padding:16px 20px;background:#fff;border-radius:10px;font-weight:700;">Toplu belgeler hazırlanıyor...</div>';
        document.getElementById('modalPersonelBelge').style.display = 'flex';
        showGlobalOverlay('Yıllık belgeler hazırlanıyor', `${hedefler.length} aktif çalışan için Word belgeleri düzenleniyor...`);
        try {
            alan.innerHTML = '';
            let sira = 0;
            for (const personel of hedefler) {
                const sube = personelSubesiniBul(personel);
                const sirket = sirketler.find(item => String(item.id) === String(personel.sirketId || aktifSirketId() || '')) || sirketler[0];
                for (const belgeKey of seciliBelgeler) {
                    sira++;
                    const tanim = SUBE_PERSONEL_BELGELERI.find(item => item.key === belgeKey);
                    const belge = sube?.personelBelgeleri?.[belgeKey];
                    showGlobalOverlay('Yıllık belgeler hazırlanıyor', `${sira}/${hedefler.length * seciliBelgeler.length} · ${personel.ad} · ${tanim?.baslik || belgeKey}`);
                    if (!sube || !belge?.id || !tanim) {
                        hatalar.push(`${personel.ad} · ${personel.sube || 'Şube yok'} · ${tanim?.baslik || belgeKey}: Şablon yüklü değil.`);
                        continue;
                    }
                    try {
                        let kaynak = sablonOnbellegi.get(String(belge.id));
                        if (!kaynak) {
                            const sonuc = await fdAnnualAwait(fdYazilimDriveDosyaIndir(belge.id),fdAnnualTicket);
                            kaynak = base64DizisineCevir(sonuc.base64);
                            sablonOnbellegi.set(String(belge.id), kaynak);
                        }
                        const degerler = [
                            String(personel.id || ''),
                            String(sube.adres || ''),
                            String(sirket?.unvan || sirket?.kisaAd || ''),
                            `${durum.baslangic} - ${durum.bitis} `,
                            String(personel.ad || '').toLocaleUpperCase('tr-TR')
                        ];
                        const blob = await fdAnnualAwait(personelWordBelgesiniHazirla(kaynak.buffer, degerler, belgeKey),fdAnnualTicket);
                        const kabuk = document.createElement('section');
                        kabuk.className = 'yillik-belge-render';
                        const ekranBasligi = document.createElement('div');
                        ekranBasligi.className = 'yillik-belge-ekran-basligi';
                        ekranBasligi.style.cssText = 'max-width:900px;margin:0 auto 7px;padding:8px 12px;border-radius:8px;background:#334155;color:#fff;font-weight:800;font-size:.76rem;';
                        ekranBasligi.textContent = `${personel.ad} · ${sube.ad} · ${tanim.baslik}`;
                        const renderAlani = document.createElement('div');
                        kabuk.append(ekranBasligi, renderAlani);
                        alan.appendChild(kabuk);fdAnnualSections.add(kabuk);
                        await fdAnnualAwait(window.docx.renderAsync(blob, renderAlani, renderAlani, { inWrapper:true, breakPages:true, ignoreLastRenderedPageBreak:false, renderHeaders:true, renderFooters:true, renderFootnotes:true, ignoreWidth:false, ignoreHeight:false, ignoreFonts:false, useBase64URL:true, experimental:true }),fdAnnualTicket);
                        hazirlananlar.push({ personelId:String(personel.id), belgeKey });
                    } catch (error) {if(!fdAnnualCurrent(fdAnnualTicket))return;
                        hatalar.push(`${personel.ad} · ${tanim.baslik}: ${error.message || error}`);
                    }
                }
            }
            if (!hazirlananlar.length) throw new Error('Hiçbir belge hazırlanamadı. Şubelerdeki Word şablonlarını kontrol edin.');
            yillikPersonelBelgeTopluModu = true;
            yillikPersonelBelgeHazirlananCiftler = hazirlananlar;
            personelBelgeOnizlemeBlobu = null;
            personelBelgeOnizlemeAdi = '';
            if (hatalar.length) {
                const hataOzeti = document.createElement('div');
                hataOzeti.className = 'yillik-belge-ekran-basligi';
                hataOzeti.style.cssText = 'max-width:900px;margin:0 auto 12px;padding:12px;border-radius:9px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;';
                hataOzeti.innerHTML = `<strong>${hatalar.length} belge hazırlanamadı:</strong><br>${hatalar.map(escapeDashboardText).join('<br>')}`;
                alan.prepend(hataOzeti);
            }
            showToast(`${hazirlananlar.length} belge hazırlandı. Önizlemeyi kontrol edip Toplu Yazdır düğmesine basın.`);
        } catch (error) {if(!fdAnnualCurrent(fdAnnualTicket))return;
            personelBelgeOnizlemeKapat();
            showToast('Toplu belgeler hazırlanamadı: ' + (error.message || error), 'error');
        } finally {
            hideGlobalOverlay();
        }
    }
async function yillikPersonelBelgeleriniTopluYazdir() {
const fdAnnualTicket=fdAnnualOperation;fdAnnualAssert();
        if (!yillikPersonelBelgeHazirlananCiftler.length) return;
        document.body.classList.add('personel-word-yazdiriliyor');
        try {
            window.print();
            const yazdirildi = await fdAnnualAwait(fdYuzerOnaySor('Yazdırma işlemi tamamlandı mı? Onaylarsanız hazırlanan belgeler tamamlandı olarak kaydedilecek.'),fdAnnualTicket);
            if (!yazdirildi) {
                showToast('Belgeler tamamlandı olarak işaretlenmedi; günlük hatırlatma devam edecek.');
                return;
            }
            const yil = yillikPersonelBelgeAktifYili;
            const sonuc = yillikPersonelBelgeDurumunuAl(yil, true);
            const durum = sonuc.durum;
            const tamamlananlar = { ...(durum.tamamlananlar || {}) };
            yillikPersonelBelgeHazirlananCiftler.forEach(kayit => {
                const mevcut = Array.isArray(tamamlananlar[kayit.personelId]) ? tamamlananlar[kayit.personelId] : [];
                tamamlananlar[kayit.personelId] = [...new Set([...mevcut, kayit.belgeKey])];
            });
            const harita = { ...(uygulamaAyarlari.yillikPersonelBelgeleri || {}) };
            harita[String(yil)] = { ...durum, tamamlananlar, sonGuncelleme:new Date().toISOString(), sonYazdiran:String(activeUser?.username || ''), sonYazdirmaZamani:new Date().toISOString() };
            uygulamaAyarlari = { ...uygulamaAyarlari, yillikPersonelBelgeleri:harita };
            await fdAnnualAwait(yillikPersonelBelgeDurumunuKaydet(),fdAnnualTicket);
            const kalan = yillikPersonelBelgeBekleyenSayisi(harita[String(yil)]);
            showToast(kalan ? `Yazdırılan belgeler kaydedildi. ${kalan} belge için günlük hatırlatma devam edecek.` : `${yil} yılı için tüm onay belgeleri tamamlandı; hatırlatma kapatıldı.`);
        } catch (error) {if(!fdAnnualCurrent(fdAnnualTicket))return;
            showToast('Yazdırma durumu kaydedilemedi: ' + (error.message || error), 'error');
        } finally {
            fdAnnualStopPrint();
        }
    }
return{init(){window.personelBelgeOnizlemeAc=fdAnnualOtherPreview},open:fdAnnualOpen,api:{yillikPersonelBelgePaneliniAc:fdAnnualOpen,
yillikPersonelBelgePaneliniKapat(){fdAnnualOperation++;if(!fdAnnualReady&&fdAnnualOwnsViewer())window.personelBelgeOnizlemeKapat();return yillikPersonelBelgePaneliniKapat()},
yillikBelgeTumSubeleriSec(...args){fdAnnualAssert();return yillikBelgeTumSubeleriSec(...args)},
yillikBelgeSubeSeciminiGuncelle(...args){fdAnnualAssert();return yillikBelgeSubeSeciminiGuncelle(...args)},
yillikPersonelBelgeleriniTopluHazirla(){fdAnnualAssert();const ticket=++fdAnnualOperation;return Promise.resolve(yillikPersonelBelgeleriniTopluHazirla()).then(value=>{if(fdAnnualCurrent(ticket)&&fdAnnualOwnsViewer()&&yillikPersonelBelgeTopluModu)fdAnnualReady=true;return value})},
yillikPersonelBelgeleriniTopluYazdir(){fdAnnualAssert();if(!fdAnnualReady||!fdAnnualOwnsViewer())return;fdAnnualOperation++;fdAnnualViewerTicket=fdAnnualOperation;fdAnnualPrinting=true;return yillikPersonelBelgeleriniTopluYazdir()},fdYillikBelgeTopluDurumunuTemizle:fdAnnualReset,fdYillikBelgeTopluModuAktifMi(){return fdAnnualValid()&&fdAnnualReady&&fdAnnualOwnsViewer()&&yillikPersonelBelgeTopluModu}},dispose(){fdAnnualDisposed=true;const owned=fdAnnualOwnsViewer();if(owned)window.personelBelgeOnizlemeKapat();fdAnnualReset();if(window.personelBelgeOnizlemeAc===fdAnnualOtherPreview)window.personelBelgeOnizlemeAc=fdAnnualOriginalPreview}};
});

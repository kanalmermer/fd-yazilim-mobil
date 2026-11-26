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
let fdAnnualSelected=new Set(),fdAnnualPreparedPeriod=null;const fdAnnualEvents=new AbortController();
function fdAnnualDate(raw){const value=String(raw||'').trim();let m=value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/),y,month,d;if(m){[,y,month,d]=m}else{m=value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(!m)return null;[,d,month,y]=m}y=Number(y);month=Number(month);d=Number(d);const date=new Date(Date.UTC(y,month-1,d));if(y<1000||date.getUTCFullYear()!==y||date.getUTCMonth()!==month-1||date.getUTCDate()!==d)return null;return String(y).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function fdAnnualDisplay(iso){return iso?iso.slice(8,10)+'.'+iso.slice(5,7)+'.'+iso.slice(0,4):''}
function fdAnnualPeriod(){const from=fdAnnualDate(document.getElementById('yillikBelgeBaslangic').value),to=fdAnnualDate(document.getElementById('yillikBelgeBitis').value);return{from,to,error:!from||!to?'Başlangıç ve bitiş tarihini GG.AA.YYYY biçiminde girin.':from>to?'Başlangıç tarihi bitiş tarihinden sonra olamaz.':''}}
function fdAnnualPersonPeriod(person,period){const hire=fdAnnualDate(person.girisTarihi);if(period.error)return{error:period.error};if(!hire)return{error:'İşe giriş tarihi eksik veya geçersiz.'};if(hire>period.to)return{error:'Seçilen tarihlerde henüz işe başlamadı.'};return{from:hire>period.from?hire:period.from,to:period.to}}
function fdAnnualBranches(){return new Set([...document.querySelectorAll('input[name="yillikBelgeSube"]:checked')].map(i=>i.value))}
function fdAnnualCandidates(){const branches=fdAnnualBranches();return yillikPersonelBelgeAktifPersonelleri().filter(p=>branches.has(String(p.sube||'Şube belirtilmemiş')))}
function fdAnnualChosen(){const period=fdAnnualPeriod();return fdAnnualCandidates().filter(p=>fdAnnualSelected.has(String(p.id))&&!fdAnnualPersonPeriod(p,period).error)}
function fdAnnualSelectionSummary(){const period=fdAnnualPeriod(),people=fdAnnualChosen(),types=document.querySelectorAll('input[name="yillikBelgeTuru"]:checked').length;document.getElementById('yillikBelgeTarihAraligi').textContent=period.error?'Tarih ve personel seçin':fdAnnualDisplay(period.from)+' - '+fdAnnualDisplay(period.to);document.getElementById('yillikBelgeDurumOzeti').textContent=period.error||people.length+' personel seçili · '+types+' belge türü · '+people.length*types+' belge hazırlanacak.';document.getElementById('yillikBelgePersonelSayisi').textContent=people.length+' personel seçili';const visible=[...document.querySelectorAll('input[name="yillikBelgePersonel"]:not(:disabled)')],all=document.getElementById('yillikBelgeTumPersoneller');all.checked=Boolean(visible.length&&visible.every(i=>i.checked));all.indeterminate=visible.some(i=>i.checked)&&!all.checked}
function fdAnnualRenderPeople(){fdAnnualAssert();const period=fdAnnualPeriod(),q=document.getElementById('yillikBelgePersonelAra').value.trim().toLocaleLowerCase('tr-TR'),people=fdAnnualCandidates().filter(p=>(String(p.ad||'')+' '+String(p.id||'')).toLocaleLowerCase('tr-TR').includes(q));document.getElementById('yillikBelgePersonelSecimleri').innerHTML=people.map(p=>{const dates=fdAnnualPersonPeriod(p,period),id=String(p.id),detail=dates.error||fdAnnualDisplay(dates.from)+' - '+fdAnnualDisplay(dates.to);return '<label class="yillik-belge-personel-row"><input type="checkbox" name="yillikBelgePersonel" value="'+escapeDashboardText(id)+'" '+(dates.error?'disabled':fdAnnualSelected.has(id)?'checked':'')+'><span><strong>'+escapeDashboardText(p.ad||id)+'</strong><small>'+escapeDashboardText(p.sube||'Şube belirtilmemiş')+' · '+escapeDashboardText(detail)+'</small></span></label>'}).join('')||'<p class="yillik-belge-bos">Seçili şubelerde aramaya uygun personel yok.</p>';fdAnnualSelectionSummary()}
function fdAnnualBindSelection(){const root=document.getElementById('modalYillikPersonelBelge'),signal=fdAnnualEvents.signal;root.addEventListener('input',e=>{if(['yillikBelgeBaslangic','yillikBelgeBitis','yillikBelgePersonelAra'].includes(e.target.id))fdAnnualRenderPeople()},{signal});root.addEventListener('change',e=>{if(e.target.name==='yillikBelgePersonel'){e.target.checked?fdAnnualSelected.add(e.target.value):fdAnnualSelected.delete(e.target.value);fdAnnualSelectionSummary()}if(e.target.name==='yillikBelgeTuru')fdAnnualSelectionSummary();if(e.target.id==='yillikBelgeTumPersoneller'){for(const input of root.querySelectorAll('input[name="yillikBelgePersonel"]:not(:disabled)')){input.checked=e.target.checked;input.checked?fdAnnualSelected.add(input.value):fdAnnualSelected.delete(input.value)}fdAnnualSelectionSummary()}},{signal})}

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
        const hedefler = yillikPersonelBelgeAktifPersonelleri();
        const gruplar = new Map();
        hedefler.forEach(personel => {
            const subeAdi = String(personel.sube || 'Şube belirtilmemiş');
            if (!gruplar.has(subeAdi)) gruplar.set(subeAdi, []);
            gruplar.get(subeAdi).push(personel);
        });
        document.getElementById('yillikBelgeBaslangic').value=durum.baslangic;
        document.getElementById('yillikBelgeBitis').value=durum.bitis;
        document.getElementById('yillikBelgePersonelAra').value='';
        fdAnnualSelected=new Set(hedefler.map(p=>String(p.id)));
        document.getElementById('yillikBelgeSubeSecimleri').innerHTML = [...gruplar.entries()].map(([subeAdi,liste]) => `<label><input type="checkbox" name="yillikBelgeSube" value="${escapeDashboardText(subeAdi)}" checked onchange="yillikBelgeSubeSeciminiGuncelle()"> <span><strong>${escapeDashboardText(subeAdi)}</strong><small>${liste.length} aktif çalışan</small></span></label>`).join('') || '<div style="padding:8px;color:#64748b;">Aktif çalışan bulunmuyor.</div>';
        document.getElementById('yillikBelgeTumSubeler').checked = true;
        document.getElementById('yillikBelgeTumSubeler').indeterminate=false;
        document.querySelectorAll('input[name="yillikBelgeTuru"]').forEach(input => input.checked = true);
        document.getElementById('yillikBelgeHataOzeti').style.display = 'none';
        fdAnnualRenderPeople();
        document.getElementById('modalYillikPersonelBelge').style.display = 'flex';
    }
function yillikPersonelBelgePaneliniKapat() {
        document.getElementById('modalYillikPersonelBelge').style.display = 'none';
    }
function yillikBelgeTumSubeleriSec(secili) {
        document.querySelectorAll('input[name="yillikBelgeSube"]').forEach(input => input.checked = Boolean(secili));
        fdAnnualRenderPeople();
    }
function yillikBelgeSubeSeciminiGuncelle() {
        const liste = [...document.querySelectorAll('input[name="yillikBelgeSube"]')];
        document.getElementById('yillikBelgeTumSubeler').checked = Boolean(liste.length && liste.every(input => input.checked));
        document.getElementById('yillikBelgeTumSubeler').indeterminate=liste.some(input=>input.checked)&&!liste.every(input=>input.checked);
        fdAnnualRenderPeople();
    }
async function yillikPersonelBelgeleriniTopluHazirla() {
const fdAnnualTicket=fdAnnualOperation;fdAnnualAssert();
        const yil = yillikPersonelBelgeAktifYili || new Date().getFullYear();
        const durum = yillikPersonelBelgeDurumunuAl(yil, true).durum;
        const seciliSubeler = new Set([...document.querySelectorAll('input[name="yillikBelgeSube"]:checked')].map(input => input.value));
        const seciliBelgeler = [...document.querySelectorAll('input[name="yillikBelgeTuru"]:checked')].map(input => input.value);
        if (!seciliSubeler.size) return showToast('En az bir şube seçin.', 'error');
        if (!seciliBelgeler.length) return showToast('En az bir belge seçin.', 'error');
        const period=fdAnnualPeriod();if(period.error)return showToast(period.error,'error');
        const hedefler = fdAnnualChosen().map(personel=>({...personel,fdBelgeAraligi:fdAnnualPersonPeriod(personel,period)}));
        if (!hedefler.length) return showToast('Belge hazırlanacak en az bir uygun personel seçin.', 'error');
        if (!window.docx?.renderAsync) return showToast('Toplu Word önizleme bileşeni yüklenemedi.', 'error');

        fdAnnualClaim(fdAnnualTicket);
        fdAnnualPreparedPeriod={...period,annual:period.from===fdAnnualDate(durum.baslangic)&&period.to===fdAnnualDate(durum.bitis)};
        const alan = document.getElementById('personelBelgeOnizleme');
        const hatalar = [];
        const sablonOnbellegi = new Map();
        const hazirlananlar = [];
        yillikPersonelBelgePaneliniKapat();
        document.getElementById('personelBelgeBaslik').textContent = `📄 Toplu Personel Belgeleri`;
        document.getElementById('personelBelgeDosyaAdi').textContent = `${hedefler.length} çalışan · ${seciliBelgeler.length} belge türü · ${fdAnnualDisplay(period.from)} - ${fdAnnualDisplay(period.to)}`;
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
                            `${fdAnnualDisplay(personel.fdBelgeAraligi.from)} - ${fdAnnualDisplay(personel.fdBelgeAraligi.to)} `,
                            String(personel.ad || '').toLocaleUpperCase('tr-TR')
                        ];
                        const blob = await fdAnnualAwait(personelWordBelgesiniHazirla(kaynak.buffer, degerler, belgeKey),fdAnnualTicket);
                        const kabuk = document.createElement('section');
                        kabuk.className = 'yillik-belge-render';
                        const ekranBasligi = document.createElement('div');
                        ekranBasligi.className = 'yillik-belge-ekran-basligi';
                        ekranBasligi.style.cssText = 'max-width:900px;margin:0 auto 7px;padding:8px 12px;border-radius:8px;background:#334155;color:#fff;font-weight:800;font-size:.76rem;';
                        ekranBasligi.textContent = `${personel.ad} · ${sube.ad} · ${tanim.baslik} · ${fdAnnualDisplay(personel.fdBelgeAraligi.from)} - ${fdAnnualDisplay(personel.fdBelgeAraligi.to)}`;
                        const renderAlani = document.createElement('div');
                        kabuk.append(ekranBasligi, renderAlani);
                        alan.appendChild(kabuk);fdAnnualSections.add(kabuk);
                        await fdAnnualAwait(window.docx.renderAsync(blob, renderAlani, renderAlani, { inWrapper:true, breakPages:true, ignoreLastRenderedPageBreak:false, renderHeaders:true, renderFooters:true, renderFootnotes:true, ignoreWidth:false, ignoreHeight:false, ignoreFonts:false, useBase64URL:true, experimental:true }),fdAnnualTicket);
                        hazirlananlar.push({ personelId:String(personel.id), belgeKey, baslangic:personel.fdBelgeAraligi.from, bitis:personel.fdBelgeAraligi.to });
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
            const araliklar={...(durum.aralikTamamlananlar||{})};
            yillikPersonelBelgeHazirlananCiftler.forEach(kayit => {
                araliklar[[kayit.personelId,kayit.belgeKey,kayit.baslangic,kayit.bitis].join('|')]={...kayit,yazdirmaZamani:new Date().toISOString()};
                if(!fdAnnualPreparedPeriod?.annual)return;
                const mevcut = Array.isArray(tamamlananlar[kayit.personelId]) ? tamamlananlar[kayit.personelId] : [];
                tamamlananlar[kayit.personelId] = [...new Set([...mevcut, kayit.belgeKey])];
            });
            const harita = { ...(uygulamaAyarlari.yillikPersonelBelgeleri || {}) };
            harita[String(yil)] = { ...durum, tamamlananlar, aralikTamamlananlar:araliklar, hedefPersonelIds:fdAnnualPreparedPeriod?.annual?[...new Set([...(durum.hedefPersonelIds||[]),...yillikPersonelBelgeHazirlananCiftler.map(k=>k.personelId)])]:durum.hedefPersonelIds, sonGuncelleme:new Date().toISOString(), sonYazdiran:String(activeUser?.username || ''), sonYazdirmaZamani:new Date().toISOString() };
            uygulamaAyarlari = { ...uygulamaAyarlari, yillikPersonelBelgeleri:harita };
            await fdAnnualAwait(yillikPersonelBelgeDurumunuKaydet(),fdAnnualTicket);
            const kalan = yillikPersonelBelgeBekleyenSayisi(harita[String(yil)]);
            showToast(!fdAnnualPreparedPeriod?.annual?'Seçilen tarih aralığındaki belgelerin yazdırma durumu kaydedildi.':kalan ? `Yazdırılan belgeler kaydedildi. ${kalan} belge için günlük hatırlatma devam edecek.` : `${yil} yılı için tüm onay belgeleri tamamlandı; hatırlatma kapatıldı.`);
        } catch (error) {if(!fdAnnualCurrent(fdAnnualTicket))return;
            showToast('Yazdırma durumu kaydedilemedi: ' + (error.message || error), 'error');
        } finally {
            fdAnnualStopPrint();
        }
    }
return{init(){fdAnnualBindSelection();window.personelBelgeOnizlemeAc=fdAnnualOtherPreview},open:fdAnnualOpen,api:{yillikPersonelBelgePaneliniAc:fdAnnualOpen,
yillikPersonelBelgePaneliniKapat(){fdAnnualOperation++;if(!fdAnnualReady&&fdAnnualOwnsViewer())window.personelBelgeOnizlemeKapat();return yillikPersonelBelgePaneliniKapat()},
yillikBelgeTumSubeleriSec(...args){fdAnnualAssert();return yillikBelgeTumSubeleriSec(...args)},
yillikBelgeSubeSeciminiGuncelle(...args){fdAnnualAssert();return yillikBelgeSubeSeciminiGuncelle(...args)},
yillikPersonelBelgeleriniTopluHazirla(){fdAnnualAssert();const ticket=++fdAnnualOperation;return Promise.resolve(yillikPersonelBelgeleriniTopluHazirla()).then(value=>{if(fdAnnualCurrent(ticket)&&fdAnnualOwnsViewer()&&yillikPersonelBelgeTopluModu)fdAnnualReady=true;return value})},
yillikPersonelBelgeleriniTopluYazdir(){fdAnnualAssert();if(!fdAnnualReady||!fdAnnualOwnsViewer())return;fdAnnualOperation++;fdAnnualViewerTicket=fdAnnualOperation;fdAnnualPrinting=true;return yillikPersonelBelgeleriniTopluYazdir()},fdYillikBelgeTopluDurumunuTemizle:fdAnnualReset,fdYillikBelgeTopluModuAktifMi(){return fdAnnualValid()&&fdAnnualReady&&fdAnnualOwnsViewer()&&yillikPersonelBelgeTopluModu}},dispose(){fdAnnualEvents.abort();fdAnnualSelected.clear();fdAnnualPreparedPeriod=null;fdAnnualDisposed=true;const owned=fdAnnualOwnsViewer();if(owned)window.personelBelgeOnizlemeKapat();fdAnnualReset();if(window.personelBelgeOnizlemeAc===fdAnnualOtherPreview)window.personelBelgeOnizlemeAc=fdAnnualOriginalPreview}};
});

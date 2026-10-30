window.FDModules.define('personelform',function(){
let disposed=false,busy=false,generation=0,activeOperation=0,owned=null,form=null,observer=null,overlay=null;const initial=context();
const nativeDocument=window.document;
const document=new Proxy(nativeDocument,{get(target,key){if(key==='getElementById')return id=>{if(owned&&(id===owned.id||owned.querySelector('[id="'+id+'"]')))return id===owned.id?owned:owned.querySelector('[id="'+id+'"]');return target.getElementById(id)};const value=target[key];return typeof value==='function'?value.bind(target):value}});
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&context()===initial}
function assertCurrent(){if(!current()){const e=Error('Personel formunun oturumu veya yetkisi değişti.');e.fdPersonnelFormStale=true;throw e}}
async function fdFormWait(start){assertCurrent();const operation=activeOperation;let value,error,failed=false;try{value=await start()}catch(reason){failed=true;error=reason}assertCurrent();if(operation!==activeOperation){const e=Error('Personel formu isteği değişti.');e.fdPersonnelFormStale=true;throw e}if(failed)throw error;return value}
function alert(...args){if(current())return window.alert(...args)}
function showGlobalOverlay(...args){assertCurrent();window.showGlobalOverlay(...args);overlay={title:nativeDocument.getElementById('overlayTitle')?.textContent,sub:nativeDocument.getElementById('overlaySub')?.textContent}}
function hideGlobalOverlay(){if(overlay&&current()&&nativeDocument.getElementById('overlayTitle')?.textContent===overlay.title&&nativeDocument.getElementById('overlaySub')?.textContent===overlay.sub)window.hideGlobalOverlay();overlay=null}
function clear(){if(!owned)return;if(nativeDocument.getElementById('modalPersonel')===owned)window.fdPersonnelPhoto.end();form?.reset();if(owned.style.display!=='none')owned.style.display='none';owned.querySelectorAll('[data-personel-wa-key]').forEach(n=>n.checked=false);const wa=owned.querySelector('[data-employee-id]');if(wa){wa.dataset.employeeId='';wa.dataset.companyId=''}const edit=owned.querySelector('#pEditOriginalId');if(edit)edit.value='';const tc=owned.querySelector('#pTcNo');if(tc)tc.disabled=false;const heading=owned.querySelector('#modalPersonelBaslik');if(heading)heading.textContent='Yeni Personel Kaydı';const photo=owned.querySelector('#pFotoDurum');if(photo)photo.textContent='JPG, PNG veya WEBP dosyası seçebilirsiniz.'}
async function submit(event){event.preventDefault();if(busy)return;assertCurrent();busy=true;activeOperation=++generation;const operation=activeOperation,buttons=[...form.querySelectorAll('button[type="submit"]')],before=buttons.map(n=>n.disabled);buttons.forEach(n=>n.disabled=true);try{return await fdSubmitOriginal(event)}catch(error){if(!error?.fdPersonnelFormStale&&current())window.alert('Personel kaydı tamamlanamadı: '+(error.message||error))}finally{if(operation===activeOperation){busy=false;if(current())buttons.forEach((n,i)=>n.disabled=before[i]);if(!current()||owned?.style.display==='none')clear()}}}

function organizePersonnelForm() {
        const form = document.getElementById('personelForm');
        if (!form || form.dataset.organized === 'true') return;
        const submitButton = form.querySelector('button[type="submit"]');
        const groupFor = id => document.getElementById(id)?.closest('.form-group');
        const sections = [
            ['Kimlik ve İstihdam Bilgileri', ['pTcNo', 'pCihazPersonelNo', 'pAd', 'pKimlikSeri', 'pDogumTarihi', 'pCinsiyet', 'pSube', 'pDepartman', 'pGorev', 'pKadro', 'pYonetici', 'pGirisTarihi', 'pFotoDosya']],
            ['İletişim ve Aile Bilgileri', ['pTelefon', 'pKurumsalTelefon', 'pEposta', 'pAcilDurumAd', 'pAcilDurumYakinlik', 'pAcilDurumTelefon', 'pMedeniDurum', 'pCocukSayisi', 'pAdres']],
            ['Finansal ve Özlük Bilgileri', ['pBankaAdi', 'pIban', 'pSgkNo', 'pEmeklilikTuru', 'pEmekli', 'pEngelli', 'pVergiMuafiyet', 'pAskerlikDurumu', 'pTecilBitis', 'pTerhisTarihi', 'pUcretTipi', 'pUcret', 'pEkOdemeTuru', 'pEkOdemeTutari', 'pYolUcreti', 'pPrimVar']],
            ['Eğitim, Belgeler ve Yetkinlikler', ['pEgitimSeviyesi', 'pOkulBolum', 'pMezuniyetYili', 'pBelgeler', 'pSertifikalar', 'pSertifikaBitis', 'pEhliyetDil']],
            ['Sağlık ve İş Güvenliği', ['pKanGrubu', 'pSonSaglikTaramasi', 'pIsyeriHekimi', 'pKronikRahatsizlik', 'pAlerjiler', 'pSaglikNotu']],
            ['Zimmet ve Kariyer Geçmişi', ['pZimmetNotu', 'pTerfiGecmisi', 'pPerformansNotu']]
        ];

        const secondPhoneLabel = document.getElementById('pKurumsalTelefon')?.closest('.form-group')?.querySelector('label');
        if (secondPhoneLabel) secondPhoneLabel.textContent = '2. Telefon';

        const builtSections = sections.map(([title, fields], index) => {
            const details = document.createElement('details');
            details.className = 'profile-section';
            details.open = index === 0;
            const summary = document.createElement('summary');
            summary.textContent = title;
            const layout = document.createElement('div');
            layout.className = 'profile-layout';
            fields.map(groupFor).filter(Boolean).forEach(group => layout.appendChild(group));
            details.append(summary, layout);
            details.addEventListener('toggle', () => {
                if (details.open) {
                    form.querySelectorAll('details.profile-section[open]').forEach(other => {
                        if (other !== details) other.open = false;
                    });
                }
            });
            return details;
        });

        form.querySelectorAll('.profile-section').forEach(section => section.remove());
        form.querySelectorAll(':scope > .form-row').forEach(row => {
            if (!row.children.length) row.remove();
        });
        builtSections.forEach(section => form.insertBefore(section, submitButton));
        const addStandaloneSection = (title, group, className) => {
            if (!group) return;
            const section = document.createElement('section');
            section.className = `profile-section ${className}`;
            const heading = document.createElement('h4');
            heading.className = 'profile-section-heading';
            heading.textContent = title;
            const body = document.createElement('div');
            body.appendChild(group);
            section.append(heading, body);
            form.insertBefore(section, submitButton);
        };
        addStandaloneSection('Açıklamalar ve Notlar', groupFor('pAciklama'), 'profile-notes');
        addStandaloneSection('Dikkat: İşten Çıkış İşlemi', groupFor('pCikisTarihi'), 'exit-warning');
        form.dataset.organized = 'true';
    }
function updateAskerlikTarihAlani() {
        const status = document.getElementById('pAskerlikDurumu');
        const discharge = document.getElementById('pTerhisTarihi');
        const deferment = document.getElementById('pTecilBitis');
        const dischargeGroup = discharge?.closest('.form-group');
        const defermentGroup = deferment?.closest('.form-group');
        if (!status || !discharge || !deferment || !dischargeGroup || !defermentGroup) return;
        const completed = status.value === 'Yapıldı';
        const deferred = status.value === 'Tecilli';
        dischargeGroup.style.display = completed ? '' : 'none';
        defermentGroup.style.display = deferred ? '' : 'none';
        discharge.required = completed;
        deferment.required = deferred;
    }
function personelFotografSeciminiGoster(input) {
        const durum = document.getElementById('pFotoDurum');
        if (!durum) return;
        const dosya = input?.files?.[0];
        durum.textContent = dosya ? `Seçilen fotoğraf: ${dosya.name}` : 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        window.fdPersonnelPhoto.selected(input);
    }
function openPersonelModal() {
        if (isPersonelUser()) {
            showToast('Bu hesap yalnızca kendi kayıtlarını görüntüleyebilir.', 'warning');
            return;
        }
        document.getElementById('modalPersonelBaslik').innerText = "Yeni Personel Kaydı";
        document.getElementById('personelForm').reset();
        document.getElementById('pFotoDurum').textContent = 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        document.getElementById('pEditOriginalId').value = "";
        document.getElementById('pTcNo').disabled = false;
        document.getElementById('modalPersonel').style.display = 'flex';
        window.fdPersonnelPhoto.begin(null);
    }
function closePersonelModal() { window.fdPersonnelPhoto.end(); document.getElementById('modalPersonel').style.display = 'none'; }
function personelDuzenle(id) {
        const p = personeller.find(item => String(item.id) === String(id));
        if (!p) return;

        document.getElementById('modalPersonelBaslik').innerText = "Personel Kartını Güncelle";
        document.getElementById('pEditOriginalId').value = p.id;
        document.getElementById('pTcNo').value = p.id;
        document.getElementById('pTcNo').disabled = true;
        document.getElementById('pCihazPersonelNo').value = p.cihazPersonelNo || '';
        document.getElementById('pAd').value = p.ad;
        document.getElementById('pSube').value = p.sube || '';
        document.getElementById('pGorev').value = p.gorev || '';
        document.getElementById('pTelefon').value = p.telefon || '';
        document.getElementById('pKanGrubu').value = p.kanGrubu || '';
        document.getElementById('pCinsiyet').value = p.cinsiyet || '';
        document.getElementById('pEngelli').value = p.engelli || 'Hayır';
        document.getElementById('pEmekli').value = p.emekli || 'Hayır';
        document.getElementById('pBelgeler').value = p.belgeler || '';
        document.getElementById('pAciklama').value = p.aciklama || '';
        document.getElementById('pGirisTarihi').value = tarihInputDegeri(p.girisTarihi);
        document.getElementById('pDogumTarihi').value = tarihInputDegeri(p.dogumTarihi);
        document.getElementById('pKimlikSeri').value = p.kimlikSeriNo || '';
        document.getElementById('pFotoDosya').value = '';
        document.getElementById('pFotoDurum').textContent = personelFotografAdresi(p) ? 'Mevcut fotoğraf kayıtlı. Değiştirmek için yeni bir dosya seçin.' : 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        window.fdPersonnelPhoto.begin(p);
        document.getElementById('pAdres').value = p.adres || '';
        document.getElementById('pKurumsalTelefon').value = p.kurumsalTelefon || '';
        document.getElementById('pEposta').value = p.eposta || '';
        document.getElementById('pAcilDurumAd').value = p.acilDurumAd || '';
        document.getElementById('pAcilDurumYakinlik').value = p.acilDurumYakinlik || '';
        document.getElementById('pAcilDurumTelefon').value = p.acilDurumTelefon || '';
        document.getElementById('pMedeniDurum').value = p.medeniDurum || '';
        document.getElementById('pCocukSayisi').value = p.cocukSayisi ?? 0;
        document.getElementById('pAskerlikDurumu').value = p.askerlikDurumu || '';
        document.getElementById('pTecilBitis').value = tarihInputDegeri(p.tecilBitis);
        document.getElementById('pTerhisTarihi').value = tarihInputDegeri(p.terhisTarihi);
        document.getElementById('pBankaAdi').value = p.bankaAdi || '';
        document.getElementById('pIban').value = p.iban || '';
        document.getElementById('pSgkNo').value = p.sgkNo || '';
        document.getElementById('pEmeklilikTuru').value = p.emeklilikTuru || '';
        document.getElementById('pVergiMuafiyet').value = p.vergiMuafiyet || '';
        document.getElementById('pDepartman').value = p.departman || '';
        document.getElementById('pKadro').value = p.kadro || '';
        document.getElementById('pYonetici').value = p.yonetici || '';
        document.getElementById('pEgitimSeviyesi').value = p.egitimSeviyesi || '';
        document.getElementById('pOkulBolum').value = p.okulBolum || '';
        document.getElementById('pSertifikalar').value = p.sertifikalar || '';
        document.getElementById('pSertifikaBitis').value = tarihInputDegeri(p.sertifikaBitis);
        document.getElementById('pEhliyetDil').value = p.ehliyetDil || '';
        document.getElementById('pZimmetNotu').value = p.zimmetNotu || '';
        document.getElementById('pTerfiGecmisi').value = p.terfiGecmisi || '';
        document.getElementById('pPerformansNotu').value = p.performansNotu || '';
        document.getElementById('pSonSaglikTaramasi').value = tarihInputDegeri(p.sonSaglikTaramasi);
        document.getElementById('pIsyeriHekimi').value = p.isyeriHekimi || '';
        document.getElementById('pKronikRahatsizlik').value = p.kronikRahatsizlik || '';
        document.getElementById('pAlerjiler').value = p.alerjiler || '';
        document.getElementById('pSaglikNotu').value = p.saglikNotu || '';
        document.getElementById('pMezuniyetYili').value = mezuniyetYiliniDuzelt(p.mezuniyetYili || p.mezuniyetTarihi);
        document.getElementById('pUcretTipi').value = p.ucretTipi || '';
        document.getElementById('pUcret').value = p.fdUcretDonemleri?.length ? personelGunlukUcretiniGetir(p).toLocaleString('tr-TR',{maximumFractionDigits:2}) : (p.ucret || '');
        document.getElementById('pEkOdemeTuru').value = p.ekOdemeTuru || '';
        document.getElementById('pEkOdemeTutari').value = p.ekOdemeTutari || '';
        document.getElementById('pYolUcreti').value = p.yolUcreti || '';
        ['pUcret', 'pEkOdemeTutari', 'pYolUcreti'].forEach(id => paraGirisiFormatla(document.getElementById(id)));
        document.getElementById('pPrimVar').value = p.primVar || 'Hayır';
        updateAskerlikTarihAlani();
        document.getElementById('pCikisTarihi').value = (p.cikisTarihi && p.cikisTarihi !== "null") ? tarihInputDegeri(p.cikisTarihi) : '';

        document.getElementById('modalPersonel').style.display = 'flex';
    }
const fdSubmitOriginal=async (e) => {
        e.preventDefault();
        const origId = document.getElementById('pEditOriginalId').value;
        const tcNo = document.getElementById('pTcNo').value.trim();
        const yeniCikisTarihi = document.getElementById('pCikisTarihi').value;

        if (tcNo.length !== 11 || isNaN(tcNo)) { alert("Geçerli 11 haneli T.C. giriniz."); return; }
        const cihazPersonelNo = magicpassCihazNoAnahtari(document.getElementById('pCihazPersonelNo').value);
        document.getElementById('pCihazPersonelNo').value = cihazPersonelNo;
        if (cihazPersonelNo && personeller.some(p => magicpassCihazNoAnahtari(p.cihazPersonelNo) === cihazPersonelNo && String(p.id) !== String(origId))) { alert('Bu cihaz personel numaras? ba?ka bir personele tan?ml?.'); return; }

        const mevcutPersonel = personeller.find(p => String(p.id) === String(origId) && aktifSirketeAit(p));
        if (origId && !mevcutPersonel) { alert('Düzenlenecek personel bu şirkette bulunamadı.'); return; }
        const fotoKadrajKaydi = window.fdPersonnelPhoto.payload(mevcutPersonel);
        if (fotoKadrajKaydi === null) { alert('Fotoğraf ayarı bu oturuma ait değil. Personel kartını yeniden açın.'); return; }
        const cikisTarihiYeniEklendi = yeniCikisTarihi && origId && String(mevcutPersonel?.cikisTarihi || '') !== String(yeniCikisTarihi);
        const kullaniciHesabiKapatilacak = Boolean(yeniCikisTarihi && origId && !String(mevcutPersonel?.cikisTarihi || '').trim());
        if (cikisTarihiYeniEklendi) {
            const pTemp = {
                id: String(tcNo),
                girisTarihi: document.getElementById('pGirisTarihi').value,
                dogumTarihi: document.getElementById('pDogumTarihi').value,
                cikisTarihi: yeniCikisTarihi
            };
            const donemler = personelDonemleriniGetir(pTemp);
            let toplamKalan = 0;
            donemler.forEach(d => {
                let kullanilan = izinler.filter(i => String(i.pId) === String(tcNo) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
                let kalan = d.hak - kullanilan;
                if (kalan > 0) toplamKalan += kalan;
            });

            const personelIdleri = [String(tcNo), String(origId)];
            const acikIcralar = icralar.filter(icra =>
                personelIdleri.includes(String(icra.pId)) &&
                (!icra.sirketId || String(icra.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')) &&
                icraKalanBorc(icra) > 0
            );
            const devamEdenAvanslar = avanslar.map(avans => ({ avans, kalan: cikisIcinKalanAvansTutariniBul(avans, yeniCikisTarihi) }))
                .filter(({ avans, kalan }) => personelIdleri.includes(String(avans.pId)) && (!avans.sirketId || String(avans.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')) && kalan > 0);
            const kalanEkOdemeler = ekOdemeler.filter(kayit =>
                personelIdleri.includes(String(kayit.pId)) &&
                (!kayit.sirketId || String(kayit.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')) &&
                paraMetniniSayiyaCevir(kayit.kalanTutar) > 0
            );
            const uyarilar = [];
            if (acikIcralar.length) uyarilar.push({ baslik: `Açık icra kaydı (${acikIcralar.length})`, aciklama: acikIcralar.map(icra => `${escapeDashboardText(icra.dosyaNo || 'Dosya no yok')} · Kalan borç: ${paraFormatla(icraKalanBorc(icra))}`).join('<br>') });
            if (devamEdenAvanslar.length) uyarilar.push({ baslik: `Devam eden avans kesintisi (${devamEdenAvanslar.length})`, aciklama: devamEdenAvanslar.map(({ avans, kalan }) => `${escapeDashboardText(avans.avansNo || 'Avans')} · Planlanan kalan: ${paraFormatla(kalan)}`).join('<br>') });
            if (kalanEkOdemeler.length) uyarilar.push({ baslik: `Ödenmemiş ek ödeme / yol ücreti (${kalanEkOdemeler.length})`, aciklama: kalanEkOdemeler.map(kayit => `${escapeDashboardText(String(kayit.ay || 'Ay bilgisi yok'))} · ${escapeDashboardText(kayit.ekOdemeTuru || 'Ek ödeme')} · Kalan: ${paraFormatla(paraMetniniSayiyaCevir(kayit.kalanTutar))}`).join('<br>') });
            if (toplamKalan > 0) uyarilar.push({ baslik: 'Kullanılmamış yıllık izin', aciklama: `Bu personelin toplam <strong>${toplamKalan} gün</strong> kullanılmamış yıllık izin hakkı bulunuyor.` });
            if (uyarilar.length && !(await fdFormWait(()=>(cikisUyariyiGoster(uyarilar))))) return;
        }

        const mezuniyetYiliGirdisi = document.getElementById('pMezuniyetYili').value.trim();
        const mezuniyetYili = mezuniyetYiliniDuzelt(mezuniyetYiliGirdisi);
        if (mezuniyetYiliGirdisi && !mezuniyetYili) {
            alert('Mezuniyet yılı 1900 ile ' + new Date().getFullYear() + ' arasında olmalıdır.');
            return;
        }

        if (!origId && personeller.some(p => String(p.id) === String(tcNo))) { alert("Bu T.C. numarasına sahip personel zaten var!"); return; }

        const fotoDosyasi = document.getElementById('pFotoDosya')?.files?.[0] || null;
        const eskiFotograf = mevcutPersonel?.fotografDosya || null;
        let yeniFotograf = null;
        if (fotoDosyasi) {
            if (!['image/jpeg','image/png','image/webp'].includes(String(fotoDosyasi.type || '').toLowerCase())) {
                alert('Personel fotoğrafı JPG, PNG veya WEBP biçiminde olmalıdır.');
                return;
            }
            if (fotoDosyasi.size > 8 * 1024 * 1024) {
                alert('Personel fotoğrafı en fazla 8 MB olabilir.');
                return;
            }
            showGlobalOverlay('Personel fotoğrafı yükleniyor', 'Fotoğraf Drive klasörüne kaydediliyor...');
            try {
                const hazirlik = await fdFormWait(()=>(window.fdPersonnelPhoto.prepare(fotoDosyasi))), hazirFoto = hazirlik.file;
                const uzanti = (hazirFoto.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
                const fotoAdi = `PERSONEL_${tcNo}_${Date.now()}.${uzanti}`;
                const fotoIcerigi = await fdFormWait(()=>(dosyayiBase64Oku(hazirFoto)));hazirlik.check();
                const yuklenen = await fdFormWait(()=>(fdYazilimDriveDosyaYukle(fotoIcerigi, fotoAdi, hazirFoto.type, '', 'PERSONEL FOTOĞRAFLARI')));
                yeniFotograf = { id:yuklenen.id, url:yuklenen.url || '', ad:yuklenen.ad || fotoAdi, mimeType:hazirFoto.type, boyut:hazirFoto.size };
                hazirlik.check();
            } catch (hata) {
if(hata?.fdPersonnelFormStale)return;

                hideGlobalOverlay();
                alert('Personel fotoğrafı yüklenemedi: ' + (hata.message || 'Bilinmeyen hata'));
                return;
            }
        }
        const kullanilanFotograf = yeniFotograf || eskiFotograf || null;
        const pObj = {
            ...(mevcutPersonel || {}),
            ...fotoKadrajKaydi,
            whatsappMesajTercihleri: window.fdPersonelWhatsappTercihleri?.read(mevcutPersonel) ?? mevcutPersonel?.whatsappMesajTercihleri ?? {},
            cihazPersonelNo,
            id: String(tcNo),
            sirketId: aktifSirketId() || mevcutPersonel?.sirketId || '',
            ad: document.getElementById('pAd').value,
            sube: document.getElementById('pSube').value,
            gorev: document.getElementById('pGorev').value,
            telefon: document.getElementById('pTelefon').value,
            kanGrubu: document.getElementById('pKanGrubu').value,
            cinsiyet: document.getElementById('pCinsiyet').value,
            engelli: document.getElementById('pEngelli').value,
            emekli: document.getElementById('pEmekli').value,
            belgeler: document.getElementById('pBelgeler').value,
            aciklama: document.getElementById('pAciklama').value,
            girisTarihi: document.getElementById('pGirisTarihi').value,
            dogumTarihi: document.getElementById('pDogumTarihi').value,
            cikisTarihi: yeniCikisTarihi || null,
            kimlikSeriNo: document.getElementById('pKimlikSeri').value,
            fotografDosya: kullanilanFotograf,
            fotografUrl: personelFotografAdresi({ fotografDosya:kullanilanFotograf, fotografUrl:mevcutPersonel?.fotografUrl || '' }),
            adres: document.getElementById('pAdres').value,
            kurumsalTelefon: document.getElementById('pKurumsalTelefon').value,
            eposta: document.getElementById('pEposta').value,
            acilDurumAd: document.getElementById('pAcilDurumAd').value,
            acilDurumYakinlik: document.getElementById('pAcilDurumYakinlik').value,
            acilDurumTelefon: document.getElementById('pAcilDurumTelefon').value,
            medeniDurum: document.getElementById('pMedeniDurum').value,
            cocukSayisi: document.getElementById('pCocukSayisi').value,
            askerlikDurumu: document.getElementById('pAskerlikDurumu').value,
            tecilBitis: document.getElementById('pTecilBitis').value,
            terhisTarihi: document.getElementById('pTerhisTarihi').value,
            bankaAdi: document.getElementById('pBankaAdi').value,
            iban: document.getElementById('pIban').value,
            sgkNo: document.getElementById('pSgkNo').value,
            emeklilikTuru: document.getElementById('pEmeklilikTuru').value,
            vergiMuafiyet: document.getElementById('pVergiMuafiyet').value,
            departman: document.getElementById('pDepartman').value,
            kadro: document.getElementById('pKadro').value,
            yonetici: document.getElementById('pYonetici').value,
            egitimSeviyesi: document.getElementById('pEgitimSeviyesi').value,
            okulBolum: document.getElementById('pOkulBolum').value,
            sertifikalar: document.getElementById('pSertifikalar').value,
            sertifikaBitis: document.getElementById('pSertifikaBitis').value,
            ehliyetDil: document.getElementById('pEhliyetDil').value,
            zimmetNotu: document.getElementById('pZimmetNotu').value,
            terfiGecmisi: document.getElementById('pTerfiGecmisi').value,
            performansNotu: document.getElementById('pPerformansNotu').value,
            sonSaglikTaramasi: document.getElementById('pSonSaglikTaramasi').value,
            isyeriHekimi: document.getElementById('pIsyeriHekimi').value,
            kronikRahatsizlik: document.getElementById('pKronikRahatsizlik').value,
            alerjiler: document.getElementById('pAlerjiler').value,
            saglikNotu: document.getElementById('pSaglikNotu').value,
            mezuniyetYili,
            ucretTipi: document.getElementById('pUcretTipi').value,
            ucret: document.getElementById('pUcret').value,
            ekOdemeTuru: document.getElementById('pEkOdemeTuru').value,
            ekOdemeTutari: document.getElementById('pEkOdemeTutari').value,
            yolUcreti: document.getElementById('pYolUcreti').value,
            ekOdemeUcretGecmisi: ekOdemeUcretGecmisiniHazirla(mevcutPersonel, {
                ekOdemeTuru:document.getElementById('pEkOdemeTuru').value,
                ekOdemeTutari:document.getElementById('pEkOdemeTutari').value,
                yolUcreti:document.getElementById('pYolUcreti').value,
                girisTarihi:document.getElementById('pGirisTarihi').value
            }),
            primVar: document.getElementById('pPrimVar').value
        };

        if (origId) {
            const idx = personeller.findIndex(p => String(p.id) === String(origId) && aktifSirketeAit(p));
            if (idx !== -1) personeller[idx] = pObj;
        } else {
            if (personeller.some(p => String(p.id) === String(tcNo))) { alert("Bu T.C. numarasına sahip personel zaten var!"); return; }
            personeller.push(pObj);
        }

        showGlobalOverlay('Personel kaydediliyor', 'Bilgiler ve giriş hesabı hazırlanıyor, lütfen bekleyin...');
        let personelHesabiOlustu = false;
        let personelKaydiBasarili = false;
        let kullaniciHesabiOlusturmaHatasi = null;
        let kullaniciHesabiSilmeHatasi = null;
        try {
            await fdFormWait(()=>(verileriKaydet()));
            if (!origId) {
                try { personelHesabiOlustu = await fdFormWait(()=>(personelKullaniciHesabiOlustur(pObj))); }
                catch (hesapHatasi) {
if(hesapHatasi?.fdPersonnelFormStale)return;
 kullaniciHesabiOlusturmaHatasi = hesapHatasi; }
            }
            if (kullaniciHesabiKapatilacak) {
                try { await fdFormWait(()=>(ayrilanPersonelKullaniciHesabiniSil(origId))); }
                catch (hesapHatasi) {
if(hesapHatasi?.fdPersonnelFormStale)return;
 kullaniciHesabiSilmeHatasi = hesapHatasi; }
            }
            if (yeniFotograf?.id && eskiFotograf?.id && String(yeniFotograf.id) !== String(eskiFotograf.id)) {
                try { await fdFormWait(()=>(fdYazilimDriveDosyaSil(eskiFotograf.id, 'PERSONEL FOTOĞRAFLARI'))); } catch (silmeHatasi) {
if(silmeHatasi?.fdPersonnelFormStale)return;
 console.warn('Eski personel fotoğrafı silinemedi:', silmeHatasi); }
            }
            initUI();
            closePersonelModal();
            personelKaydiBasarili = true;
        } catch (error) {
if(error?.fdPersonnelFormStale)return;

            if (!origId) personeller = personeller.filter(personel => String(personel.id) !== String(tcNo));
            else if (mevcutPersonel) {
                const eskiIndex = personeller.findIndex(personel => String(personel.id) === String(origId) && aktifSirketeAit(personel));
                if (eskiIndex !== -1) personeller[eskiIndex] = mevcutPersonel;
            }
            if (yeniFotograf?.id) {
                try { await fdFormWait(()=>(fdYazilimDriveDosyaSil(yeniFotograf.id, 'PERSONEL FOTOĞRAFLARI'))); } catch (silmeHatasi) {
if(silmeHatasi?.fdPersonnelFormStale)return;
 console.warn('Yarım kalan personel fotoğrafı temizlenemedi:', silmeHatasi); }
            }
            alert('Personel kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            hideGlobalOverlay();
        }
        if (personelKaydiBasarili && !origId) personelKayitHatirlatmasiniGoster(tcNo, personelHesabiOlustu);
        if (personelKaydiBasarili && !origId && personelHesabiOlustu) {
            const bildirimSonucu = await fdFormWait(()=>(personelBildirimleriniTopluGonder([personelIseGirisBildirimiHazirla(pObj)])));
            if (bildirimSonucu.basarisiz) showToast('Personel ve giriş hesabı kaydedildi; işe giriş WhatsApp bildirimi gönderilemedi.', 'warning');
        }
        if (personelKaydiBasarili && cikisTarihiYeniEklendi) {
            const bildirimSonucu = await fdFormWait(()=>(personelBildirimleriniTopluGonder([personelIstenAyrilisBildirimiHazirla(pObj)])));
            if (bildirimSonucu.basarisiz) showToast('İşten ayrılış kaydedildi; WhatsApp bildirimi gönderilemedi.', 'warning');
        }
        if (personelKaydiBasarili && kullaniciHesabiOlusturmaHatasi) showToast('Personel kaydı oluşturuldu; ancak giriş hesabı açılamadı: ' + (kullaniciHesabiOlusturmaHatasi.message || kullaniciHesabiOlusturmaHatasi), 'warning');
        if (personelKaydiBasarili && kullaniciHesabiSilmeHatasi) showToast('Personel çıkışı kaydedildi ancak giriş hesabı kapatılamadı: ' + (kullaniciHesabiSilmeHatasi.message || kullaniciHesabiSilmeHatasi), 'warning');
        else if (personelKaydiBasarili && kullaniciHesabiKapatilacak) showToast('Personel çıkışı kaydedildi ve kullanıcı giriş hesabı kapatıldı.');
    };
return{init(){owned=nativeDocument.getElementById('modalPersonel');form=owned.querySelector('#personelForm');organizePersonnelForm();syncSubeDatalist();owned.querySelector('#pAskerlikDurumu').addEventListener('change',updateAskerlikTarihAlani);updateAskerlikTarihAlani();form.addEventListener('submit',submit);observer=new MutationObserver(()=>{if(!busy&&owned?.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},open(request=fdPersonelFormIstek){if(!current()||!request||request.cancelled||request!==fdPersonelFormIstek||request.snapshot!==context())return false;if(busy)return false;if(request.action==='edit'){if(!personeller.some(p=>String(p.id)===String(request.id)&&aktifSirketeAit(p)))return false;personelDuzenle(request.id)}else openPersonelModal();return owned.style.display==='flex'},api:{organizePersonnelForm,updateAskerlikTarihAlani,personelFotografSeciminiGoster,fdPersonelFormKaydiSuruyor(){return busy},closePersonelModal(){if(busy)return false;closePersonelModal();clear();return true},cancelForNavigation(){if(busy){owned.style.display='none';return}clear()}},dispose(){disposed=true;generation++;activeOperation=generation;observer?.disconnect();form?.removeEventListener('submit',submit);clear();overlay=null;owned=null;form=null}};

});




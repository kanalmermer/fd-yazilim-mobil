// Common Puantaj / Prim table and opener remain eager for payroll and cold daily reports.
function openPuantajGorunumu(gorunum, fdIsCurrent) {
        if(typeof fdIsCurrent==='function'&&!fdIsCurrent())return;
        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        document.getElementById('appHub').style.display = 'none';
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'block';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        const isPrim = gorunum === 'prim';
        workspaceSekmesiniAktifEt(isPrim ? 'prim' : 'puantaj');
        puantajGorunumu = gorunum;
        const puanSube=document.getElementById('puanSubeFiltre');if(puanSube)puanSube.dataset.fabrikaVarsayilan='1';
        const fdBonusFilter=document.getElementById('puanPrimFiltre');if(fdBonusFilter)fdBonusFilter.value = 'tum';
        document.getElementById('puanPrimFiltreWrap').style.display = isPrim ? 'grid' : 'none';
        document.getElementById('puanPrimTutarWrap').style.display = 'none';
        document.getElementById('puanSubeFiltreWrap').style.display = isPrim ? 'none' : 'grid';
        document.getElementById('puanGunToggle').style.display = isPrim ? 'none' : 'inline-flex';
        document.getElementById('puanExcelMesaiBtn').style.display = isPrim ? 'none' : 'inline-flex';
        document.getElementById('puanBaslik').textContent = isPrim ? '💰 Aylık Prim Hakediş Çizelgesi' : '📅 Aylık Personel Puantaj Çizelgesi';
        document.getElementById('btnWorkspacePuantaj').classList.toggle('active', !isPrim);
        document.getElementById('btnWorkspacePrim').classList.toggle('active', isPrim);
        hideGlobalOverlay();
        const seciliGorunum = gorunum;
        const seciliYil = document.getElementById('puanYilSec')?.value || '';
        const verilerTaze = fdModulVerisiTazeMi('puantaj', seciliYil);
        renderPuantajMatrisi();
        if (!verilerTaze) {
            driveVerileriniYukleBaslangicta('puantaj', seciliYil).then(veriDegisti => {
                if(typeof fdIsCurrent==='function'&&!fdIsCurrent())return;
                if (document.getElementById('puantajApp')?.style.display !== 'block' || puantajGorunumu !== seciliGorunum) return;
                if (veriDegisti) {
                    puantajYilSecenekleriniGuncelle();
                    renderPuantajMatrisi();
                }
            }).catch(error => {
                if(typeof fdIsCurrent==='function'&&!fdIsCurrent())return;
                console.error('Puantaj verileri yenilenemedi:', error);
                showToast('Puantaj verileri arka planda yenilenemedi.', 'warning');
            });
        }
    }
function renderPuantajMatrisi(secenekler = {}) {
        const oncekiOnbellek = fdPuantajHesapOnbelleginiBaslat();
        try {
        const ay = parseInt(document.getElementById('puanAySec').value);
        const yil = parseInt(document.getElementById('puanYilSec').value);
        const primFiltre = document.getElementById('puanPrimFiltre')?.value || 'tum';
        const primGorunumu = puantajGorunumu === 'prim';
        const primSabitTutar = primSabitTutariniGetir();
        const primTutarInput = document.getElementById('puanPrimSabitTutar');
        if (primTutarInput) primTutarInput.value = primSabitTutar.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        const gunToggle = document.getElementById('puanGunToggle');
        if (gunToggle) gunToggle.textContent = puantajGunlerGizli ? '📅 Günleri Göster' : '📅 Günleri Gizle';
        puantajSubeFiltresiniDoldur();
        const seciliSube = document.getElementById('puanSubeFiltre')?.value || '';
        const personelArama = String(document.getElementById('puanPersonelAra')?.value || '').trim().toLocaleLowerCase('tr-TR');
        const daysInMonth = new Date(yil, ay + 1, 0).getDate();
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        const izinlerByPersonel = fdPuantajIzinlerByPersonelCache;
        const manuelPuantajByGun = fdPuantajManuelByGunCache;

        const thead = document.querySelector('#puantajTablosu thead');
        const tbody = document.querySelector('#puantajTablosu tbody');
        const puantajTablosu = document.getElementById('puantajTablosu');
        puantajTablosu.classList.toggle('prim-cizelgesi', primGorunumu);
        puantajTablosu.style.setProperty('--prim-gun-sayisi', daysInMonth);
        thead.innerHTML = ''; tbody.innerHTML = '';

        const fdPuantajTatilSutunNitelikleri = tarih => {
            const tur = magicpassGunTuruBul(null, tarih);
            const tip = tur === 'yarimResmiTatil' ? 'half' : tur === 'resmiTatil' ? 'full' : '';
            return 'data-fd-date="' + escapeHtml(tarih) + '"' + (tip ? ' data-fd-holiday="' + tip + '" aria-description="' + (tip === 'half' ? 'Yarım gün resmî tatil' : 'Resmî tatil') + '"' : '');
        };
        let headHtml = '<tr><th style="width:40px;">#</th><th style="min-width:140px;">Personel Adı</th>';
        if (primGorunumu || !puantajGunlerGizli) {
            for (let d = 1; d <= daysInMonth; d++) headHtml += `<th class="p-gun-baslik" ${fdPuantajTatilSutunNitelikleri(`${yil}-${String(ay + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)}>${d}</th>`;
        }
        const ozetBasliklari = primGorunumu
            ? ['Ücretsiz<br>İzin', 'Rapor', 'Gelmedi /<br>Mazeretsiz', 'Toplam<br>Gelmediği', 'Prim Hakkı']
            : ['Çalışma', 'Pazar', 'Resmi<br>Tatil', 'Yıllık<br>İzin', 'Ücretsiz<br>İzin', 'Ücretli<br>İzin', 'Gelmedi /<br>Mazeretsiz', 'Sıhhi<br>İzin', 'Ücret<br>Günü', 'Günlük<br>Ücret', 'Toplam<br>Ücret', 'Fazla Mesai<br>Saati', 'Fazla Mesai<br>Ücreti', 'Pazar Mesai<br>Saati', 'Pazar Mesai<br>Ücreti', 'Resmi Tatil<br>Mesai Saati', 'Resmi Tatil<br>Mesai Ücreti', 'Prim', 'Avans<br>Kesintisi', 'İcra<br>Kesintisi', 'BES<br>Kesintisi', 'Toplam<br>Maaş'];
        headHtml += ozetBasliklari
            .map((baslik, index) => `<th class="p-ozet ${index >= 9 ? 'p-finans' : ''}">${baslik}</th>`).join('') + '</tr>';
        thead.innerHTML = headHtml;


        const primDurumlari = new Map();
        const primDurumuAl = p => {
            const anahtar = String(p.id);
            if (!primDurumlari.has(anahtar)) primDurumlari.set(anahtar, personelPrimDurumu(p, ay, yil));
            return primDurumlari.get(anahtar);
        };
        let aktifPersoneller = personeller.filter(p => {
            if (!aktifSirketeAit(p)) return false;
            const ayBaslangic = `${yil}-${String(ay + 1).padStart(2, '0')}-01`;
            const ayBitis = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
            const girisTarihi = tarihInputDegeri(p.girisTarihi);
            const cikisTarihi = tarihInputDegeri(p.cikisTarihi);
            if (girisTarihi && girisTarihi > ayBitis) return false;
            if (cikisTarihi && cikisTarihi < ayBaslangic) return false;
            if (isPersonelUser() && String(p.id) !== String(activeUser.tcNo)) return false;
            if (personelArama && !String(p.ad || '').toLocaleLowerCase('tr-TR').includes(personelArama)) return false;
            if (!primGorunumu && !personelArama && seciliSube && String(p.sube) !== seciliSube) return false;
            if (primGorunumu && p.primVar !== 'Evet') return false;
            if (primGorunumu) {
                const primDurumu = primDurumuAl(p);
                if (primFiltre === 'hak-eden' && !primDurumu.hakkiVar) return false;
                if (primFiltre === 'hak-etmeyen' && primDurumu.hakkiVar) return false;
            }
            return true;
        }).sort((a, b) => {
            const subeSirasi = String(a.sube || '').localeCompare(String(b.sube || ''), 'tr', { sensitivity:'base' });
            return subeSirasi || String(a.ad || '').localeCompare(String(b.ad || ''), 'tr', { sensitivity:'base' });
        });

        const mobilPersonelSecimi = document.getElementById('puanMobilPersonel');
        const mobilTekPersonel = !secenekler.tumPersoneller && !isPersonelUser() && window.matchMedia('(max-width:760px)').matches;
        if (mobilPersonelSecimi && mobilTekPersonel) {
            const oncekiSecim = String(mobilPersonelSecimi.value || '');
            mobilPersonelSecimi.innerHTML = aktifPersoneller.map(p => `<option value="${escapeHtml(String(p.id))}">${escapeHtml(p.ad || 'Personel')} · ${escapeHtml(p.sube || 'Merkez')}</option>`).join('');
            const seciliId = aktifPersoneller.some(p => String(p.id) === oncekiSecim) ? oncekiSecim : String(aktifPersoneller[0]?.id || '');
            mobilPersonelSecimi.value = seciliId;
            aktifPersoneller = seciliId ? aktifPersoneller.filter(p => String(p.id) === seciliId) : [];
        }

        if (aktifPersoneller.length === 0) {
            tbody.innerHTML = '<tr><td colspan="36" style="text-align:center; color:#64748b;">Kayıtlı aktif personel bulunmuyor.</td></tr>';
            return;
        }

        const bodyRows = [];

        aktifPersoneller.forEach((p, index) => {
            const personelAdiHtml = primGorunumu
                ? `<strong>${escapeHtml(p.ad || '')}</strong>`
                : `<button type="button" class="bordro-puantaj-personel-btn" title="${escapeHtml(p.ad || '')} - bu ayın ücret pusulasını aç" onclick="bordroPersonelPusulasiGoruntule('${String(p.id).replace(/'/g, "\\'")}')">${escapeHtml(p.ad || '')}</button>`;
            let rowHtml = `<tr><td>${index + 1}</td><td>${personelAdiHtml}</td>`;
            
            let toplamX = 0, toplamPazar = 0, toplamResmiTatil = 0, toplamY = 0, toplamR = 0, toplamU = 0, toplamZ = 0, toplamM = 0, pazarCalisma = 0, resmiTatilCalisma = 0;
            const iseGirisTarihi = tarihInputDegeri(p.girisTarihi);
            const isCikisTarihi = tarihInputDegeri(p.cikisTarihi);
            const pIzinleri = izinlerByPersonel.get(String(p.id)) || [];
            const izinKoduBul = tarih => {
                const izin = pIzinleri.find(i => tarih >= i.baslangic && tarih <= i.bitis);
                if (!izin) return '';
                if (izin.tur === 'Yıllık İzin') return 'Y';
                if (izin.tur === 'Sağlık / Rapor') return 'R';
                if (['Ücretli İzin', 'Düğün İzni', 'Ölüm İzni', 'Doğum İzni', 'Evlenme İzni'].includes(izin.tur)) return 'Ü';
                if (izin.tur === 'Ücretsiz İzin') return 'Z';
                if (izin.tur === 'Mazeretsiz İzin') return 'M';
                return '';
            };

            for (let d = 1; d <= daysInMonth; d++) {
                let currDate = new Date(yil, ay, d);
                let m = String(ay + 1).padStart(2, '0');
                let dayStr = String(d).padStart(2, '0');
                let dateKey = `${yil}-${m}-${dayStr}`;
                const primBugunTamamlanmadi = primGorunumu && dateKey === magicpassTarihAnahtari(new Date()) && !primGunuTamamlandiMi(p, dateKey);

                const calismaDisiTarih = (iseGirisTarihi && dateKey < iseGirisTarihi) || (isCikisTarihi && dateKey > isCikisTarihi);
                let harf = calismaDisiTarih ? '-' : '';

                if (!calismaDisiTarih) {
                    if (currDate.getDay() === 0) harf = 'HS';
                    const mm_dd = `${m}-${dayStr}`;
                    if (sabitResmiTatiller.includes(mm_dd)) harf = 'RT';

                    const izinKodu = izinKoduBul(dateKey);
                    const pazarVeyaResmiTatil = harf === 'HS' || harf === 'RT';
                    if (izinKodu === 'Y' || izinKodu === 'Ü') {
                        if (!pazarVeyaResmiTatil) harf = izinKodu;
                    } else if (['R', 'Z', 'M'].includes(izinKodu)) {
                        harf = izinKodu;
                    } else if (harf === 'HS' || harf === 'RT') {
                        const oncekiGun = new Date(yil, ay, d - 1);
                        const oncekiTarih = `${oncekiGun.getFullYear()}-${String(oncekiGun.getMonth() + 1).padStart(2, '0')}-${String(oncekiGun.getDate()).padStart(2, '0')}`;
                        const oncekiGunIzinKodu = izinKoduBul(oncekiTarih);
                        if (['R', 'Z', 'M'].includes(oncekiGunIzinKodu)) harf = oncekiGunIzinKodu;
                    }

                    const cihazGunTuru = typeof magicpassGunTuruBul === 'function' ? magicpassGunTuruBul(p, dateKey) : '';
                    if (!izinKodu && cihazGunTuru === 'pazar') harf = 'HS';
                    else if (!izinKodu && cihazGunTuru === 'resmiTatil') harf = 'RT';
                    else if (!izinKodu && cihazGunTuru === 'yarimResmiTatil') harf = 'X';
                    if (!izinKodu && currDate <= bugun && !primBugunTamamlanmadi) {
                        const cihazGunu = magicpassGunHesapla(p, dateKey);
                        const cihazdaHareketVar = Boolean(cihazGunu.giris || cihazGunu.cikis);
                        if (cihazGunTuru === 'yarimResmiTatil') {
                            harf = 'X';
                        } else if (cihazdaHareketVar) {
                            harf = harf === 'HS' ? 'PZ' : (harf === 'RT' ? 'RC' : 'X');
                        } else if (cihazGunu.pazarHakkiYok) {
                            harf = 'M';
                        } else if (cihazGunu.durum === 'Gelmedi' && harf !== 'HS' && harf !== 'RT') {
                            harf = 'M';
                        } else if (harf !== 'HS' && harf !== 'RT') {
                            harf = '';
                        }
                    }

                    const foundObj = manuelPuantajByGun.get(`${String(p.id)}|${dateKey}`);
                    if (foundObj && foundObj.durum && !(primGorunumu && izinKodu)) harf = String(foundObj.durum).toUpperCase();
                    if (primGorunumu && izinKodu && currDate > bugun && (['R', 'Z', 'M'].includes(izinKodu) || !pazarVeyaResmiTatil)) harf = izinKodu;
                    if (primBugunTamamlanmadi && !izinKodu && harf !== 'HS' && harf !== 'RT') harf = '';
                }

                const yarimSabahDevamsiz = !calismaDisiTarih && !izinKoduBul(dateKey) && (!manuelPuantajByGun.get(String(p.id)+'|'+dateKey)?.durum || String(manuelPuantajByGun.get(String(p.id)+'|'+dateKey)?.durum).toUpperCase()==='M') && fdYarimTatilSabahDevamsizMi(p,dateKey);
                if(yarimSabahDevamsiz)harf='M';
                if (harf === 'X') toplamX++;
                else if (harf === 'HS' || harf === 'PZ') { if(currDate <= bugun){ toplamPazar++; if (harf === 'PZ') pazarCalisma++; } }
                else if (harf === 'RT' || harf === 'RC') { if(currDate <= bugun){ toplamResmiTatil++; if (harf === 'RC') resmiTatilCalisma++; } }
                else if (harf === 'Y') toplamY++;
                else if (harf === 'R') toplamR++;
                else if (harf === 'Ü') toplamU++;
                else if (harf === 'Z') toplamZ++;
                else if (harf === 'M') { toplamM += yarimSabahDevamsiz ? 0.5 : 1; if(yarimSabahDevamsiz)toplamResmiTatil += 0.5; }

                if (primGorunumu) {
                    const gosterim = primGunTatilGosterimi(p, dateKey, harf);
                    const cellClass = getPuantajCellClass(gosterim.kod);
                    rowHtml += `<td class="p-gun-hucresi" ${fdPuantajTatilSutunNitelikleri(dateKey)} title="${escapeHtml(gosterim.aciklama)}"><input type="text" maxlength="2" class="${cellClass}" value="${gosterim.kod}" title="${escapeHtml(gosterim.aciklama)}" disabled></td>`;
                } else if (!puantajGunlerGizli) {
                    const cellClass = getPuantajCellClass(harf);
                    rowHtml += `<td class="p-gun-hucresi" ${fdPuantajTatilSutunNitelikleri(dateKey)}><input type="text" maxlength="2" class="${cellClass}" value="${harf}" title="${yarimSabahDevamsiz ? 'Sabah gelmedi: 0,5 gün devamsızlık. Öğleden sonra: 0,5 gün resmî tatil.' : ''}" ${calismaDisiTarih || isPersonelUser() ? 'disabled' : `oninput="puantajHucreDegisti('${p.id}', '${dateKey}', this)" oncontextmenu="openContextMenu(event, this, '${p.id}', '${dateKey}')"`}></td>`;
                }
            }

            const toplamCalisilmayan = personelPrimCalisilmayanGunSayisi(p, ay, yil);
            const toplamCalisilmayanMetni = toplamCalisilmayan.toLocaleString('tr-TR', { minimumFractionDigits:0, maximumFractionDigits:1 });
            const yarimGunEksikligi = Math.max(0, toplamCalisilmayan - toplamZ - toplamR - toplamM);
            const mazeretsizToplam = Math.round((toplamM + yarimGunEksikligi) * 2) / 2;
            const mazeretsizToplamMetni = mazeretsizToplam.toLocaleString('tr-TR', { minimumFractionDigits:0, maximumFractionDigits:1 });
            const primDurumu = primDurumuAl(p);
            const primHakkiYok = !primDurumu.hakkiVar;
            if (primGorunumu) {
                rowHtml = rowHtml.replace('<tr>', `<tr class="${primHakkiYok ? 'puantaj-no-prime' : ''}">`);
                rowHtml += `<td class="p-ozet">${toplamZ}</td><td class="p-ozet">${toplamR}</td><td class="p-ozet">${mazeretsizToplamMetni}</td><td class="p-ozet">${toplamCalisilmayanMetni}</td><td class="p-ozet p-prim-sonuc ${primHakkiYok ? 'p-prim-yok' : 'p-prim-var'}" title="Prim hakkını manuel değiştirmek için sağ tıklayın" oncontextmenu="openPrimHakkiDuzenleme(event, '${p.id}')">${primHakkiYok ? 'Prim Yok' : 'Prim Var'}${primDurumu.manuel ? ' ✦' : ''}</td></tr>`;
                bodyRows.push(rowHtml);
                return;
            }
            const ozet = maasOzetKaydiBul(p.id, ay, yil) || {};
            const gunlukYevmiye = personelGunlukUcretiniGetir(p);
            const toplamUcretGunu = toplamX + toplamPazar + toplamResmiTatil + toplamY + toplamU;
            const gunlukCalismaSaati = ayarSayisi('gunlukCalismaSaati', 7.5);
            const {fazlaMesaiSaati,pazarMesaiSaati,resmiTatilMesaiSaati}=fdPuantajMesaiAlanlari(p,ay,yil,{ozet,gunlukCalismaSaati,pazarCalisma,resmiTatilCalisma});
            const primVar = p.primVar === 'Evet' && primDurumu.hakkiVar;
            const primTutari = String(ozet.primTutariManuel) === 'true' ? Number(ozet.primTutari || 0) : (primVar ? primSabitTutar : 0);
            const avansKesintisi = personelAylikAvansKesintisi(p.id, ay, yil);
            const aktifIcra = aktifIcraBul(p.id);
            const icraKesintisi = personelIcraKayitlari(p.id).length
                ? personelAylikIcraKesintisi(p.id, ay, yil)
                : Number(ozet.icraKesintisi || 0);
            const besKesintisi = Math.max(0, Number(ozet.besKesintisi || 0));
            const saatlikMesai = gunlukYevmiye / gunlukCalismaSaati * ayarSayisi('mesaiKatsayisi', 1.5);
            const toplamUcret = toplamUcretGunu * gunlukYevmiye;
            const fazlaMesaiUcreti = fazlaMesaiSaati * saatlikMesai;
            const pazarMesaiUcreti = pazarMesaiSaati * saatlikMesai;
            const resmiTatilMesaiUcreti = resmiTatilMesaiSaati * saatlikMesai;
            const toplamMaas = toplamUcret + fazlaMesaiUcreti + pazarMesaiUcreti + resmiTatilMesaiUcreti + primTutari - avansKesintisi - icraKesintisi - besKesintisi;
            const sayisalInput = (alan, deger, bosBirak = false, sinif = '') => `<input class="${sinif}" data-maas-alan="${alan}" type="text" inputmode="decimal" value="${bosBirak ? '' : Number(deger || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}" ${isPersonelUser() ? 'disabled' : `oninput="paraGirisiFormatla(this); maasSatiriniOnizle(this)" onchange="maasOzetAlaniniKaydet('${p.id}', '${alan}', this)"`}>`;
            rowHtml = rowHtml.replace('<tr>', `<tr class="${primGorunumu && primHakkiYok ? 'puantaj-no-prime' : ''}" data-gunluk="${gunlukYevmiye}" data-ucret-gunu="${toplamUcretGunu}" data-avans="${avansKesintisi}">`);
            rowHtml += `
                <td class="p-ozet">${toplamX}</td><td class="p-ozet">${toplamPazar}</td><td class="p-ozet">${toplamResmiTatil.toLocaleString('tr-TR')}</td><td class="p-ozet">${toplamY}</td><td class="p-ozet">${toplamZ}</td><td class="p-ozet">${toplamU}</td><td class="p-ozet">${toplamM.toLocaleString('tr-TR')}</td><td class="p-ozet">${toplamR}</td><td class="p-ozet">${toplamUcretGunu.toLocaleString('tr-TR')}</td>
                <td class="p-ozet p-finans">${paraFormatla(gunlukYevmiye)}</td><td class="p-ozet p-finans" data-maas-sonuc="toplamUcret">${paraFormatla(toplamUcret)}</td>
                <td class="p-ozet p-finans">${sayisalInput('fazlaMesaiSaati', fazlaMesaiSaati)}</td><td class="p-ozet p-finans" data-maas-sonuc="fazlaMesaiUcreti">${paraFormatla(fazlaMesaiUcreti)}</td>
                <td class="p-ozet p-finans">${sayisalInput('pazarMesaiSaati', pazarMesaiSaati)}</td><td class="p-ozet p-finans" data-maas-sonuc="pazarMesaiUcreti">${paraFormatla(pazarMesaiUcreti)}</td>
                <td class="p-ozet p-finans">${sayisalInput('resmiTatilMesaiSaati', resmiTatilMesaiSaati)}</td><td class="p-ozet p-finans" data-maas-sonuc="resmiTatilMesaiUcreti">${paraFormatla(resmiTatilMesaiUcreti)}</td>
                <td class="p-ozet p-finans">${sayisalInput('primTutari', primTutari)}</td><td class="p-ozet p-finans">${paraFormatla(avansKesintisi)}</td>
                <td class="p-ozet p-finans">${sayisalInput('icraKesintisi', icraKesintisi, !!aktifIcra && String(ozet.icraKesintisiManuel) !== 'true' && !icraKesintisi, aktifIcra && String(ozet.icraKesintisiManuel) !== 'true' && !icraKesintisi ? 'icra-eksik' : '')}</td>
                <td class="p-ozet p-finans">${sayisalInput('besKesintisi', besKesintisi)}</td>
                <td class="p-ozet p-finans" data-maas-sonuc="toplamMaas">${paraFormatla(toplamMaas)}</td>
            </tr>`;

            bodyRows.push(rowHtml);
        });
        tbody.innerHTML = bodyRows.join('');
        puantajMobilEtiketleriniUygula();
        } finally {
            fdPuantajHesapOnbelleginiGeriYukle(oncekiOnbellek);
        }
    }

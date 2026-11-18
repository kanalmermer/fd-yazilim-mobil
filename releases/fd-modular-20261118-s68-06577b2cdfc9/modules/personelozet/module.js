window.FDModules.define('personelozet',function(){
let disposed=false;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function valid(){return !disposed&&Boolean(activeUser)&&!isPersonelUser()&&anaMenuModulErisimiVar('personel')&&context()===initial}
function assertCurrent(){if(!valid())throw Error('Oturum değişti; personel özetini yeniden açın.')}
function fdOverviewVisible(){return valid()&&document.getElementById('personelDashboardApp')?.style.display==='block'}
function dashboardListeYaz(hedefId, kayitlar, bosMetin) {
        const hedef = document.getElementById(hedefId);
        if (!hedef) return;
        hedef.innerHTML = kayitlar.length ? kayitlar.map(kayit => `
            <div class="dashboard-list-item">
                <div class="dashboard-person"><strong>${escapeDashboardText(kayit.ad)}</strong><small>${escapeDashboardText(kayit.detay || '')}</small></div>
                <span class="dashboard-tag">${escapeDashboardText(kayit.etiket || '')}</span>
            </div>`).join('') : `<div class="dashboard-empty">${escapeDashboardText(bosMetin)}</div>`;
    }
function renderPersonelDashboardEkleri() {
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        const ayGun = `${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
        const aktifler = personeller.filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null'));
        const tarihDegeri = deger => tarihInputDegeri(deger);

        const hakEdenler = aktifler.filter(p => {
            const tarih = tarihDegeri(p.girisTarihi);
            return tarih && tarih.slice(5) === ayGun && Number(tarih.slice(0, 4)) < bugun.getFullYear();
        }).map(p => {
            const yil = bugun.getFullYear() - Number(tarihDegeri(p.girisTarihi).slice(0, 4));
            return { ad: p.ad, detay: `${p.sube || 'Merkez'} · İşe giriş: ${tarihFormati(p.girisTarihi)}`, etiket: `${yil}. yıl` };
        });

        const doganlar = aktifler.filter(p => {
            const tarih = tarihDegeri(p.dogumTarihi);
            return tarih && tarih.slice(5) === ayGun;
        }).map(p => {
            const yas = bugun.getFullYear() - Number(tarihDegeri(p.dogumTarihi).slice(0, 4));
            return { ad: p.ad, detay: p.sube || 'Merkez', etiket: `${yas} yaş` };
        });

        const yaklasanOzelGunler = [];
        const ozelGunEkle = (p, deger, tur) => {
            const tarih = tarihDegeri(deger);
            if (!tarih) return;
            const ilkYil = Number(tarih.slice(0, 4));
            let sonraki = new Date(bugun.getFullYear(), Number(tarih.slice(5, 7)) - 1, Number(tarih.slice(8, 10)));
            if (sonraki < bugun) sonraki.setFullYear(sonraki.getFullYear() + 1);
            const gun = Math.round((sonraki - bugun) / 86400000);
            if (gun < 1 || gun > 30 || (tur === 'yildonumu' && ilkYil >= sonraki.getFullYear())) return;
            const yildonumu = sonraki.getFullYear() - ilkYil;
            yaklasanOzelGunler.push({
                ad:p.ad,
                detay:tur === 'dogum'
                    ? `🎂 Doğum günü · ${p.sube || 'Merkez'} · ${sonraki.toLocaleDateString('tr-TR')}`
                    : `🎯 Yıllık izin hak edişi · ${yildonumu}. yıl · ${p.sube || 'Merkez'} · ${sonraki.toLocaleDateString('tr-TR')}`,
                etiket:gun === 1 ? 'Yarın' : `${gun} gün`,
                sira:gun,
                tur
            });
        };
        aktifler.forEach(p => {
            ozelGunEkle(p, p.dogumTarihi, 'dogum');
            ozelGunEkle(p, p.girisTarihi, 'yildonumu');
        });
        yaklasanOzelGunler.sort((a, b) => a.sira - b.sira || String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'));

        const yaklasanTarihler = [];
        aktifler.forEach(p => {
            [
                ['Sertifika bitişi', p.sertifikaBitis],
                ['Tecil bitişi', p.tecilBitis]
            ].forEach(([tur, deger]) => {
                const tarih = tarihDegeri(deger);
                if (!tarih) return;
                const hedef = new Date(`${tarih}T00:00:00`);
                const gun = Math.ceil((hedef - bugun) / 86400000);
                if (gun >= 0 && gun <= ayarSayisi('hatirlatmaGunu', 45)) yaklasanTarihler.push({ ad: p.ad, detay: `${tur} · ${tarihFormati(tarih)}`, etiket: gun === 0 ? 'Bugün' : `${gun} gün`, sira: gun });
            });
            const kontrol = tarihDegeri(p.sonSaglikTaramasi);
            if (kontrol) {
                const sonraki = new Date(`${kontrol}T00:00:00`);
                sonraki.setFullYear(sonraki.getFullYear() + 1);
                const gun = Math.ceil((sonraki - bugun) / 86400000);
                if (gun >= 0 && gun <= ayarSayisi('hatirlatmaGunu', 45)) yaklasanTarihler.push({ ad: p.ad, detay: `Yıllık sağlık kontrolü · ${sonraki.toLocaleDateString('tr-TR')}`, etiket: gun === 0 ? 'Bugün' : `${gun} gün`, sira: gun });
            }
        });
        yaklasanTarihler.sort((a, b) => a.sira - b.sira);

        document.getElementById('dashHakedisAdet').textContent = `${hakEdenler.length} kişi`;
        document.getElementById('dashDogumAdet').textContent = `${doganlar.length} kişi`;
        document.getElementById('dashYaklasanOzelAdet').textContent = yaklasanOzelGunler.length > 12 ? `İlk 12 / ${yaklasanOzelGunler.length}` : `${yaklasanOzelGunler.length} kayıt`;
        dashboardListeYaz('dashHakedisListesi', hakEdenler, 'Bugün yıllık izin hak eden personel bulunmuyor.');
        dashboardListeYaz('dashDogumListesi', doganlar, 'Bugün doğum günü olan personel bulunmuyor.');
        dashboardListeYaz('dashYaklasanOzelListesi', yaklasanOzelGunler.slice(0, 12), 'Önümüzdeki 30 gün içinde doğum günü veya yıllık izin hak edişi bulunmuyor.');
        dashboardListeYaz('dashYaklasanTarihListesi', yaklasanTarihler.slice(0, 10), 'Yaklaşan personel tarihi bulunmuyor.');
    }
function openPersonelDashboard() {
        if (!activeUser) return;
        if (isPersonelUser()) return openPersonelApp();
        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        ['appHub', 'personelApp', 'izinTakipApp', 'puantajApp', 'avansApp', 'sirketApp', 'icraApp', 'ekOdemeApp', 'kkdApp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        document.getElementById('personelDashboardApp').style.display = 'block';
        document.getElementById('ayarlarApp').style.display = 'none';
        workspaceSekmesiniAktifEt('ozet');
        initUI();
        renderDashboard();
        renderPersonelDashboardEkleri();
        return driveVerileriniYukleBaslangicta('izin').then(() => {
            if(!fdOverviewVisible())return;
            initUI();
            renderDashboard();
            renderPersonelDashboardEkleri();
        });
    }
return{open(){assertCurrent();return openPersonelDashboard()},api:{renderPersonelDashboardEkleri(){assertCurrent();return renderPersonelDashboardEkleri()}},dispose(){disposed=true}};
});

/* Personnel module: synchronous public API; initialization steps retain their original execution positions. */
function isPersonelUser() {
        return activeUser && activeUser.rol === 'Personel' && activeUser.tcNo;
    }

function personelModuluSaltOkunurMu(){return anaMenuModulYetkisi('personel')==='okuma';}

function personelModuluYetkiGorunumunuUygula(aktifAnahtar='personel'){
        const saltOkunur=anaMenuModulYetkisi(aktifAnahtar)==='okuma';
        document.body.dataset.aktifAnaMenuModul=aktifAnahtar;
        document.body.classList.toggle('ana-menu-modulu-salt-okunur',saltOkunur);
        document.body.classList.toggle('personel-modulu-salt-okunur',aktifAnahtar==='personel'&&saltOkunur);
        PERSONEL_MODUL_EKRANLARI.forEach(id=>{
            const kok=document.getElementById(id);if(!kok)return;
            let bilgi=[...kok.children].find(el=>el.classList?.contains('personel-salt-okunur-bilgi'));
            if(!bilgi){bilgi=document.createElement('div');bilgi.className='personel-salt-okunur-bilgi';bilgi.textContent='🔒 Sadece okuma yetkisi: Kayıtları görüntüleyebilirsiniz; ekleme, düzenleme ve silme işlemleri kapalıdır.';kok.insertBefore(bilgi,kok.firstChild);}
        });
    }

function personelSaltOkunurDegisiklikIslemi(element){
        const onclick=String(element?.getAttribute?.('onclick')||''),metin=String(element?.textContent||element?.value||'').toLocaleLowerCase('tr-TR');
        return Boolean(element?.matches?.('button[type="submit"],input[type="submit"],.btn-submit,.btn-del-modern,.btn-edit-modern')||/(kaydet|sil|ekle|düzenle|duzenle|onayla|reddet|yükle|yukle|aktar|oluştur|olustur|tamamla|durum|ata|planla|fatura|geri al)/i.test(onclick)||/(kaydet|sil|ekle|düzenle|duzenle|onayla|reddet|yükle|aktar|oluştur|tamamla|durum|ata|planla|fatura|yeni kayıt)/i.test(metin));
    }

function personelSaltOkunurKorumasiniKur(){
        if(document.documentElement.dataset.personelSaltOkunurKoruma==='1')return;
        document.documentElement.dataset.personelSaltOkunurKoruma='1';
        const saltOkunurEngeliVar=element=>document.body.classList.contains('ana-menu-modulu-salt-okunur')&&aktifAnaMenuModulKapsaminda(element);
        document.addEventListener('submit',event=>{if(!saltOkunurEngeliVar(event.target))return;event.preventDefault();event.stopImmediatePropagation();showToast('Bu modülde yalnızca okuma yetkiniz var.','warning');},true);
        document.addEventListener('click',event=>{const hedef=event.target.closest?.('button,a,input[type="submit"]');if(!hedef||!saltOkunurEngeliVar(hedef)||!personelSaltOkunurDegisiklikIslemi(hedef))return;event.preventDefault();event.stopImmediatePropagation();showToast('Bu modülde yalnızca okuma yetkiniz var.','warning');},true);
    }

function personelAnaEkranKartlariniUygula(){
        const baslatici=document.querySelector('#appHub .workspace-launcher');
        if(!baslatici)return;
        baslatici.querySelectorAll('.personel-home-card').forEach(kart=>kart.remove());
        const anaPersonelKarti=baslatici.querySelector('[data-ana-menu-modul="personel"]');
        const primMenusuAcik=personelPrimMenusuAcikMi();
        document.body.classList.toggle('personel-primsiz',isPersonelUser()&&!primMenusuAcik);
        if(!isPersonelUser())return;
        if(anaPersonelKarti)anaPersonelKarti.style.display='none';
        const kartlar=[
            ['giriscikis','↔️','Giriş–Çıkışım','Günlük giriş ve çıkışlarınızı görüntüleyin','openMagicpassApp','linear-gradient(135deg,#0369a1,#22d3ee)'],
            ['izin','🏖️','İzinlerim','İzin kayıtlarınızı görüntüleyin','openIzinTakipApp','linear-gradient(135deg,#047857,#10b981)'],
            ['puantaj','📅','Puantajım','Aylık puantajınızı görüntüleyin','openPuantajApp','linear-gradient(135deg,#b45309,#f59e0b)'],
            ['prim','💰','Primlerim','Prim listenizi görüntüleyin','openPrimApp','linear-gradient(135deg,#c2410c,#fb7185)'],
            ['avans','💳','Avanslarım','Avans ve kesinti kayıtlarınızı görüntüleyin','openAvansApp','linear-gradient(135deg,#0f766e,#14b8a6)'],
            ['icra','⚖️','İcra Takibim','İcra kayıtlarınızı görüntüleyin','openIcraApp','linear-gradient(135deg,#7c3aed,#a855f7)'],
            ['ekodeme','🧾','Ek Ödemelerim','Ek ödeme kayıtlarınızı görüntüleyin','openEkOdemeApp','linear-gradient(135deg,#4338ca,#6366f1)'],
            ['kkd','🦺','KKD Teslimlerim','Teslim edilen ekipmanları görüntüleyin','openKkdApp','linear-gradient(135deg,#be123c,#f43f5e)'],
            ['bilgiler','👤','Personel Bilgilerim','Kendi personel kartınızı görüntüleyin','openPersonelApp','linear-gradient(135deg,#0369a1,#0ea5e9)']
        ];
        kartlar.filter(([anahtar])=>anahtar!=='prim'||primMenusuAcik).forEach(([anahtar,ikon,ad,aciklama,fonksiyon,renk])=>{
            const kart=document.createElement('button');
            kart.type='button';
            kart.className='workspace-card personel-home-card';
            kart.dataset.personelMenu=anahtar;
            kart.addEventListener('click',()=>{personelModuluYetkiGorunumunuUygula('personel');const ac=window[fonksiyon];if(typeof ac==='function')ac();setTimeout(()=>personelModuluYetkiGorunumunuUygula('personel'),0);});
            kart.innerHTML=`<span class="workspace-card-icon" style="background:${renk}" aria-hidden="true">${ikon}</span><span><strong>${ad}</strong><small>${aciklama}</small></span><b>Görüntüle →</b>`;
            baslatici.appendChild(kart);
        });
        personelAnaMenuKartlariniSirala();
    }

function personelAnaMenuKartlariniSirala(){
        if(!isPersonelUser())return;
        const baslatici=document.querySelector('#appHub .workspace-launcher');
        if(!baslatici)return;
        const sira=['talepler','giriscikis','izin','puantaj','prim','avans','icra','ekodeme','kkd','bilgiler'];
        const kartlar=new Map();
        const talepler=document.getElementById('fdxMyRequestsCard');
        if(talepler){talepler.dataset.personelMenu='talepler';kartlar.set('talepler',talepler);}
        baslatici.querySelectorAll('.personel-home-card[data-personel-menu]').forEach(kart=>kartlar.set(kart.dataset.personelMenu,kart));
        sira.forEach(anahtar=>{const kart=kartlar.get(anahtar);if(kart)baslatici.appendChild(kart);});
    }

function varsayilanIzinSebebi() {
        return String(uygulamaAyarlari.varsayilanIzinSebebi || VARSAYILAN_UYGULAMA_AYARLARI.varsayilanIzinSebebi);
    }

function mountDashboardInIzinModule() {
        const dashboard = document.querySelector('#appHub .dashboard-home');
        const izinDashboard = document.getElementById('i-tab-dashboard');
        if (dashboard && izinDashboard && !izinDashboard.contains(dashboard)) {
            izinDashboard.prepend(dashboard);
        }
        const hedef = document.getElementById('personelDashboardContainer');
        if (hedef && izinDashboard && !hedef.contains(izinDashboard)) {
            hedef.appendChild(izinDashboard);
            izinDashboard.classList.add('active');
        }
    }

function fdPersonelFormCagir(name,args=[],receiver=window){if(!window.FDModules?.status('personelform').loaded)return;return FDModules.callIfLoaded('personelform',name,args,receiver)}

function fdPersonelFormAc(action,id,receiver){
 if(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))return Promise.resolve(false);
 if(fdPersonelFormCagir('fdPersonelFormKaydiSuruyor',[])){showToast('Personel kaydı sürüyor, lütfen bekleyin.','warning');return Promise.resolve(false)}
 fdPersonelFormIstek?.cancel();const snapshot=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]),request={action,id,snapshot,cancelled:false,cancel(){request.cancelled=true;request.id=null;if(fdPersonelFormIstek===request)fdPersonelFormIstek=null}};fdPersonelFormIstek=request;return FDModules.embedded('personelform',[request],receiver);
}

function organizePersonnelForm(){return fdPersonelFormCagir('organizePersonnelForm',[],this)}

function updateAskerlikTarihAlani(){return fdPersonelFormCagir('updateAskerlikTarihAlani',[],this)}

function openPersonnelWorkspace() {
        if (isPersonelUser()) openPersonelApp();
        else openPersonelDashboard();
    }

function renderPersonelDashboardEkleri(){return FDModules.callIfLoaded('personelozet','renderPersonelDashboardEkleri',Array.from(arguments),this)}

function openPersonelDashboard(){if(!activeUser)return;if(isPersonelUser())return openPersonelApp();return FDModules.open('personelozet',Array.from(arguments),this)}

function renderDashboard() {
        const today = new Date();
        const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
        const activePersonnel = personeller.filter(person => aktifSirketeAit(person) && (!person.cikisTarihi || String(person.cikisTarihi) === 'null'));
        const currentLeaves = izinler.filter(leave => aktifSirketeAit(leave) && String(leave.baslangic || '') <= todayKey && todayKey <= String(leave.bitis || '') && (!isPersonelUser() || String(leave.pId) === String(activeUser.tcNo)));
        const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const newStarters = activePersonnel.filter(person => String(person.girisTarihi || '').startsWith(thisMonth));
        const branchCount = new Set(activePersonnel.map(person => String(person.sube || 'Merkez').trim()).filter(Boolean)).size;

        document.getElementById('dashAktifPersonel').textContent = activePersonnel.length;
        document.getElementById('dashBugunIzinli').textContent = currentLeaves.length;
        document.getElementById('dashYeniBaslayan').textContent = newStarters.length;
        document.getElementById('dashSubeSayisi').textContent = branchCount;
        document.getElementById('dashIzinAdet').textContent = `${currentLeaves.length} kayıt`;
        document.getElementById('dashboardDate').textContent = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

        const list = document.getElementById('dashIzinListesi');
        if (!currentLeaves.length) {
            list.innerHTML = '<div class="dashboard-empty">Bugün için aktif izin kaydı bulunmuyor.</div>';
        } else {
            list.innerHTML = currentLeaves.slice(0, 5).map(leave => {
                const person = personeller.find(item => String(item.id) === String(leave.pId));
                const name = person ? person.ad : 'Personel kaydı bulunamadı';
                const dateRange = `${tarihFormati(leave.baslangic)} – ${tarihFormati(leave.bitis)}`;
                return `<div class="dashboard-list-item"><div class="dashboard-person"><strong>${escapeDashboardText(name)}</strong><small>${escapeDashboardText(leave.tur || 'İzin')} · ${dateRange}</small></div><span class="dashboard-tag">${Number(leave.gun) || 0} gün</span></div>`;
            }).join('');
        }
    }

async function openMagicpassApp() {
        anaMenuDonusButonunuGoster();
        ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','aracTakipApp','ayarlarApp','vardiyaApp','irsaliyeTakipApp','kiraTakipApp','ihracatApp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        document.getElementById('magicpassApp').style.display = 'block';
        workspaceSekmesiniAktifEt('giriscikis');
        if (isPersonelUser()) {
            const listeButonu = document.querySelector('#magicpassAltSekmeler button[onclick*="magicpass-tab-liste"]');
            magicpassSekmeAc('magicpass-tab-liste', listeButonu);
        }
        if (SUPABASE_MODE && window.fdAttendanceFast) window.fdAttendanceFast.open();
        else {
        magicpassArayuzunuHazirla();
        if (!fdModulVerisiTazeMi('vardiya')) {
            driveVerileriniYukleBaslangicta('vardiya').then(() => {
                if (document.getElementById('magicpassApp')?.style.display !== 'block') return;
                magicpassArayuzunuHazirla();
            }).catch(error => {
                console.error('Giriş-çıkış verileri yenilenemedi:', error);
                showToast('Giriş-çıkış verileri arka planda yenilenemedi.', 'warning');
            });
        }
        if (!isPersonelUser()) magicpassDosyaDurumunuGuncelle().catch(error => console.warn('Giriş-çıkış dosya durumu alınamadı:', error));
        }
    }

function fdPersonelArayuzunuYenile(filtreleriYenile = false) {
        if (filtreleriYenile) {
            const secimler = fdSelectDegerleriniSakla(['fAktifSube','fAktifYil','fAktifEngelli','fAktifEmekli','fAktifSiralama','fAyrilanSube','fAyrilanCikisYili','fAyrilanEngelli','fAyrilanEmekli']);
            filtreDropdownlariDoldur();
            fdSelectDegerleriniGeriYukle(secimler);
            syncSubeDatalist();
        }
        renderPersonelTables();
        yillikPersonelBelgeButonunuGuncelle();
    }

function openPersonelApp(){return FDModules.embedded('personelliste',[],this)}

function openPuantajApp(){return window.fdPuantajCagir('openPuantajApp',[],this)}

function ekOdemeSekmeleriniKur() {
        const kaynak = document.querySelector('#personelApp .workspace-nav');
        if (!kaynak) return;
        ['#ekOdemeApp .workspace-nav', '#kkdApp .workspace-nav', '#vardiyaApp .workspace-nav', '#magicpassApp .workspace-nav'].forEach(secici => {
            const hedef = document.querySelector(secici);
            if (hedef && !hedef.children.length) hedef.innerHTML = kaynak.innerHTML;
        });
        const ekle = nav => {
            for (const [hedef, metin, acilis] of [
                ['ekodeme', 'Ek Ödeme', 'openEkOdemeApp'],
                ['kkd', 'KKD Takip', 'openKkdApp'],
                ['vardiya', 'Vardiya', 'openVardiyaApp'],
                ['giriscikis', 'Giriş–Çıkış', 'openMagicpassApp']
            ]) {
                let button = nav.querySelector('[data-workspace="' + hedef + '"]');
                if (!button) {
                    button = document.createElement('button');
                    button.type = 'button'; button.textContent = metin; button.dataset.workspace = hedef;
                    nav.appendChild(button);
                }
                // HTML copies retain this handler and resolve the current protected opener.
                button.setAttribute('onclick', acilis + '()');
            }
        };
        document.querySelectorAll('#personelDashboardApp .workspace-nav, #personelApp .workspace-nav, #izinTakipApp .workspace-nav, #puantajApp .workspace-nav, #avansApp .workspace-nav, #icraApp .workspace-nav, #ekOdemeApp .workspace-nav, #kkdApp .workspace-nav, #vardiyaApp .workspace-nav, #magicpassApp .workspace-nav').forEach(ekle);
        document.querySelectorAll('.workspace-nav button[onclick="openPersonelDashboard()"]')
            .forEach(button => { button.textContent = 'Özet'; });
    }

function magicpassKayitlari(tur) {
        if (fdMagicpassKayitTurCache) return fdMagicpassKayitTurCache.get(String(tur || '')) || [];
        return vardiyaKayitlari.filter(k => k.kayitTipi === tur && aktifSirketeAit(k));
    }

function magicpassTarihAnahtari(tarih) {
        return tarih.getFullYear() + '-' + String(tarih.getMonth() + 1).padStart(2, '0') + '-' + String(tarih.getDate()).padStart(2, '0');
    }

function magicpassAyIlkGunu() {
        const ay = String(document.getElementById('magicpassAy')?.value || '');
        return ay ? ay + '-01' : magicpassTarihAnahtari(new Date()).slice(0, 7) + '-01';
    }

function magicpassDakikaMetni(dakika) {
        const sayi = Math.max(0, Math.round(Number(dakika || 0)));
        return String(Math.floor(sayi / 60)).padStart(2, '0') + ':' + String(sayi % 60).padStart(2, '0');
    }

function magicpassSaatMetni(tarih) {
        return tarih instanceof Date && !Number.isNaN(tarih.getTime()) ? String(tarih.getHours()).padStart(2, '0') + ':' + String(tarih.getMinutes()).padStart(2, '0') : '-';
    }

function magicpassSaatliTarih(tarihKey, saat, ertesiGun = false) {
        const tarih = new Date(tarihKey + 'T' + String(saat || '00:00') + ':00');
        if (ertesiGun) tarih.setDate(tarih.getDate() + 1);
        return tarih;
    }

function magicpassVardiyaSaatleri(tur, tarihKey) {
        const gece = tur === 'gece';
        const basSaat = gece ? (uygulamaAyarlari.magicpassGeceBaslangic || '23:00') : (uygulamaAyarlari.magicpassGunduzBaslangic || '08:00');
        const bitSaat = gece ? (uygulamaAyarlari.magicpassGeceBitis || '08:00') : (uygulamaAyarlari.magicpassGunduzBitis || '17:00');
        const sinirSaat = gece ? (uygulamaAyarlari.magicpassGeceMesaiSiniri || '12:00') : (uygulamaAyarlari.magicpassGunduzMesaiSiniri || '20:00');
        const bas = magicpassSaatliTarih(tarihKey, basSaat);
        const bitErtesi = bitSaat <= basSaat;
        const bit = magicpassSaatliTarih(tarihKey, bitSaat, bitErtesi);
        let sinir = magicpassSaatliTarih(tarihKey, sinirSaat, sinirSaat <= basSaat);
        if (sinir < bit) sinir.setDate(sinir.getDate() + 1);
        return { bas, bit, sinir, basSaat, bitSaat, sinirSaat };
    }

function magicpassPersonelBul(kayit) {
        if (fdMagicpassPersonelIdCache || fdMagicpassPersonelCihazCache) {
            const pId = String(kayit?.pId || '');
            if (pId && fdMagicpassPersonelIdCache?.has(pId)) return fdMagicpassPersonelIdCache.get(pId);
            return fdMagicpassPersonelCihazCache?.get(String(kayit?.cihazNo || '').trim()) || null;
        }
        if (kayit.pId) {
            const p = personeller.find(x => String(x.id) === String(kayit.pId) && aktifSirketeAit(x));
            if (p) return p;
        }
        return personeller.find(x => String(x.cihazPersonelNo || '').trim() === String(kayit.cihazNo || '').trim() && aktifSirketeAit(x));
    }

function magicpassHaftalikVardiyaBul(personel, tarihKey) {
        const hafta = vardiyaPazartesi(tarihKey);
        const kayit = vardiyaKayitlari.find(k => !k.kayitTipi && String(k.haftaBaslangic) === hafta && String(k.sube || '') === String(personel.sube || '') && aktifSirketeAit(k));
        const satir = kayit?.satirlar?.find(s => String(s.personelId) === String(personel.id));
        return satir?.vardiya === 'gece' ? 'gece' : (satir ? 'gunduz' : '');
    }

function magicpassGunVardiyasi(personel, tarihKey) {
        const atama = magicpassKayitlari('vardiyaAtama').filter(k => String(k.pId) === String(personel.id) && String(k.tarih) === tarihKey).sort((a,b) => Number(b.zaman || 0) - Number(a.zaman || 0))[0];
        if (atama) return atama.vardiya;
        const haftalik = magicpassHaftalikVardiyaBul(personel, tarihKey);
        if (haftalik) return haftalik;
        const gun = new Date(tarihKey + 'T12:00:00').getDay();
        return gun === 0 ? 'izin' : 'gunduz';
    }

function magicpassGunHareketleri(personel, tarihKey, vardiya) {
        const saatler = magicpassVardiyaSaatleri(vardiya, tarihKey);
        const pencereBas = new Date(saatler.bas); pencereBas.setHours(pencereBas.getHours() - 4);
        const pencereBit = new Date(saatler.bit); pencereBit.setHours(pencereBit.getHours() + 8);
        const onbellekli = Boolean(fdMagicpassHareketlerByPersonelCache);
        const kaynak = onbellekli
            ? (fdMagicpassHareketlerByPersonelCache.get(String(personel?.id || '')) || [])
            : magicpassKayitlari('magicpassHareket');
        const sirali = kaynak.filter(k => {
            const p = onbellekli ? personel : magicpassPersonelBul(k);
            const zaman = new Date(k.zamanDamgasi);
            return p && String(p.id) === String(personel.id) && zaman >= pencereBas && zaman <= pencereBit;
        }).sort((a,b) => String(a.zamanDamgasi).localeCompare(String(b.zamanDamgasi)));
        const esik = Math.min(30, Math.max(0, Number(uygulamaAyarlari.magicpassMukerrerBasimDakika ?? 3)));
        if (!esik || sirali.length < 2) return sirali;
        const sonuc=[]; let oncekiHamZaman=null;
        sirali.forEach(hareket => { const zaman=new Date(hareket.zamanDamgasi); if(!oncekiHamZaman || (zaman-oncekiHamZaman)/60000>esik) sonuc.push(hareket); oncekiHamZaman=zaman; });
        return sonuc;
    }

function magicpassGunHesapla(personel, tarihKey) {
        if (!String(personel?.cihazPersonelNo || '').trim()) return { tarih:tarihKey, vardiya:'', durum:'Cihaz No Tanımsız', seviye:'hata', normal:0, gec:0, erken:0, mesai:0, uyarilar:['Personel kartına cihaz numarası girin'] };
        const vardiya = magicpassGunVardiyasi(personel, tarihKey);
        const izin = izinler.find(i => aktifSirketeAit(i) && String(i.pId) === String(personel.id) && tarihKey >= i.baslangic && tarihKey <= i.bitis);
        if (vardiya === 'izin' || izin) return { tarih:tarihKey, vardiya, izin:izin || null, izinAdi:izin?.tur || '', durum:izin ? (izin.tur || 'İzinli') : 'Çalışma Yok', seviye:'tamam', normal:0, gec:0, erken:0, mesai:0, uyarilar:[] };
        const saatler = magicpassVardiyaSaatleri(vardiya, tarihKey);
        const hareketler = magicpassGunHareketleri(personel, tarihKey, vardiya);
        const duzeltme = magicpassKayitlari('magicpassDuzeltme').filter(k => String(k.pId) === String(personel.id) && String(k.tarih) === tarihKey).sort((a,b) => Number(b.zaman || 0)-Number(a.zaman || 0))[0];
        let giris = null, cikis = null;
        if (duzeltme) {
            giris = duzeltme.giris ? magicpassSaatliTarih(tarihKey, duzeltme.giris) : null;
            cikis = duzeltme.cikis ? magicpassSaatliTarih(tarihKey, duzeltme.cikis, vardiya === 'gece' && duzeltme.cikis <= saatler.basSaat) : null;
        } else if (hareketler.length >= 2) {
            giris = new Date(hareketler[0].zamanDamgasi);
            cikis = new Date(hareketler[hareketler.length - 1].zamanDamgasi);
        } else if (hareketler.length === 1) {
            const tek = new Date(hareketler[0].zamanDamgasi);
            const orta = new Date((saatler.bas.getTime() + saatler.bit.getTime()) / 2);
            if (tek <= orta) giris = tek; else cikis = tek;
        }
        const uyarilar = [];
        let durum = 'Tamam', seviye = 'tamam', normal = 0, gec = 0, erken = 0, mesai = 0;
        const bugun = magicpassTarihAnahtari(new Date());
        if (!giris && !cikis) {
            durum = tarihKey <= bugun ? 'Gelmedi' : 'Planlandı';
            seviye = tarihKey <= bugun ? 'hata' : 'tamam';
        } else if (!giris) {
            durum = 'Giriş Eksik'; seviye = 'hata'; uyarilar.push('Giriş Eksik');
        } else if (!cikis) {
            durum = 'Çıkış Eksik'; seviye = 'hata'; uyarilar.push('Çıkış Eksik');
        } else {
            gec = Math.max(0, Math.round((giris - saatler.bas) / 60000));
            erken = Math.max(0, Math.round((saatler.bit - cikis) / 60000));
            normal = Math.max(0, Math.round((Math.min(cikis, saatler.bit) - Math.max(giris, saatler.bas)) / 60000));
            mesai = Math.max(0, Math.round((cikis - saatler.bit) / 60000) - gec - erken);
            if (gec > 0) uyarilar.push('Geç geldi ' + magicpassDakikaMetni(gec));
            if (erken > 0) uyarilar.push('Erken çıktı ' + magicpassDakikaMetni(erken));
            if (cikis > saatler.sinir) uyarilar.push('Mesai üst sınırı aşıldı');
            if (uyarilar.length) { durum = 'Uyarı'; seviye = 'uyari'; }
        }
        return { tarih:tarihKey, vardiya, giris, cikis, normal, gec, erken, mesai, durum, seviye, uyarilar, hareketler, duzeltme };
    }

function magicpassSekmeAc(tabId, button) {
        document.querySelectorAll('#magicpassApp main > .tab-content').forEach(alan => alan.classList.remove('active'));
        document.querySelectorAll('#magicpassAltSekmeler button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId)?.classList.add('active');
        if (button) button.classList.add('active');
        if (tabId === 'magicpass-tab-vardiya') {
            magicpassVardiyaAyarFormunuDoldur();
            magicpassDosyaDurumunuGuncelle();
            magicpassGunlukRaporAyarlariniDoldur();
        }
    }

function magicpassVardiyaAyarFormunuDoldur(){magicpassVardiyaTanimlariniDuzelt();return FDModules.callIfLoaded('vardiyatanim','magicpassVardiyaAyarFormunuDoldur',Array.from(arguments),this)}

async function magicpassVardiyaAyarlariniKaydet() {
        if (!isManagerUser()) return showToast('Bu ayarları kaydetmek için admin veya kullanıcı yetkisi gerekir.','error');
        const saatAlanlari = ['ayarMagicGunduzBaslangic','ayarMagicGunduzBitis','ayarMagicGunduzSinir','ayarMagicGeceBaslangic','ayarMagicGeceBitis','ayarMagicGeceSinir'];
        if (saatAlanlari.some(id => !document.getElementById(id)?.value)) return showToast('Tüm vardiya saatlerini doldurun.','warning');
        const yeniAyarlar = {
            ...uygulamaAyarlari,
            vardiyaGunduzBaslik:String(document.getElementById('ayarVardiyaGunduzBaslik')?.value || uygulamaAyarlari.vardiyaGunduzBaslik || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGunduzBaslik,
            vardiyaGeceBaslik:String(document.getElementById('ayarVardiyaGeceBaslik')?.value || uygulamaAyarlari.vardiyaGeceBaslik || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGeceBaslik,
            magicpassGunduzBaslangic:document.getElementById('ayarMagicGunduzBaslangic').value,
            magicpassGunduzBitis:document.getElementById('ayarMagicGunduzBitis').value,
            magicpassGunduzMesaiSiniri:document.getElementById('ayarMagicGunduzSinir').value,
            magicpassGeceBaslangic:document.getElementById('ayarMagicGeceBaslangic').value,
            magicpassGeceBitis:document.getElementById('ayarMagicGeceBitis').value,
            magicpassGeceMesaiSiniri:document.getElementById('ayarMagicGeceSinir').value,
            vardiyaAciklamalar:String(document.getElementById('ayarVardiyaAciklamalar')?.value || uygulamaAyarlari.vardiyaAciklamalar || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaAciklamalar
        };
        showGlobalOverlay('Vardiya tanımı kaydediliyor','Giriş–çıkış hesaplama saatleri güncelleniyor...');
        try {
            const { data:sirket, error:okumaHatasi } = await supabaseClient.from('companies').select('data').eq('id',aktifSirketId()).maybeSingle();
            if (okumaHatasi) throw okumaHatasi;
            const { error, data:kayitliSirket } = await supabaseClient.from('companies').update({ data:{ ...(sirket?.data || {}), uygulamaAyarlari:yeniAyarlar } }).eq('id',aktifSirketId()).select('data').single();
            if (error) throw error;
            uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...kayitliSirket.data.uygulamaAyarlari };
            magicpassAylikCizelgeyiCiz();
            showToast('Vardiya tanımı ve saatleri kaydedildi.');
        } catch(error) {
            showToast('Vardiya tanımı kaydedilemedi: ' + (error.message || error),'error');
        } finally {
            hideGlobalOverlay();
        }
    }

function magicpassRaporPersoneli() {
        return personeller.find(p => String(p.id) === String(document.getElementById('magicpassPersonel')?.value || '') && aktifSirketeAit(p) && (!isPersonelUser() || String(p.id) === String(activeUser?.tcNo || '')));
    }

function magicpassRaporDosyaAdi(personel, uzanti) {
        const ay = String(document.getElementById('magicpassAy')?.value || '').replace('-','_');
        const ad = String(personel?.ad || 'Personel').toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g,'_').replace(/^_+|_+$/g,'');
        return (ad || 'PERSONEL') + '_GIRIS_CIKIS_' + ay + '.' + uzanti;
    }

function magicpassAylikExcelAl() {
        const personel = magicpassRaporPersoneli();
        if (!personel) return showToast('Önce soldaki listeden personel seçin.','warning');
        if (typeof XLSX === 'undefined') return showToast('Excel kütüphanesi yüklenemedi.','error');
        const ay = document.getElementById('magicpassAy').value;
        const liste = magicpassAylikCizelgeVerisi(personel,ay);
        const satirlar = liste.map(k => [
            tarihFormati(k.tarih),
            magicpassVardiyaSaatEtiketi(k.vardiya),
            magicpassCalismaSaatleriMetni(k,'giris'),
            magicpassCalismaSaatleriMetni(k,'cikis'),
            magicpassDakikaMetni(k.normal),
            magicpassDakikaMetni(k.gec),
            magicpassDakikaMetni(k.erken),
            magicpassDakikaMetni(k.mesai),
            k.durum,
            k.uyarilar.join(' · ')
        ]);
        const veri = [
            ['AYLIK PERSONEL GİRİŞ–ÇIKIŞ RAPORU'],
            ['Personel',personel.ad || '-'],
            ['Şube',personel.sube || 'Merkez'],
            ['Görev',personel.gorev || '-'],
            ['Cihaz No',personel.cihazPersonelNo || '-'],
            ['Dönem',ay],
            [],
            ['Tarih','Vardiya','Giriş','Çıkış','Normal','Geç','Erken','Fazla Mesai','Durum','Uyarı'],
            ...satirlar
        ];
        const ws = XLSX.utils.aoa_to_sheet(veri);
        ws['!cols'] = [{wch:14},{wch:15},{wch:10},{wch:10},{wch:12},{wch:12},{wch:12},{wch:15},{wch:18},{wch:38}];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,ws,'Giriş Çıkış');
        XLSX.writeFile(wb,magicpassRaporDosyaAdi(personel,'xlsx'));
        showToast('Aylık giriş–çıkış Excel dosyası hazırlandı.');
    }

async function magicpassAylikPdfAl() {
        const personel = magicpassRaporPersoneli();
        if (!personel) return showToast('Önce soldaki listeden personel seçin.','warning');
        if (typeof html2pdf !== 'function') return showToast('PDF kütüphanesi yüklenemedi.','error');
        const tablo = document.getElementById('magicpassAylikTablo')?.cloneNode(true);
        if (!tablo) return;
        Array.from(tablo.rows).forEach(row => {
            if (row.cells.length) row.deleteCell(row.cells.length - 1);
            if (row.cells.length) row.deleteCell(0);
        });
        tablo.querySelectorAll('button,input').forEach(el => el.remove());
        const ay = document.getElementById('magicpassAy').value;
        const rapor = document.createElement('div');
        rapor.style.cssText = 'padding:14px;font-family:Arial,sans-serif;color:#0f172a;background:#fff;';
        rapor.innerHTML = '<h2 style="margin:0 0 5px;font-size:18px;">AYLIK PERSONEL GİRİŞ–ÇIKIŞ RAPORU</h2><p style="margin:0 0 12px;color:#475569;font-size:11px;">' + escapeDashboardText(personel.ad || '-') + ' · ' + escapeDashboardText(personel.sube || 'Merkez') + ' · ' + escapeDashboardText(personel.gorev || '-') + ' · Dönem: ' + escapeDashboardText(ay) + '</p>';
        rapor.appendChild(tablo);
        rapor.querySelectorAll('table').forEach(el => el.style.cssText='width:100%;border-collapse:collapse;font-size:8px;');
        rapor.querySelectorAll('th').forEach(el => el.style.cssText='padding:5px;border:1px solid #94a3b8;background:#e2e8f0;text-align:center;');
        rapor.querySelectorAll('td').forEach(el => el.style.cssText='padding:4px;border:1px solid #cbd5e1;text-align:center;');
        document.body.appendChild(rapor);
        showGlobalOverlay('PDF hazırlanıyor','Aylık giriş–çıkış listesi oluşturuluyor...');
        try {
            await html2pdf().set({ margin:0.28, filename:magicpassRaporDosyaAdi(personel,'pdf'), html2canvas:{scale:2,backgroundColor:'#ffffff'}, jsPDF:{unit:'in',format:'a4',orientation:'landscape'}, pagebreak:{mode:['css','legacy']} }).from(rapor).save();
            showToast('Aylık giriş–çıkış PDF dosyası hazırlandı.');
        } catch(error) {
            showToast('PDF oluşturulamadı: ' + (error.message || error),'error');
        } finally {
            rapor.remove();
            hideGlobalOverlay();
        }
    }

function magicpassPersonelAyrilmisMi(personel) {
        const cikis=String(personel?.cikisTarihi??'').trim().toLocaleLowerCase('tr-TR');
        return Boolean(cikis&&!['null','undefined','-','0000-00-00'].includes(cikis));
    }

function magicpassFiltreliPersoneller(aramayiUygula=true) {
        const filtre=String(document.getElementById('magicpassSubeFiltre')?.value||''),ayrilanlar=filtre==='__ayrilan__',arama=aramayiUygula?String(document.getElementById('magicpassPersonelAra')?.value||'').trim().toLocaleLowerCase('tr-TR'):'';
        return personeller.filter(p=>aktifSirketeAit(p)&&(!isPersonelUser()||String(p.id)===String(activeUser?.tcNo||''))&&(ayrilanlar?magicpassPersonelAyrilmisMi(p):!magicpassPersonelAyrilmisMi(p)))
            .filter(p=>ayrilanlar||!filtre||String(p.sube||'Merkez')===filtre)
            .filter(p=>!arama||(String(p.ad||'')+' '+String(p.cihazPersonelNo||'')+' '+String(p.gorev||'')).toLocaleLowerCase('tr-TR').includes(arama))
            .sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
    }

function magicpassArayuzunuHazirla() {
        const ay=document.getElementById('magicpassAy');if(!ay)return;if(!ay.value)ay.value=magicpassTarihAnahtari(new Date()).slice(0,7);
        const select=document.getElementById('magicpassPersonel'),mevcut=select.value,tumu=personeller.filter(p=>aktifSirketeAit(p)&&(!isPersonelUser()||String(p.id)===String(activeUser?.tcNo||''))).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr')),aktifler=tumu.filter(p=>!magicpassPersonelAyrilmisMi(p)),ayrilanlar=tumu.filter(magicpassPersonelAyrilmisMi);
        select.innerHTML='<option value="">Personel seçin</option>'+tumu.map(p=>'<option value="'+escapeDashboardText(p.id)+'">'+escapeDashboardText(p.ad||'-')+' · Cihaz: '+escapeDashboardText(p.cihazPersonelNo||'tanımsız')+(magicpassPersonelAyrilmisMi(p)?' · Ayrıldı: '+escapeDashboardText(tarihFormati(p.cikisTarihi)):'')+'</option>').join('');
        select.value=tumu.some(p=>String(p.id)===String(mevcut))?mevcut:String(aktifler.find(p=>p.cihazPersonelNo)?.id||aktifler[0]?.id||'');
        const sube=document.getElementById('magicpassSubeFiltre');if(sube){const onceki=sube.value,subeler=[...new Set(aktifler.map(p=>p.sube||'Merkez'))].sort((a,b)=>String(a).localeCompare(String(b),'tr'));sube.innerHTML='<option value="">Tüm Şubeler</option>'+subeler.map(ad=>'<option value="'+escapeDashboardText(ad)+'">'+escapeDashboardText(ad)+'</option>').join('')+(ayrilanlar.length?'<option value="__ayrilan__">Ayrılan Personeller ('+ayrilanlar.length+')</option>':'');if([...sube.options].some(o=>o.value===onceki))sube.value=onceki;}
        if(!document.body.dataset.magicpassMenuBagli){document.body.dataset.magicpassMenuBagli='1';document.addEventListener('click',e=>{if(!e.target.closest('#magicpassVardiyaMenu'))document.getElementById('magicpassVardiyaMenu').style.display='none';});}
        magicpassSubeFiltreDegisti();magicpassDosyaDurumunuGuncelle();
    }

function magicpassPersonelListesiCiz() {
        const alan=document.getElementById('magicpassSolPersonelListesi');if(!alan)return;const secili=String(document.getElementById('magicpassPersonel')?.value||''),liste=magicpassFiltreliPersoneller(true),ayrilanlar=document.getElementById('magicpassSubeFiltre')?.value==='__ayrilan__';
        alan.innerHTML=liste.length?liste.map(p=>'<button type="button" class="magicpass-sol-personel '+(String(p.id)===secili?'active':'')+'" onclick="magicpassPersonelSec(\''+String(p.id).replace(/'/g,'')+'\')"><strong>'+escapeDashboardText(p.ad||'-')+'</strong>'+(ayrilanlar?'<small>Çıkış: '+escapeDashboardText(tarihFormati(p.cikisTarihi))+' · '+escapeDashboardText(p.sube||'Merkez')+'</small>':'')+'</button>').join(''):'<div style="padding:18px;color:#64748b;text-align:center;">Personel bulunamadı.</div>';
    }

function magicpassSubeFiltreDegisti() {
        const select=document.getElementById('magicpassPersonel'),uygun=magicpassFiltreliPersoneller(false);if(select&&!uygun.some(p=>String(p.id)===String(select.value)))select.value=String(uygun[0]?.id||'');magicpassPersonelListesiCiz();magicpassAylikCizelgeyiCiz();
    }

function magicpassPersonelSec(pId) {
        document.getElementById('magicpassPersonel').value = String(pId || '');
        magicpassPersonelListesiCiz();
        magicpassAylikCizelgeyiCiz();
    }

function magicpassAyDegistir(adim) {
        const alan = document.getElementById('magicpassAy');
        const parca = String(alan.value || magicpassTarihAnahtari(new Date()).slice(0,7)).split('-').map(Number);
        const tarih = new Date(parca[0], parca[1] - 1 + Number(adim || 0), 1);
        alan.value = tarih.getFullYear() + '-' + String(tarih.getMonth() + 1).padStart(2,'0');
        magicpassAylikCizelgeyiCiz();
    }

function magicpassAylikCizelgeVerisi(personel, ayDegeri) {
        const ay = String(ayDegeri || document.getElementById('magicpassAy')?.value || magicpassTarihAnahtari(new Date()).slice(0,7));
        const parca = ay.split('-').map(Number);
        const gunSayisi = new Date(parca[0], parca[1], 0).getDate();
        const liste = [];
        for (let gun=1; gun<=gunSayisi; gun++) liste.push({...magicpassGunHesapla(personel, ay + '-' + String(gun).padStart(2,'0')),pId:String(personel?.id||''),sirketId:String(personel?.sirketId||'')});
        return liste;
    }

function magicpassAylikMesaiSaati(personel, ay, yil) {
        if (!personel?.cihazPersonelNo) return 0;
        const ayDegeri = String(yil) + '-' + String(Number(ay) + 1).padStart(2,'0');
        const toplamDakika = magicpassAylikCizelgeVerisi(personel, ayDegeri).reduce((toplam,kayit) => toplam + Number(kayit.mesai || 0), 0);
        return mesaiSaatiniYukariYarimaYuvarla(toplamDakika / 60);
    }

function magicpassAylikCizelgeyiCiz() {
        const tbody = document.querySelector('#magicpassAylikTablo tbody');
        if (!tbody) return;
        const personel = personeller.find(p => String(p.id) === String(document.getElementById('magicpassPersonel').value));
        magicpassSeciliGunler.clear();
        const baslik = document.getElementById('magicpassSeciliPersonelBaslik');
        const bilgi = document.getElementById('magicpassSeciliPersonelBilgi');
        if (!personel) {
            tbody.innerHTML = '<tr><td colspan="11" style="padding:24px;color:#64748b;">Personel seçin.</td></tr>';
            document.getElementById('magicpassOzet').innerHTML = '';
            if (baslik) baslik.textContent = 'Personel seçin';
            if (bilgi) bilgi.textContent = '';
            return;
        }
        if (baslik) baslik.textContent = personel.ad || 'Personel';
        if (bilgi) bilgi.textContent = (personel.sube || 'Merkez') + ' · ' + (personel.gorev || '-') + ' · Cihaz No: ' + (personel.cihazPersonelNo || 'tanımsız');
        magicpassPersonelListesiCiz();
        const liste = magicpassAylikCizelgeVerisi(personel);
        tbody.innerHTML = liste.map(k => {
            const sinif = k.seviye === 'hata' ? 'magicpass-hata' : (k.seviye === 'uyari' ? 'magicpass-uyari' : '');
            const durumSinif = k.seviye === 'hata' ? 'hata' : (k.seviye === 'uyari' ? 'uyari' : 'tamam');
            const vardiyaAd = magicpassVardiyaSaatEtiketi(k.vardiya);
            const uyarilar = k.uyarilar.length ? '<br><small>' + escapeDashboardText(k.uyarilar.join(' · ')) + '</small>' : '';
            const gunAdiHam = new Date(k.tarih + 'T12:00:00').toLocaleDateString('tr-TR', { weekday:'long' });
            const gunAdi = gunAdiHam.charAt(0).toLocaleUpperCase('tr-TR') + gunAdiHam.slice(1);
            const satirOlayi=k.istihdamDisi?'':' oncontextmenu="magicpassGunMenuAc(event,\''+k.tarih+'\')"',secim=k.istihdamDisi?'<span title="İşe giriş tarihinden önce">—</span>':'<input class="magicpass-gun-sec" type="checkbox" onchange="magicpassGunSecildi(\''+k.tarih+'\',this.checked)">',islem=k.istihdamDisi?'<span title="İşe giriş tarihinden önce">—</span>':'<button class="btn-modern btn-edit-modern" onclick="magicpassGunDuzenle(\''+k.tarih+'\')">Düzelt</button>';
            return '<tr class="' + sinif + '" data-tarih="' + k.tarih + '"' + satirOlayi + '><td data-label="Seç">' + secim + '</td><td class="magicpass-tarih-hucre" data-label="Tarih / Gün">' + tarihFormati(k.tarih) + '<small class="magicpass-tarih-gun">' + escapeDashboardText(gunAdi) + '</small></td><td data-label="Vardiya">' + vardiyaAd + '</td><td data-label="Giriş">' + magicpassSaatHucresiHtml(k,'giris') + '</td><td data-label="Çıkış">' + magicpassSaatHucresiHtml(k,'cikis') + '</td><td data-label="Normal">' + magicpassDakikaMetni(k.normal) + '</td><td data-label="Geç">' + magicpassDakikaMetni(k.gec) + '</td><td data-label="Erken">' + magicpassDakikaMetni(k.erken) + '</td><td data-label="Fazla Mesai"><strong>' + magicpassDakikaMetni(k.mesai) + '</strong></td><td data-label="Durum" style="position:relative;text-align:center"><span class="magicpass-durum-hizasi" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="magicpass-durum ' + durumSinif + '">' + escapeDashboardText(k.durum) + '</span></span>' + uyarilar + '</td><td data-label="İşlem">' + islem + '</td></tr>';
        }).join('');
        const toplam = alan => liste.reduce((t,k) => t + Number(k[alan] || 0), 0);
        const tamGun = liste.filter(k => k.giris && k.cikis).length;
        const eksik = liste.filter(k => ['Giriş Eksik','Çıkış Eksik'].includes(k.durum)).length;
        const gelmedi = liste.filter(k => k.durum === 'Gelmedi').length;
        document.getElementById('magicpassOzet').innerHTML = '<div><span>Tam Gün</span><strong>' + tamGun + '</strong></div><div><span>Gelmedi</span><strong>' + gelmedi + '</strong></div><div><span>Eksik Basış</span><strong>' + eksik + '</strong></div><div><span>Net Fazla Mesai</span><strong>' + magicpassDakikaMetni(toplam('mesai')) + '</strong></div><div><span>Geç + Erken</span><strong>' + magicpassDakikaMetni(toplam('gec') + toplam('erken')) + '</strong></div>';
    }

function magicpassGunSecildi(tarih, secili) {
        if (secili) magicpassSeciliGunler.add(tarih); else magicpassSeciliGunler.delete(tarih);
        const tr = document.querySelector('#magicpassAylikTablo tr[data-tarih="' + tarih + '"]');
        if (tr) tr.classList.toggle('magicpass-secili', secili);
    }

function magicpassTumGunleriSec(secili) {
        document.querySelectorAll('#magicpassAylikTablo .magicpass-gun-sec').forEach(input => { input.checked = secili; input.dispatchEvent(new Event('change')); });
    }

function magicpassGunMenuAc(event, tarih) {
        event.preventDefault();
        if (!magicpassSeciliGunler.has(tarih)) {
            magicpassSeciliGunler.clear();
            document.querySelectorAll('#magicpassAylikTablo .magicpass-gun-sec').forEach(x => x.checked = false);
            magicpassGunSecildi(tarih, true);
            const sec = document.querySelector('#magicpassAylikTablo tr[data-tarih="' + tarih + '"] .magicpass-gun-sec');
            if (sec) sec.checked = true;
        }
        const menu = document.getElementById('magicpassVardiyaMenu');
        menu.style.left = Math.min(event.clientX, window.innerWidth - 230) + 'px';
        menu.style.top = Math.min(event.clientY, window.innerHeight - 190) + 'px';
        menu.style.display = 'block';
    }

function magicpassAtamaKaydi(pId, tarih, vardiya, kaynak) {
        return { id:'vatama_' + pId + '_' + tarih + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6), kayitTipi:'vardiyaAtama', sirketId:aktifSirketId(), pId:String(pId), tarih, vardiya, kaynak:kaynak || 'manuel', zaman:Date.now() };
    }

function magicpassSeciliGunlereVardiyaAta(value){return window.fdVardiyaAtamaCagir('selected',value);}

async function magicpassGunDuzenle(tarih) {
        const personel = personeller.find(p => String(p.id) === String(document.getElementById('magicpassPersonel').value));
        if (!personel) return;
        if(String(personel.girisTarihi||'').slice(0,10)&&String(tarih)<String(personel.girisTarihi).slice(0,10)){showToast('İşe giriş tarihinden önceki günler düzeltilemez.','warning');return;}
        const hesap = magicpassGunHesapla(personel,tarih);
        const giris = await fdYuzerDegerSor(tarihFormati(tarih) + ' giriş saati (HH:MM, boş bırakılabilir):', magicpassSaatMetni(hesap.giris).replace('-',''));
        if (giris === null) return;
        const cikis = await fdYuzerDegerSor(tarihFormati(tarih) + ' çıkış saati (HH:MM, boş bırakılabilir):', magicpassSaatMetni(hesap.cikis).replace('-',''));
        if (cikis === null) return;
        const saatDogru = deger => !deger || /^([01]\d|2[0-3]):[0-5]\d$/.test(deger);
        if (!saatDogru(giris) || !saatDogru(cikis)) return alert('Saatleri HH:MM biçiminde yazın.');
        vardiyaKayitlari.push({ id:'mduz_' + personel.id + '_' + tarih + '_' + Date.now(), kayitTipi:'magicpassDuzeltme', sirketId:aktifSirketId(), pId:String(personel.id), tarih, giris, cikis, zaman:Date.now() });
        yuklenenVeriler.add('vardiya');
        await supabaseVerileriKaydet();
        magicpassAylikCizelgeyiCiz();
        showToast('Giriş–çıkış düzeltmesi kaydedildi.');
    }

function magicpassDosyaVeritabaniAc() {
        return new Promise((resolve,reject) => {
            const istek = indexedDB.open('fd_yazilim_dosya_baglantilari',1);
            istek.onupgradeneeded = () => {
                if (!istek.result.objectStoreNames.contains('dosyalar')) istek.result.createObjectStore('dosyalar');
            };
            istek.onsuccess = () => resolve(istek.result);
            istek.onerror = () => reject(istek.error);
        });
    }

function magicpassDosyaDurumuYaz(metin, renk) {
        ['ayarMagicDosyaDurumu','magicpassDosyaDurumu'].forEach(id => {
            const alan = document.getElementById(id);
            if (alan) { alan.textContent = metin; alan.style.color = renk || '#64748b'; }
        });
    }

function magicpassDosyaDurumunuGuncelle(){return window.fdDosyaBagCagir.call(this,'status');}

function magicpassDosyaBaglantisiniAyarla(){return window.fdDosyaBagCagir.call(this,'choose');}

function magicpassSabitDosyayiOtomatikOku(izinIste){return window.fdDosyaBagCagir.call(this,'import',izinIste);}

function magicpassCihazNoAnahtari(deger) {
        const ham=String(deger??'').trim().replace(/^[\s"']+|[\s"']+$/g,'');if(!/^\d+$/.test(ham))return ham;return ham.replace(/^0+(?=\d)/,'');
    }

function magicpassDosyasiniIsle(dosya,sessiz,hataFirlat=false,bildirimGoster=true){return window.fdHareketAktarCagir.call(this,dosya,sessiz,hataFirlat,bildirimGoster);}

async function magicpassTxtDosyasiniOku(event) {
        const dosya = event?.target?.files?.[0];
        if (dosya) await magicpassDosyasiniIsle(dosya,false);
        if (event?.target) event.target.value = '';
    }

function fdTopluPlanCagir(name,args=[],receiver=window){if(!window.FDModules?.status('topluplan').loaded)return;return FDModules.callIfLoaded('topluplan',name,args,receiver)}

function magicpassTopluPlanlamaAc(){
 if(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))return Promise.resolve(false);
 fdTopluPlanIstek?.cancel();const context=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel'),document.getElementById('magicpassAy')?.value||'']),scope=context();const request={cancelled:false,errorButton:null,errorClose:null,current(){return fdTopluPlanIstek===request&&!request.cancelled&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&context()===scope},clearError(){if(request.errorButton&&request.errorClose)request.errorButton.removeEventListener('click',request.errorClose);request.errorButton=null;request.errorClose=null},cancel(){request.cancelled=true;request.clearError();if(fdTopluPlanIstek===request)fdTopluPlanIstek=null}};fdTopluPlanIstek=request;return FDModules.embedded('topluplan',[request],this).then(value=>{if(!request.current())request.cancel();else if(value===false){const panel=document.getElementById('fdModuleLoadError');request.errorButton=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent==='Kapat')||null;request.errorClose=()=>request.cancel();request.errorButton?.addEventListener('click',request.errorClose,{once:true})}return value},error=>{request.cancel();throw error});
}

function magicpassTopluPlanlamaKapat(){return window.fdTopluPlanGecisiniIptalEt()}

function magicpassTopluPersonelleriCiz(...args){return fdTopluPlanCagir('magicpassTopluPersonelleriCiz',args,this)}

function magicpassTopluSecimSayisiniGuncelle(...args){return fdTopluPlanCagir('magicpassTopluSecimSayisiniGuncelle',args,this)}

function magicpassTopluTumunuSec(...args){return fdTopluPlanCagir('magicpassTopluTumunuSec',args,this)}

function magicpassTopluVardiyaUygula(){return window.fdVardiyaAtamaCagir('bulk');}

function magicpassSonTopluIslemiGeriAl(){return window.fdVardiyaAtamaCagir('undo');}

async function magicpassPuantajaAktar() {
        const ayMetni=document.getElementById('magicpassAy').value;
        if(!ayMetni)return;
        const parca=ayMetni.split('-').map(Number), ay=parca[1]-1, yil=parca[0], tarih=ayMetni+'-00';
        const aktifler=personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&p.cihazPersonelNo);
        let aktarilan=0, atlanan=0;
        aktifler.forEach(p=>{
            const toplamDakika=magicpassAylikCizelgeVerisi(p).reduce((t,k)=>t+Number(k.mesai||0),0);
            const yuvarlanmis=mesaiSaatiniYukariYarimaYuvarla(toplamDakika/60);
            const mevcut=puantajVerileri.find(k=>k.kayitTipi==='maasOzet'&&String(k.pId)===String(p.id)&&String(k.tarih)===tarih&&String(k.sirketId||'')===aktifSirketId());
            if(mevcut&&String(mevcut.fazlaMesaiSaatiManuel)==='true'){atlanan++;return;}
            const yeni={...(mevcut||{}),pId:String(p.id),tarih,durum:'MAAS_OZET',kayitTipi:'maasOzet',sirketId:aktifSirketId(),fazlaMesaiSaati:yuvarlanmis,fazlaMesaiSaatiManuel:'false',fazlaMesaiKaynagi:'MagicPass',fazlaMesaiHamDakika:toplamDakika};
            if(mevcut)puantajVerileri[puantajVerileri.indexOf(mevcut)]=yeni;else puantajVerileri.push(yeni);aktarilan++;
        });
        yuklenenVeriler.add('puantaj');await supabaseVerileriKaydet();renderPuantajMatrisi();
        alert(aktarilan+' personelin aylık net mesaisi puantaja aktarıldı.'+(atlanan?'\n'+atlanan+' personelin manuel mesaisi korunarak atlandı.':''));
    }

function vardiyaPazartesi(tarihDegeri) {
        const tarih = tarihDegeri ? new Date(`${String(tarihDegeri).slice(0,10)}T12:00:00`) : new Date();
        const gun = tarih.getDay();
        tarih.setDate(tarih.getDate() - (gun === 0 ? 6 : gun - 1));
        return `${tarih.getFullYear()}-${String(tarih.getMonth()+1).padStart(2,'0')}-${String(tarih.getDate()).padStart(2,'0')}`;
    }

function vardiyaHaftaBitisi(baslangic) {
        const tarih = new Date(`${baslangic}T12:00:00`);
        tarih.setDate(tarih.getDate() + 6);
        return `${tarih.getFullYear()}-${String(tarih.getMonth()+1).padStart(2,'0')}-${String(tarih.getDate()).padStart(2,'0')}`;
    }

function personelBildirimSablonunuDoldur(ayarAnahtari, alanlar = {}) {
        const sablon = String(uygulamaAyarlari?.[ayarAnahtari] || VARSAYILAN_UYGULAMA_AYARLARI?.[ayarAnahtari] || '');
        const mesaj = Object.entries(alanlar).reduce((metin, [anahtar, deger]) =>
            metin.replaceAll(`{${anahtar}}`, String(deger ?? '')), sablon
        );
        if (mesaj.length > 4096) throw new Error('Bildirim metni çok uzun; eksik mesaj oluşturulmadı.');
        return mesaj;
    }

async function personelKayitBildirimiGonder(personelId, baslik, mesaj, secenekler = {}) {
        if (!SUPABASE_MODE || !supabaseClient || !activeUser?.sirketId) return { atlandi:true };
        if (typeof window.fdPersonelOtomatikBildirimGonder !== 'function') throw new Error('Bildirim sistemi hazır değil.');
        return window.fdPersonelOtomatikBildirimGonder(String(personelId || ''), baslik, mesaj, Boolean(secenekler.ayrilanPersonel), String(secenekler.messageCategory || 'manual'));
    }

async function personelBildirimleriniTopluGonder(bildirimler, eszamanli = 4) {
        const kuyruk = (Array.isArray(bildirimler) ? bildirimler : []).filter(item => item?.personelId && item?.mesaj);
        if (!kuyruk.length) return { toplam:0, gonderilen:0, kuyrukta:0, atlanan:0, basarisiz:0, hatalar:[] };
        let sira = 0, gonderilen = 0, kuyrukta = 0, atlanan = 0;
        const hatalar = [];
        const isci = async () => {
            while (sira < kuyruk.length) {
                const item = kuyruk[sira++];
                try {
                    const sonuc = await personelKayitBildirimiGonder(item.personelId, item.baslik, item.mesaj, item);
                    if (sonuc?.success === false || Number(sonuc?.failed || 0) > 0) throw new Error(sonuc?.failureReasons?.[0]?.error_message || sonuc?.message || 'WhatsApp bildirimi kuyruğa alınamadı.');
                    if (sonuc?.atlandi) atlanan++;
                    else if (Number(sonuc?.sent || 0) > 0 || sonuc?.alreadySent === true) gonderilen++;
                    else if (Number(sonuc?.queued || 0) > 0 || Number(sonuc?.accepted || 0) > 0 || sonuc?.alreadyQueued === true) kuyrukta++;
                    else throw new Error(sonuc?.failureReasons?.[0]?.error_message || 'WhatsApp bildirimi kuyruğa alınamadı.');
                } catch (error) {
                    hatalar.push({ personelId:String(item.personelId), hata:String(error?.message || error) });
                }
            }
        };
        await Promise.all(Array.from({ length:Math.min(Math.max(1, Number(eszamanli) || 1), kuyruk.length) }, () => isci()));
        return { toplam:kuyruk.length, gonderilen, kuyrukta, atlanan, basarisiz:hatalar.length, hatalar };
    }

function vardiyaBildirimGonderimZamani() {
        const saatParcala=(deger,yedek)=>{const eslesme=String(deger||yedek).match(/^(\d{1,2}):(\d{2})$/);return eslesme?[Math.min(23,Number(eslesme[1])),Math.min(59,Number(eslesme[2]))]:yedek.split(':').map(Number)};
        const simdi = new Date(), gonderim = new Date(simdi), [aksamSaat,aksamDakika]=saatParcala(uygulamaAyarlari?.whatsappVardiyaAksamSaati,'20:00'), [ertesiSaat,ertesiDakika]=saatParcala(uygulamaAyarlari?.whatsappVardiyaErtesiGunSaati,'10:00');
        const bugunkuSinir=new Date(simdi);bugunkuSinir.setHours(aksamSaat,aksamDakika,0,0);
        if (simdi < bugunkuSinir) gonderim.setHours(aksamSaat,aksamDakika,0,0);
        else { gonderim.setDate(gonderim.getDate() + 1); gonderim.setHours(ertesiSaat,ertesiDakika,0,0); }
        return gonderim;
    }

async function personelVardiyaBildirimleriniPlanla(bildirimler, fdIsCurrent = () => true) {
        if (!fdIsCurrent()) return { toplam:0,planlanan:0,basarisiz:0,atlandi:true };
        if (uygulamaAyarlari?.whatsappVardiyaOtomatikAktif === false) return { toplam:Array.isArray(bildirimler)?bildirimler.length:0, planlanan:0, basarisiz:0, atlandi:true };
        const izinliSubeler=new Set(whatsappVardiyaSubeleriniDuzelt());
        if(!izinliSubeler.size)return { toplam:Array.isArray(bildirimler)?bildirimler.length:0, planlanan:0, basarisiz:0, atlandi:true, neden:'Vardiya mesajı gönderilecek şube seçilmedi.' };
        const benzersiz = new Map();
        (Array.isArray(bildirimler) ? bildirimler : []).forEach(item => {
            const personel=personeller.find(p=>String(p.id)===String(item?.personelId)&&aktifSirketeAit(p));
            if (item?.personelId && item?.mesaj && personel && izinliSubeler.has(String(personel.sube||'').trim())) benzersiz.set(String(item.personelId), item);
        });
        if (!benzersiz.size) return { toplam:0, planlanan:0, basarisiz:0, hatalar:[] };
        if (typeof window.fdxPlanliBildirimApi !== 'function') return { toplam:benzersiz.size, planlanan:0, basarisiz:benzersiz.size, hatalar:[{ hata:'Planlı bildirim bağlantısı hazır değil.' }] };
        const scheduledFor = vardiyaBildirimGonderimZamani().toISOString(), hatalar=[];
        let planlanan=0, atlanan=0;
        for (const item of benzersiz.values()) {
            if (!fdIsCurrent()) break;
            try {
                const cevap = await window.fdxPlanliBildirimApi({
                    action:'schedule-shift-upsert', employeeId:String(item.personelId),
                    title:item.baslik || 'Vardiya Planınız Güncellendi', message:item.mesaj, scheduledFor
                }, fdIsCurrent);
                if (!fdIsCurrent()) break;
                if (cevap?.success === false) throw new Error(cevap.message || 'WhatsApp mesajı planlanamadı.');
                if (cevap?.atlandi) atlanan++; else planlanan++;
            } catch (error) {
                if (!fdIsCurrent()) break;
                hatalar.push({ personelId:String(item.personelId), hata:String(error?.message || error) });
            }
        }
        return { toplam:benzersiz.size, planlanan, atlanan, basarisiz:hatalar.length, hatalar, scheduledFor };
    }

async function personelIzinBildirimleriniPlanla(bildirimler, fdIsCurrent) {
        if(typeof fdIsCurrent==='function'&&!fdIsCurrent())return {toplam:0,planlanan:0,basarisiz:0,atlandi:true};
        if (uygulamaAyarlari?.whatsappIzinOtomatikAktif === false) return { toplam:Array.isArray(bildirimler)?bildirimler.length:0, planlanan:0, basarisiz:0, atlandi:true };
        const benzersiz = new Map();
        (Array.isArray(bildirimler) ? bildirimler : []).forEach(item => {
            if (item?.personelId && item?.mesaj) benzersiz.set(String(item.personelId), item);
        });
        if (!benzersiz.size) return { toplam:0, planlanan:0, basarisiz:0, hatalar:[] };
        if (typeof window.fdxPlanliBildirimApi !== 'function') return { toplam:benzersiz.size, planlanan:0, basarisiz:benzersiz.size, hatalar:[{ hata:'WhatsApp gönderim kuyruğu hazır değil.' }] };
        const scheduledFor = izinBildirimGonderimZamani().toISOString(), hatalar=[];
        let planlanan=0, atlanan=0;
        for (const item of benzersiz.values()) {
            if(typeof fdIsCurrent==='function'&&!fdIsCurrent())break;
            try {
                const cevap = await window.fdxPlanliBildirimApi({
                    action:'schedule-leave-upsert', employeeId:String(item.personelId),
                    title:item.baslik || 'İzin Kaydınız Güncellendi', message:item.mesaj, scheduledFor
                });
                if (cevap?.success === false) throw new Error(cevap.message || 'WhatsApp mesajı planlanamadı.');
                if (cevap?.atlandi) atlanan++; else planlanan++;
            } catch (error) {
                hatalar.push({ personelId:String(item.personelId), hata:String(error?.message || error) });
            }
        }
        return { toplam:benzersiz.size, planlanan, atlanan, basarisiz:hatalar.length, hatalar, scheduledFor };
    }

async function personelIzinBildiriminiIptalEt(personelId) {
        if (!personelId || typeof window.fdxPlanliBildirimApi !== 'function') return { iptalEdilen:0 };
        try { return await window.fdxPlanliBildirimApi({ action:'schedule-leave-cancel', employeeId:String(personelId) }); }
        catch (error) { console.warn('Bekleyen izin WhatsApp mesajı iptal edilemedi:', error); return { iptalEdilen:0, hata:error }; }
    }

function personelBildirimTarihleriniYaz(tarihler) {
        const liste = [...new Set((Array.isArray(tarihler) ? tarihler : [tarihler]).map(tarih => String(tarih || '').slice(0,10)).filter(Boolean))].sort();
        if (!liste.length) return '-';
        if (liste.length === 1) return tarihFormati(liste[0]) + ' tarihinde';
        const ardArda = liste.every((tarih, index) => !index || Math.round((new Date(tarih+'T12:00:00') - new Date(liste[index-1]+'T12:00:00')) / 86400000) === 1);
        return ardArda ? tarihFormati(liste[0]) + ' - ' + tarihFormati(liste[liste.length-1]) + ' tarihleri arasında' : liste.map(tarihFormati).join(', ') + ' tarihlerinde';
    }

function personelIzinBildirimiHazirla(izin) {
        const personel = personeller.find(p => String(p.id) === String(izin?.pId));
        if (!personel) return null;
        return {
            personelId:String(personel.id),
            messageCategory:"leave",
            baslik:'İzin Kaydınız Oluşturuldu',
            mesaj:personelBildirimSablonunuDoldur('magicpassBildirimIzinKayitMetni', {
                AD:personel.ad || 'Personel', 'İZİN_TÜRÜ':izin.tur || 'İzin', BAŞLANGIÇ:tarihFormati(izin.baslangic),
                BİTİŞ:tarihFormati(izin.bitis), 'İŞE_BAŞLAMA':izin.iseBaslama ? tarihFormati(izin.iseBaslama) : '-', GÜN:Number(izin.gun || 0)
            })
        };
    }

function personelVardiyaBildirimiHazirla(personelId, tarihler, vardiya, detay = {}) {
        const personel = personeller.find(p => String(p.id) === String(personelId) && aktifSirketeAit(p));
        if (!personel || !vardiya) return null;
        return {
            personelId:String(personel.id),
            messageCategory:"shift",
            baslik:'Vardiya Planınız Güncellendi',
            mesaj:personelBildirimSablonunuDoldur('magicpassBildirimVardiyaDegisiklikMetni', {
                AD:personel.ad || 'Personel', 'TARİHLER':personelBildirimTarihleriniYaz(tarihler), VARDİYA:magicpassVardiyaAdi(vardiya),
                'ÇALIŞMA_SAATLERİ':vardiya === 'izin' ? 'Çalışma yok' : magicpassVardiyaSaatEtiketi(vardiya), GÖREV:detay.gorev || personel.gorev || '-', ŞUBE:detay.sube || personel.sube || 'Merkez'
            })
        };
    }

function vardiyaHaftalikBildirimAnahtari(kayit) {
        return `${aktifSirketId()}|${String(kayit?.id || '')}`;
    }

function vardiyaHaftalikBildirimTarihleri(kayit) {
        const baslangic=String(kayit?.haftaBaslangic||'').slice(0,10);if(!baslangic)return[];
        const tarihler=[],ilk=new Date(baslangic+'T12:00:00');
        for(let gun=0;gun<7;gun++){const tarih=new Date(ilk);tarih.setDate(ilk.getDate()+gun);tarihler.push(magicpassTarihAnahtari(tarih))}
        return tarihler;
    }

function vardiyaHaftalikBildirimGorunumu(kayit) {
        const gorunum=new Map();if(!kayit||!aktifSirketeAit(kayit))return gorunum;
        const tanimlar=vardiyaKayitTanimHaritasi(kayit);
        (kayit.satirlar||[]).forEach(satir=>{
            const personelId=String(satir.personelId||'');if(!personelId)return;
            const personel=personeller.find(p=>String(p.id)===personelId&&aktifSirketeAit(p));
            if(!personel||magicpassPersonelAyrilmisMi(personel)||String(personel.sube||'').trim()!==String(kayit.sube||'').trim())return;
            const vardiya=String(tanimlar[satir.vardiya]||fdVardiyaVarsayilanGunduzId()),gorev=String(satir.gorev||'').trim(),sube=String(kayit.sube||'').trim();
            gorunum.set(personelId,{personelId,vardiya,gorev,sube,imza:vardiya});
        });
        return gorunum;
    }

function vardiyaHaftalikBildirimleriHazirla(kayit, onceki) {
        const guncel=vardiyaHaftalikBildirimGorunumu(kayit),tarihler=vardiyaHaftalikBildirimTarihleri(kayit),bildirimler=[];
        // Haftalık listenin tamamı gönderilir; önceki vardiya ile aynı olmak veya ilk kez eklenmek alıcıyı elemez.
        // Kişisel WhatsApp tercihleri planlama ve gönderim sırasında sunucuda yeniden kontrol edilir.
        if(tarihler.length===7)guncel.forEach((detay,personelId)=>{const bildirim=personelVardiyaBildirimiHazirla(personelId,tarihler,detay.vardiya,detay);if(bildirim){bildirim.baslik='Haftalık Vardiya Planınız';bildirimler.push(bildirim)}});
        return{guncel,bildirimler};
    }

function personelBordroAvansOzetiniBul(personelId, ay, yil) {
        const hedefAy = puantajAyAnahtari(ay, yil);
        const planlar = avanslar.filter(avans => String(avans.pId) === String(personelId) && avansAktifSirketinMi(avans) && String(avans.durum || '') !== 'Tamamlandı')
            .map(avans => avansAylikKesinti(avans, hedefAy)).filter(Boolean);
        return { kesinti:planlar.reduce((toplam, plan) => toplam + Number(plan.kesinti || 0), 0), kalan:planlar.reduce((toplam, plan) => toplam + Number(plan.kalan || 0), 0) };
    }

function personelBordroBildirimiHazirla(personelId, donem) {
        const personel = personeller.find(p => String(p.id) === String(personelId));
        if (!personel || !donem) return null;
        const avans = personelBordroAvansOzetiniBul(personel.id, donem.ay, donem.yil), avansVar = avans.kesinti > 0;
        return {
            personelId:String(personel.id),
            messageCategory:"payslip",
            messageTemplateKey:avansVar?'magicpassBildirimBordroAvansMetni':'magicpassBildirimBordroYayinMetni',
            baslik:'Ücret Pusulanız Yayımlandı',
            mesaj:personelBildirimSablonunuDoldur(avansVar ? 'magicpassBildirimBordroAvansMetni' : 'magicpassBildirimBordroYayinMetni', {
                AD:personel.ad || 'Personel', 'DÖNEM':donem.etiket || '-', 'AVANS_KESİNTİSİ':paraFormatla(avans.kesinti),
                'AVANS_KALAN':paraFormatla(avans.kalan), 'UYGULAMA_ADRESİ':PERSONEL_UYGULAMA_ADRESI
            })
        };
    }

async function personelBordroBildirimleriniPlanla(bildirimler, donem, uploadedAt) {
        const benzersiz = new Map((Array.isArray(bildirimler) ? bildirimler : [])
            .filter(item => item?.personelId && item?.mesaj).map(item => [String(item.personelId), item]));
        const sonuc = { toplam:benzersiz.size, kuyrukta:0, gonderilen:0, atlanan:0, basarisiz:0, hatalar:[] };
        const items=[...benzersiz.values()];let cursor=0;
        const worker=async()=>{while(cursor<items.length){
            const item=items[cursor++];
            try {
                if (typeof window.fdxPlanliBildirimApi !== 'function') throw new Error('Planlı WhatsApp bağlantısı hazır değil.');
                const cevap = await window.fdxPlanliBildirimApi({ action:'schedule-payslip-upsert', employeeId:String(item.personelId),
                    title:item.baslik, message:item.mesaj, messageTemplateKey:item.messageTemplateKey, period:donem.anahtar, uploadedAt });
                if (cevap?.success === false) throw new Error(cevap.message || 'Ücret pusulası mesajı planlanamadı.');
                if (cevap?.atlandi) sonuc.atlanan++;
                else if (cevap?.alreadySent) sonuc.gonderilen++;
                else if (Number(cevap?.queued || 0) > 0 || cevap?.alreadyQueued) sonuc.kuyrukta++;
                else throw new Error('Ücret pusulası mesajı planlanamadı.');
            } catch (error) {
                sonuc.basarisiz++; sonuc.hatalar.push({ personelId:String(item.personelId), hata:String(error?.message || error) });
            }
        }};
        await Promise.all(Array.from({length:Math.min(4,items.length)},()=>worker()));
        if (sonuc.kuyrukta) { const alan=document.getElementById('fdWhatsappKuyrukListesi'); if(alan)delete alan.dataset.loaded; }
        return sonuc;
    }

function personelIseGirisBildirimiHazirla(personel) {
        if (!personel?.id) return null;
        return {
            personelId:String(personel.id),
            messageCategory:"employment_start",
            baslik:'İşe Giriş Bilgilendirmesi',
            mesaj:personelBildirimSablonunuDoldur('magicpassBildirimIseGirisMetni', {
                AD:personel.ad || 'Personel', 'İŞE_GİRİŞ_TARİHİ':tarihFormati(personel.girisTarihi), GÖREV:personel.gorev || '-', ŞUBE:personel.sube || 'Merkez',
                'UYGULAMA_ADRESİ':PERSONEL_UYGULAMA_ADRESI, 'KULLANICI_ADI':String(personel.id)
            }).replaceAll('{GEÇİCİ_ŞİFRE}', 'T.C. kimlik numaranızın ilk 6 hanesi')
        };
    }

function personelIstenAyrilisBildirimiHazirla(personel) {
        if (!personel?.id || !personel.cikisTarihi) return null;
        return {
            personelId:String(personel.id),
            messageCategory:"employment_end",
            baslik:'İşten Ayrılış Bilgilendirmesi',
            ayrilanPersonel:true,
            mesaj:personelBildirimSablonunuDoldur('magicpassBildirimIstenAyrilisMetni', {
                AD:personel.ad || 'Personel', 'İŞTEN_AYRILIŞ_TARİHİ':tarihFormati(personel.cikisTarihi), GÖREV:personel.gorev || '-', ŞUBE:personel.sube || 'Merkez'
            })
        };
    }

function ibanGirisiFormatla(input) {
        const temiz = String(input.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 26);
        input.value = temiz.replace(/(.{4})/g, '$1 ').trim();
    }

function puantajYiliDegistir(){return window.fdPuantajCagir('puantajYiliDegistir',Array.from(arguments),this)}

function fdWordBelgeBaglami(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))])}

function fdWordBelgeYetkisi(action){return Boolean(activeUser?.sirketId)&&(action==='count'?anaMenuModulYazmaYetkisiVar('sirket'):action==='prepare'&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol))}

async function fdWordBelgeCagir(action,args){
 if(!fdWordBelgeYetkisi(action))throw Error('Bu belge işlemine erişim yetkiniz yok.');
 const scope=fdWordBelgeBaglami(),epoch=fdWordBelgeNesli,detail=document.getElementById('modalPersonelDetay'),detailBody=detail?.style.display==='flex'?document.getElementById('detayModalBody'):null,detailNode=detailBody?.firstElementChild||null;
 const request={action,args,cancelled:false,current(){return !request.cancelled&&epoch===fdWordBelgeNesli&&scope===fdWordBelgeBaglami()&&fdWordBelgeYetkisi(action)&&(!detailNode||(detail.style.display==='flex'&&detailBody.firstElementChild===detailNode&&detailNode.isConnected))},cancel(){request.cancelled=true;request.args=null;fdWordBelgeIstekleri.delete(request)}};fdWordBelgeIstekleri.add(request);
 try{const result=await FDModules.embedded('wordbelge',[request],this);if(!request.current())throw Error('Ekran veya oturum değişti; belge işlemini yeniden başlatın.');if(!result||result.ok!==true)throw result?.error||Error('Belge modülü yüklenemedi; işlemi yeniden başlatın.');return result.value}finally{request.cancel()}
}

async function wordBelgesiKirmiziGrupSayisi(arrayBuffer){return fdWordBelgeCagir.call(this,'count',[arrayBuffer])}

async function personelWordBelgesiniHazirla(arrayBuffer,degerler,belgeKey=''){return fdWordBelgeCagir.call(this,'prepare',[arrayBuffer,degerler,belgeKey])}

function personelSubesiniBul(personel) {
        return subeler.find(item => String(item.sirketId || '') === String(personel.sirketId || aktifSirketId() || '') && String(item.ad || '') === String(personel.sube || ''))
            || subeler.find(item => String(item.ad || '') === String(personel.sube || ''))
            || null;
    }

function personelSubeBelgeleriHtml(personel) {
        const sube = personelSubesiniBul(personel);
        const belgeler = sube?.personelBelgeleri || {};
        const kartlar = SUBE_PERSONEL_BELGELERI.map(tanim => {
            const belge = belgeler[tanim.key];
            return '<article class="personel-document-card"><strong>' + sirketText(tanim.baslik) + '</strong><small>' +
                (belge ? sirketText((sube?.ad || personel.sube || 'Şube') + ' için kayıtlı belge: ' + (belge.ad || 'belge şablonu')) : 'Personelin şubesinde bu belge henüz tanımlanmadı.') +
                '</small><button type="button" class="btn-modern ' + (belge ? 'btn-detail-modern' : '') + '" data-personel-belge="' + tanim.key + '"' + (belge ? '' : ' disabled') + '>' +
                (belge ? '📄 PDF Aç / Yazdır' : 'Belge Yüklü Değil') + '</button></article>';
        }).join('');
        return '<section style="margin-top:12px;border:1px solid #dce8f1;border-radius:10px;background:#fbfdff;overflow:hidden;"><h5 style="margin:0;padding:10px 12px;color:#0f4c6e;background:#f0f8fc;font-size:.8rem;">Şube Personel Evrakları</h5><div class="personel-document-grid">' + kartlar + '</div></section>';
    }

function personelBelgeButonlariniBagla(personelId, alan) {
        alan?.querySelectorAll('[data-personel-belge]').forEach(button => {
            button.onclick = () => personelBelgeHazirla(personelId, button.dataset.personelBelge);
        });
    }

function fdBelgeHazirlamaYetkisi(id){const p=personeller.find(x=>String(x.id)===String(id));return fdWordBelgeYetkisi('prepare')&&p&&aktifSirketeAit(p)&&(!isPersonelUser()||String(id)===String(activeUser?.tcNo||''));}

async function personelBelgeHazirla(personelId,belgeKey){
 if(!fdBelgeHazirlamaYetkisi(personelId))return showToast('Bu personelin belgesini açma yetkiniz yok.','warning');
 window.fdBelgeHazirlamaIptalEt();const scope=fdWordBelgeBaglami(),epoch=fdBelgeHazirlamaNesli,detail=document.getElementById('modalPersonelDetay'),body=detail?.style.display==='flex'?document.getElementById('detayModalBody'):null,node=body?.firstElementChild||null;
 let observer;const request={args:[personelId,belgeKey],cancelled:false,current(){return !request.cancelled&&fdBelgeHazirlamaIstegi===request&&fdBelgeHazirlamaKayitlari.has(request)&&epoch===fdBelgeHazirlamaNesli&&scope===fdWordBelgeBaglami()&&fdBelgeHazirlamaYetkisi(personelId)&&(!node||(detail.style.display==='flex'&&body.firstElementChild===node&&node.isConnected))},cancel(){request.cancelled=true;request.args=null;observer?.disconnect();fdBelgeHazirlamaKayitlari.delete(request);if(fdBelgeHazirlamaIstegi===request)fdBelgeHazirlamaIstegi=null}};
 fdBelgeHazirlamaIstegi=request;fdBelgeHazirlamaKayitlari.add(request);if(node){observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(detail,{attributes:true,attributeFilter:['style']});observer.observe(body,{childList:true,subtree:true});}
 try{return await FDModules.embedded('belgehazirla',[request],this)}finally{request.cancel()}
}

function fdWordOnizlemeYetkisi(){return Boolean(activeUser?.sirketId)&&anaMenuModulErisimiVar('personel')}

async function personelBelgeOnizlemeAc(blob,dosyaAdi,baslik,secenek={}){
 if(!fdWordOnizlemeYetkisi())return showToast('Bu belgeyi görüntüleme yetkiniz yok.','warning');
 window.fdWordOnizlemeIptalEt();const scope=fdWordBelgeBaglami(),epoch=fdWordOnizlemeNesli,modal=document.getElementById('modalPersonelBelge'),area=document.getElementById('personelBelgeOnizleme'),detail=document.getElementById('modalPersonelDetay'),body=detail?.style.display==='flex'?document.getElementById('detayModalBody'):null,node=body?.firstElementChild||null;let observer;
 const request={args:[blob,dosyaAdi,baslik,secenek],ownerBlob:blob,modal,area,started:false,finished:false,nodes:[],cancelled:false,
 owns(){return request.started&&area===document.getElementById('personelBelgeOnizleme')&&!area.dataset.fdAnnualOwner&&personelBelgeOnizlemeBlobu===request.ownerBlob},
 current(){return !request.cancelled&&fdWordOnizlemeIstegi===request&&fdWordOnizlemeKayitlari.has(request)&&epoch===fdWordOnizlemeNesli&&scope===fdWordBelgeBaglami()&&fdWordOnizlemeYetkisi()&&area.isConnected&&area===document.getElementById('personelBelgeOnizleme')&&(!node||(detail.style.display==='flex'&&node.isConnected&&body.firstElementChild===node))&&(!request.started||(modal.style.display==='flex'&&!area.dataset.fdAnnualOwner&&personelBelgeOnizlemeBlobu===request.ownerBlob))&&(!request.finished||request.nodes.every(n=>n.parentNode===area))},
 cancel(close=true){if(request.cancelled)return;const owns=request.owns();request.cancelled=true;request.args=null;request.ownerBlob=null;observer?.disconnect();request.releaseStage?.();request.releaseStage=null;request.onCancel?.();request.onCancel=null;fdWordOnizlemeKayitlari.delete(request);if(fdWordOnizlemeIstegi===request)fdWordOnizlemeIstegi=null;if(close&&owns)fdWordOnizlemeAsilKapat()}};
 fdWordOnizlemeIstegi=request;fdWordOnizlemeKayitlari.add(request);observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(modal,{attributes:true,attributeFilter:['style']});observer.observe(area,{attributes:true,attributeFilter:['data-fd-annual-owner'],childList:true});if(node){observer.observe(detail,{attributes:true,attributeFilter:['style']});observer.observe(body,{childList:true,subtree:true})}
 try{return await FDModules.embedded('wordonizleme',[request],this)}finally{if(!request.finished)request.cancel()}
}

function personelBelgeOnizlemeKapat() {
        document.body.classList.remove('personel-word-yazdiriliyor');
        document.getElementById('modalPersonelBelge').style.display = 'none';
        document.getElementById('personelBelgeOnizleme').innerHTML = '';
        const indirButonu = document.querySelector('#modalPersonelBelge .personel-word-actions button[onclick="personelBelgeWordIndir()"]');
        if (indirButonu) indirButonu.style.display = '';
        const pdfButonu = document.getElementById('personelBelgePdfIndirBtn');
        if (pdfButonu) { pdfButonu.style.display = 'none'; pdfButonu.disabled = false; pdfButonu.textContent = '⬇️ PDF İndir'; }
        personelBelgeOnizlemeBlobu = null;
        personelBelgeOnizlemeAdi = '';
        personelBelgeOnizlemeBasligi = '';
        window.fdYillikBelgeTopluDurumunuTemizle?.();
    }

function personelBelgeWordIndir() {
        if (!personelBelgeOnizlemeBlobu) return;
        fdCiktiDogrudanKaydet(personelBelgeOnizlemeBlobu, personelBelgeOnizlemeAdi || 'personel_belgesi.docx');
    }

async function personelBelgeAktifPdfIndir() {
        if (!personelBelgeOnizlemeBlobu) return;
        const buton = document.getElementById('personelBelgePdfIndirBtn');
        const pdfAdi = String(personelBelgeOnizlemeAdi || 'personel_belgesi.docx').replace(/\.docx$/i, '.pdf');
        if (buton) { buton.disabled = true; buton.textContent = 'PDF hazırlanıyor...'; }
        try {
            const pdfBlob = await personelBelgePdfOnizlemeAc(personelBelgeOnizlemeBlobu, pdfAdi, personelBelgeOnizlemeBasligi, { onizle:false });
            if (!pdfBlob) throw new Error('PDF dosyası oluşturulamadı.');
            fdCiktiDogrudanKaydet(pdfBlob, pdfAdi);
        } catch (error) {
            console.error('Belge PDF indirme:', error);
            alert('PDF indirilemedi: ' + (error.message || error));
        } finally {
            if (buton) { buton.disabled = false; buton.textContent = '⬇️ PDF İndir'; }
        }
    }

function personelBelgeYazdir() {
        if (window.fdYillikBelgeTopluModuAktifMi?.()) return yillikPersonelBelgeleriniTopluYazdir();
        if (!personelBelgeOnizlemeBlobu) return;
        document.body.classList.add('personel-word-yazdiriliyor');
        const temizle = () => document.body.classList.remove('personel-word-yazdiriliyor');
        window.addEventListener('afterprint', temizle, { once:true });
        window.print();
        setTimeout(temizle, 3000);
    }

function yillikPersonelBelgeAktifPersonelleri() {
        return personeller.filter(personel => {
            const cikis = String(personel?.cikisTarihi ?? '').trim().toLocaleLowerCase('tr-TR');
            return aktifSirketeAit(personel) && (!cikis || ['null','undefined','-','0000-00-00'].includes(cikis));
        }).sort((a,b) => String(a.sube || '').localeCompare(String(b.sube || ''), 'tr') || String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'));
    }

function yillikPersonelBelgeDurumunuAl(yil, olustur = false) {
        const anahtar = String(yil);
        const harita = { ...(uygulamaAyarlari.yillikPersonelBelgeleri || {}) };
        let durum = harita[anahtar];
        let yeni = false;
        if (!durum && olustur) {
            durum = {
                yil:Number(yil),
                baslangic:`01.01.${yil}`,
                bitis:`01.01.${Number(yil) + 1}`,
                hedefPersonelIds:yillikPersonelBelgeAktifPersonelleri().map(personel => String(personel.id)),
                tamamlananlar:{},
                olusturmaZamani:new Date().toISOString(),
                sonGuncelleme:new Date().toISOString()
            };
            harita[anahtar] = durum;
            uygulamaAyarlari = { ...uygulamaAyarlari, yillikPersonelBelgeleri:harita };
            yeni = true;
        }
        return { durum, yeni };
    }

async function yillikPersonelBelgeDurumunuKaydet() {
        const yerelHarita = { ...(uygulamaAyarlari.yillikPersonelBelgeleri || {}) };
        if (SUPABASE_MODE) {
            const { data:sirket, error:okumaHatasi } = await supabaseClient.from('companies').select('data').eq('id', aktifSirketId()).maybeSingle();
            if (okumaHatasi) throw okumaHatasi;
            const sunucuAyarlar = sirket?.data?.uygulamaAyarlari || {};
            const yeniAyarlar = {
                ...sunucuAyarlar,
                ...uygulamaAyarlari,
                yillikPersonelBelgeleri:{ ...(sunucuAyarlar.yillikPersonelBelgeleri || {}), ...yerelHarita }
            };
            const { error } = await supabaseClient.from('companies').update({ data:{ ...(sirket?.data || {}), uygulamaAyarlari:yeniAyarlar } }).eq('id', aktifSirketId());
            if (error) throw error;
            uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...yeniAyarlar };
        } else {
            localStorage.setItem(`fdYazilimYillikPersonelBelgeleri:${aktifSirketId()}`, JSON.stringify(yerelHarita));
        }
    }

function yillikPersonelBelgeHedefleri(durum) {
        const aktifHarita = new Map(yillikPersonelBelgeAktifPersonelleri().map(personel => [String(personel.id), personel]));
        return (durum?.hedefPersonelIds || []).map(id => aktifHarita.get(String(id))).filter(Boolean);
    }

function yillikPersonelBelgeBekleyenSayisi(durum) {
        const belgeTurleri = ['fazlaMesaiOnayi','vardiyaliCalismaOnayi'];
        return yillikPersonelBelgeHedefleri(durum).reduce((toplam, personel) => {
            const tamamlanan = Array.isArray(durum?.tamamlananlar?.[String(personel.id)]) ? durum.tamamlananlar[String(personel.id)] : [];
            return toplam + belgeTurleri.filter(tur => !tamamlanan.includes(tur)).length;
        }, 0);
    }

function yillikPersonelBelgeButonunuGuncelle() {
        const buton=document.getElementById('btnYillikPersonelBelgeleri');if(!buton)return;
        buton.style.display=isManagerUser()?'inline-flex':'none';
    }

async function yillikPersonelBelgeHatirlatmaHtml(bugun) {
        const yil = Number(String(bugun || '').slice(0,4));
        if (!isManagerUser() || yil < YILLIK_PERSONEL_BELGE_ILK_YILI) return '';
        const sonuc = yillikPersonelBelgeDurumunuAl(yil, true);
        if (sonuc.yeni) await yillikPersonelBelgeDurumunuKaydet();
        const hedefSayisi = yillikPersonelBelgeHedefleri(sonuc.durum).length;
        const bekleyen = yillikPersonelBelgeBekleyenSayisi(sonuc.durum);
        if (!hedefSayisi || !bekleyen) return '';
        return `<section style="border:1px solid #d8b4fe;border-radius:12px;overflow:hidden;margin-bottom:12px;background:#faf5ff;">
            <div style="padding:11px 13px;font-weight:850;color:#7e22ce;">📄 ${yil} Yılı Personel Onay Belgeleri</div>
            <div style="padding:0 13px 12px;color:#581c87;line-height:1.5;">${hedefSayisi} aktif çalışan için ${bekleyen} belge henüz toplu yazdırılmadı. Tarih aralığı: <strong>01.01.${yil} - 01.01.${yil + 1}</strong>.</div>
            <div style="padding:0 13px 13px;"><button type="button" class="btn-modern" style="background:#7e22ce;color:#fff;border-color:#7e22ce;" onclick="gunlukHatirlatmalariKapat();yillikPersonelBelgePaneliniAc(${yil})">Şube ve Belge Seç →</button></div>
        </section>`;
    }

function getPuantajCellClass(val) {
        if (val === '-') return 'p-cell p-eksi';
        if (val === 'Y') return 'p-cell p-y';
        if (val === 'Z') return 'p-cell p-z';
        if (val === 'M') return 'p-cell p-m';
        if (val === 'R') return 'p-cell p-r';
        if (val === 'Ü') return 'p-cell p-u';
        if (val === 'HS') return 'p-cell p-hs';
        if (val === 'RT') return 'p-cell p-rt';
        if (val === 'YT') return 'p-cell p-yt';
        if (val === 'RC') return 'p-cell p-rc';
        if (val === 'PZ') return 'p-cell p-pz';
        return 'p-cell p-x';
    }

function puantajAyAnahtari(ay, yil) {
        return `${yil}-${String(Number(ay) + 1).padStart(2, '0')}`;
    }

function maasOzetKaydiBul(pId, ay, yil) {
        const tarih = `${puantajAyAnahtari(ay, yil)}-00`;
        return puantajVerileri.find(item => item.kayitTipi === 'maasOzet' && String(item.pId) === String(pId) && String(item.tarih) === tarih && String(item.sirketId || '') === aktifSirketId());
    }

function personelGunlukUcretiniGetir(personel) {
        const alanlar = ['ucret', 'gunlukUcret', 'gunlukYevmiye', 'ucretTutari', 'maas', 'maasTutari'];
        for (const alan of alanlar) {
            const ham = personel?.[alan];
            if (ham === undefined || ham === null || String(ham).trim() === '') continue;
            const tutar = paraMetniniSayiyaCevir(ham);
            if (Number.isFinite(tutar)) return tutar;
        }
        const uygunAlan = Object.entries(personel || {}).find(([anahtar, deger]) => {
            const temiz = String(anahtar).toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
            return ['ucret', 'ucrettutari', 'gunlukucret', 'gunlukyevmiye', 'maas', 'maastutari'].includes(temiz) && String(deger ?? '').trim() !== '';
        });
        if (uygunAlan) return paraMetniniSayiyaCevir(uygunAlan[1]);
        return 0;
    }

function personelAylikAvansKesintisi(pId, ay, yil) {
        const hedefAy = puantajAyAnahtari(ay, yil);
        return avanslar.filter(a => String(a.pId) === String(pId) && avansAktifSirketinMi(a) && String(a.durum || '') !== 'Tamamlandı')
            .reduce((toplam, avans) => toplam + Number(avansAylikKesinti(avans, hedefAy)?.kesinti || 0), 0);
    }

function aktifIcraBul(pId) {
        return icralar.find(i => aktifSirketeAit(i) && String(i.pId) === String(pId) && String(i.durum) === 'Aktif' && icraKalanBorc(i) > 0);
    }

function personelIcraKayitlari(pId) {
        return icralar.filter(i => aktifSirketeAit(i) && String(i.pId) === String(pId));
    }

function personelAylikIcraKesintisi(pId, ay, yil) {
        const hedefAy = puantajAyAnahtari(ay, yil);
        return personelIcraKayitlari(pId).reduce((toplam, icra) => {
            const aylikToplam = (Array.isArray(icra.kesintiler) ? icra.kesintiler : [])
                .filter(kesinti => String(kesinti.ay || '').slice(0, 7) === hedefAy)
                .reduce((araToplam, kesinti) => araToplam + Number(kesinti.tutar || 0), 0);
            return toplam + aylikToplam;
        }, 0);
    }

async function maasOzetAlaniniKaydet(pId, alan, input) {
        if (isPersonelUser()) return;
        const ay = Number(document.getElementById('puanAySec').value);
        const yil = Number(document.getElementById('puanYilSec').value);
        const mevcut = maasOzetKaydiBul(pId, ay, yil);
        const sayi = Math.max(0, paraMetniniSayiyaCevir(input.value));
        const yeni = {
            ...(mevcut || {}), pId: String(pId), tarih: `${puantajAyAnahtari(ay, yil)}-00`, durum: 'MAAS_OZET', kayitTipi: 'maasOzet', sirketId: aktifSirketId(),
            [alan]: sayi, [`${alan}Manuel`]: 'true'
        };
        if (mevcut) puantajVerileri[puantajVerileri.indexOf(mevcut)] = yeni;
        else puantajVerileri.push(yeni);
        if (alan === 'icraKesintisi') await puantajIcraKesintisiniGuncelle(pId, ay, yil, sayi);
        await verileriKaydet();
        renderPuantajMatrisi();
    }

async function puantajIcraKesintisiniGuncelle(pId, ay, yil, tutar, kaynakTuru = 'puantaj') {
        const ayAnahtari = puantajAyAnahtari(ay, yil);
        const kaynak = `puantaj_${pId}_${ayAnahtari}`;
        const personelIcralari=icralar.filter(i => String(i.pId) === String(pId) && aktifSirketeAit(i));let kaynakVardi=false;
        personelIcralari.forEach(icra => {
            const oncekiKesintiler = Array.isArray(icra.kesintiler) ? icra.kesintiler : [];
            if(oncekiKesintiler.some(k => String(k.id) === kaynak))kaynakVardi=true;
            icra.kesintiler = oncekiKesintiler.filter(k => String(k.id) !== kaynak);
        });
        if(kaynakVardi){
            const aciklar=personelIcralari.filter(icra=>icraKalanBorc(icra)>0).sort((a,b)=>Number(a.siraTarihi||0)-Number(b.siraTarihi||0));
            personelIcralari.filter(icra=>icraKalanBorc(icra)<=0).forEach(icra=>icra.durum='Kapandı');
            aciklar.forEach((icra,index)=>icra.durum=index===0?'Aktif':'Bekleyen Sıra');
        }
        let kalanTutar=Math.max(0,Number(tutar)||0),islenenTutar=0,guvenlik=0;
        if (tutar > 0) {
            icraSiradakiniAktifEt(pId);
            while(kalanTutar>0.009&&guvenlik++<100){
                const icra = aktifIcraBul(pId);if(!icra)break;
                if(!Array.isArray(icra.kesintiler))icra.kesintiler=[];
                const pay=Math.min(kalanTutar,icraKalanBorc(icra));if(pay<=0)break;
                icra.kesintiler.push({ id: kaynak, ay: ayAnahtari, tutar: Number(pay.toFixed(2)), kaynak: kaynakTuru });
                islenenTutar+=pay;kalanTutar-=pay;
                if (icraKalanBorc(icra) <= 0) {
                    icra.durum = 'Kapandı';
                    icraSiradakiniAktifEt(pId);
                }
            }
        }
        yuklenenVeriler.add('icralar');
        return{islenenTutar:Number(islenenTutar.toFixed(2)),artanTutar:Number(Math.max(0,kalanTutar).toFixed(2))};
    }

function maasSatiriniOnizle(input) {
        const satir = input.closest('tr');
        if (!satir) return;
        const gunluk = Number(satir.dataset.gunluk || 0);
        const ucretGunu = Number(satir.dataset.ucretGunu || 0);
        const avans = Number(satir.dataset.avans || 0);
        const deger = alan => paraMetniniSayiyaCevir(satir.querySelector(`[data-maas-alan="${alan}"]`)?.value || 0);
        const fazla = deger('fazlaMesaiSaati'), pazar = deger('pazarMesaiSaati'), resmi = deger('resmiTatilMesaiSaati');
        const prim = deger('primTutari'), icra = deger('icraKesintisi'), bes = deger('besKesintisi');
        const temel = ucretGunu * gunluk;
        const saatlikMesai = gunluk / ayarSayisi('gunlukCalismaSaati', 7.5) * ayarSayisi('mesaiKatsayisi', 1.5);
        const yaz = (alan, tutar) => { const hedef = satir.querySelector(`[data-maas-sonuc="${alan}"]`); if (hedef) hedef.textContent = paraFormatla(tutar); };
        yaz('toplamUcret', temel); yaz('fazlaMesaiUcreti', saatlikMesai * fazla); yaz('pazarMesaiUcreti', saatlikMesai * pazar); yaz('resmiTatilMesaiUcreti', saatlikMesai * resmi);
        yaz('toplamMaas', temel + saatlikMesai * (fazla + pazar + resmi) + prim - avans - icra - bes);
    }

function fdFabrikaSubeDegeri(select){
        if(!select)return '';
        const secenek=[...select.options].find(option=>String((option.value||'')+' '+(option.textContent||'')).toLocaleLowerCase('tr-TR').replace(/ı/g,'i').includes('fabrika'));
        return secenek?.value||'';
    }

function puantajSubeFiltresiniDoldur() {
        const select = document.getElementById('puanSubeFiltre');
        if (!select) return;
        const selected = select.value;
        const subeAdlari = [...new Set(personeller.filter(aktifSirketeAit).map(item => item.sube).filter(Boolean))]
            .sort((a, b) => String(a).localeCompare(String(b), 'tr'));
        select.innerHTML = '<option value="">Tüm Şubeler</option>' + subeAdlari.map(sube => `<option value="${sirketText(sube)}">${sirketText(sube)}</option>`).join('');
        if (subeAdlari.includes(selected)) select.value = selected;
        if(select.dataset.fabrikaVarsayilan==='1'||!select.dataset.varsayilanSubeHazirlandi){const fabrika=fdFabrikaSubeDegeri(select);if(fabrika)select.value=fabrika;select.dataset.varsayilanSubeHazirlandi='1';delete select.dataset.fabrikaVarsayilan;}
    }

function puantajGunleriniGosterGizle(){return window.fdPuantajCagir('puantajGunleriniGosterGizle',Array.from(arguments),this)}

function puantajMobilEtiketleriniUygula() {
        const tablo = document.getElementById('puantajTablosu');
        if (!tablo) return;
        if (!window.matchMedia('(max-width:760px)').matches) return;
        const ay = Number(document.getElementById('puanAySec')?.value || 0);
        const yil = Number(document.getElementById('puanYilSec')?.value || new Date().getFullYear());
        const etiketler = [...tablo.querySelectorAll('thead th')].map((baslik, index) => {
            let metin = String(baslik.innerText || baslik.textContent || '').replace(/\s+/g, ' ').trim();
            if (baslik.classList.contains('p-gun-baslik')) {
                const gun = Number(metin || String(index - 1));
                const tarih = new Date(yil, ay, gun, 12, 0, 0);
                const gunAdiHam = tarih.toLocaleDateString('tr-TR', { weekday:'long' });
                const gunAdi = gunAdiHam.charAt(0).toLocaleUpperCase('tr-TR') + gunAdiHam.slice(1);
                metin = `${String(gun).padStart(2, '0')}.${String(ay + 1).padStart(2, '0')}.${yil} · ${gunAdi}`;
            }
            return metin || (index === 0 ? 'Sıra' : 'Bilgi');
        });
        tablo.querySelectorAll('tbody tr').forEach(satir => [...satir.cells].forEach((hucre, index) => {
            hucre.dataset.label = etiketler[index] || 'Bilgi';
        }));
    }

function fdPuantajHesapOnbelleginiBaslat() {
        const onceki = {
            hesap:fdPuantajHizliHesapCache, gunTuru:fdPuantajHizliGunTuruCache, prim:fdPuantajPrimCalisilmayanCache,
            izin:fdPuantajIzinlerByPersonelCache, manuel:fdPuantajManuelByGunCache, tur:fdMagicpassKayitTurCache,
            personelId:fdMagicpassPersonelIdCache, cihaz:fdMagicpassPersonelCihazCache,
            hareket:fdMagicpassHareketlerByPersonelCache, haftalik:fdMagicpassHaftalikVardiyaCache
        };
        fdPuantajHizliHesapCache = new Map();
        fdPuantajHizliGunTuruCache = new Map();
        fdPuantajPrimCalisilmayanCache = new Map();
        fdPuantajIzinlerByPersonelCache = new Map();
        fdPuantajManuelByGunCache = new Map();
        fdMagicpassKayitTurCache = new Map();
        fdMagicpassPersonelIdCache = new Map();
        fdMagicpassPersonelCihazCache = new Map();
        fdMagicpassHareketlerByPersonelCache = new Map();
        fdMagicpassHaftalikVardiyaCache = new Map();
        personeller.filter(aktifSirketeAit).forEach(personel => {
            const personelId = String(personel.id || '');
            if (personelId && !fdMagicpassPersonelIdCache.has(personelId)) fdMagicpassPersonelIdCache.set(personelId, personel);
            const cihazNo = String(personel.cihazPersonelNo || '').trim();
            if (cihazNo && !fdMagicpassPersonelCihazCache.has(cihazNo)) fdMagicpassPersonelCihazCache.set(cihazNo, personel);
        });
        vardiyaKayitlari.forEach(kayit => {
            if (!aktifSirketeAit(kayit)) return;
            const tur = String(kayit.kayitTipi || '');
            if (tur) {
                if (!fdMagicpassKayitTurCache.has(tur)) fdMagicpassKayitTurCache.set(tur, []);
                fdMagicpassKayitTurCache.get(tur).push(kayit);
            } else if (kayit.haftaBaslangic) {
                const sube = String(kayit.sube || '').trim().toLocaleLowerCase('tr-TR');
                const anahtar = `${String(kayit.haftaBaslangic)}|${sube}`;
                const onceki = fdMagicpassHaftalikVardiyaCache.get(anahtar);
                if (!onceki || Number(kayit.guncellemeZamani || kayit.zaman || 0) >= Number(onceki.guncellemeZamani || onceki.zaman || 0)) fdMagicpassHaftalikVardiyaCache.set(anahtar, kayit);
            }
        });
        izinler.forEach(izin => {
            if (!aktifSirketeAit(izin)) return;
            const personelId = String(izin.pId || '');
            if (!fdPuantajIzinlerByPersonelCache.has(personelId)) fdPuantajIzinlerByPersonelCache.set(personelId, []);
            fdPuantajIzinlerByPersonelCache.get(personelId).push(izin);
        });
        puantajVerileri.forEach(kayit => {
            if (!aktifSirketeAit(kayit) || kayit.kayitTipi) return;
            const anahtar = `${String(kayit.pId || '')}|${String(kayit.tarih || '')}`;
            if (!fdPuantajManuelByGunCache.has(anahtar)) fdPuantajManuelByGunCache.set(anahtar, kayit);
        });
        (fdMagicpassKayitTurCache.get('magicpassHareket') || []).forEach(hareket => {
            const personel = magicpassPersonelBul(hareket);
            const personelId = String(personel?.id || '');
            if (!personelId) return;
            if (!fdMagicpassHareketlerByPersonelCache.has(personelId)) fdMagicpassHareketlerByPersonelCache.set(personelId, []);
            fdMagicpassHareketlerByPersonelCache.get(personelId).push(hareket);
        });
        return onceki;
    }

function fdPuantajHesapOnbelleginiGeriYukle(onceki = {}) {
        fdPuantajHizliHesapCache = onceki.hesap || null;
        fdPuantajHizliGunTuruCache = onceki.gunTuru || null;
        fdPuantajPrimCalisilmayanCache = onceki.prim || null;
        fdPuantajIzinlerByPersonelCache = onceki.izin || null;
        fdPuantajManuelByGunCache = onceki.manuel || null;
        fdMagicpassKayitTurCache = onceki.tur || null;
        fdMagicpassPersonelIdCache = onceki.personelId || null;
        fdMagicpassPersonelCihazCache = onceki.cihaz || null;
        fdMagicpassHareketlerByPersonelCache = onceki.hareket || null;
        fdMagicpassHaftalikVardiyaCache = onceki.haftalik || null;
    }

function openContextMenu(event,inputEl,pId,dateKey){event.preventDefault();return window.fdPuantajCagir('openContextMenu',[{preventDefault(){},pageX:event.pageX,pageY:event.pageY},inputEl,pId,dateKey],this)}

function selectContextMenuValue(){return window.fdPuantajCagir('selectContextMenuValue',Array.from(arguments),this)}

function puantajHucreDegisti(){return window.fdPuantajCagir('puantajHucreDegisti',Array.from(arguments),this)}

function kaydetVeyaGuncellePuantaj(){return window.fdPuantajCagir('kaydetVeyaGuncellePuantaj',Array.from(arguments),this)}

function manuelPuantajKayitlariniTemizle(){return window.fdPuantajCagir('manuelPuantajKayitlariniTemizle',Array.from(arguments),this)}

function puantajTablosunuExcelIcinHazirla() {
        const clone = document.getElementById('puantajTablosu').cloneNode(true);
        clone.querySelectorAll('input').forEach(input => {
            const cell = input.closest('td');
            if (cell) cell.textContent = input.value;
        });
        return clone;
    }

function mesaiExcelDosyasiSec() {
        document.getElementById('mesaiExcelDosyasi').click();
    }

function mesaiSaatiniYukariYarimaYuvarla(saat) {
        const adim = ayarSayisi('mesaiYuvarlamaAdimi', 0.5);
        return Math.ceil(Math.max(0, Number(saat) || 0) / adim) * adim;
    }

function mesaiExcelDosyasiniOku(event) { return window.fdMesaiAktarCagir.call(this,event); }

async function puantajCanvasOlustur(table,scale=2,baslik=''){return fdTabloGoruntuCagir.call(this,'canvas',[table,scale,baslik])}

async function puantajGoruntusuAlVePaylas(){return fdTabloGoruntuCagir.call(this,'image',[])}

function puantajYilSecenekleriniGuncelle() {
        const secim = document.getElementById('puanYilSec');
        if (!secim) return;
        const mevcutSecim = secim.value;
        const buYil = new Date().getFullYear();
        for (let yil = buYil - 5; yil <= buYil + 5; yil++) {
            if (![...secim.options].some(option => option.value === String(yil))) {
                const option = document.createElement('option');
                option.value = String(yil); option.textContent = String(yil);
                secim.appendChild(option);
            }
        }
        if (!secim.dataset.yilHazirlandi) {
            secim.value = String(buYil);
            secim.dataset.yilHazirlandi = 'true';
        } else if (mevcutSecim) {
            secim.value = mevcutSecim;
        }
    }

function switchPersonelTab(...args){return FDModules.callIfLoaded('personelliste','switchPersonelTab',args,this)}

function switchDetayTab(...args){return FDModules.callIfLoaded('personeldetay','switchDetayTab',args,this)}

function personelFotografAdresi(personel) {
        const dosyaId = String(personel?.fotografDosya?.id || '').trim();
        return dosyaId ? `https:\x2f\x2fdrive.google.com/thumbnail?id=${encodeURIComponent(dosyaId)}&sz=w800` : String(personel?.fotografUrl || '').trim();
    }

function personelFotografSeciminiGoster(input){return fdPersonelFormCagir('personelFotografSeciminiGoster',[input],this)}

function openPersonelModal(){return fdPersonelFormAc('new',null,this)}

function closePersonelModal(){fdPersonelFormIstek?.cancel();return fdPersonelFormCagir('closePersonelModal',[],this)}

function openPersonelDetayModal(id){return FDModules.callIfLoaded('personeldetay','openPersonelDetayModal',[id],this)}

function closePersonelDetayModal(...args){return FDModules.callIfLoaded('personeldetay','closePersonelDetayModal',args,this)}

async function personelKullaniciHesabiOlustur(personel) {
        const tcNo = String(personel?.id || '');
        const exists = kullanicilar.some(user => String(user.username) === tcNo || String(user.tcNo) === tcNo);
        if (exists) return false;
        if (SUPABASE_MODE) {
            await supabaseKullaniciOlustur({
                username: tcNo, password: tcNo.slice(0, 6), rol: 'Personel', tcNo, ad: personel.ad
            });
        }
        const yeniKullanici = { username: tcNo, rol: 'Personel', tcNo, sirketId: aktifSirketId() };
        if (!SUPABASE_MODE) yeniKullanici.password = tcNo.slice(0, 6);
        kullanicilar.push(yeniKullanici);
        yuklenenVeriler.add('kullanicilar');
        return true;
    }

function cikisUyariyiGoster(uyarilar){
 if(!activeUser||!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel')||!Array.isArray(uyarilar))return Promise.resolve(false);
 if(fdCikisUyariIstek)return Promise.resolve(false);
 const id=String(document.getElementById('pEditOriginalId')?.value||''),tc=String(document.getElementById('pTcNo')?.value||'').trim(),date=String(document.getElementById('pCikisTarihi')?.value||'');
 if(!id||!date||!personeller.some(p=>String(p.id)===id&&aktifSirketeAit(p))||document.getElementById('modalPersonel')?.style.display!=='flex')return Promise.resolve(false);
 const session=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]);let resolveResult;const result=new Promise(resolve=>resolveResult=resolve);
 const request={uyarilar,settled:false,cancelled:false,current(){return fdCikisUyariIstek===request&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&session===JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])&&String(document.getElementById('pEditOriginalId')?.value||'')===id&&String(document.getElementById('pTcNo')?.value||'').trim()===tc&&String(document.getElementById('pCikisTarihi')?.value||'')===date&&document.getElementById('modalPersonel')?.style.display==='flex'&&personeller.some(p=>String(p.id)===id&&aktifSirketeAit(p))},complete(value){if(request.settled)return;const approved=value===true&&!request.cancelled&&request.current();request.settled=true;request.uyarilar=[];if(fdCikisUyariIstek===request)fdCikisUyariIstek=null;resolveResult(approved)},cancel(){request.cancelled=true;request.complete(false)}};
 fdCikisUyariIstek=request;FDModules.embedded('cikisuyari',[request],this).then(shown=>{if(shown!==true)request.cancel()},()=>request.cancel());return result;
}

function cikisUyariyiKapat(onaylandi){const request=fdCikisUyariIstek;if(!request)return;if(!onaylandi)request.cancel();if(window.FDModules?.status('cikisuyari').loaded)return FDModules.callIfLoaded('cikisuyari','cikisUyariyiKapat',[Boolean(onaylandi),request],this);request.cancel();}

function cikisIcinKalanAvansTutariniBul(avans, cikisTarihi) {
        const durum = String(avans.durum || 'Aktif').toLocaleLowerCase('tr-TR');
        if (durum === 'kapandı' || durum === 'kapandi') return 0;
        const baslangic = String(avans.baslangicAy || '').slice(0, 7);
        const cikisAy = String(cikisTarihi || '').slice(0, 7);
        if (!baslangic || !cikisAy) return Number(avans.tutar || 0);
        const [basYil, basAy] = baslangic.split('-').map(Number);
        const [cikisYil, cikisAyNo] = cikisAy.split('-').map(Number);
        const gecenAy = (cikisYil - basYil) * 12 + (cikisAyNo - basAy);
        const taksit = Math.max(1, Number(avans.taksitSayisi || 1));
        if (gecenAy >= taksit) return 0;
        const tamamlananTaksit = Math.max(0, gecenAy);
        return Math.max(0, Number(avans.tutar || 0) * (taksit - tamamlananTaksit) / taksit);
    }

function personelExcelDosyasiSec() {
        if (!isManagerUser()) {
            alert('Toplu personel aktarımını yalnızca Admin veya Yönetici yapabilir.');
            return;
        }
        const input = document.getElementById('personelTopluExcelInput');
        input.value = '';
        input.click();
    }

function personelExcelBasliginiNormallestir(deger) {
        return String(deger || '').trim().toLocaleLowerCase('tr-TR')
            .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
            .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
            .replace(/[^a-z0-9]/g, '');
    }

function personelKayitHatirlatmasiniGoster(tcNo,hesapOlustu){
 if(!activeUser||!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))return Promise.resolve(false);
 const tc=String(tcNo||'');if(!tc||!personeller.some(p=>String(p.id)===tc&&aktifSirketeAit(p)))return Promise.resolve(false);
 if(fdKayitHatirlatmaIstek?.current()&&fdKayitHatirlatmaIstek.tc===tc&&fdKayitHatirlatmaIstek.account===Boolean(hesapOlustu))return fdKayitHatirlatmaIstek.promise;
 fdKayitHatirlatmaIstek?.cancel();const session=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]);
 const request={tc,account:Boolean(hesapOlustu),cancelled:false,errorButton:null,errorClose:null,current(){return fdKayitHatirlatmaIstek===request&&!request.cancelled&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&session===JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])&&personeller.some(p=>String(p.id)===request.tc&&aktifSirketeAit(p))},clearError(){if(request.errorButton&&request.errorClose)request.errorButton.removeEventListener('click',request.errorClose);request.errorButton=null;request.errorClose=null},cancel(){request.cancelled=true;request.tc='';request.account=false;request.clearError();if(fdKayitHatirlatmaIstek===request)fdKayitHatirlatmaIstek=null}};
 fdKayitHatirlatmaIstek=request;request.promise=FDModules.embedded('kayithatirlatma',[request],this).then(shown=>{if(!request.current()){request.cancel();return false}if(shown!==true){if(shown!==false){request.cancel();return false}const panel=document.getElementById('fdModuleLoadError');request.errorButton=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent==='Kapat')||null;request.errorClose=()=>request.cancel();request.errorButton?.addEventListener('click',request.errorClose,{once:true});}return shown===true},()=>{request.cancel();return false});return request.promise;
}

function personelKayitHatirlatmasiniKapat(){fdKayitHatirlatmaIstek?.cancel();if(window.FDModules?.status('kayithatirlatma').loaded)return FDModules.callIfLoaded('kayithatirlatma','personelKayitHatirlatmasiniKapat',[],this)}

async function personelSil(id) {
        if (!isManagerUser()) {
            alert("⚠️ Yetkisiz İşlem: Personel kayıtlarını yalnızca Admin veya Yönetici silebilir!");
            return;
        }

        if (await fdYuzerOnaySor("Bu personel kaydını kalıcı olarak silmek istediğinize emin misiniz?")) {
            personeller = personeller.filter(p => String(p.id) !== String(id));
            await verileriKaydet();
            initUI();
        }
    }

function getSubeBadgeStyle(subeStr) {
        if (!subeStr) return 'background-color: #64748b; color: #ffffff;';
        
        const s = subeStr.toLowerCase().trim();
        if (s.includes('fabrika')) return 'background-color: #8b5cf6; color: #ffffff;';
        if (s.includes('nakliye')) return 'background-color: #0284c7; color: #ffffff;';
        if (s.includes('merkez')) return 'background-color: #0f172a; color: #ffffff;';
        if (s.includes('şantiye') || s.includes('santiye')) return 'background-color: #d97706; color: #ffffff;';
        if (s.includes('atık') || s.includes('atik')) return 'background-color: #059669; color: #ffffff;';

        let hash = 0;
        for (let i = 0; i < subeStr.length; i++) {
            hash = subeStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            '#e11d48', '#4f46e5', '#0891b2', '#ca8a04', '#7c3aed', 
            '#db2777', '#16a34a', '#c2410c', '#0d9488', '#475569'
        ];
        let color = colors[Math.abs(hash) % colors.length];
        return `background-color: ${color}; color: #ffffff;`;
    }

function filtreDropdownlariDoldur() {
        const aktifSubeSel = document.getElementById('fAktifSube');
        const ayrilanSubeSel = document.getElementById('fAyrilanSube');
        const aktifYilSel = document.getElementById('fAktifYil');
        const ayrilanYilSel = document.getElementById('fAyrilanCikisYili');
        const bakiyeSubeSel = document.getElementById('fBakiyeSube');
        const bakiyeDonemSel = document.getElementById('fBakiyeDonem');

        const subeler = [...new Set(personeller.map(p => p.sube).filter(Boolean))];
        const yillar = [...new Set(personeller.map(p => p.girisTarihi ? p.girisTarihi.split('-')[0] : null).filter(Boolean))].sort().reverse();
        const cikisYillari = [...new Set(personeller.map(p => p.cikisTarihi && p.cikisTarihi !== "null" ? p.cikisTarihi.split('-')[0] : null).filter(Boolean))].sort().reverse();

        let tumDonemler = new Set();
        personeller.filter(p => {
                const cikis = String(p.cikisTarihi ?? '').trim().toLocaleLowerCase('tr-TR');
                const aktif = !cikis || ['null','undefined','-','0000-00-00'].includes(cikis);
                return aktifSirketeAit(p) && aktif && (!isPersonelUser() || String(p.id) === String(activeUser.tcNo));
            }).forEach(p => {
            personelDonemleriniGetir(p).forEach(d => {
                const kullanilan = izinler.filter(i => String(i.pId) === String(p.id) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((toplam, izin) => toplam + Number(izin.gun || 0), 0);
                if (Number(d.hak || 0) - kullanilan > 0) tumDonemler.add(d.donem);
            });
        });
        const donemlerDizisi = [...tumDonemler].sort().reverse();

        let sOpt = '<option value="">Tüm Şubeler</option>';
        subeler.forEach(s => sOpt += `<option value="${escapeDashboardText(s)}">${escapeDashboardText(s)}</option>`);
        if (aktifSubeSel) aktifSubeSel.innerHTML = sOpt;
        if (ayrilanSubeSel) ayrilanSubeSel.innerHTML = sOpt;
        if (bakiyeSubeSel) bakiyeSubeSel.innerHTML = sOpt;

        let yOpt = '<option value="">Tüm Giriş Yılları</option>';
        yillar.forEach(y => yOpt += `<option value="${escapeDashboardText(y)}">${escapeDashboardText(y)}</option>`);
        if (aktifYilSel) aktifYilSel.innerHTML = yOpt;

        let cOpt = '<option value="">Tüm Ayrılış Yılları</option>';
        cikisYillari.forEach(y => cOpt += `<option value="${escapeDashboardText(y)}">${escapeDashboardText(y)}</option>`);
        if (ayrilanYilSel) ayrilanYilSel.innerHTML = cOpt;

        let dOpt = '<option value="">Tüm Hakediş Dönemleri</option>';
        donemlerDizisi.forEach(d => dOpt += `<option value="${escapeDashboardText(d)}">${escapeDashboardText(d)}</option>`);
        if (bakiyeDonemSel) bakiyeDonemSel.innerHTML = dOpt;
    }

function renderPersonelOzetleri(...args){return FDModules.callIfLoaded('personelliste','renderPersonelOzetleri',args,this)}

function personelEvetMi(deger) {
        return deger === true || String(deger || '').trim().toLocaleLowerCase('tr-TR') === 'evet';
    }

function personelDurumFiltresineUyar(personel, alan, filtre) {
        if (!filtre) return true;
        return personelEvetMi(personel?.[alan]) === (filtre === 'evet');
    }

function filtrelenmisAktifPersonelleriGetir() {
        const arama = String(document.getElementById('fAktifArama')?.value || '').trim().toLocaleLowerCase('tr-TR');
        const sube = document.getElementById('fAktifSube')?.value || '';
        const yil = document.getElementById('fAktifYil')?.value || '';
        const engelli = document.getElementById('fAktifEngelli')?.value || '';
        const emekli = document.getElementById('fAktifEmekli')?.value || '';
        const siralama = document.getElementById('fAktifSiralama')?.value || 'sube-asc';

        const liste = personeller.filter(personel => {
            if (!aktifSirketeAit(personel)) return false;
            if (personel.cikisTarihi && String(personel.cikisTarihi) !== 'null') return false;
            if (isPersonelUser() && String(personel.id) !== String(activeUser.tcNo)) return false;
            const ad = String(personel.ad || '').toLocaleLowerCase('tr-TR');
            if (arama && !ad.includes(arama) && !String(personel.id || '').includes(arama)) return false;
            if (sube && personel.sube !== sube) return false;
            if (yil && !String(personel.girisTarihi || '').startsWith(yil)) return false;
            if (!personelDurumFiltresineUyar(personel, 'engelli', engelli)) return false;
            if (!personelDurumFiltresineUyar(personel, 'emekli', emekli)) return false;
            return true;
        });

        liste.sort((x, y) => {
            if (siralama === 'ad-asc') return String(x.ad || '').localeCompare(String(y.ad || ''), 'tr');
            if (siralama === 'ad-desc') return String(y.ad || '').localeCompare(String(x.ad || ''), 'tr');
            if (siralama === 'sube-asc') return String(x.sube || 'Merkez').localeCompare(String(y.sube || 'Merkez'), 'tr') || String(x.ad || '').localeCompare(String(y.ad || ''), 'tr');
            if (siralama === 'tarih-yeni') return new Date(y.girisTarihi || 0) - new Date(x.girisTarihi || 0);
            if (siralama === 'tarih-eski') return new Date(x.girisTarihi || 0) - new Date(y.girisTarihi || 0);
            return 0;
        });
        return liste;
    }

function renderPersonelTables(...args){return FDModules.callIfLoaded('personelliste','renderPersonelTables',args,this)}

function personelExportSecimOzetiniGuncelle(...args){return FDModules.callIfLoaded('personelcikti','personelExportSecimOzetiniGuncelle',args,this)}

function personelExportAlanSecimiDegisti(...args){return FDModules.callIfLoaded('personelcikti','personelExportAlanSecimiDegisti',args,this)}

function personelExportAlanlariniDegistir(...args){return FDModules.callIfLoaded('personelcikti','personelExportAlanlariniDegistir',args,this)}

function openPersonelExportModal(type){return window.fdPersonelCiktiAc('select',type,this)}

function closePersonelExportModal(){return window.fdPersonelCiktiIptal(this)}

function exportSelectedPersonelFields(...args){return FDModules.callIfLoaded('personelcikti','exportSelectedPersonelFields',args,this)}

function exportPersonelToPDF(){return window.fdPersonelCiktiAc('pdf',null,this)}

function exportPersonelToExcel(){return window.fdPersonelCiktiAc('excel',null,this)}

function personelDuzenle(id){return fdPersonelFormAc('edit',id,this)}

function fdPersonelAramaPaneliOlustur(inputId,panelId,kaynakGetir,secimYap){
        const input=document.getElementById(inputId);if(!input||document.getElementById(panelId))return;input.removeAttribute('list');const grup=input.closest('.form-group')||input.parentElement;grup.style.position='relative';const panel=document.createElement('div');panel.id=panelId;panel.className='fd-personel-arama-paneli';grup.appendChild(panel);
        const yenile=()=>{const arama=String(input.value||'').trim().toLocaleLowerCase('tr-TR'),liste=kaynakGetir().filter(x=>!arama||String(x.etiket+' '+x.alt).toLocaleLowerCase('tr-TR').includes(arama));panel.innerHTML='';liste.forEach(x=>{const b=document.createElement('button'),guclu=document.createElement('strong'),kucuk=document.createElement('small');b.type='button';guclu.textContent=x.etiket;kucuk.textContent=x.alt||'';b.append(guclu,kucuk);b.onmousedown=e=>e.preventDefault();b.onclick=()=>{secimYap(x);panel.style.display='none';};panel.appendChild(b);});panel.style.display=liste.length?'block':'none';};
        input._fdPersonelListesiniAc=yenile;input.addEventListener('focus',yenile);input.addEventListener('click',yenile);input.addEventListener('input',yenile);input.addEventListener('keydown',e=>{if(e.key==='Escape')panel.style.display='none';});input.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==input&&!panel.matches(':hover'))panel.style.display='none';},160));
    }

function fdPersonelAramaPanelleriniKur(){
        fdPersonelAramaPaneliOlustur('izinPersonelSecimKutusu','izinPersonelAramaPaneli',()=>[...document.querySelectorAll('#izinPersonelSelect option')].slice(1).map(o=>({id:o.value,etiket:String(o.dataset.etiket||o.textContent).split(' · ')[0],alt:String(o.dataset.etiket||o.textContent).split(' · ').slice(1).join(' · '),tam:o.dataset.etiket||o.textContent})),x=>{document.getElementById('izinPersonelSecimKutusu').value=x.tam;document.getElementById('izinPersonelSelect').value=x.id;personelSecildi(x.id);});
        fdPersonelAramaPaneliOlustur('avansPersonelAra','avansPersonelAramaPaneli',()=>personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr')).map(p=>({id:String(p.id),etiket:p.ad||'İsimsiz Personel',alt:(p.sube||'Şube yok')+' · '+(p.gorev||'-'),tam:(p.ad||'')+' — '+(p.sube||'Şube yok')})),x=>{document.getElementById('avansPersonelAra').value=x.tam;document.getElementById('avansPersonelId').value=x.id;document.getElementById('avansSeciliPersonel').textContent='✓ Seçilen personel: '+x.etiket;});
    }

function magicpassSubeHafizaAnahtari(){return 'fd_magicpass_sube_v2_'+JSON.stringify([String(aktifSirketId()||''),String(activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||''),String(activeUser?.rol||'')]);}

function magicpassSubeFiltresiniHatirla(){const select=document.getElementById('magicpassSubeFiltre');if(!select)return;try{localStorage.setItem(magicpassSubeHafizaAnahtari(),select.value||'');}catch(_){}}

function magicpassGunTuruBul(personel,tarihKey){return magicpassKayitlari('magicpassGunTuru').filter(k=>String(k.pId)===String(personel?.id)&&String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0]?.gunTuru||'';}

async function magicpassSeciliGunlereGunTuruAta(gunTuru){
        const pId=String(document.getElementById('magicpassPersonel')?.value||''),tarihler=[...magicpassSeciliGunler];if(!pId)return alert('Önce personel seçin.');if(!tarihler.length)return alert('Aylık listeden en az bir gün seçin.');
        tarihler.forEach(tarih=>{vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassGunTuru'&&String(k.pId)===pId&&String(k.tarih)===tarih));if(gunTuru)vardiyaKayitlari.push({id:'mguntur_'+pId+'_'+tarih+'_'+Date.now(),kayitTipi:'magicpassGunTuru',sirketId:aktifSirketId(),pId,tarih,gunTuru,zaman:Date.now()});});
        try{yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassAylikCizelgeyiCiz();showToast(gunTuru?(tarihler.length+' gün '+(gunTuru==='pazar'?'Pazar / hafta tatili':'resmi tatil')+' olarak işaretlendi.'):(tarihler.length+' günün tatil işareti kaldırıldı.'));}catch(error){alert('Tatil günleri kaydedilemedi: '+(error.message||error));}
    }

function magicpassTatilArayuzuKur(){
        const tablo=document.getElementById('magicpassAylikTablo'),sar=tablo?.closest('.table-wrapper');if(!sar||document.getElementById('magicpassTatilToolbar'))return;const cubuk=document.createElement('div');cubuk.id='magicpassTatilToolbar';cubuk.className='magicpass-tatil-toolbar';cubuk.innerHTML='<strong>Seçilen günler:</strong><button type="button" class="btn-modern" style="background:#ea580c;color:#fff" onclick="magicpassSeciliGunlereGunTuruAta(\'pazar\')">Pazar / Hafta Tatili</button><button type="button" class="btn-modern" style="background:#dc2626;color:#fff" onclick="magicpassSeciliGunlereGunTuruAta(\'resmiTatil\')">Resmi Tatil</button><button type="button" class="btn-modern" style="background:#64748b;color:#fff" onclick="magicpassSeciliGunlereGunTuruAta(\'\')">Tatil İşaretini Kaldır</button><small style="color:#64748b">Önce tablodaki gün kutularını işaretleyin.</small>';sar.parentNode.insertBefore(cubuk,sar);
    }

function magicpassYarimGunResmiTatilMi(tarihKey){const tarih=String(tarihKey||'');return tarih.slice(5)==='10-28'||MAGICPASS_2026_DINI_AREFELER.has(tarih);}

function magicpassOtomatikResmiTatilMi(tarihKey){return sabitResmiTatiller.includes(String(tarihKey).slice(5))||MAGICPASS_2026_DINI_BAYRAMLAR.has(String(tarihKey));}

function magicpassGenelGunTuruKaydi(tarihKey){return magicpassKayitlari('magicpassGunTuruGenel').filter(k=>String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0]||null;}

function magicpassVardiyaTanimlariniDuzelt() {
        const eski = Array.isArray(uygulamaAyarlari.vardiyaTanimlari) ? uygulamaAyarlari.vardiyaTanimlari : [];
        const varsayilanlar = [
            { id:'gunduz', ad:uygulamaAyarlari.vardiyaGunduzBaslik || 'GÜNDÜZ', aciklama:'Gündüz vardiyası', baslangic:uygulamaAyarlari.magicpassGunduzBaslangic || '08:00', bitis:uygulamaAyarlari.magicpassGunduzBitis || '17:00', yemekBaslangic:'12:30', yemekBitis:'13:00', mesaiBaslangic:uygulamaAyarlari.magicpassGunduzBitis || '17:00', mesaiBitis:uygulamaAyarlari.magicpassGunduzMesaiSiniri || '20:00' },
            { id:'gece', ad:uygulamaAyarlari.vardiyaGeceBaslik || 'GECE', aciklama:'Gece vardiyası', baslangic:uygulamaAyarlari.magicpassGeceBaslangic || '23:00', bitis:uygulamaAyarlari.magicpassGeceBitis || '08:00', yemekBaslangic:'', yemekBitis:'', mesaiBaslangic:uygulamaAyarlari.magicpassGeceBitis || '08:00', mesaiBitis:uygulamaAyarlari.magicpassGeceMesaiSiniri || '12:00' }
        ];
        const kaynak = eski.length ? eski : varsayilanlar;
        const gorulen = new Set();
        const sonuc = kaynak.map((x,index) => {
            let id = String(x.id || ('vardiya_' + (index + 1))).trim().replace(/[^a-zA-Z0-9_-]/g,'_');
            while (gorulen.has(id)) id += '_' + (index + 1);
            gorulen.add(id);
            return {
                id,
                ad:String(x.ad || x.baslik || ('VARDİYA ' + (index + 1))).trim().toLocaleUpperCase('tr-TR'),
                aciklama:String(x.aciklama || '').trim(),
                baslangic:String(x.baslangic || '08:00'),
                bitis:String(x.bitis || '17:00'),
                yemekBaslangic:String(x.yemekBaslangic || ''),
                yemekBitis:String(x.yemekBitis || ''),
                mesaiBaslangic:String(x.mesaiBaslangic || x.bitis || ''),
                mesaiBitis:String(x.mesaiBitis || ''),
                tatil:Boolean(x.tatil),
                resmiTatil:Boolean(x.resmiTatil),
                girisCikisYasak:Boolean(x.girisCikisYasak)
            };
        });
        if (!sonuc.length) sonuc.push(...varsayilanlar);
        uygulamaAyarlari.vardiyaTanimlari = sonuc;
        return sonuc;
    }

function magicpassVardiyaTanimiBul(id) {
        const liste = magicpassVardiyaTanimlariniDuzelt();
        return liste.find(x => String(x.id) === String(id)) || liste[0];
    }

function magicpassVardiyaAdi(id) {
        if (id === 'izin' || !id) return 'Çalışma Yok';
        const tanim = magicpassVardiyaTanimlariniDuzelt().find(x => String(x.id) === String(id));
        return tanim ? tanim.ad : String(id);
    }

function magicpassVardiyaSaatEtiketi(id) {
        if (id === 'izin' || !id) return '-';
        const tanim = magicpassVardiyaTanimiBul(id);
        return tanim ? tanim.baslangic + '-' + tanim.bitis : '-';
    }

function vardiyaKayitTanimHaritasi(kayit) {
        kayit.vardiyaTanimlari=kayit.vardiyaTanimlari||{};
        const tanimlar=magicpassVardiyaTanimlariniDuzelt();
        ['gunduz','gece','ana','ek'].forEach(alan=>{
            if(kayit.vardiyaTanimlari[alan]&&tanimlar.some(x=>x.id===kayit.vardiyaTanimlari[alan]))return;
            const baslik=String(kayit.basliklar?.[alan]||'').toLocaleLowerCase('tr-TR');
            const es=tanimlar.find(x=>baslik.includes(String(x.ad).toLocaleLowerCase('tr-TR')));
            kayit.vardiyaTanimlari[alan]=es?.id || (alan==='gece'&&tanimlar.some(x=>x.id==='gece')?'gece':(tanimlar.some(x=>x.id==='gunduz')?'gunduz':tanimlar[0].id));
        });
        return kayit.vardiyaTanimlari;
    }

function magicpassResmiTatilAdi(tarihKey){
        const tarih=String(tarihKey),md=tarih.slice(5);
        const sabit={'01-01':'Yılbaşı','04-23':'Ulusal Egemenlik ve Çocuk Bayramı','05-01':'Emek ve Dayanışma Günü','05-19':'Atatürk’ü Anma, Gençlik ve Spor Bayramı','07-15':'Demokrasi ve Millî Birlik Günü','08-30':'Zafer Bayramı','10-28':'Cumhuriyet Bayramı Arefesi','10-29':'Cumhuriyet Bayramı'};
        const dini={'2026-03-19':'Ramazan Bayramı Arefesi','2026-03-20':'Ramazan Bayramı 1. Gün','2026-03-21':'Ramazan Bayramı 2. Gün','2026-03-22':'Ramazan Bayramı 3. Gün','2026-05-26':'Kurban Bayramı Arefesi','2026-05-27':'Kurban Bayramı 1. Gün','2026-05-28':'Kurban Bayramı 2. Gün','2026-05-29':'Kurban Bayramı 3. Gün','2026-05-30':'Kurban Bayramı 4. Gün'};
        const manuel=magicpassGenelGunTuruKaydi(tarih);return String(manuel?.tatilAdi||dini[tarih]||sabit[md]||'Resmî Tatil');
    }

function magicpassAralikDakikasi(bas,bit,aralikBas,aralikBit){
        if(!bas||!bit||!aralikBas||!aralikBit)return 0;
        return Math.max(0,Math.round((Math.min(bit,aralikBit)-Math.max(bas,aralikBas))/60000));
    }

function magicpassVardiyaMenuDoldur(){
        const menu=document.getElementById('magicpassVardiyaMenu');if(!menu)return;
        menu.innerHTML=magicpassVardiyaTanimlariniDuzelt().map(x=>`<button type="button" onclick="magicpassSeciliGunlereVardiyaAta('${escapeDashboardText(x.id)}')">🕒 ${escapeDashboardText(x.ad)} <small style="display:block;color:#64748b">${escapeDashboardText(x.baslangic+'–'+x.bitis)}</small></button>`).join('')+'<button type="button" onclick="magicpassSeciliGunlereVardiyaAta(&quot;izin&quot;)">🏖️ Çalışma yok / İzin</button><button type="button" onclick="magicpassSeciliGunlereVardiyaAta(&quot;&quot;)">🧹 Özel atamayı kaldır</button>';
    }

function magicpassYerelTarihSaatDegeri(zaman){
        if(!zaman)return '';const d=new Date(zaman);if(Number.isNaN(d.getTime()))return '';
        const iki=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+iki(d.getMonth()+1)+'-'+iki(d.getDate())+'T'+iki(d.getHours())+':'+iki(d.getMinutes());
    }

function magicpassDuzeltmeOturumu(){return{sirketId:String(aktifSirketId()),anahtar:typeof fdPortalVeriOturumu==='function'?fdPortalVeriOturumu():null};}

function magicpassDuzeltmeOturumuGecerli(oturum){return String(aktifSirketId())===oturum.sirketId&&(oturum.anahtar===null||typeof fdPortalVeriOturumuGecerli!=='function'||fdPortalVeriOturumuGecerli(oturum.anahtar));}

function magicpassDuzeltmeAlanId(tur,sira=0){return 'magicpassDuzeltme'+tur+(sira?'_'+sira:'');}

function magicpassDuzeltmeTarihSaatBirlestir(tur,sira=0){
        const id=magicpassDuzeltmeAlanId(tur,sira),tarih=document.getElementById(id+'Tarih')?.value||'',saat=document.getElementById(id+'Saat')?.value||'',hedef=document.getElementById(id);
        if(hedef)hedef.value=tarih&&saat?tarih+'T'+saat:'';
    }

function magicpassDuzeltmeZamanAlanlariniDoldur(tur,zaman,varsayilanTarih,sira=0){
        const id=magicpassDuzeltmeAlanId(tur,sira),yerel=magicpassYerelTarihSaatDegeri(zaman),parcalar=yerel?yerel.split('T'):[varsayilanTarih||'',''],tarih=document.getElementById(id+'Tarih'),saat=document.getElementById(id+'Saat');
        if(tarih)tarih.value=parcalar[0]||varsayilanTarih||'';if(saat)saat.value=(parcalar[1]||'').slice(0,5);magicpassDuzeltmeTarihSaatBirlestir(tur,sira);
    }

function magicpassDuzeltmeSaatKaydir(tur,dakika,sira=0){
        const id=magicpassDuzeltmeAlanId(tur,sira),tarih=document.getElementById(id+'Tarih'),saat=document.getElementById(id+'Saat');if(!tarih||!saat||magicpassDuzeltmeKayitIslemi)return;
        if(!tarih.value)tarih.value=document.getElementById('magicpassDuzeltmeTarih')?.value||magicpassTarihAnahtari(new Date());
        if(!saat.value)return showToast('Önce saati seçin.','warning');
        const deger=new Date(tarih.value+'T'+saat.value+':00');deger.setMinutes(deger.getMinutes()+Number(dakika||0));tarih.value=magicpassTarihAnahtari(deger);saat.value=String(deger.getHours()).padStart(2,'0')+':'+String(deger.getMinutes()).padStart(2,'0');magicpassDuzeltmeTarihSaatBirlestir(tur,sira);
    }

function magicpassDuzeltmeAraliklariniOku(dogrula=false){
        let oncekiSon=null;
        const araliklar=[...document.querySelectorAll('#magicpassDuzeltmeAraliklar .magicpass-duzeltme-aralik')].map((satir,sira)=>{
            const aralik={};for(const tur of ['Giris','Cikis']){
                magicpassDuzeltmeTarihSaatBirlestir(tur,sira);const id=magicpassDuzeltmeAlanId(tur,sira),tarih=document.getElementById(id+'Tarih')?.value||'',saat=document.getElementById(id+'Saat')?.value||'',metin=tarih&&saat?tarih+'T'+saat:'';
                if(dogrula&&saat&&!tarih)throw new Error((sira+1)+'. aralıkta '+(tur==='Giris'?'giriş':'çıkış')+' tarihini seçin.');
                const zaman=metin?new Date(metin+':00'):null;if(dogrula&&metin&&(Number.isNaN(zaman.getTime())||magicpassYerelTarihSaatDegeri(zaman)!==metin))throw new Error((sira+1)+'. aralıkta geçerli bir tarih ve saat seçin.');
                aralik[tur==='Giris'?'giris':'cikis']=zaman;aralik[tur==='Giris'?'girisTarih':'cikisTarih']=tarih;
            }
            const {giris,cikis}=aralik;if(dogrula){
                if(!giris&&!cikis)throw new Error((sira+1)+'. aralıkta en az giriş veya çıkış saatini yazın; kullanılmayan aralığı kaldırın.');
                if(giris&&cikis&&cikis<=giris)throw new Error((sira+1)+'. aralıkta çıkış, girişten sonra olmalıdır. Gece çalışmasında çıkış tarihini kontrol edin.');
                const ilk=giris||cikis,son=cikis||giris;if(oncekiSon&&ilk<oncekiSon)throw new Error('Çalışma aralıkları tarih ve saat sırasıyla ilerlemeli, birbiriyle çakışmamalıdır.');oncekiSon=son;
            }
            return aralik;
        });
        if(dogrula&&!araliklar.length)throw new Error('En az bir çalışma aralığı ekleyin.');return araliklar;
    }

function magicpassDuzeltmeAraliklariniCiz(araliklar,saatler){
        const alan=document.getElementById('magicpassDuzeltmeAraliklar'),tarih=document.getElementById('magicpassDuzeltmeTarih').value;if(!alan)return;
        const liste=araliklar.length?araliklar:[{giris:null,cikis:null}];
        alan.innerHTML=liste.map((a,sira)=>'<section class="magicpass-duzeltme-aralik" data-aralik="'+sira+'"><div class="magicpass-duzeltme-aralik-baslik"><strong>'+(sira+1)+'. Çalışma Aralığı</strong><button type="button" onclick="magicpassDuzeltmeAralikKaldir('+sira+')" aria-label="'+(sira+1)+'. çalışma aralığını kaldır">Aralığı Kaldır</button></div><div class="magicpass-duzeltme-zamanlar">'+['Giris','Cikis'].map(tur=>{const id=magicpassDuzeltmeAlanId(tur,sira),ad=tur==='Giris'?'Giriş':'Çıkış';return'<section class="magicpass-zaman-karti"><strong>'+ad+' zamanı</strong>'+(sira?'<input id="'+id+'" type="hidden">':'')+'<div class="magicpass-zaman-alanlari"><div><label for="'+id+'Tarih">Tarih</label><input id="'+id+'Tarih" type="date" onchange="magicpassDuzeltmeTarihSaatBirlestir(\''+tur+'\','+sira+')"></div><div><label for="'+id+'Saat">Saat</label><input id="'+id+'Saat" type="time" step="60" onchange="magicpassDuzeltmeTarihSaatBirlestir(\''+tur+'\','+sira+')"></div></div><div class="magicpass-saat-adimlari"><button type="button" onclick="magicpassDuzeltmeSaatKaydir(\''+tur+'\',-15,'+sira+')">−15 dk</button><button type="button" onclick="magicpassDuzeltmeSaatKaydir(\''+tur+'\',15,'+sira+')">+15 dk</button></div></section>';}).join('')+'</div></section>').join('');
        liste.forEach((a,sira)=>{const girisTarih=a.girisTarih||magicpassYerelTarihSaatDegeri(a.giris).slice(0,10)||tarih,planCikisTarih=magicpassYerelTarihSaatDegeri(saatler?.bit).slice(0,10),cikisTarih=a.cikisTarih||(planCikisTarih>girisTarih?planCikisTarih:girisTarih);magicpassDuzeltmeZamanAlanlariniDoldur('Giris',a.giris,girisTarih,sira);magicpassDuzeltmeZamanAlanlariniDoldur('Cikis',a.cikis,cikisTarih,sira);});
    }

function magicpassDuzeltmeAralikEkle(){
        if(magicpassDuzeltmeKayitIslemi)return;const araliklar=magicpassDuzeltmeAraliklariniOku(),son=araliklar.at(-1),tarih=magicpassYerelTarihSaatDegeri(son?.cikis||son?.giris).slice(0,10)||document.getElementById('magicpassDuzeltmeTarih').value;araliklar.push({giris:null,cikis:null,girisTarih:tarih,cikisTarih:tarih});magicpassDuzeltmeAraliklariniCiz(araliklar);
    }

function magicpassDuzeltmeAralikKaldir(sira){
        if(magicpassDuzeltmeKayitIslemi)return;const araliklar=magicpassDuzeltmeAraliklariniOku();araliklar.splice(sira,1);magicpassDuzeltmeAraliklariniCiz(araliklar);
    }

function magicpassDuzeltmeIslemKilidi(kilitli){
        magicpassDuzeltmeKayitIslemi=kilitli;const modal=document.getElementById('modalMagicpassDuzeltme');if(!modal)return;modal.setAttribute('aria-busy',String(kilitli));modal.querySelectorAll('button,input,textarea').forEach(alan=>{if(kilitli){alan.dataset.magicpassOncekiDisabled=String(alan.disabled);alan.disabled=true;}else{alan.disabled=alan.dataset.magicpassOncekiDisabled==='true';delete alan.dataset.magicpassOncekiDisabled;}});
    }

async function magicpassGunDuzeltmeKaydet(event){
        if(isPersonelUser()){event.preventDefault();return showToast('Giriş–çıkış kayıtlarınızı yalnızca görüntüleyebilirsiniz.','warning');}
        event.preventDefault();if(magicpassDuzeltmeKayitIslemi)return;let araliklar;try{araliklar=magicpassDuzeltmeAraliklariniOku(true);}catch(error){return showToast(error.message,'warning');}
        const pId=document.getElementById('magicpassDuzeltmePersonelId').value,tarih=document.getElementById('magicpassDuzeltmeTarih').value,giris=araliklar[0].giris,cikis=araliklar.at(-1).cikis,oturum=magicpassDuzeltmeOturumu();
        const oncekiListe=vardiyaKayitlari.slice(),mevcutDuzeltme=vardiyaKayitlari.filter(k=>k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0],personel=personeller.find(p=>String(p.id)===String(pId)),oncekiHesap=!mevcutDuzeltme?.denetimOnceki&&personel?magicpassGunHesapla(personel,tarih):null;
        vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih)));
        const yeniKayit={...mevcutDuzeltme,id:mevcutDuzeltme?.id||('mduz_'+pId+'_'+tarih+'_'+Date.now()),kayitTipi:'magicpassDuzeltme',sirketId:aktifSirketId(),pId:String(pId),tarih,calismaAraliklari:magicpassCalismaAraliklariniKaydaCevir(araliklar),girisZamani:giris?giris.toISOString():'',cikisZamani:cikis?cikis.toISOString():'',giris:magicpassYerelTarihSaatDegeri(giris).slice(11,16),cikis:magicpassYerelTarihSaatDegeri(cikis).slice(11,16),aciklama:String(document.getElementById('magicpassDuzeltmeAciklama').value||'').trim(),zaman:Date.now()};
        if(oncekiHesap){const oncekiGiris=oncekiHesap.giris instanceof Date&&!Number.isNaN(oncekiHesap.giris.getTime())?oncekiHesap.giris:null,oncekiCikis=oncekiHesap.cikis instanceof Date&&!Number.isNaN(oncekiHesap.cikis.getTime())?oncekiHesap.cikis:null;yeniKayit.denetimOnceki={...(mevcutDuzeltme||yeniKayit),calismaAraliklari:magicpassCalismaAraliklariniKaydaCevir(oncekiHesap.calismaAraliklari?.length?oncekiHesap.calismaAraliklari:[{giris:oncekiGiris,cikis:oncekiCikis}]),girisZamani:oncekiGiris?oncekiGiris.toISOString():'',cikisZamani:oncekiCikis?oncekiCikis.toISOString():'',giris:oncekiGiris?magicpassYerelTarihSaatDegeri(oncekiGiris).slice(11,16):'',cikis:oncekiCikis?magicpassYerelTarihSaatDegeri(oncekiCikis).slice(11,16):''};delete yeniKayit.denetimOnceki.denetimOnceki;}
        vardiyaKayitlari.push(yeniKayit);
        magicpassDuzeltmeIslemKilidi(true);
        try{yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet({modul:'vardiya',personelId:pId,tarih});if(!magicpassDuzeltmeOturumuGecerli(oturum))return;if(!vardiyaKayitlari.some(k=>magicpassDuzeltmeKayitlariAyniMi(k,yeniKayit)))throw new Error('Bu günün düzeltmesi kaydedilmedi; dönem kilidini kontrol edin.');modalKapat('modalMagicpassDuzeltme');magicpassAylikCizelgeyiCiz();showToast(mevcutDuzeltme?'Giriş–çıkış düzeltmesi güncellendi.':'Ayrıntılı giriş–çıkış düzeltmesi kaydedildi.');}catch(error){if(!magicpassDuzeltmeOturumuGecerli(oturum))return;magicpassDuzeltmeKaydiniGeriAl(pId,tarih,oncekiListe,oturum.sirketId,yeniKayit);showToast('Düzeltme kaydedilemedi: '+(error.message||error),'error');}finally{magicpassDuzeltmeIslemKilidi(false);}
    }

function magicpassDuzeltmeKayitlariAyniMi(a,b){
        if(!a||!b||!['id','kayitTipi','sirketId','pId','tarih','aciklama'].every(alan=>String(a[alan]||'')===String(b[alan]||'')))return false;
        const ilk=a.calismaAraliklari,son=b.calismaAraliklari;if(!Array.isArray(ilk)||!Array.isArray(son)||ilk.length!==son.length)return false;
        const zaman=deger=>deger?new Date(deger).getTime():null;return ilk.every((aralik,i)=>['girisZamani','cikisZamani'].every(alan=>zaman(aralik[alan])===zaman(son[i][alan])));
    }

function magicpassDuzeltmeKaydiniGeriAl(pId,tarih,oncekiListe,sirketId,gonderilen=null){
        if(String(aktifSirketId())!==String(sirketId))return;
        const hedef=k=>k.kayitTipi==='magicpassDuzeltme'&&String(k.sirketId||sirketId)===String(sirketId)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih),guncel=vardiyaKayitlari.filter(hedef);
        // Kaydetme beklerken başka bir ekranın güncellediği / yeniden eklediği
        // kayıt korunur; yalnız hâlâ bu işlemin adayı olan kayıt geri alınır.
        if(guncel.length&&(!gonderilen||guncel.some(k=>!magicpassDuzeltmeKayitlariAyniMi(k,gonderilen)||Number(k.zaman||0)!==Number(gonderilen.zaman||0))))return;
        vardiyaKayitlari=vardiyaKayitlari.filter(k=>!hedef(k)).concat(oncekiListe.filter(hedef));
    }

async function magicpassGunDuzeltmesiniKaldir(){
        if(isPersonelUser())return showToast('Giriş–çıkış kayıtlarınızı yalnızca görüntüleyebilirsiniz.','warning');
        if(magicpassDuzeltmeKayitIslemi)return;const pId=document.getElementById('magicpassDuzeltmePersonelId').value,tarih=document.getElementById('magicpassDuzeltmeTarih').value,oturum=magicpassDuzeltmeOturumu(),varMi=vardiyaKayitlari.some(k=>k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih));
        if(!varMi)return showToast('Bu gün için kayıtlı manuel düzeltme yok.','warning');if(!(await fdYuzerOnaySor('Bu güne ait manuel giriş–çıkış düzeltmesi kaldırılsın mı?','Düzeltmeyi Kaldır','Kaldır')))return;
        if(magicpassDuzeltmeKayitIslemi||!magicpassDuzeltmeOturumuGecerli(oturum))return;const oncekiListe=vardiyaKayitlari.slice();magicpassDuzeltmeIslemKilidi(true);
        vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih)));
        try{yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet({modul:'vardiya',personelId:pId,tarih});if(!magicpassDuzeltmeOturumuGecerli(oturum))return;if(vardiyaKayitlari.some(k=>k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.tarih)===String(tarih)))throw new Error('Düzeltme kaldırılamadı; dönem kilidini kontrol edin.');modalKapat('modalMagicpassDuzeltme');magicpassAylikCizelgeyiCiz();showToast('Manuel düzeltme kaldırıldı.');}catch(error){if(!magicpassDuzeltmeOturumuGecerli(oturum))return;magicpassDuzeltmeKaydiniGeriAl(pId,tarih,oncekiListe,oturum.sirketId);showToast('Düzeltme kaldırılamadı: '+(error.message||error),'error');}finally{magicpassDuzeltmeIslemKilidi(false);}
    }

function vardiyaBolumleriniDuzelt(kayit){
        if(!kayit)return[];
        if(!Array.isArray(kayit.bolumler)||!kayit.bolumler.length){
            const temel=['gunduz','gece','ana','ek'];
            kayit.bolumler=temel.map((id,index)=>({id,baslik:String(kayit.basliklar?.[id]||(['GÜNDÜZ','GECE','ANA BİNA','EK BİNA'][index]))}));
        }
        const bilinen=new Set(kayit.bolumler.map(x=>String(x.id)));
        (kayit.satirlar||[]).forEach(s=>{if(s.vardiya&&!bilinen.has(String(s.vardiya))){kayit.bolumler.push({id:String(s.vardiya),baslik:String(kayit.basliklar?.[s.vardiya]||s.vardiya).toLocaleUpperCase('tr-TR')});bilinen.add(String(s.vardiya));}});
        kayit.bolumler.forEach(b=>{b.id=String(b.id);b.baslik=String(b.baslik||kayit.basliklar?.[b.id]||'YENİ BÖLÜM').toLocaleUpperCase('tr-TR');});
        return kayit.bolumler;
    }

function magicpassTamDakika(zaman){if(!zaman)return null;const d=new Date(zaman);if(Number.isNaN(d.getTime()))return null;d.setSeconds(0,0);return d;}

function magicpassFarkDakika(son,ilk){return son&&ilk?Math.max(0,Math.floor((son-ilk)/60000)):0;}

function magicpassTekBasisiTahminEt(zaman,saatler){
        const tek=magicpassTamDakika(zaman),bas=magicpassTamDakika(saatler.bas),bit=magicpassTamDakika(saatler.bit);
        if(!tek||!bas||!bit)return {giris:null,cikis:null};
        const giris=Math.abs(tek.getTime()-bas.getTime())<=Math.abs(tek.getTime()-bit.getTime());
        return {giris:giris?tek:null,cikis:giris?null:tek};
    }

function magicpassCalismaAraliklari(hareketler,saatler){
        const zamanlar=hareketler.map(k=>magicpassTamDakika(k.zamanDamgasi)).filter(Boolean);
        if(zamanlar.length===1)return[magicpassTekBasisiTahminEt(zamanlar[0],saatler)];
        const araliklar=[];for(let i=0;i<zamanlar.length;i+=2)araliklar.push({giris:zamanlar[i],cikis:zamanlar[i+1]||null});
        return araliklar;
    }

function magicpassDuzeltmeCalismaAraliklari(kayit,tarihKey,saatler){
        if(Array.isArray(kayit?.calismaAraliklari))return kayit.calismaAraliklari.map(a=>({giris:magicpassTamDakika(a?.girisZamani||a?.giris),cikis:magicpassTamDakika(a?.cikisZamani||a?.cikis)}));
        if(!kayit)return[];const giris=kayit.girisZamani?magicpassTamDakika(kayit.girisZamani):(kayit.giris?magicpassSaatliTarih(tarihKey,kayit.giris):null),cikis=kayit.cikisZamani?magicpassTamDakika(kayit.cikisZamani):(kayit.cikis?magicpassSaatliTarih(tarihKey,kayit.cikis,saatler.bitErtesi&&kayit.cikis<=saatler.basSaat):null);return[{giris,cikis}];
    }

function magicpassCalismaAraliklariniKaydaCevir(araliklar){
        return araliklar.map(a=>{const giris=magicpassTamDakika(a.giris),cikis=magicpassTamDakika(a.cikis);return{girisZamani:giris?giris.toISOString():'',cikisZamani:cikis?cikis.toISOString():''};});
    }

function magicpassPazarYemekMolasiSaatleri(tarihKey){
        const ayarlar=typeof uygulamaAyarlari==='object'?uygulamaAyarlari:null,kural=ayarlar?.magicpassPazarYemekMolasi;
        if(kural?.aktif!==true||!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(kural.gecerliAydan||''))||String(tarihKey).slice(0,7)<kural.gecerliAydan)return null;
        const saat=/^([01]\d|2[0-3]):[0-5]\d$/;
        if(!saat.test(String(kural.baslangic||''))||!saat.test(String(kural.bitis||''))||kural.bitis<=kural.baslangic)return null;
        return{bas:magicpassSaatliTarih(tarihKey,kural.baslangic),bit:magicpassSaatliTarih(tarihKey,kural.bitis)};
    }

function magicpassAralikSureleriniHesapla(araliklar,saatler,tatil=false,pazarYemekMolasi=null){
        return araliklar.map(aralik=>{
            const {giris,cikis}=aralik;let normal=0,brutMesai=0,yemekMolasiDakika=0;
            if(giris&&cikis&&cikis>giris){
                if(tatil){yemekMolasiDakika=pazarYemekMolasi?magicpassAralikDakikasi(giris,cikis,pazarYemekMolasi.bas,pazarYemekMolasi.bit):0;brutMesai=Math.max(0,magicpassFarkDakika(cikis,giris)-yemekMolasiDakika);}
                else{
                    const normalBas=new Date(Math.max(giris,saatler.bas)),normalBit=new Date(Math.min(cikis,saatler.bit));
                    normal=Math.max(0,magicpassFarkDakika(normalBit,normalBas)-magicpassAralikDakikasi(normalBas,normalBit,saatler.yemekBas,saatler.yemekBit));
                    brutMesai=magicpassFarkDakika(cikis,new Date(Math.max(giris,saatler.mesaiBas||saatler.bit)));
                }
            }
            return{...aralik,normal,brutMesai,mesai:brutMesai,...(pazarYemekMolasi?{yemekMolasiDakika}:{})};
        });
    }

function magicpassAralikNetMesaisiniDagit(araliklar,kesinti){
        let kalan=Math.max(0,Number(kesinti||0));return araliklar.map(a=>{const dusulen=Math.min(kalan,a.brutMesai);kalan-=dusulen;return{...a,mesai:a.brutMesai-dusulen};});
    }

function magicpassCalismaSaatleriMetni(hesap,alan){
        if(!hesap?.giris&&!hesap?.cikis)return'-';
        const araliklar=hesap?.calismaAraliklari;
        return araliklar?.length>1?araliklar.map(a=>magicpassSaatMetni(a[alan])).join('\n'):magicpassSaatMetni(hesap?.[alan]);
    }

function magicpassMesaiHucresiHtml(hesap,brut=false){
        const araliklar=hesap?.calismaAraliklari,alan=brut?'brutMesai':'mesai';
        if(!araliklar||araliklar.length<2||(!hesap.giris&&!hesap.cikis))return'<strong>'+magicpassDakikaMetni(hesap?.[alan])+'</strong>';
        return'<span class="magicpass-coklu-saat">'+araliklar.map((a,i)=>'<span class="magicpass-aralik-satiri" title="'+(i+1)+'. çalışma mesaisi">'+(a.giris&&a.cikis?magicpassDakikaMetni(a[alan]):'—')+'</span>').join('')+'<small class="magicpass-aralik-toplam">Toplam '+magicpassDakikaMetni(hesap[alan])+'</small></span>';
    }

function magicpassYapilanMesaiDakikasi(hesap){const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;return Math.max(n(hesap?.brutMesai),n(hesap?.mesai));}

function magicpassKalanEksikDakikasi(hesap){const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0,mahsup=Math.max(0,magicpassYapilanMesaiDakikasi(hesap)-n(hesap?.mesai));return Math.max(0,n(hesap?.gec)+n(hesap?.erken)-mahsup);}

function magicpassToplamCalismaDakikasi(hesap){return Math.max(0,Number(hesap?.normal||0))+magicpassYapilanMesaiDakikasi(hesap);}

function magicpassYapilanMesaiHucresiHtml(hesap){const gorunen={...hesap,brutMesai:magicpassYapilanMesaiDakikasi(hesap),calismaAraliklari:hesap?.calismaAraliklari?.map(a=>({...a,brutMesai:magicpassYapilanMesaiDakikasi(a)}))};return magicpassMesaiHucresiHtml(gorunen,true);}

function magicpassPlanliEksikDakikasi(tarihKey,saatler,bas,bit){
        if(String(tarihKey)<'2026-10-01')return magicpassFarkDakika(bit,bas);
        const eksikBas=new Date(Math.max(bas,saatler.bas)),eksikBit=new Date(Math.min(bit,saatler.bit));
        if(!Number.isFinite(+eksikBas)||!Number.isFinite(+eksikBit)||eksikBit<=eksikBas)return 0;
        return Math.max(0,magicpassFarkDakika(eksikBit,eksikBas)-magicpassAralikDakikasi(eksikBas,eksikBit,saatler.yemekBas,saatler.yemekBit));
    }

function magicpassGunHamHareketleriBul(personel,tarihKey){
        if(!personel||!tarihKey)return[];const vardiya=magicpassGunVardiyasi(personel,tarihKey),saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),pencereBas=new Date(saatler.bas),pencereBit=new Date(saatler.bit);pencereBas.setHours(pencereBas.getHours()-4);pencereBit.setHours(pencereBit.getHours()+8);
        const onbellekli=Boolean(fdMagicpassHareketlerByPersonelCache),kaynak=onbellekli?(fdMagicpassHareketlerByPersonelCache.get(String(personel.id))||[]):magicpassKayitlari('magicpassHareket');
        return kaynak.filter(k=>{const p=onbellekli?personel:magicpassPersonelBul(k),zaman=new Date(k.zamanDamgasi);return p&&String(p.id)===String(personel.id)&&zaman>=pencereBas&&zaman<=pencereBit}).sort((a,b)=>String(a.zamanDamgasi).localeCompare(String(b.zamanDamgasi)));
    }

async function magicpassHamHareketleriSil(kayitlar,baslik,mesaj){
        if(isPersonelUser())return showToast('Cihaz hareketlerini silme yetkiniz yok.','warning');const idler=[...new Set((kayitlar||[]).map(k=>String(k.id)).filter(Boolean))];if(!idler.length)return showToast('Silinecek ham cihaz hareketi bulunmuyor.','warning');
        if(!(await fdYuzerOnaySor(idler.length+' ham cihaz hareketi silinecek. Vardiya, izin ve manuel d\u00fczeltmeler korunacak.\n\n'+mesaj,baslik,'Hareketleri Sil')))return;const onceki=vardiyaKayitlari;showGlobalOverlay('Giri\u015f-\u00e7\u0131k\u0131\u015f hareketleri siliniyor','Se\u00e7ilen ham cihaz kay\u0131tlar\u0131 kald\u0131r\u0131l\u0131yor...');
        try{const set=new Set(idler);vardiyaKayitlari=vardiyaKayitlari.filter(k=>!set.has(String(k.id)));yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassAylikCizelgeyiCiz();if(typeof magicpassGunlukRaporuCiz==='function')magicpassGunlukRaporuCiz();showToast(idler.length+' ham giri\u015f-\u00e7\u0131k\u0131\u015f hareketi silindi.','success')}catch(error){vardiyaKayitlari=onceki;showToast('Hareketler silinemedi: '+(error.message||error),'error')}finally{hideGlobalOverlay()}
    }

async function magicpassGunHamHareketleriniSil(tarih){
        const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value));if(!personel)return showToast('\u00d6nce personel se\u00e7in.','warning');const kayitlar=magicpassGunHamHareketleriBul(personel,tarih),saatler=kayitlar.map(k=>new Date(k.zamanDamgasi).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})).join(', ');return magicpassHamHareketleriSil(kayitlar,'G\u00fcn\u00fcn Ham Hareketlerini Sil',personel.ad+' - '+tarihFormati(tarih)+(saatler?' - '+saatler:''));
    }

async function magicpassSeciliAyinHamHareketleriniSil(){
        const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value)),ay=String(document.getElementById('magicpassAy')?.value||'');if(!personel||!ay)return showToast('Personel ve ay se\u00e7in.','warning');const idHaritasi=new Map();magicpassAylikCizelgeVerisi(personel,ay).forEach(gun=>magicpassGunHamHareketleriBul(personel,gun.tarih).forEach(k=>idHaritasi.set(String(k.id),k)));return magicpassHamHareketleriSil([...idHaritasi.values()],'Ay\u0131n Ham Hareketlerini Sil',personel.ad+' - '+ay+' d\u00f6nemindeki TXT/cihaz hareketleri temizlenecek.');
    }

function magicpassSaatHucresiHtml(hesap,alan){
        if(hesap?.calismaAraliklari?.length>1&&(hesap.giris||hesap.cikis)){
            const satirlar=hesap.calismaAraliklari.map((a,i)=>{const zaman=a[alan],metin=zaman?magicpassSaatMetni(zaman):(alan==='giris'?'GİRİŞ YOK':'ÇIKIŞ YOK');return'<span class="magicpass-aralik-satiri '+(!zaman?'magicpass-eksik-saat':'')+'" title="'+(i+1)+'. çalışma'+(zaman?' · '+escapeDashboardText(zaman.toLocaleString('tr-TR')):'')+'">'+metin+'</span>';});
            return'<span class="magicpass-coklu-saat">'+satirlar.join('')+'<small class="magicpass-aralik-toplam magicpass-aralik-bos" aria-hidden="true">&nbsp;</small></span>';
        }
        const girisMi=alan==='giris',zaman=hesap?.[alan],eksik=String(hesap?.durum||'')===(girisMi?'Giriş Yok':'Çıkış Yok');
        if(!zaman)return eksik?'<span class="magicpass-eksik-saat">⚠ '+(girisMi?'GİRİŞ YOK':'ÇIKIŞ YOK')+'</span>':magicpassSaatMetni(zaman);
        return'<span class="magicpass-saat-islem">'+magicpassSaatMetni(zaman)+'</span>';
    }

function magicpassIzinSatirSinifi(izin){
        if(!izin)return'';
        const anahtar=String(izin.tur||'').toLocaleLowerCase('tr-TR');
        if(/yıllık|yillik/.test(anahtar))return' magicpass-izin-yillik';
        if(/sağlık|saglik|rapor/.test(anahtar))return' magicpass-izin-rapor';
        if(/ücretsiz|ucretsiz/.test(anahtar))return' magicpass-izin-ucretsiz';
        if(/mazeretsiz|gelmedi/.test(anahtar))return' magicpass-izin-mazeretsiz';
        if(/ücretli|ucretli|düğün|dugun|evlenme|doğum|dogum|ölüm|olum|babalık|babalik|süt izni|sut izni/.test(anahtar))return' magicpass-izin-ucretli';
        return' magicpass-izin-diger';
    }

function magicpassMesaiTurlerineGoreTopla(liste){
        // Aylık mahsup puantajla aynıdır. Günlük sıfıra sabitlenen netleri
        // toplamak, başka günlerdeki karşılanmamış eksikleri kaybettirir.
        const ozet={normal:0,pazar:0,resmi:0,brut:0,gec:0,erken:0,eksikCalisma:0,eksik:0,mahsup:0,kalanEksik:0,gunlukNet:0,gunlerArasiMahsup:0,ayriResmi:0,toplam:0,puantaj:0,yuvarlama:0},dakika=deger=>Number.isFinite(Number(deger))?Math.max(0,Number(deger)):0;
        for(const kayit of liste||[]){
            const hamBrut=dakika(kayit.brutMesai),net=dakika(kayit.mesai),brut=Math.max(hamBrut,net),ayriResmi=Math.min(net,Math.max(0,dakika(kayit.resmiTatilMesaiDakika)-hamBrut));
            // Yarım günlük resmî tatil de resmî tatil grubuna dahildir.
            const resmi=kayit.fdHolidayNight?Math.min(brut,dakika(kayit.resmiTatilMesaiDakika)):(kayit.gunTuru==='resmiTatil'||kayit.gunTuru==='yarimResmiTatil'?brut:Math.min(brut,dakika(kayit.resmiTatilMesaiDakika)));
            ozet.resmi+=resmi;ozet[kayit.gunTuru==='pazar'?'pazar':'normal']+=brut-resmi;
            ozet.brut+=brut;ozet.gec+=dakika(kayit.gec);ozet.erken+=dakika(kayit.erken);ozet.eksikCalisma+=kayit.gunTuru==='yarimResmiTatil'&&!kayit.fdHolidayNight?dakika(kayit.yarimTatilEksikDakika):0;
            ozet.gunlukNet+=Math.max(0,net-ayriResmi);ozet.ayriResmi+=ayriResmi;
        }
        ozet.eksik=ozet.gec+ozet.erken;
        const ay=String(liste?.[0]?.tarih||'').slice(0,7),dagilim=fdMesaiDakikaMahsupDagilimi(ozet,ozet.eksik,fdMesaiMahsupYontemi(ay));
        ozet.mahsup=dagilim.mahsup;ozet.kalanEksik=dagilim.kalanEksik;ozet.toplam=dagilim.toplam;
        ozet.gunlerArasiMahsup=Math.max(0,ozet.gunlukNet-ozet.toplam);
        const yuvarla=()=>ay>='2026-10'?Math.round(Object.values(fdMesaiYuvarlanmisSaatDagilimi(dagilim)).reduce((toplam,saat)=>toplam+saat,0)*60):Math.round(mesaiSaatiniYukariYarimaYuvarla(ozet.toplam/60)*60);
        ozet.puantaj=typeof fdHesapDonemindeCalistir==='function'&&/^\d{4}-\d{2}$/.test(ay)?fdHesapDonemindeCalistir(ay,yuvarla):yuvarla();
        ozet.yuvarlama=Math.max(0,ozet.puantaj-ozet.toplam);
        return ozet;
    }

function magicpassBirlesikMesaiDonemiMi(personel,ay,yil){
        // Yeni yöntem açık Ekim 2026 döneminden itibaren uygulanır.
        // Önceki dönemlerin maaş hesabını geriye dönük değiştirmez.
        const donem=String(yil)+'-'+String(Number(ay)+1).padStart(2,'0');
        return donem>='2026-10'&&magicpassTopluSaatAydaKayitVarMi(personel,donem);
    }

function magicpassAylikPuantajMesaiHesabi(liste,donem){
        const hesap=magicpassMesaiTurlerineGoreTopla(liste);
        if(String(donem)>='2026-10')return hesap;
        const toplam=alan=>(liste||[]).reduce((t,k)=>t+Number(k[alan]||0),0),net=Math.max(0,toplam('brutMesai')-toplam('gec')-toplam('erken'));
        const yuvarla=()=>Math.round(mesaiSaatiniYukariYarimaYuvarla(net/60)*60);
        return {...hesap,toplam:net,puantaj:typeof fdHesapDonemindeCalistir==='function'?fdHesapDonemindeCalistir(donem,yuvarla):yuvarla()};
    }

function magicpassAylikOzetKalemleri(liste){
        const hesap=magicpassMesaiTurlerineGoreTopla(liste);
        return [
            [['erken','Erken Çıkılan',hesap.erken],['gec','Geç Kalınan',hesap.gec],['gecerken','Geç + Erken Toplamı',hesap.eksik]],
            [['normal','Hafta İçi Mesai',hesap.normal],['resmi','Resmî Tatil Mesaisi',hesap.resmi],['pazar','Pazar Mesaisi',hesap.pazar],['mesai','Toplam Yapılan Mesai',hesap.brut]],
            [['net','Net Kalan Mesai',hesap.toplam]]
        ];
    }

function magicpassAylikMesaiAciklamalari(liste){
        return magicpassAylikOzetKalemleri(liste).flat().map(([,ad,dakika])=>ad+': '+magicpassDakikaMetni(dakika));
    }

function magicpassAylikTabloOzetiniEkle(tablo,liste,personel){
        if(!tablo)return;tablo.tFoot?.remove();
        fdAttendanceSummaryMount(tablo,liste,personel);
    }

function magicpassAylikPdfOzetHtml(liste){
        return magicpassAylikOzetKalemleri(liste).map(grup=>'<section style="display:grid;grid-template-columns:repeat('+grup.length+',minmax(0,1fr));gap:6px;margin:6px 0">'+grup.map(([key,ad,dakika])=>'<div style="padding:6px 9px;background:'+(key==='net'?'#eef8f5':'#f4f8fb')+';border:1px solid #d7e1e9;border-radius:5px;font-size:10px;line-height:1.4"><span>'+ad+'</span><strong style="display:block;font-size:14px;color:#173c4a">'+magicpassDakikaMetni(dakika)+'</strong></div>').join('')+'</section>').join('');
    }

function magicpassNetMesaiOzetHtml(liste){return magicpassAylikOzetHtml(liste);}

function magicpassAylikOzetHtml(liste){
        return '<section class="magicpass-sade-ozet" aria-label="Aylık mesai hesabı">'+magicpassAylikOzetKalemleri(liste).map((grup,i)=>'<div class="magicpass-ozet-satiri magicpass-ozet-satiri-'+i+'">'+grup.map(([key,ad,dakika])=>'<div data-magicpass-metrik="'+key+'"><span>'+ad+'</span><strong>'+magicpassDakikaMetni(dakika)+'</strong></div>').join('')+'</div>').join('')+'</section>';
    }

function fdAylikRaporVeriImzasi(p){return JSON.stringify([personeller.find(x=>String(x.id)===String(p.id)&&aktifSirketeAit(x)),uygulamaAyarlari,izinler.filter(x=>String(x.pId)===String(p.id)),vardiyaKayitlari.filter(x=>aktifSirketeAit(x)&&(x.kayitTipi!=='magicpassHareket'||String(x.pId)===String(p.id)||String(x.cihazPersonelNo)===String(p.cihazPersonelNo))),puantajVerileri]);}

function fdMagicpassTarihKaydir(tarihKey, gun) {
        const tarih = new Date(String(tarihKey) + 'T12:00:00');
        tarih.setDate(tarih.getDate() + Number(gun || 0));
        return magicpassTarihAnahtari(tarih);
    }

function fdMagicpassBeklenenCalismaGunu(sonuc) {
        return Boolean(sonuc) &&
            sonuc.gunTuru !== 'pazar' &&
            sonuc.gunTuru !== 'resmiTatil' &&
            !sonuc.izin &&
            sonuc.durum !== 'Çalışma Yok';
    }

function fdMagicpassPazarKontrolGununuHesapla(personel, tarihKey) {
        const sonuc = fdMagicpassGunHesaplaPazarOncesi(personel, tarihKey);
        const manuel = puantajVerileri.find(k => aktifSirketeAit(k) && !k.kayitTipi && String(k.pId) === String(personel?.id) && String(k.tarih) === String(tarihKey));
        const kod = String(manuel?.durum || '').toUpperCase();
        if (kod === 'M') return { ...sonuc, izin:null, gunTuru:'', durum:'Gelmedi' };
        if (['Y','R','Z','Ü'].includes(kod)) return { ...sonuc, izin:{ tur:kod, kaynak:'puantaj' }, durum:'İzinli' };
        if (kod === 'HS' || kod === 'RT') return { ...sonuc, gunTuru:kod === 'HS' ? 'pazar' : 'resmiTatil', durum:'Çalışma Yok' };
        if (['X','PZ','RC'].includes(kod)) return { ...sonuc, izin:null, gunTuru:'', durum:'Tamam' };
        return sonuc;
    }

function fdPuantajPazarIkiYanDevamsiz(personel, pazarTarih) {
        const devamsizMi = tarihKey => {
            const manuel = puantajVerileri.find(k => aktifSirketeAit(k) && !k.kayitTipi && String(k.pId) === String(personel?.id) && String(k.tarih) === String(tarihKey));
            if (String(manuel?.durum || '').toUpperCase() === 'M') return true;
            const sonuc = fdMagicpassGunHesaplaPazarOncesi(personel, tarihKey);
            return sonuc?.durum === 'Gelmedi';
        };
        return devamsizMi(fdMagicpassTarihKaydir(pazarTarih, -1)) && devamsizMi(fdMagicpassTarihKaydir(pazarTarih, 1));
    }

function fdMagicpassPazarHakkiKontrolEt(personel, pazarTarih) {
        let onceki = null;
        let sonraki = null;
        for (let fark = 1; fark <= 7 && !onceki; fark++) {
            const sonuc = fdMagicpassPazarKontrolGununuHesapla(personel, fdMagicpassTarihKaydir(pazarTarih, -fark));
            if (fdMagicpassBeklenenCalismaGunu(sonuc)) onceki = sonuc;
        }
        for (let fark = 1; fark <= 7 && !sonraki; fark++) {
            const sonuc = fdMagicpassPazarKontrolGununuHesapla(personel, fdMagicpassTarihKaydir(pazarTarih, fark));
            if (fdMagicpassBeklenenCalismaGunu(sonuc)) sonraki = sonuc;
        }

        const devamsizlikZinciri = onceki?.durum === 'Gelmedi' && sonraki?.durum === 'Gelmedi';
        const haftaGunleri = [];
        for (let fark = 6; fark >= 1; fark--) {
            const sonuc = fdMagicpassPazarKontrolGununuHesapla(personel, fdMagicpassTarihKaydir(pazarTarih, -fark));
            if (fdMagicpassBeklenenCalismaGunu(sonuc)) haftaGunleri.push(sonuc);
        }
        const haftaninTamamindaDevamsiz = haftaGunleri.length > 0 && haftaGunleri.every(sonuc => sonuc.durum === 'Gelmedi');

        if (devamsizlikZinciri) {
            return { hakEtti:false, neden:'Pazarın iki yanındaki kesintisiz devamsızlık nedeniyle hafta tatili hakkı oluşmadı.' };
        }
        if (haftaninTamamindaDevamsiz) {
            return { hakEtti:false, neden:'Hafta boyunca çalışılmadığı için pazar hafta tatili hakkı oluşmadı.' };
        }
        return { hakEtti:true, neden:'' };
    }

function fdMagicpassSaatTarihMetni(zaman) {
        if (!(zaman instanceof Date) || Number.isNaN(zaman.getTime())) return '-';
        return zaman.toLocaleDateString('tr-TR') + ' ' + magicpassSaatMetni(zaman);
    }

function magicpassManuelKarsilastirmaKapat(){fdManuelKarsilastirmaIstek=null;if(window.FDModules?.status('saatkarsilastirma').loaded)return FDModules.callIfLoaded('saatkarsilastirma','magicpassManuelKarsilastirmaKapat',[],this)}

function magicpassManuelKarsilastirmaAc(personelId,tarihKey){
 if(!activeUser||!anaMenuModulErisimiVar('personel')||['IsgUzmani','IsyeriHekimi'].includes(activeUser.rol))return;
 const personel=personeller.find(p=>String(p.id)===String(personelId)&&aktifSirketeAit(p));if(!personel||(isPersonelUser()&&String(personel.id)!==String(activeUser?.tcNo||'')))return;
 const selected=String(document.getElementById('magicpassPersonel')?.value||''),ay=String(document.getElementById('magicpassAy')?.value||'');
 if(selected!==String(personelId)||String(tarihKey).slice(0,7)!==ay||document.getElementById('magicpassApp')?.style.display==='none')return;
 if(!magicpassKayitlari('magicpassDuzeltme').some(k=>String(k.pId)===String(personelId)&&String(k.tarih)===String(tarihKey)))return;
 const request={personelId:String(personelId),tarihKey:String(tarihKey),selected,ay,oturum:JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])};
 fdManuelKarsilastirmaIstek=request;return FDModules.embedded('saatkarsilastirma',[request],this);
}

function fdMagicpassHaftalikVardiyaBilgisi(personel,tarihKey){
        const hafta=vardiyaPazartesi(tarihKey),sube=fdPersonelTarihSubesi(personel,tarihKey).trim().toLocaleLowerCase('tr-TR');
        const kayit=fdMagicpassHaftalikVardiyaCache?.get(`${hafta}|${sube}`)||vardiyaKayitlari.find(k=>!k.kayitTipi&&aktifSirketeAit(k)&&String(k.haftaBaslangic||'')===hafta&&String(k.sube||'').trim().toLocaleLowerCase('tr-TR')===sube);if(!kayit)return null;
        const satir=(kayit.satirlar||[]).find(s=>String(s.personelId||'')===String(personel.id));
        return satir?{vardiya:vardiyaKayitTanimHaritasi(JSON.parse(JSON.stringify(kayit)))[satir.vardiya]||fdVardiyaVarsayilanGunduzId(),zaman:Number(kayit.guncellemeZamani||kayit.zaman||0)}:null;
    }

function magicpassGunlukRaporSubeleriniHazirla(){return FDModules.callIfLoaded('gunlukrapor','magicpassGunlukRaporSubeleriniHazirla',Array.from(arguments),this)}

function magicpassGunlukMesaiEsigi(){
        const yeniAyarKaydedildi=uygulamaAyarlari.magicpassGunlukMesaiEsikAyarlandiV2===true||String(uygulamaAyarlari.magicpassGunlukMesaiEsikAyarlandiV2||'').toLowerCase()==='true';
        const deger=yeniAyarKaydedildi?Number(uygulamaAyarlari.magicpassGunlukMesaiEsikDakika??75):75;
        return Math.min(1440,Math.max(0,deger));
    }

function magicpassGunlukEksikMesaiEsigi(){
        return Math.min(1440,Math.max(0,Number(uygulamaAyarlari.magicpassGunlukEksikMesaiEsikDakika??15)));
    }

function magicpassGunlukRaporTumVerisi() {
        const tarih=String(document.getElementById('magicpassGunlukTarih')?.value||magicpassTarihAnahtari(new Date())),sube=String(document.getElementById('magicpassGunlukSube')?.value||'');
        return personeller.filter(p=>{
            if(!aktifSirketeAit(p)||sube&&String(p.sube||'Merkez')!==sube)return false;
            const giris=String(p.girisTarihi||'').slice(0,10),cikis=String(p.cikisTarihi||'').slice(0,10);
            return(!giris||giris<=tarih)&&(!cikis||tarih<=cikis);
        }).map(personel=>{
            const hesap=magicpassGunHesapla(personel,tarih),fazlaMesai=Math.max(0,Number(hesap.resmiTatilMesaiDakika??hesap.brutMesai??hesap.mesai??0)),geldi=Boolean(hesap.giris||hesap.cikis),izinli=Boolean(hesap.izin),gelmedi=!geldi&&!izinli&&(hesap.durum==='Gelmedi'||Boolean(hesap.pazarHakkiYok)),kayitsiz=String(hesap.durum||'').includes('Cihaz No Tanımsız');
            const gorunenDurum=kayitsiz?(String(uygulamaAyarlari.magicpassCihazsizDurumMetni||'Kayıt Yok').trim()||'Kayıt Yok'):(hesap.durum||'-');
            return{personel,hesap,fazlaMesai,geldi,izinli,gelmedi,kayitsiz,eksik:['Giriş Yok','Çıkış Yok'].includes(String(hesap.durum||'')),gorunenDurum,izinTuru:String(hesap.izinAdi||hesap.izin?.tur||''),gec:Number(hesap.gec||0),erken:Number(hesap.erken||0)};
        }).sort((a,b)=>String(a.personel.sube||'').localeCompare(String(b.personel.sube||''),'tr')||String(a.personel.ad||'').localeCompare(String(b.personel.ad||''),'tr'));
    }

function magicpassGunlukRaporVerisi(tumVeri=null) {
        const durum=String(document.getElementById('magicpassGunlukDurum')?.value||''),liste=Array.isArray(tumVeri)?tumVeri:magicpassGunlukRaporTumVerisi(),esik=magicpassGunlukMesaiEsigi(),eksikEsik=magicpassGunlukEksikMesaiEsigi();
        return liste.filter(k=>!durum||(durum==='gelen'&&k.geldi)||(durum==='gelmeyen'&&k.gelmedi)||(durum==='mesai'&&k.fazlaMesai>=esik)||(durum==='gec'&&k.gec>=eksikEsik)||(durum==='erken'&&k.erken>=eksikEsik)||(durum==='izinli'&&k.izinli)||(durum==='eksik'&&k.eksik)||(durum==='kayitsiz'&&k.kayitsiz));
    }

function magicpassGunlukRaporuCiz(){return FDModules.callIfLoaded('gunlukrapor','magicpassGunlukRaporuCiz',Array.from(arguments),this)}

function magicpassTopluSaatAktifPersonelleri(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatAktifPersonelleri',args,this)}

function magicpassTopluSaatDoldurmaAc(){if(!isManagerUser())return;return FDModules.embedded('toplusaat',[],this)}

function magicpassTopluSaatPersonelleriniCiz(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatPersonelleriniCiz',args,this)}

function magicpassTopluSaatTumunuSec(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatTumunuSec',args,this)}

function magicpassTopluSaatSecimOzetiniGuncelle(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatSecimOzetiniGuncelle',args,this)}

function magicpassTopluSaatVardiyaDegisti(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatVardiyaDegisti',args,this)}

function magicpassTopluSaatAydaKayitVarMi(personel,ay) {
        return Boolean(String(personel?.cihazPersonelNo||'').trim())||magicpassKayitlari('magicpassDuzeltme').some(k=>String(k.pId)===String(personel?.id)&&String(k.tarih||'').startsWith(String(ay)));
    }

function magicpassTopluSaatKaydet(...args){return FDModules.callIfLoaded('toplusaat','magicpassTopluSaatKaydet',args,this)}

function fdPuantajManuelGunKaydi(personel,tarihKey){
        return puantajVerileri.find(k=>aktifSirketeAit(k)&&!k.kayitTipi&&String(k.pId)===String(personel?.id)&&String(k.tarih)===String(tarihKey))||null;
    }

function magicpassArefeSabahDakikasi(tarihKey,vardiya){
        const saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),tatilBas=magicpassSaatliTarih(tarihKey,'13:00'),bas=new Date(Math.max(saatler.bas.getTime(),magicpassSaatliTarih(tarihKey,'00:00').getTime())),bit=new Date(Math.min(saatler.bit.getTime(),tatilBas.getTime()));
        if(bit<=bas)return 0;let dakika=Math.round((bit-bas)/60000);if(typeof magicpassAralikDakikasi==='function')dakika=Math.max(0,dakika-magicpassAralikDakikasi(bas,bit,saatler.yemekBas,saatler.yemekBit));return dakika;
    }

function magicpassArefeResmiTatilDakikasi(tarihKey,giris,cikis){
        if(!(giris instanceof Date)||Number.isNaN(giris.getTime())||!(cikis instanceof Date)||Number.isNaN(cikis.getTime()))return 0;
        const bas=magicpassSaatliTarih(tarihKey,'13:00'),sonrakiGun=magicpassSaatliTarih(tarihKey,'00:00',true),calismaBas=new Date(Math.max(giris.getTime(),bas.getTime())),calismaBit=new Date(Math.min(cikis.getTime(),sonrakiGun.getTime()));return calismaBit>calismaBas?Math.round((calismaBit-calismaBas)/60000):0;
    }

function magicpassAylikYarimResmiTatilMesaiSaati(personel,ay,yil){
        const ayDegeri=String(yil)+'-'+String(Number(ay)+1).padStart(2,'0'),dakika=magicpassAylikCizelgeVerisi(personel,ayDegeri).reduce((toplam,kayit)=>toplam+Number(kayit.resmiTatilMesaiDakika||0),0);return Math.round(dakika/60*100)/100;
    }

function magicpassYarimTatilFiiliHesapla(personel,tarihKey,kayit){
        if(String(tarihKey)<'2026-10-01'||!kayit||kayit.gunTuru!=='yarimResmiTatil'||kayit.izin||kayit.istihdamDisi||kayit.vardiya==='izin')return kayit;
        const saatler=magicpassVardiyaSaatleri(kayit.vardiya,tarihKey);
        if(saatler.bitErtesi)return kayit;
        const simdi=new Date(),sabahBit=new Date(Math.min(saatler.bit,magicpassSaatliTarih(tarihKey,'13:00')));
        const araliklar=(kayit.calismaAraliklari||[]).map(a=>{
            const g=a.giris,c=a.cikis;
            if(!(g instanceof Date)||!(c instanceof Date)||!Number.isFinite(+g)||!Number.isFinite(+c)||c<=g||c>simdi)return{...a,normal:0};
            const bas=new Date(Math.max(g,saatler.bas)),bit=new Date(Math.min(c,sabahBit));
            return{...a,normal:Math.max(0,magicpassFarkDakika(bit,bas)-magicpassAralikDakikasi(bas,bit,saatler.yemekBas,saatler.yemekBit))};
        });
        const normal=araliklar.reduce((n,a)=>n+a.normal,0),bos=!kayit.giris&&!kayit.cikis;
        let durum=kayit.durum,seviye=kayit.seviye,uyarilar=[...(kayit.uyarilar||[])];
        if(bos&&magicpassArefeSabahDakikasi(tarihKey,kayit.vardiya)>0){
            if(saatler.tanim?.tatil||saatler.tanim?.girisCikisYasak){durum='Çalışma Yok';seviye='tamam';}
            else if(!String(personel?.cihazPersonelNo||'').trim()&&!kayit.duzeltme&&!kayit.puantajManuel){durum='Cihaz No Tanımsız';seviye='hata';}
            else{durum=simdi<saatler.bas?'Planlandı':'Gelmedi';seviye=durum==='Gelmedi'?'hata':'tamam';if(durum==='Gelmedi'&&!uyarilar.includes('Giriş Yok'))uyarilar.push('Giriş Yok');}
        }
        const sabahPlan=magicpassArefeSabahDakikasi(tarihKey,kayit.vardiya),bilinen=Boolean(String(personel?.cihazPersonelNo||'').trim()||kayit.duzeltme||kayit.puantajManuel);
        const eksikBasim=(kayit.calismaAraliklari||[]).some(a=>!(a.giris instanceof Date)||!(a.cikis instanceof Date)||!Number.isFinite(+a.giris)||!Number.isFinite(+a.cikis)||a.cikis<=a.giris||a.cikis>simdi);
        const yarimTatilEksikDakika=bilinen&&!saatler.tanim?.tatil&&!saatler.tanim?.girisCikisYasak&&simdi>=sabahBit&&!eksikBasim?Math.max(0,sabahPlan-normal):0;
        if(yarimTatilEksikDakika>0){uyarilar.push('Yarım tatil sabahı eksik çalışma '+magicpassDakikaMetni(yarimTatilEksikDakika));if(bos&&durum==='Gelmedi'&&!araliklar.length&&yarimTatilEksikDakika>=sabahPlan)uyarilar.push('Sabah gelmedi: işyeri muhasebe kuralına göre 1 gün devamsızlık ve 1 gün ücret kesintisi.');if(seviye!=='hata')seviye='uyari';}
        return{...kayit,normal,calismaAraliklari:araliklar,durum,seviye,uyarilar,yarimTatilEksikDakika,yarimTatilPlanliSabahDakika:sabahPlan};
    }

window.FDPersonnelRuntimeStep = (function(__fdPersonnelSteps61){
 return function(__fdPersonnelStep61){ return __fdPersonnelSteps61[__fdPersonnelStep61].call(window); };
})([
function(){
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',personelSaltOkunurKorumasiniKur);else personelSaltOkunurKorumasiniKur();
},
function(){
window.fdPersonelFormGecisiniIptalEt=function(onlyInvalid=false){if(onlyInvalid&&(!fdPersonelFormIstek||(!fdPersonelFormIstek.cancelled&&fdPersonelFormIstek.snapshot===JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]))))return;fdPersonelFormIstek?.cancel();return fdPersonelFormCagir('cancelForNavigation',[])};
},
function(){
window.fdTopluPlanGecisiniIptalEt=function(onlyInvalid=false){if(onlyInvalid&&(!fdTopluPlanIstek||fdTopluPlanIstek.current()))return;fdTopluPlanIstek?.cancel();return fdTopluPlanCagir('magicpassTopluPlanlamaKapat',[])};
},
function(){
window.fdWordBelgeGecisiniIptalEt=function(onlyInvalid=false){for(const request of [...fdWordBelgeIstekleri])if(!onlyInvalid||!request.current())request.cancel();if(!onlyInvalid)fdWordBelgeNesli++};
},
function(){
window.fdBelgeHazirlamaIptalEt=function(onlyInvalid=false){const r=fdBelgeHazirlamaIstegi;if(!onlyInvalid||!r?.current())r?.cancel();if(!onlyInvalid)fdBelgeHazirlamaNesli++};
},
function(){
window.fdWordOnizlemeIptalEt=function(onlyInvalid=false,close=true){const r=fdWordOnizlemeIstegi;if(!onlyInvalid||!r?.current())r?.cancel(close);if(!onlyInvalid)fdWordOnizlemeNesli++};
},
function(){
window.personelBelgeOnizlemeKapat=function(...args){window.fdWordOnizlemeIptalEt(false,false);return fdWordOnizlemeAsilKapat.apply(this,args)};
},
function(){
getSubeBadgeStyle=function(subeStr){
        if(!subeStr)return 'background:#475569;color:#fff;border:1px solid #334155;';
        const ad=String(subeStr).trim(),anahtar=ad.toLocaleLowerCase('tr-TR'),adlar=[...new Set([...subeler.filter(s=>aktifSirketeAit(s)).map(s=>String(s.ad||'').trim()),...personeller.filter(p=>aktifSirketeAit(p)).map(p=>String(p.sube||'Merkez').trim())].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr',{sensitivity:'base'}));
        let index=adlar.findIndex(x=>x.toLocaleLowerCase('tr-TR')===anahtar);if(index<0){index=0;for(let i=0;i<ad.length;i++)index=(index*31+ad.charCodeAt(i))>>>0;}
        const palet=[['#1d4ed8','#fff'],['#c2410c','#fff'],['#15803d','#fff'],['#7e22ce','#fff'],['#be123c','#fff'],['#0e7490','#fff'],['#854d0e','#fff'],['#334155','#fff'],['#4338ca','#fff'],['#a21caf','#fff'],['#166534','#fff'],['#9f1239','#fff']],renk=palet[index%palet.length];
        return 'background:'+renk[0]+';color:'+renk[1]+';border:1px solid rgba(15,23,42,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);';
    };
},
function(){
fdPersonelAramaPanelleriniKur();
},
function(){
magicpassArayuzunuHazirla=function(){
        magicpassArayuzunuHazirlaSubeOncesi();const select=document.getElementById('magicpassSubeFiltre');if(!select)return;let kayitli=null;try{kayitli=localStorage.getItem(magicpassSubeHafizaAnahtari());}catch(_){}
        delete select.dataset.fabrikaVarsayilan;
        select.value=kayitli!==null&&[...select.options].some(o=>o.value===kayitli)?kayitli:(fdFabrikaSubeDegeri(select)||'');magicpassSubeFiltreDegisti();
        if(!select.dataset.hafizaBagli){select.dataset.hafizaBagli='1';select.addEventListener('change',magicpassSubeFiltresiniHatirla);}
    };
},
function(){
magicpassHaftalikVardiyaBul=function(personel,tarihKey){
        const hedefHafta=vardiyaPazartesi(tarihKey),sube=String(personel?.sube||'').trim().toLocaleLowerCase('tr-TR'),kayitlar=vardiyaKayitlari.filter(k=>!k.kayitTipi&&aktifSirketeAit(k)&&String(k.sube||'').trim().toLocaleLowerCase('tr-TR')===sube&&String(k.haftaBaslangic||'')<=hedefHafta).sort((a,b)=>String(b.haftaBaslangic||'').localeCompare(String(a.haftaBaslangic||'')));
        for(const kayit of kayitlar){const satir=(kayit.satirlar||[]).find(s=>String(s.personelId||'')===String(personel.id));if(satir)return satir.vardiya==='gece'?'gece':'gunduz';}return '';
    };
},
function(){
magicpassGunVardiyasi=function(personel,tarihKey){
        const atama=magicpassKayitlari('vardiyaAtama').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===tarihKey).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0];if(atama)return atama.vardiya;if(new Date(tarihKey+'T12:00:00').getDay()===0)return 'izin';return magicpassHaftalikVardiyaBul(personel,tarihKey)||'gunduz';
    };
},
function(){
magicpassTatilArayuzuKur();
},
function(){
magicpassAylikCizelgeyiCiz=function(){magicpassAylikCizelgeyiCizTatilOncesi();const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value));if(!personel)return;document.querySelectorAll('#magicpassAylikTablo tbody tr[data-tarih]').forEach(tr=>{const tur=magicpassGunTuruBul(personel,tr.dataset.tarih);tr.classList.toggle('magicpass-pazar',tur==='pazar');tr.classList.toggle('magicpass-resmi-tatil',tur==='resmiTatil');});};
},
function(){
magicpassGunTuruBul=function(personel,tarihKey){
        if(magicpassYarimGunResmiTatilMi(tarihKey))return 'yarimResmiTatil';const genel=magicpassGenelGunTuruKaydi(tarihKey);if(genel)return genel.gunTuru==='normal'?'':genel.gunTuru;
        if(magicpassOtomatikResmiTatilMi(tarihKey))return 'resmiTatil';if(new Date(String(tarihKey)+'T12:00:00').getDay()===0)return 'pazar';return '';
    };
},
function(){
magicpassSeciliGunlereGunTuruAta=async function(gunTuru){
        const tarihler=[...magicpassSeciliGunler].sort();if(!tarihler.length)return alert('Aylık listeden en az bir gün seçin.');
        const aciklama=gunTuru==='pazar'?'Pazar / hafta tatili':gunTuru==='resmiTatil'?'resmi tatil':'normal çalışma günü',mesaj=tarihler.length+' tarih bütün personeller için '+aciklama+' olarak kaydedilecek.\n\nBu değişiklik şirketin tüm personellerine uygulanacak. Devam edilsin mi?';
        if(!(await fdYuzerOnaySor(mesaj,'Tüm Personeller İçin Gün Türü','Tümüne Uygula')))return;
        tarihler.forEach(tarih=>{vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassGunTuruGenel'&&String(k.tarih)===String(tarih)));vardiyaKayitlari.push({id:'mguntur_genel_'+tarih+'_'+Date.now(),kayitTipi:'magicpassGunTuruGenel',sirketId:aktifSirketId(),tarih,gunTuru:gunTuru||'normal',zaman:Date.now()});});
        try{yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();magicpassAylikCizelgeyiCiz();showToast(tarihler.length+' gün bütün personeller için güncellendi.');}catch(error){alert('Tatil günleri kaydedilemedi: '+(error.message||error));}
    };
},
function(){
(function magicpassGenelTatilMetniniDuzenle(){const cubuk=document.getElementById('magicpassTatilToolbar');if(!cubuk)return;const guclu=cubuk.querySelector('strong'),not=cubuk.querySelector('small');if(guclu)guclu.textContent='Tüm personeller için seçilen günler:';if(not)not.textContent='Pazarlar ve 2026 resmî tatilleri otomatik gelir. Manuel değişiklik bütün personellere uygulanır.';})();
},
function(){
magicpassHaftalikVardiyaBul=function(personel,tarihKey){
        const hedefHafta=vardiyaPazartesi(tarihKey),sube=String(personel?.sube||'').trim().toLocaleLowerCase('tr-TR');
        const kayitlar=vardiyaKayitlari.filter(k=>!k.kayitTipi&&aktifSirketeAit(k)&&String(k.sube||'').trim().toLocaleLowerCase('tr-TR')===sube&&String(k.haftaBaslangic||'')<=hedefHafta).sort((a,b)=>String(b.haftaBaslangic||'').localeCompare(String(a.haftaBaslangic||'')));
        for(const kayit of kayitlar){const satir=(kayit.satirlar||[]).find(s=>String(s.personelId||'')===String(personel.id));if(satir)return vardiyaKayitTanimHaritasi(kayit)[satir.vardiya]||magicpassVardiyaTanimlariniDuzelt()[0].id;}
        return '';
    };
},
function(){
magicpassGunVardiyasi=function(personel,tarihKey){
        const atama=magicpassKayitlari('vardiyaAtama').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0];
        return atama?.vardiya || magicpassHaftalikVardiyaBul(personel,tarihKey) || magicpassVardiyaTanimlariniDuzelt()[0].id;
    };
},
function(){
magicpassVardiyaSaatleri=function(tur,tarihKey){
        const tanim=magicpassVardiyaTanimiBul(tur),bitErtesi=String(tanim.bitis)<=String(tanim.baslangic);
        const bas=magicpassSaatliTarih(tarihKey,tanim.baslangic),bit=magicpassSaatliTarih(tarihKey,tanim.bitis,bitErtesi);
        const zaman=(saat,sonrakiZorunlu=false)=>{if(!saat)return null;const ertesi=sonrakiZorunlu||String(saat)<=String(tanim.baslangic);return magicpassSaatliTarih(tarihKey,saat,ertesi);};
        let yemekBas=tanim.yemekBaslangic?zaman(tanim.yemekBaslangic,false):null,yemekBit=tanim.yemekBitis?zaman(tanim.yemekBitis,false):null;
        if(yemekBas&&yemekBit&&yemekBit<=yemekBas)yemekBit.setDate(yemekBit.getDate()+1);
        const mesaiBas=tanim.mesaiBaslangic?zaman(tanim.mesaiBaslangic,bitErtesi&&String(tanim.mesaiBaslangic)<=String(tanim.baslangic)):new Date(bit);
        const sinir=tanim.mesaiBitis?zaman(tanim.mesaiBitis,bitErtesi&&String(tanim.mesaiBitis)<=String(tanim.baslangic)):new Date(mesaiBas);
        return {tanim,bas,bit,sinir,mesaiBas,yemekBas,yemekBit,basSaat:tanim.baslangic,bitSaat:tanim.bitis,bitErtesi};
    };
},
function(){
magicpassOtomatikResmiTatilMi=function(tarihKey){return !magicpassYarimGunResmiTatilMi(tarihKey)&&magicpassResmiTatilAdi(tarihKey)!=='Resmî Tatil';};
},
function(){
magicpassGunMenuAc=function(event,tarih){
        event.preventDefault();magicpassSeciliGunler.clear();magicpassSeciliGunler.add(tarih);
        magicpassVardiyaMenuDoldur();const menu=document.getElementById('magicpassVardiyaMenu');menu.style.left=Math.min(event.clientX,window.innerWidth-300)+'px';menu.style.top=Math.min(event.clientY,window.innerHeight-Math.min(440,menu.scrollHeight+20))+'px';menu.style.display='block';
    };
},
function(){
magicpassGunDuzenle=function(tarih){
 if(isPersonelUser())return showToast('Giriş–çıkış kayıtlarınızı yalnızca görüntüleyebilirsiniz.','warning');
 if(magicpassDuzeltmeKayitIslemi)return;
 const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value));if(!personel||!aktifSirketeAit(personel))return;
 if(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))return;
 fdManuelDuzeltmeIstek?.cancel();const context=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]),scope=context(),personelId=String(personel.id),month=document.getElementById('magicpassAy')?.value||'';
 const request={args:[tarih],cancelled:false,errorButton:null,errorClose:null,current(){return fdManuelDuzeltmeIstek===request&&!request.cancelled&&Boolean(activeUser)&&context()===scope&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&String(document.getElementById('magicpassPersonel')?.value)===personelId&&(document.getElementById('magicpassAy')?.value||'')===month&&(()=>{const selected=personeller.find(p=>String(p.id)===personelId);return Boolean(selected&&aktifSirketeAit(selected))})()},clearError(){if(request.errorButton&&request.errorClose)request.errorButton.removeEventListener('click',request.errorClose);request.errorButton=null;request.errorClose=null},cancel(){request.cancelled=true;request.args=null;request.clearError();if(fdManuelDuzeltmeIstek===request)fdManuelDuzeltmeIstek=null}};fdManuelDuzeltmeIstek=request;
 request.promise=FDModules.embedded('manuelduzeltme',[request],this).then(value=>{if(!request.current())request.cancel();else if(value===false){const panel=document.getElementById('fdModuleLoadError');request.errorButton=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent==='Kapat')||null;request.errorClose=()=>request.cancel();request.errorButton?.addEventListener('click',request.errorClose,{once:true})}return value},()=>{request.cancel();return false});return request.promise;
};
},
function(){
magicpassSeciliGunlereGunTuruAta=function(value){return window.fdVardiyaAtamaCagir('day',value);};
},
function(){
magicpassAylikCizelgeyiCiz=function(){
        const tbody=document.querySelector('#magicpassAylikTablo tbody');if(!tbody)return;const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value));magicpassSeciliGunler.clear();
        const baslik=document.getElementById('magicpassSeciliPersonelBaslik'),bilgi=document.getElementById('magicpassSeciliPersonelBilgi');
        if(!personel){tbody.innerHTML='<tr><td colspan="11" style="padding:24px;color:#64748b;">Personel seçin.</td></tr>';document.getElementById('magicpassOzet').innerHTML='';if(baslik)baslik.textContent='Personel seçin';if(bilgi)bilgi.textContent='';return;}
        if(baslik)baslik.textContent=personel.ad||'Personel';if(bilgi)bilgi.textContent=(personel.sube||'Merkez')+' · '+(personel.gorev||'-')+' · Cihaz No: '+(personel.cihazPersonelNo||'tanımsız');magicpassPersonelListesiCiz();
        const liste=magicpassAylikCizelgeVerisi(personel);
        tbody.innerHTML=liste.map(k=>{const sinif=(k.seviye==='hata'?'magicpass-hata':(k.seviye==='uyari'?'magicpass-uyari':''))+(k.gunTuru==='pazar'?' magicpass-pazar':(k.gunTuru==='resmiTatil'?' magicpass-resmi-tatil':'')),durumSinif=String(k.durum||'')==='Planlandı'?'planlandi':(k.seviye==='hata'?'hata':(k.seviye==='uyari'?'uyari':'tamam')),uyarilar=k.uyarilar?.length?'<br><small>'+escapeDashboardText(k.uyarilar.join(' · '))+'</small>':'',gunAdiHam=new Date(k.tarih+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long'}),gunAdi=gunAdiHam.charAt(0).toLocaleUpperCase('tr-TR')+gunAdiHam.slice(1),hamHareketAdedi=magicpassGunHamHareketleriBul(personel,k.tarih).length;
            return `<tr class="${sinif.trim()}" data-tarih="${k.tarih}" oncontextmenu="magicpassGunMenuAc(event,'${k.tarih}')"><td data-label="Seç"><input class="magicpass-gun-sec" type="checkbox" onchange="magicpassGunSecildi('${k.tarih}',this.checked)"></td><td class="magicpass-tarih-hucre" data-label="Tarih / Gün">${tarihFormati(k.tarih)}<small class="magicpass-tarih-gun">${escapeDashboardText(gunAdi)}</small></td><td data-label="Vardiya">${escapeDashboardText(magicpassVardiyaSaatEtiketi(k.vardiya))}</td><td data-label="Giriş">${magicpassSaatHucresiHtml(k,'giris')}</td><td data-label="Çıkış">${magicpassSaatHucresiHtml(k,'cikis')}</td><td data-label="Normal">${magicpassDakikaMetni(k.normal)}</td><td data-label="Geç">${magicpassDakikaMetni(k.gec)}</td><td data-label="Erken">${magicpassDakikaMetni(k.erken)}</td><td data-label="Fazla Mesai"><strong>${magicpassDakikaMetni(k.mesai)}</strong></td><td data-label="Durum / Uyarı" style="position:relative;text-align:center"><span class="magicpass-durum-hizasi" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="magicpass-durum ${durumSinif}">${escapeDashboardText(k.durum)}</span></span>${uyarilar}</td><td data-label="İşlem"><button class="btn-modern btn-edit-modern" onclick="magicpassGunDuzenle('${k.tarih}')">Düzelt</button>${hamHareketAdedi?`<button class="btn-modern btn-del-modern" title="Bu g&uuml;n&uuml;n ham cihaz hareketlerini sil" onclick="magicpassGunHamHareketleriniSil('${k.tarih}')">&#128465;</button>`:''}</td></tr>`;
        }).join('');
        const toplam=alan=>liste.reduce((t,k)=>t+Number(k[alan]||0),0),tamGun=liste.filter(k=>k.giris&&k.cikis).length,eksik=liste.filter(k=>['Giriş Eksik','Çıkış Eksik'].includes(k.durum)).length,gelmedi=liste.filter(k=>k.durum==='Gelmedi').length;
        document.getElementById('magicpassOzet').innerHTML='<div><span>Tam Gün</span><strong>'+tamGun+'</strong></div><div><span>Gelmedi</span><strong>'+gelmedi+'</strong></div><div><span>Eksik Basış</span><strong>'+eksik+'</strong></div><div><span>Net Fazla Mesai</span><strong>'+magicpassDakikaMetni(toplam('mesai'))+'</strong></div><div><span>Geç + Erken</span><strong>'+magicpassDakikaMetni(toplam('gec')+toplam('erken'))+'</strong></div>';
    };
},
function(){
vardiyaKayitTanimHaritasi=function(kayit){
        kayit.vardiyaTanimlari=kayit.vardiyaTanimlari||{};const tanimlar=magicpassVardiyaTanimlariniDuzelt(),varsayilan=fdVardiyaVarsayilanGunduzId();
        vardiyaBolumleriniDuzelt(kayit).forEach((bolum,index)=>{
            if(kayit.vardiyaTanimlari[bolum.id]&&tanimlar.some(x=>x.id===kayit.vardiyaTanimlari[bolum.id]))return;
            const baslik=String(bolum.baslik||kayit.basliklar?.[bolum.id]||'').toLocaleLowerCase('tr-TR'),es=tanimlar.find(x=>baslik.includes(String(x.ad).toLocaleLowerCase('tr-TR')));
            kayit.vardiyaTanimlari[bolum.id]=es?.id||(index===1&&tanimlar.some(x=>x.id==='gece')?'gece':varsayilan);
        });
        return kayit.vardiyaTanimlari;
    };
},
function(){
magicpassHaftalikVardiyaBul=function(personel,tarihKey){
        const hafta=vardiyaPazartesi(tarihKey),sube=String(personel?.sube||'').trim().toLocaleLowerCase('tr-TR');
        const kayit=vardiyaKayitlari.find(k=>!k.kayitTipi&&aktifSirketeAit(k)&&String(k.haftaBaslangic||'')===hafta&&String(k.sube||'').trim().toLocaleLowerCase('tr-TR')===sube);if(!kayit)return'';
        const satir=(kayit.satirlar||[]).find(s=>String(s.personelId||'')===String(personel.id));return satir?(vardiyaKayitTanimHaritasi(kayit)[satir.vardiya]||fdVardiyaVarsayilanGunduzId()):'';
    };
},
function(){
magicpassGunVardiyasi=function(personel,tarihKey){
        const atama=magicpassKayitlari('vardiyaAtama').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0];
        return atama?.vardiya||magicpassHaftalikVardiyaBul(personel,tarihKey)||fdVardiyaVarsayilanGunduzId();
    };
},
function(){
magicpassGunHesapla=function(personel,tarihKey){
        const vardiya=magicpassGunVardiyasi(personel,tarihKey),saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),izin=izinler.find(i=>aktifSirketeAit(i)&&String(i.pId)===String(personel.id)&&String(tarihKey)>=String(i.baslangic)&&String(tarihKey)<=String(i.bitis));
        const duzeltme=magicpassKayitlari('magicpassDuzeltme').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0],gunTuru=magicpassGunTuruBul(personel,tarihKey),tatilAdi=gunTuru==='pazar'?'Pazar / Hafta Tatili':gunTuru==='resmiTatil'?magicpassResmiTatilAdi(tarihKey):'',bos={tarih:tarihKey,vardiya,giris:null,cikis:null,normal:0,gec:0,erken:0,brutMesai:0,mesai:0,uyarilar:[],hareketler:[],duzeltme,gunTuru,tatilAdi};
        if(izin)return{...bos,izin,izinAdi:izin.tur||'İzinli',durum:izin.tur||'İzinli',seviye:'tamam',uyarilar:izin.aciklama?[String(izin.aciklama)]:[]};
        if(!String(personel?.cihazPersonelNo||'').trim()&&!duzeltme){
            if(tatilAdi||saatler.tanim?.girisCikisYasak||saatler.tanim?.tatil||vardiya==='izin')return{...bos,durum:tatilAdi||'Çalışma Yok',seviye:'tamam',uyarilar:[]};
            return{...bos,durum:'Cihaz No Tanımsız',seviye:'hata',uyarilar:['Personel kartına cihaz numarası girin']};
        }
        const hareketler=String(personel?.cihazPersonelNo||'').trim()?magicpassGunHareketleri(personel,tarihKey,vardiya):[];let giris=null,cikis=null;
        const duzeltmeAraliklari=duzeltme?magicpassDuzeltmeCalismaAraliklari(duzeltme,tarihKey,saatler):null;
        // İlk aralığın girişi eksik olsa da sonraki gerçek girişler günü
        // hareketli tutar. Eksik uçlar kendi aralıklarında boş kalır.
        if(duzeltme){giris=duzeltmeAraliklari.find(a=>a.giris)?.giris||null;cikis=duzeltmeAraliklari.at(-1)?.cikis||null;}
        else if(hareketler.length>=2){giris=new Date(hareketler[0].zamanDamgasi);cikis=hareketler.length%2===0?new Date(hareketler[hareketler.length-1].zamanDamgasi):null;}
        else if(hareketler.length===1){const tek=magicpassTekBasisiTahminEt(hareketler[0].zamanDamgasi,saatler);giris=tek.giris;cikis=tek.cikis;}
        giris=magicpassTamDakika(giris);cikis=magicpassTamDakika(cikis);saatler.bas=magicpassTamDakika(saatler.bas);saatler.bit=magicpassTamDakika(saatler.bit);saatler.mesaiBas=magicpassTamDakika(saatler.mesaiBas);saatler.sinir=magicpassTamDakika(saatler.sinir);saatler.yemekBas=magicpassTamDakika(saatler.yemekBas);saatler.yemekBit=magicpassTamDakika(saatler.yemekBit);
        const pazarYemekMolasi=gunTuru==='pazar'?magicpassPazarYemekMolasiSaatleri(tarihKey):null;
        let calismaAraliklari=magicpassAralikSureleriniHesapla(duzeltme?duzeltmeAraliklari:magicpassCalismaAraliklari(hareketler,saatler),saatler,Boolean(tatilAdi),pazarYemekMolasi);
        const simdi=magicpassTamDakika(new Date()),vardiyaBasladi=simdi>=saatler.bas,vardiyaBitti=simdi>saatler.bit;
        const ilkGiris=duzeltme?duzeltmeAraliklari[0]?.giris:giris;
        // Effective from the current open payroll month; preserve earlier months.
        const pazarEksikKesintisiz=['pazar','resmiTatil'].includes(gunTuru)&&String(tarihKey)>='2026-10-01';
        let normal=0,gec=!pazarEksikKesintisiz&&ilkGiris?(tatilAdi?magicpassFarkDakika(ilkGiris,saatler.bas):magicpassPlanliEksikDakikasi(tarihKey,saatler,saatler.bas,ilkGiris)):0,erken=!pazarEksikKesintisiz&&giris&&cikis?(tatilAdi?magicpassFarkDakika(saatler.bit,cikis):magicpassPlanliEksikDakikasi(tarihKey,saatler,cikis,saatler.bit)):0,brutMesai=0,mesai=0,durum='Tamam',seviye='tamam';const uyarilar=[];
        if(!giris&&!cikis){
            if(tatilAdi){durum=tatilAdi;}
            else if(saatler.tanim.girisCikisYasak||saatler.tanim.tatil||vardiya==='izin'){durum='Çalışma Yok';}
            else if(!vardiyaBasladi){durum='Planlandı';}
            else if(!vardiyaBitti){durum='Gelmedi';seviye='hata';uyarilar.push('Giriş Yok');}
            else{durum='Gelmedi';seviye='hata';uyarilar.push('Giriş Yok');}
        }else if(!giris){
            durum='Giriş Yok';seviye='hata';uyarilar.push('Giriş Yok');
        }else if(!cikis){
            if(!vardiyaBitti){durum='İçeride';}
            else{durum='Çıkış Yok';seviye='hata';uyarilar.push('Çıkış Yok');}
            if(gec>0)uyarilar.push('Geç geldi '+magicpassDakikaMetni(gec));
        }else if(tatilAdi){
            brutMesai=calismaAraliklari.reduce((t,a)=>t+a.brutMesai,0);mesai=brutMesai;durum=tatilAdi+' Çalışması';
        }else{
            normal=magicpassFarkDakika(new Date(Math.min(cikis,saatler.bit)),new Date(Math.max(giris,saatler.bas)));normal=Math.max(0,normal-magicpassAralikDakikasi(giris,cikis,saatler.yemekBas,saatler.yemekBit));
            brutMesai=magicpassFarkDakika(cikis,saatler.mesaiBas||saatler.bit);mesai=Math.max(0,brutMesai-gec-erken);
            if(gec>0)uyarilar.push('Geç geldi '+magicpassDakikaMetni(gec));if(erken>0)uyarilar.push('Erken çıktı '+magicpassDakikaMetni(erken));if(saatler.sinir&&cikis>saatler.sinir)uyarilar.push('Mesai üst sınırı aşıldı');
            if(uyarilar.length){durum='Uyarı';seviye='uyari';}
        }
        if(calismaAraliklari.length>1){
            normal=calismaAraliklari.reduce((t,a)=>t+a.normal,0);brutMesai=calismaAraliklari.reduce((t,a)=>t+a.brutMesai,0);
            calismaAraliklari=magicpassAralikNetMesaisiniDagit(calismaAraliklari,tatilAdi?0:gec+erken);mesai=calismaAraliklari.reduce((t,a)=>t+a.mesai,0);
            const eksikGiris=calismaAraliklari.some(a=>!a.giris&&a.cikis),eksikCikis=calismaAraliklari.some(a=>a.giris&&!a.cikis);
            if(eksikGiris||eksikCikis){if(eksikGiris&&!uyarilar.includes('Giriş Yok'))uyarilar.push('Giriş Yok');if(eksikCikis&&!uyarilar.includes('Çıkış Yok'))uyarilar.push('Çıkış Yok');durum=eksikGiris&&eksikCikis?'Giriş / Çıkış Yok':eksikGiris?'Giriş Yok':vardiyaBitti?'Çıkış Yok':'İçeride';seviye=vardiyaBitti||eksikGiris?'hata':'tamam';}
        }else if(calismaAraliklari.length){calismaAraliklari[0]={...calismaAraliklari[0],normal,brutMesai,mesai};}
        return{tarih:tarihKey,vardiya,giris,cikis,normal,gec,erken,brutMesai,mesai,durum,seviye,uyarilar,hareketler,duzeltme,gunTuru,tatilAdi,calismaAraliklari,...(pazarYemekMolasi?{yemekMolasiDakika:calismaAraliklari.reduce((t,a)=>t+Number(a.yemekMolasiDakika||0),0)}:{})};
    };
},
function(){
magicpassVardiyaMenuDoldur=function(){
        const menu=document.getElementById('magicpassVardiyaMenu');if(!menu)return;
        menu.innerHTML='<div style="padding:6px 9px;color:#64748b;font-size:.7rem;font-weight:900">VARDİYA SEÇİN</div>'+magicpassVardiyaTanimlariniDuzelt().map(x=>'<button type="button" onclick="magicpassSeciliGunlereVardiyaAta(\''+escapeDashboardText(x.id)+'\')">🕒 '+escapeDashboardText(x.baslangic+'-'+x.bitis)+' <small style="display:block;color:#64748b">'+escapeDashboardText(x.ad)+'</small></button>').join('')+'<button type="button" onclick="magicpassSeciliGunlereVardiyaAta(\'izin\')">🏖️ Çalışma Yok</button><button type="button" onclick="magicpassSeciliGunlereVardiyaAta(\'\')">🧹 Özel Vardiyayı Kaldır</button><div style="height:1px;margin:5px;background:#e2e8f0"></div><div style="padding:6px 9px;color:#64748b;font-size:.7rem;font-weight:900">GÜN TÜRÜ</div><button type="button" onclick="magicpassSeciliGunlereGunTuruAta(\'pazar\')">🟠 Pazar / Hafta Tatili</button><button type="button" onclick="magicpassSeciliGunlereGunTuruAta(\'resmiTatil\')">🔴 Resmî Tatil</button><button type="button" onclick="magicpassSeciliGunlereGunTuruAta(\'\')">⚪ Normal Çalışma Günü</button>';
    };
},
function(){
magicpassAylikCizelgeyiCiz=function(){
        const tbody=document.querySelector('#magicpassAylikTablo tbody');if(!tbody)return;tbody.closest('table')?.tFoot?.remove();const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value)&&aktifSirketeAit(p)&&(!isPersonelUser()||String(p.id)===String(activeUser?.tcNo||'')));magicpassSeciliGunler.clear();const baslik=document.getElementById('magicpassSeciliPersonelBaslik'),bilgi=document.getElementById('magicpassSeciliPersonelBilgi');
        const kendiEkrani=Boolean(isPersonelUser()),raporBaslik=document.querySelector('#magicpass-tab-liste > .card .card-header h2'),raporAciklama=document.querySelector('#magicpass-tab-liste > .card .card-header p'),raporNotu=document.querySelector('#magicpass-tab-liste .magicpass-rapor-panel > small');
        if(raporBaslik)raporBaslik.textContent=kendiEkrani?'Aylık Giriş–Çıkışım':'Aylık Personel Giriş–Çıkış Raporu';if(raporAciklama)raporAciklama.textContent=kendiEkrani?'Seçtiğiniz aya ait giriş, çıkış, devamlılık ve mesai detaylarınızı inceleyin.':'Soldan personeli seçin; giriş, çıkış, geç kalma, erken çıkma ve günlük mesaiyi sağdaki aylık listeden inceleyin.';
        if(raporNotu)raporNotu.textContent=kendiEkrani?'Yalnızca kendi kayıtlarınız gösterilir. Süreler saat:dakika biçimindedir; kayıtları bu ekranda değiştiremezsiniz.':'Haftalık plan Vardiya sekmesinden otomatik alınır. Günlük bir istisna olduğunda ilgili güne sağ tıklayarak özel vardiya atayabilirsiniz.';
        window.fdPersonnelPhoto.attendance(personel);
        if(!personel){fdAttendanceSummaryClear(tbody.closest('table'));tbody.innerHTML='<tr><td colspan="12" style="padding:24px;color:#64748b">Personel seçin.</td></tr>';document.getElementById('magicpassOzet').innerHTML='';if(baslik)baslik.textContent='Personel seçin';if(bilgi)bilgi.textContent='';return;}
        if(baslik)baslik.textContent=personel.ad||'Personel';if(bilgi)bilgi.textContent=(personel.sube||'Merkez')+' · '+(personel.gorev||'-')+' · Cihaz No: '+(personel.cihazPersonelNo||'tanımsız');magicpassPersonelListesiCiz();const liste=magicpassAylikCizelgeVerisi(personel);
        tbody.innerHTML=liste.map(k=>{const eksik=['Giriş Yok','Çıkış Yok'].includes(String(k.durum||'')),pazarCalisti=Boolean(k.gunTuru==='pazar'&&(k.giris||k.cikis)),tatilBos=Boolean((k.gunTuru==='pazar'||k.gunTuru==='resmiTatil')&&!k.giris&&!k.cikis),gelmedi=String(k.durum||'')==='Gelmedi',izinSinif=magicpassIzinSatirSinifi(k.izin),sinif=(gelmedi?'magicpass-gelmedi ':'')+(k.gunTuru==='pazar'?' magicpass-pazar'+(pazarCalisti?' magicpass-pazar-calisti':''):(k.gunTuru==='resmiTatil'?' magicpass-resmi-tatil':(k.gunTuru==='yarimResmiTatil'?' magicpass-yarim-resmi-tatil':'')))+izinSinif,durumSinif=String(k.durum||'')==='Planlandı'?'planlandi':(k.seviye==='hata'?'hata':(k.seviye==='uyari'?'uyari':'tamam')),uyariMetni=k.uyarilar?.length?k.uyarilar.join(' · '):'',uyarilar='',durumGosterimi=pazarCalisti?'Pazar Çalıştı':(['Tamam','Uyarı'].includes(String(k.durum||''))?'✓':String(k.durum||'')),gunHam=new Date(k.tarih+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long'}),gun=gunHam.charAt(0).toLocaleUpperCase('tr-TR')+gunHam.slice(1),manuel=k.duzeltme?'<span class="magicpass-manuel-isaret" title="Giriş veya çıkış saati manuel değiştirildi">✎ MANUEL</span>':'',brutBaslik=k.brutMesai!==k.mesai?'Brüt fazla mesai: '+magicpassDakikaMetni(k.brutMesai):'',brut='',hamAdet=magicpassGunHamHareketleriBul(personel,k.tarih).length,sil=hamAdet&&!isPersonelUser()?'<button type="button" class="magicpass-gun-islem sil" data-html2canvas-ignore="true" title="Bu günün ham saat hareketlerini sil" onclick="magicpassGunHamHareketleriniSil(\''+k.tarih+'\')">🗑</button>':'';
            const secim=isPersonelUser()?'<span aria-hidden="true">—</span>':'<input class="magicpass-gun-sec" type="checkbox" aria-label="'+escapeDashboardText(tarihFormati(k.tarih))+' tarihini seç" onchange="magicpassGunSecildi(\''+k.tarih+'\',this.checked)">';
            return '<tr class="'+sinif.trim()+'" data-tarih="'+k.tarih+'" oncontextmenu="magicpassGunMenuAc(event,\''+k.tarih+'\')"><td data-label="Seç">'+secim+'</td><td class="magicpass-tarih-hucre" data-label="Tarih / Gün">'+tarihFormati(k.tarih)+'<small class="magicpass-tarih-gun">'+escapeDashboardText(gun)+'</small></td><td data-label="Vardiya"'+(k.fdHolidayNight?' data-fd-night-holiday="true"':'')+'>'+escapeDashboardText(fdAttendanceShiftDisplayLabel(k))+'</td><td data-label="Giriş">'+magicpassSaatHucresiHtml(k,'giris')+'</td><td data-label="Çıkış">'+magicpassSaatHucresiHtml(k,'cikis')+'</td><td data-label="Normal" title="Vardiya içinde çalışılan süre; tanımlı yemek arası düşülür">'+(tatilBos?'-':magicpassDakikaMetni(k.normal))+'</td><td data-label="Geç">'+(tatilBos?'-':magicpassDakikaMetni(k.gec))+'</td><td data-label="Erken">'+(tatilBos?'-':magicpassDakikaMetni(k.erken))+'</td><td data-label="Fazla Mesai">'+(tatilBos?'-':magicpassYapilanMesaiHucresiHtml(k))+'</td><td data-label="Toplam Çalışma" title="Normal çalışma ve fazla mesai toplamı">'+magicpassDakikaMetni(magicpassToplamCalismaDakikasi(k))+'</td><td data-label="Durum / Uyarı" style="position:relative;text-align:center"><span class="magicpass-durum-hizasi'+(['Tamam','Uyarı'].includes(String(k.durum||''))?' magicpass-tik-hizasi':'')+'" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;width:auto"><span class="magicpass-durum '+durumSinif+'" title="'+escapeDashboardText(uyariMetni||k.durum||'')+'">'+(eksik?'⚠ ':'')+escapeDashboardText(durumGosterimi)+'</span>'+manuel+'</span>'+uyarilar+'</td><td data-label="İşlem"><span class="magicpass-gun-islemler"><button type="button" class="magicpass-gun-islem duzenle" title="Giriş ve çıkış saatlerini düzenle" aria-label="Giriş ve çıkış saatlerini düzenle" onclick="magicpassGunDuzenle(\''+k.tarih+'\')">&#9998;</button>'+sil+'</span></td></tr>';
        }).join('');
        document.getElementById('magicpassOzet').innerHTML=magicpassAylikOzetHtml(liste);
        magicpassAylikTabloOzetiniEkle(tbody.closest('table'),liste,personel);
    };
},
function(){
magicpassAylikMesaiSaati=function(personel,ay,yil){
        if(!personel?.cihazPersonelNo)return 0;
        const ayDegeri=String(yil)+'-'+String(Number(ay)+1).padStart(2,'0'),liste=magicpassAylikCizelgeVerisi(personel,ayDegeri),toplam=alan=>liste.reduce((t,k)=>t+Number(k[alan]||0),0);
        return magicpassAylikPuantajMesaiHesabi(liste,ayDegeri).puantaj/60;
    };
},
function(){
window.fdAylikRaporKayitli=r=>fdAylikRaporKayitlari.has(r);
},
function(){
window.fdAylikRaporIptalEt=function(onlyInvalid=false){for(const r of [...fdAylikRaporKayitlari])if(!onlyInvalid||!r.current())r.cancel();if(!onlyInvalid)fdAylikRaporNesli++};
},
function(){
window.fdAylikRaporCagir=function(action,data,helpers,options={}){
 if(!window.fdAylikRaporYetkisi())return Promise.reject(Error('Aylık rapor yetkisi bulunamadı.'));
 const person=magicpassRaporPersoneli(),month=document.getElementById('magicpassAy'),personNode=document.getElementById('magicpassPersonel'),rootNode=document.getElementById('magicpassApp');
 if(!person)return Promise.reject(Error('Rapor personeli doğrulanamadı.'));
 const scope=fdWordBelgeBaglami(),epoch=fdAylikRaporNesli,selected=fdAttendanceSummaryExportScope(person,month?.value),signature=fdAylikRaporVeriImzasi(person),initialOutput=document.getElementById('fdOrtakCiktiOnizleme'),visible=rootNode&&getComputedStyle(rootNode).display!=='none';
 for(const r of [...fdAylikRaporKayitlari])if(!r.finished)r.cancel();let observer;
 const request={action,data,helpers,options:{...options},output:null,outputBlob:null,finished:false,cancelled:false,
 current(){return !request.cancelled&&fdAylikRaporKayitlari.has(request)&&epoch===fdAylikRaporNesli&&scope===fdWordBelgeBaglami()&&window.fdAylikRaporYetkisi()&&selected()&&month===document.getElementById('magicpassAy')&&personNode===document.getElementById('magicpassPersonel')&&(!visible||(rootNode===document.getElementById('magicpassApp')&&getComputedStyle(rootNode).display!=='none'))&&(!options.isCurrent||options.isCurrent())&&(request.finished||fdAylikRaporSon===request&&signature===fdAylikRaporVeriImzasi(person)&&(action!=='native'||helpers.library===window.XLSX&&helpers.sink===window.XLSX?.writeFile&&Object.entries(helpers.utils).every(([k,v])=>window.XLSX.utils[k]===v)))&&(request.output?(request.output.isConnected&&request.output===document.getElementById('fdOrtakCiktiOnizleme')&&request.output._blob===request.outputBlob):document.getElementById('fdOrtakCiktiOnizleme')===initialOutput)},
 cancel(){if(request.cancelled)return;request.cancelled=true;observer?.disconnect();if(request.output){if(request.output._url)URL.revokeObjectURL(request.output._url);request.output._blob=null;request.output.remove()}request.output=null;request.outputBlob=null;request.data=null;request.helpers=null;request.options=null;request.onCancel?.();request.onCancel=null;fdAylikRaporKayitlari.delete(request);if(fdAylikRaporSon===request)fdAylikRaporSon=null}};
 fdAylikRaporSon=request;fdAylikRaporKayitlari.add(request);observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(document.body,{childList:true});
 return(async()=>{try{const result=await FDModules.embedded('aylikrapor',[request],this);if(result?.ok===false&&result.error)throw result.error;if(!request.current())throw Error('Rapor seçimi değişti. Çıktıyı yeniden açın.');if(!result?.ok)throw Error('Aylık rapor bileşeni yüklenemedi.');request.finished=Boolean(request.output);return result.value}finally{request.data=null;request.helpers=null;request.options=null;if(!request.finished)request.cancel()}})();
};
},
function(){
magicpassAylikExcelAl=function(){
 const person=magicpassRaporPersoneli();if(!person)return showToast('Önce soldaki listeden personel seçin.','warning');if(typeof XLSX==='undefined')return showToast('Excel kütüphanesi yüklenemedi.','error');if(!window.fdAylikRaporYetkisi())return;
 const month=document.getElementById('magicpassAy').value,list=magicpassAylikCizelgeVerisi(person,month),library=XLSX;
 return window.fdAylikRaporCagir.call(this,'native',{person:structuredClone(person),month,list:structuredClone(list),filename:magicpassRaporDosyaAdi(person,'xlsx')},{library,sink:library.writeFile,utils:{...library.utils},tarihFormati,fdAttendanceShiftDisplayLabel,magicpassCalismaSaatleriMetni,magicpassDakikaMetni,magicpassYapilanMesaiDakikasi,magicpassToplamCalismaDakikasi,magicpassMesaiTurlerineGoreTopla,fdAttendanceSummaryWorkbook,fdAttendanceMonthlySummary});
};
},
function(){
magicpassAylikPdfAl=async function(){
        const personel=magicpassRaporPersoneli();
        if(!personel)return showToast('Önce soldaki listeden personel seçin.','warning');
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return showToast('PDF kütüphanesi yüklenemedi.','error');
        if(window.fdAttendanceReportLayout?.direct){
            const ay=String(document.getElementById('magicpassAy')?.value||''),isCurrent=fdAttendanceSummaryExportScope(personel,ay);
            try{const result=await window.fdAttendanceReportLayout.direct({filename:magicpassRaporDosyaAdi(personel,'pdf'),preview:true,isCurrent});if(isCurrent())showToast('Aylık giriş-çıkış listesi ve çalışma özeti ayrı sayfalarda hazırlandı.');return result;}
            catch(error){if(isCurrent())showToast('PDF oluşturulamadı: '+(error.message||error),'error');return;}
        }
        const ay=String(document.getElementById('magicpassAy')?.value||''),liste=magicpassAylikCizelgeVerisi(personel,ay),toplam=alan=>liste.reduce((t,k)=>t+Number(k[alan]||0),0);
        const fdSummary=fdAttendanceMonthlySummary(personel,liste,ay),fdSummaryIsCurrent=fdAttendanceSummaryExportScope(personel,ay);
        const hesap=magicpassMesaiTurlerineGoreTopla(liste),normal=toplam('normal'),gec=hesap.gec,erken=hesap.erken,brut=hesap.brut,net=hesap.toplam;
        const donem=ay?new Date(ay+'-01T12:00:00').toLocaleDateString('tr-TR',{month:'long',year:'numeric'}):'-';
        const satirlar=liste.map(k=>{
            const gunHam=new Date(k.tarih+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long'}),gun=gunHam.charAt(0).toLocaleUpperCase('tr-TR')+gunHam.slice(1);
            const tatil=k.gunTuru==='pazar',resmi=k.gunTuru==='resmiTatil',yarimResmi=k.gunTuru==='yarimResmiTatil',hata=['Giriş Yok','Çıkış Yok','Gelmedi'].includes(String(k.durum||'')),arka=resmi?'#fee2e2':(yarimResmi?'#fef3c7':(tatil?'#ffedd5':(hata?'#fff7ed':'#ffffff'))),durumRenk=hata?'#b91c1c':(resmi?'#b91c1c':(yarimResmi?'#92400e':(tatil?'#9a3412':'#166534')));
            const notlar=[];(k.uyarilar||[]).forEach(x=>{if(x&&!notlar.includes(x))notlar.push(x);});
            return '<tr style="background:'+arka+'"><td><strong>'+escapeDashboardText(tarihFormati(k.tarih))+'</strong></td><td>'+escapeDashboardText(gun)+'</td><td>'+escapeDashboardText(fdAttendanceShiftDisplayLabel(k))+'</td><td>'+magicpassSaatHucresiHtml(k,'giris')+'</td><td>'+magicpassSaatHucresiHtml(k,'cikis')+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(k.normal))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(k.gec))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(k.erken))+'</td><td>'+magicpassYapilanMesaiHucresiHtml(k)+'</td><td>'+magicpassDakikaMetni(magicpassToplamCalismaDakikasi(k))+'</td><td style="text-align:left"><strong style="color:'+durumRenk+'">'+escapeDashboardText(k.durum||'-')+'</strong>'+(notlar.length?'<small>'+escapeDashboardText(notlar.join(' · '))+'</small>':'')+'</td></tr>';
        }).join('');
        const rapor=document.createElement('div');
        rapor.style.cssText='position:fixed;left:0;top:0;z-index:2147483000;width:1240px;box-sizing:border-box;padding:16px 18px 13px;font-family:Arial,sans-serif;color:#0f172a;background:#fff;pointer-events:none;';
        rapor.innerHTML='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:9px;border-bottom:2px solid #0f766e;padding-bottom:8px"><div><div style="display:flex;align-items:center;gap:8px"><span style="width:5px;height:26px;border-radius:5px;background:#10b981"></span><h1 style="margin:0;font-size:20px;letter-spacing:.15px">AYLIK PERSONEL GİRİŞ–ÇIKIŞ RAPORU</h1></div><p style="margin:5px 0 0 13px;color:#475569;font-size:10.5px"><strong>'+escapeDashboardText(personel.ad||'-')+'</strong> · '+escapeDashboardText(personel.sube||'Merkez')+' · '+escapeDashboardText(personel.gorev||'-')+'</p></div><div style="min-width:150px;text-align:right"><span style="display:block;color:#64748b;font-size:8px;font-weight:800;text-transform:uppercase">Rapor Dönemi</span><strong style="display:block;margin-top:3px;font-size:13px">'+escapeDashboardText(donem)+'</strong></div></div>'+
        magicpassAylikPdfOzetHtml(liste)+'<table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:9px"><colgroup><col style="width:8%"><col style="width:8%"><col style="width:10%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:10%"><col style="width:10%"><col style="width:19%"></colgroup><thead><tr><th>Tarih</th><th>Gün</th><th>Vardiya</th><th>Giriş</th><th>Çıkış</th><th>Normal</th><th>Geç</th><th>Erken</th><th>Fazla Mesai</th><th>Toplam Çalışma</th><th>Durum / Açıklama</th></tr></thead><tbody>'+satirlar+'<tr class="toplam"><td colspan="5" style="text-align:right">TOPLAM</td><td>'+escapeDashboardText(magicpassDakikaMetni(normal))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(gec))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(erken))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(liste.reduce((t,k)=>t+magicpassYapilanMesaiDakikasi(k),0)))+'</td><td>'+escapeDashboardText(magicpassDakikaMetni(liste.reduce((t,k)=>t+magicpassToplamCalismaDakikasi(k),0)))+'</td><td style="text-align:left"></td></tr></tbody></table>'+
        '<div style="display:flex;justify-content:space-between;margin-top:6px;color:#64748b;font-size:7px"><span>Rapor oluşturma: '+escapeDashboardText(new Date().toLocaleString('tr-TR'))+'</span><span>FD YAZILIM</span></div>';
        const pdfSutunGenislikleri=[8,8,10,7,7,7,7,7,10,10,19];
        rapor.querySelectorAll('col').forEach((sutun,index)=>{if(pdfSutunGenislikleri[index])sutun.style.width=pdfSutunGenislikleri[index]+'%';});
        rapor.querySelectorAll('th').forEach(x=>x.style.cssText='padding:5px 4px;border:1px solid #94a3b8;background:#dbeafe;color:#1e3a8a;text-align:center;font-size:8px;font-weight:900');
        rapor.querySelectorAll('td').forEach(x=>x.style.cssText+=';padding:2px 4px;border:1px solid #cbd5e1;text-align:center;vertical-align:middle;line-height:1.05');
        rapor.querySelectorAll('td small').forEach(x=>x.style.cssText='display:inline;margin-left:4px;color:#64748b;font-size:6.4px;line-height:1');rapor.querySelectorAll('tbody td:last-child').forEach(x=>x.style.textAlign='left');
        rapor.querySelectorAll('tr.toplam td').forEach(x=>x.style.cssText+=';background:#e0f2fe;color:#0c4a6e;font-weight:900;padding-top:5px;padding-bottom:5px');
        document.body.appendChild(rapor);
        showGlobalOverlay('PDF hazırlanıyor','Aylık liste ve ayrıntılı çalışma özeti hazırlanıyor...');
        try{
            if(document.fonts?.ready)await document.fonts.ready;
            const canvas=await html2canvas(rapor,{scale:2,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:rapor.scrollWidth,height:rapor.scrollHeight,windowWidth:Math.max(rapor.scrollWidth,1280),windowHeight:Math.max(rapor.scrollHeight,800)});
            if(!canvas.width||!canvas.height)throw new Error('Rapor görüntüsü boş oluştu.');
            const pdf=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a3',compress:true}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=5,oran=Math.min((pw-m*2)/canvas.width,(ph-m*2)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;
            pdf.addImage(canvas.toDataURL('image/jpeg',.98),'JPEG',(pw-w)/2,m,w,h,undefined,'FAST');
            await fdAttendanceSummaryPdfPage(pdf,fdSummary,personel,ay,fdSummaryIsCurrent);
            if(!fdSummaryIsCurrent())throw Error('Oturum veya rapor seçimi değişti; çıktı durduruldu.');
            const ad=magicpassRaporDosyaAdi(personel,'pdf'),blob=pdf.output('blob');
            if(typeof fdCiktiPdfOnizle==='function')await fdCiktiPdfOnizle(blob,ad);else pdf.save(ad);
            showToast('Aylık giriş–çıkış PDF raporu yenilenen tasarımla hazırlandı.');
        }catch(error){showToast('PDF oluşturulamadı: '+(error.message||error),'error');}
        finally{rapor.remove();hideGlobalOverlay();}
    };
},
function(){
magicpassGunHesapla = function(personel, tarihKey) {
        const sonuc = fdMagicpassGunHesaplaPazarOncesi(personel, tarihKey);
        if (sonuc.gunTuru !== 'pazar' || sonuc.giris || sonuc.cikis) return sonuc;
        const kontrol = fdMagicpassPazarHakkiKontrolEt(personel, tarihKey);
        if (kontrol.hakEtti && !fdPuantajPazarIkiYanDevamsiz(personel, tarihKey)) return sonuc;
        return {
            ...sonuc,
            pazarHakkiYok:true,
            durum:'Gelmedi',
            seviye:'hata',
            uyarilar:[]
        };
    };
},
function(){
magicpassAylikCizelgeyiCiz = function() {
        fdMagicpassAylikCizelgeyiCizManuelOncesi();
        const personel = personeller.find(p => String(p.id) === String(document.getElementById('magicpassPersonel')?.value));
        if (!personel) return;

        document.querySelectorAll('#magicpassAylikTablo tbody tr[data-tarih]').forEach(satir => {
            const isaret = satir.querySelector('.magicpass-manuel-isaret');
            if (!isaret) return;
            isaret.className = 'magicpass-manuel-kalem';
            isaret.textContent = '✎';
            isaret.title = 'Cihazdaki gerçek saat ile manuel düzeltilen saati karşılaştır';
            isaret.setAttribute('role', 'button');
            isaret.setAttribute('aria-label', 'Manuel saat düzeltmesini göster');
            isaret.tabIndex = 0;
            const ac = event => {
                event.stopPropagation();
                magicpassManuelKarsilastirmaAc(personel.id, satir.dataset.tarih);
            };
            isaret.onclick = ac;
            isaret.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ac(event); }
            };
            const islemler = satir.querySelector('td[data-label="İşlem"] .magicpass-gun-islemler');
            if (islemler) {
                islemler.classList.add('has-manuel');
                islemler.prepend(isaret);
            }
        });

        const liste = magicpassAylikCizelgeVerisi(personel);
        const gelmedi = liste.filter(k => k.durum === 'Gelmedi' || k.pazarHakkiYok).length;
        const ozetDegeri = document.querySelector('#magicpassOzet [data-magicpass-metrik="gelmedi"] strong');
        if (ozetDegeri) ozetDegeri.textContent = String(gelmedi);
    };
},
function(){
workspaceSekmesiniAktifEt = function(hedef) {
        if (hedef !== 'giriscikis') {
            const magicpassApp = document.getElementById('magicpassApp');
            if (magicpassApp) magicpassApp.style.display = 'none';
            magicpassManuelKarsilastirmaKapat();
        }
        return fdWorkspaceSekmesiniAktifEtMagicpassOncesi(hedef);
    };
},
function(){
magicpassPuantajaAktar = async function() {
        if(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))return showToast('Puantaja aktarım yetkiniz yok.','warning');
        const ayMetni = document.getElementById('magicpassAy')?.value;
        if (!ayMetni) return;
        const oturum=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]),guncel=()=>oturum===JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])&&document.getElementById('magicpassAy')?.value===ayMetni,planlar=[];
        const tarih = ayMetni + '-00';
        const aktifler = personeller.filter(p => aktifSirketeAit(p) && !p.cikisTarihi && magicpassTopluSaatAydaKayitVarMi(p, ayMetni));
        let aktarilan = 0;
        let atlanan = 0;

        aktifler.forEach(personel => {
            const liste = magicpassAylikCizelgeVerisi(personel, ayMetni);
            const hesap = magicpassAylikPuantajMesaiHesabi(liste, ayMetni);
            const aylikNetDakika = hesap.toplam;
            const yuvarlanmis = hesap.puantaj / 60;
            const mevcut = puantajVerileri.find(k =>
                k.kayitTipi === 'maasOzet' &&
                String(k.pId) === String(personel.id) &&
                String(k.tarih) === tarih &&
                String(k.sirketId || '') === aktifSirketId()
            );
            if (mevcut && String(mevcut.fazlaMesaiSaatiManuel) === 'true') {
                atlanan++;
                return;
            }
            const mesaiAlanlari=ayMetni>='2026-10'?fdPuantajMesaiAlanlari(personel,Number(ayMetni.slice(5))-1,Number(ayMetni.slice(0,4)),{ozet:mevcut||{},liste,hesap}):null;
            const yeni = {
                ...(mevcut || {}),
                pId:String(personel.id),
                tarih,
                durum:'MAAS_OZET',
                kayitTipi:'maasOzet',
                sirketId:aktifSirketId(),
                fazlaMesaiSaati:mesaiAlanlari?mesaiAlanlari.fazlaMesaiSaati:yuvarlanmis,
                fazlaMesaiSaatiManuel:'false',
                fazlaMesaiKaynagi:'MagicPass',
                ...(ayMetni>='2026-10'?{
                    fazlaMesaiHesapSurumu:'turler-v3',
                    mesaiMahsupYontemi:mesaiAlanlari.yontem,
                    ...(String(mevcut?.pazarMesaiSaatiManuel)!=='true'?{pazarMesaiSaati:mesaiAlanlari.pazarMesaiSaati}:{}),
                    ...(String(mevcut?.resmiTatilMesaiSaatiManuel)!=='true'?{resmiTatilMesaiSaati:mesaiAlanlari.resmiTatilMesaiSaati}:{})
                }:{}),
                fazlaMesaiHamDakika:aylikNetDakika
            };
            planlar.push({once:mevcut?JSON.parse(JSON.stringify(mevcut)):null,sonra:yeni});
            aktarilan++;
        });

        try{await fdMesaiAktariminiKaydet(planlar,guncel)}catch(error){if(guncel())showToast((error.fdMesaiOnaylanan?error.fdMesaiOnaylanan+' personel doğrulandı; kalan aktarım tamamlanamadı. ':'Mesai aktarımı tamamlanamadı. ')+String(error.message||error),'error');return false}
        if(!guncel())return false;
        renderPuantajMatrisi();
        showToast(
            aktarilan + ' personelin aylık net mesaisi, hafta içi, pazar ve resmî tatil saatleri ayrı ayrı yukarı yuvarlanarak puantaja aktarıldı.' +
            (atlanan ? ' ' + atlanan + ' personelin manuel mesaisi korundu.' : ''),
            'success'
        );
    };
},
function(){
magicpassHaftalikVardiyaBul=function(personel,tarihKey){return fdMagicpassHaftalikVardiyaBilgisi(personel,tarihKey)?.vardiya||'';};
},
function(){
magicpassGunVardiyasi=function(personel,tarihKey){
        const atama=magicpassKayitlari('vardiyaAtama').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===String(tarihKey)).sort((a,b)=>Number(b.zaman||0)-Number(a.zaman||0))[0];
        const haftalik=fdMagicpassHaftalikVardiyaBilgisi(personel,tarihKey);
        if(haftalik&&Number(haftalik.zaman||0)>=Number(atama?.zaman||0))return haftalik.vardiya;
        return atama?.vardiya||haftalik?.vardiya||fdVardiyaVarsayilanGunduzId();
    };
},
function(){
magicpassSekmeAc=function(tabId,button){fdMagicpassSekmeAcGunlukOncesi(tabId,button);if(tabId==='magicpass-tab-gunluk')return fdGunlukRaporAc();};
},
function(){
magicpassAylikMesaiSaati=function(personel,ay,yil){
        const ayDegeri=String(yil)+'-'+String(Number(ay)+1).padStart(2,'0');if(!magicpassTopluSaatAydaKayitVarMi(personel,ayDegeri))return 0;
        const liste=magicpassAylikCizelgeVerisi(personel,ayDegeri),toplam=alan=>liste.reduce((t,k)=>t+Number(k[alan]||0),0);
        return magicpassAylikPuantajMesaiHesabi(liste,ayDegeri).puantaj/60;
    };
},
function(){
magicpassVardiyaAyarFormunuDoldur();
},
function(){
magicpassGunHesapla=function(personel,tarihKey){
        const iseGiris=String(personel?.girisTarihi||'').slice(0,10);
        if(iseGiris&&String(tarihKey)<iseGiris)return{tarih:String(tarihKey),vardiya:'',giris:null,cikis:null,normal:0,gec:0,erken:0,brutMesai:0,mesai:0,durum:'İşe Başlamadı',seviye:'tamam',uyarilar:[],istihdamDisi:true};
        const temel=fdMagicpassPuantajEsitlemeOncesi(personel,tarihKey);
        if(temel?.izin&&temel.izin.kaynak!=='puantaj')return temel;
        const manuel=fdPuantajManuelGunKaydi(personel,tarihKey);if(!manuel?.durum)return temel;
        const kod=String(manuel.durum).toUpperCase(),izinAdlari={Y:'Yıllık İzin',R:'Sağlık / Rapor',Z:'Ücretsiz İzin','Ü':'Ücretli İzin'};
        if(izinAdlari[kod])return{...temel,giris:null,cikis:null,normal:0,gec:0,erken:0,brutMesai:0,mesai:0,izin:{tur:izinAdlari[kod],kaynak:'puantaj'},izinAdi:izinAdlari[kod],durum:izinAdlari[kod],seviye:'tamam',uyarilar:[],puantajManuel:true};
        if(kod==='M')return{...temel,giris:null,cikis:null,normal:0,gec:0,erken:0,brutMesai:0,mesai:0,durum:'Gelmedi',seviye:'hata',uyarilar:[],puantajManuel:true};
        if(kod==='HS'||kod==='RT'){
            if(kod==='HS'&&temel?.pazarHakkiYok)return{...temel,puantajManuel:true};
            return{...temel,giris:null,cikis:null,normal:0,gec:0,erken:0,brutMesai:0,mesai:0,gunTuru:kod==='HS'?'pazar':'resmiTatil',tatilAdi:kod==='HS'?'Pazar / Hafta Tatili':magicpassResmiTatilAdi(tarihKey),durum:kod==='HS'?'Pazar / Hafta Tatili':magicpassResmiTatilAdi(tarihKey),seviye:'tamam',uyarilar:[],puantajManuel:true};
        }
        if(!['X','PZ','RC'].includes(kod)||temel.giris||temel.cikis)return{...temel,puantajManuel:true};
        const vardiya=temel.vardiya||magicpassGunVardiyasi(personel,tarihKey),saatler=magicpassVardiyaSaatleri(vardiya,tarihKey),giris=new Date(saatler.bas),cikis=new Date(saatler.bit);
        let normal=Math.max(0,Math.round((cikis-giris)/60000));if(typeof magicpassAralikDakikasi==='function')normal=Math.max(0,normal-magicpassAralikDakikasi(giris,cikis,saatler.yemekBas,saatler.yemekBit));
        return{...temel,vardiya,giris,cikis,normal,gec:0,erken:0,brutMesai:0,mesai:0,durum:kod==='PZ'?'Pazar Çalışması':kod==='RC'?'Resmî Tatil Çalışması':'Çalıştı',seviye:'tamam',uyarilar:[],puantajManuel:true};
    };
},
function(){
magicpassGunHesapla=function(personel,tarihKey){
        const sonuc=fdMagicpassArefeOncesi(personel,tarihKey);if(!magicpassYarimGunResmiTatilMi(tarihKey)||sonuc?.izin||sonuc?.istihdamDisi)return sonuc;
        const vardiya=sonuc?.vardiya||magicpassGunVardiyasi(personel,tarihKey),normal=magicpassArefeSabahDakikasi(tarihKey,vardiya),calismaAraliklari=((sonuc?.giris||sonuc?.cikis)?(sonuc?.calismaAraliklari?.length?sonuc.calismaAraliklari:[{giris:sonuc?.giris,cikis:sonuc?.cikis}]):[]).map(a=>({...a,brutMesai:0,mesai:magicpassArefeResmiTatilDakikasi(tarihKey,a.giris,a.cikis)})),resmiTatilMesaiDakika=calismaAraliklari.reduce((t,a)=>t+a.mesai,0),uyarilar=[];
        if(calismaAraliklari.some(a=>a.giris&&!a.cikis))uyarilar.push('Çıkış Yok');if(calismaAraliklari.some(a=>!a.giris&&a.cikis))uyarilar.push('Giriş Yok');
        return{...sonuc,vardiya,gunTuru:'yarimResmiTatil',tatilAdi:magicpassResmiTatilAdi(tarihKey),normal,gec:0,erken:0,brutMesai:0,mesai:resmiTatilMesaiDakika,resmiTatilMesaiDakika,calismaAraliklari,durum:'Öğleden Sonra Resmî Tatil',seviye:uyarilar.length?'uyari':'tamam',uyarilar};
    };
},
function(){
magicpassGunHesapla = function(personel, tarihKey) {
        const hesapla=()=>{
            const sonuc=fdAttendanceHolidayNightProjection(personel,tarihKey,magicpassYarimTatilFiiliHesapla(personel,tarihKey,fdMagicpassGunHesaplaHam(personel,tarihKey)));
            if(!sonuc.duzeltme&&sonuc.hareketler?.length===1&&String(tarihKey)>='2026-10-01'&&(sonuc.giris||sonuc.cikis)){
                const yon=sonuc.giris?'giris':'cikis',etiket='Tek basış: vardiyaya göre '+(yon==='giris'?'giriş':'çıkış')+' tahmini';
                return {...sonuc,tekBasisTahmini:yon,uyarilar:[...new Set([...(sonuc.uyarilar||[]),etiket])]};
            }
            return sonuc;
        };
        if (!fdPuantajHizliHesapCache) return hesapla();
        const anahtar = `${String(personel?.id || '')}|${String(tarihKey || '')}`;
        if (!fdPuantajHizliHesapCache.has(anahtar)) fdPuantajHizliHesapCache.set(anahtar, hesapla());
        return fdPuantajHizliHesapCache.get(anahtar);
    };
},
function(){
magicpassGunTuruBul = function(personel, tarihKey) {
        if (!fdPuantajHizliGunTuruCache) return fdMagicpassGunTuruBulHam(personel, tarihKey);
        const anahtar = `${String(personel?.id || '')}|${String(tarihKey || '')}`;
        if (!fdPuantajHizliGunTuruCache.has(anahtar)) fdPuantajHizliGunTuruCache.set(anahtar, fdMagicpassGunTuruBulHam(personel, tarihKey));
        return fdPuantajHizliGunTuruCache.get(anahtar);
    };
}
]);

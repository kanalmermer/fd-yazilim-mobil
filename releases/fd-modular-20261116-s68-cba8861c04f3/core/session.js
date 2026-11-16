function kullaniciOturumTarihSaat(zaman) {
        if (!zaman) return '-';
        const tarih = new Date(zaman);
        return Number.isNaN(tarih.getTime()) ? '-' : tarih.toLocaleString('tr-TR', { dateStyle:'short', timeStyle:'medium' });
    }

function kullaniciOturumBitisBilgisi(oturum, simdi = Date.now()) {
        const giris = new Date(oturum?.signed_in_at || '').getTime();
        const sonEtkinlik = new Date(oturum?.last_seen_at || oturum?.signed_in_at || '').getTime();
        const kayitliCikis = new Date(oturum?.signed_out_at || '').getTime();
        const sonEtkinlikVar = Number.isFinite(sonEtkinlik);
        const cikisVar = Number.isFinite(kayitliCikis);
        const aktif = !oturum?.signed_out_at && sonEtkinlikVar && simdi - sonEtkinlik <= KULLANICI_OTURUM_AKTIFLIK_ESIGI;
        const tutarliCikis = cikisVar && (!sonEtkinlikVar || Math.abs(kayitliCikis - sonEtkinlik) <= KULLANICI_OTURUM_TUTARSIZ_CIKIS_ESIGI);
        if (aktif) return { zaman:oturum.last_seen_at || oturum.signed_in_at, tur:'aktif' };
        if (tutarliCikis) return { zaman:oturum.signed_out_at, tur:'cikis' };
        return { zaman:sonEtkinlikVar ? (oturum.last_seen_at || oturum.signed_in_at) : (cikisVar ? oturum.signed_out_at : (Number.isFinite(giris) ? oturum.signed_in_at : '')), tur:'otomatik' };
    }

function kullaniciOturumBitisMetni(oturum, simdi = Date.now()) {
        const bilgi = kullaniciOturumBitisBilgisi(oturum, simdi);
        const onEk = bilgi.tur === 'aktif' ? 'Aktif · Son görülme: ' : (bilgi.tur === 'cikis' ? 'Çıkış: ' : 'Son etkinlik: ');
        return onEk + kullaniciOturumTarihSaat(bilgi.zaman) + (bilgi.tur === 'otomatik' ? ' · otomatik kapandı' : '');
    }

async function kullaniciOturumKalpAtisi() {
        if (!SUPABASE_MODE || !supabaseClient || !activeUser?.supabaseUserId || !aktifKullaniciOturumId) return;
        const { error } = await supabaseClient.from('portal_user_sessions').update({ last_seen_at:new Date().toISOString(), signed_out_at:null })
            .eq('id', aktifKullaniciOturumId).eq('user_id', activeUser.supabaseUserId);
        if (error) throw error;
    }

function kullaniciOturumKalpAtisiniBaslat() {
        if (kullaniciOturumKalpAtisiZamanlayici) clearInterval(kullaniciOturumKalpAtisiZamanlayici);
        kullaniciOturumKalpAtisiZamanlayici = setInterval(() => {
            kullaniciOturumKalpAtisi().then(() => {
                if (activeUser?.rol === 'Admin' && document.getElementById('appHub')?.style.display !== 'none' && document.getElementById('adminSessionPanel')?.open) kullaniciOturumPaneliniYukle(false);
            }).catch(error => console.warn('Oturum durumu güncellenemedi:', error));
        }, 45000);
    }

async function kullaniciOturumunuBaslat() {
        if (!SUPABASE_MODE || !supabaseClient || !activeUser?.supabaseUserId || !activeUser?.sirketId) return;
        try {
            const { data:oturumVerisi } = await supabaseClient.auth.getSession();
            aktifKullaniciOturumToken = String(oturumVerisi?.session?.access_token || '');
            let oturum = null;
            try { oturum = JSON.parse(sessionStorage.getItem(KULLANICI_OTURUM_ANAHTARI) || 'null'); } catch (_) {}
            if (!oturum?.id || String(oturum.userId || '') !== String(activeUser.supabaseUserId)) {
                oturum = { id:crypto.randomUUID(), userId:activeUser.supabaseUserId, signedInAt:new Date().toISOString() };
                sessionStorage.setItem(KULLANICI_OTURUM_ANAHTARI, JSON.stringify(oturum));
            }
            aktifKullaniciOturumId = oturum.id;
            const kayit = {
                id:oturum.id, company_id:activeUser.sirketId, user_id:activeUser.supabaseUserId,
                employee_legacy_id:String(activeUser.tcNo || ''), username:String(activeUser.yetkiKullaniciAdi || activeUser.username || ''),
                role:String(activeUser.rol || ''), signed_in_at:oturum.signedInAt, last_seen_at:new Date().toISOString(),
                signed_out_at:null, user_agent:String(navigator.userAgent || '').slice(0, 500)
            };
            const { error } = await supabaseClient.from('portal_user_sessions').upsert(kayit, { onConflict:'id' });
            if (error) throw error;
            kullaniciOturumKalpAtisiniBaslat();
        } catch (error) {
            console.warn('Kullanıcı oturum kaydı başlatılamadı:', error);
        }
    }

async function kullaniciOturumunuKapat() {
        if (kullaniciOturumKalpAtisiZamanlayici) clearInterval(kullaniciOturumKalpAtisiZamanlayici);
        kullaniciOturumKalpAtisiZamanlayici = null;
        if (SUPABASE_MODE && supabaseClient && activeUser?.supabaseUserId && aktifKullaniciOturumId) {
            try {
                const simdi = new Date().toISOString();
                const { error } = await supabaseClient.from('portal_user_sessions').update({ last_seen_at:simdi, signed_out_at:simdi })
                    .eq('id', aktifKullaniciOturumId).eq('user_id', activeUser.supabaseUserId);
                if (error) throw error;
            } catch (error) { console.warn('Kullanıcı çıkış zamanı kaydedilemedi:', error); }
        }
        aktifKullaniciOturumId = '';
        aktifKullaniciOturumToken = '';
        sessionStorage.removeItem(KULLANICI_OTURUM_ANAHTARI);
    }

function kullaniciOturumSayfasiniDegistir(adim) {
        const yeniSayfa = Math.max(0, Math.min(kullaniciOturumToplamSayfa - 1, kullaniciOturumSayfasi + Number(adim || 0)));
        if (yeniSayfa === kullaniciOturumSayfasi) return;
        kullaniciOturumSayfasi = yeniSayfa;
        kullaniciOturumPaneliniYukle(false);
    }

async function kullaniciOturumPaneliniYukle(bildirimGoster = false) {
        const panel = document.getElementById('adminSessionPanel');
        const body = document.getElementById('adminSessionBody');
        if (!panel || !body) return;
        const adminMi = activeUser?.rol === 'Admin';
        panel.style.display = adminMi ? 'block' : 'none';
        if (!adminMi || !SUPABASE_MODE || !supabaseClient) return;
        if (bildirimGoster) {
            kullaniciOturumSayfasi = 0;
            body.innerHTML = '<div class="dashboard-empty">Oturum bilgileri yenileniyor...</div>';
        }
        try {
            const simdi = new Date();
            const birAyOnce = new Date(simdi);
            birAyOnce.setDate(birAyOnce.getDate() - 30);
            const baslangic = kullaniciOturumSayfasi * KULLANICI_OTURUM_SAYFA_BOYUTU;
            const bitis = baslangic + KULLANICI_OTURUM_SAYFA_BOYUTU - 1;
            const { data, error, count } = await supabaseClient.from('portal_user_sessions')
                .select('id,user_id,employee_legacy_id,username,role,signed_in_at,last_seen_at,signed_out_at', { count:'exact' })
                .eq('company_id', aktifSirketId())
                .gte('signed_in_at', birAyOnce.toISOString())
                .order('signed_in_at', { ascending:false })
                .range(baslangic, bitis);
            if (error) throw error;
            kullaniciOturumToplamSayfa = Math.max(1, Math.ceil(Number(count || 0) / KULLANICI_OTURUM_SAYFA_BOYUTU));
            if (kullaniciOturumSayfasi >= kullaniciOturumToplamSayfa) {
                kullaniciOturumSayfasi = kullaniciOturumToplamSayfa - 1;
                return kullaniciOturumPaneliniYukle(false);
            }
            const aktifEsigi = new Date(simdi.getTime() - KULLANICI_OTURUM_AKTIFLIK_ESIGI).toISOString();
            const { data:aktifKayitlar, error:aktifHatasi } = await supabaseClient.from('portal_user_sessions')
                .select('user_id').eq('company_id', aktifSirketId()).is('signed_out_at', null).gte('last_seen_at', aktifEsigi);
            if (aktifHatasi) throw aktifHatasi;
            const aktifSayisi = new Set((aktifKayitlar || []).map(k => String(k.user_id))).size;
            document.getElementById('adminSessionActiveCount').textContent = `${aktifSayisi} aktif`;
            const satirlar = (data || []).map(oturum => {
                const tc = String(oturum.employee_legacy_id || '');
                const hesap = kullanicilar.find(k => String(k.supabaseUserId || k.id || '') === String(oturum.user_id) || (tc && String(k.tcNo || '') === tc));
                const personelTc = tc || String(hesap?.tcNo || '');
                const personel = personeller.find(p => String(p.id) === personelTc && aktifSirketeAit(p));
                const sonGorulme = new Date(oturum.last_seen_at || oturum.signed_in_at).getTime();
                const aktif = !oturum.signed_out_at && Number.isFinite(sonGorulme) && simdi.getTime() - sonGorulme <= KULLANICI_OTURUM_AKTIFLIK_ESIGI;
                return { ...oturum, personelTc, personelAdi:personel?.ad || hesap?.ad || oturum.username || 'Kullanıcı', aktif };
            });
            const tablo = satirlar.length ? `<table class="admin-session-table"><thead><tr><th>Durum</th><th>Personel / Kullanıcı</th><th>T.C. Kimlik No</th><th>Kullanıcı Adı</th><th>Rol</th><th>Giriş</th><th>Çıkış / Son Etkinlik</th></tr></thead><tbody>${satirlar.map(s => `<tr><td><span class="session-state ${s.aktif ? 'active' : 'closed'}">${s.aktif ? '● AKTİF' : '○ KAPALI'}</span></td><td><strong>${escapeDashboardText(s.personelAdi)}</strong></td><td>${escapeDashboardText(s.personelTc || '-')}</td><td>${escapeDashboardText(s.username || '-')}</td><td>${escapeDashboardText(s.role === 'Yonetici' ? 'Kullanıcı' : (s.role || '-'))}</td><td>${kullaniciOturumTarihSaat(s.signed_in_at)}</td><td>${kullaniciOturumBitisMetni(s, simdi.getTime())}</td></tr>`).join('')}</tbody></table>` : '<div class="dashboard-empty">Son 1 ay içinde kayıtlı kullanıcı oturumu bulunmuyor.</div>';
            const sayfalama = `<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 4px 2px;flex-wrap:wrap;"><small style="margin-right:auto;color:#64748b;">Son 1 ay · ${Number(count || 0)} kayıt</small><button type="button" class="btn-modern" onclick="kullaniciOturumSayfasiniDegistir(-1)" ${kullaniciOturumSayfasi === 0 ? 'disabled' : ''}>← Önceki</button><strong style="font-size:.78rem;color:#334155;">${kullaniciOturumSayfasi + 1} / ${kullaniciOturumToplamSayfa}</strong><button type="button" class="btn-modern" onclick="kullaniciOturumSayfasiniDegistir(1)" ${kullaniciOturumSayfasi + 1 >= kullaniciOturumToplamSayfa ? 'disabled' : ''}>Sonraki →</button></div>`;
            body.innerHTML = tablo + sayfalama;
            if (bildirimGoster) showToast('Kullanıcı oturumları yenilendi.');
        } catch (error) {
            console.warn('Kullanıcı oturumları yüklenemedi:', error);
            body.innerHTML = '<div class="dashboard-empty" style="color:#b45309;">Oturum takibi tablosu henüz kurulmamış olabilir. supabase-kullanici-oturumlari.sql dosyasını bir kez çalıştırın.</div>';
        }
    }

async function supabaseOturumuAc(kullanici, secilenSirketId = '') {
        const { data: profil, error } = await supabaseClient.from('profiles').select('id,company_id,employee_legacy_id,role,full_name,must_change_password').eq('id', kullanici.id).maybeSingle();
        if (error) throw error;
        if (!profil?.company_id) throw new Error('Bu kullanıcı henüz bir şirkete bağlanmamış. Yönetici tarafından kullanıcı yönetiminden tanımlanmalıdır.');
        if (secilenSirketId && String(profil.company_id) !== String(secilenSirketId)) {
            throw new Error('Bu kullanıcı seçilen şirkete tanımlı değil. Şirket seçimini kontrol edin.');
        }
        supabaseProfile = profil;
        const isgHesabi = ['IsgUzmani','IsyeriHekimi'].includes(profil.role);
        const { data: sirket } = isgHesabi ? {data:null} : await supabaseClient.from('companies').select('id,short_name,title').eq('id', profil.company_id).maybeSingle();
        activeUser = { username: profil.full_name || kullanici.email, yetkiKullaniciAdi:String(kullanici.email || '').split('@')[0], rol: profil.role || 'Personel', tcNo: String(profil.employee_legacy_id || ''), sirketId: profil.company_id, sirketAdi: sirket?.short_name || sirket?.title || '', supabaseUserId: kullanici.id, sifreDegismeli:Boolean(profil.must_change_password) };
        if (!isgHesabi && fdPortalBellekOturumu !== fdPortalVeriOturumu()) {
            window.fdPortalPrivateMemoryClear?.({ preserveCache:true });
            fdPortalBellekOturumu = fdPortalVeriOturumu();
            veriOnbelleginiYukle();
        }
        if (profil.role === 'Admin' && String(kullanici.email || '').toLowerCase() === 'admin@kanalportal.local') {
            try {
                const { data: epostaSonucu, error: epostaHatasi } = await supabaseClient.functions.invoke('manage-user', {
                    body: { action:'rename-current-admin-email', username:'admin', companyId:profil.company_id }
                });
                if (epostaHatasi || !epostaSonucu?.success) throw epostaHatasi || new Error(epostaSonucu?.message || 'Admin e-postası güncellenemedi.');
                showToast('Admin hesabı admin@fd-yazilim.local olarak güncellendi.');
            } catch (epostaGecisHatasi) {
                console.warn('Admin e-posta hesabı otomatik güncellenemedi:', epostaGecisHatasi);
            }
        }
        sessionStorage.setItem('loggedInUser', JSON.stringify(activeUser));
        await kullaniciOturumunuBaslat();
        if (isgHesabi) await window.fdIsgPrepareSession();
        else {
            await supabaseVerileriniYukle('baslangic');
            await supabaseKullanicilariYukle();
        }
        const acikModulKorunacak = typeof fdAktifUygulamaSekmesi !== 'undefined' && fdAktifUygulamaSekmesi !== 'home' && Boolean(fdGorunenUygulamaAlaniniBul());
        if (acikModulKorunacak) fdSekmeCubugunuGuncelle();
        else showHub();
        if (!isgHesabi) initUI();
        setTimeout(()=>window.fdBekleyenBildirimiGoster?.(),350);
        if ((['Personel','Yonetici'].includes(activeUser.rol) || isgHesabi) && activeUser.sifreDegismeli) setTimeout(zorunluSifreModaliniGoster, 50);
    }

async function supabaseKayitliOturumuGeriYukle() {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            // Kullanıcı giriş formunu gönderirken daha önceki oturumun eş zamanlı
            // olarak ekranı açmasına izin verme. Parola sonucu tek belirleyici olsun.
            if (supabaseManuelGirisBaslatildi) return false;
            if (!data?.session?.user) {
                sessionStorage.removeItem('loggedInUser');
                activeUser = null;
                showHub();
                return false;
            }
            await supabaseOturumuAc(data.session.user, '');
            return true;
        } catch (error) {
            console.warn('Kayıtlı oturum geri yüklenemedi:', error);
            sessionStorage.removeItem('loggedInUser');
            activeUser = null;
            showHub();
            return false;
        }
    }

function loginSirketOnbelleginiYukle() {
        if (sirketler.length) return;
        try {
            const onbellek = JSON.parse(localStorage.getItem('loginSirketOnbellegi') || '[]');
            if (Array.isArray(onbellek)) sirketler = onbellek;
        } catch (e) {
            localStorage.removeItem('loginSirketOnbellegi');
        }
    }

function populateLoginCompanySelect(yukleniyor = false) {
        const select = document.getElementById('loginCompany');
        if (!select) return;
        const rememberedCompanyId = localStorage.getItem('rememberedCompanyId') || '';
        const rememberedCompanyName = localStorage.getItem('rememberedCompanyName') || '';
        const lastCompanyId = localStorage.getItem('lastSelectedCompanyId') || '';
        const lastCompanyName = localStorage.getItem('lastSelectedCompanyName') || '';
        const current = rememberedCompanyId || lastCompanyId || select.value;
        select.required = sirketler.length > 0;
        const oncekiFirmaId = rememberedCompanyId || lastCompanyId;
        const oncekiFirmaAd = rememberedCompanyName || lastCompanyName;
        select.innerHTML = sirketler.length
            ? '<option value="">Şirket seçin</option>' + sirketler.map(item => `<option value="${sirketText(item.id)}">${sirketText(item.kisaAd || item.unvan)}</option>`).join('')
            : (oncekiFirmaId
                ? `<option value="${sirketText(oncekiFirmaId)}">${sirketText(oncekiFirmaAd || 'Son kullanılan firma')}</option>`
                : `<option value="">${yukleniyor ? 'Şirket bilgileri yükleniyor...' : 'Kayıtlı şirket bulunmuyor'}</option>`);
        if (current && sirketler.some(item => String(item.id) === String(current))) {
            select.value = current;
        } else if (rememberedCompanyName || lastCompanyName) {
            const match = sirketler.find(item => String(item.kisaAd || item.unvan) === (rememberedCompanyName || lastCompanyName));
            if (match) select.value = String(match.id);
        }
        if (!sirketler.length && oncekiFirmaId) select.value = oncekiFirmaId;
        if (select.value) {
            localStorage.setItem('lastSelectedCompanyId', select.value);
            localStorage.setItem('lastSelectedCompanyName', select.options[select.selectedIndex]?.text || '');
        }
        girisKullaniciTipiniGuncelle();
    }

async function supabaseGirisSirketleriniYukle() {
        if (!SUPABASE_MODE) return;
        // Giriş, şirket liste servisi yavaşladığında veya tarayıcı isteği
        // engellediğinde beklemesin. Bu kurulumun doğrulanmış şirketi anında
        // gösterilir; RPC yanıtı geldiğinde liste yine sunucudan yenilenir.
        const varsayilanSirket = {
            id: '6f04d1b9-95c9-4504-95d0-3392163a8e96',
            kisaAd: 'KANAL MERMER',
            unvan: 'KANAL MERMER MAD.NAK.İNŞ.GD.TAR.HAYV.SAN.TİC.LTD.ŞTİ.'
        };
        if (!sirketler.some(item => String(item.id || '') === varsayilanSirket.id)) {
            sirketler = [varsayilanSirket, ...sirketler.filter(item => String(item.id || '') !== varsayilanSirket.id)];
            localStorage.setItem('loginSirketOnbellegi', JSON.stringify(sirketler));
            populateLoginCompanySelect();
        }
        try {
            const { data, error } = await supabaseClient.rpc('portal_login_companies');
            if (error) throw error;
            const sunucudakiSirketler = (data || []).map(item => ({
                id: item.id,
                kisaAd: item.short_name || item.title || '',
                unvan: item.title || item.short_name || ''
            }));
            // Geçici ağ/RPC sorunu boş dizi döndürürse girişteki doğrulanmış
            // şirket seçeneğini silme. Dolu yanıt geldiğinde normal listeyi kullan.
            if (sunucudakiSirketler.length) sirketler = sunucudakiSirketler;
            localStorage.setItem('loginSirketOnbellegi', JSON.stringify(sirketler));
            populateLoginCompanySelect();
        } catch (error) {
            console.warn('Giriş şirketleri yüklenemedi:', error);
            populateLoginCompanySelect();
        }
    }

function girisKullaniciTipiniGuncelle() {
        const username = document.getElementById('loginUser')?.value.trim();
        const user = kullanicilar.find(item => String(item.username) === String(username));
        const isPersonnel = user?.rol === 'Personel';
        const group = document.getElementById('loginCompanyGroup');
        const select = document.getElementById('loginCompany');
        if (!group || !select) return;
        if (SUPABASE_MODE) {
            group.style.display = '';
            select.required = true;
            return;
        }
        group.style.display = isPersonnel ? 'none' : '';
        select.required = !isPersonnel && sirketler.length > 0;
    }

async function girisParolasiniGuvenliKaydet(kullaniciAdi, parola) {
        if (!document.getElementById('rememberLogin')?.checked || !kullaniciAdi || !parola) return;
        try {
            if (window.PasswordCredential && navigator.credentials?.store) {
                const kimlik = new PasswordCredential({ id:kullaniciAdi, name:kullaniciAdi, password:parola });
                await navigator.credentials.store(kimlik);
            }
        } catch (error) {
            console.info('Tarayıcı parola yöneticisi kaydı kullanıcı tercihine bırakıldı.', error);
        }
    }

async function logout() {
        await kullaniciOturumunuKapat();
        if (SUPABASE_MODE) await supabaseClient.auth.signOut({ scope:'local' });
        sessionStorage.removeItem('loggedInUser');
        activeUser = null;
        supabaseProfile = null;
        window.fdPortalPrivateMemoryClear?.({ preserveCache:true });
        fdPortalBellekOturumu = '';
        showHub();
    }

function sifreDegistirmeModaliniHazirla(zorunlu) {
        sifreDegistirmeZorunluMu = Boolean(zorunlu);
        const modal = document.getElementById('modalZorunluSifre');
        if (!modal) return;
        document.getElementById('sifreDegistirBaslik').textContent = zorunlu ? '\ud83d\udd10 \u0130lk Giri\u015f \u015eifrenizi De\u011fi\u015ftirin' : '\ud83d\udd11 \u015eifremi De\u011fi\u015ftir';
        document.getElementById('sifreDegistirAciklama').textContent = zorunlu ? 'G\u00fcvenli\u011finiz i\u00e7in ge\u00e7ici \u015fifreyle devam edemezsiniz. Uygulamay\u0131 kullanmadan \u00f6nce yaln\u0131zca sizin bilece\u011finiz yeni bir \u015fifre belirleyin.' : 'Hesab\u0131n\u0131z i\u00e7in yeni bir \u015fifre belirleyin. Sonraki giri\u015finizde yeni \u015fifrenizi kullanacaks\u0131n\u0131z.';
        document.getElementById('sifreDegistirIptal').textContent = zorunlu ? '\u00c7\u0131k\u0131\u015f Yap' : 'Vazge\u00e7';
        document.getElementById('sifreDegistirKaydet').textContent = zorunlu ? '\u015eifremi De\u011fi\u015ftir ve Devam Et' : 'Yeni \u015eifreyi Kaydet';
        document.getElementById('zorunluYeniSifre').value = '';
        document.getElementById('zorunluYeniSifreTekrar').value = '';
        zorunluSifreleriGoster(false);modal.style.display = 'flex';
        setTimeout(() => document.getElementById('zorunluYeniSifre')?.focus(), 80);
    }

function zorunluSifreModaliniGoster() { sifreDegistirmeModaliniHazirla(true); }

function kendiSifreModaliniGoster() { sifreDegistirmeModaliniHazirla(false); }

function zorunluSifreleriGoster(goster) {
        ['zorunluYeniSifre','zorunluYeniSifreTekrar'].forEach(id => { const alan=document.getElementById(id);if(alan)alan.type=goster?'text':'password'; });
    }

async function zorunluSifreDegisikligindenCik() {
        document.getElementById('modalZorunluSifre').style.display = 'none';
        if (sifreDegistirmeZorunluMu) await logout();
    }

async function zorunluSifreDegistir(event) {
        event.preventDefault();
        const yeni = document.getElementById('zorunluYeniSifre').value;
        const tekrar = document.getElementById('zorunluYeniSifreTekrar').value;
        const zorunluDegisiklik = sifreDegistirmeZorunluMu;
        if (!yeni.length) return showToast('Yeni şifre boş bırakılamaz.','warning');
        if (yeni.length < 6) return showToast('Yeni şifre en az 6 karakter olmalıdır.','warning');
        if (yeni !== tekrar) return showToast('Yazdığınız yeni şifreler aynı değil.','warning');
        if (!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol) && yeni === String(activeUser?.tcNo || '').slice(0,6)) return showToast('Geçici şifrenizden farklı bir şifre belirleyin.','warning');
        showGlobalOverlay('Şifre değiştiriliyor','Yeni şifreniz güvenli biçimde kaydediliyor...');
        try {
            const { data, error } = ['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)
                ? {data:await window.fdIsgApi('password-change',{password:yeni}),error:null}
                : await supabaseClient.functions.invoke('manage-user', { body:{ action:'change-own-password', password:yeni, companyId:aktifSirketId() } });
            if (error) throw error;
            if (!data?.success) throw new Error(data?.message || 'Şifre değiştirilemedi.');
            const kullaniciAdi = String(activeUser?.yetkiKullaniciAdi || activeUser?.tcNo || '').trim();
            let yeniOturum = null, sonOturumHatasi = null;
            for (const email of supabaseKullaniciEpostalari(kullaniciAdi)) {
                const sonuc = await supabaseClient.auth.signInWithPassword({ email, password:yeni });
                if (!sonuc.error && sonuc.data?.user) { yeniOturum = sonuc.data; break; }
                sonOturumHatasi = sonuc.error;
            }
            if (!yeniOturum?.user) throw sonOturumHatasi || new Error('Yeni şifreyle güvenli oturum yenilenemedi.');
            if (activeUser?.supabaseUserId && String(yeniOturum.user.id) !== String(activeUser.supabaseUserId)) {
                await supabaseClient.auth.signOut({ scope:'local' });
                throw new Error('Yenilenen oturum mevcut kullanıcıyla eşleşmedi.');
            }
            activeUser.sifreDegismeli = false;
            sessionStorage.setItem('loggedInUser', JSON.stringify(activeUser));
            await girisParolasiniGuvenliKaydet(kullaniciAdi, yeni);
            document.getElementById('modalZorunluSifre').style.display = 'none';
            showToast('Şifreniz değiştirildi. Uygulamayı kullanmaya devam edebilirsiniz.');
            if (['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)) await window.fdIsgPrepareSession();
            if (zorunluDegisiklik) setTimeout(() => window.fdKvkkErisimKontrolu?.(true), 80);
        } catch (error) {
            let mesaj = error?.message || String(error);
            try {
                if (error?.context && typeof error.context.json === 'function') {
                    const detay = await error.context.json();
                    mesaj = detay?.message || mesaj;
                }
            } catch (_) {}
            showToast('Şifre değiştirilemedi: ' + mesaj,'error');
        } finally { hideGlobalOverlay(); }
    }

/* Login and session orchestration: invoked at the original source positions. */
window.FDSessionRuntimeStep = (function(__fdSessionSteps63){
 return function(__fdSessionStep63){ return __fdSessionSteps63[__fdSessionStep63].call(window); };
})([
function(){
localStorage.removeItem('rememberedPassword');
},
function(){
document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') kullaniciOturumKalpAtisi().catch(() => {});
    });
},
function(){
window.addEventListener('DOMContentLoaded', async () => {
        mountDashboardInIzinModule();
        ekOdemeSekmeleriniKur();
        organizePersonnelForm();
        document.addEventListener('input', event => {
            const alan = event.target;
            if (!(alan instanceof HTMLInputElement || alan instanceof HTMLTextAreaElement)) return;
            if (alan.closest('#loginForm')) return;
            if (alan.closest('[data-case-preserve="true"]') || (alan instanceof HTMLInputElement && !['text', 'search', 'tel'].includes(String(alan.type || '').toLowerCase()))) return;
            const baslangic = alan.selectionStart;
            const bitis = alan.selectionEnd;
            const buyuk = String(alan.value || '').toLocaleUpperCase('tr-TR');
            if (alan.value === buyuk) return;
            alan.value = buyuk;
            if (baslangic !== null && bitis !== null) alan.setSelectionRange(baslangic, bitis);
        }, true);
        document.addEventListener('submit', event => {
            if (event.target.id === 'loginForm') return;
            event.target.querySelectorAll('input, textarea').forEach(alan => {
                if (alan.closest('[data-case-preserve="true"]') || (alan instanceof HTMLInputElement && !['text', 'search', 'tel'].includes(String(alan.type || '').toLowerCase()))) return;
                alan.value = String(alan.value || '').toLocaleUpperCase('tr-TR');
            });
        }, true);
        // Personnel form field listeners bind only after its private modal mounts.
        sirketModulunuBaslat();
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            document.getElementById('loginUser').value = rememberedUsername;
            document.getElementById('rememberLogin').checked = true;
        }
        loginSirketOnbelleginiYukle();
        populateLoginCompanySelect(true);
        document.getElementById('loginUser').addEventListener('input', girisKullaniciTipiniGuncelle);
        document.getElementById('loginCompany').addEventListener('change', () => {
            const select = document.getElementById('loginCompany');
            localStorage.setItem('lastSelectedCompanyId', select.value);
            localStorage.setItem('lastSelectedCompanyName', select.options[select.selectedIndex]?.text || '');
            if (document.getElementById('rememberLogin').checked) {
                localStorage.setItem('rememberedCompanyId', select.value);
                localStorage.setItem('rememberedCompanyName', select.options[select.selectedIndex]?.text || '');
            }
        });
        document.getElementById('rememberLogin').addEventListener('change', (event) => {
            if (event.target.checked) {
                const select = document.getElementById('loginCompany');
                localStorage.setItem('rememberedUsername', document.getElementById('loginUser').value.trim());
                localStorage.setItem('rememberedCompanyId', select.value || '');
                localStorage.setItem('rememberedCompanyName', select.options[select.selectedIndex]?.text || '');
            } else {
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberedCompanyId');
                localStorage.removeItem('rememberedCompanyName');
            }
        });
        document.getElementById('puanAySec').value = new Date().getMonth();
        if (SUPABASE_MODE) {
            document.querySelector('label[for="loginUser"]').textContent = 'Kullanıcı adı';
            document.getElementById('loginUser').type = 'text';
            document.getElementById('loginUser').placeholder = 'Kullanıcı adınızı girin';
            document.getElementById('loginCompanyGroup').style.display = '';
            document.querySelector('label[for="rememberLogin"]').style.display = '';
            supabaseGirisSirketleriniYukle();
            girisYuklemeSozu = Promise.resolve();
        } else {
            girisYuklemeSozu = driveVerileriniYukleBaslangicta('girizhizli').then(() => {
                if (sessionStorage.getItem('loggedInUser')) initUI();
            }).catch(error => {
                console.error('Giriş verileri yüklenemedi:', error);
            });
        }

        document.addEventListener('click', () => {
            document.getElementById('customContextMenu').style.display = 'none';
        });
    });
},
function(){
document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginButton = document.getElementById('btnLoginSubmit');
        loginButton.disabled = true;
        loginButton.textContent = 'Kontrol ediliyor...';
        if (SUPABASE_MODE) {
            try {
                supabaseManuelGirisBaslatildi = true;
                const kullaniciAdi = document.getElementById('loginUser').value.trim();
                const password = document.getElementById('loginPass').value;
                const secilenSirketId = document.getElementById('loginCompany').value;
                if (!kullaniciAdi) throw new Error('Kullanıcı adı girin.');
                if (!secilenSirketId) throw new Error('Şirket seçin.');
                // Giriş ekranından yapılan her deneme bağımsız doğrulanır. Tarayıcıda
                // kalmış geçerli bir oturum yanlış parolayı örtemez.
                await supabaseClient.auth.signOut({ scope:'local' });
                sessionStorage.removeItem('loggedInUser');
                activeUser = null;
                supabaseProfile = null;
                let data = null;
                let sonGirisHatasi = null;
                for (const email of supabaseKullaniciEpostalari(kullaniciAdi)) {
                    const sonuc = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (!sonuc.error) { data = sonuc.data; break; }
                    sonGirisHatasi = sonuc.error;
                }
                if (!data?.user) throw sonGirisHatasi || new Error('Giriş yapılamadı.');
                await supabaseOturumuAc(data.user, secilenSirketId);
                await girisParolasiniGuvenliKaydet(kullaniciAdi, password);
                localStorage.setItem('lastSelectedCompanyId', secilenSirketId);
                localStorage.setItem('lastSelectedCompanyName', document.getElementById('loginCompany').options[document.getElementById('loginCompany').selectedIndex]?.text || '');
                if (document.getElementById('rememberLogin').checked) {
                    localStorage.setItem('rememberedUsername', kullaniciAdi);
                    localStorage.setItem('rememberedCompanyId', secilenSirketId);
                    localStorage.setItem('rememberedCompanyName', document.getElementById('loginCompany').options[document.getElementById('loginCompany').selectedIndex]?.text || '');
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedCompanyId');
                    localStorage.removeItem('rememberedCompanyName');
                }
                document.getElementById('loginAlert').style.display = 'none';
            } catch (error) {
                await supabaseClient.auth.signOut({ scope:'local' });
                document.getElementById('loginAlert').textContent = error.message || 'Giriş yapılamadı.';
                document.getElementById('loginAlert').style.display = 'block';
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Güvenli giriş yap';
            }
            return;
        }
        if (girisYuklemeSozu) await girisYuklemeSozu;
        const u = document.getElementById('loginUser').value.trim();
        const p = document.getElementById('loginPass').value.trim();
        let selectedCompanyId = document.getElementById('loginCompany').value;
        
        const match = kullanicilar.find(k => k.username === u && k.password === p);

        if (match) {
            const loginUser = match;
            if (loginUser.rol === 'Personel') {
                if (!personelYuklemeSozu) personelYuklemeSozu = driveVerileriniYukleBaslangicta('personel');
                if (!loginUser.sirketId && personelYuklemeSozu) await personelYuklemeSozu;
                const employee = personeller.find(item => String(item.id) === String(loginUser.tcNo || loginUser.username));
                selectedCompanyId = String(loginUser.sirketId || employee?.sirketId || '');
                if (!selectedCompanyId) {
                    document.getElementById('loginAlert').textContent = 'Personel hesabına şirket ataması yapılmamış.';
                    document.getElementById('loginAlert').style.display = 'block';
                    return;
                }
            }
            const selectedCompany = sirketler.find(item => String(item.id) === String(selectedCompanyId));
            localStorage.setItem('lastSelectedCompanyId', selectedCompanyId);
            localStorage.setItem('lastSelectedCompanyName', selectedCompany?.kisaAd || selectedCompany?.unvan || '');
            activeUser = { ...loginUser, sirketId: selectedCompany?.id || selectedCompanyId || '', sirketAdi: selectedCompany?.kisaAd || selectedCompany?.unvan || '' };
            if (document.getElementById('rememberLogin').checked) {
                localStorage.setItem('rememberedUsername', u);
                localStorage.setItem('rememberedCompanyId', selectedCompanyId);
                localStorage.setItem('rememberedCompanyName', selectedCompany?.kisaAd || selectedCompany?.unvan || '');
            } else {
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberedCompanyId');
                localStorage.removeItem('rememberedCompanyName');
            }
            sessionStorage.setItem('loggedInUser', JSON.stringify(activeUser));
            document.getElementById('loginAlert').style.display = 'none';
            showHub();
            setTimeout(()=>window.fdBekleyenBildirimiGoster?.(),350);
        } else {
            document.getElementById('loginAlert').textContent = kullanicilar.length
                ? 'Kullanıcı adı veya şifre hatalı!'
                : 'Giriş bilgileri yüklenemedi. İnternet bağlantısını kontrol edip tekrar deneyin.';
            document.getElementById('loginAlert').style.display = 'block';
        }
        loginButton.disabled = false;
        loginButton.textContent = 'Güvenli giriş yap';
    });
},
function(){
if (SUPABASE_MODE) supabaseKayitliOturumuGeriYukle();
    else showHub();
}
]);

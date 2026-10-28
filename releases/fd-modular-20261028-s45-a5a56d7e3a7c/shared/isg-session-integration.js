
/* Integration only: ISG data remains in memory and goes through the authenticated, scoped endpoint. */
(function (root) {
    'use strict';
    const roleIsg = role => ['IsgUzmani', 'IsyeriHekimi'].includes(String(role || ''));
    const runtime = root.fdIsgRuntime = { scope: '', permissions: null, company: null };
    const scope = () => String(activeUser?.supabaseUserId || '') + '|' + String(activeUser?.sirketId || '') + '|' + String(activeUser?.rol || '');
    const toast = (text, kind = 'warning') => root.showToast?.(text, kind);
    const clone = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

    root.fdIsgApi = async function (action, payload = {}) {
        if (!activeUser?.supabaseUserId || !activeUser?.sirketId || !supabaseClient) throw new Error('İSG için giriş yapmanız gerekiyor.');
        const requestedScope = scope();
        if (action !== 'bootstrap' && runtime.scope && runtime.scope !== requestedScope) throw new Error('Kullanıcı veya şirket değişti. İSG sayfasını yeniden açın.');
        const { data, error } = await supabaseClient.auth.getSession();
        if (requestedScope !== scope()) throw new Error('Kullanıcı veya şirket değişti. İSG sayfasını yeniden açın.');
        if (error) throw error;
        if (!data?.session?.access_token) throw new Error('Oturum sona erdi. Tekrar giriş yapın.');
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 45000);
        try {
            const response = await fetch(SUPABASE_URL + '/functions/v1/isg-workspace', {
                method: 'POST', signal: controller.signal,
                headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + data.session.access_token },
                body: JSON.stringify({ ...payload, action })
            });
            let result;
            try { result = await response.json(); } catch (_) { throw new Error('İSG hizmetinden geçerli yanıt alınamadı.'); }
            if (requestedScope !== scope()) throw new Error('Kullanıcı veya şirket değişti. İSG sayfasını yeniden açın.');
            if (!response.ok || result?.success === false) {
                const failure = new Error(result?.message || result?.error || 'İSG işlemi tamamlanamadı.');
                failure.status = response.status; failure.code = result?.code; failure.details = result?.details; throw failure;
            }
            if (action === 'bootstrap') {
                runtime.scope = requestedScope; runtime.permissions = result.permissions || {}; runtime.company = result.company || null;
            }
            if (action === 'upload-init') Object.defineProperty(result, '__fdIsgScope', { value: requestedScope });
            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                const changing = !['bootstrap', 'list', 'get', 'history', 'activity', 'download', 'access-list'].includes(action);
                throw new Error(changing ? 'Yanıt gecikti. Kayıt durumunu Yenile ile kontrol edin; aynı işlemi tekrar göndermeyin.' : 'Bağlantı gecikti. Yeniden deneyebilirsiniz.');
            }
            throw error;
        } finally { clearTimeout(timer); }
    };

    function clearPrivatePortalMemory({ preserveCache = false } = {}) {
        // Cached tab navigation can show an already-rendered page without calling its opener.
        // Evict the previous role's visible pages and tab handles before preparing a scoped session.
        if (typeof fdTumUygulamaAlanlariniGizle === 'function') fdTumUygulamaAlanlariniGizle();
        if (typeof fdAcikUygulamaSekmeleri !== 'undefined') fdAcikUygulamaSekmeleri = [];
        if (typeof fdAktifUygulamaSekmesi !== 'undefined') fdAktifUygulamaSekmesi = 'home';
        if (typeof fdSekmeCubugunuGuncelle === 'function') fdSekmeCubugunuGuncelle(false);
        document.querySelectorAll('.modal-overlay').forEach(modal => { if (modal.id !== 'modalZorunluSifre') modal.style.display = 'none'; });
        const payrollFrame = document.getElementById('bordroOnizlemeFrame');
        if (payrollFrame) payrollFrame.src = 'about:blank';
        root.fdUnifiedOutput?.clear?.(); root.fdIsgDocuments?.clear?.(); root.fdPriceWhatsappSettings?.reset?.(); root.fdWhatsappCalismaAlaniniSifirla?.();
        const scrub = container => container.querySelectorAll('input,textarea,select').forEach(field => {
            if (field.matches('button,input[type="button"],input[type="submit"],input[type="reset"]')) return;
            if (field.tagName === 'SELECT') field.selectedIndex = 0;
            else if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
            else field.value = '';
        });
        document.querySelectorAll('.app-container:not(#isgApp)').forEach(scrub);
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            if (!/zorunlu.?sifre|kvkk|login|giris|oturum|auth/i.test(modal.id)) scrub(modal);
        });
        // Evict only reloadable cache copies, not pending uploads, edits, tokens or device credentials.
        if (!preserveCache) [VERI_ONBELLEK_ANAHTARI, ESKI_VERI_ONBELLEK_ANAHTARI].forEach(key => {
            try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch (_) {}
        });
        personeller = []; izinler = []; kullanicilar = []; puantajVerileri = []; avanslar = []; ekOdemeler = [];
        kkdKayitlari = []; vardiyaKayitlari = []; tasimaIrsaliyeleri = []; kiraKayitlari = []; ihracatFirmalari = [];
        fdVardiyaOnbellekOnizlemesi = null;
        fdManuelKarsilastirmaIstek = null;
        fdCikisUyariIstek?.cancel();
        fdCikisUyariIstek = null;
        fdKayitHatirlatmaIstek?.cancel();
        fdKayitHatirlatmaIstek = null;
        fdGunlukHatirlatmaIstek?.cancel();
        fdGunlukHatirlatmaIstek = null;
        fdPdfOnizlemeIstek?.cancel();
        fdPdfOnizlemeIstek = null;
        fdPersonelFormIstek?.cancel();
        fdPersonelFormIstek = null;
        fdTopluPlanIstek?.cancel();
        fdTopluPlanIstek = null;
        window.fdBildirimIzniGecisiniIptalEt?.();
        window.fdManuelDuzeltmeGecisiniIptalEt?.();
        icralar = []; araclar = []; akaryakitKayitlari = []; sirketler = []; subeler = [];
        izinYerelOnbellekKopyasi = []; izinKurtarmaAdaylari = []; izinYerelOnbellekZamani = 0;
        yuklenenVeriler.clear(); veriSonKayitGoruntuleri.clear();
        fdUzakVeriImzalari.clear(); fdUzakAnahtarSonYukleme.clear(); fdSirketSonYukleme.clear();
        uygulamaAyarlari = clone(VARSAYILAN_UYGULAMA_AYARLARI);
        document.querySelectorAll('.app-container:not(#isgApp) tbody,#adminUserTable tbody').forEach(body => body.replaceChildren());
    }
    root.fdPortalPrivateMemoryClear = clearPrivatePortalMemory;
    root.fdIsgPrepareSession = async function () {
        if (!roleIsg(activeUser?.rol)) return;
        clearPrivatePortalMemory();
        const result = await root.fdIsgApi('bootstrap');
        activeUser.sirketAdi = result.company?.name || '';
        activeUser.sifreDegismeli = Boolean(result.permissions?.mustChangePassword);
        sessionStorage.setItem('loggedInUser', JSON.stringify(activeUser));
        root.fdIsgWorkspace?.reset?.();
        return result;
    };
    root.fdIsgUploadFile = async function (init, file) {
        if (!init?.path || !init?.token || !file) throw new Error('Dosya yükleme oturumu geçersiz.');
        const requestedScope = scope();
        if (!activeUser?.supabaseUserId || !activeUser?.sirketId || !supabaseClient || init.__fdIsgScope !== requestedScope || !init.path.startsWith(String(activeUser.sirketId) + '/') || (init.bucket && init.bucket !== 'isg-private')) throw new Error('Kullanıcı veya şirket değişti. Dosya yüklemesini bu oturumda yeniden başlatın.');
        const { data, error } = await supabaseClient.storage.from('isg-private').uploadToSignedUrl(init.path, init.token, file, { contentType: init.mimeType || file.type || 'application/octet-stream', upsert: false });
        if (error) throw error;
        if (requestedScope !== scope()) throw new Error('Oturum değişti. Dosya kaydını yeni oturumda kontrol edin.');
        return data;
    };

    const previousPermission = root.anaMenuModulYetkisi;
    root.anaMenuModulYetkisi = function (key, role = String(activeUser?.rol || 'Personel')) {
        if (roleIsg(role)) {
            if (key !== 'isg') return 'yok';
            if (runtime.scope !== scope() || !runtime.permissions?.read) return 'yok';
            return runtime.permissions.write ? 'yazma' : 'okuma';
        }
        return previousPermission.apply(this, arguments);
    };

    function guardModuleOpeners() {
        const entries = new Map(Object.entries(fdSekmeFonksiyonlari));
        VARSAYILAN_ANA_MENU_MODULLERI.forEach(module => { if (module.fonksiyon) entries.set(module.fonksiyon, module.anahtar); });
        const guarded = (original, key) => {
            if (typeof original !== 'function' || original.__fdIsgScopeGuard) return original;
            const wrapper = function (...args) {
                if (roleIsg(activeUser?.rol) && (key !== 'isg' || !anaMenuModulErisimiVar('isg'))) return toast('Bu bölüme erişim yetkiniz yok.');
                return original.apply(this, args);
            };
            wrapper.__fdIsgScopeGuard = true;
            // Do not make the existing tab installer wrap a protected tab twice.
            if (original.__fdSekmeli) wrapper.__fdSekmeli = true;
            return wrapper;
        };
        entries.forEach((key, name) => {
            if (typeof root[name] === 'function') root[name] = guarded(root[name], key);
            if (typeof fdSekmeOrijinaller !== 'undefined' && typeof fdSekmeOrijinaller[name] === 'function') fdSekmeOrijinaller[name] = guarded(fdSekmeOrijinaller[name], key);
        });
    }
    const originalTabInstaller = root.fdSekmeSisteminiKur;
    root.fdSekmeSisteminiKur = function (...args) {
        const result = originalTabInstaller.apply(this, args); guardModuleOpeners(); return result;
    };

    function installModule() {
        const definition = { anahtar: 'isg', ad: 'İş Sağlığı ve Güvenliği', aciklama: 'Eğitim, risk, kontrol, görev ve İSG evraklarını şube bazında takip edin', ikon: '🦺', renk: 'linear-gradient(135deg,#087f8c,#2a9d8f)', fonksiyon: 'openIsgApp', roller: ['Admin', 'Yonetici'], yetkiler: { Admin: 'yazma', Yonetici: 'yazma', Personel: 'yok' }, aktif: true };
        if (!VARSAYILAN_ANA_MENU_MODULLERI.some(item => item.anahtar === 'isg')) VARSAYILAN_ANA_MENU_MODULLERI.splice(1, 0, definition);
        ANA_MENU_MODUL_KOKLERI.isg = '#isgApp';
        fdUygulamaSekmeTanimlari.isg = { ad: 'İş Sağlığı ve Güvenliği', ikon: '🦺', acilis: 'openIsgApp' };
        fdSekmeFonksiyonlari.openIsgApp = 'isg';
        if (!fdSekmeAlanlari.includes('isgApp')) fdSekmeAlanlari.push('isgApp');
        const launcher = document.querySelector('#appHub .workspace-launcher');
        if (launcher && !launcher.querySelector('[data-ana-menu-modul="isg"]')) {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'workspace-card'; button.dataset.anaMenuModul = 'isg';
            button.innerHTML = '<span class="workspace-card-icon" aria-hidden="true">🦺</span><span><strong>İş Sağlığı ve Güvenliği</strong><small>Eğitim, kontrol, görev ve İSG evrakları</small></span><b>Modülü aç →</b>';
            button.onclick = event => anaMenuModulunuAc('isg', event); launcher.append(button);
        }
        const originalOpen = root.openIsgApp;
        root.openIsgApp = async function () {
            if (!anaMenuModulErisimiVar('isg')) return toast('İSG modülüne erişim yetkiniz yok.');
            if (runtime.scope && runtime.scope !== scope()) { root.fdIsgWorkspace?.reset?.(); runtime.scope = ''; runtime.permissions = null; runtime.company = null; }
            fdTumUygulamaAlanlariniGizle(); personelModuluYetkiGorunumunuUygula('isg');
            anaMenuDonusButonunuGoster?.();
            return originalOpen.call(this);
        };
        anaMenuModulKartlariniUygula(); fdSekmeSisteminiKur();
    }

    const previousOutput = root.fdOutputAdapters?.get;
    if (root.fdOutputAdapters) root.fdOutputAdapters.get = async function (group) {
        if (group.isgModels) return clone(group.isgModels);
        return previousOutput?.call(this, group);
    };
    root.fdIsgOutput = function (models, button) {
        if (!models?.length) return toast('Çıktı alınacak kayıt bulunamadı.');
        if (!root.fdUnifiedOutput) return toast('Çıktı bileşeni yüklenemedi.', 'error');
        const outputScope = scope();
        return root.fdUnifiedOutput.open({ isgModels: clone(models), parent: button.parentElement, trigger: button, items: [], isCurrent: () => outputScope === scope() && Boolean(activeUser) });
    };

    // ISG administration lives in the main Settings shell, not in the operational workspace.
    function installSettingsPanel() {
        const container = document.querySelector('#ayarlarApp .ayarlar-icerik');
        const navigation = document.querySelector('#ayarlarApp .ayarlar-sol-menu');
        if (!container || !navigation) return null;
        if (activeUser?.rol !== 'Admin') {
            root.fdIsgWorkspace?.unmountSettings?.();
            document.getElementById('ayarlarPanelIsg')?.remove();
            navigation.querySelector('[data-isg-settings-nav]')?.remove();
            return null;
        }
        let panel = document.getElementById('ayarlarPanelIsg');
        if (!panel) {
            panel = document.createElement('section'); panel.id = 'ayarlarPanelIsg'; panel.className = 'ayarlar-panel';
            panel.innerHTML = '<div class="ayarlar-panel-baslik"><div><h3>İSG · İş Sağlığı ve Güvenliği Ayarları</h3><p>Eğitim, ilk yardım ve kontrol süreleri, şube kuralları, evrak şablonları ve uzman erişimleri.</p></div></div><div id="isgSettingsHost"></div>';
            container.append(panel);
        }
        let button = navigation.querySelector('[data-isg-settings-nav]');
        if (!button) {
            button = document.createElement('button'); button.type = 'button'; button.dataset.isgSettingsNav = 'true';
            button.textContent = '🦺 İş Sağlığı ve Güvenliği';
            button.setAttribute('onclick', "ayarlarBolumAc('ayarlarPanelIsg',this)");
            const next = Array.from(navigation.children).find(item => (item.getAttribute('onclick') || '').includes('ayarlarPanelOperasyon'));
            navigation.insertBefore(button, next || null);
        }
        return { panel, button, host: panel.querySelector('#isgSettingsHost') };
    }
    const previousSettingsLayout = root.ayarlarArayuzunuDuzenle;
    if (typeof previousSettingsLayout === 'function') root.ayarlarArayuzunuDuzenle = function (...args) {
        const result = previousSettingsLayout.apply(this, args); installSettingsPanel(); return result;
    };
    const previousSettingsSection = root.ayarlarBolumAc;
    if (typeof previousSettingsSection === 'function') root.ayarlarBolumAc = function (panelId, button) {
        const footer = document.querySelector('#ayarlarApp .ayarlar-kaydet-cubugu');
        if (footer) {
            if (panelId === 'ayarlarPanelIsg' && activeUser?.rol === 'Admin') {
                if (!('fdIsgOriginalDisplay' in footer.dataset)) {
                    footer.dataset.fdIsgOriginalDisplay = footer.style.getPropertyValue('display');
                    footer.dataset.fdIsgOriginalDisplayPriority = footer.style.getPropertyPriority('display');
                }
                footer.style.setProperty('display', 'none', 'important');
            } else if ('fdIsgOriginalDisplay' in footer.dataset) {
                if (footer.dataset.fdIsgOriginalDisplay) footer.style.setProperty('display', footer.dataset.fdIsgOriginalDisplay, footer.dataset.fdIsgOriginalDisplayPriority || '');
                else footer.style.removeProperty('display');
                delete footer.dataset.fdIsgOriginalDisplay;
                delete footer.dataset.fdIsgOriginalDisplayPriority;
            }
        }
        if (panelId !== 'ayarlarPanelIsg') return previousSettingsSection.apply(this, arguments);
        if (activeUser?.rol !== 'Admin' || !anaMenuModulErisimiVar('ayarlar')) return toast('İSG ayarlarını yalnız yönetici hesabı düzenleyebilir.');
        const installed = installSettingsPanel(); if (!installed) return toast('Ayarlar ekranı yüklenemedi. Yeniden açın.', 'error');
        previousSettingsSection.call(this, panelId, button || installed.button);
        const requestedScope = scope();
        const previousScope = installed.host.dataset.isgSettingsScope;
        if ((runtime.scope && runtime.scope !== requestedScope) || (previousScope && previousScope !== requestedScope)) {
            root.fdIsgWorkspace?.reset?.();
            runtime.scope = ''; runtime.permissions = null; runtime.company = null;
        }
        if (installed.host.dataset.isgSettingsScope === requestedScope && installed.host.childElementCount) return Promise.resolve();
        installed.host.dataset.isgSettingsScope = requestedScope;
        return Promise.resolve(root.fdIsgWorkspace.mountSettings(installed.host)).catch(error => {
            if (requestedScope === scope()) { delete installed.host.dataset.isgSettingsScope; toast(error.message, 'error'); }
        });
    };
    root.fdIsgSettingsOpen = async function (access = false) {
        if (activeUser?.rol !== 'Admin' || !anaMenuModulErisimiVar('ayarlar')) return toast('İSG ayarlarını yalnız yönetici hesabı düzenleyebilir.');
        const requestedScope = scope();
        await root.openAyarlarApp();
        if (requestedScope !== scope()) return;
        const installed = installSettingsPanel(); if (!installed) return toast('Ayarlar ekranı yüklenemedi. Yeniden açın.', 'error');
        await root.ayarlarBolumAc('ayarlarPanelIsg', installed.button);
        if (requestedScope === scope() && installed.panel.classList.contains('active') && access) installed.host.querySelector('#isgAccessSection')?.scrollIntoView({ block: 'start' });
    };

    const oldCreateUser = root.supabaseKullaniciOlustur;
    root.supabaseKullaniciOlustur = async function (options) {
        if (!roleIsg(options?.rol)) return oldCreateUser.apply(this, arguments);
        if (runtime.scope !== scope()) await root.fdIsgApi('bootstrap');
        return root.fdIsgApi('access-create-user', { username: options.username, password: options.password, fullName: options.ad || options.username, role: options.rol, allBranches: false, branches: [], write: true, active: false });
    };
    // User creation remains the administrator's action; no account is created by installation.
    const roleSelect = document.getElementById('aRol');
    if (roleSelect) [['IsgUzmani', 'İSG Uzmanı'], ['IsyeriHekimi', 'İşyeri Hekimi']].forEach(([value, label]) => {
        if (!Array.from(roleSelect.options).some(option => option.value === value)) { const option = document.createElement('option'); option.value = value; option.textContent = label; roleSelect.append(option); }
    });
    const oldRenderUsers = root.renderAdminUsers;
    root.renderAdminUsers = function () {
        const result = oldRenderUsers.apply(this, arguments);
        document.querySelectorAll('#adminUserTable tbody tr').forEach(row => {
            const select = row.querySelector('select'); if (!select) return;
            const username = row.querySelector('td:nth-child(2) strong')?.textContent;
            const user = kullanicilar.find(item => item.username === username);
            if (!roleIsg(user?.rol)) return;
            let option = Array.from(select.options).find(item => item.value === user.rol);
            if (!option) { option = document.createElement('option'); option.value = user.rol; option.textContent = user.rol === 'IsyeriHekimi' ? 'İşyeri Hekimi' : 'İSG Uzmanı'; select.append(option); }
            option.selected = true; select.disabled = true;
            row.querySelector('td:last-child').replaceChildren();
            if (activeUser?.rol !== 'Admin' || !anaMenuModulYazmaYetkisiVar('kullanici')) { row.querySelector('td:last-child').textContent = 'İSG yetkilerini Admin yönetir.'; return; }
            const access = document.createElement('button'); access.type = 'button'; access.className = 'btn-modern btn-detail-modern'; access.textContent = 'İSG Yetkileri';
            access.onclick = () => { closeAdminModal(); root.fdIsgSettingsOpen(true); }; row.querySelector('td:last-child').append(access);
        });
        return result;
    };

    const oldHub = root.showHub, hiddenHub = new Map();
    root.showHub = function () {
        const result = oldHub.apply(this, arguments);
        document.getElementById('isgApp')?.style.setProperty('display', 'none');
        if (roleIsg(activeUser?.rol)) {
            const badge = document.getElementById('userBadgeSpan'); if (badge) badge.textContent = activeUser.rol === 'IsyeriHekimi' ? 'İşyeri Hekimi' : 'İSG Uzmanı';
            document.querySelectorAll('#appHub .workspace-launcher > :not([data-ana-menu-modul="isg"]),#fdHomeTools,#adminSessionPanel').forEach(element => { if (!hiddenHub.has(element)) hiddenHub.set(element, element.style.display); element.style.display = 'none'; });
        } else if (hiddenHub.size) { hiddenHub.forEach((display, element) => { if (element.isConnected) element.style.display = display; }); hiddenHub.clear(); anaMenuModulKartlariniUygula(); }
        return result;
    };
    const oldLogout = root.logout;
    root.logout = async function () {
        try { return await oldLogout.apply(this, arguments); }
        finally { runtime.scope = ''; runtime.permissions = null; runtime.company = null; root.fdIsgWorkspace?.reset?.(); root.fdIsgWorkspace?.unmountSettings?.(); document.querySelector('#isgSettingsHost')?.removeAttribute('data-isg-settings-scope'); root.fdIsgDocuments?.clear?.(); root.fdUnifiedOutput?.clear?.(); document.querySelector('[data-isg-document-dialog]')?.remove(); }
    };
    installModule();
})(window);


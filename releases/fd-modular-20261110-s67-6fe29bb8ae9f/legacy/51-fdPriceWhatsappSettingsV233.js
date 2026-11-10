
/* Technical template inspector retained for diagnostics only; not mounted in application settings. */
(function (root) {
    'use strict';
    const TEMPLATE = 'fiyat_listesi_bildirimi_v1';
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const BODY = 'Sayın {{1}},\n\nYetkili kullanıcı olduğunuz işletmenin {{2}} kaydı güncellenmiştir.\n\n{{3}}\n\nBu bildirim, işletme hesabınızdaki güncel fiyat kayıtlarını takip etmeniz için gönderilmiştir.';
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const state = { host: null, key: '', epoch: 0, loaded: false, loading: false, busy: false, meta: null, error: '', promise: null };

    function context() {
        const user = typeof activeUser !== 'undefined' ? activeUser : root.activeUser;
        const secure = typeof SUPABASE_MODE !== 'undefined' ? SUPABASE_MODE : root.SUPABASE_MODE;
        const role = String(user?.rol || user?.role || '');
        const company = String(user?.sirketId || user?.company_id || '');
        const account = String(user?.supabaseUserId || user?.id || user?.username || '');
        const manager = ['Admin', 'Yonetici'].includes(role) && (!root.isManagerUser || root.isManagerUser());
        const allowed = secure === true && manager && UUID.test(company) && Boolean(account) && user?.sifreDegismeli !== true;
        return { allowed, role, company, account, key: [company, account, role, allowed].join('|') };
    }

    function assertCurrent(key, epoch = state.epoch) {
        if (!context().allowed || context().key !== key || state.key !== key || state.epoch !== epoch) throw new Error('Oturum değişti. Ayarları yeniden açın.');
    }

    function releaseOldContext(epoch) {
        if (epoch !== state.epoch) return true;
        if (context().allowed && context().key === state.key) return false;
        const host = state.host; reset();
        if (host) host.innerHTML = '<div class="fd-price-wa"><div class="fd-price-wa-empty">Oturum değişti. Ayarları yeniden açın.</div></div>';
        return true;
    }

    async function api(action, payload = {}) {
        const allowedActions = ['price-template-info', 'price-template-submit'];
        const current = context(), epoch = state.epoch;
        if (!current.allowed || !allowedActions.includes(action)) throw new Error('Bu ayarı görüntüleme yetkiniz yok.');
        if (action === 'price-template-submit' && current.role !== 'Admin') throw new Error('Şablon başvurusu için Admin yetkisi gerekir.');
        assertCurrent(current.key, epoch);
        let result;
        if (typeof root.fdPriceWhatsappApi === 'function') result = await root.fdPriceWhatsappApi(action, payload);
        else {
            const client = typeof supabaseClient !== 'undefined' ? supabaseClient : root.supabaseClient;
            if (!client?.auth || !client?.functions) throw new Error('WhatsApp bağlantısı hazır değil. Uygulamayı yenileyin.');
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            assertCurrent(current.key, epoch);
            if (sessionError) throw sessionError;
            const session = sessionData?.session;
            if (!session?.access_token || (UUID.test(current.account) && session.user?.id !== current.account)) throw new Error('Oturum süresi dolmuş. Yeniden giriş yapın.');
            const response = await client.functions.invoke('whatsapp-notification', {
                headers: { Authorization: 'Bearer ' + session.access_token }, body: { action, ...payload }
            });
            assertCurrent(current.key, epoch);
            if (response.error) {
                let message = response.error.message || 'WhatsApp ayarları okunamadı.';
                try { const body = await response.error.context?.json?.(); message = body?.message || message; } catch (_) { /* Keep the safe error message. */ }
                throw new Error(message);
            }
            result = response.data;
        }
        assertCurrent(current.key, epoch);
        if (!result || result.success === false || result.error) throw new Error(result?.message || result?.error?.message || 'İşlem tamamlanamadı.');
        return result;
    }

    function notice(message, type = 'success') {
        const node = state.host?.querySelector('[data-price-wa-notice]');
        if (node) { node.textContent = message; node.dataset.type = type; node.setAttribute('role', type === 'error' ? 'alert' : 'status'); }
        if (typeof root.showToast === 'function') root.showToast(message, type);
    }

    function installStyle() {
        if (document.getElementById('fdPriceWhatsappSettingsStyle')) return;
        const style = document.createElement('style'); style.id = 'fdPriceWhatsappSettingsStyle';
        style.textContent = `
        .fd-price-wa{margin:12px 0;border:1px solid #dce6ef;border-radius:10px;background:#fff;color:#334155;min-width:0;overflow:hidden}
        .fd-price-wa small{display:block;font-size:12px;line-height:1.5;margin-top:3px;color:#64748b}.fd-price-wa *{box-sizing:border-box}.fd-price-wa-section{padding:14px}.fd-price-wa-section+.fd-price-wa-section{border-top:1px solid #e5edf4}
        .fd-price-wa h4{font-size:.87rem;margin:0 0 5px;color:#153b55}.fd-price-wa p{font-size:.77rem;line-height:1.5;margin:5px 0 10px;color:#64748b}
        .fd-price-wa-toolbar{display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap}.fd-price-wa-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
        .fd-price-wa button{border:1px solid #cbdbe7;border-radius:7px;background:#f8fafc;color:#135879;font:inherit;font-size:.76rem;padding:8px 11px;cursor:pointer;white-space:normal}
        .fd-price-wa button.fd-price-wa-primary{background:#0784b8;color:#fff;border-color:#0784b8}.fd-price-wa button:disabled{opacity:.55;cursor:default}
        .fd-price-wa button:focus-visible{outline:2px solid #0284c7;outline-offset:2px}
        .fd-price-wa-notice{font-size:.77rem;padding:0 14px 10px;line-height:1.5}.fd-price-wa-notice:empty{display:none}.fd-price-wa-notice[data-type=error]{color:#b91c1c}
        .fd-price-wa-notice[data-type=success]{color:#047857}.fd-price-wa-status{font-size:.75rem;font-weight:600;color:#64748b}.fd-price-wa-status[data-ready=true]{color:#047857}
        .fd-price-wa-template{padding:10px;margin:9px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;max-width:100%;overflow-wrap:anywhere;font-size:.76rem}
        .fd-price-wa-template pre{white-space:pre-wrap;overflow-wrap:anywhere;font-family:inherit;margin:8px 0;font-size:inherit;line-height:1.6}
        .fd-price-wa-template summary{cursor:pointer}.fd-price-wa-template code{font-size:.73rem;overflow-wrap:anywhere}.fd-price-wa-empty{padding:10px;color:#64748b;font-size:.8rem}
        @media(max-width:520px){.fd-price-wa-section{padding:11px}.fd-price-wa-actions{width:100%}.fd-price-wa-actions button{flex:1;min-width:0}.fd-price-wa-notice{padding:0 11px 10px}}
        `;
        document.head.appendChild(style);
    }

    function metaView() {
        const meta = state.meta || {}, status = String(meta.status || 'UNKNOWN').toUpperCase();
        const category = String(meta.category || '').toUpperCase();
        const language = String(meta.language || '');
        const ready = meta.ready === true && status === 'APPROVED' && category === 'UTILITY' && language === 'tr' && String(meta.templateName || '') === TEMPLATE;
        const statuses = { APPROVED: 'Onaylandı', PENDING: 'Değerlendirmede', IN_APPEAL: 'İtiraz değerlendiriliyor', REJECTED: 'Reddedildi', PAUSED: 'Duraklatıldı', DISABLED: 'Devre dışı', NOT_CREATED: 'Henüz hazırlanmadı', NOT_FOUND: 'Henüz hazırlanmadı', UNKNOWN: 'Durum doğrulanamadı' };
        const reason = meta.reason || meta.message || (ready ? 'Fiyat bildirimleri sırayla gönderime alınabilir.' : 'Onay ve uygun şablon doğrulanana kadar fiyat mesajları gönderilmez.');
        return { ready, status: statuses[status] || status, category, language, reason };
    }

    function render() {
        if (!state.host) return;
        const current = context();
        if (!current.allowed || current.key !== state.key) {
            state.host.innerHTML = '<div class="fd-price-wa"><div class="fd-price-wa-empty">Bu alan için güvenli Admin veya Kullanıcı oturumu gerekir.</div></div>';
            return;
        }
        const meta = metaView();
        state.host.innerHTML = `<div class="fd-price-wa"><section class="fd-price-wa-section"><div class="fd-price-wa-toolbar"><h4>Fiyat Bildirimi · Meta Şablonu</h4><span class="fd-price-wa-status" data-ready="${meta.ready}" data-price-wa-meta-status>${escape(meta.status)}${meta.category ? ' · ' + escape(meta.category) : ''}</span></div><p data-price-wa-meta-reason>${escape(meta.reason)}</p><details class="fd-price-wa-template"><summary>Şablon bilgileri ve metni</summary><p><code>${TEMPLATE}</code> · Türkçe · Utility başvurusu</p><strong>${escape(state.meta?.headerText || 'Fiyat Listesi Güncellemesi')}</strong><pre>${escape(state.meta?.bodyText || BODY)}</pre><small>${escape(state.meta?.footerText || 'İşletmenizin yönetim sisteminden gönderilmiştir.')}</small></details><div class="fd-price-wa-actions"><button type="button" class="fd-price-wa-primary" data-price-wa-act="submit" ${state.busy || state.loading || current.role !== 'Admin' ? 'disabled' : ''}>Şablonu Hazırla</button><button type="button" data-price-wa-act="info" ${state.busy || state.loading ? 'disabled' : ''}>Durumu Kontrol Et</button><small>Personel mesajlarının şablonu değişmez.</small></div>${current.role !== 'Admin' ? '<small>Şablon başvurusunu Admin yapabilir.</small>' : ''}</section><div class="fd-price-wa-notice" data-price-wa-notice aria-live="polite"></div></div>`;
    }

    async function refresh() {
        if (state.loading) return state.promise;
        if (state.busy) return;
        const current = context(), epoch = state.epoch;
        if (!current.allowed || current.key !== state.key) { render(); return; }
        state.loading = true; state.error = ''; render();
        state.promise = (async () => {
            try {
                const meta = await api('price-template-info');
                assertCurrent(current.key, epoch);
                state.meta = meta; state.loaded = true;
            } catch (error) {
                if (current.key !== context().key || epoch !== state.epoch) return;
                state.meta = { ready: false, status: 'UNKNOWN', message: error.message || 'Şablon durumu doğrulanamadı.' };
                state.loaded = false;
            }
            finally { if (!releaseOldContext(epoch)) { state.loading = false; state.promise = null; render(); } }
        })();
        return state.promise;
    }

    function disableButtons(disabled) {
        state.host?.querySelectorAll('button').forEach(button => { button.disabled = disabled; });
        if (!disabled) {
            const submit = state.host?.querySelector('[data-price-wa-act="submit"]');
            if (submit) submit.disabled = context().role !== 'Admin';
        }
    }

    async function template(action) {
        if (state.busy || state.loading) return;
        const current = context(), epoch = state.epoch;
        try {
            assertCurrent(current.key, epoch);
            if (action === 'submit' && current.role !== 'Admin') throw new Error('Şablon başvurusu için Admin yetkisi gerekir.');
            state.busy = true; disableButtons(true);
            const result = await api(action === 'submit' ? 'price-template-submit' : 'price-template-info');
            assertCurrent(current.key, epoch); state.meta = result; state.busy = false;
            state.loaded = true; render();
            notice(action === 'submit' ? result.message || 'Şablon başvuru durumu güncellendi; onaydan önce fiyat mesajı gönderilmez.' : metaView().reason, metaView().ready ? 'success' : 'warning');
        } catch (error) {
            if (current.key === context().key && epoch === state.epoch) {
                state.meta = { ready: false, status: 'UNKNOWN', message: error.message || 'Şablon durumu doğrulanamadı.' };
                const status = state.host?.querySelector('[data-price-wa-meta-status]'), reason = state.host?.querySelector('[data-price-wa-meta-reason]');
                if (status) { status.textContent = 'Durum doğrulanamadı'; status.dataset.ready = 'false'; }
                if (reason) reason.textContent = state.meta.message;
                notice(state.meta.message, 'error');
            }
        } finally { if (!releaseOldContext(epoch)) { state.busy = false; disableButtons(false); } }
    }

    function reset() {
        state.epoch++; state.key = ''; state.loaded = false; state.loading = false; state.busy = false;
        state.meta = null; state.error = ''; state.promise = null;
        if (state.host) { state.host.innerHTML = ''; state.host.onclick = null; state.host.oninput = null; }
        state.host = null;
    }

    async function open(host) {
        const element = typeof host === 'string' ? document.getElementById(host) : host || document.getElementById('priceWhatsappSettingsPanel');
        if (!element || element.nodeType !== 1) return;
        const current = context();
        if (state.key !== current.key || (state.host && state.host !== element)) reset();
        state.key = current.key; state.host = element; installStyle();
        element.onclick = event => {
            const button = event.target.closest('[data-price-wa-act]');
            if (!button || !element.contains(button) || button.disabled) return;
            event.preventDefault();
            if (!['info', 'submit'].includes(button.dataset.priceWaAct)) return;
            void template(button.dataset.priceWaAct);
        };
        if (!current.allowed) { render(); return; }
        if (state.loading) return state.promise;
        if (state.loaded) { if (!element.querySelector('[data-price-wa-act]')) render(); return; }
        return refresh();
    }

    root.fdPriceWhatsappSettings = Object.freeze({ open, refresh, reset, templateName: TEMPLATE });
})(window);


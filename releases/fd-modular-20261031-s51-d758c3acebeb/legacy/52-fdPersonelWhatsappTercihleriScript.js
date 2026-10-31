
/* Personnel WhatsApp choices. Saving stays in the existing personnel transaction. */
(function (root) {
    'use strict';
    if (root.fdPersonelWhatsappTercihleri) return;
    const types = Object.freeze([
        ['shift', 'Vardiya planı ve değişiklikleri'],
        ['leave', 'İzin kayıtları'],
        ['payslip', 'Ücret pusulası'],
        ['absence', 'İşe gelmeme'],
        ['missing_entry', 'Eksik giriş kaydı'],
        ['missing_exit', 'Eksik çıkış kaydı'],
        ['annual_leave', 'Yıllık izin hak edişi'],
        ['advance', 'Avans bildirimleri'],
        ['enforcement', 'İcra kaydı'],
        ['enforcement_monthly', 'Aylık icra bilgisi'],
        ['birthday', 'Doğum günü'],
        ['employment_start', 'İşe giriş bilgilendirmesi'],
        ['employment_end', 'İşten ayrılış bilgilendirmesi'],
        ['price_list', 'Fiyat listesi değişiklikleri'],
        ['manual', 'Elle yazılan ve planlanan mesajlar']
    ].map(([key, label]) => Object.freeze({ key, label })));
    const keys = new Set(types.map(item => item.key));
    const formSectionId = 'fdPersonelWhatsappTercihleriForm';
    const detailSectionId = 'fdPersonelWhatsappTercihleriDetay';
    const escape = value => String(value ?? '').replace(/[&<>"']/g, letter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[letter]));
    const manager = () => typeof isManagerUser === 'function' && isManagerUser();
    const company = () => typeof aktifSirketId === 'function' ? String(aktifSirketId() || '') : '';
    const preferences = employee => employee?.whatsappMesajTercihleri && typeof employee.whatsappMesajTercihleri === 'object' && !Array.isArray(employee.whatsappMesajTercihleri) ? { ...employee.whatsappMesajTercihleri } : {};
    const belongs = employee => Boolean(employee && typeof aktifSirketeAit === 'function' && aktifSirketeAit(employee));
    const findEmployee = id => (typeof personeller !== 'undefined' && Array.isArray(personeller) ? personeller : []).find(item => String(item.id) === String(id) && belongs(item));
    const allowed = (employee, type) => type === 'price_list' ? preferences(employee)[type] === true : !keys.has(type) || preferences(employee)[type] !== false;
    const priceAudienceNote = 'Fiyat değişikliği mesajları yalnızca Admin ve Kullanıcı hesaplarına gönderilir.';
    const roleKey = value => String(value || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
    function priceEligible(employee) {
        if (!belongs(employee) || !company()) return false;
        const employeeId = String(employee.id || '').trim();
        if (!employeeId) return false;
        const accounts = typeof kullanicilar !== 'undefined' && Array.isArray(kullanicilar) ? kullanicilar : [];
        return accounts.some(account => {
            if (String(account?.sirketId ?? account?.company_id ?? '') !== company()) return false;
            if (!['admin', 'yonetici', 'kullanici'].includes(roleKey(account?.rol ?? account?.role))) return false;
            const explicitId = String(account?.tcNo || account?.employee_legacy_id || account?.employeeLegacyId || '').trim();
            // An explicit personnel link takes precedence over a coincidental username.
            return explicitId ? explicitId === employeeId : String(account?.username || account?.legacy_username || '').trim() === employeeId;
        });
    }
    // The preference stays visible on every card. Account-role authorization is
    // checked independently by the sender; it must not hide this user's choice.
    const visibleTypes = () => types;

    function installStyle() {
        if (document.getElementById('fdPersonelWhatsappTercihleriStyle')) return;
        const style = document.createElement('style');
        style.id = 'fdPersonelWhatsappTercihleriStyle';
        style.textContent = `
            .fd-personel-wa{grid-column:1/-1;margin:12px 0 14px;padding:13px;border:1px solid #dce8e2;border-radius:11px;background:#fbfefd;min-width:0}
            .fd-personel-wa-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
            .fd-personel-wa h4{margin:0;color:#205a48;font-size:.84rem;font-weight:750}
            .fd-personel-wa p{margin:5px 0 11px;color:#64748b;font-size:.74rem;line-height:1.45}
            .fd-personel-wa-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 12px}
            .fd-personel-wa-check{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;margin:0!important;padding:8px 9px!important;min-width:0;border:1px solid #e0ebe5;border-radius:7px;color:#334155!important;background:#fff;font-size:.76rem!important;font-weight:500!important;cursor:pointer;line-height:1.35;text-align:left!important}
            .fd-personel-wa-check input[type=checkbox]{flex:0 0 16px;width:16px!important;height:16px!important;margin:0!important;padding:0!important;accent-color:#059669}
            .fd-personel-wa-check span{overflow-wrap:anywhere;min-width:0}
            .fd-personel-wa-check:has(input:focus-visible){outline:2px solid #0284c7;outline-offset:2px}
            .fd-personel-wa-edit{padding:7px 9px;border:1px solid #bddbce;border-radius:7px;background:#fff;color:#205a48;font-size:.72rem;font-weight:650;cursor:pointer;white-space:normal}
            .fd-personel-wa-count{flex:0 0 auto;color:#64748b;font-size:.7rem;white-space:nowrap}
            .fd-personel-wa-summary{display:flex;flex-wrap:wrap;gap:6px}
            .fd-personel-wa-summary span{padding:5px 8px;border:1px solid #dce8e2;border-radius:6px;background:#fff;color:#475569;font-size:.72rem;line-height:1.3}
            .fd-personel-wa-summary span[data-disabled=true]{color:#64748b;background:#f1f5f9;border-style:dashed}
            #modalPersonel details.fd-personel-wa{padding:0;background:#fff}
            #modalPersonel .fd-personel-wa>summary{display:flex;align-items:center;gap:10px;cursor:pointer}
            #modalPersonel .fd-personel-wa>summary::before{content:'›';font-size:20px;line-height:1;transition:transform .15s}
            #modalPersonel .fd-personel-wa[open]>summary::before{transform:rotate(90deg)}
            #modalPersonel .fd-personel-wa>summary .fd-personel-wa-count{margin-left:auto;font-size:12px}
            #modalPersonel .fd-personel-wa-body{padding:15px}
            #modalPersonel .fd-personel-wa p{font-size:12px;line-height:1.55}
            #modalPersonel .fd-personel-wa-check{font-size:14px!important;min-height:42px}
            #modalPersonel .fd-personel-wa-check input[type=checkbox]{flex-basis:18px;width:18px!important;height:18px!important;min-height:18px!important}
            @media(max-width:520px){.fd-personel-wa-grid{grid-template-columns:1fr}.fd-personel-wa-head{align-items:flex-start}.fd-personel-wa{padding:11px}.fd-personel-wa-edit{max-width:145px}}
        `;
        document.head.appendChild(style);
    }

    function updateCount(section) {
        const count = section.querySelector('[data-personel-wa-count]');
        if (!count) return;
        const checked = section.querySelectorAll('[data-personel-wa-key]:checked').length;
        count.textContent = checked + ' / ' + section.querySelectorAll('[data-personel-wa-key]').length + ' açık';
    }

    function mountForm(employee = null) {
        const form = document.getElementById('personelForm');
        if (!form || !manager() || (employee && !belongs(employee))) return;
        installStyle();
        let section = document.getElementById(formSectionId);
        if (!section) {
            section = document.createElement('details');
            section.id = formSectionId;
            section.className = 'profile-section fd-personel-wa';
            section.setAttribute('aria-labelledby', 'fdPersonelWaFormBaslik');
            section.addEventListener('toggle', () => {
                if (section.open) form.querySelectorAll('details.profile-section[open]').forEach(other => { if (other !== section) other.open = false; });
            });
        }
        const notes = form.querySelector('.profile-notes');
        const career = document.getElementById('pZimmetNotu')?.closest('details.profile-section');
        if (career && form.contains(career)) career.after(section);
        else form.insertBefore(section, notes || form.querySelector('button[type=submit]'));
        section.open = false;
        section.dataset.employeeId = employee ? String(employee.id) : '';
        section.dataset.companyId = company();
        section.innerHTML = `<summary><span id="fdPersonelWaFormBaslik">WhatsApp Mesaj Tercihleri</span><span class="fd-personel-wa-count" data-personel-wa-count aria-live="polite"></span></summary><div class="fd-personel-wa-body"><p>Gönderilmesini istemediğiniz mesajların işaretini kaldırın. Tercihler personel kaydıyla birlikte kaydedilir; bekleyen mesajlarda da uygulanır.</p><div class="fd-personel-wa-grid">${visibleTypes(employee).map(type => `<label class="fd-personel-wa-check"><input type="checkbox" data-personel-wa-key="${type.key}" ${allowed(employee, type.key) ? 'checked' : ''}><span>${escape(type.label)}</span></label>`).join('')}</div>${priceEligible(employee) ? '' : `<p class="fd-personel-wa-audience-note">${escape(priceAudienceNote)}</p>`}</div>`;
        section.onchange = () => updateCount(section);
        updateCount(section);
    }

    function read(employee = null) {
        const result = preferences(employee);
        const section = document.getElementById(formSectionId);
        const editId = String(document.getElementById('pEditOriginalId')?.value || '');
        const expectedId = employee ? String(employee.id) : '';
        if (!manager() || !section || section.dataset.companyId !== company() || section.dataset.employeeId !== expectedId || editId !== expectedId || (employee && !belongs(employee))) return result;
        for (const type of visibleTypes(employee)) {
            const checkbox = section.querySelector('[data-personel-wa-key="' + type.key + '"]');
            if (checkbox) result[type.key] = Boolean(checkbox.checked);
        }
        return result;
    }

    function mountDetail(employee) {
        const body = document.getElementById('detayModalBody');
        if (!body || !belongs(employee)) return;
        installStyle();
        document.getElementById(detailSectionId)?.remove();
        const section = document.createElement('section');
        section.id = detailSectionId;
        section.className = 'fd-personel-wa';
        section.setAttribute('aria-labelledby', 'fdPersonelWaDetayBaslik');
        section.innerHTML = `<div class="fd-personel-wa-head"><h4 id="fdPersonelWaDetayBaslik">WhatsApp Mesaj Tercihleri</h4>${manager() ? '<button type="button" class="fd-personel-wa-edit">Mesaj Tercihlerini Düzenle</button>' : ''}</div><div class="fd-personel-wa-summary">${visibleTypes(employee).map(type => `<span data-disabled="${!allowed(employee, type.key)}">${escape(type.label)} · ${allowed(employee, type.key) ? 'Açık' : 'Kapalı'}</span>`).join('')}</div>${priceEligible(employee) ? '' : `<p class="fd-personel-wa-audience-note">${escape(priceAudienceNote)}</p>`}`;
        section.querySelector('button')?.addEventListener('click', () => {
            if (!manager() || !findEmployee(employee.id) || typeof root.personelDuzenle !== 'function') return;
            // The detail stays intact if editing is cancelled; no preference is written here.
            if (typeof closePersonelDetayModal === 'function') closePersonelDetayModal();
            else { const modal = document.getElementById('modalPersonelDetay'); if (modal) modal.style.display = 'none'; }
            root.personelDuzenle(employee.id);
            requestAnimationFrame(() => {
                const preferences = document.getElementById(formSectionId);
                if (preferences) preferences.open = true;
                document.getElementById(formSectionId)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                document.querySelector('#' + formSectionId + ' input')?.focus({ preventScroll: true });
            });
        });
        body.appendChild(section);
    }

    function wrap(name, callback, requireEmployee = false) {
        const original = root[name];
        if (typeof original !== 'function') return;
        root[name] = function (...args) {
            const employee = requireEmployee ? findEmployee(args[0]) : null;
            if (requireEmployee && !employee) return;
            const result = original.apply(this, args);
            if (result && typeof result.then === 'function') return result.then(value => { if(value!==false)callback(employee); return value; });
            callback(employee);
            return result;
        };
    }

    root.fdPersonelWhatsappTercihleri = Object.freeze({ types, allowed, read, mountForm, mountDetail, priceEligible });
    wrap('openPersonelModal', () => mountForm());
    wrap('personelDuzenle', mountForm, true);
    wrap('openPersonelDetayModal', mountDetail, true);
})(window);


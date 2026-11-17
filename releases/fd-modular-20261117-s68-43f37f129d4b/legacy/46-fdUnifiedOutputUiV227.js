
/* One read-only output workflow for the desktop portal and mobile app. */
(function (root) {
    'use strict';
    const groups = new WeakMap(), liveGroups = new Set();
    let preparing = false, current = null, observer, scanTimer, sequence = 0, sessionEpoch = 0;
    const pendingRoots = new Set(), pendingParents = new Set();
    let cleanupPending = false;
    const scanStats = { observerBatches: 0, mutationRecords: 0, flushes: 0, fullScans: 0, subtreeScans: 0, buttonsInspected: 0, groupSynchronizations: 0, ignoredMutations: 0, processingMs: 0 };
    const scanClock = () => root.performance?.now?.() ?? Date.now();
    const buttonSelector = 'button,a.btn-export';
    const icon = '<svg class="fd-output-printer-icon" data-fd-output-printer="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 8V3h10v5M7 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3"/><path d="M7 14h10v7H7z"/><path d="M17 11h.01"/></svg>';
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const norm = value => String(value || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
    const message = (text, type = 'warning') => typeof root.showToast === 'function' ? root.showToast(text, type) : root.alert(text);
    const code = button => button.getAttribute('onclick') || String(button.onclick || '');
    const excluded = '#fdOrtakCiktiOnizleme,#fdUnifiedOutputModal,#modalPersonelExport,#modalAracExport,#modalTapuCksKayit,#fdCksPdfKontrolModal';

    function decorateButton(button, label = 'Yazdır / dışa aktar') {
        if (!button || button.tagName !== 'BUTTON') return button;
        button.classList.add('fd-output-icon-button');
        button.dataset.fdOutputIcon = 'true';
        button.title = label;
        button.setAttribute('aria-label', label);
        if (button.childElementCount !== 1 || !button.firstElementChild?.matches('svg[data-fd-output-printer]') || button.textContent.trim()) button.innerHTML = icon;
        return button;
    }

    function ownMutation(element) {
        return !!element?.closest?.('.fd-output-menu,' + excluded) || !!(element?.matches?.('button[data-fd-output-icon="true"]') && !element.textContent.trim() && element.firstElementChild?.matches('svg[data-fd-output-printer]'));
    }

    function kind(button) {
        if (!button || button.tagName === 'A' || button.closest(excluded) || button.closest('.fd-output-menu') || button.dataset.fdOutputOwn) return '';
        const label = norm(button.textContent), handler = code(button), both = norm(label + ' ' + handler);
        if (/yukle|dosya sec|belgeyi ac|sablon/.test(label)) return '';
        if (/sablon|dosyasi.*sec|dosyasini.*oku|excel.*yukle|belge.*goruntule|pusulasi|sozlesme|dilekce|taahhut|tapuGoruntu/i.test(both)) return '';
        if (/fdCikti|fdUnifiedOutput|pdfAc\(|belgeAc\(|GoruntuIndir\(/.test(handler)) return '';
        if (/tapuExcelKayitlariniAktar|ihracatProforma|ihracatCeki|ihracat(?:Form)?TumBelgeler|Sablonu|DosyasiSec|DosyasiniOku/.test(handler)) return '';
        if (/personelBelge|bordroBelgesi|bordroPersonelPusulasi|kiraSozlesme|icraPdfAc|icraDilekce|cksYilBelge|fdFiyatV2Belge|tapuGoruntu|ihracat(?:Form)?(?:Belge|CekiBelge|Proforma)/.test(handler)) return '';
        if (button.closest('td') && !/Excel|Pdf|PDF|GoruntuAl|DisariAl/.test(handler)) return '';
        if (/Goruntu|goruntu|goruntu|EkranGoruntusu/.test(handler) && /goruntu|ekran/.test(label)) return 'image';
        if (/goruntu al|ekran goruntusu/.test(label)) return 'image';
        if (/excel/.test(label) && !/belgeyi ac|mevcut belge|indir.*belge/.test(label)) return 'excel';
        if (/^\W*pdf(?:\s|$)/.test(label) || /pdf (?:aktar|al|olustur)/.test(label)) return 'pdf';
        return '';
    }

    function titleFor(group) {
        if (group.title) return group.title;
        const area = group.parent.closest('.card,.modal-card,.fd-ft-page,.fd-vk-detail-card,.tapu-module,.app-container,[id$="App"]') || group.parent.parentElement;
        const heading = area?.querySelector('h2,h3,h4,.card-title');
        return (heading?.textContent || group.parent.getAttribute('aria-label') || 'Tablo / Liste').trim().replace(/^[^\p{L}\p{N}]+/u, '');
    }

    function hideOriginal(item) {
        const style = item.button.style;
        if (!Object.prototype.hasOwnProperty.call(item, 'sourceDisplay') || style.display !== 'none' || style.getPropertyPriority('display') !== 'important') item.sourceDisplay = style.display;
        item.button.classList.add('fd-output-original');
        // Some old toolbars force inline-flex with two ID selectors and !important.
        // Inline hiding ensures the old controls cannot leak through those styles.
        style.setProperty('display', 'none', 'important');
    }

    function synchronize(parents) {
        const candidates = parents ? Array.from(parents, parent => groups.get(parent)).filter(Boolean) : liveGroups;
        for (const group of candidates) {
            if (!group.parent.isConnected) { liveGroups.delete(group); continue; }
            scanStats.groupSynchronizations++;
            const buttons = Array.from(group.parent.querySelectorAll(':scope > button,:scope > a')).filter(b => !b.dataset.fdOutputOwn && kind(b));
            for (const button of buttons) {
                const format = kind(button);
                if (!group.items.some(item => item.button === button)) group.items.push({ button, format });
                hideOriginal(group.items.find(item => item.button === button));
            }
            group.items = group.items.filter(item => item.button.isConnected && item.button.parentElement === group.parent);
            if (!group.items.length) { group.wrapper.remove(); liveGroups.delete(group); groups.delete(group.parent); continue; }
            if (group.wrapper.parentElement !== group.parent) group.parent.insertBefore(group.wrapper, group.items[0].button);
            group.wrapper.hidden = group.items.every(item => item.button.hidden || item.sourceDisplay === 'none');
        }
    }

    function discover(scope, parents) {
        if (!scope?.isConnected && scope !== document) return;
        if (scope === document) scanStats.fullScans++; else scanStats.subtreeScans++;
        const buttons = scope.matches?.(buttonSelector) ? [scope] : Array.from(scope.querySelectorAll?.(buttonSelector) || []);
        buttons.forEach(button => {
            scanStats.buttonsInspected++;
            if (!button.closest(excluded) && norm(button.textContent).trim() === 'cikti') decorateButton(button);
            const format = kind(button); if (!format) return;
            const parent = button.parentElement; if (!parent) return;
            parents.add(parent);
            let group = groups.get(parent);
            if (!group) {
                const wrapper = document.createElement('span'); wrapper.className = 'fd-output-menu'; wrapper.dataset.fdOutputOwn = 'true';
                const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'fd-output-trigger';
                trigger.dataset.fdOutputOwn = 'true'; decorateButton(trigger); trigger.setAttribute('aria-haspopup', 'dialog');
                group = { parent, wrapper, trigger, items: [], id: ++sequence };
                trigger.onclick = event => { event.preventDefault(); event.stopPropagation(); open(group); };
                if (button.style.marginLeft === 'auto') wrapper.style.marginLeft = 'auto';
                parent.insertBefore(wrapper, button); wrapper.appendChild(trigger);
                groups.set(parent, group); liveGroups.add(group);
            }
            liveGroups.add(group);
            if (!group.wrapper.isConnected || group.wrapper.parentElement !== parent) parent.insertBefore(group.wrapper, button);
            if (!group.items.some(item => item.button === button)) group.items.push({ button, format });
            hideOriginal(group.items.find(item => item.button === button));
        });
    }

    // A full discovery is retained for startup and the explicit public scan API.
    // Live updates inspect only added subtrees and directly affected toolbars.
    function scan(scope = document) {
        const started = scanClock();
        const parents = new Set();
        discover(scope, parents);
        synchronize(scope === document ? null : parents);
        scanStats.processingMs += scanClock() - started;
    }

    function flush() {
        const started = scanClock();
        scanTimer = null; scanStats.flushes++;
        const roots = Array.from(pendingRoots), rootSet = new Set(roots), parents = new Set(pendingParents);
        pendingRoots.clear(); pendingParents.clear();
        for (const scope of roots) {
            let ancestor = scope.parentElement, covered = false;
            while (ancestor) { if (rootSet.has(ancestor)) { covered = true; break; } ancestor = ancestor.parentElement; }
            if (!covered) discover(scope, parents);
        }
        synchronize(parents);
        if (cleanupPending) {
            for (const group of liveGroups) if (!group.parent.isConnected) liveGroups.delete(group);
            cleanupPending = false;
        }
        scanStats.processingMs += scanClock() - started;
    }

    function schedule(mutations) {
        scanStats.observerBatches++; scanStats.mutationRecords += mutations.length;
        for (const mutation of mutations) {
            const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
            if (ownMutation(target)) { scanStats.ignoredMutations++; continue; }
            if (!mutation.removedNodes.length && mutation.addedNodes.length && Array.from(mutation.addedNodes).every(node => node.nodeType === 1 && ownMutation(node))) { scanStats.ignoredMutations++; continue; }
            if (groups.has(target)) pendingParents.add(target);
            const button = target?.closest?.(buttonSelector);
            if (button) pendingRoots.add(button);
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && !ownMutation(node)) pendingRoots.add(node);
            }
            if (mutation.removedNodes.length) cleanupPending = true;
        }
        if (scanTimer || (!pendingRoots.size && !pendingParents.size && !cleanupPending)) return;
        if (typeof root.requestIdleCallback === 'function') scanTimer = root.requestIdleCallback(flush, { timeout: 60 });
        else scanTimer = setTimeout(flush, 60);
    }

    // Export functions are used ONLY to obtain their existing filtered data.
    // Output sinks are scoped to this user action and always restored in finally.
    // Automated reports and application-wide exporters are never replaced.
    async function capture(button, title) {
        const workbooks = [], tableModels = [], blobs = [], previews = [], restore = [], pending = [];
        const patch = (object, key, value) => {
            if (!object || typeof object[key] !== 'function') return;
            const previous = object[key]; object[key] = value;
            restore.push(() => { object[key] = previous; });
        };
        const fakePreview = (format, filename) => {
            const m = document.createElement('div'); m._tur = format; m.dosyaAdi = filename;
            m.innerHTML = '<div data-cikti-icerik></div><a data-cikti-kaydet></a>';
            m.sayfalar = m.querySelector('[data-cikti-icerik]'); m.katman = m; previews.push(m); return m;
        };
        patch(root.XLSX, 'writeFile', (wb, filename) => { workbooks.push({ wb, filename }); });
        patch(root, 'fdCiktiExcelOnizle', (wb, filename) => { workbooks.push({ wb, filename }); return fakePreview('excel', filename); });
        patch(root, 'fdCiktiOnizlemeAc', fakePreview);
        patch(root, 'fdCiktiBlobBagla', (m, blob, filename) => { m._blob = blob; m.dosyaAdi = filename; blobs.push({ blob, filename, format: m._tur }); });
        patch(root, 'fdCiktiExcelJsOnizle', (wb, blob, filename) => { blobs.push({ blob, filename, format: 'excel' }); return fakePreview('excel', filename); });
        patch(root, 'fdTabloPdfOnizle', (source, heading, filename, options = {}) => {
            tableModels.push(root.fdOutputModels.fromTable(source, { title: heading || title, subtitle: options.donem || options.altBaslik || '' }));
            return Promise.resolve();
        });
        patch(root, 'fdPdfOnizlemeUret', (source, filename, options = {}) => {
            const tables = source?.matches?.('table') ? [source] : Array.from(source?.querySelectorAll?.('table') || []);
            for (const table of tables) tableModels.push(root.fdOutputModels.fromTable(table, { title: table.previousElementSibling?.textContent || options.altBaslik || title }));
            return Promise.resolve();
        });
        // Inline onclick handlers normally discard the async function's return.
        // Track the invoked exporter promises so sinks stay captured until done.
        const names = [...new Set(Array.from(code(button).matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g), match => match[1]))];
        for (const name of names) {
            if (typeof root[name] !== 'function' || /^fdCikti|^fdTabloPdf|^fdPdfOnizleme/.test(name)) continue;
            const original = root[name];
            patch(root, name, function (...args) {
                const result = original.apply(this, args);
                if (result && typeof result.then === 'function') { const promise = Promise.resolve(result); pending.push(promise); promise.catch(() => {}); }
                return result;
            });
        }
        try {
            if (typeof button.onclick !== 'function') throw new Error('Bu listenin çıktı kaynağı bulunamadı.');
            await button.onclick.call(button, { target: button, currentTarget: button, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} });
            for (let index = 0; index < pending.length; index++) await pending[index];
            let models = workbooks.flatMap(entry => root.fdOutputModels.fromWorkbook(entry.wb, entry.filename));
            for (const entry of blobs) {
                if (entry.format === 'excel' || /\.xlsx?$/i.test(entry.filename || '')) {
                    const wb = root.XLSX.read(await entry.blob.arrayBuffer(), { type: 'array', cellDates: true });
                    models.push(...root.fdOutputModels.fromWorkbook(wb, entry.filename));
                }
            }
            if (!models.length) models = tableModels;
            if (!models.length) for (const preview of previews) for (const table of preview.querySelectorAll('table')) models.push(root.fdOutputModels.fromTable(table, { title }));
            return models.filter(Boolean);
        } finally { restore.reverse().forEach(fn => fn()); }
    }

    function nearbyTable(group) {
        let parent = group.parent;
        for (let step = 0; parent && step < 5; step++, parent = parent.parentElement) {
            const tables = Array.from(parent.querySelectorAll('table')).filter(table => !table.closest(excluded));
            if (tables.length === 1) return tables[0];
            if (tables.length > 1) return tables.find(table => table.getBoundingClientRect().height > 0) || tables[0];
        }
        return null;
    }

    async function acquire(group) {
        const title = titleFor(group), custom = await root.fdOutputAdapters?.get(group);
        if (custom?.length) return custom;
        const excel = group.items.find(item => item.format === 'excel');
        if (excel) {
            const models = await capture(excel.button, title);
            if (models.length) return root.fdOutputAdapters?.filterCaptured?.(group, models) || models;
            // Do not silently export only a paginated screen when a full exporter fails.
            throw new Error('Listenin tüm satırları hazırlanamadı. Sayfayı yenileyip tekrar deneyin.');
        }
        const pdf = group.items.find(item => item.format === 'pdf');
        // Only safe PDF functions that hand a table to the shared preview may be captured.
        if (pdf && /fdTabloPdfOnizle|fdPdfOnizlemeUret/.test(String(root[(code(pdf.button).match(/([\w$]+)\s*\(/)?.[1])] || ''))) {
            const models = await capture(pdf.button, title); if (models.length) return models;
        }
        const table = nearbyTable(group);
        if (table) return [root.fdOutputModels.fromTable(table, { title })];
        throw new Error('Çıktı alınacak tablo bulunamadı.');
    }

    function prepareModels(models, group) {
        const metadata = models.filter(model => /^(rapor bilgisi|report info)$/i.test(model.title || ''));
        const notes = metadata.flatMap(model => model.rows.map(row => model.columns.map((column, index) => Array.isArray(row) ? row[index] : row[column.key]).filter(value => value !== '' && value != null).join(': ')));
        const reports = models.filter(model => !metadata.includes(model));
        for (const model of reports) {
            if (/\.xlsx?$/i.test(model.subtitle || '')) model.subtitle = titleFor(group);
            model.footnotes = [...new Set([...(model.footnotes || []), ...notes])];
            // Repeat an identifying name/plate on wide PDFs, not only the row number.
            const identifying = model.columns.find(column => /personel|ad soyad|ad soyadi|plaka|urun|tasinmaz|kiraci|mulk/i.test(norm(column.label)));
            if (identifying && !model.identifierKey) model.identifierKey = identifying.key;
        }
        const result=reports.length ? reports : models;
        return root.fdAttendanceReportLayout?.prepare(group,result)||result;
    }

    function modal() {
        let m = document.getElementById('fdUnifiedOutputModal'); if (m) return m;
        m = document.createElement('div'); m.id = 'fdUnifiedOutputModal'; m.className = 'fd-output-overlay'; m.hidden = true;
        m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'fdOutputTitle');
        m.innerHTML = '<section class="fd-output-card"><header class="fd-output-head"><div><h3 id="fdOutputTitle">Çıktı alanlarını seçin</h3><p data-output-description></p></div><button type="button" data-output-close aria-label="Çıktı penceresini kapat">×</button></header><div class="fd-output-body"><div class="fd-output-selection-tools"><input type="search" data-output-search placeholder="Alan ara…" aria-label="Aktarılacak alanlarda ara"><button type="button" data-output-all>Tümünü Seç</button><button type="button" data-output-none>Temizle</button></div><div data-output-fields></div><p class="fd-output-status" data-output-status role="status" aria-live="polite"></p></div><footer class="fd-output-footer"><span data-output-count></span><div><button type="button" class="fd-output-excel" data-output-format="excel">Excel</button><button type="button" class="fd-output-pdf" data-output-format="pdf">PDF</button><button type="button" class="fd-output-image" data-output-format="image">Görüntüyü Kopyala</button></div></footer></section>';
        m.querySelector('[data-output-close]').onclick = close;
        m.onclick = event => { if (event.target === m) close(); };
        m.querySelector('[data-output-all]').onclick = () => selection(true);
        m.querySelector('[data-output-none]').onclick = () => selection(false);
        m.querySelector('[data-output-search]').oninput = event => {
            const query = norm(event.target.value);
            m.querySelectorAll('.fd-output-field').forEach(label => { label.hidden = query && !norm(label.textContent).includes(query); });
        };
        m.querySelector('[data-output-fields]').onchange = updateCount;
        m.querySelectorAll('[data-output-format]').forEach(button => { button.onclick = () => render(button.dataset.outputFormat); });
        m.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.stopPropagation(); close(); }
            if (event.key === 'Tab') {
                const elements = Array.from(m.querySelectorAll('button,input')).filter(el => !el.disabled && !el.closest('[hidden]'));
                const first = elements[0], last = elements.at(-1);
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
        });
        document.body.appendChild(m); return m;
    }

    function selection(value) {
        document.querySelectorAll('#fdUnifiedOutputModal [data-output-field]').forEach(input => { input.checked = value; }); updateCount();
    }
    function selectedModels() {
        if (!current) return [];
        const m = modal(), result = [];
        current.models.forEach((model, sheet) => {
            const indices = Array.from(m.querySelectorAll('[data-output-sheet="' + sheet + '"] input:checked')).map(input => Number(input.dataset.outputField));
            if (!indices.length) return;
            result.push({ ...model, columns: indices.map(index => model.columns[index]), rows: model.rows.map(row => indices.map(index => Array.isArray(row) ? row[index] : row[model.columns[index].key])) });
        });
        return result;
    }
    function updateCount() {
        const m = modal(), count = m.querySelectorAll('[data-output-field]:checked').length;
        m.querySelector('[data-output-count]').textContent = count + ' alan seçildi';
        m.querySelectorAll('[data-output-format]').forEach(button => { button.disabled = !count || preparing || current?.rendering; });
    }
    function status(text, error = false) {
        const element = modal().querySelector('[data-output-status]'); element.textContent = text; element.classList.toggle('error', error);
    }
    function close() {
        if (preparing || current?.rendering) return;
        modal().hidden = true; current?.group?.trigger.focus(); current = null;
    }

    async function open(group) {
        if (preparing || current?.rendering) return;
        const epoch = sessionEpoch;
        const m = modal(); current = { group, models: [], rendering: false }; preparing = true;
        m.hidden = false; group.trigger.disabled = true;
        m.querySelector('[data-output-fields]').replaceChildren(); m.querySelector('[data-output-search]').value = '';
        m.querySelector('[data-output-description]').textContent = titleFor(group);
        status('Listenin tamamı hazırlanıyor…'); updateCount();
        try {
            const models = prepareModels(await acquire(group), group);
            if (epoch !== sessionEpoch) return;
            if (group.isCurrent && !group.isCurrent()) { m.hidden = true; current = null; return; }
            if (!models.length || models.some(model => !model.columns?.length || !Array.isArray(model.rows))) throw new Error('Aktarılacak alanlar hazırlanamadı.');
            current.models = models;
            m.querySelector('[data-output-fields]').innerHTML = models.map((model, sheet) => '<section class="fd-output-sheet" data-output-sheet="' + sheet + '"><h4>' + escape(model.title || model.sheetName || 'Tablo') + '<small>' + model.rows.length + ' satır</small></h4><div class="fd-output-field-grid">' + model.columns.map((column, index) => '<label class="fd-output-field"><input type="checkbox" data-output-field="' + index + '" checked><span>' + escape(column.label || column) + '</span></label>').join('') + '</div></section>').join('');
            status(models.every(model => !model.rows.length) ? 'Bu seçimde kayıt bulunmuyor.' : 'Seçtiğiniz alanlar aktarılır. Görüntü panoya kopyalanır.');
            m.querySelector('[data-output-description]').textContent = titleFor(group) + ' · ' + models.reduce((sum, model) => sum + model.rows.length, 0) + ' satır';
        } catch (error) { if (epoch === sessionEpoch) status(error.message || String(error), true); }
        finally { group.trigger.disabled = false; if (epoch === sessionEpoch) { preparing = false; updateCount(); m.querySelector('[data-output-close]').focus(); } }
    }

    function openList(key, trigger) {
        const definitions = {
            'policy-list': ['police', 'Poliçe Takip Listesi'],
            'cks-list': ['cks', 'ÇKS Takip Listesi'],
            'cks-detail': ['cks', 'ÇKS Parsel Geçmişi']
        };
        const definition = definitions[key];
        if (!definition || !trigger?.isConnected || !trigger.parentElement) return;
        const allowed = () => typeof root.anaMenuModulErisimiVar !== 'function' || root.anaMenuModulErisimiVar(definition[0]);
        if (!allowed()) return message('Bu listeye erişim yetkiniz bulunmuyor.');
        const scope = typeof root.fdPortalVeriOturumu === 'function' ? root.fdPortalVeriOturumu() : null;
        const area = trigger.closest('[id$="App"]');
        return open({
            key, title: definition[1], parent: trigger.parentElement, trigger, items: [],
            isCurrent: () => trigger.isConnected && (!area || area.style.display !== 'none') && allowed() &&
                (scope === null || scope === root.fdPortalVeriOturumu())
        });
    }

    function excelPreview(models, result) {
        if (!result?.blob) return;
        if (typeof root.fdCiktiOnizlemeAc !== 'function' || typeof root.fdCiktiBlobBagla !== 'function') throw new Error('Excel önizleme bileşeni yüklenemedi.');
        const preview = root.fdCiktiOnizlemeAc('excel', result.filename); root.fdCiktiBlobBagla(preview, result.blob, result.filename);
        const area = preview.querySelector('[data-cikti-icerik]'); area.replaceChildren(); area.style.cssText = 'flex:1;min-height:0;overflow:auto;padding:18px;background:#edf3f7;display:grid;gap:18px;align-content:start';
        for (const model of models) {
            const section = document.createElement('section'); section.style.cssText = 'padding:18px;background:white;border:1px solid #d7e3eb;border-radius:10px;min-width:0';
            const title = document.createElement('h3'); title.textContent = model.title; title.style.cssText = 'font:700 17px/1.4 Arial;color:#315b72;margin:0 0 7px'; section.appendChild(title);
            if (model.subtitle) { const subtitle = document.createElement('p'); subtitle.textContent = model.subtitle; subtitle.style.cssText = 'font:12px/1.5 Arial;color:#64748b;margin:0 0 13px'; section.appendChild(subtitle); }
            const wrapper = document.createElement('div'); wrapper.style.cssText = 'max-width:100%;overflow:auto';
            const table = document.createElement('table'); table.style.cssText = 'border-collapse:collapse;width:max-content;min-width:100%;table-layout:auto;font:13px Arial;color:#183246';
            const head = table.createTHead().insertRow();
            model.columns.forEach(column => { const cell = document.createElement('th'); cell.textContent = column.label; cell.style.cssText = 'padding:10px 12px;background:#e8f1f6;border:1px solid #d4dfe8;white-space:pre-wrap;max-width:300px;min-width:70px;overflow-wrap:anywhere;text-align:left;font:700 13px/1.4 Arial;color:#183246;position:static'; head.appendChild(cell); });
            const body = table.createTBody(); model.rows.forEach((row, index) => { const tr = body.insertRow(); model.columns.forEach((column, c) => { const value = Array.isArray(row) ? row[c] : row[column.key], cell = tr.insertCell(); cell.textContent = root.fdOutputRenderers.display(value, column); cell.style.cssText = 'padding:9px 12px;border:1px solid #d4dfe8;white-space:pre-wrap;max-width:300px;overflow-wrap:anywhere;vertical-align:top;font:13px/1.5 Arial;position:static;background:'+(index % 2 ? '#f7fafc' : '#fff')+';text-align:'+(typeof value === 'number' ? 'right' : 'left'); }); });
            wrapper.appendChild(table); section.appendChild(wrapper);
            for (const text of model.footnotes || []) { const note = document.createElement('p'); note.textContent = text; note.style.cssText = 'font:12px/1.5 Arial;color:#64748b;margin:10px 0 0;overflow-wrap:anywhere'; section.appendChild(note); }
            area.appendChild(section);
        }
    }

    async function render(format) {
        if (!current || current.rendering || preparing) return;
        const epoch = sessionEpoch, group = current.group;
        const isCurrent = () => epoch === sessionEpoch && (!group.isCurrent || group.isCurrent());
        if (!isCurrent()) { modal().hidden = true; current = null; return; }
        const models = selectedModels(); if (!models.length) return status('En az bir alan seçin.', true);
        current.rendering = true; updateCount(); status(format === 'image' ? 'Görüntü panoya kopyalanıyor…' : 'Çıktı hazırlanıyor…');
        const title = current.models[0]?.title || titleFor(current.group);
        const filename = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 100) + (format === 'pdf' ? '.pdf' : '.xlsx');
        try {
            // Clipboard write is initiated synchronously in this click handler.
            if (format === 'image') { const special = root.fdAttendanceReportLayout?.copyImage(group,models,{isCurrent})||root.fdOutputAdapters?.copyImage?.(group,models,{isCurrent});await (special || root.fdOutputRenderers.copyImage(models, {isCurrent})); if (!isCurrent()) return; status('Tablo görüntüsü panoya kopyalandı.'); message('Tablo görüntüsü panoya kopyalandı.', 'success'); }
            else if (format === 'pdf') { const pdfOptions = { filename, preview: true, isCurrent, onProgress: progress => { if (isCurrent()) status('PDF hazırlanıyor: ' + progress.completed + ' / ' + progress.total + ' sayfa'); } }; const special = root.fdAttendanceReportLayout?.pdf(group, models, pdfOptions); await (special || root.fdOutputRenderers.pdf(models, pdfOptions)); }
            else { const excelOptions={filename,preview:false,isCurrent};const result = await (root.fdAttendanceReportLayout?.excel(group,models,excelOptions)||root.fdOutputRenderers.excel(models,excelOptions)); if (!isCurrent()) return; excelPreview(models, result); }
            if (!isCurrent()) return;
            if (format !== 'image') modal().hidden = true;
        } catch (error) { if (isCurrent()) status(error.message || String(error), true); }
        finally {
            if (epoch === sessionEpoch && current?.group === group) {
                current.rendering = false;
                if (!isCurrent()) { modal().hidden = true; current = null; }
                updateCount();
            }
        }
    }

    function clear() { sessionEpoch++; if (current?.group?.trigger) current.group.trigger.disabled = false; current = null; preparing = false; document.getElementById('fdUnifiedOutputModal')?.remove(); document.getElementById('fdOrtakCiktiOnizleme')?.remove(); }

    root.fdUnifiedOutput = { scan, open, openList, acquire, selectedModels, capture, kind, excelPreview, clear, decorateButton, iconHtml: () => icon, performanceSnapshot: () => ({ ...scanStats }), resetPerformance: () => { for (const key of Object.keys(scanStats)) scanStats[key] = 0; }, groups: () => Array.from(liveGroups) };
    function start() {
        scan(); observer = new MutationObserver(schedule); observer.observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})(window);


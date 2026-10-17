
/* ISG document forms. Read-only generation; signatures and statutory reports are never fabricated. */
(function (root) {
    'use strict';
    const VERSION = 1;
    let generationEpoch = 0;
    const safe = value => value == null ? '' : String(value).replace(/\u0000/g, '').slice(0, 50000);
    const clone = value => JSON.parse(JSON.stringify(value || {}));
    const nameOf = person => [person?.name, person?.adSoyad, person?.adsoyad, person?.adiSoyadi, person?.fullName, person?.full_name, person?.isim, [person?.ad, person?.soyad].filter(Boolean).join(' ')].map(value => safe(value).trim()).find(Boolean) || '';
    const idOf = person => safe(person?.id ?? person?.personelId ?? person?.personel_id ?? person?.ID);
    const jobOf = person => [person?.job, person?.jobTitle, person?.gorev, person?.unvan].map(value => safe(value).trim()).find(Boolean) || '';
    const branchOf = value => safe(typeof value === 'object' ? value?.name || value?.ad || value?.label : value);
    const date = value => { const text = safe(value); const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/); return match ? `${match[3]}.${match[2]}.${match[1]}` : text || '-'; };
    const now = () => new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const templates = [
        { id: 'trainingAttendance', name: 'Eğitim Katılım ve İmza Çizelgesi', types: ['training'], roster: true },
        { id: 'trainingMinutes', name: 'Eğitim Tutanağı', types: ['training'], body: '{{tarih}} tarihinde {{sube}} işyerinde {{egitim}} konulu eğitim gerçekleştirilmesine ilişkin kayıt ve değerlendirmeler aşağıdadır. Bu form, fiilen gerçekleştirilen eğitim ve imza kayıtlarıyla birlikte tamamlanır.' },
        { id: 'trainingAssessment', name: 'Eğitim Değerlendirme Formu', types: ['training'], individual: true },
        { id: 'trainingCertificate', name: 'Eğitim Katılım Belgesi', types: ['training'], individual: true, certificate: true },
        { id: 'ppeDelivery', name: 'KKD Teslim ve Zimmet Tutanağı', types: ['personDocument', 'task'], individual: true, body: 'Aşağıda belirtilen kişisel koruyucu donanımların teslimi, kullanım bilgilendirmesi ve teslim alanın imzası ile kayıt altına alınması için düzenlenmiştir.' },
        { id: 'medicalReferral', name: 'Sağlık Muayenesi Sevk Yazısı', types: ['personDocument', 'task'], individual: true, body: '{{personel}} adlı personelin, {{gorev}} işi kapsamında gerekli işe giriş / periyodik sağlık değerlendirmesi için yetkili sağlık birimine yönlendirilmesini rica ederiz. Bu yazı sağlık raporu veya işe uygunluk kararı değildir.' },
        { id: 'emergencyAssignment', name: 'Acil Durum Ekibi Görevlendirme Yazısı', types: ['emergencyTeam'], roster: true, body: '{{sube}} işyerinin acil durum organizasyonu kapsamında aşağıdaki personellerin belirtilen görevler için görevlendirilmesi önerilir. Görevlendirme, yetkili onay ve personele tebliğ ile tamamlanır.' },
        { id: 'drillAttendance', name: 'Tatbikat Katılım ve İmza Formu', types: ['drill'], roster: true },
        { id: 'drillMinutes', name: 'Tatbikat Tutanağı', types: ['drill'], body: 'Tatbikatın amacı, gerçekleşen uygulama, gözlemler ve iyileştirme faaliyetleri aşağıda kayıt altına alınmıştır.' },
        { id: 'nonconformity', name: 'Uygunsuzluk Tespit Formu', types: ['risk', 'action', 'inspection', 'measurement', 'task'], body: 'Tespit edilen uygunsuzluk, alınacak önlemler, sorumlu kişiler ve hedef tarihler aşağıda belirtilmiştir. Tamamlanma kaydı, gerçekleştirilen faaliyetin kontrolü ve yetkili onayı ile oluşturulur.' },
        { id: 'correctiveAction', name: 'Düzeltici Faaliyet ve Kapanış Formu', types: ['risk', 'action', 'inspection', 'measurement', 'task'] },
        { id: 'incident', name: 'İş Kazası / Ramak Kala Olay Tutanağı', types: ['incident'], body: 'Olayın bilinen koşulları ve tanık beyanları aşağıda kayıt altına alınmıştır. Bu tutanak, gerekli resmi bildirimlerin yerine geçmez; olayın nedeni hakkında kesin hüküm içermez.' },
        { id: 'inspectionRequest', name: 'Periyodik Kontrol / Ölçüm Talep Yazısı', types: ['equipment', 'inspection', 'measurement'], body: '{{ekipman}} için kapsamı aşağıda belirtilen kontrol / ölçüm hizmetinin yetkili kişi veya kuruluştan alınması talep edilmektedir. Bu belge kontrol raporu veya uygunluk belgesi değildir.' },
        { id: 'providerVisit', name: 'İSG Uzmanı / OSGB Ziyaret ve Öneri Formu', types: ['provider', 'visit'], body: 'Ziyaret sırasında ele alınan konular, tespitler, öneriler ve takip edilecek işler aşağıda belirtilmiştir. Gerekli resmi defter ve kayıt işlemleri ayrıca yürütülür.' },
        { id: 'annualWorkPlan', name: 'Yıllık İSG Çalışma Planı', types: ['annualPlan', 'provider'], body: '{{yil}} yılı için planlanan çalışmalar, sorumlular ve hedef tarihler aşağıda gösterilmiştir. Plan, yetkili değerlendirme ve onay ile uygulanır.' },
        { id: 'annualTrainingPlan', name: 'Yıllık Eğitim Planı', types: ['annualPlan', 'training'], body: '{{yil}} yılı için planlanan eğitimler, hedef katılımcılar, eğitmenler ve tarihler aşağıda belirtilmiştir.' },
        { id: 'notification', name: 'Bildirim / Tebliğ Yazısı', types: ['*'], individual: true, body: 'Sayın {{personel}},\n\n{{konu}}\n\nAçıklama: {{aciklama}}\n\nBilgilerinize sunarız.' },
        { id: 'petition', name: 'Dilekçe Taslağı', types: ['*'], individual: true, body: '{{muhatap}}\n\nKonu: {{konu}}\n\n{{aciklama}}\n\nGereğini arz / rica ederim.\n\n{{tarih}}\n{{personel}}' },
        { id: 'recordSummary', name: 'İSG İş / Kayıt Özet Formu', types: ['*'] }
    ];
    const catalog = Object.freeze(templates.map(item => Object.freeze({ ...item, version: VERSION })));
    const labels = { draft: 'Taslak', planned: 'Planlandı', pending: 'Kontrol / onay bekliyor', open: 'Açık', inProgress: 'Devam ediyor', in_progress: 'Devam ediyor', awaitingReview: 'Kontrol / onay bekliyor', review: 'Kontrol / onay bekliyor', completed: 'Tamamlandı', approved: 'Onaylandı', closed: 'Kapandı', cancelled: 'İptal edildi', expired: 'Süresi doldu' };
    const teamLabels = { firstAid: 'İlk yardım', fire: 'Yangınla mücadele', evacuation: 'Tahliye', searchRescue: 'Arama / kurtarma' };
    const isMedical = record => record?.type === 'personDocument' && /^(medical|health|saglik|sağlık|sağlık raporu|saglik raporu|sağlık muayenesi)$/i.test(safe(record?.data?.kind).trim());
    function list(context = {}) { return catalog.filter(item => item.types.includes('*') || item.types.includes(context.record?.type)); }
    function contextValues(context, person) {
        const r = context.record || {}, d = r.data || {}, company = context.company;
        return { firma: (safe(typeof company === 'object' ? company?.name || company?.unvan || company?.ad : company) || safe(context.settings?.companyName) || 'İşyeri').slice(0, 400), sube: (branchOf(context.branch || r.branch) || '-').slice(0, 200), tarih: date(r.recordDate || d.date), personel: person ? nameOf(person) : '-', gorev: safe(person?.job || person?.gorev || person?.unvan) || '-', egitim: safe(d.subject || r.title) || '-', konu: safe(r.title) || '-', aciklama: isMedical(r) ? 'Sağlık kaydı - ayrıntılı sağlık bilgileri bu çıktıda yer almaz.' : safe(d.description || d.notes || r.description) || '-', ekipman: safe(d.equipmentName || d.name || context.equipment?.name || r.title) || '-', yil: safe(d.year || (r.recordDate || '').slice(0, 4)), muhatap: safe(d.addressee || context.settings?.documentAddressee) || 'İLGİLİ MAKAMA' };
    }
    function substitute(text, values) {
        const unknown = new Set();
        const result = safe(text).replace(/\{\{\s*([a-zA-ZÇĞİÖŞÜçğıöşü_]+)\s*\}\}/g, (_, key) => { if (!(key in values)) { unknown.add(key); return ''; } return safe(values[key]); });
        if (unknown.size) throw new Error('Şablonda bilinmeyen alan var: ' + Array.from(unknown).join(', '));
        return result;
    }
    function configured(template, settings) {
        const all = settings?.templates || settings?.documentTemplates || settings?.isgDocumentTemplates || {};
        const custom = Array.isArray(all) ? all.find(item => item.id === template.id) : all[template.id];
        if (custom?.enabled === false) throw new Error('Bu belge şablonu ayarlardan kapatılmış.');
        return { ...template, name: safe(custom?.title || custom?.name || template.name).slice(0, 150), body: custom?.body == null ? template.body : safe(custom.body).slice(0, 20000), footer: safe(custom?.footer).slice(0, 2000), version: safe(custom?.version || template.version).slice(0, 30) };
    }
    function selectedPeople(context) {
        const supplied = context.personIds || context.record?.personIds || [], ids = new Set(supplied.map(safe));
        return (context.people || []).filter(person => ids.has(idOf(person))).map(person => ({ id: idOf(person), name: nameOf(person), branch: branchOf(person.branch || person.sube || person.subeAdi), job: jobOf(person) }));
    }
    function canCertificate(context, person) {
        const r = context.record || {}, d = r.data || {}, attendee = (d.attendance || []).find(item => safe(item.personId) === person.id);
        return r.type === 'training' && ['completed', 'approved', 'closed'].includes(r.status) && d.trainingVerified === true && safe(d.trainerQualification).trim().length > 0 && attendee?.attended === true && attendee?.passed === true && attendee?.approved === true;
    }
    function textBlock(title, text) { return { kind: 'text', title, text: safe(text) }; }
    function table(title, columns, rows, options = {}) { return { kind: 'table', title, columns: columns.map((label, index) => ({ label, width: options.widths?.[index] || 1 })), rows: rows.map(row => row.map(safe)), minHeight: options.minHeight || 9 }; }
    function metadata(values, extra = []) { return table('Kayıt Bilgileri', ['Alan', 'Bilgi'], [['İşyeri / şube', `${values.firma} / ${values.sube}`], ['Konu / tarih', `${values.konu} / ${values.tarih}`], ...extra], { widths: [1, 3] }); }
    function signature(names = ['Düzenleyen', 'İşveren / Yetkili Onay', 'İlgili Personel']) { return table('İmza ve Onay', names, [names.map(() => 'Ad Soyad:\n\nTarih:\n\nİmza:')], { minHeight: 30 }); }
    function valueFor(context, key) {
        const r = context.record || {}, d = r.data || {}, records = context.records || [], related = records.find(item => safe(item.id) === safe(d.relatedRecordId)), equipment = context.equipment || records.find(item => safe(item.id) === safe(r.equipmentId)), provider = records.find(item => safe(item.id) === safe(d.providerId));
        const join = (...parts) => parts.filter(part => part != null && String(part).trim()).join(' / ');
        const aliases = { finding: d.findings || (r.type === 'risk' ? join(d.hazard, d.consequence) : related ? join(related.data?.hazard, related.data?.consequence, related.data?.findings) : d.description), measure: d.measures || d.actionText || (r.type === 'task' ? d.description : ''), responsibleName: context.ownerName || (context.users || []).find(item => safe(item.id) === safe(r.ownerId))?.name, completedAction: d.completionEvidence, reviewResult: d.verificationNote, completedDate: r.completedAt ? safe(r.completedAt).slice(0, 10) : '', equipmentName: equipment?.title || (r.type === 'equipment' ? r.title : ''), serialNo: equipment?.data?.serialNo, scope: d.controlKind || d.kind, providerName: provider?.data?.providerName || provider?.title || d.controller || d.lab, locationTime: join(d.eventTime, d.location), involvedNames: selectedPeople(context).map(p => p.name).join(', '), initialMeasures: d.immediateMeasures, followUp: d.correctiveAction, timeRange: r.type === 'visit' ? (d.hours == null ? '' : `${d.hours} saat`) : r.type === 'drill' ? join(d.startTime, d.minutes == null ? '' : `${d.minutes} dakika`) : '', meetingPoint: d.location, observations: d.findings, method: { classroom: 'Yüz yüze', practice: 'Uygulamalı', distance: 'Uzaktan', mixed: 'Karma' }[d.method] || d.method };
        return d[key] != null && d[key] !== '' && key !== 'method' ? d[key] : aliases[key];
    }
    function details(context, fields) { return fields.map(([label, key]) => [label, safe(valueFor(context, key)) || '-']); }
    function buildModel(templateId, context = {}) {
        if (context.permissions?.read === false) throw new Error('İSG kayıtlarını görüntüleme yetkiniz yok.');
        const found = catalog.find(item => item.id === templateId); if (!found) throw new Error('Belge şablonu bulunamadı.');
        if (!found.types.includes('*') && !found.types.includes(context.record?.type)) throw new Error('Bu kayıt türü için belge kullanılamıyor.');
        const t = configured(found, context.settings), r = context.record || {}, d = r.data || {}, people = selectedPeople(context);
        if ((t.roster || t.individual) && !people.length) throw new Error('Belge için en az bir kayıtlı personel seçin.');
        if (t.certificate && people.some(person => !canCertificate(context, person))) throw new Error('Katılım belgesi için eğitim tamamlanmış ve doğrulanmış; seçili personelin katılım, başarı ve onayı kayıtlı olmalı.');
        const selectedIds = new Set(people.map(person => person.id));
        if ((context.personIds || r.personIds || []).some(id => !(context.people || []).some(person => idOf(person) === safe(id)))) throw new Error('Seçili personellerden biri kayıtlı personel listesinde bulunamadı.');
        const units = t.individual ? people.map(person => [person]) : [people];
        const documents = units.map(unit => {
            const p = t.individual ? unit[0] : null, v = contextValues(context, p), status = labels[r.status] || safe(r.status) || '-';
            // The certificate header already identifies the workplace, training and date.
            // Do not repeat those long values in a second table and strand its signatures.
            const blocks = t.certificate ? [table('Katılımcı Bilgileri', ['Alan', 'Bilgi'], [['Ad soyad', p.name], ['Görev', p.job || '-'], ['Durum', status]], { widths: [1, 3] })] : [metadata(v, [['Durum', status], ...(p ? [['Personel / görev', `${p.name} / ${p.job || '-'}`]] : [])])];
            const body = context.bodyOverride == null ? t.body : safe(context.bodyOverride).slice(0, 20000); if (body) blocks.push(textBlock('', substitute(body, v)));
            if (['trainingAttendance', 'trainingMinutes', 'trainingCertificate', 'trainingAssessment'].includes(t.id)) {
                const fields = [['Eğitim konusu', 'subject'], ['Eğitmen / unvan', 'trainer'], ['Eğitmen yeterliliği', 'trainerQualification'], ['Süre (saat)', 'hours'], ['Yöntem / yer', 'method'], ['Eğitim yeri', 'location']];
                if (!t.certificate || valueFor(context, 'timeRange')) fields.push(['Başlangıç / bitiş', 'timeRange']);
                blocks.push(table('Eğitim Bilgileri', ['Alan', 'Bilgi'], details(context, fields), { widths: [1, 3] }));
            }
            if (t.id === 'trainingAttendance' || t.id === 'drillAttendance') blocks.push(table('Katılımcılar - imzalar fiilen alınır', ['#', 'Ad Soyad', 'Görev', 'Katılım / giriş imzası', 'Çıkış imzası'], unit.map((person, index) => [index + 1, person.name, person.job || '-', '', '']), { widths: [.35, 2, 1.3, 1.25, 1.25], minHeight: 14 }));
            if (t.id === 'trainingMinutes') blocks.push(textBlock('Kapsam, uygulama ve değerlendirme', safe(d.topics || d.description || d.notes) || '........................................................................................................\n........................................................................................................'));
            if (t.id === 'trainingAssessment') {
                const questions = Array.isArray(d.assessmentQuestions) ? d.assessmentQuestions : [];
                blocks.push(table('Değerlendirme', ['#', 'Soru / uygulama', 'Cevap / gözlem', 'Puan'], (questions.length ? questions : Array.from({ length: 5 }, () => '')).map((question, index) => [index + 1, typeof question === 'object' ? question.text || '' : question, '', '']), { widths: [.4, 2.4, 2, .5], minHeight: 18 }));
                blocks.push(textBlock('Sonuç', 'Toplam puan: ....................   Değerlendiren: ........................................\nBaşarı / katılım onayı sistemde ayrıca kaydedilir.'));
            }
            if (t.id === 'trainingCertificate') blocks.push(textBlock('Doğrulanmış katılım', `${p.name}, ${v.tarih} tarihli ${v.egitim} eğitimine ilişkin kayıtlı katılım ve değerlendirme koşullarını sağlamıştır. Bu belge yalnızca belirtilen eğitime ait kurum içi katılım kaydıdır; mesleki yeterlilik / operatör yetkisi vermez.`));
            if (t.id === 'ppeDelivery') {
                const suppliedItems = Array.isArray(context.ppeItems) ? context.ppeItems : Array.isArray(d.ppeItems) ? d.ppeItems : [], items = suppliedItems.filter(item => !item.personId || safe(item.personId) === p.id);
                blocks.push(table('Teslim Edilen KKD', ['Donanım / standart', 'Miktar', 'Ölçü / beden', 'Teslim tarihi', 'Açıklama'], (items.length ? items : [{}]).map(item => [item.name || item.item || item.equipment || '', item.quantity ?? '', item.size || '', item.date ? date(item.date) : '', item.note || '']), { widths: [2, .7, 1, 1.1, 1.5], minHeight: 14 }));
                if (Array.isArray(context.ppeItems) && items.length) blocks.push(textBlock('Kaynak', 'Seçilmiş mevcut KKD teslim kayıtlarından hazırlanmıştır. Bu çıktı yeni bir teslim kaydı veya imza oluşturmaz.'));
                blocks.push(textBlock('Teslim ve bilgilendirme', 'Kullanım, bakım ve muhafaza bilgileri: ...................................................................\nTeslim alanın açıklaması: ........................................................................................'));
            }
            if (t.id === 'medicalReferral') blocks.push(textBlock('Sevk Bilgileri', `Sevk edilen birim: ${safe(d.referralUnit) || '........................................................'}\nİş / maruziyet bilgisi: ${safe(d.exposure) || '........................................................'}\nBu formda teşhis, muayene bulgusu veya ayrıntılı sağlık verisi bulunmaz.`));
            if (t.id === 'emergencyAssignment') blocks.push(table('Görevlendirme ve Tebliğ', ['Ad Soyad', 'Ekip / görev', 'Görev başlangıcı', 'Tebellüğ imzası'], unit.map(person => [person.name, teamLabels[d.role] || safe(d.role) || '-', date(d.startDate || r.recordDate), '']), { widths: [2, 1.5, 1.2, 1.5], minHeight: 16 }));
            if (t.id === 'drillMinutes') blocks.push(table('Tatbikat Değerlendirmesi', ['Alan', 'Kayıt'], details(context, [['Senaryo / amaç', 'scenario'], ['Başlangıç / süre', 'timeRange'], ['Tatbikat yeri', 'meetingPoint'], ['Koordinatör', 'coordinator'], ['Gözlemler', 'observations'], ['Tespit / iyileştirme', 'improvements']]), { widths: [1, 3] }));
            if (['nonconformity', 'correctiveAction'].includes(t.id)) blocks.push(table('Tespit ve Faaliyet', ['Alan', 'Kayıt'], [...details(context, [['Tespit / risk', 'finding'], ['Alınacak önlem', 'measure'], ['Sorumlu', 'responsibleName'], ['Gerçekleştirilen işlem', 'completedAction'], ['Kontrol / kapanış sonucu', 'reviewResult']]), ['Hedef tarih', date(r.dueDate)], ['Kapanış tarihi', date(valueFor(context, 'completedDate'))]], { widths: [1, 3] }));
            if (t.id === 'incident') blocks.push(table('Olay Kaydı', ['Alan', 'Kayıt'], [['Olay türü', d.kind === 'nearMiss' ? 'Ramak kala' : 'İş kazası / olay'], ...details(context, [['Saat / yer', 'locationTime'], ['Olayın açıklaması', 'description'], ['İlgili kişiler', 'involvedNames'], ['Tanıklar / beyanlar', 'witnesses'], ['İlk alınan önlemler', 'initialMeasures'], ['Kök neden / inceleme', 'rootCause'], ['Takip faaliyetleri', 'followUp']]), ['Resmi bildirim takip durumu', safe(d.sgkStatus) || '-'], ['Bildirim referansı / tarihi', `${safe(d.sgkReference) || '-'} / ${date(d.sgkNotificationDate)}`]], { widths: [1, 3] }));
            if (t.id === 'inspectionRequest') blocks.push(table('Talep Kapsamı', ['Alan', 'Bilgi'], details(context, [['Ekipman / tesisat', 'equipmentName'], ['Envanter / seri no', 'serialNo'], ['Kontrol / ölçüm kapsamı', 'scope'], ['Yetkili kişi / kuruluş', 'providerName'], ['Talep notu', 'notes']]), { widths: [1, 3] }));
            if (t.id === 'providerVisit') blocks.push(table('Ziyaret Kaydı', ['Alan', 'Kayıt'], details(context, [['Uzman / kuruluş', 'providerName'], ['Ziyaret süresi', 'timeRange'], ['Ele alınan konular', 'topics'], ['Tespit ve öneriler', 'recommendations'], ['Takip edilecek işler', 'followUp']]), { widths: [1, 3] }));
            if (['annualWorkPlan', 'annualTrainingPlan'].includes(t.id)) {
                const tasks = Array.isArray(d.items) ? d.items : Array.isArray(d.planItems) ? d.planItems : [];
                blocks.push(table('Planlanan Çalışmalar', ['Konu / faaliyet', 'Hedef tarih', 'Sorumlu / eğitmen', 'Katılımcılar / kapsam', 'Durum'], (tasks.length ? tasks : [{}]).map(item => [item.title || item.subject || '', date(item.date || item.dueDate), item.owner || item.trainer || '', item.scope || item.participants || '', labels[item.status] || safe(item.status)]), { widths: [1.9, 1.1, 1.5, 1.6, 1], minHeight: 14 }));
            }
            if (t.id === 'recordSummary') blocks.push(textBlock('Açıklama / takip', isMedical(r) ? 'Sağlık kaydı - ayrıntılı sağlık bilgileri bu çıktıda yer almaz.' : safe(d.description || d.notes || r.description) || '-'));
            blocks.push(signature(t.id === 'petition' ? ['Başvuran / İmza'] : t.id === 'medicalReferral' ? ['Sevk Eden / Yetkili'] : ['Düzenleyen', 'İşveren / Yetkili Onay', ...(p ? ['İlgili Personel'] : [])]));
            if (t.footer) blocks.push(textBlock('', substitute(t.footer, v)));
            return { title: t.name, subtitle: `${v.firma} - ${v.sube}`, reference: `${v.konu.slice(0, 240)} / ${v.tarih}`, person: p?.name || '', blocks };
        });
        const generatedAt = context.generatedAt || now();
        const snapshot = { schemaVersion: VERSION, templateId: t.id, templateVersion: t.version, sourceId: safe(r.id), sourceRevision: Number(r.revision) || 0, recordType: safe(r.type), branch: branchOf(context.branch || r.branch), selectedPersonIds: Array.from(selectedIds), sourceKkdIds: templateId === 'ppeDelivery' ? (context.ppeItems || []).filter(item => !item.personId || selectedIds.has(safe(item.personId))).map(item => safe(item.id)).filter(Boolean) : [], generatedAt, state: 'draft', documents: clone(documents) };
        return { schemaVersion: VERSION, templateId: t.id, templateVersion: t.version, title: t.name, generatedAt, sourceId: snapshot.sourceId, sourceRevision: snapshot.sourceRevision, state: 'draft', documents, snapshot };
    }
    function approximateMeasure(text, pt, bold) { return Array.from(safe(text)).reduce((sum, char) => sum + (/\s/.test(char) ? .28 : /[ilIıİ.,:;'!|]/.test(char) ? .3 : /[MWĞÖÜ@%]/.test(char) ? .8 : .54), 0) * pt * 25.4 / 72 * (bold ? 1.04 : 1); }
    function browserMeasure() { const canvas = root.document?.createElement('canvas'), ctx = canvas?.getContext('2d'); return ctx ? (text, pt, bold) => { ctx.font = `${bold ? 'bold ' : ''}${pt * 96 / 72}px Arial`; return ctx.measureText(safe(text)).width * 25.4 / 96; } : approximateMeasure; }
    function wrap(text, width, measure, size = 10, bold = false) {
        if (!(width > 0)) throw new Error('Belge alanı genişliği geçersiz.');
        const lines = [];
        safe(text).split('\n').forEach(paragraph => {
            if (!paragraph) { lines.push(''); return; }
            let current = '';
            paragraph.split(/\s+/).forEach(word => {
                const test = current ? `${current} ${word}` : word;
                if (measure(test, size, bold) <= width) { current = test; return; }
                if (current) { lines.push(current); current = ''; }
                if (measure(word, size, bold) <= width) { current = word; return; }
                for (const char of Array.from(word)) { if (current && measure(current + char, size, bold) > width) { lines.push(current); current = ''; } current += char; }
            });
            lines.push(current);
        }); return lines;
    }
    function plan(model, measure = approximateMeasure) {
        const pages = [], width = 182, left = 14, bottom = 278, line = 4.6, padding = 2.4, font = 10;
        model.documents.forEach((document, documentIndex) => {
            let page, y;
            const headerTitles = wrap(document.title, 145, measure, 15, true), headerSubtitles = wrap(document.subtitle, 182, measure, 8.5), headerReferences = wrap(document.reference || '', 182, measure, 8), subtitleY = 17 + headerTitles.length * 6 + 3, referenceY = subtitleY + headerSubtitles.length * 3.9 + 1, headerBottom = Math.max(40, referenceY + headerReferences.length * 3.7 + 4), bodyTop = headerBottom + 4;
            const fresh = () => { page = { documentIndex, title: document.title, subtitle: document.subtitle, person: document.person, headerTitles, headerSubtitles, headerReferences, subtitleY, referenceY, headerBottom, commands: [] }; pages.push(page); y = bodyTop; };
            const ensure = height => { if (y + height > bottom) fresh(); };
            const heading = title => { if (!title) return; ensure(12); page.commands.push({ kind: 'heading', x: left, y, text: title, height: 8 }); y += 9; };
            fresh();
            document.blocks.forEach(block => {
                if (block.kind === 'text') {
                    const lines = wrap(block.text, width, measure, font);
                    ensure((block.title ? 9 : 0) + Math.min(2, lines.length) * line + 2); heading(block.title);
                    lines.forEach(text => { ensure(line); page.commands.push({ kind: 'line', x: left, y, text, size: font, height: line }); y += line; }); y += 4; return;
                }
                const total = block.columns.reduce((sum, col) => sum + col.width, 0), widths = block.columns.map(col => width * col.width / total);
                const heads = block.columns.map((col, index) => wrap(col.label, widths[index] - padding * 2, measure, 9, true));
                const headHeight = Math.max(...heads.map(lines => lines.length)) * 4.2 + padding * 2;
                const firstHeight = block.rows.length ? Math.max(block.minHeight, Math.min(22, Math.max(...block.rows[0].map((cell, index) => wrap(cell, widths[index] - padding * 2, measure, font).length)) * line + padding * 2)) : 0;
                ensure((block.title ? 9 : 0) + headHeight + firstHeight); heading(block.title);
                const drawHead = continued => { if (continued && block.title) heading(block.title + ' (devam)'); page.commands.push({ kind: 'row', x: left, y, widths, cells: heads, height: headHeight, header: true, font: 9, lineHeight: 4.2, padding }); y += headHeight; };
                drawHead(false);
                block.rows.forEach((row, rowIndex) => {
                    const cells = row.map((value, index) => wrap(value, widths[index] - padding * 2, measure, font)), count = Math.max(...cells.map(lines => lines.length)), minHeight = block.minHeight;
                    let offset = 0;
                    while (offset < count) {
                        const available = bottom - y, remaining = count - offset, desired = Math.max(minHeight, remaining * line + padding * 2);
                        if (desired > available && desired <= bottom - bodyTop - headHeight - (block.title ? 9 : 0)) { fresh(); drawHead(true); continue; }
                        const capacity = Math.floor((bottom - y - padding * 2) / line);
                        if (capacity < 1 || (Math.max(minHeight, line + padding * 2) > bottom - y)) { fresh(); drawHead(true); continue; }
                        const take = Math.min(remaining, capacity), height = Math.max(minHeight, take * line + padding * 2);
                        page.commands.push({ kind: 'row', x: left, y, widths, cells: cells.map(lines => lines.slice(offset, offset + take)), height, header: false, font, lineHeight: line, padding, rowIndex, continuation: offset > 0 }); y += height; offset += take;
                        if (offset < count) { fresh(); drawHead(true); }
                    }
                }); y += 5;
            });
        });
        pages.forEach((page, index) => { page.number = index + 1; page.total = pages.length; });
        return { pageWidth: 210, pageHeight: 297, left, width, bottom, pages, sourceId: model.sourceId, sourceRevision: model.sourceRevision, generatedAt: model.generatedAt, templateVersion: model.templateVersion, digest: model.digest || '' };
    }
    function drawPage(layout, index, scale = 8.5) {
        if (!root.document) throw new Error('PDF çizim bileşeni yüklenemedi.');
        const page = layout.pages[index], canvas = root.document.createElement('canvas'); canvas.width = Math.round(210 * scale); canvas.height = Math.round(297 * scale);
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('PDF çizim alanı oluşturulamadı.');
        ctx.scale(scale, scale); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 210, 297);
        function text(value, x, y, size = 10, bold = false, color = '#203447') { ctx.font = `${bold ? 'bold ' : ''}${size * 25.4 / 72}px Arial`; ctx.fillStyle = color; ctx.textBaseline = 'top'; ctx.fillText(safe(value), x, y); }
        text('İŞ SAĞLIĞI VE GÜVENLİĞİ', 14, 11, 8, true, '#087b80');
        page.headerTitles.forEach((title, line) => text(title, 14, 17 + line * 6, 15, true));
        text('İMZA İÇİN TASLAK', 158, 12, 8, true, '#6f7180');
        page.headerSubtitles.forEach((value, line) => text(value, 14, page.subtitleY + line * 3.9, 8.5, false, '#64748b'));
        page.headerReferences.forEach((value, line) => text(value, 14, page.referenceY + line * 3.7, 8, false, '#64748b'));
        ctx.strokeStyle = '#b6cad4'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(14, page.headerBottom); ctx.lineTo(196, page.headerBottom); ctx.stroke();
        page.commands.forEach(command => {
            if (command.kind === 'heading') { ctx.fillStyle = '#edf4f7'; ctx.fillRect(command.x, command.y, layout.width, command.height - 1); text(command.text, command.x + 2.3, command.y + 1.5, 10, true); return; }
            if (command.kind === 'line') { text(command.text, command.x, command.y, command.size); return; }
            let x = command.x;
            command.widths.forEach((width, column) => {
                ctx.fillStyle = command.header ? '#e4edf2' : '#ffffff'; ctx.fillRect(x, command.y, width, command.height);
                ctx.strokeStyle = '#b9cad3'; ctx.lineWidth = .2; ctx.strokeRect(x, command.y, width, command.height);
                (command.cells[column] || []).forEach((value, line) => text(value, x + command.padding, command.y + command.padding + line * command.lineHeight, command.font, command.header)); x += width;
            });
        });
        ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(14, 282); ctx.lineTo(196, 282); ctx.stroke();
        text(`Kayıt: ${safe(layout.sourceId).slice(0, 28) || '-'} / rev. ${layout.sourceRevision} - Şablon v${safe(layout.templateVersion)}`, 14, 284, 7, false, '#64748b');
        text(`${page.number} / ${page.total}`, 183, 284, 8, true, '#64748b');
        text(`Oluşturma: ${layout.generatedAt} - Belge izi: ${safe(layout.digest).slice(0, 16) || '-'}`, 14, 289, 7, false, '#64748b');
        return canvas;
    }
    function canonical(value) { if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'; return JSON.stringify(value); }
    async function digest(snapshot) {
        if (!root.crypto?.subtle || typeof TextEncoder === 'undefined') throw new Error('Belge doğrulama bileşeni kullanılamıyor. Güvenli bağlantıdan tekrar deneyin.');
        const bytes = await root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(snapshot))); return Array.from(new Uint8Array(bytes)).map(value => value.toString(16).padStart(2, '0')).join('');
    }
    async function buildPdf(templateId, context = {}, options = {}) {
        const epoch = generationEpoch; const assertSession = () => { if (epoch !== generationEpoch) throw new Error('Oturum değiştiği için belge hazırlama iptal edildi.'); };
        const model = buildModel(templateId, context); model.digest = await digest(model.snapshot); assertSession();
        const JsPDF = root.jspdf?.jsPDF || root.jsPDF; if (!JsPDF) throw new Error('PDF bileşeni yüklenemedi. Sayfayı yenileyin.');
        await root.document?.fonts?.ready; assertSession();
        const layout = plan(model, browserMeasure()), pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        for (let index = 0; index < layout.pages.length; index++) { assertSession(); if (index) pdf.addPage('a4', 'portrait'); const canvas = drawPage(layout, index); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST'); canvas.width = canvas.height = 1; options.onProgress?.({ completed: index + 1, total: layout.pages.length }); await new Promise(resolve => setTimeout(resolve, 0)); }
        pdf.setProperties({ title: model.title, subject: `ISG source ${model.sourceId} rev ${model.sourceRevision}; SHA-256 ${model.digest}`, creator: 'FD Yazılım - ISG', author: contextValues(context).firma });
        const blob = pdf.output('blob'), filename = `${model.title}_${safe(context.record?.recordDate || '').replace(/[^0-9-]/g, '') || 'Taslak'}.pdf`.replace(/[\\/:*?"<>|]/g, '_');
        assertSession();
        if (options.preview !== false) { if (typeof root.fdCiktiPdfOnizle !== 'function') throw new Error('PDF önizleme penceresi bulunamadı.'); root.fdCiktiPdfOnizle(blob, filename); }
        const result = { blob, filename, model, layout, snapshot: { ...model.snapshot, digest: model.digest } };
        if (typeof options.onGenerated === 'function') await options.onGenerated(result.snapshot);
        assertSession();
        return result;
    }
    function open(context = {}) {
        if (!root.document) throw new Error('Belge penceresi kullanılamıyor.');
        if (context.permissions?.read === false) throw new Error('İSG belgelerini görüntüleme yetkiniz yok.');
        const available = list(context).filter(t => { try { return configured(t, context.settings).enabled !== false; } catch (_) { return false; } });
        if (!available.length) throw new Error('Kullanılabilir belge şablonu yok.');
        const existing = root.document.querySelector('[data-isg-document-dialog]'); if (existing?._fdIsgBusy) return existing; existing?._fdIsgCleanup?.(); existing?.remove();
        const epoch = generationEpoch;
        const doc = root.document, backdrop = doc.createElement('div'); backdrop.dataset.isgDocumentDialog = ''; backdrop.dataset.casePreserve = 'true'; backdrop.style.cssText = 'position:fixed;inset:0;z-index:210520;background:#0f172a66;display:flex;align-items:center;justify-content:center;padding:12px';
        const panel = doc.createElement('section'); panel.role = 'dialog'; panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'İSG belgesi hazırla'); panel.style.cssText = 'width:min(760px,100%);max-height:92dvh;display:flex;flex-direction:column;background:white;border-radius:15px;box-shadow:0 18px 70px #0f172a40;overflow:hidden;font:14px Arial,sans-serif;color:#203447';
        const header = doc.createElement('div'); header.style.cssText = 'padding:17px 20px;border-bottom:1px solid #dce7ef;display:flex;align-items:center;justify-content:space-between;flex-shrink:0';
        const title = doc.createElement('strong'); title.textContent = 'İSG Belgesi Hazırla'; title.style.fontSize = '18px';
        const close = doc.createElement('button'); close.type = 'button'; close.textContent = 'Kapat'; close.style.cssText = 'padding:7px 10px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:7px;cursor:pointer'; header.append(title, close);
        const content = doc.createElement('div'); content.style.cssText = 'min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px 20px;display:grid;gap:14px';
        const selectLabel = doc.createElement('label'); selectLabel.textContent = 'Belge türü'; selectLabel.style.cssText = 'display:grid;gap:6px;font-weight:600';
        const select = doc.createElement('select'); select.style.cssText = 'width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:8px;background:white;font:14px Arial'; available.forEach(t => { const option = doc.createElement('option'); option.value = t.id; option.textContent = t.name; select.append(option); }); selectLabel.append(select);
        const personArea = doc.createElement('fieldset'); personArea.style.cssText = 'margin:0;border:1px solid #dce7ef;border-radius:9px;padding:12px;display:grid;gap:7px'; const legend = doc.createElement('legend'); legend.textContent = 'Belgeye dahil edilecek personeller'; personArea.append(legend);
        const allowedIds = new Set((context.personIds || context.record?.personIds || []).map(safe)), selectedBranch = branchOf(context.branch || context.record?.branch); const people = (context.people || []).filter(person => allowedIds.size ? allowedIds.has(idOf(person)) : !selectedBranch || branchOf(person.branch || person.sube || person.subeAdi) === selectedBranch); const checks = [];
        const selectionTools = doc.createElement('div'); selectionTools.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap'; const all = doc.createElement('button'), clear = doc.createElement('button'); all.type = clear.type = 'button'; all.textContent = 'Tümünü seç'; clear.textContent = 'Seçimi temizle'; [all, clear].forEach(item => item.style.cssText = 'padding:6px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#f8fafc;cursor:pointer'); all.onclick = () => checks.forEach(check => check.checked = true); clear.onclick = () => checks.forEach(check => check.checked = false); selectionTools.append(all, clear); personArea.append(selectionTools);
        people.forEach(person => { const label = doc.createElement('label'); label.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:31px'; const checkbox = doc.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = idOf(person); checkbox.checked = allowedIds.has(idOf(person)); const text = doc.createElement('span'); text.textContent = nameOf(person) + (jobOf(person) ? ' - ' + jobOf(person) : ''); checks.push(checkbox); label.append(checkbox, text); personArea.append(label); });
        const editLabel = doc.createElement('label'); editLabel.textContent = 'Belge metni'; editLabel.style.cssText = 'display:grid;gap:7px;font-weight:600'; const textarea = doc.createElement('textarea'); textarea.rows = 7; textarea.maxLength = 20000; textarea.style.cssText = 'padding:11px;border:1px solid #cbd5e1;border-radius:8px;font:14px/1.5 Arial;resize:vertical'; editLabel.append(textarea);
        const help = doc.createElement('p'); help.style.cssText = 'margin:0;color:#64748b;font:12px/1.5 Arial'; help.textContent = 'İmzalar boş bırakılır. İmzalı belgeyi daha sonra ilgili kayda yükleyebilirsiniz.';
        const error = doc.createElement('p'); error.role = 'alert'; error.style.cssText = 'display:none;margin:0;padding:9px;border:1px solid #fecaca;background:#fff1f2;border-radius:7px;color:#b91c1c';
        content.append(selectLabel, personArea, editLabel, help, error);
        const footer = doc.createElement('div'); footer.style.cssText = 'padding:14px 20px;border-top:1px solid #dce7ef;display:flex;justify-content:flex-end;gap:9px;background:#f8fafc;flex-shrink:0';
        const button = doc.createElement('button'); button.type = 'button'; button.dataset.fdOutputOwn = '1'; button.textContent = 'PDF Hazırla / Yazdır'; button.style.cssText = 'border:0;border-radius:8px;background:#087b80;color:white;padding:11px 18px;font:bold 14px Arial;cursor:pointer'; footer.append(button); panel.append(header, content, footer); backdrop.append(panel); doc.body.append(backdrop);
        const focused = doc.activeElement; let busy = false;
        function remove(force = false) { if (busy && force !== true) return; backdrop.remove(); doc.removeEventListener('keydown', onKey, true); focused?.focus?.(); }
        backdrop._fdIsgCleanup = remove;
        function onKey(event) { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); remove(); } if (event.key === 'Tab') { event.stopPropagation(); const elements = Array.from(panel.querySelectorAll('button,input,select,textarea')).filter(element => !element.disabled && element.offsetParent !== null), first = elements[0], last = elements[elements.length - 1]; if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first?.focus(); } } }
        function update() { const template = configured(available.find(t => t.id === select.value), context.settings); textarea.value = template.body || ''; editLabel.hidden = !template.body; personArea.hidden = !template.roster && !template.individual; error.style.display = 'none'; }
        button.addEventListener('click', async () => {
            if (busy) return; busy = true; backdrop._fdIsgBusy = true; const controls = Array.from(panel.querySelectorAll('button,input,select,textarea')).map(control => [control, control.disabled]); controls.forEach(([control]) => control.disabled = true); error.style.display = 'none'; button.textContent = 'PDF hazırlanıyor...';
            try { const template = available.find(t => t.id === select.value), ids = template.roster || template.individual ? checks.filter(check => check.checked).map(check => check.value) : []; const result = await buildPdf(select.value, { ...context, personIds: ids, bodyOverride: textarea.value }, { onGenerated: context.onGenerated, onProgress: status => button.textContent = `PDF hazırlanıyor ${status.completed}/${status.total}` }); if (epoch !== generationEpoch || !backdrop.isConnected) return; await context.onComplete?.(result); if (epoch !== generationEpoch || !backdrop.isConnected) return; busy = false; remove(); }
            catch (e) { if (epoch === generationEpoch && backdrop.isConnected) { error.textContent = e.message || 'Belge hazırlanamadı.'; error.style.display = 'block'; } }
            finally { busy = false; backdrop._fdIsgBusy = false; controls.forEach(([control, disabled]) => control.disabled = disabled); button.textContent = 'PDF Hazırla / Yazdır'; }
        });
        close.addEventListener('click', remove); backdrop.addEventListener('click', event => { if (event.target === backdrop) remove(); }); select.addEventListener('change', update); doc.addEventListener('keydown', onKey, true); update(); select.focus(); return backdrop;
    }
    function clear() { generationEpoch++; root.document?.querySelector('[data-isg-document-dialog]')?._fdIsgCleanup?.(true); }
    root.fdIsgDocuments = { version: VERSION, catalog, list, buildModel, buildPdf, open, clear, plan, wrap, browserMeasure, drawPage, canonical, digest, canCertificate };
})(typeof window !== 'undefined' ? window : globalThis);


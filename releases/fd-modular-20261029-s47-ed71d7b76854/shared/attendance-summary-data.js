// Read-only monthly presentation. This does not save or change payroll calculations.
function fdAttendanceMonthlySummary(personel, liste, ay, { now } = {}) {
    const month = String(ay || ''), empty = warning => ({ rows: [], month, dailyMinutes: 0, notes: [], warnings: [warning] });
    const user = typeof activeUser === 'undefined' ? null : activeUser;
    const ownRole = typeof isPersonelUser === 'function' ? isPersonelUser() : user?.rol === 'Personel';
    const allowedCompany = !!user?.sirketId && !!personel && (typeof aktifSirketeAit === 'function'
        ? aktifSirketeAit(personel)
        : !!user.sirketId && String(personel.sirketId || '') === String(user.sirketId));
    if (!allowedCompany || !personel?.id || (ownRole && String(personel.id) !== String(user.tcNo || '')) ||
        (typeof anaMenuModulYetkisi === 'function' && anaMenuModulYetkisi('personel') === 'yok')) {
        return empty('Bu personelin çalışma özetini görüntüleme yetkiniz yok.');
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return empty('Çalışma özeti için geçerli bir ay seçin.');
    const givenNow = now instanceof Date ? new Date(now.getTime()) : now ? new Date(now) : new Date();
    const clock = Number.isFinite(givenNow.getTime()) ? givenNow : new Date();
    const calculate = () => {
        const settings = typeof uygulamaAyarlari === 'undefined' ? {} : uygulamaAyarlari;
        const num = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
        const configuredHours = typeof ayarSayisi === 'function' ? ayarSayisi('gunlukCalismaSaati', 7.5) : settings.gunlukCalismaSaati;
        const dailyMinutes = (num(configuredHours) || 7.5) * 60;
        const dateKey = value => {
            const text = String(value || '').slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
            const d = new Date(text + 'T12:00:00');
            return Number.isFinite(d.getTime()) && keyOf(d) === text ? text : '';
        };
        const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(clock);
        const toDate = value => {
            if (value === undefined || value === null || value === '') return null;
            const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
            return Number.isFinite(d.getTime()) ? d : null;
        };
        const overlap = (a, b, c, d) => a && b && c && d ? Math.max(0, Math.round((Math.min(b, d) - Math.max(a, c)) / 60000)) : 0;
        const scoped = record => typeof aktifSirketeAit === 'function' ? aktifSirketeAit(record) :
            (!record?.sirketId || String(record.sirketId) === String(user.sirketId));
        const warnings = [], notes = [
            'Gün: ilgili tarihlerdeki gün sayısıdır. Eşdeğer gün: saat toplamının bu dönemin günlük çalışma süresine (' + (dailyMinutes / 60).toLocaleString('tr-TR') + ' saat) bölünmesidir; ücret veya SGK günü hesabı değildir.',
            'Plan ve tatil süreleri, seçilen ayın işe giriş–çıkış tarihleri içindeki vardiya planını gösterir; çalışma gereği geçerli izinlerden arındırılmıştır. Gerçekleşen toplamlar yalnız bugüne kadar tamamlanmış kayıtlardan hesaplanır.',
            'İzin ve tam gün devamsızlık saatleri, kayıttaki gün payının günlük çalışma süresiyle çarpımıdır; yarım tatilde tanımlı net sabah süresi varsa sabah devamsızlığında o süre kullanılır. Fazla mesai saatleri yuvarlanmamış brüt süredir; puantajın mevcut mahsup ve aylık kategori bazlı yuvarlaması değiştirilmez.'
        ];
        const definitions = [
            ['plannedRequired', 'Çalışılması Gereken Süre (izinler hariç)'],
            ['weekHoliday', 'Hafta Tatili Süresi (plan)'], ['officialHoliday', 'Resmî Tatil Süresi (plan)'],
            ['actualWorked', 'Aylık Çalışılan Süre (toplam)'], ['actualWeekHoliday', 'Aylık Çalışılan Süre (hafta tatili)'],
            ['actualOfficial', 'Aylık Çalışılan Süre (resmî tatil)'],
            ['overtimeWeekday', 'Fazla Mesai (hafta içi)'], ['overtimeWeekHoliday', 'Fazla Mesai (hafta tatili)'],
            ['overtimeOfficial', 'Fazla Mesai (resmî tatil)'], ['halfHolidayDeficit', 'Yarım Tatil Devamsızlığı'], ['deductedDeficit', 'Mesai Mahsubu (Geç + Erken)'], ['netOvertime', 'Net Kalan Mesai (yuvarlanmamış)'],
            ['paidLeave', 'Ücretli İzin'], ['unpaidLeave', 'Ücretsiz İzin'], ['annualLeave', 'Yıllık İzin'],
            ['late', 'Geç Kalma'], ['early', 'Erken Çıkma'], ['absence', 'Devamsızlık']
        ];
        const sums = new Map(definitions.map(([key]) => [key, { minutes: 0, dates: new Map() }]));
        const add = (key, minutes, date, days = 1) => {
            if (num(minutes) <= 0 || num(days) <= 0) return;
            const sum = sums.get(key); sum.minutes += num(minutes);
            sum.dates.set(date, Math.max(sum.dates.get(date) || 0, num(days)));
        };
        const rawDefs = Array.isArray(settings.vardiyaTanimlari) && settings.vardiyaTanimlari.length ? settings.vardiyaTanimlari : [
            { id: 'gunduz', ad: settings.vardiyaGunduzBaslik || 'GÜNDÜZ', baslangic: settings.magicpassGunduzBaslangic || '08:00', bitis: settings.magicpassGunduzBitis || '17:00', yemekBaslangic: '12:30', yemekBitis: '13:00' },
            { id: 'gece', ad: settings.vardiyaGeceBaslik || 'GECE', baslangic: settings.magicpassGeceBaslangic || '23:00', bitis: settings.magicpassGeceBitis || '08:00' }
        ];
        // Do not call the legacy definition/weekly normalizers: they write defaults back into source records.
        const defs = rawDefs.map((d, index) => ({ ...d, id: String(d.id || ('vardiya_' + (index + 1))).trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
            ad: String(d.ad || d.baslik || ('VARDİYA ' + (index + 1))).trim(), baslangic: String(d.baslangic || '08:00'), bitis: String(d.bitis || '17:00') }));
        const defaultShift = defs.find(d => d.id === 'gunduz')?.id || defs.find(d => !d.tatil && !d.resmiTatil && d.bitis > d.baslangic)?.id || defs[0].id;
        const roster = (typeof vardiyaKayitlari === 'undefined' ? [] : vardiyaKayitlari).filter(scoped);
        const fallbackShift = date => {
            const assignment = roster.filter(r => r.kayitTipi === 'vardiyaAtama' && String(r.pId) === String(personel.id) && String(r.tarih) === date)
                .sort((a, b) => num(b.zaman) - num(a.zaman))[0];
            const monday = new Date(date + 'T12:00:00'); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
            const weekly = roster.find(r => !r.kayitTipi && String(r.haftaBaslangic) === keyOf(monday) &&
                String(r.sube || '').trim().toLocaleLowerCase('tr-TR') === String(personel.sube || '').trim().toLocaleLowerCase('tr-TR'));
            const slot = weekly?.satirlar?.find(r => String(r.personelId || '') === String(personel.id));
            let weeklyShift = '';
            if (slot) {
                const mapped = weekly.vardiyaTanimlari?.[slot.vardiya];
                if (defs.some(d => d.id === mapped)) weeklyShift = mapped;
                else {
                    const sections = Array.isArray(weekly.bolumler) && weekly.bolumler.length ? weekly.bolumler :
                        ['gunduz', 'gece', 'ana', 'ek'].map((id, index) => ({ id, baslik: weekly.basliklar?.[id] || ['GÜNDÜZ', 'GECE', 'ANA BİNA', 'EK BİNA'][index] }));
                    const index = sections.findIndex(s => String(s.id) === String(slot.vardiya));
                    const title = String(sections[index]?.baslik || weekly.basliklar?.[slot.vardiya] || slot.vardiya).toLocaleLowerCase('tr-TR');
                    weeklyShift = defs.find(d => title.includes(d.ad.toLocaleLowerCase('tr-TR')))?.id ||
                        (index === 1 && defs.some(d => d.id === 'gece') ? 'gece' : defaultShift);
                }
            }
            return weeklyShift && num(weekly.guncellemeZamani || weekly.zaman) >= num(assignment?.zaman) ? weeklyShift : assignment?.vardiya || weeklyShift || defaultShift;
        };
        const timeAt = (date, time, next = false) => {
            if (!/^\d{2}:\d{2}$/.test(String(time || ''))) return null;
            const d = new Date(date + 'T' + time + ':00'); if (next) d.setDate(d.getDate() + 1);
            return Number.isFinite(d.getTime()) ? d : null;
        };
        const schedule = (date, shift) => {
            const def = defs.find(d => d.id === String(shift)) || defs[0], night = def.bitis <= def.baslangic;
            const start = timeAt(date, def.baslangic), end = timeAt(date, def.bitis, night);
            const mealStart = timeAt(date, def.yemekBaslangic, String(def.yemekBaslangic) <= def.baslangic);
            const mealEnd = timeAt(date, def.yemekBitis, String(def.yemekBitis) <= def.baslangic);
            if (mealStart && mealEnd && mealEnd <= mealStart) mealEnd.setDate(mealEnd.getDate() + 1);
            return { def, start, end, mealStart, mealEnd, noWork: shift === 'izin' || !!def.tatil || !!def.resmiTatil || !!def.girisCikisYasak };
        };
        const netOverlap = (a, b, plan, rangeEnd = plan.end) => {
            if (!plan.start || !rangeEnd) return 0;
            const start = new Date(Math.max(a, plan.start)), end = new Date(Math.min(b, rangeEnd));
            return Math.max(0, overlap(start, end, plan.start, rangeEnd) - overlap(start, end, plan.mealStart, plan.mealEnd));
        };
        const byDate = new Map(); let rejected = 0, duplicates = 0;
        for (const record of Array.isArray(liste) ? liste : []) {
            const date = dateKey(record?.tarih), owner = record?.pId ?? record?.personelId ?? record?.employee_legacy_id;
            if (!date || date.slice(0, 7) !== month || !scoped(record) || (owner !== undefined && String(owner) !== String(personel.id))) { rejected++; continue; }
            if (byDate.has(date)) { duplicates++; continue; }
            byDate.set(date, record);
        }
        const leaveRecords = (typeof izinler === 'undefined' ? [] : izinler).filter(r => scoped(r) && String(r.pId) === String(personel.id));
        const leaveType = leave => {
            const type = String(leave?.tur || '').toLocaleLowerCase('tr-TR');
            if (/yıllık|yillik/.test(type)) return 'annualLeave';
            if (/sağlık|saglik|rapor/.test(type)) return 'report';
            if (/ücretsiz|ucretsiz/.test(type)) return 'unpaidLeave';
            if (/mazeretsiz|gelmedi/.test(type)) return 'absence';
            if (/ücretli|ucretli|düğün|dugun|evlenme|doğum|dogum|ölüm|olum|babalık|babalik|süt izni|sut izni/.test(type)) return 'paidLeave';
            return leave ? 'otherLeave' : '';
        };
        let ambiguousLeave = false;
        const leaveAt = (record, date) => {
            const leave = record?.izin || leaveRecords.find(r => date >= dateKey(r.baslangic) && date <= dateKey(r.bitis));
            if (leave && (!scoped(leave) || (leave.pId !== undefined && String(leave.pId) !== String(personel.id)))) return null;
            const type = leaveType(leave); if (!type) return null;
            const excludesHolidays = type === 'annualLeave' || type === 'paidLeave';
            if (excludesHolidays && leave.kaynak !== 'puantaj' && typeof isTatil === 'function' && isTatil(new Date(date + 'T12:00:00'))) return null;
            const count = num(leave.gun), first = dateKey(leave.baslangic), last = dateKey(leave.bitis);
            let fraction = 1;
            if (count > 0 && count < 1 && (!first || first === last)) fraction = count;
            else if (count > 0 && !Number.isInteger(count) && first && last && first !== last) ambiguousLeave = true;
            return { type, fraction };
        };
        const kindAt = (record, date) => {
            if (record && Object.prototype.hasOwnProperty.call(record, 'gunTuru')) return record.gunTuru || '';
            if (typeof magicpassGunTuruBul === 'function') return magicpassGunTuruBul(personel, date) || '';
            return new Date(date + 'T12:00:00').getDay() === 0 ? 'pazar' : '';
        };
        const hire = dateKey(personel.girisTarihi), exit = dateKey(personel.cikisTarihi);
        const [year, monthNumber] = month.split('-').map(Number), count = new Date(year, monthNumber, 0).getDate();
        let missingDates = 0, missingPunches = 0, unknownDevice = 0, pending = 0;
        const deficitDates = new Set();
        for (let day = 1; day <= count; day++) {
            const date = month + '-' + String(day).padStart(2, '0');
            if ((hire && date < hire) || (exit && date > exit)) continue;
            const record = byDate.get(date); if (record?.istihdamDisi) continue;
            const shift = record?.vardiya || fallbackShift(date), plan = schedule(date, shift), kind = kindAt(record, date), leave = leaveAt(record, date);
            const half = kind === 'yarimResmiTatil', holiday = kind === 'pazar' || kind === 'resmiTatil', night = record?.fdHolidayNight;
            const planMinutes = plan.start && plan.end ? netOverlap(plan.start, plan.end, plan) : 0;
            const morning = night ? num(night.plannedNormalMinutes) : half && plan.start && plan.end ? netOverlap(plan.start, plan.end, plan, new Date(Math.min(plan.end, timeAt(date, '13:00')))) : planMinutes;
            if (kind === 'pazar') add('weekHoliday', planMinutes, date);
            if (night) add('officialHoliday', num(night.plannedHolidayMinutes), date);
            else if (kind === 'resmiTatil') add('officialHoliday', planMinutes, date);
            if (half && !night) add('officialHoliday', Math.max(0, planMinutes - morning), date, 0.5);
            if ((!holiday || night) && !plan.noWork) {
                const leaveFraction = leave && leave.type !== 'absence' ? leave.fraction : 0;
                add('plannedRequired', (night ? morning : half ? morning : planMinutes) * (1 - leaveFraction), date, (night ? (morning > 0 ? 1 : 0) : half ? 0.5 : 1) * (1 - leaveFraction));
            }
            if (date > today) continue;
            const completed = !!plan.end && clock >= plan.end;
            if (!record) { missingDates++; continue; }
            if (!completed && !holiday && !plan.noWork) pending++;
            if (leave) {
                if (['paidLeave', 'unpaidLeave', 'annualLeave'].includes(leave.type)) add(leave.type, dailyMinutes * leave.fraction, date, leave.fraction);
                if (leave.type === 'absence' && completed && !holiday && !plan.noWork) add('absence', dailyMinutes * leave.fraction, date, leave.fraction);
                // The daily engine suppresses all punches on leave dates; keep that established choice.
                continue;
            }
            const rawIntervals = Array.isArray(record.calismaAraliklari) && record.calismaAraliklari.length ? record.calismaAraliklari :
                (record.giris || record.cikis ? [record] : []);
            const intervals = rawIntervals.map(r => ({ source: r, start: toDate(r.giris), end: toDate(r.cikis) }));
            if (intervals.some(r => !r.start || !r.end || r.end <= r.start)) missingPunches++;
            const closed = intervals.filter(r => r.start && r.end && r.end > r.start && r.end <= clock);
            let normal = 0, overtime = 0, nightOfficial = 0, nightOrdinary = 0;
            for (const interval of closed) {
                if (night) {normal += num(interval.source.normal); overtime += num(interval.source.brutMesai); nightOfficial += num(interval.source.resmiTatilMesaiDakika); nightOrdinary += num(interval.source.fdNormalOvertimeMinutes);}
                else if (half) {
                    normal += netOverlap(interval.start, interval.end, plan, new Date(Math.min(plan.end, timeAt(date, '13:00'))));
                    overtime += overlap(interval.start, interval.end, timeAt(date, '13:00'), timeAt(date, '00:00', true));
                } else {
                    normal += num(interval.source.normal);
                    overtime += Math.max(num(interval.source.brutMesai), num(interval.source.mesai));
                }
            }
            const worked = normal + overtime;
            add('actualWorked', worked, date);
            if (kind === 'pazar') add('actualWeekHoliday', worked, date);
            if (night) {add('actualOfficial', nightOfficial, date);add('overtimeOfficial', nightOfficial, date);add(kind==='pazar'?'overtimeWeekHoliday':'overtimeWeekday',nightOrdinary,date);}
            else {if (kind === 'resmiTatil') add('actualOfficial', worked, date);
            if (half) add('actualOfficial', overtime, date);
            add(kind === 'pazar' ? 'overtimeWeekHoliday' : kind === 'resmiTatil' || half ? 'overtimeOfficial' : 'overtimeWeekday', overtime, date);}
            // An open/future endpoint must not create an early-departure deduction.
            const late = intervals.some(r => r.start && r.start <= clock) ? num(record.gec) : 0;
            const early = closed.length && !intervals.some(r => !r.start || !r.end || r.end > clock) ? num(record.erken) : 0;
            const halfFinished = half && !night && plan.end && clock >= new Date(Math.min(plan.end, timeAt(date, '13:00')));
            const halfDeficit = halfFinished ? num(record?.yarimTatilEksikDakika) : 0;
            add('late', late, date); add('early', early, date); add('halfHolidayDeficit', halfDeficit, date);
            if (late + early > 0) deficitDates.add(date);
            const hasDevice = !!String(personel.cihazPersonelNo || '').trim();
            const unknown = !hasDevice && !record.duzeltme && !record.puantajManuel;
            if (unknown && !holiday && !plan.noWork) unknownDevice++;
            if ((half && !night ? halfFinished : completed) && !holiday && !plan.noWork && !unknown && !intervals.length && !record.hareketler?.length && record.durum === 'Gelmedi') add('absence', half && !night && Number.isFinite(Number(record.yarimTatilPlanliSabahDakika)) ? num(record.yarimTatilPlanliSabahDakika) : dailyMinutes * (half ? 0.5 : 1), date, half ? 0.5 : 1);
        }
        const gross = { normal: sums.get('overtimeWeekday').minutes, pazar: sums.get('overtimeWeekHoliday').minutes, resmi: sums.get('overtimeOfficial').minutes };
        const deficit = sums.get('late').minutes + sums.get('early').minutes;
        if (typeof fdMesaiDakikaMahsupDagilimi === 'function') {
            const method = typeof fdMesaiMahsupYontemi === 'function' ? fdMesaiMahsupYontemi(month) : 'hafta-ici-once';
            sums.get('deductedDeficit').minutes = num(fdMesaiDakikaMahsupDagilimi(gross, deficit, method).mahsup);
        } else warnings.push('Mesai mahsup yöntemi yüklenemedi; düşülen süre hesaplanamadı.');
        sums.get('netOvertime').minutes = Math.max(0, gross.normal + gross.pazar + gross.resmi - sums.get('deductedDeficit').minutes);
        if (sums.get('deductedDeficit').minutes > 0) {
            for (const date of deficitDates) sums.get('deductedDeficit').dates.set(date, 1);
            notes.push('Mesaiden düşülen sürenin gün sayısı, geç/erken kaydı bulunan tarih sayısıdır; mahsup ay toplamında yapılır.');
        }
        notes.push('Yarım tatil devamsızlığı ayrı gösterilir; fazla mesaiden otomatik düşülmez.');
        if (missingDates) warnings.push(missingDates + ' tarihin giriş–çıkış sonucu yüklenmedi; bu tarihler devamsız sayılmadı.');
        if (missingPunches) warnings.push(missingPunches + ' tarihte eksik veya geçersiz giriş/çıkış var. Yalnız tamamlanan aralıklar toplandı; eksik kayıtlar devamsız sayılmadı.');
        if (unknownDevice) warnings.push(unknownDevice + ' tarihte cihaz/kayıt doğrulaması yok; otomatik devamsızlık hesaplanmadı.');
        if (pending) warnings.push(pending + ' tarihte vardiya henüz tamamlanmadı; devamsızlık kesinleştirilmedi.');
        if (ambiguousLeave) warnings.push('Birden çok güne yayılan kesirli iznin yarım gün tarihi belirtilmediği için günlük payı ayrılamadı; izin kaydını kontrol edin.');
        if (rejected) warnings.push('Ay/personel/şirket kapsamı dışındaki ' + rejected + ' kayıt özete alınmadı.');
        if (duplicates) warnings.push('Aynı tarihe ait ' + duplicates + ' yinelenen sonuç iki kez toplanmadı.');
        return {
            rows: definitions.map(([key, label]) => {
                const sum = sums.get(key), minutes = Math.round(sum.minutes * 1e8) / 1e8;
                return { key, label, minutes, days: [...sum.dates.values()].reduce((total, value) => total + value, 0), equivalentDays: minutes / dailyMinutes };
            }), month, dailyMinutes, notes, warnings
        };
    };
    return typeof fdHesapDonemindeCalistir === 'function' ? fdHesapDonemindeCalistir(month, calculate) : calculate();
}

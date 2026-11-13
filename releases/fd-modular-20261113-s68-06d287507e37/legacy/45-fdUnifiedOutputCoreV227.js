
(function (global) {
    'use strict';

    const clean = value => String(value == null ? '' : value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const norm = value => clean(value).toLocaleLowerCase('tr-TR');
    const numericHeader = /(?:tutar|bakiye|bedel|fiyat|ücret|maaş|prim tutar|miktar|adet|litre|\blitre\b|\bl\/|\bkm\b|kilometre|metrekare|\bm²\b|\bm2\b|alan|payı|kesinti|borç|alacak|toplam|mesai|saat|gün say|ay say|yüzde|oran|net|brüt|brut|hakediş)/i;
    const textualHeader = /(?:t\.c\.?|\btc\b|kimlik|telefon|\btel\b|\bno\b|numara|plaka|ada|parsel|abone|kod|bölüm|bolum|tarih|dönem|donem|yıl|yil|vkn|vergi|posta)/i;
    const headerWord = /^(?:#|sıra|sira|no|ad(?:ı)?(?: soyad(?:ı)?)?|soyad(?:ı)?|personel(?: adı)?|çalışan|ürün(?:ler)?|açıklama|tarih|firma|dönem|daire|kiracı|tür|tutar|fiyat|birim(?: fiyat)?|miktar|adet|sahibi|adres|telefon|plaka|araç|vardiya|görev(?: yeri)?|durum|not(?:lar)?|bakiye|hak(?: ediş|ediş|ediş tutarı)?|borç|alacak|sıra no|t\.c\.?|tc(?: no)?|kimlik(?: no)?|depo|litre|km|alan|veren|siparişler?|teslimatlar?|kalan|toplam|başlangıç|bitiş|prim|ücret|maaş|kesinti|ay|yıl|net|brüt|brut|elektrik abone no|su abone no|doğalgaz abone no|abone no|fatura(?: no| tarihi)?|irsaliye(?: no)?|alış tarihi|vergi no|ödenen|ödenecek|alım sayısı|hesaplanan km|ortalama l\/100 km|önceki tarih|son tarih|önceki km|son km|yapılan km|alınan litre|100 km tüketim|kısa ad|abonelik türü|pol[iı]çe no|hisse durumu|taşınmaz no|nitelik|il|ilçe|mahalle|ada|parsel|bağımsız bölüm|sahip olunan alan|toplam alan)(?:\s*\([^)]*\)|\s*\/.*)?$/i;
    const actionHeader = /^(?:işlem(?:ler)?|aksiyon(?:lar)?|seç(?:im)?|select|actions?)$/i;

    function numberValue(value, locale) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        let text = clean(value);
        if (!text) return null;
        let negative = false;
        if (/^\([\s\S]*\)$/.test(text)) { negative = true; text = text.slice(1, -1); }
        text = text.replace(/(?:\b(?:TL|TRY|USD|EUR|GBP|KG|KM|ADET)\b|₺|\$|€|£|%|m²|m2|\bL\b)/gi, '').replace(/\s/g, '');
        if (!/^[+-]?[\d.,]+$/.test(text)) return null;
        if (text.includes(',') && text.includes('.')) {
            text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
        } else if (text.includes(',')) {
            if (/^[+-]?\d{1,3}(?:,\d{3}){2,}$/.test(text) || (locale === 'en' && /^[+-]?\d{1,3}(?:,\d{3})+$/.test(text))) text = text.replace(/,/g, '');
            else if ((text.match(/,/g) || []).length === 1) text = text.replace(',', '.');
            else return null;
        } else if (text.includes('.')) {
            if (locale !== 'en' && /^[+-]?\d{1,3}(?:\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
            else if ((text.match(/\./g) || []).length > 1) return null;
        }
        const result = Number(text);
        return Number.isFinite(result) ? (negative ? -result : result) : null;
    }

    function display(value) {
        if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toLocaleDateString('tr-TR');
        if (value && typeof value === 'object') return clean(value.text ?? value.result ?? value.richText?.map(part => part.text).join('') ?? value.hyperlink ?? '');
        return clean(value);
    }

    function canConvertNumber(value, label) {
        if (typeof value !== 'string') return true;
        const heading=norm(label), withoutMoney=norm(value).replace(/\b(?:tl|try|usd|eur|gbp)\b|[₺$€£]/g,'');
        if(withoutMoney.includes('%')&&!heading.includes('%')&&!heading.includes('yüzde'))return false;
        const units=withoutMoney.match(/[a-zçğöşüı]+[²³]?\d*/g) || [];
        const aliases={m2:['m2','m²','metrekare'],'m²':['m2','m²','metrekare'],m3:['m3','m³','metreküp'],'m³':['m3','m³','metreküp'],km:['km','kilometre'],kg:['kg','kilogram'],l:['l','lt','litre'],lt:['l','lt','litre'],litre:['l','lt','litre']};
        return units.every(unit=>(aliases[unit] || [unit]).some(alias=>new RegExp('(?:^|[^a-zçğöşüı])'+alias+'(?:$|[^a-zçğöşüı])','i').test(heading)));
    }

    function cellValue(cell, column) {
        if (!cell) return '';
        const explicit = ['data-output-value', 'data-export-value', 'data-value'].find(attribute => cell.hasAttribute(attribute));
        if (explicit) {
            const value = cell.getAttribute(explicit), type = cell.dataset.outputType || cell.dataset.exportType || column?.type;
            const parsed = type === 'number' ? numberValue(value, cell.dataset.locale) : null;
            return parsed == null ? value : parsed;
        }
        const input = cell.querySelector('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="file"]):not([type="hidden"]),textarea,select');
        if (input) {
            if (input.tagName === 'SELECT') return clean(input.selectedOptions?.[0]?.textContent || input.value);
            if (input.type === 'number' && String(input.value).trim()) { const parsed = Number(input.value); if (Number.isFinite(parsed)) return parsed; }
            return input.value || '';
        }
        const copy = cell.cloneNode(true);
        copy.querySelectorAll('script,style,input,[data-output-ignore],.fd-mini-actions,.action-btns,.fd-icon-btn').forEach(element => element.remove());
        copy.querySelectorAll('button').forEach(button => {
            const label=clean(button.textContent);
            if (/^(?:[✎✏🗑×✕＋+−-]+|düzenle|sil|detay|görüntüle|kaydet|iptal|onayla|öde|ödeme ekle)$/i.test(norm(label))) button.remove();
            else button.replaceWith(document.createTextNode(label));
        });
        copy.querySelectorAll('br').forEach(element => element.replaceWith(document.createTextNode(' ')));
        copy.querySelectorAll('div,p,li').forEach(element => element.appendChild(document.createTextNode(' ')));
        const text = clean(copy.textContent);
        if (column?.type === 'number' && !textualHeader.test(norm(column.label)) && canConvertNumber(text,column.label)) { const parsed = numberValue(text); if (parsed != null) return parsed; }
        return text;
    }

    // Expand spans into a logical grid while keeping source cells intact.
    function tableGrid(rows) {
        const grid = [];
        rows.forEach((row, rowIndex) => {
            grid[rowIndex] ||= [];
            let columnIndex = 0;
            [...row.cells].forEach(cell => {
                while (grid[rowIndex][columnIndex]) columnIndex++;
                const remaining = rows.length - rowIndex;
                const rowSpan = cell.getAttribute('rowspan') === '0' ? remaining : Math.max(1, Math.min(Number(cell.rowSpan) || 1, remaining));
                const columnSpan = Math.max(1, Number(cell.colSpan) || 1);
                const entry = {cell, originRow:rowIndex, originColumn:columnIndex, rowSpan, columnSpan};
                for (let r = 0; r < rowSpan; r++) { grid[rowIndex + r] ||= []; for (let c = 0; c < columnSpan; c++) grid[rowIndex + r][columnIndex + c] = entry; }
                columnIndex += columnSpan;
            });
        });
        return grid;
    }

    function columnType(label, values) {
        if (textualHeader.test(norm(label))) return /tarih|date/i.test(norm(label)) ? 'date' : 'text';
        const nonempty = values.filter(value => value !== '' && value != null);
        if (nonempty.length && nonempty.every(value => typeof value === 'number')) return 'number';
        if (nonempty.length && nonempty.every(value => value instanceof Date)) return 'date';
        if (!numericHeader.test(norm(label))) return 'text';
        return !nonempty.length || nonempty.every(value => typeof value === 'number' || canConvertNumber(value,label) && numberValue(value) != null || clean(value) === '-') ? 'number' : 'text';
    }

    function fromTable(source, options = {}) {
        const table = typeof source === 'string' ? document.querySelector(source) : (source?.tagName === 'TABLE' ? source : source?.querySelector?.('table'));
        if (!table) return null;
        const allRows = [...table.rows], headerRows = table.tHead ? [...table.tHead.rows] : [];
        if (!headerRows.length && allRows[0]?.querySelector('th')) headerRows.push(allRows[0]);
        const bodyRows = [...table.tBodies].flatMap(body => [...body.rows]).filter(row => !headerRows.includes(row));
        if (!table.tBodies.length) bodyRows.push(...allRows.filter(row => !headerRows.includes(row) && row.parentElement !== table.tFoot));
        const footRows = table.tFoot ? [...table.tFoot.rows] : [], headers = tableGrid(headerRows), body = tableGrid(bodyRows), feet = tableGrid(footRows);
        const width = Math.max(0, ...headers.map(row => row.length), ...body.map(row => row.length), ...feet.map(row => row.length));
        const columns = [], footnotes = [...(options.footnotes || [])];
        for (let index = 0; index < width; index++) {
            const entries = [...new Set(headers.map(row => row[index]).filter(Boolean))];
            const path = entries.map(entry => cellValue(entry.cell)).filter(Boolean), label = path.join(' / ') || 'Sütun ' + (index + 1);
            const samples = body.map(row => row[index]?.cell).filter(Boolean);
            const ignored = entries.some(entry => entry.cell.hasAttribute('data-output-ignore') || actionHeader.test(norm(cellValue(entry.cell))) || entry.cell.querySelector('input[type="checkbox"],input[type="radio"]'));
            const allCheckbox = samples.length && samples.every(cell => cell.querySelector('input[type="checkbox"],input[type="radio"]') && !cellValue(cell));
            const allActions = !path.length && samples.length && samples.every(cell => cell.querySelector('button,.fd-mini-actions,.action-btns') && !cellValue(cell));
            if (ignored || allCheckbox || allActions) continue;
            columns.push({key:'c' + index, label, path:path.length ? path : [label], type:columnType(label, []), sourceIndex:index});
        }
        const rows = [];
        function readGrid(grid, originalRows) {
            grid.forEach((logicalRow, index) => {
                const physicalRow = originalRows[index];
                if (physicalRow?.hasAttribute('data-output-ignore')) return;
                const distinct = [...new Set(logicalRow.filter(Boolean))];
                if (distinct.length === 1 && distinct[0].columnSpan > 1) {
                    const value = cellValue(distinct[0].cell);
                    if (/kayıt.*(?:yok|bulunamadı|bulunmuyor)|(?:listesi|liste).*boş|veri.*(?:yok|bulunmuyor)|no records/i.test(value)) return;
                    if (/^(?:not\s*:|açıklama\s*:)/i.test(value)) { footnotes.push(value); return; }
                }
                const row = {};
                columns.forEach(column => { const entry = logicalRow[column.sourceIndex]; row[column.key] = cellValue(entry?.cell, column); });
                if (Object.values(row).some(value => value !== '' && value != null)) rows.push(row);
            });
        }
        readGrid(body, bodyRows); readGrid(feet, footRows);
        columns.forEach(column => { column.type = columnType(column.label, rows.map(row => row[column.key])); });
        return {title:options.title || clean(table.caption?.textContent) || 'Liste', subtitle:options.subtitle || '', columns, rows, footnotes};
    }

    function rangeStart(reference) {
        if (typeof reference !== 'string') return null;
        const match = reference.split(':')[0].match(/\$?[A-Z]+\$?(\d+)/i);
        return match ? Number(match[1]) - 1 : null;
    }

    function workbookGrid(sheet) {
        // Read original coordinates directly. sheet_to_json starts at !ref's
        // first occupied row/column, which can shift merges and header anchors.
        const ref = sheet['!ref'] || 'A1', range = ref.split(':');
        const decode = address => { const match = address.replace(/\$/g,'').match(/([A-Z]+)(\d+)/i); if (!match) return {r:0,c:0}; let c=0; for (const char of match[1].toUpperCase()) c=c*26+char.charCodeAt(0)-64; return {r:Number(match[2])-1,c:c-1}; };
        const encode = (r,c) => { let result=''; for (let n=c+1;n>0;n=Math.floor((n-1)/26)) result=String.fromCharCode(65+(n-1)%26)+result; return result+(r+1); };
        const last = decode(range.at(-1)), rows=[];
        for (let r=0;r<=last.r;r++) { const row=[]; for (let c=0;c<=last.c;c++) { const cell=sheet[encode(r,c)]; row.push(cell?.v ?? ''); } rows.push(row); }
        return rows;
    }

    function headerIndex(data, sheet, options) {
        if (Number.isInteger(options.headerRow)) return options.headerRow;
        const mergedHeaderStart = row => {
            const merges=sheet?.['!merges'] || [];
            let start=row, changed=true;
            while(changed){changed=false;for(const merge of merges){if(merge.s.r<start&&merge.e.r>=start){start=merge.s.r;changed=true;}}}
            if(start===row&&start>0){
                const parent=data[start-1] || [], occupied=parent.map(display).filter(Boolean);
                if(occupied.length>1&&occupied.some(value=>headerWord.test(norm(value)))&&merges.some(merge=>merge.s.r===start-1&&merge.e.r===start-1&&merge.e.c>merge.s.c))start--;
            }
            return start;
        };
        const filter = rangeStart(sheet?.['!autofilter']?.ref);
        if (filter != null) return mergedHeaderStart(filter);
        const frozen = Number(sheet?.['!freeze']?.ySplit || 0);
        if (frozen > 0 && data[frozen-1]?.filter(value => display(value)).length > 1) return mergedHeaderStart(frozen - 1);
        let best = -1, bestScore = 0;
        data.slice(0, 40).forEach((row, index) => {
            const cells = row.map(display).filter(Boolean), known = cells.filter(value => headerWord.test(norm(value))).length;
            if (!cells.length || !known || (cells.length > 2 && known < 2)) return;
            const mergedTitle = (sheet?.['!merges'] || []).some(merge => merge.s.r === index && merge.e.r === index && merge.s.c === 0 && merge.e.c >= row.length-1);
            if (mergedTitle && cells.length === 1) return;
            const score = known * 6 + Math.min(cells.length, 30) - index * .05;
            if (score > bestScore) { best = index; bestScore = score; }
        });
        return best;
    }

    function excelHeaders(data, sheet, start, depth, width) {
        const grid = Array.from({length:depth}, (_,index) => (data[start+index] || []).map(value => ({value, originRow:index, originColumn:0})));
        (sheet?.['!merges'] || []).forEach(merge => {
            if (merge.s.r < start || merge.s.r >= start+depth) return;
            const entry = {value:data[merge.s.r]?.[merge.s.c] ?? '', originRow:merge.s.r-start, originColumn:merge.s.c};
            for (let r=merge.s.r;r<=Math.min(merge.e.r,start+depth-1);r++) { grid[r-start] ||= []; for (let c=merge.s.c;c<=Math.min(merge.e.c,width-1);c++) grid[r-start][c]=entry; }
        });
        return Array.from({length:width}, (_,index) => {
            const seen = new Set(), path = [];
            grid.forEach(row => { const entry=row[index], text=display(entry?.value); if (!text || seen.has(entry)) return; seen.add(entry); if (path.at(-1)!==text) path.push(text); });
            const label=path.join(' / ') || 'Sütun '+(index+1); return {key:'c'+index,label,path:path.length?path:[label],type:columnType(label,[]),sourceIndex:index};
        });
    }

    function fromArray(data, options = {}) {
        const rows = Array.isArray(data) ? data : [], sheet = options.sheet || {};
        const width = Math.max(0, ...rows.map(row => Array.isArray(row) ? row.length : 0));
        const start = headerIndex(rows, sheet, options);
        let depth = Number(options.headerDepth) || 1;
        if (!options.headerDepth && start >= 0) {
            const vertical = (sheet['!merges'] || []).filter(merge => merge.s.r === start && merge.e.r > start);
            if (vertical.length) depth = Math.min(4, Math.max(...vertical.map(merge => merge.e.r-start+1)));
            else if ((sheet['!merges'] || []).some(merge => merge.s.r===start && merge.e.c>merge.s.c) && rows[start+1]?.some(value => /^(?:toplam|total)$/i.test(display(value)))) depth=2;
            const anchor=rangeStart(sheet['!autofilter']?.ref) ?? (Number(sheet['!freeze']?.ySplit || 0)-1);
            if(anchor>=start&&anchor-start<4)depth=Math.max(depth,anchor-start+1);
        }
        let columns;
        if (options.columns?.length) columns = options.columns.map((column,index) => typeof column==='string' ? {key:'c'+index,label:column,path:[column],type:columnType(column,[]),sourceIndex:index} : {...column,key:column.key || 'c'+index,path:column.path || [column.label],sourceIndex:index});
        else columns = start >= 0 ? excelHeaders(rows,sheet,start,depth,width) : Array.from({length:width},(_,index)=>({key:'c'+index,label:'Sütun '+(index+1),path:['Sütun '+(index+1)],type:'text',sourceIndex:index}));
        columns = columns.filter(column => !actionHeader.test(norm(column.label)) && !(/^Sütun \d+$/.test(column.label) && rows.every(row=>!display(row[column.sourceIndex]))));
        const footnotes=[...(options.footnotes || [])];
        if (start>0) rows.slice(0,start).forEach(row=>{const text=row.map(display).filter(Boolean).join(' · ');if(text)footnotes.push(text);});
        const output=[];
        rows.slice(start>=0?start+depth:0).forEach(row=>{
            if (!Array.isArray(row) || !row.some(value=>display(value))) return;
            const record={};columns.forEach(column=>{let value=row[column.sourceIndex] ?? ''; if (value && typeof value==='object' && !(value instanceof Date)) value=value.result ?? value.text ?? value.richText?.map(part=>part.text).join('') ?? '';if(typeof value==='string'&&column.type==='number'&&!textualHeader.test(norm(column.label))&&canConvertNumber(value,column.label)){const parsed=numberValue(value);if(parsed!=null)value=parsed;}record[column.key]=value;});output.push(record);
        });
        columns.forEach(column=>{column.type=columnType(column.label,output.map(row=>row[column.key]));});
        return {title:options.title || 'Liste',subtitle:options.subtitle || '',columns,rows:output,footnotes};
    }

    function fromWorkbook(workbook, filename, options = {}) {
        if (!workbook) return [];
        if (workbook.SheetNames && workbook.Sheets) return workbook.SheetNames.map(name=>fromArray(workbookGrid(workbook.Sheets[name]), {...options,...(/^rapor\s*bilgisi$/i.test(norm(name))?{headerRow:-1,columns:['Bilgi','Değer']}:{ }),title:name,subtitle:options.subtitle || filename || '',sheet:workbook.Sheets[name]}));
        if (Array.isArray(workbook.worksheets)) return workbook.worksheets.map(sheet=>{
            const data=[];sheet.eachRow({includeEmpty:true},row=>{data[row.number-1]=row.values.slice(1);});
            const frozen=(sheet.views || []).find(view=>view.ySplit)?.ySplit, ref=typeof sheet.autoFilter==='string'?sheet.autoFilter:null;
            return fromArray(data,{...options,title:sheet.name,subtitle:options.subtitle || filename || '',sheet:{'!freeze':frozen?{ySplit:frozen}:undefined,'!autofilter':ref?{ref}:undefined}});
        });
        return [];
    }

    global.fdOutputModels = Object.assign(global.fdOutputModels || {}, {fromTable,fromWorkbook,fromArray,numberValue,cellValue});
})(window);

/* Full-data adapters for reports whose original export flow opens a picker or mutates shift state. */
(function (root) {
    'use strict';

    const text = value => value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    const el = id => document.getElementById(id);
    const list = value => Array.isArray(value) ? value : [];

    function source(group) {
        const buttons = list(group?.items).map(item => item.button).filter(Boolean);
        return [group?.key, group?.handler, group?.onclick, ...buttons.map(button => button.getAttribute?.('onclick') || String(button.onclick || ''))].filter(Boolean).join(' ');
    }

    function numeric(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : '';
        if (value == null || String(value).trim() === '') return '';
        if (root.fdOutputModels?.numberValue) return root.fdOutputModels.numberValue(value) ?? text(value);
        const cleaned = String(value).replace(/(?:TL|₺|\s)/g, '').replace(/\./g, '').replace(',', '.');
        const number = Number(cleaned);
        return Number.isFinite(number) ? number : text(value);
    }

    function date(value) {
        if (!value) return '';
        if (typeof tarihFormati === 'function') return tarihFormati(value);
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? match[3] + '.' + match[2] + '.' + match[1] : text(value);
    }

    function yes(value) {
        if (typeof personelEvetMi === 'function') return personelEvetMi(value);
        return value === true || value === 1 || /^(?:evet|true|1)$/i.test(String(value));
    }

    function report(title, fields, records, read, options = {}) {
        const columns = fields.map(field => ({key:field.key,label:field.label,path:[field.label],type:field.type || (field.date ? 'date' : 'text')}));
        return [{title,subtitle:options.subtitle || '',columns,rows:records.map(record => Object.fromEntries(fields.map(field => [field.key,read(record,field)]))),footnotes:options.footnotes || []}];
    }

    function personnel() {
        const fields = typeof PERSONEL_EXPORT_FIELDS !== 'undefined' ? PERSONEL_EXPORT_FIELDS : root.PERSONEL_EXPORT_FIELDS;
        if (!Array.isArray(fields) || typeof filtrelenmisAktifPersonelleriGetir !== 'function') return null;
        const numbers = new Set(['cocukSayisi','ucret','ekOdemeTutari','yolUcreti']);
        const clonedFields = fields.map(field => ({...field,type:numbers.has(field.key) ? 'number' : field.date ? 'date' : 'text'}));
        return report('Aktif Personel Listesi',clonedFields,filtrelenmisAktifPersonelleriGetir(),(person,field) => {
            let value = field.key === 'ucret' && person.fdUcretDonemleri?.length && typeof personelGunlukUcretiniGetir === 'function' ? personelGunlukUcretiniGetir(person) : person[field.key];
            if (field.key === 'mezuniyetYili') value = typeof mezuniyetYiliniDuzelt === 'function' ? mezuniyetYiliniDuzelt(person.mezuniyetYili || person.mezuniyetTarihi) : person.mezuniyetYili || person.mezuniyetTarihi || '';
            if (field.date) return date(value);
            if (['engelli','emekli','primVar'].includes(field.key)) return yes(value) ? 'Evet' : 'Hayır';
            return numbers.has(field.key) ? numeric(value) : text(value);
        });
    }

    function vehicles() {
        const moduleContext = root.FDModules?.callIfLoaded('arac','fdAracOutputContext',[],root);
        const fields = moduleContext?.fields || (typeof ARAC_EXPORT_FIELDS !== 'undefined' ? ARAC_EXPORT_FIELDS : root.ARAC_EXPORT_FIELDS);
        const readRecords = typeof aracDisAktarimListesi === 'function' ? aracDisAktarimListesi : typeof fdAracFiltreliListe === 'function' ? fdAracFiltreliListe : null;
        if (!Array.isArray(fields) || !readRecords) return null;
        const mode = moduleContext?.mode ?? (typeof aracListeModu !== 'undefined' ? aracListeModu : root.aracListeModu);
        const title = mode === 'aktif' ? 'Aktif Araçlar' : mode === 'satilan' ? 'Satılan Araçlar' : 'Tüm Araçlar';
        const clonedFields = fields.map(field => ({...field,type:field.money || field.key === 'km' ? 'number' : field.date ? 'date' : 'text'}));
        return report(title,clonedFields,readRecords(),(record,field) => field.date ? date(record[field.key]) : field.money || field.key === 'km' ? numeric(record[field.key]) : text(record[field.key]));
    }

    function shifts() {
        // vardiyaAktifKayit(false) still adds current-week personnel and schedules a save.
        // Read the existing record directly, copying all normalized headings and rows.
        const records = typeof vardiyaKayitlari !== 'undefined' ? vardiyaKayitlari : root.vardiyaKayitlari;
        const people = typeof personeller !== 'undefined' ? personeller : root.personeller;
        if (!Array.isArray(records)) return null;
        const branch = String(el('vardiyaSube')?.value || ''), value = String(el('vardiyaHafta')?.value || '');
        const week = value && typeof vardiyaPazartesi === 'function' ? vardiyaPazartesi(value) : value;
        const record = records.find(item => !item.kayitTipi && String(item.sube) === branch && String(item.haftaBaslangic) === week && (typeof aktifSirketeAit !== 'function' || aktifSirketeAit(item)));
        const fields = [{key:'no',label:'#',type:'number'},{key:'vardiya',label:'Vardiya'},{key:'personel',label:'Personel'},{key:'gorev',label:'Görev Yeri'}];
        if (!record) return report('Personel Vardiya Listesi',fields,[],row => row);
        const defaultIds = ['gunduz','gece','ana','ek'], defaultLabels = ['GÜNDÜZ','GECE','ANA BİNA','EK BİNA'];
        const sections = list(record.bolumler).length ? record.bolumler.map(section => ({id:String(section.id),baslik:String(section.baslik || record.basliklar?.[section.id] || 'YENİ BÖLÜM').toLocaleUpperCase('tr-TR')})) : defaultIds.map((id,index) => ({id,baslik:String(record.basliklar?.[id] || defaultLabels[index]).toLocaleUpperCase('tr-TR')}));
        const rows = list(record.satirlar).map(row => ({...row,vardiya:row.vardiya === 'genel' ? 'ana' : String(row.vardiya || '')}));
        const sectionIds = new Set(sections.map(section => section.id));
        rows.forEach(row => {if(row.vardiya && !sectionIds.has(row.vardiya)){sections.push({id:row.vardiya,baslik:String(record.basliklar?.[row.vardiya] || row.vardiya).toLocaleUpperCase('tr-TR')});sectionIds.add(row.vardiya);}});
        let index = 0;
        const output = sections.flatMap(section => rows.filter(row => row.vardiya === section.id && (row.personelId || row.personelAd || row.gorev)).sort((a,b) => Number(a.sira || 0) - Number(b.sira || 0)).map(row => {
            const person = list(people).find(item => String(item.id) === String(row.personelId));
            return {no:++index,vardiya:section.baslik,personel:person?.ad || row.personelAd || '-',gorev:row.gorev || '-'};
        }));
        const end = typeof vardiyaHaftaBitisi === 'function' ? vardiyaHaftaBitisi(week) : '';
        const subtitle = [date(week) + (end ? ' – ' + date(end) : ''),branch].filter(Boolean).join(' · ');
        const notes = String(el('vardiyaNotlar')?.innerText ?? record.notlar ?? '').trim();
        return report(record.basliklar?.anaBaslik || 'Personel Vardiya Listesi',fields,output,(row,field) => row[field.key],{subtitle,footnotes:notes ? ['Notlar: ' + notes] : []}).map(model=>({...model,shiftContext:{branch,week}}));
    }

    function copyImage(group, models, options = {}) {
        if (!/vardiya(?:ExcelAl|PdfAl|GoruntusuAl)|\bweekly-shift-list\b/.test(source(group))) return;
        // Keep the roster's established side-by-side board instead of flattening it.
        // Do not call vardiyaAktifKayit/vardiyaGoruntusuAl: reading them can schedule a save.
        return (async () => {
            const area = el('vardiyaCiktiAlani'), context = models[0]?.shiftContext;
            if (!context) throw new Error('Görüntüsü alınacak vardiya kaydı bulunamadı. Önce şube ve hafta seçin.');
            const isCurrent = () => (!options.isCurrent || options.isCurrent()) && (!context || (
                String(el('vardiyaSube')?.value || '') === context.branch &&
                (typeof vardiyaPazartesi === 'function' ? vardiyaPazartesi(el('vardiyaHafta')?.value || '') : el('vardiyaHafta')?.value || '') === context.week
            ));
            if (!isCurrent()) throw new Error('Vardiya seçimi değişti. Çıktı penceresini yeniden açın.');
            if (!area || typeof root.vardiyaGoruntuCanvasHazirla !== 'function') throw new Error('Vardiya görüntüsü hazırlanamadı. Sayfayı yenileyip tekrar deneyin.');
            if (!root.navigator?.clipboard?.write || typeof root.ClipboardItem !== 'function') throw new Error('Bu cihazda panoya görüntü kopyalama desteklenmiyor.');
            const fields = models.flatMap(model => model.columns.map(column => column.key));
            let result;
            const pending = root.vardiyaGoruntuCanvasHazirla(area,fields).then(async canvas => {
                try {
                    const blob = await new Promise((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Görüntü hazırlanamadı.')),'image/png'));
                    if (!isCurrent()) throw new Error('Vardiya seçimi değişti. Çıktı işlemi iptal edildi.');
                    result = {blob,width:canvas.width,height:canvas.height};return blob;
                } finally { canvas.width = 1;canvas.height = 1; }
            });
            pending.catch(() => {});
            // Start clipboard write before yielding the click gesture (also works on Safari).
            try { await root.navigator.clipboard.write([new root.ClipboardItem({'image/png':pending})]);await pending;return result; }
            catch (error) { await pending.catch(() => {});throw error; }
        })();
    }

    function fuelStock() {
        const calculate = typeof akaryakitStokHesaplariniHesapla === 'function' ? akaryakitStokHesaplariniHesapla : root.akaryakitStokHesaplariniHesapla;
        // Calculate before selecting report rows: a depot also serves other vehicles and periods.
        return typeof calculate === 'function' ? calculate() : {hareketler:new Map(),depolar:new Map()};
    }

    function mapRecord(map, id) {
        return map?.get?.(String(id)) ?? map?.get?.(id);
    }

    function stockNumber(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : '';
        if (value == null || String(value).trim() === '') return '';
        return root.fdOutputModels?.numberValue?.(value) ?? '';
    }

    function fuelDeliveries(records, stock, detail = false) {
        const cars = typeof araclar !== 'undefined' ? araclar : root.araclar;
        const depots = typeof akaryakitDepolari === 'function' ? akaryakitDepolari() : [];
        const consumption = typeof akaryakitTuketimleriniHesapla === 'function' ? akaryakitTuketimleriniHesapla() : new Map();
        return records.map(record => {
            const car = list(cars).find(item => String(item.id) === String(record.aracId));
            const depot = list(depots).find(item => String(item.id) === String(record.depoId));
            const rate = mapRecord(consumption, record.id), movement = mapRecord(stock.hareketler, record.id), depotStock = mapRecord(stock.depolar, record.depoId);
            return {
                tarih:date(record.tarih),depo:depot?.ad || '-',plaka:car?.plaka || '-',islem:record.tur === 'giris' ? 'DEPOYA GİRİŞ' : 'ARACA VERİLEN',
                litre:numeric(record.litre),depoBaslangic:stockNumber(depotStock?.acilis),kalanDepoLitre:stockNumber(movement?.kalan),
                km:detail || record.km ? numeric(record.km) : '',alan:record.alan || '-',veren:record.veren || '-',
                tuketim:typeof rate === 'number' && Number.isFinite(rate) ? Number(rate.toFixed(2)) : ''
            };
        });
    }

    function fuelDeliveryFields(detail = false) {
        return [
            {key:'tarih',label:'Tarih',type:'date'},{key:'depo',label:'Depo'},
            ...(!detail ? [{key:'plaka',label:'Plaka'},{key:'islem',label:'İşlem'}] : []),
            {key:'litre',label:'Litre',type:'number'},
            {key:'depoBaslangic',label:'Açılış Stoku (Litre)',type:'number'},
            {key:'kalanDepoLitre',label:'İşlem Sonrası Kalan (Litre)',type:'number'},
            {key:'km',label:'KM',type:'number'},{key:'alan',label:'Alan'},{key:'veren',label:'Veren'},
            {key:'tuketim',label:'100 KM Tüketim',type:'number'}
        ];
    }

    function fuelMovements() {
        if (typeof akaryakitFiltrelenmisListe !== 'function') return null;
        const stock = fuelStock(), records = list(akaryakitFiltrelenmisListe());
        const period = el('akaryakitAyFiltre')?.value || 'TÜM DÖNEMLER';
        const incoming = records.filter(record => record.tur === 'giris').reduce((sum,record) => sum + Number(record.litre || 0),0);
        const outgoing = records.filter(record => record.tur === 'cikis').reduce((sum,record) => sum + Number(record.litre || 0),0);
        return report('Akaryakıt Hareket Raporu',fuelDeliveryFields(),fuelDeliveries(records,stock),(row,field) => row[field.key],{subtitle:period + ' · ' + records.length + ' kayıt · Giriş ' + incoming.toLocaleString('tr-TR') + ' L · Verilen ' + outgoing.toLocaleString('tr-TR') + ' L'});
    }

    function fuelVehicleHistory() {
        if (typeof akaryakitAracDetayListesi !== 'function' || typeof akaryakitTuketimAraliklari !== 'function' || typeof akaryakitTuketimDonemOzeti !== 'function' || typeof akaryakitDetayTarihAraligindaMi !== 'function') return null;
        const stock = fuelStock(), records = list(akaryakitAracDetayListesi()), id = el('akaryakitDetayAracId')?.value || '';
        const cars = typeof araclar !== 'undefined' ? araclar : root.araclar, car = list(cars).find(item => String(item.id) === String(id));
        const year = el('akaryakitDetayYil')?.value || '', month = el('akaryakitDetayAy')?.value || 'TÜM AYLAR';
        const start = el('akaryakitDetayBaslangic')?.value || '', end = el('akaryakitDetayBitis')?.value || '';
        const period = start || end ? (start ? date(start) : 'BAŞLANGIÇ') + ' - ' + (end ? date(end) : 'BUGÜN') : year + ' ' + month;
        const subtitle = [car?.plaka,period].filter(Boolean).join(' · ');
        const allIntervals = list(akaryakitTuketimAraliklari(id)), intervals = allIntervals.filter(interval => akaryakitDetayTarihAraligindaMi(interval.sonTarih));
        const summarySource = start || end ? intervals : allIntervals;
        const monthly = list(akaryakitTuketimDonemOzeti(summarySource.filter(interval => start || end ? true : String(interval.sonTarih).startsWith(year)),7));
        const yearly = list(akaryakitTuketimDonemOzeti(summarySource,4));
        const intervalFields = [{key:'oncekiTarih',label:'Önceki Tarih',type:'date'},{key:'sonTarih',label:'Son Tarih',type:'date'},{key:'oncekiKm',label:'Önceki KM',type:'number'},{key:'sonKm',label:'Son KM',type:'number'},{key:'kmFarki',label:'Yapılan KM',type:'number'},{key:'litre',label:'Alınan Litre',type:'number'},{key:'oran',label:'100 KM Tüketim',type:'number'}];
        const summaryFields = [{key:'donem',label:'Dönem'},{key:'adet',label:'Alım Sayısı',type:'number'},{key:'litre',label:'Toplam Litre',type:'number'},{key:'km',label:'Hesaplanan KM',type:'number'},{key:'ortalama',label:'Ortalama L/100 KM',type:'number'}];
        const read = (row,field) => field.type === 'date' ? date(row[field.key]) : field.type === 'number' ? ['oran','ortalama'].includes(field.key) && typeof row[field.key] === 'number' ? Number(row[field.key].toFixed(2)) : numeric(row[field.key]) : text(row[field.key]);
        return [
            ...report('Yakıt Teslimleri',fuelDeliveryFields(true),fuelDeliveries(records,stock,true),(row,field) => row[field.key],{subtitle}),
            ...report('İki Yakıt Arası',intervalFields,intervals,read,{subtitle}),
            ...report('Aylık Özet',summaryFields,monthly,read,{subtitle}),
            ...report('Yıllık Özet',summaryFields,yearly,read,{subtitle})
        ];
    }

    async function get(group) {
        const handler = source(group);
        if (/openPersonelExportModal|exportSelectedPersonelFields|exportPersonelTo(?:Excel|PDF)|\bpersonnel\b/.test(handler)) return personnel();
        if (/aracExportModaliniAc|aracSeciliAlanlariAktar|\bvehicle-list\b/.test(handler)) return vehicles();
        if (/vardiya(?:ExcelAl|PdfAl|GoruntusuAl)|\bweekly-shift-list\b/.test(handler)) return shifts();
        if (/akaryakitAracRaporAl|\bfuel-vehicle-history\b/.test(handler)) return fuelVehicleHistory();
        if (/akaryakitRaporAl|\bfuel-movements\b/.test(handler)) return fuelMovements();
        return null;
    }

    function filterCaptured(group, models) {
        if (!/fdFiyatV2(?:Excel|Pdf|Goruntu)/.test(source(group))) return models;
        const input = document.querySelector('#fdFtIcerik .fd-ft-toolbar input[type="search"]');
        const query = String(input?.value || '').trim().toLocaleLowerCase('tr-TR');
        if (!query) return models;
        return models.map(model => {
            const keys = model.columns.filter(column => /^(?:ürün(?: adı)?|açıklama|birim)$/i.test(String(column.label).trim())).map(column => column.key);
            if (!keys.length) return model;
            return {...model,rows:model.rows.filter(row => keys.some(key => text(row[key]).toLocaleLowerCase('tr-TR').includes(query)))};
        });
    }

    root.fdOutputAdapters = Object.assign(root.fdOutputAdapters || {},{get,filterCaptured,copyImage});
})(window);

/* Selectable leave summary fields alongside entitlement and history tables. */
(function (root) {
    'use strict';
    const adapters = root.fdOutputAdapters ||= {}, previous = adapters.get;
    const text = value => value == null ? '' : String(value);
    const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : root.fdOutputModels?.numberValue(value) ?? 0;
    const date = value => {
        if (!value) return '';
        if (typeof tarihFormati === 'function') return tarihFormati(value);
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? match[3] + '.' + match[2] + '.' + match[1] : text(value);
    };
    const report = (title, columns, rows) => ({title,subtitle:'',columns:columns.map(([key,label,type='text'])=>({key,label,path:[label],type})),rows,footnotes:[]});
    const handler = group => (group?.items || []).map(item => item.button?.getAttribute?.('onclick') || String(item.button?.onclick || '')).join(' ');

    function leaveSummary() {
        if (typeof seciliPersonelIzinCiktiVerisi !== 'function') return null;
        const value = seciliPersonelIzinCiktiVerisi();
        if (!value?.personel) throw new Error('Çıktı için önce bir personel seçin.');
        const person = value.personel;
        const summary = report('Personel İzin Durumu Özeti',[
            ['personel','Personel'],['iseGiris','İşe Giriş','date'],['sube','Şube'],
            ['toplamKalan','Toplam Kalan Yıllık İzin (Gün)','number'],
            ['kullanilanOzet','Kullandığı İzin Toplamları'],['izinNotu','İzinlerle İlgili Ek Not']
        ],[{personel:text(person.ad),iseGiris:date(person.girisTarihi),sube:text(person.sube || 'Merkez'),toplamKalan:numeric(value.toplamKalan),kullanilanOzet:text(value.kullanilanOzet || 'Henüz izin kullanılmamış.'),izinNotu:text(value.izinNotu || '-')}]);
        const entitlement = report('Aktif ve Kalan Yıllık İzin Hakedişleri',[
            ['donem','Dönem'],['hak','Toplam Hak (Gün)','number'],['kullanilan','Kullanılan (Gün)','number'],['kalan','Kalan (Gün)','number'],['durum','Durum']
        ],(Array.isArray(value.hakedis) ? value.hakedis : []).map(item=>({donem:text(item.donem),hak:numeric(item.hak),kullanilan:numeric(item.kullanilan),kalan:numeric(item.kalan),durum:numeric(item.kullanilan) ? 'Kısmi kullanım' : 'Tam kalan'})));
        const history = report('Geçmiş İzinler',[
            ['no','#','number'],['tur','İzin Türü'],['donem','Dönem'],['baslangic','Başlangıç','date'],['bitis','Bitiş','date'],['gun','Süre (Gün)','number'],['aciklama','Rapor / Açıklama']
        ],(Array.isArray(value.gecmis) ? value.gecmis : []).map((item,index)=>({no:index+1,tur:text(item.tur || '-'),donem:text(item.donem || '-'),baslangic:date(item.baslangic),bitis:date(item.bitis),gun:numeric(item.gun),aciklama:typeof izinGecmisAciklamaMetni === 'function' ? izinGecmisAciklamaMetni(item) : [item.raporBilgisi ? 'Rapor: '+item.raporBilgisi : '',item.sebep || item.aciklama || ''].filter(Boolean).join(' · ') || '-'})));
        return [summary,entitlement,history];
    }

    adapters.get = async function (group) {
        if (/\bexportIzinOzet(?:Excel|Pdf)\s*\(/.test(handler(group))) {
            const result=leaveSummary();if(result)return result;
        }
        return typeof previous === 'function' ? previous.call(this,group) : null;
    };
    adapters.leaveSummary = leaveSummary;
})(window);

/* Read-only, full-list models for policy and agricultural registration reports. */
(function (root) {
    'use strict';

    const adapters = root.fdOutputAdapters ||= {}, previous = adapters.get;
    const text = value => value == null ? '' : String(value);
    const list = value => Array.isArray(value) ? value : [];
    const number = value => {
        if (value == null || text(value).trim() === '') return '';
        if (typeof value === 'number') return Number.isFinite(value) ? value : '';
        const parsed = root.fdOutputModels?.numberValue(value);
        return parsed == null ? text(value) : parsed;
    };
    const date = value => {
        const raw = text(value).trim();
        if (!raw) return '';
        const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
        if (!match) return raw;
        const [, year, month, day] = match;
        const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() + 1 === Number(month) && parsed.getUTCDate() === Number(day)
            ? day + '.' + month + '.' + year : raw;
    };
    const model = (title, fields, rows, options = {}) => ({
        title, subtitle:options.subtitle || '', identifierKey:options.identifierKey || '',
        columns:fields.map(([key, label, type = 'text']) => ({key, label, path:[label], type})),
        rows, footnotes:[]
    });
    const unique = (items, field) => {
        const values = new Map();
        list(items).forEach(item => {
            const value = text(item?.[field]).normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
            if (!value) return;
            const key = typeof tapuCksNorm === 'function' ? tapuCksNorm(value) : value.toLocaleLowerCase('tr-TR');
            if (!values.has(key)) values.set(key, value);
        });
        return Array.from(values.values()).join('\n');
    };
    const linkedPlot = record => typeof tapuCksTapuBul === 'function' ? tapuCksTapuBul(record?.tapuId) : null;
    const plotReference = record => [text(record?.ada), text(record?.parsel)].filter(Boolean).join(' / ');

    function policyList() {
        if (typeof root.fdPoliceFiltreliListe !== 'function') throw new Error('Poliçe listesi hazırlanamadı. Sayfayı yenileyip tekrar deneyin.');
        const records = list(root.fdPoliceFiltreliListe());
        return [model('Poliçe Takip Listesi', [
            ['no', '#', 'number'], ['varlik', 'Varlık'], ['varlikTuru', 'Varlık Türü'],
            ['eslesmeKodu', 'Plaka / UAVT / Referans'], ['tur', 'Poliçe Türü'],
            ['sirket', 'Sigorta Şirketi'], ['policeNo', 'Poliçe No'],
            ['baslangic', 'Başlangıç', 'date'], ['bitis', 'Bitiş', 'date'],
            ['prim', 'Prim (TL)', 'number'], ['durum', 'Durum'], ['aciklama', 'Açıklama']
        ], records.map((record, index) => ({
            no:index + 1, varlik:text(record.hedefAdi),
            varlikTuru:typeof policeVarlikTurAdi === 'function' ? text(policeVarlikTurAdi(record.hedefTip)) : text(record.hedefTip),
            eslesmeKodu:text(record.eslesmeKodu), tur:text(record.tur), sirket:text(record.sirket), policeNo:text(record.policeNo),
            baslangic:date(record.baslangic), bitis:date(record.bitis), prim:number(record.bedel ?? record.tutar),
            durum:typeof policeDurumu === 'function' ? text(policeDurumu(record)?.metin) : text(record.durum),
            aciklama:text(record.aciklama || record.not)
        })), {identifierKey:'varlik'})];
    }

    function agriculturalData() {
        // The bridge calls the module's own filters, before its pagination slice.
        // Never fall back to scraping the 25/50/100 visible records.
        if (typeof root.fdCksCiktiVerisi !== 'function') throw new Error('ÇKS listesi hazırlanamadı. Sayfayı yenileyip tekrar deneyin.');
        return root.fdCksCiktiVerisi() || {};
    }

    function cksList() {
        const data = agriculturalData();
        return [model('ÇKS Takip Listesi', [
            ['parsel', 'Ada / Parsel'], ['tasinmazNo', 'Taşınmaz No'], ['mahalle', 'Mahalle'], ['ilce', 'İlçe'], ['il', 'İl'],
            ['malik', 'Tapu Sahibi'], ['alan', 'Sahip Olunan Alan (m²)', 'number'],
            ['urun', 'Ürün / Kullanım'], ['eken', 'Eken / Durum'], ['cksSahibi', 'ÇKS Sahibi'],
            ['kayitSayisi', 'Geçmiş Kayıt Sayısı', 'number'], ['cksDurumu', 'ÇKS Durumu']
        ], list(data.gruplar).map(group => {
            const record = group.ornek || list(group.items)[0] || {}, plot = group.tapu;
            return {
                parsel:plotReference(record), tasinmazNo:text(plot?.tasinmazNo),
                mahalle:text(record.mahalle), ilce:text(record.ilce), il:text(record.il),
                malik:text(plot?.sahibi || record.malik), alan:number(plot?.sahipOlunanAlan ?? record.sahipOlunanAlan),
                urun:unique(group.items, 'urun'), eken:unique(group.items, 'ekenNotu'), cksSahibi:unique(group.items, 'cksSahibi'),
                kayitSayisi:number(group.gecmisSayisi),
                cksDurumu:list(group.items).length && group.items.every(item => item.kayitTipi === 'cksBos') ? 'ÇKS Verilmedi' : 'ÇKS Kaydı Var'
            };
        }), {subtitle:data.yil ? text(data.yil) + ' yılı' : '', identifierKey:'parsel'})];
    }

    function cksDetail() {
        const data = agriculturalData();
        if (!data.detayAnahtari) throw new Error('ÇKS geçmişi için önce bir parsel seçin.');
        const records = list(data.detayKayitlari), example = records[0];
        const plot = linkedPlot(records.find(record => record.tapuId));
        return [model('ÇKS Parsel Geçmişi', [
            ['yil', 'Yıl'], ['urun', 'Ürün / Kullanım'], ['eken', 'Eken / Durum'],
            ['cksSahibi', 'ÇKS Sahibi'], ['malik', 'Tapu Sahibi'],
            ['alan', 'Sahip Olunan Alan (m²)', 'number'], ['aciklama', 'Açıklama']
        ], records.map(record => ({
            yil:text(record.yil), urun:text(record.urun), eken:text(record.ekenNotu), cksSahibi:text(record.cksSahibi),
            malik:text(plot?.sahibi || record.malik), alan:number(plot?.sahipOlunanAlan ?? record.sahipOlunanAlan), aciklama:text(record.aciklama)
        })), {subtitle:[plotReference(example), [example?.mahalle, example?.ilce, example?.il].filter(Boolean).join(' / ')].filter(Boolean).join(' · '), identifierKey:'yil'})];
    }

    adapters.get = async function (group) {
        const key = text(group?.key);
        if (key === 'policy-list' || key === 'police-list') return policyList();
        if (key === 'cks-list') return cksList();
        if (key === 'cks-detail') return cksDetail();
        return typeof previous === 'function' ? previous.call(this, group) : null;
    };
    Object.assign(adapters, {policyList, cksList, cksDetail});

    function outputButton(id, key) {
        const button = document.createElement('button');
        button.id = id;
        button.type = 'button';
        button.className = 'fd-output-trigger';
        button.dataset.fdOutputOwn = 'true';
        button.setAttribute('aria-haspopup', 'dialog');
        root.fdUnifiedOutput.decorateButton(button);
        button.onclick = () => root.fdUnifiedOutput.openList(typeof key === 'function' ? key() : key, button);
        return button;
    }

    function install() {
        const output = root.fdUnifiedOutput;
        if (typeof output?.decorateButton !== 'function' || typeof output?.openList !== 'function') return false;
        if (!document.getElementById('fdSupplementalOutputStyle')) {
            const style = document.createElement('style');
            style.id = 'fdSupplementalOutputStyle';
            style.textContent = '.fd-policy-output-actions{display:flex;align-items:center;gap:8px;min-width:0}.fd-policy-output-actions>button:not(.fd-output-trigger){flex:1}#cksTakipApp .cks-actions>.fd-output-trigger{flex:0 0 auto}';
            document.head.appendChild(style);
        }
        const newPolicy = document.querySelector('#policeTakipApp .police-filtre button[onclick*="policeFormunuAc"]');
        if (newPolicy && !document.getElementById('fdPolicyOutputButton')) {
            let actions = newPolicy.parentElement;
            if (!actions.classList.contains('fd-policy-output-actions')) {
                actions = document.createElement('div');
                actions.className = 'fd-policy-output-actions';
                newPolicy.parentElement.insertBefore(actions, newPolicy);
                actions.appendChild(newPolicy);
            }
            actions.insertBefore(outputButton('fdPolicyOutputButton', 'policy-list'), newPolicy);
        }
        const cksActions = document.querySelector('#cksTakipApp .cks-head .cks-actions');
        if (cksActions && !document.getElementById('fdCksOutputButton')) {
            cksActions.insertBefore(outputButton('fdCksOutputButton', () => {
                const detail = document.getElementById('cksDetayPanel');
                return detail && detail.style.display !== 'none' && !detail.hidden ? 'cks-detail' : 'cks-list';
            }), cksActions.firstChild);
        }
        return {policy:!!document.getElementById('fdPolicyOutputButton'), cks:!!document.getElementById('fdCksOutputButton')};
    }
    root.fdSupplementalOutputInstall = install;
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
        else install();
    }
})(window);

/* Shared, read-only table exporters. Geometry is measured before drawing any page. */
(function (root) {
    'use strict';

    const A4 = [595.28, 841.89], FONT = 'Arial, "Segoe UI", sans-serif';
    const COLORS = { ink: '#16283c', muted: '#64748b', line: '#d4dfe8', head: '#e8f1f6', alt: '#f7fafc', accent: '#315b72' };
    const numberTypes = new Set(['number', 'numeric', 'currency', 'money', 'amount', 'integer', 'percent']);
    const text = value => value == null ? '' : value instanceof Date ? value.toLocaleDateString('tr-TR') : String(value);
    const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
    const total = values => values.reduce((sum, value) => sum + value, 0);

    function reports(input) {
        const models = Array.isArray(input) ? input : Array.isArray(input?.models) ? input.models : [input];
        if (!models.length) throw new Error('Çıktı için tablo bulunamadı.');
        return models;
    }

    function normalize(model) {
        if (!model || !Array.isArray(model.columns) || !model.columns.length) throw new Error('Çıktı için en az bir alan seçin.');
        if (!Array.isArray(model.rows)) throw new Error('Çıktı satırları hazırlanamadı.');
        return {
            title: text(model.title || 'Rapor'), subtitle: text(model.subtitle),
            identifierKey: text(model.identifierKey),
            columns: model.columns.map((column, index) => typeof column === 'string'
                ? { key: String(index), label: column, type: '' }
                : { ...column, key: text(column.key ?? index), label: text(column.label || column.key || ('Alan ' + (index + 1))), type: text(column.type).toLowerCase() }),
            rows: model.rows.map(row => model.columns.map((column, index) => Array.isArray(row) ? row[index] ?? '' : row?.[column.key] ?? '')),
            footnotes: (Array.isArray(model.footnotes) ? model.footnotes : []).map(text).filter(Boolean)
        };
    }

    function display(value, column) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            const decimals = ['currency', 'money', 'amount'].includes(column.type) ? 2 : column.type === 'integer' ? 0 : undefined;
            return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals ?? 0, maximumFractionDigits: decimals ?? 10 }).format(value);
        }
        return text(value).replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
    }

    function fallbackMeasure(value, size, bold) {
        return Array.from(text(value)).reduce((width, char) => width + (/\s/.test(char) ? .28 : /[ilIıİ.,:;'!|]/.test(char) ? .3 : /[MWĞÖÜ@%]/.test(char) ? .8 : .55) * size, 0) * (bold ? 1.045 : 1);
    }

    // Preserve explicit line breaks. A single long token is split at Unicode code points.
    function wrap(value, width, measure, size, bold) {
        const output = [], available = Math.max(1, width);
        for (const paragraph of text(value).replace(/\r\n?/g, '\n').split('\n')) {
            if (!paragraph.trim()) { output.push(''); continue; }
            let line = '';
            for (const token of paragraph.trim().split(/\s+/u)) {
                if (measure(token, size, bold) <= available) {
                    const joined = line ? line + ' ' + token : token;
                    if (line && measure(joined, size, bold) > available) { output.push(line); line = token; }
                    else line = joined;
                    continue;
                }
                if (line) { output.push(line); line = ''; }
                for (const char of Array.from(token)) {
                    if (line && measure(line + char, size, bold) > available) { output.push(line); line = ''; }
                    line += char;
                }
            }
            output.push(line);
        }
        return output.length ? output : [''];
    }

    function desiredWidths(model, size, measure) {
        return model.columns.map((column, index) => {
            const day = column.type === 'day' || /^(?:[1-9]|[12]\d|3[01])(?:\s*\/\s*(?:[1-9]|1[0-2]))?$/.test(column.label);
            const numeric = numberTypes.has(column.type) || model.rows.length > 0 && model.rows.every(row => row[index] === '' || typeof row[index] === 'number');
            const widths = model.rows.map(row => Math.max(...display(row[index], column).split('\n').map(line => measure(line, size, false)))).sort((a, b) => a - b);
            const typical = widths.length ? widths[Math.floor((widths.length - 1) * .85)] : 0;
            const heading = measure(column.label, size, true), padding = 14;
            if (day) return clamp(Math.max(heading, typical) + padding, 32, 43);
            if (column.type === 'date') return clamp(Math.max(heading, typical) + padding, 76, 110);
            if (numeric) return clamp(Math.max(heading, typical) + padding, 64, 115);
            return clamp(Math.max(Math.min(heading, 130), typical) + padding, index === 0 ? 94 : 68, index === 0 ? 165 : 210);
        });
    }

    function identifierIndex(model) {
        const explicit = model.identifierKey && model.columns.findIndex(column => column.key === model.identifierKey);
        if (typeof explicit === 'number' && explicit >= 0) return explicit;
        if (!/^(?:#|no\.?|sıra(?:\s*no\.?)?|sıra\s*numarası)$/iu.test(model.columns[0].label.trim())) return 0;
        const named = model.columns.findIndex(column => /personel|adı?\s*soyadı?|ad\s*soyad|plaka|ürün|kiracı|daire|taşınmaz|firma|sahibi/iu.test(column.label));
        return named >= 0 ? named : 0;
    }

    // Pure planner: the optional measure function is the only dependency. All dimensions are PDF points.
    function plan(input, options = {}, measure = fallbackMeasure) {
        const model = normalize(input), fontSize = Math.max(9.5, Number(options.fontSize) || 10);
        const widths = desiredWidths(model, fontSize, measure), margin = clamp(Number(options.margin) || 32, 20, 50);
        const orientation = options.orientation === 'portrait' ? 'portrait' : options.orientation === 'landscape' ? 'landscape'
            : total(widths) > A4[0] - margin * 2 ? 'landscape' : 'portrait';
        const [pageWidth, pageHeight] = orientation === 'landscape' ? [A4[1], A4[0]] : A4;
        const contentWidth = pageWidth - margin * 2, bottom = pageHeight - margin - 24, lineHeight = fontSize * 1.35, padding = 6;
        const titleLines = wrap(model.title, contentWidth, measure, 17, true), subtitleLines = model.subtitle ? wrap(model.subtitle, contentWidth, measure, 9, false) : [];
        const titleY = margin, subtitleY = titleY + titleLines.length * 22 + 4;
        const tableY = subtitleY + subtitleLines.length * 13 + (subtitleLines.length ? 13 : 4) + 16;
        const panels = [], identifier = identifierIndex(model);
        if (total(widths) <= contentWidth) panels.push({ indices: widths.map((_, index) => index), widths: widths.slice() });
        else {
            // Every horizontal panel repeats the selected identifying column.
            const remaining = widths.map((_, index) => index).filter(index => index !== identifier);
            let position = 0;
            while (position < remaining.length) {
                const indices = [identifier], panelWidths = [Math.min(widths[identifier], contentWidth * .36)];
                let used = panelWidths[0];
                while (position < remaining.length) {
                    const index = remaining[position];
                    const width = Math.min(widths[index], contentWidth - panelWidths[0]);
                    if (indices.length > 1 && used + width > contentWidth + .01) break;
                    indices.push(index); position++; panelWidths.push(width); used += width;
                }
                panels.push({ indices, widths: panelWidths });
            }
            if (!panels.length) panels.push({ indices: [0], widths: [contentWidth] });
        }
        const pages = [];
        panels.forEach((panel, panelIndex) => {
            // Give short reports useful whitespace; never squeeze text to fit a wide matrix.
            const extra = contentWidth - total(panel.widths);
            if (extra > 0) {
                const weights = panel.indices.map((columnIndex, i) => model.columns[columnIndex].type === 'day' ? .3 : panel.widths[i]);
                const sum = total(weights);
                panel.widths = panel.widths.map((width, i) => width + extra * weights[i] / sum);
            }
            panel.headerCells = panel.indices.map((columnIndex, i) => ({ columnIndex, lines: wrap(model.columns[columnIndex].label, panel.widths[i] - padding * 2, measure, fontSize, true) }));
            panel.headerHeight = Math.max(...panel.headerCells.map(cell => cell.lines.length)) * lineHeight + padding * 2;
            const bodyY = tableY + panel.headerHeight, bodyCapacity = bottom - bodyY;
            if (bodyCapacity < lineHeight * 3 + padding * 2) throw new Error('Başlıklar sayfaya sığmayacak kadar uzun. Daha kısa bir rapor başlığı kullanın.');
            const newPage = () => {
                const page = { panelIndex, panelPage: pages.filter(item => item.panelIndex === panelIndex).length + 1, rows: [], notes: [], bodyY, usedY: bodyY };
                pages.push(page); return page;
            };
            let page = newPage();
            model.rows.forEach((row, rowIndex) => {
                const cells = panel.indices.map((columnIndex, i) => ({ columnIndex, lines: wrap(display(row[columnIndex], model.columns[columnIndex]), panel.widths[i] - padding * 2, measure, fontSize, false), align: typeof row[columnIndex] === 'number' || numberTypes.has(model.columns[columnIndex].type) ? 'right' : 'left' }));
                const count = Math.max(...cells.map(cell => cell.lines.length)), rowHeight = count * lineHeight + padding * 2;
                if (rowHeight <= bodyCapacity) {
                    if (page.usedY + rowHeight > bottom + .01) page = newPage();
                    page.rows.push({ rowIndex, y: page.usedY, height: rowHeight, lineOffset: 0, lineCount: count, continuation: false, cells });
                    page.usedY += rowHeight;
                    return;
                }
                // A row taller than a whole page continues only between complete lines.
                let offset = 0;
                while (offset < count) {
                    const continuation = offset > 0, markerHeight = continuation ? 11 : 0;
                    let capacity = Math.floor((bottom - page.usedY - padding * 2 - markerHeight) / lineHeight);
                    if (capacity < 2 || !continuation && page.rows.length) { page = newPage(); capacity = Math.floor((bodyCapacity - padding * 2 - markerHeight) / lineHeight); }
                    const lineCount = Math.min(capacity, count - offset);
                    const repeatedIdentifierLines = continuation && cells[0].lines.length <= 3 ? cells[0].lines.length : 0;
                    const height = Math.max(lineCount, repeatedIdentifierLines) * lineHeight + padding * 2 + markerHeight;
                    const fragmentCells = cells.map((cell, i) => ({ ...cell, lines: continuation && i === 0 && cell.lines.length <= 3 ? cell.lines.slice() : cell.lines.slice(offset, offset + lineCount) }));
                    page.rows.push({ rowIndex, y: page.usedY, height, lineOffset: offset, lineCount, continuation, markerHeight, cells: fragmentCells });
                    page.usedY += height; offset += lineCount;
                    if (offset < count) page = newPage();
                }
            });
            if (!model.rows.length) {
                page.notes.push({ y: page.usedY + 12, lines: ['Gösterilecek kayıt bulunmuyor.'], size: fontSize, lineHeight });
                page.usedY += 12 + lineHeight;
            }
            // Footnotes appear once, after the final horizontal panel, and may occupy additional pages.
            if (panelIndex === panels.length - 1 && model.footnotes.length) {
                page.usedY += 14;
                model.footnotes.forEach(note => {
                    const lines = wrap(note, contentWidth, measure, 9, false);
                    let offset = 0;
                    while (offset < lines.length) {
                        let capacity = Math.floor((bottom - page.usedY) / 12);
                        if (capacity < 1) { page = newPage(); capacity = Math.floor((bottom - page.usedY) / 12); }
                        const slice = lines.slice(offset, offset + capacity);
                        page.notes.push({ y: page.usedY, lines: slice, size: 9, lineHeight: 12 });
                        page.usedY += slice.length * 12 + 6; offset += slice.length;
                    }
                });
            }
        });
        return { model, pageWidth, pageHeight, orientation, margin, contentWidth, bottom, fontSize, lineHeight, padding, titleLines, titleY, subtitleLines, subtitleY, tableY, panels, pages };
    }

    function browserMeasure() {
        const ctx = root.document.createElement('canvas').getContext('2d');
        if (!ctx) throw new Error('Çıktı için görüntü alanı oluşturulamadı.');
        return (value, size, bold) => { ctx.font = (bold ? '700 ' : '400 ') + size + 'px ' + FONT; return ctx.measureText(text(value)).width; };
    }

    function canvasAt(width, height, scale) {
        const canvas = root.document.createElement('canvas');
        canvas.width = Math.ceil(width * scale); canvas.height = Math.ceil(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Çıktı için görüntü alanı oluşturulamadı.');
        ctx.scale(scale, scale); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
        ctx.textBaseline = 'top'; return { canvas, ctx };
    }

    function drawLines(ctx, lines, x, y, size, lineHeight, color, bold, align = 'left') {
        ctx.font = (bold ? '700 ' : '400 ') + size + 'px ' + FONT; ctx.fillStyle = color; ctx.textAlign = align;
        lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    }

    function drawCell(ctx, cell, x, y, width, height, settings, header, alternate, markerHeight = 0) {
        const { padding, fontSize, lineHeight } = settings;
        ctx.fillStyle = header ? COLORS.head : alternate ? COLORS.alt : '#ffffff'; ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = COLORS.line; ctx.lineWidth = .55; ctx.strokeRect(x, y, width, height);
        const align = header ? 'left' : cell.align || 'left';
        // The clip guards rounding and font fallback without splitting a planned text line.
        ctx.save(); ctx.beginPath(); ctx.rect(x + 1, y + 1, width - 2, height - 2); ctx.clip();
        drawLines(ctx, cell.lines, align === 'right' ? x + width - padding : x + padding, y + padding + markerHeight, fontSize, lineHeight, COLORS.ink, header, align);
        ctx.restore();
    }

    function drawPage(layout, pageIndex, scale = 3, globalPage = pageIndex + 1, globalTotal = layout.pages.length) {
        const page = layout.pages[pageIndex], panel = layout.panels[page.panelIndex], { canvas, ctx } = canvasAt(layout.pageWidth, layout.pageHeight, scale);
        drawLines(ctx, layout.titleLines, layout.margin, layout.titleY, 17, 22, COLORS.accent, true);
        drawLines(ctx, layout.subtitleLines, layout.margin, layout.subtitleY, 9, 13, COLORS.muted, false);
        const band = layout.panels.length > 1 ? 'Sütun bölümü ' + (page.panelIndex + 1) + ' / ' + layout.panels.length : '';
        drawLines(ctx, [band], layout.margin, layout.tableY - 15, 8, 11, COLORS.muted, false);
        let x = layout.margin;
        panel.headerCells.forEach((cell, index) => { drawCell(ctx, cell, x, layout.tableY, panel.widths[index], panel.headerHeight, layout, true, false); x += panel.widths[index]; });
        page.rows.forEach(row => {
            x = layout.margin;
            row.cells.forEach((cell, index) => { drawCell(ctx, cell, x, row.y, panel.widths[index], row.height, layout, false, row.rowIndex % 2 === 1, row.markerHeight || 0); x += panel.widths[index]; });
            if (row.continuation) drawLines(ctx, ['Satır ' + (row.rowIndex + 1) + ' · devam'], layout.margin + layout.padding, row.y + 3, 7, 9, COLORS.muted, false);
        });
        page.notes.forEach(note => drawLines(ctx, note.lines, layout.margin, note.y, note.size, note.lineHeight, COLORS.muted, false));
        ctx.strokeStyle = COLORS.line; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(layout.margin, layout.pageHeight - layout.margin - 10); ctx.lineTo(layout.pageWidth - layout.margin, layout.pageHeight - layout.margin - 10); ctx.stroke();
        drawLines(ctx, ['FD YAZILIM'], layout.margin, layout.pageHeight - layout.margin, 8, 10, COLORS.muted, true);
        drawLines(ctx, ['Sayfa ' + globalPage + ' / ' + globalTotal], layout.pageWidth - layout.margin, layout.pageHeight - layout.margin, 8, 10, COLORS.muted, false, 'right');
        return canvas;
    }

    function filename(model, extension, override) {
        const name = text(override || model.title || 'Rapor').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_').replace(/[. ]+$/, '').slice(0, 150) || 'Rapor';
        return name.replace(/\.(?:pdf|xlsx|png)$/i, '') + '.' + extension;
    }

    async function pdf(input, options = {}) {
        const checkScope = () => { if (options.isCurrent && !options.isCurrent()) throw new Error('Çıktı işlemi oturum değiştiği için iptal edildi.'); };
        checkScope();
        const JsPDF = root.jspdf?.jsPDF || root.jsPDF;
        if (!JsPDF) throw new Error('PDF bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        await root.document.fonts?.ready;
        checkScope();
        const measure = browserMeasure(), sections = reports(input).map(model => plan(model, options, measure));
        const layout = sections[0], name = filename(layout.model, 'pdf', options.filename), pageCount = total(sections.map(section => section.pages.length));
        const modal = options.preview !== false && typeof root.fdCiktiOnizlemeAc === 'function' ? root.fdCiktiOnizlemeAc('pdf', name) : null;
        try {
            const document = new JsPDF({ orientation: layout.orientation, unit: 'pt', format: 'a4', compress: true });
            document.setProperties({ title: layout.model.title, subject: layout.model.subtitle, creator: 'FD YAZILIM' });
            let completed = 0;
            for (const section of sections) for (let index = 0; index < section.pages.length; index++) {
                checkScope();
                if (completed) document.addPage('a4', section.orientation);
                const canvas = drawPage(section, index, clamp(Number(options.scale) || 3, 2, 4), completed + 1, pageCount);
                document.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, section.pageWidth, section.pageHeight, undefined, 'FAST');
                canvas.width = 1; canvas.height = 1; completed++;
                const label = modal?.querySelector('[data-cikti-ad]'); if (label) label.textContent = name + ' · ' + completed + ' / ' + pageCount + ' hazırlanıyor';
                options.onProgress?.({ completed, total: pageCount });
                await new Promise(resolve => root.setTimeout(resolve, 0));
            }
            const blob = document.output('blob');
            checkScope();
            if (!blob || blob.size < 100) throw new Error('PDF dosyası oluşturulamadı.');
            if (options.preview !== false && typeof root.fdCiktiPdfOnizle === 'function') root.fdCiktiPdfOnizle(blob, name, modal);
            else if (modal) modal.remove();
            return { blob, filename: name, plan: sections.length === 1 ? layout : { sections, pages: sections.flatMap((section, sectionIndex) => section.pages.map(page => ({ ...page, sectionIndex }))) } };
        } catch (error) { modal?.remove(); throw error; }
    }

    async function imageBlob(input, options = {}) {
        await root.document.fonts?.ready;
        const model = normalize(input), fontSize = 13, lineHeight = 18, padding = 9, margin = 28, measure = browserMeasure();
        const widths = desiredWidths(model, fontSize, measure).map(width => width * 1.35);
        const minimumWidth = Number(options.width) || 1000, tableWidth = Math.max(minimumWidth - margin * 2, total(widths));
        if (total(widths) < tableWidth) { const extra = (tableWidth - total(widths)) / widths.length; widths.forEach((width, index) => widths[index] = width + extra); }
        const width = tableWidth + margin * 2, titleLines = wrap(model.title, tableWidth, measure, 23, true), subtitleLines = model.subtitle ? wrap(model.subtitle, tableWidth, measure, 12, false) : [];
        const subtitleY = margin + titleLines.length * 30 + 6, tableY = subtitleY + subtitleLines.length * 17 + 16;
        const header = model.columns.map((column, index) => ({ lines: wrap(column.label, widths[index] - padding * 2, measure, fontSize, true) }));
        const headerHeight = Math.max(...header.map(cell => cell.lines.length)) * lineHeight + padding * 2;
        let y = tableY + headerHeight;
        const rows = model.rows.map((row, rowIndex) => {
            const cells = row.map((value, index) => ({ lines: wrap(display(value, model.columns[index]), widths[index] - padding * 2, measure, fontSize, false), align: typeof value === 'number' || numberTypes.has(model.columns[index].type) ? 'right' : 'left' }));
            const height = Math.max(...cells.map(cell => cell.lines.length)) * lineHeight + padding * 2;
            const planned = { cells, rowIndex, y, height }; y += height; return planned;
        });
        const notes = model.footnotes.map(note => wrap(note, tableWidth, measure, 12, false));
        const height = y + (notes.length ? 20 + total(notes.map(lines => lines.length * 17 + 6)) : 0) + margin;
        const scale = Math.min(Number(options.scale) || 2, 32760 / width, 32760 / height, Math.sqrt(80000000 / (width * height)));
        if (scale < 1) throw new Error('Tablo tek görüntü için çok büyük. Daha az kayıt seçin veya PDF kullanın.');
        const { canvas, ctx } = canvasAt(width, height, scale), settings = { fontSize, lineHeight, padding };
        drawLines(ctx, titleLines, margin, margin, 23, 30, COLORS.accent, true);
        drawLines(ctx, subtitleLines, margin, subtitleY, 12, 17, COLORS.muted, false);
        let x = margin; header.forEach((cell, index) => { drawCell(ctx, cell, x, tableY, widths[index], headerHeight, settings, true, false); x += widths[index]; });
        rows.forEach(row => { x = margin; row.cells.forEach((cell, index) => { drawCell(ctx, cell, x, row.y, widths[index], row.height, settings, false, row.rowIndex % 2 === 1); x += widths[index]; }); });
        y += 20; notes.forEach(lines => { drawLines(ctx, lines, margin, y, 12, 17, COLORS.muted, false); y += lines.length * 17 + 6; });
        const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Görüntü hazırlanamadı.')), 'image/png'));
        const result = { blob, width: canvas.width, height: canvas.height }; canvas.width = 1; canvas.height = 1; return result;
    }

    async function image(input, options = {}) {
        async function build() {
            const models = reports(input);
            if (models.length === 1) return imageBlob(models[0], options);
            const images = [];
            try {
                for (const model of models) {
                    const result = await imageBlob(model, options), bitmap = await root.createImageBitmap(result.blob);
                    images.push({ ...result, bitmap });
                }
                const width = Math.max(...images.map(item => item.width)), height = total(images.map(item => item.height)) + (images.length - 1) * 32;
                if (width > 32760 || height > 32760 || width * height > 80000000) throw new Error('Tablolar tek görüntü için çok büyük. Daha az tablo seçin veya PDF kullanın.');
                const { canvas, ctx } = canvasAt(width, height, 1); let y = 0;
                for (const item of images) { ctx.drawImage(item.bitmap, 0, y); y += item.height + 32; }
                const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Görüntü hazırlanamadı.')), 'image/png'));
                canvas.width = 1; canvas.height = 1; return { blob, width, height };
            } finally { images.forEach(item => item.bitmap.close()); }
        }
        if (options.copy === false) return build();
        if (!root.navigator?.clipboard?.write || typeof root.ClipboardItem !== 'function') throw new Error('Bu cihazda panoya görüntü kopyalama desteklenmiyor.');
        // Start the clipboard write in the click gesture. Promised PNG data works in Safari too.
        let result;
        const pending = build().then(value => { if (options.isCurrent && !options.isCurrent()) throw new Error('Çıktı işlemi oturum değiştiği için iptal edildi.'); result = value; return value.blob; });
        pending.catch(() => {});
        await root.navigator.clipboard.write([new root.ClipboardItem({ 'image/png': pending })]);
        await pending; return result;
    }

    function excelValue(value, column) {
        if (value instanceof Date && Number.isFinite(value.getTime())) return new Date(value.getTime());
        if (column?.type === 'date' && typeof value === 'string') {
            let year, month, day, match;
            if ((match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/))) [, year, month, day] = match;
            else if ((match = value.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/))) [, day, month, year] = match;
            if (year) {
                const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
                if (date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)) return date;
            }
        }
        if (typeof value === 'number' && Number.isFinite(value) || typeof value === 'boolean') return value;
        return text(value);
    }

    function excelNumberFormat(column, value) {
        return value instanceof Date ? 'dd"."mm"."yyyy' : ['currency', 'money', 'amount'].includes(column.type) ? '#,##0.00' : column.type === 'integer' ? '#,##0' : '#,##0.##########';
    }

    function sheetName(title, names) {
        const base = text(title).replace(/[\\/\[\]*?:]/g, ' ').replace(/^'+|'+$/g, '').trim().slice(0, 31) || 'Liste';
        let name = base, suffix = 1;
        while (names.has(name.toLocaleLowerCase('tr-TR'))) { const tail = ' (' + (++suffix) + ')'; name = base.slice(0, 31 - tail.length) + tail; }
        names.add(name.toLocaleLowerCase('tr-TR')); return name;
    }

    function workbook(input) {
        const model = normalize(input), XLSX = root.XLSX;
        if (!XLSX?.utils) throw new Error('Excel bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        const rows = [model.columns.map(column => column.label), ...model.rows.map(row => row.map((value, index) => excelValue(value, model.columns[index])))];
        const sheet = XLSX.utils.aoa_to_sheet(rows);
        // Explicit cell types protect leading zeros, long identifiers and formula-looking text.
        rows.forEach((row, r) => row.forEach((value, c) => {
            const address = XLSX.utils.encode_cell({ r, c });
            if (value instanceof Date) sheet[address] = { t: 'n', v: (Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) - Date.UTC(1899, 11, 30)) / 86400000, z: 'dd"."mm"."yyyy' };
            else if (typeof value === 'number' && Number.isFinite(value)) sheet[address] = { t: 'n', v: value, z: excelNumberFormat(model.columns[c], value) };
            else if (typeof value === 'boolean') sheet[address] = { t: 'b', v: value };
            else sheet[address] = { t: 's', v: text(value), z: '@' };
        }));
        sheet['!cols'] = model.columns.map((column, index) => ({ wch: clamp(Math.max(column.label.length + 3, ...model.rows.map(row => Math.max(...text(row[index]).split('\n').map(line => line.length)) + 2)), 12, 65) }));
        sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: model.rows.length, c: model.columns.length - 1 } }) };
        sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
        sheet['!margins'] = { left: .3, right: .3, top: .4, bottom: .4, header: .2, footer: .2 };
        const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'Liste');
        if (model.title || model.subtitle || model.footnotes.length) {
            const info = XLSX.utils.aoa_to_sheet([['Rapor', model.title], ...(model.subtitle ? [['Açıklama', model.subtitle]] : []), ...model.footnotes.map(note => ['Not', note])]);
            info['!cols'] = [{ wch: 16 }, { wch: 85 }]; XLSX.utils.book_append_sheet(book, info, 'Rapor Bilgisi');
        }
        return { model, workbook: book };
    }

    async function styledExcel(input, options) {
        const models = reports(input).map(normalize), book = new root.ExcelJS.Workbook(), names = new Set();
        const measure = browserMeasure(); book.creator = 'FD YAZILIM'; book.title = models[0].title; book.subject = models[0].subtitle;
        models.forEach(model => {
            const ws = book.addWorksheet(sheetName(model.title, names), { properties: { defaultRowHeight: 20 }, views: [{ state: 'frozen', ySplit: 4, xSplit: model.columns.length > 12 ? 1 : 0, showGridLines: false }], pageSetup: { paperSize: 9, orientation: model.columns.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:4', margins: { left: .3, right: .3, top: .45, bottom: .45, header: .2, footer: .2 } } });
            const widths = model.columns.map((column, index) => {
                const lengths = model.rows.map(row => Math.max(...text(row[index]).split('\n').map(line => line.length))).sort((a, b) => a - b);
                const typical = lengths.length ? lengths[Math.floor((lengths.length - 1) * .85)] : 0;
                const identification = index === identifierIndex(model), exact = identification ? Math.max(0, ...lengths) : typical;
                return clamp(Math.max(column.label.length + 2, exact + 2), column.type === 'day' ? 7 : 12, identification ? 48 : 60);
            });
            ws.columns = widths.map(width => ({ width, style: { font: { name: 'Arial', size: 11, color: { argb: 'FF16283C' } }, alignment: { vertical: 'top', wrapText: true } } }));
            if (model.columns.length > 1) { ws.mergeCells(1, 1, 1, model.columns.length); ws.mergeCells(2, 1, 2, model.columns.length); }
            const title = ws.getCell('A1'); title.value = model.title; title.font = { name: 'Arial', size: 17, bold: true, color: { argb: 'FF315B72' } };
            const tablePixels = total(widths.map(width => width * 7)), titleLines = wrap(model.title, tablePixels - 16, measure, 23, true).length;
            ws.getRow(1).height = Math.max(30, titleLines * 21 + 8);
            const subtitle = ws.getCell('A2'); subtitle.value = model.subtitle; subtitle.font = { name: 'Arial', size: 10, color: { argb: 'FF64748B' } };
            ws.getRow(2).height = model.subtitle ? Math.max(22, wrap(model.subtitle, tablePixels - 16, measure, 13.3, false).length * 15 + 6) : 8;
            ws.getRow(3).height = 8;
            const header = ws.getRow(4); header.values = model.columns.map(column => column.label);
            header.height = Math.max(30, ...model.columns.map((column, index) => wrap(column.label, widths[index] * 7 - 14, measure, 14.7, true).length * 13.5 + 12));
            header.eachCell(cell => { cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF16283C' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F1F6' } }; cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }; });
            model.rows.forEach((values, rowIndex) => {
                const row = ws.getRow(rowIndex + 5); row.values = values.map((value, index) => excelValue(value, model.columns[index]));
                let lineCount = 1;
                row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
                    const column = model.columns[columnNumber - 1], value = cell.value;
                    cell.font = { name: 'Arial', size: 11, color: { argb: 'FF16283C' } }; cell.numFmt = typeof value === 'number' || value instanceof Date ? excelNumberFormat(column, value) : '@';
                    cell.alignment = { vertical: 'top', horizontal: typeof value === 'number' ? 'right' : 'left', wrapText: true };
                    if (rowIndex % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
                    lineCount = Math.max(lineCount, wrap(value instanceof Date ? value.toLocaleDateString('tr-TR') : display(value, column), widths[columnNumber - 1] * 7 - 14, measure, 14.7, false).length);
                });
                row.height = Math.min(409, Math.max(22, lineCount * 13.5 + 9));
            });
            for (let r = 4; r <= model.rows.length + 4; r++) ws.getRow(r).eachCell({ includeEmpty: true }, cell => cell.border = { top: { style: 'hair', color: { argb: 'FFD4DFE8' } }, bottom: { style: 'hair', color: { argb: 'FFD4DFE8' } }, left: { style: 'hair', color: { argb: 'FFD4DFE8' } }, right: { style: 'hair', color: { argb: 'FFD4DFE8' } } });
            ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: Math.max(4, model.rows.length + 4), column: model.columns.length } };
            let noteRow = model.rows.length + 6;
            model.footnotes.forEach(note => {
                if (model.columns.length > 1) ws.mergeCells(noteRow, 1, noteRow, model.columns.length);
                const cell = ws.getCell(noteRow, 1); cell.value = note; cell.font = { name: 'Arial', size: 10, color: { argb: 'FF64748B' } }; cell.alignment = { wrapText: true, vertical: 'top' };
                ws.getRow(noteRow).height = Math.min(409, Math.max(20, wrap(note, tablePixels - 16, measure, 13.3, false).length * 12.5 + 7)); noteRow++;
            });
            ws.pageSetup.printArea = 'A1:' + ws.getCell(noteRow - 1, model.columns.length).address;
            ws.headerFooter.oddHeader = '&L&"Arial"&9' + model.title.replace(/&/g, '&&').slice(0, 180);
            ws.headerFooter.oddFooter = '&L&"Arial"&8FD YAZILIM&R&"Arial"&8Sayfa &P / &N';
        });
        const name = filename(models[0], 'xlsx', options.filename), bytes = await book.xlsx.writeBuffer(), blob = new root.Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (options.isCurrent && !options.isCurrent()) throw new Error('Çıktı işlemi oturum değiştiği için iptal edildi.');
        if (options.preview !== false && typeof root.fdCiktiExcelJsOnizle === 'function') root.fdCiktiExcelJsOnizle(book, blob, name);
        if (options.download === true && typeof root.fdCiktiDogrudanKaydet === 'function') root.fdCiktiDogrudanKaydet(blob, name);
        return { blob, filename: name, workbook: book };
    }

    async function excel(input, options = {}) {
        if (options.isCurrent && !options.isCurrent()) throw new Error('Çıktı işlemi oturum değiştiği için iptal edildi.');
        if (root.ExcelJS?.Workbook && options.styled !== false) return styledExcel(input, options);
        const prepared = reports(input).map(model => workbook(model)), name = filename(prepared[0].model, 'xlsx', options.filename);
        const book = prepared.length === 1 ? prepared[0].workbook : root.XLSX.utils.book_new(), names = new Set();
        if (prepared.length > 1) prepared.forEach((item, index) => {
            let base = item.model.title.replace(/[\\/\[\]*?:]/g, ' ').trim().slice(0, 31) || ('Liste ' + (index + 1));
            let sheetName = base, suffix = 1;
            while (names.has(sheetName.toLocaleLowerCase('tr-TR'))) { const tail = ' (' + (++suffix) + ')'; sheetName = base.slice(0, 31 - tail.length) + tail; }
            names.add(sheetName.toLocaleLowerCase('tr-TR')); root.XLSX.utils.book_append_sheet(book, item.workbook.Sheets.Liste, sheetName);
        });
        if (prepared.length > 1) {
            let infoName = 'Rapor Bilgisi'; while (names.has(infoName.toLocaleLowerCase('tr-TR'))) infoName = '_' + infoName;
            const info = root.XLSX.utils.aoa_to_sheet([['Rapor', 'Açıklama'], ...prepared.flatMap(item => [[item.model.title, item.model.subtitle], ...item.model.footnotes.map(note => ['Not', note])])]);
            info['!cols'] = [{ wch: 38 }, { wch: 85 }]; root.XLSX.utils.book_append_sheet(book, info, infoName.slice(0, 31));
        }
        const bytes = root.XLSX.write(book, { bookType: 'xlsx', type: 'array', cellDates: true });
        const blob = new root.Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (options.preview !== false && typeof root.fdCiktiExcelOnizle === 'function') root.fdCiktiExcelOnizle(book, name);
        if (options.download === true) {
            if (typeof root.fdCiktiDogrudanKaydet === 'function') root.fdCiktiDogrudanKaydet(blob, name);
            else {
                const url = root.URL.createObjectURL(blob), anchor = root.document.createElement('a'); anchor.href = url; anchor.download = name;
                root.document.body.appendChild(anchor); anchor.click(); anchor.remove(); root.setTimeout(() => root.URL.revokeObjectURL(url), 30000);
            }
        }
        return { blob, filename: name, workbook: book };
    }

    root.fdOutputRenderers = { plan, pdf, image, excel, workbook, wrap, display, drawPage, browserMeasure, buildPdf: pdf, copyImage: image, buildExcel: excel };
})(typeof window !== 'undefined' ? window : globalThis);


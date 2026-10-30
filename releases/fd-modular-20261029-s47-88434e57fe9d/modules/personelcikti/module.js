window.FDModules.define('personelcikti',function(){
let fdOutDisposed=false,fdOutGeneration=0,fdOutActive=false;const fdOutInitial=fdOutContext();
function fdOutContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdOutValid(){return !fdOutDisposed&&Boolean(activeUser)&&!isPersonelUser()&&anaMenuModulErisimiVar('personel')&&fdOutInitial===fdOutContext()}
function fdOutAssert(){if(!fdOutValid())throw Error('Oturum veya yetki değişti; personel çıktısını yeniden açın.')}
function fdOutCurrent(ticket){return fdOutValid()&&ticket===fdOutGeneration}
let personelExportType = 'excel';
let personelSeciliExportAlanlari = new Set(['ad']);
function personelExportSecimOzetiniGuncelle() {
        const sayac = document.getElementById('personelExportSecimSayisi');
        if (sayac) sayac.textContent = `${personelSeciliExportAlanlari.size} alan seçildi`;
    }
function personelExportAlanSecimiDegisti(input) {
        const key = String(input?.dataset?.exportKey || '');
        if (!key) return;
        if (input.checked) personelSeciliExportAlanlari.add(key);
        else personelSeciliExportAlanlari.delete(key);
        const label = input.closest('label');
        if (label) {
            label.style.borderColor = input.checked ? '#38bdf8' : '#dce8f1';
            label.style.background = input.checked ? '#f0f9ff' : '#fff';
        }
        personelExportSecimOzetiniGuncelle();
    }
function personelExportAlanlariniDegistir(hepsini) {
        personelSeciliExportAlanlari = new Set();
        document.querySelectorAll('#personelExportFields input[type="checkbox"]').forEach(input => {
            input.checked = Boolean(hepsini);
            if (input.checked) personelSeciliExportAlanlari.add(String(input.dataset.exportKey || ''));
            const label = input.closest('label');
            if (label) {
                label.style.borderColor = input.checked ? '#38bdf8' : '#dce8f1';
                label.style.background = input.checked ? '#f0f9ff' : '#fff';
            }
        });
        personelSeciliExportAlanlari.delete('');
        personelExportSecimOzetiniGuncelle();
    }
function openPersonelExportModal(type) {
fdOutActive=true;fdOutGeneration++;
        personelExportType = type;
        personelSeciliExportAlanlari = new Set(['ad']);
        const fields = document.getElementById('personelExportFields');
        fields.innerHTML = PERSONEL_EXPORT_FIELDS.map((field, index) => {
            const checked = field.key === 'ad';
            return `<label for="personelExportField_${index}" class="remember-login" style="margin:0;padding:9px;border:1px solid ${checked ? '#38bdf8' : '#dce8f1'};border-radius:8px;background:${checked ? '#f0f9ff' : '#fff'};"><input id="personelExportField_${index}" type="checkbox" data-export-key="${field.key}" ${checked ? 'checked' : ''} onchange="personelExportAlanSecimiDegisti(this)"> ${field.label}</label>`;
        }).join('');
        personelExportSecimOzetiniGuncelle();
        document.getElementById('btnConfirmPersonelExport').textContent = type === 'pdf' ? 'PDF Oluştur' : 'Excel Oluştur';
        document.getElementById('btnConfirmPersonelExport').onclick = exportSelectedPersonelFields;
        document.getElementById('modalPersonelExport').style.display = 'flex';
    }
function closePersonelExportModal() {
fdOutActive=false;
        document.getElementById('modalPersonelExport').style.display = 'none';
    }
function exportSelectedPersonelFields() {
if(!fdOutValid()||!fdOutActive)return false;const fdOutTicket=++fdOutGeneration;
        const selected = [...personelSeciliExportAlanlari];
        if (!selected.length) { alert('Lütfen en az bir alan seçin.'); return; }
        const fields = selected.map(key => PERSONEL_EXPORT_FIELDS.find(field => field.key === key)).filter(Boolean);
        const records = filtrelenmisAktifPersonelleriGetir();
        if (!records.length) { alert('Seçili filtrelere uygun dışa aktarılacak personel bulunamadı.'); return; }
        const rows = records.map(person => fields.map(field => {
            const value = field.key === 'mezuniyetYili' ? mezuniyetYiliniDuzelt(person.mezuniyetYili || person.mezuniyetTarihi) : field.key === 'ucret' && person.fdUcretDonemleri?.length ? paraFormatla(personelGunlukUcretiniGetir(person)) : person[field.key];
            if (field.date) return value ? tarihFormati(value) : '';
            if (field.key === 'engelli' || field.key === 'emekli') return personelEvetMi(value) ? 'Evet' : 'Hayır';
            return value ?? '';
        }));
        closePersonelExportModal();

        if (personelExportType === 'excel') {
            const worksheet = XLSX.utils.aoa_to_sheet([fields.map(field => field.label), ...rows]);
            worksheet['!cols'] = fields.map((field, index) => ({ wch: Math.min(45, Math.max(field.label.length + 2, ...rows.map(row => String(row[index] ?? '').length + 2))) }));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Aktif Personeller');
            XLSX.writeFile(workbook, 'Aktif_Personel_Listesi.xlsx');
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<table><thead><tr>${fields.map(field => `<th>${escapeDashboardText(field.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${escapeDashboardText(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        return window.fdTabloPdfOnizle?.(wrapper.querySelector('table'),'AKTİF PERSONEL LİSTESİ','Aktif_Personel_Listesi.pdf',{fdIsCurrent:()=>fdOutCurrent(fdOutTicket),yon:'landscape',format:fields.length>8?'a3':'a4',altBaslik:'Aktif Personel Listesi'});
    }
function exportPersonelToPDF() {
const fdOutTicket=++fdOutGeneration;
        const table = document.getElementById('tabloAktifPersonel');
        return window.fdTabloPdfOnizle?.(table,'AKTİF PERSONEL LİSTESİ','Aktif_Personel_Listesi.pdf',{fdIsCurrent:()=>fdOutCurrent(fdOutTicket),yon:'landscape',format:'a3',altBaslik:'Aktif Personel Listesi'});
    }
function exportPersonelToExcel() {
        const originalTable = document.getElementById('tabloAktifPersonel');
        const cloneTable = originalTable.cloneNode(true);
        
        const rows = cloneTable.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.cells.length > 11) row.deleteCell(11);
            if (row.cells.length > 1) row.deleteCell(1);
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(cloneTable), "Aktif Personeller");
        XLSX.writeFile(wb, "Aktif_Personel_Listesi.xlsx");
    }
return{open(action,type){fdOutAssert();if(!action){const intent=window.fdPersonelCiktiIstegi?.();if(!intent)return false;[action,type]=intent}if(action==='select')return openPersonelExportModal(type);if(action==='pdf')return exportPersonelToPDF();if(action==='excel')return exportPersonelToExcel();return false},api:{personelExportSecimOzetiniGuncelle(...args){fdOutAssert();return personelExportSecimOzetiniGuncelle(...args)},personelExportAlanSecimiDegisti(...args){fdOutAssert();return personelExportAlanSecimiDegisti(...args)},personelExportAlanlariniDegistir(...args){fdOutAssert();return personelExportAlanlariniDegistir(...args)},openPersonelExportModal(...args){fdOutAssert();return openPersonelExportModal(...args)},closePersonelExportModal(){fdOutAssert();fdOutGeneration++;return closePersonelExportModal()},exportSelectedPersonelFields(...args){fdOutAssert();return exportSelectedPersonelFields(...args)},exportPersonelToPDF(...args){fdOutAssert();return exportPersonelToPDF(...args)},exportPersonelToExcel(...args){fdOutAssert();return exportPersonelToExcel(...args)}},dispose(){fdOutDisposed=true;fdOutGeneration++;fdOutActive=false;personelSeciliExportAlanlari.clear();const modal=document.getElementById('modalPersonelExport');if(modal){modal.style.display='none';modal.querySelector('#personelExportFields')?.replaceChildren();const button=modal.querySelector('#btnConfirmPersonelExport');if(button)button.onclick=null}}};
});

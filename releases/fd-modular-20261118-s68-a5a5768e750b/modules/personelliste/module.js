window.FDModules.define('personelliste',function(){
let disposed=false;const initial=context(),ownedStyles=[];
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)&&anaMenuModulErisimiVar('personel')&&initial===context()}
function assertCurrent(){if(!current())throw Error('Oturum veya yetki değişti; personel listesini yeniden açın.')}
function navlariKur(){window.fdPersonelNavlariKur?.()}
function stylesInOriginalOrder(){const verified=document.querySelector('style[data-fd-module-style="personelliste"]');if(!verified)throw Error('Personel liste stili yüklenemedi.');verified.media='not all';for(const part of verified.textContent.split('/* fd-personnel-style-slot:').slice(1)){const end=part.indexOf(' */'),name=part.slice(0,end),anchor=document.querySelector('[data-fd-personnel-style-slot="'+name+'"]');if(!anchor)throw Error('Personel stil sırası bulunamadı.');const style=document.createElement('style');style.dataset.fdPersonnelListStyle=name;style.textContent=part.slice(end+3);anchor.after(style);ownedStyles.push(style)}}
// Historical periods share the real employee identity without changing current employment.
let departedDialog=null,departedInput=null,departedTicket=0,departedSaving=false;
function periodJson(value){return JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v)}
function periodKey(p){return [String(p.id),p.girisTarihi,p.cikisTarihi,p.sube].join('|')}
function departedPeriods(){const rows=[];for(const p of personeller.filter(aktifSirketeAit)){const seen=new Set(),ranges=new Set();for(const d of Array.isArray(p.fdCalismaDonemleri)?p.fdCalismaDonemleri:[]){if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d.girisTarihi)||!/^\d{4}-\d{2}-\d{2}$/.test(d.cikisTarihi)||d.girisTarihi>d.cikisTarihi)continue;const r={...p,ad:d.ad,sube:d.sube,girisTarihi:d.girisTarihi,cikisTarihi:d.cikisTarihi,sgkNo:d.sgkNo,gorev:'',telefon:'',fdHistoricalPeriod:true};const key=periodKey(r);if(seen.has(key))continue;seen.add(key);ranges.add(r.girisTarihi+'|'+r.cikisTarihi);rows.push(r)}if(p.cikisTarihi&&p.cikisTarihi!=='null'&&!ranges.has(p.girisTarihi+'|'+p.cikisTarihi))rows.push(p)}return rows}
function filteredDepartedPeriods(){
 const value=id=>document.getElementById(id)?.value||'',query=value('fAyrilanArama').toLocaleLowerCase('tr-TR'),branch=value('fAyrilanSube'),year=value('fAyrilanCikisYili');
 return departedPeriods().filter(p=>(!isPersonelUser()||String(p.id)===String(activeUser.tcNo))&&(!query||String(p.ad||'').toLocaleLowerCase('tr-TR').includes(query)||String(p.id).includes(query))&&(!branch||p.sube===branch)&&(!year||p.cikisTarihi.startsWith(year))&&personelDurumFiltresineUyar(p,'engelli',value('fAyrilanEngelli'))&&personelDurumFiltresineUyar(p,'emekli',value('fAyrilanEmekli'))).sort((a,b)=>String(a.sube||'Merkez').localeCompare(String(b.sube||'Merkez'),'tr')||String(a.ad||'').localeCompare(String(b.ad||''),'tr')||a.girisTarihi.localeCompare(b.girisTarihi));
}
function fdPersonelOutputContext(){
 assertCurrent();const tab=document.getElementById('p-tab-ayrilan');if(!tab||!tab.classList.contains('active'))return null;
 const fields=[{key:'ad',label:'Ad Soyad'},{key:'id',label:'T.C. No'},{key:'sube',label:'Şube'},{key:'girisTarihi',label:'İşe Giriş Tarihi',date:true},{key:'cikisTarihi',label:'İşten Çıkış Tarihi',date:true},{key:'sgkNo',label:'SGK Numarası'}];
 const branch=document.getElementById('fAyrilanSube').value||'Tüm Şubeler',year=document.getElementById('fAyrilanCikisYili').value||'Tüm Ayrılış Yılları';
 return {title:'İşten Ayrılan Personel Çalışma Dönemleri',fields,records:filteredDepartedPeriods(),subtitle:branch+' · Ayrılış yılı: '+year};
}
function periodFilters(rows){for(const [id,values,label] of [['fAyrilanSube',[...new Set(rows.map(p=>p.sube).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr')),'Tüm Şubeler'],['fAyrilanCikisYili',[...new Set(rows.map(p=>p.cikisTarihi.slice(0,4)))].sort().reverse(),'Tüm Ayrılış Yılları']]){const el=document.getElementById(id),old=el.value;el.replaceChildren(new Option(label,''),...values.map(v=>new Option(v,v)));el.value=values.includes(old)?old:''}}
function closeDepartedDialog(){if(departedSaving)return;departedTicket++;departedDialog?.remove();departedDialog=null;departedInput?.remove();departedInput=null}
function departedModal(title){closeDepartedDialog();const d=document.createElement('dialog');d.id='fdDepartedDialog';d.className='fd-departed-dialog';const h=document.createElement('h3');h.textContent=title;d.append(h);d.addEventListener('cancel',e=>{e.preventDefault();closeDepartedDialog()});document.body.append(d);departedDialog=d;return d}
function periodDetail(p){assertCurrent();const d=departedModal('Geçmiş çalışma dönemi'),grid=document.createElement('dl');grid.className='fd-departed-fields';for(const [label,value]of [['Ad Soyad',p.ad],['T.C. Kimlik No',p.id],['Şube',p.sube],['İşe Giriş Tarihi',tarihFormati(p.girisTarihi)],['İşten Çıkış Tarihi',tarihFormati(p.cikisTarihi)],['SGK Numarası',p.sgkNo]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value||'-';grid.append(dt,dd)}const close=document.createElement('button');close.className='btn-modern btn-detail-modern';close.textContent='Kapat';close.onclick=closeDepartedDialog;d.append(grid,close);d.showModal()}
function departedWriteAllowed(){assertCurrent();if(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel'))throw Error('Personel aktarımı için yazma yetkisi gerekir.')}
function departedImportCurrent(ticket){departedWriteAllowed();if(ticket!==departedTicket)throw Error('Aktarım oturumu değişti.')}
function excelPeriodDate(v){let s;if(v instanceof Date&&!isNaN(v)){s=[v.getFullYear(),String(v.getMonth()+1).padStart(2,'0'),String(v.getDate()).padStart(2,'0')].join('-')}else if(typeof v==='number'){const d=XLSX.SSF.parse_date_code(v);if(d)s=[d.y,String(d.m).padStart(2,'0'),String(d.d).padStart(2,'0')].join('-')}else{const m=String(v||'').trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);s=m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):String(v||'').trim()}if(!/^\d{4}-\d{2}-\d{2}$/.test(s||'')||isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('Geçersiz tarih');return s}
function parseDepartedWorkbook(bytes){const wb=XLSX.read(bytes,{type:'array',cellDates:true}),sheet=wb.Sheets[wb.SheetNames[0]],raw=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true,defval:''}),norm=s=>String(s).trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]/g,''),headers=(raw[0]||[]).map(norm),wanted=['adi','soyadi','giristarihi','cikistarihi','sube','tcnumarasi','sgknumarasi'];if(wanted.some(h=>!headers.includes(h)))throw Error('Adı, Soyadı, Giriş Tarihi, Çıkış Tarihi, Şube, TC Numarası ve SGK Numarası sütunları gerekir.');const rows=[],seen=new Set();raw.slice(1).forEach((r,i)=>{if(!r.some(v=>String(v??'').trim()))return;try{const get=h=>r[headers.indexOf(h)],id=String(get('tcnumarasi')).trim(),ad=[get('adi'),get('soyadi')].map(s=>String(s||'').trim()).filter(Boolean).join(' '),sube=String(get('sube')||'').trim(),girisTarihi=excelPeriodDate(get('giristarihi')),cikisTarihi=excelPeriodDate(get('cikistarihi'));if(!/^\d{11}$/.test(id)||!ad||!sube||girisTarihi>cikisTarihi)throw Error('T.C., ad, şube veya tarih sırası geçersiz.');const p={id,ad,sube,girisTarihi,cikisTarihi,sgkNo:String(get('sgknumarasi')||'').trim()},key=periodKey(p);if(!seen.has(key)){seen.add(key);rows.push(p)}}catch(e){throw Error('Excel satır '+(i+2)+': '+e.message)}});if(!rows.length)throw Error('Aktarılacak çalışma dönemi yok.');return rows}
async function readDepartedCurrent(ids,ticket){const all=[];for(let i=0;i<ids.length;i+=100){departedImportCurrent(ticket);const {data,error}=await supabaseClient.from('portal_records').select('id,legacy_id,data,record_year,employee_legacy_id,updated_at').eq('company_id',activeUser.sirketId).eq('module','personeller').in('legacy_id',ids.slice(i,i+100));departedImportCurrent(ticket);if(error)throw error;all.push(...data)}return new Map(all.map(r=>[r.legacy_id,r]))}
function periodImportPlan(rows,current){const groups=new Map();for(const r of rows){if(!groups.has(r.id))groups.set(r.id,[]);groups.get(r.id).push(r)}const plan=[];for(const [id,periods]of groups){const old=current.get(id),local=personeller.find(p=>String(p.id)===id&&aktifSirketeAit(p));if(local&&(!old||periodJson(local)!==periodJson(old.data)))throw Error('Kaydedilmemiş veya güncel olmayan personel bilgisi var. Önce personel ekranını yenileyin.');const latest=periods.slice().sort((a,b)=>b.cikisTarihi.localeCompare(a.cikisTarihi)||b.girisTarihi.localeCompare(a.girisTarihi))[0],base=old?structuredClone(old.data):{...latest,sirketId:activeUser.sirketId},history=Array.isArray(base.fdCalismaDonemleri)?structuredClone(base.fdCalismaDonemleri):[],known=new Set(history.map(d=>periodKey({...d,id})));for(const p of periods)if(!known.has(periodKey(p))){history.push({ad:p.ad,sube:p.sube,girisTarihi:p.girisTarihi,cikisTarihi:p.cikisTarihi,sgkNo:p.sgkNo});known.add(periodKey(p))}if(old&&history.length===(old.data.fdCalismaDonemleri||[]).length)continue;plan.push({id,old,localSnapshot:local?structuredClone(local):null,data:{...base,fdCalismaDonemleri:history}})}return plan}
async function fdSaveDepartedPeriods(rows,plan,ticket,button,message){departedImportCurrent(ticket);if(departedSaving)return;departedSaving=true;button.disabled=true;let saved=0;try{const ids=[...new Set(rows.map(r=>r.id))],fresh=await readDepartedCurrent(ids,ticket);for(const p of plan){const now=fresh.get(p.id);if(periodJson(now||null)!==periodJson(p.old||null))throw Error('Personel kayıtları değişmiş. Excel’i yeniden açıp önizlemeyi yenileyin.')}for(const p of plan){departedImportCurrent(ticket);const local=personeller.find(v=>String(v.id)===p.id&&aktifSirketeAit(v));if(periodJson(local||null)!==periodJson(p.localSnapshot))throw Error('Önizlemeden sonra personel bilgisi değişti; aktarımı yeniden açın.');message.textContent=(saved+1)+' / '+plan.length+' personel kaydediliyor…';let query;if(p.old){query=supabaseClient.from('portal_records').update({data:p.data}).eq('id',p.old.id).eq('company_id',activeUser.sirketId).eq('module','personeller').eq('updated_at',p.old.updated_at).select('id,legacy_id,data,updated_at')}else{query=supabaseClient.from('portal_records').upsert({company_id:activeUser.sirketId,module:'personeller',legacy_id:p.id,employee_legacy_id:p.id,record_year:new Date().getFullYear(),data:p.data},{onConflict:'company_id,module,legacy_id',ignoreDuplicates:true}).select('id,legacy_id,data,updated_at')}const {data,error}=await query;departedImportCurrent(ticket);if(error)throw error;if(data?.length!==1||periodJson(data[0].data.fdCalismaDonemleri)!==periodJson(p.data.fdCalismaDonemleri))throw Error('Kayıt doğrulanamadı; mevcut değişiklikler korunarak aktarım durduruldu.');if(p.old){for(const k of Object.keys(p.old.data))if(k!=='fdCalismaDonemleri'&&periodJson(data[0].data[k])!==periodJson(p.old.data[k]))throw Error('Mevcut personel bilgisi değişti; aktarım durduruldu.')}const index=personeller.findIndex(v=>String(v.id)===p.id&&aktifSirketeAit(v));if(index>=0){const local=personeller[index];personeller[index]=periodJson(local)===periodJson(p.localSnapshot)?data[0].data:{...local,fdCalismaDonemleri:data[0].data.fdCalismaDonemleri}}else personeller.push(data[0].data);if(typeof veriSonKayitGoruntuleri!=='undefined'){const acknowledged=JSON.parse(veriSonKayitGoruntuleri.get('personeller')||'[]'),at=acknowledged.findIndex(v=>String(v.id)===p.id);if(at>=0)acknowledged[at]=data[0].data;else acknowledged.push(data[0].data);veriSonKayitGoruntuleri.set('personeller',JSON.stringify(acknowledged));}saved++}const readback=await readDepartedCurrent(ids,ticket);for(const p of rows){const found=readback.get(p.id);if(!(found?.data.fdCalismaDonemleri||[]).some(d=>periodJson(d)===periodJson({ad:p.ad,sube:p.sube,girisTarihi:p.girisTarihi,cikisTarihi:p.cikisTarihi,sgkNo:p.sgkNo})))throw Error('Çalışma dönemi doğrulanamadı.')}message.textContent=rows.length+' çalışma dönemi kaydedildi. Aktif personel kayıtları korundu.';button.textContent='Aktarım tamamlandı';const close=document.createElement('button');close.type='button';close.className='btn-modern btn-detail-modern';close.textContent='Listeye dön';close.onclick=closeDepartedDialog;departedDialog.append(close);filtreDropdownlariDoldur();renderPersonelTables();listeleriDuzenle();window.fdListPages?.flush();}catch(e){message.textContent=saved+' personel kaydedildi. '+e.message+' Aynı dosya yeniden aktarılırsa kayıtlar tekrarlanmaz.';button.textContent='Aktarım durduruldu';}finally{departedSaving=false}}
async function departedFileSelected(file){departedWriteAllowed();if(!file)return;const d=departedModal('Ayrılan personel dönemlerini Excel’den aktar'),ticket=departedTicket,message=document.createElement('p');message.setAttribute('role','status');message.textContent='Excel okunuyor…';d.append(message);d.showModal();try{const rows=parseDepartedWorkbook(await file.arrayBuffer());departedImportCurrent(ticket);const current=await readDepartedCurrent([...new Set(rows.map(r=>r.id))],ticket),plan=periodImportPlan(rows,current);message.textContent=rows.length+' çalışma dönemi · '+new Set(rows.map(r=>r.id)).size+' kişi. Her dönem ayrı satırda görünecek. Mevcut personel bilgileri ve aktif çalışma kayıtları korunur.';const wrap=document.createElement('div');wrap.className='fd-departed-preview';const table=document.createElement('table'),head=table.createTHead().insertRow();for(const label of ['Ad Soyad','T.C. No','Şube','Giriş','Çıkış','SGK No']){const th=document.createElement('th');th.textContent=label;head.append(th)}const body=table.createTBody();for(const p of rows){const tr=body.insertRow();for(const value of [p.ad,p.id,p.sube,tarihFormati(p.girisTarihi),tarihFormati(p.cikisTarihi),p.sgkNo])tr.insertCell().textContent=value}wrap.append(table);const cancel=document.createElement('button'),save=document.createElement('button');cancel.type=save.type='button';cancel.className='btn-modern btn-detail-modern';cancel.textContent='İptal';cancel.onclick=closeDepartedDialog;save.className='btn-modern btn-edit-modern';save.textContent=plan.length?rows.length+' Dönemi Aktar':'Tüm dönemler zaten kayıtlı';save.disabled=!plan.length;save.onclick=()=>fdSaveDepartedPeriods(rows,plan,ticket,save,message);d.append(wrap,cancel,save)}catch(e){if(current()){message.textContent=e.message;const close=document.createElement('button');close.textContent='Kapat';close.onclick=closeDepartedDialog;d.append(close)}}}
function importDepartedPeriods(){departedWriteAllowed();if(departedSaving)return;closeDepartedDialog();const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xls';input.hidden=true;input.id='fdDepartedExcelFile';input.addEventListener('change',()=>departedFileSelected(input.files?.[0]));document.body.append(input);departedInput=input;input.click()}

function openPersonelApp() {
        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        document.getElementById('appHub').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        document.getElementById('personelApp').style.display = 'block';
        workspaceSekmesiniAktifEt('personel');
        hideGlobalOverlay();
        return window.fdPersonelListeyiHazirla();
    }
function switchPersonelTab(tabId, btn) {
        document.querySelectorAll('#personelApp .tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#personelApp .nav-btn').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#personelApp .module-subnav button').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (btn) btn.classList.add('active');
        document.querySelectorAll('#personelApp .module-subnav button').forEach(el => { if (el.getAttribute('onclick')?.includes(tabId)) el.classList.add('active'); });
    }
function renderPersonelOzetleri() {
        const generalTarget = document.getElementById('personelGenelOzet');
        const branchTarget = document.getElementById('personelSubeOzet');
        if (!generalTarget || !branchTarget) return;

        const active = personeller.filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null'));
        const genderCount = (people, gender) => people.filter(p => String(p.cinsiyet || '').trim().toLocaleLowerCase('tr-TR') === gender).length;
        const categoryPeople = (people, field) => people.filter(p => personelEvetMi(p[field]));
        const summarize = people => ({
            toplam: people.length,
            kadin: people.filter(p => String(p.cinsiyet || '').toLocaleLowerCase('tr-TR') === 'kadın').length,
            erkek: people.filter(p => String(p.cinsiyet || '').toLocaleLowerCase('tr-TR') === 'erkek').length,
            engelli: categoryPeople(people, 'engelli').length,
            emekli: categoryPeople(people, 'emekli').length,
            engelliErkek: genderCount(categoryPeople(people, 'engelli'), 'erkek'),
            engelliKadin: genderCount(categoryPeople(people, 'engelli'), 'kadın'),
            emekliErkek: genderCount(categoryPeople(people, 'emekli'), 'erkek'),
            emekliKadin: genderCount(categoryPeople(people, 'emekli'), 'kadın')
        });
        const metrics = summary => [
            ['Toplam', summary.toplam], ['Kadın', summary.kadin], ['Erkek', summary.erkek], ['Engelli', summary.engelli], ['Emekli', summary.emekli]
        ];
        const renderTargets = (people, generalEl, branchEl, emptyText, unique=false) => {
            const summaryFor = list => summarize(unique?[...new Map(list.map(p=>[String(p.id),p])).values()]:list);
            if (!generalEl || !branchEl) return;
            generalEl.innerHTML = metrics(summaryFor(people)).map(([label, value]) => `<article class="personel-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
            const branches = people.reduce((map, person) => {
                const branch = String(person.sube || 'Merkez').trim() || 'Merkez';
                (map[branch] ||= []).push(person);
                return map;
            }, Object.create(null));
            const branchNames = Object.keys(branches).sort((a, b) => a.localeCompare(b, 'tr'));
            branchEl.innerHTML = branchNames.length ? branchNames.map(branch => {
                const summary = summaryFor(branches[branch]);
                return `<article class="branch-summary-card"><h4>${escapeDashboardText(branch)}</h4><div class="branch-summary-metrics">${metrics(summary).map(([label, value]) => {
                    const field = label === 'Engelli' ? 'engelli' : label === 'Emekli' ? 'emekli' : '';
                    const breakdown = field ? `<small class="branch-summary-gender">Erkek: ${summary[field + 'Erkek']}<br>Bayan: ${summary[field + 'Kadin']}</small>` : '';
                    return `<span><b>${value}</b>${breakdown}${label}</span>`;
                }).join('')}</div></article>`;
            }).join('') : `<div class="dashboard-empty">${emptyText}</div>`;
        };
        renderTargets(active, generalTarget, branchTarget, 'Kayıtlı aktif personel bulunmuyor.');
        const departed = departedPeriods();
        renderTargets(departed, document.getElementById('ayrilanGenelOzet'), document.getElementById('ayrilanSubeOzet'), 'Kayıtlı ayrılan personel bulunmuyor.',true);
    }
function renderPersonelTables() {
        renderPersonelOzetleri();
        const historicalRows=departedPeriods();periodFilters(historicalRows);
        const tAktif = document.querySelector('#tabloAktifPersonel tbody');
        const tAyrilan = document.querySelector('#tabloAyrilanPersonel tbody');
        tAktif.innerHTML = ''; tAyrilan.innerHTML = '';
        let aCount = 0, cCount = 0;const departedPeople=new Set();
        const aktifSatirlar = [];
        const ayrilanSatirlar = [];

        const isAdmin = isManagerUser();

        const ayArama = document.getElementById('fAyrilanArama').value.toLocaleLowerCase('tr-TR');
        const aySube = document.getElementById('fAyrilanSube').value;
        const ayCikisYili = document.getElementById('fAyrilanCikisYili').value;
        const ayEngelli = document.getElementById('fAyrilanEngelli')?.value || '';
        const ayEmekli = document.getElementById('fAyrilanEmekli')?.value || '';

        const aktifListe = filtrelenmisAktifPersonelleriGetir();

        // Values from records are text; record IDs never become JavaScript source.
        const personelSatiri = (p, number, departed) => {
            const row = document.createElement('tr');
            const textCell = value => { const cell = row.insertCell(); cell.textContent = String(value); return cell; };
            const personId = String(p.id);
            textCell(number);
            const photoCell = row.insertCell();
            photoCell.innerHTML = window.fdPersonnelPhoto.html(p);
            const link = document.createElement('span');
            link.className = 'tc-link';
            link.textContent = personId;
            link.addEventListener('click', () => p.fdHistoricalPeriod?periodDetail(p):openPersonelDetayModal(personId));
            row.insertCell().append(link);
            textCell(p.ad);
            const branch = p.sube || 'Merkez';
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.style.cssText = getSubeBadgeStyle(branch);
            badge.textContent = String(branch);
            row.insertCell().append(badge);
            textCell(departed?(p.sgkNo||'-'):(p.gorev || '-'));
            textCell(p.telefon || '-');
            textCell(tarihFormati(p.girisTarihi));
            if (departed) {
                const exit = document.createElement('strong');
                exit.style.color = '#ef4444';
                exit.textContent = String(tarihFormati(p.cikisTarihi));
                row.insertCell().append(exit);
            }
            const actions = document.createElement('div');
            actions.className = 'action-btns';
            const button = (className, label, action) => {
                const node = document.createElement('button');
                node.type = 'button';
                node.className = 'btn-modern ' + className;
                node.textContent = label;
                node.addEventListener('click', action);
                actions.append(node);
            };
            if(p.fdHistoricalPeriod)button('btn-detail-modern','Dönem bilgisi',()=>periodDetail(p));
            else if (isPersonelUser()) button('btn-detail-modern', '📋 Detay', () => openPersonelDetayModal(personId));
            else button('btn-edit-modern', '✏️ Düzenle', () => personelDuzenle(personId));
            if (isAdmin&&!p.fdHistoricalPeriod) button('btn-del-modern', '🗑️ Sil', () => personelSil(personId));
            row.insertCell().append(actions);
            return row;
        };
        aktifListe.forEach(p => { aCount++; aktifSatirlar.push(personelSatiri(p, aCount, false)); });

        filteredDepartedPeriods().forEach((p) => {
            cCount++;departedPeople.add(String(p.id));
            ayrilanSatirlar.push(personelSatiri(p, cCount, true));
        });

        const activeRows = document.createDocumentFragment(), departedRows = document.createDocumentFragment();
        aktifSatirlar.forEach(row => activeRows.append(row));
        ayrilanSatirlar.forEach(row => departedRows.append(row));
        tAktif.replaceChildren(activeRows);
        tAyrilan.replaceChildren(departedRows);
        document.getElementById('badgeAktifSayisi').innerText = `${aCount} Kişi`;
        document.getElementById('badgeAyrilanSayisi').innerText = historicalRows.some(p=>p.fdHistoricalPeriod)?`${cCount} Dönem · ${departedPeople.size} Kişi`:`${cCount} Kişi`;
    }
function listeleriDuzenle(){
        for(const id of ['tabloAktifPersonel','tabloAyrilanPersonel']){const table=document.getElementById(id);if(!table)continue;const labels=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());table.querySelectorAll('tbody tr').forEach(tr=>{if(tr.children.length!==labels.length)return;[...tr.children].forEach((td,i)=>td.dataset.fdLabel=labels[i]);});table.querySelectorAll('.tc-link').forEach(link=>{link.setAttribute('role','button');link.tabIndex=0;if(!link.dataset.fdKeyBound){link.dataset.fdKeyBound='1';link.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();link.click();}});}});}
    }
function personelDuzeniKur(){
        navlariKur();const main=document.querySelector('#personelApp .app-layout>main');if(main&&!main.querySelector('.fd-personel-intro')){const intro=document.createElement('header');intro.className='fd-personel-intro';intro.innerHTML='<h2>Personel Kayıtları</h2><p>Aktif ve ayrılan personeller, şube toplamları ve özlük bilgileri</p>';main.prepend(intro);}
        for(const id of ['personelSubeOzet','ayrilanSubeOzet']){const el=document.getElementById(id);if(!el||el.parentElement.matches('section.fd-personel-branches'))continue;const oldTitle=el.previousElementSibling,section=document.createElement('section'),heading=document.createElement('h3');section.className='fd-personel-branches';heading.textContent=oldTitle?.textContent||'Şube bazında toplamlar';el.before(section);section.append(heading,el);if(oldTitle?.classList.contains('personel-summary-title'))oldTitle.remove();}
        listeleriDuzenle();
    }
return{init(){assertCurrent();stylesInOriginalOrder();window.fdPersonelListeOrtakDugmeleriniKur?.();personelDuzeniKur();window.fdUnifiedOutput?.scan(document.getElementById('personelListeIcerik'));const importButton=document.getElementById('fdDepartedImportButton');importButton.hidden=!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel');importButton.addEventListener('click',importDepartedPeriods)},open(action){assertCurrent();if(action==='prepare')return true;return openPersonelApp()},api:{fdPersonelOutputContext(){return fdPersonelOutputContext()},openPersonelApp(...args){assertCurrent();return openPersonelApp(...args)},switchPersonelTab(...args){assertCurrent();return switchPersonelTab(...args)},renderPersonelOzetleri(...args){assertCurrent();return renderPersonelOzetleri(...args)},renderPersonelTables(...args){assertCurrent();return renderPersonelTables(...args)},listeleriDuzenle(...args){assertCurrent();return listeleriDuzenle(...args)},personelDuzeniKur(...args){assertCurrent();return personelDuzeniKur(...args)}},dispose(){departedSaving=false;closeDepartedDialog();document.getElementById('fdDepartedImportButton')?.removeEventListener('click',importDepartedPeriods);disposed=true;ownedStyles.splice(0).forEach(n=>n.remove());document.getElementById('personelListeIcerik')?.querySelectorAll('input,select').forEach(n=>{n.value=''});document.querySelectorAll('#tabloAktifPersonel tbody,#tabloAyrilanPersonel tbody,#personelGenelOzet,#personelSubeOzet,#ayrilanGenelOzet,#ayrilanSubeOzet').forEach(n=>n.replaceChildren())}};
});

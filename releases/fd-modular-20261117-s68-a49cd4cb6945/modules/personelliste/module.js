window.FDModules.define('personelliste',function(){
let disposed=false;const initial=context(),ownedStyles=[];
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)&&anaMenuModulErisimiVar('personel')&&initial===context()}
function assertCurrent(){if(!current())throw Error('Oturum veya yetki değişti; personel listesini yeniden açın.')}
function navlariKur(){window.fdPersonelNavlariKur?.()}
function stylesInOriginalOrder(){const verified=document.querySelector('style[data-fd-module-style="personelliste"]');if(!verified)throw Error('Personel liste stili yüklenemedi.');verified.media='not all';for(const part of verified.textContent.split('/* fd-personnel-style-slot:').slice(1)){const end=part.indexOf(' */'),name=part.slice(0,end),anchor=document.querySelector('[data-fd-personnel-style-slot="'+name+'"]');if(!anchor)throw Error('Personel stil sırası bulunamadı.');const style=document.createElement('style');style.dataset.fdPersonnelListStyle=name;style.textContent=part.slice(end+3);anchor.after(style);ownedStyles.push(style)}}
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
        const renderTargets = (people, generalEl, branchEl, emptyText) => {
            if (!generalEl || !branchEl) return;
            generalEl.innerHTML = metrics(summarize(people)).map(([label, value]) => `<article class="personel-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
            const branches = people.reduce((map, person) => {
                const branch = String(person.sube || 'Merkez').trim() || 'Merkez';
                (map[branch] ||= []).push(person);
                return map;
            }, Object.create(null));
            const branchNames = Object.keys(branches).sort((a, b) => a.localeCompare(b, 'tr'));
            branchEl.innerHTML = branchNames.length ? branchNames.map(branch => {
                const summary = summarize(branches[branch]);
                return `<article class="branch-summary-card"><h4>${escapeDashboardText(branch)}</h4><div class="branch-summary-metrics">${metrics(summary).map(([label, value]) => {
                    const field = label === 'Engelli' ? 'engelli' : label === 'Emekli' ? 'emekli' : '';
                    const breakdown = field ? `<small class="branch-summary-gender">Erkek: ${summary[field + 'Erkek']}<br>Bayan: ${summary[field + 'Kadin']}</small>` : '';
                    return `<span><b>${value}</b>${breakdown}${label}</span>`;
                }).join('')}</div></article>`;
            }).join('') : `<div class="dashboard-empty">${emptyText}</div>`;
        };
        renderTargets(active, generalTarget, branchTarget, 'Kayıtlı aktif personel bulunmuyor.');
        const departed = personeller.filter(p => aktifSirketeAit(p) && p.cikisTarihi && String(p.cikisTarihi) !== 'null');
        renderTargets(departed, document.getElementById('ayrilanGenelOzet'), document.getElementById('ayrilanSubeOzet'), 'Kayıtlı ayrılan personel bulunmuyor.');
    }
function renderPersonelTables() {
        renderPersonelOzetleri();
        const tAktif = document.querySelector('#tabloAktifPersonel tbody');
        const tAyrilan = document.querySelector('#tabloAyrilanPersonel tbody');
        tAktif.innerHTML = ''; tAyrilan.innerHTML = '';
        let aCount = 0, cCount = 0;
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
            link.addEventListener('click', () => openPersonelDetayModal(personId));
            row.insertCell().append(link);
            textCell(p.ad);
            const branch = p.sube || 'Merkez';
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.style.cssText = getSubeBadgeStyle(branch);
            badge.textContent = String(branch);
            row.insertCell().append(badge);
            textCell(p.gorev || '-');
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
            if (isPersonelUser()) button('btn-detail-modern', '📋 Detay', () => openPersonelDetayModal(personId));
            else button('btn-edit-modern', '✏️ Düzenle', () => personelDuzenle(personId));
            if (isAdmin) button('btn-del-modern', '🗑️ Sil', () => personelSil(personId));
            row.insertCell().append(actions);
            return row;
        };
        aktifListe.forEach(p => { aCount++; aktifSatirlar.push(personelSatiri(p, aCount, false)); });

        [...personeller].sort((x, y) => String(x.sube || 'Merkez').localeCompare(String(y.sube || 'Merkez'), 'tr') || String(x.ad || '').localeCompare(String(y.ad || ''), 'tr')).forEach((p) => {
            if (!aktifSirketeAit(p)) return;
            const isAyrilan = Boolean(p.cikisTarihi && String(p.cikisTarihi) !== "null");
            if (!isAyrilan) return;
            if (isPersonelUser() && String(p.id) !== String(activeUser.tcNo)) return;

            if (ayArama && !p.ad.toLowerCase().includes(ayArama) && !String(p.id).includes(ayArama)) return;
            if (aySube && p.sube !== aySube) return;
            if (ayCikisYili && (!p.cikisTarihi || !p.cikisTarihi.startsWith(ayCikisYili))) return;
            if (!personelDurumFiltresineUyar(p, 'engelli', ayEngelli)) return;
            if (!personelDurumFiltresineUyar(p, 'emekli', ayEmekli)) return;

            cCount++;
            ayrilanSatirlar.push(personelSatiri(p, cCount, true));
        });

        const activeRows = document.createDocumentFragment(), departedRows = document.createDocumentFragment();
        aktifSatirlar.forEach(row => activeRows.append(row));
        ayrilanSatirlar.forEach(row => departedRows.append(row));
        tAktif.replaceChildren(activeRows);
        tAyrilan.replaceChildren(departedRows);
        document.getElementById('badgeAktifSayisi').innerText = `${aCount} Kişi`;
        document.getElementById('badgeAyrilanSayisi').innerText = `${cCount} Kişi`;
    }
function listeleriDuzenle(){
        for(const id of ['tabloAktifPersonel','tabloAyrilanPersonel']){const table=document.getElementById(id);if(!table)continue;const labels=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());table.querySelectorAll('tbody tr').forEach(tr=>{if(tr.children.length!==labels.length)return;[...tr.children].forEach((td,i)=>td.dataset.fdLabel=labels[i]);});table.querySelectorAll('.tc-link').forEach(link=>{link.setAttribute('role','button');link.tabIndex=0;if(!link.dataset.fdKeyBound){link.dataset.fdKeyBound='1';link.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();link.click();}});}});}
    }
function personelDuzeniKur(){
        navlariKur();const main=document.querySelector('#personelApp .app-layout>main');if(main&&!main.querySelector('.fd-personel-intro')){const intro=document.createElement('header');intro.className='fd-personel-intro';intro.innerHTML='<h2>Personel Kayıtları</h2><p>Aktif ve ayrılan personeller, şube toplamları ve özlük bilgileri</p>';main.prepend(intro);}
        for(const id of ['personelSubeOzet','ayrilanSubeOzet']){const el=document.getElementById(id);if(!el||el.parentElement.matches('section.fd-personel-branches'))continue;const oldTitle=el.previousElementSibling,section=document.createElement('section'),heading=document.createElement('h3');section.className='fd-personel-branches';heading.textContent=oldTitle?.textContent||'Şube bazında toplamlar';el.before(section);section.append(heading,el);if(oldTitle?.classList.contains('personel-summary-title'))oldTitle.remove();}
        listeleriDuzenle();
    }
return{init(){assertCurrent();stylesInOriginalOrder();window.fdPersonelListeOrtakDugmeleriniKur?.();personelDuzeniKur();window.fdUnifiedOutput?.scan(document.getElementById('personelListeIcerik'))},open(action){assertCurrent();if(action==='prepare')return true;return openPersonelApp()},api:{openPersonelApp(...args){assertCurrent();return openPersonelApp(...args)},switchPersonelTab(...args){assertCurrent();return switchPersonelTab(...args)},renderPersonelOzetleri(...args){assertCurrent();return renderPersonelOzetleri(...args)},renderPersonelTables(...args){assertCurrent();return renderPersonelTables(...args)},listeleriDuzenle(...args){assertCurrent();return listeleriDuzenle(...args)},personelDuzeniKur(...args){assertCurrent();return personelDuzeniKur(...args)}},dispose(){disposed=true;ownedStyles.splice(0).forEach(n=>n.remove());document.getElementById('personelListeIcerik')?.querySelectorAll('input,select').forEach(n=>{n.value=''});document.querySelectorAll('#tabloAktifPersonel tbody,#tabloAyrilanPersonel tbody,#personelGenelOzet,#personelSubeOzet,#ayrilanGenelOzet,#ayrilanSubeOzet').forEach(n=>n.replaceChildren())}};
});

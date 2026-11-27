window.FDModules.define('toplusaat',function(){
let disposed=false,busy=false,generation=0,ownedStyle=null,ownedOverlay=null,observer=null;const initial=context(),dialogs=new Set();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulErisimiVar('personel')&&context()===initial}
function assertCurrent(write=false){if(!current()||(write&&!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Oturum veya yetki değişti; toplu saat ekranını yeniden açın.')}
function visible(){const modal=document.getElementById('modalMagicpassTopluSaat');return modal?.isConnected&&modal.style.display==='flex'}
function cancel(){generation++;for(const node of dialogs)if(node.isConnected)node.querySelector('[data-fd-iptal]')?.click();dialogs.clear()}
function fdTopluSaatKapat(){cancel();modalKapat('modalMagicpassTopluSaat')}
function showGlobalOverlay(...args){assertCurrent(true);window.showGlobalOverlay(...args);ownedOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(ownedOverlay&&ownedOverlay[0]===document.getElementById('overlayTitle')?.textContent&&ownedOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();ownedOverlay=null}
function fdBulkConfirm(...args){assertCurrent(true);const old=document.getElementById('fdYuzerOnayKatmani'),promise=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==old)dialogs.add(node);return promise}
function stylesInOriginalOrder(){const verified=document.querySelector('style[data-fd-module-style="toplusaat"]'),anchor=document.querySelector('[data-fd-personnel-style-slot="00.css"]');if(!verified||!anchor)throw Error('Toplu saat stili yüklenemedi.');verified.media='not all';ownedStyle=document.createElement('style');ownedStyle.dataset.fdBulkHoursStyle='00.css';ownedStyle.textContent=verified.textContent;anchor.after(ownedStyle)}
function magicpassTopluSaatAktifPersonelleri() {
        return personeller.filter(personel => {
            const cikis=String(personel?.cikisTarihi??'').trim().toLocaleLowerCase('tr-TR');
            return aktifSirketeAit(personel)&&(!cikis||['null','undefined','-','0000-00-00'].includes(cikis));
        }).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
    }
function magicpassTopluSaatDoldurmaAc() {
        if(!isManagerUser())return;
        const aktifler=magicpassTopluSaatAktifPersonelleri(),subeSelect=document.getElementById('magicTopluSaatSube');
        const subeAdlari=[...new Set(aktifler.map(p=>String(p.sube||'Merkez')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        const mevcutSube=String(document.getElementById('magicpassSubeFiltre')?.value||'');
        subeSelect.innerHTML=subeAdlari.map(ad=>`<option value="${escapeDashboardText(ad)}">${escapeDashboardText(ad)}</option>`).join('');
        subeSelect.value=subeAdlari.includes(mevcutSube)?mevcutSube:(subeAdlari[0]||'');
        const vardiyaSelect=document.getElementById('magicTopluSaatVardiya');
        vardiyaSelect.innerHTML='<option value="gunluk">Personelin günlük vardiya planını kullan</option>'+magicpassVardiyaTanimlariniDuzelt().map(v=>`<option value="${escapeDashboardText(v.id)}">${escapeDashboardText(v.ad)} · ${escapeDashboardText(v.baslangic+'-'+v.bitis)}</option>`).join('');
        vardiyaSelect.value='gunluk';
        const ay=String(document.getElementById('magicpassAy')?.value||magicpassTarihAnahtari(new Date()).slice(0,7)),parca=ay.split('-').map(Number),sonGun=new Date(parca[0],parca[1],0).getDate();
        document.getElementById('magicTopluSaatBaslangic').value=ay+'-01';
        document.getElementById('magicTopluSaatBitis').value=ay+'-'+String(sonGun).padStart(2,'0');
        document.getElementById('magicTopluSaatGiris').value='';document.getElementById('magicTopluSaatCikis').value='';
        document.getElementById('magicTopluSaatCihazsiz').checked=true;document.getElementById('magicTopluSaatTumPersoneller').checked=true;
        document.getElementById('magicTopluSaatIzinAtla').checked=true;document.getElementById('magicTopluSaatTatilAtla').checked=true;document.getElementById('magicTopluSaatSadeceBos').checked=true;
        magicpassTopluSaatPersonelleriniCiz();
        document.getElementById('modalMagicpassTopluSaat').style.display='flex';
    }
function magicpassTopluSaatPersonelleriniCiz() {
        const alan=document.getElementById('magicTopluSaatPersoneller');if(!alan)return;
        const sube=String(document.getElementById('magicTopluSaatSube')?.value||''),sadeceCihazsiz=document.getElementById('magicTopluSaatCihazsiz')?.checked;
        const onceki=new Set([...alan.querySelectorAll('input[name="magicTopluSaatPersonel"]:checked')].map(input=>input.value));
        const tumSecili=document.getElementById('magicTopluSaatTumPersoneller')?.checked;
        const liste=magicpassTopluSaatAktifPersonelleri().filter(p=>String(p.sube||'Merkez')===sube&&(!sadeceCihazsiz||!String(p.cihazPersonelNo||'').trim()));
        alan.innerHTML=liste.length?liste.map(p=>`<label><input type="checkbox" name="magicTopluSaatPersonel" value="${escapeDashboardText(p.id)}" ${(tumSecili||onceki.has(String(p.id)))?'checked':''} onchange="magicpassTopluSaatSecimOzetiniGuncelle()"><span><strong>${escapeDashboardText(p.ad||'Personel')}</strong><small>${escapeDashboardText(p.gorev||'-')} · ${p.cihazPersonelNo?'Cihaz '+escapeDashboardText(p.cihazPersonelNo):'Cihaz no yok'}</small></span></label>`).join(''):'<div style="grid-column:1/-1;padding:18px;text-align:center;color:#64748b;">Bu filtreye uygun personel bulunmuyor.</div>';
        magicpassTopluSaatSecimOzetiniGuncelle();
    }
function magicpassTopluSaatTumunuSec(secili) {
        document.querySelectorAll('input[name="magicTopluSaatPersonel"]').forEach(input=>input.checked=Boolean(secili));
        magicpassTopluSaatSecimOzetiniGuncelle();
    }
function magicpassTopluSaatSecimOzetiniGuncelle() {
        const tum=[...document.querySelectorAll('input[name="magicTopluSaatPersonel"]')],secili=tum.filter(input=>input.checked).length;
        const ozet=document.getElementById('magicTopluSaatSecimOzeti');if(ozet)ozet.textContent=secili+' personel seçili';
        const tumSec=document.getElementById('magicTopluSaatTumPersoneller');if(tumSec)tumSec.checked=Boolean(tum.length&&secili===tum.length);
    }
function magicpassTopluSaatVardiyaDegisti() {
        const id=String(document.getElementById('magicTopluSaatVardiya')?.value||'gunluk');
        const giris=document.getElementById('magicTopluSaatGiris'),cikis=document.getElementById('magicTopluSaatCikis');
        if(id==='gunluk'){giris.value='';cikis.value='';return;}
        const tanim=magicpassVardiyaTanimiBul(id);giris.value=tanim?.baslangic||'';cikis.value=tanim?.bitis||'';
    }
async function magicpassTopluSaatKaydet(event,fdBulkValid) {
        event.preventDefault();if(!isManagerUser())return;
        const pIdler=[...document.querySelectorAll('input[name="magicTopluSaatPersonel"]:checked')].map(input=>String(input.value));
        const bas=String(document.getElementById('magicTopluSaatBaslangic').value||''),bit=String(document.getElementById('magicTopluSaatBitis').value||'');
        const vardiyaSecimi=String(document.getElementById('magicTopluSaatVardiya').value||'gunluk'),girisOverride=String(document.getElementById('magicTopluSaatGiris').value||''),cikisOverride=String(document.getElementById('magicTopluSaatCikis').value||'');
        const tatilAtla=document.getElementById('magicTopluSaatTatilAtla').checked,sadeceBos=document.getElementById('magicTopluSaatSadeceBos').checked;
        if(!pIdler.length)return showToast('En az bir personel seçin.','warning');if(!bas||!bit||bit<bas)return showToast('Geçerli bir başlangıç ve bitiş tarihi seçin.','warning');
        const seciliPersoneller=pIdler.map(id=>personeller.find(p=>String(p.id)===id&&aktifSirketeAit(p))).filter(Boolean),islemler=[];
        const atlanan={izin:0,tatil:0,dolu:0,istihdam:0,saat:0};
        for(const d=new Date(bas+'T12:00:00'),son=new Date(bit+'T12:00:00');d<=son;d.setDate(d.getDate()+1)){
            const tarih=magicpassTarihAnahtari(d);
            for(const personel of seciliPersoneller){
                const girisTarihi=String(personel.girisTarihi||'').slice(0,10),cikisTarihi=String(personel.cikisTarihi||'').slice(0,10);
                if((girisTarihi&&tarih<girisTarihi)||(cikisTarihi&&tarih>cikisTarihi)){atlanan.istihdam++;continue;}
                const izin=izinler.some(i=>aktifSirketeAit(i)&&String(i.pId)===String(personel.id)&&tarih>=String(i.baslangic)&&tarih<=String(i.bitis));
                if(izin){atlanan.izin++;continue;}
                const vardiya=vardiyaSecimi==='gunluk'?magicpassGunVardiyasi(personel,tarih):vardiyaSecimi,tanim=magicpassVardiyaTanimiBul(vardiya),gunTuru=magicpassGunTuruBul(personel,tarih);
                if(tatilAtla&&(gunTuru||vardiya==='izin'||tanim?.tatil||tanim?.resmiTatil||tanim?.girisCikisYasak)){atlanan.tatil++;continue;}
                const girisSaat=girisOverride||tanim?.baslangic||'',cikisSaat=cikisOverride||tanim?.bitis||'';
                if(!girisSaat||!cikisSaat){atlanan.saat++;continue;}
                const mevcutDuzeltmeler=magicpassKayitlari('magicpassDuzeltme').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===tarih);
                const hareketler=String(personel.cihazPersonelNo||'').trim()?magicpassGunHareketleri(personel,tarih,vardiya):[];
                if(sadeceBos&&(mevcutDuzeltmeler.length||hareketler.length)){atlanan.dolu++;continue;}
                const girisZamani=magicpassSaatliTarih(tarih,girisSaat),cikisZamani=magicpassSaatliTarih(tarih,cikisSaat,cikisSaat<=girisSaat);
                islemler.push({personel,tarih,vardiya,tanim,girisSaat,cikisSaat,girisZamani,cikisZamani,mevcutDuzeltmeler});
            }
        }
        if(!islemler.length)return showToast('Seçilen aralıkta doldurulacak uygun boş gün bulunamadı.','warning');
        const mesaj=`${seciliPersoneller.length} personel için ${islemler.length} günlük giriş–çıkış kaydı oluşturulacak.\n\nGiriş: ${girisOverride||'günlük vardiyadan'} · Çıkış: ${cikisOverride||'günlük vardiyadan'}${atlanan.izin?`\n${atlanan.izin} izinli gün atlandı.`:''}${atlanan.tatil?`\n${atlanan.tatil} tatil/çalışma olmayan gün atlandı.`:''}${atlanan.dolu?`\n${atlanan.dolu} dolu gün korundu.`:''}\n\nDevam edilsin mi?`;
        if(!(await fdBulkConfirm(mesaj,'Tarih Aralığını Doldur','Doldur'))||!fdBulkValid())return;
        assertCurrent(true);
        const oncekiKayitlar=[...vardiyaKayitlari],zaman=Date.now();showGlobalOverlay('Giriş–çıkış saatleri kaydediliyor',`${islemler.length} günlük kayıt hazırlanıyor...`);
        try{
            islemler.forEach((islem,index)=>{
                vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(islem.personel.id)&&String(k.tarih)===islem.tarih));
                vardiyaKayitlari.push({id:'mduz_toplu_'+islem.personel.id+'_'+islem.tarih+'_'+zaman+'_'+index,kayitTipi:'magicpassDuzeltme',sirketId:aktifSirketId(),pId:String(islem.personel.id),tarih:islem.tarih,girisZamani:islem.girisZamani.toISOString(),cikisZamani:islem.cikisZamani.toISOString(),giris:islem.girisSaat,cikis:islem.cikisSaat,aciklama:'Tarih aralığı toplu doldurma · '+(vardiyaSecimi==='gunluk'?'Günlük vardiya planı':String(islem.tanim?.ad||islem.vardiya)),kaynak:'topluSaat',zaman:zaman+index});
            });
            yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();if(!fdBulkValid())return;assertCurrent(true);modalKapat('modalMagicpassTopluSaat');magicpassAylikCizelgeyiCiz();
            showToast(islemler.length+' günlük giriş–çıkış kaydı vardiya saatleri temel alınarak dolduruldu.');
        }catch(error){if(!fdBulkValid())return;vardiyaKayitlari=oncekiKayitlar;showToast('Toplu saatler kaydedilemedi: '+(error.message||error),'error');}
        finally{hideGlobalOverlay();}
    }
let legacyPreview=null;const legacyEvents=new AbortController();
const legacyEl=id=>document.getElementById(id);
function legacyInvalidate(){legacyPreview=null;if(legacyEl('fdLegacySave'))legacyEl('fdLegacySave').disabled=true;}
function legacyOpen(){legacyInvalidate();const select=legacyEl('fdLegacyPerson');select.replaceChildren(new Option('Personel seçin',''));for(const p of personeller.filter(aktifSirketeAit).sort((a,b)=>String(a.ad).localeCompare(String(b.ad),'tr')))select.add(new Option(p.ad,String(p.id)));select.value=String(legacyEl('magicpassPersonel')?.value||'');legacyEl('fdLegacyText').value='';legacyEl('fdLegacyResult').replaceChildren();}
function legacyParse(text){
 const lines=String(text).trim().split(/\r?\n/).filter(x=>x.trim());if(!lines.length||lines.length>1001)throw Error('1–1000 günlük tarih, giriş ve çıkış satırı girin.');const rows=[],seen=new Set();
 for(const [i,line]of lines.entries()){if(i===0&&/^tarih[\t; ]/i.test(line))continue;const cells=line.trim().split(/[\t;]+| +/);if(cells.length!==3)throw Error((i+1)+'. satır: tarih, giriş ve çıkış olmak üzere üç alan gerekli.');let[date,entry,exit]=cells;const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);if(m)date=m[3]+'-'+m[2]+'-'+m[1];const dt=new Date(date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(dt.getTime())||dt.toISOString().slice(0,10)!==date||Number(date.slice(0,4))<2017)throw Error((i+1)+'. satırın tarihi geçersiz.');if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(entry)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(exit)||exit===entry)throw Error((i+1)+'. satırın saatleri geçersiz.');if(seen.has(date))throw Error(date+' birden fazla yazılmış.');seen.add(date);const next=new Date(date+'T12:00:00Z');if(exit<entry)next.setUTCDate(next.getUTCDate()+1);rows.push({date,entry,exit,exitDate:next.toISOString().slice(0,10)});}
 if(rows.length>1000)throw Error('En fazla 1000 gün aktarılabilir.');if(!rows.length)throw Error('Aktarılacak saat bulunamadı.');return rows.sort((a,b)=>a.date.localeCompare(b.date));
}
async function legacyRead(module,pId,valid){const out=[];for(let offset=0;offset<20000;offset+=500){assertCurrent(true);if(!valid())throw Error('Aktarım seçimi değişti.');const{data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',aktifSirketId()).eq('module',module).eq('employee_legacy_id',pId).order('legacy_id').range(offset,offset+499);assertCurrent(true);if(!valid())throw Error('Aktarım seçimi değişti.');if(error)throw error;out.push(...(data||[]));if(!data||data.length<500)return out;}throw Error('Bu personelin kayıt sayısı aktarım sınırını aşıyor.');}
function legacyClock(value){if(!value)return '';const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hour12:false}).format(d):'';}
function legacyLocalDate(value){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
function legacySame(record,row){const endDate=row.exitDate||row.date;return String(record.giris||legacyClock(record.girisZamani))===row.entry&&String(record.cikis||legacyClock(record.cikisZamani))===row.exit&&(record.cikisZamani?legacyLocalDate(record.cikisZamani)===endDate:endDate===row.date);}
async function legacyPlan(pId,rows,valid){
 const person=personeller.find(p=>String(p.id)===pId&&aktifSirketeAit(p));if(!person)throw Error('Personel seçin.');const remote=await legacyRead('vardiya',pId,valid),leaves=await legacyRead('izinler',pId,valid),local=magicpassKayitlari('magicpassDuzeltme').filter(r=>String(r.pId)===pId);vardiyaKayitlari=vardiyaKayitlari.filter(r=>!(r.kaynak==='legacyScreenshot'&&String(r.pId)===pId&&rows.some(x=>x.date===r.tarih&&legacySame(r,x))&&!remote.some(x=>String(x.legacy_id)===String(r.id))));const planned=rows.map(row=>{
  const leave=leaves.find(x=>x.data.baslangic<=row.date&&x.data.bitis>=row.date);if(leave)return{...row,status:'leave',label:'İzinli — korunacak'};
  if(((person.girisTarihi&&row.date<String(person.girisTarihi).slice(0,10))||(person.cikisTarihi&&row.date>String(person.cikisTarihi).slice(0,10)))&&!(typeof fdPersonelGecmisCalismaGunumu==='function'&&fdPersonelGecmisCalismaGunumu(person,row.date)))return{...row,status:'employment',label:'Çalışma dönemi dışında — atlandı'};
  const manual=remote.filter(x=>x.data.kayitTipi==='magicpassDuzeltme'&&x.data.tarih===row.date).map(x=>x.data),draft=local.filter(x=>x.tarih===row.date&&x.kaynak!=='legacyScreenshot'&&!manual.some(r=>String(r.id)===String(x.id)));if(manual.length||draft.length){if(draft.length)return{...row,status:'conflict',label:'Kaydedilmemiş yerel saat — önce kaydı kontrol edin'};const all=manual;return{...row,status:all.every(x=>legacySame(x,row))?'same':'conflict',label:all.every(x=>legacySame(x,row))?'Zaten kayıtlı':'Farklı mevcut saat — korunacak'};}
  const exitDate=row.exitDate||row.date,overnight=exitDate!==row.date,startBound=row.date+(overnight?'T12:00:00':'T00:00:00'),endBound=exitDate+(overnight?'T12:00:00':'T23:59:59'),raw=remote.filter(x=>x.data.kayitTipi==='magicpassHareket').map(x=>String(x.data.zamanDamgasi||'')).filter(t=>t>=startBound&&t<=endBound).sort(),entryStamp=row.date+'T'+row.entry,exitStamp=exitDate+'T'+row.exit;
  if(raw.length>=2){const same=raw[0].slice(0,16)===entryStamp&&raw.at(-1).slice(0,16)===exitStamp;return{...row,status:same?'same':'conflict',label:same?'Zaten kayıtlı':'Farklı cihaz saatleri — korunacak'};}if(raw.length===1&&![entryStamp,exitStamp].includes(raw[0].slice(0,16)))return{...row,status:'conflict',label:'Farklı cihaz saati — korunacak'};
  return{...row,status:'new',label:'Yeni kayıt'};
 });return{pId,name:person.ad,rows:planned,remoteSignature:JSON.stringify(remote),leaveSignature:JSON.stringify(leaves)};
}
function legacyRender(plan,message=''){
 const host=legacyEl('fdLegacyResult');host.replaceChildren();const counts={};for(const row of plan.rows)counts[row.status]=(counts[row.status]||0)+1;const p=document.createElement('p');p.textContent=message||plan.name+' · '+(counts.new||0)+' yeni gün · '+(counts.same||0)+' zaten kayıtlı · '+(counts.leave||0)+' izinli · '+(counts.conflict||0)+' farklı kayıt';p.setAttribute('role','status');host.append(p);
 const wrap=document.createElement('div');wrap.style.cssText='max-height:240px;overflow:auto';const table=document.createElement('table');table.style.width='100%';const header=table.createTHead().insertRow();for(const label of ['Tarih','Giriş','Çıkış','Durum']){const th=document.createElement('th');th.textContent=label;header.append(th);}const body=table.createTBody();for(const row of plan.rows){const tr=body.insertRow();for(const text of [row.date.slice(8)+'.'+row.date.slice(5,7)+'.'+row.date.slice(0,4),row.entry,row.exit+(row.exitDate&&row.exitDate!==row.date?' ('+row.exitDate.slice(8)+'.'+row.exitDate.slice(5,7)+'.'+row.exitDate.slice(0,4)+')':''),row.label])tr.insertCell().textContent=text;}wrap.append(table);host.append(wrap);legacyEl('fdLegacySave').disabled=!(counts.new>0)||Boolean(counts.conflict);return counts;
}
async function legacyPreviewClick(){assertCurrent(true);if(busy||!visible())return;legacyInvalidate();busy=true;const ticket=generation,pId=legacyEl('fdLegacyPerson').value,text=legacyEl('fdLegacyText').value,valid=()=>current()&&visible()&&ticket===generation&&pId===legacyEl('fdLegacyPerson').value&&text===legacyEl('fdLegacyText').value;try{const rows=legacyParse(text),plan=await legacyPlan(pId,rows,valid);if(!valid())return;legacyPreview={...plan,text,ticket};legacyRender(plan);}catch(error){if(current()&&visible())legacyEl('fdLegacyResult').textContent=error.message;}finally{busy=false;}}
async function legacySaveClick(){
 assertCurrent(true);if(busy||!visible()||!legacyPreview)return;const plan=legacyPreview,pId=plan.pId,ticket=generation,text=legacyEl('fdLegacyText').value,valid=()=>current()&&visible()&&ticket===generation&&pId===legacyEl('fdLegacyPerson').value&&text===legacyEl('fdLegacyText').value;busy=true;legacyEl('fdLegacySave').disabled=true;let candidates=[];
 try{
  if(!valid()||text!==plan.text)throw Error('Seçim değişti; önizlemeyi yenileyin.');const fresh=await legacyPlan(pId,plan.rows,valid);if(JSON.stringify(fresh.rows)!==JSON.stringify(plan.rows)||fresh.remoteSignature!==plan.remoteSignature||fresh.leaveSignature!==plan.leaveSignature)throw Error('Kayıtlar değişti; önizlemeyi yenileyin.');const adds=fresh.rows.filter(x=>x.status==='new');if(!adds.length||fresh.rows.some(x=>x.status==='conflict'))throw Error('Kaydedilecek uygun kayıt yok.');
  if(!(await fdBulkConfirm(plan.name+' için '+adds.length+' günün giriş–çıkış saatleri kaydedilecek. Mevcut kayıtlar ve izinler korunacak.','Geçmiş Saatleri Aktar','Toplu Kaydet'))||!valid())return;assertCurrent(true);const now=Date.now(),company=aktifSirketId();candidates=adds.map((r,i)=>{const start=new Date(r.date+'T'+r.entry+':00+03:00').toISOString(),end=new Date((r.exitDate||r.date)+'T'+r.exit+':00+03:00').toISOString();return{id:'mduz_legacy_'+pId+'_'+r.date,kayitTipi:'magicpassDuzeltme',sirketId:company,pId,tarih:r.date,giris:r.entry,cikis:r.exit,girisZamani:start,cikisZamani:end,calismaAraliklari:[{girisZamani:start,cikisZamani:end}],aciklama:'Akınsoft geçmiş kayıt aktarımı · kullanıcı ekran görüntüsünden toplu aktarım',kaynak:'legacyScreenshot',zaman:now+i};});
  const existingIds=new Set(vardiyaKayitlari.map(x=>String(x.id)));if(candidates.some(x=>existingIds.has(x.id)))throw Error('Aktarım kimliği zaten mevcut; önizlemeyi yenileyin.');vardiyaKayitlari.push(...candidates);yuklenenVeriler.add('vardiya');let saveError=null;try{await supabaseVerileriKaydet({modul:'vardiya',personelId:pId,tarihler:adds.map(x=>x.date)});}catch(error){saveError=error;}if(!valid())return;
  const server=await legacyRead('vardiya',pId,valid),confirmed=candidates.filter(x=>server.some(r=>r.legacy_id===x.id&&magicpassDuzeltmeKayitlariAyniMi(r.data,x))),confirmedIds=new Set(confirmed.map(x=>x.id));vardiyaKayitlari=vardiyaKayitlari.filter(x=>!candidates.some(c=>c.id===x.id&&!confirmedIds.has(c.id)&&magicpassDuzeltmeKayitlariAyniMi(x,c)));
  if(confirmed.length!==candidates.length)throw Error(confirmed.length+'/'+candidates.length+' gün sunucuda doğrulandı. Kalanları yeniden önizleyin.'+(saveError?' '+saveError.message:''));legacyInvalidate();legacyRender(fresh,confirmed.length+' gün kaydedildi ve sunucudan doğrulandı. Mevcut kayıtlar ve izinler korundu.');legacyEl('fdLegacySave').disabled=true;magicpassAylikCizelgeyiCiz();
 }catch(error){if(current()&&visible()){legacyInvalidate();legacyEl('fdLegacyResult').textContent=error.message+' Kaydetmeden önce yeniden önizleyin.';}}
 finally{busy=false;}
}
function legacyInit(){for(const id of ['fdLegacyText','fdLegacyPerson'])legacyEl(id).addEventListener(id==='fdLegacyText'?'input':'change',legacyInvalidate,{signal:legacyEvents.signal});legacyEl('fdLegacyPreview').addEventListener('click',()=>legacyPreviewClick(),{signal:legacyEvents.signal});legacyEl('fdLegacySave').addEventListener('click',()=>legacySaveClick(),{signal:legacyEvents.signal});}

return{init(){assertCurrent();legacyInit();stylesInOriginalOrder();observer=new MutationObserver(()=>{if(!visible()||document.getElementById('magicpassApp')?.style.display==='none')cancel()});observer.observe(document.getElementById('modalMagicpassTopluSaat'),{attributes:true,attributeFilter:['style']});const app=document.getElementById('magicpassApp');if(app)observer.observe(app,{attributes:true,attributeFilter:['style']})},open(){assertCurrent();if(busy)return false;cancel();const result=magicpassTopluSaatDoldurmaAc();legacyOpen();return result},api:{magicpassTopluSaatAktifPersonelleri(...args){assertCurrent();return magicpassTopluSaatAktifPersonelleri(...args)},magicpassTopluSaatPersonelleriniCiz(...args){assertCurrent();return magicpassTopluSaatPersonelleriniCiz(...args)},magicpassTopluSaatTumunuSec(...args){assertCurrent();return magicpassTopluSaatTumunuSec(...args)},magicpassTopluSaatSecimOzetiniGuncelle(...args){assertCurrent();return magicpassTopluSaatSecimOzetiniGuncelle(...args)},magicpassTopluSaatVardiyaDegisti(...args){assertCurrent();return magicpassTopluSaatVardiyaDegisti(...args)},fdTopluSaatKapat,async magicpassTopluSaatKaydet(event){event.preventDefault();assertCurrent(true);if(busy||!visible())return;busy=true;const ticket=generation,valid=()=>current()&&ticket===generation&&visible();try{return await magicpassTopluSaatKaydet(event,valid)}finally{busy=false;hideGlobalOverlay()}}},dispose(){legacyEvents.abort();legacyPreview=null;disposed=true;observer?.disconnect();cancel();hideGlobalOverlay();ownedStyle?.remove();document.getElementById('magicpassTopluSaatForm')?.reset();document.getElementById('magicTopluSaatPersoneller')?.replaceChildren()}};
});

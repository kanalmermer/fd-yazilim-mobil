window.FDModules.define('kkd',function(){

let fdKkdDisposed=false;const fdKkdInitial=fdKkdContext(),fdKkdDialogs=new Set(),fdKkdOutputs=new Set();
function fdKkdContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function fdKkdValid(){return !fdKkdDisposed&&fdKkdInitial===fdKkdContext()&&anaMenuModulErisimiVar('personel')}
function fdKkdAssert(write=false){if(!fdKkdValid())throw Error('Oturum değişti; KKD ekranını yeniden açın.');if(write&&(!anaMenuModulYazmaYetkisiVar('personel')||!isManagerUser()||isPersonelUser()))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdKkdAwait(p){fdKkdAssert();const value=await p;fdKkdAssert();return value}
function fdKkdConfirm(...args){fdKkdAssert();const previous=document.getElementById('fdYuzerOnayKatmani'),p=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==previous)fdKkdDialogs.add(node);return p}
function fdKkdClean(node){if(!node)return;if(node._url){URL.revokeObjectURL(node._url);node._url=null}node.querySelectorAll?.('iframe').forEach(f=>f.src='about:blank');node._blob=null;node.remove()}
function fdKkdPdf(...args){fdKkdAssert();args[3]={...args[3],fdIsCurrent:fdKkdValid};const previous=document.getElementById('fdOrtakCiktiOnizleme'),p=window.fdTabloPdfOnizle(...args),node=document.getElementById('fdOrtakCiktiOnizleme'),owned=node!==previous?node:null;if(owned)fdKkdOutputs.add(owned);return Promise.resolve(p).then(value=>{if(fdKkdValid())return value},error=>{if(fdKkdValid())throw error}).finally(()=>{if(!fdKkdValid())fdKkdClean(owned)})}
async function openKkdApp() {
try{
fdKkdAssert(false);

        anaMenuDonusButonunuGoster();
        ['appHub', 'personelDashboardApp', 'personelApp', 'izinTakipApp', 'puantajApp', 'avansApp', 'sirketApp', 'icraApp', 'ekOdemeApp'].forEach(id => {
if(!fdKkdValid())return;
 const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        document.getElementById('kkdApp').style.display = 'block';
        workspaceSekmesiniAktifEt('kkd');
        const ay = document.getElementById('kkdAySec');
        if (!ay.value) ay.value = new Date().toISOString().slice(0, 7);
        if (!document.getElementById('kkdTarih').value) document.getElementById('kkdTarih').value = new Date().toISOString().slice(0, 10);
        yuklenenVeriler.add('kkd');
        if (!veriSonKayitGoruntuleri.has('kkd')) veriKayitGoruntusunuYenile('kkd');
        kkdFiltreleriniDoldur();
        kkdCizelgesiniHazirla();
        if (!fdModulVerisiTazeMi('kkd')) {
            driveVerileriniYukleBaslangicta('kkd').then(() => {
if(!fdKkdValid())return;

                if (document.getElementById('kkdApp')?.style.display !== 'block') return;
                yuklenenVeriler.add('kkd');
                veriKayitGoruntusunuYenile('kkd');
                kkdFiltreleriniDoldur();
                kkdCizelgesiniHazirla();
            }).catch(error => {
if(!fdKkdValid())return;

                console.error('KKD verileri yenilenemedi:', error);
                showToast('KKD verileri arka planda yenilenemedi.', 'warning');
            });
        }
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
}
function kkdFiltreleriniDoldur() {
fdKkdAssert(false);

        const subelerListesi = [...new Set(personeller.filter(p => aktifSirketeAit(p)).map(p => String(p.sube || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
        ['kkdSubeFiltre'].forEach(id => {
fdKkdAssert(false);

            const secim = document.getElementById(id); if (!secim) return;
            const onceki = secim.value;
            secim.innerHTML = '<option value="">Tüm Şubeler</option>';
            subelerListesi.forEach(sube => secim.add(new Option(sube, sube)));
            secim.value = subelerListesi.includes(onceki) ? onceki : '';
        });
        kkdPersonelSecenekleriniDoldur();
        if (!document.querySelector('#kkdKalemler .kkd-kalem')) kkdKalemEkle();
    }
function kkdPersonelSecenekleriniDoldur() {
fdKkdAssert(false);

        const secim = document.getElementById('kkdPersonel');
        const onceki = secim.value;
        const personelListesi = personeller.filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null')).sort((a, b) => String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'));
        secim.innerHTML = '<option value="">-- Önce Personel Seçiniz --</option>';
        personelListesi.forEach(p => secim.add(new Option(`${p.ad} · ${p.sube || 'Şube yok'}`, p.id)));
        if (personelListesi.some(p => String(p.id) === String(onceki))) secim.value = onceki;
        kkdOncekiTeslimUyarisiGuncelle();
    }
function kkdKalemEkle() {
fdKkdAssert(false);

        const satir = document.createElement('div');
        satir.className = 'kkd-kalem';
        satir.style.cssText = 'display:grid;grid-template-columns:1fr 70px 30px;gap:6px;margin-bottom:6px;align-items:start;';
        satir.innerHTML = `<div><select class="kkd-kalem-tur" onchange="kkdKalemTuruDegisti(this)"><option value="">KKD TÜRÜ SEÇİN</option><option>ÇELİK BURUNLU AYAKKABI</option><option>ÇELİK BURUNLU ÇİZME</option><option>BARET</option><option>BEZ ELDİVEN</option><option>NAYLON ELDİVEN</option><option>LATEKS ELDİVEN</option><option>BEZ ÖNLÜK</option><option>NAYLON ÖNLÜK</option><option>MASKE</option><option>REFLEKTÖRLÜ YELEK</option><option>GÖZLÜK</option><option>KULAKLIK</option><option value="Diğer">DİĞER</option></select><input class="kkd-kalem-diger" type="text" placeholder="KKD adı" style="display:none;margin-top:5px;" oninput="kkdOncekiTeslimUyarisiGuncelle()"></div><input class="kkd-kalem-adet" type="number" min="1" value="1" title="Adet"><button type="button" class="btn-modern btn-del-modern" style="padding:6px;" onclick="kkdKalemSil(this)">✕</button>`;
        document.getElementById('kkdKalemler').appendChild(satir);
    }
function kkdKalemSil(button) {
fdKkdAssert(false);

        const kalemler = document.querySelectorAll('#kkdKalemler .kkd-kalem');
        if (kalemler.length === 1) { alert('En az bir malzeme eklemelisiniz.'); return; }
        button.closest('.kkd-kalem').remove();
        kkdOncekiTeslimUyarisiGuncelle();
    }
function kkdKalemTuruDegisti(select) {
fdKkdAssert(false);

        const diger = select.closest('.kkd-kalem').querySelector('.kkd-kalem-diger');
        diger.style.display = select.value === 'Diğer' ? 'block' : 'none';
        if (select.value !== 'Diğer') diger.value = '';
        kkdOncekiTeslimUyarisiGuncelle();
    }
function kkdKalemleriAl() {
fdKkdAssert(false);

        return [...document.querySelectorAll('#kkdKalemler .kkd-kalem')].map(satir => {
fdKkdAssert(false);

            const secim = satir.querySelector('.kkd-kalem-tur').value;
            const tur = secim === 'Diğer' ? satir.querySelector('.kkd-kalem-diger').value.trim() : secim;
            return { tur:String(tur || '').toLocaleUpperCase('tr-TR'), adet:Math.max(1, Number(satir.querySelector('.kkd-kalem-adet').value || 1)) };
        }).filter(kalem => kalem.tur);
    }
function kkdOncekiTeslimBul(pId, tur, haricId = '', oncekiTarih = '') {
fdKkdAssert(false);

        return kkdKayitlari.filter(k => aktifSirketeAit(k) && String(k.pId) === String(pId) && String(k.tur || '').toLocaleLowerCase('tr-TR') === String(tur || '').toLocaleLowerCase('tr-TR') && String(k.id) !== String(haricId) && (!oncekiTarih || String(k.tarih || '') < String(oncekiTarih))).sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || '')))[0];
    }
function kkdOncekiTeslimUyarisiGuncelle() {
fdKkdAssert(false);

        const uyari = document.getElementById('kkdOncekiUyari');
        const pId = document.getElementById('kkdPersonel').value;
        const oncekiler = kkdKalemleriAl().map(kalem => ({ kalem, onceki:kkdOncekiTeslimBul(pId, kalem.tur) })).filter(item => item.onceki);
        if (!oncekiler.length) { uyari.style.display = 'none'; return; }
        uyari.style.display = 'block';
        uyari.innerHTML = `⚠️ Önceki teslimler:<br>${oncekiler.map(item => `• <strong>${escapeDashboardText(item.onceki.tur)}</strong> — ${tarihFormati(item.onceki.tarih)} (${Number(item.onceki.adet || 1)} adet)`).join('<br>')}`;
    }
let kkdKayitIslemiDevamEdiyor = false;
async function kkdTeslimKaydet(event) {
try{
fdKkdAssert(true);

        event.preventDefault();
        if (kkdKayitIslemiDevamEdiyor) return;
        const pId = document.getElementById('kkdPersonel').value;
        const kalemler = kkdKalemleriAl();
        if (!kalemler.length) { alert('En az bir KKD türü seçin.'); return; }
        const oncekiler = kalemler.map(kalem => ({ kalem, onceki:kkdOncekiTeslimBul(pId, kalem.tur) })).filter(item => item.onceki);
        if (oncekiler.length && !await fdKkdAwait(fdKkdConfirm(`Bu personele aynı ürünlerden daha önce teslim edilmiş:\n${oncekiler.map(item => `${item.onceki.tur}: ${tarihFormati(item.onceki.tarih)}`).join('\n')}\n\nYeni teslim kayıtları yine de oluşturulsun mu?`))) return;
        const personel = personeller.find(p => String(p.id) === String(pId));
        if (!personel) return;
        const teslimNo = `kkdteslim_${Date.now()}`;
        const yeniKayitlar = kalemler.map((kalem, index) => ({ id:`${teslimNo}_${index}`, teslimNo, tarih:document.getElementById('kkdTarih').value, pId:String(pId), personelAd:personel.ad || '', sube:personel.sube || '', tur:kalem.tur, adet:kalem.adet, not:document.getElementById('kkdNot').value.trim(), sirketId:aktifSirketId() }));
        const oncekiKayitlar = kkdKayitlari.slice();
        const submitButton = event.submitter || event.target.querySelector('button[type="submit"]');
        const eskiButonMetni = submitButton?.textContent || 'Teslimi Kaydet';
        kkdKayitIslemiDevamEdiyor = true;
        if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Kaydediliyor...'; }
        kkdKayitlari.push(...yeniKayitlar);
        yuklenenVeriler.add('kkd');
        veriOnbelleginiKaydet();
        kkdCizelgesiniHazirla();
        showToast(`${yeniKayitlar.length} KKD teslim kalemi kaydediliyor...`, 'success');
        try {
            await fdKkdAwait(verileriKaydet());
            event.target.reset();
            const bugun = new Date();
            document.getElementById('kkdTarih').value = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
            document.getElementById('kkdPersonel').value = '';
            document.getElementById('kkdKalemler').innerHTML = '';
            kkdKalemEkle();
            document.getElementById('kkdOncekiUyari').style.display = 'none';
            showToast(`${yeniKayitlar.length} KKD teslim kalemi kaydedildi.`, 'success');
        } catch (error) {
if(!fdKkdValid())return;

            kkdKayitlari = oncekiKayitlar;
            veriOnbelleginiKaydet();
            kkdCizelgesiniHazirla();
            showToast('KKD teslimi kaydedilemedi: ' + (error?.message || error), 'error');
        } finally {
if(fdKkdValid()){

            kkdKayitIslemiDevamEdiyor = false;
            if (submitButton) { submitButton.disabled = false; submitButton.textContent = eskiButonMetni; }
        
}
}
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
}
function kkdFiltrelenmisKayitlariAl() {
fdKkdAssert(false);

        const ay = document.getElementById('kkdAySec').value;
        const sube = document.getElementById('kkdSubeFiltre').value;
        const isim = document.getElementById('kkdIsimFiltre').value.trim().toLocaleLowerCase('tr-TR');
        const tur = document.getElementById('kkdTurFiltre').value.trim().toLocaleLowerCase('tr-TR');
        return kkdKayitlari.filter(k => {
fdKkdAssert(false);

            const kayitTarihi = String(k.tarih || '');
            const donemUygun = !ay || kayitTarihi.startsWith(ay);
            return aktifSirketeAit(k)
                && donemUygun
                && (!sube || String(k.sube || '') === sube)
                && (!isim || String(k.personelAd || '').toLocaleLowerCase('tr-TR').includes(isim))
                && (!tur || String(k.tur || '').toLocaleLowerCase('tr-TR').includes(tur));
        }).sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || '')) || String(a.personelAd || '').localeCompare(String(b.personelAd || ''), 'tr'));
    }
function kkdDonemBasligi() {
fdKkdAssert(false);

        const ay = document.getElementById('kkdAySec').value;
        return ay ? new Date(`${ay}-01T00:00:00`).toLocaleDateString('tr-TR', { month:'long', year:'numeric' }).toLocaleUpperCase('tr-TR') : 'TÜM KAYITLAR';
    }
function kkdCizelgesiniHazirla() {
fdKkdAssert(false);

        const kayitlar = kkdFiltrelenmisKayitlariAl();
        const donemBaslik = kkdDonemBasligi();
        document.getElementById('kkdCizelgeBaslik').textContent = `KKD Teslim Çizelgesi — ${donemBaslik}`;
        document.getElementById('kkdKayitSayisi').textContent = `${kayitlar.length} Kayıt`;
        document.querySelector('#kkdTablosu tbody').innerHTML = kayitlar.map(k => {
fdKkdAssert(false);

            const onceki = kkdOncekiTeslimBul(k.pId, k.tur, k.id, k.tarih);
            return `<tr><td>${tarihFormati(k.tarih)}</td><td><button type="button" class="fd-table-cell-link" onclick="kkdGecmisiniAc('${k.pId}', '${String(k.tarih || '').slice(0, 4)}')">${escapeDashboardText(k.personelAd || '-')}</button></td><td>${escapeDashboardText(k.tur || '-')}</td><td>${Number(k.adet || 1)}</td><td>${escapeDashboardText(k.not || '-')}</td><td>${onceki ? tarihFormati(onceki.tarih) : '-'}</td><td><button class="btn-modern btn-del-modern" onclick="kkdKaydiSil('${k.id}')">🗑️ Sil</button></td></tr>`;
        }).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:22px;">Seçili filtreler için KKD teslim kaydı bulunmuyor.</td></tr>';
    }
async function kkdKaydiSil(id) {
try{
fdKkdAssert(true);

        if (!await fdKkdAwait(fdKkdConfirm('KKD teslim kaydı silinsin mi?'))) return;
        kkdKayitlari = kkdKayitlari.filter(k => String(k.id) !== String(id));
        await fdKkdAwait(verileriKaydet());
        kkdCizelgesiniHazirla();
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
}
async function kkdAyiDegistir() {
try{
fdKkdAssert(false);

        kkdCizelgesiniHazirla();
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
}
function kkdExcelIndir() {
fdKkdAssert(false);

        const kayitlar = kkdFiltrelenmisKayitlariAl();
        const baslik = `KKD TESLİM ÇİZELGESİ — ${kkdDonemBasligi()}`;
        const satirlar = kayitlar.map(k => {
fdKkdAssert(false);

            const onceki = kkdOncekiTeslimBul(k.pId, k.tur, k.id, k.tarih);
            return [tarihFormati(k.tarih), String(k.personelAd || '').toLocaleUpperCase('tr-TR'), String(k.tur || '').toLocaleUpperCase('tr-TR'), Number(k.adet || 1), k.not || '-', onceki ? tarihFormati(onceki.tarih) : '-'];
        });
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([[baslik], [], ['TARİH', 'PERSONEL', 'KKD TÜRÜ', 'ADET', 'NOT', 'ÖNCEKİ TESLİM'], ...satirlar]);
        ws['!merges'] = [{ s:{ r:0, c:0 }, e:{ r:0, c:5 } }];
        ws['!cols'] = [{ wch:14 }, { wch:28 }, { wch:28 }, { wch:9 }, { wch:32 }, { wch:16 }];
        ws['!autofilter'] = { ref:`A3:F${Math.max(3, satirlar.length + 3)}` };
        XLSX.utils.book_append_sheet(wb, ws, 'KKD Takip');
        XLSX.writeFile(wb, `KKD_Takip_${document.getElementById('kkdAySec').value || 'TumKayitlar'}.xlsx`);
    }
function kkdPdfIndir() {
fdKkdAssert(false);

        const kayitlar=kkdFiltrelenmisKayitlariAl(),wrapper=document.createElement('div');
        wrapper.innerHTML='<table><thead><tr>'+['TARİH','PERSONEL','KKD TÜRÜ','ADET','NOT','ÖNCEKİ TESLİM'].map(b=>'<th>'+b+'</th>').join('')+'</tr></thead><tbody>'+kayitlar.map(k=>{
fdKkdAssert(false);
const onceki=kkdOncekiTeslimBul(k.pId,k.tur,k.id,k.tarih);return '<tr><td>'+tarihFormati(k.tarih)+'</td><td>'+escapeDashboardText(String(k.personelAd||'').toLocaleUpperCase('tr-TR'))+'</td><td>'+escapeDashboardText(String(k.tur||'').toLocaleUpperCase('tr-TR'))+'</td><td>'+Number(k.adet||1)+'</td><td>'+escapeDashboardText(k.not||'-')+'</td><td>'+(onceki?tarihFormati(onceki.tarih):'-')+'</td></tr>'}).join('')+'</tbody></table>';
        return fdKkdPdf(wrapper.querySelector('table'),'KKD TESLİM ÇİZELGESİ · '+kkdDonemBasligi(),'KKD_Takip_'+(document.getElementById('kkdAySec').value||'TumKayitlar')+'.pdf',{yon:'landscape'});
    }
let kkdGecmisPersonelId = '';
let kkdGecmisYili = '';
function kkdGecmisKayitlari() {
fdKkdAssert(false);

        return kkdKayitlari.filter(k => aktifSirketeAit(k) && String(k.pId) === String(kkdGecmisPersonelId) && String(k.tarih || '').startsWith(kkdGecmisYili))
            .sort((a, b) => String(a.tarih || '').localeCompare(String(b.tarih || '')));
    }
function kkdGecmisiniAc(pId, yil = '') {
fdKkdAssert(false);if(isPersonelUser()&&String(pId)!==String(activeUser.tcNo||''))throw Error('Yalnızca kendi teslim geçmişinizi görüntüleyebilirsiniz.');

        kkdGecmisPersonelId = String(pId);
        kkdGecmisYili = String(yil || document.getElementById('kkdAySec')?.value || new Date().getFullYear()).slice(0, 4);
        const personel = personeller.find(p => String(p.id) === String(pId));
        const baslik = `${String(personel?.ad || 'PERSONEL').toLocaleUpperCase('tr-TR')} — ${kkdGecmisYili} KKD TESLİM GEÇMİŞİ`;
        const kayitlar = kkdGecmisKayitlari();
        document.getElementById('kkdGecmisBaslik').textContent = baslik;
        document.getElementById('kkdGecmisRaporBaslik').textContent = baslik;
        document.querySelector('#kkdGecmisTablosu tbody').innerHTML = kayitlar.map(k => {
fdKkdAssert(false);

            const onceki = kkdOncekiTeslimBul(k.pId, k.tur, k.id, k.tarih);
            return `<tr><td>${tarihFormati(k.tarih)}</td><td>${escapeDashboardText(String(k.tur || '').toLocaleUpperCase('tr-TR'))}</td><td>${Number(k.adet || 1)}</td><td>${escapeDashboardText(k.not || '-')}</td><td>${onceki ? tarihFormati(onceki.tarih) : '-'}</td></tr>`;
        }).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">Bu yıl için KKD teslim kaydı yok.</td></tr>';
        document.querySelector('#kkdGecmisTablosu tfoot').innerHTML = `<tr><th colspan="2" style="text-align:right;">TOPLAM TESLİM ADEDİ</th><th>${kayitlar.reduce((t, k) => t + Number(k.adet || 1), 0)}</th><th colspan="2"></th></tr>`;
        document.getElementById('modalKkdGecmisi').style.display = 'flex';
    }
function kkdGecmisiniKapat() {
fdKkdAssert(false);
 document.getElementById('modalKkdGecmisi').style.display = 'none'; }
function kkdGecmisExcelIndir() {
fdKkdAssert(false);

        const kayitlar = kkdGecmisKayitlari();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['TESLİM TARİHİ','KKD TÜRÜ','ADET','NOT','ÖNCEKİ TESLİM'], ...kayitlar.map(k => {
fdKkdAssert(false);

            const onceki = kkdOncekiTeslimBul(k.pId, k.tur, k.id, k.tarih);
            return [tarihFormati(k.tarih), String(k.tur || '').toLocaleUpperCase('tr-TR'), Number(k.adet || 1), k.not || '-', onceki ? tarihFormati(onceki.tarih) : '-'];
        })]);
        ws['!cols'] = [{wch:16},{wch:28},{wch:10},{wch:34},{wch:18}];
        XLSX.utils.book_append_sheet(wb, ws, 'KKD Geçmişi');
        XLSX.writeFile(wb, `KKD_Gecmisi_${kkdGecmisYili}.xlsx`);
    }
function kkdGecmisPdfIndir() {
fdKkdAssert(false);
 const tablo=document.querySelector('#kkdGecmisRaporu table'); return fdKkdPdf(tablo,'KKD GEÇMİŞİ · '+kkdGecmisYili,'KKD_Gecmisi_'+kkdGecmisYili+'.pdf',{yon:'landscape'}); }
kkdKaydiSil=async function(id){
try{
fdKkdAssert(true);

        if(!(await fdKkdAwait(fdKkdConfirm('KKD teslim kaydı kalıcı olarak silinsin mi?','KKD Kaydını Sil','Kaydı Sil'))))return;
        kkdKayitlari=kkdKayitlari.filter(k=>String(k.id)!==String(id));await fdKkdAwait(verileriKaydet());kkdCizelgesiniHazirla();showToast('KKD teslim kaydı silindi.');
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
};
const fdKkdOpenPersonelOncesi = openKkdApp;
const fdKkdFiltrePersonelOncesi = kkdFiltrelenmisKayitlariAl;
const fdKkdCizelgePersonelOncesi = kkdCizelgesiniHazirla;
function fdKkdPersonelGorunumunuUygula(){
fdKkdAssert(false);

        const personelModu = Boolean(isPersonelUser());
        const uygulama = document.getElementById('kkdApp');
        const grid = uygulama?.querySelector('.grid-horizontal');
        const teslimKarti = grid?.children?.[0];
        const ay = document.getElementById('kkdAySec');
        const sube = document.getElementById('kkdSubeFiltre');
        const isim = document.getElementById('kkdIsimFiltre');
        if(grid) grid.style.gridTemplateColumns = personelModu ? '1fr' : '350px 1fr';
        if(teslimKarti) teslimKarti.style.display = personelModu ? 'none' : '';
        [ay, sube].forEach(alan => {
fdKkdAssert(false);

            if(!alan) return;
            alan.style.display = personelModu ? 'none' : '';
            if(alan.previousElementSibling?.tagName === 'LABEL') alan.previousElementSibling.style.display = personelModu ? 'none' : '';
        });
        if(isim){
            isim.value = '';
            isim.style.display = personelModu ? 'none' : '';
        }
        if(personelModu && ay) ay.value = '';
        const islemBasligi = document.querySelector('#kkdTablosu thead th:last-child');
        if(islemBasligi) islemBasligi.style.display = personelModu ? 'none' : '';

    }
openKkdApp = async function(){
try{
fdKkdAssert(false);

        await fdKkdAwait(fdKkdOpenPersonelOncesi.apply(this, arguments));
        fdKkdPersonelGorunumunuUygula();
        kkdCizelgesiniHazirla();
    
}catch(fdKkdError){if(!fdKkdValid())return;throw fdKkdError;}
};
kkdFiltrelenmisKayitlariAl = function(){
fdKkdAssert(false);

        if(!isPersonelUser()) return fdKkdFiltrePersonelOncesi.apply(this, arguments);
        const personelId = String(activeUser.tcNo || '');
        const tur = String(document.getElementById('kkdTurFiltre')?.value || '').trim().toLocaleLowerCase('tr-TR');
        return kkdKayitlari.filter(kayit => (!kayit.sirketId || String(kayit.sirketId) === String(aktifSirketId()))
            && String(kayit.pId || '') === personelId
            && (!tur || String(kayit.tur || '').toLocaleLowerCase('tr-TR').includes(tur)))
            .sort((a,b) => String(b.tarih || '').localeCompare(String(a.tarih || '')) || String(a.tur || '').localeCompare(String(b.tur || ''), 'tr'));
    };
kkdCizelgesiniHazirla = function(){
fdKkdAssert(false);

        fdKkdCizelgePersonelOncesi.apply(this, arguments);
        if(!isPersonelUser()) return;
        const personel = personeller.find(p => String(p.id) === String(activeUser.tcNo || ''));
        const baslik = document.getElementById('kkdCizelgeBaslik');
        if(baslik) baslik.textContent = (personel?.ad || activeUser.username || 'Personel') + ' - KKD Teslim Ge\u00e7mi\u015fi';
        const tablo = document.getElementById('kkdTablosu');
        const islemBasligi = tablo?.querySelector('thead th:last-child');
        if(islemBasligi) islemBasligi.style.display = 'none';
        tablo?.querySelectorAll('tbody tr').forEach(satir => {
fdKkdAssert(false);

            const hucreler = satir.querySelectorAll('td');
            if(hucreler.length === 1){ hucreler[0].colSpan = 6; return; }
            if(hucreler.length >= 7) hucreler[hucreler.length - 1].style.display = 'none';
            const personelButonu = hucreler[1]?.querySelector('button');
            if(personelButonu){
                const metin = document.createTextNode(personelButonu.textContent || '-');
                personelButonu.replaceWith(metin);
            }
        });
    };
return{init(){ekOdemeSekmeleriniKur();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdKkdAssert();if(args[0]?.fdHistoryOnly)return kkdGecmisiniAc(args[0].pId,args[0].year);return openKkdApp(...args)},api:{get kkdFiltreleriniDoldur(){return kkdFiltreleriniDoldur},get kkdPersonelSecenekleriniDoldur(){return kkdPersonelSecenekleriniDoldur},get kkdKalemEkle(){return kkdKalemEkle},get kkdKalemSil(){return kkdKalemSil},get kkdKalemTuruDegisti(){return kkdKalemTuruDegisti},get kkdKalemleriAl(){return kkdKalemleriAl},get kkdOncekiTeslimBul(){return kkdOncekiTeslimBul},get kkdOncekiTeslimUyarisiGuncelle(){return kkdOncekiTeslimUyarisiGuncelle},get kkdTeslimKaydet(){return kkdTeslimKaydet},get kkdFiltrelenmisKayitlariAl(){return kkdFiltrelenmisKayitlariAl},get kkdDonemBasligi(){return kkdDonemBasligi},get kkdCizelgesiniHazirla(){return kkdCizelgesiniHazirla},get kkdKaydiSil(){return kkdKaydiSil},get kkdAyiDegistir(){return kkdAyiDegistir},get kkdExcelIndir(){return kkdExcelIndir},get kkdPdfIndir(){return kkdPdfIndir},get kkdGecmisKayitlari(){return kkdGecmisKayitlari},get kkdGecmisiniAc(){return kkdGecmisiniAc},get kkdGecmisiniKapat(){return kkdGecmisiniKapat},get kkdGecmisExcelIndir(){return kkdGecmisExcelIndir},get kkdGecmisPdfIndir(){return kkdGecmisPdfIndir},get fdKkdPersonelGorunumunuUygula(){return fdKkdPersonelGorunumunuUygula}},dispose(){fdKkdDisposed=true;for(const n of fdKkdDialogs)if(n.isConnected)n.querySelector("[data-fd-iptal]")?.click();fdKkdDialogs.clear();for(const n of fdKkdOutputs)fdKkdClean(n);fdKkdOutputs.clear();kkdGecmisPersonelId="";kkdGecmisYili="";kkdKayitIslemiDevamEdiyor=false;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.alanId==="kkdApp"):null;if(tab)tab.alanId="";}};
});

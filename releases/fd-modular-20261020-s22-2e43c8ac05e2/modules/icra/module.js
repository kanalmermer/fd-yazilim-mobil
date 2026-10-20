window.FDModules.define('icra',function(){

let fdLienDisposed=false,fdLienOverlay=null,fdLienWordOwner=null;const fdLienInitial=fdLienContext(),fdLienTimers=new Set(),fdLienReaders=new Set(),fdLienDialogs=new Set(),fdLienNodes=new Set();
function fdLienContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdLienValid(){return !fdLienDisposed&&fdLienInitial===fdLienContext()&&anaMenuModulErisimiVar('personel')}
function fdLienAssert(write=false){if(!fdLienValid())throw Error('Oturum değişti; İcra ekranını yeniden açın.');if(write&&(!isManagerUser()||isPersonelUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('İcra işlemi için yazma yetkiniz yok.')}
async function fdLienAwait(p){fdLienAssert();const result=await p;fdLienAssert();return result}
function fdLienTimeout(fn,ms,...args){const id=window.setTimeout(()=>{fdLienTimers.delete(id);if(fdLienValid())fn(...args)},ms);fdLienTimers.add(id);return id}
function fdLienShowOverlay(...args){fdLienAssert();window.showGlobalOverlay(...args);const node=document.getElementById('globalOverlay');fdLienOverlay=node?{node,html:node.innerHTML}:null}
function fdLienHideOverlay(){if(fdLienOverlay&&fdLienOverlay.node.innerHTML===fdLienOverlay.html)window.hideGlobalOverlay();fdLienOverlay=null}
function fdLienConfirm(...args){fdLienAssert();const before=document.getElementById('fdYuzerOnayKatmani'),p=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==before)fdLienDialogs.add(node);return p}
function fdLienReadBase64(file){fdLienAssert();return new Promise((resolve,reject)=>{const reader=new FileReader();fdLienReaders.add(reader);const done=fn=>v=>{fdLienReaders.delete(reader);fn(v)};reader.onload=done(()=>fdLienValid()?resolve(String(reader.result||'').split(',')[1]||''):reject(Error('Oturum değişti.')));reader.onerror=done(()=>reject(Error('PDF okunamadı.')));reader.onabort=done(()=>reject(Error('Dosya okuma iptal edildi.')));reader.readAsDataURL(file)})}
function fdLienClean(node){if(!node)return;if(node._url)URL.revokeObjectURL(node._url);node._url=null;node._blob=null;node.remove()}
function fdLienPdf(...args){fdLienAssert();args[3]={...args[3],fdIsCurrent:fdLienValid};const before=document.getElementById('fdOrtakCiktiOnizleme'),p=window.fdTabloPdfOnizle(...args),node=document.getElementById('fdOrtakCiktiOnizleme'),owned=node!==before?node:null;if(owned)fdLienNodes.add(owned);return Promise.resolve(p).then(v=>fdLienValid()?v:undefined,e=>{if(fdLienValid())throw e}).finally(()=>{if(!fdLienValid())fdLienClean(owned)})}
function fdLienCleanWord(){const o=fdLienWordOwner;fdLienWordOwner=null;if(o&&personelBelgeOnizlemeBlobu===o.blob){if(o.target?.isConnected)o.target.replaceWith(o.target.cloneNode(false));window.personelBelgeOnizlemeKapat()}}
function fdLienWord(...args){fdLienAssert();const p=window.personelBelgeOnizlemeAc(...args);fdLienWordOwner={blob:args[0],target:document.getElementById('personelBelgeOnizleme')};return Promise.resolve(p).then(v=>{if(fdLienValid())return v},e=>{if(fdLienValid())throw e})}
let icraListeModu = 'aktif';
function icraPdfDurumMesaji(mesaj, tur = 'bilgi') {
fdLienAssert(false);

        const alan = document.getElementById('icraPdfOkumaDurumu');
        if (!alan) return;
        const renkler = {
            bilgi: ['#eff6ff', '#1d4ed8', '#bfdbfe'], basari: ['#f0fdf4', '#166534', '#bbf7d0'],
            uyari: ['#fffbeb', '#92400e', '#fde68a'], hata: ['#fff1f2', '#be123c', '#fecdd3']
        };
        const [arkaPlan, yazi, kenar] = renkler[tur] || renkler.bilgi;
        alan.style.display = 'block'; alan.style.background = arkaPlan; alan.style.color = yazi; alan.style.border = `1px solid ${kenar}`;
        alan.textContent = mesaj;
    }
async function icraPdfMetniniOku(dosya) {
try{
fdLienAssert(false);

        if (!window.pdfjsLib) throw new Error('PDF okuma bileşeni yüklenemedi.');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const veri = new Uint8Array(await fdLienAwait(dosya.arrayBuffer()));
        const pdf = await fdLienAwait(window.pdfjsLib.getDocument({ data: veri }).promise);
        const sayfalar = [];
        for (let sayfaNo = 1; sayfaNo <= Math.min(pdf.numPages, 4); sayfaNo++) {
            const sayfa = await fdLienAwait(pdf.getPage(sayfaNo));
            const icerik = await fdLienAwait(sayfa.getTextContent());
            const ogeler = icerik.items
                .filter(item => String(item.str || '').trim())
                .map(item => ({ metin:String(item.str).trim(), x:Number(item.transform?.[4] || 0), y:Number(item.transform?.[5] || 0) }))
                .sort((a, b) => Math.abs(b.y - a.y) > 2.5 ? b.y - a.y : a.x - b.x);
            const satirlar = [];
            ogeler.forEach(oge => {
fdLienAssert(false);

                let satir = satirlar.find(item => Math.abs(item.y - oge.y) <= 2.5);
                if (!satir) { satir = { y:oge.y, ogeler:[] }; satirlar.push(satir); }
                satir.ogeler.push(oge);
            });
            satirlar.sort((a, b) => b.y - a.y);
            sayfalar.push(satirlar.map(satir => satir.ogeler.sort((a, b) => a.x - b.x).map(oge => oge.metin).join(' ')).join('\n'));
        }
        return pdfMetniniDuzelt(sayfalar.join('\n'));
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
function icraPdfEtiketDegeri(satirlar, ifadeler) {
fdLienAssert(false);

        for (let index = 0; index < satirlar.length; index++) {
            for (const ifade of ifadeler) {
                const eslesme = ifade.exec(satirlar[index]);
                if (!eslesme) continue;
                let deger = String(eslesme[1] || '').trim();
                if (!deger && satirlar[index + 1]) deger = satirlar[index + 1].trim();
                deger = deger.split(/\s+(?=(?:BOR[ÇC]LU|ALACAKLI|VEK[Iİ]L[Iİ]|T\.?C\.?|IBAN|DOSYA|ESAS|TAK[Iİ]P|HESAP)\b)/i)[0];
                return deger.replace(/^[\s:\-]+|[\s,;]+$/g, '').replace(/\s{2,}/g, ' ').slice(0, 120);
            }
        }
        return '';
    }
function icraPdfDosyaNoBul(satirlar) {
fdLienAssert(false);

        const dosyaDeseni = /\b((?:19|20)\d{2})\s*[\/-]\s*(\d{1,12})\b/;
        for (let index = 0; index < satirlar.length; index++) {
            const temiz = metniEsitle(satirlar[index]);
            if (!['DOSYA', 'ESAS', 'TAKIP'].some(etiket => temiz.includes(etiket))) continue;
            const yakinMetin = [satirlar[index], satirlar[index + 1], satirlar[index + 2]].filter(Boolean).join(' ');
            const eslesme = dosyaDeseni.exec(yakinMetin);
            if (eslesme) return `${eslesme[1]}/${eslesme[2]}`;
        }
        for (const satir of satirlar) {
            if (satir.length > 55) continue;
            const eslesme = dosyaDeseni.exec(satir);
            if (eslesme) return `${eslesme[1]}/${eslesme[2]}`;
        }
        return '';
    }
function icraPdfParaBul(satirlar) {
fdLienAssert(false);

        const etiketler = ['TOPLAM BORC', 'BORC TUTARI', 'BORC MIKTARI', 'TAKIP CIKISI', 'TAKIP CIKIS', 'ICRA TUTARI', 'BAKIYE BORC', 'DOSYA BORCU', 'DOSYA BAKIYESI', 'TOPLAM ALACAK', 'ALACAK TUTARI'];
        for (let index = 0; index < satirlar.length; index++) {
            const temizSatir = metniEsitle(satirlar[index]);
            if (!etiketler.some(etiket => temizSatir.includes(etiket))) continue;
            const yakinMetin = [satirlar[index], satirlar[index + 1], satirlar[index + 2]].filter(Boolean).join(' ')
                .replace(/\b(?:19|20)\d{2}\s*[\/-]\s*\d+\b/g, ' ')
                .replace(/\b\d{11}\b/g, ' ');
            const adaylar = yakinMetin.match(/(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,\d{1,2})?/g) || [];
            const tutarlar = adaylar.map(paraMetniniSayiyaCevir).filter(tutar => Number.isFinite(tutar) && tutar >= 100);
            if (tutarlar.length) return Math.max(...tutarlar);
        }
        return '';
    }
function icraPdfHesapAdiBul(satirlar, iban = '') {
fdLienAssert(false);

        const ibanTemiz = String(iban || '').replace(/\s/g, '').toUpperCase();
        const ibanSatiri = satirlar.findIndex(satir => String(satir).replace(/\s/g, '').toUpperCase().includes(ibanTemiz));
        if (ibanSatiri < 0) return '';
        for (let geri = 1; geri <= 4; geri++) {
            const aday = String(satirlar[ibanSatiri - geri] || '').trim();
            const temiz = metniEsitle(aday);
            if (!aday || aday.length < 4 || aday.length > 100 || !/[A-ZÇĞİÖŞÜ]/i.test(aday)) continue;
            if (temiz === 'BANKA ADI' || temiz.includes('IBAN') || temiz.includes('SUBE KODU') || temiz.includes('HESAP NO') || temiz.includes('HESAP BILGILERI') || temiz.includes('ODEME YAPILACAK')) continue;
            if (/^TR\d/i.test(aday.replace(/\s/g, '')) || /^\d[\d\s.,-]+$/.test(aday)) continue;
            return aday.replace(/^\s*(?:BANKA|BANKA ADI)\s*[:\-]\s*/i, '').trim();
        }
        return '';
    }
function icraPdfDaireVeTarihBul(satirlar) {
fdLienAssert(false);

        const ustSatirlar = (Array.isArray(satirlar) ? satirlar : []).slice(0, 24);
        const tarihDeseni = /\b([0-3]?\d)[.\/-]([01]?\d)[.\/-]((?:19|20)\d{2})\b/;
        let yaziTarihi = '';
        for (const satir of ustSatirlar) {
            const eslesme = String(satir || '').match(tarihDeseni);
            if (!eslesme) continue;
            const gun = String(eslesme[1]).padStart(2, '0');
            const ay = String(eslesme[2]).padStart(2, '0');
            yaziTarihi = `${eslesme[3]}-${ay}-${gun}`;
            break;
        }
        const daireIndex = ustSatirlar.findIndex(satir => {
fdLienAssert(false);

            const temiz = metniEsitle(satir);
            return temiz.includes('ICRA DAIRESI') && !temiz.includes('HESAP BILGILERI');
        });
        let yer = '';
        if (daireIndex >= 0) {
            const adaylar = [
                ustSatirlar[daireIndex],
                ustSatirlar[daireIndex - 1],
                ustSatirlar[daireIndex - 2],
                ustSatirlar[daireIndex - 3]
            ];
            for (const aday of adaylar) {
                let temiz = String(aday || '')
                    .replace(tarihDeseni, ' ')
                    .replace(/\bT\.?\s*C\.?\b/gi, ' ')
                    .replace(/İCRA\s+DAİRESİ/giu, ' ')
                    .replace(/ICRA\s+DAIRESI/giu, ' ')
                    .replace(/\b(?:19|20)\d{2}\s*[\/-]\s*\d+\s*(?:ESAS)?\b/giu, ' ')
                    .replace(/[^\p{L}\p{N}.\s-]/gu, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (!temiz || metniEsitle(temiz) === 'T C' || /^\d+$/.test(temiz)) continue;
                yer = temiz.toLocaleUpperCase('tr-TR');
                break;
            }
        }
        const icraDairesi = yer ? `T.C. ${yer} İCRA DAİRESİ` : '';
        return { icraDairesi, icraDairesiYer: yer.split(/\s+/)[0] || '', yaziTarihi };
    }
function icraPdfAlanlariniBul(metin) {
fdLienAssert(false);

        const satirlar = String(metin || '').split('\n').map(satir => satir.trim()).filter(Boolean);
        const ibanEslesme = /\bTR\s?\d{2}(?:\s?\d{4}){5}\s?\d{2}\b/i.exec(metin);
        const iban = ibanEslesme ? ibanEslesme[0].replace(/\s/g, '') : '';
        const baslik = icraPdfDaireVeTarihBul(satirlar);
        return {
            dosyaNo: icraPdfDosyaNoBul(satirlar),
            alacakli: icraPdfEtiketDegeri(satirlar, [/^\s*alacaklı\s*(?:kurum|taraf)?\s*(?:[:\-]\s*)?(.*)$/i, /^\s*alacakli\s*(?:kurum|taraf)?\s*(?:[:\-]\s*)?(.*)$/i]),
            hesapAdi: icraPdfHesapAdiBul(satirlar, iban),
            borclu: icraPdfEtiketDegeri(satirlar, [/^\s*(?:borçlu|borclu|muhatap|çalışan|calisan)(?:\s*(?:adı|adi|soyadı|soyadi))?\s*(?:[:\-]\s*)?(.*)$/i]),
            iban,
            toplamBorc: icraPdfParaBul(satirlar),
            ...baslik
        };
    }
function icraPdfPersoneliniSec(metin, borcluMetni = '') {
fdLienAssert(false);

        const tumMetin = metniEsitle(metin);
        const borclu = metniEsitle(borcluMetni);
        const tcAdaylari = new Set();
        const tcDeseni = /(?:^|\D)((?:\d[\s.-]?){10}\d)(?!\d)/g;
        let tcEslesmesi;
        while ((tcEslesmesi = tcDeseni.exec(String(metin || ''))) !== null) {
            tcAdaylari.add(tcEslesmesi[1].replace(/\D/g, ''));
        }
        const adaylar = personeller.filter(personel => aktifSirketeAit(personel) && (!personel.cikisTarihi || String(personel.cikisTarihi) === 'null')).map(personel => {
fdLienAssert(false);

            const ad = metniEsitle(personel.ad);
            const tc = String(personel.id || '').replace(/\D/g, '');
            const adParcalari = ad.split(' ').filter(parca => parca.length > 1);
            let puan = 0;
            if (tc.length === 11 && tcAdaylari.has(tc)) puan += 200;
            if (ad && borclu.includes(ad)) puan += 130;
            if (ad && tumMetin.includes(ad)) puan += 80;
            if (adParcalari.length >= 2 && adParcalari.every(parca => borclu.includes(parca))) puan += 90;
            else if (adParcalari.length >= 2 && adParcalari.every(parca => tumMetin.includes(parca))) puan += 45;
            return { personel, puan };
        }).filter(aday => aday.puan > 0).sort((a, b) => b.puan - a.puan);
        if (adaylar.length && adaylar[0].puan >= 80 && (!adaylar[1] || adaylar[0].puan > adaylar[1].puan)) {
            const select = document.getElementById('icraPersonel');
            select.value = String(adaylar[0].personel.id);
            select.dataset.seciliPersonelId = String(adaylar[0].personel.id);
            return adaylar[0].personel.ad;
        }
        return '';
    }
async function icraPdfBilgileriniCikar(dosya) {
try{
fdLienAssert(false);

        try {
            icraPdfDurumMesaji('PDF okunuyor; icra bilgileri çıkarılıyor…');
            const metin = await fdLienAwait(icraPdfMetniniOku(dosya));
            if (!metin || metin.length < 15) {
                icraPdfDurumMesaji('Bu PDF taranmış görüntü olabilir; metin bulunamadı. Alanları elle girebilirsiniz.', 'uyari');
                return;
            }
            const alanlar = icraPdfAlanlariniBul(metin);
            if (alanlar.dosyaNo) document.getElementById('icraDosyaNo').value = alanlar.dosyaNo.toLocaleUpperCase('tr-TR');
            if (alanlar.icraDairesi) document.getElementById('icraDairesi').value = alanlar.icraDairesi;
            if (alanlar.yaziTarihi) document.getElementById('icraYaziTarihi').value = alanlar.yaziTarihi;
            if (alanlar.alacakli) document.getElementById('icraAlacakli').value = alanlar.alacakli.toLocaleUpperCase('tr-TR');
            if (alanlar.hesapAdi) document.getElementById('icraHesapAdi').value = alanlar.hesapAdi.toLocaleUpperCase('tr-TR');
            if (alanlar.iban) {
                const ibanAlani = document.getElementById('icraIban'); ibanAlani.value = alanlar.iban; ibanGirisiFormatla(ibanAlani);
            }
            if (alanlar.toplamBorc) {
                const borcAlani = document.getElementById('icraToplamBorc');
                borcAlani.value = Number(alanlar.toplamBorc).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            const eslesenPersonel = icraPdfPersoneliniSec(metin, alanlar.borclu);
            const bulunan = [alanlar.icraDairesi && 'icra dairesi', alanlar.yaziTarihi && 'yazı tarihi', alanlar.dosyaNo && 'dosya no', alanlar.alacakli && 'alacaklı', alanlar.hesapAdi && 'hesap adı', alanlar.iban && 'IBAN', alanlar.toplamBorc && 'tutar', eslesenPersonel && 'personel'].filter(Boolean);
            icraPdfDurumMesaji(bulunan.length ? `PDF’den ${bulunan.join(', ')} aktarıldı. Kaydetmeden önce alanları kontrol edin.` : 'PDF okundu fakat alanlar otomatik bulunamadı. Bilgileri elle girebilirsiniz.', bulunan.length ? 'basari' : 'uyari');
        } catch (error) {
if(!fdLienValid())return;

            icraPdfDurumMesaji('PDF okunamadı. Dosya şifreli veya desteklenmeyen biçimde olabilir; alanları elle girebilirsiniz.', 'hata');
            console.warn('İcra PDF okuma hatası:', error);
        }
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
const ICRA_DILEKCE_ILK_DOCX_BASE64 = 'UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0lMtuwjAQRfeV+g+Rt1Vi6KKqKgKLPpYtUukHGHsCVv2Sx7z+vhMCUVUBkQpsIiUz994zVsaD0dqabAkRtXcl6xc9loGTXmk3K9nX5C1/ZBkm4ZQw3kHJNoBsNLy9GUw2ATAjtcOSzVMKT5yjnIMVWPgAjiqVj1Ykeo0zHoT8FjPg973eA5feJXApT7UHGw5eoBILk7LXNX1uSCIYZNlz01hnlUyEYLQUiep86dSflHyXUJBy24NzHfCOGhg/mFBXjgfsdB90NFEryMYipndhqYuvfFRcebmwpCxO2xzg9FWlJbT62i1ELwGRztyaoq1Yod2e/ygHpo0BvDxF49sdDymR4BoAO+dOhBVMP69G8cu8E6Si3ImYGrg8RmvdCZFoA6F59s/m2NqciqTOcfQBaaPjP8ber2ytzmngADHp039dm0jWZ88H9W2gQB3I5tv7bfgDAAD//wMAUEsDBBQABgAIAAAAIQAekRq37wAAAE4CAAALAAgCX3JlbHMvLnJlbHMgogQCKKAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArJLBasMwDEDvg/2D0b1R2sEYo04vY9DbGNkHCFtJTBPb2GrX/v082NgCXelhR8vS05PQenOcRnXglF3wGpZVDYq9Cdb5XsNb+7x4AJWFvKUxeNZw4gyb5vZm/cojSSnKg4tZFYrPGgaR+IiYzcAT5SpE9uWnC2kiKc/UYySzo55xVdf3mH4zoJkx1dZqSFt7B6o9Rb6GHbrOGX4KZj+xlzMtkI/C3rJdxFTqk7gyjWop9SwabDAvJZyRYqwKGvC80ep6o7+nxYmFLAmhCYkv+3xmXBJa/ueK5hk/Nu8hWbRf4W8bnF1B8wEAAP//AwBQSwMEFAAGAAgAAAAhAJiaCNIDCAAAvEgAABEAAAB3b3JkL2RvY3VtZW50LnhtbOxcS3PqOBbed1X/Bxfrvtjy21QnXWDD7VvTU5O63F7MUtgCNPhVskgCfybL2SabXmUX7v9qydiAwTAO6QmGThZgC+vTOd956Ei28/Mv94Ev3CKS4Ci8aoCm1BBQ6EYeDkdXjd+/9T6ZDSGhMPSgH4XoqjFDSeOX6x9/+Pmu5UXuNEAhFRhEmLTuYveqMaY0boli4o5RAJNmgF0SJdGQNt0oEKPhELtIvIuIJ8oSkNKjmEQuShI2ng3DW5g0Mjj3vhqaR+Ad68wBVdEdQ0LR/RoDvBpEEy3R3AWSjwBiGspgF0p5NZQucql2gNSjgJhUO0jacUglyunHIcm7SMZxSMouknkc0o47BbsOHsUoZD8OIxJAyk7JSAwgmUzjTww4hhQPsI/pjGFKeg4DcTg5QiLWa4UQKN6rEQwxiDzkK16OEl01piRsZf0/rfpz0VvL/tnXqgfyqw3LhrNEdE/9hOZ9SRXult2dLLGkrIkE+YzHKEzGOF5lh+BYNPbjOAe5PUTAbeDn193FoGKo7UttztIMa8Aq4me2C/yl5IcRgVTBmhxi1aOKCMUxc0kC5sHrgY+iZoNcUDH55ADyDoDuooqTRY5hZhiiu45ujoMrhlWOs7QKx8FrYkHFHLgtzAaAN30VhKzkcvAv3n0DK/GoN34dXG4jkfeFFI5hsgoajohep6C2gpsFG3zHo7cF1WcSTeM1Gn4b2pd1er3jhc4rsLLg3EwYyduE6Y9hzLJu4La+jMKIwIHPJGKhJrBoEVIL8E/mdPwrPUT3aTu3NT/wpgLPWo1rVqcNIm/Gv2P2g9qKIYFfmJsbZkfq2kBppK1slqNpa/bHWlusJvS+XjUkyVBUo9dZNTloCKc+3f3lhjcpMtBNKR04viH8K4mhy3RiF8EhRWwekBoib/+Py5puIZtSXJaeEVm2kmUn0otCmvA+iYuZadsxjRI+0LgdJpvnLqO6TTD0l92TeQ6qyHmLzXE22sRsFDETkX/vEqQAoICO3C4SJNuG0+uBboGgTOe86YbreIC14uXnyho7LVX4ncW5a9Hrb027yRvosnmfRVVT7hntzpbLq07PAqqlFiwq2TKQnC2L6ioAqlYaB7rWlcyCRTOEU1nUjfyI2yfF7fWYPNlof4mpMybqIie3/OKxb3d/ZZ/trwVX2JA9lVxXLNUuN2yN1OETSeowLO/HBCWI3KLGtXBIs0MuWy9D2V/bgtNePH7t9hePFeLWkHXNsXtyMW4NYGtqu8ej+ehMXPSGNG6zpgpxe5qc+84jV/fF9xcMDrLzj/E/xj/5+OyydcW8rAfeX6Qj5o2TyVpO3wXNyMWqsM4zcqXS6dDcWhtPL/2rUGNIlt512vrWaq90OWzrbGlolfOQN27UGMXL0xoja0qlOFxj4JAt8Vs+GjIoVVbNZesJKo9y1gy743ScdDVcf9Zqvt8AdMkBco/rvMGlrtmarDrrLLKXS8sxHKN0dfomLtesDSI6PhlnG7mooG5dEs/i8bfPi8fWRcwHknVICwAMVVvHdm21aF6EKeSLMIV8WI9zsYa+T4kLKVprmVm/QYLHPj6YWbfmvto60IXEgXoJthAvwRJAOehQZ2KLI9bWpZrVLHN1++1+XXPtdR/OFk/+4kn4N5wvnsLF07wgqVi+Su5aTltp122VXJM1SjlnmmTZhtar2xq51pzpPQVomr3tZ2pXdyzbLnDmaKoOtnelthoPc5ZdfD6c7WSRk23C7d8BP2SW95dz35rdH2EPCROeCinPhbM8F0IBJxSH0EPhTxexppcBABqwLE3eu4jZUKcuFjpI/Tm4GH8yRfgHDnw8EcJpwNIbd7MYkSQKkY8DPL+QOwgJFLpM53O314UEu3lIi3NZoDXBIS3OZe/roBJnY4q/w8bFOeQngfLdMByyukTAFA8gYQffHzCZIJrOJoOX53CGEn6F8PJfPtt8fwjghEJv8USaBfXF8uWK3NFAR+dF9v9arryy9C7+cp6ldzlnktm1bMfSi5wBsyvLPaX4qPDbOcsSXwXOlrdBh5gk9DfMn2k3pJ1bofVayNQs2vovf8yFSRROk+mqZhPGcDJhiwQPCgNWwRGKfR6LLoEsNid4wIgWsI+/P0xwKEx4JFIssFMfBfgyqot/uXCyT48z22H8uC91RvelTpYcrr2XP0IWvsVZdzobTX0YQhYNQuRP45+EAMLvD+n+QSgAURUiAvmxx9KCQKds5mZLv+Dl2Xt5Jv7L8+KBTdUvz3NhjBI4YNdBllqYAGj7xkRMomjYJZwNOosZY0mMfL/P8GiWuevCExrSSrJ3Q69eku/xxxmz68yHwojZ30OEZXoXTSiuVEdJtil11Hav8VFHbXB9uI5SOopqAx0UOVOltqTJG/viXOOtrfKPkun9o/0zImjxgEMsDLA/YsFB2PEcCZDMBcTDZV6Mkw3RSyx44p3sKjNSudPqqiWZaqUnR01DdeTSR/SKv1zU7a+e0+mq6tba6IOejB5ZsmRTN7bebVKAbhumsuaihJ5CbVfCWck7iRlCBc42n6A1DPP/lwP/du8pSlZTkvl+WrFoz70jQS69KeTJCmbvs05b2TMe9blgd1cNFiX8f48wDfkzxqaS2TIe/RPycWgU82uU5fuveDSm61NmZRoF6/OlP+RnYwQ97jKGlGbxYRSlHpSdjqZ006EYf5yULMOuZlUvcj8T/hp7y2fT7Q2mLpNS0dNOYs5Gerh8i11c/9uh6z8BAAD//wMAUEsDBBQABgAIAAAAIQDWZLNR9AAAADEDAAAcAAgBd29yZC9fcmVscy9kb2N1bWVudC54bWwucmVscyCiBAEooAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKySy2rDMBBF94X+g5h9LTt9UELkbEoh29b9AEUeP6gsCc304b+vSEnr0GC68HKumHPPgDbbz8GKd4zUe6egyHIQ6Iyve9cqeKker+5BEGtXa+sdKhiRYFteXmye0GpOS9T1gUSiOFLQMYe1lGQ6HDRlPqBLL42Pg+Y0xlYGbV51i3KV53cyThlQnjDFrlYQd/U1iGoM+B+2b5re4IM3bwM6PlMhP3D/jMzpOEpYHVtkBZMwS0SQ50VWS4rQH4tjMqdQLKrAo8WpwGGeq79dsp7TLv62H8bvsJhzuFnSofGOK723E4+f6CghTz56+QUAAP//AwBQSwMEFAAGAAgAAAAhAJbaNwPaBgAAyyAAABUAAAB3b3JkL3RoZW1lL3RoZW1lMS54bWzsWc2LGzcUvxf6Pwxzd/w1448l3mCP7WyS3WTJOik5ymN5RmvNyEjy7poQKMmpl0IhLT000FsPpTSlgYZeeul/spDQpn9EJY3tGdmabpLdQCi7hrU+fu/pp/eenp5nrl47ibB1BClDJG7Z5Ssl24KxT0YoDlr2vUG/0LAtxkE8ApjEsGXPIbOvbX/6yVWwxUMYQUvIx2wLtOyQ8+lWsch8MQzYFTKFsZgbExoBLro0KI4oOBZ6I1yslEq1YgRQbFsxiITaO+Mx8qE1kKJ//mJvL9X3sPgXcyYHfEwPpHKoySjsaFKWX2zOPEytI4BbtlhpRI4H8ITbFgaMi4mWXVJ/dnH7anElhHmObEaur/4WcguB0aSi5GgwXAk6juvU2iv9CoD5Jq5X79V6tZU+BQC+L3aacNF11iues8BmQEnToLtb71bLGj6jv7qBb7vyo+EVKGk6G/h+30ttmAElTXcD73aana6uX4GSZm0DXy+1u05dwytQiFE82UCX3FrVW+52BRkTvGOEN12nX68s4CmqmImuRD7mebEWgUNC+wKgnAs4ii0+n8Ix8AXOAxgNKbJ2URCKwJuCmDAxXKqU+qWq+C8/jmopj4ItCDLSyZDPNoYkH4v5FE15y74ptNoZyKuXL08fvzh9/Nvpkyenj39erL0ptwPiICv35oev/nn2ufX3r9+/efq1Gc+y+Nc/ffH69z/+Sz3XaH3z/PWL56++/fKvH58a4G0Khln4AEWQWbfhsXWXRGKDhgXgkL6bxCAEKCvRjgMGYiBlDOgeDzX07TnAwIDrQN2O96lIFybg9dmhRvggpDOODMBbYaQB9wjBHUKNe7ol18paYRYH5sXpLIu7C8CRaW1vzcu92VTEPTKp9EKo0dzHwuUggDHklpwjEwgNYg8Q0uy6h3xKGBlz6wGyOgAZTTJAQy2aUqEdFAm/zE0Ehb812+zdtzoEm9R34ZGOFGcDYJNKiDUzXgczDiIjYxDhLHIX8NBE8mBOfc3gjAtPBxATqzeCjJlk7tC5RveWSDNmt+/heaQjKUcTE3IXEJJFdsnEC0E0NXJGcZjF3mATEaLA2ifcSILoJ0T2hR9AnOvu+whq7j77bN8TacgcIHJmRk1HAhL9PM7xGECT8jaNtBTbpsgYHZ1ZoIX2LoQYHIMRhNa9GyY8mWo2T0nfDEVW2YEm29wEeqzKfgyZrJZOTIl4FzEtZA9gQHL47M3XEs8cxBGgeZpvT/SQ6YmrLjLGK/YnWipFVB5aM4k7LNL2l6t1PwRaWMk+M8frnGr+e5szJmQO30MGvrOMSOxvbZsBwNoCacAMgKgyTOlWiGjuT0XkcVJiM6PcWD+0qRuKa0VPhOIzK6C12sf9cLWPqDBefffMgL2YescMPE+lk5dM1uubPNx6VeMROkIff1HTBbN4H4p7xAC9rGkua5r/fU2Td54vK5nLSuaykjGLfIBKJi1e1COg5YMepSXKfeozRhgf8DmGu0yVPUyc/VFfDKqOElo9ZJqGorlYTsMFFKi2RQn/DPHwIARTsUxZrRCwheqAWVPCROGkho265QSeRXtklIyWy8vnmkIA8HRcFF7LcVGm8WS0Vk8f4K3Uq16gHrQuCUjZdyGRWUwnUTWQqC8HzyChdnYhLJoGFg2pPpeF+lp4RVxOFpAPxV0nYSTCTYT0SPopkV9698I9nWdMfdsVw/aakuvFeFojkQk3nUQmDENxeawPX7Cvm6lLNXrSFJs06o0P4WuZRNZyA471nnUszlzVFWp8MG3ZY/GTSTSjqdDHZKYCOIhbts8Xhn6fzDKljHcBCxOYmkr2HyEOqYVRJGI96wYcp9zKlbrc40dKrln6+CynvrJOhuMx9HnOSNoVc4kS4+w5wbJDZoL0QTg6toZ4Ru8CYSi3XpYGHCHGV9YcIZoJ7tSKa+lqcRS19y3pEQV4GoLFjZJN5glctVd0MvtQTNd3pfcXmxkG0knnvnXPFpITmaSZc4HIW9OcPz7cJZ9hleZ9jVWSutdzXXOZ6/JuifNfCBlq6WIaNcnYQC0d1aldYEGQWW4Vmnl3xEXfButRKy+IZV2pehsvtsnwUER+V1SrM8yZoip+tVDgLV9JJplAjS6zywm3ZhS17Iclt+14FdcrlBpur+BUnVKh4barhbbrVss9t1zqdiqPhFF4GJXdZO2++LGP54s392p84+19tCy1r/gkKhJVBxeVsHp7X64Y397LedtCwjIPa5V+s9rs1ArNartfcLqdRqHp1TqFbs2rd/tdz200+49s60iBnXbVc2q9RqFW9ryCUytJ+o1moe5UKm2n3m70nPajha3FzpffS/MqXtv/AgAA//8DAFBLAwQUAAYACAAAACEAm//o+hYFAACdDwAAEQAAAHdvcmQvc2V0dGluZ3MueG1stFdtb9s2EP4+YP/B8Oe5FvVqa00HW4rWFs061BkG7Bst0TYRURRIKo477L/vSImWk3JF0qEIENP33D13PB6P59e/PLB6ck+EpLy5mqJX3nRCmpJXtNlfTf+4LWaL6UQq3FS45g25mp6InP7y5scfXh9TSZQCNTkBikamrLyaHpRq0/lclgfCsHzFW9IAuOOCYQVfxX7OsLjr2lnJWYsV3dKaqtPc97x4OtDwq2knmnSgmDFaCi75TmmTlO92tCTDh7UQz/Hbm+S87BhplPE4F6SGGHgjD7SVlo19KxuAB0ty/7VN3LPa6h2R94ztHrmozhbPCU8btIKXREo4IFbbAGkzOg6/IDr7fgW+hy0aKjBHnlldRh69jMD/giAuycPLOBYDxxwsL3lo9TKe+MxDx8Si+NuCuSCouhdR+IGNQ39o8wsuWanq8DI6e0ZzbYsVPmB5rkjNSF62wehMd2JjvmX9nArsoQ90K7Do7/dQfqxM3+0bLvC2hnCgDCdQSRMTnf4PB6I/zJI8GLnOg15Adt5A1/nMOZsc05aIEq4etCzPm841AAXPdxuFFRClsiV1bXpYWRMMfo/pXmAG3cdKjE1Fdrir1S3ebhRvQekew/YSb9HDh1N7II3pEX9B97N46Ec9Xh6wwKUiYtPiErxlvFGC11av4r9xlUGnE3ARBwvT98bVpu+hYNFgBgl51BdveEV05J2gzz85bWC8Ixuk0xGHni9oRW71QWzUqSYFBL+hn8mqqd53UlFgNDv/HxF8LQDIK3j+CKVze2pJQbDqIE3fyZk5iaKm7Q0Vgot3TQW1892c0d2OCHBAoRZvoLyo4EeT57cEV/DUfie/nSR/gjLc3OAWyvJuzZXi7O1Yw9/u11yx+WX5wsBQSbv4xLk6q3pZHCC07CPV6Ih4mY+83IUglIRR4kQCPymGUn6CZHG4jF1I4KN4MbSFJ0iS+H7gRFZxsXLGFmSe569cSOihdTicyRNkhYKocCER/GVuxPei2BlbFHpRdO1EoiRMnDuNQ4RCZ97iOFiGmRMpkiBx7jRBSb5wRp0EYVKsnUgcXdtO+hhZJGFue+hjZBnDyfluJA5Wzlwvs2i9dEa9zJM8cfqB4wkCJ7KO42Tt9JOF4QKFTuQ/Kz5boeTaWVVZ4ReJc6d5FMbIeabXRZAXzgopYi+xD+ETJPeKxNyseQ/BrWWpHlZ/F3alW/+E9RYZZltB8eRGj7NzrbEVd2vaWHxL4J0nl8im21pwNusByXBdF9CELGBCY2lFZZuTnVnXN1jsR95BQzil8E6/P3Ppd5+IXwXv2h49Ctz2Ld2qoDAcLGmjPlBm5bLbbqxVA5PJBdQ11cd7YfI0pueYKmiR5mn8gE2rNbpKzG4/9ckua7HRbZTc4Lbtu/F2j66mNd0fFNINVMG3Cn71mC/bvT9gvsH8HjNfcKl3BtrDYpT5VnahF1hZMMpCKwtHWWRl0SiLrSzWMphyiIBh6Q4eBrvU8h2va34k1dsR/0LUJ0EecEvyfpaC8uK9YBiu5OQ+JQ8wqZGKKvgx2dKK4Qc9uPmmeQ/aNT7xTj3S1ZhWbh8z6NF2eArnj4xNiT+JRc94JYVy3JzYdhzNfuoDr6mEZ7SFKU5xYbGfDYbCtOLlO7hJsDLyBAUxPFR9p0GRmf6UeWnh3D+R3RpLUg2YNY1607+jKPbDVRDN8mVRzMJlns8W0fViFqFijRYALNfxP8Mltb+r3/wLAAD//wMAUEsDBBQABgAIAAAAIQCblI4WKQwAAPh1AAAPAAAAd29yZC9zdHlsZXMueG1svJ1Zc9s4Esfft2q/A0tPuw+JLB9ykhpnynaStWvixBM5Sc0jREIW1iSh4eEjn34BkJQgN0GxwV6/2Lr6h6P730DzkH77/TGJg3ue5UKmJ6PJ671RwNNQRiK9PRl9v/n06s0oyAuWRiyWKT8ZPfF89Pv7f/7jt4d3efEU8zxQgDR/l4Qno2VRrN6Nx3m45AnLX8sVT9WbC5klrFBPs9txwrK7cvUqlMmKFWIuYlE8jff39qajGpP1ocjFQoT8gwzLhKeFsR9nPFZEmeZLscob2kMf2oPMolUmQ57natBJXPESJtI1ZnIIQIkIM5nLRfFaDabukUEp88meeZTEG8ARDrAPANOQP+IYb2rGWFnaHBHhONM1R0QWx68zFiAqUYj9g6Yf+p82t1h5VERLHK7x0VjbsoItWb60iRw3wKM17inR852E7y5vU5mxeaxIKoICFQSBAeu/ai71P/OQP5rX9RD0AzWw90pdkQw/8AUr4yLXT7PrrH5aPzP/Psm0yIOHdywPhbhR3VRtJUI1e3Ga5mKk3uEsL05zwVrfXOoHre+EeWG9fCYiMRrrFvNf6s17Fp+M9vebV851D7Zei1l627xWZK9uvtk9ORnx9NX3mX5prrgnI5a9mp1qw3E9sOq/NdzV82em4RULhWmHLQquEsdkuqehsdB5av/obfPkW6ldwMpC1o0YQPV/jR2DGVf5RGWXWZXk1Lt88VmGdzyaFeqNk5FpS734/fI6EzJTiexk9Na0qV6c8URciCjiqfXBdCki/nPJ0+85jzav//nJJKP6hVCWqXp8cDw1URDn0cfHkK90alPvpkz75Is2iPWnS7Fp3Jj/3cAmtSfa7Jec6fweTJ4jTPdRiH1tkVujbWeWz8ZuPoVq6OClGjp8qYaOXqqh6Us1dPxSDb15qYYM5v/ZkEgjlf7N52EzgLqL41AjmuMQG5rj0BKa45AKmuNQAprjCHQ0xxHHaI4jTBGcQoauKLSC/cAR7d3c3WuEH3f3kuDH3b0C+HF3J3w/7u787sfdnc79uLuztx93d7LGc6utVnCpZJYWg1W2kLJIZcGDgj8Op7FUsUzRS8PTix7PSAZJgKkyW70QD6aFzDzfHSFGpP7reaHrvUAugoW4LTOeD+44T+95LFc8YFGkeITAjBdl5pgRn5jO+IJnPA05ZWDTQXUlGKRlMieIzRW7JWPxNCKevoZIkhTWAa3q56UWiSAI6oSFmRzeNcnI8sNnkQ+fKw0Jzso45kSsLzQhZljDawODGV4aGMzwysBghhcGls+opqimEc1UTSOasJpGNG9VfFLNW00jmreaRjRvNW34vN2IIjYp3t51TPofuzuPpT5NMbgfM3GbMrUBGL7c1MdMg2uWsduMrZaBPirdjrXHjG3nTEZPwQ3FmrYmUe3rTYicq1GLtBw+oVs0KnGteUTyWvOIBLbmDZfYldom6w3aBU09MyvnRatoDamXaGcsLqsN7XC1sWJ4hG0E8ElkOZkM2rEEEfxFb2e1Oyky36aXwzu2YQ2X1fOsRNq9GknQy1iGdzRp+OJpxTNVlt0NJn2ScSwfeERHnBWZrGLNlvy+cUkvyX9MVkuWC1MrbSH6L/XNBQ7BFVsNHtB1zERK47ePrxIm4oBuB3Fxc/U5uJErXWbqiaEBnsmikAkZsz4S+K+ffP5vmg6eqiI4fSIa7SnR4SEDOxcEi0xFkhERSW0zRSpI1lDD+4M/zSXLIhradcara4oKTkScsWRVbToItKXy4oPKPwS7IcP7wTKhjwtRieqGBGYdNszL+X95ODzVfZEByZGhr2Vhjj+ara6xpsMN3yZs4YZvEYw31fKg45dgsFu44YPdwlEN9jxmeS6cp1C9eVTDbXjU4x1e/NU8GctsUcZ0E9gAyWawAZJNoYzLJM0pR2x4hAM2POrxEoaM4REckjO8/2QiInOGgVF5wsCo3GBgVD4wMFIHDL9Cx4INv0zHgg2/VqeCEW0BLBhVnJEu/0RneSwYVZwZGFWcGRhVnBkYVZwdfAj4YqE2wXRLjIWkijkLSbfQpAVPVjJj2RMR8mPMbxnBAdKKdp3Jhb7ZRKbVRdwESH2MOibcbFc4Kif/5HOyrmkWZb8IjoiyOJaS6NjaZsExltvXru0yM3dyDO7CdcxCvpRxxDPHmNy2ql6eVbdlPO++6Uavw56fxe2yCGbL9dF+GzPd22nZFOxbZrsbbJvzaXM/S5vZFY9EmTQdhTdTTA/6G5uI3jI+3G282UlsWR71tIRtTndbbnbJW5bHPS1hm296Whqdbll26eEDy+5aA+G4K37WNZ4j+I67omht3NpsVyCtLdtC8LgrirakEpyGoT5bAL3TTzNu+37icdtjVOSmYOTkpvTWlRvRJbBv/F7olR2TNE1766snQN43m+hemfPPUlbH7bdOOPW/qetSbZzSnAetnIP+J662sox7HnunGzeid95xI3onIDeiVyZymqNSkpvSOze5Eb2TlBuBzlZwRcBlK2iPy1bQ3idbQYpPthqwC3Ajem8H3Ai0UCECLdQBOwU3AiVUYO4lVEhBCxUi0EKFCLRQ4QYMJ1RojxMqtPcRKqT4CBVS0EKFCLRQIQItVIhACxUi0EL13Ns7zb2ECilooUIEWqgQgRaq2S8OECq0xwkV2vsIFVJ8hAopaKFCBFqoEIEWKkSghQoRaKFCBEqowNxLqJCCFipEoIUKEWihVrca+gsV2uOECu19hAopPkKFFLRQIQItVIhACxUi0EKFCLRQIQIlVGDuJVRIQQsVItBChQi0UM3JwgFChfY4oUJ7H6FCio9QIQUtVIhACxUi0EKFCLRQIQItVIhACRWYewkVUtBChQi0UCGiKz7rU5Suy+wn+KOeziv2+5+6qjv1zb6V20Yd9Ec1vXKz+t+LcCblXdB64+GBqTf6QcQ8FtIconacVre55pII1InPr+fdd/jY9IFfulTfC2HOmQL4YV9LcEzlsCvkbUtQ5B12RbptCXadh13Z17YEy+BhV9I1umwuSlHLETDuSjOW8cRh3pWtLXM4xV052jKEM9yVmS1DOMFd+dgyPAp0cn5ufdRznqbr60sBoSscLcKxm9AVltBXTTqGwujrNDehr/fchL5udBNQ/nRi8I51o9AedqP8XA1lhnW1v1DdBKyrIcHL1QDj72qI8nY1RPm5GiZGrKshAetq/+TsJni5GmD8XQ1R3q6GKD9Xw6UM62pIwLoaErCuHrggOzH+roYob1dDlJ+r4eYO62pIwLoaErCuhgQvVwOMv6shytvVEOXnalAlo10NCVhXQwLW1ZDg5WqA8Xc1RHm7GqK6XG2Oomy5GuVhyxy3CbMMcQuyZYhLzpahR7VkWXtWSxbBs1qCvmp8jquWbKe5CX295yb0daObgPKnE4N3rBuF9rAb5edqXLXU5mp/oboJWFfjqiWnq3HVUqercdVSp6tx1ZLb1bhqqc3VuGqpzdX+ydlN8HI1rlrqdDWuWup0Na5acrsaVy21uRpXLbW5Glcttbl64ILsxPi7GlctdboaVy25XY2rltpcjauW2lyNq5baXI2rlpyuxlVLna7GVUudrsZVS25X46qlNlfjqqU2V+OqpTZX46olp6tx1VKnq3HVUqercdXSlTIRBF8BNUtYVgR03xd3wfJlwYZ/OeH3NOO5jO95FNAO9TNqlOOHrZ+/0mzza3/q84WaM/0N6NbtSlH1DbA10HzwMlr/TJU21j0J6h8Eq182Ha5P11YtGkPYVLhUbYX1d1c5mvrBspw9xSytb6Na/MV+3YiVAI07vqzWdGYThM2n62ndzFn1ua0Z6+x7oYN+5xRpaUjHPFW6cXXwbZ0IdvVQ9WceVz+bph5cppECPNQ/GVb1NHpkFUq9f87j+IpVn5Yr90djviiqdyd75msLnr0/r76Bz2mfmVTtBIy3O1M9rX+6zTHf1Xfy19cQOOZcZyP+l7xrmXBzScvQue4RDeu+GM//EbP78lf1q392f6qMqQ811dPJVANftbCt+Khix9Hl5p7xLBfa4+a1vb3z6cFkUr/j+i09+5f0DtdP2n9Jbzu4zmQW8cykjCp4TKv6O6vrsf9S65d5oNrk61+9U4vChrwOLS/bddh5WTdB6WUsUjXT/GKY+Q8/80of6+lvk0vzKH//PwAAAP//AwBQSwMEFAAGAAgAAAAhALQNgTjuAQAADgcAABQAAAB3b3JkL3dlYlNldHRpbmdzLnhtbOyVTW/bMAyG7wP2HwzfGztJ46VGkwJB0WFA94Gt212W5FiYJBqSEsf99aNkJ3GXHepddtnFoii9j0lRtG/vDkpGe26sAL2Kp5M0jrimwITeruLvTw9XyziyjmhGJGi+iltu47v12ze3Td7w4ht3DnfaCCna5oqu4sq5Ok8SSyuuiJ1AzTUulmAUcTg120QR83NXX1FQNXGiEFK4NpmlaRb3GPMaCpSloPwe6E5x7YI+MVwiEbStRG2PtOY1tAYMqw1Qbi3mo2THU0ToE2Z6fQFSghqwULoJJtNHFFAon6bBUvIMWIwDzC4AGeWHcYxlz0hQOeQINo6TnTiCDTh/F8wAwHajELP5MQ4/ePmAZZlj1TjcsUaJ1xJHKmKrIZGPS3BxwrXKn7ei+YetBkMKiSS8QRFegiiA/RPP0g/B5Ifg9yl4AxNbY4sxsbf9GDW5L1p28+56vpymi7BeAGvvw9qeSGzfOPFebLBHXrqjNz15v4pt9Qf3E9SXzg04B+o3P8axYcZb7qzR+GGIcWKf/T5v1ITy3qYgAfuZ7Bx0CDmIbJyyeBHROK0ZZj5GmpyT7syX5Zil2Ty9maeL//X4Z/XoxtAnUDuhxDN/ALMx0Fhuurdx2X7WPz4+hhmREpovn953tMFfbP0LAAD//wMAUEsDBBQABgAIAAAAIQDM/VhLPgIAALMIAAASAAAAd29yZC9mb250VGFibGUueG1s3JTPjpswEMbvlfoOyPcNhvzdaMlqt91Ilaoequ0DOMYEq9hGHickb9+xIdmoKFXYQyuVA5ix58d83xg/PB5UFe2FBWl0RpIRJZHQ3ORSbzPy43V9tyAROKZzVhktMnIUQB5XHz88NMvCaAcR5mtYKp6R0rl6GcfAS6EYjEwtNE4Wxirm8NVuY8Xsz119x42qmZMbWUl3jFNKZ6TD2FsopigkF58N3ymhXciPraiQaDSUsoYTrbmF1hib19ZwAYCaVdXyFJP6jEkmPZCS3BowhRuhmK6igML0hIaRqt4A02GAtAeYcXEYxlh0jBgzLzkyH8aZnTkyv+C8r5gLQL4bhEjHpzr8w6dfsCB3eTkMd+pR7HOZYyWD8pIohgmcnnFH5f1WfPllq41lmwpJuIMi3ARRAPs7eukfYSgOIe4l+AEKW3U/V9QsNVOY/4lVcmNlmKiZNiASnNuzKiOoZE2n1CtK6YSO/Z3EfiEvmQXhIWHhU9qGC6ZkdTxFoZEA7UQtHS9P8T2z0tfeToHc4sQONjQjLxNK05f1mrSRBKvDPyadzJ+7SIpFtdd9FxmfI9RHeOCE16Tl8MA5r8Fvxq0DPSdepRIQfRNN9N0opq84ktIZOjFFP7wz4yuOtF/63REbuIMcoT1HMDJfTP+KI0+1MxB8uEne8IanvoJ0MX+T11U17skLYv4s736oPCyrutLmZ2zzpNv6YfsPaPM7Nr634Z+1uTsCoq9yW7qrB4H//f/Tg6AbwOoXAAAA//8DAFBLAwQUAAYACAAAACEAmjqH1JkBAAAtAwAAEQAIAWRvY1Byb3BzL2NvcmUueG1sIKIEASigAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfJLBUtswEEDvneEfPLo7khWg4HHMQCEXyAxT3GnhJqQlUbFljbRg8lf9iH5YZTt2SMlw29U+PUm7ys7eqjJ6Bed1bWYkmTASgZG10mY5Iz+KeXxCIo/CKFHWBmZkDZ6c5QdfMmlTWTu4dbUFhxp8FEzGp9LOyArRppR6uYJK+EkgTCg+1a4SGFK3pFbIZ7EEyhk7phWgUAIFbYWxHY1ko1RyVNoXV3YCJSmUUIFBT5NJQrcsgqv83g1d5R1ZaVxb2IsOxZF+83oEm6aZNNMODfdP6K/FzV331FibtlcSSJ4pmaLGEvKMbsMQ+ZfH3yCxXx6TEEsHAmuXzwXqVXR5tfj75/v5/fl1Bw7Ftu3PsG5qp3xQ7GQBU+Cl0xbDMPsDdhYCXQqPizDdJw3qYr3nrI9Mu83Bq25/SM55h4z54Lx12iConDN+FDMec1awk5QnKWMPo3SAss2Q+leBikJz034UQ+Xn9NtlMSetL2l97LBgX9ND3vv+278VVptrf248jtlpzKdF0up2jYOg7+3uB8//AQAA//8DAFBLAwQUAAYACAAAACEASiQ/D+wBAADjAwAAEAAIAWRvY1Byb3BzL2FwcC54bWwgogQBKKAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACcU0tu2zAQ3RfoHQTtY8qOkwbGmEHroAjQTwxYSdYsNbKJUiRB0kbcy+QMuYN7r46kWKXbrqrVm9/jm4/g+qnR2Q59UNbM8/GoyDM00lbKrOf5ffnx7CrPQhSmEtoanOd7DPk1f/sGlt469FFhyIjChHm+idHNGAtyg40IIwobitTWNyKS6dfM1rWSeGPltkET2aQoLhk+RTQVVmduIMx7xtku/i9pZWWrLzyUe0d8HEpsnBYR+de2UgMbHFDaKHSpGuST8ykFBhOWYo2Bj4H1AB6trwK/mgDrESw2wgsZaXp8+u4cWGLDe+e0kiLSXPkXJb0Nto7ZXSc2a+uBpSlADaxQbr2Ke14AS034rAy9Tw/0gIR5sfbCbV7VDRaspNC4oNZ5LXRAYL8dcIuiXetSqFbfLs52KKP1WVA/aLGTPPsmArYDm+c74ZUwMe/TeqPD2oXo+SdrttkH8fNZH14Oz4cXYEOog2lFitW01duD08TO6OQQPhVaqqgx3NXUZvyH7nGqu9PQq07kpMqOb/zBurCNE4ZGzQZEs/4e7l1pb9ozeR3nqTM5gEcVNysnJK3n4mKankISgRV5saLdDusZHHBLHXjd8lOtWWN1zPk70B7XQ//P8vHlqKCvu6ajj25i+Jn4LwAAAP//AwBQSwECLQAUAAYACAAAACEA36TSbFoBAAAgBQAAEwAAAAAAAAAAAAAAAAAAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQItABQABgAIAAAAIQAekRq37wAAAE4CAAALAAAAAAAAAAAAAAAAAJMDAABfcmVscy8ucmVsc1BLAQItABQABgAIAAAAIQCYmgjSAwgAALxIAAARAAAAAAAAAAAAAAAAALMGAAB3b3JkL2RvY3VtZW50LnhtbFBLAQItABQABgAIAAAAIQDWZLNR9AAAADEDAAAcAAAAAAAAAAAAAAAAAOUOAAB3b3JkL19yZWxzL2RvY3VtZW50LnhtbC5yZWxzUEsBAi0AFAAGAAgAAAAhAJbaNwPaBgAAyyAAABUAAAAAAAAAAAAAAAAAGxEAAHdvcmQvdGhlbWUvdGhlbWUxLnhtbFBLAQItABQABgAIAAAAIQCb/+j6FgUAAJ0PAAARAAAAAAAAAAAAAAAAACgYAAB3b3JkL3NldHRpbmdzLnhtbFBLAQItABQABgAIAAAAIQCblI4WKQwAAPh1AAAPAAAAAAAAAAAAAAAAAG0dAAB3b3JkL3N0eWxlcy54bWxQSwECLQAUAAYACAAAACEAtA2BOO4BAAAOBwAAFAAAAAAAAAAAAAAAAADDKQAAd29yZC93ZWJTZXR0aW5ncy54bWxQSwECLQAUAAYACAAAACEAzP1YSz4CAACzCAAAEgAAAAAAAAAAAAAAAADjKwAAd29yZC9mb250VGFibGUueG1sUEsBAi0AFAAGAAgAAAAhAJo6h9SZAQAALQMAABEAAAAAAAAAAAAAAAAAUS4AAGRvY1Byb3BzL2NvcmUueG1sUEsBAi0AFAAGAAgAAAAhAEokPw/sAQAA4wMAABAAAAAAAAAAAAAAAAAAITEAAGRvY1Byb3BzL2FwcC54bWxQSwUGAAAAAAsACwDBAgAAQzQAAAAA';
const ICRA_DILEKCE_COKLU_DOCX_BASE64 = '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';
function icraBugunAnahtari() {
fdLienAssert(false);

        const bugun = new Date();
        return `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
    }
function icraDairesiYeriniBul(deger) {
fdLienAssert(false);

        const temiz = String(deger || '')
            .replace(/^\s*T\.?\s*C\.?\s*/iu, '')
            .replace(/\s+İCRA\s+DAİRESİ\s*$/iu, '')
            .replace(/\s+ICRA\s+DAIRESI\s*$/iu, '')
            .trim();
        return String(temiz.split(/\s+/)[0] || '').toLocaleUpperCase('tr-TR');
    }
function icraDairesiBasligi(deger) {
fdLienAssert(false);

        return String(deger || '')
            .replace(/^\s*T\.?\s*C\.?\s*/iu, '')
            .trim()
            .toLocaleUpperCase('tr-TR');
    }
function icraDilekceDonemiYaz(ayDegeri) {
fdLienAssert(false);

        const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
        const eslesme = String(ayDegeri || '').match(/^(\d{4})-(\d{2})/);
        return eslesme ? `${aylar[Number(eslesme[2]) - 1] || eslesme[2]} ${eslesme[1]}` : String(ayDegeri || '-');
    }
function icraDilekcePara(deger) {
fdLienAssert(false);

        const sayi = Number(deger || 0);
        return sayi.toLocaleString('tr-TR', { minimumFractionDigits:2, maximumFractionDigits:2 });
    }
function icraDilekceDosyaTarihi(icra) {
fdLienAssert(false);

        if (icra?.yaziTarihi) return String(icra.yaziTarihi).slice(0, 10);
        const zaman = Number(icra?.siraTarihi || 0);
        if (!Number.isFinite(zaman) || zaman <= 0) return icraBugunAnahtari();
        const tarih = new Date(zaman);
        return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}-${String(tarih.getDate()).padStart(2, '0')}`;
    }
function icraDilekceSatirlariniOlustur(guncelKayit) {
fdLienAssert(false);

        const personelId = String(guncelKayit?.pId || '');
        const kayitlar = icralar
            .filter(icra => String(icra.pId) === personelId && String(icra.id) !== String(guncelKayit?.id || ''))
            .concat(guncelKayit ? [guncelKayit] : [])
            .filter(icra => String(icra.durum || '') !== 'Kapandı' && icraKalanBorc(icra) > 0)
            .sort((a, b) => Number(a.siraTarihi || 0) - Number(b.siraTarihi || 0) || String(a.dosyaNo || '').localeCompare(String(b.dosyaNo || ''), 'tr'));
        return kayitlar.map((icra, index) => {
fdLienAssert(false);

            const odenen = (Array.isArray(icra.kesintiler) ? icra.kesintiler : []).reduce((toplam, kesinti) => toplam + Number(kesinti.tutar || 0), 0);
            return {
                dosyaTarihi: icraDilekceDosyaTarihi(icra),
                dosyaNo: String(icra.dosyaNo || ''),
                oncelik: index + 1,
                icraDairesi: String(icra.icraDairesi || ''),
                alacakli: String(icra.alacakli || ''),
                toplamBorc: Number(icra.toplamBorc || 0),
                odenen,
                kalan: Math.max(0, Number(icra.toplamBorc || 0) - odenen),
                durum: String(icra.durum || 'Aktif')
            };
        });
    }
function icraDilekceTuruBul(icra) {
fdLienAssert(false);

        if (String(icra?.dilekceTuru || '') === 'coklu') return 'coklu';
        if (String(icra?.dilekceTuru || '') === 'ilk') return 'ilk';
        if (/bekleyen|sıra/i.test(String(icra?.durum || ''))) return 'coklu';
        return icraDilekceSatirlariniOlustur(icra).length > 1 ? 'coklu' : 'ilk';
    }
function icraDilekceSablonBaytlari(tur) {
fdLienAssert(false);

        const base64 = tur === 'coklu' ? ICRA_DILEKCE_COKLU_DOCX_BASE64 : ICRA_DILEKCE_ILK_DOCX_BASE64;
        const ikili = atob(base64);
        const baytlar = new Uint8Array(ikili.length);
        for (let index = 0; index < ikili.length; index++) baytlar[index] = ikili.charCodeAt(index);
        return baytlar;
    }
function icraDocxKirmiziDoldur(paragraf, degerler) {
fdLienAssert(false);

        const W = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const gruplar = kiraDocxKirmiziGruplari(paragraf);
        gruplar.forEach((grup, index) => {
fdLienAssert(false);

            if (!grup.length) return;
            const yazilacak = String(degerler[index] ?? '');
            grup[0].textContent = yazilacak;
            if (/^\s|\s$/.test(yazilacak)) grup[0].setAttributeNS('http:\x2f\x2fwww.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
            else grup[0].removeAttributeNS('http:\x2f\x2fwww.w3.org/XML/1998/namespace', 'space');
            grup.slice(1).forEach(metin => {
fdLienAssert(false);
 metin.textContent = ''; });
            grup.forEach(metin => {
fdLienAssert(false);

                const run = metin.parentElement;
                const renk = run?.getElementsByTagNameNS(W, 'color')?.[0];
                if (renk) renk.setAttributeNS(W, 'w:val', '000000');
            });
        });
    }
function icraDocxHucreDoldur(hucre, deger) {
fdLienAssert(false);

        const W = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const paragraflar = [...hucre.getElementsByTagNameNS(W, 'p')];
        if (paragraflar[0]) icraDocxKirmiziDoldur(paragraflar[0], [deger]);
    }
function icraDilekceCokluTabloyuDoldur(xml, tablo, satirlar) {
fdLienAssert(false);

        const W = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const mevcutSatirlar = [...tablo.children].filter(eleman => eleman.localName === 'tr');
        if (mevcutSatirlar.length < 2) throw new Error('Çoklu icra dilekçesi tablosu bulunamadı.');
        const baslikSatiri = mevcutSatirlar[0];
        let trPr = [...baslikSatiri.children].find(eleman => eleman.localName === 'trPr');
        if (!trPr) {
            trPr = xml.createElementNS(W, 'w:trPr');
            baslikSatiri.insertBefore(trPr, baslikSatiri.firstChild);
        }
        if (![...trPr.children].some(eleman => eleman.localName === 'tblHeader')) trPr.appendChild(xml.createElementNS(W, 'w:tblHeader'));
        const ornekSatir = mevcutSatirlar[1].cloneNode(true);
        mevcutSatirlar.slice(1).forEach(satir => satir.remove());
        (satirlar.length ? satirlar : [{}]).forEach((satir, index) => {
fdLienAssert(false);

            const yeniSatir = ornekSatir.cloneNode(true);
            const hucreler = [...yeniSatir.children].filter(eleman => eleman.localName === 'tc');
            const bekliyor = /bekleyen|sıra/i.test(String(satir.durum || '')) && Number(satir.odenen || 0) <= 0;
            const degerler = [
                tarihFormati(satir.dosyaTarihi) || '-',
                satir.dosyaNo || '-',
                String(satir.oncelik || index + 1),
                satir.icraDairesi || '-',
                satir.alacakli || '-',
                icraDilekcePara(satir.toplamBorc),
                bekliyor ? '-' : icraDilekcePara(satir.odenen),
                bekliyor ? '-' : icraDilekcePara(satir.kalan)
            ];
            hucreler.forEach((hucre, hucreIndex) => icraDocxHucreDoldur(hucre, degerler[hucreIndex] ?? '-'));
            tablo.appendChild(yeniSatir);
        });
    }
function icraResmiDocxXml(deger) {
fdLienAssert(false);

        return String(deger ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
function icraResmiDocxRun(metin, secenek = {}) {
fdLienAssert(false);

        const boyut = Math.max(14, Math.round(Number(secenek.boyut || 12) * 2));
        const kalin = secenek.kalin ? '<w:b/><w:bCs/>' : '';
        const italik = secenek.italik ? '<w:i/><w:iCs/>' : '';
        return `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/>${kalin}${italik}<w:sz w:val="${boyut}"/><w:szCs w:val="${boyut}"/><w:lang w:val="tr-TR"/></w:rPr><w:t xml:space="preserve">${icraResmiDocxXml(metin)}</w:t></w:r>`;
    }
function icraResmiDocxParagraf(runlar, secenek = {}) {
fdLienAssert(false);

        const hizalama = secenek.hizalama === 'justify' ? 'both' : (secenek.hizalama || 'left');
        const once = Number(secenek.once || 0), sonra = Number(secenek.sonra ?? 120);
        const satir = Number(secenek.satir || 276), ilkGirinti = Number(secenek.ilkGirinti || 0);
        const girinti = ilkGirinti ? `<w:ind w:firstLine="${ilkGirinti}"/>` : '';
        const sonrakiyleTut = secenek.sonrakiyleTut ? '<w:keepNext/>' : '';
        return `<w:p><w:pPr>${sonrakiyleTut}<w:jc w:val="${hizalama}"/><w:spacing w:before="${once}" w:after="${sonra}" w:line="${satir}" w:lineRule="auto"/>${girinti}</w:pPr>${runlar.join('')}</w:p>`;
    }
function icraResmiDocxBaslikTablosu(daireBasligi, daireYeri) {
fdLienAssert(false);

        const kenarliklar = ['top','left','bottom','right','insideH','insideV']
            .map(yon => `<w:${yon} w:val="none" w:sz="0" w:space="0" w:color="auto"/>`).join('');
        const satir = (metin, hizalama, sonrakiyleTut) => `<w:tr><w:trPr><w:jc w:val="center"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="2943" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${icraResmiDocxParagraf([icraResmiDocxRun(metin, { boyut:12 })], { hizalama, sonra:0, satir:240, sonrakiyleTut })}</w:tc></w:tr>`;
        return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:jc w:val="center"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar><w:tblBorders>${kenarliklar}</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2943"/></w:tblGrid>${satir('T.C.', 'center', true)}${satir(daireBasligi, 'center', true)}${satir(daireYeri, 'right', false)}</w:tbl>`;
    }
function icraDilekceKisiAdiYaz(ad) {
fdLienAssert(false);

        return String(ad || '-').trim().toLocaleLowerCase('tr-TR').replace(/(^|[\s'’-])(\p{L})/gu, (eslesme, onEk, harf) => onEk + harf.toLocaleUpperCase('tr-TR'));
    }
function icraResmiDocxHucre(metin, genislik, secenek = {}) {
fdLienAssert(false);

        const arkaPlan = secenek.arkaPlan ? `<w:shd w:val="clear" w:color="auto" w:fill="${secenek.arkaPlan}"/>` : '';
        const hizalama = secenek.hizalama || 'left';
        const boyut = secenek.boyut || 8.5;
        return `<w:tc><w:tcPr><w:tcW w:w="${genislik}" w:type="dxa"/>${arkaPlan}<w:vAlign w:val="center"/><w:tcMar><w:top w:w="55" w:type="dxa"/><w:left w:w="55" w:type="dxa"/><w:bottom w:w="55" w:type="dxa"/><w:right w:w="55" w:type="dxa"/></w:tcMar></w:tcPr>${icraResmiDocxParagraf([icraResmiDocxRun(metin, { boyut, kalin:secenek.kalin })], { hizalama, sonra:0, satir:220 })}</w:tc>`;
    }
function icraResmiDocxImza(dilekceTarihi) {
fdLienAssert(false);

        return icraResmiDocxParagraf([icraResmiDocxRun(dilekceTarihi, { boyut:12 })], { hizalama:'right', sonra:500, satir:240 });
    }
function icraResmiDocxTablosu(satirlar) {
fdLienAssert(false);

        const basliklar = ['Dosya Tarihi','Dosya No','Sıra','İcra Dairesi','Alacaklı','İcra Tutarı','Ödenen','Kalan'];
        const genislikler = [1100,1100,550,1550,1800,1550,1550,1550];
        const baslik = `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${basliklar.map((baslik, index) => icraResmiDocxHucre(baslik, genislikler[index], { boyut:8.5, kalin:true, arkaPlan:'D9E2F3', hizalama:index === 3 || index === 4 ? 'left' : 'center' })).join('')}</w:tr>`;
        const govde = (satirlar.length ? satirlar : [{}]).map((satir, index) => {
fdLienAssert(false);

            const bekliyor = /bekleyen|sıra/i.test(String(satir.durum || '')) && Number(satir.odenen || 0) <= 0;
            const degerler = [
                tarihFormati(satir.dosyaTarihi) || '-', satir.dosyaNo || '-', String(satir.oncelik || index + 1),
                satir.icraDairesi || '-', satir.alacakli || '-', icraDilekcePara(satir.toplamBorc),
                bekliyor ? '-' : icraDilekcePara(satir.odenen), bekliyor ? '-' : icraDilekcePara(satir.kalan)
            ];
            return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${degerler.map((deger, sutun) => icraResmiDocxHucre(deger, genislikler[sutun], { boyut:8.5, hizalama:sutun === 3 || sutun === 4 ? 'left' : 'center' })).join('')}</w:tr>`;
        }).join('');
        return `<w:tbl><w:tblPr><w:tblW w:w="10750" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="6" w:color="64748B"/><w:left w:val="single" w:sz="6" w:color="64748B"/><w:bottom w:val="single" w:sz="6" w:color="64748B"/><w:right w:val="single" w:sz="6" w:color="64748B"/><w:insideH w:val="single" w:sz="4" w:color="94A3B8"/><w:insideV w:val="single" w:sz="4" w:color="94A3B8"/></w:tblBorders></w:tblPr><w:tblGrid>${genislikler.map(genislik => `<w:gridCol w:w="${genislik}"/>`).join('')}</w:tblGrid>${baslik}${govde}</w:tbl>`;
    }
async function icraResmiDilekceDocxOlustur(icra, personel, tur) {
try{
fdLienAssert(false);

        const zip = new JSZip();
        const daireBasligi = icraDairesiBasligi(icra.icraDairesi);
        const daireYeri = String(icra.icraDairesiYer || icraDairesiYeriniBul(icra.icraDairesi) || '-').toLocaleUpperCase('tr-TR');
        const dilekceTarihi = tarihFormati(icra.dilekceTarihi || icraBugunAnahtari());
        const tcNo = String(personel.tcNo || personel.tc || personel.id || icra.pId || '-');
        const personelAdi = icraDilekceKisiAdiYaz(personel.ad || icra.personelAd || '-');
        const girisTarihi = tarihFormati(personel.girisTarihi) || '-';
        const dar = tur === 'coklu';
        const govde = [];
        govde.push(icraResmiDocxBaslikTablosu(daireBasligi, daireYeri));
        govde.push(icraResmiDocxParagraf([], { hizalama:'center', sonra:15, satir:240, sonrakiyleTut:true }));
        govde.push(icraResmiDocxParagraf([], { hizalama:'left', sonra:300, satir:260, sonrakiyleTut:true }));
        govde.push(icraResmiDocxParagraf([
            icraResmiDocxRun('İLGİ: ', { boyut:12 }),
            icraResmiDocxRun(`${tarihFormati(icra.yaziTarihi)} tarihli ve ${String(icra.dosyaNo || '-')} Esas sayılı yazınız.`, { boyut:12 })
        ], { hizalama:'left', sonra:0, satir:260, sonrakiyleTut:true }));
        govde.push(icraResmiDocxParagraf([], { hizalama:'justify', sonra:0, satir:260, sonrakiyleTut:true }));
        govde.push(icraResmiDocxParagraf([
            icraResmiDocxRun(`İlgide kayıtlı yazınıza istinaden, ${tcNo} T.C. Kimlik numaralı personelimiz `, { boyut:12 }),
            icraResmiDocxRun(personelAdi, { boyut:12 }),
            icraResmiDocxRun(`, ${girisTarihi} tarihinden itibaren şirketimiz bünyesinde çalışmaktadır.`, { boyut:12 })
        ], { hizalama:'justify', sonra:150, satir:276, ilkGirinti:710 }));
        if (tur === 'ilk') {
            govde.push(icraResmiDocxParagraf([
                icraResmiDocxRun(`Söz konusu personel hakkında belirtilen icra takibine ilişkin kesinti işlemi, ${icraDilekceDonemiYaz(icra.baslangicAy)} döneminden itibaren uygulanacak olup, maaşının 1/4 oranındaki tutarı müdürlüğünüz hesabına havale/EFT yoluyla gönderilecektir.`, { boyut:12 })
            ], { hizalama:'justify', sonra:160, satir:276, ilkGirinti:710 }));
        } else {
            govde.push(icraResmiDocxParagraf([
                icraResmiDocxRun('Personelimiz hakkında hâlihazırda devam eden icra kesintisi bulunmakta olup, söz konusu dosyaya ilişkin kesinti işlemi mevcut icra kesintisi sona erdikten sonra sıraya alınarak gerçekleştirilecektir.', { boyut:12 })
            ], { hizalama:'justify', sonra:190, satir:276, ilkGirinti:710 }));
            govde.push(icraResmiDocxParagraf([icraResmiDocxRun('Devam Eden İcra Kesintileri', { boyut:11, kalin:true })], { hizalama:'left', sonra:80, satir:240, sonrakiyleTut:true }));
            const satirlar = Array.isArray(icra.dilekceSatirlari) && icra.dilekceSatirlari.length ? icra.dilekceSatirlari : icraDilekceSatirlariniOlustur(icra);
            govde.push(icraResmiDocxTablosu(satirlar));
            govde.push(icraResmiDocxParagraf([], { sonra:70, satir:120 }));
        }
        govde.push(icraResmiDocxParagraf([icraResmiDocxRun('Gereğini bilgilerinize arz ederiz.', { boyut:12 })], { hizalama:'left', sonra:220, satir:260, ilkGirinti:708 }));
        govde.push(icraResmiDocxParagraf([], { hizalama:'left', sonra:220, satir:260 }));
        govde.push(icraResmiDocxImza(dilekceTarihi));
        const solSag = dar ? 900 : 1559;
        const documentXml = `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${govde.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1361" w:right="${solSag}" w:bottom="1247" w:left="${solSag}" w:header="708" w:footer="708" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr></w:body></w:document>`;
        const stylesXml = `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="tr-TR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`;
        zip.file('[Content_Types].xml', `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http:\x2f\x2fschemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
        zip.folder('_rels').file('.rels', `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http:\x2f\x2fschemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http:\x2f\x2fschemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
        zip.folder('word').file('document.xml', documentXml).folder('_rels').file('document.xml.rels', `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http:\x2f\x2fschemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
        zip.folder('word').file('styles.xml', stylesXml);
        zip.folder('docProps').file('core.xml', `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http:\x2f\x2fschemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http:\x2f\x2fpurl.org/dc/elements/1.1/" xmlns:dcterms="http:\x2f\x2fpurl.org/dc/terms/" xmlns:xsi="http:\x2f\x2fwww.w3.org/2001/XMLSchema-instance"><dc:title>İcra Dairesine Cevap Dilekçesi</dc:title><dc:creator>Kanal Mermer Mad. Nak. San. Tic. Ltd. Şti.</dc:creator><cp:lastModifiedBy>FD Yazılım</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>`).file('app.xml', `\u003C?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http:\x2f\x2fschemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>FD Yazılım</Application></Properties>`);
        return zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression:'DEFLATE', compressionOptions:{level:9} });
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraDilekceBlobuOlustur(icraId) {
try{
fdLienAssert(false);

        if (typeof JSZip === 'undefined') throw new Error('Word belge bileşeni yüklenemedi.');
        const icra = icralar.find(kayit => String(kayit.id) === String(icraId));
        if (!icra) throw new Error('İcra kaydı bulunamadı.');
        const personel = personeller.find(kayit => String(kayit.id) === String(icra.pId) || String(kayit.tcNo || '') === String(icra.pId));
        if (!personel) throw new Error('İcra kaydına bağlı personel bulunamadı.');
        if (!icra.icraDairesi || !icra.yaziTarihi) throw new Error('İcra dairesi veya yazı tarihi eksik. Kaydı düzenleyip icra yazısı PDF’sini yeniden yükleyin.');
        return icraResmiDilekceDocxOlustur(icra, personel, icraDilekceTuruBul(icra));
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
function icraDilekceDosyaAdi(icra) {
fdLienAssert(false);

        const temiz = deger => String(deger || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return `ICRA_DILEKCESI_${temiz(icra?.personelAd || 'PERSONEL')}_${temiz(icra?.dosyaNo || 'DOSYA')}.docx`;
    }
async function icraDilekceAc(icraId) {
try{
fdLienAssert(false);

        const icra = icralar.find(kayit => String(kayit.id) === String(icraId));
        if (!icra) return alert('İcra kaydı bulunamadı.');
        fdLienShowOverlay('İcra dilekçesi hazırlanıyor', 'Resmî Word şablonu dolduruluyor...');
        try {
            const blob = await fdLienAwait(icraDilekceBlobuOlustur(icra.id));
            await fdLienAwait(fdLienWord(blob, icraDilekceDosyaAdi(icra), icraDilekceTuruBul(icra) === 'coklu' ? 'Birden Fazla İcrası Olan Personel Dilekçesi' : 'İlk İcrası Olan Personel Dilekçesi', { pdfIndir:true }));
        } catch (error) {
if(!fdLienValid())return;

            console.error('İcra dilekçesi:', error);
            alert('İcra dilekçesi hazırlanamadı: ' + (error.message || error));
        } finally {
if(fdLienValid()){

            fdLienHideOverlay();
        
}
}
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
function icraPersonelListesiniDoldur() {
fdLienAssert(false);

        const select = document.getElementById('icraPersonel');
        if (!select) return;
        const oncekiSecim = String(select.value || select.dataset.seciliPersonelId || '');
        select.innerHTML = '<option value="">Personel seçin</option>';
        personeller
            .filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null'))
            .sort((a, b) => String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'))
            .forEach(p => {
fdLienAssert(false);

                const option = document.createElement('option');
                option.value = String(p.id);
                option.textContent = `${p.ad} — ${p.sube || 'Şube yok'}`;
                select.appendChild(option);
            });
        if ([...select.options].some(option => String(option.value) === oncekiSecim)) {
            select.value = oncekiSecim;
            select.dataset.seciliPersonelId = oncekiSecim;
        }
    }
function icraSekmeDegistir(mod, button) {
fdLienAssert(false);

        icraListeModu = mod;
        document.querySelectorAll('#icraApp .module-subnav button').forEach(el => el.classList.remove('active'));
        if (button) button.classList.add('active');
        const baslik = document.getElementById('icraListeBaslik');
        if (baslik) baslik.textContent = mod === 'biten' ? '🗃️ Biten İcralar' : '⚖️ Aktif İcralar';
        renderIcraListesi();
    }
function icraYeniKayitAc() {
fdLienAssert(true);

        if (activeUser?.rol === 'Personel') return;
        icraFormReset();
        document.querySelectorAll('#icraApp .module-subnav button').forEach(el => el.classList.remove('active'));
        document.getElementById('btnIcraYeni').classList.add('active');
        icraPersonelListesiniDoldur();
        document.getElementById('icraBaslangicAy').value = new Date().toISOString().slice(0, 7);
        document.getElementById('icraKayitCard').style.display = 'flex';
    }
function icraYeniKayitKapat() {
fdLienAssert(false);

        document.getElementById('icraKayitCard').style.display = 'none';
        icraFormReset();
        icraSekmeDegistir(icraListeModu, document.getElementById(icraListeModu === 'biten' ? 'btnIcraBiten' : 'btnIcraAktif'));
    }
function icraPdfAlanBilgisi(tur) {
fdLienAssert(false);

        const bitis = tur === 'bitis';
        return {
            inputId: bitis ? 'icraBitisPdf' : 'icraPdf',
            bilgiId: bitis ? 'icraBitisPdfMevcut' : 'icraPdfMevcut',
            silId: bitis ? 'icraBitisPdfSil' : 'icraPdfSil',
            urlAlani: bitis ? 'bitisPdfUrl' : 'pdfUrl',
            adAlani: bitis ? 'bitisPdfAdi' : 'pdfAdi',
            baslik: bitis ? 'İcra Bitiş / Borcu Yoktur Yazısı' : 'İcra Yazısı'
        };
    }
function icraPdfDurumunuGoster(icra, tur) {
fdLienAssert(false);

        const alan = icraPdfAlanBilgisi(tur);
        const bilgi = document.getElementById(alan.bilgiId);
        if (!bilgi) return;
        const url = String(icra?.[alan.urlAlani] || '');
        const dosyaAdi = String(icra?.[alan.adAlani] || alan.baslik);
        if (!url) {
            bilgi.textContent = tur === 'bitis'
                ? 'Bitiş veya borcu yoktur yazısını buradan ekleyebilirsiniz. En fazla 10 MB.'
                : 'Kayıtlı icra yazısı bulunmuyor. En fazla 10 MB.';
            return;
        }
        bilgi.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; padding:8px 9px; border:1px solid #bfdbfe; border-radius:8px; background:#eff6ff;">
                <span style="color:#334155; font-weight:750;">📎 ${escapeHtml(dosyaAdi)}</span>
                <span class="action-btns">
                    <button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(url)}, ${JSON.stringify(String(icra?.dosyaNo || ''))}, ${JSON.stringify(alan.baslik)})'>👁️ Görüntüle</button>
                    <button type="button" class="btn-modern btn-del-modern" onclick="icraPdfSilmekIcinIsaretle('${tur}')">🗑️ Sil</button>
                </span>
            </div>`;
    }
async function icraPdfSilmekIcinIsaretle(tur) {
try{
fdLienAssert(true);

        const alan = icraPdfAlanBilgisi(tur);
        if (!await fdLienAwait(fdLienConfirm(`${alan.baslik} silinsin mi? Silme işlemi değişiklikleri kaydettiğinizde uygulanacaktır.`))) return;
        document.getElementById(alan.silId).value = '1';
        document.getElementById(alan.inputId).value = '';
        document.getElementById(alan.bilgiId).innerHTML =
            '<span style="display:block; padding:8px 9px; border:1px solid #fecaca; border-radius:8px; background:#fff1f2; color:#be123c; font-weight:800;">🗑️ Değişiklikleri kaydettiğinizde bu PDF silinecek.</span>';
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraPdfDosyasiSecildi(tur) {
try{
fdLienAssert(true);

        const alan = icraPdfAlanBilgisi(tur);
        const input = document.getElementById(alan.inputId);
        document.getElementById(alan.silId).value = '0';
        if (input.files && input.files[0]) {
            document.getElementById(alan.bilgiId).innerHTML =
                `<span style="display:block; padding:8px 9px; border:1px solid #bbf7d0; border-radius:8px; background:#f0fdf4; color:#166534; font-weight:800;">📎 Yeni dosya seçildi: ${escapeHtml(input.files[0].name)}</span>`;
            if (tur === 'ana') await fdLienAwait(icraPdfBilgileriniCikar(input.files[0]));
            return;
        }
        const editId = document.getElementById('icraEditId').value;
        const icra = icralar.find(i => String(i.id) === String(editId));
        icraPdfDurumunuGoster(icra, tur);
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
let icraDuzenlenenKayitId = '';
function icraFormReset() {
fdLienAssert(false);

        const form = document.getElementById('icraForm');
        if (form) form.reset();
        if (form) {
            delete form.dataset.duzenlenenKayitId;
            delete form.dataset.orijinalPersonelId;
            delete form.dataset.orijinalDosyaNo;
        }
        icraDuzenlenenKayitId = '';
        document.getElementById('icraPersonel').dataset.seciliPersonelId = '';
        document.getElementById('icraEditId').value = '';
        document.getElementById('icraPdfSil').value = '0';
        document.getElementById('icraBitisPdfSil').value = '0';
        document.getElementById('icraKayitBaslik').textContent = '⚖️ Yeni İcra Kesintisi';
        document.getElementById('btnIcraKaydet').textContent = '💾 İcra Kaydını Kaydet';
        document.getElementById('icraBaslangicAy').value = new Date().toISOString().slice(0, 7);
        document.getElementById('icraPdfMevcut').textContent = 'En fazla 10 MB';
        const pdfOkumaDurumu = document.getElementById('icraPdfOkumaDurumu');
        if (pdfOkumaDurumu) { pdfOkumaDurumu.style.display = 'none'; pdfOkumaDurumu.textContent = ''; }
        document.getElementById('icraBitisPdfGroup').style.display = 'none';
        document.getElementById('icraBitisPdfMevcut').textContent = 'Biten icra kaydını düzenlerken resmi yazıyı ekleyebilirsiniz. En fazla 10 MB.';
    }
function icraDuzenle(id) {
fdLienAssert(true);

        const icra = icralar.find(i => String(i.id) === String(id));
        if (!icra || activeUser?.rol === 'Personel') return;
        icraFormReset();
        icraPersonelListesiniDoldur();
        icraDuzenlenenKayitId = String(icra.id);
        const form = document.getElementById('icraForm');
        form.dataset.duzenlenenKayitId = String(icra.id);
        form.dataset.orijinalPersonelId = String(icra.pId || '');
        form.dataset.orijinalDosyaNo = String(icra.dosyaNo || '');
        document.getElementById('icraEditId').value = String(icra.id);
        document.getElementById('icraPersonel').value = String(icra.pId || '');
        document.getElementById('icraPersonel').dataset.seciliPersonelId = String(icra.pId || '');
        document.getElementById('icraDosyaNo').value = icra.dosyaNo || '';
        document.getElementById('icraDairesi').value = icra.icraDairesi || '';
        document.getElementById('icraYaziTarihi').value = String(icra.yaziTarihi || '').slice(0, 10);
        document.getElementById('icraAlacakli').value = icra.alacakli || '';
        document.getElementById('icraBaslangicAy').value = String(icra.baslangicAy || '').slice(0, 7);
        document.getElementById('icraToplamBorc').value = Number(icra.toplamBorc || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('icraHesapAdi').value = icra.hesapAdi || '';
        document.getElementById('icraIban').value = String(icra.iban || '').replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('icraAciklama').value = icra.aciklama || '';
        document.getElementById('icraBitisPdfGroup').style.display = '';
        icraPdfDurumunuGoster(icra, 'ana');
        icraPdfDurumunuGoster(icra, 'bitis');
        document.getElementById('icraKayitBaslik').textContent = '✏️ İcra Kaydını Düzenle';
        document.getElementById('btnIcraKaydet').textContent = '💾 Değişiklikleri Kaydet';
        document.getElementById('icraKayitCard').style.display = 'flex';
    }
async function openIcraApp() {
try{
fdLienAssert(false);

        if (!activeUser) return;
        anaMenuDonusButonunuGoster();
        ['appHub', 'personelDashboardApp', 'personelApp', 'izinTakipApp', 'puantajApp', 'sirketApp', 'avansApp', 'ekOdemeApp', 'kkdApp'].forEach(id => {
fdLienAssert(false);

            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        document.getElementById('icraApp').style.display = 'block';
        workspaceSekmesiniAktifEt('icra');
        document.getElementById('icraKayitCard').style.display = 'none';
        document.getElementById('btnIcraYeni').style.display = activeUser.rol === 'Personel' ? 'none' : '';
        icraSekmeDegistir('aktif', document.getElementById('btnIcraAktif'));
        if (!document.getElementById('icraBaslangicAy').value) {
            document.getElementById('icraBaslangicAy').value = new Date().toISOString().slice(0, 7);
        }
        icraPersonelListesiniDoldur();
        renderIcraListesi();
        if (SUPABASE_MODE && fdModulVerisiTazeMi('icra')) return;
        try {
            if (SUPABASE_MODE) {
                await fdLienAwait(supabaseVerileriniYukle('icra'));
                icraPersonelListesiniDoldur();
                renderIcraListesi();
                return;
            }
            const response = await fdLienAwait(fetch(`${GOOGLE_SCRIPT_URL}?modul=icra&_=${Date.now()}`, { cache: 'no-store' }));
            if (!response.ok) throw new Error(`İcra verisi alınamadı (${response.status})`);
            const data = await fdLienAwait(response.json());
            if (data.basarili === false) throw new Error(data.hata || 'İcra verisi alınamadı.');

            if (Array.isArray(data.personeller)) {
                personeller = data.personeller;
                personeller.forEach(p => p.id = String(p.id));
                yuklenenVeriler.add('personeller');
            }
            if (Array.isArray(data.sirketler)) {
                sirketler = data.sirketler;
                yuklenenVeriler.add('sirketler');
            }
            if (Array.isArray(data.subeler)) {
                subeler = data.subeler;
                yuklenenVeriler.add('subeler');
            }
            if (Array.isArray(data.icralar)) {
                icralar = data.icralar.map(i => {
fdLienAssert(false);

                    if (typeof i.kesintiler === 'string') {
                        try { i.kesintiler = JSON.parse(i.kesintiler); } catch (e) {
if(!fdLienValid())return;
 i.kesintiler = []; }
                    }
                    if (!Array.isArray(i.kesintiler)) i.kesintiler = [];
                    return i;
                });
                yuklenenVeriler.add('icralar');
            }

            veriOnbelleginiKaydet();
            icraPersonelListesiniDoldur();
            renderIcraListesi();
        } catch (error) {
if(!fdLienValid())return;

            console.error('İcra ekranı yüklenemedi:', error);
            if (!icralar.length) {
                document.getElementById('icraListeBody').innerHTML =
                    '<tr><td colspan="8" style="text-align:center; color:#dc2626; padding:22px;">İcra kayıtları yüklenemedi. Sayfayı yenileyip tekrar deneyin.</td></tr>';
            } else {
                renderIcraListesi();
            }
        }
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
let icraKaydetmeDevamEdiyor = false;
async function icraKaydet(event) {
try{
fdLienAssert(true);

        event.preventDefault();
        if (icraKaydetmeDevamEdiyor) {
            showToast('İcra kaydı zaten kaydediliyor. Lütfen işlemin tamamlanmasını bekleyin.', 'warning');
            return;
        }
        const buton = document.getElementById('btnIcraKaydet');
        const oncekiYazi = buton?.textContent || '💾 İcra Kaydını Kaydet';
        icraKaydetmeDevamEdiyor = true;
        if (buton) {
            buton.disabled = true;
            buton.textContent = '⏳ Kaydediliyor...';
        }
        try {
            await fdLienAwait(icraKaydetIslemi(event));
        } catch (error) {
if(!fdLienValid())return;

            console.error('İcra kaydetme işlemi:', error);
            fdLienHideOverlay();
            showToast('İcra kaydı tamamlanamadı: ' + (error.message || 'Bağlantıyı kontrol edip yeniden deneyin.'), 'error');
        } finally {
if(fdLienValid()){

            icraKaydetmeDevamEdiyor = false;
            if (buton) {
                buton.disabled = false;
                buton.textContent = oncekiYazi;
            }
        
}
}
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraTekKaydiKaydet(kayit) {
try{
fdLienAssert(true);

        if (!SUPABASE_MODE) {
            return zamanAsimliBekle(verileriKaydet(), 25000, 'İcra kaydı zamanında tamamlanamadı. İnternet bağlantısını kontrol edin.');
        }
        if (!activeUser?.sirketId) throw new Error('Şirket oturumu bulunamadı.');
        const legacyId = supabaseKayitAnahtari('icralar', kayit, 0);
        const { error } = await fdLienAwait(zamanAsimliBekle(
            supabaseClient.from('portal_records').upsert({
                company_id: activeUser.sirketId,
                module: 'icralar',
                legacy_id: legacyId,
                record_year: supabaseKayitYili('icralar', kayit),
                employee_legacy_id: supabasePersonelKimligi(kayit, 'icralar') || null,
                data: kayit
            }, { onConflict:'company_id,module,legacy_id' }),
            25000,
            'İcra kaydı sunucuya gönderilirken zaman aşımına uğradı.'
        ));
        if (error) throw error;
        veriKayitGoruntusunuYenile('icralar');
        veriOnbelleginiKaydet();
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraKaydetIslemi(event) {
try{
fdLienAssert(true);

        event.preventDefault();
        const form = event.currentTarget;
        let editId = String(document.getElementById('icraEditId').value || icraDuzenlenenKayitId || form.dataset.duzenlenenKayitId || '');
        let mevcutKayit = editId ? icralar.find(i => String(i.id) === String(editId)) : null;
        if (!mevcutKayit && form.dataset.orijinalPersonelId && form.dataset.orijinalDosyaNo) {
            mevcutKayit = icralar.find(i =>
                String(i.pId) === String(form.dataset.orijinalPersonelId) &&
                metniEsitle(i.dosyaNo) === metniEsitle(form.dataset.orijinalDosyaNo)
            ) || null;
            if (mevcutKayit) editId = String(mevcutKayit.id);
        }
        const duzenlemeModu = Boolean(
            editId ||
            form.dataset.duzenlenenKayitId ||
            form.dataset.orijinalPersonelId ||
            String(document.getElementById('btnIcraKaydet').textContent || '').includes('Değişiklikleri')
        );
        const icraPersonelSelect = document.getElementById('icraPersonel');
        const pId = String(icraPersonelSelect.value || icraPersonelSelect.dataset.seciliPersonelId || '');
        const personel = personeller.find(p => String(p.id) === String(pId));
        if (!personel) { alert('Lütfen personel seçin.'); return; }
        if (duzenlemeModu && !mevcutKayit) {
            alert('Düzenlenen icra kaydı listede bulunamadı. İcra ekranını yenileyip kaydı yeniden Düzenle butonuyla açın.');
            return;
        }
        const girilenDosyaNo = document.getElementById('icraDosyaNo').value.trim();
        const dosyaNoAnahtari = metniEsitle(girilenDosyaNo);
        const tekrarEdenKayit = !duzenlemeModu
            ? icralar.find(i =>
                String(i.id) !== String(mevcutKayit?.id || editId) &&
                String(i.pId) === String(personel.id) &&
                metniEsitle(i.dosyaNo) === dosyaNoAnahtari
            )
            : null;
        if (dosyaNoAnahtari && tekrarEdenKayit) {
            alert(
                `⚠️ AYNI İCRA KAYDI ZATEN MEVCUT\n\n` +
                `T.C. KİMLİK NO: ${personel.id}\n` +
                `PERSONEL: ${personel.ad || '-'}\n` +
                `İCRA DOSYA NO: ${tekrarEdenKayit.dosyaNo || girilenDosyaNo}\n\n` +
                `Yeni kayıt oluşturulmadı. Mevcut kaydı düzenleyebilirsiniz.`
            );
            return;
        }

        const pdfDosyasi = document.getElementById('icraPdf').files[0] || null;
        const bitisPdfDosyasi = document.getElementById('icraBitisPdf').files[0] || null;
        const pdfSilinsin = document.getElementById('icraPdfSil').value === '1';
        const bitisPdfSilinsin = document.getElementById('icraBitisPdfSil').value === '1';
        const pdfAzamiMb = ayarSayisi('pdfAzamiMb', 10);
        if (pdfDosyasi && pdfDosyasi.size > pdfAzamiMb * 1024 * 1024) {
            alert(`PDF dosyası en fazla ${pdfAzamiMb} MB olabilir.`);
            return;
        }
        if (bitisPdfDosyasi && bitisPdfDosyasi.size > pdfAzamiMb * 1024 * 1024) {
            alert(`İcra bitiş / borcu yoktur PDF dosyası en fazla ${pdfAzamiMb} MB olabilir.`);
            return;
        }
        const devamEdenVar = icralar.some(i =>
            String(i.id) !== String(editId) &&
            String(i.pId) === String(personel.id) &&
            String(i.durum) === 'Aktif' &&
            icraKalanBorc(i) > 0
        );
        const kayit = {
            id: mevcutKayit?.id || `icra_${Date.now()}`,
            sirketId: String(aktifSirketId() || personel.sirketId || ''),
            pId: String(personel.id),
            personelAd: String(personel.ad || ''),
            sube: String(personel.sube || ''),
            dosyaNo: document.getElementById('icraDosyaNo').value.trim(),
            icraDairesi: document.getElementById('icraDairesi').value.trim().toLocaleUpperCase('tr-TR'),
            icraDairesiYer: icraDairesiYeriniBul(document.getElementById('icraDairesi').value),
            yaziTarihi: document.getElementById('icraYaziTarihi').value,
            alacakli: document.getElementById('icraAlacakli').value.trim(),
            baslangicAy: document.getElementById('icraBaslangicAy').value,
            toplamBorc: paraMetniniSayiyaCevir(document.getElementById('icraToplamBorc').value),
            hesapAdi: document.getElementById('icraHesapAdi').value.trim(),
            iban: document.getElementById('icraIban').value.replace(/\s/g, '').toUpperCase(),
            durum: mevcutKayit?.durum === 'Kapandı' ? 'Kapandı' : (devamEdenVar ? 'Bekleyen Sıra' : 'Aktif'),
            aciklama: document.getElementById('icraAciklama').value.trim(),
            kesintiler: Array.isArray(mevcutKayit?.kesintiler) ? mevcutKayit.kesintiler : [],
            siraTarihi: mevcutKayit?.siraTarihi || Date.now(),
            pdfAdi: pdfDosyasi ? pdfDosyasi.name : (pdfSilinsin ? '' : (mevcutKayit?.pdfAdi || '')),
            pdfBase64: pdfDosyasi ? await fdLienAwait(fdLienReadBase64(pdfDosyasi)) : '',
            pdfUrl: mevcutKayit?.pdfUrl || '',
            pdfId: mevcutKayit?.pdfId || '',
            pdfSil: Boolean(mevcutKayit && (pdfSilinsin || pdfDosyasi)),
            bitisPdfAdi: bitisPdfDosyasi ? bitisPdfDosyasi.name : (bitisPdfSilinsin ? '' : (mevcutKayit?.bitisPdfAdi || '')),
            bitisPdfBase64: bitisPdfDosyasi ? await fdLienAwait(fdLienReadBase64(bitisPdfDosyasi)) : '',
            bitisPdfUrl: mevcutKayit?.bitisPdfUrl || '',
            bitisPdfId: mevcutKayit?.bitisPdfId || '',
            bitisPdfSil: Boolean(mevcutKayit && (bitisPdfSilinsin || bitisPdfDosyasi)),
            dilekceTuru: mevcutKayit?.dilekceTuru || (devamEdenVar ? 'coklu' : 'ilk'),
            dilekceTarihi: mevcutKayit?.dilekceTarihi || icraBugunAnahtari()
        };
        kayit.dilekceSatirlari = icraDilekceSatirlariniOlustur(kayit);
        if (!kayit.dosyaNo || !kayit.icraDairesi || !kayit.yaziTarihi || !kayit.alacakli || !kayit.baslangicAy || !kayit.hesapAdi || !kayit.iban || kayit.toplamBorc <= 0) {
            alert('Lütfen zorunlu alanları eksiksiz doldurun.');
            return;
        }
        if (SUPABASE_MODE) {
            try {
                if (pdfDosyasi) {
                    const eskiId = String(mevcutKayit?.pdfId || '');
                    const driveDosyaAdi = driveBelgeDosyaAdi(personel.ad, 'İCRA TAKİP', 'İCRA YAZISI');
                    const yuklenen = await fdLienAwait(fdYazilimDrivePdfYukle(kayit.pdfBase64, driveDosyaAdi, eskiId.includes('/') ? '' : eskiId, 'İCRA TAKİP'));
                    if (eskiId.includes('/')) await fdLienAwait(fdYazilimSupabasePdfSil(eskiId));
                    kayit.pdfId = yuklenen.id; kayit.pdfUrl = yuklenen.url; kayit.pdfAdi = yuklenen.ad; kayit.pdfBase64 = ''; kayit.pdfSil = false;
                } else if (pdfSilinsin) {
                    const eskiId = String(mevcutKayit?.pdfId || '');
                    if (eskiId.includes('/')) await fdLienAwait(fdYazilimSupabasePdfSil(eskiId)); else await fdLienAwait(fdYazilimDrivePdfSil(eskiId));
                    kayit.pdfId = ''; kayit.pdfUrl = ''; kayit.pdfAdi = ''; kayit.pdfSil = false;
                }
                if (bitisPdfDosyasi) {
                    const eskiId = String(mevcutKayit?.bitisPdfId || '');
                    const driveDosyaAdi = driveBelgeDosyaAdi(personel.ad, 'İCRA TAKİP', 'BORCU YOKTUR');
                    const yuklenen = await fdLienAwait(fdYazilimDrivePdfYukle(kayit.bitisPdfBase64, driveDosyaAdi, eskiId.includes('/') ? '' : eskiId, 'İCRA TAKİP'));
                    if (eskiId.includes('/')) await fdLienAwait(fdYazilimSupabasePdfSil(eskiId));
                    kayit.bitisPdfId = yuklenen.id; kayit.bitisPdfUrl = yuklenen.url; kayit.bitisPdfAdi = yuklenen.ad; kayit.bitisPdfBase64 = ''; kayit.bitisPdfSil = false;
                } else if (bitisPdfSilinsin) {
                    const eskiId = String(mevcutKayit?.bitisPdfId || '');
                    if (eskiId.includes('/')) await fdLienAwait(fdYazilimSupabasePdfSil(eskiId)); else await fdLienAwait(fdYazilimDrivePdfSil(eskiId));
                    kayit.bitisPdfId = ''; kayit.bitisPdfUrl = ''; kayit.bitisPdfAdi = ''; kayit.bitisPdfSil = false;
                }
            } catch (error) {
if(!fdLienValid())return;

                alert('PDF Drive’daki FD YAZILIM klasörüne kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'));
                return;
            }
        }
        const eskiPersonelId = mevcutKayit?.pId;
        const eskiKayitAktifti = mevcutKayit?.durum === 'Aktif';
        if (mevcutKayit) {
            const index = icralar.findIndex(i => String(i.id) === String(editId));
            icralar[index] = kayit;
        } else {
            icralar.push(kayit);
        }
        if (mevcutKayit && eskiKayitAktifti && String(eskiPersonelId) !== String(kayit.pId)) {
            icraSiradakiniAktifEt(eskiPersonelId);
        }
        yuklenenVeriler.add('icralar');
        renderIcraListesi();
        fdLienShowOverlay('İcra kaydediliyor', SUPABASE_MODE ? 'Kayıt buluta aktarılıyor...' : 'Kayıt E-Tablo’ya aktarılıyor...');
        const dilekceOtomatikAcilsin = !mevcutKayit;
        let dilekceKaydiBasarili = false;
        try {
            await fdLienAwait(icraTekKaydiKaydet(kayit));
            kayit.pdfBase64 = '';
            kayit.bitisPdfBase64 = '';
            dilekceKaydiBasarili = true;
            zamanAsimliBekle(driveVerileriniYukleBaslangicta('icra'), 15000, 'Kayıt kaydedildi ancak liste yenilemesi gecikti.').catch(yenilemeHatasi => {
if(!fdLienValid())return;

                console.warn('İcra kaydı sonrası liste yenilemesi:', yenilemeHatasi);
                showToast('İcra kaydı kaydedildi; liste yenilemesi gecikti.', 'warning');
            });
            if (!mevcutKayit) {
                const mesaj = personelBildirimSablonunuDoldur('magicpassBildirimIcraKayitMetni', {
                    AD: personel.ad || 'Personel', DOSYA_NO: kayit.dosyaNo,
                    ALACAKLI: kayit.alacakli, TUTAR: paraFormatla(kayit.toplamBorc)
                });
                zamanAsimliBekle(personelKayitBildirimiGonder(personel.id, 'İcra Kaydı', mesaj, { messageCategory:'enforcement' }), 12000, 'Personel bildirimi zamanında tamamlanamadı.').catch(bildirimHatasi => {
if(!fdLienValid())return;

                    console.warn('İcra kaydedildi ancak personel bildirimi gönderilemedi:', bildirimHatasi);
                    showToast?.('İcra kaydedildi; personel bildirimi gönderilemedi.', 'warning');
                });
            }
            event.currentTarget.reset();
            document.getElementById('icraBaslangicAy').value = new Date().toISOString().slice(0, 7);
            icraYeniKayitKapat();
            icraSekmeDegistir('aktif', document.getElementById('btnIcraAktif'));
            showToast('İcra kaydı kaydedildi.', 'success');
        } finally {
if(fdLienValid()){

            fdLienHideOverlay();
            icraPersonelListesiniDoldur();
            renderIcraListesi();
            if (dilekceOtomatikAcilsin && dilekceKaydiBasarili) fdLienTimeout(() => icraDilekceAc(kayit.id), 0);
        
}
}
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
function renderIcraListesi() {
fdLienAssert(false);

        const body = document.getElementById('icraListeBody');
        if (!body) return;
        const aktifSirket = String(aktifSirketId() || '');
        const personelArama = String(document.getElementById('icraPersonelFiltre')?.value || '').trim().toLocaleLowerCase('tr-TR');
        const kayitlar = icralar.filter(i => {
fdLienAssert(false);

            if (activeUser?.rol === 'Personel') return String(i.pId) === String(activeUser.tcNo);
            return !aktifSirket || !i.sirketId || String(i.sirketId) === aktifSirket;
        }).filter(i => {
fdLienAssert(false);

            if (!personelArama) return true;
            return `${i.personelAd || ''} ${i.pId || ''} ${i.dosyaNo || ''}`.toLocaleLowerCase('tr-TR').includes(personelArama);
        }).filter(i => {
fdLienAssert(false);

            const bitmis = String(i.durum) === 'Kapandı' || icraKalanBorc(i) <= 0;
            return icraListeModu === 'biten' ? bitmis : !bitmis;
        }).sort((a, b) => String(b.baslangicAy || '').localeCompare(String(a.baslangicAy || '')));

        body.innerHTML = kayitlar.length ? kayitlar.map(i => {
fdLienAssert(false);

            if (!Array.isArray(i.kesintiler)) i.kesintiler = [];
            const kesilen = i.kesintiler.reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
            const kalan = Math.max(0, Number(i.toplamBorc || 0) - kesilen);
            const dosyaNo = escapeHtml(i.dosyaNo || '-');
            const dosyaNoHtml = i.pdfUrl
                ? `<a href="#" onclick='icraPdfAc(${JSON.stringify(String(i.pdfUrl))}, ${JSON.stringify(String(i.dosyaNo || 'İcra Yazısı'))}); return false;' style="color:inherit; font:inherit; font-weight:inherit; text-decoration:none;"><strong>${dosyaNo}</strong></a>`
                : `<strong>${dosyaNo}</strong>`;
            const durumHam = String(i.durum || 'Aktif');
            const durumEtiket = durumHam === 'Kapandı'
                ? 'Tamamlandı'
                : ['Bekleyen Sıra', 'Beklemede'].includes(durumHam)
                    ? 'Sırada Bekliyor'
                    : 'Devam Ediyor';
            const durumStil = durumHam === 'Kapandı'
                ? 'background:#dcfce7;color:#166534;'
                : ['Bekleyen Sıra', 'Beklemede'].includes(durumHam)
                    ? 'background:#fef3c7;color:#92400e;'
                    : 'background:#dbeafe;color:#1d4ed8;';
            return `<tr>
            <td>${dosyaNoHtml}</td>
            <td><button type="button" class="fd-table-cell-link" data-icra-id="${escapeHtml(String(i.id || ''))}" onclick="icraGecmisiniAc(this.dataset.icraId)">${escapeHtml(i.personelAd || '-')}</button></td>
            <td>${escapeHtml(String(i.baslangicAy || '-').slice(0, 7))}</td>
            <td>${paraFormatla(i.toplamBorc)}</td>
            <td style="color:#059669; font-weight:800;">${paraFormatla(kesilen)}</td>
            <td style="color:#dc2626; font-weight:800;">${paraFormatla(kalan)}</td>
            <td><span class="badge" style="${durumStil}">${durumEtiket}</span></td>
            <td><div class="action-btns"><button class="btn-modern btn-detail-modern" onclick="icraDetayAc('${i.id}')">📋 Detay</button> ${activeUser?.rol === 'Personel' ? '' : `<button class="btn-modern btn-edit-modern" onclick="icraDuzenle('${i.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="icraSil('${i.id}')">🗑️ Sil</button>`}</div></td>
        </tr>`;
        }).join('') : `<tr><td colspan="8" style="text-align:center; color:#64748b; padding:22px;">${personelArama ? 'Aramanıza uygun icra kaydı bulunmuyor.' : (icraListeModu === 'biten' ? 'Biten icra bulunmuyor.' : 'Aktif icra bulunmuyor.')}</td></tr>`;
    }
let icraGecmisPersonelId = '';
let icraGecmisPersonelAdi = '';
let icraGecmisPersonelKimlikleri = new Set();
let icraGecmisYili = 'TUMU';
function icraGecmisKayitlari() {
fdLienAssert(false);

        const adAnahtari = String(icraGecmisPersonelAdi || '').trim().toLocaleUpperCase('tr-TR');
        return icralar.filter(i => aktifSirketeAit(i) && (
            icraGecmisPersonelKimlikleri.has(String(i.pId)) ||
            (adAnahtari && String(i.personelAd || '').trim().toLocaleUpperCase('tr-TR') === adAnahtari)
        )).sort((a, b) => String(a.baslangicAy || '').localeCompare(String(b.baslangicAy || '')) || String(a.dosyaNo || '').localeCompare(String(b.dosyaNo || ''), 'tr'));
    }
function icraGecmisiniAc(icraId) {
fdLienAssert(false);

        const kaynakKayit = icralar.find(i => String(i.id) === String(icraId));
        if (!kaynakKayit) return;
        icraGecmisPersonelId = String(kaynakKayit.pId || '');
        const kaynakAd = String(kaynakKayit.personelAd || '').trim().toLocaleUpperCase('tr-TR');
        const personel = personeller.find(p => String(p.id) === icraGecmisPersonelId || String(p.tcNo || '') === icraGecmisPersonelId || (kaynakAd && String(p.ad || '').trim().toLocaleUpperCase('tr-TR') === kaynakAd));
        icraGecmisPersonelKimlikleri = new Set([icraGecmisPersonelId, personel?.id, personel?.tcNo, personel?.tcKimlikNo, personel?.kimlikNo].map(String).filter(Boolean));
        icraGecmisPersonelAdi = String(kaynakKayit.personelAd || personel?.ad || 'PERSONEL');
        icraGecmisYili = 'TUMU';
        const baslik = `${icraGecmisPersonelAdi.toLocaleUpperCase('tr-TR')} — TÜM İCRA KAYITLARI`;
        const kayitlar = icraGecmisKayitlari();
        document.getElementById('icraGecmisBaslik').textContent = baslik;
        document.getElementById('icraGecmisRaporBaslik').textContent = baslik;
        document.querySelector('#icraGecmisTablosu tbody').innerHTML = kayitlar.map(i => {
fdLienAssert(false);

            const kesilen = (Array.isArray(i.kesintiler) ? i.kesintiler : []).reduce((t, k) => t + Number(k.tutar || 0), 0);
            const kalan = Math.max(0, Number(i.toplamBorc || 0) - kesilen);
            const durum = String(i.durum || (kalan <= 0 ? 'Kapandı' : 'Aktif'));
            return `<tr><td>${escapeHtml(i.dosyaNo || '-')}</td><td>${escapeHtml(String(i.baslangicAy || '-').slice(0, 7))}</td><td>${escapeHtml(i.alacakli || '-')}</td><td>${paraFormatla(i.toplamBorc)}</td><td>${paraFormatla(kesilen)}</td><td>${paraFormatla(kalan)}</td><td>${escapeHtml(durum)}</td></tr>`;
        }).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">Bu personele ait icra kaydı yok.</td></tr>';
        const toplamBorc = kayitlar.reduce((t, i) => t + Number(i.toplamBorc || 0), 0);
        const toplamKesilen = kayitlar.reduce((t, i) => t + (Array.isArray(i.kesintiler) ? i.kesintiler : []).reduce((a, k) => a + Number(k.tutar || 0), 0), 0);
        document.querySelector('#icraGecmisTablosu tfoot').innerHTML = `<tr><th colspan="3" style="text-align:right;">TOPLAM</th><th>${paraFormatla(toplamBorc)}</th><th>${paraFormatla(toplamKesilen)}</th><th>${paraFormatla(Math.max(0, toplamBorc - toplamKesilen))}</th><th></th></tr>`;
        document.getElementById('modalIcraGecmisi').style.display = 'flex';
    }
function icraGecmisiniKapat() {
fdLienAssert(false);
 document.getElementById('modalIcraGecmisi').style.display = 'none'; }
function icraGecmisExcelIndir() {
fdLienAssert(false);

        const kayitlar = icraGecmisKayitlari();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['DOSYA NO','BAŞLANGIÇ AYI','ALACAKLI','TOPLAM BORÇ','KESİLEN','KALAN','DURUM'], ...kayitlar.map(i => {
fdLienAssert(false);

            const kesilen = (Array.isArray(i.kesintiler) ? i.kesintiler : []).reduce((t, k) => t + Number(k.tutar || 0), 0);
            return [i.dosyaNo || '-', String(i.baslangicAy || '').slice(0, 7), i.alacakli || '-', Number(i.toplamBorc || 0), kesilen, Math.max(0, Number(i.toplamBorc || 0) - kesilen), i.durum || 'Aktif'];
        })]);
        ws['!cols'] = [{wch:18},{wch:16},{wch:32},{wch:16},{wch:16},{wch:16},{wch:16}];
        XLSX.utils.book_append_sheet(wb, ws, 'İcra Geçmişi');
        XLSX.writeFile(wb, `Icra_Gecmisi_${icraGecmisYili}.xlsx`);
    }
function icraDetayAc(id) {
fdLienAssert(false);

        const icra = icralar.find(i => String(i.id) === String(id));
        if (!icra) return;
        document.getElementById('icraDetayId').value = String(id);
        document.getElementById('icraDetayBaslik').textContent = `${icra.personelAd} — ${icra.dosyaNo}`;
        const belgeButonlari = [
            activeUser?.rol === 'Personel'
                ? ''
                : `<button type="button" class="btn-modern btn-detail-modern" onclick='icraDilekceAc(${JSON.stringify(String(icra.id))})'>📄 Dilekçeyi Aç</button>`,
            icra.pdfUrl
                ? `<button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(icra.pdfUrl))}, ${JSON.stringify(String(icra.dosyaNo || ''))}, "İcra Yazısı")'>📄 İcra Yazısı</button>`
                : '',
            icra.bitisPdfUrl
                ? `<button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(icra.bitisPdfUrl))}, ${JSON.stringify(String(icra.dosyaNo || ''))}, "İcra Bitiş / Borcu Yoktur Yazısı")'>✅ Bitiş / Borcu Yoktur Yazısı</button>`
                : ''
        ].filter(Boolean).join('');
        document.getElementById('icraDetayBanka').innerHTML =
            `<strong>İcra Dairesi:</strong> ${escapeHtml(icra.icraDairesi || '-')}<br><strong>İcra Yazısı Tarihi:</strong> ${escapeHtml(tarihFormati(icra.yaziTarihi) || '-')}<br><strong>Hesap Adı:</strong> ${escapeHtml(icra.hesapAdi || '-')}<br><strong>IBAN:</strong> ${escapeHtml(icra.iban || '-')}` +
            (belgeButonlari ? `<div class="action-btns" style="margin-top:10px;">${belgeButonlari}</div>` : '');
        document.getElementById('icraKesintiAy').value = new Date().toISOString().slice(0, 7);
        document.getElementById('icraKesintiTutar').value = '';
        document.getElementById('modalIcraDetay').style.display = 'flex';
        renderIcraKesintiDetayi();
    }
function icraDetayKapat() {
fdLienAssert(false);

        document.getElementById('modalIcraDetay').style.display = 'none';
    }
function renderIcraKesintiDetayi() {
fdLienAssert(false);

        const id = document.getElementById('icraDetayId').value;
        const icra = icralar.find(i => String(i.id) === String(id));
        if (!icra) return;
        if (!Array.isArray(icra.kesintiler)) icra.kesintiler = [];
        const body = document.getElementById('icraKesintiDetayBody');
        const sirali = [...icra.kesintiler].sort((a, b) => String(b.ay).localeCompare(String(a.ay)));
        body.innerHTML = sirali.length ? sirali.map(k => `<tr>
            <td>${escapeHtml(k.ay || '-')}</td>
            <td>${paraFormatla(k.tutar)}</td>
            <td>${activeUser?.rol === 'Personel' ? '' : `<button class="btn-modern btn-del-modern" onclick="icraKesintiSil('${k.id}')">🗑️ Sil</button>`}</td>
        </tr>`).join('') : '<tr><td colspan="3" style="text-align:center; color:#64748b;">Henüz kesinti girilmedi.</td></tr>';
        const kesilen = icra.kesintiler.reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
        const kalan = Math.max(0, Number(icra.toplamBorc || 0) - kesilen);
        document.getElementById('icraDetayOzet').textContent = `Toplam borç: ${paraFormatla(icra.toplamBorc)} • Kesilen: ${paraFormatla(kesilen)} • Kalan: ${paraFormatla(kalan)}`;
    }
async function icraKesintiEkle(event) {
try{
fdLienAssert(true);

        event.preventDefault();
        const id = document.getElementById('icraDetayId').value;
        const icra = icralar.find(i => String(i.id) === String(id));
        if (!icra) return;
        if (String(icra.durum) !== 'Aktif') {
            alert('Aylık kesinti yalnızca aktif icra dosyasına girilebilir.');
            return;
        }
        const ay = document.getElementById('icraKesintiAy').value;
        const tutar = paraMetniniSayiyaCevir(document.getElementById('icraKesintiTutar').value);
        if (!ay || tutar <= 0) { alert('Ay ve kesinti tutarını girin.'); return; }
        if (!Array.isArray(icra.kesintiler)) icra.kesintiler = [];
        icra.kesintiler.push({ id: `kesinti_${Date.now()}`, ay, tutar });
        const toplamKesilen = icra.kesintiler.reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
        if (toplamKesilen >= Number(icra.toplamBorc || 0)) {
            icra.durum = 'Kapandı';
            icraSiradakiniAktifEt(icra.pId);
        }
        yuklenenVeriler.add('icralar');
        await fdLienAwait(verileriKaydet());
        document.getElementById('icraKesintiTutar').value = '';
        renderIcraListesi();
        icraDetayKapat();
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraKesintiSil(kesintiId) {
try{
fdLienAssert(true);

        const id = document.getElementById('icraDetayId').value;
        const icra = icralar.find(i => String(i.id) === String(id));
        if (!icra) return;
        icra.kesintiler = (icra.kesintiler || []).filter(k => String(k.id) !== String(kesintiId));
        if (icra.durum === 'Kapandı') {
            icra.durum = 'Aktif';
            icralar
                .filter(i => String(i.pId) === String(icra.pId) && String(i.id) !== String(icra.id) && String(i.durum) === 'Aktif')
                .forEach(i => i.durum = 'Bekleyen Sıra');
        }
        yuklenenVeriler.add('icralar');
        await fdLienAwait(verileriKaydet());
        renderIcraKesintiDetayi();
        renderIcraListesi();
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
async function icraSil(id) {
try{
fdLienAssert(true);

        if (!await fdLienAwait(fdLienConfirm('Bu icra kaydı silinsin mi?'))) return;
        const silinen = icralar.find(i => String(i.id) === String(id));
        icralar = icralar.filter(i => String(i.id) !== String(id));
        if (silinen && silinen.durum === 'Aktif') icraSiradakiniAktifEt(silinen.pId);
        yuklenenVeriler.add('icralar');
        renderIcraListesi();
        await fdLienAwait(verileriKaydet());
    
}catch(fdLienError){if(!fdLienValid())return;throw fdLienError;}
}
function icraListePdfAl(){
fdLienAssert(false);
const t=document.getElementById('icraListeBody')?.closest('table');return fdLienPdf?.(t,document.getElementById('icraListeBaslik')?.textContent||'İcra Listesi','ICRA_LISTESI.pdf');}
function icraGecmisPdfIndir(){
fdLienAssert(false);
return fdLienPdf?.(document.getElementById('icraGecmisRaporu'),'İcra Geçmişi '+(typeof icraGecmisYili!=='undefined'?icraGecmisYili:''),'Icra_Gecmisi_'+(typeof icraGecmisYili!=='undefined'?icraGecmisYili:new Date().getFullYear())+'.pdf');}
return{init(){ekOdemeSekmeleriniKur();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(options){fdLienAssert();const pending=window.fdLienLaunchOptions?.();options=options||pending||{};if(options.fdLienAction)return ({icraGecmisiniAc,icraDetayAc,icraDuzenle,icraDilekceAc})[options.fdLienAction]?.(...(options.args||[]));return openIcraApp()},api:{get icraPdfDurumMesaji(){return icraPdfDurumMesaji},get icraPdfMetniniOku(){return icraPdfMetniniOku},get icraPdfEtiketDegeri(){return icraPdfEtiketDegeri},get icraPdfDosyaNoBul(){return icraPdfDosyaNoBul},get icraPdfParaBul(){return icraPdfParaBul},get icraPdfHesapAdiBul(){return icraPdfHesapAdiBul},get icraPdfDaireVeTarihBul(){return icraPdfDaireVeTarihBul},get icraPdfAlanlariniBul(){return icraPdfAlanlariniBul},get icraPdfPersoneliniSec(){return icraPdfPersoneliniSec},get icraPdfBilgileriniCikar(){return icraPdfBilgileriniCikar},get icraBugunAnahtari(){return icraBugunAnahtari},get icraDairesiYeriniBul(){return icraDairesiYeriniBul},get icraDairesiBasligi(){return icraDairesiBasligi},get icraDilekceDonemiYaz(){return icraDilekceDonemiYaz},get icraDilekcePara(){return icraDilekcePara},get icraDilekceDosyaTarihi(){return icraDilekceDosyaTarihi},get icraDilekceSatirlariniOlustur(){return icraDilekceSatirlariniOlustur},get icraDilekceTuruBul(){return icraDilekceTuruBul},get icraDilekceSablonBaytlari(){return icraDilekceSablonBaytlari},get icraDocxKirmiziDoldur(){return icraDocxKirmiziDoldur},get icraDocxHucreDoldur(){return icraDocxHucreDoldur},get icraDilekceCokluTabloyuDoldur(){return icraDilekceCokluTabloyuDoldur},get icraResmiDocxXml(){return icraResmiDocxXml},get icraResmiDocxRun(){return icraResmiDocxRun},get icraResmiDocxParagraf(){return icraResmiDocxParagraf},get icraResmiDocxBaslikTablosu(){return icraResmiDocxBaslikTablosu},get icraDilekceKisiAdiYaz(){return icraDilekceKisiAdiYaz},get icraResmiDocxHucre(){return icraResmiDocxHucre},get icraResmiDocxImza(){return icraResmiDocxImza},get icraResmiDocxTablosu(){return icraResmiDocxTablosu},get icraResmiDilekceDocxOlustur(){return icraResmiDilekceDocxOlustur},get icraDilekceBlobuOlustur(){return icraDilekceBlobuOlustur},get icraDilekceDosyaAdi(){return icraDilekceDosyaAdi},get icraDilekceAc(){return icraDilekceAc},get icraPersonelListesiniDoldur(){return icraPersonelListesiniDoldur},get icraSekmeDegistir(){return icraSekmeDegistir},get icraYeniKayitAc(){return icraYeniKayitAc},get icraYeniKayitKapat(){return icraYeniKayitKapat},get icraPdfAlanBilgisi(){return icraPdfAlanBilgisi},get icraPdfDurumunuGoster(){return icraPdfDurumunuGoster},get icraPdfSilmekIcinIsaretle(){return icraPdfSilmekIcinIsaretle},get icraPdfDosyasiSecildi(){return icraPdfDosyasiSecildi},get icraFormReset(){return icraFormReset},get icraDuzenle(){return icraDuzenle},get icraKaydet(){return icraKaydet},get icraTekKaydiKaydet(){return icraTekKaydiKaydet},get icraKaydetIslemi(){return icraKaydetIslemi},get renderIcraListesi(){return renderIcraListesi},get icraGecmisKayitlari(){return icraGecmisKayitlari},get icraGecmisiniAc(){return icraGecmisiniAc},get icraGecmisiniKapat(){return icraGecmisiniKapat},get icraGecmisExcelIndir(){return icraGecmisExcelIndir},get icraDetayAc(){return icraDetayAc},get icraDetayKapat(){return icraDetayKapat},get renderIcraKesintiDetayi(){return renderIcraKesintiDetayi},get icraKesintiEkle(){return icraKesintiEkle},get icraKesintiSil(){return icraKesintiSil},get icraSil(){return icraSil},get icraListePdfAl(){return icraListePdfAl},get icraGecmisPdfIndir(){return icraGecmisPdfIndir}},dispose(){fdLienDisposed=true;for(const id of fdLienTimers)window.clearTimeout(id);fdLienTimers.clear();for(const reader of fdLienReaders)try{reader.abort()}catch(_){}fdLienReaders.clear();for(const n of fdLienDialogs)if(n.isConnected)n.querySelector('[data-fd-iptal]')?.click();fdLienDialogs.clear();for(const n of fdLienNodes)fdLienClean(n);fdLienNodes.clear();fdLienCleanWord();fdLienHideOverlay();document.getElementById('icraForm')?.reset();icraGecmisPersonelKimlikleri.clear();icraGecmisPersonelId='';icraGecmisPersonelAdi='';icraDuzenlenenKayitId='';const tab=typeof fdAcikUygulamaSekmeleri!=='undefined'?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==='icra'||t.alanId==='icraApp'):null;if(tab)tab.alanId='';}};
});

window.FDModules.define('wordbelge',function(){
let disposed=false;const initial=JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);
function wordBelgesiKirmiziGruplari(xmlBelgesi) {
        const wordNs = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const runlar = Array.from(xmlBelgesi.getElementsByTagNameNS(wordNs, 'r'));
        const gruplar = [];
        let grup = [];
        runlar.forEach(run => {
            const metinler = Array.from(run.getElementsByTagNameNS(wordNs, 't'));
            const metin = metinler.map(node => node.textContent || '').join('');
            const renkler = Array.from(run.getElementsByTagNameNS(wordNs, 'color'));
            const kirmizi = renkler.some(node => {
                const deger = String(node.getAttributeNS(wordNs, 'val') || node.getAttribute('w:val') || node.getAttribute('val') || '').toUpperCase();
                return ['FF0000','F00','RED'].includes(deger);
            });
            if (kirmizi && metinler.length) {
                grup.push({ run, metinler, renkler });
            } else if (metin.trim() && grup.length) {
                gruplar.push(grup);
                grup = [];
            }
        });
        if (grup.length) gruplar.push(grup);
        return gruplar;
    }

    async function wordBelgesiKirmiziGrupSayisi(arrayBuffer) {
        if (!window.JSZip) throw new Error('Word dosyası okuyucusu yüklenemedi.');
        const zip = await JSZip.loadAsync(arrayBuffer);
        const parca = zip.file('word/document.xml');
        if (!parca) throw new Error('Geçerli bir DOCX belgesi seçin.');
        const xml = await parca.async('string');
        const belge = new DOMParser().parseFromString(xml, 'application/xml');
        if (belge.querySelector('parsererror')) throw new Error('Word belgesinin içeriği okunamadı.');
        return wordBelgesiKirmiziGruplari(belge).length;
    }

    function wordXmlElemaniOlustur(belge, ad, ozellikler = {}) {
        const wordNs = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const eleman = belge.createElementNS(wordNs, 'w:' + ad);
        Object.entries(ozellikler).forEach(([anahtar, deger]) => eleman.setAttributeNS(wordNs, 'w:' + anahtar, String(deger)));
        return eleman;
    }

    function wordImzaParagrafiOlustur(belge, metin, kalin = false, once = 0, sonra = 80) {
        const xmlNs = 'http:\x2f\x2fwww.w3.org/XML/1998/namespace';
        const paragraf = wordXmlElemaniOlustur(belge, 'p');
        const paragrafAyar = wordXmlElemaniOlustur(belge, 'pPr');
        paragrafAyar.appendChild(wordXmlElemaniOlustur(belge, 'spacing', { before:once, after:sonra, line:240, lineRule:'auto' }));
        paragraf.appendChild(paragrafAyar);
        const run = wordXmlElemaniOlustur(belge, 'r');
        const runAyar = wordXmlElemaniOlustur(belge, 'rPr');
        runAyar.appendChild(wordXmlElemaniOlustur(belge, 'rFonts', { ascii:'Arial', hAnsi:'Arial', cs:'Arial' }));
        runAyar.appendChild(wordXmlElemaniOlustur(belge, 'sz', { val:'22' }));
        runAyar.appendChild(wordXmlElemaniOlustur(belge, 'szCs', { val:'22' }));
        if (kalin) runAyar.appendChild(wordXmlElemaniOlustur(belge, 'b'));
        run.appendChild(runAyar);
        const yazi = wordXmlElemaniOlustur(belge, 't');
        yazi.setAttributeNS(xmlNs, 'xml:space', 'preserve');
        yazi.textContent = String(metin || ' ');
        run.appendChild(yazi);
        paragraf.appendChild(run);
        return paragraf;
    }

    function wordOnayBelgesiImzaAlaniniDuzenle(belge, personelAdi) {
        const wordNs = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const body = belge.getElementsByTagNameNS(wordNs, 'body')[0];
        if (!body) return;
        const cocuklar = Array.from(body.children);
        const anaMetin = cocuklar.find(eleman => eleman.localName === 'p' && /kabul ve beyan ederim|muvafakatim olduğunu/i.test(eleman.textContent || ''));
        if (!anaMetin) return;
        const bolumAyari = cocuklar.find(eleman => eleman.localName === 'sectPr') || null;
        let sonraki = anaMetin.nextSibling;
        while (sonraki && sonraki !== bolumAyari) {
            const silinecek = sonraki;
            sonraki = sonraki.nextSibling;
            body.removeChild(silinecek);
        }

        const tablo = wordXmlElemaniOlustur(belge, 'tbl');
        const tabloAyar = wordXmlElemaniOlustur(belge, 'tblPr');
        tabloAyar.appendChild(wordXmlElemaniOlustur(belge, 'tblW', { w:'9000', type:'dxa' }));
        tabloAyar.appendChild(wordXmlElemaniOlustur(belge, 'tblLayout', { type:'fixed' }));
        const kenarlar = wordXmlElemaniOlustur(belge, 'tblBorders');
        ['top','left','bottom','right','insideH','insideV'].forEach(ad => kenarlar.appendChild(wordXmlElemaniOlustur(belge, ad, { val:'nil' })));
        tabloAyar.appendChild(kenarlar);
        const hucreBosluk = wordXmlElemaniOlustur(belge, 'tblCellMar');
        ['top','left','bottom','right'].forEach(ad => hucreBosluk.appendChild(wordXmlElemaniOlustur(belge, ad, { w:ad === 'top' ? '300' : '120', type:'dxa' })));
        tabloAyar.appendChild(hucreBosluk);
        tablo.appendChild(tabloAyar);
        const grid = wordXmlElemaniOlustur(belge, 'tblGrid');
        grid.appendChild(wordXmlElemaniOlustur(belge, 'gridCol', { w:'4500' }));
        grid.appendChild(wordXmlElemaniOlustur(belge, 'gridCol', { w:'4500' }));
        tablo.appendChild(grid);
        const satir = wordXmlElemaniOlustur(belge, 'tr');
        const satirAyar = wordXmlElemaniOlustur(belge, 'trPr');
        satirAyar.appendChild(wordXmlElemaniOlustur(belge, 'cantSplit'));
        satir.appendChild(satirAyar);
        [
            ['İŞÇİ', 'Adı Soyadı: ' + String(personelAdi || '').toLocaleUpperCase('tr-TR'), 'İmza:'],
            ['İŞVEREN', 'Yetkili Adı Soyadı:', 'İmza / Kaşe:']
        ].forEach((satirlar, hucreIndex) => {
            const hucre = wordXmlElemaniOlustur(belge, 'tc');
            const hucreAyar = wordXmlElemaniOlustur(belge, 'tcPr');
            hucreAyar.appendChild(wordXmlElemaniOlustur(belge, 'tcW', { w:'4500', type:'dxa' }));
            hucreAyar.appendChild(wordXmlElemaniOlustur(belge, 'vAlign', { val:'top' }));
            hucre.appendChild(hucreAyar);
            hucre.appendChild(wordImzaParagrafiOlustur(belge, satirlar[0], true, 0, 220));
            hucre.appendChild(wordImzaParagrafiOlustur(belge, satirlar[1], false, 0, 300));
            hucre.appendChild(wordImzaParagrafiOlustur(belge, satirlar[2], false, 0, 0));
            satir.appendChild(hucre);
        });
        tablo.appendChild(satir);
        body.insertBefore(tablo, bolumAyari);
    }

    async function personelWordBelgesiniHazirla(arrayBuffer, degerler, belgeKey = '') {
        if (!window.JSZip) throw new Error('Word dosyası okuyucusu yüklenemedi.');
        const zip = await JSZip.loadAsync(arrayBuffer);
        const parca = zip.file('word/document.xml');
        if (!parca) throw new Error('Geçerli bir DOCX belgesi bulunamadı.');
        const xml = await parca.async('string');
        const belge = new DOMParser().parseFromString(xml, 'application/xml');
        if (belge.querySelector('parsererror')) throw new Error('Word belgesinin içeriği okunamadı.');
        const gruplar = wordBelgesiKirmiziGruplari(belge);
        if (gruplar.length !== degerler.length) throw new Error('Belgedeki otomatik alan sayısı değişmiş. Beklenen: ' + degerler.length + ', bulunan: ' + gruplar.length + '. Kırmızı alanları kontrol edip şablonu yeniden yükleyin.');
        const wordNs = 'http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main';
        const xmlNs = 'http:\x2f\x2fwww.w3.org/XML/1998/namespace';
        gruplar.forEach((grup, index) => {
            let ilkMetin = null;
            grup.forEach(kayit => {
                kayit.renkler.forEach(renk => renk.setAttributeNS(wordNs, 'w:val', '000000'));
                kayit.metinler.forEach(metin => {
                    if (!ilkMetin) ilkMetin = metin;
                    metin.textContent = '';
                });
            });
            if (ilkMetin) {
                ilkMetin.textContent = String(degerler[index] || '');
                ilkMetin.setAttributeNS(xmlNs, 'xml:space', 'preserve');
            }
        });
        if (['fazlaMesaiOnayi','vardiyaliCalismaOnayi'].includes(belgeKey)) wordOnayBelgesiImzaAlaniniDuzenle(belge, degerler[4]);
        zip.file('word/document.xml', new XMLSerializer().serializeToString(belge));
        return zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression:'DEFLATE' });
    }
return{async open(request){if(!request)return false;try{if(disposed||initial!==JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))])||!fdWordBelgeIstekleri.has(request)||!fdWordBelgeYetkisi(request.action)||!request.current())throw Error('Belge işlemi artık geçerli değil.');const value=await(request.action==='count'?wordBelgesiKirmiziGrupSayisi(...request.args):personelWordBelgesiniHazirla(...request.args));if(disposed||initial!==JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))])||!fdWordBelgeIstekleri.has(request)||!fdWordBelgeYetkisi(request.action)||!request.current())throw Error('Ekran veya oturum değişti; belge işlemini yeniden başlatın.');return{ok:true,value}}catch(error){return{ok:false,error}}},dispose(){disposed=true}};
});

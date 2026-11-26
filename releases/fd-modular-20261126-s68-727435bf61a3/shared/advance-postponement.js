'use strict';
// Ordinal-based overrides move only one instalment; original principal/terms stay intact.
function avansKesintiTaksitlari(avans) {
    const n=Number(avans?.taksitSayisi||1),total=Number(avans?.tutar||0),start=String(avans?.baslangicAy||'');
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(start)||!Number.isInteger(n)||n<1||n>1200||!Number.isFinite(total)||total<=0)return [];
    const standard=Math.floor(total/n*100)/100,overrides=avans.kesintiErtelemeleri;
    return Array.from({length:n},(_,i)=>{
        const original=avansAyEkle(start,i),candidate=overrides&&typeof overrides==='object'&&!Array.isArray(overrides)?String(overrides[i+1]||''):'';
        const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(candidate)&&candidate>=original?candidate:original;
        const kurus=Math.round((i===n-1?Number((total-standard*(n-1)).toFixed(2)):standard)*100),entry=overrides?.[i+1];
        if(entry&&typeof entry==='object'&&entry.surum===2){
            const parts=entry.dagilim&&typeof entry.dagilim==='object'&&!Array.isArray(entry.dagilim)?Object.entries(entry.dagilim):[];
            if(!parts.length||parts.length>1200||parts.some(([ay,tutar])=>!/^\d{4}-(0[1-9]|1[0-2])$/.test(ay)||ay<original||!Number.isSafeInteger(tutar)||tutar<=0)||parts.reduce((s,[,tutar])=>s+tutar,0)!==kurus)throw Error('Avansın kısmi kesinti dağılımı doğrulanamadı. Kayıt kontrol edilmeden hesaplama yapılamaz.');
            return parts.sort(([a],[b])=>a.localeCompare(b)).map(([ay,tutar])=>({sira:i+1,asilAy:original,ay,kurus:tutar}));
        }
        return [{sira:i+1,asilAy:original,ay:month,kurus}];
    }).flat();
}
function avansKesintiKismiErtele(avans,sira,kaynakAy,hedefAy,kurus) {
    const all=avansKesintiTaksitlari(avans),parts=all.filter(x=>x.sira===sira),source=parts.find(x=>x.ay===kaynakAy);
    if(!source||!/^\d{4}-(0[1-9]|1[0-2])$/.test(hedefAy)||hedefAy<=kaynakAy||!Number.isSafeInteger(kurus)||kurus<=0||kurus>source.kurus)throw Error('Ertelenecek tutar sıfırdan büyük ve seçilen kesintiden fazla olmamalıdır.');
    const dagilim=Object.fromEntries(parts.map(x=>[x.ay,x.kurus]));dagilim[kaynakAy]-=kurus;if(!dagilim[kaynakAy])delete dagilim[kaynakAy];dagilim[hedefAy]=(dagilim[hedefAy]||0)+kurus;
    const prior=avans.kesintiErtelemeleri?.[sira],entry=Object.keys(dagilim).length===1&&!(prior&&typeof prior==='object')?hedefAy:{...(prior&&typeof prior==='object'?prior:{}),surum:2,dagilim};
    const result={...avans,kesintiErtelemeleri:{...(avans.kesintiErtelemeleri||{}),[sira]:entry}};
    avansKesintiTaksitlari(result);return result;
}
function avansErtelenmisAylikKesinti(avans,ay) {
    const all=avansKesintiTaksitlari(avans),selected=all.filter(x=>x.ay===ay);if(!selected.length)return null;
    return {kesinti:selected.reduce((s,x)=>s+x.kurus,0)/100,kalan:Math.max(0,Math.round(Number(avans.tutar)*100)-all.filter(x=>x.ay<=ay).reduce((s,x)=>s+x.kurus,0))/100,sira:selected.length===1?selected[0].sira:selected.map(x=>x.sira).join(', '),taksitSayisi:Number(avans.taksitSayisi||1)};
}
function avansKesintiSonAyi(avans) {return avansKesintiTaksitlari(avans).map(x=>x.ay).sort().pop()||'';}
function avansPlanHucreOzellikleri(personelId,ay) {
    if(!avansIslemYetkisiVar()||!anaMenuModulYazmaYetkisiVar('personel'))return '';
    return ' data-avans-personel="'+escapeHtml(personelId)+'" data-avans-ay="'+escapeHtml(ay)+'" tabindex="0" role="button" aria-label="'+escapeHtml(avansAyBasligi(ay,true)+' kesintisini başka aya ertele')+'" title="Sağ tık: başka aya ertele · Telefonda dokunun"';
}

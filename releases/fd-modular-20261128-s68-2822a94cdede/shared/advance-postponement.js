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

// Exit settlement projections. Principal and original instalment history remain intact.
function fdCikisKurus(value,label='Tutar') {
 if(!Number.isSafeInteger(value)||value<0||value>100000000000000)throw Error(label+' kuruş cinsinden geçerli bir tutar olmalıdır.');return value;
}
function fdAvansHesaplasmalari(avans,people=(typeof personeller==='undefined'?[]:personeller)){
 const company=String(avans.sirketId||''),id=String(avans.pId||'');
 return people.filter(p=>String(p.id)===id&&(!company||String(p.sirketId||'')===company)).flatMap(p=>{
  if(p.cikisHesaplasmalari===undefined)return [];if(!Array.isArray(p.cikisHesaplasmalari))throw Error('İşten ayrılış hesaplaşması doğrulanamadı.');
  return p.cikisHesaplasmalari.filter(h=>h?.surum===1&&Array.isArray(h.avanslar)&&h.avanslar.some(a=>String(a.id)===String(avans.id)));
 }).sort((a,b)=>String(a.tarih).localeCompare(String(b.tarih))||String(a.kayitZamani).localeCompare(String(b.kayitZamani))||String(a.id).localeCompare(String(b.id)));
}
function fdAvansHesaplasmaPlan(avans,ay='9999-12',people){
 const base=avansKesintiTaksitlari(avans).filter(x=>x.kurus>0).map(x=>({...x,tip:'plan'})),history=fdAvansHesaplasmalari(avans,people).filter(h=>String(h.tarih||'').slice(0,7)<=ay);
 if(!history.length)return base;
 const latest=history.at(-1),entry=latest.avanslar.find(a=>String(a.id)===String(avans.id));
 if(!Array.isArray(entry.plan)||entry.plan.length>3600)throw Error('Mahsup sonrası avans planı doğrulanamadı.');
 const plan=entry.plan.map(x=>{if(!Number.isInteger(x.sira)||x.sira<1||x.sira>Number(avans.taksitSayisi||1)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(x.ay)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(x.asilAy)||!['plan','maas'].includes(x.tip)||!Number.isSafeInteger(x.kurus)||x.kurus<=0)throw Error('Mahsup sonrası avans dağılımı geçersiz.');return {...x};});
 if(plan.filter(x=>x.tip==='plan').reduce((s,x)=>s+x.kurus,0)!==fdCikisKurus(entry.kalanKurus))throw Error('Kalan avans borcu planla uyuşmuyor.');return plan;
}
function fdAvansCikisBorcu(avans,tarih,people){
 const history=fdAvansHesaplasmalari(avans,people),closed=['kapandı','kapandi','tamamlandı','tamamlandi'].includes(String(avans.durum||'').toLocaleLowerCase('tr-TR'));
 if(closed&&!history.length)return {plan:[],azamiKurus:0,onerilenKurus:0};
 const plan=fdAvansHesaplasmaPlan(avans,'9999-12',people),eligible=plan.filter(x=>x.tip==='plan');
 if(!plan.length&&Number(avans.tutar)>0&&!history.length)throw Error((avans.avansNo||'Avans')+' taksit planı doğrulanamadı.');
 return {plan,azamiKurus:eligible.reduce((s,x)=>s+x.kurus,0),onerilenKurus:eligible.filter(x=>x.ay>=String(tarih).slice(0,7)).reduce((s,x)=>s+x.kurus,0)};
}
function fdCikisTazminatHesapla(personel,advances,choices,amounts,tarih,kalanAy,people=[personel]){
 if(!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(tarih)||new Date(tarih+'T12:00:00Z').toISOString().slice(0,10)!==tarih)throw Error('Çıkış tarihi geçersiz.');
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(kalanAy)||kalanAy<=tarih.slice(0,7))throw Error('Kalan borç için çıkış ayından sonraki bir ay seçin.');
 const keys=['kidemKurus','ihbarKurus','digerKurus'],comp=Object.fromEntries(keys.map(k=>[k,fdCikisKurus(amounts[k]??0)])),total=fdCikisKurus(keys.reduce((s,k)=>s+comp[k],0));
 if(!Array.isArray(choices)||choices.length>500||new Set(choices.map(x=>String(x.id))).size!==choices.length)throw Error('Avans seçimi doğrulanamadı.');
 const byId=new Map(advances.map(a=>[String(a.id),a])),selected=choices.map(c=>{const a=byId.get(String(c.id));if(!a||String(a.pId)!==String(personel.id)||(a.sirketId&&String(a.sirketId)!==String(personel.sirketId)))throw Error('Avans bu personel ve şirkete ait değil.');const state=fdAvansCikisBorcu(a,tarih,people),debt=fdCikisKurus(c.borcKurus);if(debt>state.azamiKurus)throw Error('Onaylanan borç avansın kalan anaparasını aşamaz.');return{a,state,debt};}).sort((a,b)=>String(a.a.kayitTarihi||'').localeCompare(String(b.a.kayitTarihi||''))||String(a.a.id).localeCompare(String(b.a.id)));
 let left=total,totalDebt=0,totalOffset=0,totalLeft=0;
 const records=selected.map(({a,state,debt})=>{
  totalDebt+=debt;const offset=Math.min(left,debt),remaining=debt-offset,paid=state.azamiKurus-debt;left-=offset;totalOffset+=offset;totalLeft+=remaining;
  let paidLeft=paid,offsetLeft=offset;const plan=state.plan.filter(x=>x.tip==='maas').map(x=>({...x}));
  for(const part of state.plan.filter(x=>x.tip==='plan').slice().sort((a,b)=>a.ay.localeCompare(b.ay)||a.sira-b.sira)){
   let amount=part.kurus;const prior=Math.min(paidLeft,amount);if(prior){plan.push({...part,kurus:prior,tip:'maas'});paidLeft-=prior;amount-=prior;}
   const take=Math.min(offsetLeft,amount);offsetLeft-=take;amount-=take;
   if(amount)plan.push({...part,kurus:amount,ay:part.ay<kalanAy?kalanAy:part.ay,tip:'plan'});
  }
  if(paidLeft||offsetLeft||plan.filter(x=>x.tip==='plan').reduce((s,x)=>s+x.kurus,0)!==remaining)throw Error('Avans hesaplaşması kuruş bazında doğrulanamadı.');
  return{id:String(a.id),avansNo:String(a.avansNo||''),oncekiPlan:state.plan.map(x=>({...x})),oncekiTahsilatKurus:paid,borcKurus:debt,mahsupKurus:offset,kalanKurus:remaining,plan};
 });
 return{...comp,toplamKurus:total,borcKurus:fdCikisKurus(totalDebt),mahsupKurus:fdCikisKurus(totalOffset),netKurus:left,kalanBorcKurus:fdCikisKurus(totalLeft),kalanAy,avanslar:records};
}
function fdAvansHesaplasmaAylik(avans,ay){
 const plan=fdAvansHesaplasmaPlan(avans,ay),selected=plan.filter(x=>x.ay===ay),sum=selected.reduce((s,x)=>s+x.kurus,0);if(!sum)return null;
 return{kesinti:sum/100,kalan:plan.filter(x=>x.tip==='plan'&&x.ay>ay).reduce((s,x)=>s+x.kurus,0)/100,sira:[...new Set(selected.map(x=>x.sira))].join(', '),taksitSayisi:Number(avans.taksitSayisi||1)};
}
function fdAvansHesaplasmaBilgisi(avans){
 const history=fdAvansHesaplasmalari(avans);if(!history.length)return null;const last=history.at(-1),record=last.avanslar.find(a=>String(a.id)===String(avans.id));return{tarih:last.tarih,kalanKurus:record.kalanKurus,mahsupKurus:history.reduce((s,h)=>s+h.avanslar.filter(x=>String(x.id)===String(avans.id)).reduce((t,x)=>t+x.mahsupKurus,0),0)};
}

function fdAvansHesaplasmaDurumu(avans){const info=fdAvansHesaplasmaBilgisi(avans);return info?(info.kalanKurus?'Aktif':'Tamamlandı'):(avans.durum||'Aktif');}

function fdAvansHesaplasmaOzeti(avans){const h=fdAvansHesaplasmaBilgisi(avans);return h?'Tazminattan mahsup: '+paraFormatla(h.mahsupKurus/100)+' · Kalan borç: '+paraFormatla(h.kalanKurus/100)+' · '+h.tarih:'';}

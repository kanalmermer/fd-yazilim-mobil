
(function(){
    const esc=v=>typeof escapeDashboardText==='function'?escapeDashboardText(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    window.fdKiraSozlesmePdfV153=async function(id){
        const s=kiraKaydiBul(id),d=kiraKaydiBul(s?.daireId);if(!s||!d)return alert('Sözleşme kaydı bulunamadı.');
        if(typeof JSZip==='undefined'||typeof html2pdf!=='function')return alert('Sözleşme PDF bileşenleri yüklenemedi. Sayfayı yenileyin.');
        const sahipler=(d.sahipIds||[]).map(kiraKaydiBul).filter(Boolean);if(!sahipler.length)return alert('Daire sahibi bilgisi bulunamadı.');
        const malSahibiAd=sahipler.map(x=>x.ad).join(' / '),malSahibiNo=sahipler.map(x=>x.no).filter(Boolean).join(' / '),malSahibiAdres=sahipler.map(x=>x.adres).filter(Boolean).join(' / '),banka=sahipler.map(x=>'Hesap Sahibi: '+x.ad+(x.banka?' · '+x.banka:'')).join(' / ');
        const yukleniyor=document.createElement('div');yukleniyor.className='global-loading-overlay active';yukleniyor.innerHTML='<div class="global-loading-card"><div class="global-loading-spinner"></div><strong>Kira sözleşmesi hazırlanıyor...</strong></div>';document.body.appendChild(yukleniyor);
        try{
            const zip=await JSZip.loadAsync(kiraDocxBaytlari()),xmlMetni=await zip.file('word/document.xml').async('string'),xml=new DOMParser().parseFromString(xmlMetni,'application/xml'),W='http:\x2f\x2fschemas.openxmlformats.org/wordprocessingml/2006/main',body=xml.getElementsByTagNameNS(W,'body')[0],paragraflar=[...body.children].filter(x=>x.localName==='p');
            const doldur=(i,...v)=>{if(paragraflar[i])kiraDocxKirmiziDoldur(paragraflar[i],v)},aySayisi=Math.max(1,kiraAylarArasi(s.baslangic,s.bitis).length);
            doldur(5,malSahibiAdres+' adresinde mukim '+malSahibiAd+' ('+malSahibiNo+')',(s.kiraciAdres||'-')+' adresinde mukim '+s.kiraciAd+' ('+(s.tcNo||'-')+')');
            doldur(10,d.adres||'-');doldur(11,d.uavt||'-');doldur(12,'-');doldur(13,d.elektrik||'-');doldur(14,d.gaz||'-');
            doldur(17,tarihFormati(s.baslangic),aySayisi+' Ay',tarihFormati(s.bitis));
            doldur(23,paraFormatla(s.aylikKira)+' ('+kiraTutarYaziyla(s.aylikKira)+')');doldur(25,paraFormatla(s.aidat||0));doldur(30,banka||'-');doldur(111,tarihFormati(s.baslangic));
            const metin=p=>[...p.getElementsByTagNameNS(W,'t')].map(t=>t.textContent||'').join('').replace(/\[ALAN\]/g,'').replace(/\s+/g,' ').trim();
            const icerik=paragraflar.map((p,i)=>{const y=metin(p);if(!y)return '';if(i===0)return '<h1>'+esc(y)+'</h1>';if(/^Madde\s+\d+/i.test(y))return '<h2>'+esc(y)+'</h2>';return '<p>'+esc(y)+'</p>'}).join('');
            const imza='<div class="kira-imza"><div><strong>KİRALAYAN</strong><span>'+esc(malSahibiAd)+'</span><span>'+(esc(malSahibiNo)||'-')+'</span><b>İmza</b></div><div><strong>KİRACI</strong><span>'+esc(s.kiraciAd||'-')+'</span><span>'+esc(s.tcNo||'-')+'</span><b>İmza</b></div></div>';
            const alan=document.createElement('div');alan.className='kira-sozlesme-pdf kira-sozlesme-duz-v152';alan.style.cssText='width:210mm;box-sizing:border-box;padding:14mm 15mm 18mm;background:#fff;color:#111;font-family:Arial,sans-serif;font-size:9.6pt;line-height:1.36;overflow:visible';
            alan.innerHTML='<style>.kira-sozlesme-duz-v152,.kira-sozlesme-duz-v152 *{box-sizing:border-box}.kira-sozlesme-duz-v152 h1{margin:0 0 8mm;text-align:center;font-size:15pt;line-height:1.2}.kira-sozlesme-duz-v152 h2{margin:5mm 0 2.2mm;font-size:10.5pt;line-height:1.25;break-after:avoid;page-break-after:avoid}.kira-sozlesme-duz-v152 p{width:100%;max-width:100%;margin:0 0 2.6mm!important;text-align:justify;white-space:normal;overflow:visible;overflow-wrap:anywhere;word-break:normal;orphans:3;widows:3}.kira-sozlesme-duz-v152 .kira-imza{display:grid;grid-template-columns:1fr 1fr;gap:16mm;margin-top:10mm;break-inside:avoid;page-break-inside:avoid}.kira-sozlesme-duz-v152 .kira-imza div{min-height:35mm;padding-top:3mm;border-top:1px solid #94a3b8}.kira-sozlesme-duz-v152 .kira-imza strong,.kira-sozlesme-duz-v152 .kira-imza span,.kira-sozlesme-duz-v152 .kira-imza b{display:block;margin-bottom:2mm}</style>'+icerik+imza;
            kiraSozlesmeOnizlemeGoster(alan,'Kira_Sozlesmesi_'+String(d.kisaAd||s.kiraciAd).replace(/[^\p{L}\p{N}]+/gu,'_')+'.pdf');
        }catch(err){console.error('Kira sözleşmesi PDF hatası:',err);alert('Kira sözleşmesi oluşturulamadı: '+(err?.message||err))}finally{yukleniyor.remove()}
    };
})();


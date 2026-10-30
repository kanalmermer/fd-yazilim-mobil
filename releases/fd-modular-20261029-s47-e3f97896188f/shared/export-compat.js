function ihracatSatisTurunuDuzelt(deger){
        const turler=['İHRAÇ KAYITLI SATIŞ','DİREKT İHRACAT',"KDV'Lİ SATIŞ",'BEDELSİZ SATIŞ',"KDV'SİZ SATIŞ"],eski={NORMAL_SATIŞ:"KDV'Lİ SATIŞ",BEDELSİZ:'BEDELSİZ SATIŞ'};
        const tur=String(deger||'').trim().toLocaleUpperCase('tr-TR'),anahtar=tur.replace(/\s+/g,'_');
        return turler.includes(tur)?tur:(eski[anahtar]||turler[0]);
    }

function ihracatSayiyaCevir(deger){
        if(typeof deger==='number')return Number.isFinite(deger)?deger:0;
        let metin=String(deger??'').trim().replace(/\s/g,'').replace(/[^\d,.-]/g,'');if(!metin)return 0;
        if(metin.includes(','))metin=metin.replace(/\./g,'').replace(',','.');return Number(metin)||0;
    }

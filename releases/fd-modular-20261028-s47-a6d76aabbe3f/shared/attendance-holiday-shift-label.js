(function(root){'use strict';
root.fdAttendanceShiftDisplayLabel=function(record){
 const standard=magicpassVardiyaSaatEtiketi(record?.vardiya);
 if(record?.gunTuru==='resmiTatil')return 'Resmî tatil';
 if(record?.gunTuru!=='yarimResmiTatil')return standard;
 try{const plan=magicpassVardiyaSaatleri(record.vardiya,record.tarih),day=magicpassSaatliTarih(record.tarih,'00:00'),cutoff=magicpassSaatliTarih(record.tarih,'13:00'),start=Math.max(plan.bas.getTime(),day.getTime()),end=Math.min(plan.bit.getTime(),cutoff.getTime());
 if(!Number.isFinite(start)||!Number.isFinite(end))return 'Yarım gün resmî tatil';
 if(end<=start)return 'Resmî tatil';
 return magicpassSaatMetni(new Date(start))+'–'+magicpassSaatMetni(new Date(end))+' · Öğleden sonrası tatil';
 }catch(_){return 'Yarım gün resmî tatil'}
};
})(window);

(function(root){'use strict';
root.fdAttendanceShiftDisplayLabel=function(record){
 const standard=magicpassVardiyaSaatEtiketi(record?.vardiya);
 try{if(String(record?.tarih)>='2026-10-01'&&record?.vardiya!=='izin'){
  const p=magicpassVardiyaSaatleri(record.vardiya,record.tarih);
  if(magicpassTarihAnahtari(p.bas)!==magicpassTarihAnahtari(p.bit)){
   const parts=fdAttendanceHolidaySegments(p.bas,p.bit,d=>magicpassGunTuruBul(null,d));
   if(parts.length&&parts.some(x=>x.holiday)){
    if(parts.every(x=>x.holiday))return 'Resmî tatil';
    return parts.map(x=>magicpassSaatMetni(x.bas)+'–'+magicpassSaatMetni(x.bit)+(x.holiday?' tatil':' normal')).join(' · ');
   }
  }
 }}catch(_){}

 if(record?.gunTuru==='resmiTatil')return 'Resmî tatil';
 if(record?.gunTuru!=='yarimResmiTatil')return standard;
 try{const plan=magicpassVardiyaSaatleri(record.vardiya,record.tarih),day=magicpassSaatliTarih(record.tarih,'00:00'),cutoff=magicpassSaatliTarih(record.tarih,'13:00'),start=Math.max(plan.bas.getTime(),day.getTime()),end=Math.min(plan.bit.getTime(),cutoff.getTime());
 if(!Number.isFinite(start)||!Number.isFinite(end))return 'Yarım gün resmî tatil';
 if(end<=start)return 'Resmî tatil';
 return magicpassSaatMetni(new Date(start))+'–'+magicpassSaatMetni(new Date(end))+' · Öğleden sonrası tatil';
 }catch(_){return 'Yarım gün resmî tatil'}
};
})(window);
(function(root){'use strict';
 // Calendar intersections only. These minutes are not a wage/day entitlement.
 root.fdAttendanceHolidaySegments=function(start,end,kindAt){
  if(!(start instanceof Date)||!(end instanceof Date)||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start)return[];
  const first=new Date(start);first.setHours(0,0,0,0);const segments=[];
  for(let day=first,count=0;day<end&&count<8;count++){
   const next=new Date(day);next.setDate(next.getDate()+1);const key=magicpassTarihAnahtari(day),kind=kindAt(key),cut=new Date(day);cut.setHours(kind==='yarimResmiTatil'?13:0,0,0,0);
   for(const [a,b,holiday] of kind==='yarimResmiTatil'?[[day,cut,false],[cut,next,true]]:[[day,next,kind==='resmiTatil']]){
    const bas=new Date(Math.max(start,a)),bit=new Date(Math.min(end,b));if(bit>bas)segments.push({bas,bit,holiday,tarih:key});
   }
   day=next;
  }
  // Reject an unsupported range rather than silently dropping its tail.
  return segments.length&&+segments.at(-1).bit===+end?segments:[];
 };
 root.fdAttendanceHolidayNightProjection=function(personel,date,record){
  // Keep closed historical periods and ordinary/day shifts unchanged.
  if(String(date)<'2026-10-01'||!record||record.izin||record.istihdamDisi||record.vardiya==='izin')return record;
  const plan=magicpassVardiyaSaatleri(record.vardiya,date);
  if(!plan?.bas||!plan?.bit||magicpassTarihAnahtari(plan.bas)===magicpassTarihAnahtari(plan.bit)||plan.tanim?.tatil||plan.tanim?.girisCikisYasak)return record;
  const kind=d=>magicpassGunTuruBul(personel,d),parts=fdAttendanceHolidaySegments(plan.bas,plan.bit,kind);
  if(!parts.some(x=>x.holiday))return record;
  const overlap=(a,b,c,d)=>Math.max(0,Math.round((Math.min(b,d)-Math.max(a,c))/60000)),net=(a,b)=>Math.max(0,Math.round((b-a)/60000)-((plan.yemekBas&&plan.yemekBit)?overlap(a,b,plan.yemekBas,plan.yemekBit):0));
  const minutes=(list,holiday)=>list.filter(x=>x.holiday===holiday).reduce((n,x)=>n+net(x.bas,x.bit),0),planNormal=minutes(parts,false),planHoliday=minutes(parts,true);
  const source=record.calismaAraliklari?.length?record.calismaAraliklari:(record.giris||record.cikis?[{giris:record.giris,cikis:record.cikis}]:[]);
  let unsupported=false;
  const intervals=source.map(a=>{
   const start=a.giris,end=a.cikis;
   if(!(start instanceof Date)||!(end instanceof Date)||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start)return{...a,normal:0,brutMesai:0,mesai:0,resmiTatilMesaiDakika:0,fdHolidayNight:true};
   const boundedStart=new Date(Math.max(start,plan.bas)),boundedEnd=new Date(Math.min(end,plan.bit));
   if(boundedEnd<=boundedStart)return{...a,normal:0,brutMesai:0,mesai:0,resmiTatilMesaiDakika:0,fdNormalOvertimeMinutes:0,fdHolidayNight:true};
   const all=fdAttendanceHolidaySegments(boundedStart,boundedEnd,kind);if(!all.length){unsupported=true;return a}
   let normal=0,extra=0,official=0;
   for(const x of all){if(x.holiday){official+=net(x.bas,x.bit);continue}
    const nStart=new Date(Math.max(x.bas,plan.bas)),nEnd=new Date(Math.min(x.bit,plan.bit));if(nEnd>nStart)normal+=net(nStart,nEnd);
    const eStart=new Date(Math.max(x.bas,plan.mesaiBas||plan.bit));if(x.bit>eStart)extra+=net(eStart,x.bit);
   }
   return{...a,normal,brutMesai:official+extra,mesai:official+extra,resmiTatilMesaiDakika:official,fdNormalOvertimeMinutes:extra,fdHolidayNight:true};
  });
  if(unsupported)return record;
  const total=k=>intervals.reduce((n,a)=>n+Number(a[k]||0),0),normal=total('normal'),official=total('resmiTatilMesaiDakika'),extra=total('fdNormalOvertimeMinutes'),first=source[0]?.giris,last=source.at(-1)?.cikis;
  const missed=(start,end)=>parts.filter(x=>!x.holiday).reduce((n,x)=>{const a=new Date(Math.max(x.bas,start)),b=new Date(Math.min(x.bit,end));return n+(b>a?net(a,b):0)},0);
  const late=first instanceof Date&&first>plan.bas?missed(plan.bas,first):0,early=last instanceof Date&&last<plan.bit?missed(last,plan.bit):0;
  const missing=source.some(a=>!a.giris||!a.cikis),now=new Date(),noPunch=!record.giris&&!record.cikis;
  let status=record.durum,level=record.seviye,notices=[...(record.uyarilar||[])].filter(x=>!/Geç geldi|Erken çıktı/.test(x));
  if(!missing){if(noPunch){status=planNormal===0?'Resmî tatil':now<parts.find(x=>!x.holiday).bas?'Planlandı':'Gelmedi';level=status==='Gelmedi'?'hata':'tamam'}else{status=planNormal===0?(official>0?'Resmî Tatil Çalışması':'Resmî tatil'):official>0?'Tatil / Normal Çalışma':'Tamam';level='tamam'}}
  if(missing){const noStart=source.some(a=>!a.giris&&a.cikis),noEnd=source.some(a=>a.giris&&!a.cikis);status=noStart?'Giriş Yok':noEnd?(now>=plan.bit?'Çıkış Yok':'İçeride'):status;level=noStart||noEnd&&now>=plan.bit?'hata':'tamam'}
  if(late){notices.push('Geç geldi '+magicpassDakikaMetni(late));level='uyari'}if(early){notices.push('Erken çıktı '+magicpassDakikaMetni(early));level='uyari'}
  return{...record,normal,gec:late,erken:early,brutMesai:official+extra,mesai:Math.max(0,official+extra-late-early),resmiTatilMesaiDakika:official,calismaAraliklari:intervals,durum:status,seviye:level,uyarilar:notices,fdHolidayNight:{version:1,plannedNormalMinutes:planNormal,plannedHolidayMinutes:planHoliday,normalOvertimeMinutes:extra,segments:parts}};
 };
})(window);

// Shared deadline projections for cold reminders; record array and transports remain common.
function irsaliyeHaftaBaslangici(deger){return vardiyaPazartesi(deger||new Date().toISOString().slice(0,10));}
function irsaliyeHaftaBitisi(deger){return vardiyaHaftaBitisi(irsaliyeHaftaBaslangici(deger));}
function irsaliyeSonFaturaTarihi(k){const son=new Date(`${k.tarih}T12:00:00`);son.setDate(son.getDate()+ayarSayisi('irsaliyeFaturaSuresi',7));return son.toISOString().slice(0,10);}
function irsaliyeGeciktiMi(k){return !k.faturaNo&&new Date().toISOString().slice(0,10)>=irsaliyeSonFaturaTarihi(k);}

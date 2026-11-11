'use strict';
function fdHaftalikVardiyaKaydiMi(record){return !!record&&typeof record==='object'&&!record.kayitTipi&&Object.hasOwn(record,'haftaBaslangic')&&Object.hasOwn(record,'satirlar');}
function fdVardiyaJsonAyniMi(a,b){const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;return JSON.stringify(sort(a))===JSON.stringify(sort(b));}
function fdVardiyaYazmaYetkisi(){return ['admin','yonetici'].includes(kullaniciRolAnahtari())&&anaMenuModulYazmaYetkisiVar('personel');}
function fdVardiyaOturumAnahtari(){return fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+anaMenuModulYetkisi('personel');}
function fdVardiyaKayitOturumuGecerli(key){return key===fdVardiyaOturumAnahtari()&&fdVardiyaYazmaYetkisi();}
async function fdVardiyaGuvenliSunucuKaydi(company,record,expected,isCurrent=()=>true){
    if(!isCurrent()||!fdVardiyaYazmaYetkisi()||String(company)!==String(aktifSirketId()))throw Error('Vardiya kayıt oturumu veya yetkisi değişti.');
    const {data,error}=await supabaseClient.rpc('fd_weekly_roster_save',{p_company_id:String(company),p_id:String(record.id),p_expected:expected,p_data:record});
    if(!isCurrent())throw Error('Vardiya kayıt oturumu değişti.');if(error)throw error;
    if(!data?.data||String(data.legacy_id)!==String(record.id)||!Object.keys(record).every(k=>fdVardiyaJsonAyniMi(data.data[k],record[k])))throw Error('Vardiya sunucuda doğrulanamadı. Tekrar kaydetmeden önce güncel listeyi yükleyin.');
    return data;
}
async function fdVardiyaGuvenliSunucuSil(company,id,expected,isCurrent=()=>true){
    if(!isCurrent()||!fdVardiyaYazmaYetkisi()||String(company)!==String(aktifSirketId()))throw Error('Vardiya silme oturumu veya yetkisi değişti.');
    const {data,error}=await supabaseClient.rpc('fd_weekly_roster_delete',{p_company_id:String(company),p_id:String(id),p_expected:expected});
    if(!isCurrent())throw Error('Vardiya silme oturumu değişti.');if(error)throw error;if(!data?.deleted||String(data.legacy_id)!==String(id))throw Error('Vardiya silme işlemi doğrulanamadı.');return data;
}
function fdVardiyaYerelKaydiniDogrula(result,sent,updateSnapshot=true){
    const id=String(result.legacy_id),index=vardiyaKayitlari.findIndex(r=>String(r.id)===id&&aktifSirketeAit(r));
    if(index>=0&&fdVardiyaJsonAyniMi(vardiyaKayitlari[index],sent))vardiyaKayitlari[index]=JSON.parse(JSON.stringify(result.data));
    if(updateSnapshot){const rows=JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]'),i=rows.findIndex(r=>String(r.id)===id);if(i<0)rows.push(result.data);else rows[i]=result.data;veriSonKayitGoruntuleri.set('vardiya',JSON.stringify(rows));}
}

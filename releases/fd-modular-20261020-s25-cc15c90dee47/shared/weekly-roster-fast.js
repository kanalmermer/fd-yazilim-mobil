'use strict';
(function(root){
    const clone=value=>JSON.parse(JSON.stringify(value)), same=fdVardiyaJsonAyniMi;
    let activeKey='',partialKey='';
    const inFlight=new Map(),lastRead=new Map();
    function key(){return fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+anaMenuModulYetkisi('personel');}
    function valid(identity){return identity===key()&&fdPortalVeriOturumuGecerli(fdPortalVeriOturumu())&&anaMenuModulErisimiVar('personel');}
    function snapshot(){return JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]');}
    function capture(){return {identity:key(),company:String(aktifSirketId()),local:clone(vardiyaKayitlari),baseline:clone(snapshot())};}
    function belongs(row,company){return !row.sirketId||String(row.sirketId)===company;}
    function merge(serverRows,before,full){
        if(!valid(before.identity))return false;
        const eligible=row=>belongs(row,before.company)&&(full||fdHaftalikVardiyaKaydiMi(row));
        const local=vardiyaKayitlari,baseline=snapshot(),map=rows=>new Map(rows.filter(eligible).map(row=>[String(row.id),row]));
        const startLocal=map(before.local),startBase=map(before.baseline),nowLocal=map(local),nowBase=map(baseline),remote=map(serverRows);
        const nextLocal=local.filter(row=>!eligible(row)),nextBase=baseline.filter(row=>!eligible(row));
        for(const id of new Set([...remote.keys(),...nowLocal.keys(),...nowBase.keys()])){
            const current=nowLocal.get(id),expected=nowBase.get(id),initial=startLocal.get(id),initialExpected=startBase.get(id);
            const changedDuringRead=!same(current,initial)||!same(expected,initialExpected);
            const dirty=!same(initial,initialExpected);
            if(changedDuringRead||dirty){if(current!==undefined)nextLocal.push(current);if(expected!==undefined)nextBase.push(expected);}
            else if(remote.has(id)){nextLocal.push(clone(remote.get(id)));nextBase.push(clone(remote.get(id)));}
        }
        if(!valid(before.identity))return false;
        vardiyaKayitlari=nextLocal;veriSonKayitGoruntuleri.set('vardiya',JSON.stringify(nextBase));
        if(full){yuklenenVeriler.add('vardiya');partialKey='';}
        return true;
    }
    root.fdVardiyaKismiYuklemeAktifMi=()=>partialKey===key()&&!yuklenenVeriler.has('vardiya');
    root.fdVardiyaHaftalikListeHazirMi=()=>valid(activeKey)&&lastRead.has(activeKey);
    root.fdVardiyaArsivBirlesimAnligi=()=>!yuklenenVeriler.has('vardiya')?capture():null;
    root.fdVardiyaTamArsiviUygula=(rows,before)=>merge(rows,before,true);
    async function readWeekly(identity,company){
        const rows=[],size=1000;
        for(let start=0;;start+=size){
            if(!valid(identity))throw Error('Vardiya yükleme oturumu değişti.');
            let query=activeUser?.rol==='Personel'
                ?supabaseClient.rpc('portal_my_module_records',{requested_module:'vardiya'})
                :supabaseClient.from('portal_records').select('id,legacy_id,data,record_year,updated_at').eq('company_id',company).eq('module','vardiya');
            const {data,error}=await query.not('data->>haftaBaslangic','is',null).order('id',{ascending:true}).range(start,start+size-1);
            if(!valid(identity))throw Error('Vardiya yükleme oturumu değişti.');if(error)throw error;
            const packet=data||[];
            for(const row of packet){const record={...(row.data||{}),id:row.data?.id??row.legacy_id};if(record.sirketId&&String(record.sirketId)!==company)throw Error('Vardiya şirket kapsamı doğrulanamadı.');if(fdHaftalikVardiyaKaydiMi(record))rows.push(record);}
            if(packet.length<size)return rows;
        }
    }
    root.fdVardiyaHizliListeYukle=function(){
        const identity=key();if(!valid(identity))return Promise.reject(Error('Vardiya ekranını okuma yetkisi bulunmuyor.'));
        if(activeKey!==identity){activeKey=identity;partialKey='';inFlight.clear();lastRead.clear();}
        if(inFlight.has(identity))return inFlight.get(identity);
        if(!yuklenenVeriler.has('vardiya'))partialKey=identity;
        const before=capture(),fresh=Date.now()-(lastRead.get(identity)||0)<10000;
        const work=(async()=>{
            const shared=supabaseVerileriniYukle('vardiya','',{anahtarlar:['personeller','subeler']});
            const weekly=fresh?Promise.resolve(null):readWeekly(identity,before.company);
            const [,rows]=await Promise.all([shared,weekly]);
            if(!valid(identity))throw Error('Vardiya yükleme oturumu değişti.');
            if(rows!==null){if(!merge(rows,before,false))throw Error('Vardiya listesi uygulanamadı.');lastRead.set(identity,Date.now());}
            return true;
        })();
        inFlight.set(identity,work);
        work.finally(()=>{if(inFlight.get(identity)===work)inFlight.delete(identity)}).catch(()=>{});
        return work;
    };
})(window);

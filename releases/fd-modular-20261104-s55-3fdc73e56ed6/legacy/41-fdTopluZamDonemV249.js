
(function(){
    let busy=false,drafts=new Map(),draftMonth='',draftSession='';
    const currentMonth=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date());
    const monthLabel=month=>new Date(month+'-01T12:00:00+03:00').toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
    const state=p=>({values:Object.fromEntries(FD_DONEM_UCRET_ALANLARI.filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]])),history:p.fdUcretDonemleri||[]});
    function install(){
        const modal=document.getElementById('fdTopluZamModal');if(!modal||document.getElementById('fdZamGecerliAy'))return;
        modal.querySelector('.modal-body').insertAdjacentHTML('afterbegin','<div class="fd-zam-donem"><label for="fdZamGecerliAy">Geçerli olacağı ay</label><input id="fdZamGecerliAy" type="month" required max="9998-12"><small id="fdZamDonemNotu">Zam seçilen ayın başından itibaren geçerlidir. Önceki aylar değişmez.</small></div>');
        const input=document.getElementById('fdZamGecerliAy');input.min=currentMonth();input.value=currentMonth();
        input.addEventListener('change',()=>{drafts.clear();draftMonth='';window.fdTopluZamCiz();});
    }
    function selectedMonth(){return document.getElementById('fdZamGecerliAy')?.value||currentMonth();}
    const draw=window.fdTopluZamCiz;
    window.fdTopluZamCiz=function(){
        install();const month=selectedMonth(),session=fdPortalVeriOturumu();
        if(month!==draftMonth||session!==draftSession){drafts.clear();draftMonth=month;draftSession=session;}
        else document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>drafts.set(tr.dataset.pid,tr.querySelector('[data-yeni]').value));
        fdHesapDonemindeCalistir(month,()=>draw.apply(this,arguments));
        document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{
            const p=personeller.find(x=>String(x.id)===tr.dataset.pid&&aktifSirketeAit(x));tr.dataset.salaryState=JSON.stringify(state(p));
            const input=tr.querySelector('[data-yeni]');if(drafts.has(tr.dataset.pid)){input.value=drafts.get(tr.dataset.pid);window.fdTopluZamSatirHesapla(input);}
        });
        const note=document.getElementById('fdZamDonemNotu');if(note)note.textContent=/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)?monthLabel(month)+' ayından itibaren geçerlidir. Önceki aylar değişmez. Ayı değiştirmek yeni ücret girişlerini temizler.':'Geçerli olacağı ayı seçin.';
    };
    const rowCalculate=window.fdTopluZamSatirHesapla;
    window.fdTopluZamSatirHesapla=function(){return fdHesapDonemindeCalistir(selectedMonth(),()=>rowCalculate.apply(this,arguments));};
    const open=window.fdTopluZamAc;
    window.fdTopluZamAc=function(){if(isPersonelUser()||!isManagerUser())return;install();drafts.clear();draftMonth='';document.getElementById('fdZamGecerliAy').value=currentMonth();document.getElementById('fdZamGecerliAy').min=currentMonth();return open.apply(this,arguments);};
    function mergeSaved(rows,changes){
        const keys=[...FD_DONEM_UCRET_ALANLARI,'fdUcretDonemleri','ucretGecmisi'];
        const oldSnapshot=JSON.parse(veriSonKayitGoruntuleri.get('personeller')||'[]');
        for(const row of rows){
            const id=String(row.legacy_id),p=personeller.find(x=>String(x.id)===id&&aktifSirketeAit(x)),change=changes.find(x=>x.id===id);
            if(p&&JSON.stringify(state(p))===JSON.stringify(change.expected)){for(const key of keys){delete p[key];if(Object.hasOwn(row.data,key))p[key]=row.data[key];}}
            const position=oldSnapshot.findIndex(x=>String(x.id)===id);if(position>=0)oldSnapshot[position]=row.data;else oldSnapshot.push(row.data);
        }
        veriSonKayitGoruntuleri.set('personeller',JSON.stringify(oldSnapshot));veriOnbelleginiKaydet();
    }
    window.fdTopluZamlariKaydet=async function(){
        if(busy||isPersonelUser()||!isManagerUser())return;
        const month=selectedMonth(),session=fdPortalVeriOturumu(),company=aktifSirketId(),changes=[];
        if(!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)||month<currentMonth()||month>'9998-12')return alert('Bu ayı veya ileri bir ayı seçin. Önceki ayların ücretleri değiştirilemez.');
        document.querySelectorAll('#fdTopluZamBody tr[data-pid]').forEach(tr=>{
            const input=tr.querySelector('[data-yeni]'),wage=paraMetniniSayiyaCevir(input.value);
            if(input.value.trim()&&Math.abs(wage-Number(tr.dataset.eski))>.001)changes.push({id:tr.dataset.pid,dailyWage:wage,expected:JSON.parse(tr.dataset.salaryState)});
        });
        if(changes.some(x=>!Number.isFinite(x.dailyWage)||x.dailyWage<=0||x.dailyWage>100000000))return alert('Yeni yevmiyeler pozitif ve geçerli tutarlar olmalıdır.');
        if(!changes.length)return alert('Kaydedilecek yeni yevmiye girişi bulunmuyor.');
        if(!SUPABASE_MODE||!supabaseClient)return alert('Toplu ücret güncellemesi için sunucu bağlantısı gerekiyor.');
        busy=true;
        const controls=[...document.querySelectorAll('#fdTopluZamModal input,#fdTopluZamModal button')],disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);
        try{
            if(!await fdYuzerOnaySor(changes.length+' personelin yeni ücreti '+monthLabel(month)+' ayından itibaren uygulansın mı? Önceki aylar değişmeyecek.','Toplu Ücret Güncelleme','Kaydet'))return;
            if(!fdPortalVeriOturumuGecerli(session)||company!==aktifSirketId())throw Error('Oturum değişti. İşlem iptal edildi.');
            if(changes.some(x=>{const p=personeller.find(p=>String(p.id)===x.id&&aktifSirketeAit(p));return !p||JSON.stringify(state(p))!==JSON.stringify(x.expected);}))throw Error('Ücret bilgileri değişmiş. Listeyi yeniden açın.');
            showGlobalOverlay('Ücretler güncelleniyor',changes.length+' personel · '+monthLabel(month));
            const {data,error}=await supabaseClient.rpc('fd_bulk_salary_update',{p_company_id:company,p_month:month,p_changes:changes});
            if(error)throw error;
            if(!fdPortalVeriOturumuGecerli(session)||company!==aktifSirketId())return;
            if(!Array.isArray(data)||data.length!==changes.length)throw Error('Sunucu yanıtı doğrulanamadı. Listeyi yenileyin.');
            mergeSaved(data,changes);drafts.clear();draftMonth='';document.querySelectorAll('#fdTopluZamBody [data-yeni]').forEach(x=>x.value='');initUI();window.fdTopluZamCiz();
            showToast(changes.length+' personelin ücreti '+monthLabel(month)+' ayından itibaren güncellendi.');
        }catch(error){if(fdPortalVeriOturumuGecerli(session))alert('Ücret güncellemesi tamamlanamadı: '+(error.message||error));}
        finally{busy=false;controls.forEach((c,i)=>c.disabled=disabled[i]);hideGlobalOverlay();}
    };
    const historyOpen=window.fdUcretGecmisiAc;
    window.fdUcretGecmisiAc=function(id=''){
        if(isPersonelUser()||!isManagerUser())return;
        if(id&&!personeller.some(p=>String(p.id)===String(id)&&aktifSirketeAit(p)))return;
        historyOpen.apply(this,arguments);
        const rows=personeller.filter(p=>aktifSirketeAit(p)&&(!id||String(p.id)===String(id))).flatMap(p=>(p.ucretGecmisi||[]).map(g=>({...g}))).sort((a,b)=>String(b.tarih||'').localeCompare(String(a.tarih||'')));
        const table=document.querySelector('#fdUcretGecmisiBody table');if(!table)return;
        table.querySelector('thead th').insertAdjacentHTML('afterend','<th>Geçerli Ay</th>');
        table.querySelectorAll('tbody tr').forEach((tr,i)=>tr.firstElementChild.insertAdjacentHTML('afterend','<td>'+escapeDashboardText(rows[i]?.gecerliAy?monthLabel(rows[i].gecerliAy):'—')+'</td>'));
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();


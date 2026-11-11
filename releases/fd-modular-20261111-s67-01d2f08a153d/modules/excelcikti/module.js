window.FDModules.define('excelcikti',function(){
const root=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&root.fdExcelCiktiKayitli(r)&&r?.current();
function execute(request){
 if(!valid(request)||!request.args||!request.data||!request.helpers)return false;requests.add(request);request.onCancel=()=>requests.delete(request);
 const check=()=>{if(!valid(request))throw Error('Excel çıktı ekranı değişti.')};
 const h=request.helpers,data=request.data,utils={};for(const[k,fn]of Object.entries(h.utils))utils[k]=(...a)=>{check();return k==='book_new'&&request.action==='payroll'?data.workbook:fn.apply(h.library.utils,a)};
 const XLSX={utils,writeFile:(...a)=>{check();const before=root.document.getElementById('fdOrtakCiktiOnizleme'),result=h.sink.apply(h.library,a),node=root.document.getElementById('fdOrtakCiktiOnizleme');if(node&&node!==before&&node._tur==='excel'){request.output=node;request.outputBlob=node._blob;}check();return result}};
 const puantajTablosunuExcelIcinHazirla=()=>{check();return data.clone},tabloCiktiVerisi=()=>{check();return data.veri};
 const document={getElementById:(...a)=>{check();return root.document.getElementById(...a)}},alert=(...a)=>{check();return root.alert(...a)},tabloPdfOnizle=()=>{throw Error('PDF yolu Excel modülüne ait değil.')};
 const originalPayroll=function exportPuantajToExcel() {
        const wb = XLSX.utils.book_new();
        // Türkçe sayı biçimlerini (7,5 ve 2.000 gibi) Excel'in 75 / 2 olarak yorumlamaması için metin olarak aktar.
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(puantajTablosunuExcelIcinHazirla(), { raw: true }), "Aylik_Puantaj");
        XLSX.writeFile(wb, "Personel_Puantaj_Cizelgesi.xlsx");
    };
 const originalTable=async function(tbodyId,tur,baslik,dosyaAdi,secenek={}){
        const tbody=document.getElementById(tbodyId),veri=tabloCiktiVerisi(secenek.fdTable||tbody?.closest('table'));if(!veri)return;
        if(!veri.satirlar.length)return alert('Aktarılacak filtrelenmiş kayıt bulunmuyor.');
        if(tur==='excel'){const ws=XLSX.utils.aoa_to_sheet([veri.kolonlar,...veri.satirlar,...veri.toplamlar]);ws['!cols']=veri.kolonlar.map((a,i)=>({wch:Math.min(36,Math.max(14,a.length+4,...veri.satirlar.map(s=>String(s[i]||'').length+2)))}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Liste');XLSX.writeFile(wb,(dosyaAdi||'Rapor')+'.xlsx');return;}
        return tabloPdfOnizle(veri.tablo,baslik,(dosyaAdi||'Rapor')+'.pdf');
    };
 try{check();const value=request.action==='payroll'?originalPayroll(...request.args):originalTable(...request.args);return Promise.resolve(value).then(value=>({ok:true,value}),error=>({ok:false,error}))}catch(error){return{ok:false,error}}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});

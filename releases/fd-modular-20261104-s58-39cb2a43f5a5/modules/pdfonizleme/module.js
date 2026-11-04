window.FDModules.define('pdfonizleme',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',...['personel','arac','police'].map(id=>anaMenuModulYetkisi(id))])}
function valid(request=bound){return !disposed&&context()===initial&&request?.current()}
function fdPdfAssert(request){if(bound!==request||!valid(request)){const error=Error('PDF önizleme oturumu değişti.');error.fdPdfCancelled=true;throw error}}
async function fdPdfAwait(promise,request){fdPdfAssert(request);const value=await Promise.race([promise,request.whenCancelled.then(()=>{const error=Error('PDF önizleme kapatıldı.');error.fdPdfCancelled=true;throw error})]);fdPdfAssert(request);return value}
function clear(){bound?.cancel();bound=null;if(owned&&document.getElementById('modalIcraPdf')===owned){icraPdfKapat();owned.querySelector('#icraPdfBaslik').textContent='İcra Yazısı'}observer?.takeRecords()}
async function icraPdfAc(url, dosyaNo, belgeTuru = 'İcra Yazısı', fdPdfRequest) {
        let dosyaUrl = String(url || '');
        if (dosyaUrl.startsWith('supabase:')) {
            const yol = dosyaUrl.slice('supabase:'.length);
            const { data, error } = await fdPdfAwait(supabaseClient.storage.from('icra-pdf').createSignedUrl(yol, 300), fdPdfRequest);
            fdPdfAssert(fdPdfRequest);
            if (error || !data?.signedUrl) {
                alert('PDF için güvenli görüntüleme bağlantısı oluşturulamadı.');
                return;
            }
            dosyaUrl = data.signedUrl;
        }
        const driveId = dosyaUrl.match(/\/d\/([^/]+)/)?.[1];
        const onizlemeUrl = driveId ? `https:\x2f\x2fdrive.google.com/file/d/${driveId}/preview` : dosyaUrl;
        fdPdfAssert(fdPdfRequest);
        document.getElementById('icraPdfBaslik').textContent = `${belgeTuru} — ${dosyaNo || ''}`;
        document.getElementById('icraPdfFrame').src = onizlemeUrl;
        document.getElementById('modalIcraPdf').style.display = 'flex';
    }
function icraPdfKapat() {
        document.getElementById('modalIcraPdf').style.display = 'none';
        document.getElementById('icraPdfFrame').src = 'about:blank';
    }
return{init(){owned=document.getElementById('modalIcraPdf');const frame=document.createElement('iframe');for(const [name,value] of [["id","icraPdfFrame"],["title","İcra yazısı PDF önizleme"],["style","width:100%; height:100%; min-height:75vh; border:0;"]])frame.setAttribute(name,value);owned.querySelector('[data-fd-pdf-frame-slot]').replaceWith(frame);observer=new MutationObserver(()=>{if(bound&&owned?.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},async open(request=fdPdfOnizlemeIstek){if(!valid(request)){request?.cancel();return}if(bound&&bound!==request)clear();bound=request;request.clearError();try{const result=await icraPdfAc(...request.args,request);if(bound===request&&(!valid(request)||owned?.style.display!=='flex'))clear();return result}catch(error){if(error?.fdPdfCancelled){if(bound===request)clear();return}throw error}},api:{icraPdfKapat:clear},dispose(){clear();disposed=true;observer?.disconnect();owned=null}};
});

'use strict';
(function(root){
    // Presentation metadata only: original Drive image and transport stay intact.
    let draft=null;
    const clamp=(value,min,max,fallback)=>{const n=Number(value);return value===null||value===''||!Number.isFinite(n)?fallback:Math.min(max,Math.max(min,n))};
    const normalize=value=>({x:clamp(value?.x,0,100,50),y:clamp(value?.y,0,100,50),zoom:clamp(value?.zoom,1,2.5,1)});
    const identity=()=>fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+anaMenuModulYetkisi('personel');
    const editId=()=>String(document.getElementById('pEditOriginalId')?.value||'');
    const current=()=>draft&&draft.owner===identity()&&draft.id===editId();
    const style=value=>{const c=normalize(value);return `object-position:${c.x}% ${c.y}%;transform:scale(${c.zoom});transform-origin:${c.x}% ${c.y}%`};
    function html(person,kind='list'){
        const url=personelFotografAdresi(person),size=kind==='detail'?' fd-person-photo-detail':'';
        return `<span class="user-img-thumb fd-person-photo${size}" role="img" aria-label="Personel fotoğrafı">${url?`<img alt="" src="${escapeDashboardText(url)}" style="${style(person?.fotografKadraj)}">`:'<span aria-hidden="true">👤</span>'}</span>`;
    }
    function controls(){
        let panel=document.getElementById('fdPersonnelPhotoCrop');if(panel)return panel;
        const input=document.getElementById('pFotoDosya');if(!input)return null;
        panel=document.createElement('details');panel.id='fdPersonnelPhotoCrop';panel.className='fd-person-photo-settings';
        panel.innerHTML='<summary>Fotoğraf kadrajını ayarla</summary><div class="fd-person-photo-editor"><div class="fd-person-photo-preview"><img id="fdPersonnelPhotoPreview" alt="Fotoğraf kadrajı önizlemesi" hidden><span id="fdPersonnelPhotoEmpty" aria-live="polite">Fotoğraf yok</span></div><div class="fd-person-photo-sliders"><label for="fdPersonnelPhotoX">Sağ – sol</label><input id="fdPersonnelPhotoX" type="range" min="0" max="100" step="1" value="50"><label for="fdPersonnelPhotoY">Yukarı – aşağı</label><input id="fdPersonnelPhotoY" type="range" min="0" max="100" step="1" value="50"><label for="fdPersonnelPhotoZoom">Yakınlaştırma</label><input id="fdPersonnelPhotoZoom" type="range" min="1" max="2.5" step="0.05" value="1"><button type="button" id="fdPersonnelPhotoReset">Ortala</button></div></div>';
        input.closest('.form-group').append(panel);
        for(const[key,id]of [['x','X'],['y','Y'],['zoom','Zoom']])panel.querySelector('#fdPersonnelPhoto'+id).addEventListener('input',event=>{if(!current())return end();draft.crop=normalize({...draft.crop,[key]:event.target.value});paint()});
        panel.querySelector('#fdPersonnelPhotoReset').addEventListener('click',()=>{if(!current())return end();draft.crop=normalize(null);paint()});
        const image=panel.querySelector('img');image.addEventListener('error',()=>{if(!current())return;image.hidden=true;const empty=panel.querySelector('#fdPersonnelPhotoEmpty');empty.hidden=false;empty.textContent='Fotoğraf yüklenemedi'});
        const modal=document.getElementById('modalPersonel');new MutationObserver(()=>{if(draft&&modal.style.display==='none')end()}).observe(modal,{attributes:true,attributeFilter:['style']});
        return panel;
    }
    function release(){if(draft?.localURL)URL.revokeObjectURL(draft.localURL)}
    function paint(){
        if(!current())return;
        const panel=controls(),image=panel.querySelector('img'),empty=panel.querySelector('#fdPersonnelPhotoEmpty');
        for(const[key,id]of [['x','X'],['y','Y'],['zoom','Zoom']]){const input=panel.querySelector('#fdPersonnelPhoto'+id);input.value=draft.crop[key];input.disabled=!draft.url}
        panel.querySelector('button').disabled=!draft.url;image.style.cssText=style(draft.crop);image.hidden=!draft.url;empty.hidden=!!draft.url;empty.textContent='Fotoğraf yok';
        if(draft.url){if(image.getAttribute('src')!==draft.url)image.src=draft.url}else image.removeAttribute('src');
    }
    function begin(person){
        release();draft={owner:identity(),id:editId(),crop:normalize(person?.fotografKadraj),original:person?.fotografKadraj,url:personelFotografAdresi(person),localURL:null};
        const panel=controls();if(panel){panel.open=false;paint()}
    }
    function selected(input){
        if(!current())return;
        release();draft.localURL=null;
        const file=input?.files?.[0],valid=file&&['image/jpeg','image/png','image/webp'].includes(String(file.type).toLowerCase())&&file.size<=8*1024*1024;
        if(valid){draft.localURL=URL.createObjectURL(file);draft.url=draft.localURL;draft.crop=normalize(null);controls().open=true}
        else {draft.url=personelFotografAdresi(personeller.find(p=>String(p.id)===draft.id&&aktifSirketeAit(p)));draft.crop=normalize(draft.original)}
        paint();
    }
    function payload(person){
        // Reject a draft from a different actor/company/card before any upload.
        if(!current()||String(person?.id||'')!==draft.id)return null;
        const crop=normalize(draft.crop),old=normalize(person?.fotografKadraj);
        return crop.x===old.x&&crop.y===old.y&&crop.zoom===old.zoom?{}:{fotografKadraj:crop};
    }
    function end(){release();draft=null;const panel=document.getElementById('fdPersonnelPhotoCrop');if(panel){panel.open=false;panel.querySelector('img').removeAttribute('src');panel.querySelector('img').hidden=true;for(const input of panel.querySelectorAll('input'))input.disabled=true}}
    root.fdPersonnelPhoto=Object.freeze({html,begin,selected,payload,end,normalize});
})(window);

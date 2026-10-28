(function(root){
    'use strict';
    let active=null,depth=0,serial=0;
    const visible=node=>Boolean(node?.isConnected&&node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden');
    const actor=()=>typeof activeUser==='undefined'||!activeUser?'':JSON.stringify([activeUser.supabaseUserId||activeUser.id||activeUser.username,activeUser.sirketId,activeUser.rol,typeof uygulamaAyarlari==='undefined'?null:uygulamaAyarlari.anaMenuModulleri]);
    function remove(state){
        if(!state)return;
        const focused=state.node&&document.activeElement===state.node;
        state.node?.remove();state.node=null;
        if(focused&&state.key===actor()&&visible(state.focus))state.focus.focus({preventScroll:true});
    }
    function cancel(){const state=active;if(!state)return;active=null;clearInterval(state.watch);remove(state);}
    function check(state){
        if(active!==state)return;
        if(!state.key||state.key!==actor()||document.hidden){cancel();return;}
        if(visible(document.getElementById('fdAttendanceLoading'))){state.muted=true;remove(state);return;}
        const global=document.getElementById('globalOverlay');
        if(visible(global)&&!/yüklen/i.test(document.getElementById('overlayTitle')?.textContent||'')){state.muted=true;remove(state);}
    }
    function show(state){
        check(state);if(active!==state||state.muted||!state.jobs||state.node)return;
        const node=document.createElement('div');node.id='fdPageLoading';node.className='fd-page-loading';node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.setAttribute('aria-busy','true');node.tabIndex=-1;
        node.innerHTML='<div class="fd-page-loading-card"><div class="big-spinner" aria-hidden="true"></div><h3>Yükleniyor</h3></div>';
        // Do not claim aria-modal: the attendance loader checks that attribute
        // before starting its own independently owned percentage layer.
        state.focus=document.activeElement;state.node=node;document.body.appendChild(node);
        node.addEventListener('keydown',event=>{event.preventDefault();event.stopPropagation();});node.focus({preventScroll:true});
    }
    function begin(embedded=false){
        if((depth||embedded)&&active){active.jobs++;return active;}
        cancel();const state={id:++serial,key:actor(),jobs:1,node:null,muted:false};active=state;
        state.watch=setInterval(()=>check(state),150);requestAnimationFrame(()=>show(state));return state;
    }
    function end(state){
        if(!state||active!==state)return;
        state.jobs=Math.max(0,state.jobs-1);
        if(!state.jobs)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(active===state&&!state.jobs)cancel();}));
    }
    function track(value,state=active){
        if(!state||active!==state||!value||typeof value.then!=='function')return value;
        state.jobs++;Promise.resolve(value).then(()=>end(state),()=>end(state));return value;
    }
    function wrap(name,opening){
        const original=root[name];if(typeof original!=='function'||original.__fdPageLoading)return;
        const wrapped=opening?function(...args){
            const state=begin();depth++;
            try{return track(original.apply(this,args),state);}finally{depth--;end(state);}
        }:function(...args){return track(original.apply(this,args));};
        Object.assign(wrapped,original);wrapped.__fdPageLoading=true;root[name]=wrapped;
        if(opening&&typeof fdSekmeOrijinaller!=='undefined'&&fdSekmeOrijinaller[name]===original)fdSekmeOrijinaller[name]=wrapped;
    }
    // Observe existing reads only while an explicit page-opening intent lives.
    // Never start a request, change a return value, or block a background refresh.
    function install(){
        for(const name of ['supabaseVerileriniYukle','driveVerileriniYukleBaslangicta','supabaseKullanicilariYukle','fdPersonelListeyiHazirla'])wrap(name,false);
        for(const name of ['openPersonelDashboard','openPersonelApp','openPuantajApp','openPuantajGorunumu','openPrimApp'])wrap(name,true);
        for(const name of ['fdAnaEkranaHafifDon','logout','cikisYap']){
            const original=root[name];if(typeof original!=='function'||original.__fdPageLoadingCancel)continue;
            const wrapped=function(...args){cancel();return original.apply(this,args);};Object.assign(wrapped,original);wrapped.__fdPageLoadingCancel=true;root[name]=wrapped;
        }
        const attendance=root.openMagicpassApp;
        if(typeof attendance==='function'&&!attendance.__fdPageLoadingCancel){const wrapped=function(...args){cancel();return attendance.apply(this,args);};Object.assign(wrapped,attendance);wrapped.__fdPageLoadingCancel=true;root.openMagicpassApp=wrapped;if(typeof fdSekmeOrijinaller!=='undefined'&&fdSekmeOrijinaller.openMagicpassApp===attendance)fdSekmeOrijinaller.openMagicpassApp=wrapped;}
    }
    root.fdPageLoading=Object.freeze({beginModule(id,embedded){return begin(embedded);},end,cancel,install});
    install();document.addEventListener('DOMContentLoaded',install,{once:true});
})(window);

(function(root){
'use strict';
root.fdAiPanelAc=function(acik=true){if(acik){if(!activeUser||isPersonelUser())return;return FDModules.embedded('asistan',[true],this)}return FDModules.callIfLoaded('asistan','fdAiPanelAc',[false],this)};
root.fdAiTemizle=function(){return FDModules.callIfLoaded('asistan','fdAiTemizle',Array.from(arguments),this)};
root.fdAiSor=function(){return FDModules.callIfLoaded('asistan','fdAiSor',Array.from(arguments),this)};
root.fdAiFormGonder=function(){return FDModules.callIfLoaded('asistan','fdAiFormGonder',Array.from(arguments),this)};
function update(){const topbar=document.getElementById('portalTopbar'),button=document.getElementById('fdAiButon'),visible=Boolean(activeUser&&!isPersonelUser()&&topbar&&getComputedStyle(topbar).display!=='none');if(button)button.style.display=visible?'inline-flex':'none';if(!visible){try{FDModules.sessionChanged();root.fdAiPanelAc(false)}catch(_){}}}
function install(){if(document.getElementById('fdAiButon'))return;const button=document.createElement('button');button.id='fdAiButon';button.type='button';button.className='fd-ai-buton';button.title="Fatih'e Sor";button.setAttribute('aria-label',"Fatih'e Sor");button.innerHTML="<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z\"/><path d=\"M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z\"/></svg>";button.onclick=()=>root.fdAiPanelAc(true);document.body.append(button);const topbar=document.getElementById('portalTopbar');if(topbar)new MutationObserver(update).observe(topbar,{attributes:true,attributeFilter:['style','class']});update()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);

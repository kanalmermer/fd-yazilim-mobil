window.openKurGecmisiApp=function(){return FDModules.open('kurgecmisi',[],this);};
fdUygulamaSekmeTanimlari.kurgecmisi={ad:'Kur Geçmişi',ikon:'💱',acilis:'openKurGecmisiApp'};
fdSekmeFonksiyonlari.openKurGecmisiApp='kurgecmisi';
if(!fdSekmeAlanlari.includes('kurGecmisiApp'))fdSekmeAlanlari.push('kurGecmisiApp');
ANA_MENU_MODUL_KOKLERI.kurgecmisi='#kurGecmisiApp';
fdSekmeSisteminiKur();
(function(){const launcher=document.querySelector('#appHub .workspace-launcher');if(launcher&&!launcher.querySelector('[data-ana-menu-modul="kurgecmisi"]')){const card=document.createElement('button');card.type='button';card.className='workspace-card';card.dataset.anaMenuModul='kurgecmisi';card.onclick=event=>anaMenuModulunuAc('kurgecmisi',event);card.innerHTML='<span class="workspace-card-icon" aria-hidden="true">💱</span><span><strong>Kur Geçmişi</strong><small>Günlük TCMB döviz alış kayıtları</small></span><b>Modülü aç →</b>';launcher.appendChild(card)}anaMenuModulKartlariniUygula();})();

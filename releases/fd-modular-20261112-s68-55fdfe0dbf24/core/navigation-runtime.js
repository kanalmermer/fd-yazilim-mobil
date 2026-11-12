/* Main screen and navigation: synchronous public API; setup retains original execution order. */
function fdGorunenUygulamaId(){
        const idler=['personelApp','personelDashboardApp','izinTakipApp','puantajApp','avansApp','icraApp','ekOdemeApp','kkdApp','vardiyaApp','magicpassApp','irsaliyeTakipApp','kiraTakipApp','ihracatApp','aracTakipApp','policeTakipApp','sirketApp'];
        return idler.find(id=>{const el=document.getElementById(id);return el&&getComputedStyle(el).display!=='none';})||'';
    }

function aktifAnaMenuModulKapsaminda(element){
        const anahtar=String(document.body.dataset.aktifAnaMenuModul||''),secici=ANA_MENU_MODUL_KOKLERI[anahtar];
        return Boolean(secici&&element?.closest?.(secici));
    }

function anaMenuModulunuAc(anahtar,event){
        const modul=anaMenuModulAyarlariniDuzelt().find(m=>m.anahtar===anahtar);
        if(!modul||!anaMenuModulErisimiVar(anahtar))return showToast('Bu modül bu kullanıcı için görünür değil.','warning');
        personelModuluYetkiGorunumunuUygula(anahtar);
        const ac=window[modul.fonksiyon];if(typeof ac!=='function')return showToast('Modül açılamadı.','error');ac(event);setTimeout(()=>personelModuluYetkiGorunumunuUygula(anahtar),0);
    }

function anaMenuModulKartlariniBagla(){
        const baslatici=document.querySelector('#appHub .workspace-launcher');if(!baslatici)return;
        const eslesmeler={personel:'openPersonnelWorkspace',arac:'openAracTakipApp',police:'openPoliceTakipApp',irsaliye:'openIrsaliyeTakipApp',kira:'openKiraTakipApp',tapu:'openTapuTakipApp',evrak:'openEvrakTakipApp',ihracat:'openIhracatApp',sirket:'openSirketApp',kullanici:'openAdminModal',ayarlar:'openAyarlarApp',bildirim:'openWhatsappMesajlari',isMerkezi:'openWorkCenterApp'};
        Object.entries(eslesmeler).forEach(([anahtar,fonksiyon])=>{const kart=[...baslatici.querySelectorAll(':scope > .workspace-card')].find(el=>el.dataset.anaMenuModul===anahtar||String(el.getAttribute('onclick')||'').includes(fonksiyon));if(!kart)return;kart.dataset.anaMenuModul=anahtar;kart.setAttribute('onclick',`anaMenuModulunuAc('${anahtar}',event)`);kart.classList.remove('workspace-admin-action','company-admin-action');kart.style.marginTop='';});
    }

function anaMenuModulKartlariniUygula(){
        anaMenuModulKartlariniBagla();const baslatici=document.querySelector('#appHub .workspace-launcher');if(!baslatici)return;
        anaMenuModulAyarlariniDuzelt().forEach(modul=>{const kart=baslatici.querySelector(`[data-ana-menu-modul="${modul.anahtar}"]`);if(!kart)return;const ikon=kart.querySelector('.workspace-card-icon'),ad=kart.querySelector('strong'),aciklama=kart.querySelector('small'),aksiyon=kart.querySelector('b');if(ikon){ikon.textContent=modul.ikon;ikon.style.background=modul.renk;}if(ad)ad.textContent=modul.ad;if(aciklama)aciklama.textContent=modul.aciklama;if(aksiyon){aksiyon.textContent='Modülü aç →';aksiyon.style.color='#334155';}kart.style.display=anaMenuModulErisimiVar(modul.anahtar)?'grid':'none';baslatici.appendChild(kart);});
        personelAnaEkranKartlariniUygula();
    }

function showHub() {
        const whatsappAlan=document.getElementById('whatsappMesajApp');if(whatsappAlan)whatsappAlan.style.display='none';
        icraEkraniniKapat();
        document.body.classList.remove('personel-modulu-salt-okunur');
        const userStr = sessionStorage.getItem('loggedInUser');
        if (!userStr) {
            document.body.classList.remove('personel-session');
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('portalTopbar').style.display = 'none';
            document.getElementById('appHub').style.display = 'none';
            document.getElementById('personelApp').style.display = 'none';
            document.getElementById('izinTakipApp').style.display = 'none';
            document.getElementById('puantajApp').style.display = 'none';
            document.getElementById('sirketApp').style.display = 'none';
            document.getElementById('ayarlarApp').style.display = 'none';
            document.getElementById('aracTakipApp').style.display = 'none';
        document.getElementById('policeTakipApp').style.display = 'none';
            document.getElementById('vardiyaApp').style.display = 'none';
        document.getElementById('magicpassApp').style.display = 'none';
            document.getElementById('irsaliyeTakipApp').style.display = 'none';
            document.getElementById('kiraTakipApp').style.display = 'none';
            document.getElementById('ihracatApp').style.display = 'none';
        document.getElementById('evrakTakipApp').style.display = 'none';
            return;
        }
        activeUser = JSON.parse(userStr);
        document.body.classList.toggle('personel-session', activeUser.rol === 'Personel');
        document.getElementById('activeUserSpan').innerText = activeUser.username;
        document.getElementById('userBadgeSpan').innerText = activeUser.rol === 'Yonetici' ? 'Kullanıcı' : (activeUser.rol || "Kullanıcı");
        document.getElementById('userBadgeSpan').className = isManagerUser() ? "badge badge-admin" : "badge badge-user";
        const companyBadge = document.getElementById('activeCompanySpan');
        companyBadge.textContent = activeUser.sirketAdi || '';
        companyBadge.style.display = activeUser.sirketAdi ? 'inline-flex' : 'none';
        document.getElementById('cardAdminPanel').style.display = isManagerUser() ? "flex" : "none";
        document.querySelectorAll('.dashboard-admin-action, .workspace-admin-action').forEach(button => button.style.display = isManagerUser() ? "flex" : "none");
        document.querySelectorAll('.company-admin-action').forEach(button => button.style.display = isManagerUser() ? "flex" : "none");
        anaMenuModulKartlariniUygula();

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('portalTopbar').style.display = 'flex';
        tcmbDunkuKurlariYukle();
        document.getElementById('appHub').style.display = 'block';
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('ayarlarApp').style.display = 'none';
        document.getElementById('aracTakipApp').style.display = 'none';
        document.getElementById('policeTakipApp').style.display = 'none';
        document.getElementById('vardiyaApp').style.display = 'none';
        document.getElementById('magicpassApp').style.display = 'none';
        document.getElementById('irsaliyeTakipApp').style.display = 'none';
        document.getElementById('kiraTakipApp').style.display = 'none';
        document.getElementById('ihracatApp').style.display = 'none';
        document.getElementById('evrakTakipApp').style.display = 'none';
        renderDashboard();
        kullaniciOturumPaneliniYukle(false);
        yillikPersonelBelgeButonunuGuncelle();
        setTimeout(()=>gunlukHatirlatmalariGoster(), 250);
    }

function closeAppsToHub() {
        const whatsappAlan=document.getElementById('whatsappMesajApp');if(whatsappAlan)whatsappAlan.style.display='none';
        if (typeof ihracatHucreToplamSeciminiTemizle === 'function') ihracatHucreToplamSeciminiTemizle();
        icraEkraniniKapat();
        document.body.classList.remove('personel-modulu-salt-okunur');
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        document.getElementById('ayarlarApp').style.display = 'none';
        document.getElementById('aracTakipApp').style.display = 'none';
        document.getElementById('policeTakipApp').style.display = 'none';
        document.getElementById('vardiyaApp').style.display = 'none';
        document.getElementById('magicpassApp').style.display = 'none';
        document.getElementById('irsaliyeTakipApp').style.display = 'none';
        document.getElementById('kiraTakipApp').style.display = 'none';
        document.getElementById('ihracatApp').style.display = 'none';
        document.getElementById('evrakTakipApp').style.display = 'none';
        document.getElementById('appHub').style.display = 'block';
        renderDashboard();
    }

function anaMenuDonusButonunuGoster() {}

function workspaceSekmesiniAktifEt(hedef) {
        const vardiyaApp = document.getElementById('vardiyaApp');
        if (vardiyaApp && hedef !== 'vardiya') vardiyaApp.style.display = 'none';
        const fonksiyonlar = {
            ozet: 'openPersonelDashboard', personel: 'openPersonelApp', izin: 'openIzinTakipApp',
            puantaj: 'openPuantajApp', prim: 'openPrimApp', avans: 'openAvansApp',
            icra: 'openIcraApp', vardiya: 'openVardiyaApp', giriscikis: 'openMagicpassApp'
        };
        document.querySelectorAll('.workspace-nav button').forEach(button => {
            const tiklama = button.getAttribute('onclick') || '';
            const aktif = button.dataset.workspace === hedef || (fonksiyonlar[hedef] && tiklama.includes(fonksiyonlar[hedef]));
            button.classList.toggle('active', Boolean(aktif));
        });
    }

function toggleSidebar() {
        const pSide = document.getElementById('pSidebar');
        const iSide = document.getElementById('iSidebar');
        const puanSide = document.getElementById('puantajSidebar');
        if(pSide) pSide.classList.toggle('collapsed');
        if(iSide) iSide.classList.toggle('collapsed');
        if(puanSide) puanSide.classList.toggle('collapsed');
    }

function fdSelectDegerleriniSakla(seciciler) {
        return Object.fromEntries(seciciler.map(id => [id, document.getElementById(id)?.value ?? '']));
    }

function fdSelectDegerleriniGeriYukle(degerler) {
        Object.entries(degerler || {}).forEach(([id, deger]) => {
            const alan = document.getElementById(id);
            if (alan && [...alan.options].some(option => option.value === deger)) alan.value = deger;
        });
    }

function anaMenuModernIkonlariniKur(){
        const ikonlar=[
            ['openPersonnelWorkspace','personel','#2563eb','#06b6d4','<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11l2 2 4-4"/>'],
            ['openAracTakipApp','arac','#1d4ed8','#06b6d4','<path d="M3 15l1.5-5h15l1.5 5"/><path d="M5 10l2-4h10l2 4"/><path d="M3 15v4h3v-2h12v2h3v-4"/><circle cx="7" cy="14" r="1"/><circle cx="17" cy="14" r="1"/>'],
            ['openPoliceTakipApp','police','#047857','#14b8a6','<path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4z"/><path d="M8.5 12l2.2 2.2 4.8-5"/>'],
            ['openIrsaliyeTakipApp','irsaliye','#6d28d9','#a855f7','<path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 9h5M6 12h4"/>'],
            ['openKiraTakipApp','kira','#c2410c','#f59e0b','<path d="M3 11l9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/><circle cx="18" cy="6" r="2"/><path d="M18 8v3"/>'],
            ['openIhracatApp','ihracat','#047857','#22c55e','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/><path d="M16 7h5v5"/>'],
            ['openSirketApp','sirket','#0369a1','#0ea5e9','<path d="M4 21V7l8-4v18M12 9h8v12M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>'],
            ['openAdminModal','yetki','#b91c1c','#f43f5e','<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/><circle cx="12" cy="15" r="1"/><path d="M12 16v2"/>'],
            ['openAyarlarApp','ayarlar','#334155','#0f172a','<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>']
        ];
        document.querySelectorAll('#appHub .workspace-card').forEach(kart=>{const olay=String(kart.getAttribute('onclick')||''),tanim=ikonlar.find(x=>olay.includes(x[0])),alan=kart.querySelector('.workspace-card-icon');if(!tanim||!alan)return;alan.dataset.module=tanim[1];alan.style.setProperty('--ikon-bas',tanim[2]);alan.style.setProperty('--ikon-son',tanim[3]);alan.style.background='';alan.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+tanim[4]+'</svg>';});
    }

function fdGorunenUygulamaAlaniniBul(){return fdSekmeAlanlari.find(id=>{const e=document.getElementById(id);return e&&getComputedStyle(e).display!=='none'})||''}

function fdTumUygulamaAlanlariniGizle(){fdSekmeAlanlari.forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});const h=document.getElementById('appHub');if(h)h.style.display='none'}

function fdAnaEkranaHafifDon(){if(typeof ihracatHucreToplamSeciminiTemizle==='function')ihracatHucreToplamSeciminiTemizle();icraEkraniniKapat();document.querySelectorAll('.modal-overlay').forEach(modal=>{if(modal.id!=='modalZorunluSifre')modal.style.display='none'});fdTumUygulamaAlanlariniGizle();['evrakTakipApp','tapuTakipApp','insaatFiyatApp'].forEach(id=>{const alan=document.getElementById(id);if(alan)alan.style.display='none'});document.body.classList.remove('personel-modulu-salt-okunur');fdAktifUygulamaSekmesi='home';const hub=document.getElementById('appHub');if(hub)hub.style.display='block';fdSekmeCubugunuGuncelle(false)}

function fdSekmeAgirIceriginiTemizle(anahtar){if(anahtar!=='personel')return;const app=document.getElementById('puantajApp');if(app)app.style.display='none';const bordroFrame=document.getElementById('bordroOnizlemeFrame');if(bordroFrame&&bordroFrame.src&&bordroFrame.src!=='about:blank')bordroFrame.src='about:blank'}

function fdSekmeCubugunuGuncelle(kaydir=true){const b=document.getElementById('fdAppTabBar'),l=document.getElementById('fdAppTabList'),t=document.getElementById('portalTopbar');if(!b||!l)return;b.style.display=activeUser&&t&&getComputedStyle(t).display!=='none'?'flex':'none';b.querySelector('[data-fd-tab="home"]')?.classList.toggle('active',fdAktifUygulamaSekmesi==='home');l.replaceChildren();fdAcikUygulamaSekmeleri.forEach(s=>{const d=fdUygulamaSekmeTanimlari[s.anahtar]||{ad:s.anahtar,ikon:'[]'},a=document.createElement('button');a.type='button';a.className='fd-app-tab'+(fdAktifUygulamaSekmesi===s.anahtar?' active':'');a.dataset.fdTab=s.anahtar;a.title=d.ad;a.onclick=()=>fdUygulamaSekmesineGec(s.anahtar);const i=document.createElement('span');i.className='fd-app-tab-icon';i.textContent=d.ikon;const y=document.createElement('span');y.className='fd-app-tab-label';y.textContent=d.ad;const k=document.createElement('span');k.className='fd-app-tab-close';k.title=d.ad+' sekmesini kapat';k.textContent='x';k.onclick=e=>fdUygulamaSekmesiniKapat(e,s.anahtar);a.append(i,y,k);l.appendChild(a)});if(kaydir)requestAnimationFrame(()=>b.querySelector('.fd-app-tab.active')?.scrollIntoView({behavior:'auto',block:'nearest',inline:'nearest'}))}

function fdSekmeyiKaydet(a,f){let s=fdAcikUygulamaSekmeleri.find(x=>x.anahtar===a);if(!s){s={anahtar:a,fonksiyonAdi:f||fdUygulamaSekmeTanimlari[a]?.acilis||'',alanId:''};fdAcikUygulamaSekmeleri.push(s)}if(f)s.fonksiyonAdi=f;fdAktifUygulamaSekmesi=a;fdSekmeCubugunuGuncelle();return s}

function fdSekmeGorunumunuYakala(a){const s=fdAcikUygulamaSekmeleri.find(x=>x.anahtar===a);if(!s||fdAktifUygulamaSekmesi!==a)return;const id=fdGorunenUygulamaAlaniniBul();if(id)s.alanId=id;fdSekmeCubugunuGuncelle()}

async function fdUygulamaSekmesineGec(a){if(a==='home'){fdAnaEkranaHafifDon();return}if(a==='bildirim'&&(!isManagerUser()||!anaMenuModulErisimiVar('bildirim'))){window.fdWhatsappCalismaAlaniniSifirla?.();return showToast('Bu sekmeye erişim yetkiniz yok.','warning')}if(a==='bildirim'){personelModuluYetkiGorunumunuUygula('bildirim');if(window.fdWhatsappCalismaOturumuDegisti?.())return window.openWhatsappMesajlari()}if(['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)&&(a!=='isg'||!anaMenuModulErisimiVar('isg')))return showToast('Bu sekmeye erişim yetkiniz yok.','warning');const s=fdAcikUygulamaSekmeleri.find(x=>x.anahtar===a);if(!s)return;fdAktifUygulamaSekmesi=a;fdSekmeCubugunuGuncelle();document.querySelectorAll('.modal-overlay').forEach(e=>{if(e.id!=='modalZorunluSifre')e.style.display='none'});fdTumUygulamaAlanlariniGizle();if(s.alanId&&document.getElementById(s.alanId)){document.getElementById(s.alanId).style.display='block';anaMenuDonusButonunuGoster();return}const f=fdSekmeOrijinaller[s.fonksiyonAdi||fdUygulamaSekmeTanimlari[a]?.acilis];if(!f)return;fdSekmeSistemGecisi=true;try{await f()}finally{fdSekmeSistemGecisi=false;fdSekmeGorunumunuYakala(a)}}

async function fdUygulamaSekmesiniKapat(e,a){e?.preventDefault?.();e?.stopPropagation?.();if(fdSekmeKapatiliyor)return;const i=fdAcikUygulamaSekmeleri.findIndex(x=>x.anahtar===a);if(i<0)return;fdSekmeKapatiliyor=true;try{const aktif=fdAktifUygulamaSekmesi===a;fdAcikUygulamaSekmeleri.splice(i,1);fdSekmeAgirIceriginiTemizle(a);if(!aktif){fdSekmeCubugunuGuncelle(false);return}const s=fdAcikUygulamaSekmeleri[Math.min(i,fdAcikUygulamaSekmeleri.length-1)];if(s){await fdUygulamaSekmesineGec(s.anahtar);return}fdAnaEkranaHafifDon()}finally{fdSekmeKapatiliyor=false;hideGlobalOverlay?.();document.documentElement.style.pointerEvents='';document.body.style.pointerEvents=''}}

function fdSekmeSisteminiKur(){Object.entries(fdSekmeFonksiyonlari).forEach(([f,a])=>{const o=window[f];if(typeof o!=='function'||o.__fdSekmeli)return;fdSekmeOrijinaller[f]=o;const w=function(...args){if(a==='bildirim'&&(!isManagerUser()||!anaMenuModulErisimiVar('bildirim')))return showToast('Bu sekmeye erişim yetkiniz yok.','warning');if(fdSekmeSistemGecisi)return o.apply(this,args);fdSekmeyiKaydet(a,f);let r;try{r=o.apply(this,args)}catch(e){fdSekmeGorunumunuYakala(a);throw e}if(r&&typeof r.then==='function')return r.finally(()=>fdSekmeGorunumunuYakala(a));setTimeout(()=>fdSekmeGorunumunuYakala(a),0);return r};w.__fdSekmeli=true;window[f]=w});const c=window.closeAppsToHub;if(typeof c==='function'&&!c.__fdSekmeli){fdSekmeOrijinaller.closeAppsToHub=c;const w=function(...a){if(fdSekmeSistemGecisi)return c.apply(this,a);fdAnaEkranaHafifDon()};w.__fdSekmeli=true;window.closeAppsToHub=w}const q=window.logout;if(typeof q==='function'&&!q.__fdSekmeli){const w=async function(...a){try{return await q.apply(this,a)}finally{fdAcikUygulamaSekmeleri=[];fdAktifUygulamaSekmesi='home';fdSekmeCubugunuGuncelle()}};w.__fdSekmeli=true;window.logout=w}const t=document.getElementById('portalTopbar');if(t&&!fdSekmeTopbarIzleyicileri.has(t)){new MutationObserver(fdSekmeCubugunuGuncelle).observe(t,{attributes:true,attributeFilter:['style','class']});fdSekmeTopbarIzleyicileri.add(t);}fdSekmeCubugunuGuncelle()}

function fdPortalHesapMenusunuKur(){
        const kullaniciAlani=document.querySelector('#portalTopbar .portal-user');
        const sifreButonu=document.getElementById('btnKendiSifre');
        const kullaniciAdi=document.getElementById('activeUserSpan');
        if(!kullaniciAlani||!sifreButonu||!kullaniciAdi||document.getElementById('portalAccountMenu'))return;
        const hesap=document.createElement('div');
        hesap.className='portal-account';
        const tetik=document.createElement('button');
        tetik.type='button';
        tetik.className='portal-account-trigger';
        tetik.title='Hesap menusu';
        const adSatiri=kullaniciAdi.parentElement;
        if(adSatiri){adSatiri.style.display='inline-flex';adSatiri.style.alignItems='center';adSatiri.style.gap='5px';tetik.appendChild(adSatiri);}
        const ok=document.createElement('span');ok.textContent='\u25be';ok.setAttribute('aria-hidden','true');tetik.appendChild(ok);
        const menu=document.createElement('div');
        menu.id='portalAccountMenu';
        const menuAdi=document.createElement('div');
        menuAdi.className='portal-account-menu-name';
        const menuAdiniGuncelle=()=>{menuAdi.textContent=kullaniciAdi.textContent||'Kullanici';};
        menuAdiniGuncelle();new MutationObserver(menuAdiniGuncelle).observe(kullaniciAdi,{childList:true,subtree:true,characterData:true});
        menu.appendChild(menuAdi);
        menu.className='portal-account-menu';
        kullaniciAlani.insertBefore(hesap,sifreButonu);
        menu.appendChild(sifreButonu);
        hesap.append(tetik,menu);
        tetik.addEventListener('click',event=>{event.stopPropagation();menu.classList.toggle('acik');});
        sifreButonu.addEventListener('click',()=>menu.classList.remove('acik'));
        document.addEventListener('click',()=>menu.classList.remove('acik'));
        document.addEventListener('keydown',event=>{if(event.key==='Escape')menu.classList.remove('acik');});
    }

window.FDNavigationRuntimeStep = (function(__fdNavigationSteps62){
 return function(__fdNavigationStep62){ return __fdNavigationSteps62[__fdNavigationStep62].call(window); };
})([
function(){
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',anaMenuModernIkonlariniKur);else anaMenuModernIkonlariniKur();
},
function(){
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdSekmeSisteminiKur);else fdSekmeSisteminiKur();
},
function(){
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdPortalHesapMenusunuKur);else fdPortalHesapMenusunuKur();
}
]);

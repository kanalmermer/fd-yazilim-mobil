window.FDModules.define('saatkarsilastirma',function(){
let disposed=false,owned=null,bound=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)&&context()===initial}
function valid(request){if(!current()||!request||fdManuelKarsilastirmaIstek!==request||request.oturum!==context())return false;const p=personeller.find(p=>String(p.id)===request.personelId&&aktifSirketeAit(p));return Boolean(p&&(!isPersonelUser()||String(p.id)===String(activeUser?.tcNo||''))&&document.getElementById('magicpassApp')?.style.display!=='none'&&String(document.getElementById('magicpassPersonel')?.value||'')===request.selected&&String(document.getElementById('magicpassAy')?.value||'')===request.ay)}
function clearOwned(){owned?.remove();owned=null;if(fdManuelKarsilastirmaIstek===bound)fdManuelKarsilastirmaIstek=null;bound=null}
function magicpassManuelKarsilastirmaKapat() {
        if(!current())return;
        document.getElementById('magicpassManuelKarsilastirma')?.remove();
    }
function magicpassManuelKarsilastirmaAc(personelId, tarihKey) {
        const personel = personeller.find(p => String(p.id) === String(personelId));
        if (!personel) return;
        const vardiya = magicpassGunVardiyasi(personel, tarihKey);
        const saatler = magicpassVardiyaSaatleri(vardiya, tarihKey);
        const hareketler = magicpassGunHareketleri(personel, tarihKey, vardiya);
        const duzeltme = magicpassKayitlari('magicpassDuzeltme')
            .filter(k => String(k.pId) === String(personel.id) && String(k.tarih) === String(tarihKey))
            .sort((a,b) => Number(b.zaman || 0) - Number(a.zaman || 0))[0];
        if (!duzeltme) return;

        const cihazAraliklari = magicpassCalismaAraliklari(hareketler,saatler);
        const duzeltilenAraliklar = magicpassDuzeltmeCalismaAraliklari(duzeltme,tarihKey,saatler);
        const aralikHtml = araliklar => araliklar.length ? araliklar.map((a,i)=>
            '<div style="padding:8px 0;border-top:1px solid #e2e8f0"><small style="display:block;margin-bottom:6px;color:#64748b">'+(i+1)+'. çalışma aralığı</small><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px"><div><small style="display:block;color:#64748b">Giriş</small><b>'+escapeDashboardText(a.giris?fdMagicpassSaatTarihMetni(a.giris):'GİRİŞ YOK')+'</b></div><div><small style="display:block;color:#64748b">Çıkış</small><b>'+escapeDashboardText(a.cikis?fdMagicpassSaatTarihMetni(a.cikis):'ÇIKIŞ YOK')+'</b></div></div></div>').join('') : '<small>Cihaz hareketi bulunmuyor.</small>';

        magicpassManuelKarsilastirmaKapat();
        const katman = document.createElement('div');
        katman.id = 'magicpassManuelKarsilastirma';
        katman.style.cssText = 'position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.58);backdrop-filter:blur(3px)';
        katman.innerHTML =
            '<div role="dialog" aria-modal="true" aria-label="Manuel saat karşılaştırması" style="width:min(600px,96vw);max-height:92vh;overflow:auto;border:1px solid #cbd5e1;border-radius:16px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.35)">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:15px 18px;background:#312e81;color:#fff">' +
                    '<div><strong style="display:block;font-size:1rem">✎ Manuel Saat Düzeltmesi</strong><small style="opacity:.82">' + escapeDashboardText(personel.ad || 'Personel') + ' · ' + escapeDashboardText(tarihFormati(tarihKey)) + '</small></div>' +
                    '<button type="button" onclick="magicpassManuelKarsilastirmaKapat()" style="border:0;background:rgba(255,255,255,.16);color:#fff;width:32px;height:32px;border-radius:9px;font-size:1.2rem;cursor:pointer">×</button>' +
                '</div>' +
                '<div style="padding:16px 18px">' +
                    '<div style="margin-bottom:11px;padding:13px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc">' +
                        '<strong style="display:block;margin-bottom:8px;color:#334155">Cihazdaki gerçek kayıt</strong>' +
                        aralikHtml(cihazAraliklari) +
                    '</div>' +
                    '<div style="padding:13px;border:1px solid #c4b5fd;border-radius:12px;background:#f5f3ff">' +
                        '<strong style="display:block;margin-bottom:8px;color:#6d28d9">Sizin düzelttiğiniz kayıt</strong>' +
                        aralikHtml(duzeltilenAraliklar) +
                    '</div>' +
                    (duzeltme.aciklama ? '<p style="margin:11px 0 0;color:#475569;font-size:.8rem"><b>Açıklama:</b> ' + escapeDashboardText(duzeltme.aciklama) + '</p>' : '') +
                '</div>' +
            '</div>';
        katman.addEventListener('click', event => { if (event.target === katman) magicpassManuelKarsilastirmaKapat(); });
        document.body.appendChild(katman);
    }
return{init(){observer=new MutationObserver(()=>{if(owned&&!valid(bound))clearOwned()});const app=document.getElementById('magicpassApp');if(app)observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['style']})},open(request=fdManuelKarsilastirmaIstek){if(!valid(request))return false;bound=request;magicpassManuelKarsilastirmaAc(request.personelId,request.tarihKey);owned=document.getElementById('magicpassManuelKarsilastirma');return Boolean(owned)},api:{magicpassManuelKarsilastirmaKapat(){clearOwned()}},dispose(){disposed=true;observer?.disconnect();clearOwned()}};
});

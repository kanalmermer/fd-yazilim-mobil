window.FDModules.define('gunlukhatirlatma',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',...['personel','irsaliye','police'].map(id=>anaMenuModulYetkisi(id))])}
function valid(request=bound){return !disposed&&context()===initial&&request?.current()}
function fdDailyAssert(){if(!valid()){const error=Error('Günlük hatırlatma oturumu değişti.');error.fdDailyCancelled=true;throw error}}
async function fdDailyAwait(promise){fdDailyAssert();const request=bound;const value=await Promise.race([promise,request.whenCancelled.then(()=>{const error=Error('Günlük hatırlatma kapatıldı.');error.fdDailyCancelled=true;throw error})]);fdDailyAssert();return value}
function clear(){bound?.cancel();bound=null;if(owned&&document.getElementById('modalGunlukHatirlatmalar')===owned){gunlukHatirlatmalariKapat();owned.querySelector('#gunlukHatirlatmaIcerik')?.replaceChildren();const date=owned.querySelector('#gunlukHatirlatmaTarih');if(date)date.textContent=''}observer?.takeRecords()}
let gunlukHatirlatmaYukleniyor = false;
function gunlukHatirlatmalariKapat() {
        const modal = document.getElementById('modalGunlukHatirlatmalar');
        if (modal) modal.style.display = 'none';
    }
function gunlukHatirlatmaGrubu(baslik, ikon, kayitlar, renk = '#0f766e') {
        if (!kayitlar.length) return '';
        return `<section style="border:1px solid #dbe5f0;border-radius:12px;overflow:hidden;margin-bottom:12px;">
            <div style="padding:10px 13px;background:#f8fafc;border-bottom:1px solid #dbe5f0;font-weight:850;color:${renk};">${ikon} ${escapeDashboardText(baslik)} <span style="float:right;color:#64748b;">${kayitlar.length}</span></div>
            <div>${kayitlar.map(metin=>`<div style="padding:9px 13px;border-bottom:1px solid #eef2f7;line-height:1.45;color:#1e293b;">${escapeDashboardText(metin)}</div>`).join('')}</div>
        </section>`;
    }
async function gunlukHatirlatmalariGoster() {
        if (gunlukHatirlatmaYukleniyor || !isManagerUser() || !activeUser?.sirketId) return;
        const bugun = bugununYerelTarihi();
        const anahtar = `fdYazilimGunlukHatirlatma:${activeUser.sirketId}:${activeUser.username || activeUser.id || 'yonetici'}:${bugun}`;
        if (localStorage.getItem(anahtar) === '1') return;
        gunlukHatirlatmaYukleniyor = true;
        try {
            const yuklemeler = [supabaseVerileriniYukle('irsaliye'), supabaseVerileriniYukle('police')];
            await fdDailyAwait(Promise.all(yuklemeler));

            const aktifPersoneller = personeller.filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi).slice(0,10)>=bugun));
            const ayGun = bugun.slice(5);
            const dogumGunleri = aktifPersoneller.filter(p=>String(p.dogumTarihi||'').slice(5,10)===ayGun).map(p=>`${p.ad} — bugün doğum günü`);
            const izinHakEdisleri = aktifPersoneller.filter(p=>{
                const giris=String(p.girisTarihi||'').slice(0,10);
                return giris&&giris.slice(5)===ayGun&&Number(giris.slice(0,4))<Number(bugun.slice(0,4));
            }).map(p=>`${p.ad} — yıllık izin hak ediş tarihi`);
            const personelSureleri = [];
            aktifPersoneller.forEach(p=>{
                [['Sertifika süresi',p.sertifikaBitis],['Askerlik tecil süresi',p.tecilBitis]].forEach(([tur,tarih])=>{
                    const t=String(tarih||'').slice(0,10); if(t&&t<=bugun) personelSureleri.push(`${p.ad} — ${tur} ${t===bugun?'bugün doluyor':`${tarihFormati(t)} tarihinde doldu`}`);
                });
                const tarama=String(p.sonSaglikTaramasi||'').slice(0,10);
                if(tarama){
                    const sonraki=new Date(`${tarama}T12:00:00`);sonraki.setFullYear(sonraki.getFullYear()+1);
                    const t=sonraki.toISOString().slice(0,10);
                    if(t<=bugun) personelSureleri.push(`${p.ad} — yıllık sağlık kontrolü ${t===bugun?'bugün':`${tarihFormati(t)} tarihinde geçti`}`);
                }
            });
            const gecikenIrsaliyeler = tasimaIrsaliyeleri.filter(k=>aktifSirketeAit(k)&&irsaliyeGeciktiMi(k)).sort((a,b)=>String(a.tarih).localeCompare(String(b.tarih))).map(k=>`${k.firma} — ${k.irsaliyeNo} · ${k.plaka} · son gün ${tarihFormati(irsaliyeSonFaturaTarihi(k))}`);
            const aracSureleri = [];
            araclar.filter(a=>aktifSirketeAit(a)&&String(a.durum||'').toLocaleLowerCase('tr-TR')!=='satıldı').forEach(a=>{
                const takipTarihleri = [];
                if (aracVizeTakipliMi(a)) takipTarihleri.push(['Vize',a.muayeneBitis],['Egzoz muayenesi',a.egzozMuayeneBitis]);
                takipTarihleri.forEach(([tur,tarih])=>{
                    const t=String(tarih||'').slice(0,10); if(t&&t<=bugun) aracSureleri.push(`${a.plaka} — ${tur} ${t===bugun?'bugün doluyor':`${tarihFormati(t)} tarihinde doldu`}`);
                });
                const sonBakim=[...(a.bakimlar||[])].filter(b=>b.sonrakiTarih).sort((x,y)=>String(y.tarih||'').localeCompare(String(x.tarih||'')))[0];
                const bt=String(sonBakim?.sonrakiTarih||'').slice(0,10);
                if(bt&&bt<=bugun) aracSureleri.push(`${a.plaka} — bakım tarihi ${bt===bugun?'bugün':`${tarihFormati(bt)} tarihinde geçti`}`);
            });
            const policeSureleri = policeGuncelKayitlar().filter(p=>{const d=policeDurumu(p);return d.tur==='gecen'||d.tur==='yaklasan';}).map(p=>`${p.hedefAdi||'-'} — ${p.tur||'Poliçe'} · ${policeDurumu(p).metin} · ${tarihFormati(p.bitis)}`);
            const yillikBelgeHatirlatmasi = await fdDailyAwait(yillikPersonelBelgeHatirlatmaHtml(bugun));
            const html = [
                yillikBelgeHatirlatmasi,
                gunlukHatirlatmaGrubu('Bugünkü Doğum Günleri','🎂',dogumGunleri),
                gunlukHatirlatmaGrubu('Bugünkü Yıllık İzin Hak Edişleri','🎯',izinHakEdisleri),
                gunlukHatirlatmaGrubu('Geciken Taşıma İrsaliyeleri','🧾',gecikenIrsaliyeler,'#b45309'),
                gunlukHatirlatmaGrubu('Süresi Dolan Personel İşlemleri','⚠️',personelSureleri,'#b91c1c'),
                gunlukHatirlatmaGrubu('Süresi Dolan Araç İşlemleri','🚘',aracSureleri,'#b91c1c'),
                gunlukHatirlatmaGrubu('Yaklaşan ve Süresi Dolan Poliçeler','🛡️',policeSureleri,'#b91c1c')
            ].join('');
            if (!html) return;
            fdDailyAssert();
            document.getElementById('gunlukHatirlatmaTarih').textContent = `${tarihFormati(bugun)} tarihli işlemler`;
            document.getElementById('gunlukHatirlatmaIcerik').innerHTML = html;
            localStorage.setItem(anahtar, '1');
            document.getElementById('modalGunlukHatirlatmalar').style.display = 'flex';
        } catch (error) {
            if(error?.fdDailyCancelled)return;
            console.warn('Günlük hatırlatmalar hazırlanamadı:', error);
        } finally {
            gunlukHatirlatmaYukleniyor = false;
        }
    }
return{init(){owned=document.getElementById('modalGunlukHatirlatmalar');observer=new MutationObserver(()=>{if(bound&&owned?.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},async open(request=fdGunlukHatirlatmaIstek){if(!valid(request)){request?.cancel();return}if(bound&&bound!==request)clear();bound=request;request.clearError();const result=await gunlukHatirlatmalariGoster();if(!valid(request)||owned?.style.display!=='flex')clear();return result},api:{gunlukHatirlatmalariKapat:clear},dispose(){clear();disposed=true;observer?.disconnect();owned=null}};
});

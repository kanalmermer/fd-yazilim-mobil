// Kullanıcı paneli. Giriş/oturum ve personel hesap bağlantıları ortak çekirdeği kullanır.
let kullaniciPaneliMesgul = false;
let kullaniciPanelSonOturum = '';
const KULLANICI_HESAP_ROLLERI = [['Personel','Personel'],['Yonetici','Kullanıcı'],['Admin','Admin'],['IsgUzmani','İSG Uzmanı'],['IsyeriHekimi','İşyeri Hekimi']];

function kullaniciPanelOturumu() {
    return [activeUser?.supabaseUserId,aktifSirketId(),activeUser?.rol,aktifKullaniciYetkiAnahtari(),anaMenuModulYetkisi('kullanici')].join('|');
}
function kullaniciPanelHesaplari() {
    const sirket = String(aktifSirketId() || '');
    return (Array.isArray(kullanicilar) ? kullanicilar : []).filter(k => sirket && String(k.sirketId || '') === sirket && kullaniciYetkiAnahtari(k.username) !== 'admin');
}
function kullaniciKendiHesabiMi(kullanici) {
    return Boolean(kullanici && ((kullanici.supabaseUserId && kullanici.supabaseUserId === activeUser?.supabaseUserId) || kullaniciYetkiAnahtari(kullanici.username) === aktifKullaniciYetkiAnahtari()));
}
function kullaniciIslemYetkisi(islem, kullanici = null, rol = 'Personel') {
    if (!['Admin','Yonetici'].includes(activeUser?.rol) || !anaMenuModulYazmaYetkisiVar('kullanici')) return false;
    const admin = activeUser.rol === 'Admin';
    if (islem === 'create') return admin ? KULLANICI_HESAP_ROLLERI.some(([key]) => key === rol) : rol === 'Personel';
    if (!kullanici || !kullaniciPanelHesaplari().includes(kullanici) || kullaniciKendiHesabiMi(kullanici)) return false;
    if (['IsgUzmani','IsyeriHekimi'].includes(kullanici.rol)) return false;
    if (islem === 'update-role') return admin;
    if (islem === 'reset-password') return admin && kullanici.rol === 'Personel';
    return islem === 'delete' && (admin || kullanici.rol === 'Personel');
}
async function kullaniciIslemHatasiniOku(error) {
    try { if (error?.context?.json) { const body = await error.context.json(); if (body?.message) return String(body.message); } } catch (_) {}
    return error?.message || 'Kullanıcı işlemi tamamlanamadı.';
}
async function kullaniciPanelIsleminiYurut(islem, onay = '') {
    if (kullaniciPaneliMesgul) return;
    const oturum = kullaniciPanelOturumu(), gecerli = () => oturum === kullaniciPanelOturumu();
    kullaniciPaneliMesgul = true;
    try {
        if (onay && !await fdYuzerOnaySor(onay)) return;
        if (!gecerli()) return;
        showGlobalOverlay('Kullanıcı işlemi', 'Hesap bilgileri güncelleniyor...');
        await islem(gecerli);
    } catch (error) { const message = await kullaniciIslemHatasiniOku(error); if (gecerli()) showToast(message, 'error'); }
    finally { kullaniciPaneliMesgul = false; if (gecerli()) hideGlobalOverlay(); }
}
async function kullaniciSunucuIstegi(action, values) {
    const {data,error} = await supabaseClient.functions.invoke('manage-user', {body:{...values,action,companyId:aktifSirketId()}});
    if (error) throw error;
    if (!data?.success) throw new Error(data?.message || 'Kullanıcı işlemi tamamlanamadı.');
    return data;
}
async function kullaniciListesiniYenile() {
    if (!isManagerUser() || !anaMenuModulErisimiVar('kullanici')) return;
    const oturum = kullaniciPanelOturumu();
    try { if (SUPABASE_MODE) await supabaseKullanicilariYukle(); if (oturum === kullaniciPanelOturumu()) renderAdminUsers(); }
    catch (error) { const message = await kullaniciIslemHatasiniOku(error); if (oturum === kullaniciPanelOturumu()) showToast(message, 'error'); }
}
async function openAdminModal() {
    if (!isManagerUser() || !anaMenuModulErisimiVar('kullanici')) return showToast('Bu bölüm rolünüz için görünür değil.', 'warning');
    document.getElementById('modalAdmin').style.display = 'flex';
    renderAdminUsers();
    await kullaniciListesiniYenile();
}
function closeAdminModal() { document.getElementById('modalAdmin').style.display = 'none'; }
function kullaniciModulYetkileriniAc() {
    if (activeUser?.rol !== 'Admin' || !anaMenuModulErisimiVar('ayarlar')) return showToast('Modül yetkilerini yalnızca Admin yönetebilir.', 'warning');
    closeAdminModal(); openAyarlarApp();
    const panel = document.getElementById('ayarlarPanelModuller');
    if (panel) ayarlarBolumAc('ayarlarPanelModuller', document.querySelector('[onclick*="ayarlarPanelModuller"]'));
}
function kullaniciPanelGorunumunuUygula() {
    const yazma = isManagerUser() && anaMenuModulYazmaYetkisiVar('kullanici'), admin = activeUser?.rol === 'Admin';
    const form = document.getElementById('adminAddUserForm'), role = document.getElementById('aRol');
    const oturum = kullaniciPanelOturumu();
    if (form && oturum !== kullaniciPanelSonOturum) { form.reset(); kullaniciPanelSonOturum = oturum; }
    if (form) { form.hidden = !yazma; form.closest('.card').hidden = !yazma; for (const field of form.elements) field.disabled = !yazma; }
    if (role) {
        const onceki = role.value;
        role.replaceChildren();
        for (const [key,label] of KULLANICI_HESAP_ROLLERI) if (admin || key === 'Personel') {
            const option = document.createElement('option'); option.value = key; option.textContent = label; role.append(option);
        }
        role.value = Array.from(role.options).some(o => o.value === onceki) ? onceki : 'Personel';
    }
    const bilgi = document.getElementById('kullaniciPanelYetkiBilgisi');
    if (bilgi) bilgi.textContent = !yazma ? 'Yalnızca okuma: Hesapları görüntüleyebilirsiniz; ekleme, rol, şifre ve silme işlemleri kapalıdır.' : admin ? 'Admin: Hesap türlerini ve personel şifrelerini yönetebilirsiniz. Kendi hesabınız korunur.' : 'Kullanıcı: Personel hesabı oluşturabilir ve silebilirsiniz. Rol ve şifre değişikliklerini Admin yapar.';
    const yetkiler = document.getElementById('kullaniciModulYetkileriBtn');
    if (yetkiler) yetkiler.hidden = !admin || !anaMenuModulErisimiVar('ayarlar');
}
function kullaniciSifreGosterGizle(inputId) {
    const input = document.getElementById(inputId); if (input) input.type = input.type === 'password' ? 'text' : 'password';
}
async function adminKullaniciFormunuKaydet(event) {
    event.preventDefault();
    const username = kullaniciYetkiAnahtari(document.getElementById('aUser').value), password = document.getElementById('aPass').value, rol = document.getElementById('aRol').value, tcNo = document.getElementById('aTcNo').value.trim();
    if (!kullaniciIslemYetkisi('create', null, rol)) return showToast('Bu hesap türünü oluşturma yetkiniz yok.', 'warning');
    if (!username || password.length < 6) return showToast('Geçerli kullanıcı adı ve en az 6 karakter şifre gerekli.', 'warning');
    if (kullaniciPanelHesaplari().some(k => kullaniciYetkiAnahtari(k.username) === username)) return showToast('Bu kullanıcı adı zaten kullanılıyor.', 'warning');
    await kullaniciPanelIsleminiYurut(async gecerli => {
        const personel = personeller.find(p => String(p.id) === tcNo && aktifSirketeAit(p));
        if (SUPABASE_MODE) { await supabaseKullaniciOlustur({username,password,rol,tcNo,ad:personel?.ad || username}); if (!gecerli()) return; await supabaseKullanicilariYukle(); }
        else { kullanicilar.push({username,password,rol,tcNo,sirketId:aktifSirketId()}); await verileriKaydet(); }
        if (!gecerli()) return;
        document.getElementById('adminAddUserForm').reset(); renderAdminUsers(); showToast('Kullanıcı hesabı oluşturuldu.');
    });
}
function kullaniciModulunuBaslat() {
    const form = document.getElementById('adminAddUserForm');
    if (form && form.dataset.kullaniciModuluBagli !== '1') { form.dataset.kullaniciModuluBagli = '1'; form.addEventListener('submit', adminKullaniciFormunuKaydet); }
}
function renderAdminUsers() {
    const body = document.querySelector('#adminUserTable tbody'); if (!body) return;
    body.replaceChildren(); kullaniciPanelGorunumunuUygula();
    if (!isManagerUser() || !anaMenuModulErisimiVar('kullanici')) return;
    const users = kullaniciPanelHesaplari();
    if (!users.length) { const tr = body.insertRow(); const td = tr.insertCell(); td.colSpan = 6; td.textContent = 'Bu şirkette listelenecek kullanıcı bulunmuyor.'; return; }
    users.forEach((user,index) => {
        const tr = body.insertRow(); tr.dataset.kullanici = String(user.username);
        tr.insertCell().textContent = String(index+1);
        const name = tr.insertCell(), strong = document.createElement('strong'), detail = document.createElement('small'); strong.textContent = String(user.username || ''); detail.textContent = String(user.ad || ''); name.append(strong,document.createElement('br'),detail);
        const roleCell = tr.insertCell(), select = document.createElement('select'); select.id = 'rol_'+index; select.setAttribute('aria-label', String(user.username)+' hesap türü');
        for (const [key,label] of KULLANICI_HESAP_ROLLERI.filter(([key])=>['Admin','Yonetici','Personel'].includes(key)||key===user.rol)) { const option = document.createElement('option'); option.value = key; option.textContent = label; select.append(option); }
        select.value = user.rol; select.disabled = !kullaniciIslemYetkisi('update-role',user); roleCell.append(select);
        tr.insertCell().textContent = String(user.tcNo || '-');
        const passwordCell = tr.insertCell(), actionsCell = tr.insertCell(), actions = document.createElement('div'); actions.className = 'action-btns'; actionsCell.append(actions);
        const button = (label, action, className='btn-edit-modern') => { const el = document.createElement('button'); el.type = 'button'; el.className = 'btn-modern '+className; el.textContent = label; el.addEventListener('click',action); return el; };
        if (kullaniciIslemYetkisi('reset-password',user)) {
            const area = document.createElement('div'); area.className = 'kullanici-sifre-alani';
            const input = document.createElement('input'); input.id = 'kullaniciSifre_'+index; input.type = 'password'; input.minLength = 6; input.autocomplete = 'new-password'; input.placeholder = 'Yeni geçici şifre'; input.setAttribute('aria-label',String(user.username)+' yeni geçici şifre');
            const eye = button('👁️',()=>kullaniciSifreGosterGizle(input.id),''); eye.title = 'Yazılan şifreyi göster/gizle';
            area.append(input,eye,button('Değiştir',()=>kullaniciSifresiniYenile(user.username,input.id))); passwordCell.append(area);
            const note = document.createElement('small'); note.textContent = user.sifreDegismeli ? 'İlk girişte yeni şifre belirlemesi gerekiyor.' : 'Mevcut şifre görüntülenmez.'; passwordCell.append(note);
        } else passwordCell.textContent = '—';
        if (kullaniciIslemYetkisi('update-role',user)) actions.append(button('💾 Türü Kaydet',()=>kullaniciRolunuKaydet(user.username,select.id)));
        if (kullaniciIslemYetkisi('delete',user)) actions.append(button('🗑️ Sil',()=>deleteUser(user.username),'btn-del-modern'));
        if (!actions.children.length) actions.textContent = kullaniciKendiHesabiMi(user) ? 'Kendi hesabınız' : 'Görüntüleme';
    });
}
async function kullaniciRolunuKaydet(username, selectId) {
    const user = kullaniciPanelHesaplari().find(k => k.username === username), role = document.getElementById(selectId)?.value;
    if (!kullaniciIslemYetkisi('update-role',user) || !['Admin','Yonetici','Personel'].includes(role)) return showToast('Rol değiştirme yetkiniz yok.', 'warning');
    await kullaniciPanelIsleminiYurut(async gecerli => {
        if (SUPABASE_MODE) { await kullaniciSunucuIstegi('update-role',{username,role}); if (!gecerli()) return; await supabaseKullanicilariYukle(); }
        else { user.rol = role; await verileriKaydet(); }
        if (gecerli()) { renderAdminUsers(); showToast('Hesap türü güncellendi.'); }
    }, username+' kullanıcısının hesap türü değiştirilsin mi?');
}
async function kullaniciSifresiniYenile(username, inputId) {
    const user = kullaniciPanelHesaplari().find(k => k.username === username), input = document.getElementById(inputId), password = String(input?.value || '');
    if (!kullaniciIslemYetkisi('reset-password',user)) return showToast('Personel şifresini yalnızca yetkili Admin değiştirebilir.', 'warning');
    if (password.length < 6) return showToast('Yeni geçici şifre en az 6 karakter olmalıdır.', 'warning');
    await kullaniciPanelIsleminiYurut(async gecerli => {
        if (SUPABASE_MODE) await kullaniciSunucuIstegi('reset-password',{username,password});
        else { user.password = password; await verileriKaydet(); }
        if (!gecerli()) return;
        user.sifreDegismeli = true; user.sifreKaynagi = 'admin-reset'; input.value = ''; input.type = 'password'; renderAdminUsers();
        showToast('Geçici şifre güncellendi. Personel ilk girişinde yeni şifre belirleyecek.');
    }, username+' kullanıcısının geçici şifresi değiştirilsin mi?');
}
async function deleteUser(username) {
    const user = kullaniciPanelHesaplari().find(k => k.username === username);
    if (!kullaniciIslemYetkisi('delete',user)) return showToast('Bu hesabı silme yetkiniz yok.', 'warning');
    await kullaniciPanelIsleminiYurut(async gecerli => {
        if (SUPABASE_MODE) { await kullaniciSunucuIstegi('delete',{username}); if (!gecerli()) return; await supabaseKullanicilariYukle(); }
        else { kullanicilar = kullanicilar.filter(k => k !== user); await verileriKaydet(); }
        if (gecerli()) { renderAdminUsers(); showToast('Kullanıcı hesabı silindi.'); }
    }, username+' silinsin mi?');
}

// Personel otomatik hesap işlemleri de bu ortak sunucu girişini kullanır.
async function supabaseKullaniciOlustur({ username, password, rol = 'Personel', tcNo = '', ad = '' }) {
        const { data, error } = await supabaseClient.functions.invoke('manage-user', {
            body: {
                action: 'create', username, password, role: rol,
                companyId: aktifSirketId(), employeeLegacyId: tcNo, fullName: ad
            }
        });
        if (error) {
            let mesaj = error.message || 'Kullanıcı hesabı oluşturulamadı.';
            try { const ayrinti = await error.context?.json(); mesaj = ayrinti?.message || ayrinti?.error || mesaj; } catch (_) {}
            throw new Error(mesaj);
        }
        if (!data?.success) throw new Error(data?.message || 'Kullanıcı hesabı oluşturulamadı.');
        return data;
    }


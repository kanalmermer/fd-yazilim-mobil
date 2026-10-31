(function (root) {
  'use strict';
  const catalog = root.FD_MODULE_CATALOG;
  if (!catalog || !catalog.release) throw new Error('Modül sürüm bilgisi bulunamadı.');
  const factories = new Map(), instances = new Map(), pending = new Map(), resources = new Map();
  let contextReader = () => null, contextEpoch = 0, currentKey = '', navigation = 0;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function context() {
    const value = contextReader();
    return value && value.user && value.company ? value : null;
  }
  function key(value) { return value ? JSON.stringify([value.user, value.company, value.role, value.permissions]) : ''; }
  function synchronize() {
    const value = context(), next = key(value);
    if (next !== currentKey) {
      currentKey = next; contextEpoch++; navigation++;
      for (const [id, record] of instances) {
        try { record.instance.dispose?.(); } catch (_) {}
        unmount(id); instances.delete(id);
      }
    }
    return { value, key: next, epoch: contextEpoch };
  }
  function permitted(id, snapshot = synchronize()) {
    if (!snapshot.value || !snapshot.value.canRead(id)) throw new Error('Bu modüle erişim yetkiniz yok.');
    return snapshot;
  }
  function valid(snapshot, id) {
    const now = synchronize();
    if (snapshot.key !== now.key || snapshot.epoch !== now.epoch) throw new Error('Oturum değişti; modülü yeniden açın.');
    return permitted(id, now);
  }
  function moduleEntry(id) {
    if (!own(catalog.modules, id)) throw new Error('Tanımsız modül.');
    return catalog.modules[id];
  }
  function assetURL(file) {
    const base = new URL(root.FD_ASSET_BASE || './', document.baseURI);
    const url = new URL(file.path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Geçersiz modül adresi.');
    url.searchParams.set('v', file.sha256);
    return url.href;
  }
  async function digest(text) {
    if (!root.crypto?.subtle) throw new Error('Güvenli bağlantı gerekli; modül yüklenemedi.');
    const hash = await root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
  }
  async function verify(text, file) {
    if (typeof text !== 'string' || await digest(text) !== file.sha256) throw new Error('Modül dosyası sürüm/bütünlük kontrolünden geçemedi. Sayfayı yenileyin.');
    return text;
  }
  async function fetchText(file) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(assetURL(file), { credentials: 'same-origin', cache: 'no-cache', signal: controller.signal });
      if (!response.ok) throw new Error('Modül dosyası alınamadı (' + response.status + ').');
      const type = response.headers.get('Content-Type') || '';
      if (!file.types.some(value => type.toLowerCase().includes(value))) throw new Error('Modül dosya türü hatalı; sunucu ayarını kontrol edin.');
      return verify(await response.text(), file);
    } finally { clearTimeout(timer); }
  }
  async function payload(id) {
    const entry = moduleEntry(id);
    if (resources.has(id)) return resources.get(id);
    let files;
    if (root.google?.script?.run) {
      const reply = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Modül servisi yanıt vermedi. Yeniden deneyin.')), 30000);
        root.google.script.run.withSuccessHandler(value => { clearTimeout(timer); resolve(value); })
          .withFailureHandler(error => { clearTimeout(timer); reject(new Error(error?.message || 'Modül servisine ulaşılamadı.')); })
          .fdReadModuleResources(id, catalog.release);
      });
      if (reply?.release !== catalog.release || reply?.id !== id) throw new Error('Modül ve uygulama sürümü uyuşmuyor. Sayfayı yenileyin.');
      files = {};
      for (const name of ['view', 'style', 'script']) files[name] = await verify(reply.files?.[name], entry.files[name]);
    } else {
      const names = ['view', 'style', 'script'];
      const values = await Promise.all(names.map(name => fetchText(entry.files[name])));
      files = Object.fromEntries(names.map((name, index) => [name, values[index]]));
    }
    resources.set(id, files);
    return files;
  }
  function compile(id, source) {
    if (factories.has(id)) return;
    const script = document.createElement('script');
    script.dataset.fdModuleDefinition = id;
    script.textContent = source + '\n//# sourceURL=fd-modules/' + id + '/module.js';
    document.head.appendChild(script);
    script.remove();
    if (!factories.has(id)) throw new Error('Modül kodu başlatılamadı.');
  }
  function mount(id, html, css) {
    const entry = moduleEntry(id), template = document.createElement('template');
    template.innerHTML = html;
    if (template.content.querySelector('script,iframe,object,embed')) throw new Error('Modül ekranında beklenmeyen içerik var.');
    for (const rootId of entry.roots) {
      const element = template.content.querySelector('#' + rootId);
      const placeholder = document.getElementById(rootId);
      if (!element || !placeholder?.hasAttribute('data-fd-module-placeholder')) throw new Error('Modül ekranı bağlanamadı: ' + rootId);
    }
    for (const rootId of entry.roots) {
      const element = template.content.querySelector('#' + rootId);
      element.dataset.fdModuleRoot = id;
      document.getElementById(rootId).replaceWith(element);
    }
    let style = document.querySelector('style[data-fd-module-style="' + id + '"]');
    if (!style) { style = document.createElement('style'); style.dataset.fdModuleStyle = id; style.textContent = css; document.head.appendChild(style); }
    document.dispatchEvent(new CustomEvent('fd:module-mounted', { detail: { id } }));
  }
  function unmount(id) {
    for (const rootId of moduleEntry(id).roots) {
      const element = document.getElementById(rootId);
      if (!element || element.hasAttribute('data-fd-module-placeholder')) continue;
      const placeholder = document.createElement('div');
      placeholder.id = rootId; placeholder.style.display = 'none'; placeholder.dataset.fdModulePlaceholder = id;
      element.replaceWith(placeholder);
    }
  }
  function expose(id, record) {
    for (const [name] of Object.entries(record.instance.api || {})) {
      if ((moduleEntry(id).entrypoints || (id === 'ihracat' ? ['openIhracatApp','ihracatFirmalariniCiz'] : [])).includes(name)) continue;
      const existing = root[name];
      if (existing && !existing.__fdLazyModule) throw new Error('Modül işleviyle ad çakışması: ' + name);
      const bridge = function (...args) { return invoke(id, name, args, this); };
      bridge.__fdLazyModule = id; root[name] = bridge;
    }
    for (const [name] of Object.entries(record.instance.state || {})) {
      const descriptor = Object.getOwnPropertyDescriptor(root, name);
      if (descriptor && !descriptor.configurable) throw new Error('Modül durumuyla ad çakışması: ' + name);
      Object.defineProperty(root, name, { configurable: true, get() { const active = instances.get(id); if (!active) return undefined; valid(active.snapshot, id); return active.instance.state[name].get(); }, set(value) { const active = instances.get(id); if (!active) return; valid(active.snapshot, id); active.instance.state[name].set?.(value); } });
    }
  }
  async function ensure(id, snapshot) {
    const existing = instances.get(id);
    if (existing) { valid(existing.snapshot, id); return existing; }
    const lock = id + ':' + snapshot.epoch;
    if (pending.has(lock)) return pending.get(lock);
    const promise = (async () => {
      const files = await payload(id); valid(snapshot, id);
      compile(id, files.script); valid(snapshot, id);
      const instance = factories.get(id)();
      const record = { instance, snapshot };
      try { mount(id, files.view, files.style); instances.set(id, record); expose(id, record); instance.init?.(); }
      catch (error) { unmount(id); instances.delete(id); throw error; }
      return record;
    })();
    pending.set(lock, promise);
    try { return await promise; } finally { pending.delete(lock); }
  }
  function invoke(id, name, args, receiver) {
    const record = instances.get(id);
    if (!record) return undefined;
    valid(record.snapshot, id);
    if (!own(record.instance.api, name)) throw new Error('Tanımsız modül işlemi.');
    if (moduleEntry(id).writeOperations.includes(name) && !record.snapshot.value.canWrite(id)) throw new Error('Bu modülde değişiklik yapma yetkiniz yok.');
    return record.instance.api[name].apply(receiver, args);
  }
  function dismissError() { document.getElementById('fdModuleLoadError')?.remove(); }
  function showError(id, error) {
    dismissError();
    if (!context()) return;
    const panel = document.createElement('section'); panel.id = 'fdModuleLoadError'; panel.setAttribute('role', 'alert');
    panel.style.cssText = 'position:fixed;z-index:2147482000;right:20px;bottom:20px;max-width:420px;padding:18px;background:white;border:1px solid #fca5a5;border-radius:12px;box-shadow:0 8px 32px #0002;color:#7f1d1d';
    const text = document.createElement('p'); text.textContent = String(error?.message || 'Modül açılamadı.');
    const retry = document.createElement('button'); retry.textContent = 'Yeniden dene'; retry.onclick = () => { dismissError(); open(id).catch(() => {}); };
    const close = document.createElement('button'); close.textContent = 'Kapat'; close.style.marginLeft = '10px'; close.onclick = dismissError;
    panel.append(text, retry, close); document.body.appendChild(panel);
  }
  async function open(id, args = [], receiver = root) {
    let snapshot;
    try { snapshot = permitted(id); } catch (error) { root.showToast?.(error.message, 'warning'); return; }
    if(!['gunlukhatirlatma','bildirimizni','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdGunlukHatirlatmaGecisiniIptalEt?.();
    if(!['pdfonizleme','bildirimizni','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdPdfOnizlemeGecisiniIptalEt?.();
    if(!['personelform','cikisuyari','kayithatirlatma','pdfonizleme','gunlukhatirlatma','bildirimizni','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdPersonelFormGecisiniIptalEt?.();
    if(!['topluplan','bildirimizni','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdTopluPlanGecisiniIptalEt?.();
    if(!['bildirimizni','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdBildirimIzniGecisiniIptalEt?.();
    if(!['manuelduzeltme','bildirimizni','gunlukhatirlatma','pdfonizleme','wordbelge','drivebelge','belgehazirla','wordonizleme'].includes(id))root.fdManuelDuzeltmeGecisiniIptalEt?.();
    if(!['wordonizleme','belgehazirla','wordbelge','bildirimizni','gunlukhatirlatma','pdfonizleme','drivebelge'].includes(id))root.fdWordBelgeGecisiniIptalEt?.();
    if(!['belgehazirla','drivebelge','wordbelge','bildirimizni','gunlukhatirlatma','pdfonizleme'].includes(id))root.fdDriveBelgeGecisiniIptalEt?.();
    if(!['wordonizleme','belgehazirla','wordbelge','drivebelge','pdfonizleme','bildirimizni','gunlukhatirlatma'].includes(id))root.fdBelgeHazirlamaIptalEt?.();
    if(!['wordonizleme','belgehazirla','wordbelge','drivebelge','pdfonizleme','bildirimizni','gunlukhatirlatma'].includes(id))root.fdWordOnizlemeIptalEt?.();
    const ticket = ++navigation;
    dismissError();
    const loading = root.fdPageLoading?.beginModule(id, false);
    try {
      const record = await ensure(id, snapshot); valid(snapshot, id);
      if (ticket !== navigation) return;
      return await record.instance.open.apply(receiver, args);
    } catch (error) {
      const now = synchronize();
      if (now.key === snapshot.key && now.epoch === snapshot.epoch && ticket === navigation) showError(id, error);
      return false;
    } finally {
      root.fdPageLoading?.end(loading);
    }
  }
  // Embedded child screens do not invalidate a concurrently opening workspace.
  async function embedded(id,args=[],receiver=root){
    let snapshot;try{snapshot=permitted(id)}catch(error){root.showToast?.(error.message,'warning');return}
    const ticket=navigation;let loading=root.fdPageLoading?.beginModule(id,true);try{const record=await ensure(id,snapshot);valid(snapshot,id);if(ticket!==navigation)return;if(id==='wordonizleme'){root.fdPageLoading?.end(loading);loading=null;}return await record.instance.open.apply(receiver,args)}catch(error){const now=synchronize();if(now.key===snapshot.key&&now.epoch===snapshot.epoch&&ticket===navigation)showError(id,error);return false}finally{root.fdPageLoading?.end(loading)}
  }
  root.FDModules = Object.freeze({
    release: catalog.release,
    define(id, factory) { moduleEntry(id); if (typeof factory !== 'function' || factories.has(id)) throw new Error('Geçersiz modül tanımı.'); factories.set(id, factory); },
    open, embedded,
    callIfLoaded: invoke,
    configure(read) { if (typeof read !== 'function') throw new Error('Oturum okuyucusu gerekli.'); contextReader = read; synchronize(); },
    sessionChanged() { root.fdWordOnizlemeIptalEt?.(true); root.fdBelgeHazirlamaIptalEt?.(true); root.fdDriveBelgeGecisiniIptalEt?.(true); root.fdWordBelgeGecisiniIptalEt?.(true); root.fdManuelDuzeltmeGecisiniIptalEt?.(true); root.fdBildirimIzniGecisiniIptalEt?.(true); root.fdTopluPlanGecisiniIptalEt?.(true); root.fdPdfOnizlemeGecisiniIptalEt?.(true); root.fdPersonelFormGecisiniIptalEt?.(true); synchronize(); dismissError(); },
    permissionsSaved(id) {
      // Only an unchanged Admin Settings session can retain its own saved form.
      // All other mounted modules and pending opens must re-authorize.
      const record=instances.get(id), value=context();
      if(id!=='ayarlar'||!record||!value||value.role!=='Admin')return false;
      const previous=record.snapshot.value;
      if(previous.user!==value.user||previous.company!==value.company||previous.role!==value.role||!value.canRead(id)||!value.canWrite(id))return false;
      const next=key(value);if(next===currentKey)return true;
      currentKey=next;contextEpoch++;navigation++;
      for(const [other,entry]of instances){if(other===id)continue;try{entry.instance.dispose?.()}catch(_){}unmount(other);instances.delete(other);}
      record.snapshot={value,key:next,epoch:contextEpoch};return true;
    },
    cancelNavigation() { root.fdWordOnizlemeIptalEt?.(); root.fdBelgeHazirlamaIptalEt?.(); root.fdDriveBelgeGecisiniIptalEt?.(); root.fdWordBelgeGecisiniIptalEt?.(); root.fdManuelDuzeltmeGecisiniIptalEt?.(); root.fdBildirimIzniGecisiniIptalEt?.(); root.fdTopluPlanGecisiniIptalEt?.(); root.fdPersonelFormGecisiniIptalEt?.(); root.fdGunlukHatirlatmaGecisiniIptalEt?.(); root.fdPdfOnizlemeGecisiniIptalEt?.(); navigation++; dismissError(); },
    status(id) { synchronize(); return Object.freeze({ loaded: instances.has(id), defined: factories.has(id), pending: [...pending.keys()].some(value => value.startsWith(id + ':')) }); }
  });
})(window);

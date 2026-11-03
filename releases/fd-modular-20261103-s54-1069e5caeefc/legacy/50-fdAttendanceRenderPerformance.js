
(function (root) {
    // Each synchronous render/export gets a fresh index. Nested calculations reuse
    // it, and finally restores previous caches so later edits never see stale data.
    function withAttendanceIndex(fn, receiver, args) {
        if (fdMagicpassKayitTurCache) return fn.apply(receiver, args);
        const previous = fdPuantajHesapOnbelleginiBaslat();
        try { return fn.apply(receiver, args); }
        finally { fdPuantajHesapOnbelleginiGeriYukle(previous); }
    }
    for (const name of ['magicpassAylikCizelgeyiCiz', 'magicpassAylikCizelgeVerisi', 'magicpassGunlukRaporTumVerisi', 'magicpassGunlukRaporuCiz']) {
        const original = root[name];
        if (typeof original !== 'function' || original.__fdAttendanceIndexed) continue;
        const wrapped = function (...args) { return withAttendanceIndex(original, this, args); };
        wrapped.__fdAttendanceIndexed = true;
        root[name] = wrapped;
    }
})(window);


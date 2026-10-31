// Shared with personnel auto-accounts and the existing ISG account adapter.
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

// Stable bridges exist before legacy role and ISG wrappers are installed.
function openAdminModal(){return window.FDModules.open('kullanici',Array.from(arguments),this);}
function renderAdminUsers(){return window.FDModules.callIfLoaded('kullanici','renderAdminUsers',Array.from(arguments),this);}
function kullaniciModulunuBaslat(){return window.FDModules.callIfLoaded('kullanici','kullaniciModulunuBaslat',Array.from(arguments),this);}

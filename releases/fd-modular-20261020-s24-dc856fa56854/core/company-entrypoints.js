// Stable legacy menu, tab and automatic-refresh bridges; no screen download for refresh alone.
function openSirketApp(){return window.FDModules.open('sirket',Array.from(arguments),this);}
function renderSirketYonetimi(){return window.FDModules.callIfLoaded('sirket','renderSirketYonetimi',Array.from(arguments),this);}
function sirketModulunuBaslat(){return window.FDModules.callIfLoaded('sirket','sirketModulunuBaslat',Array.from(arguments),this);}

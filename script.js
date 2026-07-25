// DONE DE BAZ NAN MEMWA
let estok = JSON.parse(localStorage.getItem('estokPro')) || [];
let listwaVant = JSON.parse(localStorage.getItem('vantPro')) || [];
let panyenKouran = []; // Sa kèsye a ap chaje pou kliyan an kounye a
let roleItilizate = null; // 'admin' oswa 'kesye'

// --- 1. SEKIRITE AK KONEKSYON ---
function konekte() {
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        roleItilizate = 'admin';
    } else if (user === 'kesye' && pass === 'kesye123') {
        roleItilizate = 'kesye';
    } else {
        alert("Modpas oswa non itilizatè a pa bon!");
        return;
    }

    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-display').innerText = `- Konekte kòm: ${roleItilizate.toUpperCase()}`;
    
    // Kache panèl Admin nan si se yon kèsye
    if (roleItilizate === 'kesye') {
        document.getElementById('admin-panel').style.display = 'none';
    } else {
        document.getElementById('admin-panel').style.display = 'block';
    }

    rafrechiEkran();
}

function dekonekte() {
    roleItilizate = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// --- 2. RAFRECHI EKRAN AN (Afichaj) ---
function rafrechiEkran() {
    // A. Afiche Estòk (Pou Admin)
    const tbodyEstok = document.getElementById('estok-body');
    const selectVant = document.getElementById('select-pwodwi');
    tbodyEstok.innerHTML = '';
    selectVant.innerHTML = '<option value="">-- Chwazi Pwodwi --</option>';
    
    estok.forEach((pwodwi, index) => {
        tbodyEstok.innerHTML += `
            <tr>
                <td><strong>${pwodwi.nom}</strong> <br><small style="color:gray">${pwodwi.kategori}</small></td>
                <td style="color: ${pwodwi.kantite <= 5 ? 'red' : 'black'};"><strong>${pwodwi.kantite}</strong></td>
                <td>${pwodwi.priAcha}</td>
                <td>${pwodwi.priVant}</td>
            </tr>`;
        
        if (pwodwi.kantite > 0) {
            selectVant.innerHTML += `<option value="${index}">${pwodwi.nom} - ${pwodwi.priVant} HTG (Rete: ${pwodwi.kantite})</option>`;
        }
    });

    // B. Kalkile Pwofi (Pou Admin)
    let totalPwofi = 0;
    listwaVant.forEach(vant => { totalPwofi += vant.pwofiVant; });
    document.getElementById('total-pwofi').innerText = totalPwofi.toLocaleString();

    // C. Afiche Panyen Kouran an
    const tbodyPanyen = document.getElementById('panyen-body');
    tbodyPanyen.innerHTML = '';
    let totalPanyen = 0;

    panyenKouran.forEach((atik, i) => {
        let totalAtik = atik.qte * atik.pwodwi.priVant;
        totalPanyen += totalAtik;
        tbodyPanyen.innerHTML += `
            <tr>
                <td>${atik.pwodwi.nom}</td>
                <td>${atik.qte}</td>
                <td>${totalAtik}</td>
                <td><button class="btn-red" onclick="retireNanPanyen(${i})" style="padding: 5px;">X</button></td>
            </tr>`;
    });
    document.getElementById('total-panyen').innerText = totalPanyen.toLocaleString();

    localStorage.setItem('estokPro', JSON.stringify(estok));
    localStorage.setItem('vantPro', JSON.stringify(listwaVant));
}

// --- 3. JESYON ESTÒK (Admin) ---
function ajouteNanEstok() {
    const nom = document.getElementById('nom-estok').value.trim();
    const kategori = document.getElementById('kategori-estok').value;
    const kantite = parseInt(document.getElementById('kantite-estok').value);
    const priAcha = parseFloat(document.getElementById('pri-acha').value);
    const priVant = parseFloat(document.getElementById('pri-vant').value);

    if (!nom || isNaN(kantite) || isNaN(priAcha) || isNaN(priVant)) {
        alert("Ranpli tout done yo kòrèkteman."); return;
    }

    let pwodwiEgziste = estok.find(p => p.nom.toLowerCase() === nom.toLowerCase());
    if (pwodwiEgziste) {
        pwodwiEgziste.kantite += kantite;
        pwodwiEgziste.priAcha = priAcha;
        pwodwiEgziste.priVant = priVant;
    } else {
        estok.push({ nom, kategori, kantite, priAcha, priVant });
    }

    // Netwaye fòm nan
    document.getElementById('nom-estok').value = '';
    document.getElementById('kantite-estok').value = '';
    document.getElementById('pri-acha').value = '';
    document.getElementById('pri-vant').value = '';
    
    rafrechiEkran();
}

// --- 4. JESYON PANYEN AK VANT (Kèsye) ---
function ajouteNanPanyen() {
    const indexPwodwi = document.getElementById('select-pwodwi').value;
    const qte = parseInt(document.getElementById('kantite-vann').value);

    if (indexPwodwi === "" || isNaN(qte) || qte <= 0) return;

    let pwodwi = estok[indexPwodwi];
    
    // Tcheke si gen ase nan estòk, epi si li pa depase sa k deja nan panyen an
    let qteDejaNanPanyen = panyenKouran.filter(p => p.pwodwi.nom === pwodwi.nom).reduce((sum, current) => sum + current.qte, 0);
    
    if (qte + qteDejaNanPanyen > pwodwi.kantite) {
        alert("Ou pa ka vann plis pase sa k gen nan depo a!"); return;
    }

    panyenKouran.push({ pwodwi: pwodwi, qte: qte, indexOriginal: indexPwodwi });
    document.getElementById('kantite-vann').value = '1';
    rafrechiEkran();
}

function retireNanPanyen(index) {
    panyenKouran.splice(index, 1);
    rafrechiEkran();
}

function valideVantLan() {
    if (panyenKouran.length === 0) {
        alert("Panyen an vid!"); return;
    }

    let kòbVantLan = 0;
    
    // 1. Retire nan estòk epi kalkile
    panyenKouran.forEach(atik => {
        estok[atik.indexOriginal].kantite -= atik.qte;
        
        let kòbTotalAtik = atik.qte * atik.pwodwi.priVant;
        kòbVantLan += kòbTotalAtik;
        
        // Kalkile Pwofi: (Pri Vant - Pri Acha) * Kantite
        let benefisAtik = (atik.pwodwi.priVant - atik.pwodwi.priAcha) * atik.qte;

        listwaVant.push({
            nom: atik.pwodwi.nom,
            kantite: atik.qte,
            totalKòb: kòbTotalAtik,
            pwofiVant: benefisAtik,
            dat: new Date().toLocaleString()
        });
    });

    // 2. Prepare Resi a pou enprime
    prepareResi(kòbVantLan);

    // 3. Resèt sistèm nan
    panyenKouran = []; // Vide panyen an
    rafrechiEkran();
    
    // 4. Lanse enprimant lan
    window.print();
}

function prepareResi(total) {
    document.getElementById('resi-dat').innerText = new Date().toLocaleString();
    const tbodyResi = document.getElementById('resi-body');
    tbodyResi.innerHTML = '';
    
    panyenKouran.forEach(atik => {
        tbodyResi.innerHTML += `
            <tr>
                <td>${atik.pwodwi.nom}</td>
                <td>${atik.qte}</td>
                <td>${atik.qte * atik.pwodwi.priVant}</td>
            </tr>`;
    });
    document.getElementById('resi-total').innerText = total.toLocaleString();
}

// --- 5. FÈMEN KÈS ---
function femenKes() {
    if(confirm("Èske w sèten ou vle fèmen kès jounen an? Sa ap resèt istwa kòb jounen an.")) {
        // Nou efase istwa vant jodi a, men nou sove estòk la
        listwaVant = [];
        rafrechiEkran();
        alert("Kès la fèmen. Tout rapò reset kounye a.");
    }
}

// Anrejistre Service Worker pou PWA a
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((reg) => console.log('PWA pare ak Service Worker!', reg))
            .catch((err) => console.log('Erè PWA:', err));
    });
}

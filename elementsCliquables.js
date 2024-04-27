function changerOnglet(onglet) {
    let tutos = document.querySelectorAll(".accueil-tuto-etapes");
    let boutons = document.querySelectorAll(".accueil-tuto-choixPlateforme-plateforme");
    for (let i = 0; i < tutos.length; i++) {
        tutos[i].style.display = "none";
        boutons[i].childNodes[1].style.backgroundColor = "#5e5e5e";
    }
    tutos[onglet].style.display = "flex";
    boutons[onglet].childNodes[1].style.backgroundColor = "#2c2c2c";
}
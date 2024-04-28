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

function getFile() {
    document.getElementById("upfile").click();
}

// const selectedFile = document.getElementById("upfile").files[0];

const inputElement = document.getElementById("upfile");
inputElement.addEventListener("change", handleFiles, false);


// Code permettant d'extraire le contenu du fichier zip


function handleFiles() {
    let discussion;
    const fileList = this.files;
    const file = fileList[0]; //Premier fichier de la liste (il n'y en a qu'1)
    const reader = new FileReader();

    reader.onload = function(event) {
        const zipData = event.target.result;
        JSZip.loadAsync(zipData).then(function(zip) {
            zip.forEach(function(relativePath, zipEntry) {
                if (relativePath.endsWith('.txt')) {
                    zipEntry.async("string").then(function (contenuFichier) {
                        // Transforme le fichier txt de messages en tableauDObjets
                        //  La fonction .filter() permet de supprimer les messages définis comme undefined 
                        // (envoyés par WhatsApp ou sur plusieurs lignes)
                        const tableauMessages = convertirFichierEnObjet(contenuFichier).filter(function(e) {
                            return e !== undefined
                        });
                        // Enregistrement de toutes les données dans le local storage afin de pouvoir y accéder sur toutes les pages
                        localStorage.setItem('nombreMessagesEnvoyes', JSON.stringify(tableauMessages.length))
                        localStorage.setItem('premiersMessagesEnvoyes', JSON.stringify(premiersMessagesEnvoyes(tableauMessages)))
                    });
                }
            });
        });
    };

    reader.readAsArrayBuffer(file);   
}

function convertirFichierEnObjet(filename) {
    // Lecture du fichier texte ligne par ligne
    const lignes = filename.split('\n');
    // Conversion de chaque ligne en objet
    const messages = lignes.map(ligne => convertirLigneEnObjet(ligne)).filter(Boolean);
    return messages;
}

// Fonction pour convertir une ligne en objet utilisable par la suite
function convertirLigneEnObjet(ligne) {
    const [dateStr, reste] = ligne.split(' - ');
    // Supprime les messages qui tiennent sur plusieurs lignes (ne garde que la 1ere)
    if (typeof dateStr === 'undefined' || typeof reste === 'undefined') {
        return;
    }
    const [utilisateur, ...messageTxt] = reste.split(':');
    // Au cas où il y aurait des : dans le messages, que le reste du message ne soit pas ignoré
    const message = messageTxt.join(':')
    const [date, temps] = dateStr.split(', ');
    const [jour, mois, annee] = date.split('/');
    const [heure, minutes] = temps.split(':');
    // Supprime les messages envoyés par WhatsApp
    if (typeof utilisateur === 'undefined' || message === '') {
        return;
    }
    return {
        date: new Date(annee, mois - 1, jour, heure, minutes),
        utilisateur: utilisateur.trim(),
        message: message.trim()
    };
}

function premiersMessagesEnvoyes(tableauMessages) {
    let reponse = "";
    for (let index = 0; index < 10; index++) {
        reponse = reponse + " \n   " + tableauMessages[index].utilisateur + " : " + tableauMessages[index].message;        
    }
    return reponse
}
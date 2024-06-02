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
                        // En ligne :
                        window.location.replace('/stats-whatsapp/chargement.html');
                        // En local :
                        // window.location.replace('/chargement.html');

                        // Transforme le fichier txt de messages en tableauDObjets
                        //  La fonction .filter() permet de supprimer les messages définis comme undefined 
                        // (envoyés par WhatsApp ou sur plusieurs lignes)
                        const tableauMessages = convertirFichierEnObjet(contenuFichier).filter(function(e) {
                            return e !== undefined
                        });
                        // Vérification que c'est bien un fichier de données WhatsApp
                        if (tableauMessages[0] === undefined) {
                            localStorage.setItem('nombreMessagesEnvoyes', "erreur")    
                        } else {
                            // Enregistrement de toutes les données dans le local storage afin de pouvoir y accéder sur toutes les pages
                            localStorage.setItem('nombreMessagesEnvoyes', JSON.stringify(tableauMessages.length))
                            localStorage.setItem('premiersMessagesEnvoyes', JSON.stringify(premiersMessagesEnvoyes(tableauMessages)))
                            localStorage.setItem('repartitionParole', JSON.stringify(repartitionParole(tableauMessages)))
                            localStorage.setItem('motsLesPlusUtilises', JSON.stringify(motsLesPlusUtilises(tableauMessages)))
                            localStorage.setItem('emojisLesPlusUtilises', JSON.stringify(emojisLesPlusUtilises(tableauMessages)))
                            localStorage.setItem('caracteresInscrits', JSON.stringify(concatenerTousLesMessages(tableauMessages).length))
                        }
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

// Afficher les 10 premiers messages envoyés
function premiersMessagesEnvoyes(tableauMessages) {
    let reponse = "";
    for (let index = 0; index < 10; index++) {
        console.log(tableauMessages[index]);
        reponse = reponse + " \n   " + " " + tableauMessages[index].utilisateur + " (" + tableauMessages[index].date.toLocaleString('fr-FR', { timeZone: 'UTC' }) + ") : " + tableauMessages[index].message + "\n";
    }
    return reponse
}


/* Afficher la répartition de la parole (dans une conversation à 2) */
function repartitionParole(tableauMessages) {
    // Trouver le nom des 2 utilisateurs
    function trouverNomUtilisateur2() {
        let indexBoucleUtilisateur2 = 0;
        // Le code suivant parcourt le tableau de messages jusqu'à trouver un nom
        // d'utilisateur différent du premier
        while(true) {
            if (tableauMessages[indexBoucleUtilisateur2].utilisateur !== user1) {
                return tableauMessages[indexBoucleUtilisateur2].utilisateur
            }
            indexBoucleUtilisateur2++;
        }
    }
    
    let user1 = tableauMessages[0].utilisateur;
    let user2 = trouverNomUtilisateur2();
    
    
    let user1NbMessage = 0;
    let user2NbMessage = 0;
    
    // Calculer le nb de messages envoyés par chaque utilisateur en ajoutant
    // 1 à user1NbMessage ou user2NbMessage en fonction du nom de l'utilisateur
    for (let index = 0; index < tableauMessages.length; index++) {
        if (tableauMessages[index].utilisateur === user1) {
            user1NbMessage++
        } else {
            user2NbMessage++
        }
    }    
    return [[user1, user1NbMessage], [user2, user2NbMessage]];
}

// Fonction qui créé une chaîne de caractère contenant tous les messages qui se suivent
function concatenerTousLesMessages(tableauMessages) {
    let tousLesMots = "";
    for (let index = 0; index < tableauMessages.length; index++) {
        tousLesMots = tousLesMots + " " + tableauMessages[index].message
    }
    return tousLesMots
}


// Fonction qui renvoit les 10 (ajustable) mots les plus utilisés dans la discussion
function motsLesPlusUtilises(tableauMessages) {
    const frequenceApparitionMots = {}; // Objet qui contiendra tous les couples mot / frequence d'apparition
    // Supprimer de la réponse de mots les mots les + utilisés donc pas intéressants
    const listeMotsAnnulables = ["je","j","du","pas","en","on","il","ils","pour","l","les","le","la","un","une","a","dans","par","vers","tu","nous","vous","elle","elles","moi","toi","t","y","avec","sur","suis","es","est","ou","se","ce","cette","cet","ces","me","ne","mon","ma","ta","sa","qu","que","ai","as","avais","avait","tout","tre","très","m","d","c","de","trop","et","est","si","te","qui","lui","s"];
    // Ce tableau contient tous les mots utilisés, chacun dans une string différente
    let tableauTousLesMots = concatenerTousLesMessages(tableauMessages).toLowerCase().match(/\b\p{L}+\b/giu);
    for (const mot of tableauTousLesMots) {
        let annule = false;
        // Teste tt les mots de la liste des mots à annuler pour savoir s'il faut compter ou pas le mot dans frequenceApparitionMots
        for (let index = 0; index < listeMotsAnnulables.length; index++) {
            if(mot === listeMotsAnnulables[index]) {
                annule = true;
                break
            }
        }
        // Si le mot n'est pas dans listeMotsAnnulables, alors il est ajouté dans frequenceApparitionMots ou sa fréquence est augmentée de 1 s'il est déjà présent
        if(!annule) {
            frequenceApparitionMots[mot] = (frequenceApparitionMots[mot] || 0) + 1;
        }
    }

    // Trie les mots du + au - utilisé
    const sortedFrequencesApparitionMots = Object.entries(frequenceApparitionMots)
        .sort((a, b) => b[1] - a[1]);

    // Coupe le tableau aux 10 (ajustables) premiers mots les + utilisés
    const top10MotsPlusUtilises = sortedFrequencesApparitionMots.slice(0, 10);
    return top10MotsPlusUtilises;

    // Retourne un tableau comprenant pour les 10 mots les + utilisés leur couple mot / fréquence
    // return top10MotsPlusUtilises.map(([mot, frequence]) => `${mot}: ${frequence}`);
}

/* Afficher les emojis les + utilisés*/

function emojisLesPlusUtilises(tableauMessages) {
    // Cette expression régulière permet de ne prendre que les emojis (et les chiffres) du texte
    let emojisEtChiffres = concatenerTousLesMessages(tableauMessages).match(/\p{Emoji}+/gu);
    // Supprime les chiffres du texte
    let emojis = emojisEtChiffres.filter((caractère) => !/\p{Nd}/u.test(caractère));
    
    let emojisSolos = [];
    
    // Cette fonction permet de transformer une string de plusieurs emojis en un tableau
    // de plusieurs string contenant 1 emoji chacune
    function emojiStringEnTableau (string) {
        split = string.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
        tableauEmojis = [];
        for (let i=0; i<split.length; i++) {
            char = split[i]
            if (char !== "") {
                tableauEmojis.push(char);
            }
        }
        return tableauEmojis;
    };
    
    
    // Itère sur chaque string pour les convertir en tableaux d'emojis
    for (const grpEmojis of emojis) {
        emojisSolos.push(emojiStringEnTableau(grpEmojis));
    }
    
    let tableauEmojisUtilises = [];
    // Concatène tt les tableaux d'emojis pour n'en faire qu'1 seul
    for (const tableau of emojisSolos) {
        tableauEmojisUtilises = tableauEmojisUtilises.concat(tableau)
    }
    
    const frequenceApparitionEmoji = {}; // Objet qui contiendra tous les couples emoji / frequence d'apparition
    for (const emojis of tableauEmojisUtilises) {
            // L'emoji est ajouté dans frequenceApparitionEmoji ou sa fréquence est augmentée de 1 s'il est déjà présent
            frequenceApparitionEmoji[emojis] = (frequenceApparitionEmoji[emojis] || 0) + 1;
        }
    // Trie les emojis du + au - utilisé
    const sortedFrequenceApparitionEmoji = Object.entries(frequenceApparitionEmoji)
        .sort((a, b) => b[1] - a[1]);
    // Coupe le tableau aux 10 (ajustables) premiers emojis les + utilisés
    const top10EmojisPlusUtilises = sortedFrequenceApparitionEmoji.slice(0, 10);

    // Retourne un tableau comprenant pour les 10 emojis les + utilisés leur couple mot / fréquence
    return top10EmojisPlusUtilises
}

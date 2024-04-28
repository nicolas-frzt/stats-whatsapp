/* Transformation du fichier txt en objet JS */
const fs = require('fs');

// Fonction pour lire le fichier texte ligne par ligne
function lireFichier(filename) {
    return fs.readFileSync(filename, 'utf8').split('\n');
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


// Fonction pour lire le fichier et convertir chaque ligne en objet
function convertirFichierEnObjet(filename) {
    const lignes = lireFichier(filename);
    const messages = lignes.map(ligne => convertirLigneEnObjet(ligne));
    return messages;
}

// Transforme le fichier txt de messages en tableauDObjets
//  La fonction .filter() permet de supprimer les messages définis comme undefined 
// (envoyés par WhatsApp ou sur plusieurs lignes)
const tableauMessages = convertirFichierEnObjet('Exemple vraie discussion.txt').filter(function(e) {
    return e !== undefined
});

/* Fonctionnalité 1 : Afficher le nombre de messages envoyés */

console.log(`Vous vous êtes envoyés ${tableauMessages.length} messages 😲`)


/* Fonctionnalité 2 : Afficher les 10 premiers messages envoyés */
function premiersMessagesEnvoyes() {
    let reponse = "";
    for (let index = 0; index < 10; index++) {
        reponse = reponse + " \n   " + tableauMessages[index].utilisateur + " : " + tableauMessages[index].message;        
    }
    return reponse
}

console.log(`\n\nVos premiers messages étaient : \n ${premiersMessagesEnvoyes()}`)

/* Afficher la répartition de la parole (dans une conversation à 2) */

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

console.log(`\n\nL'utilisateur ${user1} a envoyé ${user1NbMessage} messages`)
console.log(`L'utilisateur ${user2} a envoyé ${user2NbMessage} messages`)

// Renvoie la proportion (en %) de messages envoyés par chacun des utilisateurs
console.log(`\n${Math.round(user1NbMessage / tableauMessages.length * 100)} % des messages ont étés envoyés par ${user1}`)
console.log(`${Math.round(user2NbMessage / tableauMessages.length * 100)} % des messages ont étés envoyés par ${user2}`)


/* Afficher les mots les + utilisés*/

// Fonction qui créé une chaîne de caractère contenant tous les messages qui se suivent
function concatenerTousLesMessages() {
    let tousLesMots = "";
    for (let index = 0; index < tableauMessages.length; index++) {
        tousLesMots = tousLesMots + " " + tableauMessages[index].message
    }
    return tousLesMots
}


// Fonction qui renvoit les 10 (ajustable) mots les plus utilisés dans la discussion
function motsLesPlusUtilises(annulerMots) {
    const frequenceApparitionMots = {}; // Objet qui contiendra tous les couples mot / frequence d'apparition
    // Supprimer de la réponse de mots les mots les + utilisés donc pas intéressants
    const listeMotsAnnulables = ["je","j","du","pas","en","on","il","ils","pour","l","les","le","la","un","une","a","dans","par","vers","tu","nous","vous","elle","elles","moi","toi","t","y","avec","sur","suis","es","est","ou","se","ce","cette","cet","ces","me","ne","mon","ma","ta","sa","qu","que","ai","as","avais","avait","tout","tre","très","m","d","c","de","trop","et","est","si","te","qui","lui","s"];
    // Ce tableau contient tous les mots utilisés, chacun dans une string différente
    let tableauTousLesMots = concatenerTousLesMessages().toLowerCase().match(/\b\p{L}+\b/giu);
    for (const mot of tableauTousLesMots) {
        // Si l'utilisateur choisit de supprimer de la réponses les mots les + utilisés :
        if(annulerMots) {
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
        // Si l'utilisateur ne supprime aucun mot
        } else {
            // Le mot est ajouté dans frequenceApparitionMots ou sa fréquence est augmentée de 1 s'il est déjà présent
            frequenceApparitionMots[mot] = (frequenceApparitionMots[mot] || 0) + 1;
        }
    }

    // Trie les mots du + au - utilisé
    const sortedFrequencesApparitionMots = Object.entries(frequenceApparitionMots)
        .sort((a, b) => b[1] - a[1]);

    // Coupe le tableau aux 10 (ajustables) premiers mots les + utilisés
    const top10MotsPlusUtilises = sortedFrequencesApparitionMots.slice(0, 10);

    // Retourne un tableau comprenant pour les 10 mots les + utilisés leur couple mot / fréquence
    return top10MotsPlusUtilises.map(([mot, frequence]) => `${mot}: ${frequence}`);
}


console.log("\n\nLes 10 mots que vous avez le plus utilisés sont:");
console.log(motsLesPlusUtilises(true));
// Dans le fichier txt généré par WhatsApp, les médias (audios / photos / vidéos) ne sont pas inclus pour éviter de trop charger le fichier
// Donc, WhatsApp met à la place <Médias omis>
// Il est cependant possible de générer un fichier txt de discussion comprenant aussi les médias mais il peut être très volumineux
console.log("La présence de 'médias' et 'omis' correpond à une photo / une vidéo / un message audio");


/* Afficher les emojis les + utilisés*/

// Cette expression régulière permet de ne prendre que les emojis (et les chiffres) du texte
let emojisEtChiffres = concatenerTousLesMessages().match(/\p{Emoji}+/gu);
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

function emojisLesPlusUtilises() {
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
    return top10EmojisPlusUtilises.map(([emoji, frequence]) => `${emoji}: ${frequence}`);
}

console.log("\n\nVos emojis les plus utilisés sont :");
console.log(emojisLesPlusUtilises());


/* Afficher le nombre de caractères envoyés et la moyenne de caractères par message*/
console.log(`\n\nVotre conversation est composée de ${concatenerTousLesMessages().length} caractères`);
console.log(`Cela signifie qu'un de vos message était constitué d'en moyenne ${Math.round((concatenerTousLesMessages().length) / tableauMessages.length)} caractères\n\n\n`);
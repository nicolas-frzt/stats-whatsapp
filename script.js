/* Transformation du fichier txt en objet JS */

const fs = require('fs');

// Fonction pour lire le fichier texte ligne par ligne
function lireFichier(filename) {
    return fs.readFileSync(filename, 'utf8').split('\n');
}

// Fonction pour convertir une ligne en objet
function convertirEnObjet(ligne) {
    const [dateStr, rest] = ligne.split(' - ');
    // Supprime les messages qui tiennent sur plusieurs lignes (ne garde que la 1ere)
    if (typeof dateStr === 'undefined' || typeof rest === 'undefined') {
        return;
    }
    const [utilisateur, ...messageTxt] = rest.split(':');
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
    const messages = lignes.map(ligne => convertirEnObjet(ligne));
    return messages;
}

// Exemple d'utilisation
const objetMessagesSansTri = convertirFichierEnObjet('Exemple vraie discussion.txt');

// Supprimer les messages définis comme undefined (envoyés par WhatsApp ou sur plusieurs lignes)
let objetMessages = objetMessagesSansTri.filter(function(e) {
  return e !== undefined
})


// console.log(objetMessages)


/* Afficher le nombre de messages envoyés */

console.log(`Vous vous êtes envoyés ${objetMessages.length} messages 😲`)


/* Afficher les 10 premiers messages envoyés */
function premiersMessagesEnvoyes() {
    let reponse
    for (let index = 0; index < 10; index++) {
        if (index === 0) {
            reponse = " \n   " + objetMessages[index].utilisateur + " : " + objetMessages[index].message
        } else {
            reponse = reponse + " \n   " + objetMessages[index].utilisateur + " : " + objetMessages[index].message
        }
    }
    return reponse
}

console.log(`\n\nVos premiers messages étaient : \n ${premiersMessagesEnvoyes()}`)

/* Afficher la répartition de la parole (dans une conversation à 2) */

// Trouver le nom des 2 utilisateurs
let user1;
let user2;

user1 = objetMessages[0].utilisateur;

let indexBoucleUtilisateur2 = 0;
while (typeof user2 === 'undefined') {
    if (objetMessages[indexBoucleUtilisateur2].utilisateur !== user1) {
        user2 = objetMessages[indexBoucleUtilisateur2].utilisateur
    }
    indexBoucleUtilisateur2++;
}


let user1NbMessage = 0;
let user2NbMessage = 0;

for (let index = 0; index < objetMessages.length; index++) {
    if (objetMessages[index].utilisateur === user1) {
        user1NbMessage++
    } else {
        user2NbMessage++
    }
}

console.log(`\n\nL'utilisateur ${user1} a envoyé ${user1NbMessage} messages`)
console.log(`L'utilisateur ${user2} a envoyé ${user2NbMessage} messages`)

console.log(`\n${Math.round(user1NbMessage / objetMessages.length * 100)} % des messages ont étés envoyés par ${user1}`)
console.log(`${Math.round(user2NbMessage / objetMessages.length * 100)} % des messages ont étés envoyés par ${user2}`)


/* Afficher les mots les + utilisés*/

let tousLesMots = "";
for (let index = 0; index < objetMessages.length; index++) {
    tousLesMots = tousLesMots + " " + objetMessages[index].message
}
const tousLesMotsMinuscules = tousLesMots.toLowerCase().match(/\b\p{L}+\b/giu);

function motsLesPlusUtilises(annulerMots) {
    const frequenceApparitionMots = {};

    const listeMotsAnnulables = ["je","j","pas","en","on","il","ils","pour","l","les","le","la","un","une","a","dans","par","vers","tu","nous","vous","elle","elles","moi","toi","t","y","avec","sur","suis","es","est","ou","se","ce","cette","cet","ces","me","ne","mon","ma","ta","sa","qu","que","ai","as","avais","avait","tout","tre","très","m","d","c","de","trop","et","est","si","te","qui","lui","s"];
    for (const mot of tousLesMotsMinuscules) {
        if(annulerMots) {
            let annule = false;
            for (let index = 0; index < listeMotsAnnulables.length; index++) {
                if(mot === listeMotsAnnulables[index]) {
                    annule = true;
                    break
                }
            }
            if(!annule) {
                frequenceApparitionMots[mot] = (frequenceApparitionMots[mot] || 0) + 1;
            }
        } else {
            frequenceApparitionMots[mot] = (frequenceApparitionMots[mot] || 0) + 1;
        }
    }

    const sortedFrequencesApparitionMots = Object.entries(frequenceApparitionMots)
        .sort((a, b) => b[1] - a[1]);

    const top10MotsPlusUtilises = sortedFrequencesApparitionMots.slice(0, 10);

    return top10MotsPlusUtilises.map(([mot, frequence]) => `${mot}: ${frequence}`);
}

// const frequentWords = mostFrequentWords(tousLesMots);
console.log("\n\nLes 10 mots que vous avez le plus utilisés sont:");
console.log(motsLesPlusUtilises(true));
console.log("La présence de 'médias' et 'omis' correpond à une photo / une vidéo / un message audio");


/* Afficher les emojis les + utilisés*/
let emojisEtNombres = tousLesMots.match(/\p{Emoji}+/gu);
let emojis = emojisEtNombres.filter((caractère) => !/\p{Nd}/u.test(caractère));

let emojisSolos = [];

for (const grpEmojis of emojis) {
    emojisSolos.push(emojiStringToArray(grpEmojis));
}

function emojiStringToArray (str) {
    split = str.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
    arr = [];
    for (var i=0; i<split.length; i++) {
      char = split[i]
      if (char !== "") {
        arr.push(char);
      }
    }
    return arr;
};

let tableauEmojisUtilises = [];
for (const tableau of emojisSolos) {
    tableauEmojisUtilises = tableauEmojisUtilises.concat(tableau)
}

function emojisLesPlusUtilises() {
    const frequenceApparitionEmoji = {};
    for (const emojis of tableauEmojisUtilises) {
            frequenceApparitionEmoji[emojis] = (frequenceApparitionEmoji[emojis] || 0) + 1;
        }

    const sortedFrequenceApparitionEmoji = Object.entries(frequenceApparitionEmoji)
        .sort((a, b) => b[1] - a[1]);

    const top10EmojisPlusUtilises = sortedFrequenceApparitionEmoji.slice(0, 10);

    return top10EmojisPlusUtilises.map(([emoji, frequence]) => `${emoji}: ${frequence}`);
}

console.log("\n\nVos emojis les plus utilisés sont :");
console.log(emojisLesPlusUtilises());


/* Afficher le nombre de caractères envoyés et la moyenne de caractères par message*/
console.log(`\n\nVotre conversation est composée de ${tousLesMots.length} caractères`);
console.log(`Cela signifie qu'un de vos message était constitué d'en moyenne ${Math.round((tousLesMots.length) / objetMessages.length)} caractères\n\n\n`);
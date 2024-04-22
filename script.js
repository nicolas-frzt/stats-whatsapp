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
    const [utilisateur, ...messageTxt] = rest.split(': ');
    // console.log(utilisateur)
    // Au cas où il y aurait des : dans le messages, que le reste du message ne soit pas ignoré
    const message = messageTxt.join(': ')
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
const objetMessagesSansTri = convertirFichierEnObjet('fichier.txt');

// Supprimer les messages définis comme undefined (envoyés par WhatsApp ou sur plusieurs lignes)
let objetMessages = objetMessagesSansTri.filter(function(e) {
  return e !== undefined
})


console.log(objetMessages)



# Générateur de certificat de déplacement
![example workflow file path](https://github.com/irfanito/attestation-covid/workflows/Continuous%20deployment%20to%20Firebase%20Hosting%20on%20push/badge.svg)
## URL de production
https://attestation-covid-irf.web.app

## Vérifier l'environnement de développement
Ce projet nécessite la présence de [Node.js](https://nodejs.org/en/download/).

Vérifiez la version de [Node.js](https://nodejs.org/en/download/) instalée.
```console
node -v
```
Vérifiez la version de npm instalée.
```console
npm -v
```

## Importer le projet
```console
git clone https://github.com/irfanito/attestation-covid.git
cd attestation-covid
npm i
```

## Déployer l'application en live reload
```console
npm start
```

## Déployer l'application
```console
npx serve dist
```

## Builder l'application
```console
npm run build:dev
```
Le code à déployer sera le contenu du dossier `dist.`

## Déployer l'application en production
```console
firebase login
firebase deploy
```

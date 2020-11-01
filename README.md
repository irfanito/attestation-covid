# Générateur de certificat de déplacement
![example workflow file path](https://github.com/irfanito/attestation-covid/workflows/.github/workflows/main.yml/badge.svg)
## URL de production
https://attestation-covid-irf.web.app/${identifiantPersonne}

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

#### Builder l'application
```console
npm run build:dev
```
Le code à déployer sera le contenu du dossier `dist`

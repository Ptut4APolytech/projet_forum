# API PTUT

### Pré-requis
Installer les dépendances :

```
npm install
```

### Lancer le serveur
```
npm run dev
```

Voir la documentation Swagger:

```
open http://localhost:8080/docs
```

### Mettre à jour la documentation swagger

Installer la dépendance npm globale
```
npm install -g yamlinc
```
Pour recharger la documentation Swagger, lancer cette commande dans le dossier 'api':
```
cd api
yamlinc index.yaml
```

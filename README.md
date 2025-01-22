# Bot Tebex API
Ceci est un bot développé entièrement par Loockxy
## Installation
### 1. Création du bot discord

Pour commencer vous devez créer votre bot discord sur le [Potail de Developpeur Discord](https://discord.com/developers/applications)

https://discord.com/developers/applications

Une fois arriver sur la page en étant connecter créer votre bot

Une fois le bot créer aller dans l'onglet bot et cochez les élément ci-dessous

- [ ] Public bot
- [ ] Requires OAuth2 Code Grant
- [x] Presence Intent
- [x] Server Members Intent
- [x] Message Content Intent

Une fois ceci fais inviter le sur votre serveur avec comme condition application.commands et bot
## 2. Configuration de la connection entre tebex et le bot
Vous devez allez sur votre [Portail de créateur](https://creator.tebex.io/)

Une fois connecter allez sur l'onglet `Webhooks` qui se situe dans la catégorie `Integrations`

**Avant de continuer veiller lancer le bot et prendre l'ip et le port qu'il utilise**

Prennez l'ip et le port de se format la http://IP:PORT Exemple: http://127.0.0.1:3000

Une fois copier mettez le dans le endpoint du webhook tebex et mettez /tebex/webhook et l'URL devrais ressembler a sa : http://127.0.0.1:3000/tebex/webhook

puis cochez tout les éléments qui a à cochez et appuyer sur le bouton Add (Comme sa si ya des nouveauté sur les logs je vous le ferais)

Une fois ceci fais copier le secret key puis mettez le dans le config 

Une fois ceci fais redémarrer le bot et cliquer le validate dans l'onglet webhooks et vous reçevrais une notification (si vous avez configurer le salon de logs avant)

si vous avez un envoie en successfuly c'est que c'est bon voir bot est près a l'emploie ²

Bon dev et bon jeu a vous ^^
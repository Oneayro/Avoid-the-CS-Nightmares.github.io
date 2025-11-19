# Nightmare Debugger  
Petit jeu web développé en JavaScript/HTML/CSS dans le cadre du projet (Web Build).

---

## 🎮 Concept du jeu
Vous jouez un petit "débugger" qui doit éviter les bugs (ennemis), ramasser des lignes de code bénéfiques (bonus), gérer votre stamina et battre deux boss majeurs.  
L’objectif est de survivre le plus longtemps possible pour obtenir le meilleur score.

---

## 🕹️ Contrôles
| Action | Touche |
|-------|--------|
| Se déplacer à gauche | ← (flèche gauche) |
| Se déplacer à droite | → (flèche droite) |
| Tirer | **Espace** |
| Pause | Bouton "Pause" dans l’UI |
| Reprendre | Bouton "Continue" |
| Quitter la partie | Bouton "Stop" |
| Recommencer | Bouton "Restart" |

---

## ⚙️ Mécaniques principales (exigences du projet)
- **1 ressource limitée :** Stamina  
  - Diminue quand le joueur se déplace  
  - Remonte quand il est immobile  

- **2 types d’ennemis :**  
  1. Ennemi simple (chute verticale)  
  2. Ennemi en zigzag (déplacement horizontal + chute)

- **Boucle de progression :**  
  - Le score augmente automatiquement  
  - La vitesse des ennemis augmente avec le temps  
  - Des bonus rendent la partie plus dynamique

- **Boss :**  
  - **Boss 1** au score = 50  
  - **Boss 2** au score = 150  
  - Déplacements horizontaux + chute lente  
  - Ils tirent régulièrement sur le joueur  
  - Barre de vie affichée

- **Écran Game Over + Restart**

---

## 🎁 Bonus disponibles
- **Bonus de code (verts)** :  
  +5 points, accélération du joueur, accélération globale des ennemis  
- **Bonus spécial Wipe** :  
  Détruit instantanément tous les ennemis à l’écran  

---

## 🧱 Architecture du projet
- **index.html** – structure du jeu  
- **style.css** – interface, layout, barre de stamina, barre de boss  
- **game.js** – logique du jeu, collisions, spawn, boss, tirs  
- **assets/codeimg/** – images ennemis et bonus  
- **assets/gameBoard/** – Boss 1 et Boss 2  

---

## ▶️ Lancer le jeu
Aucune installation compliquée.

1. Télécharger le dossier du projet  
2. Ouvrir **index.html** dans un navigateur moderne (Chrome recommandé)

> ⚠️ Aucun serveur nécessaire. Il s’agit d’un build web statique.

---

## 📹 Vidéo de démonstration (1 minute)
*(Tu ajouteras le lien YouTube une fois filmé)*  
👉 **[Lien vidéo ici]**

---

## 👩‍🎨 Crédits
- **Développement & design** : Oriane Claudelle Mogue Foaleng  
- **Images / assets** :  
  - Dessins faits maison + images libres de droits (OpenArt / Pixabay / FreePik selon tes sources exactes)
- **Technologie utilisée** : JavaScript natif, HTML5, CSS3

---

## 📄 Licence
Utilisation pédagogique uniquement.  
Aucune redistribution commerciale des assets.


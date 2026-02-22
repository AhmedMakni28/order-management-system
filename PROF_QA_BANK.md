# Questions/Réponses Probables du Prof - Order Management System

## 1. Pourquoi as-tu choisi une architecture par feature modules ?
Reponse:
Pour separer clairement les domaines fonctionnels, faciliter la maintenance, le travail en equipe et activer le lazy loading pour charger a la demande.

## 2. Difference entre `forRoot` et `forChild` ?
Reponse:
`forRoot` configure le routeur principal une seule fois (app racine). `forChild` ajoute des routes dans les modules enfants.

## 3. C'est quoi le lazy loading et son avantage ?
Reponse:
C'est le chargement dynamique des modules via `loadChildren`. Avantage: bundle initial plus petit, meilleur temps de chargement initial.

## 4. Pourquoi utiliser des services ?
Reponse:
Pour sortir la logique metier et l'acces API des composants, reusabilite, testabilite, separation des responsabilites.

## 5. Qu'est-ce que la Dependency Injection dans Angular ?
Reponse:
Angular instancie et fournit automatiquement les dependances (services) aux composants via le constructeur.

## 6. Pourquoi Reactive Forms ici ?
Reponse:
Reactive Forms donne plus de controle programmatique, validation robuste, testabilite et logique claire create/edit.

## 7. Comment fonctionne `roleGuard` ?
Reponse:
Le guard lit `route.data.roles`, verifie authentification et role via `AuthService`, puis autorise ou redirige.

## 8. Pourquoi utiliser `BehaviorSubject` dans `AuthService` ?
Reponse:
Il conserve la derniere valeur et la diffuse immediatement aux nouveaux subscribers (navbar/sidebar), utile pour l'etat de session.

## 9. Difference `Subject` vs `BehaviorSubject` ?
Reponse:
`Subject` n'a pas de valeur initiale. `BehaviorSubject` a une valeur courante et la reemet aux nouveaux abonnements.

## 10. Pourquoi `forkJoin` dans plusieurs composants ?
Reponse:
Pour lancer plusieurs requetes HTTP en parallele et continuer seulement quand toutes sont terminees.

## 11. Difference `switchMap` et `mergeMap` ?
Reponse:
`switchMap` annule le flux precedent si un nouveau arrive (utile pour chaines dependantes). `mergeMap` execute en parallele sans annulation.

## 12. Comment la vue se met a jour apres HTTP ?
Reponse:
Dans `subscribe`, on met a jour des proprietes du composant; Angular declenche le change detection et re-render le template.

## 13. C'est quoi le Change Detection ?
Reponse:
Mecanisme Angular qui detecte les changements d'etat et synchronise le DOM avec les bindings du template.

## 14. Pourquoi ne pas utiliser `ngModel` ?
Reponse:
Choix architectural: standardiser sur Reactive Forms pour cohérence et meilleure maitrise de validation/etat formulaire.

## 15. Comment geres-tu les erreurs API ?
Reponse:
Chaque composant a `errorMessage`, feedback utilisateur via toasts, et gestion defensive dans les subscriptions.

## 16. Pourquoi un `SharedModule` ?
Reponse:
Pour centraliser les composants reutilisables (navbar, sidebar, modal, toast, not-found) et certains modules Material partages.

## 17. Pourquoi `NotFoundComponent` avec route `**` ?
Reponse:
Pour capturer toutes les routes inconnues et fournir une UX propre au lieu d'une page blanche.

## 18. Comment est geree l'authentification ?
Reponse:
Demo locale: login compare email/password depuis API mock, utilisateur stocke en `localStorage`, etat diffuse via `currentUser$`.

## 19. Quels sont les points faibles securite ?
Reponse:
Auth cote client, pas de JWT, pas d'autorisation serveur reelle. Adapté demo mais pas production.

## 20. Quelles ameliorations production proposerais-tu ?
Reponse:
Backend reel + JWT, HttpInterceptor, refresh token, logs, rate limit, validations serveur, audit.

## 21. Pourquoi typer les modeles avec interfaces TS ?
Reponse:
Contrats de donnees explicites, autocompletion IDE, prevention d'erreurs et meilleure lisibilite.

## 22. Pourquoi utilises-tu `readonly` sur les injections ?
Reponse:
Pour exprimer que la reference injectee ne doit pas etre reaffectee: intention claire et robustesse.

## 23. Comment geres-tu les droits admin/user dans l'UI ?
Reponse:
Double niveau:
- navigation/route via guard,
- comportement et boutons visibles selon role dans les composants.

## 24. Pourquoi separer DashboardService de DashboardComponent ?
Reponse:
Le composant reste focalise UI; le service contient les calculs metier, plus testable et reutilisable.

## 25. Exemple de flux complet quand on cree une commande ?
Reponse:
Submit formulaire -> validation -> payload selon role -> `OrderService.addOrder` -> HTTP POST -> reponse -> toast + navigation -> vue actualisee.

## 26. Comment as-tu corrige le bug edit/delete apres ajout ?
Reponse:
Normalisation des IDs dans les services (string/number), suppression de generation manuelle d'ID cote front, delegation de l'ID a l'API.

## 27. Pourquoi certaines subscriptions sont nettoyees avec `takeUntil` ?
Reponse:
Pour eviter les memory leaks sur streams longs (ex: `currentUser$`, `toasts$`) quand le composant est detruit.

## 28. Si le prof demande "Pourquoi pas NgRx ?"
Reponse:
Le scope projet reste moyen; `BehaviorSubject` + services suffit. NgRx serait pertinent si etat global plus complexe/multi-sources.

## 29. Si on passe en `OnPush`, que faut-il surveiller ?
Reponse:
Immutabilite des objets/listes, emissions observables et triggers explicites pour garder le rendu coherent.

## 30. Ton pitch final en 20 secondes ?
Reponse:
Application Angular modulaire et role-based, avec formulaires reactifs, services bien separes, routage protege et orchestration RxJS propre; fonctionnelle en demo et evolutive vers un niveau production.

---
Conseil oral:
- Repondre en 3 blocs: "quoi", "comment", "pourquoi".
- Donner un exemple concret de fichier/composant pour prouver la maitrise.

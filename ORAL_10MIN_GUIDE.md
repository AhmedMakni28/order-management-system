# Fiche Orale 10 Minutes - Order Management System

## 0) Objectif (15 sec)
Le projet est une application Angular de gestion de commandes avec 2 roles (`admin`, `user`), architecture modulaire, routage protege, formulaires reactifs et API mock via json-server.

## 1) Probleme resolu (45 sec)
L'application permet de:
- gerer les produits,
- passer et suivre des commandes,
- gerer les utilisateurs (admin),
- visualiser des indicateurs via dashboard.

Valeur: separation claire des responsabilites, UX fluide, logique de roles.

## 2) Architecture globale (1 min 30)
Structure en couches:
- UI: composants Angular (`src/app/**`)
- Metier/Data: services (`src/services/**`)
- Securite navigation: guards (`src/guards/**`)
- Config: environments (`src/environments/**`)

Modules par feature:
- `auth`, `products`, `orders`, `users`, `dashboard`, `shared`

Routing:
- `AppRoutingModule` en lazy loading
- fallback 404
- routes protegees avec `roleGuard` + `data.roles`

## 3) Concepts Angular utilises (2 min)
- `NgModule` pour organiser les features
- `Component` pour UI + logique de presentation
- `Service` + Dependency Injection
- `Reactive Forms` (`FormBuilder`, `Validators`)
- `Router` (`forRoot`, `forChild`, `loadChildren`)
- `Guards` (`canActivate`)
- `RxJS` (`Observable`, `BehaviorSubject`, `forkJoin`, `switchMap`)
- Data binding: `{{}}`, `[]`, `()`
- Directives: `*ngIf`, `*ngFor`, `[ngClass]`
- Lifecycle hooks: `ngOnInit`, `ngOnDestroy`
- Change Detection (strategie par defaut)

## 4) Demo flow concret (2 min)
Exemple: suppression d'un utilisateur.
1. Click sur bouton supprimer dans template.
2. `(click)` appelle `onDelete(userId)`.
3. Ouverture modal de confirmation via `ModalService`.
4. Si confirme: suppression commandes liees puis suppression user (services HTTP).
5. Rechargement users/orders.
6. Mise a jour etat composant (`this.users = ...`).
7. Angular detecte le changement et re-render la table.
8. Feedback visuel avec `ToastService`.

Points techniques a dire:
- orchestration async avec `switchMap`/`forkJoin`
- separation UI/metier
- robustesse role-based

## 5) Feature par feature (2 min)
### Auth
- login via formulaire reactif
- utilisateur stocke dans `localStorage`
- `currentUser$` diffuse l'etat de session

### Products
- liste/detail/form
- droits admin pour create/edit/delete

### Orders
- user voit ses commandes, admin voit tout
- form adapte au role
- detail joint user+product

### Users
- admin only
- CRUD + suppression dependances (orders)

### Dashboard
- KPI calcules via `DashboardService`
- logique metier extraite du composant

### Shared
- navbar/sidebar/modal/toast/not-found reutilisables

## 6) TypeScript (45 sec)
- interfaces (`User`, `Product`, `Order`)
- unions (`number | string`, `'admin' | 'user'`)
- generics (`Observable<T>`)
- `Record<string, number>` pour indexation
- checks null/undefined defensifs

## 7) Bonnes pratiques (45 sec)
- decoupage modulaire
- lazy loading
- guard par role
- reactive forms
- services dedies
- feedback UX loading/error/toast

## 8) Limites et ameliorations (1 min)
Limites:
- auth cote client (demo)
- IDs heterogenes (string/number)
- quelques messages/encodage a harmoniser

Ameliorations:
- backend JWT + autorisation serveur
- interceptor global erreurs/token
- `OnPush` pour perf
- tests unitaires/e2e plus complets
- remplacer `prompt` quick update par dialog Material

## 9) Conclusion (15 sec)
Le projet est fonctionnel, structure, et pedagogique: il demontre les fondamentaux Angular (modules, routing, services, RxJS, forms, guards) avec une architecture claire et evolutive.

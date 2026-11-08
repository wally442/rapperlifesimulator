BSG — LOT DE SECURISATION PREPRODUCTION

Fichiers a remplacer a la racine du depot PREPRODUCTION wally442/rapperlifesimulator :
- index.html
- sw.js
- manifest.json

IMPORTANT : ne pas copier ces fichiers dans le depot officiel bsg-app avant validation complete.
Le HTML utilise le projet Supabase de PREPRODUCTION : unxneutlmuxtifisiijl.

Corrections principales du HTML :
- donnees locales et files de synchronisation isolees par identifiant Supabase ;
- anciennes donnees locales sans proprietaire mises en quarantaine et non synchronisees automatiquement ;
- revalidation du compte lors d'un changement de session entre onglets ;
- synchronisation bloquee tant que l'identite du compte n'est pas liee ;
- protection des files de synchronisation contre un changement de compte pendant une requete ;
- correction de l'initialisation de la file syncDirty avant la declaration de REMOTE_TABLES.

Service worker v5 :
- cache limite au shell et aux ressources statiques de /rapperlifesimulator/ ;
- aucune mise en cache generale des reponses GET dynamiques ;
- suppression des anciennes caches bsg-cache-* ;
- chemins PWA alignes sur GitHub Pages.

Avant publication dans le depot de production :
- attendre le deploiement GitHub Pages de la preproduction ;
- tester connexion/deconnexion, changement de compte, versement hors-ligne, reprise de synchronisation et rechargement ;
- verifier qu'aucune ancienne file locale ne part sous un autre compte.

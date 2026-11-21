/* =====================================================================
   CONFIGURATION FIREBASE  (c'est le seul fichier à remplir)
   =====================================================================
   1. console.firebase.google.com → « Ajouter un projet » (gratuit).
   2. Build → Firestore Database → « Créer une base de données ».
   3. Build → Authentication → Sign-in method → « E-mail/Mot de passe » → Activer.
      Onglet « Users » → « Ajouter un utilisateur » ×2 : les e-mails ci-dessous
      avec le mot de passe de ton choix (ce seront les mots de passe admin).
   4. Paramètres du projet (⚙️) → « Vos applications » → icône </> (Web)
      → copie les valeurs de firebaseConfig ci-dessous.
   5. Firestore Database → onglet « Règles » → remplace tout par :

      rules_version = '2';
      service cloud.firestore {
        match /databases/{db}/documents {
          match /clan/{doc} {
            allow read: if true;
            allow write: if request.auth != null
              && request.auth.token.email in ['leader@zmajesty.com', 'coleader@zmajesty.com'];
          }
        }
      }

      (mets ici les mêmes e-mails que dans ADMIN_EMAILS ci-dessous)
   6. Authentication → Settings → « Domaines autorisés » : ajoute le domaine
      où le site est hébergé.
   ===================================================================== */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDGLoGWFjVSjPTt5hB2fxvY-SPLven5Fdw",
  authDomain: "zmajesty-df503.firebaseapp.com",
  projectId: "zmajesty-df503",
  appId: "1:481633858957:web:96ab3ac11029b47b19b9c4"
};

// E-mails des deux comptes admin créés à l'étape 3 (le site ne demande que le mot de passe).
const ADMIN_EMAILS = {
  'Leader': 'theodorik153@gmail.com',
  'Co-Leader': 'loumig59@gmail.com'
};

// Mode local (sans Firebase) uniquement. ⚠️ Visibles par tout le monde dans le code :
// SUPPRIME ce bloc dès que Firebase est configuré.
const LOCAL_PASSWORDS = { majesty2026: 'Leader', royal2026: 'Co-Leader' };

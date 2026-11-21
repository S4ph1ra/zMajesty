/* Couche Firebase : base de données partagée (Firestore) + connexion admin (Authentication).
   Si firebase-config.js n'est pas rempli, Cloud.configured vaut false et le site reste en mode local. */
const Cloud = (() => {
  const cfg = window.FIREBASE_CONFIG || {};
  const configured = !!cfg.apiKey && !/^VOTRE/.test(cfg.apiKey);
  if (!configured || !window.firebase) return { configured, on: false };   // pas configuré, ou SDK injoignable (hors ligne)

  firebase.initializeApp(cfg);
  const db = firebase.firestore(), auth = firebase.auth();
  const doc = name => db.collection('clan').doc(name);
  const roleOf = email => Object.keys(ADMIN_EMAILS).find(r => ADMIN_EMAILS[r].toLowerCase() === (email || '').toLowerCase()) || null;

  return {
    configured, on: true,
    watch: (name, cb) => doc(name).onSnapshot(s => cb(s.exists ? (s.data().list || []) : []), e => console.warn('Firestore:', e.code)),
    save: (name, list) => doc(name).set({ list }),
    async login(password) {
      for (const email of Object.values(ADMIN_EMAILS)) {
        try { const c = await auth.signInWithEmailAndPassword(email, password); return roleOf(c.user.email); } catch {}
      }
      return null;
    },
    logout: () => auth.signOut(),
    onAuth: cb => auth.onAuthStateChanged(u => cb(u ? roleOf(u.email) : null))
  };
})();

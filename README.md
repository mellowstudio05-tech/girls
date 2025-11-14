# Webflow Formular zu CMS Integration

Diese Lösung ermöglicht es, Webflow-Formulare so zu konfigurieren, dass sie automatisch CMS-Einträge in deinem Webflow-Projekt erstellen.

## 🚀 Funktionsweise

1. **Webflow-Formular** sendet Daten an eine Webhook-URL
2. **Vercel API Route** empfängt die Formular-Daten
3. **Webflow CMS API** erstellt automatisch einen neuen CMS-Eintrag

## 📋 Voraussetzungen

- Webflow Account mit CMS-Collection
- Vercel Account (kostenlos)
- Git Repository

## 🔧 Setup-Anleitung

### Schritt 1: Webflow API Credentials erhalten

1. **API Token erstellen:**
   - Gehe zu: https://webflow.com/dashboard/settings/integrations
   - Klicke auf "Create API Token"
   - Kopiere den Token

2. **Site ID finden:**
   - Öffne dein Webflow-Projekt
   - Die Site ID findest du in der URL: `https://webflow.com/design/[SITE_ID]`
   - Oder nutze die API: `GET https://api.webflow.com/v2/sites` (mit deinem Token)

3. **Collection ID finden:**
   - Gehe zu deiner CMS-Collection in Webflow
   - Die Collection ID findest du in der URL: `https://webflow.com/design/[SITE_ID]/cms/[COLLECTION_ID]`
   - Oder nutze die API: `GET https://api.webflow.com/v2/sites/[SITE_ID]/collections` (mit deinem Token)

### Schritt 2: Projekt auf Vercel deployen

1. **Repository zu Git pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Webflow CMS Integration"
   git remote add origin <deine-git-repo-url>
   git push -u origin main
   ```

2. **Auf Vercel deployen:**
   - Gehe zu https://vercel.com
   - Importiere dein Git Repository
   - Füge die Environment Variables hinzu:
     - `WEBFLOW_API_TOKEN` = dein API Token
     - `WEBFLOW_SITE_ID` = deine Site ID
     - `WEBFLOW_COLLECTION_ID` = deine Collection ID
   - Deploy!

3. **Webhook URL notieren:**
   - Nach dem Deploy erhältst du eine URL wie: `https://your-project.vercel.app/api/webflow-form-handler`
   - Diese URL benötigst du für Schritt 3

### Schritt 3: Webflow-Formular konfigurieren

1. **In Webflow Designer:**
   - Öffne dein Formular
   - Gehe zu Form Settings
   - Aktiviere "Send form data to custom endpoint"
   - Füge deine Vercel Webhook URL ein: `https://your-project.vercel.app/api/webflow-form-handler`

2. **Formular-Felder anpassen:**
   - Stelle sicher, dass deine Formular-Feldnamen zu den CMS-Feldern passen
   - Passe `api/webflow-form-handler.js` an, wenn deine Feldnamen anders sind

### Schritt 4: API Handler anpassen

Öffne `api/webflow-form-handler.js` und passe die `cmsItemData` an deine CMS-Collection-Felder an:

```javascript
const cmsItemData = {
  name: formData.name || formData['name'] || '',
  email: formData.email || formData['email'] || '',
  message: formData.message || formData['message'] || '',
  // Füge hier deine eigenen Felder hinzu
};
```

**Wichtig:** Die Feldnamen müssen exakt mit den Feldnamen in deiner Webflow CMS-Collection übereinstimmen!

## 🔍 Testing

1. **Lokal testen (optional):**
   ```bash
   npm install -g vercel
   vercel dev
   ```

2. **Formular testen:**
   - Fülle das Formular auf deiner Webflow-Seite aus
   - Sende es ab
   - Prüfe in Webflow CMS, ob der Eintrag erstellt wurde

## 📝 Wichtige Hinweise

- **Feldnamen:** Die Feldnamen im Code müssen exakt mit den CMS-Feldnamen in Webflow übereinstimmen
- **API Limits:** Webflow hat Rate Limits für die API (prüfe die Webflow Dokumentation)
- **Sicherheit:** Die API Route ist öffentlich zugänglich. Optional kannst du zusätzliche Authentifizierung hinzufügen
- **Error Handling:** Fehler werden in den Vercel Logs gespeichert

## 🛠️ Erweiterte Features (Optional)

- **Email-Benachrichtigungen** bei neuen Einträgen
- **Validierung** der Formular-Daten
- **Spam-Schutz** (z.B. reCAPTCHA)
- **Draft-Modus:** Einträge erst als Entwurf erstellen und später publizieren

## 📚 Ressourcen

- [Webflow API Dokumentation](https://developers.webflow.com/)
- [Vercel Dokumentation](https://vercel.com/docs)
- [Webflow CMS API](https://developers.webflow.com/reference/create-collection-item)

## ❓ Support

Bei Problemen:
1. Prüfe die Vercel Logs: `vercel logs`
2. Prüfe die Webflow API Response im Code
3. Stelle sicher, dass alle Environment Variables korrekt gesetzt sind


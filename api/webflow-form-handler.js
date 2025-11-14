/**
 * Vercel Serverless Function
 * Empfängt Webflow-Formular-Submissions und erstellt CMS-Einträge
 * 
 * Setup:
 * 1. Webflow API Token in Vercel Environment Variables setzen (WEBFLOW_API_TOKEN)
 * 2. Webflow Site ID in Vercel Environment Variables setzen (WEBFLOW_SITE_ID)
 * 3. Collection ID in Vercel Environment Variables setzen (WEBFLOW_COLLECTION_ID)
 * 4. Webflow Form Webhook URL auf diese Route setzen: https://your-domain.vercel.app/api/webflow-form-handler
 */

import { createCMSItem } from '../utils/webflow-api.js';

export default async function handler(req, res) {
  // CORS-Header für Webflow
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS-Request für CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET-Request für Tests (optional - kann später entfernt werden)
  if (req.method === 'GET') {
    const { 
      WEBFLOW_API_TOKEN, 
      WEBFLOW_SITE_ID, 
      WEBFLOW_COLLECTION_ID 
    } = process.env;
    
    return res.status(200).json({ 
      message: 'Webflow Form Handler is running',
      hasToken: !!WEBFLOW_API_TOKEN,
      hasSiteId: !!WEBFLOW_SITE_ID,
      hasCollectionId: !!WEBFLOW_COLLECTION_ID,
      endpoint: '/api/webflow-form-handler',
      method: 'POST'
    });
  }

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(200).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      WEBFLOW_API_TOKEN, 
      WEBFLOW_SITE_ID, 
      WEBFLOW_COLLECTION_ID 
    } = process.env;

    // Validierung der Environment Variables
    if (!WEBFLOW_API_TOKEN || !WEBFLOW_SITE_ID || !WEBFLOW_COLLECTION_ID) {
      console.error('Missing required environment variables');
      // 200 zurückgeben, damit Webflow keine Fehlerseite zeigt
      return res.status(200).json({ 
        success: false,
        error: 'Server configuration error. Please check environment variables.' 
      });
    }

    // Formular-Daten aus dem Request extrahieren
    const formData = req.body;
    
    // Debug: Logge die empfangenen Daten (kann später entfernt werden)
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    // Webflow Form Submissions - Feldnamen müssen exakt mit CMS-Collection übereinstimmen
    // Basierend auf den tatsächlichen CMS-Feldern:
    // Bild (Image), Text (Rich text), Uhrzeit (Plain text), Tag (Option), 
    // Wiederholung (Option), Barierefreiheit (Plain text), Ort (Reference),
    // Aufzug, Treppenstufen, Barrierefreie Toilette, Barrierefreier Zugang,
    // Alles Barrierefrei, Nicht Barrierefrei (alle Plain text)
    
    const cmsItemData = {
      // Rich text Feld (kann HTML enthalten)
      'Text': formData.Beschreibung || formData['Beschreibung'] || formData.beschreibung || formData.Text || formData.text || '',
      
      // Plain text Felder
      'Uhrzeit': formData.Uhrzeit || formData.uhrzeit || '',
      'Barierefreiheit': formData['Barierefreiheit'] || formData.Barierefreiheit || formData.barierefreiheit || 
                        formData['Barrierefreiheit'] || formData.Barrierefreiheit || '',
      
      // Checkbox-Felder als Plain Text: Wenn angekreuzt, dann Text-Wert setzen
      'Täglich': (formData.Täglich === true || formData.Täglich === 'true' || formData.täglich === true || formData.täglich === 'true') ? 'Täglich' : '',
      'Wöchentlich': (formData.Wöchentlich === true || formData.Wöchentlich === 'true' || formData.wöchentlich === true || formData.wöchentlich === 'true') ? 'Wöchentlich' : '',
      'Einmalig': (formData.Einmalig === true || formData.Einmalig === 'true' || formData.einmalig === true || formData.einmalig === 'true') ? 'Einmalig' : '',
      'Aufzug': (formData.Aufzug === true || formData.Aufzug === 'true' || formData.aufzug === true || formData.aufzug === 'true') ? 'Aufzug' : '',
      'Treppenstufen': (formData.Treppenstufen === true || formData.Treppenstufen === 'true' || formData.treppenstufen === true || formData.treppenstufen === 'true') ? 'Treppenstufen' : '',
      'Barrierefreie Toilette': (formData['Barrierefreie Toilette'] === true || formData['Barrierefreie Toilette'] === 'true' || 
                                 formData['barrierefreie-toilette'] === true || formData['barrierefreie-toilette'] === 'true') ? 'Barrierefreie Toilette' : '',
      'Barrierefreier Zugang': (formData['Barrierefreier Zugang'] === true || formData['Barrierefreier Zugang'] === 'true' || 
                                formData['barrierefreier-zugang'] === true || formData['barrierefreier-zugang'] === 'true') ? 'Barrierefreier Zugang' : '',
      'Alles Barrierefrei': (formData['Alles Barrierefrei'] === true || formData['Alles Barrierefrei'] === 'true' || 
                            formData['alles-barrierefrei'] === true || formData['alles-barrierefrei'] === 'true') ? 'Alles Barrierefrei' : '',
      'Nicht Barrierefrei': (formData['Nicht Barrierefrei'] === true || formData['Nicht Barrierefrei'] === 'true' || 
                            formData['nicht-barrierefrei'] === true || formData['nicht-barrierefrei'] === 'true') ? 'Nicht Barrierefrei' : '',
      
      // Option-Felder (Select/Dropdown)
      'Tag': formData.Tag || formData.tag || formData.Wochentag || formData.wochentag || '',
      'Wiederholung': formData.Wiederholung || formData.wiederholung || '',
      
      // Reference-Feld (Ort) - muss die ID des referenzierten Items sein
      // 'Ort': formData.Ort || formData.ort || '', // Falls du eine Ort-ID hast
      
      // Bild-Feld wird normalerweise nicht direkt vom Formular gesetzt
      // 'Bild': '', // Wird später manuell oder über andere Methode gesetzt
    };
    
    // Entferne leere Felder (optional, kann helfen bei Fehlern)
    Object.keys(cmsItemData).forEach(key => {
      if (cmsItemData[key] === '' || cmsItemData[key] === null || cmsItemData[key] === undefined) {
        delete cmsItemData[key];
      }
    });
    
    console.log('Processed CMS data:', JSON.stringify(cmsItemData, null, 2));

    // Webflow CMS API aufrufen, um Eintrag zu erstellen
    const createdItem = await createCMSItem(
      WEBFLOW_COLLECTION_ID,
      cmsItemData,
      false // Setze auf true, wenn Einträge erst als Entwurf erstellt werden sollen
    );
    
    // Erfolgreiche Antwort
    return res.status(200).json({ 
      success: true,
      message: 'CMS entry created successfully',
      itemId: createdItem.id 
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    console.error('Error stack:', error.stack);
    
    // Wichtig: Immer 200 zurückgeben, damit Webflow keine Fehlerseite zeigt
    // Der Fehler wird trotzdem in den Logs gespeichert
    return res.status(200).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}


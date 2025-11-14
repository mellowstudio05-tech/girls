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
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      return res.status(500).json({ 
        error: 'Server configuration error. Please check environment variables.' 
      });
    }

    // Formular-Daten aus dem Request extrahieren
    const formData = req.body;
    
    // Debug: Logge die empfangenen Daten (kann später entfernt werden)
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    // Webflow Form Submissions - Feldnamen müssen exakt mit CMS-Collection übereinstimmen
    const cmsItemData = {
      // Text-Felder (Plain)
      'Name Organisation': formData['Name Organisation'] || formData.name || '',
      'Anschrift': formData.Anschrift || formData.anschrift || '',
      'Vorname': formData.Vorname || formData.vorname || '',
      'Website': formData.Website || formData.website || '',
      'Instagram': formData.Instagram || formData.instagram || '',
      'Beschreibung': formData.Beschreibung || formData.beschreibung || '',
      'Uhrzeit': formData.Uhrzeit || formData.uhrzeit || '',
      'Altersgruppe': formData.Altersgruppe || formData.altersgruppe || '',
      'LGBTIQ-freundlich': formData['LGBTIQ-freundlich'] || formData.lgbtiq || '',
      
      // Select-Feld
      'Wochentag': formData.Wochentag || formData.wochentag || '',
      
      // Checkbox-Felder (Boolean)
      'Täglich': formData.Täglich === true || formData.Täglich === 'true' || formData.täglich === true || formData.täglich === 'true' || false,
      'Wöchentlich': formData.Wöchentlich === true || formData.Wöchentlich === 'true' || formData.wöchentlich === true || formData.wöchentlich === 'true' || false,
      'Einmalig': formData.Einmalig === true || formData.Einmalig === 'true' || formData.einmalig === true || formData.einmalig === 'true' || false,
      'Aufzug': formData.Aufzug === true || formData.Aufzug === 'true' || formData.aufzug === true || formData.aufzug === 'true' || false,
      'Treppenstufen': formData.Treppenstufen === true || formData.Treppenstufen === 'true' || formData.treppenstufen === true || formData.treppenstufen === 'true' || false,
      'Barrierefreie Toilette': formData['Barrierefreie Toilette'] === true || formData['Barrierefreie Toilette'] === 'true' || formData['barrierefreie-toilette'] === true || formData['barrierefreie-toilette'] === 'true' || false,
      'Barrierefreier Zugang': formData['Barrierefreier Zugang'] === true || formData['Barrierefreier Zugang'] === 'true' || formData['barrierefreier-zugang'] === true || formData['barrierefreier-zugang'] === 'true' || false,
      'Alles Barrierefrei': formData['Alles Barrierefrei'] === true || formData['Alles Barrierefrei'] === 'true' || formData['alles-barrierefrei'] === true || formData['alles-barrierefrei'] === 'true' || false,
      'Nicht Barrierefrei': formData['Nicht Barrierefrei'] === true || formData['Nicht Barrierefrei'] === 'true' || formData['nicht-barrierefrei'] === true || formData['nicht-barrierefrei'] === 'true' || false,
      'Datenschutz': formData.Datenschutz === true || formData.Datenschutz === 'true' || formData.datenschutz === true || formData.datenschutz === 'true' || false,
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
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}


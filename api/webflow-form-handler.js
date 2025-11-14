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
    
    // Webflow Form Submissions haben ein spezifisches Format
    // Anpassen je nach deinem Formular-Feldnamen
    const cmsItemData = {
      name: formData.name || formData['name'] || '',
      email: formData.email || formData['email'] || '',
      message: formData.message || formData['message'] || '',
      // Füge hier weitere Felder hinzu, die zu deinem CMS-Collection passen
      // z.B.: phone: formData.phone || '',
      //       date: new Date().toISOString(),
    };

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


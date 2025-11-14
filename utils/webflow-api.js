/**
 * Webflow API Helper Functions
 * Hilfsfunktionen für die Interaktion mit der Webflow API
 */

/**
 * Erstellt einen neuen CMS-Eintrag
 * @param {string} collectionId - Die ID der CMS-Collection
 * @param {object} fieldData - Die Daten für den Eintrag
 * @param {boolean} isDraft - Ob der Eintrag als Entwurf erstellt werden soll
 * @returns {Promise<object>} Der erstellte Eintrag
 */
export async function createCMSItem(collectionId, fieldData, isDraft = false) {
  const { WEBFLOW_API_TOKEN } = process.env;

  if (!WEBFLOW_API_TOKEN) {
    throw new Error('WEBFLOW_API_TOKEN is not set');
  }

  const response = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0'
      },
      body: JSON.stringify({
        fieldData,
        isDraft
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webflow API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Holt alle Collections einer Site
 * @param {string} siteId - Die ID der Webflow Site
 * @returns {Promise<array>} Liste aller Collections
 */
export async function getCollections(siteId) {
  const { WEBFLOW_API_TOKEN } = process.env;

  if (!WEBFLOW_API_TOKEN) {
    throw new Error('WEBFLOW_API_TOKEN is not set');
  }

  const response = await fetch(
    `https://api.webflow.com/v2/sites/${siteId}/collections`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'accept-version': '1.0.0'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webflow API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Holt alle Sites des Accounts
 * @returns {Promise<array>} Liste aller Sites
 */
export async function getSites() {
  const { WEBFLOW_API_TOKEN } = process.env;

  if (!WEBFLOW_API_TOKEN) {
    throw new Error('WEBFLOW_API_TOKEN is not set');
  }

  const response = await fetch(
    'https://api.webflow.com/v2/sites',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'accept-version': '1.0.0'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webflow API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}


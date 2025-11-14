/**
 * Hilfsskript zum Abrufen von Webflow Site ID und Collection IDs
 * 
 * Nutzung:
 * 1. Setze WEBFLOW_API_TOKEN als Environment Variable
 * 2. Führe aus: node scripts/get-webflow-ids.js
 */

import { getSites, getCollections } from '../utils/webflow-api.js';

async function main() {
  const { WEBFLOW_API_TOKEN } = process.env;

  if (!WEBFLOW_API_TOKEN) {
    console.error('❌ WEBFLOW_API_TOKEN ist nicht gesetzt!');
    console.log('Setze es mit: export WEBFLOW_API_TOKEN=dein_token');
    process.exit(1);
  }

  try {
    console.log('🔍 Suche nach Webflow Sites...\n');
    
    // Alle Sites abrufen
    const sites = await getSites();
    
    if (sites.length === 0) {
      console.log('❌ Keine Sites gefunden.');
      return;
    }

    console.log('📋 Gefundene Sites:\n');
    
    for (const site of sites) {
      console.log(`Site Name: ${site.displayName}`);
      console.log(`Site ID: ${site.id}`);
      console.log(`Short Name: ${site.shortName}`);
      console.log('---');

      // Collections für diese Site abrufen
      try {
        const collections = await getCollections(site.id);
        
        if (collections.length > 0) {
          console.log(`\n📚 Collections für "${site.displayName}":\n`);
          
          for (const collection of collections) {
            console.log(`  Collection Name: ${collection.displayName}`);
            console.log(`  Collection ID: ${collection.id}`);
            console.log(`  Slug: ${collection.slug}`);
            console.log('  ---');
          }
        } else {
          console.log(`\n  ℹ️  Keine Collections gefunden für "${site.displayName}"\n`);
        }
      } catch (error) {
        console.log(`\n  ⚠️  Fehler beim Abrufen der Collections: ${error.message}\n`);
      }
      
      console.log('\n');
    }

    console.log('\n✅ Fertig! Kopiere die IDs in deine Vercel Environment Variables.');

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  }
}

main();


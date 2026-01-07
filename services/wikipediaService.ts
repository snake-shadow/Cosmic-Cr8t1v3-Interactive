/**
 * Wikipedia Search Service
 * Fetches real facts from Wikipedia before AI formats them
 */

interface WikipediaData {
    title: string;
    extract: string;
    url: string;
}

/**
 * Search Wikipedia and return article summary + URL
 */
export async function searchWikipedia(query: string): Promise<WikipediaData | null> {
    try {
        console.log('📚 Searching Wikipedia for:', query);
        
        // Step 1: Search for the article
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(query)}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (!searchData.query?.search?.[0]) {
            console.warn('⚠️ No Wikipedia article found for:', query);
            return null;
        }
        
        const pageTitle = searchData.query.search[0].title;
        console.log('📖 Found Wikipedia article:', pageTitle);
        
        // Step 2: Get article content
        const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}`;
        
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();
        
        const pages = contentData.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract || '';
        
        const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
        
        console.log('✅ Wikipedia data retrieved');
        
        return {
            title: pageTitle,
            extract: extract,
            url: wikiUrl
        };
        
    } catch (error) {
        console.error('❌ Wikipedia search failed:', error);
        return null;
    }
}
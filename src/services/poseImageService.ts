import { google } from 'googleapis';

const CX_ID = 'f054ae2edb7fe4aa6'; // Your Custom Search Engine ID

export const fetchPoseImage = async (poseName: string): Promise<string | null> => {
  try {
    const customsearch = google.customsearch('v1');

    const response = await customsearch.cse.list({
      cx: CX_ID,
      q: poseName,
      searchType: 'image',
      num: 1,
      imgSize: 'medium',
      safe: 'active',
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link ?? null; // Image URL or null if link is undefined
    } else {
      console.warn('No images found for pose:', poseName);
      return null;
    }
  } catch (error) {
    console.error('Error fetching pose image:', error);
    return null;
  }
};
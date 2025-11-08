// Função de busca de capa no iTunes
export async function fetchArtworkFromITunes(
  artist: string,
  title: string
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const country = 'BR';
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=musicTrack&limit=1&country=${country}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const json = await response.json();

    if (json.results?.length) {
      const artworkUrl: string = json.results[0].artworkUrl100;
      return artworkUrl ? artworkUrl.replace('100x100bb', '300x300bb') : null;
    }
  } catch (err) {
    console.warn('Erro ao buscar capa no fetchArtworkFromITunes', err);
    return null;
  }
  return null;
}

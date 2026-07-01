export async function resolveSeries(seriesName: string) {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(seriesName)}&subject=series`);
    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error('Series resolver error:', error);
    return [];
  }
}

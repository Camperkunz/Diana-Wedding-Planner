'use server';

import { ALBUM_PAGE_SIZE } from '@/lib/album-paging';
import { getAlbum, type AlbumPhoto } from '@/lib/sanity-data';

/** Returns the next page of an album's photos, so the page never ships them all at once. */
export async function loadAlbumPhotos(slug: string, offset: number): Promise<AlbumPhoto[]> {
  if (typeof slug !== 'string' || slug.length > 200) return [];
  const start = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  const album = await getAlbum(slug);
  return album ? album.photos.slice(start, start + ALBUM_PAGE_SIZE) : [];
}

/**
 * Принимает ЛЮБУЮ ссылку на видео (обычную страницу или уже готовый embed)
 * с YouTube или Vimeo и возвращает корректный embed-URL для iframe.
 *
 * Если формат не распознан — возвращает пустую строку. Раньше здесь
 * возвращалась исходная ссылка как есть, из-за чего на странице Backstage
 * рисовался пустой iframe: YouTube/Vimeo и CSP `frame-src` запрещают
 * кадрировать обычные страницы. Пустая строка позволяет UI показать
 * обычную ссылку на исходную страницу вместо мёртвого плеера.
 */
export function getEmbedUrl(rawUrl?: string | null): string {
    const parsed = parseVideoUrl(rawUrl);
    if (!parsed) return '';

    if (parsed.platform === 'youtube') {
        return `https://www.youtube.com/embed/${parsed.id}`;
    }

    const embed = `https://player.vimeo.com/video/${parsed.id}`;
    return parsed.hash ? `${embed}?h=${parsed.hash}` : embed;
}

type ParsedVideo =
    | { platform: 'youtube'; id: string }
    | { platform: 'vimeo'; id: string; hash?: string }
    | null;

/**
 * Определяет платформу и ID видео по любой ссылке (обычной или embed).
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
    if (!rawUrl) return null;
    try {
        const u = new URL(rawUrl.trim());
        const host = u.hostname.replace(/^www\./, '');

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (u.pathname.startsWith('/embed/')) {
                const id = u.pathname.split('/')[2];
                if (id) return { platform: 'youtube', id };
            }
            const v = u.searchParams.get('v');
            if (v) return { platform: 'youtube', id: v };
            const shorts = u.pathname.match(/^\/shorts\/([^/]+)/);
            if (shorts) return { platform: 'youtube', id: shorts[1] };
        }

        if (host === 'youtu.be') {
            const id = u.pathname.slice(1);
            if (id) return { platform: 'youtube', id };
        }

        if (host === 'vimeo.com') {
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts[0] && /^\d+$/.test(parts[0])) {
                return { platform: 'vimeo', id: parts[0], hash: parts[1] || u.searchParams.get('h') || undefined };
            }
        }

        if (host === 'player.vimeo.com') {
            const match = u.pathname.match(/\/video\/(\d+)/);
            if (match) {
                return { platform: 'vimeo', id: match[1], hash: u.searchParams.get('h') || undefined };
            }
        }
    } catch {
        return null;
    }
    return null;
}

/**
 * Превью для YouTube — прямой предсказуемый URL, без сетевых запросов.
 * maxresdefault не всегда существует (не для всех видео), поэтому
 * берём hqdefault — он гарантированно есть для любого видео.
 */
export function getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Превью для Vimeo — тянем через официальный oEmbed API.
 * Требует сетевого запроса, поэтому функция асинхронная.
 * Работает и для приватных видео (с hash), т.к. просто передаём исходную ссылку.
 */
export async function getVimeoThumbnail(rawUrl: string): Promise<string | null> {
    try {
        const res = await fetch(
            `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(rawUrl)}`,
            { next: { revalidate: 60 * 60 * 24 } } // cache for 24 hours
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { thumbnail_url?: string };
        return data.thumbnail_url ?? null;
    } catch {
        return null;
    }
}

/**
 * Главная функция: если ручное превью не задано в Sanity,
 * пытается сгенерировать его автоматически по ссылке на видео.
 * Возвращает null, если распознать/получить превью не удалось —
 * тогда на фронте вместо превью рисуется нейтральная плашка.
 */
export async function getAutoThumbnail(rawUrl?: string | null): Promise<string | null> {
    const parsed = parseVideoUrl(rawUrl);
    if (!parsed) return null;

    if (parsed.platform === 'youtube') {
        return getYouTubeThumbnail(parsed.id);
    }

    if (parsed.platform === 'vimeo' && rawUrl) {
        return getVimeoThumbnail(rawUrl);
    }

    return null;
}

/**
 * Аккуратно добавляет query-параметр к embed-URL,
 * не ломая уже существующие параметры (например ?h=...).
 */
export function withAutoplay(embedUrl: string): string {
    if (!embedUrl) return embedUrl;
    const separator = embedUrl.includes('?') ? '&' : '?';
    return `${embedUrl}${separator}autoplay=1`;
}
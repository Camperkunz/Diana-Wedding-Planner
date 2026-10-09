/**
 * Принимает ЛЮБУЮ ссылку на видео (обычную страницу или уже готовый embed)
 * с YouTube или Vimeo и возвращает корректный embed-URL для iframe.
 * Если формат не распознан — возвращает исходную строку как есть (fallback).
 */
export function getEmbedUrl(rawUrl?: string | null): string {
    if (!rawUrl) return '';
    const url = rawUrl.trim();

    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '');

        // ---- YouTube ----
        if (host === 'youtube.com' || host === 'm.youtube.com') {
            // Уже embed-ссылка: youtube.com/embed/VIDEO_ID
            if (u.pathname.startsWith('/embed/')) {
                return url;
            }
            // Обычная ссылка: youtube.com/watch?v=VIDEO_ID
            const videoId = u.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
            // Ссылка вида youtube.com/shorts/VIDEO_ID
            const shortsMatch = u.pathname.match(/^\/shorts\/([^/]+)/);
            if (shortsMatch) {
                return `https://www.youtube.com/embed/${shortsMatch[1]}`;
            }
        }

        if (host === 'youtu.be') {
            // Короткая ссылка: youtu.be/VIDEO_ID
            const videoId = u.pathname.slice(1);
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // ---- Vimeo ----
        if (host === 'vimeo.com') {
            // Обычная ссылка: vimeo.com/391114036
            // Может быть вида vimeo.com/391114036/abcdef1234 (приватное видео с hash в пути)
            const parts = u.pathname.split('/').filter(Boolean);
            const videoId = parts[0];
            const hash = parts[1]; // приватный hash, если есть в пути

            if (videoId && /^\d+$/.test(videoId)) {
                const embed = `https://player.vimeo.com/video/${videoId}`;
                if (hash) {
                    return `${embed}?h=${hash}`;
                }
                // Если hash передали через query (?h=...), просто перенести его
                const hParam = u.searchParams.get('h');
                return hParam ? `${embed}?h=${hParam}` : embed;
            }
        }

        if (host === 'player.vimeo.com') {
            // Уже готовый embed
            return url;
        }
    } catch {
        // Невалидный URL — просто вернуть как есть, чтобы не падать
        return url;
    }

    return url;
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
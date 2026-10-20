import { createClient } from 'next-sanity';

const baseConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-15',
  /**
   * Без таймаута зависший запрос к Content Lake держал ISR-рендер бесконечно:
   * на stale-странице OpenNext обрывает ревалидацию по своему таймауту (было
   * 10 с в memory-очереди), страница остаётся устаревшей, а каждый посетитель
   * ждёт этот таймаут. Теперь неудачный запрос падает за 3 с и повторяется
   * один раз (худший случай ~6 с вместо 15 с) — рендер успевает завершиться
   * (геттеры в lib/sanity-data.ts
   * null-safe, поэтому страница отдаётся без части контента, а не висит).
   */
  timeout: 3_000,
  maxRetries: 1,
};

/**
 * НЕ СРОЧНЫЕ запросы (по умолчанию для сайта) — чтение через API CDN
 * (apicdn.sanity.io). На бесплатном плане квота: 1 000 000 CDN-запросов/мес
 * против 250 000 обычных API-запросов. Ответы отдаются из edge-кэша
 * (задержка — секунды), что достаточно, т.к. страницы и так обновляются
 * раз в 60 секунд (ISR `revalidate` в layout.tsx).
 *
 * Все публичные чтения контента (геттеры в lib/sanity-data.ts) идут сюда.
 */
export const client = createClient({ ...baseConfig, useCdn: true });

/**
 * СРОЧНЫЕ запросы — напрямую в Content Lake (api.sanity.io), всегда свежие
 * данные без кэша. Квота бесплатного плана — 250 000 запросов/мес,
 * поэтому применять только там, где задержка недопустима:
 * draft/preview-режим, данные «прямо сейчас» после публикации и т.п.
 */
export const liveClient = createClient({ ...baseConfig, useCdn: false });

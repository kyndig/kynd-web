import type { APIRoute } from 'astro';

/** Ensures the build has a server route so Astro Actions can register (Astro 6+). */
export const prerender = false;

export const GET: APIRoute = () => new Response('ok', { status: 200 });

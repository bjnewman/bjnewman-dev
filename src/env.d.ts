/// <reference types="astro/client" />

declare module 'astro:transitions/client' {
  export function navigate(href: string, options?: Record<string, unknown>): void;
}

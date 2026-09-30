import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Travel Atlas - AI Globe & Travel Planner',
    short_name: 'Travel Atlas',
    description: 'Explore o mundo em 3D e planeje viagens com o Travel Intelligence Engine & Llama local.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000010',
    theme_color: '#000010',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}

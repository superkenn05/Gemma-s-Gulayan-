
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: "Gemma's Gulayan",
    short_name: "Gemma's",
    description: "Online vegetable and fruit store delivering farm-fresh produce to your doorstep.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1b8a2e',
    icons: [
      {
        src: 'https://res.cloudinary.com/dzytzdamb/image/upload/v1773855923/ff300e344_1000010341_o2ss83.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://res.cloudinary.com/dzytzdamb/image/upload/v1773855923/ff300e344_1000010341_o2ss83.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}

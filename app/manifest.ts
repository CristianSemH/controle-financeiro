import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: 'Controle Financeiro',
        short_name: 'Financeiro',
        description: 'Sistema de controle financeiro pessoal',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#6366F1',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
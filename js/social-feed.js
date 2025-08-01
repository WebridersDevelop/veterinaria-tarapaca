// Social Media Feed Integration
// Veterinaria Tarapacá - Real Social Media Integration

class SocialFeedManager {
    constructor() {
        this.tiktokVideos = [];
        this.instagramPosts = [];
        this.init();
    }

    init() {
        this.loadTikTokEmbeds();
        this.loadInstagramEmbeds();
        this.setupAutoRefresh();
    }

    // OPCIÓN 1: Embeds Manuales (Más fácil)
    loadTikTokEmbeds() {
        // Lista de videos de TikTok para mostrar
        const tiktokVideos = [
            {
                url: 'https://www.tiktok.com/@veterinariatarapa/video/XXXXXXXXXXXXXXX',
                videoId: 'XXXXXXXXXXXXXXX',
                description: '5 señales de que tu mascota necesita atención veterinaria inmediata',
                date: 'Hace 2 días'
            },
            // Añadir más videos aquí
        ];

        this.renderTikTokVideos(tiktokVideos);
    }

    loadInstagramEmbeds() {
        // Lista de posts de Instagram para mostrar
        const instagramPosts = [
            {
                url: 'https://www.instagram.com/p/XXXXXXXXX/',
                postId: 'XXXXXXXXX',
                description: 'Luna ya está completamente recuperada después de su cirugía 😊',
                date: 'Hace 1 día'
            },
            // Añadir más posts aquí
        ];

        this.renderInstagramPosts(instagramPosts);
    }

    renderTikTokVideos(videos) {
        videos.forEach((video, index) => {
            const container = document.querySelector(`#tiktok-embed-${index}`);
            if (container) {
                container.innerHTML = `
                    <blockquote class="tiktok-embed" 
                               cite="${video.url}" 
                               data-video-id="${video.videoId}" 
                               style="max-width: 100%; min-width: 100%;">
                        <section>
                            <a target="_blank" 
                               title="@veterinariatarapa" 
                               href="${video.url}">
                                ${video.description}
                            </a>
                        </section>
                    </blockquote>
                `;
            }
        });
        
        // Cargar script de TikTok después de renderizar
        this.loadTikTokScript();
    }

    renderInstagramPosts(posts) {
        posts.forEach((post, index) => {
            const container = document.querySelector(`#instagram-embed-${index}`);
            if (container) {
                container.innerHTML = `
                    <blockquote class="instagram-media" 
                               data-instgrm-permalink="${post.url}" 
                               data-instgrm-version="14">
                        <div style="padding: 16px;">
                            <a href="${post.url}" target="_blank">
                                ${post.description}
                            </a>
                        </div>
                    </blockquote>
                `;
            }
        });
        
        // Cargar script de Instagram después de renderizar
        this.loadInstagramScript();
    }

    loadTikTokScript() {
        if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.tiktok.com/embed.js';
            document.head.appendChild(script);
        }
    }

    loadInstagramScript() {
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = '//www.instagram.com/embed.js';
            document.head.appendChild(script);
        }
    }

    // OPCIÓN 2: API Integration (Más avanzado)
    async fetchTikTokVideos() {
        // NOTA: TikTok no tiene API pública gratuita
        // Alternativas:
        // 1. Usar servicios como RapidAPI TikTok API
        // 2. Web scraping (no recomendado)
        // 3. Actualización manual

        try {
            // Ejemplo con RapidAPI (requiere key)
            const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/user/posts', {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'TU_API_KEY_AQUI',
                    'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
                }
            });
            
            const data = await response.json();
            return data.videos || [];
        } catch (error) {
            console.log('Error loading TikTok videos:', error);
            return [];
        }
    }

    async fetchInstagramPosts() {
        // Instagram Basic Display API
        // Requiere token de acceso
        
        try {
            const accessToken = 'TU_INSTAGRAM_ACCESS_TOKEN';
            const response = await fetch(
                `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${accessToken}`
            );
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.log('Error loading Instagram posts:', error);
            return [];
        }
    }

    // Auto-refresh cada 30 minutos
    setupAutoRefresh() {
        setInterval(() => {
            this.loadTikTokEmbeds();
            this.loadInstagramEmbeds();
        }, 30 * 60 * 1000); // 30 minutos
    }

    // OPCIÓN 3: Widget Integrado (Más simple)
    loadInstagramWidget() {
        // Usar servicios como Elfsight, SnapWidget, etc.
        const widgetContainer = document.querySelector('#instagram-widget');
        if (widgetContainer) {
            widgetContainer.innerHTML = `
                <!-- Ejemplo con SnapWidget -->
                <script src="https://snapwidget.com/js/snapwidget.js"></script>
                <iframe src="https://snapwidget.com/embed/WIDGET_ID" 
                        class="snapwidget-widget" 
                        allowtransparency="true" 
                        frameborder="0" 
                        scrolling="no" 
                        style="border:none; overflow:hidden; width:100%; height:400px;">
                </iframe>
            `;
        }
    }
}

// Inicializar cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    const socialFeed = new SocialFeedManager();
    
    // Exponer globalmente para debugging
    window.socialFeed = socialFeed;
});

// GUÍA DE IMPLEMENTACIÓN:

/* 
=== PASOS PARA INTEGRAR VIDEOS REALES ===

1. EMBEDS MANUALES (Recomendado para empezar):
   - Ve a tu video de TikTok
   - Copia el enlace (ej: https://www.tiktok.com/@veterinariatarapa/video/1234567890)
   - Reemplaza 'USERNAME' y 'VIDEO_ID' en el HTML
   - El embed se cargará automáticamente

2. INSTAGRAM POSTS:
   - Ve a tu post de Instagram
   - Copia el enlace (ej: https://www.instagram.com/p/ABC123/)
   - Reemplaza 'POST_ID' en el HTML
   - El embed se cargará automáticamente

3. APIs (Para actualización automática):
   - TikTok: Usar RapidAPI o similar (de pago)
   - Instagram: Instagram Basic Display API (gratis con límites)

4. WIDGETS DE TERCEROS (Más fácil):
   - SnapWidget para Instagram
   - Elfsight Social Media Feeds
   - Juicer.io

=== URLs DE EJEMPLO PARA PROBAR ===

TikTok:
- https://www.tiktok.com/@veterinariatarapa/video/1234567890

Instagram:
- https://www.instagram.com/p/ABC123DEF/

=== CONFIGURACIÓN RECOMENDADA ===

1. Crear cuentas @veterinariatarapa en ambas plataformas
2. Comenzar con embeds manuales
3. Actualizar URLs cada vez que publiques
4. Posteriormente implementar APIs si necesitas automatización

*/
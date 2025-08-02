# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a veterinary clinic website for "Clínica Veterinaria Tarapacá" built as a static website using HTML, CSS, and JavaScript. The site is a single-page application with modern design elements and social media integration.

## Project Structure

```
veterinaria tarapaca/
├── index.html                 # Main HTML file (single-page application)
├── css/
│   └── styles.css            # Custom CSS styles and animations
├── js/
│   ├── script.js             # Main JavaScript for navigation and interactions
│   └── social-feed.js        # Social media feed integration (TikTok/Instagram)
├── images/                   # Website images and logos
├── assets/                   # Additional graphic assets
└── README.md                 # Basic project documentation
```

## Technology Stack

- **Frontend Framework**: Vanilla HTML/CSS/JavaScript
- **CSS Framework**: Tailwind CSS (loaded via CDN)
- **Font**: Poppins from Google Fonts
- **Icons**: Font Awesome
- **Social Media**: TikTok and Instagram embed scripts

## Development Setup

This is a static website that can be served directly from any web server. No build process or package manager is required.

### Local Development
To run locally, simply open `index.html` in a browser or serve it using any static file server:
- Python: `python -m http.server 8000`
- Node.js: `npx serve .`
- Live Server (VS Code extension)

## Architecture

### Single Page Application
The website is structured as a single-page application with the following main sections:
- Header with navigation
- Hero section (#inicio)
- Services section (#servicios)
- Team section (#equipo)
- TikTok feed (#tiktok)
- Instagram feed (#instagram)
- Contact section (#contacto)

### CSS Architecture
- Custom CSS variables for brand colors (vet-orange, vet-brown, etc.)
- Tailwind utility classes for layout and styling
- Custom animations (float, fade-in-up) defined in styles.css
- Responsive design with mobile-first approach

### JavaScript Modules
- `script.js`: Handles mobile navigation, menu toggles, and smooth scrolling
- `social-feed.js`: Manages TikTok and Instagram feed integration using embeds

### Key Components
- **Navigation**: Fixed header with smooth scrolling navigation and mobile hamburger menu
- **Social Feed Manager**: Class-based approach for managing social media embeds
- **Responsive Design**: Mobile-first with custom breakpoints

## Customization Notes

### Brand Colors
- Primary Orange: `#ff9500` (vet-orange)
- Light Orange: `#ffb347` (vet-orange-light)
- Brown: `#8B4513` (vet-brown)
- Gray: `#f8f9fa` (vet-gray)

### Social Media Integration
The `SocialFeedManager` class in `social-feed.js` handles embedding TikTok videos and Instagram posts. Currently configured for manual embed management but includes API integration options.

## File Modification Guidelines

- **index.html**: Main content structure and sections
- **css/styles.css**: Custom animations and brand-specific styling
- **js/script.js**: Navigation behavior and interactive elements
- **js/social-feed.js**: Social media feed functionality

No build tools or transpilation required - all changes are immediately reflected when files are saved.

## Vercel Optimizations

This project has been optimized for deployment on Vercel with the following enhancements:

### Performance Optimizations
- **Resource Loading**: Critical CSS and fonts preloaded, non-critical resources loaded asynchronously
- **Lazy Loading**: Instagram embeds load only when the section becomes visible
- **JavaScript Optimization**: Scripts deferred and social media scripts loaded on-demand
- **Caching Headers**: Configured in `vercel.json` for optimal asset caching
- **GPU Acceleration**: Animations optimized with CSS transforms and will-change properties

### SEO Enhancements
- **Meta Tags**: Comprehensive Open Graph, Twitter Card, and SEO meta tags
- **Structured Data**: JSON-LD schema markup for local business
- **Sitemap**: XML sitemap with proper priorities and change frequencies
- **Robots.txt**: Search engine crawler directives
- **Canonical URLs**: Proper canonical link structure

### Security Headers
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection headers

### Accessibility Improvements
- **Reduced Motion**: Respects user preference for reduced motion
- **Image Optimization**: Proper alt attributes and lazy loading
- **Text Rendering**: Optimized font smoothing and legibility
- **Focus Management**: Proper keyboard navigation support

### Development Files
- **vercel.json**: Vercel deployment configuration with headers and caching
- **sitemap.xml**: Search engine sitemap
- **robots.txt**: Crawler directives
- **.gitignore**: Version control exclusions

### File Structure Updates
```
veterinaria tarapaca/
├── vercel.json              # Vercel configuration with error routing
├── sitemap.xml              # SEO sitemap with local optimization
├── robots.txt               # Crawler directives
├── .gitignore               # Git exclusions
├── 404.html                 # Custom 404 error page
├── 500.html                 # Custom server error page
├── 403.html                 # Custom access denied page
├── index.html               # Optimized main file with local SEO
├── css/styles.css           # Enhanced with performance optimizations
├── js/
│   ├── script.js           # Main navigation and interactions
│   └── social-feed.js      # Social media feed management
├── images/
│   ├── logo.png            # Main logo (preloaded)
│   ├── perfil2.jpg         # Professional photo
│   └── dragonfly-icon.png  # Favicon
├── assets/                 # Additional graphic assets
└── CLAUDE.md               # This documentation file
```

### Error Pages
Custom error pages have been created for better user experience:
- **404.html**: Page not found with helpful navigation
- **500.html**: Server error with contact information and auto-refresh
- **403.html**: Access denied with support contact options

### Error Page Features
- **Consistent Branding**: Match main site design and color scheme
- **Helpful Navigation**: Easy return to main site sections
- **Contact Information**: Direct phone/WhatsApp access for urgent needs
- **Auto-retry Logic**: Smart refresh mechanisms for server errors
- **Error Tracking**: Optional analytics integration for monitoring
- **Accessibility**: Reduced motion support and proper contrast

### Local SEO Optimizations

This project has been heavily optimized for local search in Iquique, Chile:

#### **Geographic Targeting**
- **Primary Location**: Iquique, Región de Tarapacá, Chile
- **GPS Coordinates**: -20.2208, -70.1431 (precise location)
- **Service Area**: 50km radius from Iquique
- **Address**: Avenida Salvador Allende #3638, Iquique

#### **Local Keywords Strategy**
- **Primary**: "veterinaria iquique", "veterinario iquique"
- **Secondary**: "clínica veterinaria iquique", "mascotas iquique"
- **Long-tail**: "dra javiera solis iquique", "emergencias veterinarias iquique"
- **Regional**: "veterinaria región tarapacá", "salvador allende iquique"

#### **Structured Data for Local Business**
- **Schema.org LocalBusiness** with complete contact information
- **Geographic coordinates** for map integration
- **Service area specification** covering Iquique region
- **Professional credentials** (Dra. Javiera Solis Larenas)
- **Opening hours specification** in structured format
- **Available services** with medical specialties

#### **Meta Tags Optimization**
- **Geo-targeting**: `geo.region="CL-TA"`, `geo.placename="Iquique, Chile"`
- **Business type**: Open Graph `business.business` schema
- **Location-rich descriptions** in title and meta descriptions
- **Local contact data** in structured format

#### **Content Localization**
- **Headers and navigation** include Iquique references
- **Service descriptions** mention local area
- **Contact information** emphasizes Chile location
- **Professional credentials** include geographic context

### Deployment Notes
- Site optimized for Vercel's Edge Network
- All assets cached with appropriate headers
- Social media embeds load efficiently
- Performance scores improved for Core Web Vitals
- Custom error handling configured in vercel.json
- Local SEO optimized for Iquique market penetration
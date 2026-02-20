/**
 * WebMCP - Agent Engine Optimization (AEO) Layer
 * Exposes the website capabilities to AI agents natively.
 * 
 * Protocol: W3C Model Context Protocol (WebMCP)
 * Version: 1.0.0 (Feb 2026)
 */

export class WebMCP {
  constructor() {
    this.isSupported = 'modelContext' in navigator;
    if (this.isSupported) {
      this.init();
    } else {
      Logger.debug('ℹ️ [WEBMCP] Protocol not supported by this browser. AEO fallback active (llms.txt + JSON-LD).');
    }
  }

  init() {
    Logger.debug('⚡ [WEBMCP] AEO Layer active. Synchronizing tools with browser...');
    
    try {
      navigator.modelContext.provideContext({
        tools: [
          /**
           * EXPLORAR GALERÍA
           * Permite a los agentes filtrar y buscar obras semánticamente.
           */
          {
            name: "explorarGaleria",
            description: "Filtrar y buscar obras de arte de Naroa por serie, técnica o año. Series disponibles: 'rocks', 'espejos-del-alma', 'tributos-musicales', 'enlatas', 'golden', 'retratos', 'naturaleza'.",
            inputSchema: {
              type: "object",
              properties: {
                categoria: { 
                  type: "string", 
                  enum: ["todos", "rocks", "espejos-del-alma", "tributos-musicales", "enlatas", "golden", "retratos", "naturaleza"],
                  description: "La serie o categoría de la obra"
                },
                tecnica: { type: "string", description: "Búsqueda por técnica (acrílico, óleo, mixta...)" }
              }
            },
            async execute({ categoria }) {
              if (window.Gallery) {
                window.Gallery.filterBy(categoria || 'todos');
                return { 
                  content: [{ 
                    type: "text", 
                    text: `Galería filtrada por: ${categoria || 'todos'}. El usuario ahora está viendo esta sección.` 
                  }] 
                };
              }
              return { content: [{ type: "text", text: "Error: Sistema de galería no disponible." }] };
            }
          },

          /**
           * INFO ARTISTA
           * Proporciona contexto biográfico rico a la IA.
           */
          {
            name: "infoArtista",
            description: "Obtener información biográfica, técnica y de contacto de Naroa Gutiérrez Gil.",
            async execute() {
              return {
                content: [{
                  type: "text",
                  text: "Naroa Gutiérrez Gil es una artista visual de Bilbao especializada en hiperrealismo POP. Su técnica distintiva es el acrílico sobre pizarra natural con mica mineral. Principales series: 'Rocks' (iconos de la música) y 'Espejos del Alma'. Trabaja principalmente por encargo para retratos personalizados."
                }]
              };
            }
          },

          /**
           * CONTACTAR
           * Permite a la IA guiar al usuario al cierre.
           */
          {
            name: "iniciarContacto",
            description: "Mover la vista del usuario a la sección de contacto para encargar un retrato.",
            async execute() {
              const contactView = document.getElementById('view-contacto');
              if (contactView) {
                contactView.scrollIntoView({ behavior: 'smooth' });
                return { content: [{ type: "text", text: "Sección de contacto mostrada al usuario." }] };
              }
              return { content: [{ type: "text", text: "No se pudo encontrar la sección de contacto." }] };
            }
          }
        ]
      });
    } catch (e) {
      Logger.warn('⚠️ [WEBMCP] Failed to register tools:', e);
    }
  }

  // Permite registrar herramientas dinámicas
  registerExtraTool(tool) {
    if (!this.isSupported) return;
    navigator.modelContext.registerTool(tool);
  }
}

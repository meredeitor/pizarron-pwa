📊 Pizarrón Operativo – PWA
PWA 100 % frontend para la captura, análisis y generación del reporte del Pizarrón Operativo, diseñada para uso en piso de producción y juntas operativas.
✅ Sin backend
✅ Sin Serenity
✅ Funciona offline
✅ Captura rápida vía Excel o formulario
✅ Reporte HTML imprimible
✅ Instalación como app (PWA)

🚀 Características principales


📥 Captura de información

Producción (por departamento y día)
Faltas
Calidad
Defectos
Arranques de producción
Paros / demoras
Incidentes de seguridad
Mantenimiento (incidencias + autónomo)
Avisos
Acuerdos



📊 Reporte automático

Producción + gráficas
Calidad + semáforo
Defectos por departamento
Arranques (minutos tarde, KPIs, gráficas)
Paros (peor día, acumulado, eventos, gráfica)
Mantenimiento (incidencias + % autónomo)
Avisos y acuerdos
✅ Cruz de Seguridad



📄 Impresión directa


📱 Instalable como app (PWA)



🧠 Arquitectura
La aplicación está dividida por responsabilidades para mantener el código limpio y escalable:
/pizarron-pwa
│
├── indice.html        # Captura de datos / Importación Excel
├── reporte.html       # Generación del reporte (solo lectura)
├── shared.js          # Estado global y utilidades compartidas
├── manifest.json      # Configuración PWA
├── service-worker.js  # Offline + cache
│
├── /icons
│   ├── icon-192.png
│   └── icon-512.png


🔄 Flujo de uso

Abrir indice.html
Capturar información manualmente o importar Excel
Guardar sesión (sessionStorage)
Abrir reporte.html
Visualizar reporte completo
Imprimir / Exportar a PDF
Cerrar (los datos son efímeros)


📥 Importación desde Excel
La PWA utiliza una plantilla estándar de Excel, con las siguientes hojas:

Producción
Faltas
Calidad
Defectos
Arranques
Paros
Incidentes
Mantenimiento
ManttoAutonomo
Avisos
Acuerdos

La importación se realiza con SheetJS y mapea directamente al estado interno.

📦 Estado y persistencia

El estado vive en memoria y se guarda en:
sessionStorage["pizarronData"]


No hay base de datos
No hay llamadas HTTP
Ideal para:

Tablets de piso
Uso temporal en juntas
Ambientes sin red




📱 Progressive Web App (PWA)
La app es completamente instalable:


manifest.json define:

Nombre
Colores
Iconos
Modo standalone



service-worker.js:

Cachea:

HTML
JS
Librerías CDN


Permite uso offline
Estrategia cache-first




🎨 Estilo visual

UI moderna, oscura, estilo industrial
Inspirada en:

Microsoft Teams
Power BI
Pizarrones físicos de planta


Optimizada para:

Pantalla chica (tablet)
Impresión A4




✅ Tecnologías utilizadas

HTML5
CSS3
JavaScript (Vanilla)
Chart.js (gráficas)
SheetJS (Excel)
Service Workers
Web App Manifest


⚠️ Consideraciones importantes

Los datos no se guardan permanentemente
Cada sesión es independiente
Se recomienda:

Exportar / imprimir el reporte al final
No cerrar la app antes de generar el reporte




🛠 Posibles mejoras futuras

Exportar reporte a PDF automáticamente
Históricos semanales (IndexedDB)
Firma de responsables
Modo pantalla TV
Control de versiones por semana
Validaciones avanzadas de Excel


👤 Autor / Uso interno
Proyecto desarrollado para uso operativo interno
Orientado a manufactura / operación / mejora continua.

✅ Pizarrón Operativo – PWA lista para producción
Si quieres, el siguiente paso puede ser:

✅ PDF offline
✅ Histórico semanal
✅ Modo TV
✅ Control de accesos


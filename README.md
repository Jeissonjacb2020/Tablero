# WideServices Dashboard

Tablero web para que los clientes de WideServices (plomería, electricidad, limpieza, mantenimiento) consulten el estado de sus solicitudes de servicio en tiempo real.

**Stack:** HTML semántico + CSS puro (BEM) + JavaScript Vanilla. Sin frameworks, sin dependencias, sin build step.

---

## Cómo ejecutar

No requiere instalación ni backend. Dos formas:

1. **Doble clic en `index.html`** — funciona directo desde el sistema de archivos.
2. **Servidor local** (recomendado para evitar restricciones de `file://` en algunos navegadores):
   ```bash
   cd wideservices
   python3 -m http.server 8080
   # abrir http://localhost:8080
   ```

Estructura de archivos:
```
├── README.md
├── index.html
├── css/
│   └── styles.css
└── js/
    └── script.js
└── diseno/
    └── Benchmark.pdf
    └── Decisiones_Diseno.pdf
    └── enlace-figma.txt
```
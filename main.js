/* ============================================================
   SOCIEDAD ITALIANA DE SOCORROS MUTUOS DE GÁLVEZ
   JavaScript Vanilla — Interactividad y validaciones
   ------------------------------------------------------------
   Índice de módulos:
   0) Utilidades compartidas
   1) Datos (regiones del mapa y novedades)
   2) Menú hamburguesa + submenú "Nosotros"
   3) Smooth scroll para enlaces ancla
   4) Componente "Antes y Después"
   5) Formulario de colaboración (validaciones)
   5b) Formulario "Tu experiencia en el Marconi" (foto + WhatsApp)
   6) Mapa interactivo de Italia
   7) Novedades de Italia (render dinámico)
   8) Inicialización
   ============================================================ */

   'use strict'; // Modo estricto: evita variables globales accidentales y otros errores silenciosos

   /* ============================================================
      0) UTILIDADES COMPARTIDAS
      ============================================================ */
   
   // Atajo para document.querySelector (acepta un contexto opcional)
   const $ = (selector, contexto = document) => contexto.querySelector(selector);
   
   // Atajo para document.querySelectorAll devolviendo un Array real
   const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));
   
   // Namespace necesario para crear elementos SVG con createElementNS
   const SVG_NS = 'http://www.w3.org/2000/svg';
   
   /**
    * Crea un elemento HTML con clase y texto opcionales.
    * Usa textContent (nunca innerHTML) para evitar inyección de código (XSS).
    */
   function crearElemento(etiqueta, clase = '', texto = '') {
     const el = document.createElement(etiqueta); // Creamos el nodo
     if (clase) el.className = clase;             // Asignamos clases si hay
     if (texto) el.textContent = texto;           // Asignamos texto seguro si hay
     return el;                                   // Devolvemos el nodo listo
   }
   
   /**
    * Escribe (o limpia) el mensaje de error bajo un campo.
    * Convención: el elemento de error tiene id "error-<idCampo>".
    * Devuelve true si NO hay error (útil para encadenar validaciones).
    */
   function mostrarError(idCampo, mensajeTexto) {
     const errorEl = document.getElementById('error-' + idCampo); // Buscamos el contenedor de error
     if (errorEl) errorEl.textContent = mensajeTexto || '';        // Escribimos o limpiamos el texto
     return !mensajeTexto;                                         // true = campo válido
   }
   
   /** Muestra un mensaje de éxito y lo oculta pasado un tiempo. */
   function mostrarExito(elemento, milisegundos = 5000) {
     if (!elemento) return;                                  // Si no existe, no hacemos nada
     elemento.hidden = false;                                // Lo hacemos visible
     setTimeout(() => { elemento.hidden = true; }, milisegundos); // Lo ocultamos luego
   }
   
   /** Lleva el foco al primer campo inválido de una lista de ids. */
   function enfocarPrimerError(ids) {
     const idConError = ids.find((id) => {
       const err = document.getElementById('error-' + id);   // Buscamos el error de cada campo
       return err && err.textContent;                         // El primero con texto es el inválido
     });
     if (idConError) document.getElementById(idConError)?.focus(); // Enfocamos el campo asociado
   }
   
   /* ============================================================
      1) DATOS
      ============================================================ */
   
   
   /**
    * Regiones del mapa (las 20 regiones de Italia). Cada objeto contiene:
    * - id: identificador único (usado en data-region)
    * - nombre: título accesible mostrado en el panel
    * - etiqueta: texto corto dibujado sobre el mapa (vacío = sin rótulo)
    * - fuente: tamaño del rótulo en unidades del viewBox
    * - d: trazado SVG con el contorno real de la región. Se proyectó desde
    *      latitud/longitud reales al viewBox 0 0 300 430 (proporción fiel de Italia)
    *      y las regiones vecinas comparten sus bordes exactos.
    * - centro: coordenadas {x, y} donde se dibuja la etiqueta
    * - historia: relato mostrado al seleccionar la región
    */
   const REGIONES = [
     {
       id: 'piamonte', nombre: 'Piemonte (Piamonte)', etiqueta: 'Piamonte', fuente: 6.5,
       link: "https://www.italia.it/es/piamonte",
       d: 'M56.3 79.0 L54.6 75.7 L52.1 70.7 L49.7 65.8 L48.4 62.5 L46.0 65.8 L43.5 69.1 L41.1 71.7 L39.8 75.7 L38.6 79.0 L36.2 81.3 L37.9 83.9 L36.2 89.5 L34.2 93.1 L31.2 94.8 L26.3 95.5 L21.4 96.1 L15.3 95.5 L17.0 98.8 L14.1 102.1 L12.8 105.4 L8.6 108.7 L7.2 113.6 L8.6 116.9 L11.6 121.9 L11.6 127.8 L13.6 131.8 L16.5 136.0 L22.6 140.7 L27.8 140.0 L28.8 141.7 L31.2 142.3 L34.9 141.0 L38.6 139.7 L42.3 136.7 L44.8 133.4 L50.9 128.5 L54.6 127.5 L58.3 126.1 L61.9 125.8 L65.6 126.1 L67.4 125.8 L66.9 124.5 L67.4 122.8 L65.1 120.2 L63.2 117.6 L62.7 115.3 L62.7 112.0 L57.0 110.6 L52.6 109.6 L52.9 107.0 L55.8 103.0 L59.5 101.1 L58.3 97.8 L55.8 93.8 L54.8 88.9 L53.4 85.6 L53.8 82.3 Z',
       centro: { x: 37, y: 110 },
       historia: 'Fue el principal origen de los inmigrantes italianos que llegaron a Gálvez y a gran parte de las colonias agrícolas de Santa Fe. Su huella fue decisiva en el trabajo rural, el comercio, los molinos y la formación de instituciones como la Sociedad Italiana de Socorros Mutuos. También dejaron una marca profunda en Esperanza, San Carlos, Rafaela, Humberto Primo, Franck y San José, núcleos de la llamada Pampa Gringa.'
     },
     {
       id: 'valle-aosta', nombre: "Valle d'Aosta (Valle de Aosta)", etiqueta: 'Aosta', fuente: 4.8,
       link: "https://www.italia.it/es/valle-de-aosta",
       d: 'M36.2 81.3 L37.9 83.9 L36.2 89.5 L34.2 93.1 L31.2 94.8 L26.3 95.5 L21.4 96.1 L15.3 95.5 L12.8 93.8 L11.1 89.5 L10.4 87.2 L10.9 84.6 L15.3 81.6 L18.2 83.2 L20.2 81.3 L23.9 80.6 L30.3 79.6 L33.7 81.6 Z',
       centro: { x: 24, y: 88 },
       historia: 'Debido a su tamaño reducido, el Valle de Aosta tuvo un flujo migratorio menor hacia Argentina. Los valdostanos que llegaron se integraron a las comunidades italianas del Litoral, principalmente en Esperanza, San Carlos, Rafaela y la ciudad de Santa Fe, a través del trabajo rural, los oficios y las redes familiares.'
     },
     {
       id: 'lombardia', nombre: 'Lombardia (Lombardía)', etiqueta: 'Lombardia', fuente: 6.5,
       link: "https://www.italia.it/es/lombardia", 
       d: 'M99.3 61.5 L96.3 58.5 L91.4 57.8 L89.0 62.5 L89.0 69.1 L84.1 66.8 L80.4 69.1 L75.5 65.1 L70.5 62.5 L68.6 69.1 L66.9 74.0 L64.4 79.0 L62.4 83.9 L60.7 82.3 L58.3 79.9 L56.3 79.0 L53.8 82.3 L53.4 85.6 L54.8 88.9 L55.8 93.8 L58.3 97.8 L59.5 101.1 L55.8 103.0 L52.9 107.0 L52.6 109.6 L57.0 110.6 L62.7 112.0 L62.7 115.3 L63.2 117.6 L65.1 120.2 L67.4 122.8 L70.5 121.2 L72.5 116.9 L73.0 112.6 L72.5 109.6 L79.9 111.0 L87.7 109.3 L93.9 110.3 L98.1 112.9 L101.2 114.6 L106.2 113.6 L109.8 112.0 L114.8 111.0 L119.2 112.3 L117.2 107.0 L112.3 103.7 L107.9 102.1 L105.4 99.8 L104.9 97.1 L105.4 92.2 L106.9 85.6 L103.7 83.9 L100.0 80.6 L100.0 75.7 L102.0 70.0 L101.2 65.8 Z',
       centro: { x: 82, y: 91 },
       historia: 'Junto con los piamonteses, fue uno de los orígenes más importantes de los primeros inmigrantes de Gálvez. Los lombardos participaron del desarrollo agrícola y comercial de la ciudad, y su presencia también fue relevante en San Carlos, Esperanza, Rafaela y la ciudad de Santa Fe, donde contribuyeron con oficios, comercio y trabajo comunitario.'
     },
     {
       id: 'trentino', nombre: 'Trentino-Alto Adige (Trentino-Alto Adigio)', etiqueta: 'Trentino', fuente: 5.5,
       link: "https://www.italia.it/es/trentino",
       d: 'M106.9 85.6 L111.1 88.2 L113.5 89.8 L117.2 87.2 L119.7 83.2 L123.4 80.6 L127.0 77.3 L130.7 74.0 L133.2 69.1 L135.6 65.1 L139.3 61.8 L144.2 58.5 L147.4 55.9 L145.5 50.9 L141.8 43.0 L138.1 46.0 L132.0 46.6 L124.6 46.0 L117.2 46.9 L112.3 52.6 L107.4 52.6 L102.5 50.9 L99.3 50.2 L98.1 55.9 L99.3 61.5 L101.2 65.8 L102.0 70.0 L100.0 75.7 L100.0 80.6 L103.7 83.9 Z',
       centro: { x: 120, y: 64 },
       historia: 'Los trentinos y altoatesinos llegaron junto a otros migrantes del norte italiano, atraídos por las colonias agrícolas y el trabajo en el Litoral. Se radicaron en localidades como Reconquista, Avellaneda, Rafaela, Armstrong y Las Rosas, integrándose al trabajo rural y a los oficios urbanos.'
     },
     {
       id: 'veneto', nombre: 'Veneto (Véneto)', etiqueta: 'Veneto', fuente: 6.5,
       link: "https://www.italia.it/es/veneto",
       d: 'M146.7 118.6 L149.1 116.9 L150.4 113.6 L147.9 110.3 L145.0 108.0 L144.2 103.7 L145.5 100.4 L147.9 98.1 L150.4 96.4 L152.8 94.8 L156.5 93.1 L160.2 91.5 L163.4 90.8 L160.2 88.9 L154.1 85.6 L149.1 82.3 L145.5 79.9 L146.7 74.0 L149.1 69.1 L151.6 64.1 L154.5 57.8 L151.6 56.5 L147.4 55.9 L144.2 58.5 L139.3 61.8 L135.6 65.1 L133.2 69.1 L130.7 74.0 L127.0 77.3 L123.4 80.6 L119.7 83.2 L117.2 87.2 L113.5 89.8 L111.1 88.2 L106.9 85.6 L105.4 92.2 L104.9 97.1 L105.4 99.8 L107.9 102.1 L112.3 103.7 L117.2 107.0 L119.2 112.3 L124.6 112.9 L130.7 112.9 L134.4 112.9 L139.3 113.6 L143.5 115.9 Z',
       centro: { x: 134, y: 91 },
       historia: 'Los vénetos fueron uno de los grandes grupos de la inmigración italiana en el Litoral argentino. Se radicaron en zonas rurales y urbanas de Santa Fe, con presencia en Rosario, la capital provincial y diversas colonias de la Pampa Gringa, donde aportaron al trabajo agrícola, los oficios y la vida comunitaria.'
     },
     {
       id: 'friuli', nombre: 'Friuli-Venezia Giulia (Friuli-Venecia Julia)', etiqueta: 'Friuli', fuente: 6,
       link: "https://www.italia.it/es/friuli-venecia-julia",
       d: 'M163.4 90.8 L165.1 89.5 L167.6 88.9 L170.8 89.5 L173.7 88.2 L174.9 86.2 L176.7 86.5 L178.6 88.2 L180.1 90.2 L180.6 92.5 L183.5 91.2 L183.0 88.9 L180.6 86.9 L177.4 84.6 L176.7 81.6 L176.7 79.0 L174.9 74.0 L173.7 71.7 L174.9 67.4 L176.7 64.1 L179.1 61.8 L177.4 60.5 L172.5 59.8 L166.3 59.2 L161.4 58.5 L157.7 58.5 L154.5 57.8 L151.6 64.1 L149.1 69.1 L146.7 74.0 L145.5 79.9 L149.1 82.3 L154.1 85.6 L160.2 88.9 Z',
       centro: { x: 163, y: 74 },
       historia: 'Los friulanos fundaron la Colonia La Estrella de Italia, cerca de Reconquista, y poblaron localidades del norte santafesino como Avellaneda, Reconquista, Malabrigo, Ocampo y Villa Ocampo. Más tarde formaron una comunidad activa en la ciudad de Santa Fe, con fuerte presencia en la construcción, el ferrocarril y el puerto.'
     },
     {
       id: 'liguria', nombre: 'Liguria', etiqueta: 'Liguria', fuente: 5,
       link: "https://www.italia.it/es/liguria",
       d: 'M27.1 151.9 L30.0 151.6 L33.2 150.9 L36.2 149.9 L39.4 148.9 L41.6 146.6 L44.0 143.3 L46.0 140.0 L48.4 136.7 L50.4 134.7 L53.4 132.8 L57.0 131.8 L61.5 131.4 L64.4 131.8 L66.9 133.4 L68.3 134.7 L69.3 133.7 L71.3 134.4 L73.5 136.0 L76.7 137.7 L79.1 140.3 L80.9 141.7 L83.8 143.3 L87.0 143.3 L88.2 143.6 L86.5 141.0 L85.3 138.4 L83.6 135.1 L82.8 131.1 L80.9 130.1 L77.9 130.8 L74.2 129.4 L70.5 127.8 L67.4 125.8 L65.6 126.1 L61.9 125.8 L58.3 126.1 L54.6 127.5 L50.9 128.5 L47.9 130.1 L44.8 133.4 L42.3 136.7 L38.6 139.7 L34.9 141.0 L31.2 142.3 L30.0 143.6 L28.8 145.6 L27.8 148.9 Z',
       centro: { x: 62, y: 141 },
       historia: 'Los ligures, especialmente los genoveses, tuvieron una fuerte presencia en Rosario y en la ciudad de Santa Fe, vinculados al puerto, la navegación, el comercio y los oficios urbanos. También participaron del crecimiento comercial de pueblos y ciudades del Litoral santafesino.'
     },
     {
       id: 'emilia', nombre: 'Emilia-Romagna (Emilia-Romaña)', etiqueta: 'Emilia-Romagna', fuente: 5.5,
       link: "https://www.italia.it/es/emilia-romana",
       d: 'M155.5 146.3 L152.8 145.0 L150.9 143.0 L148.7 141.0 L146.7 138.4 L145.5 136.0 L144.2 133.4 L143.7 130.1 L143.0 126.8 L143.0 123.5 L143.0 120.2 L146.7 118.6 L143.5 115.9 L139.3 113.6 L134.4 112.9 L130.7 112.9 L124.6 112.9 L119.2 112.3 L114.8 111.0 L109.8 112.0 L106.2 113.6 L101.2 114.6 L98.1 112.9 L93.9 110.3 L87.7 109.3 L79.9 111.0 L72.5 109.6 L73.0 112.6 L72.5 116.9 L70.5 121.2 L67.4 122.8 L66.9 124.5 L67.4 125.8 L70.5 127.8 L74.2 129.4 L77.9 130.8 L80.9 130.1 L82.8 131.1 L86.5 131.8 L90.2 134.1 L93.9 135.7 L98.8 137.7 L103.7 139.0 L108.6 141.0 L113.5 141.7 L119.7 141.7 L124.6 143.3 L129.5 146.6 L133.2 148.9 L136.9 151.6 L141.8 152.5 L144.2 151.6 L146.7 149.6 L149.1 148.3 L152.1 147.3 Z',
       centro: { x: 113, y: 127 },
       historia: 'Los emilianos y romañolos llegaron a las colonias y ciudades del Litoral buscando trabajo y nuevas oportunidades. Se radicaron en Rosario, la ciudad de Santa Fe y pueblos agrícolas del interior, participando del campo, la construcción, la alimentación y el comercio.'
     },
     {
       id: 'toscana', nombre: 'Toscana', etiqueta: 'Toscana', fuente: 6.5,
       link: "https://www.italia.it/es/toscana",
       d: 'M88.2 143.6 L90.2 146.6 L92.7 148.9 L93.4 151.6 L94.4 155.5 L95.1 159.8 L97.6 164.8 L99.5 168.1 L100.8 174.7 L101.2 180.3 L106.4 180.6 L105.9 184.6 L109.4 185.9 L111.6 188.5 L115.5 192.8 L115.2 197.8 L119.7 197.8 L124.6 198.8 L127.0 196.1 L128.3 192.8 L130.0 189.5 L133.2 187.2 L136.4 185.2 L136.1 181.3 L136.4 178.0 L138.1 174.7 L140.5 172.0 L143.0 168.7 L143.7 164.8 L146.7 161.5 L147.2 158.8 L145.5 155.5 L141.8 152.5 L136.9 151.6 L133.2 148.9 L129.5 146.6 L124.6 143.3 L119.7 141.7 L113.5 141.7 L108.6 141.0 L103.7 139.0 L98.8 137.7 L93.9 135.7 L90.2 134.1 L86.5 131.8 L82.8 131.1 L83.6 135.1 L85.3 138.4 L86.5 141.0 Z',
       centro: { x: 117, y: 164 },
       historia: 'La emigración toscana fue más diversificada y, en muchos casos, de destino urbano. Los toscanos participaron del comercio, la artesanía y la vida asociativa de Rosario y la ciudad de Santa Fe, además de pueblos del interior provincial.'
     },
     {
       id: 'umbria', nombre: 'Umbria (Umbría)', etiqueta: 'Umbria', fuente: 5.5,
       link: "https://www.italia.it/es/umbria",
       d: 'M136.4 185.2 L136.1 181.3 L136.4 178.0 L138.1 174.7 L140.5 172.0 L143.0 168.7 L143.7 164.8 L146.7 161.5 L150.4 164.1 L154.1 165.4 L157.7 169.7 L160.2 173.0 L163.4 178.0 L164.4 181.3 L166.3 184.6 L163.9 187.2 L161.4 190.5 L157.7 194.5 L153.6 196.1 L149.6 197.1 L147.2 194.5 L145.5 190.5 L140.5 188.5 Z',
       centro: { x: 151, y: 180 },
       historia: 'Los umbros llegaron especialmente durante las grandes olas migratorias de fines del siglo XIX y comienzos del XX. Se radicaron en Rosario, la ciudad de Santa Fe y localidades rurales del Litoral, incorporándose al trabajo rural, los oficios y el comercio.'
     },
     {
       id: 'marcas', nombre: 'Marche (Marcas)', etiqueta: 'Marche', fuente: 5.5,
       link: "https://www.italia.it/es/marcas",
       d: 'M183.5 181.3 L183.0 179.6 L181.1 172.0 L179.4 168.1 L177.4 163.1 L176.7 159.8 L173.7 157.5 L170.0 156.5 L166.8 154.2 L161.9 150.2 L159.2 147.9 L155.5 146.3 L152.1 147.3 L149.1 148.3 L146.7 149.6 L144.2 151.6 L141.8 152.5 L145.5 155.5 L147.2 158.8 L146.7 161.5 L150.4 164.1 L154.1 165.4 L157.7 169.7 L160.2 173.0 L163.4 178.0 L164.4 181.3 L166.3 184.6 L167.6 186.2 L168.8 187.9 L172.5 185.5 L176.2 183.9 L179.8 182.2 Z',
       centro: { x: 165, y: 166 },
       historia: 'Los marchigianos formaron parte de la migración del centro de Italia hacia Argentina. Se radicaron en Rosario, la capital provincial y colonias agrícolas santafesinas, trabajando en el campo y en oficios urbanos.'
     },
     {
       id: 'lazio', nombre: 'Lazio (Lacio)', etiqueta: 'Lazio', fuente: 6,
       link: "https://www.italia.it/es/lacio",
       d: 'M124.6 198.8 L127.0 199.4 L129.5 204.4 L131.7 208.0 L135.6 211.0 L138.6 212.6 L142.5 218.5 L144.2 219.9 L147.7 224.2 L151.6 228.4 L154.1 229.8 L157.7 232.4 L161.4 235.7 L162.7 236.4 L166.3 235.0 L168.8 234.1 L172.0 235.7 L175.4 237.4 L177.4 237.4 L179.8 237.4 L180.6 235.7 L183.0 234.1 L184.8 230.8 L186.0 227.5 L186.0 224.2 L185.3 220.2 L181.1 220.2 L176.7 218.2 L173.7 215.9 L168.8 213.6 L163.9 211.0 L163.9 207.0 L167.6 202.7 L168.3 197.8 L170.0 192.8 L168.8 187.9 L167.6 186.2 L166.3 184.6 L163.9 187.2 L161.4 190.5 L157.7 194.5 L153.6 196.1 L149.6 197.1 L147.2 194.5 L145.5 190.5 L140.5 188.5 L136.4 185.2 L133.2 187.2 L130.0 189.5 L128.3 192.8 L127.0 196.1 Z',
       centro: { x: 156, y: 212 },
       historia: 'La inmigración del Lacio se concentró más en las ciudades, con participación en el comercio, la artesanía y los servicios. Su presencia fue especialmente visible en Rosario y en la ciudad de Santa Fe.'
     },
     {
       id: 'abruzzo', nombre: 'Abruzzo (Abruzos)', etiqueta: 'Abruzzo', fuente: 5.5,
       link: "https://www.italia.it/es/abruzos",
       d: 'M205.1 207.7 L203.7 207.0 L199.5 204.4 L197.0 201.1 L195.8 199.4 L191.4 195.8 L188.4 192.8 L185.3 186.2 L183.5 181.3 L179.8 182.2 L176.2 183.9 L172.5 185.5 L168.8 187.9 L170.0 192.8 L168.3 197.8 L167.6 202.7 L163.9 207.0 L163.9 211.0 L168.8 213.6 L173.7 215.9 L176.7 218.2 L181.1 220.2 L185.3 220.2 L188.4 220.2 L190.9 218.2 L194.6 214.9 L197.0 211.9 L199.5 211.0 L202.0 209.0 Z',
       centro: { x: 182, y: 203 },
       historia: 'Los abruceses llegaron principalmente durante la gran migración del sur y centro-sur italiano. Se radicaron en Rosario, la ciudad de Santa Fe y pueblos del Litoral, incorporándose al trabajo rural, la construcción y los oficios.'
     },
     {
       id: 'molise', nombre: 'Molise', etiqueta: 'Molise', fuente: 5.5,
       link: "https://www.italia.it/es/molise",
       d: 'M213.0 213.3 L211.3 212.6 L210.3 211.0 L206.9 208.6 L205.1 207.7 L202.0 209.0 L199.5 211.0 L197.0 211.9 L194.6 214.9 L190.9 218.2 L188.4 220.2 L185.3 220.2 L186.0 224.2 L186.0 227.5 L190.9 229.1 L197.0 230.8 L203.2 231.8 L206.9 230.1 L209.8 227.5 L210.6 225.8 L210.6 222.5 L213.0 217.6 Z',
       centro: { x: 201, y: 221 },
       historia: 'Los molisanos compartieron el destino de muchas familias del sur italiano que buscaron en Argentina trabajo y estabilidad. Se radicaron en Rosario, Santa Fe y zonas rurales de la provincia, integrándose a las comunidades italianas locales.'
     },
     {
       id: 'campania', nombre: 'Campania', etiqueta: 'Campania', fuente: 5.5,
       link: "https://www.italia.it/es/campania",
       d: 'M179.8 237.4 L183.0 240.7 L185.5 243.3 L187.2 247.3 L188.0 251.2 L188.9 249.9 L192.1 249.2 L194.6 250.6 L197.0 252.2 L197.8 254.5 L195.8 256.5 L194.1 258.1 L197.0 256.5 L200.7 256.2 L204.4 254.8 L206.9 256.2 L209.3 260.5 L210.6 263.1 L210.1 267.1 L208.1 268.7 L210.6 271.0 L213.5 273.7 L217.4 276.0 L219.9 277.0 L222.8 276.0 L224.1 275.0 L226.0 274.6 L226.8 275.6 L227.7 273.0 L228.2 270.4 L226.5 267.1 L224.8 261.8 L221.6 257.2 L220.4 252.2 L221.6 248.9 L224.1 244.3 L222.8 243.0 L220.4 241.6 L217.9 239.7 L215.5 237.4 L213.0 234.1 L211.8 230.8 L209.8 227.5 L206.9 230.1 L203.2 231.8 L197.0 230.8 L190.9 229.1 L186.0 227.5 L184.8 230.8 L183.0 234.1 L180.6 235.7 Z',
       centro: { x: 207, y: 249 },
       historia: 'Los campanos, especialmente los napolitanos, fueron uno de los grupos más numerosos de la emigración italiana posterior. Se establecieron en Rosario y la ciudad de Santa Fe, donde participaron del comercio, la gastronomía, los oficios y las sociedades italianas.'
     },
     {
       id: 'puglia', nombre: 'Puglia (Apulia)', etiqueta: 'Puglia', fuente: 6,
       link: "https://www.italia.it/es/apulia",
       d: 'M256.5 263.1 L260.9 262.1 L265.3 261.4 L269.5 263.8 L274.4 267.1 L278.1 267.7 L281.8 268.7 L284.2 272.0 L284.0 275.0 L286.7 277.9 L289.2 281.2 L293.1 283.6 L294.6 278.6 L295.3 275.3 L296.5 272.0 L295.3 268.7 L292.8 263.8 L289.2 260.5 L285.5 258.1 L283.0 255.5 L279.3 252.2 L272.0 249.6 L267.0 245.6 L264.6 244.0 L259.7 240.7 L256.5 239.7 L252.3 238.3 L248.6 237.4 L244.9 234.7 L242.0 233.4 L238.8 231.4 L235.1 227.5 L233.1 223.2 L236.3 220.9 L239.5 214.9 L237.6 213.3 L235.1 212.6 L232.2 213.3 L227.7 213.3 L222.8 213.6 L219.1 213.6 L215.5 213.3 L213.0 213.3 L213.0 217.6 L210.6 222.5 L210.6 225.8 L209.8 227.5 L211.8 230.8 L213.0 234.1 L215.5 237.4 L217.9 239.7 L220.4 241.6 L222.8 243.0 L224.1 244.3 L229.0 243.3 L233.9 244.0 L237.6 246.3 L241.3 249.9 L244.9 251.2 L248.6 251.9 L252.3 255.2 L253.0 258.8 L254.8 260.5 Z',
       centro: { x: 249, y: 244 },
       historia: 'Los apulios llegaron masivamente durante el siglo XX, impulsados por la pobreza rural y la búsqueda de oportunidades. Se radicaron en el Litoral, especialmente en Rosario y Santa Fe, además de pueblos y colonias agrícolas del interior.'
     },
     {
       id: 'basilicata', nombre: 'Basilicata', etiqueta: 'Basilicata', fuente: 5,
       link: "https://www.italia.it/es/basilicata",
       d: 'M226.8 275.6 L228.0 277.3 L229.2 278.9 L232.2 279.3 L236.3 279.3 L240.0 277.9 L243.7 276.3 L247.4 275.3 L251.1 272.7 L252.3 270.4 L254.3 267.1 L255.5 264.4 L256.5 263.1 L254.8 260.5 L253.0 258.8 L252.3 255.2 L248.6 251.9 L244.9 251.2 L241.3 249.9 L237.6 246.3 L233.9 244.0 L229.0 243.3 L224.1 244.3 L221.6 248.9 L220.4 252.2 L221.6 257.2 L224.8 261.8 L226.5 267.1 L228.2 270.4 L227.7 273.0 Z',
       centro: { x: 235, y: 260 },
       historia: 'La emigración de Basilicata estuvo marcada por la pobreza rural y la falta de oportunidades. Sus migrantes buscaron trabajo en el Litoral argentino, con presencia en Rosario, Santa Fe y localidades agrícolas santafesinas.'
     },
     {
       id: 'calabria', nombre: 'Calabria', etiqueta: 'Calabria', fuente: 5.2,
       link: "https://www.italia.it/es/calabria",
       d: 'M229.2 278.9 L230.0 282.9 L230.2 286.9 L232.2 290.2 L233.9 293.5 L235.9 298.1 L236.8 303.4 L238.1 306.7 L240.0 310.0 L240.0 313.3 L238.8 317.2 L236.3 319.9 L232.7 320.8 L230.9 322.5 L232.7 324.8 L232.2 328.1 L230.7 330.8 L228.2 334.7 L226.3 335.7 L226.5 339.7 L227.0 343.6 L229.7 345.3 L233.1 345.3 L236.6 345.6 L240.0 339.7 L241.7 335.0 L244.9 332.4 L247.9 328.1 L248.6 320.2 L250.3 315.9 L253.5 312.6 L257.2 312.3 L260.2 313.3 L262.1 312.6 L264.6 309.3 L262.9 307.3 L263.1 301.7 L262.9 297.8 L259.7 294.4 L256.0 291.8 L250.6 290.2 L247.4 286.2 L247.9 281.9 L249.9 278.6 L251.1 275.3 L251.1 272.7 L247.4 275.3 L243.7 276.3 L240.0 277.9 L236.3 279.3 L232.2 279.3 Z',
       centro: { x: 249, y: 300 },
       historia: 'Los calabreses fueron uno de los grandes grupos de la inmigración italiana en Argentina. Se radicaron de forma destacada en Rosario y la ciudad de Santa Fe, además de otras localidades del Litoral, participando del trabajo rural, los oficios, el comercio y las instituciones de ayuda mutua.'
     },
     {
       id: 'sicilia', nombre: 'Sicilia', etiqueta: 'Sicilia', fuente: 6.5,
       link: "https://www.italia.it/es/sicilia",
       d: 'M226.5 334.0 L221.6 334.0 L216.7 333.7 L213.0 336.4 L208.1 337.0 L204.4 337.7 L198.3 341.3 L193.4 342.0 L186.5 341.6 L182.3 341.3 L178.6 343.0 L173.7 339.7 L170.3 339.0 L169.0 336.4 L165.1 338.0 L161.4 340.3 L158.5 342.0 L155.3 339.7 L154.8 337.0 L150.4 339.7 L149.1 342.3 L147.9 346.3 L147.4 349.6 L149.1 352.9 L151.4 354.5 L156.5 356.8 L163.4 359.5 L168.8 360.1 L174.2 366.7 L179.8 369.4 L184.3 372.7 L192.1 373.6 L198.3 379.3 L206.9 384.9 L210.6 385.9 L214.0 386.2 L216.7 380.9 L217.9 373.6 L216.0 368.4 L214.2 362.8 L212.8 359.5 L214.2 354.5 L215.5 349.6 L217.4 346.3 L220.4 343.0 L224.1 336.7 Z',
       centro: { x: 190, y: 356 },
       historia: 'Los sicilianos, especialmente los de la provincia de Catania, llegaron en gran número durante el siglo XX y se radicaron preferentemente en el Litoral. Rosario y la ciudad de Santa Fe fueron destinos principales, junto con pueblos y colonias agrícolas del interior provincial.'
     },
     {
       id: 'cerdena', nombre: 'Sardegna (Cerdeña)', etiqueta: 'Sardegna', fuente: 6.5,
       link: "https://www.italia.it/es/cerdena",
       d: 'M66.9 236.0 L72.5 238.0 L76.7 242.3 L76.7 247.3 L79.1 252.2 L82.3 257.2 L83.6 259.5 L81.6 263.8 L80.4 268.7 L80.4 273.7 L80.4 279.3 L79.1 286.9 L78.7 293.5 L78.4 300.1 L75.5 303.4 L70.5 304.3 L66.1 303.4 L61.9 306.7 L59.5 311.6 L59.5 313.9 L54.6 314.2 L52.1 311.6 L48.4 310.0 L48.4 305.0 L47.9 295.1 L49.7 288.5 L49.7 285.2 L50.9 280.9 L48.4 276.0 L49.7 270.4 L50.2 267.1 L47.2 262.1 L46.0 258.1 L42.5 258.5 L43.5 252.2 L44.0 245.6 L48.4 249.2 L52.1 248.9 L55.8 246.9 L60.7 245.6 L64.4 240.7 Z',
       centro: { x: 64, y: 274 },
       historia: 'Cerdeña fue una de las regiones con menor flujo migratorio hacia Argentina. Los sardos que llegaron se integraron a las comunidades italianas de Rosario, Santa Fe y pueblos del interior, principalmente mediante el trabajo, las redes familiares y las asociaciones de socorros mutuos.'
     }
   ];
   /**
    * Novedades. "tag" es el modificador CSS de la etiqueta (vacío = verde base).
    */
   const NOVEDADES = [
     { id: 'actualidad', tag: '', etiqueta: 'Actualidad', titulo: 'Italia hoy',
       texto: 'Un resumen de las noticias más relevantes de Italia, seleccionadas para la comunidad italo-argentina.',
       enlace: 'Leer más', aria: 'Leer más sobre Italia hoy',
       url: 'https://www.corriere.it/' },
     { id: 'consulado', tag: 'tag--consulado', etiqueta: 'Consulado', titulo: 'Novedades del Consulado',
       texto: 'Turnos, ciudadanía, documentación y avisos oficiales para quienes gestionan trámites.',
       enlace: 'Leer más', aria: 'Leer más sobre las novedades del Consulado',
       url: 'https://consrosario.esteri.it/es/' },
     { id: 'cultura', tag: 'tag--cultura', etiqueta: 'Cultura', titulo: 'Cultura e italianidad',
       texto: 'Festividades, música, cine y tradiciones que mantienen vivo nuestro vínculo con Italia.',
       enlace: 'Leer más', aria: 'Leer más sobre cultura e italianidad',
       url: 'https://www.raicultura.it' },
     { id: 'recetas', tag: 'tag--recetas', etiqueta: 'Recetas', titulo: 'Recetas Italianas',
       texto: 'Tradiciones culinarias de la comida italiana que pasaron de generación en generación en nuestra comunidad.',
       enlace: 'Ver recetas', aria: 'Ver las recetas de la comunidad',
       url: 'https://www.giallozafferano.es/' }
   ];
   
   /* ============================================================
      2) MENÚ HAMBURGUESA + SUBMENÚ "NOSOTROS"
      ============================================================ */
   
   function initMenuHamburguesa() {
     const menuToggle = document.getElementById('menuToggle');       // Botón hamburguesa
     const menuPrincipal = document.getElementById('menuPrincipal'); // Lista del menú
     if (!menuToggle || !menuPrincipal) return;                      // Salimos si falta alguno
   
     // Alterna la clase "is-open" y sincroniza aria-expanded / aria-label
     menuToggle.addEventListener('click', () => {
       const abierto = menuPrincipal.classList.toggle('is-open');
       menuToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
       menuToggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
     });
   
     // Cierra el menú al elegir cualquier enlace (útil en móvil)
     $$('a', menuPrincipal).forEach((enlace) => {
       enlace.addEventListener('click', () => {
         menuPrincipal.classList.remove('is-open');
         menuToggle.setAttribute('aria-expanded', 'false');
         menuToggle.setAttribute('aria-label', 'Abrir menú');
       });
     });
   }
   
   function initSubmenuNosotros() {
     const boton = document.getElementById('btnNosotros');        // Botón "Nosotros"
     const submenu = document.getElementById('submenuNosotros');  // Lista desplegable
     if (!boton || !submenu) return;
   
     // Abre o cierra el submenú manteniendo aria-expanded y el atributo hidden
     const alternar = (abrir) => {
       boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
       submenu.hidden = !abrir;
     };
   
     // Clic en el botón: invierte el estado actual
     boton.addEventListener('click', () => alternar(boton.getAttribute('aria-expanded') !== 'true'));
   
     // Escape: cierra y devuelve el foco al botón
     document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape' && !submenu.hidden) { alternar(false); boton.focus(); }
     });
   
     // Clic fuera del menú: lo cierra
     document.addEventListener('click', (e) => {
       if (!e.target.closest('.navbar__item--dropdown')) alternar(false);
     });
   
     // Elegir un enlace del submenú: lo cierra
     submenu.addEventListener('click', (e) => {
       if (e.target.closest('a')) alternar(false);
     });
   }
   
   /* ============================================================
      3) SMOOTH SCROLL PARA ENLACES ANCLA
      ------------------------------------------------------------
      Usa delegación de eventos: también funciona con enlaces
      creados dinámicamente (por ejemplo, las tarjetas de novedades).
      ============================================================ */
   
   function initScrollSuave() {
     const header = document.querySelector('.site-header'); // Header sticky cuya altura compensamos
   
     document.addEventListener('click', (evento) => {
       const enlace = evento.target.closest('a[href^="#"]'); // ¿El clic fue en un ancla interna?
       if (!enlace) return;
   
       const destinoId = enlace.getAttribute('href');        // Ej.: "#historia"
       if (destinoId === '#' || destinoId.length < 2) return; // Ignoramos anclas vacías
   
       const destino = document.querySelector(destinoId);    // Elemento de destino
       if (!destino) return;
   
       evento.preventDefault();                               // Evitamos el salto brusco
   
       // Posición del destino menos la altura del header sticky
       const alturaHeader = header ? header.offsetHeight : 0;
       const posicion = destino.getBoundingClientRect().top + window.pageYOffset - alturaHeader;
   
       window.scrollTo({ top: posicion, behavior: 'smooth' }); // Desplazamiento suave
       history.pushState(null, '', destinoId);                  // Actualizamos el hash de la URL
     });
   }
   
   /* ============================================================
      4) COMPONENTE "ANTES Y DESPUÉS"
      ============================================================ */
   
   function initAntesDespues() {
     const tarjetas = $$('[data-compare]'); // Tarjetas comparativas
   
     // ¿El dispositivo tiene hover real (mouse)?
     const soportaHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
   
     tarjetas.forEach((tarjeta) => {
       if (soportaHover) {
         // Desktop: revelar al entrar, ocultar al salir
         tarjeta.addEventListener('mouseenter', () => tarjeta.classList.add('is-revealed'));
         tarjeta.addEventListener('mouseleave', () => tarjeta.classList.remove('is-revealed'));
       } else {
         // Táctil: alternar con un tap
         tarjeta.addEventListener('click', () => tarjeta.classList.toggle('is-revealed'));
       }
   
       // Accesibilidad: Enter o Espacio también alternan
       tarjeta.addEventListener('keydown', (evento) => {
         if (evento.key === 'Enter' || evento.key === ' ') {
           evento.preventDefault();
           tarjeta.classList.toggle('is-revealed');
         }
       });
     });
   }
   
   /* ============================================================
      5) FORMULARIO DE COLABORACIÓN
      ============================================================ */
   
   function initFormularioColaboracion() {
     const formulario = document.getElementById('formColaborar');
     if (!formulario) return;
   
     const mensajeExito = document.getElementById('formSuccess');          // Mensaje de éxito
     const mensaje = document.getElementById('mensaje');                    // Textarea opcional
     const contador = document.getElementById('contadorMensaje');           // Contador de caracteres
   
     // Contador de caracteres del textarea (máx. 500)
     if (mensaje && contador) {
       mensaje.addEventListener('input', () => { contador.textContent = mensaje.value.length; });
     }
   
     // Expresiones regulares de validación
     const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
     const REGEX_TELEFONO = /^(\+?54\s?9?\s?)?(3407|03407)?[\s-]?\d{6,8}$/; // Formato argentino flexible
     const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
   
     // Cada validador escribe su error y devuelve true/false
     const validarNombre = () => {
       const valor = document.getElementById('nombre').value.trim();
       if (valor.length < 3) return mostrarError('nombre', 'Ingresá tu nombre completo (mínimo 3 caracteres).');
       if (!REGEX_NOMBRE.test(valor)) return mostrarError('nombre', 'El nombre solo puede contener letras y espacios.');
       return mostrarError('nombre', '');
     };
   
     const validarTelefono = () => {
       const valor = document.getElementById('telefono').value.trim();
       if (!valor) return mostrarError('telefono', 'Ingresá un teléfono o WhatsApp de contacto.');
       if (!REGEX_TELEFONO.test(valor.replace(/\s+/g, ' '))) return mostrarError('telefono', 'Formato esperado: +54 3404 123456.');
       return mostrarError('telefono', '');
     };
   
     const validarEmail = () => {
       const valor = document.getElementById('email').value.trim();
       if (!valor) return mostrarError('email', 'Ingresá tu correo electrónico.');
       if (!REGEX_EMAIL.test(valor)) return mostrarError('email', 'El correo no tiene un formato válido.');
       return mostrarError('email', '');
     };
   
     const validarTipo = () =>
       mostrarError('tipo', document.getElementById('tipo').value ? '' : 'Seleccioná cómo te gustaría colaborar.');
   
     const validarTerminos = () =>
       mostrarError('terminos', document.getElementById('terminos').checked ? '' : 'Debés aceptar los términos para continuar.');
   
     // Validación en vivo: feedback al salir de cada campo
     document.getElementById('nombre')?.addEventListener('blur', validarNombre);
     document.getElementById('telefono')?.addEventListener('blur', validarTelefono);
     document.getElementById('email')?.addEventListener('blur', validarEmail);
     document.getElementById('tipo')?.addEventListener('change', validarTipo);
     document.getElementById('terminos')?.addEventListener('change', validarTerminos);
   
     // Envío del formulario
     formulario.addEventListener('submit', (evento) => {
       evento.preventDefault(); // Evitamos la recarga de la página
   
       // Ejecutamos TODAS las validaciones (sin cortocircuito) para mostrar todos los errores a la vez
       const resultados = [validarNombre(), validarTelefono(), validarEmail(), validarTipo(), validarTerminos()];
   
       if (resultados.includes(false)) {
         enfocarPrimerError(['nombre', 'telefono', 'email', 'tipo', 'terminos']); // Foco al primer error
         return;
       }
   
       // Simulación de envío exitoso (sin backend)
       mensajeExito.textContent = '¡Gracias por sumarte! Recibimos tu solicitud y nos pondremos en contacto a la brevedad.';
       formulario.reset();                       // Limpiamos los campos
       if (contador) contador.textContent = '0'; // Reiniciamos el contador
       mostrarExito(mensajeExito, 6000);         // Mostramos y ocultamos el mensaje
     });
   }
   
   /* ============================================================
      5b) FORMULARIO "TU EXPERIENCIA EN EL MARCONI"
      ------------------------------------------------------------
      Foto con vista previa + comentario. Se puede "compartir" (envío
      simulado) o enviar por WhatsApp con el mensaje ya armado.
      ============================================================ */
   
   // Número de WhatsApp institucional (código de país + área + número, sin "+" ni espacios).
   // ⚠ Reemplazar por el número real (hoy es el mismo de ejemplo del footer).
   const WHATSAPP_NUMERO = '543404408843';
   
   function initFormularioExperiencia() {
     const formulario = document.getElementById('formExperiencia');
     if (!formulario) return;
   
     const MAX_BYTES = 5 * 1024 * 1024;                          // Peso máximo de la foto: 5 MB
     const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
   
     // Referencias al DOM
     const campoNombre = document.getElementById('expNombre');
     const campoEspacio = document.getElementById('expEspacio');
     const campoComentario = document.getElementById('expComentario');
     const campoFoto = document.getElementById('expFoto');
     const campoTerminos = document.getElementById('expTerminos');
     const contador = document.getElementById('contadorExperiencia');
     const vistaPrevia = document.getElementById('expVistaPrevia');
     const vistaImg = document.getElementById('expVistaImg');
     const vistaNombre = document.getElementById('expVistaNombre');
     const botonQuitar = document.getElementById('expQuitarFoto');
     const enlaceWhatsapp = document.getElementById('expWhatsapp');
     const mensajeExito = document.getElementById('expExito');
   
     const IDS = ['expNombre', 'expEspacio', 'expComentario', 'expFoto', 'expTerminos'];
     let urlTemporal = null;                                      // URL de la vista previa (se debe liberar)
   
     // Escribe el error y marca visualmente el campo. Devuelve true si es válido.
     function marcar(campo, mensajeTexto) {
       const valido = mostrarError(campo.id, mensajeTexto);
       campo.classList.toggle('is-invalid', !valido);
       campo.setAttribute('aria-invalid', valido ? 'false' : 'true');
       return valido;
     }
   
     /* ---------- Validadores ---------- */
     const validarNombre = () => {
       const valor = campoNombre.value.trim();
       if (valor.length < 3) return marcar(campoNombre, 'Ingresá tu nombre y apellido (mínimo 3 caracteres).');
       if (!REGEX_NOMBRE.test(valor)) return marcar(campoNombre, 'El nombre solo puede contener letras y espacios.');
       return marcar(campoNombre, '');
     };
   
     const validarEspacio = () =>
       marcar(campoEspacio, campoEspacio.value ? '' : 'Seleccioná el espacio que visitaste.');
   
     const validarComentario = () => {
       const valor = campoComentario.value.trim();
       if (!valor) return marcar(campoComentario, 'Contanos cómo fue tu visita.');
       if (valor.length < 10) return marcar(campoComentario, 'Escribí al menos 10 caracteres.');
       return marcar(campoComentario, '');
     };
   
     const validarFoto = () => {
       const archivo = campoFoto.files[0];
       if (!archivo) return marcar(campoFoto, '');                // La foto es opcional
       if (!archivo.type.startsWith('image/')) return marcar(campoFoto, 'El archivo debe ser una imagen (JPG, PNG, WEBP…).');
       if (archivo.size > MAX_BYTES) return marcar(campoFoto, 'La imagen supera los 5 MB. Elegí una más liviana.');
       return marcar(campoFoto, '');
     };
   
     const validarTerminos = () =>
       marcar(campoTerminos, campoTerminos.checked ? '' : 'Debés aceptar los términos para continuar.');
   
     /* ---------- Validación en vivo ---------- */
     campoNombre.addEventListener('blur', validarNombre);
     campoEspacio.addEventListener('change', validarEspacio);
     campoComentario.addEventListener('blur', validarComentario);
     campoTerminos.addEventListener('change', validarTerminos);
   
     /* ---------- Contador de caracteres ---------- */
     campoComentario.addEventListener('input', () => {
       contador.textContent = campoComentario.value.length;
       if (campoComentario.classList.contains('is-invalid')) validarComentario();
     });
   
     /* ---------- Vista previa de la foto ---------- */
     function limpiarVistaPrevia() {
       if (urlTemporal) { URL.revokeObjectURL(urlTemporal); urlTemporal = null; } // Libera memoria
       vistaImg.removeAttribute('src');
       vistaImg.alt = '';
       vistaNombre.textContent = '';
       vistaPrevia.hidden = true;
     }
   
     campoFoto.addEventListener('change', () => {
       limpiarVistaPrevia();
       const archivo = campoFoto.files[0];
       if (!validarFoto()) { campoFoto.value = ''; return; }      // Archivo inválido: lo descartamos
       if (!archivo) return;
   
       urlTemporal = URL.createObjectURL(archivo);
       vistaImg.src = urlTemporal;
       vistaImg.alt = 'Vista previa de la foto seleccionada: ' + archivo.name;
       vistaNombre.textContent = archivo.name;
       vistaPrevia.hidden = false;
     });
   
     botonQuitar.addEventListener('click', () => {
       campoFoto.value = '';
       limpiarVistaPrevia();
       validarFoto();
       campoFoto.focus();
     });
   
     /* ---------- Envío por WhatsApp ---------- */
     // Arma el texto del mensaje con los datos ya cargados en el formulario
     function armarMensajeWhatsApp() {
       const nombre = campoNombre.value.trim();
       const espacio = campoEspacio.value;
       const comentario = campoComentario.value.trim();
       const conFoto = campoFoto.files.length > 0;
   
       return 'Hola, soy ' + nombre + '. Quiero compartir mi experiencia en ' + espacio + ' de la Sociedad Italiana de Gálvez:\n\n' +
         '"' + comentario + '"\n\n' +
         (conFoto ? 'Te adjunto mi foto en este chat. ' : '') +
         'Autorizo a la institución a publicar mi comentario' + (conFoto ? ' y mi foto.' : '.');
     }
   
     enlaceWhatsapp.addEventListener('click', (evento) => {
       evento.preventDefault();                                   // Validamos antes de abrir WhatsApp
       const resultados = [validarNombre(), validarEspacio(), validarComentario(), validarFoto(), validarTerminos()];
       if (resultados.includes(false)) { enfocarPrimerError(IDS); return; }
   
       const url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(armarMensajeWhatsApp());
       window.open(url, '_blank', 'noopener,noreferrer');
     });
   
     /* ---------- Envío del formulario (simulado, sin backend) ---------- */
     formulario.addEventListener('submit', (evento) => {
       evento.preventDefault();
       mensajeExito.hidden = true;
   
       const resultados = [validarNombre(), validarEspacio(), validarComentario(), validarFoto(), validarTerminos()];
       if (resultados.includes(false)) { enfocarPrimerError(IDS); return; }
   
       // Acá iría el envío real (fetch a un backend, Formspree, Firebase, etc.)
       formulario.reset();                                        // Dispara el evento "reset" (limpieza abajo)
       mensajeExito.hidden = false;
       mensajeExito.focus();                                      // Lleva el foco al mensaje de éxito
       setTimeout(() => { mensajeExito.hidden = true; }, 8000);
     });
   
     // Al resetear: limpia vista previa, contador, errores y marcas visuales
     formulario.addEventListener('reset', () => {
       limpiarVistaPrevia();
       contador.textContent = '0';
       IDS.forEach((id) => {
         mostrarError(id, '');
         const campo = document.getElementById(id);
         campo.classList.remove('is-invalid');
         campo.removeAttribute('aria-invalid');
       });
     });
   }
   
   /* ============================================================
      6) MAPA INTERACTIVO DE ITALIA
      ============================================================ */
   
   function initMapaItalia() {
     const contenedor = document.getElementById('italy-map');                 // Figura contenedora
     const grupo = contenedor ? $('#regiones', contenedor) : null;            // Grupo SVG donde dibujamos
     const titulo = document.getElementById('regionTitulo');                  // Título del panel
     const texto = document.getElementById('regionTexto');                    // Texto del panel
     const panel = document.getElementById('panelRegion');                    // Panel completo (para animarlo)
     if (!grupo || !titulo || !texto) return;
   
     // 1) Dibuja cada región como un path interactivo a partir de los datos
     REGIONES.forEach((region) => {
       const path = document.createElementNS(SVG_NS, 'path');                 // Forma de la región
       path.setAttribute('class', 'map-point');
       path.setAttribute('d', region.d);
       path.setAttribute('data-region', region.id);
       path.setAttribute('role', 'button');                                   // Semántica de botón
       path.setAttribute('tabindex', '0');                                    // Alcanzable con Tab
       path.setAttribute('aria-pressed', 'false');                            // Estado inicial
       path.setAttribute('aria-controls', 'panelRegion');                     // Relación con el panel
       path.setAttribute('aria-label', region.nombre);                        // Nombre accesible
       grupo.appendChild(path);
     });
   
     // 2) Contornos superpuestos: uno para la región activa y otro para el foco de teclado.
     //    Van por encima de todas las regiones para que ningún vecino tape el borde.
     const crearContorno = (clase) => {
       const el = document.createElementNS(SVG_NS, 'path');
       el.setAttribute('class', clase);
       el.setAttribute('pointer-events', 'none');                             // No bloquea el clic
       el.setAttribute('aria-hidden', 'true');                                // Es solo decorativo
       grupo.appendChild(el);
       return el;
     };
     const contornoActivo = crearContorno('map-outline');
     const contornoFoco = crearContorno('map-focus');
   
     // 3) Rótulos al final, para que siempre queden visibles sobre el mapa
     REGIONES.forEach((region) => {
       if (!region.etiqueta) return;                                          // Regiones sin rótulo
       const etiqueta = document.createElementNS(SVG_NS, 'text');
       etiqueta.setAttribute('class', 'map-label');
       etiqueta.setAttribute('x', region.centro.x);
       etiqueta.setAttribute('y', region.centro.y);
       etiqueta.setAttribute('text-anchor', 'middle');
       etiqueta.setAttribute('dominant-baseline', 'middle');
       etiqueta.setAttribute('font-size', region.fuente || 6);               // Tamaño propio según el espacio
       etiqueta.setAttribute('aria-hidden', 'true');                          // El path ya tiene nombre accesible
       etiqueta.textContent = region.etiqueta;
       grupo.appendChild(etiqueta);
     });
   
     // Marca una región como activa y actualiza el panel informativo
     function seleccionarRegion(path) {
       const region = REGIONES.find((r) => r.id === path.dataset.region);     // Datos de la región elegida
       if (!region) return;
   
       $$('.map-point', grupo).forEach((p) => {
         const esActiva = p === path;
         p.setAttribute('aria-pressed', esActiva ? 'true' : 'false');         // Estado para lectores de pantalla
         p.classList.toggle('is-active', esActiva);                           // Estado visual destacado
       });
       contornoActivo.setAttribute('d', region.d);                            // Borde destacado sobre los vecinos
   
       titulo.textContent = region.nombre;                                    // Título dinámico
       texto.textContent = region.historia;                  // Relato dinámico
   
       // Enlace externo para las regiones que tengan una URL
   let enlace = document.getElementById('regionEnlace');
   
   if (!enlace) {
     enlace = document.createElement('a');
     enlace.id = 'regionEnlace';
     enlace.className = 'boton-region';
     enlace.target = '_blank';
     enlace.rel = 'noopener noreferrer';
   
     texto.insertAdjacentElement('afterend', enlace);
   }
   
   if (region.link) {
     enlace.href = region.link;
     enlace.textContent = 'Conocer más sobre ' + region.etiqueta;
     enlace.style.display = 'inline-block';
   } else {
     enlace.style.display = 'none';
   }
       if (panel) {                                                           // Reinicia la animación de entrada del panel
         panel.classList.remove('is-updating');
         void panel.offsetWidth;                                              // Fuerza el reflow para poder reanimar
         panel.classList.add('is-updating');
       }
     }
   
     // Foco con teclado (Tab): dibuja un anillo visible alrededor de la región enfocada
     grupo.addEventListener('focusin', (e) => {
       const path = e.target.closest('.map-point');
       if (path && path.matches(':focus-visible')) contornoFoco.setAttribute('d', path.getAttribute('d'));
     });
     grupo.addEventListener('focusout', () => contornoFoco.removeAttribute('d'));
   
     // Clic con mouse o toque (delegación sobre el grupo)
     grupo.addEventListener('click', (e) => {
       const path = e.target.closest('.map-point');
       if (path) seleccionarRegion(path);
     });
   
     // Teclado: Enter o Espacio activan la región enfocada
     grupo.addEventListener('keydown', (e) => {
       const path = e.target.closest('.map-point');
       if (path && (e.key === 'Enter' || e.key === ' ')) {
         e.preventDefault();                                                  // Evita el scroll con Espacio
         seleccionarRegion(path);
       }
     });
   }
   
   /* ============================================================
      7) NOVEDADES DE ITALIA (RENDER DINÁMICO)
      ============================================================ */
   
   /** Construye una tarjeta de novedad a partir de un objeto de datos. */
   function crearTarjetaNovedad(novedad) {
     const tarjeta = crearElemento('article', 'card news-card');              // Contenedor de la tarjeta
     const idTitulo = 'nov-' + novedad.id;                                    // Id único para aria-labelledby
     tarjeta.setAttribute('aria-labelledby', idTitulo);
   
     const etiqueta = crearElemento('span', ('tag ' + novedad.tag).trim(), novedad.etiqueta); // Tag de categoría
     const titulo = crearElemento('h3', 'card__title', novedad.titulo);       // Título
     titulo.id = idTitulo;
     const texto = crearElemento('p', 'card__text', novedad.texto);           // Resumen
   
     const pie = crearElemento('footer', 'card__footer');                     // Pie con el enlace
     const enlace = crearElemento('a', '', novedad.enlace);
     enlace.href = novedad.url;                                               // Destino real de cada novedad
     enlace.setAttribute('aria-label', novedad.aria);                         // Texto accesible completo
     if (/^https?:\/\//.test(novedad.url)) {                                   // Enlace externo: pestaña nueva
       enlace.target = '_blank';
       enlace.rel = 'noopener noreferrer';
     }
     pie.appendChild(enlace);
   
     tarjeta.append(etiqueta, titulo, texto, pie);                            // Ensamblamos la tarjeta
     return tarjeta;
   }
   
   function initNovedades() {
     const lista = document.getElementById('novedadesLista');                 // Contenedor de tarjetas
     if (!lista) return;
     const fragmento = document.createDocumentFragment();                     // Insertamos todo de una vez
     NOVEDADES.forEach((n) => fragmento.appendChild(crearTarjetaNovedad(n)));
     lista.replaceChildren(fragmento);                                        // Reemplaza el contenido previo
   }
   
   /* ============================================================
      8) INICIALIZACIÓN
      ------------------------------------------------------------
      Cada módulo se inicia de forma independiente: si una sección
      no existe en la página, su función simplemente no hace nada.
      ============================================================ */
   
   document.addEventListener('DOMContentLoaded', () => {
     initMenuHamburguesa();
     initSubmenuNosotros();
     initScrollSuave();
     initAntesDespues();
     initFormularioColaboracion();
     initFormularioExperiencia();
     initMapaItalia();
     initNovedades();
   });
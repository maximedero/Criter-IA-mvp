# Constitución de Decision Workspace

## Propósito

Decision Workspace es un producto de Liderazgo Aumentado con IA diseñado para
ayudar a profesionales a transformar señales de riesgo, información dispersa
e incertidumbre en un análisis estructurado y un brief ejecutivo que facilite
la comunicación y la toma de decisiones hacia niveles superiores.

El producto aumenta la capacidad de análisis y comunicación del profesional,
pero no reemplaza su juicio, responsabilidad ni autoridad.

## Principios fundamentales

### I. Juicio humano obligatorio

La persona usuaria conserva la responsabilidad de:

- validar los hechos y la evidencia;
- interpretar el contexto organizacional;
- determinar la gravedad del riesgo;
- elegir qué alternativas presentar;
- formular una recomendación;
- decidir qué elevar, cuándo elevarlo y a quién;
- aprobar el brief antes de compartirlo.

La IA no debe:

- determinar automáticamente la gravedad final;
- decidir qué alternativa debe seleccionarse;
- enviar, escalar o ejecutar acciones sin confirmación;
- presentar una inferencia como decisión humana;
- actuar como autoridad técnica, contractual, operativa o de negocio.

Toda salida generada por IA debe considerarse un borrador sujeto a revisión.

### II. Evidencia antes que elocuencia

El producto debe priorizar la calidad del razonamiento sobre la calidad
superficial de la redacción.

Toda afirmación relevante debe clasificarse como una de las siguientes:

- hecho confirmado;
- inferencia;
- supuesto;
- dato faltante;
- opinión o evaluación humana.

Cuando exista evidencia documental, el producto debe mantener el vínculo entre
la afirmación y su fuente.

La ausencia de evidencia no debe ocultarse mediante lenguaje convincente.

### III. Abstención frente a información insuficiente

Cuando no exista información suficiente para sostener una conclusión, la IA
debe indicarlo explícitamente.

El producto debe expresar:

- qué no puede determinarse;
- qué información falta;
- por qué esa información es relevante;
- quién podría disponer de ella;
- qué afirmaciones dependen de obtenerla.

La IA no debe inventar cifras, fechas, probabilidades, impactos económicos,
dependencias ni hechos organizacionales.

### IV. Razonamiento visible y auditable

El análisis no debe quedar oculto dentro de una conversación lineal.

Decision Workspace debe representar el caso mediante un canvas estructurado
con las siguientes dimensiones:

1. contexto y señal;
2. exposición;
3. evidencia;
4. impactos posibles;
5. incertidumbres y datos faltantes;
6. escenarios;
7. alternativas;
8. intervención requerida.

La persona debe poder revisar, aceptar, editar o rechazar cualquier elemento
propuesto por la IA.

El sistema debe distinguir visualmente:

- contenido ingresado por una persona;
- contenido sugerido por IA;
- contenido validado por una persona;
- contenido rechazado;
- contenido pendiente de revisión.

### V. Estructura fija, preguntas dinámicas

El workflow de análisis debe mantener las ocho dimensiones obligatorias, pero
las preguntas deben adaptarse a la información disponible y al dominio del
caso.

La IA debe formular una pregunta por vez.

Cada pregunta debe:

- atender el vacío de información más relevante;
- indicar, cuando corresponda, qué dimensión intenta completar;
- evitar repetir información ya disponible;
- poder responderse, omitirse o marcarse como desconocida;
- actualizar el canvas cuando la persona responda.

La IA no debe utilizar un cuestionario rígido e idéntico para todos los casos.

### VI. Asistencia contextual, no chatbot como experiencia principal

La experiencia principal debe ser un Decision Workspace persistente.

La conversación es una capacidad secundaria y contextual que debe estar
vinculada a:

- un bloque del canvas;
- una afirmación;
- una inconsistencia;
- un dato faltante;
- un escenario;
- una alternativa.

El chat no debe ser el único lugar donde se almacena el razonamiento.

### VII. Autonomía proporcional al riesgo

El MVP debe operar como un workflow asistido por IA.

La IA puede:

- organizar información;
- clasificar contenido;
- proponer preguntas;
- detectar contradicciones;
- sugerir impactos posibles;
- formular escenarios;
- identificar información faltante;
- preparar un brief.

La IA no puede:

- monitorear fuentes de manera autónoma;
- crear casos sin intervención humana;
- enviar comunicaciones;
- modificar sistemas externos;
- asumir compromisos;
- aprobar riesgos;
- ejecutar decisiones.

Cualquier aumento futuro de autonomía requerirá una nueva evaluación de
riesgo, privacidad, permisos, trazabilidad y control humano.

### VIII. Privacidad y minimización de datos

El producto debe solicitar únicamente la información necesaria para analizar
el caso.

El MVP no debe requerir acceso automático a correos, reuniones, chats,
documentos corporativos ni sistemas internos.

Para pruebas y demostraciones deben utilizarse:

- datos ficticios;
- datos anonimizados;
- casos controlados;
- documentos sin información confidencial innecesaria.

No deben registrarse prompts, respuestas o archivos sensibles sin una decisión
explícita y documentada sobre almacenamiento y retención.

### IX. El brief es un artefacto de decisión, no una decisión

El brief ejecutivo debe incluir:

1. qué está ocurriendo;
2. por qué importa;
3. qué puede ocurrir;
4. qué evidencia existe;
5. qué incertidumbres permanecen;
6. qué escenarios y alternativas deben considerarse;
7. qué intervención se necesita del nivel superior.

El brief no debe ocultar incertidumbre ni presentar una recomendación como
obligatoria.

El brief sólo puede alcanzar el estado "Listo para elevar" después de la
revisión explícita de la persona usuaria.

### X. Validación antes que expansión

Toda funcionalidad debe contribuir a validar la siguiente hipótesis principal:

> Un brief producido mediante el proceso aumentado permite que una persona de
> nivel superior comprenda mejor el riesgo y determine con mayor claridad el
> próximo paso que una comunicación preparada sin la asistencia del producto.

Las integraciones, automatizaciones y funciones proactivas quedan subordinadas
a la validación de esta hipótesis.

No debe incorporarse una funcionalidad solamente porque sea técnicamente
posible o visualmente atractiva.

## Guardrails obligatorios

Cada función que utilice IA debe cumplir con los siguientes controles:

1. **Separar:** diferenciar hechos, inferencias, supuestos y faltantes.
2. **Evidenciar:** relacionar afirmaciones relevantes con su evidencia.
3. **Contrastar:** considerar escenarios o explicaciones alternativas.
4. **Abstenerse:** declarar cuando no existe evidencia suficiente.
5. **Revisar:** ejecutar una segunda revisión de inconsistencias y afirmaciones
   débiles.
6. **Confirmar:** requerir validación humana antes de consolidar el brief.
7. **Registrar:** conservar trazabilidad básica de sugerencias aceptadas,
   editadas o rechazadas.

## Principios de UX

La interfaz debe:

- mostrar el estado del análisis de manera inmediata;
- reducir la carga de memoria de la persona;
- permitir navegación no lineal;
- evitar pantallas sobrecargadas;
- distinguir evidencia de interpretación;
- priorizar progresive disclosure;
- ofrecer explicaciones breves sobre por qué se solicita un dato;
- preservar el control y la posibilidad de corrección;
- evitar patrones manipulativos o que induzcan aceptación automática;
- ser utilizable sin conocer conceptos técnicos de IA.

## Principios de ingeniería

La implementación debe favorecer:

- componentes pequeños y reemplazables;
- separación entre interfaz, dominio y proveedor de IA;
- datos de prueba reproducibles;
- contratos de salida estructurados;
- validación de esquemas;
- manejo explícito de errores y ausencia de datos;
- pruebas automatizadas de reglas críticas;
- configuración externa de prompts;
- ausencia de secretos en el repositorio;
- capacidad de ejecutar una demostración local.

El proveedor de IA debe ser intercambiable. Las reglas del producto no deben
depender de un único modelo ni estar dispersas en componentes visuales.

## Política de alcance

Una funcionalidad pertenece al MVP solamente si es necesaria para:

- crear un caso;
- analizarlo mediante el canvas;
- descubrir vacíos o inconsistencias;
- generar un brief revisable;
- ejecutar la comparación control versus IA;
- recopilar la evaluación del decisor.

Quedan fuera del MVP inicial:

- autenticación corporativa;
- integración real con Outlook;
- integración real con Teams;
- búsqueda automática en Microsoft 365;
- RAG corporativo;
- monitoreo de riesgos;
- agentes autónomos;
- scoring automático de gravedad;
- envío automático de comunicaciones;
- flujos de aprobación corporativa;
- soporte multiempresa;
- analítica organizacional agregada.

## Gobierno y modificaciones

Esta constitución prevalece sobre decisiones de implementación, diseño o
conveniencia técnica.

Toda modificación debe incluir:

- principio modificado;
- razón del cambio;
- riesgo introducido;
- mecanismo de mitigación;
- impacto en las pruebas existentes;
- versión de la constitución;
- fecha de aprobación.

## Versión

Versión: 0.1.0
Estado: Borrador inicial
Fecha: 2026-11-10
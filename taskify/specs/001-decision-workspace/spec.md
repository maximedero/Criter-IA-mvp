# Feature Specification: Decision Workspace MVP

**Feature Branch**: `001-decision-workspace`
**Created**: 2026-11-10
**Status**: Draft
**Input**: Product Discovery del territorio "Liderar hacia arriba"

## 1. Resumen

Decision Workspace es una aplicación web que ayuda a profesionales a analizar
riesgos que necesitan comunicar hacia niveles superiores.

La persona comienza con un relato informal. El sistema organiza tentativamente
la información en un Decision Canvas, identifica vacíos, formula preguntas
dinámicas y construye progresivamente un brief ejecutivo.

La persona mantiene el control sobre el contenido, determina la gravedad del
riesgo y aprueba el brief final.

## Clarifications

### Session 2026-11-13

- Q: What retention policy should Criter-IA apply to case data and generated briefs in the MVP? → A: 90 days retention
- Q: ¿Qué condición mínima debe cumplirse para marcar un caso como “Listo para revisión”? → A: Solo completar 8 bloques
- Q: ¿Qué regla debe habilitar el estado “Listo para elevar”? → A: Aprobación manual + bloques de evidencia, incertidumbres, alternativas e intervención con contenido
- Q: ¿Cuántas preguntas máximas debe hacer la IA antes de sugerir generar el brief? → A: 5 preguntas

## 2. Problema

Los profesionales pueden detectar anticipadamente señales de riesgo, pero
tienen dificultades para transformar información compleja, dispersa e
incierta en una evaluación clara de:

- exposición;
- impactos posibles;
- evidencia;
- incertidumbres;
- escenarios;
- alternativas;
- intervención requerida.

Como consecuencia, el riesgo puede elevarse con información insuficiente,
demasiado detalle técnico, incertidumbre oculta o sin un pedido concreto hacia
el nivel superior.

## 3. Usuario objetivo

### Usuario primario

Profesional técnico o no técnico que:

- detecta una señal de riesgo;
- posee parte del conocimiento relevante;
- necesita elevar el tema a una persona con mayor autoridad;
- no tiene autoridad final para resolverlo;
- tiene dificultades para dimensionar o comunicar el impacto.

### Usuario secundario

Superior, gerente o decisor que recibe el brief y necesita:

- comprender rápidamente la situación;
- distinguir hechos de supuestos;
- conocer la incertidumbre;
- reconocer alternativas;
- determinar el próximo paso.

## 4. Propuesta de valor

Ayudar a profesionales a pensar mejor antes de comunicar mejor, convirtiendo
información dispersa e incierta en un análisis argumentado y un brief
ejecutivo accionable, sin delegar en la IA la evaluación ni la decisión final.

## 5. Hipótesis principal

Si un profesional utiliza una experiencia guiada por IA para analizar un
riesgo y construir un brief que explicite situación, impactos, evidencia,
incertidumbres, escenarios, alternativas e intervención requerida, entonces
una persona de nivel superior comprenderá mejor el riesgo y determinará con
mayor claridad el próximo paso que utilizando una comunicación preparada sin
esa asistencia.

## 6. Hipótesis secundarias

- La estructura visual reducirá la carga cognitiva frente a un chat lineal.
- Las preguntas dinámicas descubrirán información faltante no presente en el
  relato inicial.
- La separación entre hechos, inferencias y supuestos hará el brief más
  confiable.
- Mostrar incertidumbre aumentará la utilidad del brief, en lugar de reducir
  su credibilidad.
- La persona aceptará mantener el juicio final si puede editar y rechazar las
  sugerencias.
- El workflow podrá aplicarse tanto a riesgos tecnológicos como operativos.

## 7. Experiencia elegida

La solución utilizará el patrón:

> Decision Inbox + Decision Canvas + Asistencia contextual

No utilizará un chatbot como interfaz principal.

### 7.1 Decision Inbox

Muestra los casos existentes y permite:

- crear un caso;
- abrir un caso;
- conocer su estado;
- identificar análisis incompletos;
- retomar el trabajo.

Estados permitidos:

- Borrador;
- Recopilando evidencia;
- En análisis;
- Listo para revisión;
- Listo para elevar;
- Elevado;
- Cerrado.

En el MVP, cambiar el estado será una acción manual o dependerá de reglas
determinísticas.

### 7.2 Decision Canvas

Cada caso contiene ocho bloques:

1. Contexto y señal
2. Exposición
3. Evidencia
4. Impactos posibles
5. Incertidumbres y datos faltantes
6. Escenarios
7. Alternativas
8. Intervención requerida

Cada elemento debe mostrar:

- contenido;
- tipo epistemológico;
- origen;
- estado de validación;
- fuente, si existiera;
- acciones disponibles.

### 7.3 Asistencia contextual

La IA interviene dentro de cada bloque mediante:

- preguntas;
- advertencias;
- contradicciones;
- datos faltantes;
- impactos a considerar;
- escenarios alternativos;
- solicitudes de evidencia.

La interfaz debe evitar una conversación extensa separada del canvas.

## 8. User Scenarios and Testing

### User Story 1: Crear un caso desde una señal informal

**As a** profesional que detectó un riesgo  
**I want** describirlo con mis propias palabras  
**So that** pueda comenzar un análisis sin completar un formulario extenso.

**Priority**: P1

#### Acceptance Scenarios

1. **Given** que la persona está en el Inbox  
   **When** selecciona "Nuevo caso"  
   **Then** el sistema permite ingresar un título y una descripción informal.

2. **Given** una descripción inicial  
   **When** la persona confirma su creación  
   **Then** el sistema crea el caso en estado "Borrador".

3. **Given** una descripción ambigua  
   **When** se crea el caso  
   **Then** el sistema no asigna automáticamente gravedad ni recomendación.

---

### User Story 2: Organizar el relato en el Decision Canvas

**As a** profesional  
**I want** que el sistema organice tentativamente mi relato  
**So that** pueda visualizar lo que sé y lo que todavía falta.

**Priority**: P1

#### Acceptance Scenarios

1. **Given** un relato inicial  
   **When** comienza el análisis  
   **Then** el sistema propone elementos para los bloques correspondientes.

2. **Given** un elemento sugerido por IA  
   **When** se presenta en el canvas  
   **Then** aparece marcado como "Sugerido por IA" y "Pendiente de validación".

3. **Given** una afirmación que no puede clasificarse con seguridad  
   **When** se procesa  
   **Then** se presenta como pendiente y no como hecho confirmado.

4. **Given** una sugerencia incorrecta  
   **When** la persona la rechaza  
   **Then** se elimina del análisis consolidado y queda registrada como
   rechazada durante la sesión.

---

### User Story 3: Responder preguntas dinámicas

**As a** profesional  
**I want** recibir una pregunta relevante por vez  
**So that** pueda completar el análisis sin enfrentar un cuestionario rígido.

**Priority**: P1

#### Acceptance Scenarios

1. **Given** un canvas incompleto  
   **When** el sistema selecciona la próxima pregunta  
   **Then** prioriza un vacío relevante para comprender impacto,
   incertidumbre o intervención requerida.

2. **Given** que la información ya fue aportada  
   **When** se genera una nueva pregunta  
   **Then** no se repite la misma solicitud.

3. **Given** que la persona no conoce la respuesta  
   **When** selecciona "No lo sé"  
   **Then** el dato se registra como faltante y no se inventa una respuesta.

4. **Given** una respuesta del usuario  
   **When** se procesa  
   **Then** el canvas se actualiza y muestra qué contenido cambió.

5. **Given** que la persona desea avanzar  
   **When** omite una pregunta  
   **Then** el sistema permite continuar y mantiene visible el dato faltante.

---

### User Story 4: Diferenciar evidencia de interpretación

**As a** profesional  
**I want** distinguir hechos, inferencias, supuestos y faltantes  
**So that** no eleve hacia arriba conclusiones con una solidez aparente mayor
a la real.

**Priority**: P1

#### Acceptance Scenarios

1. Cada elemento debe estar clasificado como:
   - Hecho;
   - Inferencia;
   - Supuesto;
   - Dato faltante;
   - Evaluación humana.

2. La persona debe poder cambiar la clasificación.

3. Un elemento marcado como hecho debe poder vincularse a una fuente o
   marcarse como "Confirmado por la persona".

4. La IA no puede cambiar una evaluación humana sin solicitar confirmación.

---

### User Story 5: Ejecutar una revisión crítica

**As a** profesional  
**I want** que el sistema cuestione el análisis antes de cerrar el brief  
**So that** pueda detectar contradicciones, vacíos y afirmaciones débiles.

**Priority**: P1

#### Acceptance Scenarios

1. **Given** un canvas parcialmente completo  
   **When** la persona selecciona "Revisar análisis"  
   **Then** el sistema identifica:
   - afirmaciones sin evidencia;
   - contradicciones;
   - supuestos relevantes;
   - impactos no sustentados;
   - alternativas no comparables;
   - ausencia de un pedido concreto.

2. La revisión debe diferenciar:
   - bloqueo crítico;
   - advertencia;
   - oportunidad de mejora.

3. La revisión no debe asignar gravedad al riesgo.

4. Si no existe evidencia suficiente para una conclusión, debe mostrarse:
   "No hay evidencia suficiente para sostener esta afirmación".

---

### User Story 6: Asignar gravedad mediante juicio humano

**As a** profesional responsable del análisis  
**I want** determinar personalmente la gravedad  
**So that** la responsabilidad no se transfiera al modelo.

**Priority**: P1

#### Acceptance Scenarios

1. La gravedad sólo puede ser elegida manualmente.

2. El sistema puede solicitar una justificación, pero no sugerir qué opción
   seleccionar.

3. La interfaz debe indicar:
   "Evaluación realizada por la persona usuaria".

4. Las opciones iniciales serán:
   - Sin evaluar;
   - Baja;
   - Media;
   - Alta;
   - Crítica.

5. La clasificación debe poder modificarse antes de elevar el caso.

---

### User Story 7: Generar un brief ejecutivo

**As a** profesional  
**I want** generar un brief a partir del contenido validado  
**So that** pueda elevar el riesgo de manera clara y accionable.

**Priority**: P1

#### Brief obligatorio

El brief debe contener:

1. Situación
2. Por qué importa
3. Consecuencias posibles
4. Evidencia disponible
5. Incertidumbres y datos faltantes
6. Escenarios
7. Alternativas y trade-offs
8. Gravedad asignada por la persona
9. Intervención requerida
10. Fuentes

#### Acceptance Scenarios

1. Sólo se incorpora automáticamente contenido aceptado o validado.

2. Los supuestos e incertidumbres deben permanecer visibles.

3. Una fuente inexistente no debe inventarse.

4. El brief debe poder editarse antes de marcarlo "Listo para elevar".

5. La aplicación debe poder copiar el brief como texto.

6. El brief debe identificar claramente qué se necesita del superior:
   - conocimiento;
   - consulta;
   - priorización;
   - recurso;
   - autorización;
   - decisión;
   - escalamiento.

---

### User Story 8: Comparar comunicación original y aumentada

**As a** equipo de producto  
**I want** comparar el planteo original con el brief aumentado  
**So that** pueda evaluar si el producto agrega valor.

**Priority**: P1

#### Acceptance Scenarios

1. La pantalla muestra ambas versiones sin indicar al evaluador cuál fue
   asistida por IA, cuando se utilice el modo de prueba.

2. El evaluador puntúa de 1 a 5:
   - comprensión de la situación;
   - comprensión de la relevancia;
   - claridad de consecuencias;
   - visibilidad de evidencia;
   - visibilidad de incertidumbre;
   - claridad de alternativas;
   - claridad del pedido;
   - capacidad para determinar el próximo paso.

3. La evaluación debe guardarse localmente durante la demostración.

4. El sistema debe mostrar las diferencias de puntuación por criterio.

## 9. Casos de prueba iniciales

### Caso 1: Dynamics 365

- contrato vencido;
- continuidad limitada al proyecto existente;
- imposibilidad de iniciar nuevos trabajos;
- posible exposición de varias áreas;
- intervención de Compras mediante el superior;
- duración del proceso contractual incierta.

### Caso 2: SharePoint/Nintex

- fin de soporte de workflows;
- modernización iniciada;
- avance demorado;
- soluciones residuales sobre tecnología sin soporte;
- impacto difícil de dimensionar;
- exposición sobre procesos todavía no inventariados completamente.

### Caso 3: Producción

- varias áreas intervienen en la fabricación;
- se compromete una fecha;
- la probabilidad de cumplimiento es desconocida;
- los incumplimientos son frecuentes;
- se necesita comunicar un intervalo de entrega defendible;
- la cuantificación probabilística no pertenece al alcance del LLM.

## 10. Functional Requirements

- **FR-001**: El sistema debe permitir crear, editar y abrir casos.
- **FR-002**: El sistema debe mostrar los ocho bloques del Decision Canvas.
- **FR-003**: El sistema debe aceptar una descripción informal.
- **FR-004**: El sistema debe proponer una organización inicial del contenido.
- **FR-005**: Toda sugerencia de IA debe requerir validación humana.
- **FR-006**: El sistema debe formular una pregunta dinámica por vez.
- **FR-007**: La persona debe poder responder "No lo sé".
- **FR-008**: El sistema debe registrar información faltante.
- **FR-009**: Los elementos deben clasificarse epistemológicamente.
- **FR-010**: La persona debe poder aceptar, editar o rechazar sugerencias.
- **FR-011**: El sistema debe ejecutar una revisión crítica.
- **FR-012**: La IA no debe asignar gravedad.
- **FR-013**: La gravedad debe ser asignada manualmente.
- **FR-014**: El sistema debe generar el brief estructurado.
- **FR-015**: La persona debe aprobar el brief.
- **FR-016**: El sistema debe comparar comunicación original y aumentada.
- **FR-017**: El evaluador debe poder puntuar ambas versiones.
- **FR-018**: La demostración debe funcionar con los tres casos definidos.
- **FR-019**: La aplicación debe mostrar el origen de cada elemento.
- **FR-020**: La aplicación debe evitar inventar fuentes o datos.
- **FR-021**: El proveedor de IA debe estar desacoplado de la interfaz.
- **FR-022**: Los prompts deben mantenerse fuera de los componentes visuales.
- **FR-023**: Un caso podrá cambiar al estado "Listo para revisión" cuando los ocho bloques del Decision Canvas contengan al menos un elemento.
- **FR-024**: Un caso solo podrá marcarse "Listo para elevar" cuando una persona lo apruebe explícitamente y los bloques de evidencia, incertidumbres, alternativas e intervención requerida tengan contenido.
- **FR-025**: La IA podrá formular como máximo 5 preguntas dinámicas por caso antes de sugerir generar el brief.

## 11. Non-Functional Requirements

- **NFR-001 Usabilidad**: Crear un caso no debe requerir más que título y
  descripción inicial.
- **NFR-002 Transparencia**: Todo contenido generado por IA debe estar
  identificado.
- **NFR-003 Control**: Ningún contenido generado debe consolidarse sin
  posibilidad de edición o rechazo.
- **NFR-004 Privacidad**: El MVP no debe requerir datos corporativos reales.
- **NFR-005 Seguridad**: No deben almacenarse secretos en el repositorio.
- **NFR-006 Trazabilidad**: Debe conservarse el origen y validación de cada
  elemento durante la sesión.
- **NFR-007 Portabilidad**: La demostración debe ejecutarse localmente.
- **NFR-008 Resiliencia**: Si el servicio de IA falla, el canvas debe
  continuar permitiendo edición manual.
- **NFR-009 Accesibilidad**: Las categorías no deben distinguirse únicamente
  por color.
- **NFR-010 Rendimiento**: Las acciones locales de navegación deben responder
  sin demoras perceptibles.
- **NFR-011 Auditabilidad**: Debe poder explicarse qué información se utilizó
  para producir cada sección del brief.
- **NFR-012 Idioma**: La primera versión se implementará en español.
- **NFR-013 Retención**: Los datos de casos y los briefs generados deben conservarse por un máximo de 90 días y luego eliminarse automáticamente.

## 12. Out of Scope

- Outlook add-in;
- Teams application;
- Microsoft Graph;
- búsqueda automática de correos o reuniones;
- conectores corporativos;
- autenticación organizacional;
- RAG;
- agentes autónomos;
- alertas proactivas;
- cálculos probabilísticos;
- scoring automático;
- envío del brief;
- colaboración multiusuario en tiempo real;
- aprobaciones;
- aplicación móvil nativa;
- dashboards organizacionales.

## 13. Success Criteria

### SC-001 Comprensión

En la prueba ciega, el brief aumentado debe obtener una puntuación promedio
superior al control en al menos 6 de los 8 criterios de evaluación.

### SC-002 Próximo paso

Al menos 2 de cada 3 evaluadores deben poder identificar correctamente qué
intervención se solicita después de leer el brief aumentado.

### SC-003 Incertidumbre

El brief aumentado debe hacer visibles al menos dos incertidumbres o datos
faltantes relevantes que no estaban explícitos en la comunicación original.

### SC-004 Control humano

El 100% de los briefs demostrados debe mostrar que la gravedad fue asignada
por una persona.

### SC-005 Generalización

El mismo workflow debe poder completarse con:

- un caso contractual/tecnológico;
- un caso de continuidad/obsolescencia;
- un caso operativo/productivo.

### SC-006 Alucinaciones

Durante las pruebas, ninguna fecha, cifra, fuente o dependencia inexistente
debe aparecer como hecho confirmado.

### SC-007 Trazabilidad

El evaluador del producto debe poder identificar el origen de cada afirmación
relevante del brief.

## 14. Edge Cases

- La persona sólo aporta una frase.
- La persona no conoce ninguna consecuencia concreta.
- Existen datos contradictorios.
- El impacto depende de otra área.
- No existen alternativas conocidas.
- La persona intenta pedir que la IA elija la gravedad.
- La persona aporta una cifra sin fuente.
- La IA propone un impacto incorrecto.
- La persona rechaza todas las sugerencias.
- El servicio de IA no responde.
- El caso requiere un cálculo estadístico.
- La persona desea generar el brief con datos faltantes.
- El caso no necesita elevación hacia arriba.
- La señal no representa realmente un riesgo.

## 15. Assumptions

- La aplicación se utilizará inicialmente con datos simulados.
- Habrá un solo usuario activo por sesión.
- Los casos y briefs del MVP se conservarán por hasta 90 días antes de su eliminación.
- El proveedor de IA podrá simularse durante pruebas de interfaz.
- La exportación inicial será mediante copia de texto.
- La evaluación del decisor podrá realizarse en la misma aplicación.
- El MVP no será utilizado para tomar decisiones operativas reales.

## 16. Open Questions

- ¿Debe existir una vista cronológica además del canvas?
- ¿Cómo se representarán visualmente las relaciones entre evidencia e impacto?
- ¿Qué acciones se permitirán mediante teclado?
- ¿Cuánto detalle debe contener el brief para leerse en menos de un minuto?
- ¿El brief debe tener una versión corta y otra expandida?
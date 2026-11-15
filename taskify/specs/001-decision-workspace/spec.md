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
- Q: ¿Cuántas preguntas máximas debe hacer la IA antes de sugerir generar el brief? → A: [REEMPLAZADA] Ver Session 2026-11-14: no hay límite rígido; máximo orientativo 8 en primera ronda con detención por cobertura/contexto.

### Session 2026-11-14

- Se reemplaza el límite rígido de 5 preguntas por máximo orientativo de 8 en primera ronda, con detención anticipada por cobertura y contexto.
- Se fija el flujo funcional de estados: Nuevo → Borrador → En análisis → Revisión crítica → Evaluación humana → Brief borrador → Listo para elevar.
- Se fija cobertura mínima obligatoria para ofrecer generación de brief (6 dimensiones mínimas).
- Se fija regla de doble vista del brief (ejecutivo + expandida) como un único artefacto.

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

Flujo principal de estados del caso en MVP:

- Nuevo;
- Borrador;
- En análisis;
- Revisión crítica;
- Evaluación humana;
- Brief borrador;
- Listo para elevar.

Reglas de control sobre estados:

- La IA no puede asignar automáticamente la gravedad.
- La IA no puede aprobar un brief.
- La IA no puede declarar unilateralmente que un caso está listo para elevar.
- La IA no puede enviar o escalar un caso.
- La IA no puede ejecutar acciones en sistemas externos.

En el MVP, el avance de estado se produce por acciones de la persona usuaria y
por validaciones determinísticas explícitas del workflow.
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

Regla de interacción para preguntas dinámicas:

1. analizar el estado actual del canvas;
2. identificar el vacío de información más relevante;
3. formular una sola pregunta;
4. explicar brevemente por qué esa información importa cuando no sea evidente;
5. esperar la respuesta del usuario;
6. usar la respuesta para proponer actualización del canvas;
7. reevaluar la cobertura mínima para brief.

Respuestas permitidas ante una pregunta:

- Responder normalmente;
- "No lo sé" (se registra/actualiza como dato faltante);
- "No aplica" (se registra como no aplicable al caso);
- "Omitir por ahora" (permanece pendiente y visible).

Reglas de "No aplica":

- sólo puede ser seleccionado por el usuario;
- nunca por la IA;
- debe quedar registrado explícitamente;
- es distinto de "No lo sé";
- no debe provocar generación automática de contenido.

"No lo sé" es una respuesta informativa válida y no habilita que la IA invente
contenido.

Regla de detención:

- no hay cantidad rígida obligatoria de preguntas;
- máximo orientativo de 8 preguntas principales por primera ronda;
- la IA debe detenerse antes si se alcanzó cobertura mínima, si la persona pide
  generar brief, si lo restante requiere investigación externa, si la persona
  declara reiteradamente no disponer de más datos o si continuar no cambia
  materialmente la comprensión del caso.

Si quedan incertidumbres, el sistema debe indicar:
"Podemos preparar un brief provisional. Permanecen N incertidumbres relevantes."

La interfaz debe evitar una conversación extensa separada del canvas.

### 7.4 Bloqueos y advertencias

La revisión crítica debe distinguir:

- **BLOQUEO CRÍTICO**: la información disponible podría producir un brief
  materialmente engañoso.
- **ADVERTENCIA**: falta información útil o hay afirmaciones débiles, pero puede
  comunicarse explícitamente como incertidumbre.

Hecho central (para contradicciones):

Un hecho se considera central cuando puede cambiar materialmente:

- la existencia del riesgo;
- la exposición;
- el impacto;
- la urgencia temporal;
- la evidencia principal;
- la intervención requerida.

Reglas sobre contradicciones:

- una contradicción confirmada entre hechos centrales constituye BLOQUEO CRÍTICO;
- una contradicción potencial debe presentarse primero al usuario para
  aclaración;
- la IA no puede seleccionar silenciosamente cuál afirmación es correcta;
- contradicciones no materiales pueden registrarse como ADVERTENCIA.

Ejemplos de BLOQUEO CRÍTICO:

- cifra relevante presentada como hecho sin fuente ni confirmación humana;
- contradicciones entre dos hechos centrales no resueltas;
- impacto principal presentado como certeza cuando sólo es supuesto;
- ausencia completa de intervención requerida.

Reglas de efecto:

- un bloqueo crítico impide "Listo para elevar";
- una advertencia no impide generar brief provisional.

### 7.5 Regla de "Listo para elevar"

Un caso sólo puede llegar a "Listo para elevar" cuando:

- situación está definida;
- exposición está definida;
- existe al menos un impacto plausible;
- hechos e inferencias están diferenciados;
- incertidumbres están visibles;
- no existen bloqueos críticos;
- intervención requerida está definida;
- gravedad fue declarada por la persona;
- el brief fue revisado;
- el usuario ejecutó explícitamente "Aprobar brief".

La aprobación del brief requiere, en este orden:

1. checklist visible de condiciones de "Listo para elevar";
2. acción explícita "Aprobar brief";
3. confirmación final con el mensaje:
   "Estás por marcar este caso como LISTO PARA ELEVAR."

La IA nunca puede ejecutar ni confirmar "Aprobar brief".

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

4. **Given** que la información no aplica al caso  
   **When** la persona selecciona "No aplica"  
   **Then** la dimensión o dato queda marcado explícitamente como no aplicable.

5. **Given** que la persona desea avanzar  
   **When** selecciona "Omitir por ahora"  
   **Then** el dato permanece pendiente y visible.

6. **Given** una respuesta del usuario  
   **When** se procesa  
   **Then** el canvas se actualiza y muestra qué contenido cambió.

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

3. Una contradicción potencial entre hechos centrales debe presentarse primero a la persona usuaria para aclaración.

4. Una contradicción confirmada entre hechos centrales debe quedar como bloqueo crítico.

5. La revisión no debe asignar gravedad al riesgo.

6. Si no existe evidencia suficiente para una conclusión, debe mostrarse:
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

El producto debe generar dos vistas del mismo artefacto:

A) Brief ejecutivo (lectura rápida para el superior)

1. Situación
2. Por qué importa
3. Impactos posibles
4. Evidencia
5. Incertidumbres
6. Escenarios / alternativas
7. Gravedad
8. Intervención requerida

Reglas del brief ejecutivo:

- La gravedad debe indicar explícitamente: "Evaluación realizada por el usuario".
- Debe tender a una extensión aproximada máxima de una página.

B) Vista expandida (auditoría del proceso)

Debe incluir:

- fuentes;
- hechos;
- inferencias;
- supuestos;
- datos faltantes;
- evaluación humana;
- advertencias;
- historial de revisión.

Regla de cobertura mínima para ofrecer generación de brief:

Definición de "dimensión definida":

Una dimensión se considera definida únicamente cuando contiene al menos un
elemento relevante con estado:

- validado por el usuario; o
- editado por el usuario.

Reglas de cobertura por estado:

- un elemento pendiente generado por IA nunca satisface por sí mismo cobertura;
- un elemento rechazado no participa en cobertura;
- la edición explícita del usuario implica aceptación del contenido editado y no
  requiere una segunda acción de validación.

Deben existir como mínimo:

1. situación definida;
2. exposición definida;
3. al menos un impacto plausible;
4. evidencia disponible;
5. al menos una incertidumbre explícita o declaración explícita de ausencia de
   incertidumbres relevantes;
6. intervención requerida definida.

Reglas de "No aplica" para cobertura mínima:

- NO admiten "No aplica": situación, exposición, evidencia, impacto plausible,
  intervención requerida.
- La dimensión de incertidumbre puede satisfacer cobertura con la declaración
  explícita del usuario: "No identifico incertidumbres relevantes con la
  información disponible.", registrada como EVALUACIÓN HUMANA.

Escenarios y alternativas son deseables, pero no obligatorios. Si no pueden
identificarse con evidencia suficiente, debe mostrarse explícitamente:
"No identificados con la evidencia disponible."

#### Acceptance Scenarios

1. Sólo se incorpora automáticamente contenido validado o editado por la persona usuaria; contenido pendiente o rechazado no participa automáticamente.

2. Los supuestos e incertidumbres deben permanecer visibles.

3. Una fuente inexistente no debe inventarse.

4. El brief debe poder editarse antes de marcarlo "Listo para elevar".

5. Para aprobar el brief deben verse las condiciones de "Listo para elevar", ejecutarse la acción explícita "Aprobar brief" y mostrarse la confirmación final: "Estás por marcar este caso como LISTO PARA ELEVAR.".

6. La IA no puede ejecutar ni confirmar la acción de aprobación del brief.

7. La aplicación debe poder copiar el brief como texto.

8. El brief debe identificar claramente qué se necesita del superior:
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
- **FR-005**: Toda sugerencia de IA debe iniciar como pendiente de validación.
- **FR-006**: La persona usuaria debe poder aceptar, editar, reclasificar o rechazar sugerencias.
- **FR-007**: El sistema debe preservar origen de cada elemento (usuario o IA).
- **FR-008**: El sistema debe preservar estado de cada elemento (pendiente, validado, editado, rechazado).
- **FR-009**: Todo elemento relevante del canvas debe clasificarse como HECHO, INFERENCIA, SUPUESTO, DATO FALTANTE o EVALUACIÓN HUMANA.
- **FR-010**: El sistema debe formular una sola pregunta dinámica por vez.
- **FR-011**: La persona debe poder responder "No lo sé", "No aplica" u "Omitir por ahora" además de una respuesta normal.
- **FR-012**: "No lo sé" debe registrarse como dato faltante y nunca habilitar contenido inventado.
- **FR-013**: "No aplica" sólo puede ser seleccionado por la persona usuaria, nunca por la IA, debe quedar registrado y no debe disparar generación automática de contenido.
- **FR-014**: No existe límite rígido obligatorio de preguntas; el máximo orientativo por primera ronda es 8 preguntas principales.
- **FR-015**: El sistema debe detener preguntas antes del máximo cuando se cumpla alguna condición de detención definida en la sección 7.3.
- **FR-016**: El sistema debe ejecutar revisión crítica clasificando hallazgos en BLOQUEO CRÍTICO o ADVERTENCIA.
- **FR-017**: Una contradicción confirmada entre hechos centrales debe clasificarse como BLOQUEO CRÍTICO.
- **FR-018**: Una contradicción potencial debe presentarse al usuario para aclaración y la IA no puede resolverla silenciosamente por su cuenta.
- **FR-019**: Un BLOQUEO CRÍTICO impide llegar al estado "Listo para elevar".
- **FR-020**: Las ADVERTENCIAS no impiden generar brief provisional si quedan visibles.
- **FR-021**: La IA no debe asignar gravedad, no debe recomendar categoría y no debe preseleccionar una opción.
- **FR-022**: La gravedad debe ser definida únicamente por la persona con opciones: Sin evaluar, Baja, Media, Alta, Crítica.
- **FR-023**: El producto debe mostrar explícitamente "Evaluación realizada por el usuario".
- **FR-024**: El sistema sólo debe ofrecer generar brief cuando exista cobertura mínima definida en la sección de brief obligatorio y ninguna condición mínima dependa sólo de elementos pendientes de IA.
- **FR-025**: Escenarios y alternativas son deseables pero no obligatorios; cuando no haya evidencia suficiente deben mostrarse como "No identificados con la evidencia disponible.".
- **FR-026**: Para cobertura mínima no admiten "No aplica": situación, exposición, evidencia, impacto plausible e intervención requerida.
- **FR-027**: La dimensión de incertidumbre puede satisfacer cobertura con la declaración explícita "No identifico incertidumbres relevantes con la información disponible.", registrada como EVALUACIÓN HUMANA.
- **FR-028**: El caso puede llegar a "Listo para elevar" únicamente si se cumplen todas las condiciones de la sección "Listo para elevar".
- **FR-029**: La aprobación de brief debe exigir checklist visible, acción explícita "Aprobar brief" y confirmación final con el mensaje definido en la sección 7.5.
- **FR-030**: La IA nunca puede ejecutar ni confirmar "Aprobar brief" ni declarar unilateralmente un caso como "Listo para elevar".
- **FR-031**: El sistema debe comparar comunicación original y aumentada y permitir puntuación por criterios definidos.
- **FR-032**: La demostración debe funcionar con los tres casos definidos.
- **FR-033**: La aplicación debe evitar inventar fuentes o datos y debe abstenerse explícitamente cuando falte información suficiente.

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
- ¿Qué acciones mínimas de accesibilidad por teclado son obligatorias en MVP (navegar bloques, responder pregunta, aprobar brief)?

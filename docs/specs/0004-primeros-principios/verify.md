# Verificación de primeros principios, spec 0004

Verificada el 21 de octubre de 2026 contra producción local en `http://127.0.0.1:3000/first-principles`. Se detuvo el servidor anterior, se compiló y se inició la compilación nueva antes de probar. La especificación recibió revisión independiente de solo lectura, sin hallazgos materiales; la revisión recordó conservar dependencias separadas A/B al implementar concurrencia.

## Criterios y evidencia

- [x] AC-1. La ruta ofrece cuatro capítulos, contenido técnico, código, alternativas, límites, errores conceptuales, preguntas con feedback y desafíos. Se recorrieron los cuatro y se volvió a Follow the Click mediante navegación real. Fuentes: `tests/e2e/foundations.spec.ts`, prueba móvil, recorrido adicional de los cuatro capítulos y `test-results/first-principles-viewport.png`.
- [x] AC-2. sumar(10,20) devuelve realmente 30; sumar(21,21) satisface el desafío. Seleccionar entrada y retorno reconstruye dos frames y un frame respectivamente. Retroceder y replay conservan el contador de ejecuciones. La animación avanzó con velocidad seleccionada y se pausó sin otra invocación. Fuentes: primera prueba nueva, `tests/learning.test.ts`, comprobación interactiva y `test-results/function-stack.png`.
- [x] AC-3. La reducción devuelve number; la implementación incompatible devuelve el string original y genera CONTRACT_VIOLATION. No llega al uso del consumidor. La comprobación explícita de tipo y significado se explica sin atribuirla a TypeScript. Fuentes: segunda prueba nueva, pruebas de función y código del inspector.
- [x] AC-4. Se modificó un nodo real dos veces. Un texto con etiqueta img quedó como texto y no creó elementos ni solicitudes. Replay no volvió a mutar el nodo. El explorador expone nueve superficies ilustrativas, incluida la distinción entre SDK y API subyacente. Fuentes: tercera prueba nueva y comprobación de ausencia de solicitudes del recorrido completo.
- [x] AC-5. Se seleccionaron los siete mecanismos y las cinco responsabilidades de Anatomy. Función no muestra frontera de red; IPC identifica mismo equipo; syscall indica transición de privilegio sin exigir otro proceso. Mensajes distinguen aceptación de finalización y suscripción distingue registro de entrega. Fuentes: cuarta prueba nueva y pruebas de modelos de frontera.
- [x] AC-6. Entrega fallida no ejecuta proveedor; respuesta perdida sí lo ejecuta sin entregar resultado al cliente. Dos ramas tienen dos raíces y dependencias internas separadas, con el mismo tiempo lógico por etapa. Seleccionar una etapa de B lleva al inspector de B. Evidencias: pruebas de modelos, cuarta prueba nueva y `test-results/concurrent-lanes.png`. También se comprobó esta vista a 390 px sin desbordamiento horizontal.
- [x] AC-7. Una respuesta incorrecta da explicación sin completar; pregunta y desafío correctos completan. Se completaron los cuatro capítulos en una sesión y al recargar seguían los cuatro logros. Se recuperan capítulo y profundidad. JSON inválido vuelve a estado inicial y bloqueo de lectura y escritura mantiene navegación y ejecución de sesión. Fuentes: pruebas de progreso, primera, quinta y sexta pruebas nuevas y recorrido interactivo completo sin errores JavaScript ni llamadas API.

## Fuentes de valores comprobadas

- [x] Argumentos editables validan enteros entre -1000 y 1000; ambas implementaciones correctas producen a+b para entradas normales y límites. Se rechazan fracciones, NaN, infinito y valores fuera de rango.
- [x] El valor mostrado procede de la función ejecutada; la implementación rota no se convierte silenciosamente a número. Pila y memoria se identifican siempre como modelo conceptual.
- [x] El texto DOM procede del campo del usuario y se inserta con textContent. Se valida longitud y presencia; repetir el mismo texto no completa otro cambio.
- [x] La ficha del mecanismo determina contrato y agrupación. La syscall ilustra read y bytes, sin fingir que ofrece sumar. Las representaciones JSON de IPC/RPC se describen como elecciones ilustrativas.
- [x] Las ramas concurrentes usan identidad A/B y dependencias propias. El indexador lineal no se aplica después de construirlas. No hay cifras de latencia inventadas.
- [x] El progreso solo reúne respuestas correctas y flags conocidos de desafíos ejecutados. Se valida versión, capítulo y profundidad; se ignoran valores y flags ajenos. Visitar no completa.

## Comandos

- [x] `npm test`: 125 pruebas de lógica y servidor, cuatro archivos, correctas.
- [x] `npm run test:e2e`: 15 pruebas Chromium correctas, incluidas las nueve anteriores de compra y red.
- [x] `npm run typecheck`: correcto; la compilación también ejecutó TypeScript correctamente.
- [x] `npm run lint`: correcto.
- [x] `npm run build`: correcto; `/first-principles` se genera y conserva las rutas existentes.
- [x] `git diff --check`: sin problemas de espacios.

Al añadir las filas concurrentes, una prueba encontró tres textos TIMEOUT y requirió acotar su selector al inspector. La comprobación final pasó con ese selector preciso. No se modificó el comportamiento de errores para satisfacer la prueba.

Las capturas citadas se generan en `test-results/`, se inspeccionaron visualmente y no forman parte del código versionado. Playwright limpia esa carpeta en la siguiente ejecución.

## Límites

Solo se verificó Chromium, teclado, pantallas de escritorio y móvil y ambos ajustes de reducción de movimiento. No se probaron otros motores ni lectores de pantalla, ni se validó el aprendizaje con estudiantes. Pila, memoria interna, IPC, kernel, mensajería y eventos son modelos; la suma y la mutación DOM sí se ejecutan. El progreso local es editable y no certifica conocimientos.

La taxonomía completa, capítulos 4 a 12 y demás laboratorios siguen pendientes en el alcance.

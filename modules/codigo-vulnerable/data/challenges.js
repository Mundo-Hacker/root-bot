const challenges = [
  {
    "id": "sql-login",
    "language": "JavaScript",
    "difficulty": "Fácil",
    "scenario": "Una API busca una cuenta por nombre de usuario.",
    "code": "const user = await db.get(\n  `SELECT * FROM users WHERE username = '${req.body.username}'`\n);",
    "question": "¿Cuál es la corrección más segura?",
    "options": [
      "Escapar manualmente las comillas y barras antes de interpolar el nombre",
      "Usar una consulta parametrizada con un placeholder para el nombre",
      "Aceptar únicamente nombres con caracteres alfanuméricos mediante una expresión regular",
      "Ejecutar la consulta con una cuenta de base de datos de privilegios mínimos"
    ],
    "answer": 1,
    "explanation": "Entrada controlada por usuario se concatena dentro de consulta SQL. Permite alterar estructura de consulta.",
    "remediation": "Usar parámetros preparados: db.get(\"SELECT * FROM users WHERE username = ?\", [req.body.username])."
  },
  {
    "id": "command-ping",
    "language": "JavaScript",
    "difficulty": "Media",
    "scenario": "Panel interno permite comprobar conectividad con un host.",
    "code": "exec(`ping -c 1 ${req.body.host}`, (error, stdout) => {\n  res.send(stdout);\n});",
    "question": "¿Qué cambio elimina riesgo principal?",
    "options": [
      "Escapar el host con una función específica de shell antes de interpolarlo",
      "Rechazar una lista de metacaracteres como punto y coma, ampersand y barra vertical",
      "Usar spawn con argumentos separados, sin shell, y validar el host como IP o nombre permitido",
      "Ejecutar ping en un proceso aislado con una cuenta sin privilegios"
    ],
    "answer": 2,
    "explanation": "Valor recibido se interpreta dentro de shell. Metacaracteres permiten ejecutar comandos adicionales.",
    "remediation": "Usar spawn('ping', ['-c', '1', host]) tras validar host como IP o nombre permitido."
  },
  {
    "id": "path-download",
    "language": "JavaScript",
    "difficulty": "Media",
    "scenario": "Aplicación descarga archivos subidos previamente.",
    "code": "const file = path.join('/srv/uploads', req.query.name);\nres.sendFile(file);",
    "question": "¿Qué control falta?",
    "options": [
      "Resolver la ruta, verificar que permanece dentro de /srv/uploads y controlar también enlaces simbólicos",
      "Eliminar segmentos .. y separadores de directorio del nombre recibido",
      "Permitir solamente un conjunto cerrado de extensiones de archivo",
      "Comprobar que el archivo existe y que el proceso puede leerlo antes de enviarlo"
    ],
    "answer": 0,
    "explanation": "Segmentos como ../ pueden resolver fuera del directorio autorizado y exponer archivos del sistema.",
    "remediation": "Resolver ruta absoluta y rechazar cualquier resultado fuera del directorio base; preferible usar identificadores almacenados."
  },
  {
    "id": "idor-invoice",
    "language": "JavaScript",
    "difficulty": "Fácil",
    "scenario": "Usuario autenticado consulta una factura mediante su identificador.",
    "code": "app.get('/invoice/:id', requireAuth, async (req, res) => {\n  res.json(await invoices.findById(req.params.id));\n});",
    "question": "¿Qué vulnerabilidad conserva requireAuth?",
    "options": [
      "CSRF, porque una solicitud autenticada podría originarse desde otro sitio aunque la ruta solo lea datos",
      "Enumeración de recursos, porque identificadores consecutivos podrían revelar qué facturas existen",
      "IDOR, porque estar autenticado no demuestra que el usuario esté autorizado a consultar esa factura",
      "Exposición de datos en caché, porque una respuesta JSON podría almacenarse sin cabeceras privadas"
    ],
    "answer": 2,
    "explanation": "Autenticación confirma identidad, pero código no comprueba autorización sobre factura solicitada.",
    "remediation": "Consultar factura por id y ownerId del usuario autenticado, o aplicar política de autorización equivalente."
  },
  {
    "id": "xss-comment",
    "language": "JavaScript",
    "difficulty": "Fácil",
    "scenario": "Frontend muestra comentario recibido desde API.",
    "code": "commentBox.innerHTML = apiResponse.comment;",
    "question": "¿Qué cambio evita por completo que el comentario pase por el parser HTML?",
    "options": [
      "Codificar entidades HTML y continuar asignando el resultado mediante innerHTML",
      "Asignar el comentario mediante textContent para que el navegador lo trate exclusivamente como texto",
      "Sanitizar el comentario con una lista de etiquetas permitidas antes de usar innerHTML",
      "Aplicar una política CSP estricta para reducir el impacto de contenido activo inyectado"
    ],
    "answer": 1,
    "explanation": "innerHTML interpreta marcado controlado por usuario y puede ejecutar contenido activo.",
    "remediation": "Asignar texto mediante textContent. Si HTML fuera necesario, usar sanitizador mantenido y política estricta."
  },
  {
    "id": "jwt-decode",
    "language": "JavaScript",
    "difficulty": "Media",
    "scenario": "Middleware obtiene identidad desde token JWT enviado por cliente.",
    "code": "const payload = jwt.decode(req.headers.authorization.slice(7));\nreq.user = payload.sub;",
    "question": "¿Qué comprobación crítica falta?",
    "options": [
      "Comprobar únicamente que el token tiene tres segmentos y que su JSON es válido",
      "Aceptar el token solo mediante HTTPS y limitar su longitud antes de decodificarlo",
      "Verificar firma y algoritmo, además de expiración, emisor y audiencia esperados",
      "Comparar el campo sub con una cuenta existente después de decodificar el token"
    ],
    "answer": 2,
    "explanation": "decode solo interpreta contenido. No demuestra autenticidad ni validez del token.",
    "remediation": "Usar jwt.verify con clave correcta y restricciones explícitas de algoritmo, issuer y audience."
  },
  {
    "id": "portal-socios",
    "language": "Python",
    "difficulty": "Media",
    "scenario": "Un portal envía por correo un enlace para restablecer la contraseña.",
    "code": "token = str(int(time.time()))\nreset_links[token] = user.id\nsend_mail(user.email, f\"/reset?token={token}\")",
    "question": "¿Qué defecto permite adivinar tokens válidos sin acceder al almacenamiento?",
    "options": [
      "El token es predecible porque deriva directamente de una marca de tiempo observable",
      "Dos solicitudes creadas en el mismo segundo pueden producir el mismo token y sobrescribir su asociación",
      "El token podría filtrarse mediante historial, registros o la cabecera Referer al incluirse en la URL",
      "Guardar el token sin una representación hash aumenta el impacto de una filtración del almacenamiento"
    ],
    "answer": 0,
    "explanation": "Un atacante puede estimar la hora de creación y probar tokens cercanos para apropiarse del proceso de recuperación.",
    "remediation": "Generar tokens con secrets.token_urlsafe(), asociarlos al usuario y aplicar caducidad, uso único y limitación de intentos."
  },
  {
    "id": "area-proveedores",
    "language": "PHP",
    "difficulty": "Difícil",
    "scenario": "Una aplicación conserva la sesión existente cuando el usuario inicia sesión correctamente.",
    "code": "session_start();\nif (validar($_POST['user'], $_POST['pass'])) {\n    $_SESSION['user'] = $_POST['user'];\n}",
    "question": "¿Qué riesgo presenta este flujo?",
    "options": [
      "La autenticación no muestra una limitación de intentos para frenar pruebas repetidas de contraseñas",
      "Un identificador de sesión fijado antes del inicio de sesión puede conservarse después de autenticar",
      "La cookie de sesión podría carecer de atributos Secure, HttpOnly o SameSite adecuados",
      "El flujo de acceso podría aceptar una solicitud de inicio de sesión iniciada desde otro sitio"
    ],
    "answer": 1,
    "explanation": "Si el identificador no cambia tras autenticarse, quien haya conseguido fijarlo puede reutilizar la sesión ya autenticada.",
    "remediation": "Ejecutar session_regenerate_id(true) inmediatamente después de autenticar y configurar cookies de sesión seguras."
  },
  {
    "id": "acceso-federado",
    "language": "Java",
    "difficulty": "Difícil",
    "scenario": "Un servicio inicia un flujo de acceso federado y acepta una dirección de retorno enviada por el navegador.",
    "code": "String next = request.getParameter(\"next\");\nresponse.sendRedirect(\"/oauth/start?redirect_uri=\" +\n    URLEncoder.encode(next, UTF_8));",
    "question": "¿Qué control de seguridad falta?",
    "options": [
      "Exigir HTTPS para next, aunque cualquier dominio externo que use HTTPS seguiría siendo aceptado",
      "Añadir state para vincular la respuesta OAuth con el navegador que inició el flujo",
      "Comparar exactamente el destino con una lista cerrada de URI de retorno registradas",
      "Usar PKCE para proteger el código de autorización si llegara a ser interceptado"
    ],
    "answer": 2,
    "explanation": "Aceptar destinos arbitrarios puede desviar respuestas del flujo de autenticación a ubicaciones controladas por terceros.",
    "remediation": "Registrar previamente las URI válidas y comparar exactamente esquema, host, puerto y ruta antes de iniciar el flujo."
  },
  {
    "id": "panel-clinico",
    "language": "C#",
    "difficulty": "Media",
    "scenario": "Un panel crea una cookie persistente después de validar las credenciales.",
    "code": "Response.Cookies.Append(\"auth\", token, new CookieOptions {\n    Expires = DateTimeOffset.UtcNow.AddDays(30)\n});",
    "question": "¿Qué configuración protege frente a envío sin TLS, lectura por JavaScript y solicitudes entre sitios?",
    "options": [
      "Reducir la persistencia de treinta días y renovar el token después de operaciones sensibles",
      "Restringir Path y Domain para reducir los destinos a los que el navegador envía la cookie",
      "Guardar en la cookie solo un identificador opaco y mantener el estado de sesión en el servidor",
      "Activar Secure y HttpOnly, y seleccionar una política SameSite compatible con el flujo requerido"
    ],
    "answer": 3,
    "explanation": "Sin estos atributos, la cookie queda más expuesta a transporte inseguro, acceso desde scripts y solicitudes entre sitios.",
    "remediation": "Configurar Secure=true, HttpOnly=true y SameSite=Lax o Strict según el flujo; limitar además duración y alcance."
  },
  {
    "id": "cuenta-academica",
    "language": "Python",
    "difficulty": "Fácil",
    "scenario": "La pantalla de acceso responde de forma distinta según exista o no la cuenta.",
    "code": "user = find_user(email)\nif not user:\n    return \"Cuenta inexistente\", 404\nif not check_password(user, password):\n    return \"Contraseña incorrecta\", 401",
    "question": "¿Qué información puede obtener una persona no autenticada?",
    "options": [
      "Qué direcciones de correo están registradas",
      "Si una cuenta registrada tiene habilitado un segundo factor",
      "La fecha del último acceso de cada cuenta",
      "Si una cuenta utiliza una contraseña compartida con otro usuario"
    ],
    "answer": 0,
    "explanation": "Las respuestas diferentes permiten comprobar qué cuentas existen y facilitan ataques posteriores dirigidos.",
    "remediation": "Devolver un mensaje y estado equivalentes, mantener tiempos similares y registrar o limitar intentos repetidos."
  },
  {
    "id": "gestion-nominas",
    "language": "PHP",
    "difficulty": "Media",
    "scenario": "Un usuario autenticado puede cambiar su correo desde un formulario del portal.",
    "code": "session_start();\nif ($_SERVER['REQUEST_METHOD'] === 'POST') {\n    actualizarCorreo($_SESSION['user'], $_POST['email']);\n}",
    "question": "¿Qué amenaza no está siendo mitigada?",
    "options": [
      "Fijación de sesión por conservar un identificador previo al inicio de sesión",
      "Envío de una solicitud de cambio no consentida desde otro sitio",
      "Acceso a la cuenta de otro usuario mediante un identificador manipulable",
      "Inyección SQL causada directamente por aceptar una dirección de correo"
    ],
    "answer": 1,
    "explanation": "La sesión se adjunta automáticamente y no hay un valor que demuestre que la solicitud nació en el formulario legítimo.",
    "remediation": "Añadir un token CSRF impredecible vinculado a la sesión, validarlo en el servidor y aplicar SameSite a la cookie."
  },
  {
    "id": "intranet-regional",
    "language": "Java",
    "difficulty": "Media",
    "scenario": "El acceso a una intranet solo comprueba usuario y contraseña, sin controlar intentos fallidos.",
    "code": "if (authService.check(user, password)) {\n    createSession(user);\n} else {\n    response.setStatus(401);\n}",
    "question": "¿Qué riesgo aumenta con esta implementación?",
    "options": [
      "Enumeración de usuarios mediante respuestas distintas para cuentas inexistentes",
      "Fijación de sesión por reutilizar necesariamente una cookie anterior",
      "Pruebas automatizadas masivas de contraseñas y credenciales filtradas",
      "Suplantación de solicitudes porque el fragmento no muestra un token CSRF"
    ],
    "answer": 2,
    "explanation": "Sin límites por cuenta, origen o contexto, pueden realizarse numerosos intentos de contraseña o reutilizar credenciales filtradas.",
    "remediation": "Aplicar limitación progresiva, detección de anomalías, MFA y alertas, evitando bloqueos rígidos que permitan denegación de servicio."
  },
  {
    "id": "reserva-corporativa",
    "language": "C#",
    "difficulty": "Difícil",
    "scenario": "Una aplicación guarda el estado de autenticación directamente en una cookie creada por el servidor.",
    "code": "var value = $\"{user.Id}:{user.Role}\";\nResponse.Cookies.Append(\"session\", value);",
    "question": "¿Por qué no debe confiarse en este valor al recibirlo?",
    "options": [
      "Usar TLS impediría que el propio cliente alterase el contenido almacenado",
      "Codificar el valor en Base64 garantizaría su integridad al devolverlo",
      "Configurar SameSite evitaría cualquier modificación local de la cookie",
      "El cliente puede modificar el identificador o el rol si el valor no tiene protección criptográfica de integridad"
    ],
    "answer": 3,
    "explanation": "Una cookie es controlable por el cliente; sin firma o cifrado autenticado, sus campos pueden alterarse antes de devolverla.",
    "remediation": "Usar el mecanismo de autenticación del framework o una cookie firmada y validada, con expiración, rotación y atributos seguros."
  },
  {
    "id": "python-reemplazo-archivo",
    "language": "Python",
    "difficulty": "Difícil",
    "scenario": "Un servicio genera informes en un directorio compartido. Antes de escribir, comprueba que el destino no sea un enlace simbólico.",
    "code": "if not os.path.islink(path):\n    with open(path, \"w\") as f:\n        f.write(report)",
    "question": "¿Qué riesgo persiste en este flujo?",
    "options": [
      "Otros lectores podrían observar un informe parcialmente escrito mientras se reemplaza",
      "Otro proceso puede sustituir la ruta entre la comprobación y la apertura",
      "Dos escritores concurrentes podrían truncar y sobrescribir el mismo informe",
      "La codificación de texto predeterminada podría no coincidir con la esperada"
    ],
    "answer": 1,
    "explanation": "Existe una condición TOCTOU: otro proceso puede sustituir la ruta después de la comprobación y antes de open.",
    "remediation": "Abrir de forma atómica con banderas que rechacen enlaces simbólicos y operar mediante descriptores dentro de un directorio confiable."
  },
  {
    "id": "bash-temporal-compartido",
    "language": "Bash",
    "difficulty": "Media",
    "scenario": "Una tarea programada con privilegios guarda datos intermedios antes de publicarlos.",
    "code": "tmp=/tmp/report-$USER.txt\nprintf '%s\\n' \"$DATA\" > \"$tmp\"\nprocess \"$tmp\"",
    "question": "¿Cuál es el principal problema de seguridad?",
    "options": [
      "El contenido de DATA se vuelve a evaluar como sintaxis del shell al expandirse entre comillas",
      "Una interrupción durante printf puede dejar un informe incompleto para el procesamiento posterior",
      "El nombre predecible permite que otro usuario prepare, sustituya o enlace el archivo temporal",
      "process recibe el nombre del archivo como argumento en lugar de recibir sus datos por la entrada estándar"
    ],
    "answer": 2,
    "explanation": "Una ruta temporal predecible en un directorio compartido puede colisionar o ser preparada por otro usuario mediante archivos o enlaces.",
    "remediation": "Crear el temporal con mktemp, aplicar permisos restrictivos y eliminarlo con trap al finalizar."
  },
  {
    "id": "powershell-acl-heredada",
    "language": "PowerShell",
    "difficulty": "Media",
    "scenario": "Un servicio exporta copias de configuración que pueden contener secretos a una carpeta local.",
    "code": "$dir = 'C:\\Service\\Backups'\nNew-Item $dir -ItemType Directory -Force\n$config | Out-File \"$dir\\config.json\"",
    "question": "¿Qué control protege mejor la confidencialidad de la copia exportada?",
    "options": [
      "Validar que el contenido pueda analizarse como JSON antes de escribirlo",
      "Verificar que la ACL y sus permisos efectivos limiten el acceso a las identidades necesarias",
      "Comprobar que la codificación usada por Out-File sea compatible con el consumidor",
      "Evitar que exportaciones simultáneas escriban parcialmente el mismo archivo"
    ],
    "answer": 1,
    "explanation": "La carpeta puede heredar permisos demasiado amplios, dejando secretos legibles o modificables por usuarios no autorizados.",
    "remediation": "Crear la carpeta con una ACL explícita de mínimo privilegio y verificar propietario, herencia y permisos efectivos."
  },
  {
    "id": "java-estado-compartido",
    "language": "Java",
    "difficulty": "Media",
    "scenario": "Un backend reutiliza una instancia para contar solicitudes procesadas por varios hilos.",
    "code": "class Metrics {\n  private int requests;\n  void record() { requests++; }\n  int total() { return requests; }\n}",
    "question": "¿Qué comportamiento puede aparecer bajo carga concurrente?",
    "options": [
      "Incrementos perdidos y lecturas potencialmente obsoletas por acceder al contador sin sincronización",
      "Una ConcurrentModificationException porque el contador cambia durante total()",
      "Un interbloqueo porque cada método de instancia adquiere implícitamente el monitor",
      "Una copia independiente del contador para cada hilo creada automáticamente por la JVM"
    ],
    "answer": 0,
    "explanation": "requests++ combina lectura, suma y escritura. Dos hilos pueden leer el mismo valor y sobrescribir sus resultados.",
    "remediation": "Usar AtomicInteger o sincronización coherente para las lecturas y escrituras del estado compartido."
  },
  {
    "id": "go-mapa-sesiones",
    "language": "Go",
    "difficulty": "Fácil",
    "scenario": "Un servidor mantiene sesiones en memoria mientras varias solicitudes las consultan y actualizan.",
    "code": "var sessions = map[string]string{}\nfunc save(id, user string) { sessions[id] = user }\nfunc load(id string) string { return sessions[id] }",
    "question": "¿Qué defecto presenta esta implementación?",
    "options": [
      "Una búsqueda de una clave inexistente provoca automáticamente un panic",
      "Cada goroutine recibe una copia aislada del mapa al llamar a save o load",
      "Solo habría una carrera si dos goroutines utilizaran exactamente el mismo identificador",
      "El mapa admite lecturas y escrituras concurrentes sin coordinación, lo que puede causar carreras y fallos en tiempo de ejecución"
    ],
    "answer": 3,
    "explanation": "Los mapas normales de Go no permiten lecturas y escrituras concurrentes sin sincronización y pueden provocar carreras o fallos.",
    "remediation": "Proteger el mapa con sync.RWMutex o usar sync.Map cuando su patrón de acceso sea adecuado."
  },
  {
    "id": "csharp-espera-asincrona",
    "language": "C#",
    "difficulty": "Difícil",
    "scenario": "Una aplicación de servidor obtiene datos mediante una API asíncrona desde un método que se ejecuta en un contexto sincronizado.",
    "code": "string Load() {\n    return FetchAsync().Result;\n}",
    "question": "¿Qué problema puede causar este patrón?",
    "options": [
      "FetchAsync se ejecuta íntegramente de forma síncrona antes de que Result empiece a esperar",
      "Result inicia una segunda ejecución de FetchAsync para obtener el valor",
      "La espera bloqueante puede causar interbloqueo en un contexto sincronizado o agotar los hilos del servidor",
      "El hilo queda liberado para atender otras solicitudes mientras Result espera"
    ],
    "answer": 2,
    "explanation": "Bloquear con Result puede impedir que continúe la operación asíncrona en ciertos contextos y reduce la capacidad del servidor bajo carga.",
    "remediation": "Propagar async y usar await de extremo a extremo, incluyendo cancelación y límites de tiempo apropiados."
  },
  {
    "id": "python-proceso-sin-limites",
    "language": "Python",
    "difficulty": "Fácil",
    "scenario": "Un worker ejecuta una herramienta interna para analizar cada archivo recibido.",
    "code": "result = subprocess.run(\n    [\"analyzer\", file_path],\n    capture_output=True\n)",
    "question": "¿Qué control operativo importante falta?",
    "options": [
      "Definir un tiempo máximo, limitar CPU y memoria, y acotar la salida capturada",
      "Comprobar el código de salida con check=True para detectar análisis fallidos",
      "Validar que file_path pertenezca al directorio de archivos recibidos",
      "Ejecutar el analizador con una prioridad de CPU más baja"
    ],
    "answer": 0,
    "explanation": "Aunque no se usa una shell, un proceso lento o una salida ilimitada puede retener workers, memoria y descriptores.",
    "remediation": "Configurar timeout, limitar tamaño de entrada y salida, aplicar cuotas de recursos y cancelar procesos que excedan los límites."
  },
  {
    "id": "java-bloqueos-invertidos",
    "language": "Java",
    "difficulty": "Difícil",
    "scenario": "Dos operaciones transfieren estado entre cuentas y adquieren sus bloqueos en el orden recibido.",
    "code": "synchronized (from) {\n  synchronized (to) {\n    transfer(from, to);\n  }\n}",
    "question": "¿Qué fallo puede ocurrir si dos solicitudes invierten las cuentas?",
    "options": [
      "Una actualización perdida porque synchronized no protege objetos distintos",
      "Un livelock en el que ambos hilos liberan y reintentan continuamente",
      "Una lectura sucia del estado de las cuentas durante la transferencia",
      "Un interbloqueo: cada hilo conserva una cuenta mientras espera la otra"
    ],
    "answer": 3,
    "explanation": "Una solicitud puede bloquear A y esperar B mientras otra bloquea B y espera A, formando un interbloqueo.",
    "remediation": "Adquirir los bloqueos según un orden global estable o usar una estrategia transaccional que evite bloqueos anidados."
  },
  {
    "id": "payment-reference",
    "language": "Python",
    "difficulty": "Media",
    "scenario": "Un servicio genera una firma para validar referencias de pago enviadas entre sistemas internos.",
    "code": "import hashlib\n\ndef sign(reference):\n    return hashlib.sha256(reference.encode()).hexdigest()",
    "question": "¿Cuál es el principal problema de seguridad?",
    "options": [
      "La salida hexadecimal reduce la resistencia a colisiones de SHA-256",
      "El hash no usa una clave secreta, por lo que cualquiera puede recalcularlo para otra referencia",
      "La ausencia de una sal permite precalcular firmas, aunque la referencia tenga alta entropía",
      "SHA-256 no cifra la referencia y por eso esta puede recuperarse directamente desde el hash"
    ],
    "answer": 1,
    "explanation": "Un hash sin clave no autentica el origen del dato. Cualquiera que conozca la referencia puede generar el mismo valor y presentar una referencia modificada como válida.",
    "remediation": "Usar HMAC-SHA-256 con una clave aleatoria almacenada en un gestor de secretos, comparar firmas en tiempo constante y rotar la clave de forma controlada."
  },
  {
    "id": "deployment-values",
    "language": "YAML",
    "difficulty": "Fácil",
    "scenario": "Un archivo de despliegue se conserva en el repositorio para configurar una aplicación de soporte.",
    "code": "app:\n  image: support-api:2.4\n  environment:\n    DB_USER: support\n    DB_PASSWORD: \"prod-2026-secret\"",
    "question": "¿Qué riesgo requiere atención prioritaria?",
    "options": [
      "La etiqueta de imagen no está fijada mediante un digest verificable",
      "Una credencial de producción queda expuesta en el archivo, el historial y las copias del repositorio",
      "La configuración no declara límites de CPU y memoria para la aplicación",
      "El fragmento no muestra una configuración explícita de cifrado para la conexión a PostgreSQL"
    ],
    "answer": 1,
    "explanation": "El secreto queda expuesto a cualquier persona o sistema con acceso al repositorio, su historial, copias o registros del proceso de despliegue.",
    "remediation": "Retirar y rotar la contraseña, obtenerla en tiempo de ejecución desde un gestor de secretos y evitar que los valores sensibles aparezcan en repositorios o logs."
  },
  {
    "id": "analytics-database",
    "language": "Terraform",
    "difficulty": "Media",
    "scenario": "Un equipo crea una base de datos administrada para almacenar métricas de clientes.",
    "code": "resource \"aws_security_group\" \"db\" {\n  name = \"analytics-db\"\n}\n\nresource \"aws_security_group_rule\" \"db\" {\n  security_group_id = aws_security_group.db.id\n  type              = \"ingress\"\n  from_port         = 5432\n  to_port           = 5432\n  protocol          = \"tcp\"\n  cidr_blocks       = [\"0.0.0.0/0\"]\n}\n\nresource \"aws_db_instance\" \"analytics\" {\n  identifier                  = \"analytics\"\n  engine                      = \"postgres\"\n  instance_class              = \"db.t3.micro\"\n  allocated_storage           = 20\n  username                    = \"analytics_admin\"\n  manage_master_user_password = true\n  publicly_accessible         = true\n  vpc_security_group_ids      = [aws_security_group.db.id]\n}",
    "question": "¿Qué cambio reduce mejor la superficie de exposición?",
    "options": [
      "Exigir TLS y certificados válidos, manteniendo la instancia accesible públicamente",
      "Cambiar el puerto predeterminado para reducir exploraciones automatizadas",
      "Deshabilitar el acceso público, usar subredes privadas y permitir 5432 solo desde el grupo de seguridad de la aplicación",
      "Restringir el CIDR a la red corporativa, aunque la base de datos continúe en una subred pública"
    ],
    "answer": 2,
    "explanation": "La instancia es pública y acepta conexiones desde cualquier dirección. Esto expone el servicio a exploración, intentos de acceso y errores de autenticación.",
    "remediation": "Deshabilitar el acceso público, desplegar la base de datos en subredes privadas y permitir el puerto únicamente desde identidades o grupos de seguridad autorizados."
  },
  {
    "id": "document-preview",
    "language": "Java",
    "difficulty": "Difícil",
    "scenario": "Una aplicación empresarial genera una vista previa a partir de una URL proporcionada por el usuario.",
    "code": "String target = request.getParameter(\"url\");\nURL url = new URL(target);\ntry (InputStream in = url.openStream()) {\n    return in.readNBytes(4096);\n}",
    "question": "¿Qué control es más importante antes de realizar la solicitud?",
    "options": [
      "Aceptar únicamente URLs HTTPS con certificados válidos",
      "Bloquear direcciones privadas escritas literalmente en la URL solicitada",
      "Aplicar límites estrictos de tiempo, tamaño de respuesta y número de conexiones",
      "Permitir solo destinos autorizados, verificar las IP resueltas y volver a validar cada redirección"
    ],
    "answer": 3,
    "explanation": "El servidor realiza solicitudes hacia destinos controlados por el usuario. Sin validación efectiva, podría alcanzar servicios internos, interfaces administrativas o metadatos de nube.",
    "remediation": "Usar una lista permitida de destinos, resolver y verificar las direcciones IP, bloquear redes privadas y especiales, volver a validar cada redirección y aplicar límites de tiempo y tamaño."
  },
  {
    "id": "profile-transfer",
    "language": "PHP",
    "difficulty": "Difícil",
    "scenario": "Un portal permite importar preferencias de usuario exportadas previamente por el navegador.",
    "code": "$data = base64_decode($_POST['profile']);\n$profile = unserialize($data);\nsavePreferences($profile);",
    "question": "¿Cuál es la debilidad principal del flujo?",
    "options": [
      "base64_decode sin modo estricto puede aceptar representaciones Base64 malformadas",
      "La entrada no tiene un límite de tamaño antes de decodificarse y procesarse",
      "unserialize reconstruye datos no confiables y puede instanciar objetos con comportamientos peligrosos",
      "La exportación no demuestra su integridad, por lo que el cliente puede alterar preferencias legítimas"
    ],
    "answer": 2,
    "explanation": "unserialize puede reconstruir objetos y activar comportamientos definidos por clases disponibles en la aplicación. El contenido procede directamente del cliente y no es confiable.",
    "remediation": "Sustituir la serialización nativa por JSON, validar el esquema y los tipos permitidos, rechazar campos desconocidos y proteger la integridad de las exportaciones cuando sea necesario."
  },
  {
    "id": "campaign-checkout",
    "language": "C#",
    "difficulty": "Media",
    "scenario": "Una API de comercio recibe el porcentaje de descuento calculado por la interfaz durante una campaña.",
    "code": "var discount = request.DiscountPercent;\nvar total = cart.Subtotal * (1 - discount / 100m);\nawait Charge(request.CustomerId, total);",
    "question": "¿Qué defecto puede afectar directamente al importe cobrado?",
    "options": [
      "El servidor usa directamente un descuento controlado por el cliente sin recalcular elegibilidad, vigencia ni límites",
      "El importe no muestra una política explícita de redondeo a la unidad mínima de la moneda",
      "La llamada de cobro no muestra una clave de idempotencia para gestionar reintentos",
      "El identificador de cliente recibido no muestra una comprobación de autorización sobre la cuenta de cobro"
    ],
    "answer": 0,
    "explanation": "El cliente puede alterar el porcentaje porque el servidor no determina si la campaña existe, está vigente o corresponde al usuario y a los productos del carrito.",
    "remediation": "Calcular el descuento exclusivamente en el servidor a partir de reglas autorizadas, validar límites y elegibilidad, y registrar la promoción aplicada junto con el importe final."
  },
  {
    "id": "service-runtime",
    "language": "JavaScript",
    "difficulty": "Fácil",
    "scenario": "Una API administrativa reutiliza la misma configuración en desarrollo y producción.",
    "code": "app.use(cors({ origin: true, credentials: true }));\napp.set(\"env\", \"development\");\napp.use(errorHandler({ exposeStack: true }));",
    "question": "¿Qué combinación representa el mayor riesgo en producción?",
    "options": [
      "Fijar el entorno en development mediante código puede desactivar optimizaciones de producción",
      "Reflejar orígenes con credenciales y exponer trazas permite solicitudes desde sitios no autorizados y revela detalles internos",
      "Registrar CORS antes del manejador de errores puede dejar algunas respuestas de error con cabeceras diferentes",
      "No declarar explícitamente métodos y cabeceras CORS permitidos amplía más de lo necesario las solicitudes de navegador"
    ],
    "answer": 1,
    "explanation": "Reflejar orígenes mientras se permiten credenciales amplía el acceso desde navegadores no autorizados. Además, las trazas pueden revelar rutas, dependencias y detalles internos.",
    "remediation": "Mantener una lista explícita de orígenes autorizados, limitar credenciales a los casos necesarios y desactivar mensajes detallados y trazas para respuestas de producción."
  },
  {
    "id": "password-storage",
    "language": "Python",
    "difficulty": "Media",
    "scenario": "Un servicio almacena credenciales locales después de registrar una cuenta.",
    "code": "import hashlib\n\ndef password_hash(password):\n    return hashlib.sha256(password.encode()).hexdigest()",
    "question": "¿Qué cambio protege mejor las contraseñas si se filtra la base de datos?",
    "options": [
      "Añadir un pepper global manteniendo SHA-256 como única derivación",
      "Usar una función lenta para contraseñas con salt único, como Argon2id",
      "Calcular SHA-256 en el navegador antes de enviarlo por TLS",
      "Sustituir SHA-256 por SHA-512 sin cambiar el resto del diseño"
    ],
    "answer": 1,
    "explanation": "SHA-256 es rápido y el mismo password produce el mismo resultado. Esto facilita comprobar grandes diccionarios y reutilizar cálculos entre cuentas.",
    "remediation": "Usar Argon2id, scrypt o bcrypt con parámetros de coste adecuados y salt único generado por una biblioteca mantenida; considerar pepper separado como defensa adicional."
  }
];

export default challenges;

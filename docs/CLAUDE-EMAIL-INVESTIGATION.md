# Cloudflare email para Anillos: plan y prompt para Claude

Investigación preparada el **6 de octubre de 2026**. No se habilitó envío, routing ni recuperación por email. No se modificó DNS ni se enviaron mensajes. El acceso actual al panel sigue usando email y contraseña; la recuperación disponible es manual, mediante otro dueño autenticado o `create-owner`/setup protegido contra la base correcta.

## Hechos verificados y decisión propuesta

La skill local `cloudflare-email` existe en Claude. Su `references/facts.md` indica verificación del **29 de septiembre de 2026**; para cuotas, costes y API hay que contrastarla con la documentación vigente, sin copiar valores de otro proyecto.

Email Routing recibe y reenvía mensajes a destinos verificados o a un Worker. Se propone empezar con direcciones explícitas de atención y pedidos, cuyos nombres finales elegirá el dueño. No hace falta construir un buzón dentro de Anillos para este primer paso. [Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/).

Email Sending permite enviar desde el backend de Hostinger mediante REST, sin mover esta aplicación a Workers. La ruta publicada es `POST /accounts/{account_id}/email/sending/send`. La forma exacta del payload y sus respuestas debe verificarse al implementar. [REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/).

Enviar a clientes arbitrarios requiere Workers Paid. La documentación publica 3.000 envíos mensuales incluidos por cuenta y USD 0,35 por cada 1.000 adicionales; enviar a destinos verificados de la cuenta es gratuito. El coste base de Workers debe revisarse aparte. [Email pricing](https://developers.cloudflare.com/email-service/platform/pricing/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

La cuota diaria depende de la cuenta y su reputación; no se debe prometer un límite universal de 200 o 25 mensajes. [Limits](https://developers.cloudflare.com/email-service/platform/limits/).

Routing usa MX en el dominio raíz y no comparte esa recepción con servidores externos. Sending usa registros separados en `cf-bounce`. Hay que inventariar el correo existente antes de cambiar la recepción y conservar SPF/DMARC válidos. Los nuevos dominios tienen vista previa del contenido enviado activada: revisar y desactivarla antes de usar enlaces de recuperación. [Domain configuration](https://developers.cloudflare.com/email-service/configuration/domains/).

## Orden de implementación recomendado

1. **Recepción:** inventario de correo/DNS existente, destinos verificados y routing de atención. El dueño realiza los pasos de Cloudflare; primero preservar el correo que ya funcione.
2. **Adaptador de envío:** credenciales sólo del servidor, remitente del dominio verificado, HTML y texto en español, timeout, respuestas y fallos acotados. Servicio apagado si falta configuración; integración siguiendo `src/lib/integraciones.ts`, nunca `NEXT_PUBLIC_*`.
3. **Recuperación del panel:** solicitud y confirmación con respuestas genéricas, límites por IP y cuenta, tokens aleatorios de un solo uso almacenados como hash, vencimiento breve, consumo atómico y revocación de sesiones al cambiar contraseña. Repetir contraseña y controles de visibilidad. Mantener la recuperación manual hasta probar el flujo completo.
4. **Clientes opcionales:** evaluar aparte. Hoy el email del cliente es opcional y no está verificado; definir verificación segura antes de usarlo como recuperación. No habilitar registro obligatorio ni mezclar tablas/cookies del cliente y del panel.
5. **Pedidos:** después de recuperación y entrega probadas, avisos al comercio y al comprador para quien proporcionó email. Integrar con estados reales y envío fiable; no reemplazar WhatsApp ni modificar inventario, cobros o transiciones. Marketing queda para una fase propia con consentimiento.

Las reglas de seguridad de recuperación siguen la [guía de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). El diseño exacto de tablas, colas y tiempos se decide al auditar el repo; no se asume que exista una arquitectura de email copiable de otra tienda.

## Prompt listo para pegar en Claude

```text
Investigá cómo implementar Cloudflare Email Routing y Email Sending para
anillos.com.py, sin cambiar todavía código, DNS, dashboard ni producción.
Quiero recepción de atención/pedidos, recuperación de contraseña del admin
y luego mensajes transaccionales de pedidos. La app sigue en Hostinger:
Next.js 16, MySQL/MariaDB, Drizzle, iron-session y cuentas de cliente opcionales.

Leé AGENTS.md, CLAUDE.md, ARCH.md, NEW-STORE.md, DEPLOY.md y
docs/ADMIN-SETUP.md. Leé la skill cloudflare-email de mi carpeta de skills
de Claude, empezando por references/facts.md (verificado 2026-09-29), y
architecture.md/onboard-site.md sólo según sea necesario. Sus ejemplos de
otros sitios NO prueban que Anillos ya tenga adaptador, Worker o buzón.

Auditá el código existente: admin-auth, auth, session, session-validation,
customer-session, acciones de cuenta, schema users/customers, integraciones,
secret-box, outbox y crons. Identificá qué existe y qué habría que añadir.
El setup nuevo ya tiene contraseña repetida, ojos, login normal y bienvenida.
No necesito un segundo sistema de acceso ni registro público de admins.

Verificá contra documentación oficial actual:
- Distinción entre Routing (recepción) y Sending (envío).
- REST desde Hostinger frente a SMTP/Worker: recomendá la opción mínima.
- Plan efectivo, costes, cuenta compartida entre dominios y cuota real:
  no uses 200/25 diarios como regla universal ni datos antiguos de la skill.
- Payload y respuesta vigentes, token de permisos mínimos, remitente
  verificado, destinos verificados frente a clientes arbitrarios.
- DNS existente, MX, SPF, DKIM, DMARC, cf-bounce, DNSSEC y reversión;
  evitá cortar correo existente o tocar registros web de Hostinger.
- Vistas previas/logs que puedan guardar enlaces secretos de recuperación,
  supresiones, bounces, eventos, reintentos y observabilidad sin secretos.

Proponé fases concretas:
1. Routing de direcciones explícitas elegidas por mí a destinos verificados.
2. Adaptador de envío del backend, apagado si falta configuración.
3. Recuperación admin con solicitud de respuesta genérica, límites por IP
   y cuenta, token aleatorio hasheado, un solo uso, vencimiento, consumo
   atómico, contraseña repetida y revocación de todas las sesiones previas.
4. Verificación/recuperación de clientes sólo si habilitamos esas cuentas:
   el email actual es opcional y no prueba propiedad; ninguna cuenta cliente
   puede recuperar o entrar en una cuenta del panel.
5. Avisos reales de pedidos mediante entrega fiable ligada a los estados,
   sin alterar checkout invitado, transición de pedidos, dinero o stock.

Incluí pruebas de expiración/reuso/concurrencia, usuario inexistente o
inactivo, bloqueo por límite, caída del proveedor, rutas/URLs maliciosas,
no filtración de tokens en logs o referer, sesión vieja revocada y separación
admin/cliente. Los enlaces deben usar un origen HTTPS de configuración,
no Host enviado por el cliente. No iniciar sesión automáticamente al reset.
No mandar contraseñas por email ni loguear tokens o cuerpos secretos.

Entregá:
- Hallazgos del repo con rutas reales y limitaciones actuales.
- Arquitectura recomendada, alternativas y costes verificados con fuentes.
- Lista de archivos, cambios de schema/migraciones y nombres de variables
  opcionales o campos cifrados del panel; NO sus valores.
- Pasos de Cloudflare que yo haré, checklist de pruebas y rollback.
- Qué puede hacerse ahora y qué requiere configuración confirmada.

No pidas ni guardes API tokens, account IDs o secretos en archivos o chat.
No modifiques DNS/nameservers/dashboard ni envíes correos. No agregues GTM
o analytics. Parate tras el informe. Si después autorizo implementación,
respetá las reglas del repo y la skill para migraciones: PR con migración
generada y revisión explícita; no ejecutar cambios contra la base real.
```

No se necesita cambiar el entorno actual para usar el nuevo setup y la guía. Las variables o campos de email se definirán después de la investigación; no hay que añadir credenciales de email preventivamente.

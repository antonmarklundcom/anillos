# Cloudflare Email: investigación y handoff

Revisado **6 de octubre de 2026**. Complementa [la investigación anterior](CLAUDE-EMAIL-INVESTIGATION.md). Sólo documentación: no se habilitó servicio, creó token, alteró DNS, envió correo ni implementó recuperación. El acceso al panel continúa con email/contraseña; recuperación manual mediante otro dueño autenticado o las herramientas protegidas de creación/recuperación del dueño contra la base correcta.

## Hechos actuales comprobados

**Email Sending está en beta y requiere Workers Paid para el envío general a clientes.** Email Routing es recepción/reenvío, no sustituye el envío transaccional. La aplicación puede permanecer en Hostinger y llamar a la API REST desde su backend. [Resumen oficial](https://developers.cloudflare.com/email-service/), [Inicio de envío](https://developers.cloudflare.com/email-service/get-started/send-emails/), [Inicio de routing](https://developers.cloudflare.com/email-service/get-started/route-emails/).

La API publicada usa `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/email/sending/send`, con token Bearer de permisos de envío. La respuesta puede incluir resultados por destinatario —entregado, pendiente o rebote permanente—: HTTP exitoso no prueba recepción en bandeja de entrada. Verificar payload, errores, autenticación y permisos al implementar. [REST oficial](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/).

El onboarding de envío usa registros de rebotes/SPF en `cf-bounce`, selector DKIM propio y DMARC. Routing usa MX del dominio receptor y su configuración independiente. Antes de aceptar el onboarding, revisar qué registros cambiará y preservar el correo existente; no duplicar SPF ni reemplazar MX sin un plan de migración. [Configuración de dominios](https://developers.cloudflare.com/email-service/configuration/domains/).

La cuota diaria depende de cuenta y reputación. El envío a destinos verificados tiene condiciones especiales y no acredita capacidad general gratuita para clientes. Comprobar cuota, plan, coste y límites reales del account; no copiar «25» o «200 al día» de otro proyecto. [Límites](https://developers.cloudflare.com/email-service/platform/limits/), [Precio vigente](https://developers.cloudflare.com/email-service/platform/pricing/).

## Resultado esperado de la investigación

Entregar un inventario sin secretos: cuenta/zona que gestiona anillos.com.py, elegibilidad del servicio, remitente propuesto y verificado, buzón real para respuestas, DNS actual/requerido, permisos mínimos del token, cuotas y costes, y decisiones pendientes del dueño. Distinguir ausencia de configuración de fallo de entrega. No confundir una regla de recepción activa con sender de salida verificado.

Preparar después un diseño, todavía sin implementación: adaptador REST sólo servidor con timeout y fallos acotados; almacenamiento privado conforme a la arquitectura del repo; estado apagado cuando falta configuración; logs sin tokens, links de reset ni datos innecesarios del cliente. No colocar secretos en `NEXT_PUBLIC_*`, commits o una tabla de contenido público.

La recuperación del panel debe ser un flujo distinto de cuentas de clientes. Antes de implementarla, revisar el esquema de identidad/sesiones y el procedimiento manual vigente. Proponer tokens aleatorios de un solo uso almacenados como hash, vencimiento, consumo atómico, respuestas genéricas, límites de intentos, protección de URL de origen y revocación de sesiones tras cambiar contraseña. El correo opcional de un pedido no acredita identidad ni cuenta verificada. [Guía primaria de seguridad](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

Para pedidos, proponer outbox persistente e idempotencia, envío después del commit, reintentos con backoff y estados de error/rebote observables. El correo debe acompañar los estados reales; un fallo del proveedor no debe duplicar pedidos, descontar inventario otra vez o marcar un pago. Marketing requiere una decisión propia posterior. Estos son requisitos propuestos, no capacidades existentes de Anillos.

## Prompt listo para Claude

```text
Investigá Cloudflare Email Service para anillos.com.py. Por ahora hacé
auditoría y diseño: no cambies código, cuentas, DNS, producción ni envíes
emails. Leé AGENTS.md, CLAUDE.md, ARCH.md, NEW-STORE.md y la documentación
de integraciones del repo. Si existe tu skill cloudflare-email, leela y
contrastá sus facts con las fuentes oficiales actuales; no heredes cuotas
o supuestos de otra tienda.

Objetivo: (1) recibir atención/pedidos si el dueño lo desea; (2) salida
transaccional desde Hostinger vía REST; (3) futura recuperación segura del
admin; (4) después, avisos de pedidos. Separá recepción, envío y cuentas
de clientes. Email Sending es beta: verificá elegibilidad Workers Paid,
costes/cuota de esta cuenta y soporte actual del API.

Consultá:
https://developers.cloudflare.com/email-service/
https://developers.cloudflare.com/email-service/get-started/send-emails/
https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
https://developers.cloudflare.com/email-service/configuration/domains/
https://developers.cloudflare.com/email-service/platform/limits/
https://developers.cloudflare.com/email-service/platform/pricing/

Con acceso de lectura autorizado, identificá la cuenta/zona, estado de
Sending y Routing, sender y direcciones de respuesta propuestas, DNS
existente y cambios que sugeriría el onboarding. No alteres MX/SPF/DKIM/
DMARC. Documentá conflictos y preservación del correo actual. No muestres
tokens, credenciales o cuerpos de mensajes en el informe.

Auditá src/lib/integraciones.ts y el almacenamiento de secretos antes de
proponer configuración. Diseñá permisos mínimos del token, rotación,
adaptador server-only, timeout, tratamiento 401/403/429, estados por
destinatario, redacción de logs y fallback apagado. No NEXT_PUBLIC_*.

Proponé recuperación admin: token aleatorio hasheado, expiración, uso
único y consumo atómico, respuestas genéricas/antienumeración, límites,
origen fiable, cambio de contraseña y revocación de sesiones. Identificá
tablas/migraciones y tests necesarios; preservá el recovery manual.
Las cuentas de clientes están separadas y no deben habilitarse por este
trabajo. No tratés email de checkout como identidad verificada.

Diseñá después una outbox para avisos de pedido con clave idempotente,
commit antes de envío, reintentos acotados y observación de fallos/rebotes;
sin alterar pagos, stock o estados por una respuesta de correo.

Entregá un plan concreto y una matriz: existente / falta configuración /
requiere código / requiere decisión. Incluí un procedimiento futuro de
un único email de prueba a un destinatario del dueño explícitamente
autorizado, con verificación de bandeja, headers SPF/DKIM/DMARC y log.
No ejecutes ese envío ni el onboarding en esta fase. Prepará cambios
revisables y una secuencia de validación antes de cualquier ejecución.
```

Aceptación futura: remitente y DNS verificados, autorización de un destinatario de prueba, entrega comprobada, secretos privados, fallos acotados, reset probado de extremo a extremo con tokens vencidos/reutilizados rechazados, y avisos idempotentes. Hasta entonces el panel no debe anunciar recuperación por email como disponible.

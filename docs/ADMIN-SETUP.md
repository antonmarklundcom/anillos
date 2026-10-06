# Acceso al panel de Anillos

- Panel y login: https://anillos.com.py/admin/login
- Configuración inicial: https://anillos.com.py/setup
- Usuarios y cambio de contraseñas: https://anillos.com.py/admin/usuarios (sólo el dueño autenticado).
- Bienvenida: https://anillos.com.py/admin/bienvenida (sólo el dueño autenticado).
- Guía básica: https://anillos.com.py/admin/guia (también enlazada en la navegación del dueño).

`SETUP_SECRET` habilita la configuración inicial. No es la contraseña del panel: elegí el email y una contraseña propia del dueño, con al menos diez caracteres, letras y números. El formulario pide repetirla y permite mostrar u ocultar los campos de contraseña.

Para crear el primer dueño, abrí `/setup`, ingresá el secreto configurado en el hPanel y los datos de la cuenta. Email, contraseña y repetición son obligatorios. Las contraseñas y el secreto tienen controles para mostrar u ocultar su contenido. El formulario no carga productos de ejemplo. La recuperación de una cuenta existente está dentro de una sección desplegable; dejala sin marcar para la primera inicialización.

Después de una respuesta que confirme que el dueño fue creado o actualizado, el formulario se limpia y verifica las credenciales con las mismas reglas de login habituales. Si inicia sesión, abre `/admin/bienvenida`, con los pasos iniciales y un enlace a la guía. Si el ingreso automático falla, conserva la confirmación de cuenta guardada y ofrece el login con destino a la bienvenida: no hay que repetir la creación. Ningún secreto ni contraseña viaja en esa URL o se guarda en almacenamiento del navegador.

Los pasos de migración y el preflight técnico quedan en un desplegable para diagnóstico. Es un informe del entorno, no una confirmación de que el checkout está listo ni una lectura de toda la configuración guardada en el panel. La bienvenida distingue el acceso creado de los requisitos comerciales pendientes.

Una respuesta de tienda ya inicializada (409) no confirma por sí sola que haya un dueño: pudo haberse inicializado sólo el schema. Antes de repetir con `force`, verificá el acceso existente o consultá privadamente la tabla `users`. La repetición con un email existente reemplaza su contraseña, lo activa como dueño y revoca sus sesiones anteriores. No sirve para recuperar ni mostrar la contraseña anterior.

Después de crear y probar el acceso del dueño, eliminá `SETUP_SECRET` de las variables del hPanel y hacé Redeploy. `/setup` deja de existir y la API queda cerrada. No hacen falta `OWNER_EMAIL` ni `OWNER_PASSWORD` en el entorno de producción para usar el panel.

El método alternativo es `pnpm create-owner`, ejecutado desde un entorno con acceso a la base correcta. También crea o actualiza la cuenta del email indicado; no lo ejecutes contra la base local esperando cambiar el sitio público. Los detalles técnicos están en `DEPLOY.md`, sección 4.

No existe registro público de administradores ni un enlace de recuperación por email. Un dueño puede cambiar contraseñas desde `/admin/usuarios`; si perdió todo acceso, la recuperación requiere volver a habilitar temporalmente el setup en el servidor o ejecutar `create-owner` contra su base. Las cuentas opcionales de clientes (`/cuenta`) son independientes y no dan acceso al panel.

## Cómo interpretar los avisos

| Aviso                          | Qué hacer                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migraciones y extras aplicados | El schema fue preparado. Son detalles técnicos; no son tareas pendientes del dueño.                                                                              |
| Catálogo de ejemplo            | Se quitó de este formulario. El seed genérico sigue existiendo como herramienta del template, pero no corresponde a esta tienda. Ver `AI-CATALOGUE-WORKFLOW.md`. |
| Banco                          | Cargar la cuenta real en `/admin/banco`. La configuración del panel puede satisfacerlo aunque falten las variables `BANCO_*`.                                    |
| Cloudinary                     | Configurar en `/admin/integraciones`: sirve para fotos, comprobantes de transferencia y almacenamiento de backups. Sin él no funciona la carga del comprobante.  |
| WhatsApp comercial             | Cargar un número real en `/admin/integraciones` para el contacto del comprador. Las credenciales de WhatsApp Cloud son otro servicio.                            |
| Pagopar y webhook              | Opcional mientras se venda por los otros métodos disponibles. Antes de activar tarjeta, configurar y probar el contrato real del proveedor.                      |
| Plantillas de WhatsApp Cloud   | Son avisos automáticos opcionales: pedido nuevo, confirmado, pagado, enviado, recordatorio, reseña y resumen diario. No son errores de creación de cuenta.       |
| Backups automáticos            | Verificar almacenamiento, cron y restauración. No asumir que están funcionando por crear un usuario.                                                             |
| `DATABASE_URL` con localhost   | Puede ser correcto en Hostinger si la base está en el mismo host. No cambiarlo sólo por ese aviso.                                                               |
| `SETUP_SECRET` todavía activo  | Quitar del hPanel después de verificar el login y hacer Redeploy.                                                                                                |

Este cambio no necesita variables de entorno nuevas. El plan de email futuro y el prompt para Claude están en `CLAUDE-EMAIL-INVESTIGATION.md`; el envío y la recuperación por email aún no están implementados.

# Acceso al panel de Anillos

- Panel y login: https://anillos.com.py/admin/login
- Configuración inicial: https://anillos.com.py/setup
- Usuarios y cambio de contraseñas: https://anillos.com.py/admin/usuarios (sólo el dueño autenticado).

`SETUP_SECRET` habilita la configuración inicial. No es la contraseña del panel: elegí el email y una contraseña propia del dueño, con al menos diez caracteres, letras y números. El formulario pide repetirla y permite mostrar u ocultar los campos de contraseña.

Para crear el primer dueño, abrí `/setup`, ingresá el secreto configurado en el hPanel y los datos de la cuenta. Dejá desmarcado el catálogo de ejemplo: los productos de prueba del template no son el catálogo real de esta tienda. Dejá también desmarcada la repetición forzada para la primera inicialización.

Una respuesta de tienda ya inicializada (409) no confirma por sí sola que haya un dueño: pudo haberse inicializado sólo el schema. Antes de repetir con `force`, verificá el acceso existente o consultá privadamente la tabla `users`. La repetición con un email existente reemplaza su contraseña, lo activa como dueño y revoca sus sesiones anteriores. No sirve para recuperar ni mostrar la contraseña anterior.

Después de crear y probar el acceso del dueño, eliminá `SETUP_SECRET` de las variables del hPanel y hacé Redeploy. `/setup` deja de existir y la API queda cerrada. No hacen falta `OWNER_EMAIL` ni `OWNER_PASSWORD` en el entorno de producción para usar el panel.

El método alternativo es `pnpm create-owner`, ejecutado desde un entorno con acceso a la base correcta. También crea o actualiza la cuenta del email indicado; no lo ejecutes contra la base local esperando cambiar el sitio público. Los detalles técnicos están en `DEPLOY.md`, sección 4.

No existe registro público de administradores ni un enlace de recuperación por email. Un dueño puede cambiar contraseñas desde `/admin/usuarios`; si perdió todo acceso, la recuperación requiere volver a habilitar temporalmente el setup en el servidor o ejecutar `create-owner` contra su base. Las cuentas opcionales de clientes (`/cuenta`) son independientes y no dan acceso al panel.

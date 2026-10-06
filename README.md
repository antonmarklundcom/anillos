# Anillos.com.py

Vidriera paraguaya de anillos, con español/voseo, guaraníes enteros y una experiencia editorial pensada para el celular. Acero y plata tienen prioridad; las alianzas se distinguen como pares de dos anillos.

**Estado:** implementación para revisión. Sin inventario propio, acuerdos de proveedores, precios mayoristas, plazos ni cobros habilitados. No está desplegada. Las fotografías y el video iniciales son ilustraciones generadas con IA; los productos conceptuales sólo se siembran en una base local descartable, nunca en producción.

Base: [ecom, PR 144](https://github.com/antonmarklundcom/ecom/pull/144), commit `c5422e3c9184f0c4e4575da3db2774329d063214`. El historial original y origin de este repositorio se conservaron; `.template-baseline` registra esa versión.

## Desarrollo

Usá Node y pnpm según `package.json`. Configurá una base local propia y las cinco variables de `.env.example`, con secretos únicos. Nunca apuntes `TEST_DATABASE_URL` a datos reales.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm exec tsx scripts/seed-store.ts
pnpm dev
```

Para ver cinco conceptos sin stock ni precio, ejecutá el seed con `--with-concepts` **únicamente** en una base loopback cuyo nombre contenga `test`. El comando rechaza otros destinos. No uses `pnpm db:seed`, `pnpm demo` ni setup con `seed:true` para preparar producción: esos comandos conservan los fixtures genéricos del template.

```sh
pnpm typecheck
pnpm lint
pnpm test                    # TEST_DATABASE_URL: base descartable independiente
pnpm db:generate             # debe informar que no hay cambios de schema
pnpm build
pnpm exec playwright test    # build + fixtures descartables; playwright.config.ts
```

La capa de presentación vive en `src/config/ring-store.ts`, `src/content/guides.ts`, componentes editoriales y `public/media`. La maquinaria validada del template —admin, cuentas, inventario, pedidos, pagos, seguridad y outbox— conserva su comportamiento. El panel permite cargar fichas reales y reemplazar las fotos ilustrativas.

## Documentación

- [Implementación y separación de datos](docs/STORE-IMPLEMENTATION.md)
- [Verificación, skips y preview](docs/VERIFICATION.md)
- [Configuración pendiente para lanzar](docs/LAUNCH-CHECKLIST.md)
- [Investigación pública de competidores](docs/COMPETITOR-RESEARCH.md)
- [Proveniencia de medios](docs/MEDIA-PROVENANCE.json)
- [Arquitectura](ARCH.md), [template y distribución](NEW-STORE.md), [deploy](DEPLOY.md)
- [Auditoría completada del template](docs/TEMPLATE-HARDENING.md), [backup y recuperación](docs/BACKUP-RECOVERY.md)

No fusionar ni desplegar esta implementación sin una revisión posterior. No contactar proveedores desde este proyecto.

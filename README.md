# HMS Modernization

This folder contains the target-state modernization of the legacy Struts2/Hibernate3
Hospital Management System at `d:/project/Navjeevan/Navjeenna`.

- [`docs/HMS-Struts-to-Angular-SpringBoot-Migration.md`](docs/HMS-Struts-to-Angular-SpringBoot-Migration.md) - full as-is architecture analysis, Struts→Angular/Spring Boot mapping, target architecture, and step-by-step migration plan (read this first).
- [`hms-web/`](hms-web) - Angular 18 SPA (standalone components, lazy-loaded feature routes).
- [`hms-api/`](hms-api) - Spring Boot 4 REST API (Java 17, Spring Data JPA, Flyway, Spring Security).

Both projects currently contain one complete, working vertical slice - **Departments**
(`hms-api`: `com.pms.masters.*`, `hms-web`: `features/masters-admin/departments`) - as
the reference shape for porting the remaining modules called out in the migration plan.

## Running locally

**Backend** (needs JDK 17+; `JAVA_HOME` should point at a 17+ install, e.g. the
`jdk-23.0.1` already present on this machine, not the older `jdk-11`/`jdk1.8` also
installed):

```
cd hms-api
./mvnw spring-boot:run
```

Configure the datasource via environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`)
or edit `src/main/resources/application.properties` directly. Do not point this at the
live `Navjeevan` database until you've read migration doc §7 Phase 0/3 - `ddl-auto` is
set to `validate`, not `update`, and Flyway's `V1__baseline.sql` is a placeholder that
must be replaced with a real export of the live schema first.

**Frontend**:

```
cd hms-web
npm start
```

Serves on `http://localhost:4200`, proxying API calls to `http://localhost:8080/api`
(see `src/environments/environment.development.ts`). Dev login uses the credentials
configured on the backend (`DEV_USER`/`DEV_PASSWORD`, default `admin`/`admin`).

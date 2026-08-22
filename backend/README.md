# ProjetoX API

API REST para agendamento de barbearias, construída com Node.js, Express e PostgreSQL. O schema oficial é [`../migration.sql`](../migration.sql).

## Arquitetura

O fluxo principal é `rota → middleware → controller → service/repository → PostgreSQL`. `src/config` centraliza ambiente e conexão; `validators` valida entradas com Zod; `errors` e `middlewares/errorHandler.js` padronizam falhas. Queries são parametrizadas pelo driver `pg`.

O PostgreSQL é a última linha de defesa contra concorrência: `appointments_staff_no_overlap` usa uma exclusion constraint GiST sobre `[starts_at, ends_at)`. Assim, duas transações concorrentes não conseguem reservar períodos sobrepostos para o mesmo profissional. A API converte a violação `23P01` em `TIME_SLOT_UNAVAILABLE`.

## Requisitos e instalação

- Node.js 22+ (testado com Node 24)
- PostgreSQL 15+

```bash
cd backend
npm install
```

Copie os valores de `.env.example` para `../.env`. Troque obrigatoriamente `DATABASE_URL` e `JWT_SECRET` em produção. O schema não possui fuso horário nem política de cancelamento por barbearia; por isso `APP_TIMEZONE` e `CANCELLATION_NOTICE_HOURS` são políticas globais explícitas.

Crie o banco e aplique a migration:

```bash
psql "postgresql://postgres:postgres@localhost:5432/barbershop" -f ../migration.sql
```

Inicie pela raiz com `npm run dev`, ou dentro de `backend`:

```bash
npm run dev
# sem reinício automático:
npm start
```

A API valida a conexão antes de abrir a porta. `GET /health` retorna o estado do processo.

## Endpoints principais

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| POST | `/api/auth/logout` | Autenticado; JWT stateless é descartado no cliente |
| GET | `/api/services?barbershopId=UUID` | Público |
| POST/PATCH | `/api/services`, `/api/services/:id` | ADMIN |
| GET | `/api/professionals?barbershopId=UUID` | Público |
| PUT | `/api/professionals/:id/services` | ADMIN |
| GET | `/api/availability?barbershopId=...&staffId=...&serviceIds=id1,id2&date=2026-08-20` | Público |
| POST | `/api/appointments` | CUSTOMER |
| GET | `/api/appointments/:id` | Dono, profissional ou ADMIN |
| PATCH | `/api/appointments/:id/reschedule` | Dono, profissional ou ADMIN |
| DELETE | `/api/appointments/:id` | Dono, profissional ou ADMIN |
| GET | `/api/customers/me/appointments` | CUSTOMER |
| GET | `/api/customers/me/appointments/upcoming` | CUSTOMER |
| GET | `/api/professionals/:id/agenda?from=...&to=...` | BARBER/ADMIN |
| GET/PUT | `/api/barbershops/:id/hours` | Leitura pública / escrita ADMIN |
| GET/POST | `/api/professionals/:id/working-hours` | Leitura pública / escrita BARBER/ADMIN |
| GET/POST | `/api/professionals/:id/time-off` | BARBER/ADMIN |

## Autenticação e exemplos

Cadastro:

```http
POST /api/auth/register
Content-Type: application/json

{"name":"Ana Silva","email":"ana@example.com","password":"senha-segura"}
```

Envie o token retornado em `Authorization: Bearer TOKEN`.

Agendamento com serviços consecutivos:

```http
POST /api/appointments
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "barbershopId":"00000000-0000-0000-0000-000000000001",
  "staffId":"00000000-0000-0000-0000-000000000002",
  "serviceIds":["00000000-0000-0000-0000-000000000003"],
  "startsAt":"2026-08-20T15:00:00-03:00",
  "customerNotes":"Corte baixo"
}
```

A duração e o preço são obtidos no banco, nunca aceitos do cliente. A API confere jornada, funcionamento, bloqueios e futuro; a constraint do banco resolve corridas. Datas de entrada devem incluir offset, e respostas usam ISO 8601.

## Regras relevantes

- Disponibilidade é a interseção entre horário da barbearia e períodos ativos do profissional.
- A duração é a soma dos serviços, respeitando customizações em `staff_services`.
- O intervalo de slots vem de `SLOT_INTERVAL_MINUTES`.
- Cancelados não bloqueiam agenda; demais status bloqueiam.
- Preço, nome e duração ficam congelados em `appointment_services`.
- Cliente só acessa seus registros; barbeiro acessa sua agenda; administração gerencia catálogo e horários.
- O schema suporta clientes convidados, pagamentos, avaliações, favoritos, galeria e notificações, mas estes módulos não receberam endpoints nesta primeira API porque o escopo principal é reserva e gestão da agenda. Nenhuma tabela ou coluna extra foi inventada.

## Erros

```json
{"success":false,"error":{"code":"TIME_SLOT_UNAVAILABLE","message":"Este horário não está mais disponível."}}
```

Outros códigos incluem `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` e `DUPLICATE_RESOURCE`.

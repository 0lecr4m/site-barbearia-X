-- ============================================================
-- BARBERSHOP DATABASE
-- PostgreSQL
--
-- Recomendado:
-- PostgreSQL 15+
--
-- Extensions:
-- pgcrypto  -> UUIDs
-- btree_gist -> prevenção de horários conflitantes
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'CUSTOMER',
    'BARBER',
    'ADMIN'
);


CREATE TYPE appointment_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


CREATE TYPE payment_method AS ENUM (
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH'
);


CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


CREATE TYPE notification_type AS ENUM (
    'APPOINTMENT_CREATED',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_REMINDER',
    'PAYMENT_CONFIRMED',
    'PAYMENT_FAILED',
    'GENERAL'
);


CREATE TYPE notification_channel AS ENUM (
    'IN_APP',
    'EMAIL',
    'WHATSAPP',
    'PUSH'
);


-- ============================================================
-- USERS
-- ============================================================
--
-- Responsável pela autenticação.
--
-- Pode ser:
-- CUSTOMER
-- BARBER
-- ADMIN
--
-- Um usuário pode estar associado a uma entidade customer
-- ou staff.
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255),
    phone VARCHAR(30),

    password_hash TEXT,

    role user_role NOT NULL DEFAULT 'CUSTOMER',

    avatar_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_or_phone_check
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
);


CREATE UNIQUE INDEX users_email_unique
ON users (LOWER(email))
WHERE email IS NOT NULL;


CREATE UNIQUE INDEX users_phone_unique
ON users (phone)
WHERE phone IS NOT NULL;


CREATE INDEX users_role_idx
ON users(role);


-- ============================================================
-- BARBERSHOPS
-- ============================================================

CREATE TABLE barbershops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_user_id UUID,

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT,

    phone VARCHAR(30),
    whatsapp VARCHAR(30),
    email VARCHAR(255),

    address VARCHAR(255),
    address_number VARCHAR(30),
    complement VARCHAR(100),
    neighborhood VARCHAR(120),

    city VARCHAR(120),
    state VARCHAR(50),
    zip_code VARCHAR(20),

    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),

    logo_url TEXT,
    banner_url TEXT,

    instagram_url TEXT,
    facebook_url TEXT,
    website_url TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT barbershops_owner_user_fk
        FOREIGN KEY (owner_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE INDEX barbershops_owner_idx
ON barbershops(owner_user_id);


CREATE INDEX barbershops_city_idx
ON barbershops(city);


CREATE INDEX barbershops_active_idx
ON barbershops(active);


-- ============================================================
-- STAFF
-- ============================================================
--
-- Informações específicas dos profissionais.
--
-- user_id:
-- login/autenticação do profissional.
--
-- barbershop_id:
-- barbearia onde trabalha.
-- ============================================================

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    barbershop_id UUID NOT NULL,

    display_name VARCHAR(150) NOT NULL,

    bio TEXT,

    photo_url TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    accepts_online_booking BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT staff_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE,

    CONSTRAINT staff_user_barbershop_unique
        UNIQUE(user_id, barbershop_id),

    CONSTRAINT staff_id_barbershop_unique
        UNIQUE(id, barbershop_id)
);


CREATE INDEX staff_barbershop_idx
ON staff(barbershop_id);


CREATE INDEX staff_active_idx
ON staff(barbershop_id, active);


-- ============================================================
-- CUSTOMERS
-- ============================================================
--
-- Perfil do cliente dentro de uma barbearia.
--
-- user_id pode ser NULL.
--
-- Isso permite criar clientes sem obrigá-los a criar conta.
-- Ex:
-- agendamento somente com nome + WhatsApp.
-- ============================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    barbershop_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(30),

    notes TEXT,

    total_visits INTEGER NOT NULL DEFAULT 0,

    last_visit_at TIMESTAMPTZ,

    marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT customers_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT customers_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE,

    CONSTRAINT customers_total_visits_check
        CHECK (total_visits >= 0),

    CONSTRAINT customers_id_barbershop_unique
        UNIQUE(id, barbershop_id)
);


CREATE UNIQUE INDEX customers_user_barbershop_unique
ON customers(user_id, barbershop_id)
WHERE user_id IS NOT NULL;


CREATE INDEX customers_barbershop_idx
ON customers(barbershop_id);


CREATE INDEX customers_phone_idx
ON customers(phone);


CREATE INDEX customers_email_idx
ON customers(email);


-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    barbershop_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    price NUMERIC(10, 2) NOT NULL,

    duration_minutes INTEGER NOT NULL,

    image_url TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT services_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE,

    CONSTRAINT services_price_check
        CHECK (price >= 0),

    CONSTRAINT services_duration_check
        CHECK (duration_minutes > 0),

    CONSTRAINT services_id_barbershop_unique
        UNIQUE(id, barbershop_id)
);


CREATE INDEX services_barbershop_idx
ON services(barbershop_id);


CREATE INDEX services_active_idx
ON services(barbershop_id, active);


-- ============================================================
-- STAFF_SERVICES
-- ============================================================
--
-- N:N
--
-- STAFF <-> SERVICES
--
-- Define quais serviços cada barbeiro executa.
--
-- Também permite:
-- preço personalizado
-- duração personalizada
-- ============================================================

CREATE TABLE staff_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,

    service_id UUID NOT NULL,

    custom_price NUMERIC(10, 2),

    custom_duration_minutes INTEGER,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_services_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT staff_services_service_fk
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE,

    CONSTRAINT staff_services_unique
        UNIQUE(staff_id, service_id),

    CONSTRAINT staff_services_custom_price_check
        CHECK (
            custom_price IS NULL
            OR custom_price >= 0
        ),

    CONSTRAINT staff_services_custom_duration_check
        CHECK (
            custom_duration_minutes IS NULL
            OR custom_duration_minutes > 0
        )
);


CREATE INDEX staff_services_staff_idx
ON staff_services(staff_id);


CREATE INDEX staff_services_service_idx
ON staff_services(service_id);


-- ============================================================
-- BUSINESS HOURS
-- ============================================================
--
-- Horário geral da barbearia.
--
-- day_of_week:
--
-- 0 = Domingo
-- 1 = Segunda
-- 2 = Terça
-- 3 = Quarta
-- 4 = Quinta
-- 5 = Sexta
-- 6 = Sábado
--
-- ============================================================

CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    barbershop_id UUID NOT NULL,

    day_of_week SMALLINT NOT NULL,

    open_time TIME,

    close_time TIME,

    is_closed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT business_hours_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE,

    CONSTRAINT business_hours_day_check
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT business_hours_time_check
        CHECK (
            is_closed = TRUE
            OR (
                open_time IS NOT NULL
                AND close_time IS NOT NULL
                AND close_time > open_time
            )
        ),

    CONSTRAINT business_hours_unique_day
        UNIQUE(barbershop_id, day_of_week)
);


CREATE INDEX business_hours_barbershop_idx
ON business_hours(barbershop_id);


-- ============================================================
-- STAFF AVAILABILITY
-- ============================================================
--
-- Horários recorrentes do profissional.
--
-- Pode haver MAIS DE UM período no mesmo dia.
--
-- Exemplo:
--
-- 09:00 - 12:00
-- 13:00 - 18:00
--
-- ============================================================

CREATE TABLE staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,

    day_of_week SMALLINT NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_availability_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT staff_availability_day_check
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT staff_availability_time_check
        CHECK (end_time > start_time),

    CONSTRAINT staff_availability_unique
        UNIQUE(
            staff_id,
            day_of_week,
            start_time,
            end_time
        )
);


CREATE INDEX staff_availability_staff_day_idx
ON staff_availability(staff_id, day_of_week);


-- ============================================================
-- STAFF TIME OFF
-- ============================================================
--
-- Ausências:
--
-- férias
-- almoço
-- consulta médica
-- folga
-- bloqueio manual
--
-- ============================================================

CREATE TABLE staff_time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,

    start_at TIMESTAMPTZ NOT NULL,

    end_at TIMESTAMPTZ NOT NULL,

    reason VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_time_off_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT staff_time_off_time_check
        CHECK (end_at > start_at)
);


CREATE INDEX staff_time_off_staff_idx
ON staff_time_off(staff_id);


CREATE INDEX staff_time_off_period_idx
ON staff_time_off(start_at, end_at);


-- ============================================================
-- APPOINTMENTS
-- ============================================================
--
-- Entidade central do sistema.
--
-- Um agendamento pertence a:
--
-- 1 barbearia
-- 1 cliente
-- 1 profissional
--
-- E contém 1 ou mais serviços através da tabela
-- appointment_services.
--
-- ============================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    barbershop_id UUID NOT NULL,

    customer_id UUID NOT NULL,

    staff_id UUID NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,

    ends_at TIMESTAMPTZ NOT NULL,

    status appointment_status
        NOT NULL
        DEFAULT 'PENDING',

    total_price NUMERIC(10, 2)
        NOT NULL
        DEFAULT 0,

    customer_notes TEXT,

    internal_notes TEXT,

    cancellation_reason TEXT,

    cancelled_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT appointments_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE RESTRICT,

    CONSTRAINT appointments_customer_fk
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT appointments_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE RESTRICT,

    CONSTRAINT appointments_period_check
        CHECK (ends_at > starts_at),

    CONSTRAINT appointments_total_price_check
        CHECK (total_price >= 0),

    CONSTRAINT appointments_id_barbershop_unique
        UNIQUE(id, barbershop_id)
);


CREATE INDEX appointments_barbershop_idx
ON appointments(barbershop_id);


CREATE INDEX appointments_customer_idx
ON appointments(customer_id);


CREATE INDEX appointments_staff_idx
ON appointments(staff_id);


CREATE INDEX appointments_starts_at_idx
ON appointments(starts_at);


CREATE INDEX appointments_status_idx
ON appointments(status);


CREATE INDEX appointments_staff_date_idx
ON appointments(staff_id, starts_at);


CREATE INDEX appointments_customer_date_idx
ON appointments(customer_id, starts_at DESC);


-- ============================================================
-- PREVENÇÃO DE AGENDAMENTOS SOBREPOSTOS
-- ============================================================
--
-- Exemplo:
--
-- João possui:
--
-- 14:00 -> 15:00
--
-- O banco NÃO permitirá:
--
-- 14:30 -> 15:30
--
-- para o mesmo profissional.
--
-- Agendamentos CANCELLED são ignorados.
--
-- [) significa:
--
-- inclui horário inicial
-- exclui horário final
--
-- Então:
--
-- 14:00 -> 15:00
-- 15:00 -> 16:00
--
-- é permitido.
-- ============================================================

ALTER TABLE appointments
ADD CONSTRAINT appointments_staff_no_overlap
EXCLUDE USING GIST (

    staff_id WITH =,

    tstzrange(
        starts_at,
        ends_at,
        '[)'
    ) WITH &&

)
WHERE (status <> 'CANCELLED');


-- ============================================================
-- APPOINTMENT SERVICES
-- ============================================================
--
-- N:N
--
-- APPOINTMENTS <-> SERVICES
--
-- IMPORTANTE:
--
-- guardamos SNAPSHOT do nome, preço e duração.
--
-- Porque:
--
-- Corte hoje = R$ 50
--
-- Se daqui a 6 meses virar R$ 70,
-- o agendamento antigo precisa continuar mostrando R$ 50.
--
-- ============================================================

CREATE TABLE appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    appointment_id UUID NOT NULL,

    service_id UUID NOT NULL,

    service_name_snapshot VARCHAR(150) NOT NULL,

    price NUMERIC(10, 2) NOT NULL,

    duration_minutes INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT appointment_services_appointment_fk
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE CASCADE,

    CONSTRAINT appointment_services_service_fk
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT,

    CONSTRAINT appointment_services_price_check
        CHECK (price >= 0),

    CONSTRAINT appointment_services_duration_check
        CHECK (duration_minutes > 0),

    CONSTRAINT appointment_services_unique
        UNIQUE(appointment_id, service_id)
);


CREATE INDEX appointment_services_appointment_idx
ON appointment_services(appointment_id);


CREATE INDEX appointment_services_service_idx
ON appointment_services(service_id);


-- ============================================================
-- PAYMENTS
-- ============================================================
--
-- 1 appointment pode possuir vários payments.
--
-- Exemplos:
--
-- tentativa falhou
-- nova tentativa paga
--
-- ou:
--
-- sinal via PIX
-- restante em dinheiro
--
-- ============================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    appointment_id UUID NOT NULL,

    amount NUMERIC(10, 2) NOT NULL,

    method payment_method NOT NULL,

    status payment_status
        NOT NULL
        DEFAULT 'PENDING',

    provider VARCHAR(100),

    provider_transaction_id VARCHAR(255),

    paid_at TIMESTAMPTZ,

    refunded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_appointment_fk
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE RESTRICT,

    CONSTRAINT payments_amount_check
        CHECK (amount > 0)
);


CREATE INDEX payments_appointment_idx
ON payments(appointment_id);


CREATE INDEX payments_status_idx
ON payments(status);


CREATE UNIQUE INDEX payments_provider_transaction_unique
ON payments(provider, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL;


-- ============================================================
-- REVIEWS
-- ============================================================
--
-- 1 appointment pode ter no máximo 1 review.
--
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    appointment_id UUID NOT NULL UNIQUE,

    customer_id UUID NOT NULL,

    staff_id UUID NOT NULL,

    barbershop_id UUID NOT NULL,

    rating SMALLINT NOT NULL,

    comment TEXT,

    is_visible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reviews_appointment_fk
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE CASCADE,

    CONSTRAINT reviews_customer_fk
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT reviews_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT reviews_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE,

    CONSTRAINT reviews_rating_check
        CHECK (rating BETWEEN 1 AND 5)
);


CREATE INDEX reviews_barbershop_idx
ON reviews(barbershop_id);


CREATE INDEX reviews_staff_idx
ON reviews(staff_id);


CREATE INDEX reviews_rating_idx
ON reviews(rating);


-- ============================================================
-- GALLERY
-- ============================================================

CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    barbershop_id UUID NOT NULL,

    image_url TEXT NOT NULL,

    caption VARCHAR(255),

    alt_text VARCHAR(255),

    sort_order INTEGER NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT gallery_barbershop_fk
        FOREIGN KEY (barbershop_id)
        REFERENCES barbershops(id)
        ON DELETE CASCADE
);


CREATE INDEX gallery_barbershop_idx
ON gallery(barbershop_id);


-- ============================================================
-- FAVORITES
-- ============================================================
--
-- N:N
--
-- customer <-> staff
--
-- ============================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL,

    staff_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT favorites_customer_fk
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT favorites_staff_fk
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT favorites_unique
        UNIQUE(customer_id, staff_id)
);


CREATE INDEX favorites_customer_idx
ON favorites(customer_id);


CREATE INDEX favorites_staff_idx
ON favorites(staff_id);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type notification_type NOT NULL,

    channel notification_channel
        NOT NULL
        DEFAULT 'IN_APP',

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    read_at TIMESTAMPTZ,

    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT notifications_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX notifications_user_idx
ON notifications(user_id);


CREATE INDEX notifications_user_unread_idx
ON notifications(user_id, read_at);


CREATE INDEX notifications_created_at_idx
ON notifications(created_at DESC);


-- ============================================================
-- FUNCTION PARA updated_at AUTOMÁTICO
-- ============================================================
--
-- Toda vez que UPDATE acontecer:
--
-- updated_at = NOW()
--
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER barbershops_updated_at
BEFORE UPDATE ON barbershops
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER staff_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER staff_services_updated_at
BEFORE UPDATE ON staff_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER business_hours_updated_at
BEFORE UPDATE ON business_hours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER staff_availability_updated_at
BEFORE UPDATE ON staff_availability
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER staff_time_off_updated_at
BEFORE UPDATE ON staff_time_off
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER gallery_updated_at
BEFORE UPDATE ON gallery
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- VIEW: SERVIÇOS DISPONÍVEIS POR BARBEIRO
-- ============================================================

CREATE VIEW staff_service_details AS

SELECT

    ss.id AS staff_service_id,

    s.id AS service_id,

    st.id AS staff_id,

    st.barbershop_id,

    st.display_name AS staff_name,

    s.name AS service_name,

    COALESCE(
        ss.custom_price,
        s.price
    ) AS final_price,

    COALESCE(
        ss.custom_duration_minutes,
        s.duration_minutes
    ) AS final_duration_minutes,

    ss.active AS staff_service_active,

    s.active AS service_active,

    st.active AS staff_active

FROM staff_services ss

JOIN staff st
    ON st.id = ss.staff_id

JOIN services s
    ON s.id = ss.service_id;


-- ============================================================
-- VIEW: AGENDAMENTOS COMPLETOS
-- ============================================================

CREATE VIEW appointment_details AS

SELECT

    a.id AS appointment_id,

    a.barbershop_id,

    b.name AS barbershop_name,

    a.customer_id,

    c.name AS customer_name,

    c.phone AS customer_phone,

    c.email AS customer_email,

    a.staff_id,

    st.display_name AS staff_name,

    a.starts_at,

    a.ends_at,

    a.status,

    a.total_price,

    a.customer_notes,

    a.created_at

FROM appointments a

JOIN barbershops b
    ON b.id = a.barbershop_id

JOIN customers c
    ON c.id = a.customer_id

JOIN staff st
    ON st.id = a.staff_id;


-- ============================================================
-- COMMENTS / DOCUMENTAÇÃO NO BANCO
-- ============================================================

COMMENT ON TABLE users IS
'Usuários que podem autenticar no sistema.';


COMMENT ON TABLE barbershops IS
'Estabelecimentos cadastrados na plataforma.';


COMMENT ON TABLE customers IS
'Clientes de cada barbearia. Podem existir sem conta de usuário.';


COMMENT ON TABLE staff IS
'Profissionais/barbeiros vinculados às barbearias.';


COMMENT ON TABLE services IS
'Catálogo de serviços oferecidos pela barbearia.';


COMMENT ON TABLE staff_services IS
'Relacionamento N:N entre profissionais e serviços.';


COMMENT ON TABLE business_hours IS
'Horário geral de funcionamento da barbearia.';


COMMENT ON TABLE staff_availability IS
'Disponibilidade recorrente semanal de cada profissional.';


COMMENT ON TABLE staff_time_off IS
'Bloqueios, férias e ausências dos profissionais.';


COMMENT ON TABLE appointments IS
'Agendamentos realizados pelos clientes.';


COMMENT ON TABLE appointment_services IS
'Serviços incluídos em cada agendamento.';


COMMENT ON TABLE payments IS
'Pagamentos associados aos agendamentos.';


COMMENT ON TABLE reviews IS
'Avaliações realizadas após os atendimentos.';


COMMENT ON TABLE gallery IS
'Galeria de trabalhos da barbearia.';


COMMENT ON TABLE favorites IS
'Profissionais favoritos dos clientes.';


COMMENT ON TABLE notifications IS
'Notificações enviadas ou apresentadas aos usuários.';
PRAGMA foreign_keys = ON;

create table if not exists user (
    id integer primary key autoincrement,
    name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null check (
        role in ('admin', 'dispatcher', 'pilot')
    ),
    created_at text not null default current_timestamp
);

create table if not exists drones (
    id integer primary key autoincrement,
    name text not null,
    model text not null,
    serial_number text not null unique,
    status text not null default 'available' check (
        status in ('available','in_use','maintenance')
    ),
    created_at text not null default current_timestamp
);

create table if not exists missions (
    id integer primary key autoincrement,
    name text not null,
    description text,
    pilot_id integer not null,
    dron_id integer not null,
    start_time text not null,
    end_time text,
    status text not null default 'planned' check (
        status in (
            'planned',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,

    foreign key (pilot_id)
        references pilots(id)
);
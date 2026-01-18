import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  try {
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp NOT NULL
      )
    `);

    // Create index on sessions.expire
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar UNIQUE,
        password_hash varchar,
        first_name varchar,
        last_name varchar,
        profile_image_url varchar,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Create goals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS goals (
        id serial PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        description text,
        color text NOT NULL DEFAULT '#0F766E',
        start_date date DEFAULT now() NOT NULL,
        end_date date,
        archived boolean DEFAULT false NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);

    // Create logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS logs (
        id serial PRIMARY KEY,
        goal_id integer NOT NULL,
        date date NOT NULL,
        effort integer NOT NULL,
        note text,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

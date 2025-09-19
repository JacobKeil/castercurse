import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			getSession: () => Promise<Session | null>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
		}
	}
	namespace NodeJS {
		interface ProcessEnv {
			SECRET_TWITCH_SECRET: string;
			DATABASE_URL: string;
		}
	}
}

export {};

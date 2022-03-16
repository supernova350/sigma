const REQUIRED_ENV_VARIABLES = ['BOT_TOKEN', 'REDIS_URL', 'OWNER_ID', 'NODE_ENV'] as const;

for (const envVar of REQUIRED_ENV_VARIABLES) {
	if (!process.env[envVar] || typeof process.env[envVar] !== 'string') {
		throw new Error(`Missing required environment variable: ${envVar}.`);
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			REDIS_URL: string;
			STATCORD_API_KEY: string;

			OWNER_ID: string;
			NODE_ENV: 'dev' | 'prod';
		}
	}
}

export const isProd = process.env.NODE_ENV === 'prod';
export const isDev = !isProd || process.env.NODE_ENV === 'dev';

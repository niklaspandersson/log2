export const DB_SCHEMA = getEnv("DB_SCHEMA");
export const DB_HOST = getEnv("DB_HOST");
export const DB_PORT = parseInt(getEnv("DB_PORT", false) || "3306");
export const DB_USER = getEnv("DB_USER");
export const DB_PASSWORD = getEnv("DB_PASSWORD");

export const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const IMAGE_PATH = getEnv("IMAGE_PATH");

export const PUBLIC_HTML = getEnv("PUBLIC_HTML", false);
export const PORT = parseInt(getEnv("PORT", false) || "3000");

function getEnv(name:string, required:boolean = true) {
  const value = process.env[name];
  if(required && !value)
    throw new Error(`env ${name} is required`);

  return value!;
}
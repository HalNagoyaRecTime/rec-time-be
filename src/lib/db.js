export function getDb(env) {
    if (!env?.DB) {
        throw new Error('DB binding not found. Make sure to run with wrangler dev or deploy to Cloudflare Workers.');
    }
    return env.DB;
}

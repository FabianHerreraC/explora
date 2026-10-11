import { createHandler } from './handler.js';

Deno.serve(createHandler({
  projectUrl: Deno.env.get('SUPABASE_URL'),
  serviceKey: JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default
    || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
}));

from supabase import create_client, Client
from config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY

# Using the anon key for client-side like operations (RLS applies)
# For admin tasks, you might need a service_role key, but for this app structure,
# passing the user's JWT from the frontend to the backend is the best practice 
# so RLS propagates.
supabase: Client = create_client(url, key)

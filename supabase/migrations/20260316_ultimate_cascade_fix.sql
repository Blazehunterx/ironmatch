-- ═══ THE CRITICAL DELETE REPAIR SCRIPT ═══
-- This script fixes the "Database error deleting user" by forcing CASCADE on EVERYTHING.
-- It targets both public.profiles AND auth.users.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Disable all triggers in the public schema to prevent side-effects during patching
    SET session_replication_role = 'replica';

    FOR r IN 
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            tc.constraint_name, 
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND (
            (ccu.table_name = 'profiles' AND ccu.table_schema = 'public') OR
            (ccu.table_name = 'users' AND ccu.table_schema = 'auth')
          )
    LOOP
        BEGIN
            -- Drop the existing constraint
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', 
                r.table_schema, r.table_name, r.constraint_name);
                
            -- Re-add with CASCADE
            EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE CASCADE', 
                r.table_schema, r.table_name, r.constraint_name, 
                r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
                
            RAISE NOTICE 'SUCCESS: Fixed %.% pointing to %.%', r.table_name, r.column_name, r.foreign_table_name, r.foreign_column_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'SKIPPED: Could not fix %.% (%) - %', r.table_name, r.column_name, r.constraint_name, SQLERRM;
        END;
    END LOOP;

    -- Re-enable triggers
    SET session_replication_role = 'origin';
END $$;

-- ═══ SPECIAL CASE: GYMS ═══
-- If a user owns a gym, we should probably set the owner to NULL instead of deleting the whole gym.
-- But if you want the gym deleted too, CASCADE is fine.
-- Let's ensure gyms.owner_id is handled if it exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gyms' AND column_name = 'owner_id') THEN
        ALTER TABLE public.gyms DROP CONSTRAINT IF EXISTS gyms_owner_id_fkey;
        ALTER TABLE public.gyms ADD CONSTRAINT gyms_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Handled gyms.owner_id (SET NULL)';
    END IF;
END $$;

Audit the current file for security vulnerabilities in delete and mutating operations.

Perform the following checks:

1. Find every function that calls `.delete()` on a Supabase table or performs a destructive operation.
2. For each such function, check if it validates `user.role === 'admin'` before proceeding.
3. If the role check is missing, wrap the operation with this pattern:
   ```ts
   const { data: profile } = await supabase
     .from('profiles').select('role').eq('id', user.id).single();
   if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 };
   ```
4. Also check that `user` is retrieved from the Supabase session (not passed as a parameter from client).
5. Report every function audited: either "✓ role check present" or "✗ role check added".

Do not modify any logic other than adding the role check. Do not change function signatures.

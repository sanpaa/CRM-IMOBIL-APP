# Fix for Null Company ID Issue

## Problem Description

Users who have a `null` value for `company_id` in the backend database cannot successfully use the CRM system. When they attempt to login, they will now receive the following error message:

```
Erro: Usuário não está associado a nenhuma empresa. Entre em contato com o administrador do sistema.
```

Previously, these users could login but would experience API failures with 400 errors on all data operations (clients, properties, visits, deals), making the system unusable.

## Root Cause

The `users` table in the database has `company_id` as a `NOT NULL` field according to the schema, but some user records have `null` values, violating this constraint. When the application tries to query data filtered by `company_id=eq.null`, Supabase returns 400 errors.

## How to Fix Affected Users (For Administrators)

### Step 1: Identify Affected Users

Run the following SQL query in your backend database to find users with null company_id:

```sql
SELECT id, username, email, company_id 
FROM users 
WHERE company_id IS NULL;
```

### Step 2: Assign Valid Company IDs

For each affected user, update their `company_id` to a valid company UUID:

```sql
-- Find available companies
SELECT id, name FROM companies;

-- Update user with correct company_id
UPDATE users 
SET company_id = '<valid-company-uuid>' 
WHERE id = '<user-uuid>';
```

### Step 3: Verify the Fix

After updating, verify that all users have valid company_ids:

```sql
SELECT COUNT(*) as users_without_company 
FROM users 
WHERE company_id IS NULL;
```

This should return 0.

### Step 4: Inform Users

Notify affected users that they can now login successfully.

## Prevention

To prevent this issue in the future:

1. **Database Constraint**: Ensure the `company_id` column has a `NOT NULL` constraint in the users table
2. **Backend Validation**: Add validation in the user registration endpoint to require a valid company_id
3. **Default Company**: Consider creating a default company for new users or requiring company selection during registration

## Technical Details

### Frontend Changes

The frontend now validates the `company_id` during login and session restoration:

1. **Login Validation**: In `auth.service.ts`, the `signIn()` method validates that `result.user.company_id` is not null, undefined, or the string 'null' before storing user data
2. **Session Validation**: On app initialization, `checkStoredSession()` validates stored user data and clears invalid sessions
3. **Error Display**: The login component displays specific error messages to guide users

### Code Location

The validation logic is implemented in:
- `src/app/services/auth.service.ts` - `isValidCompanyId()` helper method
- `src/app/services/auth.service.ts` - `signIn()` method
- `src/app/services/auth.service.ts` - `checkStoredSession()` method
- `src/app/components/login/login.component.ts` - Error message display

## Related Issues

This fix addresses the following error messages that were appearing in the console:

```
Failed to load resource: the server responded with a status of 400
ogixrlwohcwdhitigpta.supabase.co/rest/v1/visits?select=*&company_id=eq.null
ogixrlwohcwdhitigpta.supabase.co/rest/v1/properties?select=*&company_id=eq.null
ogixrlwohcwdhitigpta.supabase.co/rest/v1/clients?select=*&company_id=eq.null
ogixrlwohcwdhitigpta.supabase.co/rest/v1/deals?select=*&company_id=eq.null
```

## Testing

To test that the fix works:

1. Attempt to login with a user that has `company_id: null` in the backend
2. Verify that the error message "Erro: Usuário não está associado a nenhuma empresa. Entre em contato com o administrador do sistema." is displayed
3. Update the user's `company_id` in the database to a valid UUID
4. Login again and verify that the dashboard loads successfully without 400 errors

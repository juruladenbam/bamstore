<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionDebugController extends Controller
{
    /**
     * Debug permissions
     * URL: /api/debug-permissions?key=YOUR_DEBUG_KEY
     * Fix: /api/debug-permissions?key=YOUR_DEBUG_KEY&fix=1
     * User specific: /api/debug-permissions?key=YOUR_DEBUG_KEY&fix=1&user=email@example.com
     */
    public function index(Request $request)
    {
        // Use config() instead of env() for cached config compatibility
        $secretKey = config('app.debug_permissions_key') ?: env('DEBUG_PERMISSIONS_KEY');

        // Validate secret key - disabled if not set in .env
        if (!$secretKey || $request->query('key') !== $secretKey) {
            return response()->json([
                'error' => 'Unauthorized',
                'hint' => 'Check DEBUG_PERMISSIONS_KEY in .env and clear config cache',
                'key_exists' => !empty($secretKey),
            ], 403);
        }

        $result = [
            'timestamp' => now()->toDateTimeString(),
            'fix_mode' => $request->boolean('fix'),
            'actions' => [],
        ];

        // 1. Check and create roles/permissions if missing
        $roles = Role::with('permissions')->get();

        if ($roles->isEmpty()) {
            $result['roles'] = ['status' => 'MISSING', 'message' => 'No roles found'];

            if ($request->boolean('fix')) {
                $this->seedRolesAndPermissions();
                $result['actions'][] = 'Created roles and permissions';
                $roles = Role::with('permissions')->get();
            }
        }

        // List all roles
        $result['roles'] = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard' => $role->guard_name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        // 2. List all permissions
        $result['permissions'] = Permission::all()->map(function ($p) {
            return ['id' => $p->id, 'name' => $p->name, 'guard' => $p->guard_name];
        });

        // 3. Check users
        $userQuery = User::with('roles');

        if ($request->filled('user')) {
            $identifier = $request->query('user');
            $userQuery->where(function ($q) use ($identifier) {
                $q->where('id', $identifier)
                  ->orWhere('email', $identifier);
            });
        }

        $users = $userQuery->get();

        $result['users'] = $users->map(function ($user) use ($request, &$result) {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'all_permissions' => $user->getAllPermissions()->pluck('name'),
                'can_manage_users' => $user->hasPermissionTo('manage users'),
            ];

            // Fix: assign admin role if user has no role
            if ($request->boolean('fix') && $user->roles->isEmpty()) {
                $user->assignRole('admin');
                $result['actions'][] = "Assigned 'admin' role to user: {$user->email}";
                $userData['roles'] = ['admin'];
                $userData['all_permissions'] = $user->fresh()->getAllPermissions()->pluck('name');
                $userData['can_manage_users'] = true;
                $userData['fixed'] = true;
            }

            return $userData;
        });

        // 4. Clear cache if fix mode
        if ($request->boolean('fix')) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            cache()->flush();
            $result['actions'][] = 'Cleared permission cache';
            $result['actions'][] = 'Cleared application cache';
        }

        $result['instructions'] = [
            'debug_only' => '/api/debug-permissions?key=YOUR_DEBUG_KEY',
            'fix_all' => '/api/debug-permissions?key=YOUR_DEBUG_KEY&fix=1',
            'fix_specific_user' => '/api/debug-permissions?key=YOUR_DEBUG_KEY&fix=1&user=EMAIL',
        ];

        return response()->json($result, 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Seed roles and permissions (same as RolesAndPermissionsSeeder)
     */
    private function seedRolesAndPermissions(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'manage users',
            'manage products',
            'manage orders',
            'view reports',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $role = Role::firstOrCreate(['name' => 'staff']);
        $role->syncPermissions(['manage products', 'manage orders']);

        $role = Role::firstOrCreate(['name' => 'manager']);
        $role->syncPermissions(['manage products', 'manage orders', 'view reports']);

        $role = Role::firstOrCreate(['name' => 'admin']);
        $role->syncPermissions(Permission::all());
    }
}

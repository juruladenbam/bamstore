<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DebugUserPermissions extends Command
{
    protected $signature = 'debug:permissions {--fix : Fix permission issues} {--user= : User ID or email to check}';

    protected $description = 'Debug and optionally fix user permissions';

    public function handle(): int
    {
        $this->info('=== Permission Debug Tool ===');
        $this->newLine();

        // 1. Show all roles and their permissions
        $this->info('📋 All Roles:');
        $roles = Role::with('permissions')->get();

        if ($roles->isEmpty()) {
            $this->error('❌ No roles found! Run: php artisan db:seed --class=RolesAndPermissionsSeeder');

            if ($this->option('fix')) {
                $this->warn('🔧 Running seeder to create roles...');
                $this->call('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
                $roles = Role::with('permissions')->get();
            } else {
                return Command::FAILURE;
            }
        }

        foreach ($roles as $role) {
            $permissions = $role->permissions->pluck('name')->join(', ') ?: 'NO PERMISSIONS';
            $this->line("  [{$role->id}] {$role->name} (guard: {$role->guard_name}) -> {$permissions}");
        }

        $this->newLine();

        // 2. Show all permissions
        $this->info('🔑 All Permissions:');
        $permissions = Permission::all();

        if ($permissions->isEmpty()) {
            $this->error('❌ No permissions found!');
        } else {
            foreach ($permissions as $permission) {
                $this->line("  [{$permission->id}] {$permission->name} (guard: {$permission->guard_name})");
            }
        }

        $this->newLine();

        // 3. Check specific user or all users
        $userIdentifier = $this->option('user');

        if ($userIdentifier) {
            $user = is_numeric($userIdentifier)
                ? User::find($userIdentifier)
                : User::where('email', $userIdentifier)->first();

            if (!$user) {
                $this->error("❌ User not found: {$userIdentifier}");
                return Command::FAILURE;
            }

            $users = collect([$user]);
        } else {
            $users = User::with('roles')->get();
        }

        $this->info('👥 Users and Their Roles:');

        foreach ($users as $user) {
            $userRoles = $user->roles->pluck('name')->join(', ') ?: 'NO ROLE';
            $userPermissions = $user->getAllPermissions()->pluck('name')->join(', ') ?: 'NO PERMISSIONS';

            $this->line("  [{$user->id}] {$user->name} ({$user->email})");
            $this->line("      Roles: {$userRoles}");
            $this->line("      Permissions: {$userPermissions}");

            // Check if user has manage users permission
            $hasManageUsers = $user->hasPermissionTo('manage users');
            $status = $hasManageUsers ? '✅' : '❌';
            $this->line("      Can manage users: {$status}");

            // Fix option: assign admin role if user has no role
            if ($this->option('fix') && $user->roles->isEmpty()) {
                $this->warn("  🔧 User {$user->email} has no role. Assigning 'admin' role...");
                $user->assignRole('admin');
                $this->info("  ✅ Admin role assigned to {$user->email}");
            }

            $this->newLine();
        }

        // 4. Clear permission cache
        if ($this->option('fix')) {
            $this->warn('🔧 Clearing permission cache...');
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            $this->call('cache:clear');
            $this->info('✅ Cache cleared!');
        }

        $this->newLine();
        $this->info('=== Debug Complete ===');

        if (!$this->option('fix')) {
            $this->comment('💡 Run with --fix to automatically fix issues:');
            $this->comment('   php artisan debug:permissions --fix');
            $this->comment('   php artisan debug:permissions --fix --user=admin@example.com');
        }

        return Command::SUCCESS;
    }
}

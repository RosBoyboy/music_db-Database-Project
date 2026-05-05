<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $artistRole = Role::firstOrCreate(['name' => 'artist']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Attach admin to admin@example.com
        $adminUser = User::where('email', 'admin@example.com')->first();
        if ($adminUser && !$adminUser->hasRole('admin')) {
            $adminUser->roles()->attach($adminRole->id);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@platform.com',
            'password' => Hash::make('password123'),  // <-- harus Hash::make
            'role' => 'admin',
            'is_active' => true
        ]);

        // Tambahkan user lain jika perlu
        User::create([
            'name' => 'John Doe',
            'email' => 'guru@platform.com',
            'password' => Hash::make('password123'),
            'role' => 'instructor',
            'is_active' => true
        ]);

        User::create([
            'name' => 'Student One',
            'email' => 'murid@platform.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'is_active' => true
        ]);
    }
}
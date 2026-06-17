<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Foundation\Auth\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    User::create([
        'name' => 'Super Admin',
        'email' => 'admin@platform.com',
        'password' => bcrypt('password123'),
        'role' => 'admin',
        'is_active' => 1
    ]);

    User::create([
        'name' => 'John Doe',
        'email' => 'guru@platform.com',
        'password' => bcrypt('password123'),
        'role' => 'instructor',
        'is_active' => 1
    ]);

    User::create([
        'name' => 'Student One',
        'email' => 'murid@platform.com',
        'password' => bcrypt('password123'),
        'role' => 'student',
        'is_active' => 1
    ]);
}
}
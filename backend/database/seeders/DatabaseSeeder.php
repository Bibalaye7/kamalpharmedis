<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/** Idempotent : peut être relancé sans dupliquer les données. */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
        ]);
    }
}

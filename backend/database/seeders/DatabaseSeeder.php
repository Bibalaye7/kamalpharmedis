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
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        // Clients et commandes fictifs : seulement si SEED_DEMO_DATA=true (jamais en production)
        if (filter_var(env('SEED_DEMO_DATA', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->call([UserSeeder::class, OrderSeeder::class]);
        }
    }
}

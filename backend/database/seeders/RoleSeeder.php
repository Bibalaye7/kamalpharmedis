<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            Role::ADMIN => 'Administrateur',
            Role::MANAGER => 'Gestionnaire',
            Role::CLIENT => 'Client',
        ] as $name => $label) {
            Role::updateOrCreate(['name' => $name], ['label' => $label]);
        }
    }
}

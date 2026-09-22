<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::pluck('id', 'name');

        $users = [
            ['Administrateur KamalPharMédis', 'admin@kamalpharmedis.com', 'Admin@2025', Role::ADMIN, '+221 77 000 00 01'],
            ['Gestionnaire KamalPharMédis', 'manager@kamalpharmedis.com', 'Admin@2025', Role::MANAGER, '+221 77 000 00 02'],
            ['Aminata Diallo', 'aminata@email.com', 'Client@2025', Role::CLIENT, '+221 77 123 45 67'],
            ['Moussa Ndiaye', 'moussa@email.com', 'Client@2025', Role::CLIENT, '+221 76 234 56 78'],
            ['Fatou Sow', 'fatou@email.com', 'Client@2025', Role::CLIENT, '+221 78 345 67 89'],
        ];

        foreach ($users as [$name, $email, $password, $role, $phone]) {
            User::firstOrCreate(['email' => $email], [
                'name' => $name,
                'password' => $password,
                'role_id' => $roles[$role],
                'phone' => $phone,
                'email_verified_at' => now(),
            ]);
        }

        // Adresses de démonstration
        $aminata = User::where('email', 'aminata@email.com')->first();

        if ($aminata->addresses()->doesntExist()) {
            $aminata->addresses()->createMany([
                [
                    'label' => 'Domicile',
                    'full_name' => 'Aminata Diallo',
                    'phone' => '+221 77 123 45 67',
                    'line1' => 'Villa 24, Cité Keur Gorgui',
                    'city' => 'Dakar',
                    'region' => 'Dakar',
                    'country' => 'Sénégal',
                    'is_default' => true,
                ],
                [
                    'label' => 'Bureau',
                    'full_name' => 'Aminata Diallo',
                    'phone' => '+221 77 123 45 67',
                    'line1' => 'Immeuble Fahd, avenue Cheikh Anta Diop',
                    'line2' => '3e étage',
                    'city' => 'Dakar',
                    'region' => 'Dakar',
                    'country' => 'Sénégal',
                    'is_default' => false,
                ],
            ]);
        }

        foreach (['moussa@email.com' => ['Moussa Ndiaye', 'Thiès', 'Rue 12, Escale'], 'fatou@email.com' => ['Fatou Sow', 'Saint-Louis', 'Quartier Sor, lot 7']] as $email => [$name, $city, $line]) {
            $user = User::where('email', $email)->first();

            if ($user->addresses()->doesntExist()) {
                Address::create([
                    'user_id' => $user->id,
                    'label' => 'Domicile',
                    'full_name' => $name,
                    'phone' => $user->phone,
                    'line1' => $line,
                    'city' => $city,
                    'region' => $city,
                    'country' => 'Sénégal',
                    'is_default' => true,
                ]);
            }
        }
    }
}

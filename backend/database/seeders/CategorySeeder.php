<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Matériel médical', 'materiel-medical', 'Appareils de mesure et dispositifs médicaux pour le suivi de votre santé.', 'stethoscope'],
            ['Vitamines & compléments', 'vitamines-complements', 'Vitamines, minéraux et compléments alimentaires pour votre vitalité.', 'pill'],
            ['Phytothérapie', 'phytotherapie', 'Solutions naturelles à base de plantes médicinales.', 'leaf'],
            ['Premiers secours', 'premiers-secours', 'Trousses et consommables pour faire face aux urgences.', 'cross'],
            ['Protection & hygiène', 'protection-hygiene', 'Masques, gants et produits de protection individuelle.', 'shield'],
        ];

        foreach ($categories as [$name, $slug, $description, $icon]) {
            Category::updateOrCreate(['slug' => $slug], compact('name', 'description', 'icon'));
        }
    }
}

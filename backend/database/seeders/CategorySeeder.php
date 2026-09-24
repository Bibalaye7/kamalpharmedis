<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Aiguilles & prélèvement', 'aiguilles-prelevement', 'Aiguilles de prélèvement sanguin, de rachianesthésie et dispositifs de sécurité.', 'syringe'],
            ['Pansements & bandes', 'pansements-bandes', 'Bandes de gaze, de crêpe, élastiques, plâtrées et coton hydrophile.', 'cross'],
            ['Protection & hygiène', 'protection-hygiene', 'Blouses, sur-chaussures, doigtiers et protection individuelle.', 'shield'],
            ['Diagnostic', 'diagnostic', 'Bandelettes et consommables pour le diagnostic et l\'analyse.', 'flask'],
            ['Urgence & réanimation', 'urgence-reanimation', 'Électrodes de défibrillation et matériel d\'oxygénothérapie.', 'heart'],
            ['Identification patient', 'identification-patient', 'Bracelets d\'identification pour adultes et nouveau-nés.', 'tag'],
        ];

        foreach ($categories as [$name, $slug, $description, $icon]) {
            Category::updateOrCreate(['slug' => $slug], compact('name', 'description', 'icon'));
        }
    }
}

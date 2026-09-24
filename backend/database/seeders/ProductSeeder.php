<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::pluck('id', 'slug');

        // Prix (FCFA) et stocks indicatifs : à ajuster depuis l'espace admin > Produits.
        $products = [
            [
                'sku' => 'KPM-BLOU-001',
                'category' => 'protection-hygiene',
                'name' => 'Blouse chirurgicale bleue non tissée',
                'short_description' => 'Blouse jetable à manches longues, poignets élastiques et fermeture dans le dos.',
                'description' => "Blouse chirurgicale à usage unique en non-tissé bleu.\n\n• Manches longues à poignets élastiques\n• Encolure élastiquée et fermeture par liens dans le dos\n• Légère et confortable, adaptée aux soins et à la protection du personnel",
                'price' => 2500,
                'stock' => 120,
                'is_featured' => true,
                'images' => ['blouse-chirurgicale-1.jpg', 'blouse-chirurgicale-2.jpg'],
            ],
            [
                'sku' => 'KPM-SURC-002',
                'category' => 'protection-hygiene',
                'name' => 'Sur-chaussures jetables bleues',
                'short_description' => 'Couvre-chaussures à usage unique avec élastique de maintien.',
                'description' => "Sur-chaussures jetables en plastique bleu pour protéger les chaussures et limiter la contamination des locaux.\n\n• Élastique de maintien confortable\n• Usage unique\n• Idéales pour blocs, cabinets, laboratoires et visiteurs",
                'price' => 3000,
                'stock' => 300,
                'is_featured' => true,
                'images' => ['sur-chaussures-1.jpg'],
            ],
            [
                'sku' => 'KPM-RACH-003',
                'category' => 'aiguilles-prelevement',
                'name' => 'Aiguilles de rachianesthésie',
                'short_description' => 'Aiguilles spinales à embase transparente et code couleur selon le calibre.',
                'description' => "Aiguilles de rachianesthésie (aiguilles spinales) à usage unique.\n\n• Embase transparente permettant de visualiser le reflux\n• Code couleur de l'embase selon le calibre\n• Réservées à un usage par des professionnels de santé",
                'price' => 12000,
                'stock' => 60,
                'is_featured' => true,
                'images' => ['rachianesthesie-1.jpg', 'rachianesthesie-2.jpg'],
            ],
            [
                'sku' => 'KPM-PREL-004',
                'category' => 'aiguilles-prelevement',
                'name' => 'Aiguilles de prélèvement sanguin multi-prélèvements',
                'short_description' => 'Aiguilles à code couleur, compatibles avec les supports de prélèvement sous vide.',
                'description' => "Aiguilles stériles de prélèvement sanguin à usage unique.\n\n• Code couleur selon le calibre (noir, vert, jaune, bleu…)\n• Adaptées aux supports de prélèvement sous vide standard\n• Capuchon de protection de l'aiguille",
                'price' => 7500,
                'stock' => 200,
                'is_featured' => false,
                'images' => ['aiguilles-prelevement-1.jpg', 'aiguilles-prelevement-2.jpg', 'aiguilles-prelevement-3.jpg'],
            ],
            [
                'sku' => 'KPM-SECU-005',
                'category' => 'aiguilles-prelevement',
                'name' => 'Aiguille de prélèvement de sécurité avec support',
                'short_description' => 'Aiguille avec dispositif de sécurité à rabat et support de prélèvement transparent.',
                'description' => "Aiguille de prélèvement sanguin avec dispositif de sécurité pour limiter les risques de piqûre accidentelle.\n\n• Protection à rabat rabattable après usage\n• Support (holder) transparent fourni\n• Usage unique",
                'price' => 15000,
                'stock' => 80,
                'is_featured' => false,
                'images' => ['aiguille-securite-1.jpg'],
            ],
            [
                'sku' => 'KPM-GAZE-006',
                'category' => 'pansements-bandes',
                'name' => 'Bande de gaze extensible',
                'short_description' => 'Bande souple et respirante pour la fixation des pansements.',
                'description' => "Bande de gaze extensible pour le maintien des pansements et compresses.\n\n• Souple, respirante et facile à ajuster\n• Se conforme aux contours du corps\n• Sous emballage individuel",
                'price' => 500,
                'stock' => 500,
                'is_featured' => false,
                'images' => ['gaze-extensible-1.jpg', 'gaze-extensible-2.jpg'],
            ],
            [
                'sku' => 'KPM-GBLE-007',
                'category' => 'pansements-bandes',
                'name' => 'Bande de gaze à bords bleus',
                'short_description' => 'Bande de gaze tricotée à lisières bleues pour pansements et maintien.',
                'description' => "Bande de gaze tricotée à lisières bleues.\n\n• Bords renforcés qui évitent l'effilochage\n• Maintien confortable des pansements\n• Usage courant en soins et premiers secours",
                'price' => 800,
                'stock' => 400,
                'is_featured' => false,
                'images' => ['gaze-bords-bleus-1.jpg', 'gaze-bords-bleus-2.jpg'],
            ],
            [
                'sku' => 'KPM-CREP-008',
                'category' => 'pansements-bandes',
                'name' => 'Bande de crêpe à bords bleus',
                'short_description' => 'Bande de crêpe souple pour maintien et légère contention.',
                'description' => "Bande de crêpe en coton à lisières bleues.\n\n• Élasticité modérée pour le maintien et la légère contention\n• Tissu doux et respirant\n• Réutilisable après lavage",
                'price' => 1200,
                'stock' => 300,
                'is_featured' => false,
                'images' => ['crepe-bords-bleus-1.jpg'],
            ],
            [
                'sku' => 'KPM-ELAS-009',
                'category' => 'pansements-bandes',
                'name' => 'Bande élastique de contention avec agrafes',
                'short_description' => 'Bande élastique livrée avec agrafes métalliques de fixation.',
                'description' => "Bande élastique de contention pour entorses, foulures et maintien articulaire.\n\n• Lisières rouges, tissu extensible\n• Livrée avec deux agrafes métalliques de fixation\n• Réutilisable après lavage",
                'price' => 1800,
                'stock' => 250,
                'is_featured' => false,
                'images' => ['bande-elastique-1.jpg'],
            ],
            [
                'sku' => 'KPM-PLAT-010',
                'category' => 'pansements-bandes',
                'name' => 'Bandes plâtrées',
                'short_description' => 'Bandes plâtrées pour immobilisation orthopédique.',
                'description' => "Bandes plâtrées pour la réalisation de plâtres et d'attelles d'immobilisation.\n\n• Prise rapide après immersion dans l'eau\n• Modelables avant durcissement\n• Réservées à un usage par des professionnels de santé",
                'price' => 2500,
                'stock' => 150,
                'is_featured' => true,
                'images' => ['bandes-platrees-1.jpg', 'bandes-platrees-2.jpg'],
            ],
            [
                'sku' => 'KPM-BRAC-011',
                'category' => 'identification-patient',
                'name' => "Bracelets d'identification patient adulte",
                'short_description' => "Bracelets d'identification avec zone d'écriture pour les informations du patient.",
                'description' => "Bracelets d'identification hospitaliers pour adultes, disponibles en plusieurs couleurs.\n\n• Zone dédiée aux informations du patient (nom, service, médecin, numéro)\n• Fermeture sécurisée par bouton pression\n• Matière souple et confortable",
                'price' => 6000,
                'stock' => 100,
                'is_featured' => false,
                'images' => ['bracelets-adulte-1.jpg', 'bracelets-adulte-2.jpg', 'bracelets-adulte-3.jpg'],
            ],
            [
                'sku' => 'KPM-BRNN-012',
                'category' => 'identification-patient',
                'name' => "Bracelets d'identification nouveau-né",
                'short_description' => 'Bracelets rose et bleu à compléter (nom, sexe, lit, date).',
                'description' => "Bracelets d'identification pour nouveau-nés, en rose et en bleu.\n\n• Champs à compléter : nom, sexe, lit, date\n• Fermeture par bouton pression\n• Matière souple et légère",
                'price' => 5000,
                'stock' => 100,
                'is_featured' => false,
                'images' => ['bracelets-nouveau-ne-1.jpg'],
            ],
            [
                'sku' => 'KPM-BAND-013',
                'category' => 'diagnostic',
                'name' => 'Bandelettes urinaires (flacon de 100)',
                'short_description' => "Bandelettes réactives pour l'analyse d'urine, lecture par comparaison de couleurs.",
                'description' => "Flacon de 100 bandelettes réactives pour l'analyse urinaire.\n\n• Lecture visuelle par comparaison avec l'échelle de couleurs du flacon\n• Plusieurs paramètres sur une même bandelette (leucocytes, nitrites, protéines, pH, sang, glucose, cétones…)\n• Conserver le flacon bien fermé, à l'abri de l'humidité",
                'price' => 8500,
                'stock' => 90,
                'is_featured' => true,
                'images' => ['bandelettes-urinaires-1.jpg', 'bandelettes-urinaires-2.jpg', 'bandelettes-urinaires-3.jpg', 'bandelettes-urinaires-4.jpg'],
            ],
            [
                'sku' => 'KPM-OXYG-014',
                'category' => 'urgence-reanimation',
                'name' => 'Lunettes à oxygène (canules nasales)',
                'short_description' => 'Canules nasales pour oxygénothérapie : nourrisson, enfant et adulte.',
                'description' => "Lunettes à oxygène (canules nasales) à usage unique pour l'administration d'oxygène.\n\n• Tailles disponibles : nourrisson, enfant, adulte\n• Embouts souples et confortables\n• Tubulure transparente",
                'price' => 1500,
                'stock' => 200,
                'is_featured' => true,
                'images' => ['lunettes-oxygene-1.jpg', 'lunettes-oxygene-2.jpg'],
            ],
            [
                'sku' => 'KPM-DEFA-015',
                'category' => 'urgence-reanimation',
                'name' => 'Électrodes de défibrillation adulte',
                'short_description' => 'Électrodes autocollantes pour défibrillateur — garantie 30 mois.',
                'description' => "Paire d'électrodes de défibrillation autocollantes pour adulte.\n\n• Garantie 30 mois\n• Câble avec connecteur intégré\n• Vérifiez la compatibilité avec la référence de votre défibrillateur avant commande",
                'price' => 45000,
                'stock' => 25,
                'is_featured' => true,
                'images' => ['electrodes-defibrillation-adulte-1.jpg'],
            ],
            [
                'sku' => 'KPM-DEFP-016',
                'category' => 'urgence-reanimation',
                'name' => 'Électrodes de défibrillation pédiatriques',
                'short_description' => 'Électrodes autocollantes pédiatriques pour défibrillateur.',
                'description' => "Paire d'électrodes de défibrillation autocollantes pour enfant (pédiatrique).\n\n• Format adapté aux enfants\n• Câble avec connecteur intégré, sous pochette individuelle\n• Vérifiez la compatibilité avec la référence de votre défibrillateur avant commande",
                'price' => 48000,
                'stock' => 20,
                'is_featured' => false,
                'images' => ['electrodes-defibrillation-pediatriques-1.jpg'],
            ],
            [
                'sku' => 'KPM-COTO-017',
                'category' => 'pansements-bandes',
                'name' => 'Coton hydrophile (rouleau de 1 kg)',
                'short_description' => 'Rouleau de coton hydrophile de 1000 g pour soins et nettoyage.',
                'description' => "Rouleau de coton hydrophile de 1000 g.\n\n• Très absorbant et doux\n• À découper selon le besoin pour soins, nettoyage et protection\n• Sous emballage papier",
                'price' => 6500,
                'stock' => 100,
                'is_featured' => true,
                'images' => ['coton-hydrophile-1.jpg'],
            ],
            [
                'sku' => 'KPM-DOIG-018',
                'category' => 'protection-hygiene',
                'name' => 'Doigtiers en latex (sachet de 100)',
                'short_description' => 'Doigtiers roulés en latex à usage unique, taille Medium, légèrement poudrés.',
                'description' => "Sachet de 100 doigtiers roulés en latex à usage unique.\n\n• Taille Medium (Gr3), légèrement poudrés\n• Protègent un doigt lors des soins et examens\n• Garder à l'abri de tout rayonnement et au sec",
                'price' => 2500,
                'stock' => 150,
                'is_featured' => false,
                'images' => ['doigtiers-latex-1.jpg'],
            ],
        ];

        foreach ($products as $data) {
            $category = $data['category'];
            $files = $data['images'];
            unset($data['category'], $data['images']);

            $product = Product::withTrashed()->firstOrNew(['sku' => $data['sku']]);

            if (! $product->exists) {
                $product->slug = Product::uniqueSlug($data['name']);
                $product->is_active = true;
            }

            $product->fill($data);
            $product->category_id = $cat[$category];

            // Les photos ne sont (ré)installées que pour un produit neuf ou sans photo,
            // afin de ne jamais écraser celles modifiées depuis l'espace admin.
            if (! $product->exists || empty($product->rawImages())) {
                $product->images = $this->storeImages($files);
            }

            $product->save();
        }
    }

    /** Copie les photos du catalogue vers le disque public et renvoie leurs chemins. */
    private function storeImages(array $files): array
    {
        $directory = database_path('seeders/product-images');
        $paths = [];

        foreach ($files as $file) {
            $source = "{$directory}/{$file}";

            if (! is_file($source)) {
                continue;
            }

            $target = "products/{$file}";
            Storage::disk('public')->put($target, file_get_contents($source));
            $paths[] = $target;
        }

        return $paths;
    }
}

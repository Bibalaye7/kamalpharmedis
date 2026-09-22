<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::pluck('id', 'slug');

        $products = [
            [
                'sku' => 'KPM-TENS-001',
                'category' => 'materiel-medical',
                'name' => 'Tensiomètre électronique au bras',
                'short_description' => 'Mesure automatique de la tension artérielle et du pouls, écran LCD large.',
                'description' => "Tensiomètre électronique au bras, simple d'utilisation et fiable pour le suivi quotidien de votre tension.\n\n• Écran LCD rétroéclairé, grands chiffres\n• Détection de l'arythmie cardiaque\n• Mémoire de 2 x 90 mesures avec date et heure\n• Brassard adulte 22–42 cm\n• Fonctionne sur piles ou adaptateur secteur",
                'price' => 35000,
                'old_price' => 42000,
                'stock' => 25,
                'is_featured' => true,
            ],
            [
                'sku' => 'KPM-GLUC-002',
                'category' => 'materiel-medical',
                'name' => 'Glucomètre + 50 bandelettes',
                'short_description' => 'Lecteur de glycémie rapide (5 secondes) avec 50 bandelettes et autopiqueur.',
                'description' => "Kit complet d'autosurveillance de la glycémie pour les personnes diabétiques.\n\n• Résultat en 5 secondes, goutte de sang de 0,6 µL\n• Mémoire de 500 résultats et moyennes sur 7/14/30 jours\n• Livré avec 50 bandelettes, 10 lancettes, autopiqueur et étui\n• Étalonnage automatique, aucun code à saisir",
                'price' => 28500,
                'old_price' => null,
                'stock' => 18,
                'is_featured' => true,
            ],
            [
                'sku' => 'KPM-VITA-003',
                'category' => 'vitamines-complements',
                'name' => 'Complexe multivitamines & minéraux (60 gélules)',
                'short_description' => '13 vitamines et 10 minéraux essentiels pour tonus et immunité au quotidien.',
                'description' => "Formule complète pour couvrir vos besoins quotidiens en vitamines et minéraux.\n\n• Vitamines A, B, C, D, E, K + zinc, fer, magnésium, sélénium\n• Soutient les défenses immunitaires et réduit la fatigue\n• Cure de 2 mois : 1 gélule par jour au cours du repas\n\nCompléments alimentaires : ne se substituent pas à une alimentation variée.",
                'price' => 9500,
                'old_price' => 11000,
                'stock' => 60,
                'is_featured' => true,
            ],
            [
                'sku' => 'KPM-URGE-004',
                'category' => 'premiers-secours',
                'name' => "Kit de premiers secours d'urgence (85 pièces)",
                'short_description' => 'Trousse complète pour la maison, le bureau et le véhicule.',
                'description' => "Trousse de secours robuste et compacte, conforme aux besoins courants de la maison, du bureau et de la voiture.\n\n• Compresses stériles, bandes, pansements assortis, sparadrap\n• Ciseaux, pince à écharde, couverture de survie\n• Solution antiseptique, gants, masque de réanimation\n• Guide des gestes de premiers secours inclus",
                'price' => 15000,
                'old_price' => null,
                'stock' => 32,
                'is_featured' => true,
            ],
            [
                'sku' => 'KPM-THER-005',
                'category' => 'materiel-medical',
                'name' => 'Thermomètre infrarouge sans contact',
                'short_description' => 'Température frontale en 1 seconde, silencieux, alarme de fièvre.',
                'description' => "Thermomètre frontal sans contact, idéal pour toute la famille, y compris les bébés.\n\n• Mesure en 1 seconde à 3–5 cm\n• Alarme sonore et rétroéclairage rouge en cas de fièvre\n• Mémoire des 32 dernières mesures\n• Précision ±0,2 °C",
                'price' => 12500,
                'old_price' => 15000,
                'stock' => 40,
                'is_featured' => false,
            ],
            [
                'sku' => 'KPM-PHYT-006',
                'category' => 'phytotherapie',
                'name' => 'Moringa bio en gélules (90 gélules)',
                'short_description' => 'Poudre de feuilles de moringa 100 % naturelle, source de fer et d\'antioxydants.',
                'description' => "Le moringa, « arbre miracle », est riche en protéines végétales, fer, calcium et antioxydants.\n\n• 500 mg de poudre de feuilles par gélule\n• Cultivé sans pesticides, séché à basse température\n• Recommandé : 2 gélules par jour avec un verre d'eau\n\nÀ consulter avec un professionnel de santé en cas de traitement en cours.",
                'price' => 7500,
                'old_price' => null,
                'stock' => 8,
                'is_featured' => true,
            ],
            [
                'sku' => 'KPM-STET-007',
                'category' => 'materiel-medical',
                'name' => 'Stéthoscope professionnel double pavillon',
                'short_description' => 'Acoustique haute fidélité, pavillon en acier inoxydable, tubulure anti-friction.',
                'description' => "Stéthoscope double pavillon pour professionnels de santé et étudiants en médecine.\n\n• Pavillon en acier inoxydable, membrane et cloche\n• Tubulure en PVC sans latex, anti-parasites\n• Olives souples interchangeables\n• Livré avec accessoires et pochette de rangement",
                'price' => 22000,
                'old_price' => null,
                'stock' => 14,
                'is_featured' => false,
            ],
            [
                'sku' => 'KPM-MASK-008',
                'category' => 'protection-hygiene',
                'name' => 'Masques chirurgicaux 3 plis (boîte de 50)',
                'short_description' => 'Masques à usage médical, filtration bactérienne ≥ 98 %, élastiques confortables.',
                'description' => "Masques chirurgicaux de type IIR à trois couches, adaptés à un usage médical et quotidien.\n\n• Filtration bactérienne (BFE) ≥ 98 %\n• Pince-nez intégré, élastiques souples\n• Sans latex, boîte de 50 masques",
                'price' => 4500,
                'old_price' => 5500,
                'stock' => 5,
                'is_featured' => false,
            ],
        ];

        foreach ($products as $p) {
            $category = $p['category'];
            unset($p['category']);

            Product::withTrashed()->updateOrCreate(
                ['sku' => $p['sku']],
                $p + [
                    'category_id' => $cat[$category],
                    'slug' => Product::uniqueSlug($p['name']),
                    'images' => [],
                    'is_active' => true,
                ]
            );
        }
    }
}

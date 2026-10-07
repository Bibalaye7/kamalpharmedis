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
                'images' => ['sur-chaussures-1.jpg', 'sur-chaussures-2.jpg', 'sur-chaussures-3.jpg', 'sur-chaussures-4.jpg', 'sur-chaussures-5.jpg'],
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
            [
                'sku' => 'KPM-KN95-019',
                'category' => 'protection-hygiene',
                'name' => 'Masques de protection KN95 / N95',
                'short_description' => 'Masques filtrants pliables à 5 couches avec élastiques auriculaires.',
                'description' => "Masques de protection respiratoire KN95 (équivalent N95 / FFP2).\n\n• Filtration élevée des particules\n• Forme pliable en bec de canard, barrette nasale ajustable\n• Élastiques auriculaires confortables\n• Usage unique, conditionnés en boîte\n\nCrédit photo : ProtoplasmaKid (Wikimedia Commons, CC BY-SA 4.0) ; dronepicr (Wikimedia Commons, CC BY 2.0)",
                'price' => 5000,
                'stock' => 200,
                'is_featured' => false,
                'images' => ['masques-kn95-libre-1.jpg', 'masques-kn95-libre-2.jpg'],
            ],
            [
                'sku' => 'KPM-MASQ-020',
                'category' => 'protection-hygiene',
                'name' => 'Masques médicaux 3 plis (sachet de 10)',
                'short_description' => 'Masques chirurgicaux jetables à élastiques, sachet de 10 pièces.',
                'description' => "Masques médicaux jetables à 3 plis, en sachet de 10.\n\n• Trois couches de non-tissé avec couche filtrante\n• Élastiques auriculaires et barrette nasale\n• Pour le personnel soignant, les patients et le grand public\n• Usage unique\n\nCrédit photo : https://www.nursetogether.com/ (Wikimedia Commons, CC BY 4.0)",
                'price' => 1000,
                'stock' => 500,
                'is_featured' => true,
                'images' => ['masques-3-plis-libre-1.jpg', 'masques-3-plis-1.jpg', 'masques-3-plis-libre-2.jpg'],
            ],
            [
                'sku' => 'KPM-GANT-021',
                'category' => 'protection-hygiene',
                'name' => "Gants d'examen en nitrile bleus (boîte de 100)",
                'short_description' => 'Gants jetables sans latex ni poudre, ambidextres, tailles S à XL.',
                'description' => "Gants d'examen en nitrile bleu, boîte de 100.\n\n• Sans latex : adaptés aux personnes allergiques\n• Non poudrés, ambidextres, bord roulé\n• Bonne sensibilité tactile et résistance\n• Tailles disponibles : S, M, L, XL (à préciser à la commande)\n\nCrédit photo : Praewnaaaaaam (Wikimedia Commons, CC BY-SA 4.0)",
                'price' => 6000,
                'stock' => 250,
                'is_featured' => true,
                'images' => ['gants-nitrile-libre-1.jpg', 'gants-nitrile-1.jpg'],
            ],
            [
                'sku' => 'KPM-LAME-022',
                'category' => 'chirurgie-perfusion',
                'name' => 'Lames de bistouri stériles en inox (boîte de 100)',
                'short_description' => 'Lames en acier inoxydable stérilisées aux rayons gamma, emballage individuel.',
                'description' => "Boîte de 100 lames de bistouri stériles à usage unique.\n\n• Acier inoxydable, stérilisation par rayons gamma\n• Chaque lame sous sachet aluminium individuel pelable\n• Numéros disponibles : 10, 10R, 11, 12, 15, 20, 21, 22, 23, 24, 25 (à préciser à la commande)\n• Compatibles avec les manches de bistouri standard",
                'price' => 10000,
                'stock' => 80,
                'is_featured' => false,
                'images' => ['lames-bistouri-1.jpg', 'lames-bistouri-2.jpg', 'lames-bistouri-3.jpg', 'lames-bistouri-4.jpg', 'lames-bistouri-5.jpg', 'lames-bistouri-6.jpg'],
            ],
            [
                'sku' => 'KPM-PERF-023',
                'category' => 'chirurgie-perfusion',
                'name' => 'Perfuseur stérile à usage unique',
                'short_description' => 'Set de perfusion avec chambre compte-gouttes, régulateur à roulette et aiguille.',
                'description' => "Perfuseur (set de perfusion) stérile à usage unique.\n\n• Perforateur avec prise d'air et chambre compte-gouttes transparente\n• Régulateur de débit à roulette\n• Tubulure souple d'environ 150 cm, raccord Luer et aiguille\n• Emballage individuel stérile\n\nCrédit photo : AfroBrazilian (Wikimedia Commons, CC BY-SA 3.0)",
                'price' => 350,
                'stock' => 1000,
                'is_featured' => false,
                'images' => ['perfuseur-1.jpg', 'perfuseur-libre-1.jpg'],
            ],
            [
                'sku' => 'KPM-BURE-024',
                'category' => 'chirurgie-perfusion',
                'name' => 'Perfuseur avec burette graduée (pédiatrique)',
                'short_description' => 'Set de perfusion avec burette graduée de 100/150 ml pour un dosage précis.',
                'description' => "Perfuseur stérile avec burette (chambre) graduée, pour la perfusion de précision en pédiatrie ou en réanimation.\n\n• Burette graduée de 100 ou 150 ml avec filtre à air\n• Régulateur de débit et site d'injection\n• Aiguille et raccord Luer\n• Usage unique, emballage individuel stérile",
                'price' => 2500,
                'stock' => 150,
                'is_featured' => false,
                'images' => ['perfuseur-burette-1.jpg'],
            ],
            [
                'sku' => 'KPM-CHAR-025',
                'category' => 'protection-hygiene',
                'name' => 'Charlottes jetables (sachet de 100)',
                'short_description' => 'Bonnets plissés en non-tissé à bord élastique, usage unique.',
                'description' => "Charlottes (bonnets clip) jetables en non-tissé léger.\n\n• Bord élastique, taille unique\n• Couvrent entièrement les cheveux\n• Pour blocs opératoires, laboratoires, pharmacies et agroalimentaire\n• Sachet de 100",
                'price' => 3500,
                'stock' => 200,
                'is_featured' => false,
                'images' => ['charlottes-1.jpg'],
            ],
            [
                'sku' => 'KPM-CALO-026',
                'category' => 'protection-hygiene',
                'name' => 'Calots de chirurgien à lacets (lot de 50)',
                'short_description' => 'Calots bleus en non-tissé à nouer derrière la tête, usage unique.',
                'description' => "Calots de chirurgien jetables en non-tissé bleu.\n\n• Liens à nouer à l'arrière pour un maintien sûr\n• Légers et respirants\n• Pour le bloc opératoire et les soins\n• Lot de 50",
                'price' => 5000,
                'stock' => 150,
                'is_featured' => false,
                'images' => ['calots-chirurgien-libre-1.jpg', 'calots-chirurgien-1.jpg'],
            ],
            // Mobilier médical : le type (électrique / manuel) est indiqué en tête de la description courte
            [
                'sku' => 'KPM-LIT5-027',
                'category' => 'mobilier-medical',
                'name' => "Lit d'hôpital électrique 5 fonctions",
                'short_description' => '⚡ Électrique — télécommande, dossier, jambes, hauteur et inclinaisons réglables.',
                'description' => "Lit médicalisé électrique 5 fonctions avec télécommande filaire.\n\n⚡ ÉLECTRIQUE : moteurs commandés par télécommande\n• Relève-buste, relève-jambes, hauteur variable, Trendelenburg et proclive\n• Barrières latérales rabattables en ABS\n• Panneaux tête et pied en ABS amovibles\n• 4 roulettes avec freins\n• Branchement sur prise électrique 220 V",
                'price' => 1350000,
                'stock' => 3,
                'is_featured' => true,
                'images' => ['lit-electrique-5-fonctions-1.jpg', 'lit-electrique-5-fonctions-2.jpg'],
            ],
            [
                'sku' => 'KPM-LIT3-028',
                'category' => 'mobilier-medical',
                'name' => "Lit d'hôpital électrique 3 fonctions avec matelas",
                'short_description' => '⚡ Électrique — relève-buste, relève-jambes et hauteur réglables, matelas fourni.',
                'description' => "Lit médicalisé électrique 3 fonctions livré avec son matelas.\n\n⚡ ÉLECTRIQUE : réglages par télécommande filaire\n• Relève-buste, relève-jambes et hauteur variable\n• Matelas médical imperméable\n• Barrières latérales rabattables en ABS\n• 4 roulettes avec freins\n• Branchement sur prise électrique 220 V",
                'price' => 1100000,
                'stock' => 3,
                'is_featured' => false,
                'images' => ['lit-electrique-matelas-1.jpg'],
            ],
            [
                'sku' => 'KPM-LITB-029',
                'category' => 'mobilier-medical',
                'name' => "Lit d'hôpital électrique à barrières ABS",
                'short_description' => '⚡ Électrique — dossier et jambes relevables, barrières ABS, roulettes à frein.',
                'description' => "Lit médicalisé électrique avec barrières latérales en ABS.\n\n⚡ ÉLECTRIQUE : moteur sous le sommier\n• Relève-buste et relève-jambes simultanés\n• Barrières latérales rabattables en ABS\n• Panneaux tête et pied amovibles\n• 4 roulettes avec freins",
                'price' => 950000,
                'stock' => 2,
                'is_featured' => false,
                'images' => ['lit-electrique-3-fonctions-1.jpg'],
            ],
            [
                'sku' => 'KPM-LITM-030',
                'category' => 'mobilier-medical',
                'name' => "Lit d'hôpital manuel 2 manivelles",
                'short_description' => '🔧 Manuel (sans électricité) — dossier et jambes réglables par manivelles.',
                'description' => "Lit médicalisé manuel à 2 manivelles.\n\n🔧 MANUEL : fonctionne sans électricité\n• Manivelle 1 : relève-buste\n• Manivelle 2 : relève-jambes\n• Barrières latérales en aluminium\n• Panneaux tête et pied en ABS\n• 4 roulettes avec freins",
                'price' => 450000,
                'stock' => 5,
                'is_featured' => true,
                'images' => ['lit-manuel-2-manivelles-1.jpg'],
            ],
            [
                'sku' => 'KPM-LITP-031',
                'category' => 'mobilier-medical',
                'name' => "Lit d'hôpital plat simple",
                'short_description' => '🔧 Manuel (sans électricité) — sommier plat perforé, sur roulettes.',
                'description' => "Lit d'hospitalisation plat, simple et robuste.\n\n🔧 SANS ÉLECTRICITÉ : sommier fixe, sans réglage motorisé\n• Sommier en tôle perforée\n• Panneaux tête et pied en ABS\n• 4 roulettes avec freins\n• Idéal pour salles d'observation, dispensaires et cliniques",
                'price' => 250000,
                'stock' => 5,
                'is_featured' => false,
                'images' => ['lit-plat-1.jpg'],
            ],
            [
                'sku' => 'KPM-TABL-032',
                'category' => 'mobilier-medical',
                'name' => "Table d'examen médicale",
                'short_description' => '🔧 Sans électricité — divan d\'examen rembourré avec étagère inférieure.',
                'description' => "Table (divan) d'examen pour cabinet médical.\n\n🔧 SANS ÉLECTRICITÉ : structure fixe\n• Plateau rembourré recouvert de similicuir bleu, facile à nettoyer\n• Structure en acier peint\n• Étagère de rangement inférieure\n• Patins antidérapants",
                'price' => 120000,
                'stock' => 4,
                'is_featured' => false,
                'images' => ['table-examen-1.jpg'],
            ],
        ];

        foreach ($products as $data) {
            $category = $data['category'];
            $files = $data['images'];
            unset($data['category'], $data['images']);

            $product = Product::withTrashed()->firstOrNew(['sku' => $data['sku']]);

            // Un produit existant n'est jamais réécrit : prix, textes et photos modifiés
            // depuis l'espace admin sont conservés. Seuls les produits manquants sont créés.
            if ($product->exists) {
                if (empty($product->rawImages())) {
                    $product->images = $this->storeImages($files);
                    $product->save();
                }

                continue;
            }

            $product->fill($data);
            $product->slug = Product::uniqueSlug($data['name']);
            $product->is_active = true;
            $product->category_id = $cat[$category];
            $product->images = $this->storeImages($files);
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

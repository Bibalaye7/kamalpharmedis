<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API KamalPharMédis  —  préfixe /api
|--------------------------------------------------------------------------
| Rôles : admin (tout), manager (produits, commandes, lecture utilisateurs),
| client (son espace : panier, commandes, favoris, adresses, profil).
*/

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'KamalPharMédis', 'time' => now()->toIso8601String()]));

// --- Authentification --------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:20,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:20,1');
    Route::post('/resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:10,1');

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });
});

// --- Public : catalogue ------------------------------------------------------
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/{product}/reviews', [ReviewController::class, 'index'])->whereNumber('product');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1');
// Demande de devis professionnel (ouverte à tous, rattachée au compte si connecté)
Route::post('/quotes', [QuoteController::class, 'store'])->middleware('throttle:10,1');

// --- Espace connecté (tous rôles) -------------------------------------------
Route::middleware('auth:api')->group(function () {
    // Panier
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::post('/cart/merge', [CartController::class, 'merge']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::put('/cart/{item}', [CartController::class, 'update']);
    Route::delete('/cart/{item}', [CartController::class, 'destroy']);

    // Favoris
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);

    // Adresses
    Route::apiResource('addresses', AddressController::class)->except('show');

    // Commandes du client
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{order}/payment-proof', [OrderController::class, 'declarePayment'])->middleware('throttle:10,1');

    // Paiement en ligne (Wave, Orange Money, carte via PayDunya)
    Route::post('/orders/{order}/pay', [PaymentController::class, 'initiate']);

    // Avis clients (achat vérifié : commande livrée contenant le produit)
    Route::get('/products/{product}/reviews/mine', [ReviewController::class, 'mine'])->whereNumber('product');
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->whereNumber('product')->middleware('throttle:10,1');
    Route::delete('/products/{product}/reviews', [ReviewController::class, 'destroy'])->whereNumber('product');

    // Mes demandes de devis
    Route::get('/quotes', [QuoteController::class, 'index']);
    Route::get('/orders/{order}/pay/status', [PaymentController::class, 'status']);
});

// Moyens de paiement disponibles + numéros Wave / Orange Money du paiement manuel
Route::get('/payments/config', [PaymentController::class, 'config']);

// Notification serveur-à-serveur PayDunya : appelée par PayDunya, jamais par le navigateur.
Route::post('/payments/paydunya/callback', [PaymentController::class, 'callback'])->middleware('throttle:60,1');

// --- Gestion : admin + manager ----------------------------------------------
Route::middleware(['auth:api', 'role:admin,manager'])->group(function () {
    // Produits
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->whereNumber('product');
    Route::post('/products/{product}/images', [ProductController::class, 'addImage'])->whereNumber('product');
    Route::delete('/products/{product}/images', [ProductController::class, 'removeImage'])->whereNumber('product');

    // Catégories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/stats', [Admin\StatsController::class, 'index']);
        Route::get('/products', [ProductController::class, 'adminIndex']);

        Route::get('/orders', [Admin\OrderController::class, 'index']);
        Route::get('/orders/{order}', [Admin\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus']);

        // Utilisateurs : lecture pour les managers
        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::get('/roles', [Admin\UserController::class, 'roles']);
        Route::get('/users/{user}', [Admin\UserController::class, 'show']);

        // Messages de contact
        Route::get('/contact-messages', [Admin\ContactMessageController::class, 'index']);
        Route::get('/contact-messages/{contactMessage}', [Admin\ContactMessageController::class, 'show']);
        Route::delete('/contact-messages/{contactMessage}', [Admin\ContactMessageController::class, 'destroy']);

        // Modération des avis clients
        Route::get('/reviews', [Admin\ReviewController::class, 'index']);
        Route::patch('/reviews/{review}', [Admin\ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [Admin\ReviewController::class, 'destroy']);

        // Demandes de devis professionnels
        Route::get('/quotes', [Admin\QuoteController::class, 'index']);
        Route::get('/quotes/{quote}', [Admin\QuoteController::class, 'show']);
        Route::patch('/quotes/{quote}', [Admin\QuoteController::class, 'update']);
    });
});

// --- Administration : admin uniquement --------------------------------------
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/users', [Admin\UserController::class, 'store']);
    Route::put('/users/{user}', [Admin\UserController::class, 'update']);
    Route::delete('/users/{user}', [Admin\UserController::class, 'destroy']);
});

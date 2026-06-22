<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Models\User;
use App\Models\Orders;
use App\Models\Reviews;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Item;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/order', function (Request $req) {
    $validated = $req->validate([
        'item_id'      => 'required|integer',
        'payment_type' => 'required|string',
        'date'         => 'required|string',
        'status'       => 'required|string',
    ]);

    Log::info($validated);

    Orders::create([
        'user_id'      => Auth::id(),
        'payment_type' => $validated['payment_type'],
        'date'         => $validated['date'],
        'item_id'      => $validated['item_id'],
        'status'       => $validated['status'],
    ]);

    return response()->json([
        'success'  => true,
        'redirect' => route('dashboard'),
    ], 200);
});

Route::get('/type', function () {
    if (User::isAdmin(Auth::id())) {
        return response()->json(['user_type' => 'admin']);
    }
    return response()->json(['user_type' => 'user']);
});

Route::post('/update', function (Request $req) {
    $validated = $req->validate([
        'id'     => 'integer|required',
        'status' => 'string|required',
    ]);

    $newStatus = match ($validated['status']) {
        'Новая'       => 'В обработке',
        'В обработке' => 'Завершена',
        default       => $validated['status'],
    };

    $updated = Orders::findOrFail($validated['id'])->update(['status' => $newStatus]);

    return response()->json([
        'success' => true,
        'data'    => $updated,
    ], 201);
});

Route::get('/orders', function () {
    return response()->json(['orders' => Orders::showAll(Auth::id())]);
});

Route::get('/Aorders', function () {
    return response()->json(['orders' => Orders::showAll1()]);
});

Route::get('/items', function () {
    return response()->json(['items' => Item::showAll()]);
});

Route::get('/reviews', function () {
    return response()->json(['reviews' => Reviews::showByOrder(Auth::id())]);
});

Route::get('/catalog', function () {
    return Inertia::render('default');
});

Route::post('/postReview', function (Request $req) {
    $validated = $req->validate([
        'rating'   => 'required|integer',
        'review'   => 'required|string',
        'order_id' => 'required|integer',
    ]);

    Reviews::create([
        'user_id'  => Auth::id(),
        'rating'   => $validated['rating'],
        'review'   => $validated['review'],
        'order_id' => $validated['order_id'],
    ]);

    return response()->json(['success' => true], 200);
});

require __DIR__ . '/settings.php';

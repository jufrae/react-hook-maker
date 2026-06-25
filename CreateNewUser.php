<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Illuminate\Support\Facades\Log;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'login'=>[
                'required',
                'string',
                'regex:/^[a-zA-Z0-9]+$/',
                Rule::unique(User::class)
            ],
            'name'=>[
                'required',
                'string',
                'regex:/^[а-яА-ЯёЁ ]+$/u'
            ],
            'email'=>[
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class)
            ],
            'password'=>[
                $this->passwordRules()
            ],
            'phone'=>[
                'required',
                'string',
                'regex:/^8\(\d{3}\)\-\d{3}-\d{2}-\d{2}$/'
            ]
        ],[
            'login.min'=>'Логин должен быть минимум 6 символов',
            'login.required'=>'Логин обязателен',
            'login.regex'=>'Логин должен содержать только латинские буквы и цифры',
            'login.unique'=>'Логин должен быть уникальным',

            'name.max'=>'Имя должно быть не более 100 символов',
            'name.required'=>'Логин обязателен',
            'name.regex'=>'Логин должен содержать только латинские буквы и цифры',

            'email.required'=>'Email обязателен',
            'email.email'=>'Email должен иметь формат email@email.domain',
            'email.unique'=>'Email должен быть уникальным',

            'password.min'=>'Пароль должен быть минимум 6 символов',
            'password.required'=>'Пароль обязателен',
            'password.regex'=>'Пароль должен содержать латинские буквы, символы и цифры',

            'phone.required'=>'Логин обязателен',
            'phone.regex'=>'Телефон должен быть указан в формате 8(ххх)ххх-хх-хх'
        ]);
        log::Info(['ppp'=>$input]);
        return User::create([
            'name'=>$input['name'],
            'login'=>$input['login'],
            'password' => Hash::make($input['password']),
            'email' => $input['email'],
            'phone'=>$input['phone']
            ]);
    }
}

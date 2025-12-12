<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        $formatted = [];

        foreach ($settings as $setting) {
            $value = $setting->value;
            if ($setting->type === 'json') {
                $value = json_decode($value, true);
            } elseif ($setting->type === 'boolean') {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            } elseif ($setting->type === 'integer') {
                $value = (int) $value;
            }
            $formatted[$setting->key] = $value;
        }

        return response()->json($formatted);
    }

    public function update(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            $setting = Setting::firstOrNew(['key' => $key]);

            if (is_array($value)) {
                $setting->type = 'json';
                $setting->value = json_encode($value);
            } elseif (is_bool($value)) {
                $setting->type = 'boolean';
                $setting->value = $value ? 'true' : 'false';
            } elseif (is_int($value)) {
                $setting->type = 'integer';
                $setting->value = (string) $value;
            } else {
                $setting->type = 'string';
                $setting->value = (string) $value;
            }

            // You might want to set a group here if needed, defaulting to 'general'
            if (!$setting->exists) {
                $setting->group = 'general';
            }

            $setting->save();
        }

        return response()->json(['message' => 'Settings updated successfully', 'settings' => $this->index()->original]);
    }
}

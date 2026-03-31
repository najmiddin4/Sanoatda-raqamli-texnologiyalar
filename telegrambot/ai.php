<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

$promptDir = __DIR__ . "/prompts";

function respondJson(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readEnv(string $key, ?string $default = null): ?string {
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string) $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string) $_SERVER[$key];
    }

    return $default;
}

function requireEnv(string $key): string {
    $value = readEnv($key);
    if ($value === null || $value === '') {
        respondJson([
            'error' => "Missing required environment variable: {$key}",
        ], 500);
    }

    return $value;
}

function normalizeJournal(?string $journal): string {
    $journal = strtoupper(trim((string) $journal));
    $allowed = ["ITJ", "ME", "IE", "RUM", "DEFAULT"];
    return in_array($journal, $allowed, true) ? $journal : "DEFAULT";
}

function normalizeLang(?string $lang): string {
    $lang = strtolower(trim((string) $lang));
    $allowed = ["uz", "ru", "en"];
    return in_array($lang, $allowed, true) ? $lang : "uz";
}

function getPromptCandidates(string $promptDir, string $journal, string $lang): array {
    $journal = strtolower($journal);
    return [
        $promptDir . "/{$journal}_{$lang}.txt",
        $promptDir . "/{$journal}_uz.txt",
        $promptDir . "/default_{$lang}.txt",
        $promptDir . "/default_uz.txt",
    ];
}

function loadPrompt(string $promptDir, string $journal, string $lang): string {
    foreach (getPromptCandidates($promptDir, $journal, $lang) as $file) {
        if (is_file($file)) {
            $content = file_get_contents($file);
            if ($content !== false && trim($content) !== '') {
                return $content;
            }
        }
    }

    return 'You are an official AI assistant for a scientific journal. Answer clearly, briefly, and only within official journal information.';
}

function askOpenAI(string $message, string $prompt, string $apiKey, string $model, string $lang): string {
    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $prompt],
            ['role' => 'user', 'content' => $message],
        ],
        'temperature' => 0.3,
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_TIMEOUT => 60,
    ]);

    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false || $curlError) {
        return match ($lang) {
            'ru' => 'Проблема с подключением. Попробуйте позже.',
            'en' => 'Connection problem. Please try again later.',
            default => "Ulanishda muammo yuz berdi. Keyinroq qayta urinib ko'ring.",
        };
    }

    $decoded = json_decode($response, true);

    if ($httpCode >= 400) {
        return match ($lang) {
            'ru' => 'Ответ от AI сервиса не получен. Попробуйте позже.',
            'en' => 'No response from the AI service. Please try again later.',
            default => "AI xizmatidan javob olinmadi. Keyinroq qayta urinib ko'ring.",
        };
    }

    return $decoded['choices'][0]['message']['content'] ?? match ($lang) {
        'ru' => 'Ответ не получен. Попробуйте ещё раз.',
        'en' => 'No response received. Please try again.',
        default => "Javob olinmadi. Qayta urinib ko'ring.",
    };
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput ?: '', true);

if (!is_array($data)) {
    respondJson(['error' => "Noto'g'ri JSON so'rov"], 400);
}

$message = trim((string) ($data['message'] ?? ''));
$journal = normalizeJournal($data['journal'] ?? 'DEFAULT');
$lang = normalizeLang($data['lang'] ?? 'uz');

if ($message === '') {
    respondJson(['error' => "Bo'sh so'rov"], 400);
}

$openAiApiKey = requireEnv('OPENAI_API_KEY');
$openAiModel = readEnv('OPENAI_MODEL', 'gpt-4o-mini') ?? 'gpt-4o-mini';
$prompt = loadPrompt($promptDir, $journal, $lang);
$reply = askOpenAI($message, $prompt, $openAiApiKey, $openAiModel, $lang);

respondJson([
    'reply' => $reply,
    'journal' => $journal,
    'lang' => $lang,
]);

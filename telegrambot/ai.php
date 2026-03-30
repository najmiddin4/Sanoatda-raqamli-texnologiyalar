<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/config.php";

$promptDir = __DIR__ . "/prompts";

/* =========================
   HELPERS
========================= */

function respondJson(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function normalizeJournal(?string $journal): string {
    $journal = strtoupper(trim((string)$journal));
    $allowed = ["ITJ", "ME", "IE", "IA", "DEFAULT"];
    return in_array($journal, $allowed, true) ? $journal : "DEFAULT";
}

function normalizeLang(?string $lang): string {
    $lang = strtolower(trim((string)$lang));
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
            if ($content !== false && trim($content) !== "") {
                return $content;
            }
        }
    }
    return "You are a scientific journal AI assistant for the Global Science Hub platform (globalsciencehub.uz). Answer clearly, briefly, and only within official journal information.";
}

function askOpenAI(string $message, string $prompt, string $apiKey, string $lang): string {
    $payload = [
        "model"       => "gpt-4o-mini",
        "messages"    => [
            ["role" => "system", "content" => $prompt],
            ["role" => "user",   "content" => $message],
        ],
        "temperature" => 0.3,
    ];

    $ch = curl_init("https://api.openai.com/v1/chat/completions");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => [
            "Content-Type: application/json",
            "Authorization: Bearer " . $apiKey,
        ],
        CURLOPT_TIMEOUT => 60,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false || $curlError) {
        return match($lang) {
            "ru"    => "\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430 \u0441 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435\u043c. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.",
            "en"    => "Connection problem. Please try again later.",
            default => "Ulanishda muammo yuz berdi. Keyinroq qayta urinib ko'ring.",
        };
    }

    $decoded = json_decode($response, true);

    if ($httpCode >= 400) {
        return match($lang) {
            "ru"    => "\u041e\u0442\u0432\u0435\u0442 \u043e\u0442 AI \u0441\u0435\u0440\u0432\u0438\u0441\u0430 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.",
            "en"    => "No response from the AI service. Please try again later.",
            default => "AI xizmatidan javob olinmadi. Keyinroq qayta urinib ko'ring.",
        };
    }

    return $decoded["choices"][0]["message"]["content"] ?? match($lang) {
        "ru"    => "\u041e\u0442\u0432\u0435\u0442 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
        "en"    => "No response received. Please try again.",
        default => "Javob olinmadi. Qayta urinib ko'ring.",
    };
}

/* =========================
   INPUT
========================= */

$rawInput = file_get_contents("php://input");
$data     = json_decode($rawInput ?: "", true);

if (!is_array($data)) {
    respondJson(["error" => "Noto'g'ri JSON so'rov"], 400);
}

$message = trim((string)($data["message"] ?? ""));
$journal = normalizeJournal($data["journal"] ?? "DEFAULT");
$lang    = normalizeLang($data["lang"] ?? "uz");

if ($message === "") {
    respondJson(["error" => "Bo'sh so'rov"], 400);
}

$prompt = loadPrompt($promptDir, $journal, $lang);
$reply  = askOpenAI($message, $prompt, OPENAI_API_KEY, $lang);

respondJson([
    "reply"   => $reply,
    "journal" => $journal,
    "lang"    => $lang,
]);

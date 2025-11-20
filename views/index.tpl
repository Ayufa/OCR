<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>OCRスキャナー</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="fade-in">

    <button id="dark-mode-toggle" class="dark-mode-toggle-button">
        <span class="icon-light">☀️</span>
        <span class="icon-dark">🌙</span>
    </button>


    <div class="container">
        <h1>OCRスキャナー</h1>
        <form id="upload-form" enctype="multipart/form-data">
            <div id="drop-area">
                <p>ここにファイルをドラッグ＆ドロップ</p>
                <p>または</p>
                <input type="file" name="original_image" accept="image/*,.pdf">
            </div>
            <br><br>
            <select name="lang" id="lang-select">
                <option value="jpn" selected>日本語</option>
                <option value="eng">英語</option>
            </select><br><br>

            <input type="button" value="ファイルをアップロード" id="upload-button">
        </form>
        <div id="loading" style="display:none;">
            <div class="spinner"></div>
            <p id="progress-text">処理中です。お待ちください...</p>
            <progress id="progress-bar" max="100" value="0"></progress>
        </div>
        <br>
        <a href="/history">履歴を見る</a>

    </div>

    <script src="/static/js/main.js"></script>
</body>
</html>
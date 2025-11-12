<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>OCRスキャナー</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="fade-in">
    <div id="notification-bar" style="display: none; width: 100%; background-color: #007BFF; color: white; text-align: center; padding: 10px; position: fixed; top: 0; left: 0; z-index: 1000;">
        <span id="notification-message"></span>
        <button style="margin-left: 20px; background: none; border: none; color: white; font-weight: bold; cursor: pointer;" onclick="hideNotification()">閉じる</button>
    </div>
    <div class="container">
        <button id="dark-mode-toggle" style="margin-top:20px;">ダークモード切り替え</button>
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

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>OCRスキャナー</title>
    <link rel="stylesheet" href="/static/css/style.css">

    <!-- Cropper.jsのCSS -->
    <link rel="stylesheet" href="/static/css/cropper.min.css">
</head>
<body class="fade-in">
    <div id="notification-bar" style="display: none; width: 100%; background-color: #007BFF; color: white; text-align: center; padding: 10px; position: fixed; top: 0; left: 0; z-index: 1000;">
        <span id="notification-message"></span>
        <button style="margin-left: 20px; background: none; border: none; color: white; font-weight: bold; cursor: pointer;" onclick="hideNotification()">×</button>
    </div>
    <div class="container">
        <button id="dark-mode-toggle" style="margin-top:20px;">ダークモード切り替え</button>
        <h1>OCRスキャナー</h1>
        <form id="upload-form" enctype="multipart/form-data">
            <!-- ドラッグ＆ドロップエリアを追加 -->
            <div id="drop-area">
                <p>ここにファイルをドラッグ＆ドロップ</p>
                <p>または</p>
                <!-- 画像ファイル入力の名前を 'original_image' に変更 -->
                <input type="file" name="original_image" accept="image/*,.pdf">
            </div>
            <br><br>
            <select name="lang" id="lang-select">
                <option value="jpn" selected>日本語</option>
                <option value="eng">英語</option>
                <option value="math">数式</option>
            </select><br><br>

            <!-- 範囲選択ツールの説明を追加 -->
            <p id="crop-instructions" style="display: none;">
                画像上でドラッグして範囲を選択・移動・サイズ変更できます。<br>
                マウスホイールまたはピンチ操作でズームできます。
            </p>

            <!-- 画像プレビューエリア -->
            <div id="image-container" style="width: 100%; height: 500px; overflow: auto; display: none;">
                <img id="image-preview">
            </div>

            <!-- ズームコントロールを追加 -->
            <div id="zoom-controls" style="display: none;">
                <button type="button" id="zoom-in">ズームイン</button>
                <button type="button" id="zoom-out">ズームアウト</button>
            </div>

            <!-- クロップ座標を保持する隠しフィールド -->
            <input type="hidden" name="crop_x" id="crop_x">
            <input type="hidden" name="crop_y" id="crop_y">
            <input type="hidden" name="crop_width" id="crop_width">
            <input type="hidden" name="crop_height" id="crop_height">

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

    <!-- 必要なスクリプトの読み込み -->
    <!-- Cropper.jsのJS -->
    <script src="/static/js/cropper.min.js"></script>
    <!-- メインのJavaScriptコード -->
    <script src="/static/js/main.js"></script>
</body>
</html>

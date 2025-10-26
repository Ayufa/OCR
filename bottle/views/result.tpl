<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>OCR結果</title>
    <link rel="stylesheet" href="/static/css/style.css">
    <!-- MathJaxの読み込み -->
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body class="fade-in">
    <div class="container">
        <h1>OCR結果</h1>
        % for result in results:
            <h2>{{result['filename']}}</h2>
            % if result.get('annotated_image'):
                <!-- 注釈付き画像を表示 -->
                <img src="/uploads/{{result['annotated_image']}}" alt="{{result['filename']}}" style="max-width:100%;">
            % elif result['filename'].lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                <!-- 元の画像を表示 -->
                <img src="/uploads/{{result['filename']}}" alt="{{result['filename']}}" style="max-width:100%;">
            % end
            <div>
                {{!result['text'].replace('\n', '<br>')}}
            </div>
            <textarea id="text-{{result['id']}}" rows="10" cols="50">{{result['text']}}</textarea><br>
            <button onclick="copyText('text-{{result['id']}}')">テキストをコピー</button>
            <a href="/download/{{result['filename']}}.txt">テキストをダウンロード</a>
            <br><br>
            <!-- LaTeXに変換ボタンと結果表示エリア -->
            <button onclick="convertToLatex({{result['id']}})">LaTeXに変換</button>
            <textarea id="latex-{{result['id']}}" rows="10" cols="50" placeholder="LaTeXコードがここに表示されます"></textarea><br>
            <button onclick="copyText('latex-{{result['id']}}')">LaTeXをコピー</button>
            <div id="render-{{result['id']}}"></div>
            <hr>
        % end
        <a href="/">戻る</a>
    </div>
    <!-- メインのJavaScriptコード -->
    <script src="/static/js/result.js"></script>
</body>
</html>

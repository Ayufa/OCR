<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>LaTeX OCR 結果</title>
    <link rel="stylesheet" href="/static/css/style.css">
    <!-- MathJaxの読み込み -->
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body class="fade-in">
    <div class="container">
        <h1>LaTeX OCR 結果</h1>
        % if results:
            % for result in results:
                <h2>{{result['filename']}}</h2>
                % if 'error' in result:
                    <p style="color: red;">{{result['error']}}</p>
                % else:
                    <textarea id="latex-{{result['id']}}" rows="10" cols="50">{{result['latex']}}</textarea><br>
                    <button onclick="copyText('latex-{{result['id']}}')">LaTeXをコピー</button>
                    <div id="render-{{result['id']}}">\( {{!result['latex']}} \)</div>
                % end
            % end
        % else:
            <p>結果はありません。</p>
        % end
        <br>
        <a href="/">戻る</a>
    </div>
    <!-- メインのJavaScriptコード -->
    <script src="/static/js/latex_result.js"></script>
</body>
</html>

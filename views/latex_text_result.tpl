<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>LaTeX 変換結果</title>
</head>
<body>
    <h1>{{!result.filename}} のLaTeXコード</h1>
    <pre>{{!result.latex_code}}</pre>
    <!-- ダウンロードボタンを追加 -->
    <form action="/download_latex" method="post">
        <input type="hidden" name="filename" value="{{!result.filename}}">
        <input type="hidden" name="latex_code" value="{{!result.latex_code}}">
        <button type="submit">LaTeXファイルをダウンロード</button>
    </form>
    <br>
    <a href="/">戻る</a>
</body>
</html>

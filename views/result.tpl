<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>OCR結果</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="fade-in">
    <div class="container">
        <h1>OCR結果</h1>
        % for result in results:
            <div class="result-card">
                <div class="result-header">
                    <h2>{{result['filename']}}</h2>
                    <div class="result-actions">
                        <button onclick="copyText('text-{{result['id']}}')" class="btn">テキストをコピー</button>
                        <a href="/download/{{result['filename']}}.txt" class="btn">テキストをダウンロード</a>
                    </div>
                </div>
                <div class="result-content">
                    <div class="result-image">
                        % if result.get('word_data'):
                             <!-- オーバーレイ付き画像コンテナ -->
                             <div class="image-overlay-container" id="img-container-{{result['id']}}" style="position: relative; display: inline-block;">
                                % if result.get('annotated_image'):
                                    <img src="/uploads/{{result['annotated_image']}}" alt="{{result['filename']}}" style="max-width:100%; display: block;" onload="setupOverlays(this, {{!import_json.dumps(result['word_data']) if result.get('word_data') else '[]'}}, 'container-{{result['id']}}')">
                                % elif result['filename'].lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                                    <img src="/uploads/{{result['filename']}}" alt="{{result['filename']}}" style="max-width:100%; display: block;" onload="setupOverlays(this, {{!import_json.dumps(result['word_data']) if result.get('word_data') else '[]'}}, 'container-{{result['id']}}')">
                                % end
                             </div>
                        % else:
                            % if result.get('annotated_image'):
                                <img src="/uploads/{{result['annotated_image']}}" alt="{{result['filename']}}" style="max-width:100%;">
                            % elif result['filename'].lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                                <img src="/uploads/{{result['filename']}}" alt="{{result['filename']}}" style="max-width:100%;">
                            % end
                        % end
                    </div>
                    <div class="result-text">
                        <div class="ocr-text-container" id="container-{{result['id']}}" data-filename="{{result['filename']}}">
                            % if result.get('word_data'):
                                % for word in result['word_data']:
                                    % color_class = 'conf-low' if word['conf'] < 50 else 'conf-mid' if word['conf'] < 80 else 'conf-high'
                                    <span class="ocr-word {{color_class}}" data-id="{{word['id']}}" data-conf="{{word['conf']}}">{{word['text']}}</span>
                                % end
                            % else:
                                {{!result['text'].replace('\n', '<br>')}}
                            % end
                        </div>
                    </div>
                </div>
                <textarea id="text-{{result['id']}}" class="raw-text-area" rows="10">{{result['text']}}</textarea>
            </div>
        % end
        <div style="text-align:center; margin-top:20px;"><a href="/" class="btn">戻る</a></div>
    </div>
    <!-- メインのJavaScriptコード -->
    <script src="/static/js/result.js"></script>

    <!-- 編集用モーダル -->
    <div id="edit-modal" class="modal" style="display:none;">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>テキストの修正</h3>
            <input type="text" id="edit-input" class="edit-input">
            <br><br>
            <button id="save-edit-button">保存</button>
        </div>
    </div>
</body>
</html>

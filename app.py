from bottle import Bottle, run, request, template, static_file, TEMPLATE_PATH, BaseRequest
from PIL import Image, ImageOps
import os
import sys
from pdf2image import convert_from_path
from beaker.middleware import SessionMiddleware
import logging

# --- YomiToku 関連のインポート ---
import cv2  # YomiTokuの可視化結果を保存するために使用
from yomitoku import DocumentAnalyzer

# --- pytesseract 関連のインポート (削除) ---
# import pytesseract
# from pytesseract import Output
# from PIL import ImageDraw


# メモリ制限を増やす（デフォルトは100KB）
BaseRequest.MEMFILE_MAX = 10 * 1024 * 1024  # 10MB

app = Bottle()

# セッション設定
session_opts = {
    'session.type': 'file',
    'session.data_dir': os.path.join(os.path.dirname(__file__), 'data'),
    'session.auto': True
}

# ログの設定
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# パスの設定 (簡略化)
current_dir = os.path.dirname(os.path.abspath(__file__))

# テンプレートディレクトリを設定
TEMPLATE_PATH.insert(0, os.path.join(current_dir, 'views'))

# 静的ファイルとアップロードディレクトリのパスを設定
static_dir = os.path.join(current_dir, 'static')
uploads_dir = os.path.join(current_dir, 'uploads')

# Popplerのパスを設定（必要に応じて変更）
if sys.platform.startswith('win'):
    poppler_path = r'C:\path\to\poppler\bin'
else:
    poppler_path = None

# --- Tesseractのパス設定 (削除) ---
# if sys.platform.startswith('win'):
#     pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# --- ★★★ 変更点: YomiToku Analyzer の初期化 ★★★ ---
# アプリケーション起動時に一度だけモデルをロードします。
# デフォルトは 'cpu' に設定しています。GPUがある場合は 'cuda' に変更してください。
logging.debug("Initializing YomiToku DocumentAnalyzer...")
try:
    analyzer = DocumentAnalyzer(visualize=True, device="cpu")
    logging.debug("YomiToku DocumentAnalyzer initialized successfully on CPU.")
except Exception as e:
    logging.error(f"Failed to initialize YomiToku Analyzer: {e}")
    logging.error("YomiTokuのセットアップが正しく行われているか確認してください。")
    analyzer = None


# 静的ファイルのルーティング
@app.route('/static/<filepath:path>')
def server_static(filepath):
    logging.debug(f"Serving static file: {filepath}")
    return static_file(filepath, root=static_dir)

# アップロードされたファイルを提供
@app.route('/uploads/<filename:path>')
def send_uploaded_file(filename):
    logging.debug(f"Serving uploaded file: {filename}")
    return static_file(filename, root=uploads_dir)

# ダウンロード用のルート
@app.route('/download/<filename:path>')
def download(filename):
    logging.debug(f"Downloading file: {filename}")
    return static_file(filename, root=uploads_dir, download=filename)

# メインルート
@app.route('/', method=['GET', 'POST'])
def index():
    if not analyzer:
        return "OCRエンジン(YomiToku)の初期化に失敗しました。ログを確認してください。"

    s = request.environ.get('beaker.session')
    logging.debug("Session retrieved.")

    if request.method == 'POST':
        logging.debug("Received POST request.")
        
        # --- ★ 変更点: lang は YomiToku では不要 ---
        # YomiTokuは日本語と英語に自動対応しています
        # lang = request.forms.get('lang') or 'jpn' 
        results = []
        # logging.debug(f"Language selected: {lang}")

        uploads = request.files.getall('files') or []
        if not uploads:
            original_image = request.files.get('original_image')
            if original_image and original_image.file:
                uploads = [original_image]

        logging.debug(f"Number of files uploaded: {len(uploads)}")
        for idx, upload in enumerate(uploads):
            if upload and upload.file:
                filename = upload.filename
                file_path = os.path.join(uploads_dir, filename)
                logging.debug(f"Saving uploaded file: {filename} to {file_path}")
                upload.save(file_path, overwrite=True)

                result = {'id': idx, 'filename': filename, 'text': ''}

                try:
                    if filename.lower().endswith('.pdf'):
                        logging.debug(f"Processing PDF file: {filename}")
                        pages = convert_from_path(file_path, poppler_path=poppler_path)
                        text_pages = []
                        annotated_images_paths = [] # ページごとの注釈付き画像パス

                        for i, page in enumerate(pages):
                            logging.debug(f"Processing page {i+1} of PDF with YomiToku.")
                            
                            # --- ★★★ 変更点: YomiToku でOCR実行 ★★★ ---
                            # page は PIL Image オブジェクト
                            yomi_results, ocr_vis, layout_vis = analyzer(page)
                            
                            # テキスト結果 (Markdown形式) を取得
                            text_pages.append(yomi_results.to_markdown())

                            # 注釈付き画像を保存
                            annotated_image_name = f"{os.path.splitext(filename)[0]}_page_{i+1}_annotated.png"
                            annotated_image_path = os.path.join(uploads_dir, annotated_image_name)
                            cv2.imwrite(annotated_image_path, ocr_vis) # cv2でnumpy配列を保存
                            annotated_images_paths.append(annotated_image_name)

                        result['text'] = '\n\n--- (New Page) ---\n\n'.join(text_pages)
                        if annotated_images_paths:
                            # 簡略化のため、最初のページの画像のみフロントに渡す
                            result['annotated_image'] = annotated_images_paths[0]
                    
                    else:
                        logging.debug(f"Processing image file: {filename} with YomiToku.")
                        image = Image.open(file_path)
                        image = ImageOps.exif_transpose(image) # EXIF回転補正は継続
                        
                        # --- ★★★ 変更点: YomiToku でOCR実行 ★★★ ---
                        # pytesseractの前処理 (preprocess_image) は不要
                        yomi_results, ocr_vis, layout_vis = analyzer(image)

                        # テキスト結果 (Markdown形式) を取得
                        result['text'] = yomi_results.to_markdown()

                        # --- ★★★ 変更点: バウンディングボックス描画 (不要) ★★★ ---
                        # YomiToku が 'ocr_vis' として可視化画像を生成するため、
                        # PILでの描画ロジックはすべて不要になります。

                        # YomiToku が生成した可視化画像を保存
                        annotated_image_name = f"{os.path.splitext(filename)[0]}_annotated.png"
                        annotated_image_path = os.path.join(uploads_dir, annotated_image_name)
                        cv2.imwrite(annotated_image_path, ocr_vis)
                        result['annotated_image'] = annotated_image_name


                    # テキストをファイルに保存 (元のロジックを継続)
                    text_file = f'{file_path}.txt'
                    logging.debug(f"Saving OCR result to {text_file}")
                    with open(text_file, 'w', encoding='utf-8') as f:
                        f.write(result['text'])

                    results.append(result)
                    logging.info(f"YomiToku processing completed for file: {filename}")

                except Exception as e:
                    logging.error(f"Error processing file {filename}: {e}")
                    result['text'] = f"Error processing file {filename}: {e}"
                    results.append(result)

        s['results'] = results
        s.save()
        logging.debug("Session updated with new results.")

        # JSONレスポンス (変更なし)
        logging.debug("Returning JSON response.")
        return {'results': results}
    else:
        logging.debug("Received GET request.")
        return template('index')

# --- ★★★ 変更点: preprocess_image 関数 (不要) ★★★ ---
# YomiToku側で最適な前処理が行われるため、
# アプリケーション側でのグレースケール化や二値化は不要です。
# def preprocess_image(image): ... (削除)


# 履歴表示のルート (変更なし)
@app.route('/history')
def history():
    s = request.environ.get('beaker.session')
    results = s.get('results', [])
    logging.debug(f"Displaying history with {len(results)} items.")
    return template('result', results=results)

if __name__ == '__main__':
    logging.debug("Starting application.")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        logging.debug(f"Created uploads directory: {uploads_dir}")
    if not os.path.exists(session_opts['session.data_dir']):
        os.makedirs(session_opts['session.data_dir'])
        logging.debug(f"Created session data directory: {session_opts['session.data_dir']}")
    
    app_with_sessions = SessionMiddleware(app, session_opts)
    run(app=app_with_sessions, host='localhost', port=8080, debug=True, reloader=False)
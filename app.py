from bottle import Bottle, run, request, template, static_file, TEMPLATE_PATH, BaseRequest
from PIL import Image, ImageOps, ImageDraw
import os
import sys  # sys.platform のために残します
from pdf2image import convert_from_path
from beaker.middleware import SessionMiddleware
import logging
import pytesseract  # Tesseract OCR のインポート
from pytesseract import Output


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
    level=logging.DEBUG,  # ログレベルを DEBUG に設定
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
    poppler_path = r'C:\path\to\poppler\bin'  # ここをPopplerのbinフォルダのパスに変更
else:
    poppler_path = None  # LinuxやmacOSではNone

# Tesseractのパスを設定（Windowsの場合）
if sys.platform.startswith('win'):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Tesseractのインストールパスに変更

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

    # セッションの取得
    s = request.environ.get('beaker.session')
    logging.debug("Session retrieved.")

    if request.method == 'POST':
        logging.debug("Received POST request.")
        
        lang = request.forms.get('lang') or 'jpn'
        results = []
        logging.debug(f"Language selected: {lang}")

        # 通常のOCR処理
        uploads = request.files.getall('files') or []
        if not uploads:
            # ファイルが選択されていない場合、original_imageを使用
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

                # 結果用のディクショナリ
                result = {'id': idx, 'filename': filename, 'text': ''}

                try:
                    if filename.lower().endswith('.pdf'):
                        logging.debug(f"Processing PDF file: {filename}")
                        # PDFを画像に変換
                        pages = convert_from_path(file_path, poppler_path=poppler_path)
                        text_pages = []
                        for i, page in enumerate(pages):
                            logging.debug(f"Processing page {i+1} of PDF.")
                            # 画像の前処理
                            image = preprocess_image(page)
                            # Tesseract OCRを使用
                            data = pytesseract.image_to_data(image, lang=lang, output_type=Output.DICT)
                            text = ' '.join(data['text'])
                            text_pages.append(text)
                        result['text'] = '\n\n'.join(text_pages)
                    else:
                        logging.debug(f"Processing image file: {filename}")
                        # 画像ファイルの場合
                        image = Image.open(file_path)
                        # EXIFデータに基づいて画像を回転補正
                        image = ImageOps.exif_transpose(image)
                        # 画像の前処理
                        processed_image = preprocess_image(image)
                        # Tesseract OCRを使用してデータ取得
                        data = pytesseract.image_to_data(processed_image, lang=lang, output_type=Output.DICT)
                        # テキストを取得
                        result['text'] = ' '.join(data['text'])

                        # バウンディングボックスを画像に描画（ここに色分け処理を追加）
                        draw = ImageDraw.Draw(image)
                        n_boxes = len(data['level'])

                        # 信頼度に応じた色を返す関数
                        def get_color(conf):
                            c = max(conf, 0)  # confが未満の場合扱い
                            if c < 50:
                                return 'red'       # 信頼度低
                            elif c < 80:
                                return 'orange'    # 中程度
                            elif c < 90:
                                return 'yellow'    # やや高め
                            else:
                                return 'green'     # 高信頼度

                        for i2 in range(n_boxes):
                            (x, y, w, h) = (data['left'][i2], data['top'][i2], data['width'][i2], data['height'][i2])
                            try:
                                conf = int(data['conf'][i2])
                            except ValueError:
                                conf = 0
                            if conf > 0:
                                color = get_color(conf)
                                draw.rectangle([(x, y), (x + w, y + h)], outline=color, width=2)
                                # 信頼度スコアを同色で表示
                                draw.text((x, y - 10), f'{conf}%', fill=color)

                        # 画像を保存
                        annotated_image_path = f"{file_path}_annotated.png"
                        image.save(annotated_image_path)
                        result['annotated_image'] = os.path.basename(annotated_image_path)

                    # テキストをファイルに保存
                    text_file = f'{file_path}.txt'
                    logging.debug(f"Saving OCR result to {text_file}")
                    with open(text_file, 'w', encoding='utf-8') as f:
                        f.write(result['text'])

                    results.append(result)
                    logging.info(f"OCR processing completed for file: {filename}")

                except Exception as e:
                    logging.error(f"Error processing file {filename}: {e}")
                    result['text'] = f"Error processing file {filename}: {e}"
                    results.append(result)

        # セッションに結果を保存
        s['results'] = results
        s.save()
        logging.debug("Session updated with new results.")

        # ★★★ 変更点 ★★★
        # templateを返す代わりに、辞書を返す（自動的にJSONになる）
        logging.debug("Returning JSON response.")
        return {'results': results}
        # return template('result', results=results) # <- 変更前
    else:
        logging.debug("Received GET request.")
        return template('index')

# 画像の前処理関数
def preprocess_image(image):
    logging.debug("Starting image preprocessing.")
    # グレースケール化
    image = image.convert('L')
    logging.debug("Converted image to grayscale.")
    # 二値化
    threshold = 140
    image = image.point(lambda x: 0 if x < threshold else 255)
    logging.debug("Applied binary threshold to image.")
    return image

# 履歴表示のルート
@app.route('/history')
def history():
    # セッションの取得
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
    
    
    # アプリケーションをセッションミドルウェアでラップ
    app_with_sessions = SessionMiddleware(app, session_opts)
    run(app=app_with_sessions, host='localhost', port=8080, debug=True, reloader=False)
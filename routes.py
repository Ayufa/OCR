import os
import logging
from bottle import static_file, request, template
from config import static_dir, uploads_dir
from services.ocr_service import process_file

def setup_routes(app):
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

                    # OCR処理を実行
                    result = process_file(filename, lang)
                    result['id'] = idx
                    results.append(result)

            # セッションに結果を保存
            s['results'] = results
            s.save()
            logging.debug("Session updated with new results.")

            logging.debug("Returning JSON response.")
            return {'results': results}
        else:
            logging.debug("Received GET request.")
            return template('index')

    # 履歴表示のルート
    @app.route('/history')
    def history():
        # セッションの取得
        s = request.environ.get('beaker.session')
        results = s.get('results', [])
        logging.debug(f"Displaying history with {len(results)} items.")
        return template('result', results=results)

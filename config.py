import os
import sys
import logging
from bottle import BaseRequest, TEMPLATE_PATH
import pytesseract

# メモリ制限を増やす（デフォルトは100KB）
BaseRequest.MEMFILE_MAX = 10 * 1024 * 1024  # 10MB

# パスの設定
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, 'static')
uploads_dir = os.path.join(current_dir, 'uploads')

# テンプレートディレクトリを設定
TEMPLATE_PATH.insert(0, os.path.join(current_dir, 'views'))

# セッション設定
session_opts = {
    'session.type': 'file',
    'session.data_dir': os.path.join(os.path.dirname(__file__), 'data'),
    'session.auto': True
}

# ログの設定
def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

# Popplerのパスを設定
if sys.platform.startswith('win'):
    poppler_path = r'C:\path\to\poppler\bin'  # 必要に応じて変更
else:
    poppler_path = None

# Tesseractのパスを設定
if sys.platform.startswith('win'):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

import os
import logging
import pytesseract
from pytesseract import Output
from PIL import Image, ImageOps, ImageDraw, ImageFile  # ★ 追加: ImageFileをインポート
from pdf2image import convert_from_path
from config import poppler_path, uploads_dir
from utils.image_utils import preprocess_image

# ★ 追加: トランケートされた（途切れた）画像の読み込みを許可する設定
ImageFile.LOAD_TRUNCATED_IMAGES = True

def get_color(conf):
    """
    信頼度に応じた色を返す関数
    """
    c = max(conf, 0)
    if c < 50:
        return 'red'       # 信頼度低
    elif c < 80:
        return 'orange'    # 中程度
    elif c < 90:
        return 'yellow'    # やや高め
    else:
        return 'green'     # 高信頼度

def process_file(filename, lang='jpn'):
    """
    ファイルを処理してOCR結果を返す
    """
    file_path = os.path.join(uploads_dir, filename)
    result = {'filename': filename, 'text': ''}

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
            
            # ★ 変更なし: EXIFデータに基づいて画像を回転補正
            image = ImageOps.exif_transpose(image)
            # 画像の前処理
            processed_image = preprocess_image(image)
            # Tesseract OCRを使用してデータ取得
            data = pytesseract.image_to_data(processed_image, lang=lang, output_type=Output.DICT)
            # テキストを取得
            result['text'] = ' '.join(data['text'])

            # バウンディングボックスを画像に描画
            draw = ImageDraw.Draw(image)
            n_boxes = len(data['level'])

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

        logging.info(f"OCR processing completed for file: {filename}")

    except Exception as e:
        logging.error(f"Error processing file {filename}: {e}")
        result['text'] = f"Error processing file {filename}: {e}"
    
    return result
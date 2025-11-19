import logging
from PIL import Image

def preprocess_image(image):
    """
    画像の前処理を行う関数
    """
    logging.debug("Starting image preprocessing.")
    # グレースケール化
    image = image.convert('L')
    logging.debug("Converted image to grayscale.")
    # 二値化
    threshold = 140
    image = image.point(lambda x: 0 if x < threshold else 255)
    logging.debug("Applied binary threshold to image.")
    return image

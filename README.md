# OCRスキャナー (Glassmorphism UI)

画像（JPG, PNGなど）やPDFファイルからテキストを抽出するためのWebアプリケーションです。

モダンな「グラスモーフィズム（すりガラス）」デザインを採用した、レスポンシブなフロントエンド と、Python (Bottle) および Tesseract OCR を使用したバックエンドで構成されています。

## ✨ 主な機能

* **画像・PDFのOCR**: アップロードされた画像ファイルやPDFドキュメントからテキストを抽出します。
* **多言語対応**: 日本語（デフォルト）と英語のOCR言語を選択できます。
* **モダンなUI**:
    * 背景が透ける「グラスモーフィズム」デザイン。
    * ドラッグ＆ドロップ対応のファイルアップロードエリア。
    * 非同期（Ajax）によるファイルアップロードとJSONベースの結果表示。
    * ライトモード / ダークモード切り替え機能。
* **結果の確認と利用**:
    * 抽出されたテキストをコピーするボタン機能。
    * 抽出テキストを `.txt` ファイルとしてダウンロードする機能。
    * （画像の場合）OCRが認識した単語の信頼度（Confidence）を色分けしたバウンディングボックスで表示。

## 🛠️ 使用技術

**フロントエンド**
* HTML5 (views/index.tpl, views/result.tpl)
* CSS3 (static/css/style.css)
* JavaScript (ES6+) (static/js/main.js)

**バックエンド**
* Python 3
* **Bottle**: Webフレームワーク
* **pytesseract**: Tesseract OCR (Google) へのPythonラッパー
* **Pillow (PIL)**: 画像処理（前処理、描画など）
* **pdf2image**: PDFを画像に変換
* **beaker**: セッション管理

## 🚀 セットアップと実行

### 1. 外部依存関係のインストール

このプログラムは、OCRエンジン「**Tesseract**」と、PDF処理ライブラリ「**Poppler**」に依存しています。これらを先にお使いのシステムにインストールしてください。

**macOS (Homebrew)**:
```bash
brew install tesseract tesseract-lang poppler
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-jpn poppler-utils

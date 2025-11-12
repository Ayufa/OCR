# OCRスキャナー (Glassmorphism UI)

画像（JPG, PNGなど）やPDFファイルからテキストを抽出するためのWebアプリケーションです。

モダンな「グラスモーフィズム（すりガラス）」デザイン を採用した、レスポンシブなフロントエンド と、Python (Bottle) および Tesseract OCR を使用したバックエンドで構成されています。

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
    * （画像の場合）OCRが認識した単語の信頼度を色分けしたバウンディングボックスで表示。
* **履歴表示**: 過去のOCR結果をセッションで保持し、`/history` ページで確認できます。

## 🛠️ 使用技術

**フロントエンド**
* HTML5 (views/index.tpl)
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
```````

**Ubuntu (apt)**:
```bash
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-jpn poppler-utils
```````

**Windows**:
* **Tesseract**: [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) からインストーラーを入手し、インストールします。
    * **重要**: `app.py` 内の `pytesseract.pytesseract.tesseract_cmd` のパス を、ご自身のインストール先に合わせて変更してください。
* **Poppler**: [Poppler for Windows](https://github.com/oschwartz10612/poppler-for-windows) から最新のzipをダウンロードし、展開します。
    * **重要**: `app.py` 内の `poppler_path` のパス を、展開先の `bin` フォルダに合わせて変更してください。
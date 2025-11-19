import os
import logging
from bottle import Bottle, run
from beaker.middleware import SessionMiddleware
from config import session_opts, setup_logging, uploads_dir
from routes import setup_routes

# ログの設定
setup_logging()

app = Bottle()

# ルーティングの設定
setup_routes(app)

if __name__ == '__main__':
    logging.debug("Starting application.")
    
    # 必要なディレクトリの作成
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        logging.debug(f"Created uploads directory: {uploads_dir}")
    
    if not os.path.exists(session_opts['session.data_dir']):
        os.makedirs(session_opts['session.data_dir'])
        logging.debug(f"Created session data directory: {session_opts['session.data_dir']}")
    
    # アプリケーションをセッションミドルウェアでラップ
    app_with_sessions = SessionMiddleware(app, session_opts)
    
    # サーバーの起動
    run(app=app_with_sessions, host='localhost', port=8080, debug=True, reloader=True)
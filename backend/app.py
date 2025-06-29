import logging
from flask import Flask
from flask_cors import CORS
from routes.metadata_routes import metadata_bp
from routes.privacy_filter_routes import privacy_filter_bp
from routes.metadata_removal_routes import metadata_removal_bp
from routes.vision_analysis_routes import vision_analysis_bp
from routes.privacy_content_routes import privacy_content_bp

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    # Enable CORS for all routes, allowing requests from http://localhost:3000
    # You can restrict origins if you only trust certain domains
    CORS(app, resources={r"*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(metadata_bp, url_prefix='/metadata')
    app.register_blueprint(privacy_filter_bp, url_prefix='/privacy')
    app.register_blueprint(metadata_removal_bp, url_prefix='/metadata-removal')
    app.register_blueprint(vision_analysis_bp, url_prefix='/vision')
    app.register_blueprint(privacy_content_bp, url_prefix='/privacy-content')

    logger.info("Flask app has been created and blueprints have been registered.")
    logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)
    return app

if __name__ == '__main__':
    logger.info("Starting the Flask app.")
    app = create_app()
    app.run(debug=True)

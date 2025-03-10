import logging
from flask import Flask
from routes.metadata_routes import metadata_bp
from routes.privacy_filter_routes import privacy_filter_bp

# Configure the root logger
logging.basicConfig(
    level=logging.INFO,  # You can switch to DEBUG for more detailed logs
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)

# Create a logger for the main application
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    # Register the blueprints
    app.register_blueprint(metadata_bp, url_prefix='/metadata')
    app.register_blueprint(privacy_filter_bp, url_prefix='/privacy')

    logger.info("Flask app has been created and blueprints have been registered.")
    return app

if __name__ == '__main__':
    app = create_app()
    logger.info("Starting the Flask app.")
    app.run(debug=True)

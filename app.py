from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, Professor, Assignment, GradingReport, SubmissionResult
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import routes
from routes import main_bp
app.register_blueprint(main_bp)

@app.route('/')
def index():
    return {
        'message': 'Grading Assistant API',
        'version': '1.0.0',
        'status': 'running'
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001, threaded=True)

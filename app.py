from flask import Flask, send_from_directory, send_file
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, Professor, Assignment, GradingReport, SubmissionResult
import os

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5001'])

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import routes
from routes import main_bp
app.register_blueprint(main_bp)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health')
def health_check():
    return {
        'message': 'Grading Assistant API',
        'version': '1.0.0',
        'status': 'running'
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)

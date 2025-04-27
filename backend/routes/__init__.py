from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.workouts import workouts_bp
from routes.comments import comments_bp
from routes.admin import admin_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(workouts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(admin_bp)

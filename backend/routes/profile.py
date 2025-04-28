from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models.user import User
from werkzeug.security import check_password_hash, generate_password_hash

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/profile', methods=['GET'])
@login_required
def profile():
    user = current_user
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at.strftime('%Y-%m-%d'),
        "status": user.status
    })

@profile_bp.route('/api/profile/<int:user_id>', methods=['GET'])
@login_required
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "created_at": user.created_at.strftime('%Y-%m-%d')
    })

@profile_bp.route('/api/update-profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    current_user.first_name = data.get("first_name")
    current_user.last_name = data.get("last_name")
    db.session.commit()
    return jsonify({"message": "Профиль обновлён"}), 200

@profile_bp.route('/api/update-password', methods=['POST'])
@login_required
def update_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({"error": "Неверный текущий пароль"}), 403

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Пароль обновлён"}), 200

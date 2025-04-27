from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User
from mailjet_client import send_reset_code
import random
import string

auth_bp = Blueprint('auth', __name__)
reset_codes = {}

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")

    if not all([first_name, last_name, email, password]):
        return jsonify({"error": "Все поля обязательны"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email уже зарегистрирован"}), 409

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)

    return jsonify({
        "message": "Регистрация успешна",
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "created_at": new_user.created_at.strftime('%Y-%m-%d')
    }), 200

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    login_user(user)
    return jsonify({
        "message": "Успешный вход",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at.strftime('%Y-%m-%d')
    }), 200

@auth_bp.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Выход выполнен"})

@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    code = ''.join(random.choices(string.digits, k=6))
    reset_codes[email] = code

    try:
        send_reset_code(email, code)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Код отправлен на почту"}), 200

@auth_bp.route('/api/confirm-reset', methods=['POST'])
def confirm_reset():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")
    new_password = data.get("newPassword")

    if reset_codes.get(email) != code:
        return jsonify({"error": "Неверный код подтверждения"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    reset_codes.pop(email, None)
    return jsonify({"message": "Пароль успешно изменен"}), 200

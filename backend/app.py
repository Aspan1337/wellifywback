from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from mailjet_rest import Client
import random
import string
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Mailjet setup
mailjet = Client(auth=(app.config['MAILJET_API_KEY'], app.config['MAILJET_SECRET_KEY']), version='v3.1')

# Временное хранилище кодов
reset_codes = {}

# Модель пользователя
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

@app.route('/api/register', methods=['POST'])
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

    return jsonify({"message": "Регистрация успешна"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    return jsonify({"message": "Успешный вход", "first_name": user.first_name}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    code = ''.join(random.choices(string.digits, k=6))
    reset_codes[email] = code

    message = {
        'Messages': [
            {
                "From": {
                    "Email": app.config["MAILJET_SENDER"],
                    "Name": "Служба поддержки"
                },
                "To": [{"Email": email}],
                "Subject": "Код восстановления пароля",
                "TextPart": f"Ваш код восстановления: {code}"
            }
        ]
    }

    try:
        result = mailjet.send.create(data=message)
        if result.status_code != 200:
            return jsonify({"error": "Ошибка отправки письма"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Код отправлен на почту"}), 200

# Подтверждение кода и смена пароля
@app.route('/api/confirm-reset', methods=['POST'])
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

# Проверка соединения
@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        user_count = db.session.execute(db.text("SELECT COUNT(*) FROM users")).scalar()
        return jsonify({"status": "ok", "user_count": user_count})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Запуск
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from mailjet_rest import Client
import random
import string
from datetime import datetime
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = "d7e9c8349f874497ad74d52c2b882d22"

db = SQLAlchemy(app)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)

mailjet = Client(auth=(app.config['MAILJET_API_KEY'], app.config['MAILJET_SECRET_KEY']), version='v3.1')
reset_codes = {}

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def get_id(self):
        return str(self.id)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    replies = db.relationship('Reply', backref='comment', cascade="all, delete-orphan")

class Reply(db.Model):
    __tablename__ = 'replies'
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User')


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/comments', methods=['GET'])
def get_comments():
    comments = Comment.query.order_by(Comment.created_at).all()
    comment_list = []
    current_id = current_user.get_id() if current_user.is_authenticated else None

    for c in comments:
        user = User.query.get(c.user_id)
        comment_list.append({
            "id": c.id,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "text": c.text,
            "date": c.created_at.isoformat(),
            "replies": [
                {
                    "id": r.id,
                    "user": {
                        "id": r.user.id,
                        "first_name": r.user.first_name,
                        "last_name": r.user.last_name
                    },
                    "text": r.text,
                    "date": r.created_at.isoformat()
                } for r in c.replies
            ]
        })

    response = jsonify({
        "comments": comment_list,
        "current_user_id": int(current_id) if current_id else None
    })
    return response

@app.route('/api/comments', methods=['POST'])
@login_required
def add_comment():
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "Комментарий не может быть пустым"}), 400
    comment = Comment(user_id=current_user.id, text=text)
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Комментарий добавлен", "id": comment.id})

@app.route('/api/comments/<int:comment_id>/replies', methods=['POST'])
@login_required
def add_reply(comment_id):
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "Ответ не может быть пустым"}), 400
    reply = Reply(comment_id=comment_id, user_id=current_user.id, text=text)
    db.session.add(reply)
    db.session.commit()
    return jsonify({"message": "Ответ добавлен", "id": reply.id})

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != current_user.id:
        return jsonify({"error": "Нет доступа"}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Комментарий удален"})

@app.route('/api/comments/<int:comment_id>/replies/<int:reply_id>', methods=['DELETE'])
@login_required
def delete_reply(comment_id, reply_id):
    reply = Reply.query.get_or_404(reply_id)
    if reply.user_id != current_user.id or reply.comment_id != comment_id:
        return jsonify({"error": "Нет доступа"}), 403
    db.session.delete(reply)
    db.session.commit()
    return jsonify({"message": "Ответ удален"})

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
    login_user(new_user)

    return jsonify({
        "message": "Регистрация успешна",
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "created_at": new_user.created_at.strftime('%Y-%m-%d')
    }), 200


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    login_user(user)  # ✅ устанавливаем сессию
    return jsonify({
        "message": "Успешный вход",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at.strftime('%Y-%m-%d')
    }), 200

@app.route('/api/profile', methods=['GET'])
@login_required
def profile():
    user = current_user
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at.strftime('%Y-%m-%d')
    })

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Выход выполнен"})

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

@app.route('/api/update-profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    current_user.first_name = data.get("first_name")
    current_user.last_name = data.get("last_name")
    db.session.commit()
    return jsonify({"message": "Профиль обновлён"}), 200

@app.route('/api/update-password', methods=['POST'])
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

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        user_count = db.session.execute(db.text("SELECT COUNT(*) FROM users")).scalar()
        return jsonify({"status": "ok", "user_count": user_count})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
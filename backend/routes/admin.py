from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models.user import User
from extensions import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/api/users", methods=["GET"])
@login_required
def get_users():
    if current_user.status not in ["admin", "chief"]:
        return jsonify({"error": "Недостаточно прав"}), 403

    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "status": user.status
        })
    return jsonify(result)


@admin_bp.route("/api/users/<int:user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id):
    if current_user.status not in ["admin", "chief"]:
        return jsonify({"error": "Недостаточно прав"}), 403

    user = User.query.get_or_404(user_id)
    if user.status == "chief":
        return jsonify({"error": "Нельзя удалить супер-админа"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Пользователь удален"})


@admin_bp.route("/api/users/<int:user_id>/role", methods=["POST"])
@login_required
def update_user_role(user_id):
    if current_user.status != "chief":
        return jsonify({"error": "Недостаточно прав"}), 403

    user = User.query.get_or_404(user_id)
    if user.status == "chief":
        return jsonify({"error": "Нельзя изменить статус супер-админа"}), 403

    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ["admin", "default"]:
        return jsonify({"error": "Некорректный статус"}), 400

    user.status = new_status
    db.session.commit()
    return jsonify({"message": f"Статус обновлен на {new_status}"})
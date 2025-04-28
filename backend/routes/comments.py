from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models.comment import Comment
from models.reply import Reply
from models.user import User

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/api/comments', methods=['GET'])
@login_required
def get_comments():
    comments = Comment.query.order_by(Comment.created_at).all()
    comment_list = []

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
                        "id": r.user_id,
                        "first_name": User.query.get(r.user_id).first_name,
                        "last_name": User.query.get(r.user_id).last_name
                    },
                    "text": r.text,
                    "date": r.created_at.isoformat()
                } for r in c.replies
            ]
        })

    return jsonify({
        "comments": comment_list,
        "current_user_id": current_user.id,
        "current_user_status": current_user.status
    })

@comments_bp.route('/api/comments', methods=['POST'])
@login_required
def add_comment():
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"error": "Текст комментария обязателен"}), 400

    comment = Comment(user_id=current_user.id, text=text)
    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Комментарий добавлен", "id": comment.id})

@comments_bp.route('/api/comments/<int:comment_id>/replies', methods=['POST'])
@login_required
def add_reply(comment_id):
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"error": "Текст ответа обязателен"}), 400

    reply = Reply(comment_id=comment_id, user_id=current_user.id, text=text)
    db.session.add(reply)
    db.session.commit()

    return jsonify({"message": "Ответ добавлен", "id": reply.id})

@comments_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)

    if comment.user_id != current_user.id and current_user.status not in ["admin", "chief"]:
        return jsonify({"error": "Нет доступа"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Комментарий удален"})

@comments_bp.route('/api/comments/<int:comment_id>/replies/<int:reply_id>', methods=['DELETE'])
@login_required
def delete_reply(comment_id, reply_id):
    reply = Reply.query.get_or_404(reply_id)

    if reply.user_id != current_user.id and current_user.status not in ["admin", "chief"]:
        return jsonify({"error": "Нет доступа"}), 403

    db.session.delete(reply)
    db.session.commit()

    return jsonify({"message": "Ответ удален"})

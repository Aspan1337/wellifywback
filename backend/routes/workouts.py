from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models.workout import Workout
from models.workout_section import WorkoutSection
from models.exercise import Exercise
from models.user import User

workouts_bp = Blueprint('workouts', __name__)

@workouts_bp.route("/api/user-workouts", methods=["GET"])
@login_required
def get_user_workouts():
    workouts = Workout.query.filter_by(user_id=current_user.id).all()
    result = []

    for workout in workouts:
        workout_data = {
            "id": workout.id,
            "title": workout.title,
            "sections": []
        }
        sections = WorkoutSection.query.filter_by(workout_id=workout.id).order_by(WorkoutSection.position).all()
        for section in sections:
            section_data = {
                "id": section.id,
                "title": section.title,
                "duration": section.duration,
                "exercises": []
            }
            exercises = Exercise.query.filter_by(section_id=section.id).order_by(Exercise.position).all()
            for exercise in exercises:
                section_data["exercises"].append({
                    "id": exercise.id,
                    "title": exercise.title,
                    "duration": exercise.duration,
                    "videoUrl": exercise.video_url
                })
            workout_data["sections"].append(section_data)
        result.append(workout_data)
    
    return jsonify(result)

@workouts_bp.route("/api/user-workouts", methods=["POST"])
@login_required
def create_user_workout():
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "Неверные данные"}), 400

    workout = Workout(
        user_id=current_user.id,
        title=data["title"]
    )
    db.session.add(workout)
    db.session.flush()

    for sec_index, section in enumerate(data.get("sections", [])):
        workout_section = WorkoutSection(
            workout_id=workout.id,
            title=section.get("title", ""),
            duration=section.get("duration", ""),
            position=sec_index
        )
        db.session.add(workout_section)
        db.session.flush()

        for ex_index, exercise in enumerate(section.get("exercises", [])):
            new_exercise = Exercise(
                section_id=workout_section.id,
                title=exercise.get("title", ""),
                duration=exercise.get("duration", ""),
                video_url=exercise.get("videoUrl", ""),
                position=ex_index
            )
            db.session.add(new_exercise)

    db.session.commit()

    return jsonify({"message": "Тренировка успешно создана"})

@workouts_bp.route("/api/user-workouts/<int:workout_id>", methods=["DELETE"])
@login_required
def delete_user_workout(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first()

    if not workout:
        return jsonify({"error": "Тренировка не найдена или нет доступа"}), 404

    db.session.delete(workout)
    db.session.commit()

    return jsonify({"message": "Тренировка успешно удалена"}), 200

@workouts_bp.route('/api/user-workouts/user/<int:user_id>', methods=['GET'])
@login_required
def get_user_workouts_by_id(user_id):
    user = User.query.get_or_404(user_id)
    workouts = Workout.query.filter_by(user_id=user.id).all()

    result = []
    for workout in workouts:
        workout_data = {
            "id": workout.id,
            "title": workout.title,
            "sections": []
        }
        sections = WorkoutSection.query.filter_by(workout_id=workout.id).order_by(WorkoutSection.position).all()
        for section in sections:
            section_data = {
                "id": section.id,
                "title": section.title,
                "duration": section.duration,
                "exercises": []
            }
            exercises = Exercise.query.filter_by(section_id=section.id).order_by(Exercise.position).all()
            for exercise in exercises:
                section_data["exercises"].append({
                    "id": exercise.id,
                    "title": exercise.title,
                    "duration": exercise.duration,
                    "videoUrl": exercise.video_url
                })
            workout_data["sections"].append(section_data)
        result.append(workout_data)
    
    return jsonify(result)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Profile.css";
import { useParams } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    sections: [
      {
        title: "РАЗМИНКА",
        duration: "2 минуты",
        exercises: [{ title: "", duration: "", videoUrl: "" }],
      },
    ],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const [isOwner, setIsOwner] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          id
            ? `http://localhost:5000/api/profile/${id}`
            : "http://localhost:5000/api/profile",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка загрузки профиля");
        }

        const data = await response.json();
        setUser(data);

        if (id) {
          setIsOwner(false);
        } else {
          setIsOwner(true);
        }
      } catch (err) {
        setError(err.message);
        navigate("/auth");
      }
    };

    const fetchWorkouts = async () => {
      try {
        const response = await fetch(
          id
            ? `http://localhost:5000/api/user-workouts/${id}`
            : "http://localhost:5000/api/user-workouts",
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Ошибка загрузки тренировок");
        }
        const data = await response.json();
        setUserWorkouts(data);
      } catch (err) {
        console.error("Ошибка при загрузке тренировок:", err);
      }
    };

    fetchProfile();
    fetchWorkouts();
  }, [navigate, id]);

  const handleEditClick = () => {
    navigate("/settings");
  };

  const handleLogoutClick = async () => {
    await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const toggleWorkoutExpand = (workoutId) => {
    if (expandedWorkoutId === workoutId) {
      setExpandedWorkoutId(null);
    } else {
      setExpandedWorkoutId(workoutId);
    }
  };

  const toggleWorkoutForm = () => {
    setShowWorkoutForm(!showWorkoutForm);
  };

  const openDeleteModal = (workoutId) => {
    setWorkoutToDelete(workoutId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setWorkoutToDelete(null);
  };

  const handleDeleteWorkout = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user-workouts/${workoutToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении тренировки");
      }

      setUserWorkouts(
        userWorkouts.filter((workout) => workout.id !== workoutToDelete)
      );

      closeDeleteModal();
    } catch (error) {
      console.error("Ошибка при удалении тренировки:", error);
      alert("Не удалось удалить тренировку.");
      closeDeleteModal();
    }
  };

  const handleWorkoutTitleChange = (e) => {
    setNewWorkout({ ...newWorkout, title: e.target.value });
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const updatedSections = [...newWorkout.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value,
    };
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const handleExerciseChange = (sectionIndex, exerciseIndex, field, value) => {
    const updatedSections = [...newWorkout.sections];
    updatedSections[sectionIndex].exercises[exerciseIndex] = {
      ...updatedSections[sectionIndex].exercises[exerciseIndex],
      [field]: value,
    };
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const addExercise = (sectionIndex) => {
    const updatedSections = [...newWorkout.sections];
    updatedSections[sectionIndex].exercises.push({
      title: "",
      duration: "",
      videoUrl: "",
    });
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const removeExercise = (sectionIndex, exerciseIndex) => {
    const updatedSections = [...newWorkout.sections];
    updatedSections[sectionIndex].exercises.splice(exerciseIndex, 1);
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const addSection = () => {
    const updatedSections = [...newWorkout.sections];
    updatedSections.push({
      title: "",
      duration: "",
      exercises: [{ title: "", duration: "", videoUrl: "" }],
    });
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const removeSection = (sectionIndex) => {
    const updatedSections = [...newWorkout.sections];
    updatedSections.splice(sectionIndex, 1);
    setNewWorkout({ ...newWorkout, sections: updatedSections });
  };

  const handleSubmitWorkout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/user-workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newWorkout),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении тренировки");
      }

      const savedWorkout = await response.json();
      setUserWorkouts([...userWorkouts, savedWorkout]);

      setNewWorkout({
        title: "",
        sections: [
          {
            title: "РАЗМИНКА",
            duration: "2 минуты",
            exercises: [{ title: "", duration: "", videoUrl: "" }],
          },
        ],
      });
      setShowWorkoutForm(false);
    } catch (error) {
      console.error("Ошибка при создании тренировки:", error);
      alert("Не удалось сохранить тренировку.");
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return url;
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!user)
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  return (
    <div className="page-container">
      <Header />
      <div className="profile-container">
        <div className="profile-content-wrapper">
          <h1 className="profile-title">ЛИЧНЫЙ КАБИНЕТ</h1>
          <div className="profile-content">
            <div className="profile-avatar">
              <img src="/images/default-avatar.png" alt="Аватар" />
            </div>
            <div className="profile-info">
              <div className="info-item">{user.last_name}</div>
              <div className="info-item">{user.first_name}</div>
              <div className="info-item">{user.email}</div>
              <div className="info-item info-item-small">
                ДАТА РЕГИСТРАЦИИ: {user.created_at}
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="profile-actions">
              <button className="edit-button" onClick={handleEditClick}>
                Редактировать
              </button>
              <button className="logout-button" onClick={handleLogoutClick}>
                Выйти
              </button>
            </div>
          )}

          {/* Раздел с тренировками пользователя */}
          <div className="user-workouts-section">
            <h2 className="workouts-title">СОБСТВЕННЫЕ ТРЕНИРОВКИ</h2>

            {isOwner && (
              <button
                className="add-workout1-button"
                onClick={toggleWorkoutForm}
              >
                {showWorkoutForm
                  ? "Отменить"
                  : "+ Добавить собственную тренировку"}
              </button>
            )}

            {/* Форма создания новой тренировки */}
            {showWorkoutForm && (
              <div className="workout1-form-container">
                <form onSubmit={handleSubmitWorkout} className="workout1-form">
                  <div className="form-group">
                    <label htmlFor="workoutTitle">Название тренировки:</label>
                    <input
                      type="text"
                      id="workoutTitle"
                      value={newWorkout.title}
                      onChange={handleWorkoutTitleChange}
                      placeholder="Например: Силовая тренировка"
                      required
                    />
                  </div>

                  {newWorkout.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="workout1-section-form">
                      <div className="section-header">
                        <h3>Секция {sectionIndex + 1}</h3>
                        {newWorkout.sections.length > 1 && (
                          <button
                            type="button"
                            className="remove-section-button"
                            onClick={() => removeSection(sectionIndex)}
                          >
                            Удалить секцию
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Название секции:</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleSectionChange(
                              sectionIndex,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Например: РАЗМИНКА"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Продолжительность:</label>
                        <input
                          type="text"
                          value={section.duration}
                          onChange={(e) =>
                            handleSectionChange(
                              sectionIndex,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="Например: 5 минут или 3 круга"
                          required
                        />
                      </div>

                      <h4>Упражнения:</h4>
                      {section.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="exercise-form">
                          <div className="form-group">
                            <label>Название упражнения:</label>
                            <input
                              type="text"
                              value={exercise.title}
                              onChange={(e) =>
                                handleExerciseChange(
                                  sectionIndex,
                                  exerciseIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Например: Приседания"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Продолжительность/повторения:</label>
                            <input
                              type="text"
                              value={exercise.duration}
                              onChange={(e) =>
                                handleExerciseChange(
                                  sectionIndex,
                                  exerciseIndex,
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="Например: 30 сек или 15 повторений"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Ссылка на видео (YouTube):</label>
                            <input
                              type="text"
                              value={exercise.videoUrl}
                              onChange={(e) =>
                                handleExerciseChange(
                                  sectionIndex,
                                  exerciseIndex,
                                  "videoUrl",
                                  e.target.value
                                )
                              }
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </div>

                          {section.exercises.length > 1 && (
                            <button
                              type="button"
                              className="remove-exercise-button"
                              onClick={() =>
                                removeExercise(sectionIndex, exerciseIndex)
                              }
                            >
                              Удалить упражнение
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="add-exercise-button"
                        onClick={() => addExercise(sectionIndex)}
                      >
                        + Добавить упражнение
                      </button>
                    </div>
                  ))}

                  <div className="form-buttons">
                    <button
                      type="button"
                      className="add-section-button"
                      onClick={addSection}
                    >
                      + Добавить секцию
                    </button>

                    <button type="submit" className="save-workout1-button">
                      Сохранить тренировку
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Список тренировок пользователя */}
            <div className="user-workouts-list">
              {userWorkouts.length > 0 ? (
                userWorkouts.map((workout) => (
                  <div key={workout.id} className="workout1-card">
                    <div className="workout1-header">
                      <button
                        className="workout1-title-button"
                        onClick={() => toggleWorkoutExpand(workout.id)}
                      >
                        {workout.title}
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => openDeleteModal(workout.id)}
                          className="delete-workout-button"
                        >
                          Удалить
                        </button>
                      )}
                    </div>

                    {expandedWorkoutId === workout.id && (
                      <div className="workout1-expanded">
                        {workout.sections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="workout1-section">
                            <h2 className="workout1-section-title">
                              {section.title}
                            </h2>
                            <div className="workout1-section-duration">
                              <span className="workout1-icon"></span>{" "}
                              {section.duration}
                            </div>

                            <div className="workout1-exercises-grid">
                              {section.exercises.map(
                                (exercise, exerciseIndex) => (
                                  <div
                                    key={exerciseIndex}
                                    className="workout1-exercise"
                                  >
                                    {exercise.videoUrl && (
                                      <div className="workout1-video-placeholder">
                                        <iframe
                                          width="100%"
                                          height="100%"
                                          src={getYoutubeEmbedUrl(
                                            exercise.videoUrl
                                          )}
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        ></iframe>
                                      </div>
                                    )}
                                    <p className="workout1-exercise-title">
                                      {exercise.title}
                                      <span className="workout1-exercise-duration">
                                        ({exercise.duration})
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-workouts-message">
                  {isOwner
                    ? "У вас пока нет сохраненных тренировок."
                    : "У пользователя пока нет сохраненных тренировок."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3 className="delete-modal-title">Подтверждение удаления</h3>
            <p className="delete-modal-message">
              Вы действительно хотите удалить эту тренировку?
            </p>
            <div className="delete-modal-buttons">
              <button
                className="delete-modal-cancel"
                onClick={closeDeleteModal}
              >
                Отменить
              </button>
              <button
                className="delete-modal-confirm"
                onClick={handleDeleteWorkout}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Profile;

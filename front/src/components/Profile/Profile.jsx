import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Вы не авторизованы");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        setError(err.message);
        navigate("/auth");
      });
  }, [navigate]);

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
          <div className="profile-actions">
            <button className="edit-button" onClick={handleEditClick}>
              Редактировать
            </button>
            <button className="logout-button" onClick={handleLogoutClick}>
              Выйти
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

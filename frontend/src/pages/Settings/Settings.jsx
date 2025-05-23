import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Settings.css";

const Settings = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/profile`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setFormData({
          lastName: data.last_name || "",
          firstName: data.first_name || "",
          email: data.email || "",
        })
      )
      .catch(() => navigate("/auth"));
  }, [navigate]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showPasswordModal) {
        setShowPasswordModal(false);
        setModalErrorMessage("");
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showPasswordModal]);

  const renderEyeIcon = (field) => (
    <span
      className="toggle-password"
      onClick={(e) => togglePasswordVisibility(e, field)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {showPassword[field] ? (
          <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </span>
  );

  const togglePasswordVisibility = (e, field) => {
    e.preventDefault();
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Ошибка обновления профиля");
      setSuccessMessage("Данные успешно обновлены");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setSuccessMessage("Ошибка: " + err.message);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setModalErrorMessage("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalErrorMessage("");

    if (passwordData.newPassword.length < 8) {
      setModalErrorMessage("Новый пароль должен быть не менее 8 символов");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setModalErrorMessage("Пароли не совпадают");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Ошибка при смене пароля");

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setSuccessMessage("Пароль успешно обновлён");
        setTimeout(() => setSuccessMessage(""), 5000);
      }, 300);
    } catch (err) {
      setModalErrorMessage(err.message);
    }
  };

  return (
    <div className="settings-page-container">
      <Header />
      <div className="settings-container">
        <div className="settings-content-wrapper">
          <h1 className="settings-title">НАСТРОЙКИ</h1>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="settings-content">
            <div className="settings-avatar">
              <img src="/images/default-avatar.png" alt="Аватар" />
            </div>

            <form className="settings-form">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="settings-input"
              />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="settings-input"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="settings-input"
                readOnly
              />
              <button
                type="button"
                onClick={() => {
                  setModalErrorMessage("");
                  setShowPasswordModal(true);
                }}
                className="settings-change-password-button"
              >
                Изменить пароль
              </button>
              <div className="settings-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="settings-cancel-button"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="settings-save-button"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <button
                className="settings-modal-back-button"
                onClick={closePasswordModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="settings-modal-title">ИЗМЕНЕНИЕ ПАРОЛЯ</h2>
            </div>

            {modalErrorMessage && (
              <div className="modal-error-message">{modalErrorMessage}</div>
            )}

            <form
              className="settings-password-form"
              onSubmit={handlePasswordSubmit}
            >
              <div className="settings-password-input-group">
                <label>Текущий пароль</label>
                <div className="password-field">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="settings-password-input"
                  />
                  {renderEyeIcon("current")}
                </div>
              </div>

              <div className="settings-password-input-group">
                <label>Новый пароль</label>
                <div className="password-field">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="settings-password-input"
                  />
                  {renderEyeIcon("new")}
                </div>
              </div>

              <div className="settings-password-input-group">
                <label>Подтверждение пароля</label>
                <div className="password-field">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="settings-password-input"
                  />
                  {renderEyeIcon("confirm")}
                </div>
              </div>

              <button type="submit" className="settings-modal-save-button">
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Settings;

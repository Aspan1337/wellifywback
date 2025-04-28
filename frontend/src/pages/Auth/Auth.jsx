import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const navigate = useNavigate();

  const renderEyeIcon = () => (
    <span className="toggle-password" onClick={togglePasswordVisibility}>
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
        {showPassword ? (
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const switchToSignUp = (e) => {
    e.preventDefault();
    setIsSignUp(true);
    setForgotPassword(false);
    setShowPassword(false);
    setMessage(null);
  };

  const switchToSignIn = (e) => {
    e.preventDefault();
    setIsSignUp(false);
    setForgotPassword(false);
    setShowPassword(false);
    setMessage(null);
  };

  const switchToForgotPassword = (e) => {
    e.preventDefault();
    setForgotPassword(true);
    setResetStep("email");
    setMessage(null);
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    if (forgotPassword) {
      if (resetStep === "email") {
        try {
          const email = e.target.email.value;
          const res = await fetch(`${API_BASE}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Ошибка");
          setMessage("Код для сброса пароля отправлен на вашу почту");
          setMessageType("success");
          setResetStep("verification");
        } catch (err) {
          setMessage(err.message || "Произошла ошибка");
          setMessageType("error");
        }
      } else if (resetStep === "verification") {
        try {
          const code = e.target.code.value;
          const newPassword = e.target.newPassword.value;
          const email = e.target.email.value;

          const res = await fetch(`${API_BASE}/api/confirm-reset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Ошибка");
          setMessage("Пароль успешно изменен");
          setMessageType("success");
          setForgotPassword(false);
        } catch (err) {
          setMessage(err.message || "Произошла ошибка");
          setMessageType("error");
        }
      }
    } else {
      const formData = {
        first_name: isSignUp ? e.target.first_name.value : undefined,
        last_name: isSignUp ? e.target.last_name.value : undefined,
        email: e.target.email.value,
        password: e.target.password.value,
      };

      const endpoint = isSignUp ? "/api/register" : "/api/login";
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Ошибка");

        setMessage(result.message || "Успешно");
        setMessageType("success");

        localStorage.setItem("isAuthenticated", "true");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (err) {
        setMessage(err.message || "Произошла ошибка");
        setMessageType("error");
      }
    }
  };

  const renderPasswordField = (
    name = "password",
    placeholder = "Введите пароль"
  ) => (
    <div className="password-field">
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        minLength="8"
        required
      />
      {renderEyeIcon()}
    </div>
  );

  const renderForgotPasswordEmail = () => (
    <>
      <div className="form-group">
        <label>Электронная почта</label>
        <input
          name="email"
          type="email"
          placeholder="Введите email для восстановления пароля"
          required
        />
      </div>
      <button className="auth-submit">Отправить код</button>
      <div className="auth-switch">
        <p>
          <a href="#" onClick={switchToSignIn}>
            Вернуться на страницу входа
          </a>
        </p>
      </div>
    </>
  );

  const renderForgotPasswordVerification = () => (
    <>
      <div className="form-group">
        <label>Электронная почта</label>
        <input
          name="email"
          type="email"
          placeholder="Подтвердите ваш email"
          required
        />
      </div>
      <div className="form-group">
        <label>Код подтверждения</label>
        <input
          name="code"
          type="text"
          placeholder="Введите код с электронной почты"
          required
        />
      </div>
      <div className="form-group">
        <label>Новый пароль</label>
        {renderPasswordField("newPassword", "Введите новый пароль")}
      </div>
      <button className="auth-submit">Сохранить новый пароль</button>
      <div className="auth-switch">
        <p>
          <a href="#" onClick={switchToSignIn}>
            Вернуться на страницу входа
          </a>
        </p>
      </div>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>
              {forgotPassword
                ? "ВОССТАНОВЛЕНИЕ ПАРОЛЯ"
                : isSignUp
                ? "РЕГИСТРАЦИЯ"
                : "АВТОРИЗАЦИЯ"}
            </h2>
            <div className="header-back-arrow">
              <Link to="/">
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
              </Link>
            </div>
          </div>

          {message && (
            <div className={`auth-message ${messageType}`}>{message}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {forgotPassword ? (
              resetStep === "email" ? (
                renderForgotPasswordEmail()
              ) : (
                renderForgotPasswordVerification()
              )
            ) : isSignUp ? (
              <>
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    name="first_name"
                    type="text"
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    name="last_name"
                    type="text"
                    placeholder="Введите вашу фамилию"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Электронная почта</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Введите email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Пароль</label>
                  {renderPasswordField()}
                </div>
                <button className="auth-submit">Создать аккаунт</button>
                <div className="auth-switch">
                  <p>
                    Уже есть аккаунт?{" "}
                    <a href="#" onClick={switchToSignIn}>
                      Войти
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Электронная почта</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Введите email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Пароль</label>
                  {renderPasswordField()}
                </div>
                <button className="auth-submit">Войти</button>
                <div className="auth-switch">
                  <p className="forgot-password">
                    <a href="#" onClick={switchToForgotPassword}>
                      Забыли пароль?
                    </a>
                  </p>
                  <p>
                    У вас нет аккаунта?{" "}
                    <a href="#" onClick={switchToSignUp}>
                      Регистрация
                    </a>
                  </p>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

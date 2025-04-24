import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [showWorkoutDropdown, setShowWorkoutDropdown] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  const isNotHomePage = location.pathname !== "/";

  useEffect(() => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }

    const auth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuth(auth);

    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50 || isNotHomePage) {
          header.classList.add("shrink");
        } else if (!isNotHomePage) {
          header.classList.remove("shrink");
        }
      }
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkoutDropdown(false);
      }
    };

    if (isNotHomePage) {
      const header = document.querySelector("header");
      if (header) {
        header.classList.add("shrink");
      }
    }

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotHomePage]);

  const scrollToSection = (id) => {
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        const headerHeight =
          document.querySelector("header")?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  const toggleWorkoutDropdown = (e) => {
    e.stopPropagation();
    setShowWorkoutDropdown(!showWorkoutDropdown);
  };

  const navigateToAuth = () => {
    navigate("/auth");
  };

  const navigateToHome = () => {
    navigate("/");
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
    navigate("/");
  };

  return (
    <header className={`header ${isNotHomePage ? "shrink" : ""}`}>
      <nav className="navigation">
        <div className="nav-left">
          <div className="logo">
            <img
              src="/wellifylogo1.png"
              alt="Wellify Logo"
              onClick={navigateToHome}
              className="logo-img"
            />
          </div>
        </div>
        <div className="nav-right">
          <ul className="nav-els">
            <li
              className="nav-el dropdown-parent"
              onClick={toggleWorkoutDropdown}
              ref={dropdownRef}
            >
              Тренировки
              {showWorkoutDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSection("workout-set");
                      setShowWorkoutDropdown(false);
                    }}
                  >
                    Сет тренировок
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSection("individual-workout");
                      setShowWorkoutDropdown(false);
                    }}
                  >
                    Индивидуальный комплекс тренировок
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSection("gym");
                      setShowWorkoutDropdown(false);
                    }}
                  >
                    Тренажерные залы
                  </div>
                </div>
              )}
            </li>
            <li className="nav-el" onClick={() => scrollToSection("diet")}>
              Питание
            </li>
            <li
              className="nav-el"
              onClick={() => scrollToSection("calculator")}
            >
              Калькулятор
            </li>
            <li className="nav-el" onClick={() => scrollToSection("footer")}>
              Контакты
            </li>
            {!isAuth ? (
              <li className="auth-button" onClick={navigateToAuth}>
                Войти
              </li>
            ) : (
              <li
                className="auth-button dropdown1-parent"
                onClick={toggleUserMenu}
                ref={userMenuRef}
              >
                ☰
                {showUserMenu && (
                  <div className="dropdown1-menu">
                    <div className="dropdown1-item" onClick={navigateToProfile}>
                      Профиль
                    </div>
                    <div
                      className="dropdown1-item"
                      onClick={() => navigate("/comments")}
                    >
                      Комментарии
                    </div>
                    <div
                      className="dropdown1-item"
                      onClick={navigateToSettings}
                    >
                      Настройки
                    </div>
                    <div className="dropdown1-item" onClick={handleLogout}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "100px",
                        }}
                      >
                        Выйти
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;

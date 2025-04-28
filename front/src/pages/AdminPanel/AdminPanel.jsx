import React, { useState, useEffect } from "react";
import "./AdminPanel.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUsersList, setShowUsersList] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserRole(data.status);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/users", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const toggleUsersList = () => {
    setShowUsersList(!showUsersList);
  };

  const deleteUser = async (userId) => {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery)
        )
      );
    }
  };

  const toggleAdminStatus = async (userId, makeAdmin) => {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: makeAdmin ? "admin" : "default" }),
    });
    if (res.ok) {
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, status: makeAdmin ? "admin" : "default" };
        }
        return user;
      });
      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery)
        )
      );
    }
  };

  return (
    <div className="adminpage-container">
      <div className="admin-panel">
        <Header />
        <h1 className="h1-admin">АДМИН-ПАНЕЛЬ</h1>

        <div className="admin-controls">
          <button className="btn primary-btn" onClick={toggleUsersList}>
            Список пользователей
          </button>
        </div>

        {showUsersList && (
          <div className="users-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск пользователей"
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="users-list">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <p>Статус: {user.status}</p>
                  </div>
                  <div className="user-actions">
                    {userRole === "chief" && (
                      <>
                        {user.status !== "admin" && user.status !== "chief" && (
                          <button
                            className="btn admin-btn"
                            onClick={() => toggleAdminStatus(user.id, true)}
                          >
                            Назначить админа
                          </button>
                        )}
                        {user.status === "admin" && (
                          <button
                            className="btn remove-admin-btn"
                            onClick={() => toggleAdminStatus(user.id, false)}
                          >
                            Убрать админа
                          </button>
                        )}
                      </>
                    )}
                    {["chief", "admin"].includes(userRole) && (
                      <button
                        className="btn delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        Удалить пользователя
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;

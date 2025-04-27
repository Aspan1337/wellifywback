import React, { useState, useEffect } from "react";
import "./Comments.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";

const Comments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userStatus, setUserStatus] = useState("default");

  const calculateTotalComments = (commentsData) => {
    let count = commentsData.length;
    commentsData.forEach((comment) => {
      count += comment.replies.length;
    });
    return count;
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:5000/api/comments", {
          credentials: "include",
        });
        const data = await res.json();
        setComments(data.comments || []);
        setCurrentUserId(data.current_user_id);
        setTotalCommentsCount(calculateTotalComments(data.comments || []));
        const initialExpanded = {};
        (data.comments || []).forEach((c) => (initialExpanded[c.id] = false));
        setExpandedComments(initialExpanded);

        if (data.current_user_id) {
          const profileRes = await fetch("http://localhost:5000/api/profile", {
            credentials: "include",
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserStatus(profileData.status);
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError("Не удалось загрузить комментарии.");
        setIsLoading(false);
      }
    };
    fetchComments();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newComment }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      alert("Ошибка при отправке комментария.");
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: replyText }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      alert("Ошибка при отправке ответа.");
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      window.location.reload();
    } catch {
      alert("Ошибка при удалении комментария.");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await fetch(
        `http://localhost:5000/api/comments/${commentId}/replies/${replyId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      window.location.reload();
    } catch {
      alert("Ошибка при удалении ответа.");
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canDeleteComment = (userId) => {
    return userId === currentUserId || ["admin", "chief"].includes(userStatus);
  };

  return (
    <div className="page-container">
      <Header />
      <main className="comments-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="new-comment-section">
              <h2>Оставить комментарий</h2>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ваш комментарий..."
                />
                <button type="submit">Отправить</button>
              </form>
            </div>

            <h2>Всего комментариев: {totalCommentsCount}</h2>
            <div className="comments-section">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <p>
                    {comment.user.id === currentUserId ? (
                      <b>Вы</b>
                    ) : (
                      <b
                        onClick={() => navigate(`/profile/${comment.user.id}`)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </b>
                    )}{" "}
                    — {formatDate(comment.date)}
                  </p>
                  <p
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {comment.text}
                  </p>
                  <div className="comment-actions">
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                    >
                      {replyingTo === comment.id ? "Отменить" : "Ответить"}
                    </button>
                    {canDeleteComment(comment.user.id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="delete-button"
                      >
                        Удалить
                      </button>
                    )}
                    {comment.replies.length > 0 && (
                      <button onClick={() => toggleReplies(comment.id)}>
                        {expandedComments[comment.id]
                          ? `▲ Скрыть ответы`
                          : `▼ Показать ответы (${comment.replies.length})`}
                      </button>
                    )}
                  </div>

                  {replyingTo === comment.id && (
                    <div className="reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Ответ..."
                      />
                      <button onClick={() => handleReplySubmit(comment.id)}>
                        Отправить
                      </button>
                    </div>
                  )}

                  {expandedComments[comment.id] &&
                    comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <p>
                          <b>
                            {reply.user.id === currentUserId
                              ? "Вы"
                              : `${reply.user.first_name} ${reply.user.last_name}`}
                          </b>{" "}
                          — {formatDate(reply.date)}
                        </p>
                        <p
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {reply.text}
                        </p>
                        {canDeleteComment(reply.user.id) && (
                          <button
                            onClick={() =>
                              handleDeleteReply(comment.id, reply.id)
                            }
                            className="delete-button"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Comments;

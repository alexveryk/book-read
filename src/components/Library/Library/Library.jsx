import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addBook,
  updateBook,
  setBooksFromFirebase,
} from "../../../store/features/books/booksSlice";
import "../library.css";
import Header from "../../Header/Header";
import ToReadList from "../ToReadList/ToReadList";
import ReadingList from "../ReadingList/ReadingList";
import ReadList from "../ReadList/ReadList";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { requestNavigation } from "../../../utils/navigationGuard";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebase";

export const Library = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books.list);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    year: "",
    pages: "",
  });

  const [error, setError] = useState("");

  // ──────────────── Підвантаження книг ────────────────
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "books"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const booksFromDb = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(setBooksFromFirebase(booksFromDb));
    });

    return () => unsub();
  }, [dispatch]);

  // ──────────────── Додавання книги ────────────────
  const handleAddBook = async () => {
    if (!auth.currentUser) {
      setError("Спершу увійдіть у свій акаунт");
      return;
    }

    if (!newBook.title.trim()) {
      setError("Поле 'Назва книги' не може бути пустим");
      return;
    }

    setError("");

    const payload = {
      ...newBook,
      status: newBook.status || "to-read",
      year: newBook.year ? String(newBook.year) : "",
      pages: newBook.pages ? String(newBook.pages) : "",
    };

    try {
      await dispatch(addBook(payload)).unwrap();
      setNewBook({ title: "", author: "", year: "", pages: "" });
    } catch (err) {
      console.error("Помилка додавання книги:", err.message);
      setError("Не вдалося додати книгу");
    }
  };

  // ──────────────── Модалка для редагування рейтингу/резюме ────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [modalRating, setModalRating] = useState(0);
  const [modalSummary, setModalSummary] = useState("");

  const openModal = (book) => {
    setModalBook(book);
    setModalRating(book.rating || 0);
    setModalSummary(book.summary || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBook(null);
    setModalRating(0);
    setModalSummary("");
  };

  const saveModal = async () => {
    if (!modalBook) return;
    try {
      await dispatch(
        updateBook({
          id: modalBook.id,
          rating: modalRating,
          summary: modalSummary,
        })
      ).unwrap();
      closeModal();
    } catch (err) {
      console.error("Помилка збереження:", err.message);
    }
  };

  return (
    <div className="library-page">
      <Header />

      <main className="library-main">
        <div className="add-book-row">
          <input
            type="text"
            placeholder="Назва книги"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Автор книги"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          />
          <input
            type="number"
            placeholder="Рік випуску"
            value={newBook.year}
            onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
          />
          <input
            type="number"
            placeholder="Кількість сторінок"
            value={newBook.pages}
            onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
          />
          <button className="add-btn" onClick={handleAddBook}>
            Додати
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {books.length === 0 ? (
          <section className="empty-state">
            <div className="empty-content">
              <div className="steps">
                <div className="step">
                  <div className="step-icon"></div>
                  <div className="step-body">
                    <h4>Крок 1</h4>
                    <p>Створіть особисту бібліотеку</p>
                    <span>
                      Додайте до неї книжки, які маєте намір прочитати.
                    </span>
                  </div>
                </div>
                <div className="step">
                  <div className="step-icon"></div>
                  <div className="step-body">
                    <h4>Крок 2</h4>
                    <p>Сформуйте своє перше тренування</p>
                    <span>
                      Визначте ціль, оберіть період, розпочинайте тренування.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="sections">
              <ReadList onOpenResume={openModal} />
              <ReadingList />
              <ToReadList />
            </div>

            <div className="training-container">
              <button
                className="training-btn"
                onClick={() => requestNavigation(() => navigate("/training"))}>
                Моє тренування
              </button>
            </div>
          </>
        )}

        {modalOpen && modalBook && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Обрати рейтинг книги</h3>
              <div className="modal-rating">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={i <= modalRating ? "star filled" : "star"}
                    onClick={() => setModalRating(i)}
                    style={{ cursor: "pointer", fontSize: 22, marginRight: 6 }}>
                    ★
                  </span>
                ))}
              </div>
              <h4 style={{ marginTop: 12 }}>Резюме</h4>
              <textarea
                rows={6}
                value={modalSummary}
                onChange={(e) => setModalSummary(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 6 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 12,
                }}>
                <button className="btn-back" onClick={closeModal}>
                  Назад
                </button>
                <button className="btn-save" onClick={saveModal}>
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

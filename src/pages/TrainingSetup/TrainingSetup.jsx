import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateBook } from "../../store/features/books/booksSlice";
import "./training.css";
import Header from "../../components/Header/Header";
import {
  registerNavigationGuard,
  unregisterNavigationGuard,
  requestNavigation,
} from "../../utils/navigationGuard";

export default function TrainingSetup() {
  const books = useSelector((s) => s.books.list || []);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressEntries, setProgressEntries] = useState([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [readQueue, setReadQueue] = useState([]);
  const [showBookReadModal, setShowBookReadModal] = useState(false);
  const [timeUpVisible, setTimeUpVisible] = useState(false);
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const [unsaved, setUnsaved] = useState(false);
  const [confirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
  const pendingActionRef = useRef(null);
  const ignoreNextPop = useRef(false);

  const addSelectedBook = () => {
    if (!selectedBookId) return;
    const book = books.find((b) => String(b.id) === String(selectedBookId));
    if (book && !selectedBooks.find((b) => b.id === book.id)) {
      setSelectedBooks((s) => [...s, book]);
    }
  };

  const openSetupModal = () => setShowSetupModal(true);
  const closeSetupModal = () => setShowSetupModal(false);

  const removeSelectedBook = (id) => {
    setSelectedBooks((s) => s.filter((b) => b.id !== id));
  };

  React.useEffect(() => {
    const guard = (action) => {
      if (!unsaved) {
        action();
        return;
      }

      pendingActionRef.current = action;
      setConfirmLeaveVisible(true);
    };
    registerNavigationGuard(guard);

    try {
      window.history.pushState({ trainGuard: true }, "");
    } catch {}

    const onPop = () => {
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        return;
      }

      try {
        window.history.pushState({ trainGuard: true }, "");
      } catch {}
      requestNavigation(() => {
        ignoreNextPop.current = true;
        window.history.back();
      });
    };

    window.addEventListener("popstate", onPop);

    return () => {
      unregisterNavigationGuard();
      window.removeEventListener("popstate", onPop);
    };
  }, [unsaved]);

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt;
  };

  const numDays = useMemo(() => {
    const a = formatDate(startDate);
    const b = formatDate(endDate);
    if (!a || !b) return 0;
    const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const totalPages = useMemo(() => {
    return selectedBooks.reduce((acc, b) => acc + (Number(b.pages) || 0), 0);
  }, [selectedBooks]);

  const pagesPerDay = numDays > 0 ? Math.ceil(totalPages / numDays) : 0;

  const remainingCount = React.useMemo(() => {
    if (!selectedBooks || selectedBooks.length === 0) return 0;
    return selectedBooks.reduce((acc, sb) => {
      const real = books.find((x) => String(x.id) === String(sb.id)) || sb;
      return acc + (real.status === "read" ? 0 : 1);
    }, 0);
  }, [books, selectedBooks]);

  const planDaily = useMemo(() => {
    if (numDays <= 0) return [];
    const base = Math.floor(totalPages / numDays);
    const rem = totalPages % numDays;
    const arr = Array(numDays).fill(base);
    for (let i = 0; i < rem; i++) arr[i] += 1;
    return arr;
  }, [totalPages, numDays]);

  const factDaily = useMemo(() => {
    const arr = Array(numDays).fill(0);
    progressEntries.forEach((p) => {
      if (p.dayIndex >= 0 && p.dayIndex < numDays)
        arr[p.dayIndex] += Number(p.pages) || 0;
    });
    return arr;
  }, [progressEntries, numDays]);

  const dispatch = useDispatch();

  const stopTraining = () => {
    setIsActive(false);
  };

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentTraining");
      if (raw) {
        const tr = JSON.parse(raw);
        if (tr) {
          setStartDate(tr.startDate || "");
          setEndDate(tr.endDate || "");
          setSelectedBooks(tr.selectedBooks || []);

          (tr.selectedBooks || []).forEach((b) => {
            try {
              dispatch(updateBook({ id: b.id, status: "reading" }));
            } catch (err) {
              console.error(err);
            }
          });
          setIsActive(true);
        }
      }
      const rawEntries = localStorage.getItem("trainingEntries");
      if (rawEntries) setProgressEntries(JSON.parse(rawEntries));
    } catch (e) {
      console.error("Failed to load persisted training", e);
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (isActive && remainingCount === 0 && selectedBooks.length > 0) {
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  }, [isActive, remainingCount, selectedBooks]);

  const finalizeTraining = () => {
    try {
      localStorage.removeItem("currentTraining");
    } catch (err) {
      console.error(err);
    }
    try {
      localStorage.removeItem("trainingEntries");
    } catch (err) {
      console.error(err);
    }
    setIsActive(false);
    setSelectedBooks([]);
    setProgressEntries([]);
    setCompleted(false);
    setReadQueue([]);
    setShowBookReadModal(false);
    setTimeUpVisible(false);
  };

  const startTraining = () => {
    if (!startDate || !endDate || selectedBooks.length === 0) return;

    const training = {
      startDate,
      endDate,
      selectedBooks,
      numDays,
      totalPages,
      pagesPerDay,
      planDaily,
    };
    try {
      localStorage.setItem("currentTraining", JSON.stringify(training));
    } catch (e) {
      console.error(e);
    }

    try {
      localStorage.removeItem("trainingEntries");
    } catch (err) {
      console.error(err);
    }

    selectedBooks.forEach((b) => {
      try {
        dispatch(updateBook({ id: b.id, status: "reading" }));
      } catch (err) {
        console.error(err);
      }
    });
    setIsActive(true);
    setProgressEntries([]);
  };

  const autoMarkBooks = (entriesList, selBooks) => {
    const cum = entriesList.reduce((s, e) => s + (Number(e.pages) || 0), 0);
    let running = 0;
    if (!selBooks || selBooks.length === 0) return;
    for (let i = 0; i < selBooks.length; i++) {
      const b = selBooks[i];
      const pages = Number(b.pages) || 0;
      running += pages;
      if (cum >= running) {
        const real = books.find((x) => String(x.id) === String(b.id)) || b;
        if (real.status !== "read") {
          setReadQueue((q) => [...q, real]);
          setShowBookReadModal(true);
          try {
            dispatch(updateBook({ id: b.id, status: "read" }));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  };

  const addProgress = (dayIndex, pages, dateISO) => {
    const entry = {
      id: Date.now(),
      dateISO: dateISO || new Date().toISOString(),
      dayIndex,
      pages: Number(pages),
    };
    const next = [...progressEntries, entry];
    setProgressEntries(next);
    try {
      localStorage.setItem("trainingEntries", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    autoMarkBooks(next, selectedBooks);

    try {
      const el = document.getElementById("progress-pages");
      if (el) el.value = "";
    } catch (err) {
      console.error("Failed to reset pages input", err);
    }
    setUnsaved(false);
  };

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !endDate) return;
    const end = new Date(endDate).getTime();
    if (isNaN(end)) return;
    const until = end - now;
    if (until <= 0 && remainingCount > 0) {
      setTimeUpVisible(true);
    }
  }, [now, isActive, endDate, remainingCount]);

  const Chart = ({ plan, fact }) => {
    const w = 680;
    const h = 180;
    const padding = 24;
    const maxY = Math.max(...plan, ...fact, 1);
    const points = (arr) =>
      arr
        .map((v, i) => {
          const x =
            padding + (i * (w - padding * 2)) / Math.max(1, arr.length - 1);
          const y = h - padding - (v / maxY) * (h - padding * 2);
          return `${x},${y}`;
        })
        .join(" ");

    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="180">
        <polyline
          fill="none"
          stroke="#2b6cb0"
          strokeWidth="2"
          points={points(plan)}
        />
        <polyline
          fill="none"
          stroke="#ff8c42"
          strokeWidth="2"
          points={points(fact)}
        />
      </svg>
    );
  };

  return (
    <div className="training-page">
      <Header />

      {showSetupModal && (
        <div className="setup-modal">
          <div className="setup-modal-header">
            <button
              className="btn-outline"
              onClick={closeSetupModal}
              aria-label="Назад">
              ← Назад
            </button>
            <h3>Моє тренування — Налаштування</h3>
          </div>
          <div className="setup-modal-body">
            <label>
              Початок
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Завершення
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <label>
              Обрати книги з бібліотеки
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}>
                <option value="">Обрати книги з бібліотеки</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn-save"
                onClick={() => {
                  addSelectedBook();
                }}>
                Додати
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="training-main">
        <div className="left-col">
          <h2 className="section-title">Моє тренування</h2>

          {completed && (
            <div
              className="card"
              style={{ borderColor: "#cfeadf", background: "#f0fff7" }}>
              <h4>Тренування завершено 🎉</h4>
              <p>Всі книги у вашому плані відмічені як прочитані.</p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-save" onClick={finalizeTraining}>
                  Завершити тренування
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h4>Налаштування періоду</h4>
            <div className="period-row">
              <label>
                Початок
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                Завершення
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="card">
            <h4>Додати книги</h4>
            <div className="add-book-row-setup">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}>
                <option value="">Обрати книги з бібліотеки</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
              <button className="btn-outline" onClick={addSelectedBook}>
                Додати
              </button>
            </div>
          </div>

          <div className="card">
            <h4>Список книг тренування</h4>

            <table className="setup-table desktop-only">
              <thead>
                <tr>
                  <th>Назва книги</th>
                  <th>Автор</th>
                  <th>Рік</th>
                  <th>Стор.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedBooks.length === 0 ? (
                  <tr className="placeholder-row">
                    <td colSpan={5}>📘 --</td>
                  </tr>
                ) : (
                  selectedBooks.map((b) => {
                    const real =
                      books.find((x) => String(x.id) === String(b.id)) || b;
                    return (
                      <tr key={b.id}>
                        <td>{real.title}</td>
                        <td>{real.author}</td>
                        <td>{real.year}</td>
                        <td>{real.pages}</td>
                        <td>
                          {!isActive ? (
                            <button
                              className="btn-delete"
                              onClick={() => removeSelectedBook(b.id)}>
                              🗑️
                            </button>
                          ) : (
                            <input
                              type="checkbox"
                              checked={real.status === "read"}
                              disabled
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="book-cards mobile-only">
              {selectedBooks.length === 0 ? (
                <div className="placeholder-row">📘 --</div>
              ) : (
                selectedBooks.map((b) => {
                  const real =
                    books.find((x) => String(x.id) === String(b.id)) || b;
                  return (
                    <div className="book-card" key={b.id}>
                      <div className="book-icon">📕</div>
                      <div className="book-content">
                        <div className="book-title">{real.title}</div>
                        <div className="book-meta">
                          {real.author} • {real.year} • {real.pages} стор.
                        </div>
                      </div>
                      <div className="book-action">
                        {!isActive ? (
                          <button
                            className="btn-delete"
                            onClick={() => removeSelectedBook(b.id)}>
                            🗑️
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            checked={real.status === "read"}
                            disabled
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            {!isActive ? (
              <div>
                <button
                  className="training-start-btn"
                  disabled={
                    !startDate || !endDate || selectedBooks.length === 0
                  }
                  onClick={startTraining}>
                  Почати тренування
                </button>
              </div>
            ) : (
              <div>
                <div className="results-panel">
                  <h4>РЕЗУЛЬТАТИ</h4>
                  <div className="results-form">
                    <label>
                      Дата
                      <input
                        id="progress-date"
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                      />
                    </label>
                    <label>
                      Кількість сторінок
                      <input
                        id="progress-pages"
                        type="number"
                        min={1}
                        defaultValue={""}
                        onChange={(e) => setUnsaved(e.target.value !== "")}
                      />
                    </label>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        className="btn-save"
                        onClick={() => {
                          const dateVal =
                            document.getElementById("progress-date").value;
                          const pages = Number(
                            document.getElementById("progress-pages").value
                          );
                          if (!dateVal || pages <= 0) return;

                          let dayIndex = 0;
                          try {
                            const sd = new Date(startDate);
                            const dt = new Date(dateVal);
                            if (!isNaN(sd) && !isNaN(dt)) {
                              dayIndex = Math.floor(
                                (dt - sd) / (1000 * 60 * 60 * 24)
                              );
                              if (dayIndex < 0) dayIndex = 0;
                              if (dayIndex >= numDays) dayIndex = numDays - 1;
                            }
                          } catch (e) {
                            console.error(e);
                          }
                          addProgress(dayIndex, pages, dateVal);
                        }}>
                        Додати результат
                      </button>
                      <button className="btn-outline" onClick={stopTraining}>
                        Зупинити
                      </button>
                    </div>
                  </div>
                  <h5>СТАТИСТИКА</h5>
                  <div className="results-log">
                    {progressEntries.length === 0 ? (
                      <div className="empty-log">Немає записів</div>
                    ) : (
                      <ul>
                        {progressEntries.map((en) => (
                          <li key={en.id}>
                            {new Date(en.dateISO || en.date).toLocaleString()} —{" "}
                            {en.pages} стор.
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            <h4 style={{ marginTop: 12 }}>Графік</h4>
            <div className="chart-header">
              КІЛЬКІСТЬ СТОРІНОК / ДЕНЬ <strong>{pagesPerDay}</strong>
            </div>
            <div className="chart-placeholder">
              <div className="chart-legend">
                <span className="dot plan" /> ПЛАН
                <span className="dot fact" /> ФАКТ
              </div>
              <div className="chart-area">
                <Chart plan={planDaily} fact={factDaily} />
              </div>
            </div>
          </div>
        </div>

        <aside className="right-col">
          <h3>Моя мета прочитати</h3>
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{selectedBooks.length}</div>
              <div className="stat-label">Кількість книжок</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{numDays}</div>
              <div className="stat-label">Кількість днів</div>
            </div>
            {isActive && (
              <div className="stat-card">
                <div className="stat-value">{remainingCount}</div>
                <div className="stat-label">Залишилось книжок</div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {!isActive && !showSetupModal && (
        <button
          className="fab"
          onClick={openSetupModal}
          aria-label="Відкрити налаштування">
          +
        </button>
      )}

      {confirmLeaveVisible && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p style={{ textAlign: "center", marginBottom: 12 }}>
              Якщо Ви вийдете з програми незбережені дані будуть втрачені
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                className="btn-outline"
                onClick={() => setConfirmLeaveVisible(false)}>
                Відміна
              </button>
              <button
                className="btn-save"
                onClick={() => {
                  try {
                    const d = document.getElementById("progress-pages");
                    if (d) d.value = "";
                  } catch (err) {
                    console.error(err);
                  }
                  setUnsaved(false);
                  setConfirmLeaveVisible(false);
                  const act = pendingActionRef.current;
                  pendingActionRef.current = null;
                  if (typeof act === "function") act();
                }}>
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}

      {readQueue.length > 0 && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 48, color: "#ff8c42" }}>👍</div>
              <h3>Вітаю!</h3>
              <p>Ще одна книга прочитана.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="btn-save"
                onClick={() => {
                  setReadQueue((q) => {
                    const [, ...rest] = q;
                    return rest;
                  });
                }}>
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {timeUpVisible && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 48, color: "#999" }}>👍</div>
              <p style={{ marginBottom: 8 }}>
                Ти молодчина, але потрібно швидше! Наступного разу тобі все
                вдасться)
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn-save"
                onClick={() => {
                  finalizeTraining();
                  setTimeUpVisible(false);
                }}>
                Нове тренування
              </button>
              <button
                className="btn-outline"
                onClick={() => {
                  setTimeUpVisible(false);
                  navigate("/library");
                }}>
                Назад
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

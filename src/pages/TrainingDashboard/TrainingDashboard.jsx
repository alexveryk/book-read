import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBook } from "../../store/features/books/booksSlice";
import "./trainingDashboard.css";
import Header from "../../components/Header/Header";

const formatDiff = (ms) => {
  if (ms <= 0) return "0 : 00 : 00 : 00";
  const sec = Math.floor(ms / 1000);
  const s = sec % 60;
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor((sec / 3600) % 24);
  const d = Math.floor(sec / (3600 * 24));
  const pad = (n) => String(n).padStart(2, "0");
  return `${d} : ${pad(h)} : ${pad(m)} : ${pad(s)}`;
};

export default function TrainingDashboard() {
  const dispatch = useDispatch();
  const books = useSelector((s) => s.books.list || []);

  const [trainingPlan, setTrainingPlan] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentTraining");
      if (raw) setTrainingPlan(JSON.parse(raw));
      else {
      }
    } catch (err) {
      console.error("Failed to load training plan", err);
    }
  }, []);

  const trainingBooks = useMemo(() => {
    if (!trainingPlan) return [];
    return trainingPlan.selectedBooks.map(
      (sb) => books.find((b) => String(b.id) === String(sb.id)) || sb
    );
  }, [books, trainingPlan]);

  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem("trainingEntries");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const endOfYear = useMemo(() => {
    const y = new Date().getFullYear();
    return new Date(y, 11, 31, 23, 59, 59).getTime();
  }, []);
  const untilYearMs = Math.max(0, endOfYear - now);

  const totalPages = useMemo(
    () => trainingBooks.reduce((s, b) => s + (Number(b.pages) || 0), 0),
    [trainingBooks]
  );
  const factPages = useMemo(
    () => entries.reduce((s, e) => s + (Number(e.pages) || 0), 0),
    [entries]
  );
  const pagesRemaining = Math.max(0, totalPages - factPages);

  const pagesPerDayEstimate = Math.max(
    1,
    Math.ceil(factPages / Math.max(1, 7))
  );
  const daysToGoal = Math.ceil(pagesRemaining / pagesPerDayEstimate);
  const untilGoalMs = daysToGoal * 24 * 3600 * 1000;

  const numDays = 14;
  const plan = useMemo(() => {
    if (numDays <= 0) return [];
    const base = Math.floor(totalPages / numDays);
    const rem = totalPages % numDays;
    const arr = Array(numDays).fill(base);
    for (let i = 0; i < rem; i++) arr[i]++;
    return arr;
  }, [totalPages]);

  const fact = useMemo(() => {
    const arr = Array(numDays).fill(0);
    entries.forEach((e) => {
      const idx = new Date(e.dateISO).getDate() % numDays;
      arr[idx] += Number(e.pages) || 0;
    });
    return arr;
  }, [entries]);

  const autoMarkBooks = (entriesList) => {
    const cum = entriesList.reduce((s, e) => s + (Number(e.pages) || 0), 0);
    let running = 0;
    if (!trainingBooks || trainingBooks.length === 0) return;
    for (let i = 0; i < trainingBooks.length; i++) {
      const b = trainingBooks[i];
      const pages = Number(b.pages) || 0;
      running += pages;
      if (cum >= running) {
        if (b.status !== "read") {
          dispatch(updateBook({ id: b.id, status: "read" }));
        }
      }
    }
  };

  const addResult = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const date = form.get("date");
    const pages = Number(form.get("pages")) || 0;
    if (!date || pages <= 0) return;
    const next = [...entries, { id: Date.now(), dateISO: date, pages }];
    setEntries(next);
    try {
      localStorage.setItem("trainingEntries", JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }

    autoMarkBooks(next);
    e.target.reset();
  };

  const Chart = ({ planArr, factArr }) => {
    const w = 640;
    const h = 180;
    const padding = 20;
    const maxY = Math.max(...planArr, ...factArr, 1);
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
      <svg viewBox={`0 0 ${w} ${h}`} className="td-chart">
        <polyline
          fill="none"
          stroke="#1f4a7d"
          strokeWidth="2"
          points={points(planArr)}
        />
        <polyline
          fill="none"
          stroke="#ff8c42"
          strokeWidth="2"
          points={points(factArr)}
        />
      </svg>
    );
  };

  return (
    <div className="td-page">
      <Header />

      <main className="td-main">
        <div className="td-topTimers">
          <div className="timer">
            <div className="timer-label">До закінчення року залишилось</div>
            <div className="timer-value">{formatDiff(untilYearMs)}</div>
          </div>
          <div className="timer">
            <div className="timer-label">До досягнення мети залишилось</div>
            <div className="timer-value">{formatDiff(untilGoalMs)}</div>
          </div>
        </div>

        <div className="td-grid">
          <aside className="td-rightCol">
            <h3>Моя мета прочитати</h3>
            <div className="stats">
              <div className="stat">
                <div className="value">{trainingBooks.length}</div>
                <div className="label">Кількість книжок</div>
              </div>
              <div className="stat">
                <div className="value">14</div>
                <div className="label">Кількість днів</div>
              </div>
              <div className="stat">
                <div className="value">
                  {trainingBooks.filter((b) => b.status !== "read").length}
                </div>
                <div className="label">Залишилось книжок</div>
              </div>
            </div>
          </aside>

          <section className="td-leftCol">
            <div className="books-list card">
              <h4>Список книг тренування</h4>
              <div className="list-scroll">
                <table className="setup-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Назва книги</th>
                      <th>Автор</th>
                      <th>Рік</th>
                      <th>Стор.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingBooks.map((b) => (
                      <tr
                        key={b.id}
                        className={b.status === "read" ? "read" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            checked={b.status === "read"}
                            disabled
                            className={
                              b.status === "read" ? "chk-checked" : "chk"
                            }
                          />
                        </td>
                        <td>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.year}</td>
                        <td>{b.pages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="chart card">
              <h4>
                КІЛЬКІСТЬ СТОРІНОК / ДЕНЬ{" "}
                <strong>{Math.ceil(totalPages / Math.max(1, numDays))}</strong>
              </h4>
              <Chart planArr={plan} factArr={fact} />
            </div>
          </section>

          <aside className="td-bottomRight">
            <div className="card results">
              <h4>РЕЗУЛЬТАТИ</h4>
              <form onSubmit={addResult} className="result-form">
                <label>
                  Дата
                  <input name="date" type="date" />
                </label>
                <label>
                  Кількість сторінок
                  <input name="pages" type="number" min={1} />
                </label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}>
                  <button className="btn-save" type="submit">
                    Додати результат
                  </button>
                </div>
              </form>

              <h5 style={{ marginTop: 12 }}>СТАТИСТИКА</h5>
              <div className="log">
                {entries.length === 0 ? (
                  <div className="empty-log">Немає записів</div>
                ) : (
                  <ul>
                    {entries.map((en) => (
                      <li key={en.id}>
                        {new Date(en.dateISO).toLocaleString()} — {en.pages}{" "}
                        стор.
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

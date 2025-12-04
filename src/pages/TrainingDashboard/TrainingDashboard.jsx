import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBook } from "../../store/features/books/booksSlice";

import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import "./trainingDashboard.css";
import Header from "../../components/Header/Header";
import { db } from "../../firebase/firebase";

export default function TrainingDashboard({ userId }) {
  const dispatch = useDispatch();
  const books = useSelector((s) => s.books.list || []);

  const [trainingPlan, setTrainingPlan] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const loadTraining = async () => {
      const trainingRef = doc(db, "trainings", userId);
      const snap = await getDoc(trainingRef);
      if (snap.exists()) {
        const data = snap.data();
        setTrainingPlan(data);
        setEntries(data.entries || []);
      }
    };
    loadTraining();
  }, [userId]);

  const trainingBooks = useMemo(() => {
    if (!trainingPlan) return [];
    return trainingPlan.selectedBooks.map(
      (sb) => books.find((b) => String(b.id) === String(sb.id)) || sb
    );
  }, [books, trainingPlan]);

  const allFinished =
    trainingBooks.length > 0 && trainingBooks.every((b) => b.status === "read");

  const addResult = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const date = form.get("date");
    const pages = Number(form.get("pages")) || 0;
    if (!date || pages <= 0) return;

    const nextEntries = [...entries, { id: Date.now(), dateISO: date, pages }];
    setEntries(nextEntries);

    let running = 0;
    const totalReadPages = nextEntries.reduce((s, x) => s + x.pages, 0);

    const updatedBooks = trainingPlan.selectedBooks.map((b) => {
      const bookPages = Number(b.pages) || 0;
      running += bookPages;
      if (totalReadPages >= running && b.status !== "read") {
        dispatch(updateBook({ id: b.id, status: "read" }));
        updateDoc(doc(db, "books", b.id), { status: "read" });
        return { ...b, status: "read" };
      }
      return b;
    });

    const newTrainingPlan = {
      ...trainingPlan,
      selectedBooks: updatedBooks,
      entries: nextEntries,
    };
    setTrainingPlan(newTrainingPlan);

    await setDoc(doc(db, "trainings", userId), newTrainingPlan);

    e.target.reset();
  };

  useEffect(() => {
    if (allFinished && trainingPlan) {
      const timer = setTimeout(async () => {
        setTrainingPlan(null);
        setEntries([]);
        await setDoc(doc(db, "trainings", userId), {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allFinished, trainingPlan, userId]);

  return (
    <div className="td-page">
      <Header />
      <main className="td-main">
        <form onSubmit={addResult}>
          <input type="date" name="date" />
          <input type="number" name="pages" min={1} />
          <button type="submit" disabled={allFinished}>
            Додати результат
          </button>
        </form>
      </main>
    </div>
  );
}

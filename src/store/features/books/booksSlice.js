import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";

// Початковий стан
const initialState = {
  list: [],
  loading: false,
  filters: {
    title: "",
    author: "",
    year: "",
    pages: "",
  },
};

// ──────────────── ADD BOOK ────────────────
export const addBook = createAsyncThunk("books/addBook", async (bookData) => {
  if (!auth.currentUser) throw new Error("User not logged in");

  const payload = {
    ...bookData,
    userId: auth.currentUser.uid,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "books"), payload);
  return { id: docRef.id, ...payload };
});

// ──────────────── UPDATE BOOK ────────────────
export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, ...changes }) => {
    const ref = doc(db, "books", id);
    await updateDoc(ref, changes);
    return { id, changes };
  }
);

// ──────────────── LOAD BOOKS FOR USER ────────────────
export const loadBooks = createAsyncThunk("books/loadBooks", async () => {
  if (!auth.currentUser) throw new Error("User not logged in");

  const q = query(
    collection(db, "books"),
    where("userId", "==", auth.currentUser.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
});

// ──────────────── SLICE ────────────────
const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Додаємо редьюсер для onSnapshot
    setBooksFromFirebase: (state, action) => {
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBook.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            ...action.payload.changes,
          };
        }
      })
      .addCase(loadBooks.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  },
});

export const { updateFilters, setBooksFromFirebase } = booksSlice.actions;
export default booksSlice.reducer;

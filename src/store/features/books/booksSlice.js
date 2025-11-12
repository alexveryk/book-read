import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  filters: {
    title: "",
    author: "",
    year: "",
    pages: "",
  },
};

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    addBook: (state, action) => {
      state.list.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    updateBook: (state, action) => {
      const { id, ...changes } = action.payload;
      const idx = state.list.findIndex((b) => b.id === id);
      if (idx !== -1) {
        state.list[idx] = { ...state.list[idx], ...changes };
      }
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { addBook, updateBook, updateFilters } = booksSlice.actions;
export default booksSlice.reducer;

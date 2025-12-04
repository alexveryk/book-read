import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./index";

export const saveBookToFirestore = async (book) => {
  try {
    const docRef = doc(collection(db, "books"));
    await setDoc(docRef, book);
    return { id: docRef.id, ...book };
  } catch (error) {
    console.error("Error saving book:", error);
  }
};

export const fetchBooksFromFirestore = async () => {
  try {
    const snapshot = await getDocs(collection(db, "books"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

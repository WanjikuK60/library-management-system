import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'readingList';
const ReadingListContext = createContext(null);

function readStoredBooks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const books = JSON.parse(stored);
    return Array.isArray(books) ? books.filter((book) => book && typeof book.id === 'string') : [];
  } catch (error) {
    console.error('Could not restore the reading list from local storage.', error);
    return [];
  }
}

export function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      if (!action.book?.id || state.some((book) => book.id === action.book.id)) return state;
      return [...state, action.book];
    case 'REMOVE_BOOK':
      return state.filter((book) => book.id !== action.bookId);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

export function ReadingListProvider({ children }) {
  const [books, dispatch] = useReducer(readingListReducer, undefined, readStoredBooks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Could not save the reading list to local storage.', error);
    }
  }, [books]);

  const value = useMemo(() => ({
    books,
    addBook: (book) => dispatch({ type: 'ADD_BOOK', book }),
    removeBook: (bookId) => dispatch({ type: 'REMOVE_BOOK', bookId }),
    clearList: () => dispatch({ type: 'CLEAR_LIST' }),
  }), [books]);

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) {
    throw new Error('useReadingList must be used within a ReadingListProvider.');
  }
  return context;
}

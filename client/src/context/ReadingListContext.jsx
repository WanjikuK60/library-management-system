import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { apiUrl } from '../api.js';

const STORAGE_KEY = 'readingList';
const ACTIVE_USER_KEY = 'readingListUserId';
const ReadingListContext = createContext(null);

function getToken() {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Could not read the authentication token.', error);
    return null;
  }
}

function getActiveStorageKey() {
  try {
    const userId = getToken()
      ? localStorage.getItem(ACTIVE_USER_KEY)
      : null;
    return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
  } catch (error) {
    console.error('Could not determine the reading list storage key.', error);
    return STORAGE_KEY;
  }
}

function readStoredBooks(storageKey = getActiveStorageKey()) {
  try {
    const stored = localStorage.getItem(storageKey);
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
    case 'SET_BOOKS':
      return action.books;
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
  const [accountReady, setAccountReady] = useState(() => !getToken());
  const booksRef = useRef(books);
  const saveQueue = useRef(Promise.resolve());
  const token = getToken();
  booksRef.current = books;

  useEffect(() => {
    if (!token) {
      setAccountReady(true);
      return undefined;
    }

    let active = true;
    setAccountReady(false);

    async function loadAccountList() {
      try {
        const response = await fetch(apiUrl('/reading-list'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accountBooks = await readBookListResponse(response, 'Could not load your reading list');
        if (active) {
          dispatch({ type: 'SET_BOOKS', books: accountBooks });
          setAccountReady(true);
        }
      } catch (error) {
        if (active) {
          console.error('Could not load the reading list from your account.', error);
        }
      }
    }

    loadAccountList();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    try {
      localStorage.setItem(getActiveStorageKey(), JSON.stringify(books));
    } catch (error) {
      console.error('Could not save the reading list to local storage.', error);
    }
    if (!token || !accountReady) return;

    const bookIds = books.map((book) => book.id);
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(async () => {
        const response = await fetch(apiUrl('/reading-list'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookIds }),
        });
        await readBookListResponse(response, 'Could not save your reading list');
      })
      .catch((error) => {
        console.error('Could not sync the reading list with your account.', error);
      });
  }, [books, token, accountReady]);

  async function mergeGuestList(userId, accessToken) {
    const response = await fetch(apiUrl('/reading-list'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accountBooks = await readBookListResponse(response, 'Could not load your account reading list');
    const guestBooks = readStoredBooks(STORAGE_KEY);
    const mergedBooks = [...accountBooks];
    for (const book of [...booksRef.current, ...guestBooks]) {
      if (!mergedBooks.some((savedBook) => savedBook.id === book.id)) {
        mergedBooks.push(book);
      }
    }

    const saveResponse = await fetch(apiUrl('/reading-list'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ bookIds: mergedBooks.map((book) => book.id) }),
    });
    const savedBooks = await readBookListResponse(saveResponse, 'Could not merge your guest reading list');

    try {
      localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(savedBooks));
      localStorage.setItem(ACTIVE_USER_KEY, userId);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Could not cache the account reading list locally.', error);
    }

    localStorage.setItem('token', accessToken);
    dispatch({ type: 'SET_BOOKS', books: savedBooks });
    setAccountReady(true);
  }

  const value = useMemo(() => ({
    books,
    addBook: (book) => dispatch({ type: 'ADD_BOOK', book }),
    removeBook: (bookId) => dispatch({ type: 'REMOVE_BOOK', bookId }),
    clearList: () => dispatch({ type: 'CLEAR_LIST' }),
    mergeGuestList,
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

async function readBookListResponse(response, fallbackMessage) {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`${fallbackMessage}: the server returned an invalid response.`, { cause: error });
  }
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(' ') : data.message;
    throw new Error(message || `${fallbackMessage} (${response.status}).`);
  }
  if (!Array.isArray(data)) {
    throw new Error(`${fallbackMessage}: the server returned an invalid reading list.`);
  }
  return data.filter((book) => book && typeof book.id === 'string');
}

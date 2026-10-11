const TOKEN_KEY = 'ojterm_token';

// "Remember this session" keeps the token in localStorage so it survives a
// restart; otherwise it lives in sessionStorage for the current tab only.
export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const storeToken = (token, remember = true) => {
  clearStoredToken();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

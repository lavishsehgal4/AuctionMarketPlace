// User-related data functions (get current user, fake login lookup).
// Currently reads from: src/data/fakeUsers.json
// When backend is ready: replace the imports below with real fetch() / axios calls.
// Used by: src/pages/LoginPage.jsx

import fakeUsers from '../data/fakeUsers.json';

export function getFakeUsers() {
  return Promise.resolve(fakeUsers);
}

export function findUserByCredentials(email, password) {
  const user = fakeUsers.find(
    (u) => u.email === email && u.password === password
  ) || null;
  return Promise.resolve(user);
}

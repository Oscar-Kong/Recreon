export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  username: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },

  required: (value) => {
    return value && value.trim().length > 0;
  }
};
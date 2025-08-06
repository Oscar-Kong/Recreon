import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import gamesReducer from './slices/gamesSlice';
import messagesReducer from './slices/messagesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    games: gamesReducer,
    messages: messagesReducer,
    events: eventsReducer,
  },
});
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import gamesReducer from './slices/gamesSlice';
import messagesReducer from './slices/messagesSlice';
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    games: gamesReducer,
    messages: messagesReducer,
    events: eventsReducer,
  },
});
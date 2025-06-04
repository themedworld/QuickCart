import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    return {
      isAuthenticated: !!token,
      user: user ? JSON.parse(user) : null,
      token: token || null,
      loading: false,
      error: null,
      initialized: false // Ajout de ce champ
    };
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    initialized: false // Ajout de ce champ
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      state.initialized = true;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      }
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.initialized = true;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initialized = true;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    },
    loadUser(state, action) {
      state.user = action.payload;
      state.initialized = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(action.payload));
      }
    },
    setInitialized(state) {
      state.initialized = true;
    }
  }
});

export const initializeAuthState = () => (dispatch) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');
    
    if (token) {
      dispatch(loginSuccess({
        token,
        user: userData ? JSON.parse(userData) : null
      }));
    } else {
      // Si aucun token n'est trouvé, marquer quand même comme initialisé
      dispatch(setInitialized());
    }
  } else {
    // Pour le rendu côté serveur, marquer comme initialisé
    dispatch(setInitialized());
  }
};

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  loadUser,
  setInitialized 
} = authSlice.actions;

export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // Actualiza el estado del usuario
      state.error = null; // Limpia los errores
    },
    logout: (state) => {
      state.user = null; // Limpia el estado al cerrar sesión
    },
    setError: (state, action) => {
      state.error = action.payload; // Establece el error
    },
    clearError: (state) => {
      state.error = null; // Limpia el error
    },
  },
});

// Exporta las acciones
export const { login, logout, setError, clearError } = authSlice.actions;

// Exporta el reducer
export default authSlice.reducer;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const auth = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (auth.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={auth.isAuthenticated ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={auth.isAuthenticated ? <Navigate to="/" /> : <Register />} 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import Books from './pages/Books';
import BookEdit from './pages/BookEdit';
import Categories from './pages/Categories';
import Devices from './pages/Devices';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookEdit />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/devices" element={<Devices />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

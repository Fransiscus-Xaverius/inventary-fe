import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import { AuthContext } from '../App';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <AnimatedLogo />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <AnimatedLogo />
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {userData?.username}!</h1>
          <p className="mt-2 text-gray-600">You're successfully logged in.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Your Information</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Username:</span> {userData?.username}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {userData?.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Role:</span> {userData?.role}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> {userData?.id}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;
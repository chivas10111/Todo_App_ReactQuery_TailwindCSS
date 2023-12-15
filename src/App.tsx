import { Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './pages/MainPage';
import UpdatePage from './pages/UpdatePage';

const App = () => {
  const routes = [
    {
      path: '/',
      element: <MainPage />,
    },
    {
      path: '/update/:taskId',
      element: <UpdatePage />,
    },
  ];

  return (
    <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
    </Routes>
  );
};

export default App;
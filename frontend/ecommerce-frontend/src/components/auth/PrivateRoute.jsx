import { Navigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useShop();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;

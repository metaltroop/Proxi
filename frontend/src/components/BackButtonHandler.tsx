import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

const BackButtonHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = useRef(location.pathname);

    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        // List of root paths where pressing back should exit the app instead of navigating back
        const rootPaths = ['/', '/login', '/dashboard'];

        const handleBackButton = () => {
            if (rootPaths.includes(locationRef.current)) {
                App.exitApp();
            } else {
                navigate(-1);
            }
        };

        const listener = App.addListener('backButton', handleBackButton);

        return () => {
            // In capacitor 3+, addListener returns a Promise
            listener.then((l) => l.remove()).catch(console.error);
        };
    }, [navigate]);

    return null;
};

export default BackButtonHandler;

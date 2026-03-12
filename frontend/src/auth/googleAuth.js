// Google Authentication Logic
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

/**
 * Sign in with Google using popup
 * @returns {Promise<Object>} User data object with name, email, photo, and Firebase user
 */
export const signInWithGoogle = async () => {
    try {
        // Sign in with popup
        const result = await signInWithPopup(auth, googleProvider);

        // Get user information
        const user = result.user;

        // Extract user data
        const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            emailVerified: user.emailVerified,
            firebaseUser: user
        };

        console.log('Google Sign-In Successful:', userData);
        return { success: true, user: userData };

    } catch (error) {
        console.error('Google Sign-In Error:', error);

        // Handle specific error codes
        let errorMessage = 'Failed to sign in with Google';

        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in popup was closed. Please try again.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Sign-in was cancelled. Please try again.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection and try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            default:
                errorMessage = error.message || 'An error occurred during sign-in';
        }

        return { success: false, error: errorMessage };
    }
};

/**
 * Sign in with Google using redirect (alternative for mobile)
 * Call this function to initiate redirect
 */
export const signInWithGoogleRedirect = async () => {
    try {
        await signInWithRedirect(auth, googleProvider);
    } catch (error) {
        console.error('Google Redirect Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get redirect result after user is redirected back
 * Call this on component mount to check for redirect result
 */
export const getGoogleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);

        if (result) {
            const user = result.user;
            const userData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                emailVerified: user.emailVerified,
                firebaseUser: user
            };

            return { success: true, user: userData };
        }

        return { success: false, error: 'No redirect result' };

    } catch (error) {
        console.error('Redirect Result Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Sign Out Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

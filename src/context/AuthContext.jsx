import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            const fallbackProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Trader',
              role: user.email === 'mahaboobbasha140724@gmail.com' ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            };
            // Try to set it in Firestore as a fallback
            try {
              await setDoc(docRef, fallbackProfile);
            } catch (err) {
              console.error("Error setting fallback profile:", err);
            }
            setUserProfile(fallbackProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Set basic local profile if Firestore fails
          setUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Trader',
            role: user.email === 'mahaboobbasha140724@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUp(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const role = email === 'mahaboobbasha140724@gmail.com' ? 'admin' : 'user';
    const profileData = {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    setUserProfile(profileData);
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  const value = {
    currentUser,
    userProfile,
    isAdmin: userProfile?.role === 'admin' || currentUser?.email === 'mahaboobbasha140724@gmail.com',
    loading,
    signUp,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

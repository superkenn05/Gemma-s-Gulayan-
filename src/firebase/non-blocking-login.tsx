'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate GitHub sign-in (non-blocking). */
export function initiateGitHubSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GithubAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/** Initiate Facebook sign-in (non-blocking). */
export function initiateFacebookSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/** Initiate TikTok sign-in (non-blocking). */
export function initiateTikTokSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new OAuthProvider('tiktok.com');
  return signInWithPopup(authInstance, provider);
}

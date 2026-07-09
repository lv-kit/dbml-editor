import { browser } from '$app/environment';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	OAuthProvider,
	sendSignInLinkToEmail,
	isSignInWithEmailLink,
	signInWithEmailLink,
	signInWithPopup,
	type Auth
} from 'firebase/auth';

export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	appId: string;
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function initFirebase(config: FirebaseConfig) {
	if (!browser) return;
	if (getApps().length === 0) {
		app = initializeApp(config);
	} else {
		app = getApps()[0];
	}
	auth = getAuth(app);
}

export function getFirebaseAuth(): Auth {
	if (!auth) throw new Error('Firebase not initialized');
	return auth;
}

export async function signInWithGoogle(): Promise<string> {
	const provider = new GoogleAuthProvider();
	const result = await signInWithPopup(getFirebaseAuth(), provider);
	return result.user.getIdToken();
}

export async function signInWithMicrosoft(): Promise<string> {
	const provider = new OAuthProvider('microsoft.com');
	const result = await signInWithPopup(getFirebaseAuth(), provider);
	return result.user.getIdToken();
}

export async function sendEmailSignInLink(email: string): Promise<void> {
	const actionCodeSettings = {
		url: `${window.location.origin}/login/email-callback`,
		handleCodeInApp: true
	};
	await sendSignInLinkToEmail(getFirebaseAuth(), email, actionCodeSettings);
	window.localStorage.setItem('emailForSignIn', email);
}

export async function completeEmailSignIn(url: string): Promise<string | null> {
	if (!isSignInWithEmailLink(getFirebaseAuth(), url)) {
		return null;
	}
	const email = window.localStorage.getItem('emailForSignIn');
	if (!email) {
		// Email not found in localStorage (e.g., different device/browser)
		// The caller should handle this case by prompting the user
		return null;
	}
	const result = await signInWithEmailLink(getFirebaseAuth(), email, url);
	window.localStorage.removeItem('emailForSignIn');
	return result.user.getIdToken();
}

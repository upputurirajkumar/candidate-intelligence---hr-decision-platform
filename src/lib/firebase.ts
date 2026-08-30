import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  query,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Candidate, JobProfile, InterviewRecord } from '../types';

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    return true;
  } catch (err: any) {
    // Check if offline or permissions
    if (err?.message?.includes('the client is offline')) {
      console.warn('Firestore client is in offline mode or network unreachable.');
    }
    return false;
  }
}

// Convert Firebase User to TalentIntel User Profile
export async function syncUserProfile(fbUser: FirebaseUser, fallbackRole: string = 'Recruiter'): Promise<User> {
  const userRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore, using auth fallback:', err);
  }

  // Create initial profile in Firestore
  const newProfile: User = {
    id: fbUser.uid,
    email: fbUser.email || 'recruiter@talentintel.ai',
    name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'HR Professional'),
    role: (fallbackRole as any) || 'Recruiter',
    orgId: 'org_enterprise_talentintel',
    avatarUrl: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face`,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, newProfile, { merge: true });
  } catch (err) {
    console.warn('Could not write profile to Firestore:', err);
  }

  return newProfile;
}

// Firebase Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(credential.user, 'HR');
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(credential.user);
}

export async function registerWithEmail(email: string, pass: string, name: string, role: string = 'Recruiter'): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const userRef = doc(db, 'users', credential.user.uid);
  const newProfile: User = {
    id: credential.user.uid,
    email: email,
    name: name || email.split('@')[0],
    role: role as any,
    orgId: 'org_enterprise_talentintel',
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face`,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(userRef, newProfile);
  } catch (err) {
    console.warn('Could not save new user profile:', err);
  }
  return newProfile;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Firestore Entity Persistence Helpers
export async function saveCandidateToFirestore(orgId: string, candidate: Candidate): Promise<void> {
  if (!orgId || !candidate.id) return;
  try {
    const candidateRef = doc(db, 'organizations', orgId, 'candidates', candidate.id);
    await setDoc(candidateRef, {
      ...candidate,
      orgId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore candidate save error (continuing with local state):', err);
  }
}

export async function saveJobToFirestore(orgId: string, job: JobProfile): Promise<void> {
  if (!orgId || !job.id) return;
  try {
    const jobRef = doc(db, 'organizations', orgId, 'jobs', job.id);
    await setDoc(jobRef, {
      ...job,
      orgId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore job save error:', err);
  }
}

export async function saveInterviewToFirestore(orgId: string, interview: InterviewRecord): Promise<void> {
  if (!orgId || !interview.id) return;
  try {
    const interviewRef = doc(db, 'organizations', orgId, 'interviews', interview.id);
    await setDoc(interviewRef, {
      ...interview,
      orgId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore interview save error:', err);
  }
}

export async function saveCopilotSessionToFirestore(
  orgId: string, 
  userId: string, 
  candidateId?: string, 
  roleId?: string, 
  mode: 'text' | 'voice' = 'text',
  summary?: string
): Promise<void> {
  if (!orgId || !userId) return;
  try {
    const sessionId = `copilot_${Date.now()}`;
    const sessionRef = doc(db, 'organizations', orgId, 'copilot_sessions', sessionId);
    await setDoc(sessionRef, {
      id: sessionId,
      userId,
      candidateId: candidateId || null,
      roleId: roleId || null,
      mode,
      summary: summary || `HR Copilot ${mode} interaction`,
      createdAt: new Date().toISOString(),
      orgId
    });
  } catch (err) {
    console.warn('Firestore copilot session save error:', err);
  }
}

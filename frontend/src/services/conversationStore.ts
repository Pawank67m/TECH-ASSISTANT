import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore, collection, getDocs,
  orderBy, query, doc, setDoc,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from '../types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

function getDb() {
  if (!getApps().length) initializeApp(firebaseConfig)
  return getFirestore()
}

export function initSession(): string {
  const existing = localStorage.getItem('sessionId')
  if (existing) return existing
  const id = uuidv4()
  localStorage.setItem('sessionId', id)
  return id
}

export async function saveMessage(sessionId: string, msg: Message): Promise<void> {
  try {
    const db = getDb()
    const ref = doc(db, 'sessions', sessionId, 'messages', msg.id)
    await setDoc(ref, msg)
  } catch (err) {
    console.error('Firestore write failed:', err)
  }
}

export async function loadHistory(sessionId: string): Promise<Message[]> {
  try {
    const db = getDb()
    const q = query(
      collection(db, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data() as Message)
  } catch (err) {
    console.error('Firestore read failed:', err)
    return []
  }
}

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  // Replace these with your Firebase config values
  apiKey: "AIzaSyALvXidfuTFvFdqFAR6OOXiUx-Zw6VuiDY",
  authDomain: "cardpanel-e38a8.firebaseapp.com",
  projectId: "cardpanel-e38a8",
  storageBucket: "cardpanel-e38a8.appspot.com",
  messagingSenderId: "432322074291",
  appId: "1:432322074291:web:9be63fa79c66140c6c42c6",
  measurementId: "G-EFJRW5310E"
}

let db
let analytics = null

// Initialize Firebase
console.log('Starting Firebase initialization...')
try {
  const app = initializeApp(firebaseConfig)
  console.log('Firebase app initialized successfully')

  // Initialize Firestore
  console.log('Initializing Firestore...')
  db = getFirestore(app)
  console.log('Firestore initialized successfully')

  // Initialize Analytics only in browser environment
  if (process.client) {
    console.log('Checking Analytics support...')
    isSupported().then(yes => {
      if (yes) {
        analytics = getAnalytics(app)
        console.log('Analytics initialized successfully')
      } else {
        console.log('Analytics not supported in this environment')
      }
    }).catch(err => {
      console.error('Error checking Analytics support:', err)
    })
  }
} catch (error) {
  console.error('Error initializing Firebase:', error)
  throw error
}

export { db, analytics } 
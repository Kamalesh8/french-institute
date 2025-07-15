import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  // You can find this in your Firebase project settings
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleGuides = [
  {
    id: 'vowels',
    title: 'French Vowels',
    description: 'Master the unique vowel sounds in French',
    examples: [
      { text: 'é', phonetic: '/e/', example: 'café', translation: 'coffee' },
      { text: 'è', phonetic: '/ɛ/', example: 'père', translation: 'father' },
      { text: 'u', phonetic: '/y/', example: 'tu', translation: 'you' },
      { text: 'ou', phonetic: '/u/', example: 'vous', translation: 'you (formal/plural)' },
      { text: 'eu', phonetic: '/ø/', example: 'peu', translation: 'little/few' },
      { text: 'oi', phonetic: '/wa/', example: 'voir', translation: 'to see' },
    ]
  },
  {
    id: 'consonants',
    title: 'French Consonants',
    description: 'Learn the distinctive consonant sounds in French',
    examples: [
      { text: 'r', phonetic: '/ʁ/', example: 'rouge', translation: 'red' },
      { text: 'j', phonetic: '/ʒ/', example: 'je', translation: 'I' },
      { text: 'gn', phonetic: '/ɲ/', example: 'montagne', translation: 'mountain' },
      { text: 'ch', phonetic: '/ʃ/', example: 'chat', translation: 'cat' },
      { text: 'qu', phonetic: '/k/', example: 'qui', translation: 'who' },
      { text: 'll', phonetic: '/j/', example: 'fille', translation: 'girl' },
    ]
  },
  {
    id: 'nasals',
    title: 'Nasal Sounds',
    description: 'Perfect the challenging nasal sounds unique to French',
    examples: [
      { text: 'an/am', phonetic: '/ɑ̃/', example: 'dans', translation: 'in' },
      { text: 'en/em', phonetic: '/ɑ̃/', example: 'temps', translation: 'time' },
      { text: 'in/im', phonetic: '/ɛ̃/', example: 'vin', translation: 'wine' },
      { text: 'on/om', phonetic: '/ɔ̃/', example: 'bon', translation: 'good' },
      { text: 'un/um', phonetic: '/œ̃/', example: 'un', translation: 'one' },
    ]
  },
  {
    id: 'liaisons',
    title: 'Liaisons',
    description: 'Understand when and how to connect words in French',
    examples: [
      { text: 'les amis', phonetic: '/le.za.mi/', example: 'the friends', translation: 'the friends' },
      { text: 'nous avons', phonetic: '/nu.za.vɔ̃/', example: 'we have', translation: 'we have' },
      { text: 'petit ami', phonetic: '/pə.ti.ta.mi/', example: 'boyfriend', translation: 'boyfriend' },
      { text: 'sont allés', phonetic: '/sɔ̃.ta.le/', example: 'they went', translation: 'they went' },
    ]
  }
];

async function seedData() {
  try {
    const batch = [];
    
    for (const guide of sampleGuides) {
      const docRef = doc(db, 'pronunciation_guides', guide.id);
      await setDoc(docRef, {
        ...guide,
        updatedAt: serverTimestamp()
      });
      console.log(`Added guide: ${guide.title}`);
    }
    
    console.log('Successfully seeded pronunciation guides!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

const admin = require('firebase-admin');
require('dotenv').config();

// Check if we have the required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[`NEXT_PUBLIC_${varName}`]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please make sure your .env file contains all required Firebase configuration.');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('✅ Firebase Admin initialized successfully');

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
    console.log('Starting to seed pronunciation guides...');
    
    const batch = db.batch();
    const guidesRef = db.collection('pronunciation_guides');
  
    for (const guide of sampleGuides) {
      const docRef = guidesRef.doc(guide.id);
      batch.set(docRef, {
        ...guide,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`📝 Preparing to add guide: ${guide.title}`);
    }
  
    console.log('Committing batch write...');
    await batch.commit();
    console.log('✅ Successfully committed all writes');
    
    console.log('🎉 Successfully seeded all pronunciation guides!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

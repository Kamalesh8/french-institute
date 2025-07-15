'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Only import and render FirebaseTest on the client side
const FirebaseTestClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="p-4 text-sm text-gray-500">Loading Firebase test...</div>;
  }

  const FirebaseTest = dynamic(
    () => import('@/components/firebase/FirebaseTest'),
    { 
      ssr: false,
      loading: () => <div className="p-4 text-sm text-gray-500">Initializing Firebase...</div>
    }
  );

  return <FirebaseTest />;
};

export default FirebaseTestClient;


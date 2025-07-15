

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile');
  }, [router]);
  return null;
}





export default function DashboardProfilePage() {
  
  

  
  return null;
    // Redirect to the main profile page
    router.push("/profile");
  }, [router]);


    
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-3">
            <p>Redirecting to profile page...</p>
          
        </CardContent>
      </Card>
    
  );
}


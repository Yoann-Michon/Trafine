import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { navigate } from "wouter/use-browser-location";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <div className="w-full flex items-center justify-center flex-col">
                <p className="py-4 text-base text-gray-800">The content you’re looking for doesn’t exist. Either it was removed, or you mistyped the link.</p>
                <p className="py-2 text-base text-gray-800">Sorry about that! Please visit our hompage to get where you need to go.</p>
                <button className="w-full lg:w-auto my-4 border rounded-md px-1 sm:px-16 py-5 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50" onClick={()=>{navigate('/')}}>Go back to Home</button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

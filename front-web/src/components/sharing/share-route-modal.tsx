import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Facebook, Mail, Share2, MessageCircle } from "lucide-react";
import QRCode from "qrcode";
import { apiRequest } from "@/lib/queryClient";

interface ShareRouteModalProps {
  route: any;
  onClose: () => void;
}

export default function ShareRouteModal({ route, onClose }: ShareRouteModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function generateShareUrl() {
      try {
        setIsLoading(true);
        
        let sharedId;
        
        // If route has an ID, use it directly
        if (route?.id) {
          // Call the API to generate a shared ID
          const response = await apiRequest("POST", "/api/navigation/share", {
            navigationId: route.id
          });
          
          const data = await response.json();
          sharedId = data.sharedId || data.id || data;
        } else {
          // If no route ID, create a navigation entry with the expected routeData structure
          const routeData = {
            summary: {
              lengthInMeters: route.summary?.lengthInMeters,
              travelTimeInSeconds: route.summary?.travelTimeInSeconds,
              departureTime: route.summary?.departureTime || new Date().toISOString(),
              arrivalTime: route.summary?.arrivalTime || new Date(Date.now() + (route.summary?.travelTimeInSeconds || 0) * 1000).toISOString()
            },
            legs: [{
              points: route.legs?.[0]?.points || []
            }],
            guidance: route.guidance || null,
            origin: {
              lat: route.origin?.lat || route.startLat || route.startLocation?.lat,
              lng: route.origin?.lng || route.startLon || route.startLocation?.lon
            },
            destination: {
              lat: route.destination?.lat || route.endLat || route.endLocation?.lat,
              lng: route.destination?.lng || route.endLon || route.endLocation?.lon
            }
          };
          
          const navigationData = {
            userId: route.userId,
            startLat: routeData.origin.lat,
            startLon: routeData.origin.lng,
            endLat: routeData.destination.lat,
            endLon: routeData.destination.lng,
            avoidHighways: route.avoidHighways || false,
            avoidTolls: route.avoidTolls || false,
            routeData: routeData.guidance,
            distance: routeData.summary.lengthInMeters,
            duration: routeData.summary.travelTimeInSeconds,
          };
          
          // Create the navigation first
          const createResponse = await apiRequest("POST", "/api/navigation", navigationData);
          const createdNavigation = await createResponse.json();
          console.log("Created navigation:", createdNavigation);
          
          // Then share it
          const shareResponse = await apiRequest("POST", "/navigation/share", {
            navigationId: createdNavigation.id
          });
          console.log("Shared navigation:", shareResponse);
          const shareData = await shareResponse.json();
          sharedId = shareData.sharedId || shareData.id || shareData;
        }

        // Generate the full URL
        const url = `${window.location.origin}/navigation/shared/${sharedId}`;
        setShareUrl(url);
        
        // Generate QR code
        const qrContainer = document.getElementById('qr-code');
        if (qrContainer) {
          QRCode.toCanvas(qrContainer, url, {
            width: 200,
            margin: 1,
            color: {
              dark: "#3F51B5",
              light: "#FFFFFF"
            }
          }, (error) => {
            if (error) {
              console.error('Error generating QR code:', error);
              return;
            }
            setQrGenerated(true);
          });
        }
      } catch (err) {
        console.error("Error sharing route:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not generate share link";
        setError(errorMessage);
        toast({
          title: "Share Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    generateShareUrl();
  }, [route, toast]);

  // Helper function to format route data (removed as we're using the specific structure)

  const handleCopyRouteLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Share link has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy link to clipboard",
          variant: "destructive"
        });
      });
  };

  // Social sharing functions
  const handleShareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareViaTwitter = () => {
    const text = `Check out this route on SupMap!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareViaWhatsapp = () => {
    const text = `Check out this route on SupMap: ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareViaEmail = () => {
    const subject = 'Check out this route on SupMap';
    const body = `I've found a route you might be interested in:\n\n${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Route</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center mb-4">
          {/* QR Code */}
          <div className="w-52 h-52 bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-300">
            {isLoading || !qrGenerated ? (
              <div className="text-center">
                <span className="material-icons text-3xl text-neutral-400">qr_code_2</span>
                <p className="text-sm text-neutral-500 mt-2">Generating QR code...</p>
              </div>
            ) : (
              <canvas id="qr-code"></canvas>
            )}
          </div>
          
          <p className="text-sm text-neutral-600 text-center">
            Scan this QR code with your mobile device to open this route in the SupMap app
          </p>
          
        </div>
        
        <div className="mb-4">
          <label htmlFor="route-link" className="block text-sm font-medium text-neutral-700 mb-1">Share Link</label>
          <div className="flex">
            <Input
              id="route-link"
              value={isLoading ? "Generating share link..." : shareUrl}
              className="flex-grow rounded-r-none"
              readOnly
              disabled={isLoading}
            />
            <Button
              className="rounded-l-none"
              onClick={handleCopyRouteLink}
              disabled={isLoading}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-neutral-700">Share via</h4>
          <div className="flex gap-3">
            <button 
              className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={handleShareViaFacebook}
              title="Share on Facebook"
              disabled={isLoading}
            >
              <Facebook className="h-4 w-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={handleShareViaTwitter}
              title="Share on Twitter"
              disabled={isLoading}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={handleShareViaWhatsapp}
              title="Share via WhatsApp"
              disabled={isLoading}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={handleShareViaEmail}
              title="Share via Email"
              disabled={isLoading}
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
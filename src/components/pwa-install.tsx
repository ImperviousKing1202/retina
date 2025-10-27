/**
 * PWA Install Prompt Component for RETINA CNN System (SSR-safe)
 * Handles Progressive Web App installation prompts
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download, X, Smartphone,
  CheckCircle, Info
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false); // ensure client-only checks before rendering

  useEffect(() => {
    setMounted(true);

    // Helper to check standalone/install states (client-only)
    const checkInstalled = () => {
      try {
        const isStandaloneMode =
          (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
          (typeof navigator !== 'undefined' && (navigator as any).standalone) ||
          (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://'));

        setIsStandalone(!!isStandaloneMode);
        setIsInstalled(!!isStandaloneMode);
      } catch (err) {
        // if anything fails, keep defaults (false)
      }
    };

    const checkIOS = () => {
      try {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const platform = typeof navigator !== 'undefined' ? (navigator as any).platform : '';
        const maxTouchPoints = typeof navigator !== 'undefined' ? (navigator as any).maxTouchPoints || 0 : 0;

        const isIOSDevice = /iPad|iPhone|iPod/.test(ua) ||
          (platform === 'MacIntel' && maxTouchPoints > 1);

        setIsIOS(Boolean(isIOSDevice));
      } catch (err) {
        setIsIOS(false);
      }
    };

    // Read dismissal flag from sessionStorage (client-only)
    const readDismissed = () => {
      try {
        if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
          setDismissed(sessionStorage.getItem('pwa-install-dismissed') === 'true');
        }
      } catch (err) {
        // ignore
      }
    };

    // Event handlers
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch (err) {
        // Some polyfills may throw; ignore
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallCard(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallCard(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    checkIOS();
    readDismissed();

    // Add listeners (client-only guard)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    // cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallCard(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallCard(false);
    setDismissed(true);
    try {
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('pwa-install-dismissed', 'true');
      }
    } catch (err) {
      // ignore storage failures (e.g., private mode)
    }
  };

  // While not mounted on client, don't render anything (avoid SSR reading browser APIs)
  if (!mounted) return null;

  // Don't show if already installed, standalone mode, or dismissed
  if (isInstalled || isStandalone || dismissed) {
    return null;
  }

  // iOS install instructions
  if (isIOS) {
    return (
      <Alert className="m-4 bg-blue-50 border-blue-200">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium mb-2">Install RETINA on your iOS device</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Tap the Share button <span className="font-mono bg-gray-200 px-1 rounded">⎋</span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install RETINA</li>
              </ol>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Android/Desktop install prompt
  if (deferredPrompt && showInstallCard) {
    return (
      <Card className="m-4 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-green-800">
            <span className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install RETINA App
            </span>
            <Badge variant="secondary" className="bg-green-200 text-green-800">
              Available Offline
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-700">
            <p className="mb-2">
              Install RETINA on your device for:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Offline access to CNN models</li>
              <li>Faster loading and performance</li>
              <li>Native app experience</li>
              <li>Automatic data synchronization</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Maybe Later
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-green-600">
            <Info className="h-3 w-3" />
            <span>Free • No registration required • Works offline</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function PWAInstallButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch (_) {}
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const checkInstalled = () => {
      try {
        const isStandaloneMode =
          (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
          (typeof navigator !== 'undefined' && (navigator as any).standalone);

        setIsInstalled(Boolean(isStandaloneMode));
      } catch (err) {
        // ignore
      }
    };

    checkInstalled();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  // Don't render anything until mounted (avoids SSR issues)
  if (!mounted) return null;

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
}

export function PWAStatusIndicator() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkPWAStatus = () => {
      try {
        const isStandaloneMode =
          (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
          (typeof navigator !== 'undefined' && (navigator as any).standalone) ||
          (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://'));

        setIsStandalone(Boolean(isStandaloneMode));
        setIsInstalled(Boolean(isStandaloneMode));
      } catch (err) {
        // ignore
      }
    };

    checkPWAStatus();

    // Setup media query listener if available
    let mediaQuery: MediaQueryList | null = null;
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQuery = window.matchMedia('(display-mode: standalone)');
        const listener = () => checkPWAStatus();
        // prefer addEventListener if present
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', listener);
        } else if ((mediaQuery as any).addListener) {
          (mediaQuery as any).addListener(listener);
        }
      }
    } catch (err) {
      // ignore
    }

    return () => {
      try {
        if (mediaQuery) {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', checkPWAStatus);
          } else if ((mediaQuery as any).removeListener) {
            (mediaQuery as any).removeListener(checkPWAStatus);
          }
        }
      } catch (_) {
        // ignore
      }
    };
  }, []);

  if (!mounted) return null;

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CheckCircle className="h-3 w-3 text-green-600" />
      <span>App Installed</span>
    </div>
  );
}

export default PWAInstallPrompt;
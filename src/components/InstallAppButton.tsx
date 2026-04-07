import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const HIDDEN_ROUTES = new Set(['/login', '/admin']);

export default function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const updateInstalledState = () => {
      const isStandalone =
        mediaQuery.matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    updateInstalledState();
    mediaQuery.addEventListener('change', updateInstalledState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', updateInstalledState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    setIsInstalling(true);

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setInstallEvent(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled || !installEvent || HIDDEN_ROUTES.has(location.pathname)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => void handleInstall()}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-purple-500"
      aria-label="Instalar aplicativo"
    >
      <Download size={18} />
      {isInstalling ? 'Abrindo...' : 'Instalar app'}
    </button>
  );
}

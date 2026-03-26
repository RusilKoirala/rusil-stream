"use client";
import { useEffect, useState } from "react";

export default function PushNotifications() {
  const [permission, setPermission] = useState('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    setPermission(Notification.permission);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('push-prompt-dismissed');
    if (dismissed || Notification.permission !== 'default') {
      return;
    }

    // Show prompt after 30 seconds
    const timer = setTimeout(() => setShowPrompt(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Register for push notifications
        const registration = await navigator.serviceWorker.ready;
        
        // Send welcome notification
        registration.showNotification('Welcome to Rusil Stream! 🎬', {
          body: 'You\'ll now receive updates about new content and recommendations.',
          icon: '/logo/logo.png',
          badge: '/logo/logo.png',
          tag: 'welcome',
          requireInteraction: false
        });
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <div className="fixed top-20 right-4 max-w-sm z-50 animate-slide-down">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-5 border border-white/20 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-1">Stay Updated</h3>
            <p className="text-white/90 text-sm mb-4">
              Get notified about new movies, shows, and personalized recommendations.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={requestPermission}
                className="flex-1 bg-white text-purple-600 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-white font-semibold hover:bg-white/10 rounded-xl transition-all"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

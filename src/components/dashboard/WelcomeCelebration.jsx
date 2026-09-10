import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { celebrate } from 'celebrate-js';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, PartyPopper, Rocket } from 'lucide-react';

const WelcomeCelebration = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showWelcome, setShowWelcome] = useState(false);

  const triggerCelebration = useCallback(() => {
    // Balloons rising from the bottom
    celebrate.balloons({
      duration: 4000,
      particleCount: 25,
      colors: ['#C3110C', '#E6501B', '#740A03', '#280905', '#FFD700'],
    });

    // Add some confetti for extra celebration
    setTimeout(() => {
      celebrate.confetti({
        duration: 3000,
        particleCount: 100,
        colors: ['#C3110C', '#E6501B', '#FFD700'],
      });
    }, 500);
  }, []);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('onasis_welcome_seen');
    
    if (!hasSeenWelcome && user) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
        triggerCelebration();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, triggerCelebration]);

  const handleDismiss = () => {
    setShowWelcome(false);
    localStorage.setItem('onasis_welcome_seen', 'true');
  };

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      {showWelcome && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9998 bg-black/30 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Welcome Card - Slides up from bottom */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              delay: 0.2 
            }}
            className={`fixed bottom-0 left-0 right-0 z-9999 mx-auto max-w-lg ${
              isDark ? 'bg-[#1A1A1A]' : 'bg-white'
            } rounded-t-3xl shadow-2xl border-t ${
              isDark ? 'border-[#2A2A2A]' : 'border-gray-200'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isDark 
                  ? 'hover:bg-[#2A2A2A] text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label="Close welcome message"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8 pt-10 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                  isDark 
                    ? 'bg-gradient-to-br from-[#C3110C] to-[#E6501B]' 
                    : 'bg-gradient-to-br from-[#C3110C] to-[#E6501B]'
                }`}
              >
                <PartyPopper className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-3xl font-bold mb-3 ${
                  isDark ? 'text-white' : 'text-[#280905]'
                }`}
              >
                Welcome Onboard! 🎉
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-base mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Hey {user?.first_name || user?.name?.split(' ')[0] || 'there'}! 
                We're excited to have you here. Let's explore what Onasis Links has to offer.
              </motion.p>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3 mb-8"
              >
                {[
                  { icon: Sparkles, text: 'Browse our product catalog' },
                  { icon: Rocket, text: 'Request quotes instantly' },
                  { icon: PartyPopper, text: 'Track your orders easily' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      isDark ? 'text-[#E6501B]' : 'text-[#C3110C]'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                onClick={handleDismiss}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C3110C] to-[#E6501B] text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
              >
                Let's Get Started! 🚀
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`mt-4 text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                This message won't appear again
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeCelebration;
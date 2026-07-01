'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'pro' | 'premium') => void;
  currentBooks: number;
  maxBooks: number;
}

/**
 * ========================================
 * UPGRADE MODAL
 * ========================================
 * Modal que aparece cuando el usuario alcanza el límite de libros.
 * 
 * Features:
 * - Muestra límite actual
 * - 2 planes (Pro y Premium)
 * - Animaciones premium
 * - Call to action claro
 * 
 * @example
 * <UpgradeModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onUpgrade={handleUpgrade}
 *   currentBooks={5}
 *   maxBooks={5}
 * />
 */
export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentBooks,
  maxBooks,
}: UpgradeModalProps) {
  const plans = [
    {
      tier: 'pro' as const,
      name: 'Pro',
      price: 9.99,
      icon: <Sparkles className="w-5 h-5" />,
      features: [
        'Unlimited books in library',
        'AI-powered mood recommendations',
        'Cross-media suggestions (movies + music)',
        'Advanced reading analytics',
        'Translation features',
        'Cloud sync across devices',
      ],
      popular: true,
    },
    {
      tier: 'premium' as const,
      name: 'Premium',
      price: 19.99,
      icon: <Crown className="w-5 h-5" />,
      features: [
        'Everything in Pro',
        'Priority AI recommendations',
        'Exclusive premium themes',
        'Early access to new features',
        'Advanced reading stats',
        'Priority support',
        'Premium anime themes (Berserk, FMA)',
      ],
      popular: false,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ 
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] // Custom ease
              }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <GlassPanel variant="strong" className="relative">
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #8b5cf6 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>

                {/* Content */}
                <div className="relative p-8 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <Crown className="w-10 h-10 text-white" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl font-bold text-white mb-3"
                    >
                      You've Reached Your Limit
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/60 text-lg"
                    >
                      You have <span className="text-white font-semibold">{currentBooks}/{maxBooks} books</span> in your Starter plan.
                      <br />
                      Upgrade to add unlimited books and unlock premium features.
                    </motion.p>
                  </div>

                  {/* Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan, index) => (
                      <motion.div
                        key={plan.tier}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <GlassPanel
                          variant="default"
                          className="p-6 h-full relative"
                          isPremium={plan.tier === 'premium'}
                        >
                          {/* Popular badge */}
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                MOST POPULAR
                              </div>
                            </div>
                          )}

                          {/* Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${
                              plan.tier === 'pro' 
                                ? 'bg-blue-500/20' 
                                : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                            }`}>
                              {plan.icon}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {plan.name}
                              </h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">
                                  ${plan.price}
                                </span>
                                <span className="text-white/60 text-sm">
                                  /month
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 + idx * 0.05 }}
                                className="flex items-start gap-2 text-white/80"
                              >
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </motion.li>
                            ))}
                          </ul>

                          {/* CTA */}
                          <Button
                            variant={plan.tier === 'premium' ? 'primary' : 'outline'}
                            className="w-full"
                            onClick={() => onUpgrade(plan.tier)}
                          >
                            Upgrade to {plan.name}
                          </Button>
                        </GlassPanel>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-white/40 text-sm mt-6"
                  >
                    Cancel anytime. No long-term contracts.
                  </motion.p>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

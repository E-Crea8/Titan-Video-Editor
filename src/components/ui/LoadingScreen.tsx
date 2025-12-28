import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export default function LoadingScreen({ message = 'Loading...', progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-editor-bg flex items-center justify-center z-50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-titan-radial opacity-30" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo Animation */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <img src="/logo.png" alt="Titan Group Partners" className="h-24 w-auto" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-titan-steel/20 blur-xl -z-10" />
        </motion.div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          {progress !== undefined ? (
            // Progress bar
            <div className="w-48 h-1.5 bg-editor-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-titan-royal to-titan-steel"
              />
            </div>
          ) : (
            // Spinning loader
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-8 h-8 border-2 border-titan-steel/30 border-t-titan-steel rounded-full"
            />
          )}
          
          <p className="text-gray-400 text-sm">
            {message}
            {progress !== undefined && ` (${Math.round(progress)}%)`}
          </p>
        </div>
      </motion.div>
    </div>
  );
}


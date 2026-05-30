'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  locationName: string | null;
};

export default function LocationBadge({ locationName }: Props) {
  return (
    <AnimatePresence mode="wait">
      {locationName && (
        <motion.div
          key={locationName}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="px-3 pt-2"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-teal bg-teal-light border border-teal/20 rounded-stamp px-2.5 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
              <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.174 4.31l2.636 2.636a.75.75 0 1 1-1.06 1.06L11.114 11.37A6 6 0 0 1 2 6Zm6 1.75a.75.75 0 0 1-.75-.75V5.5a.75.75 0 0 1 1.5 0V7a.75.75 0 0 1-.75.75Z" clipRule="evenodd" />
            </svg>
            <span>{locationName}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

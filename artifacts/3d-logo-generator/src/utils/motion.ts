import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.33, 1, 0.68, 1] 
    } 
  }
};

export const fadeInUpSlight: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.33, 1, 0.68, 1] 
    } 
  }
};

export const stagger: Variants = {
  animate: { 
    transition: { 
      staggerChildren: 0.05 
    } 
  }
};

export const staggerSlow: Variants = {
  animate: { 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

export const LOTTIE_URL = 'https://lottie.host/1fb1bff1-58fd-456e-9df5-427c8a14bb31/WgqLI1vHje.lottie';

export const ACCEPTED_FORMATS = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg']
};

export const MAX_FILE_SIZE_MB = 20;

export const ANIMATION_NAMES: Record<string, string> = {
  none: 'None',
  rotateY: 'Rotate Y',
  bounce: 'Bounce',
  spinTilt: 'Spin + Tilt',
  pendulum: 'Pendulum',
  float: 'Float',
  pulse: 'Pulse',
  wobble: 'Wobble',
  orbit: 'Orbit',
  heartbeat: 'Heartbeat'
};

export const PRESET_MATERIALS = [
  { id: 'chrome', name: 'Forged Chrome', color: 'from-gray-200 to-gray-500' },
  { id: 'gold', name: 'Solar Gold', color: 'from-yellow-300 to-yellow-600' },
  { id: 'cosmic', name: 'Cosmic Gradient', color: 'from-purple-500 via-cyan-400 to-teal-300' },
  { id: 'galactic', name: 'Galactic Dust', color: 'from-gray-900 to-purple-900' }
] as const;

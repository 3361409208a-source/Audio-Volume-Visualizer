import { Theme } from '../types';

export const THEMES: Record<Theme, {
  primary: string;
  secondary: string;
  bgGlow1: string;
  bgGlow2: string;
  textGradient: string;
  hueBase: number;
  hueRange: number;
  name: string;
}> = {
  cyberpunk: {
    primary: '#ec4899',
    secondary: '#06b6d4',
    bgGlow1: 'bg-pink-500/10',
    bgGlow2: 'bg-cyan-500/10',
    textGradient: 'from-pink-400 via-purple-400 to-cyan-400',
    hueBase: 300,
    hueRange: 60,
    name: '赛博朋克'
  },
  ocean: {
    primary: '#3b82f6',
    secondary: '#14b8a6',
    bgGlow1: 'bg-blue-500/10',
    bgGlow2: 'bg-teal-500/10',
    textGradient: 'from-blue-400 via-sky-400 to-teal-400',
    hueBase: 200,
    hueRange: 40,
    name: '深邃海洋'
  },
  fire: {
    primary: '#ef4444',
    secondary: '#f97316',
    bgGlow1: 'bg-red-500/10',
    bgGlow2: 'bg-orange-500/10',
    textGradient: 'from-red-400 via-orange-400 to-yellow-400',
    hueBase: 15,
    hueRange: 40,
    name: '极乐烈焰'
  }
};

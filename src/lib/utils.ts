import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const flavorCategoryColors: Record<string, string> = {
  fruit: 'bg-red-100 text-red-800',
  spice: 'bg-orange-100 text-orange-800',
  sweet: 'bg-pink-100 text-pink-800',
  wood: 'bg-amber-100 text-amber-800',
  smoke: 'bg-gray-100 text-gray-800',
  floral: 'bg-purple-100 text-purple-800',
  cereal: 'bg-yellow-100 text-yellow-800',
  nut: 'bg-lime-100 text-lime-800',
  herbal: 'bg-green-100 text-green-800',
  other: 'bg-blue-100 text-blue-800',
};

export const flavorCategoryIcons: Record<string, string> = {
  fruit: '🍎',
  spice: '🌶️',
  sweet: '🍯',
  wood: '🪵',
  smoke: '🔥',
  floral: '🌸',
  cereal: '🌾',
  nut: '🥜',
  herbal: '🌿',
  other: '✨',
};

export function getRatingColor(rating: number) {
  if (rating >= 90) return 'text-emerald-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-lime-600';
  if (rating >= 60) return 'text-amber-600';
  if (rating >= 50) return 'text-orange-600';
  return 'text-red-600';
}

export function getRatingLabel(rating: number) {
  if (rating >= 90) return 'Olağanüstü';
  if (rating >= 80) return 'Mükemmel';
  if (rating >= 70) return 'Çok İyi';
  if (rating >= 60) return 'İyi';
  if (rating >= 50) return 'Ortalama';
  if (rating >= 40) return 'Vasat';
  return 'Zayıf';
}
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, Minus,
  Clock, Heart, Calendar, CalendarDays, ChefHat, User, Check, X, Flame, Star,
  Sparkles, Bookmark, Camera, Mail, Upload, Pencil, Trash2, Users,
  Gauge, Apple, Dot, Lock, Bell, Palette, Globe, LayoutGrid,
} from 'lucide-react'

const MAP = {
  search: Search,
  sliders: SlidersHorizontal,
  back: ChevronLeft,
  fwd: ChevronRight,
  plus: Plus,
  minus: Minus,
  clock: Clock,
  heart: Heart,
  cal: Calendar,
  caldays: CalendarDays,
  bowl: ChefHat,
  user: User,
  check: Check,
  x: X,
  flame: Flame,
  star: Star,
  spark: Sparkles,
  bookmark: Bookmark,
  camera: Camera,
  mail: Mail,
  share: Upload,
  edit: Pencil,
  trash: Trash2,
  users: Users,
  gauge: Gauge,
  apple: Apple,
  dot: Dot,
  lock: Lock,
  bell: Bell,
  palette: Palette,
  globe: Globe,
  grid: LayoutGrid,
}

export default function Icon({ name, size = 22, sw = 1.8, fill = false, style, className }) {
  const LucideIcon = MAP[name]
  if (!LucideIcon) return null
  return (
    <LucideIcon
      size={size}
      strokeWidth={fill ? 0 : sw}
      fill={fill ? 'currentColor' : 'none'}
      style={{ display: 'block', flexShrink: 0, ...style }}
      className={className}
    />
  )
}

export function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </svg>
  )
}

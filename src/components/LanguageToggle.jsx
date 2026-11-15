import { Languages } from 'lucide-react'
import { useI18n } from '../i18n'

export default function LanguageToggle() {
  const { t, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink hover:border-accent hover:text-accent"
    >
      <Languages className="h-4 w-4" /> {t.language}
    </button>
  )
}

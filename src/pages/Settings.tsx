/**
 * SettingsPage - страница настроек бренда: имя, логотип и градиент.
 * Сохраняет override в zustand и показывает превью.
 */
import React, { useMemo, useState } from 'react'
import SiteHeader from '../components/layout/SiteHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useUserPrefsStore } from '../store/userPrefs'
import { BRAND, getEffectiveBrand } from '../config/brand'

/** Локальное состояние формы */
interface BrandFormState {
  name: string
  logoUrl: string
  from: string
  to: string
}

/**
 * SettingsPage component - UI конфигуратор бренда.
 */
const SettingsPage: React.FC = () => {
  const brandOverride = useUserPrefsStore((s) => s.brandOverride)
  const setBrandOverride = useUserPrefsStore((s) => s.setBrandOverride)

  const effective = useMemo(() => {
    const eff = getEffectiveBrand()
    return {
      name: eff.name ?? BRAND.name,
      logoUrl: eff.logoUrl ?? (BRAND.logoUrl || ''),
      from: eff.gradient?.from ?? BRAND.gradient.from,
      to: eff.gradient?.to ?? BRAND.gradient.to,
    }
  }, [brandOverride])

  const [form, setForm] = useState<BrandFormState>({
    name: effective.name,
    logoUrl: effective.logoUrl,
    from: effective.from,
    to: effective.to,
  })

  /** Сохранить настройки в zustand */
  function save() {
    setBrandOverride({
      name: form.name || undefined,
      logoUrl: form.logoUrl || undefined,
      gradient: { from: form.from || BRAND.gradient.from, to: form.to || BRAND.gradient.to },
    })
  }

  /** Сбросить override */
  function reset() {
    setBrandOverride(undefined)
    setForm({
      name: BRAND.name,
      logoUrl: BRAND.logoUrl || '',
      from: BRAND.gradient.from,
      to: BRAND.gradient.to,
    })
  }

  /** Превью классы градиента */
  const previewGradient = `bg-gradient-to-br ${form.from || BRAND.gradient.from} ${form.to || BRAND.gradient.to}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Настройки бренда</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Превью */}
            <div className="overflow-hidden rounded-lg border">
              <div className={`flex items-center gap-3 px-5 py-6 text-white ${previewGradient}`}>
                <div className="h-10 w-10 overflow-hidden rounded-md bg-white/15">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo Preview" className="object-cover w-full h-full" />
                  ) : (
                    <img src="https://pub-cdn.sider.ai/u/U07GHKZAW71/web-coder/689a30f5a616cfbf06691f2b/resource/98a62764-cfc3-4aed-946a-19e3db3b7371.jpg" className="object-cover w-full h-full" alt="Placeholder" />
                  )}
                </div>
                <div>
                  <div className="text-sm opacity-90">Предпросмотр:</div>
                  <div className="text-lg font-semibold">{form.name || 'Corporate AI Assistant'}</div>
                </div>
              </div>
            </div>

            {/* Поля формы */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Имя бренда</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="logo">Логотип (URL)</Label>
                <Input id="logo" value={form.logoUrl} onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="from">Градиент from-*</Label>
                <Input id="from" value={form.from} onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))} placeholder="напр. from-emerald-600" />
              </div>
              <div>
                <Label htmlFor="to">Градиент to-*</Label>
                <Input id="to" value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} placeholder="напр. to-teal-600" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save}>Сохранить</Button>
              <Button variant="outline" className="bg-transparent" onClick={reset}>Сбросить по умолчанию</Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Подсказка: используйте Tailwind-классы вида from-... и to-... для управления градиентом.
            </div>
          </CardContent>
        </Card>
      </section>
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Corporate AI Assistant</div>
      </footer>
    </div>
  )
}

export default SettingsPage

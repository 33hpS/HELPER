/** 
 * CurrencyConverter - интерактивный калькулятор конвертации валют.
 * Использует приходящие курсы в рублях (₽) за 1 единицу валюты и позволяет переводить между любыми кодами.
 */
import React, { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ArrowLeftRight } from 'lucide-react'
import type { CurrencyRate } from '../../services/api'

/** 
 * CurrencyConverterProps - свойства калькулятора.
 */
export interface CurrencyConverterProps {
  /** Курсы валют (значение в ₽ за 1 единицу кода) */
  rates: CurrencyRate[]
  /** Список приоритетных кодов для порядка выбора */
  preferredOrder?: string[]
}

/**
 * buildRateMap - строит справочник курсов и гарантирует наличие RUB=1.
 */
function buildRateMap(rates: CurrencyRate[]): Record<string, CurrencyRate> {
  const map: Record<string, CurrencyRate> = {}
  for (const r of rates) map[r.code] = r
  if (!map.RUB) {
    map.RUB = { code: 'RUB', value: 1, delta: 0 }
  }
  return map
}

/**
 * formatNumber - форматирует число с максимальной точностью 4 знака.
 */
function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const fixed = n < 1 ? 4 : 2
  return n.toLocaleString('ru-RU', { maximumFractionDigits: fixed, minimumFractionDigits: 0 })
}

/**
 * CurrencyConverter - основной компонент конвертации.
 */
const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ rates, preferredOrder = ['RUB','KGS','USD','EUR','CNY','KZT'] }) => {
  const map = useMemo(() => buildRateMap(rates), [rates])
  const codes = useMemo(() => {
    const all = Object.keys(map)
    // Сортируем по приоритету preferredOrder, остальные — по алфавиту
    const priority = preferredOrder.filter(c => all.includes(c))
    const rest = all.filter(c => !priority.includes(c)).sort()
    return [...priority, ...rest]
  }, [map, preferredOrder])

  // Состояния ввода
  const [fromCode, setFromCode] = useState<string>(codes[0] || 'RUB')
  const [toCode, setToCode] = useState<string>(codes[1] || 'KGS')
  const [amount, setAmount] = useState<string>('100')

  // Расчет конверсии: из from в to через RUB (все курсы хранятся как ₽ за 1 ед.)
  const { result, rateInfo } = useMemo(() => {
    const from = map[fromCode]?.value ?? 1
    const to = map[toCode]?.value ?? 1
    const amt = Number(amount.replace(',', '.'))
    const rubValue = amt * from // сколько ₽ стоит amount fromCode
    const out = rubValue / to    // сколько единиц toCode можно купить на эти ₽
    // Текущий «прямой» курс 1 fromCode в toCode
    const direct = from / to
    return { result: out, rateInfo: direct }
  }, [map, fromCode, toCode, amount])

  /** swap - меняет местами валюты */
  function swap() {
    setFromCode(toCode)
    setToCode(fromCode)
  }

  return (
    <div className="space-y-3">
      {/* Поля ввода */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Сумма</div>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Из</div>
            <select
              className="w-full h-10 rounded-md border bg-transparent px-3"
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
            >
              {codes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="self-center">
            <Button variant="outline" className="bg-transparent" type="button" onClick={swap}>
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">В</div>
            <select
              className="w-full h-10 rounded-md border bg-transparent px-3"
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
            >
              {codes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Результат */}
      <div className="rounded-md border p-3">
        <div className="text-sm text-muted-foreground">Итого</div>
        <div className="mt-1 text-2xl font-semibold">
          {formatNumber(result)} {toCode}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Курс сейчас: 1 {fromCode} = {formatNumber(rateInfo)} {toCode}
        </div>
      </div>
    </div>
  )
}

export default CurrencyConverter

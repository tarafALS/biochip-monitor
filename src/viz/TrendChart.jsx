import { Area, AreaChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Live area chart; optional bands shade the risk zones behind the line
export default function TrendChart({ data, dataKey, color, domain, bands = [], lines = [], unit }) {
  const gradientId = `fill-${dataKey}`
  return (
    <div dir="ltr" className="h-44 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {bands.map((b) => (
            <ReferenceArea key={b.y1} y1={b.y1} y2={b.y2} fill={b.color} fillOpacity={0.07} stroke="none" />
          ))}
          {lines.map((l) => (
            <ReferenceLine key={l.y} y={l.y} stroke={l.color} strokeDasharray="4 4" strokeOpacity={0.7} />
          ))}
          <XAxis dataKey="time" hide />
          <YAxis domain={domain} tick={{ fill: '#8494b0', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0c1426', border: '1px solid rgba(94,234,212,.25)', borderRadius: 8 }}
            labelFormatter={(t) => new Date(t).toLocaleTimeString()}
            formatter={(v) => [`${v} ${unit}`]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

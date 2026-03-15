import { TrendingUp, Leaf, Heart, Activity } from 'lucide-react';

export function KPICards() {
  const kpis = [
    {
      label: 'Total Animales',
      value: '154',
      change: '+12 esta semana',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-700',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Vacas en Producción',
      value: '120',
      change: '+5 esta semana',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-700',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Próximos Partos',
      value: '12',
      change: 'en próximos 30 días',
      icon: Heart,
      color: 'bg-pink-50 text-pink-700',
      bgColor: 'bg-pink-100',
    },
    {
      label: 'Tratamientos Activos',
      value: '5',
      change: 'requieren seguimiento',
      icon: Activity,
      color: 'bg-orange-50 text-orange-700',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div className={`inline-block p-2 rounded-lg ${kpi.color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-2xl font-bold text-zinc-900 mb-2">{kpi.value}</p>
            <p className="text-xs text-zinc-500">{kpi.change}</p>
          </div>
        );
      })}
    </div>
  );
}

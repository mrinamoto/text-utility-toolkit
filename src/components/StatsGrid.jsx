import { BookOpenText, Clock3, Hash, Pilcrow, Rows3, Type } from 'lucide-react';

const Stat = ({ icon: Icon, label, value, hint }) => (
  <article className="stat-card">
    <div className="stat-icon"><Icon size={17} aria-hidden="true" /></div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  </article>
);

export default function StatsGrid({ stats }) {
  const readingTime = stats.words === 0
    ? '0 min'
    : stats.readingTimeMinutes < 1
      ? '< 1 min'
      : `${Math.ceil(stats.readingTimeMinutes)} min`;

  return (
    <section className="stats-grid" aria-label="Live text statistics">
      <Stat icon={BookOpenText} label="Words" value={stats.words.toLocaleString()} />
      <Stat icon={Type} label="Characters" value={stats.characters.toLocaleString()} />
      <Stat icon={Hash} label="Without spaces" value={stats.charactersWithoutSpaces.toLocaleString()} hint="tabs/newlines kept" />
      <Stat icon={Rows3} label="Lines" value={stats.lines.toLocaleString()} />
      <Stat icon={Pilcrow} label="Estimated sentences" value={stats.sentences.toLocaleString()} />
      <Stat icon={Clock3} label="Reading time" value={readingTime} hint="at 200 wpm" />
    </section>
  );
}

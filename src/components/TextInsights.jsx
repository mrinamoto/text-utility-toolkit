export default function TextInsights({ stats, frequency, ignoreCommonWords, setIgnoreCommonWords }) {
  return (
    <section className="card insights-card" aria-labelledby="insights-title">
      <div className="section-heading compact">
        <div><p className="eyebrow">Analysis</p><h2 id="insights-title">Text insights</h2></div>
        <label className="switch-label"><input type="checkbox" checked={ignoreCommonWords} onChange={(event) => setIgnoreCommonWords(event.target.checked)} /> Ignore common words</label>
      </div>
      <div className="insight-metrics">
        <div><span>Unique words</span><strong>{stats.uniqueWords}</strong></div>
        <div><span>Without whitespace</span><strong title="Excludes spaces, tabs and line breaks">{stats.charactersWithoutWhitespace}</strong></div>
        <div><span>Average word length</span><strong>{stats.avgWordLength ? `${stats.avgWordLength.toFixed(1)} chars` : '—'}</strong></div>
        <div><span>Longest word</span><strong title={stats.longestWord}>{stats.longestWord || '—'}</strong></div>
        <div><span>Paragraphs</span><strong>{stats.paragraphs}</strong></div>
      </div>
      <div className="frequency-list" aria-label="Top word frequency">
        <div className="frequency-title"><h3>Top words</h3><span>{ignoreCommonWords ? 'Common words filtered' : 'All words'}</span></div>
        {frequency.length ? frequency.map((item) => (
          <div className="frequency-row" key={item.word}>
            <span>{item.word}</span>
            <div className="frequency-track" aria-hidden="true"><i style={{ width: `${Math.max(8, (item.count / frequency[0].count) * 100)}%` }} /></div>
            <strong>{item.count}</strong>
          </div>
        )) : <p className="muted">Add text to see word frequency.</p>}
      </div>
    </section>
  );
}

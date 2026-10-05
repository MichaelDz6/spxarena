from pathlib import Path
import re

folder=Path(__file__).parent
target=folder/'spx-arena-five-directions.html'
backup=folder/'spx-arena-before-long-term.html'
if not backup.exists():
    backup.write_text(target.read_text())
text=backup.read_text()
text=text.replace('</style>',(folder/'long-term-rating.css').read_text()+'\n</style>',1)
text=re.sub(r'<script>.*?</script>',lambda _: '<script>\n'+(folder/'long-term-rating.js').read_text()+'\n</script>',text,flags=re.S)

# Preserve Night Session's layout and visual identity while changing its data.
text=text.replace('<span>2021—2025</span></div><div class="duel">','<span>10 YEARS · 2016–2025</span></div><div class="duel">',1)
text=text.replace('<strong>The S&amp;P<br>500</strong>','<strong>SPY<br>S&amp;P 500</strong>',1)
text=text.replace('<strong class="down">−9.0%</strong><span>ARKK · annualized NAV return</span>','<strong class="up">+15.0%</strong><span>ARKK · 10Y annualized NAV return</span>',1)
text=text.replace('<strong class="up">+14.4%</strong><span>S&amp;P 500 · annualized total return</span></div></div></div>','<strong class="up">+14.7%</strong><span>SPY · 10Y annualized total return</span></div></div><div class="night-periods" data-night-periods></div></div>',1)
text=text.replace('2025 · SELECTED FUNDS','10Y · THROUGH 2025',1)
text=text.replace('</main><div data-sources id="night-sources">','<details class="night-rating-rules"><summary>The rating standard · 10Y / 5Y / 1Y</summary><p>The main rank and rarity use 10-year annualized return minus SPY total return. Legendary ≥3 pp/year; Epic ≥1 and &lt;3; Rare ≥0 and &lt;1; Common &lt;0. The 5Y badge uses the same bands. The 1Y season badge uses ≥10, ≥4, ≥0 and &lt;0 percentage points. These are proposed performance tiers, not proof of skill.</p><p>All comparisons end December 31, 2025. A complete 10-year record is required for the main division; shorter eligible records enter a separate 5Y division. Missing data remains Unrated. Full-career results belong in Legacy with separately matched benchmark dates.</p></details></main><div data-sources id="night-sources">',1)
text=text.replace('Research snapshot · Index total returns · Rounded figures','Through Dec 2025 · SPY total returns · Rounded figures',1)

# Replace only product labels in the four card directions.
start=text.index(' <section data-variant="02')
end=text.index('<script type="application/json"',start)
panels=text[start:end]
replacements={
 '2025<br><b>SEASON</b>':'10Y<br><b>ARENA</b>',
 'THE SEASON’S CHOSEN':'THE DECADE’S CONTENDERS',
 '2025 · RANKED BY RETURN':'2016–2025 · RANKED BY ANNUALIZED RETURN',
 '<b>S&amp;P 500</b>':'<b>SPY · S&amp;P 500</b>',
 '+17.9%':'+14.7%',
 '2025 TOTAL RETURN':'10Y ANNUALIZED RETURN',
 '2025 season tiers':'10Y main rarity · 5Y form · 1Y season',
 'THE 2025 COLLECTION':'THE 10-YEAR COLLECTION',
 'SPX ARENA · SEASON 2025':'SPX ARENA · 2016–2025',
 '2025 RETURN':'10Y ANNUALIZED RETURN',
 'VS S&amp;P 500':'ANNUALIZED GAP VS SPY',
 'S&amp;P 500 · 2025 total return':'SPY · 10Y annualized total return',
 '2021–2025':'2016–2025',
 'SEASON <b>2025</b>':'10Y <b>ARENA</b>',
 '<small>2025</small>':'<small>10Y · 2016–2025</small>',
 'SEASON 2025 · FINAL':'10Y RATINGS · THROUGH DEC 2025',
 '2025 ADVANTAGE':'10Y ANNUALIZED GAP',
 '2021—2025':'2016—2025',
 '<span>S&amp;P 500</span>':'<span>SPY · S&amp;P 500</span>',
 'The S&amp;P 500 sets the score they have to beat.':'Ten years against SPY decide their place.',
 'Every investor faces the same benchmark.':'Ten years. One benchmark. The same dates.',
 'Rank earned through returns. Rarity decided by the benchmark.':'A decade earns the rank. Each season tells its own story.',
 'Choose an investor card. Challenge the S&amp;P 500.':'Choose an investor card. Challenge SPY over a decade.',
}
for old,new in replacements.items():panels=panels.replace(old,new)
text=text[:start]+panels+text[end:]
assert text.count('data-variant=')==5
assert len(text.encode())<1_000_000,len(text.encode())
assert 'data-night-periods' in text
target.write_text(text)
print({'bytes':len(text.encode()),'designs':5,'main_horizon':'2016–2025','benchmark':'SPY market-price total return'})

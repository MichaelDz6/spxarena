import credits from '../data/portrait-credits.json' with { type: 'json' };

export function portraitPresentation(person, name) {
  const credit = credits[person];
  const kind = credit.type;
  const label = kind === 'generated' ? 'AI illustration' : kind === 'enhanced' ? 'AI enhanced' : '';
  const description = kind === 'generated'
    ? 'AI-generated editorial illustration; interpretive likeness'
    : kind === 'enhanced'
      ? 'AI-enhanced adaptation of a licensed photograph'
      : 'Licensed historical photograph';
  return { kind, label, alt: `${name} — ${description}`, width: credit.width, height: credit.height };
}

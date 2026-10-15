import credits from '../data/portrait-credits.json' with { type: 'json' };

export function portraitPresentation(person, name) {
  const credit = credits[person];
  const kind = credit.type;
  const available = kind === 'photo' || kind === 'enhanced';
  const description = !available
    ? 'Photo unavailable; reuse permission has not been verified'
    : kind === 'enhanced'
      ? 'Licensed original color photograph, cropped and AI enhanced'
      : 'Licensed original color photograph';
  return { kind, available, alt: `${name} — ${description}`, width: credit.width, height: credit.height };
}

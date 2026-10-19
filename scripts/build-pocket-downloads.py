"""Build downloadable UTF-8 public-domain reading selections with attribution."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
output = root / 'dist/downloads'
output.mkdir(exist_ok=True)
for key in ['journey', 'kingdoms']:
    book = json.loads((root / f'dist/books/{key}.json').read_text())
    lines = [book['title'], book.get('author', ''), '公版经典 · 本站整理选段', '']
    for chapter in book['chapters']:
        lines.extend([chapter['title'], '', *chapter['paragraphs'], '', '来源：' + chapter['source'], ''])
    (output / f'{key}.txt').write_text('\n'.join(lines), encoding='utf-8')

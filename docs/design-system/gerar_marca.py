"""Vetoriza a reconstrução fiel da marca dos prints; não redesenha letras.

Uso: python gerar_marca.py /caminho/do/frontend
Dependência de edição: Pillow. Não é usada pelo app.
"""

from copy import deepcopy
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

from PIL import Image
from tracar_contornos import trace, bounds

BLUE = '#064EA0'
YELLOW = '#FFDF00'
NAVY = '#1B1B2B'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
frontend = Path(sys.argv[1]).resolve()
source = Path(__file__).parent / 'marca/sergio-camargo-reconstrucao.png'
image = Image.open(source).convert('RGBA')
width, height = image.size
pixels = []
yellow_points = []
visible_points = []
for index, (r, g, b, a) in enumerate(image.get_flattened_data()):
    x, y = index % width, index // width
    if a < 96:
        pixels.append((0, 0, 0, 0))
        continue
    visible_points.append((x, y))
    if r > 150 and g > 120 and b < r * 0.65:
        pixels.append((255, 223, 0, 255))
        yellow_points.append((x, y))
    elif min(r, g, b) > 170:
        pixels.append((255, 255, 255, 255))
    else:
        pixels.append((6, 78, 160, 255))

flag = (
    min(x for x, y in yellow_points), min(y for x, y in yellow_points),
    max(x for x, y in yellow_points) + 1, max(y for x, y in yellow_points) + 1,
)
paths = trace(pixels, (width, height), flag)
assert paths, 'A vetorização não produziu contornos.'


def part_of_flag(node):
    x1, y1, x2, y2 = bounds(node)
    return x1 >= flag[0] - 8 and y1 >= flag[1] - 8 and x2 <= flag[2] + 8 and y2 <= flag[3] + 8


visible = (min(x for x, y in visible_points), min(y for x, y in visible_points),
           max(x for x, y in visible_points) + 1, max(y for x, y in visible_points) + 1)
frame_width = visible[2] - visible[0] + 20
frame_height = frame_width * 64 / 312
frame = (visible[0] - 10, (visible[1] + visible[3] - frame_height) / 2,
         frame_width, frame_height)


def color(node):
    return node.attrib['fill'].upper()


def export(filename, nodes, box, title, size=(312, 64), circular_crop=False):
    svg = ET.Element(f'{{{NS}}}svg', {
        'width': str(size[0]), 'height': str(size[1]),
        'viewBox': ' '.join(f'{n:.2f}' for n in box),
        'role': 'img', 'aria-labelledby': 'title',
    })
    ET.SubElement(svg, f'{{{NS}}}title', {'id': 'title'}).text = title
    container = svg
    if circular_crop:
        defs = ET.SubElement(svg, f'{{{NS}}}defs')
        clip = ET.SubElement(defs, f'{{{NS}}}clipPath', {'id': 'recorte-do-o'})
        ET.SubElement(clip, f'{{{NS}}}circle', {
            'cx': str(box[0]+box[2]/2), 'cy': str(box[1]+box[3]/2),
            'r': str(box[2]/2-2),
        })
        container = ET.SubElement(svg, f'{{{NS}}}g', {'clip-path': 'url(#recorte-do-o)'})
    for node in nodes:
        exported = deepcopy(node)
        exported.attrib.pop('data-bounds', None)
        container.append(exported)
    ET.indent(svg, space='  ')
    (frontend / 'public/brand' / filename).write_text(ET.tostring(svg, encoding='unicode') + '\n')


export('sergio-camargo.svg', paths, frame, 'Vereador Sérgio Camargo')
inverse = []
mono = []
flag_nodes = []
for original in paths:
    is_flag = part_of_flag(original)
    inverse_node = deepcopy(original)
    if not is_flag:
        inverse_node.set('fill', '#FFFFFF')
    inverse.append(inverse_node)
    mono_node = deepcopy(original)
    # Em cutout, as curvas vizinhas já preservam os vazios: retirar o disco
    # azul produz transparência, sem inserir outra forma no símbolo original.
    if not (is_flag and color(original) == BLUE):
        mono_node.set('fill', NAVY)
        mono.append(mono_node)
    if is_flag:
        flag_nodes.append(original)
assert flag_nodes, 'O elemento da letra o precisa ser extraído da marca.'
export('sergio-camargo-inverse.svg', inverse, frame, 'Vereador Sérgio Camargo — versão inversa')
export('sergio-camargo-monochrome.svg', mono, frame, 'Vereador Sérgio Camargo — uma cor')
disc = next(bounds(node) for node in flag_nodes if color(node) == BLUE)
side = max(disc[2]-disc[0], disc[3]-disc[1])+12
flag_frame = ((disc[0]+disc[2]-side)/2, (disc[1]+disc[3]-side)/2, side, side)
export('simbolo.svg', flag_nodes, flag_frame, 'Recorte circular da bandeira no o de Sérgio', size=(64, 64), circular_crop=True)
print({'curves': len(paths), 'flag_curves': len(flag_nodes), 'flag_bounds': flag, 'frame': frame})

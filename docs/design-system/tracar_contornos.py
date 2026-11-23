"""Extrai contornos do bitmap de referência para caminhos SVG determinísticos."""

from collections import defaultdict
import math
import xml.etree.ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
COLORS = {(6, 78, 160, 255): '#064EA0', (255, 223, 0, 255): '#FFDF00', (255, 255, 255, 255): '#FFFFFF'}


def simplify(points, epsilon=0.75):
    if len(points) <= 2:
        return points
    ax, ay = points[0]
    bx, by = points[-1]
    dx, dy = bx - ax, by - ay
    denominator = dx * dx + dy * dy
    best, split = -1, 0
    for index in range(1, len(points) - 1):
        px, py = points[index]
        t = max(0, min(1, ((px-ax)*dx + (py-ay)*dy) / denominator)) if denominator else 0
        distance = (px-ax-t*dx)**2 + (py-ay-t*dy)**2
        if distance > best:
            best, split = distance, index
    if best > epsilon * epsilon:
        return simplify(points[:split+1], epsilon)[:-1] + simplify(points[split:], epsilon)
    return [points[0], points[-1]]


def path_for_loop(points):
    # Dividir o contorno fechado evita degeneração da simplificação no início.
    ax, ay = points[0]
    split = max(range(1, len(points)), key=lambda i: (points[i][0]-ax)**2 + (points[i][1]-ay)**2)
    points = simplify(points[:split+1])[:-1] + simplify(points[split:]+[points[0]])[:-1]
    corners = []
    for index, current in enumerate(points):
        previous, following = points[index-1], points[(index+1) % len(points)]
        def offset(other):
            dx, dy = other[0]-current[0], other[1]-current[1]
            length = math.hypot(dx, dy)
            distance = min(0.6, length/4)
            return (current[0] + dx/length*distance, current[1] + dy/length*distance)
        corners.append((offset(previous), current, offset(following)))
    fmt = lambda p: f'{p[0]:.1f},{p[1]:.1f}'
    result = ['M'+fmt(corners[0][0])]
    for entry, point, exit in corners:
        result.extend(('L'+fmt(entry), 'Q'+fmt(point)+' '+fmt(exit)))
    result.append('Z')
    return ''.join(result)


def trace(pixels, size, flag):
    width, height = size
    edges = {color: defaultdict(set) for color in COLORS}
    transparent = (0, 0, 0, 0)
    for index, color in enumerate(pixels):
        if color == transparent:
            continue
        x, y = index % width, index // width
        graph = edges[color]
        if y == 0 or pixels[index-width] != color: graph[(x,y)].add((x+1,y))
        if x == width-1 or pixels[index+1] != color: graph[(x+1,y)].add((x+1,y+1))
        if y == height-1 or pixels[index+width] != color: graph[(x+1,y+1)].add((x,y+1))
        if x == 0 or pixels[index-1] != color: graph[(x,y+1)].add((x,y))
    groups = defaultdict(list)
    boxes = {}
    for color, graph in edges.items():
        while graph:
            start = next(iter(graph))
            current, previous_direction, points = start, 0, []
            while True:
                choices = graph[current]
                def direction(point):
                    dx, dy = point[0]-current[0], point[1]-current[1]
                    return 0 if dx > 0 else 1 if dy > 0 else 2 if dx < 0 else 3
                priority = {1: 0, 0: 1, 3: 2, 2: 3}
                following = min(choices, key=lambda point: priority[(direction(point)-previous_direction) % 4])
                previous_direction = direction(following)
                choices.remove(following)
                if not choices: del graph[current]
                points.append(current)
                current = following
                if current == start: break
            area = abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points, points[1:]+points[:1]))) / 2
            if area < 20: continue
            box = (min(x for x,y in points), min(y for x,y in points), max(x for x,y in points), max(y for x,y in points))
            is_flag = box[0] >= flag[0]-8 and box[1] >= flag[1]-8 and box[2] <= flag[2]+8 and box[3] <= flag[3]+8
            if color == (6, 78, 160, 255) and is_flag:
                # O i toca o losango na referência, mas não pertence ao o.
                is_flag = (box[0]+box[2])/2 > flag[0]+(flag[2]-flag[0])*0.25
            key = (color, is_flag)
            groups[key].append(path_for_loop(points))
            previous = boxes.get(key, box)
            boxes[key] = (min(previous[0],box[0]), min(previous[1],box[1]), max(previous[2],box[2]), max(previous[3],box[3]))
    paths = []
    for key, segments in groups.items():
        paths.append(ET.Element(f'{{{NS}}}path', {'fill': COLORS[key[0]], 'fill-rule':'evenodd', 'd': ''.join(segments), 'data-bounds': ' '.join(map(str,boxes[key]))}))
    return paths


def bounds(node):
    return tuple(map(float, node.attrib['data-bounds'].split()))

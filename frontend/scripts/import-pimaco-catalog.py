from html.parser import HTMLParser
from pathlib import Path
import json,re,argparse
parser=argparse.ArgumentParser(description="Extrair parâmetros Pimaco de tabelas oficiais convertidas para HTML")
parser.add_argument("directory",type=Path,help="Pasta com as quatro tabelas HTML exportadas do Word")
parser.add_argument("output",type=Path,help="Arquivo JSON de destino")
args=parser.parse_args()
class TableParser(HTMLParser):
 def __init__(self):super().__init__();self.cell=None;self.row=[];self.rows=[]
 def handle_starttag(self,t,a):
  if t=='tr':self.row=[]
  if t in ('td','th'):self.cell=[]
 def handle_data(self,d):
  if self.cell is not None:self.cell.append(d)
 def handle_endtag(self,t):
  if t in ('td','th') and self.cell is not None:self.row.append(' '.join(' '.join(self.cell).split()));self.cell=None
  if t=='tr':self.rows.append(self.row)
def rows(name):
 p=TableParser();p.feed((args.directory/name).read_text());return p.rows
def mm(v):return round(float(v.replace(',','.'))*10,3) if v.strip() not in ('-','') else 0
sources=[
 'https://editor.pimaco.com.br/documents/parametros/inkjet_a4/params_inkjet_a4_especiais_word_2007.doc',
 'https://editor.pimaco.com.br/documents/parametros/inkjet_a5/params_inkjet_a5_word_2007.doc',
 'https://editor.pimaco.com.br/documents/parametros/pimatab/params_pimatab_word_2007.doc',
]
formats=[]
for source,name in enumerate(['params_inkjet_a4_especiais_word_2007.html','params_inkjet_a5_word_2007.html','params_pimatab_word_2007.html']):
 for row in rows(name):
  if len(row)!=9 or not re.match(r'\*?[A-Z0-9]',row[0]) or not re.match(r'^\d+(,\d+)?$',row[1]):continue
  codes=[x.strip().replace('*','') for x in row[0].split('/')]
  if source==1:
   top,left,height,width,pitchY,pitchX=map(mm,row[1:7])
  else:top,left,pitchY,pitchX,height,width=map(mm,row[1:7])
  columns=int(row[7]); lines=int(row[8]); gapX=round(max(0,pitchX-width),3);gapY=round(max(0,pitchY-height),3)
  gridWidth=left+columns*width+(columns-1)*gapX;gridHeight=top+lines*height+(lines-1)*gapY
  if source==0:paperWidth,paperHeight=(210,297) if codes[0].startswith('A4') else (215.9,279.4);family='A4' if codes[0].startswith('A4') else 'Carta'
  elif source==1:
   if gridWidth<=148.5 and gridHeight<=210:paperWidth,paperHeight=148.5,210;family='A5 retrato'
   elif gridWidth<=210 and gridHeight<=148.5:paperWidth,paperHeight=210,148.5;family='A5 paisagem'
   else:paperWidth,paperHeight=0,0;family='A5 especial — informar folha'
  else:paperWidth,paperHeight=0,0;family='Pimatab — formulário contínuo'
  formats.append(dict(codes=codes,source=source,family=family,paperWidth=paperWidth,paperHeight=paperHeight,width=width,height=height,left=left,top=top,gapX=gapX,gapY=gapY,columns=columns,rows=lines))
source='https://editor.pimaco.com.br/documents/parametros/cartoes_visita/params_cartao_visita_word.doc'
sources.append(source)
known={code for group in formats for code in group['codes']}
for row in rows('params_cartao_visita_word.html'):
 if len(row)!=9 or row[0] in known or not row[0].isdigit() or not re.match(r'^\d+(,\d+)?$',row[1]):continue
 top,left,pitchY,pitchX,height,width=map(mm,row[1:7]);columns=int(row[7]);lines=int(row[8])
 formats.append(dict(codes=[row[0]],source=len(sources)-1,family='Carta',paperWidth=215.9,paperHeight=279.4,width=width,height=height,left=left,top=top,gapX=round(max(0,pitchX-width),3),gapY=round(max(0,pitchY-height),3),columns=columns,rows=lines))
out=args.output
out.write_text(json.dumps(dict(sources=sources,formats=formats),separators=(',',':'),ensure_ascii=False)+'\n')
print('Grupos:',len(formats),'códigos/variações:',sum(len(x['codes']) for x in formats),'bytes:',out.stat().st_size)
print('Fontes:',*sources,sep='\n')

import subprocess
import json
from glob import glob
import re


def get_metadata(filename):

    pdf_path = 'public/pdfs/' + filename
    
    raw_meta = subprocess.run(['pdfinfo', pdf_path], capture_output=True)
    raw_meta = raw_meta.stdout.decode()
    metadata = {}
    for line in raw_meta.strip().split('\n'):
        delim_pos = line.find(':')
        key, value = line[:delim_pos], line[delim_pos+1:]
        metadata[key] = value.strip()
    
    print(metadata)
        
    date, year = metadata.get('CreationDate'), ''
    print('date:', date)
    if date is not None:
        year = re.match(r'(\d{4})', date).group(0)
    
    result = {
        'title': metadata.get('Title'),
        'author': metadata.get('Author'),
        'year': year,
        'pdf': filename
    }
    
    return result
    
        

if __name__ == '__main__':
    
    # Load JSON, extract "pdf" fields as a list
    with open('public/data.json') as fin:
        data = json.load(fin)['data']
    imported_pdfs = set([x['pdf'] for x in data])
    
    # Collect downloaded PDFs 
    downloaded_pdfs = glob('public/pdfs/*.pdf')
    downloaded_pdfs = set([x.split('/')[-1] for x in downloaded_pdfs])    # Get basename
    
    # Get unimported PDFs
    unimported_pdfs = downloaded_pdfs - imported_pdfs
    
    if len(unimported_pdfs) == 0:
        print('No unimported PDFs')
        exit(0)
        
    print(unimported_pdfs)
    
    # Extract metadata, print suggestions
    suggested = map(get_metadata, unimported_pdfs)
    
    print('Suggested entries for public/data.json:')
    for entry in suggested:
        print('{')
        print('    \"title\": \"{}\",'.format(entry['title']))
        print('    \"author\": \"{}\",'.format(entry['author']))
        print('    \"year\": \"{}\",'.format(entry['year']))
        print('    \"uri\": \"\",')
        print('    \"pdf\": \"{}\",'.format(entry['pdf']))
        print('}\n')
    
    

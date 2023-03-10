import subprocess
from glob import glob
import re
import yaml


def get_metadata(filename):

    pdf_path = 'pdfs/' + filename
    
    try:
        raw_meta = subprocess.run(['pdfinfo', pdf_path], capture_output=True)
    except FileNotFoundError as exc:
        print(exc)
        print('\n\n')
        print('\'pdfinfo\' not installed, install with \' sudo apt install poppler-utils\'')
        exit(1)

    raw_meta = raw_meta.stdout.decode()
    metadata = {}
    for line in raw_meta.strip().split('\n'):
        delim_pos = line.find(':')
        key, value = line[:delim_pos], line[delim_pos+1:]
        metadata[key] = value.strip()
    
    date, year = metadata.get('CreationDate'), ''
    if date is not None:
        match = re.search(r'(\d{4})', date)
        if match is not None:
            year = match.group(0)
    
    result = {
        'title': metadata.get('Title'),
        'author': metadata.get('Author'),
        'year': year,
        'pdf': filename
    }
    
    return result
    
        

if __name__ == '__main__':
    
    # Load yaml entries, extract "pdf" fields as a list
    with open('data.yml') as fin:
        data = yaml.load(fin, Loader=yaml.CLoader)['data']
    imported_pdfs = set([x['pdf'] for x in data])

    # Collect downloaded PDFs 
    downloaded_pdfs = glob('pdfs/*.pdf')
    downloaded_pdfs = set([x.split('/')[-1] for x in downloaded_pdfs])    # Get basename
    
    # Get unimported PDFs
    unimported_pdfs = downloaded_pdfs - imported_pdfs
    
    if len(unimported_pdfs) == 0:
        print('No unimported PDFs')
        exit(0)
        
    print(unimported_pdfs)
    
    # Extract metadata, print suggestions
    suggested = map(get_metadata, unimported_pdfs)
    
    print('Suggested entries for public/data.yml:')
    for entry in suggested:
        print('')
        print('- title: \"{}\"'.format(entry['title']))
        print('  author: \"{}\"'.format(entry['author']))
        print('  year: {}'.format(entry['year']))
        print('  tags: []')
        print('  uri: \"\"')
        print('  pdf: \"{}\"'.format(entry['pdf']))
        print('')
    
    

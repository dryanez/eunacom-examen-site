"""Upload every book (PDF + Anki) to the PRIVATE R2 bucket as libros/<path inside books/dist>.

    PYTHONPATH=~/fotos_tools/pylib ~/.venvs/manim/bin/python scripts/upload-books.py --env .env.local

Reads R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BOOKS_BUCKET from the env file. Only uploads the
files api/_catalog.json actually serves, and skips ones already there with the same size.
"""
import argparse, json, os
import boto3

ap = argparse.ArgumentParser()
ap.add_argument('--env', default='.env.local')
ap.add_argument('--dist', default=os.path.expanduser('~/Documents/Archive/Apps/eunacom-fotos/books/dist'))
a = ap.parse_args()

env = {}
for line in open(a.env):
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.strip().split('=', 1); env[k] = v.strip().strip('"\'')
bucket = env['R2_BOOKS_BUCKET']
s3 = boto3.client('s3', endpoint_url=f"https://{env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
                  aws_access_key_id=env['R2_ACCESS_KEY_ID'], aws_secret_access_key=env['R2_SECRET_ACCESS_KEY'], region_name='auto')

catalog = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'api', '_catalog.json')))
paths = sorted({f['file'] for files in catalog['files'].values() for f in files})
done = 0
for p in paths:
    local = os.path.join(a.dist, p)
    key = f'libros/{p}'
    try:
        if s3.head_object(Bucket=bucket, Key=key)['ContentLength'] == os.path.getsize(local):
            continue
    except Exception:
        pass
    ctype = 'application/pdf' if p.endswith('.pdf') else 'application/octet-stream'
    s3.upload_file(local, bucket, key, ExtraArgs={'ContentType': ctype})
    done += 1
    print('↑', key)
print(f'{done} uploaded, {len(paths) - done} already there · bucket {bucket}')

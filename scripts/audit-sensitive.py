#!/usr/bin/env python3
"""Check tracked files and source archives without printing credential values."""
import argparse
import collections
import hashlib
import io
import json
import math
import pathlib
import re
import subprocess
import tarfile
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'dist/javame/runtime-sources.tar.gz'
FIXTURE = 'pluotsorbet/tests/cert.pem'
PUBLIC_TEST_SHA256 = 'b950683a209422071c6018a95cae890a577d9a6acde0cef88a529142d92dc00c'
RULES = {
    'private-key': rb'-----BEGIN (?:RSA |DSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----|PuTTY-User-Key-File-[23]:',
    'alibaba-access-key-id': rb'(?<![A-Za-z0-9])LTAI[A-Za-z0-9]{12,28}(?![A-Za-z0-9])',
    'tencent-secret-id': rb'(?<![A-Za-z0-9])AKID[A-Za-z0-9]{13,40}(?![A-Za-z0-9])',
    'aws-access-key-id': rb'(?<![A-Z0-9])(?:AKIA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])',
    'volcengine-access-key': rb'(?<![A-Za-z0-9])AK(?:LT|TP)[A-Za-z0-9]{20,80}(?![A-Za-z0-9])',
    'github-token': rb'(?<![A-Za-z0-9])(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{50,255})',
    'api-secret-key': rb'(?<![A-Za-z0-9])sk-(?:proj-|ant-api[0-9]+-)?[A-Za-z0-9_-]{24,220}',
    'google-api-key': rb'AIza[0-9A-Za-z_-]{35}',
    'slack-token': rb'xox[baprs]-[A-Za-z0-9-]{20,}',
}
KEY_NAME = rb'(?:[A-Za-z][A-Za-z0-9_-]*[_-])?(ak|sk|access[_-]?key(?:[_-]?(?:id|secret))?|secret[_-]?access[_-]?key|secret[_-]?key|secret[_-]?id|client[_-]?secret|api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd)'
ASSIGNMENT = re.compile(rb'''(?i)(?<![A-Za-z0-9_-])["']?'''+KEY_NAME+rb'''["']?\s*[:=]\s*(["'])([\x21-\x7e]{16,200}?)\2''')
UNQUOTED = re.compile(rb'(?im)^\s*(?:export\s+)?'+KEY_NAME+rb'\s*[:=]\s*([A-Za-z0-9_+/=-]{16,200})\s*$')
PLACEHOLDER = re.compile(rb'(?i)example|placeholder|your[_-]|dummy|sample|process\.env|\$\{|getenv|secret.*name|^[*xX_<>. -]+$')


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def strip_fixture():
    with tarfile.open(ARCHIVE, 'r:gz') as src:
        members = src.getmembers()
        found = [m for m in members if m.name == FIXTURE]
        if not found:
            return False
        value = src.extractfile(found[0]).read()
        if hashlib.sha256(value).hexdigest() != PUBLIC_TEST_SHA256:
            raise RuntimeError('Unexpected test fixture contents; review before removal')
        temporary = ARCHIVE.with_suffix('.sanitized.tmp')
        with tarfile.open(temporary, 'w:gz') as dst:
            for member in members:
                if member.name == FIXTURE:
                    continue
                dst.addfile(member, src.extractfile(member) if member.isfile() else None)
    temporary.replace(ARCHIVE)
    return True


def inspect(data, path, findings, stats, historical=False, depth=0):
    stats['items'] += 1
    for name, pattern in RULES.items():
        for match in re.finditer(pattern, data):
            entry = {'path': path, 'type': name, 'line': data[:match.start()].count(b'\n')+1}
            findings.append(entry)
    candidates = [(m.group(1), m.group(3), m.start()) for m in ASSIGNMENT.finditer(data)]
    candidates += [(m.group(1), m.group(2), m.start()) for m in UNQUOTED.finditer(data)]
    for field, value, start in candidates:
        counts = collections.Counter(value)
        entropy = -sum(n/len(value)*math.log2(n/len(value)) for n in counts.values())
        if entropy >= 3.5 and not PLACEHOLDER.search(value):
            findings.append({'path': path, 'type': 'hardcoded-'+field.decode(), 'line': data[:start].count(b'\n')+1})
    if depth >= 3:
        return
    if data.startswith(b'PK\x03\x04'):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            stats['archives'] += 1
            for member in archive.infolist():
                if member.is_dir():
                    continue
                if member.file_size > 50_000_000:
                    stats['skipped'].append(path+'!'+member.filename)
                    continue
                inspect(archive.read(member), path+'!'+member.filename, findings, stats, historical, depth+1)
    elif data.startswith(b'\x1f\x8b') or path.endswith('.tar'):
        try:
            archive = tarfile.open(fileobj=io.BytesIO(data))
        except tarfile.TarError:
            return
        with archive:
            stats['archives'] += 1
            for member in archive:
                if not member.isfile():
                    continue
                if member.size > 50_000_000:
                    stats['skipped'].append(path+'!'+member.name)
                    continue
                inspect(archive.extractfile(member).read(), path+'!'+member.name, findings, stats, historical, depth+1)


def scan(history):
    findings = []
    stats = {'items': 0, 'archives': 0, 'historical_public_test_fixtures': 0, 'skipped': []}
    if history:
        rows = [row.split(' ', 1) for row in git('rev-list', '--objects', '--all').decode().splitlines()]
        process = subprocess.Popen(['git', '-C', str(ROOT), 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        for row in rows:
            sha = row[0]
            process.stdin.write((sha+'\n').encode())
            process.stdin.flush()
            header = process.stdout.readline().split()
            data = process.stdout.read(int(header[2]))
            process.stdout.read(1)
            if header[1] == b'blob':
                inspect(data, (row[1] if len(row)>1 else sha)+'@'+sha[:12], findings, stats, True)
        process.stdin.close()
        process.wait()
    else:
        for path in git('ls-files', '-z').decode().split('\0'):
            if path and (ROOT/path).is_file():
                inspect((ROOT/path).read_bytes(), path, findings, stats)
    return {'scope': 'history' if history else 'current', 'stats': stats, 'findings': findings}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--strip-test-fixture', action='store_true')
    parser.add_argument('--history', action='store_true')
    parser.add_argument('--report', type=pathlib.Path)
    args = parser.parse_args()
    removed = strip_fixture() if args.strip_test_fixture else False
    report = scan(args.history)
    report['removed_test_fixture'] = removed
    text = json.dumps(report, ensure_ascii=False, indent=2)
    if args.report:
        args.report.write_text(text+'\n')
    print(text)
    raise SystemExit(bool(report['findings'] or report['stats']['skipped']))

import os

def _strip_trailing(text):
    return '\n'.join(line.rstrip() for line in text.split('\n'))

def read(path):
    with open(path, 'rb') as f:
        raw = f.read()
    crlf = b'\r\n' in raw
    text = raw.decode('utf-8').replace('\r\n', '\n')
    return text, crlf

def write(path, text, crlf):
    out = text.replace('\n', '\r\n') if crlf else text
    with open(path, 'wb') as f:
        f.write(out.encode('utf-8'))

def patch(path, edits, must_all=True):
    """edits: list of (old, new). Each old must appear exactly once.

    Falls back to trailing-whitespace-insensitive matching, which is needed
    because several source files carry trailing spaces on blank lines.
    """
    text, crlf = read(path)
    applied = 0
    for old, new in edits:
        n = text.count(old)
        if n == 0:
            # Retry ignoring trailing whitespace.
            stripped_text = _strip_trailing(text)
            stripped_old = _strip_trailing(old)
            m = stripped_text.count(stripped_old)
            if m == 1:
                text = stripped_text.replace(stripped_old, _strip_trailing(new))
                applied += 1
                continue
            if m > 1:
                raise SystemExit("[AMBIG] %s: anchor appears %d times:\n%s" % (path, m, old[:200]))
            msg = "[MISS] %s: anchor not found:\n---\n%s\n---" % (path, old[:300])
            if must_all:
                raise SystemExit(msg)
            print(msg)
            continue
        if n > 1:
            raise SystemExit("[AMBIG] %s: anchor appears %d times:\n%s" % (path, n, old[:200]))
        text = text.replace(old, new)
        applied += 1
    write(path, text, crlf)
    print("[OK] %s: %d/%d edits applied" % (path, applied, len(edits)))

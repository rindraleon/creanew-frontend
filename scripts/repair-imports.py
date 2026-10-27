#!/usr/bin/env python3
"""Repare les imports relatifs : chaque specificiteur doit pointer sur un
fichier qui existe reellement.

Un passage de rebase avait fait deriver les specificateurs d'un niveau de
`../` par execution. Ce script cherche, pour chaque import relatif, la variante
(avec ou sans `../` supplementaire) qui resout vers un fichier present, et
l'applique. Idempotent : une fois tous les imports justes, plus rien ne bouge.
"""
import os
import re

SRC = "/home/user/mobilier-shop/frontend/src"
EXTS = ["", ".ts", ".tsx", ".css", ".svg", "/index.ts", "/index.tsx"]

IMPORT_RE = re.compile(
    r"""(?P<prefix>\b(?:import|export|from)\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)"""
    r"""(?P<quote>["'])(?P<spec>[^"']+)(?P=quote)"""
)


def exists(rel):
    """Le chemin src-relatif pointe-t-il vers un fichier reel ?"""
    return any(os.path.isfile(os.path.join(SRC, rel + ext)) for ext in EXTS)


def variants(spec):
    """Variantes plausibles : d'abord en retirant des `../`, puis en en ajoutant."""
    out = [spec]
    stripped = spec
    for _ in range(4):
        if stripped.startswith("../"):
            stripped = stripped[3:]
            out.append(stripped)
        else:
            break
    deeper = spec
    for _ in range(4):
        deeper = "../" + deeper
        out.append(deeper)
    seen, uniq = set(), []
    for v in out:
        if v not in seen:
            seen.add(v)
            uniq.append(v)
    return uniq


def main():
    fixed = 0
    for root, _dirs, files in os.walk(SRC):
        for name in files:
            if not name.endswith((".ts", ".tsx")):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, SRC).replace(os.sep, "/")
            base = os.path.dirname(rel)

            with open(path, encoding="utf-8") as fh:
                src = fh.read()

            def repl(match):
                nonlocal fixed
                spec = match.group("spec")
                if not spec.startswith("."):
                    return match.group(0)
                target = os.path.normpath(os.path.join(base, spec)).replace(os.sep, "/")
                if exists(target):
                    return match.group(0)
                for candidate in variants(spec):
                    alt = os.path.normpath(os.path.join(base, candidate)).replace(os.sep, "/")
                    if exists(alt):
                        fixed += 1
                        return (
                            match.group("prefix")
                            + match.group("quote")
                            + candidate
                            + match.group("quote")
                        )
                return match.group(0)

            new_src = IMPORT_RE.sub(repl, src)
            if new_src != src:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new_src)
    print(f"{fixed} imports repares.")


if __name__ == "__main__":
    main()

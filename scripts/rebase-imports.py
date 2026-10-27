#!/usr/bin/env python3
"""Rebase de tous les imports relatifs apres la reorganisation.

Pour un fichier deplace de O vers P, ses imports ont ete ecrits depuis O.
On resout donc chaque specificateur depuis dirname(O) pour obtenir la cible
reelle T, puis on le recalcule depuis dirname(P).

L'operation est idempotente : la relancer ne change rien.
"""
import os
import re
import sys

SRC = "/home/user/mobilier-shop/frontend/src"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Table ancien -> nouveau, reprise du script de reorganisation.
from reorganize import MOVES  # noqa: E402

NEW_TO_OLD = {v: k for k, v in MOVES.items()}
EXTS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx", ".css", ".svg"]

IMPORT_RE = re.compile(
    r"""(?P<prefix>\b(?:import|export|from)\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)"""
    r"""(?P<quote>["'])(?P<spec>[^"']+)(?P=quote)"""
)


def real_target(base_old, spec):
    """Cible reelle (chemin src-relatif sans extension) d'un specificateur."""
    joined = os.path.normpath(os.path.join(base_old, spec)).replace(os.sep, "/")
    for ext in EXTS:
        cand = joined + ext
        if cand in MOVES:
            return MOVES[cand]
        if cand in NEW_TO_OLD:
            return cand
    return joined


def main():
    changed = 0
    for root, _dirs, files in os.walk(SRC):
        for name in files:
            if not name.endswith((".ts", ".tsx")):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, SRC).replace(os.sep, "/")
            origin = NEW_TO_OLD.get(rel, rel)
            base_old = os.path.dirname(origin)
            base_new = os.path.dirname(rel)

            with open(path, encoding="utf-8") as fh:
                src = fh.read()

            def repl(match):
                spec = match.group("spec")
                if not spec.startswith("."):
                    return match.group(0)
                target = real_target(base_old, spec)
                new_spec = os.path.relpath(target, base_new).replace(os.sep, "/")
                if not new_spec.startswith("."):
                    new_spec = "./" + new_spec
                # Le projet importe sans extension : on retire celle de la cible.
                new_spec = re.sub(r"\.tsx?$", "", new_spec)
                return match.group("prefix") + match.group("quote") + new_spec + match.group("quote")

            new_src = IMPORT_RE.sub(repl, src)
            if new_src != src:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new_src)
                changed += 1
    print(f"{changed} fichiers rebases.")


if __name__ == "__main__":
    main()

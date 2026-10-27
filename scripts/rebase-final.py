#!/usr/bin/env python3
"""Rebase definitif des imports relatifs apres reorganisation.

Un fichier deplace de O vers P conserve des imports ecrits depuis dirname(O).
Pour chacun :
    1. cible = normpath(join(dirname(O), specifier))
    2. cible = MOVES.get(cible, cible)        <- suit le deplacement
    3. nouveau specifier = relpath(cible, dirname(P))

A n'executer QU'UNE SEULE FOIS sur un contenu d'origine (idempotent par
construction : si le specifier est deja correct, la cible recalculee est la
meme et le specifier reste identique).
"""
import os
import re
import sys

SRC = "/home/user/mobilier-shop/frontend/src"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reorganize import MOVES  # noqa: E402

NEW_TO_OLD = {v: k for k, v in MOVES.items()}
EXTS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx", ".css", ".svg"]

IMPORT_RE = re.compile(
    r"""(?P<prefix>\b(?:import|export|from)\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)"""
    r"""(?P<quote>["'])(?P<spec>[^"']+)(?P=quote)"""
)


def resolve(base_old, spec):
    joined = os.path.normpath(os.path.join(base_old, spec)).replace(os.sep, "/")
    for ext in EXTS:
        cand = joined + ext
        if cand in MOVES:
            return MOVES[cand]
    return joined


def main():
    changed = 0
    unresolved = []
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
                target = resolve(base_old, spec)
                new_spec = os.path.relpath(target, base_new).replace(os.sep, "/")
                if not new_spec.startswith("."):
                    new_spec = "./" + new_spec
                new_spec = re.sub(r"\.tsx?$", "", new_spec)
                if not os.path.isfile(os.path.join(SRC, target)) and not any(
                    os.path.isfile(os.path.join(SRC, target + e)) for e in EXTS
                ):
                    unresolved.append((rel, spec))
                return match.group("prefix") + match.group("quote") + new_spec + match.group("quote")

            new_src = IMPORT_RE.sub(repl, src)
            if new_src != src:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new_src)
                changed += 1

    print(f"{changed} fichiers rebases.")
    if unresolved:
        print("CIBLES INTROUVABLES :")
        for rel, spec in sorted(set(unresolved)):
            print(f"  {rel}  ->  {spec}")


if __name__ == "__main__":
    main()

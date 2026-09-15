"""Replace the named-physician branding with the academy.

The site was written around "Dr. Felipe Yáñez", a job title, an alma mater and
a professional registry number (RNPI Nº 642819) that were never substantiated.
Everything attributable to a person becomes the academy. References to the RNPI
*registry itself* in the convalidation content are factual and stay.

Run: python3 scripts/debrand.py
"""

import glob
import re
from pathlib import Path

ACADEMIA = "Academia Examen EUNACOM"
EQUIPO = "Equipo académico AEE"

# Longest first: each entry is applied in order.
REPLACEMENTS = [
    # Author role used across the blog data
    ("Director Académico EUNACOM · Médico Cirujano USACH · RNPI Nº 642819",
     f"Equipo académico · {ACADEMIA}"),
    ("Dr. Felipe Yáñez · Médico Cirujano USACH · RNPI Nº 642819", ACADEMIA),
    ("Dr. Felipe Yáñez · RNPI Nº 642819", ACADEMIA),
    ("Médico Cirujano USACH. Especialista en preparación para la habilitación médica de médicos nacionales y extranjeros en Chile.",
     "Preparación para la habilitación médica de médicos nacionales y extranjeros en Chile."),

    # Schema.org author blocks
    ('"alternateName": ["EUNACOM Academia", "Preparación EUNACOM Dr. Felipe Yáñez"]',
     '"alternateName": ["Academia Examen EUNACOM", "AEE"]'),
    ('"name": "Dr. Felipe Yáñez"', f'"name": "{ACADEMIA}"'),
    ('"jobTitle": "Director Académico EUNACOM"', '"jobTitle": "Equipo académico"'),
    ('"alumniOf": "Universidad de Santiago de Chile (USACH)"', '"areaServed": "Chile"'),
    ('"identifier": "RNPI-642819"', '"areaServed": "Chile"'),
    ('article.author || "Dr. Felipe Yáñez"', f'article.author || "{EQUIPO}"'),
    ('"identifier": "RNPI-642819",', ''),

    # Conversational copy
    ("¡Hola Dr. Felipe Yáñez!", "¡Hola!"),
    ("supervisado por Dr. Felipe Yáñez", f"revisado por el equipo académico de {ACADEMIA}"),
    ("Redactados y supervisados por el Dr. Felipe Yáñez.",
     f"Redactados y revisados por el equipo académico de {ACADEMIA}."),
    ("dictada por el Dr. Felipe Yáñez", f"dictada por el equipo académico de {ACADEMIA}"),
    ("Consulta directamente con el Dr. Felipe Yáñez.", "Escríbenos y te respondemos."),
    ("comunicarte directamente con el Dr. Felipe Yáñez",
     f"comunicarte directamente con {ACADEMIA}"),
    ("con el Dr. Felipe Yáñez por WhatsApp", f"con {ACADEMIA} por WhatsApp"),
    ('author: "Dr. Felipe Yáñez"', f'author: "{EQUIPO}"'),

    # Titles
    ("Evaluación con Director Académico", "Evaluación de perfil"),
    ("Consultar con Director Académico", "Consultar con la academia"),
    ("Simulacro Diagnóstico Gratuito y Evaluación con Director Académico",
     "Simulacro diagnóstico gratuito y evaluación de perfil"),
    ("nuestro Director Académico", "nuestro equipo académico"),
    ("del Director Académico", "del equipo académico"),
    ("Director Académico", "Equipo académico"),

    # Anything still naming the person
    ("Dr. Felipe Yáñez", ACADEMIA),
    ("doctor felipe yañez, ", ""),
]

# RNPI as a registry (Registro Nacional de Prestadores Individuales) is real and
# stays; only the fabricated personal number goes.
NUMBER = [
    (" · RNPI Nº 642819", ""),
    ("RNPI Nº 642819", ""),
    ("RNPI-642819", ""),
    ("RNPI 642819", ""),
]


def main():
    files = sorted(glob.glob("src/**/*.js*", recursive=True)) + ["index.html"]
    changed = 0
    for path in files:
        text = original = Path(path).read_text(encoding="utf-8")
        for old, new in REPLACEMENTS + NUMBER:
            text = text.replace(old, new)
        text = re.sub(r"\s+·\s*(?=[\"'<}])", "", text)
        if text != original:
            Path(path).write_text(text, encoding="utf-8")
            changed += 1
            print(f"debranded {path}")
    print(f"\n{changed} files updated")


if __name__ == "__main__":
    main()

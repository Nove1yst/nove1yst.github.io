# Junran Wang — CV

The sole maintained version uses Computer Modern with enhanced bold text
(0.12 pt stroke), retaining the original autoCV layout. Content is in
`cv.tex`; numbered publications and author-order annotations are in
`citations.bib`. Preserve the SEAD author-order comments when editing.

## Build

Requires pdfLaTeX, Biber, and latexmk (included in MacTeX/TeX Live).

```sh
cd Resume
make
```

The build writes `cv.pdf` and copies the identical PDF to
`../docs/jwang_cv.pdf`, which the personal website serves. Temporary build
files are removed after a successful build. Run `make clean` to remove
intermediates left by an interrupted build.

On Overleaf, select **pdfLaTeX** and upload both `cv.tex` and `citations.bib`.

The original autoCV template's MIT license is preserved in `cv.tex`.

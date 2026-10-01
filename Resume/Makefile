NAME=cv

all:
	latexmk -pdf -interaction=nonstopmode -halt-on-error -outdir=.build ${NAME}.tex
	cp .build/${NAME}.pdf ${NAME}.pdf
	cp ${NAME}.pdf ../docs/jwang_cv.pdf
	rm -rf .build

clean:
	rm -rf .build
	rm -f ${NAME}.aux ${NAME}.bbl ${NAME}.bcf ${NAME}.fdb_latexmk ${NAME}.fls ${NAME}.log ${NAME}.out ${NAME}.run.xml ${NAME}.blg ${NAME}.toc ${NAME}.xdv ${NAME}.synctex.gz *~

#!/bin/bash
# Recentra un bodegon: extiende el fondo liso por la izquierda y por abajo, y
# recorta a 2:1 con el conjunto de productos centrado.
# El fondo extendido sale de una franja del propio borde, estirada y muy
# suavizada (sin rayas), y se funde con la foto en los pocos pixeles limpios del
# borde (14 px; los productos empiezan en x=20 y terminan lejos del borde de
# abajo).
# uso: centrar-bodegon.sh ENTRADA SALIDA.jpg PL PB W H [ANCHO_ORIGINAL]
#   PL y PB: relleno a la izquierda y abajo; W y H: tamano final (W = 2 x H)
# ffmpeg: el del PATH, o el que indique la variable FFMPEG
FF="${FFMPEG:-ffmpeg}"
IN="$1"; OUT="$2"; PL="$3"; PB="$4"; W="$5"; H="$6"; W0="${7:-1600}"
F=14                                  # px de degradado en la union
P1="${OUT%.jpg}-izq.png"; P2="${OUT%.jpg}-abajo.png"

# Paso 1: extension por la izquierda (PL px)
"$FF" -hide_banner -loglevel error -y -i "$IN" -filter_complex "
[0:v]split=2[o][s];
[s]crop=16:ih:0:0,scale=$((PL + F)):ih:flags=bilinear,gblur=sigma=45:steps=3[bg0];
[bg0]pad=${PL}+${W0}:ih:0:0:color=black[bg];
[o]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='min(255,255*(X+1)/${F})'[of];
[bg][of]overlay=${PL}:0:format=auto,format=rgb24[res]
" -map "[res]" "$P1" || exit 1

# Paso 2: extension por abajo (PB px), si hace falta
if [ "$PB" -gt 0 ]; then
  ALTO0=$((H - PB))                   # alto de la imagen antes de extender
  "$FF" -hide_banner -loglevel error -y -i "$P1" -filter_complex "
  [0:v]split=2[o][s];
  [s]crop=iw:16:0:ih-16,scale=iw:$((PB + F)):flags=bilinear,gblur=sigma=45:steps=3[bg0];
  [bg0]pad=iw:${H}:0:$((ALTO0 - F)):color=black[bg];
  [o]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='min(255,255*(H-Y)/${F})'[of];
  [bg][of]overlay=0:0:format=auto,format=rgb24[res]
  " -map "[res]" "$P2" || exit 1
else
  cp "$P1" "$P2"
fi

# Paso 3: recorte 2:1 (la ventana empieza en x=0 porque el relleno izquierdo es justo el necesario)
"$FF" -hide_banner -loglevel error -y -i "$P2" -vf "crop=${W}:${H}:0:0" -q:v 3 "$OUT" || exit 1
echo "ok: $OUT"

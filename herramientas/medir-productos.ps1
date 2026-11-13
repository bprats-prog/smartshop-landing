param([string]$ruta, [int]$croma = 80, [int]$oscuro = 100, [int]$minimo = 40)
# Producto = pixel muy saturado (croma) o muy oscuro. El fondo beige, aun con el
# viñeteado de las esquinas, no llega a ninguno de los dos umbrales. Se exige un
# minimo de pixeles por columna y por fila para no medir motas sueltas.
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap($ruta)
$w = $bmp.Width; $h = $bmp.Height
$col = New-Object int[] $w; $fil = New-Object int[] $h
for ($y = 0; $y -lt $h; $y += 2) {
  for ($x = 0; $x -lt $w; $x += 2) {
    $p = $bmp.GetPixel($x, $y)
    $mx = [math]::Max($p.R, [math]::Max($p.G, $p.B)); $mn = [math]::Min($p.R, [math]::Min($p.G, $p.B))
    $lum = 0.299 * $p.R + 0.587 * $p.G + 0.114 * $p.B
    if (($mx - $mn) -gt $croma -or $lum -lt $oscuro) { $col[$x]++; $fil[$y]++ }
  }
}
$bmp.Dispose()
function Primero($a, $min) { for ($i = 0; $i -lt $a.Length; $i++) { if ($a[$i] -ge $min) { return $i } }; return -1 }
function Ultimo($a, $min) { for ($i = $a.Length - 1; $i -ge 0; $i--) { if ($a[$i] -ge $min) { return $i } }; return -1 }
$x0 = Primero $col 2; $x1 = Ultimo $col 2; $y0 = Primero $fil ($minimo / 8); $y1 = Ultimo $fil ($minimo / 8)
$nombre = Split-Path $ruta -Leaf
"{0}: imagen {1}x{2} | productos x {3}..{4}  y {5}..{6} | centro x={7} y={8} | margenes izq={3} der={9} arriba={5} abajo={10}" -f $nombre, $w, $h, $x0, $x1, $y0, $y1, [math]::Round(($x0 + $x1) / 2), [math]::Round(($y0 + $y1) / 2), ($w - $x1), ($h - $y1)

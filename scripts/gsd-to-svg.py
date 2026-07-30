"""
Convierte logos.gsp / logos.gsd (GRAPHTEC PRT&CUT) a SVG.

Basado en la especificación de Inkscape Wiki (formato ROBO Master).
"""
from __future__ import annotations

import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_IN = ROOT / "logos.gsp"
DEFAULT_OUT = ROOT / "tienda/scripts/regalos-src/logos-from-gsp.svg"


class GsdReader:
    def __init__(self, data: bytes) -> None:
        if not data.startswith(b"GRAPHTEC PRT&CUT"):
            raise ValueError("No es un archivo GRAPHTEC PRT&CUT")
        self.data = data
        self.pos = 0x80
        self.paths: list[list[tuple[float, float]]] = []

    def _u8(self) -> int:
        v = self.data[self.pos]
        self.pos += 1
        return v

    def _u16(self) -> int:
        v = struct.unpack_from("<H", self.data, self.pos)[0]
        self.pos += 2
        return v

    def _i16(self) -> int:
        v = struct.unpack_from("<h", self.data, self.pos)[0]
        self.pos += 2
        return v

    def _i32(self) -> int:
        v = struct.unpack_from("<i", self.data, self.pos)[0]
        self.pos += 4
        return v

    def _f64(self) -> float:
        v = struct.unpack_from("<d", self.data, self.pos)[0]
        self.pos += 8
        return v

    def _read_chunk_payload(self, dtype: int, count: int) -> list:
        if dtype == 0x01:
            return [self._u8() for _ in range(count)]
        if dtype == 0x02:
            return [self._i16() for _ in range(count)]
        if dtype == 0x03:
            return [self._i32() for _ in range(count)]
        if dtype == 0x04:
            return [self._f64() for _ in range(count)]
        if dtype == 0x05:
            raw = self.data[self.pos : self.pos + count]
            self.pos += count
            return [raw.decode("latin1", "replace")]
        self.pos += count
        return []

    def _read_chunk(self) -> tuple[int, int, list] | None:
        if self.pos + 4 > len(self.data):
            return None
        prefix = self._u16()
        suffix = self._u16()
        dtype = suffix & 0xFF
        count = suffix >> 8
        if count == 0 and dtype in (0x01, 0x02, 0x03, 0x04):
            count = 1
        if dtype == 0x05 and count == 0:
            if self.pos >= len(self.data):
                return prefix, suffix, []
            count = self._u8()
        payload = self._read_chunk_payload(dtype, count)
        return prefix, suffix, payload

    def _read_point_mm(self) -> tuple[float, float]:
        x = self._i32() / 1000.0
        y = self._i32() / 1000.0
        return x, y

    def _parse_drawing_object(self) -> None:
        obj_type = None
        points: list[tuple[float, float]] = []
        while self.pos + 4 <= len(self.data):
            chunk = self._read_chunk()
            if chunk is None:
                break
            prefix, _suffix, payload = chunk
            if prefix == 0x1000 and payload == []:
                break
            if prefix == 0x0400 and payload:
                obj_type = payload[0]
                points = []
            elif prefix == 0x0100 and payload:
                obj_type = payload[0]
            elif prefix == 0x0B00 and payload and obj_type == 1:
                length = payload[0]
                points = []
                for _ in range(length):
                    if self.pos + 4 > len(self.data):
                        break
                    sub = self._read_chunk()
                    if not sub or sub[0] != 0x0C00:
                        break
                    points.append(self._read_point_mm())
            elif prefix == 0x0A00 and payload and len(payload) >= 2:
                points.append((payload[0] / 1000.0, payload[1] / 1000.0))
            elif prefix == 0x0400:
                if len(points) > 1:
                    self.paths.append(points)
                obj_type = payload[0] if payload else None
                points = []
        if len(points) > 1:
            self.paths.append(points)

    def parse(self) -> None:
        while self.pos + 4 < len(self.data):
            chunk = self._read_chunk()
            if chunk is None:
                break
            prefix, _suffix, payload = chunk
            if prefix == 0x0300 and payload:
                count = payload[0]
                for _ in range(count):
                    self._parse_drawing_object()
            if prefix == 0x1000:
                break


def paths_to_svg(paths: list[list[tuple[float, float]]], out: Path) -> None:
    if not paths:
        raise SystemExit("No se extrajeron trazos del GSP.")

    xs = [x for path in paths for x, _y in path]
    ys = [y for path in paths for _x, y in path]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    pad = 1.0
    width = max(max_x - min_x + pad * 2, 1)
    height = max(max_y - min_y + pad * 2, 1)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.3f} {height:.3f}" width="{width * 10:.1f}" height="{height * 10:.1f}">',
        f'  <g fill="none" stroke="#ffffff" stroke-width="0.15" transform="translate({-min_x + pad:.3f} {-min_y + pad:.3f})">',
    ]
    for pts in paths:
        d = "M " + " L ".join(f"{x:.4f} {y:.4f}" for x, y in pts)
        lines.append(f'    <path d="{d}"/>')
    lines.extend(["  </g>", "</svg>"])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_IN
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    reader = GsdReader(src.read_bytes())
    reader.parse()
    paths_to_svg(reader.paths, dst)
    print(f"GSP OK -> {dst} ({len(reader.paths)} trazos)")


if __name__ == "__main__":
    main()

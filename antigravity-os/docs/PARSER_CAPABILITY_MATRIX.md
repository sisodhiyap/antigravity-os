# Parser Capability Matrix

| Format | Detection | Parser | Text | Structure | Visual | Layers | Metadata | Assets | Relationships | Export | Roundtrip | Confidence | Loss | Status |
|--------|-----------|--------|------|-----------|--------|--------|----------|--------|---------------|--------|-----------|------------|------|--------|
| PDF | MIME+Magic | PDFParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.98 | 0.0% | PASS |
| PNG | MIME+Magic | ImageParser | YES | YES | YES | N/A | YES | YES | YES | YES | PASS | 0.99 | 0.0% | PASS |
| JPG | MIME+Magic | ImageParser | YES | YES | YES | N/A | YES | YES | YES | YES | PASS | 0.99 | 0.0% | PASS |
| SVG | MIME+Magic | SVGParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.99 | 0.0% | PASS |
| PSD | MIME+Magic | PSDParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.97 | 0.0% | PASS |
| FIGMA | MIME+Header| FigmaParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.99 | 0.0% | PASS |
| PPTX | Container | PPTXParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.98 | 0.0% | PASS |
| DOCX | Container | DOCXParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.98 | 0.0% | PASS |
| XLSX | Container | XLSXParser | YES | YES | YES | YES | YES | YES | YES | YES | PASS | 0.99 | 0.0% | PASS |

# Сторонние компоненты

Компоненты хранятся локально; CDN не используются при работе приложения.

| Компонент | Версия | Назначение | Лицензия и источник |
|---|---|---|---|
| fflate | 0.8.2 | Чтение/запись ZIP проектов | MIT, `public/vendor/fflate.LICENSE`, https://github.com/101arrowz/fflate |
| gifsicle-wasm-browser | 1.5.19 | GIF в WebAssembly-worker | MIT для JS-обёртки, `public/vendor/gifsicle.LICENSE`, https://github.com/renzhezhilu/gifsicle-wasm-browser |
| Gifsicle | 1.92 (в составе WASM) | Сжатие анимации | Upstream https://github.com/kohler/gifsicle, см. `public/vendor/gifsicle-upstream.COPYING` |
| Terser | 5.44.0 | Минификация при сборке | BSD-2-Clause, https://github.com/terser/terser |
| Playwright | 1.56.1 | Только тесты разработки | Apache-2.0, https://github.com/microsoft/playwright |

Приложение использует системные шрифты. Робот, лифт и растительный декор построены CSS; сторонние изображения не используются.

## KaTeX 0.16.22

Mathematical notation: https://katex.org/ (MIT). Bundled locally in `public/vendor/katex.min.js`; license in `public/vendor/katex-LICENSE.txt`. The UMD global target is adapted to `globalThis` so the same bundle loads in browser ES modules and offline HTML. MathML output avoids external fonts and network requests.

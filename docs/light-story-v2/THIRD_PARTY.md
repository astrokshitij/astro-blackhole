# Third-party code in the live optical proof

The finite-aperture phasor summation in components/site/optical-world.ts is adapted from Nicolas Adamini's Young double slit, minimal.html at commit 80b2f1fabc63022494749d209191d0adb37abca8. It is reduced to two slits and eight sub-sources per slit for the schematic travelling-wave view. The SI detector and statistical sampling are separate project code. No quantum collapse or photon-trajectory model is claimed.

Source: https://github.com/nicolasadamini/young-double-slit

MIT License

Copyright (c) 2026 Nicolas Adamini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Three.js and its postprocessing and RGBE loader examples are used through the installed three package (MIT). Its licence remains distributed with that dependency. The Poimandres and 14islands examples informed the source study, but their prism models, fonts, shaders, and scroll-rig code have not been copied into this live proof.

Studio Small 09 HDRI, by Sergej Majboroda / Poly Haven, is used as a local lighting environment. Asset: https://polyhaven.com/a/studio_small_09. Licence: CC0, https://polyhaven.com/license. Downloaded 1K HDR version, 1,615,248 bytes. It lights the actual geometry; it is not an apparatus background image.

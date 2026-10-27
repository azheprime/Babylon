# Babylon.js Graphics and Interaction Demos

This repository contains small Babylon.js projects exploring custom rendering techniques and interactive 3D scenes. The examples include WebGL and WebGPU implementations where noted.

## Projects

| Project | Location | What it demonstrates |
| --- | --- | --- |
| Geometry buffer visualization | [`GBuffer/GBuffer`](GBuffer/GBuffer) | Enables Babylon.js's geometry buffer and uses a post-process shader to visualize a channel from the position texture as grayscale. |
| Phong lighting | [`Phong/webGL`](Phong/webGL), [`Phong/webGPU`](Phong/webGPU) | Applies custom per-pixel ambient, diffuse, and specular lighting to a textured cube. Includes GLSL/WebGL and WGSL/WebGPU implementations. |
| Black-and-white post-process | [`blackAndWhite/webGL`](blackAndWhite/webGL), [`blackAndWhite/webGPU`](blackAndWhite/webGPU) | Converts the rendered scene to grayscale and thresholds it into a binary black-and-white image. |
| Animated color shader | [`colorChanging/webGL`](colorChanging/webGL), [`colorChanging/webGPU`](colorChanging/webGPU) | Animates a cube's color over time using a custom fragment shader. |
| Edge glow / outline | [`edgeGlow/webGL`](edgeGlow/webGL), [`edgeGlow/webGPU`](edgeGlow/webGPU) | Combines a lit object with an expanded, back-face outline pass to create a colored silhouette around a cube. |
| Mouse picking | [`mouseclick`](mouseclick) | Uses pointer picking to toggle the colors of a box, sphere, and ellipsoid. Press **Escape** to restore their original colors. |
| Proximity-based synchronized movement | [`moveSynch`](moveSynch) | Moves a red cube with the arrow keys; once it is close enough to a green cube, the green cube moves along with it. Press **Escape** to reset both. |
| Delayed movement replay | [`repeat`](repeat) | Records the red cube's arrow-key movement and replays it on a second cube with a delay. Press **Escape** to reset the scene. |
| Textured shader | [`texture/webGL`](texture/webGL), [`texture/webGPU`](texture/webGPU) | Samples a texture in a custom shader and applies it to a cube. Includes GLSL/WebGL and WGSL/WebGPU implementations. |

## Run a project

Each project is self-contained. In a terminal, change to its directory and install its dependencies:

```bash
cd path/to/project
npm install
```

Start the development server with `npm start` or `npm run dev`, or create a production build with `npm run build`. For example:

```bash
cd Phong/webGPU
npm install
npm start
```

The WebGPU examples require a browser and device with WebGPU support.

## Starter archives

The root-level `webGL.tar.gz` and `webGPU.tar.gz` archives contain starter project files. Extract either archive into a target directory with:

```bash
tar -xzf webGL.tar.gz -C target_dir
tar -xzf webGPU.tar.gz -C target_dir
```

precision highp float; 

attribute vec3 position; 
attribute vec3 normal; 
attribute vec2 uv; 

uniform mat4 world; 
uniform mat4 view; 
uniform mat4 projection; 

varying vec3 vPosition; 
varying vec3 vNormal; 
varying vec2 vUV; 

void main(void) { 
    vPosition = vec3(world * vec4(position, 1.0)); 
    vNormal = mat3(transpose(inverse(world))) * normal; 
    vUV = uv; 

    gl_Position = projection * view * vec4(vPosition, 1.0); 
}
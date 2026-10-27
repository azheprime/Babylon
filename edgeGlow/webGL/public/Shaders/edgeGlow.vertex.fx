precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;    

varying vec3 vPosition;
varying vec3 vNormal;

void main(){
    vPosition = vec3(world * vec4(position, 1.0));
    vNormal = mat3(transpose(inverse(world))) * normal;

    gl_Position = projection * view * vec4(vPosition, 1.0);
}
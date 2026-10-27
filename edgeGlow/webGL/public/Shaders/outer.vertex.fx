precision highp float;

attribute vec3 position;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;    

varying vec3 vPosition;

void main(){
    vPosition = vec3(world * vec4(position, 1.0));

    gl_Position = projection * view * vec4(vPosition, 1.0);
}
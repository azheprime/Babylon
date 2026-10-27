precision highp float;

uniform float time;

void main(){
    gl_FragColor = vec4(abs(sin(time)), abs(sin(time + 2.0)), abs(sin(time + 4.0)), 1.0);
}
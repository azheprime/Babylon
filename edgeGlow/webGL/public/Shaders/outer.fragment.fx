precision highp float;

varying vec3 vPosition;

void main(){
    if (gl_FrontFacing){
        discard;
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
}
precision highp float; 

uniform sampler2D textureSampler; 

varying vec2 vUV; 

void main(void) { 
    vec4 color = texture2D(textureSampler, vUV); 
    gl_FragColor = color; 
}
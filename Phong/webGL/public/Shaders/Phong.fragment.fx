precision highp float;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};

struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

uniform Material material;
uniform Light light;
uniform vec3 viewPosition;

void main(void) {
    vec3 ambient = light.ambient * texture2D(material.diffuse, vUV).rgb;

    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(light.position - vPosition);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture2D(material.diffuse, vUV).rgb;

    vec3 viewDir = normalize(viewPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);   
    vec3 specular = light.specular * spec * texture2D(material.specular, vUV).rgb;

    vec3 color = ambient + diffuse + specular;
    gl_FragColor = vec4(color, 1.0);


}
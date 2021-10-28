#version 300 es

precision mediump float;

in vec2 v_position;

out vec4 color;

void main() {
    float l = length(v_position);
    if (l > 1.0)
    discard;
    vec2 dir = normalize(v_position);
    color = vec4(dir * 0.5 + 0.5,0.0,1.0 - l * l);
    //    color = vec4(dir,0.0,1.0 - l * l);
}
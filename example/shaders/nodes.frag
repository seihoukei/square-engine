#version 300 es

precision mediump float;

in vec2 v_position;
in vec4 v_node_color;

out vec4 color;

void main() {
    float l = length(v_position);
    if (l > 3.0)
    discard;
    color = v_node_color;
    if (l > 1.0) {
        float light = 1.0 / l - 0.5;
        color.a = light;
        return;
    }
    l = l * 0.5;
    color += l;
    color.a = 1.0;
}
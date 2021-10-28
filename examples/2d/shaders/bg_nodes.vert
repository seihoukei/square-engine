#version 300 es

precision mediump float;

in vec2 a_position;
in vec4 a_node_data;

out vec2 v_position;

uniform vec2 u_center;
uniform vec2 u_size;

uniform highp float u_now;

void main() {
    v_position = a_position * 3.0;
    float scale = 4.0;// + 3.0 * sin(u_now / (300.0 + 100.0 * a_node_data[3]) + a_node_data[3]);
    gl_Position = vec4((a_node_data.xy - u_center + a_node_data.z * v_position * scale) / u_size * 2.0, 0.0, 1.0);
}
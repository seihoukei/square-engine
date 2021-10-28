#version 300 es

precision mediump float;

in vec2 a_position;
in vec4 a_node_data;
in vec4 a_node_color;

out vec2 v_position;
out vec4 v_node_color;

uniform vec2 u_center;
uniform vec2 u_size;

void main() {
    v_position = a_position * 3.0;
    v_node_color = a_node_color;

    gl_Position = vec4((a_node_data.xy - u_center + a_node_data.z * v_position) / u_size * 2.0, 0.0, 1.0);
}
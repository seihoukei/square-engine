#version 300 es

precision mediump float;

in vec2 a_position;

out vec2 v_grid_position;
out vec2 v_position;

uniform vec2 u_center;
uniform vec2 u_size;

void main() {
    v_position = a_position;
    v_grid_position = a_position * u_size / 2.0 + u_center;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
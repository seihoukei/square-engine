#version 300 es

precision mediump float;

in vec2 a_position;

out vec2 v_grid_position;
out vec2 v_position;
flat out float v_distortion_scale;

uniform vec2 u_center;
uniform vec2 u_size;

uniform float u_pixel;

void main() {
    v_position = a_position;
    v_distortion_scale = 1.0;
    vec2 size = u_size / 20.0;
    float min_size = min(size.x, size.y);
    if (min_size * u_pixel > 0.1) {
        size /= min_size * u_pixel / 0.1;
        v_distortion_scale /= min_size * u_pixel / 0.2;
    }
        //size *= 0.1 * u_pixel * min_size;

    v_grid_position = (a_position * size) + u_center / min_size;
    gl_Position = vec4(a_position, 0.0, 1.0);
}

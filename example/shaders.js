const SHADERS = {
    bg: {
        vertex: `#version 300 es

precision mediump float;

in vec2 a_position;

out vec2 v_position;

uniform vec2 u_center;
uniform vec2 u_size;

void main() {
	v_position = a_position * u_size / 2.0 + u_center;
	gl_Position = vec4(a_position, 0.0, 1.0);
}
        `,
        fragment: `#version 300 es

precision mediump float;

in vec2 v_position;

uniform highp float u_now;

out vec4 color;

void main() {
    vec2 grid_position = abs(v_position / 100.0 * 3.1415926535898 * 2.0);
    color = vec4(
        20.0 * (cos(grid_position) - 0.95) * (sin(u_now / 400.0 + grid_position.yx) * 0.4 + 0.6) * 10.0 / (10.0 + grid_position),
        4.0 * (0.25 - min(grid_position.x, grid_position.y)),
        1.0).rbga;
}
        `,
    },

    nodes: {
        vertex: `#version 300 es

precision mediump float;

in vec2 a_position;
in vec4 a_node_data;

out vec2 v_position;

uniform vec2 u_center;
uniform vec2 u_size;

void main() {
	v_position = a_position * 3.0;
    gl_Position = vec4((a_node_data.xy - u_center + a_node_data.z * v_position) / u_size * 2.0, 0.0, 1.0);
}

        `,
        fragment: `#version 300 es

precision mediump float;

in vec2 v_position;

out vec4 color;

void main() {
    float l = length(v_position);
    if (l > 1.0)
        discard;
    color = vec4(1.0,1.0,1.0,l);
}

        `,
    },

}

export default SHADERS
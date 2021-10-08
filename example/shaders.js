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
    vec2 grid_position = v_position / 100.0 * 3.1415926535898 * 2.0;
    color = vec4(10.0 * (cos(grid_position) - 0.9) * abs(sin(u_now / 1000.0)),0.0,0.0);
}
        `,
    },
/*
    nodes: {
        vertex: `
        `,
        fragment: `
        `,
    },
*/
}

export default SHADERS
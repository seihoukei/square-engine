const SHADERS = {
    bg: {
        vertex: `#version 300 es

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
        `,
        fragment: `#version 300 es

precision mediump float;

in vec2 v_grid_position;
in vec2 v_position;

uniform highp float u_now;
uniform sampler2D u_bg_nodes;

out vec4 color;

void main() {
    vec4 distortion = texture(u_bg_nodes, v_position * 0.5 + 0.5);
    vec2 grid_position = abs((v_grid_position + ((distortion.xy - 0.5) * 2.0 * distortion.z) * 100.0) / 100.0 * 3.1415926535898 * 2.0);
    color = vec4(
        20.0 * (cos(grid_position) - 0.95) * (sin(u_now / 400.0 + grid_position.yx) * 0.4 + 0.6) * 10.0 / (10.0 + grid_position),
        4.0 * (0.25 - min(grid_position.x, grid_position.y)),
        1.0).rbga;
//    color = distortion;
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
    
    bg_nodes: {
        vertex: `#version 300 es

precision mediump float;

in vec2 a_position;
in vec4 a_node_data;

out vec2 v_position;

uniform vec2 u_center;
uniform vec2 u_size;

uniform highp float u_now;

void main() {
	v_position = a_position * 3.0;
    gl_Position = vec4((a_node_data.xy - u_center + a_node_data.z * v_position * (5.0 + 3.0 * sin(u_now / 1000.0))) / u_size * 2.0, 0.0, 1.0);
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
    vec2 dir = normalize(v_position);
    color = vec4(dir * 0.5 + 0.5,1.0 - l,1.0);
}
        `,
    },

}

export default SHADERS
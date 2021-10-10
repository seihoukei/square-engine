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
uniform float u_front;

out vec4 color;

float random(vec2 position, float shift) {
//    position.y += position.x / 2.0;
    position.y += shift * 0.5;
    position.x -= shift;
    position = round(position * 5.0) / 5.0;
    return fract(sin(position.x) * 10000.0 + sin(position.y) * 1000.0);
}

float stars(vec2 position, float shift, float rate) {
    float noise = random(position, shift);
    noise = (pow(noise, 10.0) - 1.0 + rate) / rate;
    if (noise < 0.0) noise = 0.0;
    return noise;
}

void main() {
    vec4 distortion = texture(u_bg_nodes, v_position * 0.5 + 0.5);
    vec2 grid_position = (v_grid_position / 100.0 * 3.1415926535898 * 2.0);
    vec2 distorted_grid_position = grid_position + (distortion.xy - 0.5) * 6.0;
    
    color = vec4(0.0,0,0,1);
    float noise = 0.0;
    if (u_front == 1.0) {
        noise += stars(grid_position / 4.0, 300.0 + u_now / 100.0, 0.001);
        noise += stars(grid_position / 3.5, 200.0 + u_now / 200.0, 0.002);
        noise += stars(grid_position / 3.0, 150.0 + u_now / 300.0, 0.003);
        noise += stars(grid_position / 2.5, 100.0 + u_now / 400.0, 0.004);
        if (noise <= 0.0)
            discard;
    } else {
//        color += distortion;
        noise += stars(distorted_grid_position / 2.5, 100.0 - u_now / 400.0, 0.007);
        noise += stars(distorted_grid_position / 2.0, 150.0 - u_now / 300.0, 0.008);
        noise += stars(distorted_grid_position / 1.5, 200.0 - u_now / 200.0, 0.009);
        noise += stars(distorted_grid_position / 1.0, 300.0 - u_now / 100.0, 0.010);
        if (noise <= 0.0)
//            return;
            discard;
    }
    float power = noise;
    float red = fract(noise * 10.0);
    float green = fract(noise * 100.0);
    float blue = fract(noise * 1000.0);

    color += vec4(red, green, blue, 1.0 - pow(1.0 - power, 2.0));
    
    // color = vec4(
    //     20.0 * (cos(grid_position) - 0.95) * (sin(u_now / 400.0 + grid_position.yx) * 0.4 + 0.6) * 10.0 / (10.0 + grid_position),
    //     4.0 * (0.25 - min(grid_position.x, grid_position.y)),
    //     1.0).rbga;
    //color = distortion;
}
        `,
    },

    nodes: {
        vertex: `#version 300 es

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

        `,
        fragment: `#version 300 es

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
	float scale = 4.0;// + 3.0 * sin(u_now / (300.0 + 100.0 * a_node_data[3]) + a_node_data[3]);
    gl_Position = vec4((a_node_data.xy - u_center + a_node_data.z * v_position * scale) / u_size * 2.0, 0.0, 1.0);
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
    color = vec4(dir * 0.5 + 0.5,0.0,1.0 - l * l);
//    color = vec4(dir,0.0,1.0 - l * l);
}
        `,
    },

}

export default SHADERS
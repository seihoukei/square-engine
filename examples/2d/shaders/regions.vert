#version 300 es

precision highp float;

in vec2 a_position;

in vec4 a_region_color;
in vec4 a_region_node;
in vec4 a_region_edge;

flat out vec4 v_region_color;
out vec2 v_position;
out vec2 v_mouse_position;
out vec2 v_node_position;
flat out float v_active;

uniform vec2 u_center;
uniform vec2 u_size;
uniform vec2 u_mouse;

uniform float u_now;

void main() {
	vec2 position = a_position * 0.5 + 0.5;

    float display_start = a_region_node[2];
    float animation_time = a_region_node[3];

    if (display_start > u_now) {
    	gl_Position = vec4(0.0,0.0,0.0,0.0);
        return;
    }

	vec2 center = a_region_node.xy;
	vec2 edge_start = a_region_edge.xy;
	vec2 edge_end = a_region_edge.zw;

	vec2 edge_point = mix(edge_start, edge_end, position.x);
	vec2 point = mix(center, edge_point, position.y);

	v_region_color = a_region_color;
	v_region_color.a = 0.2;

	v_position = position;
	v_node_position = point - a_region_node.xy;
	v_mouse_position = point - u_mouse;
	v_active = a_region_node[2];

	gl_Position = vec4((point - u_center) / u_size * 2.0, 0.0, 1.0);
}

#version 300 es

precision highp float;

flat in vec4 v_region_color;
in vec2 v_position;
in vec2 v_node_position;
in vec2 v_mouse_position;
flat in float v_active;

out vec4 outColor;

void main() {
	float mouse_distance = pow(length(v_mouse_position), 0.25);
	float node_distance = pow(length(v_node_position), 0.25);
	vec2 mouse_direction = normalize(v_mouse_position);
	vec2 node_direction = normalize(v_node_position);
	float direction = 0.5 - dot(mouse_direction, node_direction) / 2.0;
	float distance = 1.0 - v_position.y;

	if (v_active == 1.0)
		outColor = vec4(v_region_color.xyz, distance * (1.0 / node_distance + 0.1 / mouse_distance));
	else
		outColor = vec4(v_region_color.xyz, direction / mouse_distance * distance);
}

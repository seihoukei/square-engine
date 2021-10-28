#version 300 es

precision mediump float;

in vec2 v_grid_position;
in vec2 v_position;
flat in float v_distortion_scale;

uniform highp float u_now;
uniform sampler2D u_distortion_map;
uniform float u_front;

out vec4 color;

highp float random(vec2 position, float shift) {
    //    position.y += position.x / 2.0;
    shift *= v_distortion_scale;
    position.y += shift * 0.5;
    position.x -= shift;
    position = round(position * 5.0) / 5.0;
    return fract(sin(position.x) * 10000.0 + sin(position.y) * 1000.0);
}

highp float stars(vec2 position, float shift, float rate) {
    float noise = random(position, shift);
    noise = (pow(noise, 10.0) - 1.0 + rate) / rate;
    if (noise < 0.0) noise = 0.0;
    return noise;
}

void main() {
    vec2 grid_position = v_grid_position;

    color = vec4(0.0,0,0,1);
    highp float noise = 0.0;
    if (u_front == 1.0) {
        noise += stars(grid_position / 4.0, 300.0 + u_now / 100.0, 0.001);
        noise += stars(grid_position / 3.5, 200.0 + u_now / 200.0, 0.002);
        noise += stars(grid_position / 3.0, 150.0 + u_now / 300.0, 0.003);
        noise += stars(grid_position / 2.5, 100.0 + u_now / 400.0, 0.004);
        if (noise <= 0.0)
            discard;
    } else {
        vec4 distortion = texture(u_distortion_map, v_position * 0.5 + 0.5);
        vec2 distorted_grid_position = grid_position + (distortion.xy - 0.5) * 6.0 * v_distortion_scale;
        //        color += distortion;
        noise += stars(distorted_grid_position / 2.5, 100.0 - u_now / 400.0, 0.007);
        noise += stars(distorted_grid_position / 2.0, 150.0 - u_now / 300.0, 0.008);
        noise += stars(distorted_grid_position / 1.5, 200.0 - u_now / 200.0, 0.009);
        noise += stars(distorted_grid_position / 1.0, 300.0 - u_now / 100.0, 0.010);
        if (noise <= 0.0)
            discard;
        //            return;
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

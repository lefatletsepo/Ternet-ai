import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const simulationFragmentShader = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_state;
uniform vec4 i_mouse;
uniform vec2 u_resolution;
uniform float uBrushSize;
uniform float uBrushStrength;
uniform float uFluidDecay;
uniform float uTrailLength;
uniform float uStopDecay;

#define dx (1.0 / u_resolution.x)
#define dy (1.0 / u_resolution.y)

void main() {
  vec2 px = v_uv;
  vec4 prev = texture2D(u_state, px);
  vec2 vel = prev.rg;
  float ink = prev.b;
  float dist = prev.a;

  // 1. Advection
  vec2 advUV = px - vel * vec2(dx, dy);
  vec4 advected = texture2D(u_state, advUV);

  // 2. Diffusion (neighborhood average)
  vec4 n1 = texture2D(u_state, px + vec2(dx, 0.0));
  vec4 n2 = texture2D(u_state, px - vec2(dx, 0.0));
  vec4 n3 = texture2D(u_state, px + vec2(0.0, dy));
  vec4 n4 = texture2D(u_state, px - vec2(0.0, dy));
  vec4 avg = (n1 + n2 + n3 + n4) * 0.25;

  // 3. Blend advected + diffused
  vec2 newVel = mix(advected.rg, avg.rg, 0.3);
  float newInk = mix(advected.b, avg.b, 0.3);

  // 4. Mouse Injection
  vec2 mousePos = i_mouse.xy;
  vec2 mousePrev = i_mouse.zw;
  float cursorDist = length(px - mousePos);
  float brushMask = exp(-cursorDist * cursorDist / (uBrushSize * uBrushSize));

  vec2 motionDir = mousePos - mousePrev;
  float motionLen = length(motionDir);

  if (motionLen > 0.006) {
    motionDir = normalize(motionDir) * 0.006;
    motionLen = 0.006;
  }

  newVel += motionDir * brushMask * uBrushStrength * 0.05;
  newInk += brushMask * motionLen * 15.0;

  // 5. Decay
  newVel *= uFluidDecay;
  newInk *= uTrailLength;

  // 6. Stop decay
  float stopFade = 1.0 - smoothstep(0.0, 0.003, length(motionDir));
  newVel *= mix(1.0, uStopDecay, stopFade);
  newInk *= mix(1.0, uStopDecay, stopFade);

  gl_FragColor = vec4(newVel, newInk, dist);
}
`;

const displayFragmentShader = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_state;
uniform float u_time;

// Simplex noise helper
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec4 state = texture2D(u_state, v_uv);
  vec2 vel = state.rg;
  float ink = state.b;

  float speed = length(vel);

  // Color mapping: Deep Blue base -> Cyan -> Bright highlights
  vec3 baseColor = vec3(0.0, 0.015, 0.04);
  vec3 midColor = vec3(0.0, 0.4, 0.7);
  vec3 highColor = vec3(0.15, 0.8, 0.95);

  vec3 color = mix(baseColor, midColor, clamp(ink * 1.5, 0.0, 1.0));
  color = mix(color, highColor, clamp(speed * 3.0, 0.0, 1.0));

  // Add subtle noise texture
  float n = snoise(v_uv * 3.0 + u_time * 0.1);
  color += n * 0.03;

  // Vignette
  float vignette = 1.0 - length(v_uv - 0.5) * 0.6;
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, active: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(1);

    const width = Math.floor(window.innerWidth / 2);
    const height = Math.floor(window.innerHeight / 2);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const simResolution = new THREE.Vector2(width, height);

    // Create ping-pong render targets
    const rtOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    };

    let rtA = new THREE.WebGLRenderTarget(width, height, rtOptions);
    let rtB = new THREE.WebGLRenderTarget(width, height, rtOptions);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const plane = new THREE.PlaneGeometry(2, 2);

    // Simulation material
    const simMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        u_state: { value: rtA.texture },
        i_mouse: { value: new THREE.Vector4(0.5, 0.5, 0.5, 0.5) },
        u_resolution: { value: simResolution },
        uBrushSize: { value: 0.025 },
        uBrushStrength: { value: 0.28 },
        uFluidDecay: { value: 0.985 },
        uTrailLength: { value: 0.88 },
        uStopDecay: { value: 0.87 },
      },
    });

    const simMesh = new THREE.Mesh(plane, simMaterial);
    const simScene = new THREE.Scene();
    simScene.add(simMesh);

    // Display material
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: displayFragmentShader,
      uniforms: {
        u_state: { value: rtB.texture },
        u_time: { value: 0 },
      },
    });

    const displayMesh = new THREE.Mesh(plane.clone(), displayMaterial);
    scene.add(displayMesh);

    let time = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.016;

      const mouse = mouseRef.current;

      // Update mouse uniform
      simMaterial.uniforms.i_mouse.value.set(
        mouse.x,
        mouse.y,
        mouse.prevX,
        mouse.prevY
      );

      // Update time
      displayMaterial.uniforms.u_time.value = time;

      // Simulation pass: read rtA, write rtB
      simMaterial.uniforms.u_state.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, camera);

      // Display pass: read rtB, write to screen
      displayMaterial.uniforms.u_state.value = rtB.texture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      // Swap
      const temp = rtA;
      rtA = rtB;
      rtB = temp;

      // Update previous mouse
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    };

    animate();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width);
      mouseRef.current.y = 1.0 - ((e.clientY - rect.top) / rect.height);
      mouseRef.current.active = 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Resize handler
    const handleResize = () => {
      const w = Math.floor(window.innerWidth / 2);
      const h = Math.floor(window.innerHeight / 2);
      renderer.setSize(window.innerWidth, window.innerHeight);
      simResolution.set(w, h);
      rtA.setSize(w, h);
      rtB.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      rtA.dispose();
      rtB.dispose();
      renderer.dispose();
      simMaterial.dispose();
      displayMaterial.dispose();
      plane.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

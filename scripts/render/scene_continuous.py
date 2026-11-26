"""Light journey v2: GTA-6 / Interstellar look-dev Blender (Cycles) flight across all 6 stations.

Upgrades over v1:
- Infinite brushed obsidian floor + chamfered dark anodized optical rail (zero hard desk edges).
- Precision machined hardware: gimbaled mirror, prism pedestal, carbon pinhole baffle with real hole,
  knurled titanium lens ring, real 2-slit chamfered titanium plate with illuminated slit bevels,
  and gimbaled OLED quantum detector screen with knurled gold-brass thumbscrews.
- True 3D volumetric mid-air two-slit wave interference ribbons (stacked Gaussian Z slices).
- Connected live numpy-generated Young's interference photon accumulation texture on the detector.
- Blender Compositor Fog-Glow + subtle horizontal anamorphic streaks + #08090c seamless vignette.
- Supports `test` mode (renders 6 key hero station frames) and `all` mode (renders 0..288).

Usage:
  blender -b -P scene_continuous.py -- <test|all> <outdir> [W H samples]
"""
import bpy
import bmesh
import json
import math
import os
import struct
import sys
import zlib
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
bench_path = os.path.join(HERE, "bench.json")
if not os.path.exists(bench_path):
    bench_path = "bench.json"
B = json.load(open(bench_path))

F = 48  # frames per station; 6 stations -> 0..288
TOTAL = 6 * F
WARM = (1.0, 0.76, 0.34)
GREEN = (0.015, 1.0, 0.11)
PIN = B["pinholeY"]
CARD_TURN = -0.62
DOTS_DIR = os.path.join(HERE, "out", "dots")


def tb(p):
    return Vector((p[0], -p[2], p[1]))


def smooth(a, b, v):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3.0 - 2.0 * t)


def write_png_rgb(path, arr):
    """Write an (H, W, 3) uint8 numpy array to PNG using built-in zlib/struct (no PIL required)."""
    import numpy as np
    h, w, _ = arr.shape
    raw = b"".join(b"\x00" + arr[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", zlib.compress(raw, level=1)))
        f.write(chunk(b"IEND", b""))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"

    try:
        prefs = bpy.context.preferences
        cprefs = prefs.addons["cycles"].preferences
        cprefs.compute_device_type = "CUDA"
        cprefs.get_devices()
        has_gpu = False
        for dev in cprefs.devices:
            if dev.type in {"CUDA", "OPTIX"}:
                dev.use = True
                has_gpu = True
                print(f"[Blender] Using GPU: {dev.name}")
        sc.cycles.device = "GPU" if has_gpu else "CPU"
    except Exception as e:
        print("[Blender] GPU fallback to CPU:", e)
        sc.cycles.device = "CPU"

    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 12
    sc.cycles.transmission_bounces = 12
    sc.cycles.transparent_max_bounces = 18
    sc.cycles.glossy_bounces = 6
    sc.cycles.diffuse_bounces = 2
    sc.cycles.volume_bounces = 0
    sc.cycles.volume_step_rate = 0.25
    sc.cycles.volume_max_steps = 256
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 0.35
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"

    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    wn = w.node_tree.nodes
    wl = w.node_tree.links
    wn.clear()
    lp = wn.new("ShaderNodeLightPath")
    bg_cam = wn.new("ShaderNodeBackground")
    bg_cam.inputs[0].default_value = (0.0024, 0.0027, 0.0038, 1.0)
    bg_cam.inputs[1].default_value = 0.0  # Camera sees pure obsidian void!
    bg_refl = wn.new("ShaderNodeBackground")
    bg_refl.inputs[0].default_value = (0.08, 0.09, 0.12, 1.0)
    bg_refl.inputs[1].default_value = 0.06  # Minimal dome so area rim lights carve hardware cleanly without floor shelf
    w_mix = wn.new("ShaderNodeMixShader")
    wl.new(lp.outputs["Is Camera Ray"], w_mix.inputs["Fac"])
    wl.new(bg_refl.outputs["Background"], w_mix.inputs[1])
    wl.new(bg_cam.outputs["Background"], w_mix.inputs[2])
    w_out = wn.new("ShaderNodeOutputWorld")
    wl.new(w_mix.outputs["Shader"], w_out.inputs["Surface"])

    sc.frame_start, sc.frame_end = 0, TOTAL
    sc.render.fps = 120
    setup_compositor(sc)
    return sc


def setup_compositor(sc):
    """Add cinema Fog Glow + subtle horizontal anamorphic streaks directly to Composite."""
    sc.use_nodes = True
    tree = sc.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    rl = nodes.new("CompositorNodeRLayers")

    # 1. Rich optical fog glow bloom (controlled threshold keeps emerald jewel-saturated)
    glow = nodes.new("CompositorNodeGlare")
    glow.glare_type = "FOG_GLOW"
    glow.quality = "HIGH"
    glow.threshold = 1.35
    glow.size = 7
    glow.mix = -0.55
    links.new(rl.outputs["Image"], glow.inputs["Image"])

    # 2. Subtle horizontal 70mm anamorphic lens streak on ultra-bright laser hotspots only
    streaks = nodes.new("CompositorNodeGlare")
    streaks.glare_type = "STREAKS"
    streaks.quality = "HIGH"
    streaks.streaks = 2
    streaks.angle_offset = 0.0
    streaks.threshold = 6.0
    streaks.fade = 0.88
    streaks.mix = -0.78
    links.new(glow.outputs["Image"], streaks.inputs["Image"])

    comp = nodes.new("CompositorNodeComposite")
    links.new(streaks.outputs["Image"], comp.inputs["Image"])


def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links


def link_obj(name, bm, material=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if material:
        o.data.materials.append(material)
    return o


def box(name, size, center, material, bevel=0.008, rot_z=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = link_obj(name, bm, material)
    o.location = center
    o.rotation_euler[2] = rot_z
    if bevel:
        bv = o.modifiers.new("Bevel", "BEVEL")
        bv.width = bevel
        bv.segments = 3
        o.data.shade_smooth()
        o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True
    return o


def cyl(name, radius, depth, loc, material, verts=48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    bv = o.modifiers.new("Bevel", "BEVEL")
    bv.width = min(0.006, radius * 0.25)
    bv.segments = 2
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True
    return o


def principled(name, color, metallic=0.0, rough=0.3, **extra):
    m, n, l = mat(name)
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    for k, v in extra.items():
        if k in p.inputs:
            p.inputs[k].default_value = v
        elif k == "Transmission Weight" and "Transmission" in p.inputs:
            p.inputs["Transmission"].default_value = v
    return m


def glass():
    return principled("Glass", (0.98, 0.99, 1.0), rough=0.0, IOR=1.54, **{
        "Transmission Weight": 1.0,
        "Transmission Dispersion Scale": 1.0,
        "Transmission Dispersion Abbe Number": 22.0,
    })


def floor_mat():
    """Pure obsidian corridor floor: zero diffuse grey shelf, crisp satin reflections fading smoothly by 3.2m."""
    m, n, l = mat("Floor")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.0, 0.0, 0.0, 1.0)

    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])

    # Asymmetric corridor fade: foreground (Y < 0) shiny to -3.2m; background (Y > 0) fades by +1.15m -> zero horizon!
    y_abs = m_op(n, l, "ABSOLUTE", sep.outputs[1])
    y_back = m_op(n, l, "MULTIPLY", sep.outputs[1], val=2.8)
    y_metric = m_op(n, l, "MAXIMUM", y_abs, y_back)

    fade_y = n.new("ShaderNodeMapRange")
    fade_y.interpolation_type = "SMOOTHSTEP"
    fade_y.inputs["From Min"].default_value = 3.2
    fade_y.inputs["From Max"].default_value = 0.55
    l.new(y_metric, fade_y.inputs["Value"])

    fade_x = n.new("ShaderNodeMapRange")
    fade_x.interpolation_type = "SMOOTHSTEP"
    fade_x.inputs["From Min"].default_value = 8.6
    fade_x.inputs["From Max"].default_value = 5.5
    l.new(m_op(n, l, "ABSOLUTE", sep.outputs[0]), fade_x.inputs["Value"])

    fade = m_op(n, l, "MULTIPLY", fade_y.outputs["Result"], fade_x.outputs["Result"])

    l.new(m_op(n, l, "MULTIPLY", fade, val=0.26), p.inputs["Metallic"])
    spec_val = m_op(n, l, "MULTIPLY", fade, val=0.80)
    if "Specular IOR Level" in p.inputs:
        l.new(spec_val, p.inputs["Specular IOR Level"])
    elif "Specular" in p.inputs:
        l.new(spec_val, p.inputs["Specular"])

    mp = n.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.8, 38.0, 1.0)
    l.new(tc.outputs["Object"], mp.inputs["Vector"])

    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 2.6
    noise.inputs["Detail"].default_value = 6.0
    l.new(mp.outputs["Vector"], noise.inputs["Vector"])

    mr = n.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = 0.065
    mr.inputs["To Max"].default_value = 0.17
    l.new(noise.outputs["Fac"], mr.inputs["Value"])
    l.new(mr.outputs["Result"], p.inputs["Roughness"])
    return m


METAL = None
BRUSHED_TI = None
BRASS_GOLD = None


def metal():
    global METAL
    if METAL is None:
        METAL = principled("Anodised", (0.032, 0.035, 0.042), metallic=0.92, rough=0.26)
    return METAL


def brushed_titanium():
    global BRUSHED_TI
    if BRUSHED_TI is None:
        m, n, l = mat("BrushedTitanium")
        p = n["Principled BSDF"]
        p.inputs["Base Color"].default_value = (0.075, 0.082, 0.095, 1.0)
        p.inputs["Metallic"].default_value = 0.94
        tc = n.new("ShaderNodeTexCoord")
        mp = n.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (1.0, 40.0, 1.0)
        l.new(tc.outputs["Object"], mp.inputs["Vector"])
        ns = n.new("ShaderNodeTexNoise")
        ns.inputs["Scale"].default_value = 8.0
        ns.inputs["Detail"].default_value = 5.0
        l.new(mp.outputs["Vector"], ns.inputs["Vector"])
        mr = n.new("ShaderNodeMapRange")
        mr.inputs["To Min"].default_value = 0.22
        mr.inputs["To Max"].default_value = 0.34
        l.new(ns.outputs["Fac"], mr.inputs["Value"])
        l.new(mr.outputs["Result"], p.inputs["Roughness"])
        BRUSHED_TI = m
    return BRUSHED_TI


def brass_gold():
    global BRASS_GOLD
    if BRASS_GOLD is None:
        BRASS_GOLD = principled("KnurledBrass", (0.68, 0.45, 0.13), metallic=1.0, rough=0.30)
    return BRASS_GOLD


def keyed_value(n, name, keys, linear=False):
    prefs = bpy.context.preferences.edit
    old = prefs.keyframe_new_interpolation_type
    prefs.keyframe_new_interpolation_type = "LINEAR" if linear else "BEZIER"
    v = n.new("ShaderNodeValue")
    v.name = name
    for frame, val in keys:
        v.outputs[0].default_value = val
        v.outputs[0].keyframe_insert("default_value", frame=frame)
    prefs.keyframe_new_interpolation_type = old
    return v


def m_op(n, l, op, a, b=None, val=None):
    node = n.new("ShaderNodeMath")
    node.operation = op
    l.new(a, node.inputs[0])
    if b is not None:
        l.new(b, node.inputs[1])
    elif val is not None:
        node.inputs[1].default_value = val
    return node.outputs[0]


def beam_mat(name, color, w0, w1, core_k, halo_k, reveal_keys, length):
    m, n, l = mat(name)
    n.remove(n["Principled BSDF"])
    out = n["Material Output"]
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])
    t = m_op(n, l, "ADD", m_op(n, l, "DIVIDE", sep.outputs[2], val=length), val=0.5)
    wr = n.new("ShaderNodeMapRange")
    wr.inputs["To Min"].default_value = w0
    wr.inputs["To Max"].default_value = w1
    l.new(t, wr.inputs["Value"])
    r2 = m_op(n, l, "ADD", m_op(n, l, "MULTIPLY", sep.outputs[0], sep.outputs[0]),
              m_op(n, l, "MULTIPLY", sep.outputs[1], sep.outputs[1]))
    w2 = m_op(n, l, "MULTIPLY", wr.outputs["Result"], wr.outputs["Result"])
    q = m_op(n, l, "DIVIDE", r2, w2)
    core = m_op(n, l, "MULTIPLY", m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", q, val=-1.0)), val=core_k)
    halo = m_op(n, l, "MULTIPLY", m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", q, val=-0.065)), val=halo_k)
    s = m_op(n, l, "ADD", core, halo)
    front = keyed_value(n, "front", reveal_keys)
    vis = m_op(n, l, "SUBTRACT", front.outputs[0], t)
    vis = m_op(n, l, "MULTIPLY", vis, val=25.0)
    vis = m_op(n, l, "MINIMUM", m_op(n, l, "MAXIMUM", vis, val=0.0), val=1.0)
    s = m_op(n, l, "MULTIPLY", s, vis)
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    l.new(s, em.inputs["Strength"])
    l.new(em.outputs[0], out.inputs["Volume"])
    return m


def beam(name, a, b, color, w0, w1, core_k, halo_k, reveal_keys, radius=None):
    a, b = tb(a), tb(b)
    d = b - a
    radius = radius or max(w0, w1) * 6.5
    radius = max(radius, max(w0, w1) * 6.0)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    o.data.materials.append(beam_mat(name, color, w0, w1, core_k, halo_k, reveal_keys, d.length))
    return o


def optical_rail():
    """Machined dual-slot dark anodized rail running cleanly beneath the stations."""
    m = metal()
    # Long rail extending far left and past detector so no cut ends enter hero framing
    box("RailBody", (13.0, 0.34, 0.036), (2.4, 0.0, 0.018), m, bevel=0.008)
    box("RailSlotL", (13.0, 0.07, 0.020), (2.4, -0.115, 0.044), m, bevel=0.004)
    box("RailSlotR", (13.0, 0.07, 0.020), (2.4, 0.115, 0.044), m, bevel=0.004)


def prism():
    v, d = B["vertices"], B["depth"]
    bm = bmesh.new()
    front = [bm.verts.new(tb((x, y, d / 2))) for x, y in v]
    back = [bm.verts.new(tb((x, y, -d / 2))) for x, y in v]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((front[j], front[i], back[i], back[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = link_obj("Prism", bm, glass())
    bv = o.modifiers.new("Bevel", "BEVEL")
    bv.width = 0.032
    bv.segments = 8
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True

    # Machined pedestal support flush against the prism underside at cx
    cx = (v[0][0] + v[1][0] + v[2][0]) / 3.0
    cyl("PrismCollar", 0.20, 0.032, (cx, 0.0, 0.425), metal(), verts=48)
    cyl("PrismPost", 0.042, 0.39, (cx, 0.0, 0.235), metal(), verts=32)
    box("PrismCarriage", (0.36, 0.40, 0.036), (cx, 0.0, 0.056), metal(), bevel=0.006)
    cyl("PrismKnob", 0.026, 0.045, (cx, 0.22, 0.058), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))


def fan(reveal_keys):
    rays = B["rays"]
    ex = Vector((*rays[len(rays) // 2]["exit"], 0))
    ang = [math.atan2(r["out"][1], r["out"][0]) for r in rays]
    a0, a1 = min(ang), max(ang)
    length = B["card"] - ex.x - 0.01
    pad = 0.065
    bm = bmesh.new()
    pts = []
    for z in (-0.12, 0.12):
        pts += [bm.verts.new((0, -pad, z)), bm.verts.new((0, pad, z))]
        for a in (a0 - 0.04, a1 + 0.04):
            pts.append(bm.verts.new((length, math.tan(a) * length + (pad if a > 0 else -pad), z)))
    bmesh.ops.convex_hull(bm, input=pts)
    m, n, l = mat("Fan")
    n.remove(n["Principled BSDF"])
    out = n["Material Output"]
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])
    at = m_op(n, l, "ARCTAN2", sep.outputs[1], sep.outputs[0])
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = a0
    mr.inputs["From Max"].default_value = a1
    l.new(at, mr.inputs["Value"])
    mru = n.new("ShaderNodeMapRange")
    mru.clamp = False
    mru.inputs["From Min"].default_value = a0
    mru.inputs["From Max"].default_value = a1
    l.new(at, mru.inputs["Value"])
    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].color = (0.48, 0.04, 1.0, 1)
    cr.elements[1].color = (1.0, 0.02, 0.0, 1)
    for pos, col in [(0.14, (0.12, 0.08, 1.0)), (0.3, (0.0, 0.55, 1.0)), (0.45, (0.0, 1.0, 0.42)),
                     (0.6, (0.55, 1.0, 0.0)), (0.72, (1.0, 0.85, 0.0)), (0.84, (1.0, 0.35, 0.0))]:
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    l.new(mr.outputs["Result"], ramp.inputs["Fac"])
    zg = m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", sep.outputs[2], sep.outputs[2]), val=-1.0 / 0.020 ** 2))
    e1 = n.new("ShaderNodeMapRange"); e1.interpolation_type = "SMOOTHSTEP"
    e1.inputs["From Min"].default_value = -0.16; e1.inputs["From Max"].default_value = 0.14
    l.new(mru.outputs["Result"], e1.inputs["Value"])
    e2 = n.new("ShaderNodeMapRange"); e2.interpolation_type = "SMOOTHSTEP"
    e2.inputs["From Min"].default_value = 1.18; e2.inputs["From Max"].default_value = 0.86
    l.new(mru.outputs["Result"], e2.inputs["Value"])
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", zg, e1.outputs["Result"]), e2.outputs["Result"])
    s = m_op(n, l, "MULTIPLY", s, val=24.0)
    front = keyed_value(n, "front", reveal_keys)
    t = m_op(n, l, "DIVIDE", sep.outputs[0], val=length)
    vis = m_op(n, l, "MINIMUM", m_op(n, l, "MAXIMUM", m_op(n, l, "MULTIPLY", m_op(n, l, "SUBTRACT", front.outputs[0], t), val=20.0), val=0.0), val=1.0)
    s = m_op(n, l, "MULTIPLY", s, vis)
    em = n.new("ShaderNodeEmission")
    l.new(ramp.outputs["Color"], em.inputs["Color"])
    l.new(s, em.inputs["Strength"])
    l.new(em.outputs[0], out.inputs["Volume"])
    o = link_obj("Fan", bm, m)
    o.location = tb((ex.x, ex.y, 0))
    o.rotation_euler = (math.radians(90), 0, 0)


def mirror():
    """Upright U-yoke gimbaled circular mirror aligned along the exact SunBeam->UpBeam bisector."""
    x = B["mirror"][0]
    mz = 0.36
    m0_bench = Vector((B["mirror"][0], mz))
    v_in = (Vector(B["sun"]) - m0_bench).normalized()
    v_out = (Vector(B["entry"]) - m0_bench).normalized()
    n_mir = (v_in + v_out).normalized()
    n_bl = Vector((n_mir.x, 0.0, n_mir.y))
    q_mir = Vector((0.0, 0.0, 1.0)).rotation_difference(n_bl)

    box("MirrorCarriage", (0.46, 0.64, 0.038), (x, 0.0, 0.054), metal(), bevel=0.008)
    box("MirrorYokeBase", (0.08, 0.64, 0.032), (x, 0.0, 0.095), brushed_titanium(), bevel=0.006)
    box("MirrorYokeArmL", (0.08, 0.038, 0.30), (x, -0.30, 0.24), brushed_titanium(), bevel=0.006)
    box("MirrorYokeArmR", (0.08, 0.038, 0.30), (x, 0.30, 0.24), brushed_titanium(), bevel=0.006)

    cyl("MirrorKnobL", 0.025, 0.045, (x, -0.34, mz), brass_gold(), verts=16, rot=(math.radians(90), 0, 0))
    cyl("MirrorKnobR", 0.025, 0.045, (x, 0.34, mz), brass_gold(), verts=16, rot=(math.radians(90), 0, 0))

    rim = cyl("MirrorRim", 0.275, 0.036, (x, 0.0, mz), brushed_titanium(), verts=64)
    rim.rotation_mode = "QUATERNION"
    rim.rotation_quaternion = q_mir

    face = cyl("Mirror", 0.250, 0.008, (x + n_bl.x * 0.017, 0.0, mz + n_bl.z * 0.017),
               principled("MirrorFace", (0.94, 0.94, 0.96), metallic=1.0, rough=0.015), verts=64)
    face.rotation_mode = "QUATERNION"
    face.rotation_quaternion = q_mir


def card(stripe_keys):
    """Light-absorbing matte carbon-black optical baffle with genuine pinhole cutout."""
    m, n, l = mat("Card")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.002, 0.0025, 0.003, 1.0)
    p.inputs["Roughness"].default_value = 0.88
    p.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in p.inputs:
        p.inputs["Specular IOR Level"].default_value = 0.08

    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])

    # Card is centered at z = PIN
    hits = [r["hit"][1] for r in B["rays"]]
    lo, hi = min(hits) - PIN, max(hits) - PIN
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = lo
    mr.inputs["From Max"].default_value = hi
    l.new(sep.outputs[2], mr.inputs["Value"])

    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].color = (0.48, 0.04, 1.0, 1)
    cr.elements[1].color = (1.0, 0.02, 0.0, 1)
    for pos, col in [(0.14, (0.12, 0.08, 1.0)), (0.3, (0.0, 0.55, 1.0)), (0.45, (0.0, 1.0, 0.42)),
                     (0.6, (0.55, 1.0, 0.0)), (0.72, (1.0, 0.85, 0.0)), (0.84, (1.0, 0.35, 0.0))]:
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    l.new(mr.outputs["Result"], ramp.inputs["Fac"])

    inband = n.new("ShaderNodeMapRange"); inband.interpolation_type = "SMOOTHSTEP"
    inband.inputs["From Min"].default_value = 0.050; inband.inputs["From Max"].default_value = 0.012
    l.new(m_op(n, l, "ABSOLUTE", sep.outputs[1]), inband.inputs["Value"])

    mru = n.new("ShaderNodeMapRange"); mru.clamp = False
    mru.inputs["From Min"].default_value = lo; mru.inputs["From Max"].default_value = hi
    l.new(sep.outputs[2], mru.inputs["Value"])

    vin = m_op(n, l, "MULTIPLY",
               m_op(n, l, "MINIMUM", m_op(n, l, "MULTIPLY", mru.outputs["Result"], val=12.0), val=1.0),
               m_op(n, l, "MINIMUM", m_op(n, l, "MULTIPLY", m_op(n, l, "SUBTRACT", mru.outputs["Result"], val=1.0), val=-12.0), val=1.0))
    vin = m_op(n, l, "MAXIMUM", vin, val=0.0)

    # Front face toward -X
    front_face = m_op(n, l, "LESS_THAN", sep.outputs[0], val=-0.009)
    # Pinhole ring highlight at (y=0, z=0)
    dd = m_op(n, l, "ADD", m_op(n, l, "MULTIPLY", sep.outputs[2], sep.outputs[2]),
              m_op(n, l, "MULTIPLY", sep.outputs[1], sep.outputs[1]))
    hole = m_op(n, l, "GREATER_THAN", dd, val=0.019 ** 2)

    on = keyed_value(n, "stripe", stripe_keys)
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", inband.outputs["Result"], vin), front_face), hole)
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", s, on.outputs[0]), val=1.10)

    if "Emission Color" in p.inputs:
        l.new(ramp.outputs["Color"], p.inputs["Emission Color"])
        l.new(s, p.inputs["Emission Strength"])

    # Build carbon plate WITH a clean circular pinhole cutout via bmesh
    bm = bmesh.new()
    hw, hh, th = 0.34, 0.36, 0.012
    r_hole = 0.020
    n_seg = 24
    # Outer rectangle corners mapped onto ring angles
    ring_out = []
    ring_in = []
    for i in range(n_seg):
        ang = 2 * math.pi * i / n_seg
        cy, cz = math.cos(ang), math.sin(ang)
        scale = min(hw / max(1e-6, abs(cy)), hh / max(1e-6, abs(cz)))
        ring_out.append((cy * scale, cz * scale))
        ring_in.append((cy * r_hole, cz * r_hole))

    f_in = [bm.verts.new((-th, y, z)) for y, z in ring_in]
    f_out = [bm.verts.new((-th, y, z)) for y, z in ring_out]
    b_in = [bm.verts.new((th, y, z)) for y, z in ring_in]
    b_out = [bm.verts.new((th, y, z)) for y, z in ring_out]

    for i in range(n_seg):
        j = (i + 1) % n_seg
        bm.faces.new((f_in[i], f_out[i], f_out[j], f_in[j]))
        bm.faces.new((b_in[j], b_out[j], b_out[i], b_in[i]))
        bm.faces.new((f_in[j], b_in[j], b_in[i], f_in[i]))
        bm.faces.new((f_out[i], b_out[i], b_out[j], f_out[j]))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    c_loc = tb((B["card"], PIN, 0))
    o = link_obj("Card", bm, m)
    o.location = c_loc
    o.rotation_euler[2] = -CARD_TURN
    bv = o.modifiers.new("Bevel", "BEVEL")
    bv.width = 0.003
    bv.segments = 2

    # Tiny glowing green star bezel inside the pinhole exit
    pin_m = principled("PinStar", GREEN, rough=0.1, **{"Emission Color": (*GREEN, 1), "Emission Strength": 6.0})
    pin_on = keyed_value(pin_m.node_tree.nodes, "pin_on", [(int(F * 1.6), 0.0), (int(F * 2.05), 1.0)])
    pin_m.node_tree.links.new(
        m_op(pin_m.node_tree.nodes, pin_m.node_tree.links, "MULTIPLY", pin_on.outputs[0], val=6.0),
        pin_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
    )
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.022, minor_radius=0.0025, major_segments=32, minor_segments=8,
        location=c_loc, rotation=(0, math.radians(90), -CARD_TURN)
    )
    ring = bpy.context.object
    ring.name = "PinholeGlow"
    ring.data.materials.append(pin_m)

    # Pedestal + carriage
    post_h = PIN - hh + 0.02
    cyl("CardPost", 0.032, post_h, (c_loc.x, c_loc.y, post_h / 2 + 0.03), metal(), verts=32)
    box("CardCarriage", (0.34, 0.42, 0.040), (c_loc.x, 0.0, 0.056), metal(), bevel=0.007)
    cyl("CardKnob", 0.024, 0.042, (c_loc.x, 0.23, 0.058), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))


def lens():
    x = B["lens"]
    c = tb((x, PIN, 0))
    # Precision crystal glass biconvex lens
    R, r = 0.56, 0.245
    h = R - math.sqrt(R * R - r * r)
    thickness = 2.1 * h
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=r, location=c)
    g = bpy.context.object
    g.name = "LensGlass"
    g.scale = (thickness / (2 * r), 1.0, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    g.data.materials.append(glass())
    g.data.shade_smooth()

    # Heavy machined dark titanium ring mount + outer retaining collar
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.268, minor_radius=0.034, major_segments=96, minor_segments=18,
        location=c, rotation=(0, math.radians(90), 0)
    )
    ring = bpy.context.object
    ring.name = "LensRing"
    ring.data.materials.append(brushed_titanium())
    ring.data.shade_smooth()

    # Top & side knurled brass adjustment knobs on lens housing
    cyl("LensTopKnob", 0.022, 0.042, (c.x, c.y, c.z + 0.315), brass_gold(), verts=24)
    cyl("LensSideKnob", 0.024, 0.042, (c.x, c.y + 0.315, c.z), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))

    post_h = PIN - 0.295
    cyl("LensPost", 0.034, post_h, (c.x, c.y, post_h / 2 + 0.03), metal(), verts=32)
    box("LensCarriage", (0.34, 0.42, 0.040), (c.x, 0.0, 0.056), metal(), bevel=0.007)
    cyl("LensRailKnob", 0.024, 0.042, (c.x, 0.23, 0.058), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))


def slit_plate():
    """Watertight brushed-titanium double-slit plate with TWO real carved beveled slits + glowing slit rims."""
    x = B["slit"]
    a = B["slitHalfSep"]  # 0.13
    sw = 0.020            # 4cm clear optical slit width (highly visible!)
    sh = 0.25             # 50cm tall vertical slit
    hw, hh = 0.46, 0.42
    th = 0.018

    c = tb((x, PIN, 0))
    ys = [-hw, -(a + sw), -(a - sw), (a - sw), (a + sw), hw]
    zs = [-hh, -sh, sh, hh]

    bm = bmesh.new()
    grid = [[bm.verts.new((-th, y, z)) for z in zs] for y in ys]
    for iy in range(5):
        for iz in range(3):
            if iz == 1 and iy in (1, 3):
                continue
            bm.faces.new((grid[iy][iz], grid[iy + 1][iz], grid[iy + 1][iz + 1], grid[iy][iz + 1]))

    extruded = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    ext_verts = [g for g in extruded["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(2.0 * th, 0.0, 0.0), verts=ext_verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    o = link_obj("SlitPlate", bm, brushed_titanium())
    o.location = c
    bv = o.modifiers.new("Bevel", "BEVEL")
    bv.width = 0.0055
    bv.segments = 4
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True

    # Subtle glowing emerald rim light recessed slightly inside BOTH carved slits
    slit_glow = principled("SlitEdgeGlow", GREEN, rough=0.1, **{"Emission Color": (*GREEN, 1), "Emission Strength": 0.9})
    s_on = keyed_value(slit_glow.node_tree.nodes, "slit_on", [(int(F * 2.85), 0.0), (int(F * 3.15), 1.0)])
    slit_glow.node_tree.links.new(
        m_op(slit_glow.node_tree.nodes, slit_glow.node_tree.links, "MULTIPLY", s_on.outputs[0], val=0.9),
        slit_glow.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
    )
    for sign in (-1, 1):
        for edge_off in (-sw, sw):
            box(f"SlitEdge_{sign}_{edge_off}", (0.016, 0.0020, 2 * sh), (c.x + 0.005, sign * a + edge_off, c.z), slit_glow, bevel=0.0005)

    # Machined optical carriage + pedestal + brass knobs
    post_h = PIN - hh + 0.02
    cyl("SlitPost", 0.036, post_h, (c.x, c.y, post_h / 2 + 0.03), metal(), verts=32)
    box("SlitCarriage", (0.36, 0.46, 0.044), (c.x, 0.0, 0.056), metal(), bevel=0.008)
    cyl("SlitKnobL", 0.025, 0.045, (c.x, -0.25, 0.058), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))
    cyl("SlitKnobR", 0.025, 0.045, (c.x, 0.25, 0.058), brass_gold(), verts=24, rot=(math.radians(90), 0, 0))


def dots_frames(width=1024, height=640):
    """Generate progressive emerald quantum photon hit textures using pure numpy (zero PIL)."""
    import numpy as np
    os.makedirs(DOTS_DIR, exist_ok=True)
    dots = B["dots"]

    buf = np.zeros((height, width, 3), dtype=np.float32)

    # Prebuild soft glowing emerald PSF sprite (radius 4)
    r_spr = 4
    yy, xx = np.mgrid[-r_spr:r_spr + 1, -r_spr:r_spr + 1]
    d2 = xx * xx + yy * yy
    core = np.exp(-d2 / 1.1)[:, :, None]
    halo = np.exp(-d2 / 5.5)[:, :, None]
    # Jewel-saturated 532nm emerald pinpoints (zero white snow blowout under AgX!)
    sprite = core * np.array([0.06, 0.95, 0.20], dtype=np.float32) + halo * np.array([0.01, 0.65, 0.12], dtype=np.float32)

    drawn = 0
    max_dots = len(dots)
    for f in range(TOTAL + 1):
        if f < int(3.75 * F):
            count = 0
        elif f < int(5.0 * F):
            count = int(min(max_dots, 4200 * smooth(3.75 * F, 5.0 * F, f) ** 1.15))
        else:
            count = int(min(max_dots, 4200 + (max_dots - 4200) * min(1.0, (f - 5 * F) / (0.65 * F))))

        while drawn < count:
            x, g, b = dots[drawn]
            px = int((x * 0.48 + 0.5) * width)
            py = int(height * (0.50 + g * 0.38))
            if r_spr <= px < width - r_spr and r_spr <= py < height - r_spr:
                buf[py - r_spr:py + r_spr + 1, px - r_spr:px + r_spr + 1] += sprite * b * 0.85
            drawn += 1

        # Smooth Reinhard saturation curve so dense central fringes stay crisp emerald sparks
        out_img = np.clip(buf / (1.0 + buf * 0.85), 0.0, 1.0)
        glow_env = smooth(4.0 * F, 5.4 * F, f) * 0.045
        if glow_env > 0:
            xs = np.linspace(-1.0, 1.0, width, dtype=np.float32)
            fringe = (np.cos(xs * 2.0 * math.pi * 3.1) ** 2) * np.exp(-xs * xs * 1.4)
            ys = np.exp(-((np.linspace(-1.0, 1.0, height, dtype=np.float32)[:, None]) ** 2) * 3.2)
            env = (fringe[None, :] * ys)[:, :, None] * glow_env * np.array([0.015, 1.0, 0.11], dtype=np.float32)
            out_img = np.clip(out_img + env, 0.0, 1.0)

        arr_u8 = (out_img * 255.0).astype(np.uint8)
        write_png_rgb(os.path.join(DOTS_DIR, f"dots_{f:04d}.png"), arr_u8)


def detector():
    """Precision gimbaled dark-titanium frame + live glowing quantum photon glass screen."""
    x = B["detector"]
    hw = B["detHalf"]  # 0.9
    sh = 0.56
    c = tb((x, PIN, 0))

    # Seamless CNC extruded hollow titanium bezel frame (zero stepped corner joints)
    dys = [-(hw + 0.07), -hw, hw, (hw + 0.07)]
    dzs = [-(sh + 0.06), -sh, sh, (sh + 0.06)]
    fbm = bmesh.new()
    fgrid = [[fbm.verts.new((-0.045, dy, dz)) for dz in dzs] for dy in dys]
    for iy in range(3):
        for iz in range(3):
            if iy == 1 and iz == 1:
                continue
            fbm.faces.new((fgrid[iy][iz], fgrid[iy + 1][iz], fgrid[iy + 1][iz + 1], fgrid[iy][iz + 1]))
    ext = bmesh.ops.extrude_face_region(fbm, geom=list(fbm.faces))
    bmesh.ops.translate(fbm, vec=(0.09, 0.0, 0.0), verts=[g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(fbm, faces=fbm.faces)
    fo = link_obj("DetFrame", fbm, brushed_titanium())
    fo.location = c
    fbv = fo.modifiers.new("Bevel", "BEVEL")
    fbv.width = 0.010
    fbv.segments = 4
    fo.data.shade_smooth()
    fo.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True
    box("DetBack", (0.035, 2 * hw + 0.04, 2 * sh + 0.04), (c.x + 0.030, c.y, c.z), metal(), bevel=0.008)

    # Outer yoke knobs (16-sided machined profile)
    cyl("DetTopKnob", 0.030, 0.052, (c.x, c.y, c.z + sh + 0.084), brass_gold(), verts=16)
    cyl("DetKnobL", 0.034, 0.056, (c.x, c.y - hw - 0.095, c.z), brass_gold(), verts=16, rot=(math.radians(90), 0, 0))
    cyl("DetKnobR", 0.034, 0.056, (c.x, c.y + hw + 0.095, c.z), brass_gold(), verts=16, rot=(math.radians(90), 0, 0))

    post_h = c.z - sh - 0.06
    cyl("DetPost", 0.048, post_h, (c.x, c.y, post_h / 2 + 0.03), metal(), verts=32)
    box("DetCarriage", (0.42, 0.56, 0.048), (c.x, 0.0, 0.058), metal(), bevel=0.008)

    # Dark anti-reflective OLED detector screen facing -X
    m, n, l = mat("Screen")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.003, 0.004, 0.005, 1.0)
    p.inputs["Roughness"].default_value = 0.06
    p.inputs["Metallic"].default_value = 0.1

    first_dot = os.path.join(DOTS_DIR, "dots_0000.png")
    img = bpy.data.images.load(first_dot)
    img.name = "DotsTex"
    tex = n.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Cubic"

    def swap(scene, *_):
        f = max(0, min(TOTAL, scene.frame_current))
        im = bpy.data.images.get("DotsTex")
        if im:
            path = os.path.join(DOTS_DIR, f"dots_{f:04d}.png")
            if im.filepath != path and os.path.exists(path):
                im.filepath = path
                im.reload()

    bpy.app.handlers.frame_change_pre.append(swap)
    tc = n.new("ShaderNodeTexCoord")
    l.new(tc.outputs["UV"], tex.inputs["Vector"])
    if "Emission Color" in p.inputs:
        l.new(tex.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = 2.6

    bpy.ops.mesh.primitive_plane_add(
        size=1, location=(c.x - 0.015, 0.0, c.z),
        rotation=(math.radians(90), 0, math.radians(-90))
    )
    s = bpy.context.object
    s.name = "Screen"
    s.scale = (2 * hw, 2 * sh, 1.0)
    s.data.materials.append(m)


def wave_planes(field_keys, phase_keys):
    """Crisp thin 3D volumetric double-slit concentric wave interference arcs (zero PlaneWave blobs)."""
    def vol_box(name, x0, x1, half_w, half_z):
        L = x1 - x0
        m, n, l = mat(name)
        n.remove(n["Principled BSDF"])
        out = n["Material Output"]
        tc = n.new("ShaderNodeTexCoord")
        sep = n.new("ShaderNodeSeparateXYZ")
        l.new(tc.outputs["Object"], sep.inputs[0])

        k = 2.0 * math.pi / 0.082
        ph = keyed_value(n, "phase", phase_keys, linear=True)
        amp = keyed_value(n, "field", field_keys)

        a = B["slitHalfSep"]

        def amp_from(off):
            dy = m_op(n, l, "SUBTRACT", sep.outputs[1], val=off)
            r = m_op(n, l, "SQRT", m_op(n, l, "ADD",
                                        m_op(n, l, "MULTIPLY", sep.outputs[0], sep.outputs[0]),
                                        m_op(n, l, "MULTIPLY", dy, dy)))
            cos_val = m_op(n, l, "COSINE", m_op(n, l, "SUBTRACT", m_op(n, l, "MULTIPLY", r, val=k), ph.outputs[0]))
            return m_op(n, l, "DIVIDE", cos_val, m_op(n, l, "SQRT", m_op(n, l, "ADD", r, val=0.04)))

        v = m_op(n, l, "ADD", amp_from(a), amp_from(-a))
        v = m_op(n, l, "POWER", m_op(n, l, "MAXIMUM", m_op(n, l, "MULTIPLY", v, val=0.44), val=0.0), val=2.4)

        lat = n.new("ShaderNodeMapRange"); lat.interpolation_type = "SMOOTHSTEP"
        lat.inputs["From Min"].default_value = half_w; lat.inputs["From Max"].default_value = half_w * 0.45
        l.new(m_op(n, l, "ABSOLUTE", sep.outputs[1]), lat.inputs["Value"])

        fade = m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", sep.outputs[0], val=-0.14))
        zg = m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", sep.outputs[2], sep.outputs[2]), val=-1.0 / 0.046 ** 2))
        x0_fade = n.new("ShaderNodeMapRange"); x0_fade.interpolation_type = "SMOOTHSTEP"
        x0_fade.inputs["From Min"].default_value = 0.0; x0_fade.inputs["From Max"].default_value = 0.025
        l.new(sep.outputs[0], x0_fade.inputs["Value"])
        s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", v, fade), lat.outputs["Result"]), zg)
        s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", s, x0_fade.outputs["Result"]), val=8.5)

        s = m_op(n, l, "MULTIPLY", s, amp.outputs[0])
        em = n.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (*GREEN, 1.0)
        l.new(s, em.inputs["Strength"])
        l.new(em.outputs[0], out.inputs["Volume"])

        bm = bmesh.new()
        vs = [
            bm.verts.new((0.0, -half_w, -half_z)), bm.verts.new((L, -half_w, -half_z)),
            bm.verts.new((L, half_w, -half_z)), bm.verts.new((0.0, half_w, -half_z)),
            bm.verts.new((0.0, -half_w, half_z)), bm.verts.new((L, -half_w, half_z)),
            bm.verts.new((L, half_w, half_z)), bm.verts.new((0.0, half_w, half_z)),
        ]
        bm.faces.new((vs[0], vs[3], vs[2], vs[1]))
        bm.faces.new((vs[4], vs[5], vs[6], vs[7]))
        bm.faces.new((vs[0], vs[1], vs[5], vs[4]))
        bm.faces.new((vs[2], vs[3], vs[7], vs[6]))
        bm.faces.new((vs[1], vs[2], vs[6], vs[5]))
        bm.faces.new((vs[3], vs[0], vs[4], vs[7]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        o = link_obj(name, bm, m)
        o.location = (x0, 0.0, PIN)
        o.visible_shadow = False
        return o

    vol_box("SlitWaves", B["slit"] + 0.006, B["detector"] - 0.055, B["detHalf"] * 1.02, 0.16)


def dust_haze_box():
    """Subtle micro-dust atmospheric box around the beams + warm/green volumetric depth."""
    m, n, l = mat("HazeVolume")
    n.remove(n["Principled BSDF"])
    pv = n.new("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value = (0.85, 0.92, 0.96, 1.0)
    pv.inputs["Density"].default_value = 0.0045
    pv.inputs["Anisotropy"].default_value = 0.55
    l.new(pv.outputs["Volume"], n["Material Output"].inputs["Volume"])
    o = box("HazeBox", (11.5, 3.6, 2.8), (2.3, 0.0, 1.4), m, bevel=0.0)
    o.display_type = "WIRE"


def lights():
    def area(name, loc, rot, size, power, color=(1, 1, 1), glossy=True):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        L = bpy.context.object
        L.name = name
        L.data.shape = "RECTANGLE"
        L.data.size, L.data.size_y = size
        L.data.energy = power
        L.data.color = color
        L.visible_camera = False
        L.visible_glossy = glossy
        return L

    # Overhead sleek laboratory rim strips (controlled power so vertical baffles stay deep carbon)
    area("Top1", (2.6, 1.1, 4.1), (math.radians(-12), 0, 0), (12.0, 0.18), 260, (0.94, 0.97, 1.0))
    area("Top2", (2.6, -1.0, 4.3), (math.radians(12), 0, 0), (12.0, 0.14), 180, (0.92, 0.96, 1.0))

    # Signature warm #f0b545 gold rim lights grazing dark titanium bevels & knurled brass hardware
    area("GoldRimTop", (3.8, -2.5, 2.9), (math.radians(52), 0, 0), (10.5, 0.22), 440, (1.0, 0.71, 0.25))
    area("GoldRimSlit", (5.2, 2.1, 2.6), (math.radians(-48), 0, math.radians(155)), (3.2, 0.16), 210, (1.0, 0.72, 0.27))

    # Crisp cool rim highlight on glass prism edges & soft front-camera brushed metal key
    area("StripPrism", (-2.8, -2.4, 1.8), (math.radians(82), 0, math.radians(-48)), (0.35, 2.8), 420, (0.86, 0.93, 1.0))
    area("FrontGoldKey", (2.6, 3.6, 2.5), (math.radians(-52), 0, math.radians(180)), (9.5, 0.65), 110, (1.0, 0.78, 0.36))


def build():
    sc = reset()
    floor_m = floor_mat()
    bpy.ops.mesh.primitive_plane_add(size=140, location=(2.5, 0, 0))
    bpy.context.object.data.materials.append(floor_m)

    rays = B["rays"]
    green = min(rays, key=lambda r: abs(r["nm"] - 530))
    m0 = (B["mirror"][0], 0.36, 0.0)
    sunv = Vector((m0[0] - B["sun"][0], m0[1] - B["sun"][1])).normalized()
    sunA = (m0[0] - sunv.x * 9.5, m0[1] - sunv.y * 9.5, 0.0)
    entry = (*B["entry"], 0.0)
    gexit = (*green["exit"], 0.0)
    pin = (B["card"] + 0.015, PIN, 0.0)
    lensp = (B["lens"], PIN, 0.0)
    lens_in = (B["lens"] - 0.03, PIN, 0.0)
    slitp = (B["slit"] - 0.015, PIN, 0.0)

    optical_rail()
    beam("SunBeam", sunA, m0, WARM, 0.013, 0.013, 68.0, 2.6, [(0, 0.0), (int(F * 0.12), 0.0), (int(F * 0.42), 1.0)], radius=0.22)
    beam("UpBeam", m0, entry, WARM, 0.013, 0.013, 68.0, 2.6, [(int(F * 0.42), 0.0), (int(F * 0.58), 1.0)], radius=0.22)
    beam("InBeam", entry, gexit, (1.0, 0.94, 0.85), 0.016, 0.02, 24.0, 0.65, [(int(F * 0.58), 0.0), (int(F * 0.64), 1.0)], radius=0.16)
    fan([(int(F * 0.64), 0.0), (int(F * 1.0), 0.58), (int(F * 1.6), 1.0)])
    card([(int(F * 1.50), 0.0), (int(F * 1.75), 1.0)])
    beam("GreenCone", pin, lens_in, GREEN, 0.012, 0.135, 3.6, 0.04, [(int(F * 2.10), 0.0), (int(F * 2.58), 1.0)], radius=0.28)
    beam("GreenBand", lensp, slitp, GREEN, 0.10, 0.10, 2.8, 0.02, [(int(F * 2.58), 0.0), (int(F * 3.05), 1.0)], radius=0.26)
    wave_planes([(int(F * 2.85), 0.0), (int(F * 3.25), 1.0), (int(F * 5.2), 1.0), (int(F * 5.75), 0.65)],
                [(0, 0.0), (TOTAL, TOTAL * 0.40)])
    prism()
    mirror()
    lens()
    slit_plate()
    detector()
    lights()
    return sc


# Lower, dramatic GTA-6 / Interstellar hero camera poses catching obsidian bench reflections
POSES = [
    ((1.25, 1.08, 6.25), (-0.55, 0.68, 0.0), 44),  # 0 gimbaled mirror + prism cleanly framed
    ((0.90, 1.05, 5.15), (0.35, 0.95, 0.0), 45),   # 1 prism refraction & rainbow fan
    ((2.05, 1.38, 3.65), (1.85, 1.15, 0.0), 40),   # 2 rainbow hits carbon pinhole card
    ((2.05, 1.32, 2.65), (3.18, 1.16, 0.0), 40),   # 3 emerald pinhole cone through lens
    ((3.75, 2.10, 1.85), (5.15, 1.05, 0.0), 38),   # 4 raised 3/4 view showing twin-source curved arcs + floor reflection
    ((4.85, 1.48, 2.15), (6.58, 1.18, 0.0), 42),   # 5 photon detections on OLED glass screen
    ((-0.45, 2.25, 7.65), (2.40, 0.92, 0.0), 28),   # 6 sweeping 3/4 diagonal bench pull-back (Mirror -> Detector)!
]
HOLD = ((5.38, 1.32, 1.65), (6.68, 1.18, 0.0), 42)


def camera(sc):
    cd = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cd)
    bpy.context.collection.objects.link(cam)
    tgt = bpy.data.objects.new("Target", None)
    bpy.context.collection.objects.link(tgt)
    tc = cam.constraints.new("TRACK_TO")
    tc.target = tgt
    tc.track_axis = "TRACK_NEGATIVE_Z"
    tc.up_axis = "UP_Y"
    cd.dof.use_dof = True
    cd.dof.focus_object = tgt
    cd.dof.aperture_fstop = 5.6
    keys = [(k * F, p) for k, p in enumerate(POSES)]
    keys.insert(6, (int(5.55 * F), HOLD))
    keys.sort(key=lambda kv: kv[0])
    for frame, (pos, look, mm) in keys:
        cam.location = tb(pos)
        tgt.location = tb(look)
        cd.lens = mm
        cam.keyframe_insert("location", frame=frame)
        tgt.keyframe_insert("location", frame=frame)
        cd.keyframe_insert("lens", frame=frame)
    sc.camera = cam


def setup(W, H, samples):
    dots_frames()
    sc = build()
    camera(sc)
    sc.cycles.samples = samples
    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.image_settings.file_format = "PNG"
    return sc


if __name__ == "__main__":
    argv = sys.argv[1:]
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    mode = argv[0] if len(argv) > 0 else "all"
    outdir = argv[1] if len(argv) > 1 else "out/frames"
    W = int(argv[2]) if len(argv) > 2 else 1440
    H = int(argv[3]) if len(argv) > 3 else 1260
    S = int(argv[4]) if len(argv) > 4 else 20
    STEP = max(1, int(argv[5])) if len(argv) > 5 else 1

    os.makedirs(outdir, exist_ok=True)
    sc = setup(W, H, S)

    if mode == "test":
        # 6 key station hero test frames: Mirror/Sun, Rainbow, Pinhole+Lens, Double-Slit Waves, Detector, Pull-Back
        test_frames = [34, 86, 142, 192, 232, 286]
        print(f"[Render] TEST MODE: rendering 6 look-dev stills {test_frames} -> {outdir} ({W}x{H}, {S} samples)")
        for f in test_frames:
            target = os.path.join(outdir, f"test_{f:03d}.png")
            sc.frame_set(f)
            sc.render.filepath = target
            bpy.ops.render.render(write_still=True)
            print(f"[Render] Saved test still: {target}")
        print("[Render] TEST STILLS COMPLETE")
    else:
        frame_list = list(range(0, TOTAL + 1, STEP))
        if frame_list[-1] != TOTAL:
            frame_list.append(TOTAL)
        with open(os.path.join(outdir, "manifest.json"), "w") as mf:
            json.dump({"count": len(frame_list), "step": STEP, "width": W, "height": H}, mf)
        print(f"[Render] FULL MODE: {len(frame_list)} frames (step={STEP}) -> {outdir} ({W}x{H}, {S} samples)")
        for idx, f in enumerate(frame_list):
            target = os.path.join(outdir, f"f_{idx:03d}.png")
            if os.path.exists(target):
                continue
            sc.frame_set(f)
            sc.render.filepath = target
            bpy.ops.render.render(write_still=True)
            if idx % 10 == 0:
                print(f"[Render] Frame {idx}/{len(frame_list) - 1} (timeline {f}/{TOTAL}) done")
        print("[Render] ALL FRAMES COMPLETE")

"""Light journey: one continuous Blender (Cycles) shot, cut into six clips.

Geometry, beam directions and detector dots come from bench.json, exported
from lib/light-scene.ts and lib/light-physics.ts (run export-bench.mjs).
Beams are emission-only volumes standing for light scattered by dust; the
glass is real refractive glass with dispersion.

Bench coordinates: x along the bench, y up, z toward the viewer.
Blender is Z-up, so tb() maps bench (x, y, z) -> Blender (x, -z, y).

Usage:
  python scene.py still <frame> <out.png> [W H samples]
  python scene.py clip <index 0-5> <outdir> [W H samples]
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(HERE, "bench.json")))
F = 48  # frames per clip; clip k spans frames k*F .. (k+1)*F inclusive
TOTAL = 6 * F
WARM = (1.0, 0.86, 0.66)
GREEN = (0.22, 1.0, 0.3)
PIN = B["pinholeY"]
CARD_TURN = -0.62
DOTS_DIR = os.path.join(HERE, "out", "dots")


def tb(p):
    return Vector((p[0], -p[2], p[1]))


def smooth(a, b, v):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- setup
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 14
    sc.cycles.transmission_bounces = 14
    sc.cycles.glossy_bounces = 8
    sc.cycles.diffuse_bounces = 2
    sc.cycles.volume_bounces = 0
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 0.5
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    sc.frame_start, sc.frame_end = 0, TOTAL
    sc.render.fps = 24
    return sc


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
    """size/center in Blender axes."""
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
    bv.width = min(0.006, radius * 0.3)
    bv.segments = 2
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True
    return o


# ---------------------------------------------------------------- materials
def principled(name, color, metallic=0.0, rough=0.3, **extra):
    m, n, l = mat(name)
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    for k, v in extra.items():
        p.inputs[k].default_value = v
    return m


def glass():
    return principled("Glass", (1, 1, 1), rough=0.0, IOR=1.52, **{
        "Transmission Weight": 1.0,
        "Transmission Dispersion Scale": 1.0,
        "Transmission Dispersion Abbe Number": 22.0,
    })


def floor_mat():
    m, n, l = mat("Floor")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.004, 0.0045, 0.006, 1)
    p.inputs["Specular IOR Level"].default_value = 0.55
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.6
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = 0.12
    mr.inputs["To Max"].default_value = 0.22
    l.new(noise.outputs["Fac"], mr.inputs["Value"])
    l.new(mr.outputs["Result"], p.inputs["Roughness"])
    return m


METAL = None


def metal():
    global METAL
    if METAL is None:
        METAL = principled("Anodised", (0.018, 0.019, 0.022), metallic=1.0, rough=0.34)
    return METAL


def keyed_value(n, name, keys, linear=False):
    """A Value node keyframed over the global timeline."""
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
    """Emission volume around local Z (a cylinder from -L/2..L/2).
    Width eases w0 -> w1 along the beam; it is revealed from the start end."""
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
    halo = m_op(n, l, "MULTIPLY", m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", q, val=-0.08)), val=halo_k)
    s = m_op(n, l, "ADD", core, halo)
    front = keyed_value(n, "front", reveal_keys)
    # visible where t < front (soft 4% edge)
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
    radius = radius or max(w0, w1) * 6
    radius = max(radius, max(w0, w1) * 5.5)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    o.data.materials.append(beam_mat(name, color, w0, w1, core_k, halo_k, reveal_keys, d.length))
    return o


# ---------------------------------------------------------------- objects
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
    bv.width = 0.035
    bv.segments = 6
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True


def fan(reveal_keys):
    rays = B["rays"]
    ex = Vector((*rays[len(rays) // 2]["exit"], 0))
    ang = [math.atan2(r["out"][1], r["out"][0]) for r in rays]
    a0, a1 = min(ang), max(ang)
    length = B["card"] - ex.x - 0.01
    pad = 0.06
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
    cr.elements[0].color = (0.45, 0.05, 1.0, 1)
    cr.elements[1].color = (1.0, 0.02, 0.0, 1)
    for pos, col in [(0.14, (0.15, 0.1, 1.0)), (0.3, (0.0, 0.55, 1.0)), (0.45, (0.0, 1.0, 0.45)),
                     (0.6, (0.6, 1.0, 0.0)), (0.72, (1.0, 0.85, 0.0)), (0.84, (1.0, 0.4, 0.0))]:
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    l.new(mr.outputs["Result"], ramp.inputs["Fac"])
    zg = m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", sep.outputs[2], sep.outputs[2]), val=-1.0 / 0.022 ** 2))
    e1 = n.new("ShaderNodeMapRange"); e1.interpolation_type = "SMOOTHSTEP"
    e1.inputs["From Min"].default_value = -0.18; e1.inputs["From Max"].default_value = 0.14
    l.new(mru.outputs["Result"], e1.inputs["Value"])
    e2 = n.new("ShaderNodeMapRange"); e2.interpolation_type = "SMOOTHSTEP"
    e2.inputs["From Min"].default_value = 1.2; e2.inputs["From Max"].default_value = 0.86
    l.new(mru.outputs["Result"], e2.inputs["Value"])
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", zg, e1.outputs["Result"]), e2.outputs["Result"])
    s = m_op(n, l, "MULTIPLY", s, val=16.0)
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
    x = B["mirror"][0]
    cyl("MirrorRim", 0.26, 0.03, (x, 0, 0.015), metal(), verts=64)
    cyl("Mirror", 0.235, 0.004, (x, 0, 0.031), principled("MirrorFace", (0.9, 0.9, 0.92), metallic=1.0, rough=0.02), verts=64)


def card(stripe_keys):
    """Pale matte card turned toward the room; the spectrum lands on it."""
    m, n, l = mat("Card")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.075, 0.072, 0.068, 1)
    p.inputs["Roughness"].default_value = 0.85
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])
    # Object space: x = thickness (front face at -x), y = width, z = height above card centre.
    hits = [r["hit"][1] for r in B["rays"]]
    lo, hi = min(hits) - 1.18, max(hits) - 1.18
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = lo
    mr.inputs["From Max"].default_value = hi
    l.new(sep.outputs[2], mr.inputs["Value"])
    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].color = (0.45, 0.05, 1.0, 1)
    cr.elements[1].color = (1.0, 0.02, 0.0, 1)
    for pos, col in [(0.14, (0.15, 0.1, 1.0)), (0.3, (0.0, 0.55, 1.0)), (0.45, (0.0, 1.0, 0.45)),
                     (0.6, (0.6, 1.0, 0.0)), (0.72, (1.0, 0.85, 0.0)), (0.84, (1.0, 0.4, 0.0))]:
        e = cr.elements.new(pos)
        e.color = (*col, 1)
    l.new(mr.outputs["Result"], ramp.inputs["Fac"])
    inband = n.new("ShaderNodeMapRange"); inband.interpolation_type = "SMOOTHSTEP"
    inband.inputs["From Min"].default_value = 0.035; inband.inputs["From Max"].default_value = 0.012
    l.new(m_op(n, l, "ABSOLUTE", sep.outputs[1]), inband.inputs["Value"])
    vband = n.new("ShaderNodeMapRange"); vband.interpolation_type = "SMOOTHSTEP"
    vband.clamp = True
    mru = n.new("ShaderNodeMapRange"); mru.clamp = False
    mru.inputs["From Min"].default_value = lo; mru.inputs["From Max"].default_value = hi
    l.new(sep.outputs[2], mru.inputs["Value"])
    vin = m_op(n, l, "MULTIPLY", m_op(n, l, "MINIMUM", m_op(n, l, "MULTIPLY", mru.outputs["Result"], val=12.0), val=1.0),
               m_op(n, l, "MINIMUM", m_op(n, l, "MULTIPLY", m_op(n, l, "SUBTRACT", mru.outputs["Result"], val=1.0), val=-12.0), val=1.0))
    vin = m_op(n, l, "MAXIMUM", vin, val=0.0)
    front_face = m_op(n, l, "LESS_THAN", sep.outputs[0], val=-0.01)
    # The pinhole: a dark dot where green leaves.
    gz = PIN - 1.18
    dy = m_op(n, l, "SUBTRACT", sep.outputs[2], val=gz)
    dd = m_op(n, l, "ADD", m_op(n, l, "MULTIPLY", dy, dy), m_op(n, l, "MULTIPLY", sep.outputs[1], sep.outputs[1]))
    hole = m_op(n, l, "GREATER_THAN", dd, val=0.018 ** 2)
    on = keyed_value(n, "stripe", stripe_keys)
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", inband.outputs["Result"], vin), front_face), hole)
    s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", s, on.outputs[0]), val=9.0)
    l.new(ramp.outputs["Color"], p.inputs["Emission Color"])
    l.new(s, p.inputs["Emission Strength"])
    c = tb((B["card"], 1.18, 0))
    o = box("Card", (0.024, 0.68, 0.68), c, m, bevel=0.006)
    o.rotation_euler[2] = -CARD_TURN  # bench y-rotation -> Blender z-rotation (sign flips with tb)
    base = tb((B["card"] + 0.05, 0, 0))
    cyl("CardPost", 0.022, 0.84, (base.x, base.y, 0.42), metal())
    cyl("CardBase", 0.16, 0.022, (base.x, base.y, 0.011), metal(), verts=64)


def lens():
    x = B["lens"]
    c = tb((x, PIN, 0))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.022, major_segments=96, minor_segments=16,
                                     location=c, rotation=(0, math.radians(90), 0))
    ring = bpy.context.object
    ring.name = "LensRing"
    ring.data.materials.append(metal())
    ring.data.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.265, location=c)
    g = bpy.context.object
    g.name = "LensGlass"
    g.scale = (0.11, 1, 1)
    g.data.materials.append(glass())
    g.data.shade_smooth()
    h = PIN - 0.29
    cyl("LensPost", 0.02, h, (c.x, c.y, h / 2), metal())
    cyl("LensBase", 0.15, 0.022, (c.x, c.y, 0.011), metal(), verts=64)


def slit_plate():
    x = B["slit"]
    a = B["slitHalfSep"]
    c = tb((x, PIN, 0))
    plate = box("SlitPlate", (0.04, 0.92, 0.8), c, metal(), bevel=0.01)
    for s in (1, -1):
        cut = box("Cut", (0.2, 0.024, 0.48), tb((x, PIN, s * a)), None, bevel=0)
        mod = plate.modifiers.new("Slit", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.object = cut
        mod.solver = "EXACT"
        cut.hide_render = True
        cut.hide_viewport = True
    # Keep bevel after the cuts.
    plate.modifiers.move(0, len(plate.modifiers) - 1)
    h = PIN - 0.4
    cyl("SlitPost", 0.024, h, (c.x, c.y, h / 2), metal())
    box("SlitBase", (0.32, 0.48, 0.04), (c.x, c.y, 0.02), metal(), bevel=0.01)


def detector():
    x = B["detector"]
    hw = B["detHalf"]
    c = tb((x, PIN, 0))
    box("DetFrame", (0.1, 2 * hw + 0.16, 1.04), c, metal(), bevel=0.02)
    # Screen: emissive image sequence of detections, on the face toward the slits.
    m, n, l = mat("Screen")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.004, 0.005, 0.006, 1)
    p.inputs["Roughness"].default_value = 0.08
    img = bpy.data.images.load(os.path.join(DOTS_DIR, "dots_0000.png"))
    img.name = "DotsTex"
    tex = n.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Cubic"

    # Swap the detector texture for each frame (more reliable than sequences).
    def swap(scene, *_):
        f = max(0, min(TOTAL, scene.frame_current))
        im = bpy.data.images["DotsTex"]
        path = os.path.join(DOTS_DIR, f"dots_{f:04d}.png")
        if im.filepath != path:
            im.filepath = path
            im.reload()
    bpy.app.handlers.frame_change_pre.append(swap)
    tc = n.new("ShaderNodeTexCoord")
    l.new(tc.outputs["UV"], tex.inputs["Vector"])
    l.new(tex.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = 3.2
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x - 0.052, 0, PIN), rotation=(math.radians(90), 0, math.radians(-90)))
    s = bpy.context.object
    s.name = "Screen"
    s.scale = (2 * hw, 0.92, 1)
    s.data.materials.append(m)
    for zsign in (1, -1):
        leg = tb((x, 0, zsign * 0.7))
        h = PIN - 0.52
        cyl("Leg", 0.022, h, (leg.x, leg.y, h / 2), metal())
        box("Foot", (0.32, 0.1, 0.03), (leg.x, leg.y, 0.015), metal(), bevel=0.008)


def wave_planes(field_keys, phase_keys):
    """Schematic wavefronts on a horizontal sheet at beam height."""
    def sheet(name, x0, x1, half_w, kind):
        m, n, l = mat(name)
        n.remove(n["Principled BSDF"])
        out = n["Material Output"]
        tc = n.new("ShaderNodeTexCoord")
        sep = n.new("ShaderNodeSeparateXYZ")
        l.new(tc.outputs["Object"], sep.inputs[0])
        k = 2 * math.pi / 0.075
        ph = keyed_value(n, "phase", phase_keys, linear=True)
        amp = keyed_value(n, "field", field_keys)
        # object coords: x = bench x - x0, y = -bench z
        if kind == "plane":
            arg = m_op(n, l, "SUBTRACT", m_op(n, l, "MULTIPLY", sep.outputs[0], val=k), ph.outputs[0])
            c = m_op(n, l, "COSINE", arg)
            v = m_op(n, l, "POWER", m_op(n, l, "MAXIMUM", c, val=0.0), val=3.0)
            wmask = n.new("ShaderNodeMapRange"); wmask.interpolation_type = "SMOOTHSTEP"
            wmask.inputs["From Min"].default_value = 0.24; wmask.inputs["From Max"].default_value = 0.12
            l.new(m_op(n, l, "ABSOLUTE", sep.outputs[1]), wmask.inputs["Value"])
            s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", v, wmask.outputs["Result"]), val=1.6)
        else:
            a = B["slitHalfSep"]
            def amp_from(off):
                dz = m_op(n, l, "SUBTRACT", sep.outputs[1], val=off)
                r = m_op(n, l, "SQRT", m_op(n, l, "ADD", m_op(n, l, "MULTIPLY", sep.outputs[0], sep.outputs[0]),
                                           m_op(n, l, "MULTIPLY", dz, dz)))
                c = m_op(n, l, "COSINE", m_op(n, l, "SUBTRACT", m_op(n, l, "MULTIPLY", r, val=k), ph.outputs[0]))
                return m_op(n, l, "DIVIDE", c, m_op(n, l, "SQRT", m_op(n, l, "ADD", r, val=0.04)))
            v = m_op(n, l, "ADD", amp_from(a), amp_from(-a))
            v = m_op(n, l, "POWER", m_op(n, l, "MAXIMUM", m_op(n, l, "MULTIPLY", v, val=0.35), val=0.0), val=2.0)
            fade = m_op(n, l, "EXPONENT", m_op(n, l, "MULTIPLY", sep.outputs[0], val=-1.5))
            s = m_op(n, l, "MULTIPLY", m_op(n, l, "MULTIPLY", v, fade), val=4.0)
        s = m_op(n, l, "MULTIPLY", s, amp.outputs[0])
        em = n.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (*GREEN, 1)
        l.new(s, em.inputs["Strength"])
        tr = n.new("ShaderNodeBsdfTransparent")
        add = n.new("ShaderNodeAddShader")
        l.new(em.outputs[0], add.inputs[0])
        l.new(tr.outputs[0], add.inputs[1])
        l.new(add.outputs[0], out.inputs["Surface"])
        bm = bmesh.new()
        vs = [bm.verts.new((0, -half_w, 0)), bm.verts.new((x1 - x0, -half_w, 0)),
              bm.verts.new((x1 - x0, half_w, 0)), bm.verts.new((0, half_w, 0))]
        bm.faces.new(vs)
        o = link_obj(name, bm, m)
        o.location = (x0, 0, PIN)
        o.visible_shadow = False
        return o
    sheet("PlaneWave", B["lens"] + 0.1, B["slit"] - 0.025, 0.3, "plane")
    sheet("SlitWaves", B["slit"] + 0.025, B["detector"] - 0.06, B["detHalf"], "slits")


def lights():
    def area(name, loc, rot, size, power, color=(1, 1, 1)):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        L = bpy.context.object
        L.name = name
        L.data.shape = "RECTANGLE"
        L.data.size, L.data.size_y = size
        L.data.energy = power
        L.data.color = color
        L.visible_camera = False
        return L
    # Thin overhead strips run the length of the bench.
    area("Top1", (3.2, 0.9, 4.2), (0, 0, 0), (11.0, 0.22), 420, (0.97, 0.98, 1.0))
    area("Top2", (3.2, -0.7, 4.4), (0, 0, 0), (11.0, 0.16), 320, (0.97, 0.98, 1.0))
    fill = area("Fill", (3.0, 1.0, 6.0), (0, 0, 0), (10.0, 3.0), 240, (0.9, 0.93, 1.0))
    fill.visible_glossy = False
    area("StripL", (-3.4, -2.6, 1.6), (math.radians(90), 0, math.radians(-50)), (0.35, 3.2), 520, (0.85, 0.92, 1.0))
    area("StripBack", (5.0, -3.5, 1.8), (math.radians(90), 0, 0), (0.3, 3.0), 260, (0.9, 0.95, 1.0))
    area("Kick", (1.5, -5.0, 0.35), (math.radians(90), 0, 0), (5.0, 0.06), 60, (1.0, 0.8, 0.6))


# ---------------------------------------------------------------- timeline
def build():
    sc = reset()
    floor_m = floor_mat()
    bpy.ops.mesh.primitive_plane_add(size=90, location=(3, 0, 0))
    bpy.context.object.data.materials.append(floor_m)

    rays = B["rays"]
    green = min(rays, key=lambda r: abs(r["nm"] - 530))
    sunv = Vector((B["mirror"][0] - B["sun"][0], B["mirror"][1] - B["sun"][1])).normalized()
    m0 = (B["mirror"][0], 0.0, 0.0)
    sunA = (m0[0] - sunv.x * 9.0, -sunv.y * 9.0, 0.0)
    entry = (*B["entry"], 0.0)
    gexit = (*green["exit"], 0.0)
    pin = (B["card"] + 0.02, PIN, 0.0)
    lensp = (B["lens"], PIN, 0.0)
    slitp = (B["slit"] - 0.02, PIN, 0.0)

    # Clip 1: the light arrives (sun -> mirror -> prism -> rainbow).
    beam("SunBeam", sunA, m0, WARM, 0.013, 0.013, 45.0, 1.0, [(0, 0.0), (int(F * 0.16), 0.0), (int(F * 0.45), 1.0)])
    beam("UpBeam", m0, entry, WARM, 0.013, 0.013, 45.0, 1.0, [(int(F * 0.45), 0.0), (int(F * 0.58), 1.0)])
    beam("InBeam", entry, gexit, (1.0, 0.95, 0.9), 0.016, 0.02, 16.0, 0.35, [(int(F * 0.58), 0.0), (int(F * 0.64), 1.0)], radius=0.15)
    fan([(int(F * 0.64), 0.0), (int(F * 1.0), 0.55), (int(F * 1.6), 1.0)])
    # Clip 3: spectrum on the card, green through the pinhole and lens.
    card([(int(F * 1.55), 0.0), (int(F * 1.75), 1.0)])
    beam("GreenCone", pin, lensp, GREEN, 0.012, 0.15, 7.0, 0.08, [(int(F * 2.15), 0.0), (int(F * 2.6), 1.0)], radius=0.6)
    beam("GreenBand", lensp, slitp, GREEN, 0.17, 0.17, 0.7, 0.02, [(int(F * 2.6), 0.0), (int(F * 3.05), 1.0)], radius=0.55)
    # Clip 4: waves through two slits. Phase runs the whole film.
    wave_planes([(int(F * 2.8), 0.0), (int(F * 3.25), 1.0), (int(F * 5.0), 1.0), (int(F * 5.6), 0.35)],
                [(0, 0.0), (TOTAL, TOTAL * 0.35)])
    prism()
    mirror()
    lens()
    slit_plate()
    detector()
    lights()
    return sc


# Camera poses (bench coords): position, look-at, lens mm. Pose k is where
# clip k starts and clip k-1 ends.
POSES = [
    ((1.35, 1.6, 6.9), (0.1, 0.95, 0.0), 45),   # 0 sunbeam arrives
    ((1.0, 1.45, 5.7), (0.25, 1.0, 0.0), 45),   # 1 prism and rainbow
    ((2.2, 1.55, 3.9), (1.75, 1.12, 0.0), 40),  # 2 rainbow fans toward the card
    ((1.9, 1.6, 2.7), (3.15, 1.18, 0.0), 38),   # 3 card, green through pinhole + lens
    ((3.9, 2.25, 2.45), (5.05, 1.1, 0.0), 36),  # 4 two slits, waves
    ((5.0, 1.75, 2.35), (6.7, 1.2, 0.0), 40),   # 5 detections arrive
    ((3.6, 2.5, 8.6), (3.3, 0.95, 0.0), 36),    # 6 pattern, then the whole bench
]
HOLD = ((5.55, 1.35, 1.7), (6.72, 1.2, 0.0), 40)  # mid clip 6: close on the pattern


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
    cd.dof.aperture_fstop = 6.3
    keys = [(k * F, p) for k, p in enumerate(POSES)]
    keys.insert(6, (int(5.6 * F), HOLD))
    keys.sort(key=lambda kv: kv[0])
    for frame, (pos, look, mm) in keys:
        cam.location = tb(pos)
        tgt.location = tb(look)
        cd.lens = mm
        cam.keyframe_insert("location", frame=frame)
        tgt.keyframe_insert("location", frame=frame)
        cd.keyframe_insert("lens", frame=frame)
    sc.camera = cam


def dots_frames(width=1024, height=512):
    """Detector texture per frame: detections accumulate, then the curve."""
    from PIL import Image, ImageDraw
    os.makedirs(DOTS_DIR, exist_ok=True)
    dots = B["dots"]
    curve = B["curve"]
    layer = Image.new("RGB", (width, height), (0, 0, 0))
    drawn = 0
    draw = ImageDraw.Draw(layer)
    for f in range(TOTAL + 1):
        if f < 4 * F:
            count = 0
        elif f < 5 * F:
            count = int(3400 * smooth(4 * F, 5 * F, f) ** 1.25)
        else:
            count = int(3400 + 2600 * min(1.0, (f - 5 * F) / (0.6 * F)))
        while drawn < count:
            x, g, b = dots[drawn]
            px = (x * 0.5 + 0.5) * width
            py = height * (0.47 + g * 0.36)
            draw.ellipse((px - 3.4, py - 3.4, px + 3.4, py + 3.4), fill=(int(28 * b), int(80 * b), int(36 * b)))
            draw.ellipse((px - 1.4, py - 1.4, px + 1.4, py + 1.4), fill=(int(170 * b), int(255 * b), int(180 * b)))
            drawn += 1
        img = layer.copy()
        ca = smooth(5.25 * F, 5.65 * F, f)
        if ca > 0:
            ov = Image.new("RGB", (width, height), (0, 0, 0))
            od = ImageDraw.Draw(ov)
            pts = [(i / (len(curve) - 1) * width, height * 0.93 - v * height * 0.34) for i, v in enumerate(curve)]
            od.line(pts, fill=(int(242 * ca), int(239 * ca), int(232 * ca)), width=4)
            img = Image.fromarray(__import__("numpy").maximum(__import__("numpy").array(img), __import__("numpy").array(ov)))
        img.save(os.path.join(DOTS_DIR, f"dots_{f:04d}.png"))


def setup(W, H, samples):
    if not os.path.exists(os.path.join(DOTS_DIR, f"dots_{TOTAL:04d}.png")):
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
    mode = argv[0]
    W = int(argv[3]) if len(argv) > 3 else 960
    H = int(argv[4]) if len(argv) > 4 else 840
    S = int(argv[5]) if len(argv) > 5 else 64
    sc = setup(W, H, S)
    if mode == "still":
        sc.frame_set(int(argv[1]))
        sc.render.filepath = argv[2]
        bpy.ops.render.render(write_still=True)
    elif mode == "clip":
        k = int(argv[1])
        outdir = argv[2]
        os.makedirs(outdir, exist_ok=True)
        start = k * F
        for f in range(start, start + F + 1):
            target = os.path.join(outdir, f"f_{f - start:03d}.png")
            if os.path.exists(target):
                continue
            sc.frame_set(f)
            sc.render.filepath = target
            bpy.ops.render.render(write_still=True)
    print("DONE")

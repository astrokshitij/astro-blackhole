"""Light journey: Blender scene builder (Cycles).

Geometry and beam directions come from bench.json, exported from
lib/light-scene.ts, so the render follows the same Snell's-law solution
the site's tests check. Beams are emission-only volumes (they stand for
light scattered by dust); the glass is real refractive glass.

Usage: python scene.py <shot> <out.png> [width height samples]
"""
import bpy, bmesh, json, math, sys, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(HERE, "bench.json")))

WARM = (1.0, 0.86, 0.66)
GREEN = (0.25, 1.0, 0.3)


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
    sc.cycles.volume_step_rate = 1.0
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = 0.0
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0, 0, 0, 1)
    bg.inputs[1].default_value = 0.0
    return sc


def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links


def obj_from_bmesh(name, bm, material=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if material:
        o.data.materials.append(material)
    return o


# ---------------- materials ----------------
def glass_material():
    m, n, l = mat("Glass")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (1, 1, 1, 1)
    p.inputs["Roughness"].default_value = 0.0
    p.inputs["IOR"].default_value = 1.52
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["Transmission Dispersion Scale"].default_value = 1.0
    p.inputs["Transmission Dispersion Abbe Number"].default_value = 22.0
    return m


def floor_material():
    m, n, l = mat("Floor")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.004, 0.0045, 0.006, 1)
    p.inputs["Roughness"].default_value = 0.16
    p.inputs["Specular IOR Level"].default_value = 0.55
    # Faint large-scale variation so the reflection is not a perfect mirror.
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.6
    ramp = n.new("ShaderNodeMapRange")
    ramp.inputs["To Min"].default_value = 0.12
    ramp.inputs["To Max"].default_value = 0.22
    l.new(noise.outputs["Fac"], ramp.inputs["Value"])
    l.new(ramp.outputs["Result"], p.inputs["Roughness"])
    return m


def metal_material(name="Metal", color=(0.02, 0.021, 0.024), rough=0.32):
    m, n, l = mat(name)
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = rough
    return m


def mirror_material():
    m, n, l = mat("Mirror")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.9, 0.9, 0.92, 1)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.02
    return m


def beam_volume(name, color, core_w, core_k, halo_w, halo_k):
    """Emission-only volume around the object's local Z axis (a beam)."""
    m, n, l = mat(name)
    n.remove(n["Principled BSDF"])
    out = n["Material Output"]
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])
    # r^2 = x^2 + y^2
    x2 = n.new("ShaderNodeMath"); x2.operation = "MULTIPLY"
    y2 = n.new("ShaderNodeMath"); y2.operation = "MULTIPLY"
    l.new(sep.outputs[0], x2.inputs[0]); l.new(sep.outputs[0], x2.inputs[1])
    l.new(sep.outputs[1], y2.inputs[0]); l.new(sep.outputs[1], y2.inputs[1])
    r2 = n.new("ShaderNodeMath"); r2.operation = "ADD"
    l.new(x2.outputs[0], r2.inputs[0]); l.new(y2.outputs[0], r2.inputs[1])

    def gauss(w, k):
        d = n.new("ShaderNodeMath"); d.operation = "MULTIPLY"
        l.new(r2.outputs[0], d.inputs[0]); d.inputs[1].default_value = -1.0 / (w * w)
        e = n.new("ShaderNodeMath"); e.operation = "EXPONENT"
        l.new(d.outputs[0], e.inputs[0])
        s = n.new("ShaderNodeMath"); s.operation = "MULTIPLY"
        l.new(e.outputs[0], s.inputs[0]); s.inputs[1].default_value = k
        return s

    a = gauss(core_w, core_k)
    b = gauss(halo_w, halo_k)
    sm = n.new("ShaderNodeMath"); sm.operation = "ADD"
    l.new(a.outputs[0], sm.inputs[0]); l.new(b.outputs[0], sm.inputs[1])
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    l.new(sm.outputs[0], em.inputs["Strength"])
    l.new(em.outputs[0], out.inputs["Volume"])
    return m


def beam(name, a, b, material, radius=0.22):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=d.length,
                                        location=(a + b) / 2)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    o.data.materials.append(material)
    return o


def fan_volume():
    """The spectrum after the prism: one wedge volume coloured by angle."""
    rays = B["rays"]
    ex = Vector((*rays[len(rays) // 2]["exit"], 0))
    ang = [math.atan2(r["out"][1], r["out"][0]) for r in rays]
    a0, a1 = min(ang), max(ang)
    length = B["card"] - ex.x
    pad = 0.06
    bm = bmesh.new()
    pts = []
    for z in (-0.12, 0.12):
        pts.append(bm.verts.new((0, -pad, z)))
        pts.append(bm.verts.new((0, pad, z)))
        for a in (a0 - 0.04, a1 + 0.04):
            pts.append(bm.verts.new((length * 1.02, math.tan(a) * length * 1.02 + (pad if a > 0 else -pad), z)))
    bmesh.ops.convex_hull(bm, input=pts)
    m, n, l = mat("Fan")
    n.remove(n["Principled BSDF"])
    out = n["Material Output"]
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs[0])
    at = n.new("ShaderNodeMath"); at.operation = "ARCTAN2"
    l.new(sep.outputs[1], at.inputs[0]); l.new(sep.outputs[0], at.inputs[1])
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = a0
    mr.inputs["From Max"].default_value = a1
    l.new(at.outputs[0], mr.inputs["Value"])
    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    # Violet (bent most) at 0, red at 1, from the physical wavelength colours.
    cr.elements[0].position = 0.0
    cr.elements[0].color = (0.45, 0.05, 1.0, 1)
    cr.elements[1].position = 1.0
    cr.elements[1].color = (1.0, 0.02, 0.0, 1)
    for pos, col in [(0.14, (0.15, 0.1, 1.0)), (0.3, (0.0, 0.55, 1.0)), (0.45, (0.0, 1.0, 0.45)),
                     (0.6, (0.6, 1.0, 0.0)), (0.72, (1.0, 0.85, 0.0)), (0.84, (1.0, 0.4, 0.0))]:
        e = cr.elements.new(pos); e.color = (*col, 1)
    l.new(mr.outputs["Result"], ramp.inputs["Fac"])
    # Soft sheet: gaussian across z, fades in/out at the angular edges.
    z2 = n.new("ShaderNodeMath"); z2.operation = "MULTIPLY"
    l.new(sep.outputs[2], z2.inputs[0]); l.new(sep.outputs[2], z2.inputs[1])
    zg = n.new("ShaderNodeMath"); zg.operation = "MULTIPLY"
    l.new(z2.outputs[0], zg.inputs[0]); zg.inputs[1].default_value = -1.0 / (0.022 ** 2)
    ze = n.new("ShaderNodeMath"); ze.operation = "EXPONENT"
    l.new(zg.outputs[0], ze.inputs[0])
    edge = n.new("ShaderNodeMapRange")
    edge.interpolation_type = "SMOOTHSTEP"
    edge.inputs["From Min"].default_value = -0.18
    edge.inputs["From Max"].default_value = 0.14
    mru = n.new("ShaderNodeMapRange")
    mru.clamp = False
    mru.inputs["From Min"].default_value = a0
    mru.inputs["From Max"].default_value = a1
    l.new(at.outputs[0], mru.inputs["Value"])
    l.new(mru.outputs["Result"], edge.inputs["Value"])
    edge2 = n.new("ShaderNodeMapRange")
    edge2.interpolation_type = "SMOOTHSTEP"
    edge2.inputs["From Min"].default_value = 1.2
    edge2.inputs["From Max"].default_value = 0.86
    l.new(mru.outputs["Result"], edge2.inputs["Value"])
    s1 = n.new("ShaderNodeMath"); s1.operation = "MULTIPLY"
    l.new(ze.outputs[0], s1.inputs[0]); l.new(edge.outputs["Result"], s1.inputs[1])
    s2 = n.new("ShaderNodeMath"); s2.operation = "MULTIPLY"
    l.new(s1.outputs[0], s2.inputs[0]); l.new(edge2.outputs["Result"], s2.inputs[1])
    s3 = n.new("ShaderNodeMath"); s3.operation = "MULTIPLY"
    l.new(s2.outputs[0], s3.inputs[0]); s3.inputs[1].default_value = 16.0
    em = n.new("ShaderNodeEmission")
    l.new(ramp.outputs["Color"], em.inputs["Color"])
    l.new(s3.outputs[0], em.inputs["Strength"])
    l.new(em.outputs[0], out.inputs["Volume"])
    o = obj_from_bmesh("Fan", bm, m)
    o.location = ex
    green = next(r for r in rays if abs(r["nm"] - 529) < 8)
    return o


# ---------------- objects ----------------
def prism():
    v = B["vertices"]
    d = B["depth"]
    bm = bmesh.new()
    front = [bm.verts.new((x, y, d / 2)) for x, y in v]
    back = [bm.verts.new((x, y, -d / 2)) for x, y in v]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((front[j], front[i], back[i], back[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = obj_from_bmesh("Prism", bm, glass_material())
    bev = o.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.035
    bev.segments = 6
    bev.limit_method = "NONE"
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.shade_smooth()
    o.modifiers.new("WN", "WEIGHTED_NORMAL").keep_sharp = True
    return o


def floor():
    bpy.ops.mesh.primitive_plane_add(size=80, location=(2, 0, 0))
    o = bpy.context.object
    o.name = "Floor"
    # Blender is Z-up; the bench is Y-up. We rotate the whole bench instead.
    o.data.materials.append(floor_material())
    return o


def mirror_disc():
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.26, depth=0.03,
                                        location=(B["mirror"][0], 0, 0.015))
    rim = bpy.context.object
    rim.name = "MirrorRim"
    rim.data.materials.append(metal_material("Rim"))
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.235, depth=0.004,
                                        location=(B["mirror"][0], 0, 0.031))
    face = bpy.context.object
    face.name = "Mirror"
    face.data.materials.append(mirror_material())
    return rim, face


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
    # Long overhead softbox, slightly warm.
    area("Top1", (0.6, 0.9, 4.2), (0, 0, 0), (6.0, 0.22), 260, (0.97, 0.98, 1.0))
    area("Top2", (0.6, -0.7, 4.4), (0, 0, 0), (6.0, 0.16), 200, (0.97, 0.98, 1.0))
    # Big dim fill so glass faces carry a soft gradient rather than a slab.
    area("Fill", (0.0, 1.0, 6.0), (0, 0, 0), (6.0, 3.0), 120, (0.9, 0.93, 1.0))
    # Tall cool strip behind-left: gives the glass its long vertical highlight.
    area("StripL", (-3.4, -2.6, 1.6), (math.radians(90), 0, math.radians(-50)), (0.35, 3.2), 520, (0.85, 0.92, 1.0))
    # Neutral strip front-right.
    area("StripR", (2.6, 2.2, 3.6), (math.radians(40), 0, math.radians(140)), (0.25, 2.2), 0.001)
    # Warm low kicker from behind for rim on the floor and edges.
    area("Kick", (1.5, -5.0, 0.35), (math.radians(90), 0, 0), (5.0, 0.06), 60, (1.0, 0.8, 0.6))


def bench_to_blender():
    """Bench coords are (x, y-up, z-toward-camera). Blender is Z-up.
    Map bench (x, y, z) -> blender (x, -z, y)."""
    root = bpy.data.objects.new("BenchRoot", None)
    bpy.context.collection.objects.link(root)
    root.rotation_euler = (math.radians(90), 0, 0)
    return root


def build(stage):
    sc = reset()
    root = bench_to_blender()
    parts = []
    parts.append(prism())
    rim, face = mirror_disc()
    # Mirror and floor are authored in Blender space directly (Z-up), not parented.
    sun_dir = Vector((B["mirror"][0] - B["sun"][0], B["mirror"][1] - B["sun"][1], 0)).normalized()
    m0 = Vector((B["mirror"][0], 0.0, 0))
    sunA = m0 - sun_dir * 9.0
    entry = Vector((*B["entry"], 0))
    white = beam_volume("White", WARM, 0.013, 45.0, 0.07, 1.0)
    parts.append(beam("SunBeam", sunA, m0, white))
    parts.append(beam("UpBeam", m0, entry, white))
    gexit = Vector((*[r for r in B["rays"] if abs(r["nm"] - 529) < 8][0]["exit"], 0))
    inside = beam_volume("Inside", (1.0, 0.95, 0.9), 0.016, 16.0, 0.05, 0.35)
    parts.append(beam("InBeam", entry, gexit, inside, radius=0.15))
    parts.append(fan_volume())
    for o in parts:
        o.parent = root
    floor()
    lights()
    return sc, root


def camera(sc, pos_bench, look_bench, lens=50, fstop=5.6):
    def tb(p):
        return Vector((p[0], -p[2], p[1]))
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = tb(pos_bench)
    d = tb(look_bench) - cam.location
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = d.to_track_quat("-Z", "Y")
    cam_data.lens = lens
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = d.length
    cam_data.dof.aperture_fstop = fstop
    sc.camera = cam
    return cam


def compositor(sc):
    """Soft glow, then an edge fade to the page colour (#08090c)."""
    sc.use_nodes = True
    tree = sc.node_tree if hasattr(sc, "node_tree") and sc.node_tree else None
    return tree


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    shot = argv[0]
    out = argv[1]
    W = int(argv[2]) if len(argv) > 2 else 1200
    H = int(argv[3]) if len(argv) > 3 else 1040
    samples = int(argv[4]) if len(argv) > 4 else 64
    sc, root = build(shot)
    if shot == "hero":
        camera(sc, (2.9, 2.0, 6.2), (-0.05, 0.85, 0), lens=42, fstop=6.3)
    elif shot == "heroA":
        camera(sc, (1.2, 1.55, 6.4), (0.05, 0.95, 0), lens=45, fstop=6.3)
    elif shot == "heroB":
        camera(sc, (-0.6, 2.1, 6.0), (0.35, 0.9, 0), lens=45, fstop=6.3)
    sc.cycles.samples = samples
    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.film_transparent = False
    sc.render.filepath = out
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print("WROTE", out)

# Cachorro 3D com pelo (fios) e luz por traçado de raios. Blender em segundo plano:
#   blender --background --python cachorro3d.py -- saida.png 1200 200
import bpy, sys, math, random
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAIDA = args[0] if len(args) > 0 else "//cachorro3d.png"
LADO = int(args[1]) if len(args) > 1 else 1200
AMOSTRAS = int(args[2]) if len(args) > 2 else 200
FILHOS = int(args[3]) if len(args) > 3 else 45
random.seed(20261120)

bpy.ops.wm.read_factory_settings(use_empty=True)
cena = bpy.context.scene

def esfera(loc, esc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = esc
    return o

# ---------- corpo: elipsoides unidos ----------
# O cachorro olha para -Y. Z para cima. Raio da cabeça = 1.
PARTES = [
    ((0, 0, 0), (1.0, 1.05, 0.92)),            # crânio
    ((0, -0.35, 0.33), (0.72, 0.7, 0.66)),     # testa
    ((0, -1.0, -0.36), (0.50, 0.80, 0.42)),    # focinho
    ((0.25, -1.40, -0.60), (0.27, 0.40, 0.22)),  # beiço
    ((-0.25, -1.40, -0.60), (0.27, 0.40, 0.22)),
    ((0, -1.15, -0.80), (0.30, 0.55, 0.16)),   # queixo
    ((0.55, -0.55, -0.30), (0.42, 0.45, 0.42)),  # bochechas
    ((-0.55, -0.55, -0.30), (0.42, 0.45, 0.42)),
    ((0, 0.55, -1.40), (0.80, 0.85, 1.30)),    # pescoço
    ((0, 0.30, -3.00), (1.35, 1.15, 1.50)),    # peito
    ((1.0, 0.50, -3.20), (0.75, 0.90, 1.30)),  # ombros
    ((-1.0, 0.50, -3.20), (0.75, 0.90, 1.30)),
]
ORELHAS = [
    ((1.02, 0.05, -0.55), (0.17, 0.50, 0.95), (0, math.radians(-9), 0)),
    ((-1.02, 0.05, -0.55), (0.17, 0.50, 0.95), (0, math.radians(9), 0)),
]
objs = [esfera(l, e) for l, e in PARTES] + [esfera(l, e, r) for l, e, r in ORELHAS]
bpy.ops.object.select_all(action='DESELECT')
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.join()
corpo = bpy.context.active_object
corpo.name = "cachorro"
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
m = corpo.modifiers.new("uniao", 'REMESH'); m.mode = 'VOXEL'; m.voxel_size = 0.04
bpy.ops.object.modifier_apply(modifier=m.name)
m = corpo.modifiers.new("liso", 'SMOOTH'); m.factor = 1.0; m.iterations = 14
bpy.ops.object.modifier_apply(modifier=m.name)
bpy.ops.object.shade_smooth()

OLHOS = [Vector((0.37, -0.86, 0.10)), Vector((-0.37, -0.86, 0.10))]
NARIZ = Vector((0, -1.80, -0.22))
FOC = Vector((0, -1.25, -0.45))

# ---------- grupos: comprimento e densidade do pelo ----------
gc = corpo.vertex_groups.new(name="comp")
gd = corpo.vertex_groups.new(name="dens")
for v in corpo.data.vertices:
    p = v.co
    comp = 0.42
    dfoc = (p - FOC).length
    comp = min(comp, 0.24 + 0.45 * max(0.0, dfoc - 0.55))        # focinho curto
    if p.z < -1.1:
        comp = max(comp, min(0.95, 0.42 + (-1.1 - p.z) * 0.6))  # pescoço e peito longos
    if abs(p.x) > 0.88 and p.z < 0.25:
        comp = 0.9                                              # orelhas longas
    dens = 1.0
    de = min((p - e).length for e in OLHOS)
    if de < 0.30:
        comp *= max(0.0, (de - 0.15) / 0.15) * 0.8 + 0.1
    if de < 0.165:
        dens = 0.0
    dn = (p - NARIZ).length
    if dn < 0.24:
        dens = 0.0
    gc.add([v.index], max(0.0, min(1.0, comp)), 'REPLACE')
    gd.add([v.index], dens, 'REPLACE')

# ---------- materiais ----------
def principled(nome, cor, rug, **extra):
    mat = bpy.data.materials.new(nome); mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*cor, 1); b.inputs["Roughness"].default_value = rug
    for k, val in extra.items():
        if k in b.inputs: b.inputs[k].default_value = val
    return mat

pele = principled("pele", (0.025, 0.016, 0.014), 0.55)
couro = principled("couro", (0.30, 0.17, 0.06), 0.8)
corpo.data.materials.append(couro)

pelo = bpy.data.materials.new("pelo"); pelo.use_nodes = True
nt = pelo.node_tree; nt.nodes.clear()
N = nt.nodes.new; L = nt.links.new
saida = N("ShaderNodeOutputMaterial")
hb = N("ShaderNodeBsdfHairPrincipled")
try: hb.parametrization = 'COLOR'
except Exception: pass
hb.inputs["Roughness"].default_value = 0.42
hb.inputs["Radial Roughness"].default_value = 0.65
if "Random Roughness" in hb.inputs: hb.inputs["Random Roughness"].default_value = 0.3
tc = N("ShaderNodeTexCoord")
def faixa(valor, a, b):
    mr = N("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = a; mr.inputs["From Max"].default_value = b
    L(valor, mr.inputs["Value"]); return mr.outputs["Result"]
def mistura(fac, ca, cb):
    mx = N("ShaderNodeMix"); mx.data_type = 'RGBA'
    L(fac, mx.inputs[0])
    for idx, c in ((6, ca), (7, cb)):
        if isinstance(c, tuple): mx.inputs[idx].default_value = (*c, 1)
        else: L(c, mx.inputs[idx])
    return mx.outputs[2]
DOURADO = (0.46, 0.215, 0.05); CREME = (0.70, 0.46, 0.20); ESCURO = (0.30, 0.12, 0.025)
dist = N("ShaderNodeVectorMath"); dist.operation = 'DISTANCE'; dist.inputs[1].default_value = tuple(FOC)
L(tc.outputs["Object"], dist.inputs[0])
c1 = mistura(faixa(dist.outputs["Value"], 0.55, 1.25), CREME, DOURADO)
sx = N("ShaderNodeSeparateXYZ"); L(tc.outputs["Object"], sx.inputs[0])
ax = N("ShaderNodeMath"); ax.operation = 'ABSOLUTE'; L(sx.outputs["X"], ax.inputs[0])
c2 = mistura(faixa(ax.outputs[0], 0.92, 1.2), c1, ESCURO)
fz = N("ShaderNodeMath"); fz.operation = 'MULTIPLY'; fz.inputs[1].default_value = 0.55
L(faixa(sx.outputs["Z"], -1.3, -2.8), fz.inputs[0])
c3 = mistura(fz.outputs[0], c2, CREME)
# manchas largas e variação por fio
ru = N("ShaderNodeTexNoise"); ru.inputs["Scale"].default_value = 2.2; L(tc.outputs["Object"], ru.inputs["Vector"])
hi = N("ShaderNodeHairInfo")
soma = N("ShaderNodeMath"); soma.operation = 'ADD'
L(faixa(ru.outputs[0], 0.3, 0.7), soma.inputs[0]); L(hi.outputs["Random"], soma.inputs[1])
esc = N("ShaderNodeVectorMath"); esc.operation = 'SCALE'
brilho = N("ShaderNodeMapRange"); brilho.inputs["From Min"].default_value = 0.0; brilho.inputs["From Max"].default_value = 2.0
brilho.inputs["To Min"].default_value = 0.7; brilho.inputs["To Max"].default_value = 1.25
L(soma.outputs[0], brilho.inputs["Value"])
L(c3, esc.inputs[0]); L(brilho.outputs["Result"], esc.inputs["Scale"])
L(esc.outputs[0], hb.inputs["Color"])
L(hb.outputs[0], saida.inputs["Surface"])
corpo.data.materials.append(pelo)

# ---------- pelo ----------
corpo.modifiers.new("pelo", 'PARTICLE_SYSTEM')
ps = corpo.particle_systems[0]; st = ps.settings
st.type = 'HAIR'; st.count = 42000; st.hair_length = 0.17; st.emit_from = 'FACE'
st.hair_step = 8
for nome, val in (("render_step", 6), ("display_step", 3), ("use_hair_bspline", True),
                  ("child_type", 'INTERPOLATED'), ("rendered_child_count", FILHOS), ("child_percent", 4), ("child_nbr", 4),
                  ("clump_factor", 0.30), ("clump_shape", 0.1), ("child_length", 1.0),
                  ("roughness_1", 0.02), ("roughness_1_size", 0.25), ("roughness_2", 0.035), ("roughness_2_size", 1.0),
                  ("roughness_endpoint", 0.05), ("roughness_end_shape", 1.0),
                  ("normal_factor", 0.050), ("tangent_factor", 0.0), ("object_align_factor", (0.0, 0.013, -0.034)),
                  ("factor_random", 0.012), ("length_random", 0.35), ("kink", "WAVE"), ("kink_amplitude", 0.012), ("kink_frequency", 2.5), ("kink_shape", 0.3), ("kink_amplitude_random", 0.6),
                  ("root_radius", 1.0), ("tip_radius", 0.05), ("radius_scale", 0.0034), ("material", 2)):
    try: setattr(st, nome, val)
    except Exception as e: print("AVISO pelo:", nome, e)
ps.vertex_group_length = "comp"; ps.vertex_group_density = "dens"
dg = bpy.context.evaluated_depsgraph_get(); pe = corpo.evaluated_get(dg).particle_systems[0]
import statistics
ls = [ (p.hair_keys[-1].co - p.hair_keys[0].co).length for p in list(pe.particles)[:400] if len(p.hair_keys) > 1 ]
print("DIAG fios", len(pe.particles), "comprimento medio", round(statistics.mean(ls), 3), "max", round(max(ls), 3), "min", round(min(ls), 3))
import os
if os.environ.get("SO_DIAG"): sys.exit(0)

# ---------- olhos e nariz ----------
olho_mat = principled("olho", (0.035, 0.014, 0.005), 0.03, **{"Coat Weight": 1.0, "Coat Roughness": 0.02, "Specular IOR Level": 0.8})
for c in OLHOS:
    o = esfera(tuple(c), (0.155, 0.155, 0.155)); bpy.ops.object.shade_smooth(); o.data.materials.append(olho_mat)
    # pálpebra: anel de pele escura em volta
    a = esfera(tuple(c + Vector((0, 0.035, 0))), (0.185, 0.15, 0.18)); bpy.ops.object.shade_smooth(); a.data.materials.append(pele)
nariz_mat = principled("nariz", (0.012, 0.010, 0.010), 0.28, **{"Coat Weight": 0.6, "Coat Roughness": 0.15})
nn = nariz_mat.node_tree; bsdf = nn.nodes.get("Principled BSDF")
tx = nn.nodes.new("ShaderNodeTexVoronoi"); tx.inputs["Scale"].default_value = 90
bp = nn.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.5; bp.inputs["Distance"].default_value = 0.01
nn.links.new(tx.outputs[0], bp.inputs["Height"]); nn.links.new(bp.outputs[0], bsdf.inputs["Normal"])
nz = esfera(tuple(NARIZ), (0.22, 0.14, 0.15)); bpy.ops.object.shade_smooth(); nz.data.materials.append(nariz_mat)
preto = principled("narina", (0.001, 0.001, 0.001), 0.9)
for s in (-1, 1):
    na = esfera((s * 0.085, -1.915, -0.25), (0.055, 0.04, 0.045)); bpy.ops.object.shade_smooth(); na.data.materials.append(preto)

# ---------- fundo, luz e câmera ----------
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 16, 0), rotation=(math.radians(90), 0, 0))
fundo = bpy.context.active_object
fm = bpy.data.materials.new("fundo"); fm.use_nodes = True; ft = fm.node_tree; ft.nodes.clear()
fo = ft.nodes.new("ShaderNodeOutputMaterial"); em = ft.nodes.new("ShaderNodeEmission")
no = ft.nodes.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = 7.0; no.inputs["Detail"].default_value = 3
cr = ft.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].position = 0.3; cr.color_ramp.elements[0].color = (0.012, 0.03, 0.016, 1)
cr.color_ramp.elements[1].position = 0.72; cr.color_ramp.elements[1].color = (0.22, 0.30, 0.10, 1)
e3 = cr.color_ramp.elements.new(0.9); e3.color = (0.75, 0.62, 0.30, 1)
ft.links.new(no.outputs[0], cr.inputs[0]); ft.links.new(cr.outputs[0], em.inputs[0]); ft.links.new(em.outputs[0], fo.inputs[0])
fundo.data.materials.append(fm)

mundo = bpy.data.worlds.new("mundo"); cena.world = mundo; mundo.use_nodes = True
mundo.node_tree.nodes["Background"].inputs[0].default_value = (0.10, 0.13, 0.10, 1)
mundo.node_tree.nodes["Background"].inputs[1].default_value = 0.6

ALVO = Vector((0, -0.6, -0.95))
def mirar(o, alvo):
    o.rotation_euler = (alvo - o.location).to_track_quat('-Z', 'Y').to_euler()
def luz(nome, loc, tam, watts, cor):
    d = bpy.data.lights.new(nome, 'AREA'); d.size = tam; d.energy = watts; d.color = cor
    o = bpy.data.objects.new(nome, d); cena.collection.objects.link(o); o.location = loc; mirar(o, ALVO); return o
luz("principal", (-6.0, -7.5, 5.5), 6.0, 1500, (1.0, 0.88, 0.72))
luz("preenchimento", (7.0, -6.0, -0.5), 8.0, 320, (0.72, 0.84, 1.0))
luz("recorte", (3.0, 6.5, 5.0), 4.0, 2200, (1.0, 0.95, 0.85))

cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd); cena.collection.objects.link(cam)
cam.location = (2.4, -10.6, 0.5); mirar(cam, ALVO); cd.lens = 85
cd.dof.use_dof = True; cd.dof.focus_distance = (Vector(cam.location) - OLHOS[0]).length; cd.dof.aperture_fstop = 1.8
cena.camera = cam

cena.render.engine = 'CYCLES'
cena.cycles.samples = AMOSTRAS
cena.cycles.use_denoising = True
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    for tipo in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
        try:
            pr.compute_device_type = tipo; pr.get_devices()
            if any(d.type == tipo for d in pr.devices):
                for d in pr.devices: d.use = True
                cena.cycles.device = 'GPU'; print("GPU:", tipo); break
        except Exception: pass
except Exception as e: print("AVISO gpu:", e)
cena.render.resolution_x = LADO; cena.render.resolution_y = LADO; cena.render.resolution_percentage = 100
cena.render.image_settings.file_format = 'PNG'
cena.render.filepath = SAIDA
try: cena.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
bpy.ops.render.render(write_still=True)
print("PRONTO", SAIDA, "vertices", len(corpo.data.vertices))

import json

with open(r"C:\Users\weijwang\source\VSCode\OneWeek\OnBelAI\data\joints.json") as json_file:
    all_joints = json.load(json_file)

total_frames = len(all_joints)
reduced_frames = {}

for i in range(0, 511):
    if i % 5 == 0:
        saved_frame = "frame" + str(i)
        reduced_frames.update({saved_frame:all_joints[saved_frame]})
    else:
        continue

with open(r".\data\joints_5fps.json", 'w') as outfile:
    outfile.write(json.dumps(reduced_frames, indent=2, sort_keys=True)) 


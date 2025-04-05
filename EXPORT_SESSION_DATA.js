// Usage: "On published started" action within a publish profile
//
// This script is copying session.json from workspace to export dir.
//


let exportPath = input["export"]["path"]
let sessionPath = input["session"]["dir"] + "/" + input["session"]["name"]
let filename = "session.json"


ov.copy(sessionPath, exportPath, [filename]);

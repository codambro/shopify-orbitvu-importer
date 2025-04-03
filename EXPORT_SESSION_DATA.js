// Usage: "On published start" action
//
// This script is copying session.json from workspace to export dir.
//

let sessionPath = Orbitvu.getSessionPath();
let exportPath = Orbitvu.getExportFolder();
let filename = "session.json"
let sourceFile = sessionPath + "/" + filename;
let destinationFile = exportPath + "/" + filename;

Orbitvu.copyFile(sourceFile, destinationFile);

/*
let session = input["session"]
let sessionDir = session["dir"]
let sessionName = session["name"]
let outFile = input["item"]["filePath"]
let idx = input["item"]["idx"]

const exportt = input["export"]
const expSuffix = exportt["fileSuffix"]
let outFileSuffix = "." + expSuffix

const rawName = "session.json"

let rawFileLocation = sessionDir + "/" + sessionName
let sessionFilename = rawFileLocation + "/" + rawName


rawExt = ".cr2"

let finalOutputFile = outFile + rawExt
finalOutputFile = finalOutputFile.replace(outFileSuffix,"")

let finalMainImage = finalOutputFile
let lastSlashIndex = finalMainImage.lastIndexOf('/');
let finalLocation = finalMainImage.substring(0,lastSlashIndex)


let renamedMainRawLocation = finalLocation + "/" + rawName
let outRAW = outFile.replace(outFileSuffix, rawExt)


if (ov.isFile(outRAW)===false){
  ov.copy(rawFileLocation,finalLocation,[rawName])
  ov.move(renamedMainRawLocation,outRAW)
}
*/
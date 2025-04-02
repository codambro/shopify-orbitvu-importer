// Usage: "On image publish" action
//
// This script is copying session.json from workspace to export dir.
//

let session = input["session"]
let sessionDir = session["dir"]
let sessionName = session["name"]
let outFile = input["item"]["filePath"]
let idx = input["item"]["idx"]

const exportt = input["export"]
const expSuffix = exportt["fileSuffix"]
let outFileSuffix = "." + expSuffix
console.log(outFileSuffix)


let sessionFilename = sessionDir + "/" + sessionName + "/session.json"


if (ov.isFile(rawPathMainCr2)===true){
  console.log("CR2 raw")
  rawExt = ".cr2"

}

let rawName = assetID + "_raw" + rawExt
let finalOutputFile = outFile + rawExt
finalOutputFile = finalOutputFile.replace(outFileSuffix,"")

let finalMainImage = finalOutputFile
let lastSlashIndex = finalMainImage.lastIndexOf('/');
let finalLocation = finalMainImage.substring(0,lastSlashIndex)


let renamedMainRawLocation = finalLocation + "/" + rawName
//console.log("CURRRENT finaloutput image   "  + finalOutputFile)
let outRAW = outFile.replace(outFileSuffix, rawExt)

//main photo
if (ov.isFile(outRAW)===false){
  ov.copy(rawFileLocation,finalLocation,[rawName])
  ov.move(renamedMainRawLocation,outRAW)
}
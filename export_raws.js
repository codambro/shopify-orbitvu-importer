// Usage: "On image publish" action
//
// This script is copying RAW files (*.cr2, *.cr3) from workspace to export dir.
//
// Example: exp_raws.js

let session = input["session"]
let sessionDir = session["dir"]
let sessionName = session["name"]
let assetID = input["item"]["idAsset"]
let outFile = input["item"]["filePath"]
let idx = input["item"]["idx"]

const exportt = input["export"]
const expSuffix = exportt["fileSuffix"]
let outFileSuffix = "." + expSuffix
console.log(outFileSuffix)


let rawFileLocation = sessionDir + "/" + sessionName
let rawPathMainCr3 = rawFileLocation + "/" + assetID + "_raw.cr3"
let rawPathMainCr2 = rawFileLocation + "/" + assetID + "_raw.cr2"
let rawExt;

if (ov.isFile(rawPathMainCr2)===true){
  console.log("CR2 raw")
  rawExt = ".cr2"

}

else if (ov.isFile(rawPathMainCr3)===true){
  console.log("CR3raw")
  rawExt = ".cr3"
}

let rawName = assetID + "_raw" + rawExt
let rawMaskName =  assetID + "_mask_raw" + rawExt
let rawShadowName = assetID + "_shadow_raw" + rawExt

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



//mask photo
let maskImagePath = rawFileLocation + "/" + rawMaskName
let outRAWmask = outFile.replace(outFileSuffix, "_mask" + rawExt)
let renamedMaskFileLocation = finalLocation + "/" + rawMaskName

if (ov.isFile(outRAWmask)===false){
  ov.copy(rawFileLocation,finalLocation,[rawMaskName])
  ov.move(renamedMaskFileLocation,outRAWmask)
}


//shadow photo
let shadowImagePath = rawFileLocation + "/" + rawShadowName
let outRAWshadow = outFile.replace(outFileSuffix, "_shadow" + rawExt)
let renamedShadowFileLocation = finalLocation + "/" + rawShadowName
if (ov.isFile(outRAWshadow)===false){
  ov.copy(rawFileLocation,finalLocation,[rawShadowName])
  ov.move(renamedShadowFileLocation,outRAWshadow)
}
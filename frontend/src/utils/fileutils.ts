export function appendToFilename(filename:string, suffix:string){
  var dotIndex = filename.lastIndexOf(".");
  if (dotIndex == -1) return filename + suffix;
  else return filename.substring(0, dotIndex) + suffix + filename.substring(dotIndex);
} 
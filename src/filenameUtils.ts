export function splitFilename(filename: string): { name: string; ext: string } {
  let ext = filename.split(".").pop();
  if (ext == filename || ext === undefined) {
    ext = "";
  }
  const name = filename.slice(0, filename.length - ext.length - 1);
  return { name, ext };
}

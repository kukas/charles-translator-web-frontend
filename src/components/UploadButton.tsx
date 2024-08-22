import { ChangeEvent } from "react";
import { Button } from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import {
  MAX_CONTENT_LENGTH,
  MAX_CONTENT_LENGTH_MiB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMETYPE,
} from "../translation/adapters/LindatApiV2Model";
import { splitFilename } from "../filenameUtils";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadButton = ({ onFileSelect }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error("No file selected");
      return;
    }
    if (event.target.files.length > 1) {
      toast.error("Only one file is allowed");
      return;
    }
    let file: File = event.target.files[0];
    // check file size
    if (file.size > MAX_CONTENT_LENGTH) {
      toast.error(`Error: File size exceeds ${MAX_CONTENT_LENGTH_MiB} MiB.`);
      return;
    }
    const { name, ext } = splitFilename(file.name);
    // check allowed file extensions
    const exts = ALLOWED_EXTENSIONS.join(", ");
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(
        `Error: Invalid file extension ${ext}. Allowed extensions are: ${exts}`,
        { autoClose: 10000 },
      );
      return;
    }

    // check allowed file types
    if (!ALLOWED_MIMETYPE.includes(file.type)) {
      toast.error(`Error: Invalid file type ${file.type}`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div>
      <Button
        variant="text"
        size="small"
        startIcon={<UploadFile />}
        component="label"
      >
        Select&nbsp;file
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      <ToastContainer />
    </div>
  );
};

export default UploadButton;

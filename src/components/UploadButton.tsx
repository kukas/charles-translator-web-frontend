import { ChangeEvent } from 'react';
import { Button } from '@mui/material';
import { UploadFile } from '@mui/icons-material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TODO: Review allowed file types and extensions
const allowedFileTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'application/wps-office.docx'];
const allowedFileExtensions = ['.txt', '.pdf', '.pptx', '.xlsx', '.docx'];
const maxFileSizeMB = 5;
const UploadButton = ({ onFileSelect }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error('No file selected');
      return;
    }
    if (event.target.files.length > 1) {
      toast.error('Only one file is allowed');
      return;
    }
    let file: File = event.target.files[0];
    // check file size
    if (file.size > maxFileSizeMB*1024*1024) {
      toast.error(`File size exceeds ${maxFileSizeMB}MB`);
      return;
    }
    // check allowed file types
    if (!allowedFileTypes.includes(file.type)) {
      toast.error('Invalid file type');
      return;
    }
    
    onFileSelect(file);
  };

  return (
    <div>
      <Button variant="text" size="small" startIcon={<UploadFile />} component="label">
        Select&nbsp;file
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      <ToastContainer />
    </div>
  );
};

export default UploadButton;

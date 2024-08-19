import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { Check, Error, Description } from '@mui/icons-material';

export interface UploadFileStatusProps {
  readonly file: File;
  readonly isUploading: boolean;
  readonly uploadError: string | null;
  readonly uploadProgress: number;
  readonly onUploadClick: () => void;
  readonly onRemoveClick: () => void;
}

export function UploadFileStatus(props: UploadFileStatusProps, ) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '4px', minHeight: '171px' }}>
      <Typography variant="body1" sx={{ mr: 1 }}>
        {props.file.name}
      </Typography>
      <Typography variant="body2">File Size: {(props.file.size / 1024).toFixed(2)} KB</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>File Type: {props.file.type}</Typography>
      <Box display="flex">
        <Button variant="outlined" onClick={props.onRemoveClick} sx={{ mr: 1 }}>Remove File</Button>
        <Button variant="contained" onClick={props.onUploadClick}>Upload File</Button>
      </Box>
    </Box>
  );
}
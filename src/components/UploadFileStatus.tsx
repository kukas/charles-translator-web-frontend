import { Box, Typography, Button } from "@mui/material";

export interface UploadFileStatusProps {
  readonly file: File;
  readonly uploadDisabled: boolean;
  readonly className?: string;
  readonly onUploadClick: () => void;
  readonly onRemoveClick: () => void;
}

export function UploadFileStatus(props: UploadFileStatusProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={props.className}
    >
      <Typography variant="body1" sx={{ mr: 1 }}>
        {props.file.name}
      </Typography>
      <Typography variant="body2">
        File Size: {(props.file.size / 1024).toFixed(2)} KB
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        File Type: {props.file.type}
      </Typography>
      <Box display="flex">
        <Button variant="outlined" onClick={props.onRemoveClick} sx={{ mr: 1 }}>
          Remove File
        </Button>
        <Button
          variant="contained"
          disabled={props.uploadDisabled}
          onClick={props.onUploadClick}
        >
          Upload File
        </Button>
      </Box>
    </Box>
  );
}

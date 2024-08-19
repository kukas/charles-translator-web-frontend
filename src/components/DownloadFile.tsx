import { Box, Typography, Button } from '@mui/material';

export interface DownloadFileProps {
  readonly file: File;
  readonly onDownloadClick: () => void;
}

export function DownloadFile(props: DownloadFileProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="body1" sx={{ mr: 1 }}>
        {props.file.name}
      </Typography>
      <Typography variant="body2">File Size: {(props.file.size / 1024).toFixed(2)} KB</Typography>
      <Box display="flex" sx={{ mt: 5 }}>
        <Button variant="contained" onClick={props.onDownloadClick}>Download File</Button>
      </Box>
    </Box>
  );
}
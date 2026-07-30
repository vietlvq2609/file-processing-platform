import { FileDropZone } from '../../../components/ui';
import { useUploadFile } from '../hooks/useUploadFile';

export default function FileUploadZone() {
  const { mutate: upload, isPending } = useUploadFile();
  return (
    <FileDropZone
      onFiles={(files) => files.forEach((f) => upload(f))}
      isPending={isPending}
      multiple
    />
  );
}

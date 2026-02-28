export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const statusColors = {
  open: "error",
  pending: "warning",
  resolved: "success",
  closed: "default",
};

export const priorityColors = {
  low: "default",
  medium: "warning",
  high: "error",
  urgent: "error",
};

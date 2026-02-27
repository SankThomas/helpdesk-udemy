import { useQuery } from "convex/react";
import { Eye, FileText, Paperclip, Trash2, User } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card, CardHeader, CardContent } from "./Card";
import { formatFileSize } from "../../lib/utils";

export const AttachmentSection = ({ onDelete, ticketId, ticketAssignedTo }) => {
  const { currentUser, isAdmin } = useCurrentUser();

  const attachments = useQuery(api.attachments.getAttachmentByTicket, {
    ticketId,
  });

  const canDeleteAttachment = (attachment) => {
    if (!currentUser) return false;
    if (attachment.uploadedBy === currentUser._id) return true;
    if (currentUser.role === "agent" && ticketAssignedTo === currentUser.id)
      return true;
    if (isAdmin) return true;

    return false;
  };

  const getFileIcon = (attachment) => {
    const { fileName, fileUrl } = attachment;
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="size-12 rounded border border-gray-200 object-cover"
        />
      );
    }

    if (["pdf", "doc", "docx", "txt"].includes(extension)) {
      return <FileText className="size-6 text-rose-600" />;
    }

    return <File className="size-6 text-gray-600" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900">Attachments</h2>

              {attachments && (
                <Badge variant="secondary" size="sm">
                  {attachments.length}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2!">
          <div className="space-y-4">
            {!attachments ? (
              <div className="flex justify-center py-4">
                <div className="border-primary-600 size-6 animate-spin rounded-full border-b-2"></div>
              </div>
            ) : attachments.length === 0 ? (
              <div className="py-8 text-center">
                <Paperclip className="mx-auto mb-3 size-13 text-gray-400" />
                <p className="text-gray-500">No attachments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      {getFileIcon(attachment)}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {attachment.fileName}
                        </p>
                        <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(attachment.fileSize)}</span>
                          <div className="flex items-center space-x-1">
                            <User className="size-4" />
                            <span>{attachment.user?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(attachment.fileUrl, "_blank")
                        }
                      >
                        <Eye className="size-4" />
                      </Button>

                      {canDeleteAttachment(attachment) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(attachment)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

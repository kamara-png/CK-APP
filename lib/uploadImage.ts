import { File } from "expo-file-system";

/**
 * Uploads a locally-picked image (by its file:// URI) to Convex storage and
 * returns the resulting storage id. `generateUploadUrl` should be the
 * `api.todos.generateUploadUrl` mutation, called by the caller so this
 * helper doesn't need its own Convex client wiring.
 */
export async function uploadImageToConvex(
  localUri: string,
  generateUploadUrl: () => Promise<string>
): Promise<string> {
  const uploadUrl = await generateUploadUrl();
  const file = new File(localUri);
  const bytes = await file.bytes();

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type ?? "image/jpeg" },
    body: bytes,
  });

  if (!response.ok) {
    throw new Error("Image upload failed. Please try again.");
  }

  const { storageId } = (await response.json()) as { storageId: string };
  return storageId;
}

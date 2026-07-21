const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "kattegat_mobile";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

type CloudinaryErrorResponse = {
  error?: { message?: string };
};

const DELIVERY_TRANSFORM = "q_auto,f_auto";

function cloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

function withDeliveryTransform(secureUrl: string): string {
  const uploadSegment = "/image/upload/";
  const uploadIndex = secureUrl.indexOf(uploadSegment);
  if (uploadIndex === -1 || secureUrl.includes(`/${DELIVERY_TRANSFORM}/`)) return secureUrl;

  const insertAt = uploadIndex + uploadSegment.length;
  return `${secureUrl.slice(0, insertAt)}${DELIVERY_TRANSFORM}/${secureUrl.slice(insertAt)}`;
}

function parseCloudinaryErrorMessage(responseText: string): string {
  try {
    const json = JSON.parse(responseText) as CloudinaryErrorResponse;
    return json.error?.message ?? "Image upload failed. Please try again.";
  } catch {
    return "Image upload failed. Please try again.";
  }
}

function parseCloudinarySuccess(responseText: string): CloudinaryUploadResult {
  const json = JSON.parse(responseText) as CloudinaryUploadResponse;
  if (!json.secure_url || !json.public_id) {
    throw new Error("Image upload failed. Please try again.");
  }
  return {
    secureUrl: withDeliveryTransform(json.secure_url),
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Unsigned preset upload — same pattern as the mobile app. */
export async function uploadImage(file: File, folder: string): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) {
    throw new Error("Photo uploads are not configured on web yet. Contact support.");
  }
  if (!UPLOAD_PRESET) {
    throw new Error("Photo upload preset is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(cloudinaryUploadUrl(), {
    method: "POST",
    body: formData,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(parseCloudinaryErrorMessage(responseText));
  }

  return parseCloudinarySuccess(responseText);
}

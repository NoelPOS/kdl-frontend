import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");
  const fileType = searchParams.get("fileType");
  const folder = searchParams.get("folder");
  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "Missing fileName or fileType" },
      { status: 400 }
    );
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 minute expiry

  return NextResponse.json({ url });
}

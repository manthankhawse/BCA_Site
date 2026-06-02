import { S3Client, PutBucketCorsCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
});

const run = async () => {
  try {
    const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
    
    try {
      console.log(`Creating bucket: ${bucketName}...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log("Bucket created.");
    } catch (e) {
      console.log("Bucket might already exist or error:", e.message);
    }

    console.log(`Setting CORS for bucket: ${bucketName}`);
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: [
              "http://localhost:3000",
              "https://bca-site.vercel.app", 
              "*"
            ],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    };

    const data = await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log("Success! CORS rules updated:", data);
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
};

run();

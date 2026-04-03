# Step 10 — S3 File Upload

## Goal

Implement the complete file upload flow: backend generates presigned S3 URLs, frontend uploads
directly to S3, and the resulting URL is stored in the database.

## Architecture

```
┌──────────┐  1. Request presigned URL   ┌──────────┐
│  Browser  │ ─────────────────────────►  │  Backend  │
│  (app)    │  ◄── presigned URL ───────  │  (Elysia) │
│           │                             └──────────┘
│           │  2. PUT file directly
│           │ ─────────────────────────►  ┌──────────┐
│           │  ◄── 200 OK ─────────────  │  AWS S3   │
│           │                             └──────────┘
│           │  3. Save S3 URL to API
│           │ ─────────────────────────►  ┌──────────┐
│           │                             │  Backend  │
└──────────┘                             └──────────┘
```

## Steps

### 10.1 — AWS S3 bucket setup

Create an S3 bucket with:
- Bucket name: `devport-uploads` (or your preference)
- Region: your preferred region
- Public access: Block all public access OFF (or use CloudFront)
- CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://app.iscoded.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Bucket policy for public reads:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::devport-uploads/*"
    }
  ]
}
```

### 10.2 — Backend upload routes (already scaffolded in Step 5)

**apps/backend/src/routes/upload.ts:**

```ts
POST /api/upload/presigned-url
  Body: { filename: string, contentType: string }
  Auth: required
  Response: { url: string, key: string, publicUrl: string }

  Logic:
  - Generate key: `uploads/<userId>/<timestamp>-<filename>`
  - Create presigned PUT URL (expires in 1 hour)
  - Return the presigned URL + the final public URL

DELETE /api/upload
  Body: { key: string }
  Auth: required
  Response: 204

  Logic:
  - Verify the key starts with `uploads/<userId>/` (prevent deleting others' files)
  - Delete from S3
```

### 10.3 — Frontend file upload component

**packages/ui/src/components/file-upload.tsx:**

Props:
```ts
interface FileUploadProps {
  accept?: string;           // e.g., "image/*"
  maxSizeMB?: number;        // default 5
  currentUrl?: string;       // show current file
  onUpload: (url: string) => void;
  onRemove?: () => void;
  apiBaseUrl: string;        // backend URL for presigned URL request
}
```

Behavior:
1. User selects file or drags and drops
2. Client-side validation: file type, max size
3. Show file name and preview (for images)
4. Call `POST /api/upload/presigned-url` with filename and content type
5. Upload file to S3 via `PUT` to the presigned URL with `Content-Type` header
6. On success, call `onUpload(publicUrl)`
7. Show progress bar during upload
8. Show "Remove" button if `currentUrl` is set

### 10.4 — S3 URL format

Files stored as:
```
s3://devport-uploads/uploads/<userId>/<timestamp>-<filename>
```

Public URL:
```
https://devport-uploads.s3.<region>.amazonaws.com/uploads/<userId>/<timestamp>-<filename>
```

### 10.5 — Where file upload is used

| Page | Field | Accept |
|------|-------|--------|
| Onboarding Step 2 | Profile Photo | image/* |
| Onboarding Step 3 | Project Screenshot | image/* |
| Profile | Profile Photo | image/* |
| Profile | Resume | application/pdf |
| Projects | Project Image | image/* |
| Certificates | Certificate Image | image/* |
| Events | Event Image | image/* |
| SEO | OG Image | image/* |

### 10.6 — Environment variables

```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="devport-uploads"
AWS_REGION="us-east-1"
```

## Key Notes

- Presigned URLs are generated server-side so AWS credentials never touch the browser.
- Each user's files are namespaced under their userId, preventing conflicts.
- When a user deletes their account, a cascade should clean up S3 files (or run a background job).
- Image optimization/resizing could be added later via a Lambda or at-upload-time processing.
- For development without AWS, consider using MinIO as a local S3-compatible server in Docker.

## Optional: MinIO for local dev

Add to `docker/docker-compose.yml`:
```yaml
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data

volumes:
  pgdata:
  minio-data:
```

Then use `AWS_ENDPOINT=http://localhost:9000` in the S3 client configuration.

## Verification

- Upload an image via the file upload component
- File appears in S3 (or MinIO)
- The returned URL is accessible in the browser
- Deleting from the UI removes the file from S3
- Presigned URL expires after 1 hour (cannot reuse)

## Next Step

Proceed to [Step 11 — Portfolio App Setup](./11-portfolio-app.md).

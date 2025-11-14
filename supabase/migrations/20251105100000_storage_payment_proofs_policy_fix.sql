-- Adjust policies to make sure authenticated users can upload payment proofs without storage errors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow payment proof uploads'
  ) THEN
    DROP POLICY "Allow payment proof uploads" ON storage.objects;
  END IF;
END
$$;

CREATE POLICY "Allow payment proof uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow payment proof updates'
  ) THEN
    DROP POLICY "Allow payment proof updates" ON storage.objects;
  END IF;
END
$$;

CREATE POLICY "Allow payment proof updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND owner = auth.uid()
);

-- Grant authenticated users access to manage their own payment proof files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow payment proof uploads'
  ) THEN
    CREATE POLICY "Allow payment proof uploads"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'payment-proofs'
      AND COALESCE(owner, auth.uid()) = auth.uid()
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow payment proof updates'
  ) THEN
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
  END IF;
END
$$;

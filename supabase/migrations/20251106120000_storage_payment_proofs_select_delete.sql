-- Ensure authenticated users can view and optionally delete payment proof uploads

-- Drop existing SELECT and DELETE policies to avoid duplicates when re-running migrations
DROP POLICY IF EXISTS "Allow payment proof downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow payment proof deletions" ON storage.objects;

-- Allow authenticated users to list and read objects in the payment-proofs bucket
CREATE POLICY "Allow payment proof downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
);

-- Allow authenticated users to delete only their own payment proof files
CREATE POLICY "Allow payment proof deletions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND owner = auth.uid()
);

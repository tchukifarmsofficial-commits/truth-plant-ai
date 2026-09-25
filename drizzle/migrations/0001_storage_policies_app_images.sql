CREATE POLICY "App can read app images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id IN ('marketplace-images','diagnosis-images'));

CREATE POLICY "App can upload app images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id IN ('marketplace-images','diagnosis-images'));

CREATE POLICY "App can update app images"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id IN ('marketplace-images','diagnosis-images'))
WITH CHECK (bucket_id IN ('marketplace-images','diagnosis-images'));

CREATE POLICY "App can delete app images"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id IN ('marketplace-images','diagnosis-images'));